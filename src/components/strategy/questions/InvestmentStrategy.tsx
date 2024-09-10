'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_FINANCING } from '@/utils/configuration';
import Title from '@/components/form/Title';
import SliderComponent from '@/components/form/Slider';
import DontKnowCheckbox from '@/components/form/DontKnowCheckbox';
import { useStrategy } from '@/context/StrategyContext';
import { tooltip } from '@/components/common/tootips/InvestmentStrategyTooltip';

export default function InvestmentStrategy() {
  const [investmentStrategy, setInvestmentStrategy] = useState<number | number[]>(50);
  const [formattedInvestmentStrategy, setFormattedInvestmentStrategy] = useState<number>(50);
  const [isDontKnowSelected, setIsDontKnowSelected] = useState<boolean>(false);
  const { setFinancing } = useStrategy();

  useEffect(() => {
    setFormattedInvestmentStrategy(investmentStrategy as number);
  }, [investmentStrategy]);

  useEffect(() => {
    if (isDontKnowSelected) {
      setFinancing(DEFAULT_FINANCING);
      setFormattedInvestmentStrategy(DEFAULT_FINANCING.financingExAnte * 100);
    } else {
      setFinancing({
        financingExAnte: formattedInvestmentStrategy / 100,
        financingExPost: (100 - formattedInvestmentStrategy) / 100,
      });
    }
  }, [isDontKnowSelected, formattedInvestmentStrategy]);

  return (
    <>
      <Title
        title="3. On Spot vs Forward Finance"
        subtitle="Please select your investment strategy split"
        tooltip={tooltip}
      />
      <div className="mt-8 w-full">
        <SliderComponent
          value={formattedInvestmentStrategy}
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
            {formattedInvestmentStrategy}% Forward
          </div>
          <div className={`text-secondary ${isDontKnowSelected ? 'opacity-50' : ''}`}>
            {100 - formattedInvestmentStrategy}% Spot
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
