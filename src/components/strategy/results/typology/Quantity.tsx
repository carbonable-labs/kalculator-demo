'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';

export default function Quantity() {
  const { startegyResults } = useStrategy();

  if (startegyResults === undefined || startegyResults?.typologies === undefined) {
    return null;
  }

  const totalNbs =
    startegyResults.typologies.nbs_avoidance + startegyResults.typologies.nbs_removal;

  const nbsPercentage = Math.round(
    (totalNbs / (totalNbs + startegyResults.typologies.dac + startegyResults.typologies.biochar)) *
      100,
  );

  const biocharPercentage = Math.round(
    (startegyResults.typologies.biochar /
      (totalNbs + startegyResults.typologies.dac + startegyResults.typologies.biochar)) *
      100,
  );

  const dacPercentage = Math.round(
    (startegyResults.typologies.dac /
      (totalNbs + startegyResults.typologies.dac + startegyResults.typologies.biochar)) *
      100,
  );

  return (
    <div>
      <ChartTitle title="Quantity" />
      <div className="mt-4">
        <PieChartComponent
          data={[{ nbs: nbsPercentage, biochar: biocharPercentage, dac: dacPercentage }]}
          unit="%"
        />
      </div>
    </div>
  );
}
