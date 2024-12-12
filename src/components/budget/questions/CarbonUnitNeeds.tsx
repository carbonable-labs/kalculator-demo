'use client';

import { useState, useEffect } from 'react';
import { useBudget } from '@/context/BudgetContext';
import Title from '@/components/form/Title';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface CarbonUnit {
  year: string;
  amount: string;
}

export default function CarbonUnitNeeds() {
  const [units, setUnits] = useState<CarbonUnit[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const { setCarbonUnitNeeds } = useBudget();

  const validateUnits = () => {
    const years = units.map((unit) => unit.year);
    const invalidYear = units.find(
      (unit) =>
        parseInt(unit.year, 10) < 2025 || parseInt(unit.year, 10) > 2050 || unit.year === '',
    );
    const hasDuplicateYears = new Set(years).size !== years.length;

    if (invalidYear) {
      return 'Years must be between 2025 and 2050.';
    }

    if (hasDuplicateYears) {
      return 'Each year must be unique.';
    }

    return null;
  };

  const handleInputChange = (index: number, field: keyof CarbonUnit, value: string) => {
    const updatedUnits = [...units];
    updatedUnits[index][field] = value;
    setUnits(updatedUnits);
  };

  const addNewRow = () => {
    setUnits([...units, { year: '', amount: '' }]);
  };

  const removeRow = (index: number) => {
    const updatedUnits = units.filter((_, i) => i !== index);
    setUnits(updatedUnits);
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
  }, [units, setCarbonUnitNeeds]);

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
                  : 'border-gray-400'
              } p-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400`}
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
            <button
              onClick={() => removeRow(index)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500 shadow hover:bg-gray-300 hover:text-red-500 focus:outline-none"
              aria-label="Remove"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
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
