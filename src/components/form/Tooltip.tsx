import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '@nextui-org/react';

interface QuestionTooltipProps {
  title?: string;
  tooltip: string;
}

function QuestionTooltip({ tooltip }: QuestionTooltipProps) {
  return (
    <Tooltip showArrow placement="right" content={tooltip}>
      <QuestionMarkCircleIcon width={16} />
    </Tooltip>
  );
}

export default QuestionTooltip;
