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
  tip?: BudgetAdvice;
}

export interface BudgetAdvice {
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

  if (input.timeConstraints === TimeConstraint.Yearly) {
    if (Math.max(deltaFiveYear, deltaFlexible) < minProfit) {
      return { change: false };
    } else if (deltaFiveYear > deltaFlexible) {
      return {
        change: true,
        tip: {
          advicePhrase: 'You should consider a more flexible timeframe.',
          smartTip: 'Go Five Year',
          budgetDelta: deltaFiveYear.toFixed(2),
        },
      };
    } else {
      return {
        change: true,
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
        tip: {
          advicePhrase: 'You should consider a more flexible timeframe.',
          smartTip: 'Go Flexible',
          budgetDelta: deltaFlexible.toFixed(2),
        },
      };
    }
  }

  return { change: false };
};

export const adviceBudgetFinancing = (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Advice => {
  if (input.financing.financingExAnte <= 0.88) {
    let newInput = { ...input.financing, financingExAnte: 0.88 };
    let newOutput: BudgetOutputData = runBudgetAlgorithm({ ...input, financing: newInput });
    let delta = newOutput.total_cost_medium - output.total_cost_medium;
    const minProfit = output.total_cost_medium * 0.005; // 0.5% profit margin
    if (delta > minProfit) {
      return {
        change: true,
        tip: {
          advicePhrase: 'You should consider increasing Forward financing.',
          smartTip: 'Go Forward',
          budgetDelta: delta.toFixed(2),
        },
      };
    }
  }
  return { change: false };
};

export const adviceBudgetTypology = (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Advice => {
  // TODO
  return { change: false };
};

export const adviceBudgetGeography = (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Advice => {
  // TODO
  return { change: false };
};

export const computeBudgetAdvice = (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Array<Advice> => {
  let computedTimelineTip = adviceBudgetTimeline(input, output);
  let computedFinancingTip = adviceBudgetFinancing(input, output);
  let computedTypologyTip = adviceBudgetTypology(input, output);
  let computedGeographyTip = adviceBudgetGeography(input, output);

  return [computedTimelineTip, computedFinancingTip, computedTypologyTip, computedGeographyTip];
};
