'use server';

import { computeBudgetAdvice } from '@/algorithms/advice/budgetEstimationAdvice';
import { deltaExAnte } from '@/constants/forecasts';
import { duration } from '@/constants/time';
import { carbonToOffset } from '@/constants/user';
import { BudgetAlgorithmInput, BudgetOutputData, BudgetPythonResponse, Financing, PurchaseEntry, RegionCosts, RegionAllocation, Typology, TypologyCosts, TimeConstraint } from '@/types/types';
import { getCostPerTypes, getCostPerRegions } from '@/utils/calculations';

export async function runBudgetAlgo(input: BudgetAlgorithmInput): Promise<BudgetOutputData> {

  let typology = input.typology;
  let regionAllocation = input.regionAllocation;
  let financingData = input.financing;


  const sendDataToBackend = async (): Promise<BudgetPythonResponse | null> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/run-python-budget-algo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to send data');
      }

      const result = await response.json(); // Parse JSON response
      return result; // Return the entire object
    } catch (error) {
      console.error('Error:', error);
      return null; // Return null on error
    }
  };

  let { totalBudgetLow, totalBudgetMedium, totalBudgetHigh, strategies } = await sendDataToBackend() || {};

  // Vérifiez si les données sont bien reçues
  if (!totalBudgetMedium || !totalBudgetLow || !totalBudgetHigh || !strategies) {
    throw new Error('Failed to fetch budget or strategies data from backend.');
  }

  // console.log(computedAdvice);


  const notAdjustedBudget = totalBudgetMedium; // todo: review naming

  const typologyCosts: TypologyCosts = getCostPerTypes(strategies); // Todo: naming
  const regionCosts: RegionCosts = getCostPerRegions(strategies); // Todo: naming

  let regionsData: RegionAllocation = {
    // todo: refacto
    northAmerica: regionAllocation.northAmerica,
    southAmerica: regionAllocation.southAmerica,
    europe: regionAllocation.europe,
    africa: regionAllocation.africa,
    asia: regionAllocation.asia,
    oceania: regionAllocation.oceania,
  };

  let algoRes: BudgetOutputData = {
    financing: financingData,
    typologies: typology,
    regions: regionsData,
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
    cost_ex_post: totalBudgetMedium * financingData.exPost,
    cost_ex_ante: totalBudgetMedium - notAdjustedBudget * financingData.exPost,
    cost_nbs_removal: typologyCosts.costNbsRemoval,
    cost_nbs_avoidance: typologyCosts.costNbsAvoidance,
    cost_biochar: typologyCosts.costBiochar,
    cost_dac: typologyCosts.costDac,
    cost_north_america: regionCosts.northAmerica,
    cost_south_america: regionCosts.southAmerica,
    cost_europe: regionCosts.europe,
    cost_africa: regionCosts.africa,
    cost_asia: regionCosts.asia,
    cost_oceania: regionCosts.oceania,
    advice_timeline: { change: false },
    advice_financing: { change: false },
    advice_typo: { change: false },
    advice_geography: { change: false },
    strategies: strategies,
  };

  let computedAdvice = computeBudgetAdvice(input, algoRes);
  algoRes = {
    ...algoRes,
    advice_timeline: computedAdvice[0],
    advice_financing: computedAdvice[1],
    advice_typo: computedAdvice[2],
    advice_geography: computedAdvice[3],
  };

  return algoRes;
}
