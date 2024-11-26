'use server';

import { computeBudgetAdvice } from '@/algorithms/advice/budgetEstimationAdvice';
import { BudgetAlgorithmInput, BudgetOutputData } from '@/types/types';

export async function runBudgetAlgo(input: BudgetAlgorithmInput): Promise<BudgetOutputData> {
  let algoRes;
  const data = {
    financing: {
      exPost: 0.4,
      exAnte: 0.6,
    },
    typology: {
      nbsRemoval: 0.5,
      nbsAvoidance: 0.3,
      biochar: 0.1,
      dac: 0.05,
      blueCarbon: 0.05,
    },
    regionAllocation: {
      northAmerica: 0.1,
      southAmerica: 0.2,
      europe: 0.3,
      africa: 0.2,
      asia: 0.1,
      oceania: 0.1,
    },
    carbonNeeds: {
      2025: 5000000,
      2040: 10000000,
      2050: 40000000,
    },
  };

  const sendDataToBackend = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/run-python-budget-algo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send data');
      }

      const result = await response.json();
      console.log('Result from backend:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  sendDataToBackend();

  if (!algoRes) {
    throw new Error('An error occurred while running the algorithm.');
  }

  let computedAdvice = computeBudgetAdvice(input, algoRes);
  // console.log(computedAdvice);

  algoRes = {
    ...algoRes,
    advice_timeline: computedAdvice[0],
    advice_financing: computedAdvice[1],
    advice_typo: computedAdvice[2],
    advice_geography: computedAdvice[3],
  };

  return algoRes;
}
