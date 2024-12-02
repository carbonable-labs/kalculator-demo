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
  TypologyPurchaseSummary,
  Typology,
  UserPreferences,
  typologyMapping,
} from '@/types/types';

export const calculateTypologyScores = (preferences: UserPreferences): Typology => {
  const scores: Partial<Typology> = {};

  Object.entries(typologyMapping).forEach(([typology, attributes]) => {
    const score =
      preferences.biodiversity * attributes.biodiversity +
      preferences.durability * attributes.durability +
      preferences.removal * attributes.removal +
      preferences.pricing * attributes.pricing +
      preferences.reputation * attributes.reputation;

    scores[typology as keyof Typology] = score;
  });

  return scores as Typology;
};

export const normalizeScoresToPercentages = (scores: Typology): Typology => {
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);

  return {
    nbsRemoval: (scores.nbsRemoval / total) * 100,
    nbsAvoidance: (scores.nbsAvoidance / total) * 100,
    biochar: (scores.biochar / total) * 100,
    dac: (scores.dac / total) * 100,
    renewableEnergy: (scores.renewableEnergy / total) * 100,
    // blueCarbon: (scores.blue_carbon / total) * 100,
  };
};

export const checkPriceExPost = (
  year: number,
  quantityToOffset: number,
  typology: Typology,
  regionAllocation: RegionAllocation,
): [number, number, number, number, TypologyPurchaseSummary[]] => {
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
    // todo, try to understand and see if it's useful
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
  const typesPurchased: TypologyPurchaseSummary[] = [];

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
        const costForTypologyMedium = coefficient * priceMedium * regionalQuantity;
        const costForTypologyLow = coefficient * priceMedium * priceLowCoeff * regionalQuantity;
        const costForTypologyHigh = coefficient * priceMedium * priceHighCoeff * regionalQuantity;

        totalQuantityUsed += regionalQuantity;
        totalCostMedium += costForTypologyMedium;
        totalCostLow += costForTypologyLow;
        totalCostHigh += costForTypologyHigh;

        let regionPurchase: RegionPurchase = {
          region,
          quantity: regionalQuantity,
          region_factor: coefficient,
          cost: costForTypologyMedium,
        };

        // Check if this typology has already been added to `typesPurchased`
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
  let costRenewableEnergy = 0;

  strategies.forEach((strategy) => {
    strategy.types_purchased.forEach((typeBreakdown) => {
      const { typology, exAnte, exPost } = typeBreakdown;

      // Sum costs from both exAnte and exPost
      const totalCostForType = (exAnte?.cost || 0) + (exPost?.cost || 0);

      switch (typology) {
        case 'nbsRemoval':
          costNbsRemoval += totalCostForType;
          break;
        case 'nbsAvoidance':
          costNbsAvoidance += totalCostForType;
          break;
        case 'biochar':
          costBiochar += totalCostForType;
          break;
        case 'dac':
          costDac += totalCostForType;
          break;
        case 'renewableEnergy':
          costRenewableEnergy += totalCostForType;
          break;
        default:
          break;
      }
    });
  });

  return {
    costNbsRemoval,
    costNbsAvoidance,
    costBiochar,
    costDac,
    costRenewableEnergy,
  };
};


export const getCostPerRegions = (strategies: YearlyStrategy[]) => {
  let costNorthAmerica = 0;
  let costSouthAmerica = 0;
  let costEurope = 0;
  let costAfrica = 0;
  let costAsia = 0;
  let costOceania = 0;

  strategies.forEach((strategy) => {
    strategy.types_purchased.forEach((typeBreakdown) => {
      const { exAnte, exPost } = typeBreakdown;

      [exAnte, exPost].forEach((financingDetails) => {
        if (financingDetails && financingDetails.regions) {
          financingDetails.regions.forEach((regionPurchase) => {
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
