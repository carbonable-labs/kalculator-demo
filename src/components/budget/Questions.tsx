import CalculateBudget from './questions/Calculate';
import GeographicalArea from './questions/GeographicalArea';
import InvestmentStrategy from './questions/InvestmentStrategy';
import PlanningCycle from './questions/PlanningCycle';
import ProjectTypology from './questions/ProjectTypology';

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
