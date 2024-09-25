'use server';

import { computeBudgetAdvice } from '@/algorithms/advice/budgetEstimationAdvice';
import { runStratAlgorithm } from '@/algorithms/algoStrat';
import {
  BudgetAlgorithmInput,
  BudgetOutputData,
  StratAlgorithmInput,
  StratOutputData,
} from '@/types/types';

export async function runStratAlgo(input: StratAlgorithmInput): Promise<StratOutputData> {
  let algoRes: StratOutputData = runStratAlgorithm(input);

  if (!algoRes) {
    throw new Error('An error occurred while running the algorithm.');
  }

  let computedAdvice = computeBudgetAdvice(input, algoRes as BudgetOutputData);
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
