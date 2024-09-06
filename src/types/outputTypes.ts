interface FinancingData {
  ex_ante: number;
  ex_post: number;
}

interface TypologiesData {
  nbs_removal: number;
  nbs_avoidance: number;
  biochar: number;
  dac: number;
}

interface RegionsData {
  north_america: number;
  south_america: number;
  europe: number;
  africa: number;
  asia: number;
  oceania: number;
}

interface RegionPurchase {
  region: string;
  quantity: number;
  region_factor: number;
  cost: number;
}

interface TypePurchased {
  typology: string;
  quantity: number;
  regions: RegionPurchase[];
}

interface YearlyStrategy {
  year: number;
  quantity_purchased: number;
  total_cost_low: number;
  total_cost_medium: number;
  total_cost_high: number;
  types_purchased: TypePurchased[];
}

interface BudgetOutputData {
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
