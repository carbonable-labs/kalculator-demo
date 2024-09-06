'use client';

import SliderWithInput from "@/components/form/SliderWithInput";
import { useBudget } from "@/context/BudgetContext";
import { DEFAULT_GEOGRAPHICAL_AREA } from "@/utils/configuration";
import { useEffect, useState } from "react";

export default function Oceania() {
  const [oceania, setOceania] = useState<number | number[]>(DEFAULT_GEOGRAPHICAL_AREA.oceania * 100);
  const { regionAllocation, setRegionAllocation } = useBudget();

  useEffect(() => {
    setRegionAllocation({
      ...regionAllocation,
      oceania: (oceania as number) / 100,
    });
  }, [oceania]);

  useEffect(() => {
    setOceania(regionAllocation.oceania * 100);
  }, [regionAllocation.oceania]);

  return (
    <SliderWithInput
      inputLabel="Oceania"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="Oceania"
      value={oceania as number}
      onChange={setOceania}
      displayedValue={oceania}
    />
  )
}