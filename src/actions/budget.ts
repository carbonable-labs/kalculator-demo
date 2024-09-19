'use server';

import { adviceBudgetTimeline } from '@/algorithms/advice/budgetEstimationAdvice';
import { runBudgetAlgorithm } from '@/algorithms/algoBudget';
import { BudgetAlgorithmInput, BudgetOutputData } from '@/types/types';

export async function runBudgetAlgo(input: BudgetAlgorithmInput): Promise<BudgetOutputData> {
  let algoRes: BudgetOutputData = runBudgetAlgorithm(input);

  if (!algoRes) {
    throw new Error('An error occurred while running the algorithm.');
  }

  let timelineTip = adviceBudgetTimeline(input, algoRes);
  console.log(timelineTip);
  algoRes = { ...algoRes, advice_timeline: timelineTip.advice };

  return algoRes;
}
