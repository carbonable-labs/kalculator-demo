'use client';

import { useEffect, useState } from 'react';
import Title from '@/components/form/Title';
import RadioButtons from '@/components/form/RadioButtons';
import { useStrategy } from '@/context/StrategyContext';

const planningCycleOptions = [
  { value: '1', text: 'Yearly' },
  { value: '5', text: 'Every 5 years' },
  { value: '-1', text: 'Flexible' },
];

export default function PlanningCycle() {
  const [selected, setSelected] = useState<string | null>(null);
  const { timeConstraints, setTimeConstraints } = useStrategy();

  useEffect(() => {
    setTimeConstraints(selected ? parseInt(selected) : null);
  }, [selected]);

  return (
    <>
      <Title title="2. Financial Planning" />
      <div className="mt-8">
        <RadioButtons
          values={planningCycleOptions}
          setSelected={setSelected}
          selected={timeConstraints ? timeConstraints.toString() : null}
        />
      </div>
      {selected === '-1' && (
        <div className="mt-4 text-sm text-neutral-200">
          Alright, let Carbonable find the best path forward!
        </div>
      )}
    </>
  );
}
