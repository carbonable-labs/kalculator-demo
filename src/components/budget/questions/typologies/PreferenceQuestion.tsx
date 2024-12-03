import React from 'react';

interface PreferenceQuestionProps {
  question: string;
  options: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
}

const PreferenceQuestion: React.FC<PreferenceQuestionProps> = ({
  question,
  options,
  value,
  onChange,
}) => {
  return (
    <div className="mb-4 flex items-center">
      <label className="w-1/2">{question}</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-1/2 border px-2 py-1 rounded"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PreferenceQuestion;
