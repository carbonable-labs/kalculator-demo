'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';

export default function Cost() {
  const { startegyResults } = useStrategy();

  if (startegyResults === null) {
    return null;
  }

  const total =
    startegyResults.cost_nbs_avoidance +
    startegyResults.cost_nbs_removal +
    startegyResults.cost_dac +
    startegyResults.cost_biochar;

  const nbsPercentage = Math.round((startegyResults.cost_nbs_avoidance / total) * 100);

  const renewablePercentage = Math.round((startegyResults.cost_nbs_removal / total) * 100);

  const biocharPercentage = Math.round((startegyResults.cost_biochar / total) * 100);

  const dacPercentage = Math.round((startegyResults.cost_dac / total) * 100);

  return (
    <div>
      <ChartTitle title="Costs" />
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
