'use client';
import Title from '@/components/form/Title';
import Quantity from './geography/Quantity';
import Cost from './geography/Cost';
import { useStrategy } from '@/context/StrategyContext';
import StrategyAdvice from './StrategyAdvice';

export default function Geography() {
  const { strategyResults } = useStrategy();

  if (strategyResults === null) {
    return null;
  }

  return (
    <>
      <Title title="By Geography" />
      <div className="mt-8 flex items-end">
        <div className="w-full md:w-5/12">
          <Quantity />
        </div>
        <div className="w-full md:w-5/12">
          <Cost />
        </div>
        <div className="w-full pb-4 md:w-2/12">
          <StrategyAdvice
            advice={strategyResults.advice_geography}
            isFullWidth={false}
            isGradient={true}
          />
        </div>
      </div>
    </>
  );
}
