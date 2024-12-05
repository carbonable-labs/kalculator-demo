'use client';

import SliderWithInput from '@/components/form/SliderWithInput';

interface NorthAmericaProps {
  isDisabled: boolean;
  value: number | number[];
  setValue: (value: number | number[]) => void;
}

export default function NorthAmerica({ isDisabled, value, setValue }: NorthAmericaProps) {
  return (
    <SliderWithInput
      inputLabel="North America"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="North America"
      value={value as number}
      onChange={setValue}
      displayedValue={value as number}
      isDisabled={isDisabled}
    />
  );
}
