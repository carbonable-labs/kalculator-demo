'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { Advice, Financing, RegionAllocation, TimeConstraint, Typology } from '@/types/types';
import { TipsComponent } from '@/components/common/Tips';

interface budgetAdviceProps {
  advice: Advice;
  isFullWidth: boolean;
  isGradient: boolean;
  title?: string;
}

const BudgetAdvice: React.FC<budgetAdviceProps> = ({
  advice,
  isFullWidth,
  isGradient,
  title = 'Tip',
}) => {
  const {
    budgetResults,
    setTimeConstraints,
    setFinancing,
    setTypology,
    setRegionAllocation,
    calculateBudget,
    financing,
    typology,
    regionAllocation,
    timeConstraints,
  } = useBudget();

  const [canCalculate, setCanCalculate] = useState(false);

  const handleAdvice = useCallback(
    (advice: Advice) => {
      switch (advice.adviceType) {
        case 'timeline':
          setTimeConstraints(advice.tip as TimeConstraint);
          break;
        case 'financing':
          setFinancing(advice.tip as Financing);
          break;
        case 'typology':
          if (advice.tip) {
            const tip = advice.tip as Typology[];
            if (tip.length > 0) {
              setTypology(tip[0]);
            }
          }
          break;
        case 'geography':
          if (advice.tip) {
            const tip = advice.tip as RegionAllocation[];
            if (tip.length > 0) {
              setRegionAllocation(tip[0]);
            }
          }
          break;
        default:
          console.log('Unknown advice type:', advice.adviceType);
      }

      setCanCalculate(true);
    },
    [advice],
  );

  useEffect(() => {
    if (financing && regionAllocation && timeConstraints && typology && canCalculate) {
      calculateBudget();
      setCanCalculate(false);
    }
  }, [financing && regionAllocation && timeConstraints && typology && canCalculate]);

  return (
    <TipsComponent
      advice={advice}
      onAdviceApply={handleAdvice}
      shouldRender={!!budgetResults}
      isFullWidth={isFullWidth}
      isGradient={isGradient}
      title={title}
    />
  );
};

export default BudgetAdvice;
