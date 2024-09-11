'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';

export default function Quantity() {
  const { startegyResults } = useStrategy();

  if (startegyResults === undefined || startegyResults?.typologies === undefined) {
    return null;
  }

  const total =
    startegyResults.typologies.nbs_avoidance +
    startegyResults.typologies.nbs_removal +
    startegyResults.typologies.dac +
    startegyResults.typologies.biochar;

  const nbsPercentage = Math.round((startegyResults.typologies.nbs_removal / total) * 100);

  const renewablePercentage = Math.round((startegyResults.typologies.nbs_avoidance / total) * 100);

  const biocharPercentage = Math.round((startegyResults.typologies.biochar / total) * 100);

  const dacPercentage = Math.round((startegyResults.typologies.dac / total) * 100);

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
