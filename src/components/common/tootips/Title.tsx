import QuestionTooltip from '@/components/form/Tooltip';

interface TitleProps {
  title: string;
  tooltip?: React.ReactNode;
  subtitle?: string;
}

export default function Title({ title, tooltip, subtitle }: TitleProps) {
  return (
    <>
      <div className="flex items-start justify-start">
        <div className="mr-2 text-lg font-bold text-neutral-50">{title}</div>
        {tooltip && <QuestionTooltip tooltip={tooltip} />}
      </div>
      {subtitle && <div className="mt-2 text-sm text-neutral-200">{subtitle}</div>}
    </>
  );
}

export function ChartTitle({ title }: TitleProps) {
  return (
    <>
      <div className="flex items-start justify-start">
        <div className="font-semibold text-neutral-50">{title}</div>
      </div>
    </>
  );
}
