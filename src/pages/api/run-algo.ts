import type { NextApiRequest, NextApiResponse } from 'next';
import { runBudgetAlgorithm } from '@/algorithms/algoBudget';
import { runStratAlgorithm } from '@/algorithms/algoStrat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const input = req.body;

      // Run the algorithm with the provided input
      console.log('\n\n\n\n');
      console.log('\x1b[36m%s\x1b[0m', '#############################');
      console.log('Running algorithm with input:', input);
      const algoRes = runBudgetAlgorithm({
        regionAllocation: input.regionAllocation,
        typology: input.typology,
        financing: input.financing,
        timeConstraints: input.timeConstraints,
      });
      if (!algoRes) {
        throw new Error('An error occurred while running the budget algorithm.');
      }

      const { totalBudget, adjustedBudget } = algoRes;

      const stratRes = runStratAlgorithm({
        timeConstraints: input.timeConstraints,
        budget: input.budget,
        regionAllocation: input.regionAllocation,
        typology: input.typology,
        financing: input.financing,
      });
      if (!stratRes) {
        throw new Error('An error occurred while running the strat algorithm.');
      }

      const { nbsRemoval, nbsAvoidance, biochar, dac, stratAdjustedBudget, carbonToOffset } = stratRes;

      // Respond with the result
      res.status(200).json({
        budget: { totalBudget, adjustedBudget },
        strat: { nbsRemoval, nbsAvoidance, biochar, dac, stratAdjustedBudget, carbonToOffset }
      });
    } catch (error) {
      console.error('Error running algorithm:', error);
      res.status(500).json({ error: 'An error occurred while running the algorithm.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
