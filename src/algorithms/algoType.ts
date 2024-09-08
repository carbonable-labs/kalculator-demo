import { RegionAllocation, Typology, Financing, TimeConstraint, ProjectConfig } from '@/types';
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

export const runTypoAlgorithm = (input: {
  projectConfig: ProjectConfig[]; // we're not passing the config type but directly the config object
  budget: number;
  regionAllocation: RegionAllocation;
  financing: Financing;
  timeConstraints: TimeConstraint;
}) => {
  const { projectConfig, budget, regionAllocation, financing, timeConstraints } = input;
  console.log('run typo algo');

  for (const config of projectConfig) {
    console.log('config: ', config);
    // Access values from the config object
    const nbsRemoval = config.nbs_removal * carbonToOffset;
    const biochar = config.biochar * carbonToOffset;
    const dac = config.dac * carbonToOffset;
    const nbsAvoidance = config.nbs_avoidance * carbonToOffset;

    console.log('nbsRemoval: ', nbsRemoval);
    console.log('biochar: ', biochar);
    console.log('dac: ', dac);
    console.log('nbsAvoidance: ', nbsAvoidance);
    let adjustedBudget, totalBudget;

    switch (timeConstraints) {
      case TimeConstraint.Yearly:
        totalBudget = yearlyAlgo(timeConstraints, carbonToOffset, regionAllocation, {
          nbsRemoval,
          nbsAvoidance,
          biochar,
          dac,
        });
        break;
      case TimeConstraint.FiveYear:
        totalBudget = fiveYearAlgo(timeConstraints, carbonToOffset, regionAllocation, {
          nbsRemoval,
          nbsAvoidance,
          biochar,
          dac,
        });
        break;
      case TimeConstraint.NoConstraint:
        totalBudget = noAlgo(
          currentYear,
          targetYear,
          carbonToOffset,
          { nbsRemoval, nbsAvoidance, biochar, dac },
          regionAllocation,
        );
        break;
    }

    adjustedBudget = totalBudget;
    if (financing.financingExAnte > 0) {
      const exAnteCost = totalBudget * financing.financingExAnte * deltaExAnte;
      adjustedBudget = exAnteCost + totalBudget * financing.financingExPost;
    }

    // Check if the budget fits
    if (checkBudget(adjustedBudget, budget) === 1) {
      console.log('\nHere are the quantities you need to buy:\n');
      console.log(
        `Configuration used: Nbs Removal: ${config.nbs_removal * 100}%, Nbs Avoidance: ${config.nbs_avoidance * 100}%, Biochar: ${config.biochar * 100}%, DAC: ${config.dac * 100}%`,
      );
      return adjustedBudget;
    }
  }
  console.log('\nBudget too low\n');
  return -1;
};

// Function to check if the adjusted budget is within an acceptable range of the user's budget
function checkBudget(adjustedBudget: number, budget: number): number {
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
    console.log('\nBudget OK');
    console.log('Adjusted budget: ', adjustedBudget);
    console.log('Actual budget: ', budget);
    console.log('Difference in budgets: ', finalDiff);
    return 1; // Return 1 to indicate that the budget is acceptable
  }
  // If the actual budget is greater than the adjusted budget
  else if (adjustedBudget < budget) {
    console.log('\nBudget OK and you can reduce it!');
    console.log('Adjusted budget: ', adjustedBudget);
    console.log('Actual budget: ', budget);
    console.log("Thanks to Carbonable you've saved: ", finalDiff);
    return 1; // Return 1 to indicate that the budget is acceptable with savings
  }
  // If the actual budget is less than the adjusted budget
  else {
    console.log('\nBudget too low\n');
    console.log('Adjusted budget: ', adjustedBudget);
    console.log('Actual budget: ', budget);
    console.log('You must add: ', finalDiff, ' to your budget.');
    return -1; // Return -1 to indicate that the budget is insufficient
  }
}

/// Sub Algorithms

// Calculating the carbon offset purchases year by year
export const yearlyAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
): number => {
  let percentageToOffset = timeConstraints / duration; // % of carbon to offset each year
  let quantityToOffset = percentageToOffset * carbonToOffset; // Quantity of carbon to offset each year
  console.log('quantityToOffset: ', quantityToOffset);

  let totalBudget = 0;
  let remainingCarbonToOffset = carbonToOffset;

  // Store the purchasing strategy for each year
  let currentStrategy = [];

  // Loop through each year
  for (let year = currentYear; year <= targetYear; year++) {
    if (year === targetYear) {
      // Last year
      quantityToOffset = remainingCarbonToOffset;
    }

    const [quantityUsed, cost, typesPurchased] = checkPriceExPost(
      year,
      quantityToOffset,
      typology,
      regionAllocation,
    );
    console.log('year: ', year);
    console.log('quantityUsed: ', quantityUsed);
    console.log('cost: ', cost);
    console.log('typesPurchased: ', typesPurchased);

    if (typesPurchased.includes('All sources are depleted')) {
      console.error(`Year ${year}: All sources are depleted. No purchases made.`);
      break;
    }

    if (quantityUsed >= remainingCarbonToOffset) {
      // Adjust the cost to account for the remaining carbon to offset
      let yearlyCost = cost * (remainingCarbonToOffset / quantityUsed);
      totalBudget += yearlyCost;
      currentStrategy.push(
        `Year ${year}: Buying ${remainingCarbonToOffset.toFixed(2)} units of ${typesPurchased.join(
          ', ',
        )}. Total cost: $${yearlyCost.toFixed(2)}`,
      );

      remainingCarbonToOffset = 0;
      break;
    } else {
      totalBudget += cost;
      remainingCarbonToOffset -= quantityUsed;
      currentStrategy.push(
        `Year ${year}: Buying ${quantityUsed.toFixed(2)} units of ${typesPurchased.join(
          ', ',
        )}. Total cost: $${cost.toFixed(2)}`,
      );
    }
  }

  // for (const step of currentStrategy) {
  //   console.log(step);
  // }
  return totalBudget;
};

// Calculate the carbon offset purchases every 5 years
export const fiveYearAlgo = (
  timeConstraints: number,
  carbonToOffset: number,
  regionAllocation: RegionAllocation,
  typology: Typology,
): number => {
  let percentageToOffset = timeConstraints / duration; // % of carbon to offset each year
  let quantityToOffset = percentageToOffset * carbonToOffset; // Quantity of carbon to offset each year

  let totalBudget = 0;
  let remainingCarbonToOffset = carbonToOffset;

  // Store the purchasing strategy for each year
  let currentStrategy = [];

  // Loop through each year
  for (let year = currentYear; year <= targetYear; year += 5) {
    if (year === targetYear) {
      // Last year
      quantityToOffset = remainingCarbonToOffset;
    }

    const [quantityUsed, cost, typesPurchased] = checkPriceExPost(
      year,
      quantityToOffset,
      typology,
      regionAllocation,
    );

    if (typesPurchased.includes('All sources are depleted')) {
      console.error(`Year ${year}: All sources are depleted. No purchases made.`);
      break;
    }

    if (quantityUsed >= remainingCarbonToOffset) {
      // Adjust the cost to account for the remaining carbon to offset
      let yearlyCost = cost * (remainingCarbonToOffset / quantityUsed);
      totalBudget += yearlyCost;
      currentStrategy.push(
        `Year ${year}: Buying ${remainingCarbonToOffset.toFixed(2)} units of ${typesPurchased.join(
          ', ',
        )}. Total cost: $${yearlyCost.toFixed(2)}`,
      );

      remainingCarbonToOffset = 0;
      break;
    } else {
      totalBudget += cost;
      remainingCarbonToOffset -= quantityUsed;
      currentStrategy.push(
        `Year ${year}: Buying ${quantityUsed.toFixed(2)} units of ${typesPurchased.join(
          ', ',
        )}. Total cost: $${cost.toFixed(2)}`,
      );
    }

    year += 5;
  }

  for (const step of currentStrategy) {
    console.log(step);
  }
  return totalBudget;
};

// Calculate the carbon offset purchases without time constraints
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
