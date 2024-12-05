'use client';

import SliderWithInput from '@/components/form/SliderWithInput';

interface AsiaProps {
  isDisabled: boolean;
  value: number | number[];
  setValue: (value: number | number[]) => void;
}

export default function Asia({ isDisabled, value, setValue }: AsiaProps) {
  return (
    <SliderWithInput
      inputLabel="Asia"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="Asia"
      value={value as number}
      onChange={setValue}
      displayedValue={value as number}
      isDisabled={isDisabled}
    />
  );
}
