import InvestmentStrategy from './InvestmentStrategy';
import PlanningCycle from './PlanningCycle';

export default function BudgetQuestions() {
  return (
    <div>
      <div>
        <PlanningCycle />
      </div>
      <div className="mt-12">
        <InvestmentStrategy />
      </div>
    </div>
  );
}
