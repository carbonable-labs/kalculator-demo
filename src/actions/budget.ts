'use server';

import { computeBudgetAdvice } from '@/algorithms/advice/budgetEstimationAdvice';
import { runBudgetAlgorithm } from '@/algorithms/algoBudget';
import { BudgetAlgorithmInput, BudgetOutputData } from '@/types/types';

export async function runBudgetAlgo(input: BudgetAlgorithmInput): Promise<BudgetOutputData> {
  let algoRes: BudgetOutputData = runBudgetAlgorithm(input);

  if (!algoRes) {
    throw new Error('An error occurred while running the algorithm.');
  }

  let computedAdvice = computeBudgetAdvice(input, algoRes);
  // console.log(computedAdvice);

  algoRes = {
    ...algoRes,
    advice_timeline: computedAdvice[0],
    advice_financing: computedAdvice[1],
    advice_typo: computedAdvice[2],
    advice_geography: computedAdvice[3],
  };

  return algoRes;
}
