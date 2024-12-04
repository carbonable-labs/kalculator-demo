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
    strategyResults.typologies.nbsAvoidance +
    strategyResults.typologies.nbsRemoval +
    strategyResults.typologies.dac +
    strategyResults.typologies.biochar;

  const nbsPercentage = Math.round((strategyResults.typologies.nbsRemoval / total) * 100);

  const renewableEnergyPercentage = Math.round(
    (strategyResults.typologies.nbsAvoidance / total) * 100,
  );

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
              renewableEnergy: renewableEnergyPercentage,
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
