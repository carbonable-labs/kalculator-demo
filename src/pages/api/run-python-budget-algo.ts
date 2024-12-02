import { PythonShell } from 'python-shell';
import path from 'path';
import {
  BudgetAlgorithmInput,
  PurchaseEntry,
  YearlyStrategy,
  TypologyFinancingBreakdown,
  FinancingPurchaseDetails,
  RegionPurchase,
} from '@/types/types';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const scriptPath = path.join(process.cwd(), 'src/python-scripts', 'algo_budget', 'main.py');

    const inputData = req.body as BudgetAlgorithmInput;
    console.log('input data:', inputData);

    const options = {
      mode: 'text',
      pythonPath: path.join(process.cwd(), 'venv/bin/python'),
      args: [JSON.stringify(inputData)],
    };

    const data = await PythonShell.run(scriptPath, options);
    const parsedData = JSON.parse(data[0]);
    const parsedResults: PurchaseEntry[] = parsedData.results;

    const yearlyStrategiesMap = new Map<number, YearlyStrategy>();
    let totalBudgetLow: number = 0;
    let totalBudgetMedium: number = 0;
    let totalBudgetHigh: number = 0;

    parsedResults.forEach((entry) => {
      const { year, quantity, typology, region, price, type } = entry;

      // Find or create the YearlyStrategy for the year
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

      // For simplicity, assuming cost_low = 0.9 * price, cost_high = 1.1 * price
      const cost = quantity * price;
      const costLow = quantity * price * 0.9;
      const costHigh = quantity * price * 1.1;

      yearlyStrategy.cost_medium += cost;
      yearlyStrategy.cost_low += costLow;
      yearlyStrategy.cost_high += costHigh;

      totalBudgetMedium += cost;
      totalBudgetLow += costLow;
      totalBudgetHigh += costHigh;

      // Find or create the TypologyFinancingBreakdown for the typology
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

      // Select the correct FinancingPurchaseDetails based on the type
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

      // Update average price per ton
      financingDetails.price_per_ton = financingDetails.cost / financingDetails.quantity;

      // Find or create the RegionPurchase
      let regionPurchase = financingDetails.regions.find((rp) => rp.region === region);
      if (!regionPurchase) {
        regionPurchase = {
          region,
          quantity: 0,
          regionFactor: 1, // Assuming regionFactor is 1; adjust if needed
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
