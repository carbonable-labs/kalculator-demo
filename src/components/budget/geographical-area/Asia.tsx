'use client';

import SliderWithInput from "@/components/form/SliderWithInput";
import { useBudget } from "@/context/BudgetContext";
import { DEFAULT_GEOGRAPHICAL_AREA } from "@/utils/configuration";
import { useEffect, useState } from "react";

export default function Asia() {
  const [asia, setAsia] = useState<number | number[]>(DEFAULT_GEOGRAPHICAL_AREA.asia * 100);
  const { regionAllocation, setRegionAllocation } = useBudget();

  useEffect(() => {
    setRegionAllocation({
      ...regionAllocation,
      asia: Math.floor(asia as number) / 100,
    });
  }, [asia]);

  useEffect(() => {
    setAsia(regionAllocation.asia * 100);
  }, [regionAllocation.asia]);

  return (
    <SliderWithInput
      inputLabel="Asia"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="Asia"
      value={asia as number}
      onChange={setAsia}
      displayedValue={asia as number}
    />
  )
}