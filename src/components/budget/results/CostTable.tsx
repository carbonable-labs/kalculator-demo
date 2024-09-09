'use client';

import { useBudget } from '@/context/BudgetContext';
import { formatLargeNumber } from '@/utils/output';

export default function CostTable() {
  const { budgetResults } = useBudget();
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
          $ {formatLargeNumber(budgetResults?.total_cost_low)}
        </div>
        <div className="font-bold text-blue-500">
          $ {formatLargeNumber(budgetResults?.total_cost_medium)}
        </div>
        <div className="font-bold text-orange-500">
          $ {formatLargeNumber(budgetResults?.total_cost_high)}
        </div>
        <div className="pl-4 text-left font-light text-neutral-300">Average yearly cost</div>
        <div className="">$ {formatLargeNumber(budgetResults?.average_yearly_cost_low)}</div>
        <div className="">$ {formatLargeNumber(budgetResults?.average_yearly_cost_medium)}</div>
        <div className="">$ {formatLargeNumber(budgetResults?.average_yearly_cost_high)}</div>
        <div className="pl-4 text-left font-light text-neutral-300">Average Price per ton</div>
        <div className="">$ {formatLargeNumber(budgetResults?.average_price_per_ton_low)}</div>
        <div className="">$ {formatLargeNumber(budgetResults?.average_price_per_ton_medium)}</div>
        <div className="">$ {formatLargeNumber(budgetResults?.average_price_per_ton_high)}</div>
      </div>
    </div>
  );
}
