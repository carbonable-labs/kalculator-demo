'use client';

import { useEffect, useState } from 'react';
import Title from '../form/Title';
import Africa from './geographical-area/Africa';
import Asia from './geographical-area/Asia';
import Europe from './geographical-area/Europe';
import LatinAmerica from './geographical-area/LatinAmerica';
import MiddleEast from './geographical-area/MiddleEast';
import NorthAmerica from './geographical-area/NorthAmerica';
import { useBudget } from '@/context/BudgetContext';
import { DEFAULT_GEOGRAPHICAL_AREA } from '@/utils/configuration';

export default function GeographicalArea() {
  const [isFullGeographicalArea, setIsFullGeographicalArea] = useState(true);
  const { regionAllocation, setRegionAllocation } = useBudget();

  const reset = () => {
    setRegionAllocation(DEFAULT_GEOGRAPHICAL_AREA);
  }
  
  useEffect(() => {
    const regionAllocationValues = Object.values(regionAllocation);
    const sum = regionAllocationValues.reduce((acc, value) => acc + value, 0);
    setIsFullGeographicalArea(parseFloat(sum).toFixed(2) === '1.00');
  }, [regionAllocation]);

  return (
    <>
      <Title
        title="4. Preferred Geographical Area"
      />
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
        <MiddleEast />
      </div>
      <div className="mt-8 w-full">
        <NorthAmerica />
      </div>
      { !isFullGeographicalArea && (
        <div className="mt-6 bg-red-800 text-sm px-4 py-2 rounded-lg">
          The sum of the geographical areas values must be equal to 100%
          <span onClick={reset} className="ml-4 border border-opacityLight-30 rounded-lg px-2 py-1 uppercase cursor-pointer hover:bg-opacityLight-10">Reset</span>
        </div>
      )}
    </>
  );
}
