// Regional allocation of funds from user input
export interface RegionAllocation {
  northAmerica: number;
  southAmerica: number;
  europe: number;
  africa: number;
  asia: number;
  oceania: number;
}

// Typology Form Answers of smart recommandation
export interface UserPreferences {
  biodiversity: number;
  durability: number;
  removal: number;
  pricing: number;
  reputation: number;
}

// Maps each typology (e.g., NbS Removal, Biochar, DAC) to its scoring attributes.
export const typologyMapping = {
  nbsRemoval: {
    biodiversity: 5,
    durability: 4,
    removal: 5,
    pricing: 4,
    reputation: 5,
  },
  nbsAvoidance: {
    biodiversity: 4,
    durability: 2,
    removal: 3,
    pricing: 4,
    reputation: 3,
  },
  biochar: {
    biodiversity: 3,
    durability: 5,
    removal: 5,
    pricing: 3,
    reputation: 4,
  },
  dac: {
    biodiversity: 1,
    durability: 5,
    removal: 5,
    pricing: 1,
    reputation: 4,
  },
  renewableEnergy: {
    biodiversity: 2,
    durability: 3,
    removal: 3,
    pricing: 5,
    reputation: 3,
  },
};

// Represents the typology repartition, expressed as percentages of total carbon credit invest
export interface Typology {
  nbsRemoval: number; // NbS ARR (Afforestation, Reforestation, and Restoration)
  nbsAvoidance: number; // NbS REDD (Reducing Emissions from Deforestation and Forest Degradation)
  biochar: number; // Biochar projects for carbon sequestration
  dac: number; // Direct Air Capture technology
  renewableEnergy: number; // Renewable energy projects (e.g., solar, wind)
}

export interface Financing {
  exPost: number;
  exAnte: number;
}

export enum TimeConstraint { // TODO: maybe change typing
  Yearly = 1,
  FiveYear = 5,
  NoConstraint = -1,
}

export enum ConfigType {
  CarbonImpact = 'CarbonImpact',
  Durability = 'Durability',
  Biodiversity = 'Biodiversity',
  ProjectMaker = 'ProjectMaker',
}

// Algos input
export interface BaseAlgorithmInput {
  timeConstraints: TimeConstraint;
  financing: Financing;
  regionAllocation: RegionAllocation;
}

export interface BudgetAlgorithmInput extends BaseAlgorithmInput {
  typology: Typology;
  carbonUnitNeeds: { [year: string]: number };
}

export interface StratAlgorithmInput extends BaseAlgorithmInput {
  typology: Typology;
  budget: number;
}

export interface TypoAlgorithmInput extends BaseAlgorithmInput {
  budget: number;
  configType: ConfigType;
}

export type AlgorithmInput = BudgetAlgorithmInput | TypoAlgorithmInput | StratAlgorithmInput;

// Algos output

export interface RegionPurchase {
  region: string;
  quantity: number;
  region_factor: number; // todo camel case
  cost: number;
}

export interface CostByRegion {
  northAmerica: number;
  southAmerica: number;
  europe: number;
  africa: number;
  asia: number;
  oceania: number;
}

export interface TypologyPurchaseSummary {
  typology: string;
  quantity: number;
  regions: RegionPurchase[]; // todo bug fix: apparently we always have a len of 1
  price_per_ton: number; // todo: average ?
}

// Returned by python algo, array of purchase entries
export interface PurchaseEntry {
  year: number;
  quantity: number;
  typology: string;
  region: string;
  price: number;
  type: string; // 'ex-ante' or 'ex-post'
}

export interface CostByTypology {
  costNbsRemoval: number;
  costNbsAvoidance: number;
  costBiochar: number;
  costDac: number;
  costRenewableEnergy: number;
}

export interface YearlyStrategy {
  year: number;
  quantity_purchased: number; // todo: totalQuantityPurchased
  cost_low: number; // todo: Average cost of all the assets ?
  cost_medium: number; // ""
  cost_high: number; // ""
  types_purchased: TypologyFinancingBreakdown[]; // todo types_purchased -> rename typologyBreakdown
}

export interface TypologyFinancingBreakdown {
  typology: string;
  exAnte: FinancingPurchaseDetails; // Details for ex-ante
  exPost: FinancingPurchaseDetails; // Details for ex-post
}

export interface FinancingPurchaseDetails {
  quantity: number;
  regions: RegionPurchase[];
  price_per_ton: number; // Average price per ton
  cost: number; // Total cost for this typology and type
}

export interface Advice {
  change: boolean;
  adviceType?: string;
  tipPhrase?: string;
  actionText?: string;
  budgetDelta?: number;
  tip?: TimeConstraint | Financing | Typology[] | RegionAllocation[];
}

export interface BudgetPythonResponse {
  totalBudgetLow: number;
  totalBudgetMedium: number;
  totalBudgetHigh: number;
  strategies: YearlyStrategy[];
}
export interface BudgetOutputData {
  financing: Financing;
  typologies: Typology;
  regions: RegionAllocation;
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
  advice_timeline: Advice;
  advice_financing: Advice;
  advice_typo: Advice;
  advice_geography: Advice;
  strategies: YearlyStrategy[];
}

export interface StratOutputData extends BudgetOutputData {
  otherTypologiesPossible: Typology[];
  user_budget: number;
  money_saving: number;
  money_to_add: number;
  budget_not_compatible: string; // TODO
}

export interface TypoOutputData extends BudgetOutputData {
  advice_timeline: Advice;
  advice_financing: Advice;
  advice_typo: Advice;
  advice_geography: Advice;
}
