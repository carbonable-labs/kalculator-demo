import {
  BudgetAlgorithmInput,
  BudgetOutputData,
  Financing,
  Typology,
  RegionAllocation,
  TypologyCosts,
  RegionCosts,
  YearlyStrategy,
} from '@/types/types';
import { getCostPerRegions, getCostPerTypes } from '@/utils/calculations';
import { currentYear, targetYear, duration } from '@/constants/time';
import { deltaExAnte } from '@/constants/forecasts';
import { carbonToOffset } from '@/constants/user';
import { fiveYearAlgo, noAlgo, yearlyAlgo } from './strategies';

export const runBudgetAlgorithm = (input: BudgetAlgorithmInput): BudgetOutputData => {
  const { regionAllocation, typology, financing, timeConstraints } = input;

  let { nbsRemoval, nbsAvoidance, biochar, dac, renewableEnergy } = typology;
  let strategies: YearlyStrategy[];
  let totalBudgetLow: number, totalBudgetMedium: number, totalBudgetHigh: number;

  nbsRemoval *= carbonToOffset;
  nbsAvoidance *= carbonToOffset;
  biochar *= carbonToOffset;
  dac *= carbonToOffset;
  renewableEnergy *= carbonToOffset;

  if (timeConstraints === 1) {
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
  } else if (timeConstraints === 5) {
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
  } else {
    ({ totalBudgetLow, totalBudgetMedium, totalBudgetHigh, strategies } = noAlgo(
      currentYear,
      targetYear,
      carbonToOffset,
      {
        nbsRemoval,
        nbsAvoidance,
        biochar,
        dac,
        renewableEnergy,
      },
      regionAllocation,
    ));
  }

  const notAdjustedBudget = totalBudgetMedium; // todo: review naming

  if (financing.exAnte > 0) {
    const exAnteCostMedium = totalBudgetMedium * financing.exAnte * deltaExAnte;
    totalBudgetMedium = exAnteCostMedium + totalBudgetMedium * financing.exPost;

    const exAnteCostLow = totalBudgetLow * financing.exAnte * deltaExAnte;
    totalBudgetLow = exAnteCostLow + totalBudgetLow * financing.exPost;

    const exAnteCostHigh = totalBudgetHigh * financing.exAnte * deltaExAnte;
    totalBudgetHigh = exAnteCostHigh + totalBudgetHigh * financing.exPost;
  }

  const typologyCosts: TypologyCosts = getCostPerTypes(strategies); // Todo: naming
  const regionCosts: RegionCosts = getCostPerRegions(strategies); // Todo: naming

  let financingData: Financing = {
    exAnte: financing.exAnte,
    exPost: financing.exPost,
  };

  let typologiesData: Typology = {
    //TODO: refacto
    nbsRemoval: nbsRemoval,
    nbsAvoidance: nbsAvoidance,
    biochar: biochar,
    dac: dac,
    renewableEnergy: renewableEnergy,
  };

  let regionsData: RegionAllocation = {
    // todo: refacto
    northAmerica: regionAllocation.northAmerica,
    southAmerica: regionAllocation.southAmerica,
    europe: regionAllocation.europe,
    africa: regionAllocation.africa,
    asia: regionAllocation.asia,
    oceania: regionAllocation.oceania,
  };

  let res: BudgetOutputData = {
    financing: financingData,
    typologies: typologiesData,
    regions: regionsData,
    carbon_offset: carbonToOffset,
    total_cost_low: totalBudgetLow,
    total_cost_medium: totalBudgetMedium,
    total_cost_high: totalBudgetHigh,
    average_yearly_cost_low: totalBudgetLow / duration,
    average_yearly_cost_medium: totalBudgetMedium / duration,
    average_yearly_cost_high: totalBudgetHigh / duration,
    average_price_per_ton_low: totalBudgetLow / carbonToOffset,
    average_price_per_ton_medium: totalBudgetMedium / carbonToOffset,
    average_price_per_ton_high: totalBudgetHigh / carbonToOffset,
    total_cost_flexible: totalBudgetMedium,
    cost_ex_post: totalBudgetMedium * financing.exPost,
    cost_ex_ante: totalBudgetMedium - notAdjustedBudget * financing.exPost,
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
    advice_timeline: { change: false },
    advice_financing: { change: false },
    advice_typo: { change: false },
    advice_geography: { change: false },
    strategies: strategies,
  };

  return res;
};
