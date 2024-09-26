'use client';

import { useBudget } from '@/context/BudgetContext';
import Title from '../form/Title';
import CostTable from './results/CostTable';
import CostChart from './results/CostChart';
import Financing from './results/Financing';
import Typology from './results/Typology';
import Geography from './results/Geography';
import PurchaseRecoTable from './results/PurchaseRecoTable';
import BudgetAdvice from './results/BudgetAdvice';

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
      <div className="mt-4">
        <BudgetAdvice advice={budgetResults.advice_timeline} isFullWidth={true} isGradient={true} />
      </div>
      <div className="mt-12">
        <Financing />
      </div>
      <div className="mt-12">
        <Typology />
      </div>
      <div className="mt-12">
        <Geography />
      </div>
      <div className="mt-12">
        <PurchaseRecoTable />
      </div>
      <div className="mt-12">
        <BudgetAdvice
          advice={{
            change: true,
            tipPhrase: 'Do you wish to fine-tune the above strategy?',
            actionText: 'Optimize',
          }}
          isFullWidth={true}
          isGradient={false}
          title="Optimizer"
        />
      </div>
    </>
  );
}
