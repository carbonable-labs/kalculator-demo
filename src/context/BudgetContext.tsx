'use client';

import { Financing, Typology } from '@/types';
import { createContext, useContext, useState } from 'react';

interface BudgetContextType {
  timeConstraints: number | null;
  setTimeConstraints: (value: number | null) => void;
  financing: Financing;
  setFinancing: (value: Financing) => void;
  typology: Typology;
  setTypology: (value: Typology) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeConstraints, setTimeConstraints] = useState<number | null>(null);
  const [financing, setFinancing] = useState<Financing>({
    financingExAnte: 0.5,
    financingExPost: 0.5,
  });
  const [typology, setTypology] = useState<Typology>({
    nbsRemoval: 0.85,
    nbsAvoidance: 0.10,
    biochar: 0,
    dac: 0.05,
  });

  console.log('typology', typology);
  return (
    <BudgetContext.Provider
      value={{
        timeConstraints,
        setTimeConstraints,
        financing,
        setFinancing,
        typology,
        setTypology,
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
