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
import { formatLargeNumber } from '@/utils/output';
import { title } from 'process';

export default function BudgetResults() {
  const { budgetResults, history } = useBudget();

  if (budgetResults === null) {
    return null;
  }

  let savings = 0;
  let title: string = 'Optimizer';
  if (history.length > 1) {
    const first = history[0];
    const last = history[history.length - 1];
    savings = first[0] - last[0];
  }
  if (savings > 0) {
    title = `Kudos! You already saved ${formatLargeNumber(savings)}`;
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
          title={title}
        />
      </div>
    </>
  );
}
