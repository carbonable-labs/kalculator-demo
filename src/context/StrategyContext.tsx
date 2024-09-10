'use client';

import { createContext, useContext, useState } from 'react';

interface StrategyContextType {
  budget: number;
  setBudget: (budget: number) => void;
}

const StrategyContext = createContext<StrategyContextType | undefined>(undefined);

export const StrategyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budget, setBudget] = useState<number>(0);

  return (
    <StrategyContext.Provider
      value={{
        budget,
        setBudget,
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
