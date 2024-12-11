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
    carbonUnitNeeds,
    calculateBudget,
    setHistory,
  } = useBudget();

  useEffect(() => {
    const hasValidCarbonNeeds = carbonUnitNeeds && Object.keys(carbonUnitNeeds).length > 0;
    const isTypologyInvalid = typology && Object.values(typology).every((value) => value === 0);

    if (
      financing &&
      regionAllocation &&
      timeConstraints !== null &&
      typology &&
      !isTypologyInvalid &&
      hasValidCarbonNeeds
    ) {
      setCanCalculate(true);
      setHistory([]);
    } else {
      setCanCalculate(false);
    }
  }, [financing, regionAllocation, timeConstraints, typology, carbonUnitNeeds]);

  return (
    <GreenButton disabled={!canCalculate} isLoading={isCalculating} onClick={calculateBudget}>
      Calculate
    </GreenButton>
  );
}
