import {
  RegionAllocation,
  RegionPurchase,
  YearlyStrategy,
  TypologyPurchaseSummary,
  Typology,
  UserPreferences,
  typologyMapping,
  CostByYearAndTypology,
  CostByYearAndRegion,
  CostByYearAndFinancing,
} from '@/types/types';

export const getTotalCostPerTypes = (strategies: YearlyStrategy[]) => {
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

export const getTotalCostPerRegions = (strategies: YearlyStrategy[]) => {
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

export const calculateTotalQuantitiesRegionAllocation = (
  strategies: YearlyStrategy[],
): RegionAllocation => {
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

export function normalizeRegionAllocation(allocation: RegionAllocation): RegionAllocation {
  const total = Object.values(allocation).reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return {
      northAmerica: 0,
      southAmerica: 0,
      europe: 0,
      africa: 0,
      asia: 0,
      oceania: 0,
    };
  }

  const keys = Object.keys(allocation) as (keyof RegionAllocation)[];
  const normalized: RegionAllocation = {} as RegionAllocation;
  let cumulativePercentage = 0;
  let maxKey: keyof RegionAllocation = keys[0];
  let maxValue = allocation[maxKey];

  keys.forEach((key) => {
    const percentage = allocation[key] / total;
    const rounded = Math.round(percentage * 100) / 100;
    normalized[key] = rounded;
    cumulativePercentage += rounded;
    if (allocation[key] > maxValue) {
      maxValue = allocation[key];
      maxKey = key;
    }
  });

  normalized[maxKey] += Math.round((1 - cumulativePercentage) * 100) / 100;
  return normalized;
}

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
function filterByMaxRequirements(
  typologies: Record<string, UserPreferences>,
  prefs: UserPreferences,
): Record<string, UserPreferences> {
  let filtered = { ...typologies };

  const criteria: (keyof UserPreferences)[] = [
    'biodiversity',
    'durability',
    'removal',
    'pricing',
    'reputation',
  ];

  for (const c of criteria) {
    const userVal = prefs[c];
    if (c === 'removal' && userVal === 0) {
      continue;
    }

    if (c === 'removal') {
      if (userVal === 5) {
        filtered = Object.fromEntries(Object.entries(filtered).filter(([_, val]) => val[c] === 5));
      } else if (userVal === 1) {
        filtered = Object.fromEntries(Object.entries(filtered).filter(([_, val]) => val[c] === 1));
      }
    } else if (userVal === 4) {
      filtered = Object.fromEntries(Object.entries(filtered).filter(([_, val]) => val[c] > 1));
    } else if (userVal === 5) {
      filtered = Object.fromEntries(Object.entries(filtered).filter(([_, val]) => val[c] > 2));
    }
  }

  return filtered;
}

function computeScore(attributes: UserPreferences, prefs: UserPreferences): number {
  const factors: (keyof UserPreferences)[] = [
    'biodiversity',
    'durability',
    'removal',
    'pricing',
    'reputation',
  ];

  let score = 0;

  for (const f of factors) {
    const pref = prefs[f];
    if (f === 'removal') {
      if (pref === 5 && attributes[f] === 5) {
        score += 15;
      } else if (pref === 1 && attributes[f] === 1) {
        score += 15;
      } else if (pref === 4 && attributes[f] >= 3) {
        score += 10;
      } else if (pref === 2 && attributes[f] <= 3) {
        score += 10;
      } else {
        const distance = Math.abs(pref - attributes[f]);
        score += 5 - distance;
      }
    } else {
      score += attributes[f] * pref;
    }
  }

  return score;
}

function getWeightedDistribution(scores: [string, number][]): Record<string, number> {
  scores.sort((a, b) => b[1] - a[1]);

  const nbToSelect = Math.min(scores.length, 4);
  let selected = scores.slice(0, nbToSelect);

  if (selected.length > 3) {
    selected = selected.slice(0, 3);
  }

  if (selected.length === 0 && scores.length > 0) {
    selected = [scores[0]];
  }

  const squaredScores = selected.map(([k, v]) => [k, Math.pow(v, 2)]) as [string, number][];

  const sum = squaredScores.reduce((acc, [_, v]) => acc + v, 0);
  const distribution: Record<string, number> = {};
  for (const [key, val] of squaredScores) {
    distribution[key] = sum > 0 ? val / sum : 0;
  }

  if (Object.keys(distribution).length < 4 && scores.length > Object.keys(distribution).length) {
    for (const [k] of scores) {
      if (!(k in distribution)) {
        distribution[k] = 0;
        break;
      }
    }
  }

  return distribution;
}

export function computeFinalDistribution(prefs: UserPreferences): Typology | null {
  const filteredTypologies = filterByMaxRequirements(typologyMapping, prefs);
  const scored = Object.entries(filteredTypologies).map(([name, attrs]) => {
    return [name, computeScore(attrs, prefs)] as [string, number];
  });
  if (scored.length === 0) {
    return null; // no result possible found
  }

  const distribution = getWeightedDistribution(scored);

  let roundedDistribution: Record<string, number> = {};
  let total = 0;
  let maxKey: string | null = null;
  let maxValue = -Infinity;

  Object.entries(distribution).forEach(([key, value]) => {
    const roundedValue = Math.round(value * 100) / 100;
    roundedDistribution[key] = roundedValue;
    total += roundedValue;
    if (value > maxValue) {
      maxValue = value;
      maxKey = key;
    }
  });

  if (maxKey !== null) {
    roundedDistribution[maxKey] += Math.round((1 - total) * 100) / 100;
  }

  return {
    nbsRemoval: roundedDistribution.nbsRemoval || 0,
    nbsAvoidance: roundedDistribution.nbsAvoidance || 0,
    biochar: roundedDistribution.biochar || 0,
    dac: roundedDistribution.dac || 0,
    renewableEnergy: roundedDistribution.renewableEnergy || 0,
  };
}

export function calculateCostsByYearAndTypology(
  strategies: YearlyStrategy[],
): CostByYearAndTypology {
  const costsByYearAndTypology: CostByYearAndTypology = {};

  strategies.forEach((strategy) => {
    const year = strategy.year;

    if (!costsByYearAndTypology[year]) {
      costsByYearAndTypology[year] = {};
    }

    strategy.types_purchased.forEach((typeBreakdown) => {
      const { typology, exAnte, exPost } = typeBreakdown;

      const totalCost = (exAnte?.cost || 0) + (exPost?.cost || 0);
      costsByYearAndTypology[year][typology] =
        (costsByYearAndTypology[year][typology] || 0) + totalCost;
    });
  });

  return costsByYearAndTypology;
}

export function calculateCostsByYearAndRegion(strategies: YearlyStrategy[]): CostByYearAndRegion {
  const costsByYearAndRegion: CostByYearAndRegion = {};

  strategies.forEach((strategy) => {
    const year = strategy.year;

    if (!costsByYearAndRegion[year]) {
      costsByYearAndRegion[year] = {};
    }

    strategy.types_purchased.forEach((typeBreakdown) => {
      const { exAnte, exPost } = typeBreakdown;

      [exAnte, exPost].forEach((financingDetails) => {
        if (financingDetails?.regions) {
          financingDetails.regions.forEach((regionPurchase) => {
            const { region, cost } = regionPurchase;

            costsByYearAndRegion[year][region] = (costsByYearAndRegion[year][region] || 0) + cost;
          });
        }
      });
    });
  });

  return costsByYearAndRegion;
}

export function calculateCostsByYearAndFinancing(
  strategies: YearlyStrategy[],
): CostByYearAndFinancing {
  const costsByYearAndFinancing: CostByYearAndFinancing = {};

  strategies.forEach((strategy) => {
    const year = strategy.year;

    if (!costsByYearAndFinancing[year]) {
      costsByYearAndFinancing[year] = { exAnte: 0, exPost: 0 };
    }

    strategy.types_purchased.forEach((typeBreakdown) => {
      const { exAnte, exPost } = typeBreakdown;

      if (exAnte) {
        costsByYearAndFinancing[year].exAnte += exAnte.cost || 0;
      }

      if (exPost) {
        costsByYearAndFinancing[year].exPost += exPost.cost || 0;
      }
    });
  });

  return costsByYearAndFinancing;
}
