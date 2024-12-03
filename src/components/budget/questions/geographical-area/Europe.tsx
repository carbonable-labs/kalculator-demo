'use client';

import SliderWithInput from '@/components/form/SliderWithInput';
import { useBudget } from '@/context/BudgetContext';
import { DEFAULT_GEOGRAPHICAL_AREA } from '@/utils/configuration';
import { useEffect, useState } from 'react';

export default function Europe() {
  const [europe, setEurope] = useState<number | number[]>(DEFAULT_GEOGRAPHICAL_AREA.europe * 100);
  const { regionAllocation, setRegionAllocation } = useBudget();

  useEffect(() => {
    if (regionAllocation?.europe) {
      setEurope(regionAllocation.europe * 100);
    }
  }, []);

  useEffect(() => {
    // Prevent unnecessary updates if the values are the same
    if (Math.round(europe as number) / 100 !== regionAllocation.europe) {
      setRegionAllocation({
        ...regionAllocation,
        europe: Math.round(europe as number) / 100,
      });
    }
  }, [europe, setRegionAllocation, regionAllocation]);
  return (
    <SliderWithInput
      inputLabel="Europe"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="Europe"
      value={europe as number}
      onChange={setEurope}
      displayedValue={europe as number}
    />
  );
}
