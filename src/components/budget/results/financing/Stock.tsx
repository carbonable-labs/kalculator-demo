import BarChartComponent from '@/components/common/charts/BarChart';
import { ChartTitle } from '@/components/form/Title';
import { PERCENTAGE_MAX_VALUE } from '@/utils/charts';

export default function Stock() {
  return (
    <div>
      <ChartTitle title="Stock" />
      <div className="mt-4">
        <BarChartComponent
          data={[{ spot: 90, forward: 10 }]}
          unit="%"
          maxValue={PERCENTAGE_MAX_VALUE}
        />
      </div>
    </div>
  );
}
