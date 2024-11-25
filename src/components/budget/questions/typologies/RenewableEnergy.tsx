'use client';

import SliderWithInput from '@/components/form/SliderWithInput';
import { useBudget } from '@/context/BudgetContext';
import { DEFAULT_TYPOLOGY } from '@/utils/configuration';
import { useEffect, useState } from 'react';

interface NbSProps {
  isDontKnowSelected: boolean;
}

export default function RenewableEnergy({ isDontKnowSelected }: NbSProps) {
  const [renewableEnergy, setRenewableEnergy] = useState<number | number[]>(DEFAULT_TYPOLOGY.renewableEnergy * 100);
  const { typology, setTypology } = useBudget();

  useEffect(() => {
    setTypology({
      ...typology,
      renewableEnergy: Math.round(renewableEnergy as number) / 100,
    });
  }, [renewableEnergy]);

  useEffect(() => {
    setRenewableEnergy(typology.renewableEnergy * 100);
  }, [typology.renewableEnergy]);

  return (
    <SliderWithInput
      inputLabel="Renewable Energy"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="RenewableEnergy"
      value={renewableEnergy as number}
      onChange={setRenewableEnergy}
      displayedValue={renewableEnergy as number}
      isDisabled={isDontKnowSelected}
    />
  );
}
