import {
  RegionAllocation,
  Typology,
  YearlyStrategy,
} from '@/types/types';
import { checkPriceExPost } from '@/utils/calculations';
import { currentYear, targetYear, duration } from '@/constants/time';


export const yearlyAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
): { totalBudget: number; strategies: YearlyStrategy[] } => {
  const percentageToOffset = timeConstraints / duration;
  let quantityToOffset = Math.ceil(percentageToOffset * carbonToOffset);
  let totalBudget = 0.0;
  let remainingCarbonToOffset = carbonToOffset;
  const currentStrategy: YearlyStrategy[] = [];

  let year = currentYear;
  while (year <= targetYear) {
    if (year === targetYear) {
      quantityToOffset = remainingCarbonToOffset;
    }

    let [quantityUsed, cost, typesPurchased] = checkPriceExPost(
      year,
      quantityToOffset,
      typology,
      regionAllocation,
    );

    quantityUsed = Math.ceil(quantityUsed);
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
        cost_low: yearlyCost,
        cost_medium: yearlyCost,
        cost_high: yearlyCost,
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
        cost_low: cost,
        cost_medium: cost,
        cost_high: cost,
        types_purchased: typesPurchased,
      });
    }

    year += 1; // Increment by 1 year
  }

  // Return the structured strategy and total budget
  return { totalBudget, strategies: currentStrategy };
};

export const fiveYearAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
): { totalBudget: number; strategies: YearlyStrategy[] } => {
  const percentageToOffset = timeConstraints / duration;
  let quantityToOffset = Math.ceil(percentageToOffset * carbonToOffset);
  let totalBudget = 0.0;
  let remainingCarbonToOffset = carbonToOffset;
  const currentStrategy: YearlyStrategy[] = [];

  let year = currentYear;
  while (year <= targetYear) {
    if (year === targetYear) {
      quantityToOffset = remainingCarbonToOffset;
    }

    let [quantityUsed, cost, typesPurchased] = checkPriceExPost(
      year,
      quantityToOffset,
      typology,
      regionAllocation,
    );

    quantityUsed = Math.ceil(quantityUsed);
    if (typesPurchased.some((type) => type.typology === 'All sources are depleted')) {
      break; // Exit if all sources are depleted
    }

    if (quantityUsed >= remainingCarbonToOffset) {
      const yearlyCost = cost * (remainingCarbonToOffset / quantityUsed);
      totalBudget += yearlyCost;

      currentStrategy.push({
        year,
        quantity_purchased: remainingCarbonToOffset,
        cost_low: yearlyCost,
        cost_medium: yearlyCost,
        cost_high: yearlyCost,
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
        cost_low: cost,
        cost_medium: cost,
        cost_high: cost,
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
): { optimalBudget: number; bestStrategy: YearlyStrategy[] } => {
  let optimalBudget = Infinity;
  let bestStrategy: YearlyStrategy[] = [];
  const initialTypology = structuredClone(typology);

  let n = currentYear;

  let totalBudget = 0.0;
  let quantityToOffset = carbonToOffset;

  // First strategy: try to buy all for the first year
  let [quantityUsed, cost, typesPurchased] = checkPriceExPost(
    n,
    quantityToOffset,
    typology,
    regionAllocation,
  );

  quantityUsed = Math.ceil(quantityUsed);
  typology = structuredClone(initialTypology); // Reset typology

  if (!typesPurchased.some((type) => type.typology === 'All sources are depleted')) {
    totalBudget = cost;
    const currentStrategy: YearlyStrategy[] = [
      {
        year: targetYear,
        quantity_purchased: quantityUsed,
        cost_low: totalBudget,
        cost_medium: totalBudget,
        cost_high: totalBudget,
        types_purchased: typesPurchased,
      },
    ];
    if (totalBudget < optimalBudget) {
      optimalBudget = totalBudget;
      bestStrategy = currentStrategy;
    }
  }

  // Second strategy: buy all in the target year (2050)
  [quantityUsed, cost, typesPurchased] = checkPriceExPost(
    targetYear,
    quantityToOffset,
    typology,
    regionAllocation,
  );

  quantityUsed = Math.ceil(quantityUsed);
  typology = structuredClone(initialTypology); // Reset typology

  if (!typesPurchased.some((type) => type.typology === 'All sources are depleted')) {
    totalBudget = cost;
    const currentStrategy: YearlyStrategy[] = [
      {
        year: targetYear,
        quantity_purchased: quantityUsed,
        cost_low: totalBudget,
        cost_medium: totalBudget,
        cost_high: totalBudget,
        types_purchased: typesPurchased,
      },
    ];
    if (totalBudget < optimalBudget) {
      optimalBudget = totalBudget;
      bestStrategy = currentStrategy;
    }
  }

  // Explore other strategies by spreading purchases across different years
  for (n = currentYear; n <= targetYear; n++) {
    for (let y = 1; y <= targetYear - n; y++) {
      totalBudget = 0.0;
      let year = n;
      let currentStrategy: YearlyStrategy[] = [];

      const totalPurchases = Math.floor((targetYear - n) / y) + 1;
      quantityToOffset = Math.ceil(carbonToOffset / totalPurchases);

      typology = structuredClone(initialTypology); // Reset typology
      let remainingCarbonToOffset = carbonToOffset;

      // Spread purchases over the years
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

        quantityUsed = Math.ceil(quantityUsed);
        if (typesPurchased.some((type) => type.typology === 'All sources are depleted')) {
          break;
        }

        if (quantityUsed >= remainingCarbonToOffset) {
          const yearlyCost = cost * (remainingCarbonToOffset / quantityUsed);
          totalBudget += yearlyCost;
          currentStrategy.push({
            year: year,
            quantity_purchased: remainingCarbonToOffset,
            cost_low: yearlyCost,
            cost_medium: yearlyCost,
            cost_high: yearlyCost,
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
            cost_low: cost,
            cost_medium: cost,
            cost_high: cost,
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
  }

  return { optimalBudget, bestStrategy };
};
