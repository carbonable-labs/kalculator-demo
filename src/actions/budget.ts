'use server';

import { runBudgetAlgorithm } from '@/algorithms/algoBudget';
import { Financing, RegionAllocation, Typology } from '@/types/inputTypes';
import results from '@/data/budget-output.json';

interface BudgetInput {
  regionAllocation: RegionAllocation;
  typology: Typology;
  financing: Financing;
  timeConstraints: number;
}

export async function runBudgetAlgo(input: BudgetInput): Promise<BudgetOutputData> {
  const algoRes = runBudgetAlgorithm({
    regionAllocation: input.regionAllocation,
    typology: input.typology,
    financing: input.financing,
    timeConstraints: input.timeConstraints,
  });

  if (!algoRes) {
    throw new Error('An error occurred while running the algorithm.');
  }

  const { totalBudget, adjustedBudget } = algoRes;

  // return { totalBudget, adjustedBudget };

  return results as BudgetOutputData;
}
