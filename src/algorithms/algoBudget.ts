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

export const runAlgorithm = (input: {
  regionAllocation: RegionAllocation;
  typology: Typology;
  financing: Financing;
  timeConstraints: number;
}) => {
  const { regionAllocation, typology, financing, timeConstraints } = input;

  let { nbsRemoval, nbsAvoidance, biochar, dac } = typology;

  nbsRemoval *= carbonToOffset;
  nbsAvoidance *= carbonToOffset;
  biochar *= carbonToOffset;
  dac *= carbonToOffset;

  if (timeConstraints === 1) {
    const [totalBudget, adjustedBudget] = yearlyAlgo(
      timeConstraints,
      carbonToOffset,
      regionAllocation,
      { nbsRemoval, nbsAvoidance, biochar, dac },
      financing,
    );

    return { totalBudget, adjustedBudget };
  } else if (timeConstraints === 5) {
    console.error('TODO: Implement five year algo');
    // return fiveAlgo(regionAllocation, { nbsRemoval, nbsAvoidance, biochar, dac }, financing);
  } else {
    console.error('TODO: Implement no year algo');
    // return noAlgo(regionAllocation, { nbsRemoval, nbsAvoidance, biochar, dac }, financing);
  }
};

export const yearlyAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
  financing: Financing,
): [number, number] => {
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

    i += 1;
  }

  console.log(`Optimal budget: $${totalBudget.toFixed(2)}`);
  for (const step of currentStrategy) {
    console.log(step);
  }

  // Calculate adjusted budget based on ex-ante financing
  let adjustedBudget = totalBudget;
  if (financing.financingExAnte > 0) {
    const exAnteCost = totalBudget * financing.financingExAnte * deltaExAnte;
    adjustedBudget = exAnteCost + totalBudget * financing.financingExPost;
  }

  return [totalBudget, adjustedBudget]; // Returning both
};
