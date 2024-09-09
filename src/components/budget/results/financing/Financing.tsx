'use client';
import Title from '@/components/form/Title';
import Quantity from './Quantity';
import Stock from './Stock';
import { Tips } from '@/components/common/Tips';
import { useBudget } from '@/context/BudgetContext';

export default function Financing() {
  const { budgetResults } = useBudget();

  return (
    <>
      <Title title="By Type of Financing" />
      <div className="mt-8 flex items-end">
        <div className="w-full md:w-5/12">
          <Quantity />
        </div>
        <div className="w-full md:w-5/12">
          <Stock />
        </div>
        <div className="w-full md:w-2/12 pb-4">
          <Tips text={budgetResults?.advice_financing} />
        </div>
      </div>
    </>
  );
}
