'use client';
import PieChartComponent from '@/components/common/charts/PieChart';
import { ChartTitle } from '@/components/form/Title';
import { useBudget } from '@/context/BudgetContext';

export default function Cost() {
  const { budgetResults } = useBudget();

  if (budgetResults === null) {
    return null;
  }

  const total =
    budgetResults.cost_nbs_avoidance +
    budgetResults.cost_nbs_removal +
    budgetResults.cost_dac +
    budgetResults.cost_biochar +
    budgetResults.cost_renewable_energy;

  const nbsAvoidancePercentage = Math.round((budgetResults.cost_nbs_avoidance / total) * 100);

  const nbsRemovalPercentage = Math.round((budgetResults.cost_nbs_removal / total) * 100);

  const renewableEnergyPercentage = Math.round((budgetResults.cost_nbs_avoidance / total) * 100);

  const biocharPercentage = Math.round((budgetResults.cost_biochar / total) * 100);

  const dacPercentage = Math.round((budgetResults.cost_dac / total) * 100);

  return (
    <div>
      <ChartTitle title="Costs" />
      <div className="mt-4">
        <PieChartComponent
          data={[
            {
              nbsRemoval: nbsRemovalPercentage,
              nbsAvoidance: nbsAvoidancePercentage,
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
