import { PythonShell } from 'python-shell';
import path from 'path';
import { BudgetAlgorithmInput, PurchaseEntry, YearlyStrategy } from '@/types/types';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const scriptPath = path.join(process.cwd(), 'src/python-scripts', 'algo_budget', 'main.py');

    const inputData = req.body as BudgetAlgorithmInput;

    const options = {
      mode: 'text',
      pythonPath: path.join(process.cwd(), 'venv/bin/python'),
      args: [JSON.stringify(inputData)],
    };

    const data = await PythonShell.run(scriptPath, options);
    console.log("not parsed:", data);
    const parsedData = JSON.parse(data[0]);
    console.log("parsed:", data);
    const parsedResults: PurchaseEntry[] = parsedData.results;
    const yearlyStrategiesMap = new Map<number, YearlyStrategy>();
    let totalBudgetMedium: number = 0;
    parsedResults.forEach((entry) => {
      const { year, quantity, typology, region, price } = entry;

      let yearlyStrategy = yearlyStrategiesMap.get(year);
      if (!yearlyStrategy) {
        yearlyStrategy = {
          year,
          quantity_purchased: 0,
          cost_low: 0,
          cost_medium: 0,
          cost_high: 0,
          types_purchased: []
        };
        yearlyStrategiesMap.set(year, yearlyStrategy);
      }

      yearlyStrategy.quantity_purchased += quantity;
      yearlyStrategy.cost_medium += quantity * price;

      let typePurchased = yearlyStrategy.types_purchased.find(tp => tp.typology === typology);
      if (!typePurchased) {
        typePurchased = {
          typology,
          quantity: 0,
          regions: [],
          price_per_ton: 0
        };
        yearlyStrategy.types_purchased.push(typePurchased);
      }

      typePurchased.quantity += quantity;

      let regionPurchase = typePurchased.regions.find(rp => rp.region === region);
      if (!regionPurchase) {
        regionPurchase = {
          region,
          quantity: 0,
          region_factor: 1,
          cost: 0
        };
        typePurchased.regions.push(regionPurchase);
      }
      regionPurchase.quantity += quantity;
      regionPurchase.cost += quantity * price;
      totalBudgetMedium += quantity * price;
    });

    console.log("totalBudgetMedium", totalBudgetMedium)

    let totalBudgetLow  = totalBudgetMedium;
    let totalBudgetHigh = totalBudgetMedium;
    const sortedStrategies = Array.from(yearlyStrategiesMap.values()).sort((a, b) => a.year - b.year);

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
