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

export interface StrategyStep {
  year: number;
  quantity_purchased: number;
  total_cost: number;
  types_purchased: TypePurchased[];
}

// Algos input
export type AlgorithmInput = BudgetAlgorithmInput | TypoAlgorithmInput;

export interface BudgetAlgorithmInput {
  timeConstraints: TimeConstraint;
  financing: Financing;
  typology: Typology;
  regionAllocation: RegionAllocation;
}

export interface StratAlgorithmInput {
  timeConstraints: TimeConstraint;
  financing: Financing;
  typology: Typology;
  regionAllocation: RegionAllocation;
  budget: number;
}

export interface TypoAlgorithmInput {
  timeConstraints: TimeConstraint;
  financing: Financing;
  regionAllocation: RegionAllocation;
  budget: number;
  configType: ConfigType;
}

// Algos output

export interface FinancingData {
  ex_ante: number;
  ex_post: number;
}

export interface TypologiesData {
  nbs_removal: number;
  nbs_avoidance: number;
  biochar: number;
  dac: number;
}

export interface RegionsData {
  north_america: number;
  south_america: number;
  europe: number;
  africa: number;
  asia: number;
  oceania: number;
}

export interface RegionPurchase {
  region: string;
  quantity: number;
  region_factor: number;
  cost: number;
}

export interface RegionCosts {
  northAmerica: number;
  southAmerica: number;
  europe: number;
  africa: number;
  asia: number;
  oceania: number;
}

export interface TypePurchased {
  typology: string;
  quantity: number;
  regions: RegionPurchase[];
}

export interface TypologyCosts {
  costNbsRemoval: number;
  costNbsAvoidance: number;
  costBiochar: number;
  costDac: number;
}

export interface TypesPurchasedPriceExPost {
  typology: string;
  quantity: number;
  region: RegionPurchase;
  price: number;
  coefficient: number;
}

export interface YearlyStrategy {
  year: number;
  quantity_purchased: number;
  cost_low: number;
  cost_medium: number;
  cost_high: number;
  types_purchased: TypePurchased[];
}

export interface BudgetOutputData {
  financing: FinancingData;
  typologies: TypologiesData;
  regions: RegionsData;
  carbon_offset: number;
  total_cost_low: number;
  total_cost_medium: number;
  total_cost_high: number;
  average_yearly_cost_low: number;
  average_yearly_cost_medium: number;
  average_yearly_cost_high: number;
  average_price_per_ton_low: number;
  average_price_per_ton_medium: number;
  average_price_per_ton_high: number;
  total_cost_flexible: number;
  cost_ex_post: number;
  cost_ex_ante: number;
  cost_nbs_removal: number;
  cost_nbs_avoidance: number;
  cost_biochar: number;
  cost_dac: number;
  cost_north_america: number;
  cost_south_america: number;
  cost_europe: number;
  cost_africa: number;
  cost_asia: number;
  cost_oceania: number;
  advice_timeline: string;
  advice_financing: string;
  advice_typo: string;
  advice_geography: string;
  strategies: YearlyStrategy[];
}

export interface StratOutputData {
  financing: FinancingData;
  typologies: TypologiesData;
  regions: RegionsData;
  otherTypologiesPossible: TypologiesData[];
  carbon_offset: number;
  user_budget: number;
  money_saving: number;
  money_to_add: number;
  budget_not_compatible: string; //TODO ??
  total_cost_low: number;
  total_cost_medium: number;
  total_cost_high: number;
  average_yearly_cost_low: number;
  average_yearly_cost_medium: number;
  average_yearly_cost_high: number;
  average_price_per_ton_low: number;
  average_price_per_ton_medium: number;
  average_price_per_ton_high: number;
  total_cost_flexible: number;
  cost_ex_post: number;
  cost_ex_ante: number;
  cost_nbs_removal: number;
  cost_nbs_avoidance: number;
  cost_biochar: number;
  cost_dac: number;
  cost_north_america: number;
  cost_south_america: number;
  cost_europe: number;
  cost_africa: number;
  cost_asia: number;
  cost_oceania: number;
  advice_timeline: string;
  advice_financing: string;
  advice_typo: string;
  advice_geography: string;
  strategies: YearlyStrategy[];
}

export interface TypoOutputData {
  financing: FinancingData;
  typologies: TypologiesData;
  regions: RegionsData;
  carbon_offset: number;
  user_budget: number;
  money_saving: number;
  money_to_add: number;
  budget_not_compatible: string; //TODO ??
  total_cost_low: number;
  total_cost_medium: number;
  total_cost_high: number;
  average_yearly_cost_low: number;
  average_yearly_cost_medium: number;
  average_yearly_cost_high: number;
  average_price_per_ton_low: number;
  average_price_per_ton_medium: number;
  average_price_per_ton_high: number;
  total_cost_flexible: number;
  cost_ex_post: number;
  cost_ex_ante: number;
  cost_nbs_removal: number;
  cost_nbs_avoidance: number;
  cost_biochar: number;
  cost_dac: number;
  cost_north_america: number;
  cost_south_america: number;
  cost_europe: number;
  cost_africa: number;
  cost_asia: number;
  cost_oceania: number;
  advice_timeline: string;
  advice_financing: string;
  advice_typo: string;
  advice_geography: string;
  strategies: YearlyStrategy[];
}
