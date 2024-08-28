import { nbsRemovalExPostMedium, nbsAvoidanceExPostMedium, biocharExPostMedium, dacExPostMedium } from '@/constants/forecasts';
import { nbsRemovalRegion, nbsAvoidanceRegion, biocharRegion, dacRegion } from '@/constants/regions';
import { RegionAllocation, Typology } from '@/types';

export const checkPriceExPost = (
  year: number,
  quantityToOffset: number,
  typology: Typology,
  regionAllocation: RegionAllocation
): [number, number, string[]] => {
  const options = {
    nbsRemoval: [typology.nbsRemoval, nbsRemovalExPostMedium[year as keyof typeof nbsRemovalExPostMedium]],
    nbsAvoidance: [typology.nbsAvoidance, nbsAvoidanceExPostMedium[year as keyof typeof nbsAvoidanceExPostMedium]],
    biochar: [typology.biochar, biocharExPostMedium[year as keyof typeof biocharExPostMedium]],
    dac: [typology.dac, dacExPostMedium[year as keyof typeof dacExPostMedium]],
  };

  const validOptions = Object.entries(options).filter(([_, [availableQuantity]]) => availableQuantity > 0);

  if (validOptions.length === 0) {
    return [0.0, 0.0, ["All sources are depleted"]];
  }

  const sortedOptions = validOptions.sort(([, [, priceA]], [, [, priceB]]) => priceA - priceB);

  let totalQuantityUsed = 0.0;
  let totalCost = 0.0;
  const typesPurchased: string[] = [];

  for (const [typologyKey, [availableQuantity, price]] of sortedOptions) {
    if (totalQuantityUsed >= quantityToOffset) break;

    const quantityToBuy = Math.min(availableQuantity, quantityToOffset - totalQuantityUsed);

    for (const regionKey in regionAllocation) {
      const region = regionKey as keyof RegionAllocation;
      const regionalQuantity = regionAllocation[region] * quantityToBuy;
      if (regionalQuantity > 0) {
        const costForTypology = getRegionFactor(typologyKey, region) * price * regionalQuantity;

        totalQuantityUsed += regionalQuantity;
        totalCost += costForTypology;

        typesPurchased.push(
          `${typologyKey} in ${region}: ${regionalQuantity.toFixed(2)} units at $${price.toFixed(2)} per unit (coefficient: ${getRegionFactor(typologyKey, region)})`
        );

        typology[typologyKey as keyof Typology] -= regionalQuantity;
      }
    }
  }

  return [totalQuantityUsed, totalCost, typesPurchased];
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
