import BudgetQuestions from '@/components/budget/Questions';
import BudgetResults from '@/components/budget/Result';

export default function BudgetPage() {
  return (
    <>
      <div>
        <BudgetQuestions />
      </div>
      <div className="mt-20">
        <BudgetResults />
      </div>
    </>
  );
}
