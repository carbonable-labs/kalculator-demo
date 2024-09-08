export interface RegionAllocation {
  northAmerica: number;
  southAmerica: number;
  europe: number;
  africa: number;
  asia: number;
  oceania: number;
}

export interface Typology {
  nbsRemoval: number;
  nbsAvoidance: number;
  biochar: number;
  dac: number;
}

export interface Financing {
  financingExPost: number;
  financingExAnte: number;
}

export enum TimeConstraint {
  Yearly = 1,
  FiveYear = 5,
  NoConstraint = 0,
}

export type ProjectConfig = {
  nbs_removal: number;
  biochar: number;
  dac: number;
  nbs_avoidance: number;
};

export enum ConfigType {
  CarbonImpact = 'CarbonImpact',
  Durability = 'Durability',
  Biodiversity = 'Biodiversity',
  ProjectMaker = 'ProjectMaker',
}

// Algos input
export type AlgorithmInput = BudgetAlgorithmInput | TypoAlgorithmInput;

export interface BudgetAlgorithmInput {
  timeConstraints: number;
  financing: Financing;
  typology: Typology;
  regionAllocation: RegionAllocation;
}

export interface TypoAlgorithmInput {
  timeConstraints: number;
  financing: Financing;
  regionAllocation: RegionAllocation;
  budget: number;
  configType: ConfigType;
}
