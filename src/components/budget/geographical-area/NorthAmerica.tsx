'use client';

import SliderWithInput from "@/components/form/SliderWithInput";
import { useBudget } from "@/context/BudgetContext";
import { DEFAULT_GEOGRAPHICAL_AREA } from "@/utils/configuration";
import { useEffect, useState } from "react";

export default function NorthAmerica() {
  const [northAmerica, setNorthAmerica] = useState<number | number[]>(DEFAULT_GEOGRAPHICAL_AREA.northAmerica * 100);
  const { regionAllocation, setRegionAllocation } = useBudget();

  useEffect(() => {
    setRegionAllocation({
      ...regionAllocation,
      northAmerica: (northAmerica as number) / 100,
    });
  }, [northAmerica]);

  useEffect(() => {
    setNorthAmerica(regionAllocation.northAmerica * 100);
  }, [regionAllocation.northAmerica]);

  return (
    <SliderWithInput
      inputLabel="North America"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="North America"
      value={northAmerica as number}
      onChange={setNorthAmerica}
      displayedValue={northAmerica}
    />
  )
}