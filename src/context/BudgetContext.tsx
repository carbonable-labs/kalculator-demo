'use client';

import { createContext, useContext, useState } from 'react';

interface BudgetContextType {
  timeConstraints: number | null;
  setTimeConstraints: (value: number | null) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeConstraints, setTimeConstraints] = useState<number | null>(null);

  return (
    <BudgetContext.Provider value={{ timeConstraints, setTimeConstraints }}>
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
