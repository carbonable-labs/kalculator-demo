'use client';
import { useEffect, useState } from 'react';

interface InputWithQuestionProps {
  value: number;
  onChange: (value: number) => void;
}

export default function InputWithQuestion({ value, onChange }: InputWithQuestionProps) {
  const [formattedValue, setFormattedValue] = useState('');

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    const numericValue = parseInt(inputValue, 10);

    onChange(isNaN(numericValue) ? 0 : numericValue);
  };

  useEffect(() => {
    setFormattedValue(formatNumber(value));
  }, [value]);

  return (
    <div className="flex items-center justify-start">
      <div className="font-light text-neutral-200">What is you budget overall?</div>
      <div className={`ml-8 flex items-center rounded-lg border border-opacityLight-5 text-sm`}>
        <div className="w-10/12 px-4 py-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="no-spinner h-full w-full min-w-52 border-none bg-transparent outline-none"
            placeholder="1000000"
            value={formattedValue}
            onChange={handleInputChange}
          />
        </div>
        <div className="w-2/12 rounded-r-md border-l border-l-opacityLight-5 bg-opacityLight-10 py-2 text-center">
          $
        </div>
      </div>
    </div>
  );
}
