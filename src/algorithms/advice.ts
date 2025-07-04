import {
  RegionAllocation,
  Typology,
  Financing,
  TimeConstraint,
  CostByTypology,
  CostByRegion,
} from '@/types/types';

// import { runBudgetAlgo } from '@/algorithms/algoBudget';

export interface Advice {
  change: boolean;
  advice: string;
}

export const adviceTypo = (typology: Typology, typoCosts: CostByTypology): Advice => {
  // TODO: Update advice considering non used pct.
  let totalCost =
    typoCosts.costBiochar +
    typoCosts.costDac +
    typoCosts.costNbsAvoidance +
    typoCosts.costNbsRemoval +
    typoCosts.costRenewableEnergy;
  let pctBiochar = typoCosts.costBiochar / totalCost;
  let pctDac = typoCosts.costDac / totalCost;
  let pctNbsAvoidance = typoCosts.costNbsAvoidance / totalCost;
  let pctNbsRemoval = typoCosts.costNbsRemoval / totalCost;
  let pctRenewable = typoCosts.costRenewableEnergy / totalCost;

  // console.log({
  //   bio: pctBiochar / typology.biochar,
  //   dac: pctDac / typology.dac,
  //   nbsAvoidance: pctNbsAvoidance / typology.nbsAvoidance,
  //   nbsRemoval: pctNbsRemoval / typology.nbsRemoval,
  // })

  if (pctBiochar > 0.1 || typology.biochar > 0.1) {
    return { change: true, advice: 'You should reduce Biochar financing' };
  }
  if (pctDac > 0.05 || typology.dac > 0.05) {
    return {
      change: true,
      advice: 'You should reduce DAC financing and invest in nature-based solutions.',
    };
  }
  if (typology.biochar > 0 && pctBiochar / typology.biochar > 2) {
    return { change: true, advice: 'You should reduce Biochar financing' };
  }
  if (typology.dac > 0 && pctDac / typology.dac > 2) {
    return {
      change: true,
      advice: 'You should reduce DAC financing and invest in nature-based solutions.',
    };
  }
  return { change: false, advice: '' };
};

export const adviceGeography = (region: RegionAllocation, regionsCosts: CostByRegion): Advice => {
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

  // console.log({
  //   africa: pctAfrica / region.africa,
  //   asia: pctAsia / region.asia,
  //   europe: pctEurope / region.europe,
  //   northAmerica: pctNorthAmerica / region.northAmerica,
  //   oceania: pctOceania / region.oceania,
  //   southAmerica: pctSouthAmerica / region.southAmerica,
  // })

  if (pctEurope > 0.2 || region.europe > 0.2) {
    return { change: true, advice: 'You should reduce financing in Europe' };
  }
  if (region.asia > 0 && pctAsia / region.asia > 1.3) {
    return { change: true, advice: 'You should reduce financing in Asia' };
  }
  if (region.northAmerica > 0 && pctNorthAmerica / region.northAmerica > 1.3) {
    return { change: true, advice: 'You should reduce financing in North America' };
  }
  if (region.oceania > 0 && pctOceania / region.oceania > 1.3) {
    return { change: true, advice: 'You should reduce financing in Oceania' };
  }

  return { change: false, advice: '' };
};
