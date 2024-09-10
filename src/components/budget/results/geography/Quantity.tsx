'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useBudget } from '@/context/BudgetContext';
import { continents } from '@/utils/configuration';
import { useMemo } from 'react';

export default function Quantity() {
  const { budgetResults } = useBudget();

  const percentages = useMemo(() => {
    if (!budgetResults) return null;

    const totalCost = continents.reduce(
      (sum, continent) => sum + (budgetResults.regions as any)[continent],
      0,
    );

    const calculatePercentage = (cost: number) => Math.round((cost / totalCost) * 100);

    return continents.reduce(
      (result, continent) => {
        result[continent] = calculatePercentage((budgetResults.regions as any)[continent]);
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
