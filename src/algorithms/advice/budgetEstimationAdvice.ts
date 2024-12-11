import { TimeConstraint, BudgetAlgorithmInput, BudgetOutputData, Advice } from '@/types/types';
import { runBudgetAlgo } from '@/actions/budget';

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
        tipPhrase:
          'Consider adopting a more flexible timeline with fewer but larger investments, such as making purchases in batches every 5 years.',
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
      tip: TimeConstraint.FiveYear,
      actionText: 'Back to 5 years',
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
    optimizeFinancing: true,
  });

  const delta = output.total_cost_medium - newOutput.total_cost_medium;
  const minProfit = output.total_cost_medium * 0.005; // 0.5% profit margin
  if (delta > minProfit) {
    return {
      change: true,
      adviceType: 'financingOptimization',
      tipPhrase: 'Consider enabling Carbonable optimization to find the most cost-effective split.',
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
  const typologies = [
    { name: 'Biochar', percentage: input.typology.biochar, cost: output.cost_biochar },
    { name: 'DAC', percentage: input.typology.dac, cost: output.cost_dac },
    {
      name: 'NbS - REDD',
      percentage: input.typology.nbsAvoidance,
      cost: output.cost_nbs_avoidance,
    },
    { name: 'NbS - ARR', percentage: input.typology.nbsRemoval, cost: output.cost_nbs_removal },
    {
      name: 'Renewable Energy',
      percentage: input.typology.renewableEnergy,
      cost: output.cost_renewable_energy,
    },
  ];

  const totalCost = typologies.reduce((sum, t) => sum + t.cost, 0);

  const highCostTypologies = typologies.filter((typology) => {
    const relativeCost = typology.cost / totalCost;
    return relativeCost > typology.percentage * 3; // x3 the quantity
  });

  if (highCostTypologies.length > 0) {
    const mostExpensiveTypology = highCostTypologies.sort(
      (a, b) => b.cost / b.percentage - a.cost / a.percentage,
    )[0];

    return {
      change: true,
      adviceType: 'typology',
      tipPhrase: `The ${mostExpensiveTypology.name} typology represents a disproportionate share of your budget. Reducing its allocation could optimize costs.`,
      actionText: 'Adjust',
    };
  }

  return { change: false };
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
    optimizeRegion: true,
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
      tip: newOutput.regionRepartition,
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

  return [computedTimelineTip, computedFinancingTip, computedTypologyTip, computedGeographyTip];
};
