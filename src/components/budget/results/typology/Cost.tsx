'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useBudget } from '@/context/BudgetContext';

export default function Cost() {
  const { budgetResults } = useBudget();

  if (budgetResults === null) {
    return null;
  }

  const totalNbs = budgetResults.cost_nbs_avoidance + budgetResults.cost_nbs_removal;

  const nbsPercentage = Math.round(
    (totalNbs / (totalNbs + budgetResults.cost_dac + budgetResults.cost_biochar)) * 100,
  );

  const biocharPercentage = Math.round(
    (budgetResults.cost_biochar /
      (totalNbs + budgetResults.cost_dac + budgetResults.cost_biochar)) *
      100,
  );

  const dacPercentage = Math.round(
    (budgetResults.cost_dac / (totalNbs + budgetResults.cost_dac + budgetResults.cost_biochar)) *
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
