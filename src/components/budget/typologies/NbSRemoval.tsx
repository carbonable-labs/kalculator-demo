'use client';

import SliderWithInput from "@/components/form/SliderWithInput";
import { useBudget } from "@/context/BudgetContext";
import { DEFAULT_TYPOLGY } from "@/utils/configuration";
import { useEffect, useState } from "react";

interface NbSProps {
  isDontKnowSelected: boolean;
}

export default function NbSRemoval({ isDontKnowSelected }: NbSProps) {
  const [nbs, setNbs] = useState<number | number[]>(DEFAULT_TYPOLGY.nbsRemoval * 100);
  const { typology, setTypology } = useBudget();

  useEffect(() => {
    setTypology({
      ...typology,
      nbsRemoval: (nbs as number) / 100,
    });
  }, [nbs]);

  useEffect(() => {
    setNbs(typology.nbsRemoval * 100);
  }, [typology.nbsRemoval]);

  return (
    <SliderWithInput
      inputLabel="Nature Based Solutions"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="NbS"
      value={nbs as number}
      onChange={setNbs}
      displayedValue={nbs}
      isDisabled={isDontKnowSelected}
    />
  )
}