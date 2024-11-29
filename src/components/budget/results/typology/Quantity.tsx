'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useBudget } from '@/context/BudgetContext';

export default function Quantity() {
  const { budgetResults } = useBudget();

  if (budgetResults === undefined || budgetResults?.typologies === undefined) {
    return null;
  }

  const total =
    budgetResults.typologies.nbsAvoidance +
    budgetResults.typologies.nbsRemoval +
    budgetResults.typologies.dac +
    budgetResults.typologies.biochar;

  const nbsPercentage = Math.round((budgetResults.typologies.nbsRemoval / total) * 100);

  const renewablePercentage = Math.round((budgetResults.typologies.nbsAvoidance / total) * 100);

  const biocharPercentage = Math.round((budgetResults.typologies.biochar / total) * 100);

  const dacPercentage = Math.round((budgetResults.typologies.dac / total) * 100);

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
