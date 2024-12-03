'use client';

import SliderWithInput from '@/components/form/SliderWithInput';
import { useBudget } from '@/context/BudgetContext';
import { DEFAULT_GEOGRAPHICAL_AREA } from '@/utils/configuration';
import { useEffect, useState } from 'react';

export default function Africa() {
  const [africa, setAfrica] = useState<number | number[]>(DEFAULT_GEOGRAPHICAL_AREA.africa * 100);
  const { regionAllocation, setRegionAllocation } = useBudget();

  useEffect(() => {
    if (regionAllocation?.africa) {
      setAfrica(regionAllocation.africa * 100);
    }
  }, []);

  useEffect(() => {
    // Prevent unnecessary updates if the values are the same
    if (Math.round(africa as number) / 100 !== regionAllocation.africa) {
      setRegionAllocation({
        ...regionAllocation,
        africa: Math.round(africa as number) / 100,
      });
    }
  }, [africa, setRegionAllocation, regionAllocation]);

  return (
    <SliderWithInput
      inputLabel="Africa"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="Africa"
      value={africa as number}
      onChange={setAfrica}
      displayedValue={africa as number}
    />
  );
}
