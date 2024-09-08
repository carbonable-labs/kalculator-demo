import type { NextApiRequest, NextApiResponse } from 'next';
import { runBudgetAlgorithm } from '@/algorithms/algoBudget';
import { BudgetAlgorithmInput } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const input = req.body as BudgetAlgorithmInput;
      const algoRes = runBudgetAlgorithm(input);
      if (!algoRes) {
        throw new Error('An error occurred while running the algorithm.');
      }

      const totalBudget = algoRes;

      // Respond with the result
      res.status(200).json(totalBudget);
    } catch (error) {
      console.error('Error running algorithm:', error);
      res.status(500).json({ error: 'An error occurred while running the algorithm.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
