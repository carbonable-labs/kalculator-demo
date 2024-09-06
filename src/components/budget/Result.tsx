'use client';

import { useBudget } from '@/context/BudgetContext';
import Title from '../form/Title';
import CostTable from './results/CostTable';
import CostChart from './results/CostChart';

export default function BudgetResults() {
  const { budgetResults } = useBudget();

  if (budgetResults === null) {
    return null;
  }

  return (
    <>
      <Title title="Results" subtitle="Based on carbon forecasts scenarios" />
      <div className="mt-12">
        <CostTable />
      </div>
      <div className="mt-12">
        <CostChart />
      </div>
    </>
  );
}
