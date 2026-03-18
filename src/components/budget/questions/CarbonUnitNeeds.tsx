'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBudget } from '@/context/BudgetContext';
import Title from '@/components/form/Title';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { demoNetzeroNeeds } from '@/constants/netZeroPlanning';

interface CarbonUnit {
  year: string;
  amount: string;
  fromPlanning?: boolean;
}

export default function CarbonUnitNeeds() {
  const [units, setUnits] = useState<CarbonUnit[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [planningLoaded, setPlanningLoaded] = useState(false);
  const { setCarbonUnitNeeds } = useBudget();

  const validateUnits = useCallback(() => {
    if (units.length === 0) return null;

    const years = units.map((u) => u.year);
    const invalidYear = units.find(
      (u) => parseInt(u.year, 10) < 2025 || parseInt(u.year, 10) > 2050 || u.year === '',
    );
    const hasDuplicateYears = new Set(years).size !== years.length;

    if (invalidYear) return 'Years must be between 2025 and 2050.';
    if (hasDuplicateYears) return 'Each year must be unique.';
    return null;
  }, [units]);

  const handleInputChange = (index: number, field: keyof CarbonUnit, value: string) => {
    const updatedUnits = [...units];
    updatedUnits[index] = { ...updatedUnits[index], [field]: value, fromPlanning: false };
    setUnits(updatedUnits);
  };

  const addNewRow = () => {
    setUnits([...units, { year: '', amount: '' }]);
  };

  const loadFromNetZeroPlanning = () => {
    const preFilledUnits: CarbonUnit[] = demoNetzeroNeeds.map((entry) => ({
      year: entry.year.toString(),
      amount: entry.gap.toString(),
      fromPlanning: true,
    }));
    setUnits(preFilledUnits);
    setPlanningLoaded(true);
  };

  const resetPlanning = () => {
    setUnits([]);
    setPlanningLoaded(false);
  };

  const removeRow = (index: number) => {
    const updatedUnits = units.filter((_, i) => i !== index);
    setUnits(updatedUnits);
    if (updatedUnits.every((u) => !u.fromPlanning)) {
      setPlanningLoaded(false);
    }
  };

  useEffect(() => {
    const validationMessage = validateUnits();
    setWarning(validationMessage);

    const validUnits = units
      .filter((unit) => {
        const year = parseInt(unit.year, 10);
        return year >= 2025 && year <= 2050 && unit.amount && !validationMessage;
      })
      .reduce(
        (acc, unit) => {
          acc[unit.year] = parseFloat(unit.amount);
          return acc;
        },
        {} as { [year: string]: number },
      );

    setCarbonUnitNeeds(validUnits);
  }, [units, setCarbonUnitNeeds, validateUnits]);

  return (
    <div className="w-1/2">
      <Title title="1. Carbon Unit Needs" subtitle="Specify the carbon unit needs per year." />
      <div className="mt-8 space-y-4">
        {warning && <div className="text-sm text-red-600">{warning}</div>}
        {units.length === 0 && !warning && (
          <div className="text-sm text-gray-600">
            Please add at least one constraint to define your carbon unit needs.
          </div>
        )}
        {planningLoaded && units.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-green-700/30 bg-green-900/20 px-3 py-2 text-sm text-green-400">
            <span>✓ Loaded from Net Zero Planning (SBTi-aligned trajectory)</span>
          </div>
        )}
        {units.map((unit, index) => (
          <div key={index} className="flex items-center gap-4">
            <input
              type="number"
              placeholder="Year"
              value={unit.year}
              onChange={(e) => handleInputChange(index, 'year', e.target.value)}
              className={`w-1/2 rounded-lg border ${
                warning && (parseInt(unit.year, 10) < 2025 || parseInt(unit.year, 10) > 2050)
                  ? 'border-red-600'
                  : unit.fromPlanning
                    ? 'border-green-700/50'
                    : 'border-gray-400'
              } p-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400`}
            />
            <div className="flex w-1/2 items-center">
              <input
                type="number"
                placeholder="Amount"
                value={unit.amount}
                onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                className={`flex-grow rounded-l-lg border ${
                  unit.fromPlanning ? 'border-green-700/50' : 'border-gray-400'
                } p-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400`}
              />
              <span className="rounded-r-lg border border-gray-400 bg-gray-800 px-4 py-2 text-gray-500">
                t
              </span>
            </div>
            <button
              onClick={() => removeRow(index)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500 shadow hover:bg-gray-300 hover:text-red-500 focus:outline-none"
              aria-label="Remove"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
        <div className="mt-4 flex w-full gap-2">
          <button
            onClick={addNewRow}
            className="w-1/2 rounded-lg border border-gray-300 bg-gray-300 p-2 text-gray-600 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            Add
          </button>
          {!planningLoaded ? (
            <button
              onClick={loadFromNetZeroPlanning}
              className="w-1/2 rounded-lg border border-green-700 bg-green-900/40 p-2 text-green-400 shadow-sm hover:bg-green-900/60 focus:outline-none focus:ring-1 focus:ring-green-600"
            >
              Load from Net Zero Planning
            </button>
          ) : (
            <button
              onClick={resetPlanning}
              className="w-1/2 rounded-lg border border-gray-500 bg-gray-700 p-2 text-gray-300 shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
