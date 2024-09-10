import { RegionAllocation, Typology, YearlyStrategy } from '@/types/types';
import { checkPriceExPost } from '@/utils/calculations';
import { currentYear, targetYear, duration } from '@/constants/time';

export const yearlyAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
): {
  totalBudgetLow: number;
  totalBudgetMedium: number;
  totalBudgetHigh: number;
  strategies: YearlyStrategy[];
} => {
  const percentageToOffset = timeConstraints / duration;
  let quantityToOffset = Math.ceil(percentageToOffset * carbonToOffset);

  let totalCostLow = 0.0;
  let totalCostMedium = 0.0;
  let totalCostHigh = 0.0;

  let remainingCarbonToOffset = carbonToOffset;
  const currentStrategy: YearlyStrategy[] = [];

  let year = currentYear;
  while (year <= targetYear) {
    if (year === targetYear) {
      quantityToOffset = remainingCarbonToOffset;
    }

    let [quantityUsed, costLow, costMedium, costHigh, typesPurchased] = checkPriceExPost(
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
      const yearlyCostLow = costLow * (remainingCarbonToOffset / quantityUsed);
      const yearlyCostMedium = costMedium * (remainingCarbonToOffset / quantityUsed);
      const yearlyCostHigh = costHigh * (remainingCarbonToOffset / quantityUsed);

      totalCostLow += yearlyCostLow;
      totalCostMedium += yearlyCostMedium;
      totalCostHigh += yearlyCostHigh;

      currentStrategy.push({
        year: year,
        quantity_purchased: remainingCarbonToOffset,
        cost_low: yearlyCostLow,
        cost_medium: yearlyCostMedium,
        cost_high: yearlyCostHigh,
        types_purchased: typesPurchased,
      });

      remainingCarbonToOffset = 0;
      break;
    } else {
      totalCostLow += costLow;
      totalCostMedium += costMedium;
      totalCostHigh += costHigh;

      remainingCarbonToOffset -= quantityUsed;
      currentStrategy.push({
        year: year,
        quantity_purchased: quantityUsed,
        cost_low: costLow,
        cost_medium: costMedium,
        cost_high: costHigh,
        types_purchased: typesPurchased,
      });
    }

    year += 1; // Increment by 1 year
  }

  // Return the structured strategy and total budget
  return {
    totalBudgetLow: totalCostLow,
    totalBudgetMedium: totalCostMedium,
    totalBudgetHigh: totalCostHigh,
    strategies: currentStrategy,
  };
};

export const fiveYearAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
): {
  totalBudgetLow: number;
  totalBudgetMedium: number;
  totalBudgetHigh: number;
  strategies: YearlyStrategy[];
} => {
  const percentageToOffset = timeConstraints / duration;
  let quantityToOffset = Math.ceil(percentageToOffset * carbonToOffset);
  let totalCostLow = 0.0;
  let totalCostMedium = 0.0;
  let totalCostHigh = 0.0;

  let remainingCarbonToOffset = carbonToOffset;
  const currentStrategy: YearlyStrategy[] = [];

  let year = currentYear;
  while (year <= targetYear) {
    if (year === targetYear) {
      quantityToOffset = remainingCarbonToOffset;
    }

    // Get low, medium, and high cost scenarios from `checkPriceExPost`
    let [quantityUsed, costLow, costMedium, costHigh, typesPurchased] = checkPriceExPost(
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
      // Proportional cost for the remaining carbon to offset
      const yearlyCostLow = costLow * (remainingCarbonToOffset / quantityUsed);
      const yearlyCostMedium = costMedium * (remainingCarbonToOffset / quantityUsed);
      const yearlyCostHigh = costHigh * (remainingCarbonToOffset / quantityUsed);

      // Update total costs
      totalCostLow += yearlyCostLow;
      totalCostMedium += yearlyCostMedium;
      totalCostHigh += yearlyCostHigh;

      // Add to the strategy
      currentStrategy.push({
        year,
        quantity_purchased: remainingCarbonToOffset,
        cost_low: yearlyCostLow,
        cost_medium: yearlyCostMedium,
        cost_high: yearlyCostHigh,
        types_purchased: typesPurchased,
      });

      remainingCarbonToOffset = 0;
      break;
    } else {
      // If not all carbon is offset, deduct and continue for next period
      totalCostLow += costLow;
      totalCostMedium += costMedium;
      totalCostHigh += costHigh;

      remainingCarbonToOffset -= quantityUsed;

      // Add to the strategy
      currentStrategy.push({
        year,
        quantity_purchased: quantityUsed,
        cost_low: costLow,
        cost_medium: costMedium,
        cost_high: costHigh,
        types_purchased: typesPurchased,
      });
    }

    year += 5; // Increment by 5 years as this is the five-year algorithm
  }

  return {
    totalBudgetLow: totalCostLow,
    totalBudgetMedium: totalCostMedium,
    totalBudgetHigh: totalCostHigh,
    strategies: currentStrategy,
  };
};

export const noAlgo = (
  currentYear: number,
  targetYear: number,
  carbonToOffset: number,
  typology: Typology,
  regionAllocation: RegionAllocation,
): {
  totalBudgetLow: number;
  totalBudgetMedium: number;
  totalBudgetHigh: number;
  strategies: YearlyStrategy[];
} => {
  let totalBudgetLow = Infinity;
  let totalBudgetMedium = Infinity;
  let totalBudgetHigh = Infinity;
  let bestStrategy: YearlyStrategy[] = [];
  const initialTypology = structuredClone(typology);

  let n = currentYear;
  let totalCostLow = 0.0;
  let totalCostMedium = 0.0;
  let totalCostHigh = 0.0;
  let quantityToOffset = carbonToOffset;

  // First strategy: try to buy all for the first year
  let [quantityUsed, costLow, costMedium, costHigh, typesPurchased] = checkPriceExPost(
    n,
    quantityToOffset,
    typology,
    regionAllocation,
  );

  quantityUsed = Math.ceil(quantityUsed);
  typology = structuredClone(initialTypology); // Reset typology

  if (!typesPurchased.some((type) => type.typology === 'All sources are depleted')) {
    totalCostLow = costLow;
    totalCostMedium = costMedium;
    totalCostHigh = costHigh;

    const currentStrategy: YearlyStrategy[] = [
      {
        year: targetYear,
        quantity_purchased: quantityUsed,
        cost_low: totalCostLow,
        cost_medium: totalCostMedium,
        cost_high: totalCostHigh,
        types_purchased: typesPurchased,
      },
    ];
    if (totalCostMedium < totalBudgetMedium) {
      totalBudgetLow = totalCostLow;
      totalBudgetMedium = totalCostMedium;
      totalBudgetHigh = totalCostHigh;
      bestStrategy = currentStrategy;
    }
  }

  // Second strategy: buy all in the target year (2050)
  [quantityUsed, costLow, costMedium, costHigh, typesPurchased] = checkPriceExPost(
    targetYear,
    quantityToOffset,
    typology,
    regionAllocation,
  );

  quantityUsed = Math.ceil(quantityUsed);
  typology = structuredClone(initialTypology); // Reset typology

  if (!typesPurchased.some((type) => type.typology === 'All sources are depleted')) {
    totalCostLow = costLow;
    totalCostMedium = costMedium;
    totalCostHigh = costHigh;

    const currentStrategy: YearlyStrategy[] = [
      {
        year: targetYear,
        quantity_purchased: quantityUsed,
        cost_low: totalCostLow,
        cost_medium: totalCostMedium,
        cost_high: totalCostHigh,
        types_purchased: typesPurchased,
      },
    ];
    if (totalCostMedium < totalBudgetMedium) {
      totalBudgetLow = totalCostLow;
      totalBudgetMedium = totalCostMedium;
      totalBudgetHigh = totalCostHigh;
      bestStrategy = currentStrategy;
    }
  }

  // Explore other strategies by spreading purchases across different years
  for (n = currentYear; n <= targetYear; n++) {
    for (let y = 1; y <= targetYear - n; y++) {
      totalCostLow = 0.0;
      totalCostMedium = 0.0;
      totalCostHigh = 0.0;
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

        [quantityUsed, costLow, costMedium, costHigh, typesPurchased] = checkPriceExPost(
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
          const yearlyCostLow = costLow * (remainingCarbonToOffset / quantityUsed);
          const yearlyCostMedium = costMedium * (remainingCarbonToOffset / quantityUsed);
          const yearlyCostHigh = costHigh * (remainingCarbonToOffset / quantityUsed);

          totalCostLow += yearlyCostLow;
          totalCostMedium += yearlyCostMedium;
          totalCostHigh += yearlyCostHigh;

          currentStrategy.push({
            year: year,
            quantity_purchased: remainingCarbonToOffset,
            cost_low: yearlyCostLow,
            cost_medium: yearlyCostMedium,
            cost_high: yearlyCostHigh,
            types_purchased: typesPurchased,
          });
          remainingCarbonToOffset = 0;
          break;
        } else {
          totalCostLow += costLow;
          totalCostMedium += costMedium;
          totalCostHigh += costHigh;

          remainingCarbonToOffset -= quantityUsed;

          currentStrategy.push({
            year: year,
            quantity_purchased: quantityUsed,
            cost_low: costLow,
            cost_medium: costMedium,
            cost_high: costHigh,
            types_purchased: typesPurchased,
          });
        }

        year += y;
      }

      if (remainingCarbonToOffset === 0 && totalCostMedium < totalBudgetMedium) {
        totalBudgetLow = totalCostLow;
        totalBudgetMedium = totalCostMedium;
        totalBudgetHigh = totalCostHigh;
        bestStrategy = currentStrategy;
      }
    }
  }

  return { totalBudgetLow, totalBudgetMedium, totalBudgetHigh, strategies: bestStrategy };
};
