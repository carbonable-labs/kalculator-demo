'use client';

import SliderWithInput from '@/components/form/SliderWithInput';

interface LatinAmericaProps {
  isDisabled: boolean;
  value: number | number[];
  setValue: (value: number | number[]) => void;
}

export default function LatinAmerica({ isDisabled, value, setValue }: LatinAmericaProps) {
  return (
    <SliderWithInput
      inputLabel="Latin America"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="Latin America"
      value={value as number}
      onChange={setValue}
      displayedValue={value as number}
      isDisabled={isDisabled}
    />
  );
}
