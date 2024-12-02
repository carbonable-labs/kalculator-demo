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
