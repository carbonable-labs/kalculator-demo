import { Financing, Typology } from '@/types/types';

export enum TYPOLOGY_PREFERENCE {
  NBS_REMOVAL = 'removal',
  NBS_AVOIDANCE = 'avoidance',
  BIODIVERSITY_IMPACT = 'biodiversity',
  CLIMATE_IMPACT = 'climate',
  NO_IDEA = 'noidea',
}

export const DEFAULT_FINANCING: Financing = {
  financingExAnte: 0.5,
  financingExPost: 0.5,
};

export const DEFAULT_TYPOLGY: Typology = {
  nbsRemoval: 0.85,
  nbsAvoidance: 0.1,
  biochar: 0,
  dac: 0.05,
};

export const DEFAULT_GEOGRAPHICAL_AREA = {
  northAmerica: 0,
  southAmerica: 0,
  europe: 0.05,
  africa: 0.85,
  asia: 0.1,
  oceania: 0,
};

export const CLIMATE_AVOIDANCE_TYPOLGY: Typology = {
  nbsRemoval: 0.1,
  nbsAvoidance: 0.2,
  biochar: 0.5,
  dac: 0.2,
};

export const CLIMATE_REMOVAL_TYPOLGY: Typology = {
  nbsRemoval: 0.2,
  nbsAvoidance: 0.1,
  biochar: 0.5,
  dac: 0.2,
};

export const CLIMATE_NO_IDEA_TYPOLGY: Typology = {
  nbsRemoval: 0.15,
  nbsAvoidance: 0.15,
  biochar: 0.5,
  dac: 0.2,
};

export const BIODIVERSITY_NO_IDEA_TYPOLGY: Typology = {
  nbsRemoval: 0.4,
  nbsAvoidance: 0.4,
  biochar: 0.2,
  dac: 0,
};

export const BIODIVERSITY_AVOIDANCE_TYPOLGY: Typology = {
  nbsRemoval: 0.2,
  nbsAvoidance: 0.6,
  biochar: 0.2,
  dac: 0,
};

export const BIODIVERSITY_REMOVAL_TYPOLGY: Typology = {
  nbsRemoval: 0.6,
  nbsAvoidance: 0.2,
  biochar: 0.2,
  dac: 0,
};

export const continents = ['africa', 'asia', 'europe', 'north_america', 'oceania', 'south_america'];
