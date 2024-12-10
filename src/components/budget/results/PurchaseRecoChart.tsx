'use client';

import { useBudget } from '@/context/BudgetContext';
import { CostByYearAndFinancing, CostByYearAndRegion, CostByYearAndTypology } from '@/types/types';
import {
  calculateCostsByYearAndFinancing,
  calculateCostsByYearAndRegion,
  calculateCostsByYearAndTypology,
} from '@/utils/calculations';
import { useEffect, useState } from 'react';
import FilteredCostChart from './FilteredCostChart';
import { ChartTitle } from '@/components/form/Title';

export default function PurchaseRecoChart() {
  const { budgetResults } = useBudget();
  const [costPerType, setCostPerType] = useState<CostByYearAndTypology | undefined>(undefined);
  const [costPerFinancing, setCostPerFinancing] = useState<CostByYearAndFinancing | undefined>(
    undefined,
  );
  const [costPerGeography, setCostPerGeography] = useState<CostByYearAndRegion | undefined>(
    undefined,
  );

  useEffect(() => {
    if (budgetResults) {
      setCostPerType(calculateCostsByYearAndTypology(budgetResults?.strategies));
      setCostPerFinancing(calculateCostsByYearAndFinancing(budgetResults?.strategies));
      setCostPerGeography(calculateCostsByYearAndRegion(budgetResults?.strategies));
    }
  }, [budgetResults]);

  return (
    <>
      <ChartTitle title="Forecasted Orders Evolutions ($)" />
      <FilteredCostChart
        costPerType={costPerType}
        costPerFinancing={costPerFinancing}
        costPerGeography={costPerGeography}
        budgetResults={budgetResults}
      />
    </>
  );
}
