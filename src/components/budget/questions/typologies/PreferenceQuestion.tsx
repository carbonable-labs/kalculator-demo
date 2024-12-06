import React from 'react';

interface PreferenceQuestionProps {
  question: string;
  value: number;
  onChange: (value: number) => void;
  dontCare: boolean;
  onDontCareChange: (value: boolean) => void;
  hint?: string;
}

const PreferenceQuestion: React.FC<PreferenceQuestionProps> = ({
  question,
  value,
  onChange,
  dontCare,
  onDontCareChange,
  hint,
}) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex-1 pr-4">
        <label className="text-sm text-neutral-200">{question}</label>
        {hint && <div className="mt-1 text-xs text-neutral-400">{hint}</div>}
      </div>

      <div className="flex flex-1 items-center justify-end">
        <div className="mr-4 flex items-center">
          <input
            type="checkbox"
            checked={dontCare}
            onChange={(e) => onDontCareChange(e.target.checked)}
            className="form-checkbox h-4 w-4 border-neutral-500 bg-neutral-800 text-neutral-500"
          />
          <span className="ml-2 text-sm text-neutral-200">I don't care</span>
        </div>

        <div className="flex w-1/2 items-center">
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={dontCare ? 0 : value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="slider-range w-full"
            disabled={dontCare}
          />
          <div className="ml-4 text-sm text-neutral-200">{dontCare ? '-' : value}</div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceQuestion;
