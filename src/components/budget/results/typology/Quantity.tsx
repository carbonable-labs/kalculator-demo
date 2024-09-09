'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useBudget } from '@/context/BudgetContext';

export default function Quantity() {
  const { budgetResults } = useBudget();

  if (budgetResults === undefined || budgetResults?.typologies === undefined) {
    return null;
  }

  const totalNbs = budgetResults.typologies.nbs_avoidance + budgetResults.typologies.nbs_removal;

  const nbsPercentage = Math.floor(
    (totalNbs / (totalNbs + budgetResults.typologies.dac + budgetResults.typologies.biochar)) * 100,
  );

  const biocharPercentage = Math.floor(
    (budgetResults.typologies.biochar /
      (totalNbs + budgetResults.typologies.dac + budgetResults.typologies.biochar)) *
      100,
  );

  const dacPercentage = Math.floor(
    (budgetResults.typologies.dac /
      (totalNbs + budgetResults.typologies.dac + budgetResults.typologies.biochar)) *
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
