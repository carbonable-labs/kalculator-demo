import { cn, Slider } from '@nextui-org/react';

interface SliderProps {
  size: Size;
  step: number;
  minValue: number;
  maxValue: number;
  label: string;
  defaultValue: number;
  className?: string;
  isDisabled?: boolean;
  onChange: (value: number | number[]) => void;
}

type Size = 'sm' | 'md' | 'lg' | undefined;

export default function SliderComponent({
  size = 'sm',
  step,
  minValue,
  maxValue,
  label,
  defaultValue,
  className,
  isDisabled,
  onChange,
}: SliderProps) {
  return (
    <Slider
      isDisabled={isDisabled}
      size={size}
      step={step}
      maxValue={maxValue}
      minValue={minValue}
      aria-label={label}
      defaultValue={defaultValue}
      className={`w-full ${className}`}
      onChange={onChange}
      classNames={{
        filler: 'bg-primary',
        thumb: ['bg-white border-white before:bg-white, after:bg-white'],
        track: 'bg-secondary',
      }}
    />
  );
}
