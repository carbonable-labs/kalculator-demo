'use client';

import { useEffect, useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import Title from '@/components/form/Title';
import RadioButtons from '@/components/form/RadioButtons';

const planningCycleOptions = [
  { value: '1', text: 'Yearly' },
  { value: '5', text: 'Every 5 years' },
  { value: '-1', text: 'Flexible' },
];

export default function PlanningCycle() {
  const [selected, setSelected] = useState<string | null>(null);
  const { setTimeConstraints } = useBudget();

  useEffect(() => {
    setTimeConstraints(selected ? parseInt(selected) : null);
  }, [selected]);

  return (
    <>
      <Title
        title="1. Financial Planning Cycle"
        subtitle="Is your budget aligned with yearly, multi-year or open timelines?"
      />
      <div className="mt-8">
        <RadioButtons values={planningCycleOptions} setSelected={setSelected} />
      </div>
    </>
  );
}
