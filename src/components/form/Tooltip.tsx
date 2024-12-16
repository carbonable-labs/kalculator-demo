import { InformationCircleIcon } from '@heroicons/react/24/outline';

import { Tooltip } from '@nextui-org/react';

interface QuestionTooltipProps {
  title?: string;
  tooltip: React.ReactNode;
}

function QuestionTooltip({ tooltip }: QuestionTooltipProps) {
  return (
    <Tooltip
      showArrow
      placement="right"
      content={tooltip}
      classNames={{
        content: ['py-4 px-6 shadow-xl'],
      }}
    >
      <InformationCircleIcon width={24} />
    </Tooltip>
  );
}

export default QuestionTooltip;
