import {
  RegionAllocation,
  Typology,
  Financing,
  StratAlgorithmInput,
  StrategyStep,
  StratOutputData,
  RegionCosts,
  TypologyCosts,
  FinancingData,
  RegionsData,
  TypologiesData,
} from '@/types';
import { checkPriceExPost, getCostPerRegions, getCostPerTypes } from '@/utils/calculations';
import { currentYear, targetYear, duration } from '@/constants/time';
import { deltaExAnte } from '@/constants/forecasts';
import { carbonToOffset } from '@/constants/user';

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
  let strategies: StrategyStep[] = [];

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
      ({ totalBudget, strategies } = noAlgo(
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
    advice_timeline: 'TODO', //TODO ??
    advice_financing: 'TODO', //TODO ??
    advice_typo: 'TODO', //TODO ??
    advice_geography: 'TODO', //TODO ??
    strategies: strategies,
  };
  return res;
};

export const yearlyAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
): { totalBudget: number; strategies: StrategyStep[] } => {
  const percentageToOffset = timeConstraints / duration;
  let quantityToOffset = percentageToOffset * carbonToOffset;
  let totalBudget = 0.0;
  let remainingCarbonToOffset = carbonToOffset;
  const currentStrategy: StrategyStep[] = [];

  let year = currentYear;
  while (year <= targetYear) {
    if (year === targetYear) {
      quantityToOffset = remainingCarbonToOffset;
    }

    const [quantityUsed, cost, typesPurchased] = checkPriceExPost(
      year,
      quantityToOffset,
      typology,
      regionAllocation,
    );

    if (typesPurchased.some((type) => type.typology === 'All sources are depleted')) {
      console.error(`Year ${year}: All sources are depleted. No purchases made.`);
      break;
    }

    if (quantityUsed >= remainingCarbonToOffset) {
      const yearlyCost = cost * (remainingCarbonToOffset / quantityUsed);
      totalBudget += yearlyCost;
      currentStrategy.push({
        year: year,
        quantity_purchased: remainingCarbonToOffset,
        total_cost: yearlyCost,
        types_purchased: typesPurchased,
      });
      remainingCarbonToOffset = 0;
      break;
    } else {
      totalBudget += cost;
      remainingCarbonToOffset -= quantityUsed;
      currentStrategy.push({
        year: year,
        quantity_purchased: quantityUsed,
        total_cost: cost,
        types_purchased: typesPurchased,
      });
    }

    year += 1;
  }

  return { totalBudget, strategies: currentStrategy };
};

export const fiveYearAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
): { totalBudget: number; strategies: StrategyStep[] } => {
  const percentageToOffset = timeConstraints / duration;
  let quantityToOffset = percentageToOffset * carbonToOffset;
  let totalBudget = 0.0;
  let remainingCarbonToOffset = carbonToOffset;
  const currentStrategy: StrategyStep[] = [];

  let year = currentYear;
  while (year <= targetYear) {
    if (year === targetYear) {
      quantityToOffset = remainingCarbonToOffset;
    }

    const [quantityUsed, cost, typesPurchased] = checkPriceExPost(
      year,
      quantityToOffset,
      typology,
      regionAllocation,
    );

    if (typesPurchased.some((type) => type.typology === 'All sources are depleted')) {
      break; // Exit if all sources are depleted
    }

    if (quantityUsed >= remainingCarbonToOffset) {
      const yearlyCost = cost * (remainingCarbonToOffset / quantityUsed);
      totalBudget += yearlyCost;

      currentStrategy.push({
        year,
        quantity_purchased: remainingCarbonToOffset,
        total_cost: yearlyCost,
        types_purchased: typesPurchased,
      });

      remainingCarbonToOffset = 0;
      break;
    } else {
      totalBudget += cost;
      remainingCarbonToOffset -= quantityUsed;
      currentStrategy.push({
        year,
        quantity_purchased: quantityUsed,
        total_cost: cost,
        types_purchased: typesPurchased,
      });
    }

    year += 5; // Increment by 5 years as this is the five-year algorithm
  }

  return { totalBudget, strategies: currentStrategy };
};

export const noAlgo = (
  currentYear: number,
  targetYear: number,
  carbonToOffset: number,
  typology: Typology,
  regionAllocation: RegionAllocation,
): { totalBudget: number; strategies: StrategyStep[] } => {
  let optimalBudget = Infinity;
  let bestStrategy: StrategyStep[] = [];
  const initialTypology = structuredClone(typology);

  let n = currentYear;

  // Check for 2050
  let totalBudget = 0.0;
  let quantityToOffset = carbonToOffset;

  // Try to buy all for first year
  let [quantityUsed, cost, typesPurchased] = checkPriceExPost(
    n,
    quantityToOffset,
    typology,
    regionAllocation,
  );

  typology = structuredClone(initialTypology); // Reset typology

  if (!typesPurchased.some((type) => type.typology === 'All sources are depleted')) {
    totalBudget = cost;
    const currentStrategy: StrategyStep[] = [
      {
        year: targetYear,
        quantity_purchased: quantityUsed,
        total_cost: totalBudget,
        types_purchased: typesPurchased,
      },
    ];
    if (totalBudget < optimalBudget) {
      optimalBudget = totalBudget;
      bestStrategy = currentStrategy;
    }
  }

  // Try to buy all in 2050
  [quantityUsed, cost, typesPurchased] = checkPriceExPost(
    targetYear,
    quantityToOffset,
    typology,
    regionAllocation,
  );

  typology = structuredClone(initialTypology); // Reset typology

  if (!typesPurchased.some((type) => type.typology === 'All sources are depleted')) {
    totalBudget = cost;
    const currentStrategy: StrategyStep[] = [
      {
        year: targetYear,
        quantity_purchased: quantityUsed,
        total_cost: totalBudget,
        types_purchased: typesPurchased,
      },
    ];
    if (totalBudget < optimalBudget) {
      optimalBudget = totalBudget;
      bestStrategy = currentStrategy;
    }
  }

  for (n = currentYear; n <= targetYear; n++) {
    for (let y = 1; y <= targetYear - n; y++) {
      totalBudget = 0.0;
      let year = n;
      let currentStrategy: StrategyStep[] = [];

      const totalPurchases = Math.floor((targetYear - n) / y) + 1;
      quantityToOffset = carbonToOffset / totalPurchases;

      typology = structuredClone(initialTypology); // Reset typology

      let remainingCarbonToOffset = carbonToOffset;

      while (year <= targetYear) {
        if (year === targetYear) {
          quantityToOffset = remainingCarbonToOffset;
        }

        [quantityUsed, cost, typesPurchased] = checkPriceExPost(
          year,
          quantityToOffset,
          typology,
          regionAllocation,
        );

        if (typesPurchased.some((type) => type.typology === 'All sources are depleted')) {
          break;
        }

        if (quantityUsed >= remainingCarbonToOffset) {
          const yearlyCost = cost * (remainingCarbonToOffset / quantityUsed);
          totalBudget += yearlyCost;
          currentStrategy.push({
            year: year,
            quantity_purchased: remainingCarbonToOffset,
            total_cost: yearlyCost,
            types_purchased: typesPurchased,
          });
          remainingCarbonToOffset = 0;
          break;
        } else {
          totalBudget += cost;
          remainingCarbonToOffset -= quantityUsed;
          currentStrategy.push({
            year: year,
            quantity_purchased: quantityUsed,
            total_cost: cost,
            types_purchased: typesPurchased,
          });
        }

        year += y;
      }

      if (remainingCarbonToOffset === 0 && totalBudget < optimalBudget) {
        optimalBudget = totalBudget;
        bestStrategy = currentStrategy;
      }
    }
    break;
  }

  return { totalBudget, strategies: bestStrategy };
};
