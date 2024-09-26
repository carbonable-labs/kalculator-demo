'use client';

import { runStratAlgo } from '@/actions/strat';
import { Financing, RegionAllocation, StratOutputData, Typology } from '@/types/types';
import {
  DEFAULT_FINANCING,
  DEFAULT_GEOGRAPHICAL_AREA,
  DEFAULT_TYPOLGY,
} from '@/utils/configuration';
import { createContext, useCallback, useContext, useState } from 'react';

interface StrategyContextType {
  budget: number;
  setBudget: (budget: number) => void;
  timeConstraints: number | null;
  setTimeConstraints: (timeConstraints: number | null) => void;
  financing: Financing;
  setFinancing: (value: Financing) => void;
  typology: Typology;
  setTypology: (value: Typology) => void;
  regionAllocation: RegionAllocation;
  setRegionAllocation: (value: RegionAllocation) => void;
  strategyResults: StratOutputData | null;
  setStrategyResults: (value: StratOutputData | null) => void;
  isCalculating: boolean;
  setIsCalculating: (value: boolean) => void;
  calculateStrategy: () => void;
}

const StrategyContext = createContext<StrategyContextType | undefined>(undefined);

export const StrategyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budget, setBudget] = useState<number>(0);
  const [timeConstraints, setTimeConstraints] = useState<number | null>(null);
  const [financing, setFinancing] = useState<Financing>(DEFAULT_FINANCING);
  const [typology, setTypology] = useState<Typology>(DEFAULT_TYPOLGY);
  const [regionAllocation, setRegionAllocation] =
    useState<RegionAllocation>(DEFAULT_GEOGRAPHICAL_AREA);
  const [strategyResults, setStrategyResults] = useState<StratOutputData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateStrategy = useCallback(async () => {
    if (!financing || !regionAllocation || timeConstraints === null || !typology) {
      return;
    }

    setIsCalculating(true);

    try {
      const results = await runStratAlgo({
        financing,
        regionAllocation,
        timeConstraints,
        typology,
        budget,
      });

      setStrategyResults(results);
    } catch (error) {
      console.error('Error calculating budget:', error);
      // You might want to set an error state here
    } finally {
      setIsCalculating(false);
    }
  }, [financing, regionAllocation, timeConstraints, typology, budget]);

  return (
    <StrategyContext.Provider
      value={{
        budget,
        setBudget,
        timeConstraints,
        setTimeConstraints,
        financing,
        setFinancing,
        typology,
        setTypology,
        regionAllocation,
        setRegionAllocation,
        strategyResults,
        setStrategyResults,
        isCalculating,
        setIsCalculating,
        calculateStrategy,
      }}
    >
      {children}
    </StrategyContext.Provider>
  );
};

export const useStrategy = () => {
  const context = useContext(StrategyContext);
  if (context === undefined) {
    throw new Error('useStrategy must be used within an StrategyProvider');
  }
  return context;
};
