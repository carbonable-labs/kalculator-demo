import Image from 'next/image';

interface TipsProps {
  text: string;
  buttonText?: string;
  onClick?: () => void;
  value?: string;
  idFullWidth?: boolean;
}

export const Tips: React.FC<TipsProps> = ({
  text,
  buttonText,
  onClick,
  value,
  idFullWidth = false,
}) => {
  if (!buttonText) {
    return (
      <TipsBackground>
        <p className="text-sm text-opacity-80">{text}</p>
      </TipsBackground>
    );
  }

  return (
    <TipsBackground>
      <div className="flex flex-wrap items-center justify-between">
        <div className={`text-sm ${idFullWidth ? 'md:w-8/12' : 'w-full'}`}>{text}</div>
        <div
          className={`flex items-center rounded-full bg-neutral-900 py-1 pl-2 pr-4 ${idFullWidth ? 'md:w-fit' : 'w-full'}`}
        >
          <div
            className="w-fit cursor-pointer rounded-full border border-greenish-500 px-2 py-1 font-thin text-greenish-500 hover:brightness-125"
            onClick={onClick}
          >
            {buttonText}
          </div>
          <div className="ml-12 font-bold">{value}</div>
        </div>
      </div>
    </TipsBackground>
  );
};

const TipsBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-tips-gradient rounded-lg p-8">
      <div className="flex items-center justify-start">
        <Image src="/assets/logo.svg" width={24} height={24} alt="Tips" />
        <div className="ml-2 font-bold text-opacity-80">Tips</div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
};
