'use client';

import { useEffect, useState } from 'react';
import SliderComponent from '../form/Slider';
import Title from '../form/Title';
import DontKnowCheckbox from '../form/DontKnowCheckbox';
import { useBudget } from '@/context/BudgetContext';
import { DEFAULT_FINANCING } from '@/utils/configuration';

export default function InvestmentStrategy() {
  const [investmentStrategy, setInvestmentStrategy] = useState<number | number[]>(50);
  const [formattedInvestmentStrategy, setFormattedInvestmentStrategy] = useState<number>(50);
  const [isDontKnowSelected, setIsDontKnowSelected] = useState<boolean>(false);
  const { setFinancing } = useBudget();

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
        title="2. On Spot vs Forward Finance"
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
          displayType='plain'
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

const tooltip = (
  <div>
    <div>
      <div className="font-bold">Carbon Units Overview:</div>
      <div className="mt-1 text-tiny">
        <div>&bull; Carbon units can be purchased on spot or via forward funding.</div>
        <div>
          &bull; Spot units are linked to verified climate impacts that have already been audited,
          while forward units are tied to future impacts generated through your funding.
        </div>
        <div>&bull; Spot units are typically more expensive due to their certainty.</div>
      </div>
    </div>
    <div className="mt-4">
      <div className="font-bold">Strategic Considerations:</div>
      <div className="mt-1 text-tiny">
        Your strategy should balance risk tolerance and your interest in contributing to future
        impact creation:
        <div className="mt-1">
          &bull; A low risk tolerance suggests focusing on spot units, ensuring verified impacts.
        </div>
        <div>
          &bull; If you seek to actively create future impact and are comfortable with some
          uncertainty, forward units align with that goal while offering potential cost savings.
        </div>
      </div>
    </div>
  </div>
);
