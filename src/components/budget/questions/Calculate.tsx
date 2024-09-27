'use client';

import { useEffect, useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { GreenButton } from '@/components/form/Button';

export default function CalculateBudget() {
  const [canCalculate, setCanCalculate] = useState(false);
  const {
    financing,
    regionAllocation,
    timeConstraints,
    typology,
    isCalculating,
    calculateBudget,
    setHistory,
  } = useBudget();

  useEffect(() => {
    if (financing && regionAllocation && timeConstraints !== null && typology) {
      setCanCalculate(true);
      setHistory([]);
    } else {
      setCanCalculate(false);
    }
  }, [financing, regionAllocation, timeConstraints, typology]);

  return (
    <GreenButton disabled={!canCalculate} isLoading={isCalculating} onClick={calculateBudget}>
      Calculate
    </GreenButton>
  );
}
