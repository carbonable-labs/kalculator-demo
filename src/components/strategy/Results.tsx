'use client';

import { useStrategy } from '@/context/StrategyContext';
import Title from '../form/Title';
import CostTable from './results/CostTable';
import CostChart from './results/CostChart';
import { Tips } from '../common/Tips';
import Financing from './results/Financing';
import Typology from './results/Typology';
import Geography from './results/Geography';
import { ResultAnalysis } from './results/ResultAnalysis';
import { ACCEPTABLE_DELTA } from '@/utils/configuration';

export default function StrategyResults() {
  const { startegyResults } = useStrategy();

  if (startegyResults === null) {
    return null;
  }

  const isStrategyOk =
    startegyResults.user_budget > startegyResults.total_cost_medium * ACCEPTABLE_DELTA;

  return (
    <>
      <div className="mx-auto w-8/12">
        <ResultAnalysis resultIsOk={isStrategyOk} />
      </div>
      <div className="mt-12">
        <Title title="Results" subtitle="Based on carbon forecasts scenarios" />
      </div>
      <div className="mt-12">
        <CostTable />
      </div>
      <div className="mt-12">
        <CostChart />
      </div>
      <div className="mt-4">
        <Tips text={startegyResults.advice_timeline} isFullWidth={true} />
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
    </>
  );
}
