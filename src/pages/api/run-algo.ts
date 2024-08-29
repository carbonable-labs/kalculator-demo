import type { NextApiRequest, NextApiResponse } from 'next';
import { runAlgorithm } from '@/algorithms/algoBudget';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const input = req.body;

      // Run the algorithm with the provided input
      const algoRes = runAlgorithm({
        regionAllocation: input.regionAllocation,
        typology: input.typology,
        financing: input.financing,
        timeConstraints: input.timeConstraints,
      });
      if (!algoRes) {
        throw new Error('An error occurred while running the algorithm.');
      }

      const { totalBudget, adjustedBudget } = algoRes;

      // Respond with the result
      res.status(200).json({ totalBudget, adjustedBudget });
    } catch (error) {
      console.error('Error running algorithm:', error);
      res.status(500).json({ error: 'An error occurred while running the algorithm.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
