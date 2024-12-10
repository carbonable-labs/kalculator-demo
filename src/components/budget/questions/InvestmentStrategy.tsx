'use client';

import { useEffect, useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { DEFAULT_FINANCING } from '@/utils/configuration';
import Title from '@/components/form/Title';
import SliderComponent from '@/components/form/Slider';
import DontKnowCheckbox from '@/components/form/DontKnowCheckbox';
import { tooltip } from '@/components/common/tootips/InvestmentStrategyTooltip';

export default function InvestmentStrategy() {
  const [investmentStrategy, setInvestmentStrategy] = useState<number | number[]>(
    DEFAULT_FINANCING.exAnte * 100,
  );
  const [isDontKnowSelected, setIsDontKnowSelected] = useState<boolean>(false);
  const { financing, setFinancing, setOptimizeFinancing, optimizeFinancing } = useBudget();

  useEffect(() => {
    if (optimizeFinancing) {
      setInvestmentStrategy(financing.exAnte * 100);
      setIsDontKnowSelected(true);
    } else {
      setInvestmentStrategy(financing.exAnte * 100);
      setIsDontKnowSelected(false);
    }
  }, [optimizeFinancing]);

  useEffect(() => {
    if (isDontKnowSelected) {
      setFinancing(DEFAULT_FINANCING);
      setInvestmentStrategy(DEFAULT_FINANCING.exAnte * 100);
      setOptimizeFinancing(true);
    } else {
      setFinancing({
        exAnte: (investmentStrategy as number) / 100,
        exPost: (100 - (investmentStrategy as number)) / 100,
      });
      setOptimizeFinancing(false);
    }
  }, [isDontKnowSelected, investmentStrategy, setFinancing, setOptimizeFinancing]);

  return (
    <>
      <Title
        title="5. On Spot vs Forward Finance"
        subtitle="Please select your investment strategy split"
        tooltip={tooltip}
      />
      <div className="mt-8 w-full">
        <SliderComponent
          value={investmentStrategy as number}
          label="Investment Strategy"
          maxValue={100}
          minValue={0}
          onChange={setInvestmentStrategy}
          size="md"
          step={1}
          isDisabled={isDontKnowSelected}
          displayType="plain"
        />
        <div className="flex justify-between text-sm uppercase">
          <div className={`text-primary ${isDontKnowSelected ? 'opacity-50' : ''}`}>
            {(investmentStrategy as number).toFixed(2)}% Forward
          </div>
          <div className={`text-secondary ${isDontKnowSelected ? 'opacity-50' : ''}`}>
            {(100 - (investmentStrategy as number)).toFixed(2)}% Spot
          </div>
        </div>
        <div className="mt-8 flex items-center">
          <DontKnowCheckbox isSelected={isDontKnowSelected} setIsSelected={setIsDontKnowSelected} />
          {isDontKnowSelected && (
            <div className="ml-8 text-sm font-light italic">
              Let Carbonable offer smart recommendations
            </div>
          )}
        </div>
      </div>
    </>
  );
}
