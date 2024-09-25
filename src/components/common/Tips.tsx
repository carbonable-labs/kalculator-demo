import { useBudget } from '@/context/BudgetContext';
import { Advice, Financing, RegionAllocation, TimeConstraint, Typology } from '@/types/types';
import Image from 'next/image';

interface TipsProps {
  text?: string;
  advice?: Advice;
  onClick?: () => void;
  isFullWidth?: boolean;
  isGradient?: boolean;
  title?: string;
}

export const Tips: React.FC<TipsProps> = ({
  advice,
  onClick,
  isFullWidth = false,
  isGradient = true,
  title = 'Tips',
}) => {
  if (advice == null || !advice.change || advice.tip == null) {
    return null;
  }

  const { setTimeConstraints, setFinancing, setTypology, setRegionAllocation, budgetResults } =
    useBudget();
  if (!budgetResults) {
    return null;
  }

  switch (advice.adviceType) {
    case 'timeline':
      onClick = () => {
        console.log('set time constraints');
        setTimeConstraints(advice.tip as TimeConstraint);
      };
      break;
    case 'financing':
      onClick = () => {
        setFinancing(advice.tip as Financing);
      };
      break;
    case 'typology':
      onClick = () => {
        if (advice.tip) {
          let tip = advice.tip as Typology[];
          if (tip.length > 0) {
            setTypology(tip[0] as Typology);
          }
        }
      };
      break;
    case 'geography':
      onClick = () => {
        console.log('set geography');
        if (advice.tip) {
          let tip = advice.tip as RegionAllocation[];
          if (tip.length > 0) {
            setRegionAllocation(tip[0] as RegionAllocation);
          }
        }
      };
      break;
    default:
  }

  let text = advice.tipPhrase;
  let buttonText = advice.actionText;
  let value = advice.budgetDelta ? `$${advice.budgetDelta.toFixed(0)}` : '';

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
          className={`flex items-center rounded-full bg-neutral-900 px-2 py-1 ${isFullWidth ? 'md:w-fit' : 'w-full'}`}
        >
          <div
            className="w-fit cursor-pointer rounded-full border border-greenish-500 px-2 py-1 font-thin text-greenish-500 hover:brightness-125"
            onClick={onClick}
          >
            {buttonText}
          </div>
          {value && <div className="ml-12 font-bold">{value}</div>}
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
