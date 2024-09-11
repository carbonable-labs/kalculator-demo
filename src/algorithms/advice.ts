import {
  RegionAllocation,
  Typology,
  Financing,
  TimeConstraint,
  TypologyCosts,
  RegionCosts,
} from '@/types/types';

export interface Advice {
  change: boolean;
  advice: string;
}

// export interface AdviceFinancing {
//     financingExPost: number;
//     financingExAnte: number;
//     advice_phrase: string;
// }

// advice_financing: string;
export const advice_financing = (financing: Financing): Advice => {
  if (financing.financingExPost > 0.5) {
    return {
      change: true,
      advice: 'You should consider reducing ex-post financing.',
      // advice: {
      //     financingExPost: financing.financingExPost - 0.1,
      //     financingExAnte: financing.financingExAnte + 0.1,
      //     advice_phrase: "You should consider reducing ex-post financing."
      // }
    };
  }

  return { change: false, advice: '' };
};

// advice_timeline: string;
export const advice_timeline = (timeConstraints: TimeConstraint): Advice => {
  if (timeConstraints === TimeConstraint.Yearly || timeConstraints === TimeConstraint.FiveYear) {
    return {
      change: true,
      advice: 'You should consider a more flexible timeframe.',
    };
  }

  return { change: false, advice: '' };
};

// advice_typo: string;
export const advice_typo = (typology: Typology, typoCosts: TypologyCosts): Advice => {
  let totalCost =
    typoCosts.costBiochar +
    typoCosts.costDac +
    typoCosts.costNbsAvoidance +
    typoCosts.costNbsRemoval;
  let pctBiochar = typoCosts.costBiochar / totalCost;
  let pctDac = typoCosts.costDac / totalCost;
  let pctNbsAvoidance = typoCosts.costNbsAvoidance / totalCost;
  let pctNbsRemoval = typoCosts.costNbsRemoval / totalCost;

  if (pctNbsRemoval - typology.nbsRemoval > 0.25) {
    return { change: true, advice: 'You should reduce removal financing' };
  }
  if (pctBiochar - typology.biochar > 0.3) {
    return { change: true, advice: 'You should reduce biochar financing' };
  }
  if (pctDac - typology.dac > 0.4) {
    return { change: true, advice: 'You should reduce dac financing' };
  }
  return { change: false, advice: '' };
};

// advice_geography: string;
export const advice_geography = (region: RegionAllocation, regionsCosts: RegionCosts): Advice => {
  let totalCost =
    regionsCosts.africa +
    regionsCosts.asia +
    regionsCosts.europe +
    regionsCosts.northAmerica +
    regionsCosts.oceania +
    regionsCosts.southAmerica;
  let pctAfrica = regionsCosts.africa / totalCost;
  let pctAsia = regionsCosts.asia / totalCost;
  let pctEurope = regionsCosts.europe / totalCost;
  let pctNorthAmerica = regionsCosts.northAmerica / totalCost;
  let pctOceania = regionsCosts.oceania / totalCost;
  let pctSouthAmerica = regionsCosts.southAmerica / totalCost;

  if (pctAfrica - region.africa > 0.3) {
    return { change: true, advice: 'You should reduce financing in Africa' };
  }
  if (pctAsia - region.asia > 0.3) {
    return { change: true, advice: 'You should reduce financing in Asia' };
  }
  if (pctEurope - region.europe > 0.3) {
    return { change: true, advice: 'You should reduce financing in Europe' };
  }
  if (pctNorthAmerica - region.northAmerica > 0.3) {
    return { change: true, advice: 'You should reduce financing in North America' };
  }
  if (pctOceania - region.oceania > 0.3) {
    return { change: true, advice: 'You should reduce financing in Oceania' };
  }
  if (pctSouthAmerica - region.southAmerica > 0.3) {
    return { change: true, advice: 'You should reduce financing in South America' };
  }

  return { change: false, advice: '' };
};
