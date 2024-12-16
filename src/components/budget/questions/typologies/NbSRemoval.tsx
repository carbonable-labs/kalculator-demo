'use client';

import SliderWithInput from '@/components/form/SliderWithInput';
import QuestionTooltip from '@/components/form/Tooltip';
import { useBudget } from '@/context/BudgetContext';
import { useEffect } from 'react';
import { tooltip } from '@/components/common/tootips/TypologyNbsArrTooltip';

interface NbSProps {
  isDontKnowSelected: boolean;
  nbs: number | number[];
  setNbs: (value: number | number[]) => void;
}

export default function NbSRemoval({ isDontKnowSelected, nbs, setNbs }: NbSProps) {
  const { typology, setTypology } = useBudget();

  useEffect(() => {
    if (typology?.nbsRemoval) {
      setNbs(typology.nbsRemoval * 100);
    }
  }, []);

  // Update typology when nbs changes
  useEffect(() => {
    if (Math.round(nbs as number) / 100 !== typology.nbsRemoval) {
      setTypology({
        ...typology,
        nbsRemoval: Math.round(nbs as number) / 100,
      });
    }
  }, [nbs, setTypology, typology]);

  return (
    <SliderWithInput
      inputLabel="NbS - ARR"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="NbS"
      value={nbs as number}
      onChange={setNbs}
      displayedValue={nbs as number}
      isDisabled={isDontKnowSelected}
      tooltip={<QuestionTooltip tooltip={tooltip} />}
    />
  );
}
