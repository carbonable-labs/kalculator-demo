'use client';
import BarChartComponent from '@/components/common/charts/BarChart';
import { ChartTitle } from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';
import { PERCENTAGE_MAX_VALUE } from '@/utils/charts';

export default function Quantity() {
  const { startegyResults } = useStrategy();

  if (startegyResults === null || startegyResults?.financing === null) {
    return null;
  }

  const exPostPercentage = Math.round(
    (startegyResults.financing.ex_post /
      (startegyResults.financing.ex_post + startegyResults.financing.ex_ante)) *
      100,
  );

  return (
    <div>
      <ChartTitle title="Quantity" />
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
