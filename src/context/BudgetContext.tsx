'use client';

import { runBudgetAlgo } from '@/actions/budget';
import { BudgetOutputData, Financing, RegionAllocation, Typology } from '@/types/types';
import {
  DEFAULT_FINANCING,
  DEFAULT_GEOGRAPHICAL_AREA,
  DEFAULT_TYPOLGY,
} from '@/utils/configuration';
import { createContext, useCallback, useContext, useState } from 'react';

interface BudgetContextType {
  timeConstraints: number | null;
  setTimeConstraints: (value: number | null) => void;
  financing: Financing;
  setFinancing: (value: Financing) => void;
  typology: Typology;
  setTypology: (value: Typology) => void;
  regionAllocation: RegionAllocation;
  setRegionAllocation: (value: RegionAllocation) => void;
  budgetResults: BudgetOutputData | null;
  setBudgetResults: (value: BudgetOutputData | null) => void;
  isCalculating: boolean;
  setIsCalculating: (value: boolean) => void;
  calculateBudget: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeConstraints, setTimeConstraints] = useState<number | null>(null);
  const [financing, setFinancing] = useState<Financing>(DEFAULT_FINANCING);
  const [typology, setTypology] = useState<Typology>(DEFAULT_TYPOLGY);
  const [regionAllocation, setRegionAllocation] =
    useState<RegionAllocation>(DEFAULT_GEOGRAPHICAL_AREA);
  const [budgetResults, setBudgetResults] = useState<BudgetOutputData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateBudget = useCallback(async () => {
    if (!financing || !regionAllocation || timeConstraints === null || !typology) {
      return;
    }

    setIsCalculating(true);

    try {
      const results = await runBudgetAlgo({
        financing,
        regionAllocation,
        timeConstraints,
        typology,
      });

      setBudgetResults(results);
    } catch (error) {
      console.error('Error calculating budget:', error);
      // You might want to set an error state here
    } finally {
      setIsCalculating(false);
    }
  }, [financing, regionAllocation, timeConstraints, typology]);

  return (
    <BudgetContext.Provider
      value={{
        timeConstraints,
        setTimeConstraints,
        financing,
        setFinancing,
        typology,
        setTypology,
        regionAllocation,
        setRegionAllocation,
        budgetResults,
        setBudgetResults,
        isCalculating,
        setIsCalculating,
        calculateBudget,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within an BudgetProvider');
  }
  return context;
};
