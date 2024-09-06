'use client';

import SliderWithInput from "@/components/form/SliderWithInput";
import { useBudget } from "@/context/BudgetContext";
import { useEffect, useState } from "react";

interface NbSProps {
  isDontKnowSelected: boolean;
}

export default function Biochar({ isDontKnowSelected }: NbSProps) {
  const [biochar, setBiochar] = useState<number | number[]>(0);
  const { typology, setTypology } = useBudget();

  useEffect(() => {
    setTypology({
      ...typology,
      biochar: (biochar as number) / 100,
    });
  }, [biochar]);

  useEffect(() => {
    setBiochar(typology.biochar * 100);
  }, [typology.biochar]);

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
      displayedValue={biochar}
      isDisabled={isDontKnowSelected}
    />
  )
}