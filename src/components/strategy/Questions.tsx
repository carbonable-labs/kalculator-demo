import Budget from './questions/Budget';
import GeographicalArea from './questions/GeographicalArea';
import InvestmentStrategy from './questions/InvestmentStrategy';
import PlanningCycle from './questions/PlanningCycle';
import ProjectTypology from './questions/ProjectTypology';

export default function StrategyQuestions() {
  return (
    <div>
      <div>
        <Budget />
      </div>
      <div className="mt-16">
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
    </div>
  );
}
