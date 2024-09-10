'use client';

import { useStrategy } from '@/context/StrategyContext';
import Title from '../form/Title';
import CostTable from './results/CostTable';
import CostChart from './results/CostChart';
import { Tips } from '../common/Tips';

export default function StrategyResults() {
  const { startegyResults } = useStrategy();

  if (startegyResults === null) {
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
        <Tips text={startegyResults.advice_timeline} isFullWidth={true} />
      </div>
    </>
  );
}
