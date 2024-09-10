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

export const checkPriceExPost = (
  year: number,
  quantityToOffset: number,
  typology: Typology,
  regionAllocation: RegionAllocation,
): [number, number, TypePurchased[]] => {
  const options = {
    nbsRemoval: [
      typology.nbsRemoval,
      nbsRemovalExPostMedium[year as keyof typeof nbsRemovalExPostMedium],
    ],
    nbsAvoidance: [
      typology.nbsAvoidance,
      nbsAvoidanceExPostMedium[year as keyof typeof nbsAvoidanceExPostMedium],
    ],
    biochar: [typology.biochar, biocharExPostMedium[year as keyof typeof biocharExPostMedium]],
    dac: [typology.dac, dacExPostMedium[year as keyof typeof dacExPostMedium]],
  };

  // Filter out options where available quantity is 0 or less
  const validOptions = Object.entries(options).filter(
    ([_, [availableQuantity]]) => availableQuantity > 0,
  );

  // If no valid options are left, return 'All sources are depleted'
  if (validOptions.length === 0) {
    return [0, 0, []];
  }

  // Sort options by price (ascending)
  const sortedOptions = validOptions.sort(([, [, priceA]], [, [, priceB]]) => priceA - priceB);

  let totalQuantityUsed = 0;
  let totalCost = 0.0;
  const typesPurchased: TypePurchased[] = [];

  for (const [typologyKey, [availableQuantity, price]] of sortedOptions) {
    if (totalQuantityUsed >= quantityToOffset) break;

    const quantityToBuy = Math.min(availableQuantity, quantityToOffset - totalQuantityUsed);

    for (const regionKey in regionAllocation) {
      const region = regionKey as keyof RegionAllocation;
      const regionalQuantity = regionAllocation[region] * quantityToBuy;
      if (regionalQuantity > 0) {
        const coefficient = getRegionFactor(typologyKey, region);
        const costForTypology = coefficient * price * regionalQuantity;

        totalQuantityUsed += regionalQuantity;
        totalCost += costForTypology;

        let regionPurchase: RegionPurchase = {
          region,
          quantity: regionalQuantity,
          region_factor: coefficient,
          cost: costForTypology,
        };

        typesPurchased.push({
          typology: typologyKey,
          quantity: regionalQuantity,
          price_per_ton: price,
          regions: [regionPurchase],
        });

        // Deduct the purchased quantity from the available quantity for the typology
        typology[typologyKey as keyof Typology] -= regionalQuantity;
      }
    }
  }

  return [totalQuantityUsed, totalCost, typesPurchased];
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
