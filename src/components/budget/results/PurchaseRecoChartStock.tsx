'use client';

import { StockByFinancing, StockByRegion, StockByYear, YearlyStock } from '@/types/types';
import {
  calculateStockByFinancing,
  calculateStockByRegion,
  calculateStockByTypology,
  calculateTotalAndCumulativeStock,
} from '@/utils/stockCalculator';
import { useEffect, useState } from 'react';
import FilteredStockChart from './FilteredStockChart';
import { useBudget } from '@/context/BudgetContext';
import { ChartTitle } from '@/components/form/Title';

export default function PurchaseRecoChartStock() {
  const { budgetResults } = useBudget();
  const [stockPerType, setStockPerType] = useState<StockByYear | undefined>(undefined);
  const [stockPerFinancing, setStockPerFinancing] = useState<StockByFinancing | undefined>(
    undefined,
  );
  const [stockPerGeography, setStockPerGeography] = useState<StockByRegion | undefined>(undefined);
  const [stockPerYear, setStockPerYear] = useState<YearlyStock | undefined>(undefined);

  useEffect(() => {
    if (budgetResults) {
      setStockPerType(calculateStockByTypology(budgetResults?.strategies));
      setStockPerFinancing(calculateStockByFinancing(budgetResults?.strategies));
      setStockPerGeography(calculateStockByRegion(budgetResults?.strategies));
      setStockPerYear(calculateTotalAndCumulativeStock(budgetResults?.strategies));
    }
  }, [budgetResults]);

  return (
    <>
      <ChartTitle title="Forecasted Stock Evolution (t)" />
      <FilteredStockChart
        stockPerType={stockPerType}
        stockPerFinancing={stockPerFinancing}
        stockPerGeography={stockPerGeography}
        stockPerYear={stockPerYear}
      />
    </>
  );
}
