import StrategyQuestions from '@/components/strategy/Questions';
import StrategyResults from '@/components/strategy/Results';

export default function StrategyPage() {
  return (
    <>
      <div>
        <StrategyQuestions />
      </div>
      <div className="mt-20">
        <StrategyResults />
      </div>
    </>
  );
}
