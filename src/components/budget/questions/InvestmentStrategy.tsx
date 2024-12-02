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
  const { financing, setFinancing, setOptimizeFinancing } = useBudget();

  useEffect(() => {
    if (isDontKnowSelected) {
      setFinancing(DEFAULT_FINANCING);
      setOptimizeFinancing(true);
      console.log("setOptimize true");
    } else {
      setFinancing({
        exAnte: (investmentStrategy as number) / 100,
        exPost: (100 - (investmentStrategy as number)) / 100,
      });
      console.log("setOptimize false");
      setOptimizeFinancing(false);
    }
  }, [isDontKnowSelected, investmentStrategy]);

  useEffect(() => {
    if (financing) {
      setInvestmentStrategy(financing.exAnte * 100);
    }
  }, [financing]);

  return (
    <>
      <Title
        title="3. On Spot vs Forward Finance"
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
            {investmentStrategy as number}% Forward
          </div>
          <div className={`text-secondary ${isDontKnowSelected ? 'opacity-50' : ''}`}>
            {100 - (investmentStrategy as number)}% Spot
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
