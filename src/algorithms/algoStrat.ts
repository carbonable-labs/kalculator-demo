import {
  StratAlgorithmInput,
  YearlyStrategy,
  StratOutputData,
  CostByRegion,
  CostByTypology,
  Financing,
  RegionAllocation,
  Typology,
} from '@/types/types';
import { getCostPerRegions, getCostPerTypes } from '@/utils/calculations';
import { currentYear, targetYear, duration } from '@/constants/time';
import { deltaExAnte } from '@/constants/forecasts';
import { carbonToOffset } from '@/constants/user';
import { fiveYearAlgo, noAlgo, yearlyAlgo } from './strategies';

export const runStratAlgorithm = (input: StratAlgorithmInput) => {
  const { timeConstraints, budget, financing, typology, regionAllocation } = input;

  let { nbsRemoval, nbsAvoidance, biochar, dac, renewableEnergy } = typology;
  let [prevNbsRemoval, prevNbsAvoidance, prevBiochar, prevDac, prevRenewableEnergy] = [
    nbsRemoval,
    nbsAvoidance,
    biochar,
    dac,
    renewableEnergy,
  ];

  let notAdjustedBudget = NaN;
  let budget_not_compatible: boolean = false;
  let strategies: YearlyStrategy[] = [];
  let totalBudgetLow: number, totalBudgetMedium: number, totalBudgetHigh: number;

  // initial to current
  nbsRemoval *= carbonToOffset;
  nbsAvoidance *= carbonToOffset;
  biochar *= carbonToOffset;
  dac *= carbonToOffset;
  renewableEnergy *= carbonToOffset;

  let upperBound = budget * 1.03;
  totalBudgetLow = Infinity;
  totalBudgetMedium = Infinity;
  totalBudgetHigh = Infinity;

  while (totalBudgetMedium > upperBound && !budget_not_compatible) {
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
        { nbsRemoval, nbsAvoidance, biochar, dac, renewableEnergy },
        regionAllocation,
      ));
    }

    notAdjustedBudget = totalBudgetMedium;
    if (financing.exAnte > 0) {
      const exAnteCost = totalBudgetMedium * financing.exAnte * deltaExAnte;
      totalBudgetMedium = exAnteCost + totalBudgetMedium * financing.exPost;
    }

    [prevNbsRemoval, prevNbsAvoidance, prevBiochar, prevDac, prevRenewableEnergy] = [
      nbsRemoval,
      nbsAvoidance,
      biochar,
      dac,
      renewableEnergy,
    ];

    // TODO: obvious errors here, but will be deleted anyway
    if (dac > 0) {
      const adjustment = Math.min(0.01 * carbonToOffset, dac);
      dac -= adjustment;
      nbsAvoidance += adjustment;
    } else if (biochar > 0) {
      const adjustment = Math.min(0.01 * carbonToOffset, biochar);
      biochar -= adjustment;
      nbsAvoidance += adjustment;
    } else if (nbsRemoval > 0) {
      const adjustment = Math.min(0.01 * carbonToOffset, nbsRemoval);
      nbsRemoval -= adjustment;
      nbsAvoidance += adjustment;
    } else if (renewableEnergy > 0) {
      const adjustment = Math.min(0.01 * carbonToOffset, renewableEnergy);
      nbsRemoval -= adjustment;
      nbsAvoidance += adjustment;
    } else {
      budget_not_compatible = true;
    }
  }

  [nbsRemoval, nbsAvoidance, biochar, dac, renewableEnergy] = [
    prevNbsRemoval,
    prevNbsAvoidance,
    prevBiochar,
    prevDac,
    prevRenewableEnergy,
  ];

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

  let res: StratOutputData = {
    financing: financingData,
    typologies: typologiesData,
    regions: regionsData,
    otherTypologiesPossible: [], //TODO ??
    carbon_offset: carbonToOffset,
    user_budget: budget,
    money_saving: budget - totalBudgetMedium,
    money_to_add: totalBudgetMedium - budget,
    budget_not_compatible: budget_not_compatible ? 'true' : 'false',
    total_cost_low: totalBudgetLow,
    total_cost_medium: totalBudgetMedium,
    total_cost_high: totalBudgetHigh,
    average_yearly_cost_low: totalBudgetLow / duration,
    average_yearly_cost_medium: totalBudgetMedium / duration,
    average_yearly_cost_high: totalBudgetHigh / duration,
    average_price_per_ton_low: totalBudgetLow / carbonToOffset,
    average_price_per_ton_medium: totalBudgetMedium / carbonToOffset,
    average_price_per_ton_high: totalBudgetHigh / carbonToOffset,
    total_cost_flexible: totalBudgetMedium, //TODO ??
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
    advice_timeline: { change: false },
    advice_financing: { change: false },
    advice_typo: { change: false },
    advice_geography: { change: false },
    strategies: strategies,
  };
  return res;
};
