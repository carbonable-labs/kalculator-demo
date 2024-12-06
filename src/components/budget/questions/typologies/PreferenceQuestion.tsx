import React from 'react';

interface PreferenceQuestionProps {
  question: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string; // Nouveau : une indication contextuelle
}

const PreferenceQuestion: React.FC<PreferenceQuestionProps> = ({ question, value, onChange, hint }) => {
  return (
    <div className="mb-6 flex flex-col">
      <label className="text-sm text-neutral-200 mb-2">{question}</label>
      <div className="flex items-center">
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-range w-full"
        />
        <div className="ml-4 text-sm text-neutral-200">{value}</div>
      </div>
      {hint && <div className="text-xs text-neutral-400 mt-1">{hint}</div>}
    </div>
  );
};

export default PreferenceQuestion;
