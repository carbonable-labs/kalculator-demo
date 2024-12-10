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
          case 'region':
            if (advice.tip) {
              const tip = advice.tip as RegionAllocation;
              setRegionAllocation(tip);
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
