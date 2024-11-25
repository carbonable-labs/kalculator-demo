'use client';

import { useEffect, useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { DEFAULT_GEOGRAPHICAL_AREA } from '@/utils/configuration';
import Title from '@/components/form/Title';
import Africa from './geographical-area/Africa';
import Asia from './geographical-area/Asia';
import Europe from './geographical-area/Europe';
import LatinAmerica from './geographical-area/LatinAmerica';
import Oceania from './geographical-area/Oceania';
import NorthAmerica from './geographical-area/NorthAmerica';

export default function GeographicalArea() {
  const [isFullGeographicalArea, setIsFullGeographicalArea] = useState(true);
  const { regionAllocation, setRegionAllocation } = useBudget();

  const reset = () => {
    setRegionAllocation(DEFAULT_GEOGRAPHICAL_AREA);
  };

  useEffect(() => {
    const regionAllocationValues = Object.values(regionAllocation);
    const sum = regionAllocationValues.reduce((acc, value) => acc + value, 0);
    setIsFullGeographicalArea(parseFloat(sum).toFixed(2) === '1.00');
  }, [regionAllocation]);

  return (
    <>
      <Title title="5. Preferred Geographical Area" />
      <div className="mt-8 w-full">
        <Africa />
      </div>
      <div className="mt-8 w-full">
        <Asia />
      </div>
      <div className="mt-8 w-full">
        <Europe />
      </div>
      <div className="mt-8 w-full">
        <LatinAmerica />
      </div>
      <div className="mt-8 w-full">
        <Oceania />
      </div>
      <div className="mt-8 w-full">
        <NorthAmerica />
      </div>
      {!isFullGeographicalArea && (
        <div className="mt-6 rounded-lg bg-red-800 px-4 py-2 text-sm">
          The sum of the geographical areas values must be equal to 100%
          <span
            onClick={reset}
            className="ml-4 cursor-pointer rounded-lg border border-opacityLight-30 px-2 py-1 uppercase hover:bg-opacityLight-10"
          >
            Reset
          </span>
        </div>
      )}
    </>
  );
}
