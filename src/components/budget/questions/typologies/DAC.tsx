'use client';

import SliderWithInput from '@/components/form/SliderWithInput';
import { useBudget } from '@/context/BudgetContext';
import { useEffect } from 'react';

interface NbSProps {
  isDontKnowSelected: boolean;
  dac: number | number[];
  setDac: (value: number | number[]) => void;
}

export default function DAC({ isDontKnowSelected, dac, setDac }: NbSProps) {
  const { typology, setTypology } = useBudget();

  // Initialize dac value from typology once on mount
  useEffect(() => {
    if (typology?.dac) {
      setDac(typology.dac * 100);
    }
  }, []);

  // Update typology when dac changes
  useEffect(() => {
    if (Math.round(dac as number) / 100 !== typology.dac) {
      setTypology({
        ...typology,
        dac: Math.round(dac as number) / 100,
      });
    }
  }, [dac, setTypology, typology]);

  useEffect(() => {
    setDac(typology.dac * 100);
  }, [typology.dac]);

  return (
    <SliderWithInput
      inputLabel="Direct Air Capture (DAC)"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="DAC"
      value={dac as number}
      onChange={setDac}
      displayedValue={dac as number}
      isDisabled={isDontKnowSelected}
    />
  );
}
