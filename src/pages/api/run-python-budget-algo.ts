import { PythonShell, Options } from 'python-shell';
import path from 'path';
import {
  BudgetAlgorithmInput,
  PurchaseEntry,
  YearlyStrategy,
  FinancingPurchaseDetails,
} from '@/types/types';
import { typologyCostFactors } from '@/constants/forecasts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const scriptPath = path.join(process.cwd(), 'src/python-scripts', 'algo_budget', 'main.py');

    const inputData = req.body as BudgetAlgorithmInput;
    console.log('input data:', inputData);

    const options: Options = {
      mode: 'text',
      pythonPath: path.join(process.cwd(), 'venv/bin/python'),
      args: [JSON.stringify(inputData)],
    };

    const data = await PythonShell.run(scriptPath, options);
    const parsedData = JSON.parse(data[0]);
    console.log("parsedData:", parsedData);
    const parsedResults: PurchaseEntry[] = parsedData.results;

    // Filter out purchases with quantities less than 10
    const filteredResults = parsedResults.filter((entry) => entry.quantity >= 10);

    const yearlyStrategiesMap = new Map<number, YearlyStrategy>();
    let totalBudgetLow: number = 0;
    let totalBudgetMedium: number = 0;
    let totalBudgetHigh: number = 0;

    filteredResults.forEach((entry) => {
      const { year, quantity, typology, region, price, type } = entry;

      let yearlyStrategy = yearlyStrategiesMap.get(year);
      if (!yearlyStrategy) {
        yearlyStrategy = {
          year,
          quantity_purchased: 0,
          cost_low: 0,
          cost_medium: 0,
          cost_high: 0,
          types_purchased: [],
        };
        yearlyStrategiesMap.set(year, yearlyStrategy);
      }

      yearlyStrategy.quantity_purchased += quantity;

      const cost = quantity * price;
      if (!(typology in typologyCostFactors)) {
        throw new Error(`Unknown typology: ${typology}`);
      }
      const factors = typologyCostFactors[typology];
      const costLow = cost * factors.low;
      const costHigh = cost * factors.high;

      yearlyStrategy.cost_medium += cost;
      yearlyStrategy.cost_low += costLow;
      yearlyStrategy.cost_high += costHigh;

      totalBudgetMedium += cost;
      totalBudgetLow += costLow;
      totalBudgetHigh += costHigh;

      let typologyBreakdown = yearlyStrategy.types_purchased.find((tp) => tp.typology === typology);
      if (!typologyBreakdown) {
        typologyBreakdown = {
          typology,
          exAnte: {
            quantity: 0,
            regions: [],
            price_per_ton: 0,
            cost: 0,
          },
          exPost: {
            quantity: 0,
            regions: [],
            price_per_ton: 0,
            cost: 0,
          },
        };
        yearlyStrategy.types_purchased.push(typologyBreakdown);
      }

      let financingDetails: FinancingPurchaseDetails;
      if (type === 'ex-ante') {
        financingDetails = typologyBreakdown.exAnte;
      } else if (type === 'ex-post') {
        financingDetails = typologyBreakdown.exPost;
      } else {
        throw new Error(`Unknown financing type: ${type}`);
      }

      financingDetails.quantity += quantity;
      financingDetails.cost += cost;

      financingDetails.price_per_ton = financingDetails.cost / financingDetails.quantity;

      let regionPurchase = financingDetails.regions.find((rp) => rp.region === region);
      if (!regionPurchase) {
        regionPurchase = {
          region,
          quantity: 0,
          cost: 0,
        };
        financingDetails.regions.push(regionPurchase);
      }

      regionPurchase.quantity += quantity;
      regionPurchase.cost += cost;
    });

    const sortedStrategies = Array.from(yearlyStrategiesMap.values()).sort(
      (a, b) => a.year - b.year,
    );

    res.status(200).json({
      totalBudgetLow,
      totalBudgetMedium,
      totalBudgetHigh,
      strategies: sortedStrategies,
    });
  } catch (err) {
    console.error('Error executing Python script:', err);
    res.status(500).json({ error: 'Failed to execute Python script' });
  }
}
