'use client';

import { runBudgetAlgo } from '@/actions/budget';
import { computeBudgetAdvice } from '@/algorithms/advice/budgetEstimationAdvice';
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
import { createContext, useCallback, useContext, useState, useMemo } from 'react';

interface BudgetContextType {
  timeConstraints: number | null;
  setTimeConstraints: (value: number | null) => void;
  financing: Financing;
  setFinancing: (value: Financing) => void;
  optimizeFinancing: boolean;
  setOptimizeFinancing: (value: boolean) => void;
  optimizeRegion: boolean;
  setOptimizeRegion: (value: boolean) => void;
  typology: Typology;
  setTypology: (value: Typology) => void;
  regionAllocation: RegionAllocation;
  setRegionAllocation: (value: RegionAllocation) => void;
  budgetResults: BudgetOutputData | null;
  setBudgetResults: (value: BudgetOutputData | null) => void;
  isCalculating: boolean;
  setIsCalculating: (value: boolean) => void;
  calculateBudget: () => Promise<void>;
  history: Array<[number, BudgetAlgorithmInput]>;
  setHistory: (value: Array<[number, BudgetAlgorithmInput]>) => void;
  carbonUnitNeeds: { [year: string]: number };
  setCarbonUnitNeeds: (value: { [year: string]: number }) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeConstraints, setTimeConstraints] = useState<number | null>(null);
  const [financing, setFinancing] = useState<Financing>(DEFAULT_FINANCING);
  const [optimizeFinancing, setOptimizeFinancing] = useState<boolean>(false);
  const [optimizeRegion, setOptimizeRegion] = useState<boolean>(false);
  const [typology, setTypology] = useState<Typology>(DEFAULT_TYPOLOGY);
  const [regionAllocation, setRegionAllocation] =
    useState<RegionAllocation>(DEFAULT_GEOGRAPHICAL_AREA);
  const [budgetResults, setBudgetResults] = useState<BudgetOutputData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [history, setHistory] = useBudgetHistory();
  const [carbonUnitNeeds, setCarbonUnitNeeds] = useState<{ [year: string]: number }>({});

  const calculateBudget = useCallback(async () => {
    if (!financing || !regionAllocation || timeConstraints === null || !typology) {
      return;
    }

    setIsCalculating(true);

    try {
      let input: BudgetAlgorithmInput = {
        financing: financing,
        regionAllocation: regionAllocation,
        timeConstraints,
        typology,
        carbonUnitNeeds,
        optimizeFinancing,
        optimizeRegion,
      };
      let results: BudgetOutputData | null = await runBudgetAlgo(input);
      if (results) {
      }
      const computedAdvice = await computeBudgetAdvice(input, results);

      const resultsWithAdvice: BudgetOutputData = {
        ...results,
        advice_timeline: computedAdvice[0],
        advice_financing: computedAdvice[1],
        // advice_typo: computedAdvice[2],
        advice_geography: computedAdvice[2],
      };

      if (resultsWithAdvice) {
        setBudgetResults(resultsWithAdvice);
        setHistory([
          ...history,
          [
            results.total_cost_medium,
            {
              financing,
              regionAllocation,
              timeConstraints,
              typology,
              carbonUnitNeeds,
              optimizeFinancing,
              optimizeRegion,
            },
          ],
        ]);
      }
    } catch (error) {
      console.error('Error calculating budget:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [
    financing,
    regionAllocation,
    timeConstraints,
    typology,
    optimizeFinancing,
    optimizeRegion,
    carbonUnitNeeds,
  ]);

  const value = useMemo(
    () => ({
      timeConstraints,
      setTimeConstraints,
      financing,
      setFinancing,
      optimizeFinancing,
      setOptimizeFinancing,
      optimizeRegion,
      setOptimizeRegion,
      typology,
      setTypology,
      regionAllocation,
      setRegionAllocation,
      budgetResults,
      setBudgetResults,
      isCalculating,
      setIsCalculating,
      calculateBudget,
      history,
      setHistory,
      carbonUnitNeeds,
      setCarbonUnitNeeds,
    }),
    [
      timeConstraints,
      setTimeConstraints,
      financing,
      setFinancing,
      optimizeFinancing,
      setOptimizeFinancing,
      optimizeRegion,
      setOptimizeRegion,
      typology,
      setTypology,
      regionAllocation,
      setRegionAllocation,
      budgetResults,
      setBudgetResults,
      isCalculating,
      setIsCalculating,
      calculateBudget,
      history,
      setHistory,
      carbonUnitNeeds,
      setCarbonUnitNeeds,
    ],
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
