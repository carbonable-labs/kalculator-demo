import { PythonShell } from 'python-shell';
import path from 'path';
import { BudgetAlgorithmInput } from '@/types/types';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const scriptPath = path.join(process.cwd(), 'src/python-scripts', 'algo_budget.py');
    
    const inputData = req.body as BudgetAlgorithmInput;

    const options = {
      mode: 'text',
      pythonPath: path.join(process.cwd(), 'venv/bin/python'), 
      args: [JSON.stringify(inputData)],
    };

    const results = await PythonShell.run(scriptPath, options);

    const parsedResults = JSON.parse(results[0]);

    res.status(200).json(parsedResults);
  } catch (err) {
    console.error('Error executing Python script:', err);
    res.status(500).json({ error: 'Failed to execute Python script' });
  }
}
