'use client';

import SliderWithInput from "@/components/form/SliderWithInput";
import { useBudget } from "@/context/BudgetContext";
import { DEFAULT_TYPOLGY } from "@/utils/configuration";
import { useEffect, useState } from "react";

interface NbSProps {
  isDontKnowSelected: boolean;
}

export default function NbSAvoidance({ isDontKnowSelected }: NbSProps) {
  const [renewableEnergy, setRenewableEnergy] = useState<number | number[]>(DEFAULT_TYPOLGY.nbsAvoidance * 100);
  const { typology, setTypology } = useBudget();

  useEffect(() => {
    setTypology({
      ...typology,
      nbsAvoidance: (renewableEnergy as number) / 100,
    });
  }, [renewableEnergy]);

  useEffect(() => {
    setRenewableEnergy(typology.nbsAvoidance * 100);
  }, [typology.nbsAvoidance]);

  return (
    <SliderWithInput
      inputLabel="Renewable Energy"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="RE"
      value={renewableEnergy as number}
      onChange={setRenewableEnergy}
      displayedValue={renewableEnergy}
      isDisabled={isDontKnowSelected}
    />
  )
}