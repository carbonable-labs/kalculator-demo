import { Financing, Typology } from '@/types/types';

export enum TYPOLOGY_PREFERENCE {
  NBS_REMOVAL = 'removal',
  NBS_AVOIDANCE = 'avoidance',
  BIODIVERSITY_IMPACT = 'biodiversity',
  CLIMATE_IMPACT = 'climate',
  NO_IDEA = 'noidea',
}

export const DEFAULT_FINANCING: Financing = {
  exAnte: 0,
  exPost: 1,
};

export const DEFAULT_TYPOLOGY: Typology = {
  nbsRemoval: 0.6,
  nbsAvoidance: 0.2,
  biochar: 0.1,
  dac: 0.1,
  renewableEnergy: 0,
};

export const DEFAULT_GEOGRAPHICAL_AREA = {
  northAmerica: 0.1,
  southAmerica: 0.2,
  europe: 0.3,
  africa: 0.2,
  asia: 0.1,
  oceania: 0.1,
};

export const CLIMATE_AVOIDANCE_TYPOLOGY: Typology = {
  nbsRemoval: 0.1,
  nbsAvoidance: 0.2,
  dac: 0.2,
  biochar: 0.5,
  renewableEnergy: 0,
};

export const CLIMATE_REMOVAL_TYPOLOGY: Typology = {
  nbsRemoval: 0.2,
  nbsAvoidance: 0.1,
  dac: 0.2,
  biochar: 0.5,
  renewableEnergy: 0,
};

export const CLIMATE_NO_IDEA_TYPOLOGY: Typology = {
  nbsRemoval: 0.15,
  nbsAvoidance: 0.15,
  dac: 0.2,
  biochar: 0.5,
  renewableEnergy: 0,
};

export const BIODIVERSITY_NO_IDEA_TYPOLOGY: Typology = {
  nbsRemoval: 0.4,
  nbsAvoidance: 0.3,
  dac: 0.1,
  biochar: 0.2,
  renewableEnergy: 0,
};

export const BIODIVERSITY_AVOIDANCE_TYPOLOGY: Typology = {
  nbsRemoval: 0.2,
  nbsAvoidance: 0.6,
  dac: 0,
  biochar: 0.2,
  renewableEnergy: 0,
};

export const BIODIVERSITY_REMOVAL_TYPOLOGY: Typology = {
  nbsRemoval: 0.6,
  nbsAvoidance: 0.0,
  dac: 0.2,
  biochar: 0.2,
  renewableEnergy: 0,
};

export const RENEWABLE_ENERGY_TYPOLOGY: Typology = {
  nbsRemoval: 0.6,
  nbsAvoidance: 0.0,
  dac: 0.2,
  biochar: 0.2,
  renewableEnergy: 0,
};

export const continents = ['africa', 'asia', 'europe', 'northAmerica', 'oceania', 'southAmerica'];

export const ACCEPTABLE_DELTA = 0.95;
