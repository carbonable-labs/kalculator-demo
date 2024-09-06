'use client';
import { Checkbox, cn } from '@nextui-org/react';

interface DontKnowCheckboxProps {
  isSelected: boolean;
  setIsSelected: (value: boolean) => void;
}

export default function DontKnowCheckbox({ isSelected, setIsSelected }: DontKnowCheckboxProps) {
  return (
    <Checkbox
      aria-label="I don't know"
      classNames={{
        base: cn(
          'inline-flex w-fit max-w-md bg-opacityLight-5',
          'hover:bg-opacityLight-10 items-center justify-start',
          'cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent',
          'data-[selected=true]:border-primary',
        ),
        label: 'w-full',
      }}
      isSelected={isSelected}
      onValueChange={setIsSelected}
    >
      <div className="flex w-full justify-between gap-2">I don&apos;t know yet</div>
    </Checkbox>
  );
}
