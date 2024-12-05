'use client';

import SliderWithInput from '@/components/form/SliderWithInput';

interface AfricaProps {
  isDisabled: boolean;
  value: number | number[];
  setValue: (value: number | number[]) => void;
}

export default function Africa({ isDisabled, value, setValue }: AfricaProps) {
  return (
    <SliderWithInput
      inputLabel="Africa"
      size="sm"
      step={1}
      minValue={0}
      maxValue={100}
      label="Africa"
      value={value as number}
      onChange={setValue}
      displayedValue={value as number}
      isDisabled={isDisabled}
    />
  );
}
