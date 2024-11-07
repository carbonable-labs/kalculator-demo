import { cn, Radio, RadioGroup } from '@nextui-org/react';
import { useEffect } from 'react';

interface RadioButtonsProps {
  values: { value: string; text: string }[];
  setSelected: (value: string | null) => void;
  selected: string | null;
}

export default function RadioButtons({ values, setSelected, selected }: RadioButtonsProps) {
  useEffect(() => {
    setSelected(selected);
  }, [selected]);

  return (
    <RadioGroup onValueChange={setSelected} value={selected}>
      <div className="flex w-full items-center justify-start gap-x-4">
        {values.map((value) => (
          <CustomRadio key={value.value} value={value.value}>
            {value.text}
          </CustomRadio>
        ))}
      </div>
    </RadioGroup>
  );
}

const CustomRadio = (props: any) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          'inline-flex m-0 bg-transparent hover:bg-opacityLight-5 items-center justify-between border-neutral-500',
          'flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-1',
          'data-[selected=true]:border-neutral-300 data-[selected=true]:bg-opacityLight-5',
        ),
        control: 'hidden',
        wrapper: 'hidden',
        labelWrapper: 'ml-0',
        label: 'uppercase font-light',
      }}
    >
      {children}
    </Radio>
  );
};
