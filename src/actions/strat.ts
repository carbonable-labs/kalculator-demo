// 'use server';

// import { computeBudgetAdvice } from '@/algorithms/advice/budgetEstimationAdvice';
// import { runStratAlgorithm } from '@/algorithms/algoStrat';
// import {
//   BudgetAlgorithmInput,
//   BudgetOutputData,
//   StratAlgorithmInput,
//   StratOutputData,
// } from '@/types/types';

// export async function runStratAlgo(input: StratAlgorithmInput): Promise<StratOutputData> {
//   let algoRes: StratOutputData = runStratAlgorithm(input);

//   if (!algoRes) {
//     throw new Error('An error occurred while running the algorithm.');
//   }

//   let computedAdvice = computeBudgetAdvice(input, algoRes as BudgetOutputData);
//   // console.log(computedAdvice);

//   algoRes = {
//     ...algoRes,
//     advice_timeline: computedAdvice[0],
//     advice_financing: computedAdvice[1],
//     advice_typo: computedAdvice[2],
//     advice_geography: computedAdvice[3],
//   };

//   return algoRes;
// }

// TODO: Implement the algorithm
'use server';

import { StratAlgorithmInput, StratOutputData } from '@/types/types';

export async function runStratAlgo(input: StratAlgorithmInput): Promise<any> {
  let algoRes: any = {
    otherTypologiesPossible: [],
    user_budget: 0,
    money_saving: 0,
    money_to_add: 0,
    budget_not_compatible: '',
  };

  if (!algoRes) {
    throw new Error('An error occurred while running the algorithm.');
  }

  let computedAdvice = [
    {
      advice: '',
      advice_type: '',
      advice_reason: '',
    },
    {
      advice: '',
      advice_type: '',
      advice_reason: '',
    },
    {
      advice: '',
      advice_type: '',
      advice_reason: '',
    },
    {
      advice: '',
      advice_type: '',
      advice_reason: '',
    },
  ];
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
