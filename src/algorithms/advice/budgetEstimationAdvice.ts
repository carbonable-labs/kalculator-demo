import {
  TimeConstraint,
  BudgetAlgorithmInput,
  BudgetOutputData,
  Advice,
  Financing,
} from '@/types/types';
import { runBudgetAlgo } from '@/actions/budget';
import { deltaExAnte } from '@/constants/forecasts';
import RenewableEnergy from '@/components/budget/questions/typologies/RenewableEnergy';

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
    } else if (deltaFiveYear > deltaFlexible) {
      return {
        change: true,
        adviceType: 'timeline',
        tipPhrase: 'You should consider a more flexible timeframe.',
        actionText: 'Go Five Year',
        budgetDelta: deltaFiveYear,
        tip: TimeConstraint.FiveYear,
      };
    } else {
      return {
        change: true,
        adviceType: 'timeline',
        tipPhrase: 'You should consider a more flexible timeframe.',
        actionText: 'Go Flexible',
        budgetDelta: deltaFlexible,
        tip: TimeConstraint.NoConstraint,
      };
    }
  } else if (input.timeConstraints === TimeConstraint.FiveYear) {
    if (deltaFlexible > minProfit) {
      return {
        change: true,
        adviceType: 'timeline',
        tipPhrase: 'You should consider a more flexible timeframe.',
        actionText: 'Go Flexible',
        budgetDelta: deltaFlexible,
        tip: TimeConstraint.NoConstraint,
      };
    }
  }

  return { change: false };
};

export const adviceBudgetFinancing = async (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Promise<Advice> => {
  if (input.financing.exAnte <= 0.88) {
    let newFinancing: Financing = { exAnte: 0.88, exPost: 0.12 };
    let newOutput: BudgetOutputData = await runBudgetAlgo({ ...input, financing: newFinancing });
    let delta = output.total_cost_medium - newOutput.total_cost_medium;
    const minProfit = output.total_cost_medium * 0.005; // 0.5% profit margin
    if (delta > minProfit) {
      return {
        change: true,
        adviceType: 'financing',
        tipPhrase: 'You should increase Forward financing.',
        actionText: 'Go Forward',
        budgetDelta: delta,
        tip: newFinancing,
      };
    }
  }
  return { change: false };
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
  let pctEU = input.regionAllocation.europe;
  let pctAF = input.regionAllocation.africa;
  let pctAS = input.regionAllocation.asia;
  let pctOC = input.regionAllocation.oceania;
  let pctNA = input.regionAllocation.northAmerica;
  let pctSA = input.regionAllocation.southAmerica;
  let allocations = [pctEU, pctAF, pctAS, pctOC, pctNA, pctSA];

  let isPresent = (n: number): number => {
    return n > 0 ? 100 : 0;
  };
  let targetCoeff = 1 / allocations.map(isPresent).reduce((a, b) => a + b);
  targetCoeff = targetCoeff * 100;

  // 0: EU, 1: AF, 2: AS, 3: OC, 4: NA, 5: SA
  const regionDistribution = allocations.map((x) => Math.round(x * 100));
  let prevRegionDistribution = [...regionDistribution];
  let newRegionDistribution = [...regionDistribution];

  let prevCosts = [
    output.cost_europe,
    output.cost_africa,
    output.cost_asia,
    output.cost_oceania,
    output.cost_north_america,
    output.cost_south_america,
  ];
  let newCosts = [...prevCosts];

  let step = Math.round(getMinStep(regionDistribution) / 2);

  let newOutput: BudgetOutputData = output;
  let newRegions = input.regionAllocation;
  let numLoops: number = 0;

  while (step > 0 && numLoops < 155) {
    numLoops++;
    let errors = computeSolutionError(prevRegionDistribution, prevCosts, targetCoeff);
    let totalCost =
      prevCosts.reduce((a, b) => a + b) *
      (newOutput.financing.exPost + newOutput.financing.exAnte * deltaExAnte);
    let costCoeffs = prevCosts.map((x) => x / totalCost);

    let maxErrorIndex = errors.indexOf(Math.max(...errors));
    let sign = Math.sign(targetCoeff - costCoeffs[maxErrorIndex]);
    newRegionDistribution[maxErrorIndex] = prevRegionDistribution[maxErrorIndex] + sign * step;

    // Find change that lowers error the most
    let currentError = errors.reduce((a, b) => a + b);
    let errorDiff = 0;
    let maxRegionDistribution = [...prevRegionDistribution];
    let newErrors: Array<number> = errors;
    newCosts = prevCosts;
    // todo: remove typology with 0% allocation
    // for each with filetered typology?
    let allocationSupport = regionDistribution
      .map((x, i) => (x == 0 || x == maxErrorIndex ? [0, i] : [1, i]))
      .filter((x) => x[0] == 1)
      .map((x) => x[1]);
    allocationSupport.forEach(async (i) => {
      let tmpDistribution = [...newRegionDistribution];
      tmpDistribution[i] = newRegionDistribution[i] - sign * step;
      let tmpRegions = {
        europe: tmpDistribution[0] / 100,
        africa: tmpDistribution[1] / 100,
        asia: tmpDistribution[2] / 100,
        oceania: tmpDistribution[3] / 100,
        northAmerica: tmpDistribution[4] / 100,
        southAmerica: tmpDistribution[5] / 100,
      };
      let tmpOutput = await runBudgetAlgo({ ...input, regionAllocation: tmpRegions });
      let tmpCosts = [
        tmpOutput.cost_europe,
        tmpOutput.cost_africa,
        tmpOutput.cost_asia,
        tmpOutput.cost_oceania,
        tmpOutput.cost_north_america,
        tmpOutput.cost_south_america,
      ];

      let tmpErrors = computeSolutionError(tmpDistribution, tmpCosts, targetCoeff);
      let tmpError = tmpErrors.reduce((a, b) => a + b);
      let tmpErrorDiff = currentError - tmpError;
      if (tmpErrorDiff > 0 && tmpErrorDiff > errorDiff) {
        errorDiff = tmpErrorDiff;
        maxRegionDistribution = [...tmpDistribution];
        newOutput = { ...tmpOutput };
        newErrors = [...tmpErrors];
        newCosts = [...tmpCosts];
        newRegions = { ...tmpRegions };
      }
    });

    newRegionDistribution = [...maxRegionDistribution];

    if (errorDiff <= 0) {
      step = Math.round((step - 0.5) / 2);
      step = Math.min(step, Math.round(getMinStep(newRegionDistribution) / 2));
    } else {
      prevRegionDistribution = [...newRegionDistribution];
      errors = [...newErrors];
      prevCosts = [...newCosts];
    }
  }

  let minProfit = output.total_cost_medium * 0.005;
  let deltaOptimal = output.total_cost_medium - newOutput.total_cost_medium;
  // todo adjust off by one if necessary

  if (deltaOptimal > minProfit) {
    if (newRegionDistribution != regionDistribution) {
      return {
        change: true,
        adviceType: 'geography',
        tipPhrase: 'You should modify region allocations.',
        actionText: 'Change Geography',
        budgetDelta: deltaOptimal,
        tip: [newRegions],
      };
    }
  }
  return { change: false };
};

export const computeBudgetAdvice = async (
  input: BudgetAlgorithmInput,
  output: BudgetOutputData,
): Promise<Array<Advice>> => {
  const computedTimelineTip = await adviceBudgetTimeline(input, output);
  const computedFinancingTip = await adviceBudgetFinancing(input, output);
  const computedTypologyTip = await adviceBudgetTypology(input, output);
  const computedGeographyTip = await adviceBudgetGeography(input, output);

  return [computedTimelineTip, computedFinancingTip, computedTypologyTip, computedGeographyTip];
};

// TODO: implement general optimization algorithm
type Algo = (input: BudgetAlgorithmInput) => BudgetOutputData;
type ScoreFunction = (output: BudgetOutputData) => number;
const optimize = (allocation: Array<number>, algo: Algo, score: ScoreFunction) => {};
