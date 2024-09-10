import {
  TimeConstraint,
  ProjectConfig,
  TypoAlgorithmInput,
  TypoOutputData,
  YearlyStrategy,
  FinancingData,
  RegionCosts,
  RegionsData,
  TypologiesData,
  TypologyCosts,
} from '@/types/types';
import { getCostPerRegions, getCostPerTypes } from '@/utils/calculations';
import { currentYear, targetYear, duration } from '@/constants/time';
import { deltaExAnte } from '@/constants/forecasts';
import { carbonToOffset } from '@/constants/user';
import { configMap } from '@/constants/configs';
import { Advice, advice_financing, advice_geography, advice_timeline, advice_typo } from './advice';
import { fiveYearAlgo, noAlgo, yearlyAlgo } from './strategies';

export const runTypoAlgorithm = (input: TypoAlgorithmInput): TypoOutputData => {
  const { configType, budget, regionAllocation, financing, timeConstraints } = input;
  const projectConfig: ProjectConfig[] = configMap[configType];

  for (const config of projectConfig) {
    // Loop through each type repartition, from the most aligned to the least
    // Access values from the config object
    const nbsRemoval = config.nbs_removal * carbonToOffset;
    const biochar = config.biochar * carbonToOffset;
    const dac = config.dac * carbonToOffset;
    const nbsAvoidance = config.nbs_avoidance * carbonToOffset;

    let totalBudget: number, adjustedBudget: number, strategies: YearlyStrategy[];

    switch (timeConstraints) {
      case TimeConstraint.Yearly:
        ({ totalBudget, strategies } = yearlyAlgo(
          timeConstraints,
          carbonToOffset,
          regionAllocation,
          {
            nbsRemoval,
            nbsAvoidance,
            biochar,
            dac,
          },
        ));
        break;
      case TimeConstraint.FiveYear:
        ({ totalBudget, strategies } = fiveYearAlgo(
          timeConstraints,
          carbonToOffset,
          regionAllocation,
          {
            nbsRemoval,
            nbsAvoidance,
            biochar,
            dac,
          },
        ));
        break;
      case TimeConstraint.NoConstraint:
        ({ optimalBudget: totalBudget, bestStrategy: strategies } = noAlgo(
          currentYear,
          targetYear,
          carbonToOffset,
          { nbsRemoval, nbsAvoidance, biochar, dac },
          regionAllocation,
        ));
        break;
    }

    if (!totalBudget) {
      throw new Error('An error occurred while running the algorithm.');
    }

    adjustedBudget = totalBudget;
    if (financing.financingExAnte > 0) {
      const exAnteCost = totalBudget * financing.financingExAnte * deltaExAnte;
      adjustedBudget = exAnteCost + totalBudget * financing.financingExPost;
    }

    // If the budget fits the user's constraints, return the results. If not, try the next configuration
    let budget_not_compatible;
    if (checkBudget(adjustedBudget, budget)) {
      budget_not_compatible = false;

      const typologyCosts: TypologyCosts = getCostPerTypes(strategies);
      const regionCosts: RegionCosts = getCostPerRegions(strategies);

      let financingData: FinancingData = {
        ex_ante: financing.financingExAnte,
        ex_post: financing.financingExPost,
      };

      let typologiesData: TypologiesData = {
        nbs_removal: nbsRemoval,
        nbs_avoidance: nbsAvoidance,
        biochar: biochar,
        dac: dac,
      };

      let regionsData: RegionsData = {
        north_america: regionAllocation.northAmerica,
        south_america: regionAllocation.southAmerica,
        europe: regionAllocation.europe,
        africa: regionAllocation.africa,
        asia: regionAllocation.asia,
        oceania: regionAllocation.oceania,
      };

      let adv_timeline: Advice = advice_timeline(timeConstraints);
      let adv_financing: Advice = advice_financing(financing);
      // let adv_typo: Advice = advice_typo(typology, typologyCosts);
      let adv_geography: Advice = advice_geography(regionAllocation, regionCosts);

      let res = {
        financing: financingData,
        typologies: typologiesData,
        regions: regionsData,
        carbon_offset: carbonToOffset,
        user_budget: budget,
        money_saving: 0, //TODO
        money_to_add: 0, //TODO
        budget_not_compatible: '', //TODO ??
        total_cost_low: adjustedBudget, //TODO
        total_cost_medium: adjustedBudget,
        total_cost_high: adjustedBudget,
        average_yearly_cost_low: adjustedBudget / duration,
        average_yearly_cost_medium: adjustedBudget / duration,
        average_yearly_cost_high: adjustedBudget / duration,
        average_price_per_ton_low: adjustedBudget / carbonToOffset,
        average_price_per_ton_medium: adjustedBudget / carbonToOffset,
        average_price_per_ton_high: adjustedBudget / carbonToOffset,
        total_cost_flexible: adjustedBudget, //TODO
        cost_ex_post: totalBudget * financing.financingExPost,
        cost_ex_ante: adjustedBudget - totalBudget * financing.financingExPost,
        cost_nbs_removal: typologyCosts.costNbsRemoval,
        cost_nbs_avoidance: typologyCosts.costNbsAvoidance,
        cost_biochar: typologyCosts.costBiochar,
        cost_dac: typologyCosts.costDac,
        cost_north_america: regionCosts.northAmerica,
        cost_south_america: regionCosts.southAmerica,
        cost_europe: regionCosts.europe,
        cost_africa: regionCosts.africa,
        cost_asia: regionCosts.asia,
        cost_oceania: regionCosts.oceania,
        advice_timeline: adv_timeline.change ? adv_timeline.advice : 'No advice needed.',
        advice_financing: adv_financing.change ? adv_financing.advice : 'No advice needed.',
        advice_typo: 'No advice needed.', // Should not be advisable??
        advice_geography: adv_geography.change ? adv_geography.advice : 'No advice needed.',
        strategies: strategies,
      };
      return res;
    }
  }

  // If no configuration fits the user's constraints, return default values
  return {
    financing: { ex_ante: 0, ex_post: 0 },
    typologies: { nbs_removal: 0, nbs_avoidance: 0, biochar: 0, dac: 0 },
    regions: { north_america: 0, south_america: 0, europe: 0, africa: 0, asia: 0, oceania: 0 },
    carbon_offset: 0,
    user_budget: 0,
    money_saving: 0,
    money_to_add: 0,
    budget_not_compatible: '',
    total_cost_low: 0,
    total_cost_medium: 0,
    total_cost_high: 0,
    average_yearly_cost_low: 0,
    average_yearly_cost_medium: 0,
    average_yearly_cost_high: 0,
    average_price_per_ton_low: 0,
    average_price_per_ton_medium: 0,
    average_price_per_ton_high: 0,
    total_cost_flexible: 0,
    cost_ex_post: 0,
    cost_ex_ante: 0,
    cost_nbs_removal: 0,
    cost_nbs_avoidance: 0,
    cost_biochar: 0,
    cost_dac: 0,
    cost_north_america: 0,
    cost_south_america: 0,
    cost_europe: 0,
    cost_africa: 0,
    cost_asia: 0,
    cost_oceania: 0,
    advice_timeline: '',
    advice_financing: '',
    advice_typo: '',
    advice_geography: '',
    strategies: [],
  };
};

// Function to check if the adjusted budget is within an acceptable range of the user's budget
function checkBudget(adjustedBudget: number, budget: number): boolean {
  // Calculate the difference between adjusted and actual budgets in both directions
  let diffBudgetOne = adjustedBudget - budget;
  let diffBudgetTwo = budget - adjustedBudget;
  let finalDiff = 0;

  // If the adjusted budget is less than or equal to the actual budget
  if (diffBudgetOne <= 0) {
    finalDiff = diffBudgetTwo; // Set the final difference as the positive gap
  }
  // If the actual budget is less than the adjusted budget
  else if (diffBudgetTwo < 0) {
    finalDiff = diffBudgetOne; // Set the final difference as the positive gap
  }

  // Check if the actual budget is within 10% (plus or minus) of the adjusted budget
  if (adjustedBudget * 0.9 <= budget && budget <= adjustedBudget * 1.1) {
    return true;
  }
  // If the actual budget is greater than the adjusted budget
  else if (adjustedBudget < budget) {
    return true;
  }
  // If the actual budget is less than the adjusted budget
  else {
    return false;
  }
}
