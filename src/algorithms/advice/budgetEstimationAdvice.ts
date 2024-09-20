import {
  RegionAllocation,
  Typology,
  Financing,
  TimeConstraint,
  TypologyCosts,
  RegionCosts,
  BudgetAlgorithmInput,
  BudgetOutputData,
} from '@/types/types';

import { runBudgetAlgorithm } from '@/algorithms/algoBudget';

export interface Advice {
  change: boolean;
  advice: string;
  tip?: TimelineBudgetAdvice;
}

export interface TimelineBudgetAdvice {
  advicePhrase: string;
  smartTip: string;
  budgetDelta: string;
}

export const adviceBudgetTimeline = (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Advice => {
  let fiveYearInput = { ...input, timeConstraints: TimeConstraint.FiveYear };
  let fiveYearOutput: BudgetOutputData = runBudgetAlgorithm(fiveYearInput);
  let flexibleInput = { ...input, timeConstraints: TimeConstraint.NoConstraint };
  let flexibleOutput: BudgetOutputData = runBudgetAlgorithm(flexibleInput);
  let deltaFiveYear = output.total_cost_medium - fiveYearOutput.total_cost_medium;
  let deltaFlexible = output.total_cost_medium - flexibleOutput.total_cost_medium;
  const minProfit = output.total_cost_medium * 0.005; // 0.5% profit margin

  console.log(deltaFiveYear, deltaFlexible, minProfit);

  if (input.timeConstraints === TimeConstraint.Yearly) {
    if (Math.max(deltaFiveYear, deltaFlexible) < minProfit) {
      return { change: false, advice: '' };
    } else if (deltaFiveYear > deltaFlexible) {
      return {
        change: true,
        advice: 'You should consider a more flexible timeframe.',
        tip: {
          advicePhrase: 'You should consider a more flexible timeframe.',
          smartTip: 'Go Five Year',
          budgetDelta: deltaFiveYear.toFixed(2),
        },
      };
    } else {
      return {
        change: true,
        advice: 'You should consider a more flexible timeframe.',
        tip: {
          advicePhrase: 'You should consider a more flexible timeframe.',
          smartTip: 'Go Flexible',
          budgetDelta: deltaFlexible.toFixed(2),
        },
      };
    }
  } else if (input.timeConstraints === TimeConstraint.FiveYear) {
    if (deltaFlexible > minProfit) {
      return {
        change: true,
        advice: 'You should consider a more flexible timeframe.',
        tip: {
          advicePhrase: 'You should consider a more flexible timeframe.',
          smartTip: 'Go Flexible',
          budgetDelta: deltaFlexible.toFixed(2),
        },
      };
    }
  }

  return { change: false, advice: '' };
};
