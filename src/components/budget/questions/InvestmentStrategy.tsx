'use client';

import { useEffect, useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { DEFAULT_FINANCING } from '@/utils/configuration';
import Title from '@/components/form/Title';
import SliderComponent from '@/components/form/Slider';
import { tooltip } from '@/components/common/tootips/InvestmentStrategyTooltip';

export default function InvestmentStrategy() {
  const [investmentStrategy, setInvestmentStrategy] = useState<number | number[]>(
    DEFAULT_FINANCING.exAnte * 100,
  );
  const [selectedOption, setSelectedOption] = useState<'optimize' | 'expost' | 'custom'>('optimize');
  
  const { financing, setFinancing, setOptimizeFinancing } = useBudget();

  useEffect(() => {
    switch (selectedOption) {
      case 'optimize':
        setFinancing(DEFAULT_FINANCING);
        setInvestmentStrategy(DEFAULT_FINANCING.exAnte * 100);
        setOptimizeFinancing(true);
        break;
      case 'expost':
        setFinancing({ exAnte: 0, exPost: 1 });
        setInvestmentStrategy(0);
        setOptimizeFinancing(false);
        break;
      case 'custom':
        setFinancing({
          exAnte: (investmentStrategy as number) / 100,
          exPost: (100 - (investmentStrategy as number)) / 100,
        });
        setOptimizeFinancing(false);
        break;
    }
  }, [selectedOption, investmentStrategy, setFinancing, setOptimizeFinancing]);

  return (
    <div className="w-full">
      <Title
        title="5. On Spot vs Forward Finance"
        subtitle="Please select your investment strategy"
        tooltip={tooltip}
      />
      
      <div className="mt-6">
        <div className="grid grid-cols-3 gap-4">
          <label className="flex flex-col p-4 rounded-lg border border-transparent hover:border-gray-200 transition-colors h-full">
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="investmentStrategy"
                checked={selectedOption === 'optimize'}
                onChange={() => setSelectedOption('optimize')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Let Carbonable optimize the ratio</div>
                <div className="text-xs text-gray-600 mt-1">(suggested)</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-2 pl-6">
              Our algorithm will find the optimal balance
            </div>
          </label>

          <label className="flex flex-col p-4 rounded-lg border border-transparent hover:border-gray-200 transition-colors h-full">
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="investmentStrategy"
                checked={selectedOption === 'expost'}
                onChange={() => setSelectedOption('expost')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Ex-Post only</div>
                <div className="text-xs text-gray-600 mt-1">100% on-spot financing</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-2 pl-6">
              No forward financing
            </div>
          </label>

          <label className="flex flex-col p-4 rounded-lg border border-transparent hover:border-gray-200 transition-colors h-full opacity-80 hover:opacity-100">
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="investmentStrategy"
                checked={selectedOption === 'custom'}
                onChange={() => setSelectedOption('custom')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Choose the ratio</div>
                <div className="text-xs text-gray-600 mt-1">(advanced)</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-2 pl-6">
              Manual balance setting
            </div>
          </label>
        </div>

        {selectedOption === 'custom' && (
          <div className="mt-6 px-4">
            <SliderComponent
              value={investmentStrategy as number}
              label="Investment Strategy"
              maxValue={100}
              minValue={0}
              onChange={setInvestmentStrategy}
              size="md"
              step={1}
              isDisabled={selectedOption !== 'custom'}
              displayType="plain"
            />
            <div className="flex justify-between text-sm uppercase mt-2">
              <div className="text-primary">
                {Math.round(investmentStrategy as number)}% Forward
              </div>
              <div className="text-secondary">
                {Math.round(100 - (investmentStrategy as number))}% Spot
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}