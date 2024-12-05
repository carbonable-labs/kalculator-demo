import {
  RegionAllocation,
  RegionPurchase,
  YearlyStrategy,
  TypologyPurchaseSummary,
  Typology,
  UserPreferences,
  typologyMapping,
} from '@/types/types';

export const getCostPerTypes = (strategies: YearlyStrategy[]) => {
  let costNbsRemoval = 0;
  let costNbsAvoidance = 0;
  let costBiochar = 0;
  let costDac = 0;
  let costRenewableEnergy = 0;

  strategies.forEach((strategy) => {
    strategy.types_purchased.forEach((typeBreakdown) => {
      const { typology, exAnte, exPost } = typeBreakdown;

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

export const calculateTotalQuantitiesRegionAllocation = (strategies: YearlyStrategy[]): RegionAllocation => {
  let quantityNorthAmerica = 0;
  let quantitySouthAmerica = 0;
  let quantityEurope = 0;
  let quantityAfrica = 0;
  let quantityAsia = 0;
  let quantityOceania = 0;

  strategies.forEach((strategy) => {
    strategy.types_purchased.forEach((typeBreakdown) => {
      const { exAnte, exPost } = typeBreakdown;

      [exAnte, exPost].forEach((financingDetails) => {
        if (financingDetails && financingDetails.regions) {
          financingDetails.regions.forEach((regionPurchase) => {
            switch (regionPurchase.region) {
              case 'northAmerica':
                quantityNorthAmerica += regionPurchase.quantity;
                break;
              case 'southAmerica':
                quantitySouthAmerica += regionPurchase.quantity;
                break;
              case 'europe':
                quantityEurope += regionPurchase.quantity;
                break;
              case 'africa':
                quantityAfrica += regionPurchase.quantity;
                break;
              case 'asia':
                quantityAsia += regionPurchase.quantity;
                break;
              case 'oceania':
                quantityOceania += regionPurchase.quantity;
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
    northAmerica: quantityNorthAmerica,
    southAmerica: quantitySouthAmerica,
    europe: quantityEurope,
    africa: quantityAfrica,
    asia: quantityAsia,
    oceania: quantityOceania,
  };
};

export function calculateTotalQuantitiesFinancing(strategies: YearlyStrategy[]): {
  totalExAnte: number;
  totalExPost: number;
} {
  let totalExAnte = 0;
  let totalExPost = 0;

  strategies.forEach((strategy) => {
    strategy.types_purchased.forEach((typeBreakdown) => {
      totalExAnte += typeBreakdown.exAnte.quantity;
      totalExPost += typeBreakdown.exPost.quantity;
    });
  });

  return { totalExAnte, totalExPost };
}

export function calculateTotalCostsFinancing(strategies: YearlyStrategy[]): {
  totalCostExAnte: number;
  totalCostExPost: number;
} {
  let totalCostExAnte = 0;
  let totalCostExPost = 0;

  strategies.forEach((strategy) => {
    strategy.types_purchased.forEach((typeBreakdown) => {
      totalCostExAnte += typeBreakdown.exAnte.cost;
      totalCostExPost += typeBreakdown.exPost.cost;
    });
  });

  return { totalCostExAnte, totalCostExPost };
}

export function assertTypologySum(typology: Typology): void {
  const total = Object.values(typology).reduce((sum, value) => sum + value, 0);
  if (Math.abs(total - 1) > 1e-6) {
    throw new Error(`Sum of typology repartition should be exactly 1, and not: ${total}`);
  }
}

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

// Should be exactly 1
export const normalizeScoresToPercentages = (scores: Typology): Typology => {
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return {
      nbsRemoval: 0,
      nbsAvoidance: 0,
      biochar: 0,
      dac: 0,
      renewableEnergy: 0,
    };
  }

  let normalized: Typology = {
    nbsRemoval: Math.round((scores.nbsRemoval / total) * 100) / 100,
    nbsAvoidance: Math.round((scores.nbsAvoidance / total) * 100) / 100,
    biochar: Math.round((scores.biochar / total) * 100) / 100,
    dac: Math.round((scores.dac / total) * 100) / 100,
    renewableEnergy: Math.round((scores.renewableEnergy / total) * 100) / 100,
  };

  const correctedTotal = Object.values(normalized).reduce((sum, value) => sum + value, 0);
  const difference = 1 - correctedTotal;

  const maxKey = Object.keys(normalized).reduce((maxKey, key) =>
    normalized[key as keyof Typology] > normalized[maxKey as keyof Typology] ? key : maxKey,
  ) as keyof Typology;

  normalized[maxKey] = Math.round((normalized[maxKey] + difference) * 100) / 100;

  return normalized;
};
