import {
  BudgetAlgorithmInput,
  BudgetOutputData,
  FinancingData,
  TypologiesData,
  RegionsData,
  TypologyCosts,
  RegionCosts,
  YearlyStrategy,
} from '@/types/types';
import { getCostPerRegions, getCostPerTypes } from '@/utils/calculations';
import { currentYear, targetYear, duration } from '@/constants/time';
import { deltaExAnte } from '@/constants/forecasts';
import { carbonToOffset } from '@/constants/user';
import { Advice, adviceFinancing, adviceGeography, adviceTimeline, adviceTypo } from './advice';
import { fiveYearAlgo, noAlgo, yearlyAlgo } from './strategies';

export const runBudgetAlgorithm = (input: BudgetAlgorithmInput): BudgetOutputData => {
  const { regionAllocation, typology, financing, timeConstraints } = input;

  let { nbsRemoval, nbsAvoidance, biochar, dac } = typology;
  let strategies: YearlyStrategy[];
  let totalBudgetLow: number, totalBudgetMedium: number, totalBudgetHigh: number;

  nbsRemoval *= carbonToOffset;
  nbsAvoidance *= carbonToOffset;
  biochar *= carbonToOffset;
  dac *= carbonToOffset;

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
      },
      regionAllocation,
    ));
  }

  const notAdjustedBudget = totalBudgetMedium;

  if (financing.financingExAnte > 0) {
    const exAnteCostMedium = totalBudgetMedium * financing.financingExAnte * deltaExAnte;
    totalBudgetMedium = exAnteCostMedium + totalBudgetMedium * financing.financingExPost;

    const exAnteCostLow = totalBudgetLow * financing.financingExAnte * deltaExAnte;
    totalBudgetLow = exAnteCostLow + totalBudgetLow * financing.financingExPost;

    const exAnteCostHigh = totalBudgetHigh * financing.financingExAnte * deltaExAnte;
    totalBudgetHigh = exAnteCostHigh + totalBudgetHigh * financing.financingExPost;
  }

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

  let adv_timeline: Advice = adviceTimeline(timeConstraints);
  let adv_financing: Advice = adviceFinancing(financing);
  let adv_typo: Advice = adviceTypo(typology, typologyCosts);
  let adv_geography: Advice = adviceGeography(regionAllocation, regionCosts);

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
    cost_ex_post: totalBudgetMedium * financing.financingExPost,
    cost_ex_ante: totalBudgetMedium - notAdjustedBudget * financing.financingExPost,
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
    advice_typo: adv_typo.change ? adv_typo.advice : 'No advice needed.',
    advice_geography: adv_geography.change ? adv_geography.advice : 'No advice needed.',
    strategies: strategies,
  };

  return res;
};
