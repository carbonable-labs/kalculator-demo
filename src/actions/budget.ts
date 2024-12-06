'use server';

import { duration } from '@/constants/time';
import { carbonToOffset } from '@/constants/user';
import { executeBudgetAlgorithm } from '@/pages/api/run-python-budget-algo';
import {
  BudgetAlgorithmInput,
  BudgetOutputData,
  BudgetPythonResponse,
  CostByRegion,
  RegionAllocation,
  CostByTypology,
} from '@/types/types';
import {
  getCostPerTypes,
  getCostPerRegions,
  calculateTotalQuantitiesFinancing,
  calculateTotalCostsFinancing,
  assertTypologySum,
  calculateTotalQuantitiesRegionAllocation,
} from '@/utils/calculations';

async function requestBudgetComputation(
  input: BudgetAlgorithmInput,
): Promise<BudgetPythonResponse | null> {
  try {
    const result = await executeBudgetAlgorithm(input);
    return result;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

function getUpdatedFinancing(
  financing: { exAnte: number; exPost: number },
  strategies: any,
  optimizeFinancing: boolean,
): { exAnte: number; exPost: number } {
  if (optimizeFinancing) {
    const { totalExAnte, totalExPost } = calculateTotalQuantitiesFinancing(strategies);
    let exAntePercentage = totalExAnte / (totalExAnte + totalExPost);
    let exPostPercentage = 1 - exAntePercentage;
    return { exAnte: exAntePercentage, exPost: exPostPercentage };
  }
  return financing;
}

function getUpdatedRegionAllocation(
  regionAllocation: RegionAllocation,
  strategies: any,
  optimizeRegion: boolean,
): RegionAllocation {
  if (optimizeRegion) {
    const updatedRegionAllocation = calculateTotalQuantitiesRegionAllocation(strategies);
    return updatedRegionAllocation;
  }
  return regionAllocation;
}

export async function runBudgetAlgo(input: BudgetAlgorithmInput): Promise<BudgetOutputData> {
  const { typology, regionAllocation, financing, optimizeFinancing, optimizeRegion } = input;
  assertTypologySum(typology);

  const response = await requestBudgetComputation(input);
  if (!response) throw new Error('Failed to fetch budget or strategies data from backend.');

  const { totalBudgetLow, totalBudgetMedium, totalBudgetHigh, strategies } = response;
  if (!totalBudgetLow || !totalBudgetMedium || !totalBudgetHigh || !strategies) {
    throw new Error('Missing required data from backend response.');
  }

  const updatedFinancing = getUpdatedFinancing(financing, strategies, optimizeFinancing);
  const updatedRegionAllocation = getUpdatedRegionAllocation(
    regionAllocation,
    strategies,
    optimizeRegion,
  );
  const costByTypology: CostByTypology = getCostPerTypes(strategies);
  const costByRegion: CostByRegion = getCostPerRegions(strategies);
  const { totalCostExAnte, totalCostExPost } = calculateTotalCostsFinancing(strategies);

  const algoRes: BudgetOutputData = {
    financing: updatedFinancing,
    typologies: typology,
    regions: updatedRegionAllocation,
    carbon_offset: carbonToOffset,
    total_cost_low: totalBudgetLow,
    total_cost_medium: totalBudgetMedium,
    total_cost_high: totalBudgetHigh,
    average_yearly_cost_low: totalBudgetLow / duration,
    average_yearly_cost_medium: totalBudgetMedium / duration,
    average_yearly_cost_high: totalBudgetHigh / duration,
    average_price_per_ton_low: totalBudgetLow / carbonToOffset,
    average_price_per_ton_medium: totalBudgetMedium / carbonToOffset,
    average_price_per_ton_high: totalBudgetHigh / carbonToOffset,
    total_cost_flexible: totalBudgetMedium,
    cost_ex_post: totalCostExPost,
    cost_ex_ante: totalCostExAnte,
    cost_nbs_removal: costByTypology.costNbsRemoval,
    cost_nbs_avoidance: costByTypology.costNbsAvoidance,
    cost_renewable_energy: costByTypology.costRenewableEnergy,
    cost_biochar: costByTypology.costBiochar,
    cost_dac: costByTypology.costDac,
    cost_north_america: costByRegion.northAmerica,
    cost_south_america: costByRegion.southAmerica,
    cost_europe: costByRegion.europe,
    cost_africa: costByRegion.africa,
    cost_asia: costByRegion.asia,
    cost_oceania: costByRegion.oceania,
    advice_timeline: { change: false },
    advice_financing: { change: false },
    advice_typo: { change: false },
    advice_geography: { change: false },
    strategies,
  };

  // const computedAdvice = await computeBudgetAdvice(input, algoRes);

  return {
    ...algoRes,
    // advice_timeline: computedAdvice[0],
    // advice_financing: computedAdvice[1],
    // advice_typo: computedAdvice[2],
    // advice_geography: computedAdvice[3],
  };
}
