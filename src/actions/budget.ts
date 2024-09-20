'use server';

import { Advice, computeBudgetAdvice } from '@/algorithms/advice/budgetEstimationAdvice';
import { runBudgetAlgorithm } from '@/algorithms/algoBudget';
import { BudgetAlgorithmInput, BudgetOutputData } from '@/types/types';

export async function runBudgetAlgo(input: BudgetAlgorithmInput): Promise<BudgetOutputData> {
  let algoRes: BudgetOutputData = runBudgetAlgorithm(input);

  if (!algoRes) {
    throw new Error('An error occurred while running the algorithm.');
  }

  let computedAdvice = computeBudgetAdvice(input, algoRes);
  console.log(computedAdvice);

  let formattedTips = computedAdvice.map(formatTip);

  console.log(formattedTips);
  algoRes = {
    ...algoRes,
    advice_timeline: formattedTips[0],
    advice_financing: formattedTips[1],
    advice_typo: formattedTips[2],
    advice_geography: formattedTips[3],
  };

  return algoRes;
}

function formatTip(someAdvice: Advice): string {
  let result: string = '';
  if (someAdvice.change) {
    let someTip = someAdvice.tip;
    let phrase = someTip ? someTip.advicePhrase : '';
    let option = someTip ? someTip.smartTip : '';
    let delta = someTip ? someTip.budgetDelta : '';
    result = `${phrase} ${option} and save $${delta}`;
  }
  return result;
}
