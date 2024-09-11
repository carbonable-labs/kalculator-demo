'use client';
import Title from '@/components/form/Title';
import Quantity from './geography/Quantity';
import { Tips } from '@/components/common/Tips';
import Cost from './geography/Cost';
import { useStrategy } from '@/context/StrategyContext';

export default function Geography() {
  const { startegyResults } = useStrategy();

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
          <Tips text={startegyResults?.advice_geography} />
        </div>
      </div>
    </>
  );
}
