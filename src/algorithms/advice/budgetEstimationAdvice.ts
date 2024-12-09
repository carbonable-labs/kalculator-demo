import {
  TimeConstraint,
  BudgetAlgorithmInput,
  BudgetOutputData,
  Advice,
  Financing,
} from '@/types/types';
import { runBudgetAlgo } from '@/actions/budget';
import { deltaExAnte } from '@/constants/forecasts';

export const adviceBudgetTimeline = async (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Promise<Advice> => {
  let fiveYearInput = { ...input, timeConstraints: TimeConstraint.FiveYear };
  let fiveYearOutput: BudgetOutputData = await runBudgetAlgo(fiveYearInput);

  let flexibleInput = { ...input, timeConstraints: TimeConstraint.NoConstraint };
  let flexibleOutput: BudgetOutputData = await runBudgetAlgo(flexibleInput);

  let deltaFiveYear = output.total_cost_medium - fiveYearOutput.total_cost_medium;
  let deltaFlexible = output.total_cost_medium - flexibleOutput.total_cost_medium;

  const minProfit = output.total_cost_medium * 0.005; // 0.5% profit margin
  if (input.timeConstraints === TimeConstraint.Yearly) {
    if (Math.max(deltaFiveYear, deltaFlexible) < minProfit) {
      return { change: false };
    } else {
      return {
        change: true,
        adviceType: 'timeline',
        tipPhrase: 'Consider adopting a more flexible timeline with fewer but larger investments, such as making purchases in batches every 5 years.',
        actionText: 'Test that plan',
        budgetDelta: deltaFiveYear,
        tip: TimeConstraint.FiveYear,
      };
    }
  } else if (input.timeConstraints === TimeConstraint.FiveYear) {
    if (deltaFlexible > minProfit) {
      return {
        change: true,
        adviceType: 'timeline',
        tipPhrase:
          'A fully flexible timeline can help identify the ideal investment strategy without yearly constraints. While less realistic, it highlights the optimal scenario for comparison.',
        actionText: 'Try Flexible',
        budgetDelta: deltaFlexible,
        tip: TimeConstraint.NoConstraint,
      };
    }
  } else if (input.timeConstraints === TimeConstraint.NoConstraint) {
    return {
      change: false,
      adviceType: 'timeline',
      tipPhrase:
        'You are already using the most optimal investment timeline. This strategy serves as a benchmark for evaluating other constraints and ensuring they are close to the ideal scenario.',
      tip: TimeConstraint.NoConstraint,
    };
  }

  return { change: false };
};

export const adviceBudgetFinancing = async (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Promise<Advice> => {
  if (input.optimizeFinancing) {
    return {
      change: false,
      adviceType: 'financing',
      tipPhrase:
        'Carbonable has already optimized your financing strategy, finding the best possible split to minimize costs and maximize efficiency.',
    };
  }

  const newOutput: BudgetOutputData = await runBudgetAlgo({
    ...input,
    optimizeFinancing: true
  });

  const delta = output.total_cost_medium - newOutput.total_cost_medium;
  const minProfit = output.total_cost_medium * 0.005; // 0.5% profit margin
  if (delta > minProfit) {
    return {
      change: true,
      adviceType: 'financingOptimization',
      tipPhrase:
        'Consider enabling Carbonable optimization to find the most cost-effective split.',
      actionText: 'Lets Optimize',
      budgetDelta: delta,
      tip: newOutput.financing,
    };
  }
  return {
    change: false,
    adviceType: 'financing',
    tipPhrase:
      'Your current financing strategy is already well-balanced. No significant improvements were found by adjusting the split',
  };
};

export const adviceBudgetTypology = async (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Promise<Advice> => {
  let pctBiochar = input.typology.biochar;
  let pctDac = input.typology.dac;
  let pctNbsAvoidance = input.typology.nbsAvoidance;
  let pctNbsRemoval = input.typology.nbsRemoval;

  let isPresent = (n: number): number => {
    return n > 0 ? 100 : 0;
  };
  let targetCoeff =
    1 / [pctBiochar, pctDac, pctNbsAvoidance, pctNbsRemoval].map(isPresent).reduce((a, b) => a + b);
  targetCoeff = targetCoeff * 100;

  // 0: biochar, 1: dac, 2: nbsAvoidance, 3: nbsRemoval
  const typologyDistribution = [pctBiochar, pctDac, pctNbsAvoidance, pctNbsRemoval].map((x) =>
    Math.round(x * 100),
  );
  let prevTypologyDistribution = [...typologyDistribution];
  let newTypologyDistribution = [...typologyDistribution];

  let prevCosts = [
    output.cost_biochar,
    output.cost_dac,
    output.cost_nbs_avoidance,
    output.cost_nbs_removal,
    output.cost_renewable_energy,
  ];
  let newCosts = [...prevCosts];

  let step = Math.round(getMinStep(typologyDistribution) / 2);

  let newOutput: BudgetOutputData = output;
  let newTypology = input.typology;
  let numLoops: number = 0;
  while (step > 0 && numLoops < 155) {
    numLoops++;
    let errors = computeSolutionError(prevTypologyDistribution, prevCosts, targetCoeff);
    let totalCost =
      prevCosts.reduce((a, b) => a + b) *
      (output.financing.exPost + output.financing.exAnte * deltaExAnte);
    let costCoeffs = prevCosts.map((x) => x / totalCost);

    let maxErrorIndex = errors.indexOf(Math.max(...errors));
    let sign = Math.sign(targetCoeff - costCoeffs[maxErrorIndex]);
    newTypologyDistribution[maxErrorIndex] = prevTypologyDistribution[maxErrorIndex] + sign * step;

    // Find change that lowers error the most
    let currentError = errors.reduce((a, b) => a + b);
    let errorDiff = 0;
    let maxTypologyDistribution = [...prevTypologyDistribution];
    let newErrors: Array<number> = errors;
    newCosts = prevCosts;
    // todo: remove typology with 0% allocation
    // for each with filetered typology?
    let allocationSupport = typologyDistribution
      .map((x, i) => (x == 0 || x == maxErrorIndex ? [0, i] : [1, i]))
      .filter((x) => x[0] == 1)
      .map((x) => x[1]);
    allocationSupport.forEach(async (i) => {
      let tmpDistribution = [...newTypologyDistribution];
      tmpDistribution[i] = newTypologyDistribution[i] - sign * step;
      let tmpTypology = {
        biochar: tmpDistribution[0] / 100,
        dac: tmpDistribution[1] / 100,
        nbsAvoidance: tmpDistribution[2] / 100,
        nbsRemoval: tmpDistribution[3] / 100,
        renewableEnergy: 0,
      };
      let tmpOutput = await runBudgetAlgo({ ...input, typology: tmpTypology });
      let tmpCosts = [
        tmpOutput.cost_biochar,
        tmpOutput.cost_dac,
        tmpOutput.cost_nbs_avoidance,
        tmpOutput.cost_nbs_removal,
        tmpOutput.cost_renewable_energy,
      ];

      let tmpErrors = computeSolutionError(tmpDistribution, tmpCosts, targetCoeff);
      let tmpError = tmpErrors.reduce((a, b) => a + b);
      let tmpErrorDiff = currentError - tmpError;
      if (tmpErrorDiff > 0 && tmpErrorDiff > errorDiff) {
        errorDiff = tmpErrorDiff;
        maxTypologyDistribution = [...tmpDistribution];
        newOutput = { ...tmpOutput };
        newErrors = [...tmpErrors];
        newCosts = [...tmpCosts];
        newTypology = { ...tmpTypology };
      }
    });

    newTypologyDistribution = [...maxTypologyDistribution];

    // console.log(
    //   numLoops,
    //   prevTypologyDistribution,
    //   newTypologyDistribution,
    //   errors.map((x) => (100 * x).toFixed(3)),
    //   newErrors.map((x) => (100 * x).toFixed(3)),
    //   // prevCosts.map((x) => x.toFixed(0)),
    //   // newCosts.map((x) => x.toFixed(0)),
    //   sign,
    //   step,
    //   errorDiff.toFixed(5),
    //   costCoeffs.map((x) => x.toFixed(2)),
    // );

    if (errorDiff <= 0) {
      step = Math.round((step - 0.5) / 2);
      step = Math.min(step, Math.round(getMinStep(newTypologyDistribution) / 2));
    } else {
      prevTypologyDistribution = [...newTypologyDistribution];
      errors = [...newErrors];
      prevCosts = [...newCosts];
    }
  }

  let minProfit = output.total_cost_medium * 0.005;
  let deltaOptimal = output.total_cost_medium - newOutput.total_cost_medium;
  // todo adjust off by one if necessary

  if (deltaOptimal > minProfit) {
    if (newTypologyDistribution != typologyDistribution) {
      return {
        change: true,
        adviceType: 'typology',
        tipPhrase: 'You should consider changing your typology.',
        actionText: 'Change Typology',
        budgetDelta: deltaOptimal,
        tip: [newTypology],
      };
    }
  }
  return { change: false };
};

const getMinStep = (values: Array<number>): number => {
  let nonZeroValues = values.filter((x) => x != 0);
  let minDecrease = Math.min(...nonZeroValues);
  let maxIncrease = Math.max(...nonZeroValues.map((x) => 100 - x));
  return Math.min(minDecrease, maxIncrease);
};

// TODO: computeSolutionCost and minimize it
// find cost-based solution: minimize cost, maximize impact, maximize cost efficiency, etc
const computeSolutionError = (
  distribution: Array<number>,
  costs: Array<number>,
  target: number,
): Array<number> => {
  let sumCosts = costs.reduce((a, b) => a + b);
  let normalizedCosts = costs.map((x) => x * x); // todo: normalize costs based on initial total cost
  // return normalizedCosts;
  let errors = costs
    .map((ci, i) => (distribution[i] == 0 ? target : (100 * ci) / sumCosts)) // Discard typologies with 0% allocation;
    .map((x) => Math.pow(x - target, 2)); // Compute the squared distance to optimal cost
  let sumErrors = errors.reduce((a, b) => a + b);
  let normalizedErrors = errors.map((x) => x / Math.pow(100 - target, 2));
  return normalizedErrors;
};

export const adviceBudgetGeography = async (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Promise<Advice> => {
  if (input.optimizeRegion) {
    return {
      change: false,
      adviceType: 'region',
      tipPhrase:
        'Carbonable has already optimized your geography repartition strategy, finding the best possible repartition to minimize costs.',
    };
  }

  const newOutput: BudgetOutputData = await runBudgetAlgo({
    ...input,
    optimizeRegion: true
  });

  const delta = output.total_cost_medium - newOutput.total_cost_medium;
  const minProfit = output.total_cost_medium * 0.005; // 0.5% profit margin
  if (delta > minProfit) {
    return {
      change: true,
      adviceType: 'regionOptimization',
      tipPhrase:
        'Consider enabling Carbonable optimization to find the most cost-effective repartition.',
      actionText: 'Lets Optimize',
      budgetDelta: delta,
      tip: newOutput.regions,
    };
  }
  return {
    change: false,
    adviceType: 'region',
    tipPhrase:
      'Your current region strategy is already well-balanced. No significant improvements were found by adjusting it',
  };
};


export const computeBudgetAdvice = async (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Promise<Array<Advice>> => {
  const computedTimelineTip = await adviceBudgetTimeline(input, output);
  const computedFinancingTip = await adviceBudgetFinancing(input, output);
  const computedTypologyTip = await adviceBudgetTypology(input, output);
  const computedGeographyTip = await adviceBudgetGeography(input, output);

  return [computedTimelineTip, computedFinancingTip, computedGeographyTip];
};

// TODO: implement general optimization algorithm
type Algo = (input: BudgetAlgorithmInput) => BudgetOutputData;
type ScoreFunction = (output: BudgetOutputData) => number;
const optimize = (allocation: Array<number>, algo: Algo, score: ScoreFunction) => { };
