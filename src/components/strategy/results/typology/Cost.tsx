'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';

export default function Cost() {
  const { strategyResults } = useStrategy();

  if (strategyResults === null) {
    return null;
  }

  const total =
    strategyResults.cost_nbs_avoidance +
    strategyResults.cost_nbs_removal +
    strategyResults.cost_dac +
    strategyResults.cost_biochar;

  const nbsPercentage = Math.round((strategyResults.cost_nbs_avoidance / total) * 100);

  const renewablePercentage = Math.round((strategyResults.cost_nbs_removal / total) * 100);

  const biocharPercentage = Math.round((strategyResults.cost_biochar / total) * 100);

  const dacPercentage = Math.round((strategyResults.cost_dac / total) * 100);

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
