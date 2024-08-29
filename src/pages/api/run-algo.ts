import type { NextApiRequest, NextApiResponse } from 'next';
import { runAlgorithm } from '@/algorithms/algo1';
import { loadInputData } from '@/utils/input';
import { carbonToOffset } from '@/constants/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Load input data - you could also get this from req.body if sending data via POST
    const input = await loadInputData('src/pages/api/input.json');
    console.log('Input:', input);

    // Run the algorithm with the provided input
    const result = runAlgorithm({
      regionAllocation: input.regionAllocation,
      typology: input.typology,
      financing: input.financing,
      timeConstraints: input.timeConstraints,
    });

    // Respond with the result
    res.status(200).json({ result });
  } catch (error) {
    console.error('Error running algorithm:', error);
    res.status(500).json({ error: 'An error occurred while running the algorithm.' });
  }
}
