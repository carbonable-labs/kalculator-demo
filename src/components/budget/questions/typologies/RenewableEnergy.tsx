'use client';

import SliderWithInput from '@/components/form/SliderWithInput';
import { useBudget } from '@/context/BudgetContext';
import { DEFAULT_TYPOLOGY } from '@/utils/configuration';
import { useEffect, useState } from 'react';
import { tooltipRenewableEnergy } from '@/components/common/tootips/TypologyRenewableEnergyTooltip';
import QuestionTooltip from '@/components/form/Tooltip';

interface NbSProps {
  isDontKnowSelected: boolean;
  renewableEnergy: number | number[];
  setRenewableEnergy: (value: number | number[]) => void;
}

export default function RenewableEnergy({
  isDontKnowSelected,
  renewableEnergy,
  setRenewableEnergy,
}: NbSProps) {
  const { typology, setTypology } = useBudget();

  useEffect(() => {
    if (typology?.renewableEnergy) {
      setRenewableEnergy(typology.renewableEnergy * 100);
    }
  }, []);

  // Update typology when renewableEnergy changes
  useEffect(() => {
    if (Math.round(renewableEnergy as number) / 100 !== typology.renewableEnergy) {
      setTypology({
        ...typology,
        renewableEnergy: Math.round(renewableEnergy as number) / 100,
      });
    }
  }, [renewableEnergy, setTypology, typology]);

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
      tooltip={<QuestionTooltip tooltip={tooltipRenewableEnergy} />}
    />
  );
}
