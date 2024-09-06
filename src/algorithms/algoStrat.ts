import { RegionAllocation, Typology, Financing } from '@/types';
import { checkPriceExPost } from '@/utils/calculations';
import { currentYear, targetYear, duration } from '@/constants/time';
import {
  nbsRemovalRegion,
  nbsAvoidanceRegion,
  biocharRegion,
  dacRegion,
} from '@/constants/regions';
import {
  nbsRemovalExPostMedium,
  nbsAvoidanceExPostMedium,
  biocharExPostMedium,
  dacExPostMedium,
  deltaExAnte,
} from '@/constants/forecasts';
import { carbonToOffset } from '@/constants/user';

export const runStratAlgorithm = (input: {
  timeConstraints: number;
  budget: number;
  financing: Financing;
  typology: Typology;
  regionAllocation: RegionAllocation;
}) => {
  const { timeConstraints, budget, financing, typology, regionAllocation } = input;

  let { nbsRemoval, nbsAvoidance, biochar, dac } = typology;
  let [prevNbsRemoval, prevNbsAvoidance, prevBiochar, prevDac] = [nbsRemoval, nbsAvoidance, biochar, dac];

  let totalBudget, stratAdjustedBudget;

  // initial to current
  nbsRemoval *= carbonToOffset;
  nbsAvoidance *= carbonToOffset;
  biochar *= carbonToOffset;
  dac *= carbonToOffset;

  let upperBound = budget * 1.03;
  stratAdjustedBudget = Infinity;
  console.log(budget, typeof budget);
  while (stratAdjustedBudget > upperBound) {
    console.log(stratAdjustedBudget);
    if (timeConstraints === 1) {
      totalBudget = yearlyAlgo(
        timeConstraints,
        carbonToOffset,
        regionAllocation,
        { nbsRemoval, nbsAvoidance, biochar, dac },
        financing,
      );
    } else if (timeConstraints === 5) {
      totalBudget = fiveYearAlgo(
        timeConstraints,
        carbonToOffset,
        regionAllocation,
        { nbsRemoval, nbsAvoidance, biochar, dac },
        financing,
      );
    } else {
      totalBudget = noAlgo(
        currentYear,
        targetYear,
        carbonToOffset,
        { nbsRemoval, nbsAvoidance, biochar, dac },
        regionAllocation,
      );
    }

    stratAdjustedBudget = totalBudget;
    if (financing.financingExAnte > 0) {
      const exAnteCost = totalBudget * financing.financingExAnte * deltaExAnte;
      stratAdjustedBudget = exAnteCost + totalBudget * financing.financingExPost;
    }

    [prevNbsRemoval, prevNbsAvoidance, prevBiochar, prevDac] = [nbsRemoval, nbsAvoidance, biochar, dac];

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
      console.error('Insufficient budget. Please increase your budget.');
      return;
    }
  }

  [nbsRemoval, nbsAvoidance, biochar, dac] = [prevNbsRemoval, prevNbsAvoidance, prevBiochar, prevDac];

  // print(f"Nbs Removal: {current_nbs_removal / carbon_to_offset * 100:.2f}%, "
  // f"Nbs Avoidance: {current_nbs_avoidance / carbon_to_offset * 100:.2f}%, "
  // f"Biochar: {current_biochar / carbon_to_offset * 100:.2f}%, "
  // f"DAC: {current_dac / carbon_to_offset * 100:.2f}%")
  // print("For : $", budget_result[1])

  let result = { nbsRemoval, nbsAvoidance, biochar, dac, stratAdjustedBudget, carbonToOffset };
  console.log(result);
  return result;
};

export const yearlyAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
  financing: Financing,
): number => {
  const percentageToOffset = timeConstraints / duration;
  let quantityToOffset = percentageToOffset * carbonToOffset;
  let totalBudget = 0.0;
  let remainingCarbonToOffset = carbonToOffset;
  const currentStrategy: string[] = [];

  let i = currentYear;
  while (i <= targetYear) {
    if (i === targetYear) {
      quantityToOffset = remainingCarbonToOffset;
    }

    const [quantityUsed, cost, typesPurchased] = checkPriceExPost(
      i,
      quantityToOffset,
      typology,
      regionAllocation,
    );

    if (typesPurchased.includes('All sources are depleted')) {
      console.error(`Year ${i}: All sources are depleted. No purchases made.`);
      break;
    }

    if (quantityUsed >= remainingCarbonToOffset) {
      const yearlyCost = cost * (remainingCarbonToOffset / quantityUsed);
      totalBudget += yearlyCost;
      currentStrategy.push(
        `Year ${i}: Buying ${remainingCarbonToOffset.toFixed(2)} units of ${typesPurchased.join(
          ', ',
        )}. Total cost: $${yearlyCost.toFixed(2)}`,
      );
      remainingCarbonToOffset = 0;
      break;
    } else {
      totalBudget += cost;
      remainingCarbonToOffset -= quantityUsed;
      currentStrategy.push(
        `Year ${i}: Buying ${quantityUsed.toFixed(2)} units of ${typesPurchased.join(
          ', ',
        )}. Total cost: $${cost.toFixed(2)}`,
      );
    }

    i += 1;
  }

  for (const step of currentStrategy) {
    console.log(step);
  }

  // Calculate adjusted budget based on ex-ante financing
  let adjustedBudget = totalBudget;
  if (financing.financingExAnte > 0) {
    const exAnteCost = totalBudget * financing.financingExAnte * deltaExAnte;
    adjustedBudget = exAnteCost + totalBudget * financing.financingExPost;
  }

  return totalBudget; // Returning both
};

export const fiveYearAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
  financing: Financing,
): number => {
  const percentageToOffset = timeConstraints / duration;
  let quantityToOffset = percentageToOffset * carbonToOffset;
  let totalBudget = 0.0;
  let remainingCarbonToOffset = carbonToOffset;
  const currentStrategy: string[] = [];

  let i = currentYear;
  while (i <= targetYear) {
    if (i === targetYear) {
      quantityToOffset = remainingCarbonToOffset;
    }

    const [quantityUsed, cost, typesPurchased] = checkPriceExPost(
      i,
      quantityToOffset,
      typology,
      regionAllocation,
    );

    if (typesPurchased.includes('All sources are depleted')) {
      console.log(`Year ${i}: All sources are depleted. No purchases made.`);
      break;
    }

    if (quantityUsed >= remainingCarbonToOffset) {
      const yearlyCost = cost * (remainingCarbonToOffset / quantityUsed);
      totalBudget += yearlyCost;
      currentStrategy.push(
        `Year ${i}: Buying ${remainingCarbonToOffset.toFixed(2)} units of ${typesPurchased.join(
          ', ',
        )}. Total cost: $${yearlyCost.toFixed(2)}`,
      );
      remainingCarbonToOffset = 0;
      break;
    } else {
      totalBudget += cost;
      remainingCarbonToOffset -= quantityUsed;
      currentStrategy.push(
        `Year ${i}: Buying ${quantityUsed.toFixed(2)} units of ${typesPurchased.join(
          ', ',
        )}. Total cost: $${cost.toFixed(2)}`,
      );
    }

    i += 5; // Increment by 5 years as this is the five-year algorithm
  }

  for (const step of currentStrategy) {
    console.log(step);
  }

  // Calculate adjusted budget based on ex-ante financing
  let adjustedBudget = totalBudget;
  if (financing.financingExAnte > 0) {
    const exAnteCost = totalBudget * financing.financingExAnte * deltaExAnte;
    adjustedBudget = exAnteCost + totalBudget * financing.financingExPost;
  }

  return totalBudget;
};

export const noAlgo = (
  currentYear: number,
  targetYear: number,
  carbonToOffset: number,
  typology: Typology,
  regionAllocation: RegionAllocation,
): number => {
  let optimalBudget = Infinity;
  let bestStrategy: string[] = [];
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

  if (!typesPurchased.includes('All sources are depleted')) {
    totalBudget = cost;
    const currentStrategy = [
      `Year ${targetYear}: Buying ${quantityUsed.toFixed(
        2,
      )} units of ${typesPurchased.join(', ')}. Total cost: $${totalBudget.toFixed(2)}`,
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

  if (!typesPurchased.includes('All sources are depleted')) {
    totalBudget = cost;
    const currentStrategy = [
      `Year ${targetYear}: Buying ${quantityUsed.toFixed(
        2,
      )} units of ${typesPurchased.join(', ')}. Total cost: $${totalBudget.toFixed(2)}`,
    ];
    if (totalBudget < optimalBudget) {
      optimalBudget = totalBudget;
      bestStrategy = currentStrategy;
    }
  }

  for (n = currentYear; n <= targetYear; n++) {
    for (let y = 1; y <= targetYear - n; y++) {
      totalBudget = 0.0;
      let i = n;
      let currentStrategy: string[] = [];

      const totalPurchases = Math.floor((targetYear - n) / y) + 1;
      quantityToOffset = carbonToOffset / totalPurchases;

      typology = structuredClone(initialTypology); // Reset typology

      let remainingCarbonToOffset = carbonToOffset;

      while (i <= targetYear) {
        if (i === targetYear) {
          quantityToOffset = remainingCarbonToOffset;
        }

        [quantityUsed, cost, typesPurchased] = checkPriceExPost(
          i,
          quantityToOffset,
          typology,
          regionAllocation,
        );

        if (typesPurchased.includes('All sources are depleted')) {
          console.log(`Year ${i}: All sources are depleted. No purchases made.`);
          break;
        }

        if (quantityUsed >= remainingCarbonToOffset) {
          const yearlyCost = cost * (remainingCarbonToOffset / quantityUsed);
          totalBudget += yearlyCost;
          currentStrategy.push(
            `Year ${i}: Buying ${remainingCarbonToOffset.toFixed(
              2,
            )} units of ${typesPurchased.join(', ')}. Total cost: $${yearlyCost.toFixed(2)}`,
          );
          remainingCarbonToOffset = 0;
          break;
        } else {
          totalBudget += cost;
          remainingCarbonToOffset -= quantityUsed;
          currentStrategy.push(
            `Year ${i}: Buying ${quantityUsed.toFixed(
              2,
            )} units of ${typesPurchased.join(', ')}. Total cost: $${cost.toFixed(2)}`,
          );
        }

        i += y;
      }

      if (remainingCarbonToOffset === 0 && totalBudget < optimalBudget) {
        optimalBudget = totalBudget;
        bestStrategy = currentStrategy;
      }
    }
    break;
  }

  bestStrategy.forEach((step) => console.log(step));

  return optimalBudget;
};


const applyAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
  financing: Financing,) => {
}