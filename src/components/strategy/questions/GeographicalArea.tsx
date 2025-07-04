'use client';

import { useEffect, useState } from 'react';
import Title from '@/components/form/Title';
import Africa from './geographical-area/Africa';
import Asia from './geographical-area/Asia';
import Europe from './geographical-area/Europe';
import LatinAmerica from './geographical-area/LatinAmerica';
import Oceania from './geographical-area/Oceania';
import NorthAmerica from './geographical-area/NorthAmerica';
import { useStrategy } from '@/context/StrategyContext';

export default function GeographicalArea() {
  const [isFullGeographicalArea, setIsFullGeographicalArea] = useState(true);
  const { regionAllocation } = useStrategy();

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
        </div>
      )}
    </>
  );
}
