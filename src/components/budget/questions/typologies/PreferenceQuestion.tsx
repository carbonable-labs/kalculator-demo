import React from 'react';

interface PreferenceQuestionProps {
  question: string;
  value: number;
  onChange: (value: number) => void;
}

const PreferenceQuestion: React.FC<PreferenceQuestionProps> = ({ question, value, onChange }) => {
  return (
    <div className="mb-6 flex items-center">
      <label className="w-1/2 text-sm text-neutral-200">{question}</label>
      <div className="flex w-1/2 items-center">
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
    </div>
  );
};

export default PreferenceQuestion;
