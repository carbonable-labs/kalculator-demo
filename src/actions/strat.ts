'use server';

import { runStratAlgorithm } from '@/algorithms/algoStrat';
import { StratAlgorithmInput, StratOutputData } from '@/types/types';

export async function runStratAlgo(input: StratAlgorithmInput): Promise<StratOutputData> {
  const algoRes: StratOutputData = runStratAlgorithm(input);

  if (!algoRes) {
    throw new Error('An error occurred while running the algorithm.');
  }

  return algoRes;
}
