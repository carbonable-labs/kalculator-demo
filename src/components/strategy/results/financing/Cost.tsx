'use client';
import BarChartComponent from '@/components/common/charts/BarChart';
import { ChartTitle } from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';
import { PERCENTAGE_MAX_VALUE } from '@/utils/charts';

export default function Cost() {
  const { startegyResults } = useStrategy();

  if (startegyResults === null) {
    return null;
  }

  const exPostPercentage = Math.round(
    (startegyResults.cost_ex_post / (startegyResults.cost_ex_post + startegyResults.cost_ex_ante)) *
      100,
  );

  return (
    <div>
      <ChartTitle title="Costs" />
      <div className="mt-4">
        <BarChartComponent
          data={[{ spot: exPostPercentage, forward: 100 - exPostPercentage }]}
          unit="%"
          maxValue={PERCENTAGE_MAX_VALUE}
        />
      </div>
    </div>
  );
}
