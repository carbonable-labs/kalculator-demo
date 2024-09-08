import type { NextApiRequest, NextApiResponse } from 'next';
import { runBudgetAlgorithm } from '@/algorithms/algoBudget';
import { configMap } from '@/constants/configs';
import { ConfigType } from '../input-form-typo';
import { runTypoAlgorithm } from '@/algorithms/algoType';
import { AlgorithmInput, ProjectConfig, RegionAllocation, TimeConstraint } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const input = req.body as AlgorithmInput;
      let algoRes;
      let projectConfig: ProjectConfig[] = [];

      if ('budget' in input && 'configType' in input) {
        // It's a TypoAlgorithmInput
        projectConfig = configMap[input.configType as ConfigType];
        algoRes = runTypoAlgorithm({
          regionAllocation: input.regionAllocation,
          projectConfig,
          budget: input.budget,
          financing: input.financing,
          timeConstraints: input.timeConstraints,
        });
      } else if ('typology' in input) {
        // It's a BudgetAlgorithmInput
        algoRes = runBudgetAlgorithm({
          regionAllocation: input.regionAllocation,
          typology: input.typology,
          financing: input.financing,
          timeConstraints: input.timeConstraints,
        });
      } else {
        throw new Error('Invalid input type');
      }

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
