'use server';

import { runBudgetAlgorithm } from '@/algorithms/algoBudget';
import { BudgetAlgorithmInput, BudgetOutputData } from '@/types/types';

export async function runBudgetAlgo(input: BudgetAlgorithmInput): Promise<BudgetOutputData> {
  const algoRes: BudgetOutputData = runBudgetAlgorithm(input);

  if (!algoRes) {
    throw new Error('An error occurred while running the algorithm.');
  }

  return algoRes;
}
