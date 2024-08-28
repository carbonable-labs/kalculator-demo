import { AlgorithmInput } from '@/types';
export function getFloatInput(prompt: string): number {
  const value = parseFloat(prompt);
  if (isNaN(value) || value < 0 || value > 100) {
    throw new Error('Invalid input. Please enter a numeric value between 0 and 100.');
  }
  return value;
}

export function checkTotal(currentTotal: number, newValue: number): boolean {
  if (currentTotal + newValue > 100) {
    throw new Error('The total percentage exceeds 100%. Please enter a valid percentage.');
  }
  return true;
}

export const loadInputData = async (filePath: string): Promise<AlgorithmInput> => {
  const response = await fetch(filePath);
  const data: AlgorithmInput = await response.json();
  return data;
};
