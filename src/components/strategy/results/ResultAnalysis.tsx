import Image from 'next/image';

interface ResultAnalysisProps {
  resultIsOk: boolean;
}

export const ResultAnalysis: React.FC<ResultAnalysisProps> = ({ resultIsOk }) => {
  const text = resultIsOk
    ? 'Your plan seems to align with your budget. However, there are still opportunities to optimize and enhance your approach. Explore the options below for more insights.'
    : "Your plan and budget don't seem to align. But don't worry—we can help! You can follow the recommendations below to get back on track, or let us automatically help you find the best path to meet your budget.";

  return (
    <TipsBackground resultIsOk={resultIsOk}>
      <div className="flex flex-wrap items-center justify-between">
        <div className={`ml-10 w-full ${resultIsOk ? 'text-neutral-100' : 'text-neutral-900'}`}>
          {text}
        </div>
      </div>
    </TipsBackground>
  );
};

const TipsBackground = ({
  children,
  resultIsOk,
}: {
  resultIsOk: boolean;
  children: React.ReactNode;
}) => {
  const title = resultIsOk ? 'Well done! 👏' : 'Uh-Oh... 😬';
  const bg = resultIsOk ? 'bg-strategy-ok' : 'bg-strategy-ko';

  return (
    <div className={`rounded-lg p-8 ${bg} bg-cover bg-no-repeat`}>
      <div className="flex items-center justify-start">
        <Image
          src={`${resultIsOk ? '/assets/logo.svg' : '/assets/logo-black.svg'}`}
          width={24}
          height={24}
          alt="Carbonable logo"
        />
        <div
          className={`ml-4 font-bold text-opacity-80 ${resultIsOk ? 'text-neutral-100' : 'text-neutral-900'}`}
        >
          {title}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
};
