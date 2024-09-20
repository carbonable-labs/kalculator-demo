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
  let advice: string;
  if (!timelineTip.change) {
    advice = timelineTip.advice;
  } else {
    let phrase = timelineTip.tip ? timelineTip.tip.advicePhrase : '';
    let option = timelineTip.tip ? timelineTip.tip.smartTip : '';
    let delta = timelineTip.tip ? timelineTip.tip.budgetDelta : '';
    advice = `${phrase} ${option} and save $${delta}`;
  }
  algoRes = { ...algoRes, advice_timeline: advice };

  return algoRes;
}
