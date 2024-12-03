'use client';

import SliderWithInput from '@/components/form/SliderWithInput';
import { useBudget } from '@/context/BudgetContext';
import { useEffect } from 'react';

interface NbSProps {
  isDontKnowSelected: boolean;
  nbs: number | number[];
  setNbs: (value: number | number[]) => void;
}

export default function NbSAvoidance({ isDontKnowSelected, nbs, setNbs }: NbSProps) {
  const { typology, setTypology } = useBudget();

  useEffect(() => {
    if (typology?.nbsAvoidance) {
      setNbs(typology.nbsAvoidance * 100);
    }
  }, []);

  // Update typology when nbs changes
  useEffect(() => {
    if (Math.round(nbs as number) / 100 !== typology.nbsAvoidance) {
      setTypology({
        ...typology,
        nbsAvoidance: Math.round(nbs as number) / 100,
      });
    }
  }, [nbs, setTypology, typology]);

  return (
    <SliderWithInput
      inputLabel="NbS - REDD"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="RE"
      value={nbs as number}
      onChange={setNbs}
      displayedValue={nbs as number}
      isDisabled={isDontKnowSelected}
    />
  );
}
