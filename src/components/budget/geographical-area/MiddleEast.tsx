'use client';

import SliderWithInput from "@/components/form/SliderWithInput";
import { useBudget } from "@/context/BudgetContext";
import { DEFAULT_GEOGRAPHICAL_AREA } from "@/utils/configuration";
import { useEffect, useState } from "react";

export default function MiddleEast() {
  const [middleEast, setMiddleEast] = useState<number | number[]>(DEFAULT_GEOGRAPHICAL_AREA.oceania * 100);
  const { regionAllocation, setRegionAllocation } = useBudget();

  useEffect(() => {
    setRegionAllocation({
      ...regionAllocation,
      oceania: (middleEast as number) / 100,
    });
  }, [middleEast]);

  useEffect(() => {
    setMiddleEast(regionAllocation.oceania * 100);
  }, [regionAllocation.oceania]);

  return (
    <SliderWithInput
      inputLabel="Middle East"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="Middle East"
      value={middleEast as number}
      onChange={setMiddleEast}
      displayedValue={middleEast}
    />
  )
}