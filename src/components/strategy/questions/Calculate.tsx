'use client';

import { useEffect, useState } from 'react';
import { runBudgetAlgo } from '@/actions/budget';
import { GreenButton } from '@/components/form/Button';
import { useStrategy } from '@/context/StrategyContext';
import { runStratAlgo } from '@/actions/strat';

export default function CalculateStrategy() {
  const [isLoading, setIsLoading] = useState(false);
  const [canCalculate, setCanCalculate] = useState(false);
  const { financing, regionAllocation, timeConstraints, typology, budget, setStrategyResults } =
    useStrategy();

  useEffect(() => {
    if (financing && regionAllocation && timeConstraints !== null && budget !== null && typology) {
      setCanCalculate(true);
    } else {
      setCanCalculate(false);
    }
  }, [financing, regionAllocation, timeConstraints, typology, budget]);

  const handleClick = async () => {
    setIsLoading(true);

    if (
      financing === null ||
      !regionAllocation ||
      !timeConstraints ||
      !typology ||
      budget === null
    ) {
      setIsLoading(false);
      return;
    }

    const stratResult = await runStratAlgo({
      budget,
      financing,
      regionAllocation,
      timeConstraints,
      typology,
    });

    setStrategyResults(stratResult);

    setIsLoading(false);
  };

  return (
    <GreenButton disabled={!canCalculate} isLoading={isLoading} onClick={handleClick}>
      Calculate
    </GreenButton>
  );
}
