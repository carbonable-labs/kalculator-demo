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
    <div className="mb-6 flex items-center">
      <label className="w-1/2 text-sm text-neutral-200">{question}</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
