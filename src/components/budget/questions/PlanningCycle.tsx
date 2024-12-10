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
  const { timeConstraints, setTimeConstraints } = useBudget();

  const [selected, setSelected] = useState<string | null>(timeConstraints?.toString() || '1'); // Default to '1'

  useEffect(() => {
    if (selected !== timeConstraints?.toString()) {
      setTimeConstraints(parseInt(selected || '1'));
    }
  }, [selected, timeConstraints, setTimeConstraints]);

  return (
    <>
      <Title
        title="2. Financial Planning Cycle"
        subtitle="Is your budget aligned with yearly, multi-year or open timelines?"
      />
      <div className="mt-8">
        <RadioButtons
          values={planningCycleOptions}
          setSelected={setSelected}
          selected={selected}
        />
      </div>
    </>
  );
}
