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
  // Compute the cost coefficient of each typology

  let pctBiochar = input.typology.biochar;
  let pctDac = input.typology.dac;
  let pctNbsAvoidance = input.typology.nbsAvoidance;
  let pctNbsRemoval = input.typology.nbsAvoidance;

  let isPresent = (n: number): number => {
    return n > 0 ? 1 : 0;
  };
  let targetCoeff =
    1 / [pctBiochar, pctDac, pctNbsAvoidance, pctNbsRemoval].map(isPresent).reduce((a, b) => a + b);

  // 0: biochar, 1: dac, 2: nbsAvoidance, 3: nbsRemoval

  let newTypology = { ...input.typology };
  let step = 0.4;
  // Compute current errors
  let totalCost =
    output.cost_biochar + output.cost_dac + output.cost_nbs_avoidance + output.cost_nbs_removal;
  let costCoeffBiochar = output.cost_biochar / totalCost;
  let costCoeffDac = output.cost_dac / totalCost;
  let costCoeffNbsAvoidance = output.cost_nbs_avoidance / totalCost;
  let costCoeffNbsRemoval = output.cost_nbs_removal / totalCost;
  console.log(costCoeffBiochar, costCoeffDac, costCoeffNbsAvoidance, costCoeffNbsRemoval);

  let newOutput: BudgetOutputData = output;

  let numLoops: number = 0;
  while (step > 0.01) {
    numLoops++;
    let errors = computeTypoSolutionCost(
      input.typology,
      {
        costBiochar: costCoeffBiochar,
        costDac: costCoeffDac,
        costNbsAvoidance: costCoeffNbsAvoidance,
        costNbsRemoval: costCoeffNbsRemoval,
      },
      targetCoeff,
    );

    // delta change for max error typology
    // TODO: check if the typology is already at 0% or 100%
    let pctChange = 0;
    let maxErrorIndex = errors.indexOf(Math.max(...errors));
    if (maxErrorIndex == 0) {
      let newBiochar = costCoeffBiochar < targetCoeff ? pctBiochar + step : pctBiochar - step;
      newBiochar = Math.min(Math.max(0, newBiochar), 1);
      pctChange = pctBiochar - newBiochar;
      newTypology = { ...newTypology, biochar: newBiochar };
    } else if (maxErrorIndex == 1) {
      let newDac = costCoeffDac < targetCoeff ? pctDac + step : pctDac - step;
      newDac = Math.min(Math.max(0, newDac), 1);
      pctChange = pctDac - newDac;
      newTypology = { ...newTypology, dac: newDac };
    } else if (maxErrorIndex == 2) {
      let newNbsAvoidance =
        costCoeffNbsAvoidance < targetCoeff ? pctNbsAvoidance + step : pctNbsAvoidance - step;
      newNbsAvoidance = Math.min(Math.max(0, newNbsAvoidance), 1);
      pctChange = pctNbsAvoidance - newNbsAvoidance;
    } else if (maxErrorIndex == 3) {
      let newNbsRemoval =
        costCoeffNbsRemoval < targetCoeff ? pctNbsRemoval + step : pctNbsRemoval - step;
      newNbsRemoval = Math.min(Math.max(0, newNbsRemoval), 1);
      pctChange = pctNbsRemoval - newNbsRemoval;
      newTypology = { ...newTypology, nbsRemoval: newNbsRemoval };
    }
    let minErrorIndex = errors.indexOf(Math.min(...errors.map((x) => (x == 0 ? Infinity : x)))); // Discard typologies with 0% allocation
    if (minErrorIndex == 0) {
      let newBiochar = costCoeffBiochar < targetCoeff ? pctBiochar - step : pctBiochar + step;
      newTypology = { ...newTypology, biochar: Math.min(Math.max(0, newBiochar), 1) };
    }

    newOutput = runBudgetAlgorithm({ ...input, typology: newTypology });
    // Compute cost coefficients
    totalCost =
      newOutput.cost_biochar +
      newOutput.cost_dac +
      newOutput.cost_nbs_avoidance +
      newOutput.cost_nbs_removal;
    let newCostCoeffBiochar = newOutput.cost_biochar / totalCost;
    let newCostCoeffDac = newOutput.cost_dac / totalCost;
    let newCostCoeffNbsAvoidance = newOutput.cost_nbs_avoidance / totalCost;
    let newCostCoeffNbsRemoval = newOutput.cost_nbs_removal / totalCost;

    let newErrors = computeTypoSolutionCost(
      input.typology,
      {
        costBiochar: newCostCoeffBiochar,
        costDac: newCostCoeffDac,
        costNbsAvoidance: newCostCoeffNbsAvoidance,
        costNbsRemoval: newCostCoeffNbsRemoval,
      },
      targetCoeff,
    );

    if (errors.reduce((a, b) => a + b) - newErrors.reduce((a, b) => a + b) < 0) {
      step = Math.round((step * 100) / 2) / 100;
    } else {
      pctBiochar = newTypology.biochar;
      pctDac = newTypology.dac;
      pctNbsAvoidance = newTypology.nbsAvoidance;
      pctNbsRemoval = newTypology.nbsRemoval;
      errors = newErrors;
      costCoeffBiochar = newCostCoeffBiochar;
      costCoeffDac = newCostCoeffDac;
      costCoeffNbsAvoidance = newCostCoeffNbsAvoidance;
      costCoeffNbsRemoval = newCostCoeffNbsRemoval;
    }
  }

  let minProfit = output.total_cost_medium * 0.005;
  let deltaOptimal = output.total_cost_medium - newOutput.total_cost_medium;
  let newBiochar = Math.round(100 * newTypology.biochar);
  let newDac = Math.round(100 * newTypology.dac);
  let newNbsAvoidance = Math.round(100 * newTypology.nbsAvoidance);
  let newNbsRemoval = Math.round(100 * newTypology.nbsRemoval);

  console.log(deltaOptimal, numLoops);
  console.log(input.typology, newBiochar, newDac, newNbsAvoidance, newNbsRemoval);
  console.log(costCoeffBiochar, costCoeffDac, costCoeffNbsAvoidance, costCoeffNbsRemoval);
  if (deltaOptimal > minProfit) {
    if (newTypology != input.typology) {
      return {
        change: true,
        tip: {
          advicePhrase: 'You should consider changing your typology.',
          smartTip: `Change Typology to biochar: ${newBiochar}%, dac: ${newDac}%, nbsAvoidance: ${newNbsAvoidance}%, nbsRemoval: ${newNbsRemoval}%`,
          budgetDelta: deltaOptimal.toFixed(2),
        },
      };
    }
  }
  return { change: false };
};

const computeTypoSolutionCost = (
  typo: Typology,
  typoCost: TypologyCosts,
  target: number,
): Array<number> => {
  let cost = [
    [typoCost.costBiochar, typo.biochar],
    [typoCost.costDac, typo.dac],
    [typoCost.costNbsAvoidance, typo.nbsAvoidance],
    [typoCost.costNbsRemoval, typo.nbsRemoval],
  ]
    .map((x) => (x[1] == 0 ? target : x[0])) // Discard typologies with 0% allocation
    .map((x) => Math.pow(x - target, 2)); // Compute the squared distance to optimal cost
  return cost;
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
