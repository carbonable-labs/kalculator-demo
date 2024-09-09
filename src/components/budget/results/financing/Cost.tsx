'use client';
import BarChartComponent from '@/components/common/charts/BarChart';
import { ChartTitle } from '@/components/form/Title';
import { useBudget } from '@/context/BudgetContext';
import { PERCENTAGE_MAX_VALUE } from '@/utils/charts';

export default function Cost() {
  const { budgetResults } = useBudget();

  if (budgetResults === null) {
    return null;
  }

  const exPostPercentage = Math.round(
    (budgetResults.cost_ex_post / (budgetResults.cost_ex_post + budgetResults.cost_ex_ante)) * 100,
  );

  return (
    <div>
      <ChartTitle title="Costs" />
      <div className="mt-4">
        <BarChartComponent
          data={[{ spot: exPostPercentage, forward: 100 - exPostPercentage }]}
          unit="%"
          maxValue={PERCENTAGE_MAX_VALUE}
        />
      </div>
    </div>
  );
}
