import React from 'react';

interface PreferenceQuestionProps {
  question: string;
  value: number;
  onChange: (value: number) => void;
  dontMind: boolean;
  onDontMindChange: (value: boolean) => void;
  hint?: string;
}

const PreferenceQuestion: React.FC<PreferenceQuestionProps> = ({
  question,
  value,
  onChange,
  dontMind,
  onDontMindChange,
  hint,
}) => {
  const handleDontMindChange = (checked: boolean) => {
    onDontMindChange(checked);
    if (!checked) {
      onChange(1); // Set slider value to 1 when "Skip this criteria" is unchecked
    }
  };

  return (
    <div className="mb-6 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <label className="text-sm text-neutral-200">{question}</label>
        </div>

        <div className="flex flex-1 items-center justify-end">
          <div className="mr-4 flex items-center">
            <input
              type="checkbox"
              checked={dontMind}
              onChange={(e) => handleDontMindChange(e.target.checked)}
              className="form-checkbox h-4 w-4 border-neutral-500 bg-neutral-800 text-neutral-500"
            />
            <span className="ml-2 text-sm text-neutral-200">Skip this criteria</span>
          </div>

          <div className="flex w-1/2 items-center">
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={dontMind ? 0 : value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="slider-range w-full"
              disabled={dontMind}
            />
            <div className="ml-4 text-sm text-neutral-200">{dontMind ? '-' : value}</div>
          </div>
        </div>
      </div>

      {hint && <div className="mr-8 mt-2 text-right text-xs text-neutral-400">{hint}</div>}
    </div>
  );
};

export default PreferenceQuestion;
