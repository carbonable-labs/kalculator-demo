import BarChartComponent from '@/components/common/charts/BarChart';
import { ChartTitle } from '@/components/form/Title';
import { useBudget } from '@/context/BudgetContext';
import { PERCENTAGE_MAX_VALUE } from '@/utils/charts';

export default function Quantity() {
  const { budgetResults } = useBudget();

  return (
    <div>
      <ChartTitle title="Quantity" />
      <div className="mt-4">
        <BarChartComponent
          data={[{ spot: 80, forward: 20 }]}
          unit="%"
          maxValue={PERCENTAGE_MAX_VALUE}
        />
      </div>
    </div>
  );
}
