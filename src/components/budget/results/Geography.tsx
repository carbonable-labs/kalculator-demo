'use client';
import Title from '@/components/form/Title';
import Quantity from './geography/Quantity';
import { Tips } from '@/components/common/Tips';
import { useBudget } from '@/context/BudgetContext';
import Cost from './geography/Cost';

export default function Geography() {
  const { budgetResults } = useBudget();

  return (
    <>
      <Title title="By Geography" />
      <div className="mt-8 flex items-end">
        <div className="w-full md:w-5/12">
          <Quantity />
        </div>
        <div className="w-full md:w-5/12">
          <Cost />
        </div>
        <div className="w-full pb-4 md:w-2/12">
          <Tips text={budgetResults?.advice_geography} />
        </div>
      </div>
    </>
  );
}
