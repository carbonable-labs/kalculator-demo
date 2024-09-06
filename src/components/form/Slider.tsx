import { cn, Slider } from '@nextui-org/react';

interface SliderProps {
  size: Size;
  step: number;
  minValue: number;
  maxValue: number;
  label: string;
  value: number;
  className?: string;
  isDisabled?: boolean;
  displayType?: 'plain' | 'gradient';
  onChange: (value: number | number[]) => void;
}

export type Size = 'sm' | 'md' | 'lg' | undefined;

export default function SliderComponent({
  size = 'sm',
  step,
  minValue,
  maxValue,
  label,
  value,
  className,
  isDisabled,
  displayType = 'gradient',
  onChange,
}: SliderProps) {
  
  const gradientClassNames = {
    filler: 'bg-gradient-to-r from-primary to-secondary',
    thumb: ['bg-white border-white before:bg-white, after:bg-white'],
    track: 'bg-neutral-300',
  };

  const plainClassNames = {
    filler: 'bg-primary',
    thumb: 'bg-white border-white before:bg-white, after:bg-white',
    track: 'bg-secondary',
  };
  return (
    <Slider
      isDisabled={isDisabled}
      size={size}
      step={step}
      maxValue={maxValue}
      minValue={minValue}
      aria-label={label}
      value={value}
      className={`w-full ${className}`}
      onChange={onChange}
      classNames={displayType === 'gradient' ? gradientClassNames: plainClassNames}
    />
  );
}
