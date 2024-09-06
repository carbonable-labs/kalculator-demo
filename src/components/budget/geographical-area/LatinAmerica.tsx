'use client';

import SliderWithInput from "@/components/form/SliderWithInput";
import { useBudget } from "@/context/BudgetContext";
import { DEFAULT_GEOGRAPHICAL_AREA } from "@/utils/configuration";
import { useEffect, useState } from "react";

export default function LatinAmerica() {
  const [latinAmerica, setLatinAmerica] = useState<number | number[]>(DEFAULT_GEOGRAPHICAL_AREA.southAmerica * 100);
  const { regionAllocation, setRegionAllocation } = useBudget();

  useEffect(() => {
    setRegionAllocation({
      ...regionAllocation,
      southAmerica: (latinAmerica as number) / 100,
    });
  }, [latinAmerica]);

  useEffect(() => {
    setLatinAmerica(regionAllocation.southAmerica * 100);
  }, [regionAllocation.southAmerica]);

  return (
    <SliderWithInput
      inputLabel="Latin America"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="Latin America"
      value={latinAmerica as number}
      onChange={setLatinAmerica}
      displayedValue={latinAmerica}
    />
  )
}