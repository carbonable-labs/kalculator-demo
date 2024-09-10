import {
  RegionAllocation,
  Typology,
  Financing,
  StratAlgorithmInput,
  YearlyStrategy,
  StratOutputData,
  RegionCosts,
  TypologyCosts,
  FinancingData,
  RegionsData,
  TypologiesData,
} from '@/types/types';
import { checkPriceExPost, getCostPerRegions, getCostPerTypes } from '@/utils/calculations';
import { currentYear, targetYear, duration } from '@/constants/time';
import { deltaExAnte } from '@/constants/forecasts';
import { carbonToOffset } from '@/constants/user';
import { Advice, advice_financing, advice_geography, advice_timeline, advice_typo } from './advice';
import { fiveYearAlgo, noAlgo, yearlyAlgo } from './strategies';

export const runStratAlgorithm = (input: StratAlgorithmInput) => {
  const { timeConstraints, budget, financing, typology, regionAllocation } = input;

  let { nbsRemoval, nbsAvoidance, biochar, dac } = typology;
  let [prevNbsRemoval, prevNbsAvoidance, prevBiochar, prevDac] = [
    nbsRemoval,
    nbsAvoidance,
    biochar,
    dac,
  ];

  let totalBudget = NaN;
  let adjustedBudget: number;
  let budget_not_compatible: string = 'false'; //TODO: use boolean instead of string
  let strategies: YearlyStrategy[] = [];

  // initial to current
  nbsRemoval *= carbonToOffset;
  nbsAvoidance *= carbonToOffset;
  biochar *= carbonToOffset;
  dac *= carbonToOffset;

  let upperBound = budget * 1.03;
  adjustedBudget = Infinity;

  while (adjustedBudget > upperBound) {
    if (timeConstraints === 1) {
      ({ totalBudget, strategies } = yearlyAlgo(timeConstraints, carbonToOffset, regionAllocation, {
        nbsRemoval,
        nbsAvoidance,
        biochar,
        dac,
      }));
    } else if (timeConstraints === 5) {
      ({ totalBudget, strategies } = fiveYearAlgo(
        timeConstraints,
        carbonToOffset,
        regionAllocation,
        { nbsRemoval, nbsAvoidance, biochar, dac },
      ));
    } else {
      ({ optimalBudget: totalBudget, bestStrategy: strategies } = noAlgo(
        currentYear,
        targetYear,
        carbonToOffset,
        { nbsRemoval, nbsAvoidance, biochar, dac },
        regionAllocation,
      ));
    }

    adjustedBudget = totalBudget;
    if (financing.financingExAnte > 0) {
      const exAnteCost = totalBudget * financing.financingExAnte * deltaExAnte;
      adjustedBudget = exAnteCost + totalBudget * financing.financingExPost;
    }

    [prevNbsRemoval, prevNbsAvoidance, prevBiochar, prevDac] = [
      nbsRemoval,
      nbsAvoidance,
      biochar,
      dac,
    ];

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
    } else {
      budget_not_compatible = 'true';
    }
  }

  [nbsRemoval, nbsAvoidance, biochar, dac] = [
    prevNbsRemoval,
    prevNbsAvoidance,
    prevBiochar,
    prevDac,
  ];

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
  let adv_typo: Advice = advice_typo(typology, typologyCosts);
  let adv_geography: Advice = advice_geography(regionAllocation, regionCosts);

  let res: StratOutputData = {
    financing: financingData,
    typologies: typologiesData,
    regions: regionsData,
    otherTypologiesPossible: [], //TODO ??
    carbon_offset: carbonToOffset,
    user_budget: budget,
    money_saving: 0, //TODO ??
    money_to_add: 0, //TODO ??
    budget_not_compatible: budget_not_compatible,
    total_cost_low: totalBudget,
    total_cost_medium: totalBudget,
    total_cost_high: totalBudget,
    average_yearly_cost_low: totalBudget / duration,
    average_yearly_cost_medium: totalBudget / duration,
    average_yearly_cost_high: totalBudget / duration,
    average_price_per_ton_low: totalBudget / carbonToOffset,
    average_price_per_ton_medium: totalBudget / carbonToOffset,
    average_price_per_ton_high: totalBudget / carbonToOffset,
    total_cost_flexible: totalBudget, //TODO ??
    cost_ex_post: totalBudget * financing.financingExPost,
    cost_ex_ante: totalBudget * financing.financingExAnte,
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
