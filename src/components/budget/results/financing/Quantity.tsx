'use client';
import BarChartComponent from '@/components/common/charts/BarChart';
import { ChartTitle } from '@/components/form/Title';
import { useBudget } from '@/context/BudgetContext';
import { PERCENTAGE_MAX_VALUE } from '@/utils/charts';

export default function Quantity() {
  const { budgetResults } = useBudget();

  if (budgetResults === null || budgetResults?.financing === null) {
    return null;
  }

  const exPostPercentage = Math.round(
    (budgetResults.financing.exPost /
      (budgetResults.financing.exPost + budgetResults.financing.exAnte)) *
      100,
  );

  return (
    <div>
      <ChartTitle title="Quantity" />
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
