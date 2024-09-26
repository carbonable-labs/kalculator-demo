'use client';

import { useEffect, useState } from 'react';
import { GreenButton } from '@/components/form/Button';
import { useStrategy } from '@/context/StrategyContext';

export default function CalculateStrategy() {
  const [isLoading, setIsLoading] = useState(false);
  const [canCalculate, setCanCalculate] = useState(false);
  const {
    financing,
    regionAllocation,
    timeConstraints,
    typology,
    budget,
    isCalculating,
    calculateStrategy,
  } = useStrategy();

  useEffect(() => {
    if (financing && regionAllocation && timeConstraints !== null && budget !== null && typology) {
      setCanCalculate(true);
    } else {
      setCanCalculate(false);
    }
  }, [financing, regionAllocation, timeConstraints, typology, budget]);

  return (
    <GreenButton disabled={!canCalculate} isLoading={isCalculating} onClick={calculateStrategy}>
      Calculate
    </GreenButton>
  );
}
