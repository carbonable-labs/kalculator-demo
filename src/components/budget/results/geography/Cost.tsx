'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useBudget } from '@/context/BudgetContext';
import { useMemo } from 'react';
import { getCostPerRegions } from '@/utils/calculations';

export default function Cost() {
  const { budgetResults } = useBudget();

  const percentages = useMemo(() => {
    if (!budgetResults || !budgetResults.strategies) return null;

    const costs = getCostPerRegions(budgetResults.strategies);
    const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

    const calculatePercentage = (cost: number) => Math.round((cost / totalCost) * 100);

    return Object.entries(costs).reduce(
      (result, [continent, cost]) => {
        result[continent] = calculatePercentage(cost);
        return result;
      },
      {} as Record<string, number>,
    );
  }, [budgetResults]);

  if (!percentages) {
    return null;
  }

  return (
    <div>
      <ChartTitle title="Costs" />
      <div className="mt-4">
        <PieChartComponent data={[percentages]} unit="%" />
      </div>
    </div>
  );
}
