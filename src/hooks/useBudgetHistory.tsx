import { BudgetAlgorithmInput } from '@/types/types';
import { useLocalStorage } from './useLocalStorage';

export const useBudgetHistory = () => {
  return useLocalStorage<Array<[number, BudgetAlgorithmInput]>>('budgetHistory', []);
};
