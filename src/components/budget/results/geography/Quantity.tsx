'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useBudget } from '@/context/BudgetContext';
import { getQuantityPerRegions } from '@/utils/calculations';
import { useMemo } from 'react';

export default function Quantity() {
  const { budgetResults } = useBudget();

  const percentages = useMemo(() => {
    if (!budgetResults || !budgetResults.strategies) return null;

    const quantities = getQuantityPerRegions(budgetResults.strategies);

    const totalQuantity = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);

    const calculatePercentage = (quantity: number) =>
      totalQuantity > 0 ? Math.round((quantity / totalQuantity) * 100) : 0;

    return Object.keys(quantities).reduce(
      (result, region) => {
        result[region] = calculatePercentage(quantities[region as keyof typeof quantities]);
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
      <ChartTitle title="Quantity" />
      <div className="mt-4">
        <PieChartComponent data={[percentages]} unit="%" />
      </div>
    </div>
  );
}
