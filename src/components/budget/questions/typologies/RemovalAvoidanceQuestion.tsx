import React from 'react';

interface RemovalAvoidanceQuestionProps {
  question: string;
  value: 'dontMind' | 'removal' | 'avoidance';
  onChange: (value: 'dontMind' | 'removal' | 'avoidance') => void;
  hint?: string;
}

const RemovalAvoidanceQuestion: React.FC<RemovalAvoidanceQuestionProps> = ({
  question,
  value,
  onChange,
  hint,
}) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex-1 pr-4">
        <label className="text-sm text-neutral-200">{question}</label>
        {hint && <div className="mt-1 text-xs text-neutral-400">{hint}</div>}
      </div>
      <div className="flex flex-1 items-center justify-end">
        <label className="flex items-center">
          <input
            type="radio"
            value="removal"
            checked={value === 'removal'}
            onChange={() => onChange('removal')}
            className="form-radio h-4 w-4 text-neutral-500"
          />
          <span className="ml-2 text-sm text-neutral-200">Only removal</span>
        </label>
        <label className="ml-4 flex items-center">
          <input
            type="radio"
            value="dontMind"
            checked={value === 'dontMind'}
            onChange={() => onChange('dontMind')}
            className="form-radio h-4 w-4 text-neutral-500"
          />
          <span className="ml-2 text-sm text-neutral-200">I don’t mind</span>
        </label>
        <label className="ml-4 flex items-center">
          <input
            type="radio"
            value="avoidance"
            checked={value === 'avoidance'}
            onChange={() => onChange('avoidance')}
            className="form-radio h-4 w-4 text-neutral-500"
          />
          <span className="ml-2 text-sm text-neutral-200">Only avoidance</span>
        </label>
      </div>
    </div>
  );
};

export default RemovalAvoidanceQuestion;
