'use client';

import SliderWithInput from '@/components/form/SliderWithInput';
import { useStrategy } from '@/context/StrategyContext';
import { DEFAULT_TYPOLOGY } from '@/utils/configuration';
import { useEffect, useState } from 'react';

interface NbSProps {
  isDontKnowSelected: boolean;
}

export default function DAC({ isDontKnowSelected }: NbSProps) {
  const [dac, setDac] = useState<number | number[]>(DEFAULT_TYPOLOGY.dac * 100);
  const { typology, setTypology } = useStrategy();

  useEffect(() => {
    setTypology({
      ...typology,
      dac: Math.round(dac as number) / 100,
    });
  }, [dac]);

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
