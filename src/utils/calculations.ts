import {
  nbsRemovalExPostMedium,
  nbsAvoidanceExPostMedium,
  biocharExPostMedium,
  dacExPostMedium,
} from '@/constants/forecasts';
import {
  nbsRemovalRegion,
  nbsAvoidanceRegion,
  biocharRegion,
  dacRegion,
} from '@/constants/regions';
import {
  RegionAllocation,
  RegionCosts,
  RegionPurchase,
  YearlyStrategy,
  TypePurchased,
  Typology,
} from '@/types/types';

const mulberry32 = (seed: number) => {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const addNoiseWithSeed = (cost: number, noiseFactor: number, prng: () => number) => {
  const noise = (prng() * noiseFactor * 2 - noiseFactor); // Random noise between -noiseFactor and +noiseFactor
  return cost * (1 + noise);
};

export const checkPriceExPost = (
  year: number,
  quantityToOffset: number,
  typology: Typology,
  regionAllocation: RegionAllocation,
  currentYear: number,
  targetYear: number,
): [number, number, number, number, TypePurchased[]] => {
  const options = {
    nbsRemoval: [
      typology.nbsRemoval,
      nbsRemovalExPostMedium[year as keyof typeof nbsRemovalExPostMedium],
      65 / 163, // low coefficient for nbsRemoval
      261 / 163, // high coefficient for nbsRemoval
    ],
    nbsAvoidance: [
      typology.nbsAvoidance,
      nbsAvoidanceExPostMedium[year as keyof typeof nbsAvoidanceExPostMedium],
      0.5, // low coefficient for nbsAvoidance
      1.5, // high coefficient for nbsAvoidance
    ],
    biochar: [
      typology.biochar,
      biocharExPostMedium[year as keyof typeof biocharExPostMedium],
      1666 / 3055, // low coefficient for biochar
      1.454664484, // high coefficient for biochar
    ],
    dac: [
      typology.dac,
      dacExPostMedium[year as keyof typeof dacExPostMedium],
      2 / 3, // low coefficient for dac
      4 / 3, // high coefficient for dac
    ],
  };

  // Filter out options where available quantity is 0 or less
  const validOptions = Object.entries(options).filter(
    ([_, [availableQuantity]]) => availableQuantity > 0,
  );

  // If no valid options are left, return 'All sources are depleted'
  if (validOptions.length === 0) {
    return [0, 0, 0, 0, []];
  }

  // Sort options by price (ascending)
  const sortedOptions = validOptions.sort(([, [, priceA]], [, [, priceB]]) => priceA - priceB);

  let totalQuantityUsed = 0.0;
  let totalCostLow = 0.0;
  let totalCostMedium = 0.0;
  let totalCostHigh = 0.0;
  const typesPurchased: TypePurchased[] = [];

  // Use year and typology as seed base
  const seed = year + Object.keys(typology).reduce((acc, key) => acc + typology[key as keyof Typology], 0);
  const prng = mulberry32(seed); // Create a PRNG instance with the seed

  // Calculate yearFactor to make noise grow over time
  const yearFactor = (year - currentYear) / (targetYear - currentYear); // Factor to make noise grow over time

  for (const [
    typologyKey,
    [availableQuantity, priceMedium, priceLowCoeff, priceHighCoeff],
  ] of sortedOptions) {
    if (totalQuantityUsed >= quantityToOffset) break;

    const quantityToBuy = Math.min(availableQuantity, quantityToOffset - totalQuantityUsed);

    for (const regionKey in regionAllocation) {
      const region = regionKey as keyof RegionAllocation;
      const regionalQuantity = regionAllocation[region] * quantityToBuy;
      if (regionalQuantity > 0) {
        const coefficient = getRegionFactor(typologyKey, region);

        // Base costs for medium, low, and high scenarios
        const baseCostMedium = coefficient * priceMedium * regionalQuantity;
        const baseCostLow = coefficient * priceMedium * priceLowCoeff * regionalQuantity;
        const baseCostHigh = coefficient * priceMedium * priceHighCoeff * regionalQuantity;

        // Add increasing noise over time to low and high costs
        const noiseFactor = yearFactor * 0.1; // Adjust the 0.1 to control the noise magnitude
        const costForTypologyMedium = baseCostMedium; // Medium remains unaffected
        const costForTypologyLow = addNoiseWithSeed(baseCostLow, noiseFactor, prng);
        const costForTypologyHigh = addNoiseWithSeed(baseCostHigh, noiseFactor, prng);

        totalQuantityUsed += regionalQuantity;
        totalCostMedium += costForTypologyMedium;
        totalCostLow += costForTypologyLow;
        totalCostHigh += costForTypologyHigh;

        let regionPurchase: RegionPurchase = {
          region,
          quantity: regionalQuantity,
          region_factor: coefficient,
          cost: costForTypologyMedium, // Only store medium cost for now
        };

        typesPurchased.push({
          typology: typologyKey,
          quantity: regionalQuantity,
          price_per_ton: priceMedium, // Add price per ton for medium scenario
          regions: [regionPurchase],
        });

        // Deduct the purchased quantity from the available quantity for the typology
        typology[typologyKey as keyof Typology] -= regionalQuantity;
      }
    }
  }

  return [totalQuantityUsed, totalCostLow, totalCostMedium, totalCostHigh, typesPurchased];
};

export const getCostPerTypes = (strategies: YearlyStrategy[]) => {
  let costNbsRemoval = 0;
  let costNbsAvoidance = 0;
  let costBiochar = 0;
  let costDac = 0;

  strategies.forEach((strategy) => {
    strategy.types_purchased.forEach((type) => {
      const totalCostForType = type.regions.reduce((total, region) => total + region.cost, 0);

      if (type.typology === 'nbsRemoval') {
        costNbsRemoval += totalCostForType;
      } else if (type.typology === 'nbsAvoidance') {
        costNbsAvoidance += totalCostForType;
      } else if (type.typology === 'biochar') {
        costBiochar += totalCostForType;
      } else if (type.typology === 'dac') {
        costDac += totalCostForType;
      }
    });
  });

  return {
    costNbsRemoval,
    costNbsAvoidance,
    costBiochar,
    costDac,
  };
};

export const getCostPerRegions = (strategies: YearlyStrategy[]): RegionCosts => {
  let costNorthAmerica = 0;
  let costSouthAmerica = 0;
  let costEurope = 0;
  let costAfrica = 0;
  let costAsia = 0;
  let costOceania = 0;

  strategies.forEach((strategy) => {
    strategy.types_purchased.forEach((type) => {
      type.regions.forEach((regionPurchase) => {
        switch (regionPurchase.region) {
          case 'northAmerica':
            costNorthAmerica += regionPurchase.cost;
            break;
          case 'southAmerica':
            costSouthAmerica += regionPurchase.cost;
            break;
          case 'europe':
            costEurope += regionPurchase.cost;
            break;
          case 'africa':
            costAfrica += regionPurchase.cost;
            break;
          case 'asia':
            costAsia += regionPurchase.cost;
            break;
          case 'oceania':
            costOceania += regionPurchase.cost;
            break;
          default:
            break;
        }
      });
    });
  });

  return {
    northAmerica: costNorthAmerica,
    southAmerica: costSouthAmerica,
    europe: costEurope,
    africa: costAfrica,
    asia: costAsia,
    oceania: costOceania,
  };
};

const getRegionFactor = (typology: string, region: keyof RegionAllocation): number => {
  switch (typology) {
    case 'nbsRemoval':
      return nbsRemovalRegion[region];
    case 'nbsAvoidance':
      return nbsAvoidanceRegion[region];
    case 'biochar':
      return biocharRegion[region];
    case 'dac':
      return dacRegion[region];
    default:
      return 1.0;
  }
};
