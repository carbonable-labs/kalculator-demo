'use client';

import InputWithQuestion from '@/components/form/InputWithQuestion';
import Title from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';

export default function Budget() {
  const { budget, setBudget } = useStrategy();

  return (
    <>
      <Title title="1. Budget" />
      <div className="mt-8">
        <InputWithQuestion value={budget} onChange={setBudget} />
      </div>
    </>
  );
}
