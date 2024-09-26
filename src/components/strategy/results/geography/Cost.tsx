'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';
import { continents } from '@/utils/configuration';
import { useMemo } from 'react';

export default function Cost() {
  const { strategyResults } = useStrategy();

  const percentages = useMemo(() => {
    if (!strategyResults) return null;

    const totalCost = continents.reduce(
      (sum, continent) => sum + (strategyResults as any)[`cost_${continent}`],
      0,
    );

    const calculatePercentage = (cost: number) => Math.round((cost / totalCost) * 100);

    return continents.reduce(
      (result, continent) => {
        result[continent] = calculatePercentage((strategyResults as any)[`cost_${continent}`]);
        return result;
      },
      {} as Record<string, number>,
    );
  }, [strategyResults]);

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
