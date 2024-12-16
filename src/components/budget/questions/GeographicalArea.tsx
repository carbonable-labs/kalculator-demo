'use client';

import { useEffect, useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import Title from '@/components/form/Title';
import Africa from './geographical-area/Africa';
import Asia from './geographical-area/Asia';
import Europe from './geographical-area/Europe';
import LatinAmerica from './geographical-area/LatinAmerica';
import Oceania from './geographical-area/Oceania';
import NorthAmerica from './geographical-area/NorthAmerica';
import DontKnowCheckbox from '@/components/form/DontKnowCheckbox';
import { tooltip } from '@/components/common/tootips/GeographicalAreaTooltip';

export default function GeographicalArea() {
  const [isFullGeographicalArea, setIsFullGeographicalArea] = useState(true);
  const [currentSum, setCurrentSum] = useState(100);
  const { regionAllocation, setRegionAllocation, setOptimizeRegion, optimizeRegion } = useBudget();

  const [africa, setAfrica] = useState<number | number[]>(regionAllocation.africa * 100);
  const [asia, setAsia] = useState<number | number[]>(regionAllocation.asia * 100);
  const [europe, setEurope] = useState<number | number[]>(regionAllocation.europe * 100);
  const [latinAmerica, setLatinAmerica] = useState<number | number[]>(
    regionAllocation.southAmerica * 100,
  );
  const [oceania, setOceania] = useState<number | number[]>(regionAllocation.oceania * 100);
  const [northAmerica, setNorthAmerica] = useState<number | number[]>(
    regionAllocation.northAmerica * 100,
  );

  useEffect(() => {
    if (!optimizeRegion) {
      setRegionAllocation({
        africa: (africa as number) / 100,
        asia: (asia as number) / 100,
        europe: (europe as number) / 100,
        southAmerica: (latinAmerica as number) / 100,
        oceania: (oceania as number) / 100,
        northAmerica: (northAmerica as number) / 100,
      });
    }
  }, [
    africa,
    asia,
    europe,
    latinAmerica,
    oceania,
    northAmerica,
    optimizeRegion,
    setRegionAllocation,
  ]);

  useEffect(() => {
    if (optimizeRegion) {
      setAfrica(regionAllocation.africa * 100);
      setAsia(regionAllocation.asia * 100);
      setEurope(regionAllocation.europe * 100);
      setLatinAmerica(regionAllocation.southAmerica * 100);
      setOceania(regionAllocation.oceania * 100);
      setNorthAmerica(regionAllocation.northAmerica * 100);
    }
  }, [optimizeRegion, regionAllocation]);

  useEffect(() => {
    const total =
      (africa as number) +
      (asia as number) +
      (europe as number) +
      (latinAmerica as number) +
      (oceania as number) +
      (northAmerica as number);
    setIsFullGeographicalArea(Math.round(total) === 100);
    setCurrentSum(Math.round(total));
  }, [africa, asia, europe, latinAmerica, oceania, northAmerica]);

  const handleDontKnowChange = (value: boolean) => {
    if (value) {
      setOptimizeRegion(true);
    } else {
      setOptimizeRegion(false);
    }
  };

  return (
    <>
      <Title title="4. Preferred Geographical Area" tooltip={tooltip} />
      <div className="mt-8 w-full">
        <Africa isDisabled={optimizeRegion} value={africa} setValue={setAfrica} />
      </div>
      <div className="mt-8 w-full">
        <Asia isDisabled={optimizeRegion} value={asia} setValue={setAsia} />
      </div>
      <div className="mt-8 w-full">
        <Europe isDisabled={optimizeRegion} value={europe} setValue={setEurope} />
      </div>
      <div className="mt-8 w-full">
        <LatinAmerica isDisabled={optimizeRegion} value={latinAmerica} setValue={setLatinAmerica} />
      </div>
      <div className="mt-8 w-full">
        <Oceania isDisabled={optimizeRegion} value={oceania} setValue={setOceania} />
      </div>
      <div className="mt-8 w-full">
        <NorthAmerica isDisabled={optimizeRegion} value={northAmerica} setValue={setNorthAmerica} />
      </div>
      {!isFullGeographicalArea && !optimizeRegion && (
        <div className="mt-6 rounded-lg bg-red-800 px-4 py-2 text-sm">
          The sum of the geographical areas values must be equal to 100%, not {currentSum}%
        </div>
      )}
      <div className="mt-8 flex items-center">
        <DontKnowCheckbox isSelected={optimizeRegion} setIsSelected={handleDontKnowChange} />
        {optimizeRegion && (
          <div className="ml-8 text-sm font-light italic">
            Let Carbonable offer smart recommendations
          </div>
        )}
      </div>
    </>
  );
}
