'use client';
import BarChartComponent from '@/components/common/charts/BarChart';
import { ChartTitle } from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';
import { PERCENTAGE_MAX_VALUE } from '@/utils/charts';

export default function Quantity() {
  const { strategyResults } = useStrategy();

  if (strategyResults === null || strategyResults?.financing === null) {
    return null;
  }

  const exPostPercentage = Math.round(
    (strategyResults.financing.ex_post /
      (strategyResults.financing.ex_post + strategyResults.financing.ex_ante)) *
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
