import SliderComponent, { Size } from './Slider';

interface SliderWithInputProps {
  inputLabel: string;
  size: Size;
  step: number;
  minValue: number;
  maxValue: number;
  label: string;
  value: number;
  className?: string;
  isDisabled?: boolean;
  displayedValue: number;
  onChange: (value: number | number[]) => void;
}

export default function SliderWithInput({
  inputLabel,
  size,
  step,
  minValue,
  maxValue,
  label,
  value,
  className,
  isDisabled,
  displayedValue,
  onChange,
}: SliderWithInputProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`w-3/12 rounded-lg border border-neutral-100 px-4 py-2 text-sm ${isDisabled ? 'opacity-50' : ''}`}
      >
        {inputLabel}
      </div>
      <div className="w-8/12 px-6">
        <SliderComponent
          size={size}
          step={step}
          minValue={minValue}
          maxValue={maxValue}
          label={label}
          value={value}
          className={className}
          isDisabled={isDisabled}
          onChange={onChange}
        />
      </div>
      <div
        className={`flex w-1/12 items-center rounded-lg border border-opacityLight-5 text-sm ${isDisabled ? 'opacity-50' : ''}`}
      >
        <div className="w-7/12 px-4 py-2">{Math.floor(displayedValue)}</div>
        <div className="w-5/12 rounded-r-md border-l border-l-opacityLight-5 bg-opacityLight-10 py-2 text-center">
          %
        </div>
      </div>
    </div>
  );
}
