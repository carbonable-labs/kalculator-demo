'use client';
import Title from '@/components/form/Title';
import Quantity from './financing/Quantity';
import { Tips } from '@/components/common/Tips';
import Cost from './financing/Cost';
import { useStrategy } from '@/context/StrategyContext';

export default function Financing() {
  const { startegyResults } = useStrategy();

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
          <Tips text={startegyResults?.advice_financing} />
        </div>
      </div>
    </>
  );
}
