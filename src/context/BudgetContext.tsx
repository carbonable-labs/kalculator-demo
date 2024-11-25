'use client';

import { runBudgetAlgo } from '@/actions/budget';
import { useBudgetHistory } from '@/hooks/useBudgetHistory';
import {
  BudgetAlgorithmInput,
  BudgetOutputData,
  Financing,
  RegionAllocation,
  Typology,
} from '@/types/types';
import {
  DEFAULT_FINANCING,
  DEFAULT_GEOGRAPHICAL_AREA,
  DEFAULT_TYPOLOGY,
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
  setHistory: (value: Array<[number, BudgetAlgorithmInput]>) => void;
  history: Array<[number, BudgetAlgorithmInput]>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeConstraints, setTimeConstraints] = useState<number | null>(null);
  const [financing, setFinancing] = useState<Financing>(DEFAULT_FINANCING);
  const [typology, setTypology] = useState<Typology>(DEFAULT_TYPOLOGY);
  const [regionAllocation, setRegionAllocation] =
    useState<RegionAllocation>(DEFAULT_GEOGRAPHICAL_AREA);
  const [budgetResults, setBudgetResults] = useState<BudgetOutputData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [history, setHistory] = useBudgetHistory();

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
      setHistory([
        ...history,
        [results.total_cost_medium, { financing, regionAllocation, timeConstraints, typology }],
      ]);
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
        setHistory,
        history,
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
