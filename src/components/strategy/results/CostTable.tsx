'use client';

import { useStrategy } from '@/context/StrategyContext';
import { formatLargeNumber } from '@/utils/output';

export default function CostTable() {
  const { strategyResults } = useStrategy();

  const deltaLow = calculateDeltaWithBudget(
    strategyResults?.total_cost_low,
    strategyResults?.user_budget,
  );

  const deltaMedium = calculateDeltaWithBudget(
    strategyResults?.total_cost_medium,
    strategyResults?.user_budget,
  );

  const deltaHigh = calculateDeltaWithBudget(
    strategyResults?.total_cost_high,
    strategyResults?.user_budget,
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-4 text-center">
        <div></div>
        <div className="text-xl font-bold">Low</div>
        <div className="text-xl font-bold">Medium</div>
        <div className="text-xl font-bold">High</div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-y-8 rounded-lg border border-opacityLight-20 bg-opacityLight-5 py-8 text-center">
        <div className="pl-4 text-left font-light text-neutral-300">Total Cost: 2050</div>
        <div className="font-bold text-green-500">
          $ {formatLargeNumber(strategyResults?.total_cost_low)}
        </div>
        <div className="font-bold text-blue-500">
          $ {formatLargeNumber(strategyResults?.total_cost_medium)}
        </div>
        <div className="font-bold text-orange-500">
          $ {formatLargeNumber(strategyResults?.total_cost_high)}
        </div>
        <div className="pl-4 text-left font-light text-neutral-300">Average yearly cost</div>
        <div className="">$ {formatLargeNumber(strategyResults?.average_yearly_cost_low)}</div>
        <div className="">$ {formatLargeNumber(strategyResults?.average_yearly_cost_medium)}</div>
        <div className="">$ {formatLargeNumber(strategyResults?.average_yearly_cost_high)}</div>
        <div className="pl-4 text-left font-light text-neutral-300">Average Price per ton</div>
        <div className="">$ {formatLargeNumber(strategyResults?.average_price_per_ton_low)}</div>
        <div className="">$ {formatLargeNumber(strategyResults?.average_price_per_ton_medium)}</div>
        <div className="">$ {formatLargeNumber(strategyResults?.average_price_per_ton_high)}</div>
        <div className="pl-4 text-left font-light text-neutral-300">DELTA with budget</div>
        <div className={`text-sm ${deltaLow < 0 ? 'text-red-700' : 'text-green-500'}`}>
          {deltaLow < 0 ? `${deltaLow}` : `+ ${deltaLow}`} %
        </div>
        <div className={`text-sm ${deltaMedium < 0 ? 'text-red-700' : 'text-green-500'}`}>
          {deltaMedium < 0 ? `${deltaMedium}` : `+ ${deltaMedium}`} %
        </div>
        <div className={`text-sm ${deltaHigh < 0 ? 'text-red-700' : 'text-green-500'}`}>
          {deltaHigh < 0 ? `${deltaHigh}` : `+ ${deltaHigh}`} %
        </div>
      </div>
    </div>
  );
}

function calculateDeltaWithBudget(budget: number | undefined, cost: number | undefined) {
  if (budget === undefined || cost === undefined) {
    return 0;
  }

  // Calclate the delta between the budget and the cost in percentage
  return Math.round(((cost - budget) / budget) * 100);
}
