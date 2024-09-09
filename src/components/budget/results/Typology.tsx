'use client';
import Title from '@/components/form/Title';
import Quantity from './typology/Quantity';
import { Tips } from '@/components/common/Tips';
import { useBudget } from '@/context/BudgetContext';
import Cost from './typology/Cost';

export default function Typology() {
  const { budgetResults } = useBudget();

  return (
    <>
      <Title title="By Type of Financing" />
      <div className="mt-8 flex items-end">
        <div className="w-full md:w-5/12">
          <Quantity />
        </div>
        <div className="w-full md:w-5/12">
          <Cost />
        </div>
        <div className="w-full pb-4 md:w-2/12">
          <Tips text={budgetResults?.advice_financing} />
        </div>
      </div>
    </>
  );
}
