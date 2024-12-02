import {
  TimeConstraint,
  ProjectConfig,
  TypoAlgorithmInput,
  TypoOutputData,
  YearlyStrategy,
  Financing,
  CostByRegion,
  RegionAllocation,
  Typology,
  CostByTypology,
} from '@/types/types';
import { getCostPerRegions, getCostPerTypes } from '@/utils/calculations';
import { currentYear, targetYear, duration } from '@/constants/time';
import { deltaExAnte } from '@/constants/forecasts';
import { carbonToOffset } from '@/constants/user';
import { configMap } from '@/constants/configs';
import { fiveYearAlgo, noAlgo, yearlyAlgo } from './strategies';

export const runTypoAlgorithm = (input: TypoAlgorithmInput): TypoOutputData => {
  const { configType, budget, regionAllocation, financing, timeConstraints } = input;
  const projectConfig: ProjectConfig[] = configMap[configType];

  for (const config of projectConfig) {
    // Loop through each type repartition, from the most aligned to the least
    // Access values from the config object
    const nbsRemoval = config.nbsRemoval * carbonToOffset;
    const biochar = config.biochar * carbonToOffset;
    const dac = config.dac * carbonToOffset;
    const nbsAvoidance = config.nbsAvoidance * carbonToOffset;
    const renewableEnergy = config.renewableEnergy * carbonToOffset;

    let strategies: YearlyStrategy[];
    let totalBudgetLow: number, totalBudgetMedium: number, totalBudgetHigh: number;

    switch (timeConstraints) {
      case TimeConstraint.Yearly:
        ({ totalBudgetLow, totalBudgetMedium, totalBudgetHigh, strategies } = yearlyAlgo(
          timeConstraints,
          carbonToOffset,
          regionAllocation,
          {
            nbsRemoval,
            nbsAvoidance,
            biochar,
            dac,
            renewableEnergy,
          },
        ));
        break;
      case TimeConstraint.FiveYear:
        ({ totalBudgetLow, totalBudgetMedium, totalBudgetHigh, strategies } = fiveYearAlgo(
          timeConstraints,
          carbonToOffset,
          regionAllocation,
          {
            nbsRemoval,
            nbsAvoidance,
            biochar,
            dac,
            renewableEnergy,
          },
        ));
        break;
      case TimeConstraint.NoConstraint:
        ({ totalBudgetLow, totalBudgetMedium, totalBudgetHigh, strategies } = noAlgo(
          currentYear,
          targetYear,
          carbonToOffset,
          { nbsRemoval, nbsAvoidance, biochar, dac, renewableEnergy },
          regionAllocation,
        ));
        break;
    }

    if (!totalBudgetMedium || !strategies) {
      throw new Error('An error occurred while running the algorithm.');
    }

    const notAdjustedBudget = totalBudgetMedium;
    if (financing.exAnte > 0) {
      const exAnteCostMedium = totalBudgetMedium * financing.exAnte * deltaExAnte;
      totalBudgetMedium = exAnteCostMedium + totalBudgetMedium * financing.exPost;

      const exAnteCostLow = totalBudgetLow * financing.exAnte * deltaExAnte;
      totalBudgetLow = exAnteCostLow + totalBudgetLow * financing.exPost;

      const exAnteCostHigh = totalBudgetHigh * financing.exAnte * deltaExAnte;
      totalBudgetHigh = exAnteCostHigh + totalBudgetHigh * financing.exPost;
    }
    // If the budget fits the user's constraints, return the results. If not, try the next configuration
    let budget_not_compatible;
    if (checkBudget(totalBudgetMedium, budget)) {
      budget_not_compatible = false;

      const typologyCosts: CostByTypology = getCostPerTypes(strategies);
      const CostByRegion: CostByRegion = getCostPerRegions(strategies);

      let financingData: Financing = {
        exAnte: financing.exAnte,
        exPost: financing.exPost,
      };

      let typologiesData: Typology = {
        nbsRemoval: nbsRemoval,
        nbsAvoidance: nbsAvoidance,
        biochar: biochar,
        dac: dac,
        renewableEnergy: renewableEnergy,
      };

      let regionsData: RegionAllocation = {
        northAmerica: regionAllocation.northAmerica,
        southAmerica: regionAllocation.southAmerica,
        europe: regionAllocation.europe,
        africa: regionAllocation.africa,
        asia: regionAllocation.asia,
        oceania: regionAllocation.oceania,
      };

      let res = {
        financing: financingData,
        typologies: typologiesData,
        regions: regionsData,
        carbon_offset: carbonToOffset,
        user_budget: budget,
        money_saving: 0, //TODO
        money_to_add: 0, //TODO
        budget_not_compatible: '', //TODO ??
        total_cost_low: totalBudgetLow, //TODO
        total_cost_medium: totalBudgetMedium,
        total_cost_high: totalBudgetHigh,
        average_yearly_cost_low: totalBudgetLow / duration,
        average_yearly_cost_medium: totalBudgetMedium / duration,
        average_yearly_cost_high: totalBudgetHigh / duration,
        average_price_per_ton_low: totalBudgetLow / carbonToOffset,
        average_price_per_ton_medium: totalBudgetMedium / carbonToOffset,
        average_price_per_ton_high: totalBudgetHigh / carbonToOffset,
        total_cost_flexible: totalBudgetMedium, //TODO
        cost_ex_post: notAdjustedBudget * financing.exPost,
        cost_ex_ante: totalBudgetMedium - notAdjustedBudget * financing.exPost,
        cost_nbs_removal: typologyCosts.costNbsRemoval,
        cost_nbs_avoidance: typologyCosts.costNbsAvoidance,
        cost_biochar: typologyCosts.costBiochar,
        cost_dac: typologyCosts.costDac,
        cost_north_america: CostByRegion.northAmerica,
        cost_south_america: CostByRegion.southAmerica,
        cost_europe: CostByRegion.europe,
        cost_africa: CostByRegion.africa,
        cost_asia: CostByRegion.asia,
        cost_oceania: CostByRegion.oceania,
        advice_timeline: '',
        advice_financing: '',
        advice_typo: '', // Should not be advisable??
        advice_geography: '',
        strategies: strategies,
      };
      return res;
    }
  }

  // If no configuration fits the user's constraints, return default values
  return {
    financing: { exAnte: 0, exPost: 0 },
    typologies: { nbsRemoval: 0, nbsAvoidance: 0, biochar: 0, dac: 0, renewableEnergy: 0 },
    regions: { northAmerica: 0, southAmerica: 0, europe: 0, africa: 0, asia: 0, oceania: 0 },
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
