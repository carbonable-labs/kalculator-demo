'use client';

import SliderWithInput from '@/components/form/SliderWithInput';
import { useBudget } from '@/context/BudgetContext';
import { useEffect } from 'react';
import { tooltipBiochar } from '@/components/common/tootips/TypologyBiocharTooltip';
import QuestionTooltip from '@/components/form/Tooltip';

interface NbSProps {
  isDontKnowSelected: boolean;
  biochar: number | number[];
  setBiochar: (value: number | number[]) => void;
}

export default function Biochar({ isDontKnowSelected, biochar, setBiochar }: NbSProps) {
  const { typology, setTypology } = useBudget();

  // Initialize biochar value from typology once on mount
  useEffect(() => {
    if (typology?.biochar) {
      setBiochar(typology.biochar * 100);
    }
  }, []);

  // Update typology when biochar changes
  useEffect(() => {
    if (Math.round(biochar as number) / 100 !== typology.biochar) {
      setTypology({
        ...typology,
        biochar: Math.round(biochar as number) / 100,
      });
    }
  }, [biochar, setTypology, typology]);

  return (
    <SliderWithInput
      inputLabel="Biochar"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="Biochar"
      value={biochar as number}
      onChange={setBiochar}
      displayedValue={biochar as number}
      isDisabled={isDontKnowSelected}
      tooltip={<QuestionTooltip tooltip={tooltipBiochar} />}
    />
  );
}
