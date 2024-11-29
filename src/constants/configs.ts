import { ConfigType } from '@/types/types';

// Define the configuration mappings for each type
export const carbonImpactConfigs = [
  { renewableEnergy: 0, nbsRemoval: 0.7, biochar: 0.2, dac: 0.1, nbsAvoidance: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.75, biochar: 0.2, dac: 0.05, nbsAvoidance: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.8, biochar: 0.15, dac: 0.05, nbsAvoidance: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.85, biochar: 0.15, dac: 0, nbsAvoidance: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.9, biochar: 0.1, dac: 0, nbsAvoidance: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.95, biochar: 0.05, dac: 0, nbsAvoidance: 0 },
  { renewableEnergy: 0, nbsRemoval: 1, biochar: 0, dac: 0, nbsAvoidance: 0 },
];

export const durabilityConfigs = [
  { dac: 0.6, biochar: 0.3, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0.55, biochar: 0.35, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0.5, biochar: 0.4, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0.45, biochar: 0.45, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0.4, biochar: 0.5, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0.35, biochar: 0.55, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0.3, biochar: 0.6, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0.25, biochar: 0.65, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0.2, biochar: 0.7, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0.15, biochar: 0.75, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0.1, biochar: 0.8, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0.05, biochar: 0.85, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
  { dac: 0, biochar: 0.9, nbsAvoidance: 0, renewableEnergy: 0, nbsRemoval: 0.1 },
];

export const biodiversityConfigs = [
  { renewableEnergy: 0, nbsRemoval: 0.6, nbsAvoidance: 0.3, biochar: 0.1, dac: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.6, nbsAvoidance: 0.35, biochar: 0.05, dac: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.6, nbsAvoidance: 0.4, biochar: 0, dac: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.55, nbsAvoidance: 0.45, biochar: 0, dac: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.5, nbsAvoidance: 0.5, biochar: 0, dac: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.45, nbsAvoidance: 0.55, biochar: 0, dac: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.4, nbsAvoidance: 0.6, biochar: 0, dac: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.35, nbsAvoidance: 0.65, biochar: 0, dac: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.3, nbsAvoidance: 0.7, biochar: 0, dac: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.25, nbsAvoidance: 0.75, biochar: 0, dac: 0 },
  { renewableEnergy: 0, nbsRemoval: 0.2, nbsAvoidance: 0.8, biochar: 0, dac: 0 },
];

export const projectMakerConfigs = [
  { renewableEnergy: 0, nbsRemoval: 0.35, biochar: 0.15, dac: 0.05, nbsAvoidance: 0.45 },
  { renewableEnergy: 0, nbsRemoval: 0.4, biochar: 0.15, dac: 0, nbsAvoidance: 0.45 },
  { renewableEnergy: 0, nbsRemoval: 0.4, biochar: 0.1, dac: 0, nbsAvoidance: 0.5 },
  { renewableEnergy: 0, nbsRemoval: 0.45, biochar: 0.05, dac: 0, nbsAvoidance: 0.5 },
  { renewableEnergy: 0, nbsRemoval: 0.5, biochar: 0, dac: 0, nbsAvoidance: 0.5 },
];

// Map the enum to the respective configuration arrays
export const configMap = {
  [ConfigType.CarbonImpact]: carbonImpactConfigs,
  [ConfigType.Durability]: durabilityConfigs,
  [ConfigType.Biodiversity]: biodiversityConfigs,
  [ConfigType.ProjectMaker]: projectMakerConfigs,
};
