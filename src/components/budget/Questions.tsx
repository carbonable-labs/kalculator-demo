import CalculateBudget from './Calculate';
import GeographicalArea from './GeographicalArea';
import InvestmentStrategy from './InvestmentStrategy';
import PlanningCycle from './PlanningCycle';
import ProjectTypology from './ProjectTypology';

export default function BudgetQuestions() {
  return (
    <div>
      <div>
        <PlanningCycle />
      </div>
      <div className="mt-16">
        <InvestmentStrategy />
      </div>
      <div className="mt-16">
        <ProjectTypology />
      </div>
      <div className="mt-16">
        <GeographicalArea />
      </div>
      <div className="mt-24 text-center">
        <CalculateBudget />
      </div>
    </div>
  );
}
