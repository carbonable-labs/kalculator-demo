'use client';

import SliderWithInput from '@/components/form/SliderWithInput';
import { useBudget } from '@/context/BudgetContext';
import { DEFAULT_GEOGRAPHICAL_AREA } from '@/utils/configuration';
import { useEffect, useState } from 'react';

export default function NorthAmerica() {
  const [northAmerica, setNorthAmerica] = useState<number | number[]>(
    DEFAULT_GEOGRAPHICAL_AREA.northAmerica * 100,
  );
  const { regionAllocation, setRegionAllocation } = useBudget();

  useEffect(() => {
    if (regionAllocation?.northAmerica) {
      setNorthAmerica(regionAllocation.northAmerica * 100);
    }
  }, []);

  useEffect(() => {
    // Prevent unnecessary updates if the values are the same
    if (Math.round(northAmerica as number) / 100 !== regionAllocation.northAmerica) {
      setRegionAllocation({
        ...regionAllocation,
        northAmerica: Math.round(northAmerica as number) / 100,
      });
    }
  }, [northAmerica, setRegionAllocation, regionAllocation]);

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
      displayedValue={northAmerica as number}
    />
  );
}
