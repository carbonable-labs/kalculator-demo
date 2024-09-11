'use client';

import SliderWithInput from '@/components/form/SliderWithInput';
import { useStrategy } from '@/context/StrategyContext';
import { DEFAULT_GEOGRAPHICAL_AREA } from '@/utils/configuration';
import { useEffect, useState } from 'react';

export default function Oceania() {
  const [oceania, setOceania] = useState<number | number[]>(
    DEFAULT_GEOGRAPHICAL_AREA.oceania * 100,
  );
  const { regionAllocation, setRegionAllocation } = useStrategy();

  useEffect(() => {
    setRegionAllocation({
      ...regionAllocation,
      oceania: Math.round(oceania as number) / 100,
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
      displayedValue={oceania as number}
    />
  );
}
