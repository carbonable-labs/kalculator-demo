'use client';

import SliderWithInput from '@/components/form/SliderWithInput';

interface EuropeProps {
  isDisabled: boolean;
  value: number | number[];
  setValue: (value: number | number[]) => void;
}

export default function Europe({ isDisabled, value, setValue }: EuropeProps) {
  return (
    <SliderWithInput
      inputLabel="Europe"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="Europe"
      value={value as number}
      onChange={setValue}
      displayedValue={value as number}
      isDisabled={isDisabled}
    />
  );
}
