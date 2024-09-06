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

export interface AlgorithmInput {
  timeConstraints: number;
  financing: Financing;
  typology: Typology;
  regionAllocation: RegionAllocation;
}
