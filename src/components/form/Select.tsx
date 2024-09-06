'use client';

import { Select, SelectItem } from "@nextui-org/react";
import { use, useState } from "react";

interface SelectComponentProps {
  question: string;
  label?: string;
  isRequired?: boolean;
  options: { key: string; value: string }[];
  className?: string;
  onChange: (value: string) => void;
}

export default function SelectComponent({
  question,
  label,
  options,
  isRequired = false,
  className,
  onChange,
}: SelectComponentProps) {
  const [value, setValue] = useState<string>('');

  const handleSelectionChange = (e: any) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-sm font-light w-8/12">
        {question}
      </div>
      <div className="w-4/12">
        <Select
          variant="bordered"
          label={label}
          className="w-full" 
          isRequired={isRequired}
          selectedKeys={[value]}
          onChange={handleSelectionChange}
        >
          {options.map((option) => (
            <SelectItem key={option.key}>
              {option.value}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}