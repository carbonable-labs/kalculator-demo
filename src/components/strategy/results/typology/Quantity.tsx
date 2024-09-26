'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';

export default function Quantity() {
  const { strategyResults } = useStrategy();

  if (strategyResults === undefined || strategyResults?.typologies === undefined) {
    return null;
  }

  const total =
    strategyResults.typologies.nbs_avoidance +
    strategyResults.typologies.nbs_removal +
    strategyResults.typologies.dac +
    strategyResults.typologies.biochar;

  const nbsPercentage = Math.round((strategyResults.typologies.nbs_removal / total) * 100);

  const renewablePercentage = Math.round((strategyResults.typologies.nbs_avoidance / total) * 100);

  const biocharPercentage = Math.round((strategyResults.typologies.biochar / total) * 100);

  const dacPercentage = Math.round((strategyResults.typologies.dac / total) * 100);

  return (
    <div>
      <ChartTitle title="Quantity" />
      <div className="mt-4">
        <PieChartComponent
          data={[
            {
              nbs: nbsPercentage,
              renewable: renewablePercentage,
              biochar: biocharPercentage,
              dac: dacPercentage,
            },
          ]}
          unit="%"
        />
      </div>
    </div>
  );
}
