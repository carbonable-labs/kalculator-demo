'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';

export default function Cost() {
  const { startegyResults } = useStrategy();

  if (startegyResults === null) {
    return null;
  }

  const totalNbs = startegyResults.cost_nbs_avoidance + startegyResults.cost_nbs_removal;

  const nbsPercentage = Math.round(
    (totalNbs / (totalNbs + startegyResults.cost_dac + startegyResults.cost_biochar)) * 100,
  );

  const biocharPercentage = Math.round(
    (startegyResults.cost_biochar /
      (totalNbs + startegyResults.cost_dac + startegyResults.cost_biochar)) *
      100,
  );

  const dacPercentage = Math.round(
    (startegyResults.cost_dac /
      (totalNbs + startegyResults.cost_dac + startegyResults.cost_biochar)) *
      100,
  );

  return (
    <div>
      <ChartTitle title="Costs" />
      <div className="mt-4">
        <PieChartComponent
          data={[{ nbs: nbsPercentage, biochar: biocharPercentage, dac: dacPercentage }]}
          unit="%"
        />
      </div>
    </div>
  );
}
