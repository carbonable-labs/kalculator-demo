import { Advice } from '@/types/types';
import { formatLargeNumber } from '@/utils/output';
import Image from 'next/image';

interface TipsProps {
  advice?: Advice;
  isFullWidth?: boolean;
  isGradient?: boolean;
  title?: string;
  onAdviceApply: (advice: Advice) => void;
  shouldRender: boolean;
}

export const TipsComponent: React.FC<TipsProps> = ({
  advice,
  isFullWidth = false,
  isGradient = true,
  title = 'Tips',
  onAdviceApply,
  shouldRender,
}) => {
  if (!shouldRender || advice == null || !advice.change) {
    return null;
  }

  const text = advice.tipPhrase;
  const buttonText = advice.actionText;
  const value = advice.budgetDelta ? `$${formatLargeNumber(advice.budgetDelta)}` : '';

  const onClick = () => {
    onAdviceApply(advice);
  };

  if (!buttonText) {
    return (
      <TipsBackground isFullWidth={isFullWidth} isGradient={isGradient} title={title}>
        <p className="text-sm text-opacity-80">{text}</p>
      </TipsBackground>
    );
  }

  return (
    <TipsBackground isFullWidth={isFullWidth} isGradient={isGradient} title={title}>
      <div className="flex flex-wrap items-center justify-between">
        <div className={`${isFullWidth ? 'md:w-8/12' : 'w-full'}`}>{text}</div>
        <div
          className={`flex flex-wrap items-center bg-neutral-900 ${isFullWidth ? 'rounded-full py-1 pl-2 pr-4 md:w-fit' : 'mt-2 w-full rounded-lg px-2 py-2'}`}
        >
          <div
            className={`cursor-pointer border border-greenish-500 px-2 py-1 font-thin text-greenish-500 hover:brightness-125 ${isFullWidth ? 'order-1 w-fit rounded-full' : 'order-2 mt-2 w-full rounded-lg text-center'}`}
            onClick={onClick}
          >
            {buttonText}
          </div>
          {value && (
            <div
              className={`font-bold ${isFullWidth ? 'order-2 ml-12' : 'order-1 mx-auto text-center'}`}
            >
              {value}
            </div>
          )}
        </div>
      </div>
    </TipsBackground>
  );
};

const TipsBackground = ({
  isFullWidth,
  isGradient,
  children,
  title,
}: {
  isFullWidth: boolean;
  isGradient: boolean;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`rounded-lg ${isGradient ? 'bg-tips-gradient' : 'bg-optimize'} ${isFullWidth ? 'p-8' : 'p-4'}`}
    >
      <div className="flex items-center justify-start">
        <Image src="/assets/logo.svg" width={24} height={24} alt="Tips" />
        <div className="ml-2 font-bold text-opacity-80">{title}</div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
};
