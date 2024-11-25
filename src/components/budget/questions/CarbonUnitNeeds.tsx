'use client';

import { useState, useEffect } from 'react';
import { useBudget } from '@/context/BudgetContext';
import Title from '@/components/form/Title';

interface CarbonUnit {
  year: string;
  amount: string;
}

export default function CarbonUnitNeeds() {
  const [units, setUnits] = useState<CarbonUnit[]>([{ year: '', amount: '' }]);
  const { setCarbonUnitNeeds } = useBudget();

  const handleInputChange = (index: number, field: keyof CarbonUnit, value: string) => {
    const updatedUnits = [...units];
    updatedUnits[index][field] = value;
    setUnits(updatedUnits);
  };

  const addNewRow = () => {
    setUnits([...units, { year: '', amount: '' }]);
  };

  useEffect(() => {
    const validUnits = units
      .filter((unit) => unit.year && unit.amount)
      .reduce(
        (acc, unit) => {
          acc[unit.year] = parseFloat(unit.amount);
          return acc;
        },
        {} as { [year: string]: number },
      );

    setCarbonUnitNeeds(validUnits);
  }, [units, setCarbonUnitNeeds]);

  return (
    <div className="w-1/2">
      <Title title="1. Carbon Unit Needs" subtitle="Specify the carbon unit needs by year." />
      <div className="mt-8 space-y-4">
        {units.map((unit, index) => (
          <div key={index} className="flex items-center gap-4">
            <input
              type="number"
              placeholder="Year"
              value={unit.year}
              onChange={(e) => handleInputChange(index, 'year', e.target.value)}
              className="w-1/2 rounded-lg border border-gray-400 p-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <div className="flex w-1/2 items-center">
              <input
                type="number"
                placeholder="Amount"
                value={unit.amount}
                onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                className="flex-grow rounded-l-lg border border-gray-400 p-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <span className="rounded-r-lg border border-gray-400 bg-gray-800 px-4 py-2 text-gray-500">
                t
              </span>
            </div>
          </div>
        ))}
        <button
          onClick={addNewRow}
          className="mt-4 w-1/2 rounded-lg border border-gray-300 bg-gray-300 p-2 text-gray-600 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          Add
        </button>
      </div>
    </div>
  );
}
