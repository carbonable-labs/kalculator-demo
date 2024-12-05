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
import { DEFAULT_GEOGRAPHICAL_AREA } from '@/utils/configuration';

export default function GeographicalArea() {
  const [isFullGeographicalArea, setIsFullGeographicalArea] = useState(true);
  const [isDontKnowSelected, setIsDontKnowSelected] = useState<boolean>(false);
  const {
    regionAllocation,
    setRegionAllocation,
    setOptimizeRegion,
  } = useBudget();

  // State variables for each geographical area percentage
  const [africa, setAfrica] = useState<number | number[]>(
    regionAllocation.africa * 100,
  );
  const [asia, setAsia] = useState<number | number[]>(
    regionAllocation.asia * 100,
  );
  const [europe, setEurope] = useState<number | number[]>(
    regionAllocation.europe * 100,
  );
  const [latinAmerica, setLatinAmerica] = useState<number | number[]>(
    regionAllocation.southAmerica * 100,
  );
  const [oceania, setOceania] = useState<number | number[]>(
    regionAllocation.oceania * 100,
  );
  const [northAmerica, setNorthAmerica] = useState<number | number[]>(
    regionAllocation.northAmerica * 100,
  );

  // Update regionAllocation in context when sliders change and "I don't know" is not selected
  useEffect(() => {
    if (!isDontKnowSelected) {
      setRegionAllocation({
        africa: (africa as number) / 100,
        asia: (asia as number) / 100,
        europe: (europe as number) / 100,
        southAmerica: (latinAmerica as number) / 100,
        oceania: (oceania as number) / 100,
        northAmerica: (northAmerica as number) / 100,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [africa, asia, europe, latinAmerica, oceania, northAmerica]);

  // Handle the "I don't know yet" checkbox
  useEffect(() => {
    if (isDontKnowSelected) {
      setOptimizeRegion(true);

      // Reset sliders to default values
      setAfrica(DEFAULT_GEOGRAPHICAL_AREA.africa * 100);
      setAsia(DEFAULT_GEOGRAPHICAL_AREA.asia * 100);
      setEurope(DEFAULT_GEOGRAPHICAL_AREA.europe * 100);
      setLatinAmerica(DEFAULT_GEOGRAPHICAL_AREA.southAmerica * 100);
      setOceania(DEFAULT_GEOGRAPHICAL_AREA.oceania * 100);
      setNorthAmerica(DEFAULT_GEOGRAPHICAL_AREA.northAmerica * 100);

      // Update regionAllocation in context to default
      setRegionAllocation(DEFAULT_GEOGRAPHICAL_AREA);
    } else {
      setOptimizeRegion(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDontKnowSelected]);

  // Ensure the sum of region percentages is 100%
  useEffect(() => {
    const total =
      (africa as number) +
      (asia as number) +
      (europe as number) +
      (latinAmerica as number) +
      (oceania as number) +
      (northAmerica as number);
    setIsFullGeographicalArea(Math.round(total) === 100);
  }, [africa, asia, europe, latinAmerica, oceania, northAmerica]);

  return (
    <>
      <Title title="5. Preferred Geographical Area" />
      <div className="mt-8 w-full">
        <Africa
          isDisabled={isDontKnowSelected}
          value={africa}
          setValue={setAfrica}
        />
      </div>
      <div className="mt-8 w-full">
        <Asia
          isDisabled={isDontKnowSelected}
          value={asia}
          setValue={setAsia}
        />
      </div>
      <div className="mt-8 w-full">
        <Europe
          isDisabled={isDontKnowSelected}
          value={europe}
          setValue={setEurope}
        />
      </div>
      <div className="mt-8 w-full">
        <LatinAmerica
          isDisabled={isDontKnowSelected}
          value={latinAmerica}
          setValue={setLatinAmerica}
        />
      </div>
      <div className="mt-8 w-full">
        <Oceania
          isDisabled={isDontKnowSelected}
          value={oceania}
          setValue={setOceania}
        />
      </div>
      <div className="mt-8 w-full">
        <NorthAmerica
          isDisabled={isDontKnowSelected}
          value={northAmerica}
          setValue={setNorthAmerica}
        />
      </div>
      {!isFullGeographicalArea && !isDontKnowSelected && (
        <div className="mt-6 rounded-lg bg-red-800 px-4 py-2 text-sm">
          The sum of the geographical areas values must be equal to 100%
        </div>
      )}
      <div className="mt-8 flex items-center">
        <DontKnowCheckbox
          isSelected={isDontKnowSelected}
          setIsSelected={setIsDontKnowSelected}
        />
        {isDontKnowSelected && (
          <div className="ml-8 text-sm font-light italic">
            Let Carbonable offer smart recommendations
          </div>
        )}
      </div>
    </>
  );
}
