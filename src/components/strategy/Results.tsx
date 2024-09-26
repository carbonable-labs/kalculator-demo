'use client';

import { useStrategy } from '@/context/StrategyContext';
import Title from '../form/Title';
import CostTable from './results/CostTable';
import CostChart from './results/CostChart';
import Financing from './results/Financing';
import Typology from './results/Typology';
import Geography from './results/Geography';
import { ResultAnalysis } from './results/ResultAnalysis';
import { ACCEPTABLE_DELTA } from '@/utils/configuration';
import StrategyAdvice from './results/StrategyAdvice';

export default function StrategyResults() {
  const { strategyResults } = useStrategy();

  if (strategyResults === null) {
    return null;
  }

  const isStrategyOk =
    strategyResults.user_budget > strategyResults.total_cost_medium * ACCEPTABLE_DELTA;

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
        <StrategyAdvice
          advice={strategyResults.advice_timeline}
          isFullWidth={true}
          isGradient={true}
        />
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
