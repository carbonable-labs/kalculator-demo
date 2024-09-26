'use client';
import React, { useCallback } from 'react';
import { Advice, Financing, RegionAllocation, TimeConstraint, Typology } from '@/types/types';
import { TipsComponent } from '@/components/common/Tips';
import { useStrategy } from '@/context/StrategyContext';

interface strategyAdviceProps {
  advice: Advice;
  isFullWidth: boolean;
  isGradient: boolean;
  title?: string;
}

const StrategyAdvice: React.FC<strategyAdviceProps> = ({
  advice,
  isFullWidth,
  isGradient,
  title = 'Tips',
}) => {
  const {
    strategyResults,
    setTimeConstraints,
    setFinancing,
    setTypology,
    setRegionAllocation,
    calculateStrategy,
  } = useStrategy();

  const handleAdvice = useCallback(
    (advice: Advice) => {
      switch (advice.adviceType) {
        case 'timeline':
          console.log('set time constraints');
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
          console.log('set geography');
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

      // Call calculateBudget after handling the specific advice
      calculateStrategy();
    },
    [setTimeConstraints, setFinancing, setTypology, setRegionAllocation, calculateStrategy],
  );

  return (
    <TipsComponent
      advice={advice}
      onAdviceApply={handleAdvice}
      shouldRender={!!strategyResults}
      isFullWidth={isFullWidth}
      isGradient={isGradient}
      title={title}
    />
  );
};

export default StrategyAdvice;
