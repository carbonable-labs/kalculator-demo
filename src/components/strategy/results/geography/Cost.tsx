'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';
import { useMemo } from 'react';

export default function Cost() {
  const { startegyResults } = useStrategy();

  const percentages = useMemo(() => {
    if (!startegyResults) return null;

    const continents = ['africa', 'asia', 'europe', 'north_america', 'oceania', 'south_america'];

    const totalCost = continents.reduce(
      (sum, continent) => sum + (startegyResults as any)[`cost_${continent}`],
      0,
    );

    const calculatePercentage = (cost: number) => Math.round((cost / totalCost) * 100);

    return continents.reduce(
      (result, continent) => {
        result[continent] = calculatePercentage((startegyResults as any)[`cost_${continent}`]);
        return result;
      },
      {} as Record<string, number>,
    );
  }, [startegyResults]);

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
