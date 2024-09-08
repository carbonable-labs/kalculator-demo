import type { NextApiRequest, NextApiResponse } from 'next';
import { runBudgetAlgorithm } from '@/algorithms/algoBudget';
<<<<<<< HEAD
import { runStratAlgorithm } from '@/algorithms/algoStrat';
=======
import { configMap } from '@/constants/configs';
import { ConfigType } from '../input-form-typo';
import { runTypoAlgorithm } from '@/algorithms/algoType';
import { AlgorithmInput, ProjectConfig, RegionAllocation, TimeConstraint } from '@/types';
>>>>>>> main

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
        throw new Error('An error occurred while running the algorithm.');
      }

      const totalBudget = algoRes;

      // Respond with the result
<<<<<<< HEAD
      res.status(200).json({
        budget: { totalBudget, adjustedBudget },
        strat: { nbsRemoval, nbsAvoidance, biochar, dac, stratAdjustedBudget, carbonToOffset }
      });
=======
      res.status(200).json(totalBudget);
>>>>>>> main
    } catch (error) {
      console.error('Error running algorithm:', error);
      res.status(500).json({ error: 'An error occurred while running the algorithm.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
