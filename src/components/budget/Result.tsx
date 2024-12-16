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
import { Advice } from '@/types/types';
import PurchaseRecoChart from './results/PurchaseRecoChart';
import PurchaseRecoChartStock from './results/PurchaseRecoChartStock';

export default function BudgetResults() {
  const { budgetResults, history } = useBudget();

  if (budgetResults === null) {
    return null;
  }

  let canOptimize =
    budgetResults.advice_timeline.change ||
    budgetResults.advice_financing.change ||
    budgetResults.advice_typo.change ||
    budgetResults.advice_geography.change;

  let advice: Advice = {
    change: true,
    tipPhrase: canOptimize
      ? 'You should apply the suggested tips to save more.'
      : "Let's fine-tune this stratregy.",
  };

  let savings = 0;
  if (history.length > 1) {
    const first = history[0];
    const last = history[history.length - 1];
    savings = first[0] - last[0];
  }
  if (savings > 0) {
    let saving_text = `Kudos! You already saved ${formatLargeNumber(savings)}`;
    let description_text = canOptimize ? ', and you can save more.' : ". Let's fine-tune now.";

    advice.tipPhrase = saving_text + description_text;
  }

  return (
    <>
      <div className="text-4xl font-extrabold text-neutral-50">Results</div>
      <div className="mt-12">
        <CostTable />
      </div>
      {/* <div className="mt-12">
        <CostChart />
      </div> */}
      <div className="mt-24">
        <PurchaseRecoChart />
      </div>
      <div className="mt-24">
        <PurchaseRecoChartStock />
      </div>
      <div className="mt-24">
        <PurchaseRecoTable />
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
        <BudgetAdvice advice={advice} isFullWidth={true} isGradient={false} title="Optimizer" />
      </div>
    </>
  );
}
