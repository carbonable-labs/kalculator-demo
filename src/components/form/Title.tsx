import QuestionTooltip from './Tooltip';

interface TitleProps {
  title: string;
  tooltip?: React.ReactNode;
  subtitle?: string;
}

export default function Title({ title, tooltip, subtitle }: TitleProps) {
  return (
    <>
      <div className="flex items-start justify-start">
        <div className="mr-2 font-bold text-neutral-50">{title}</div>
        {tooltip && <QuestionTooltip tooltip={tooltip} />}
      </div>
      {subtitle && <div className="mt-2 text-sm text-neutral-200">{subtitle}</div>}
    </>
  );
}
