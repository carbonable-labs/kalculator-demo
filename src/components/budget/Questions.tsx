import CalculateBudget from './questions/Calculate';
import GeographicalArea from './questions/GeographicalArea';
import InvestmentStrategy from './questions/InvestmentStrategy';
import PlanningCycle from './questions/PlanningCycle';
import ProjectTypology from './questions/ProjectTypology';
import CarbonUnitNeeds from './questions/CarbonUnitNeeds';
import { TipsComponent } from '../common/Tip_alt';

export default function BudgetQuestions() {
  const staticAdvice = {
    change: false,
    tipPhrase: `This tool combines advanced algorithms with over 3,000 data points to provide intelligent, tailored insights for your contribution strategy. It is designed to optimize complex scenarios and evolves continuously with enhanced granularity and new features.
    
If you have specific needs or would like deeper clarity, our team is here to guide you and help you make the most of its potential.`,
  };

  return (
    <div>
      <div className="mb-8">
        <TipsComponent
          advice={staticAdvice}
          isFullWidth={true}
          isGradient={true}
          title="Please Note"
          onAdviceApply={() => {}}
          shouldRender={true}
        />
      </div>

      <div>
        <CarbonUnitNeeds />
      </div>
      <div className="mt-16">
        <PlanningCycle />
      </div>
      <div className="mt-16">
        <ProjectTypology />
      </div>
      <div className="mt-16">
        <GeographicalArea />
      </div>
      <div className="mt-16">
        <InvestmentStrategy />
      </div>
      <div className="mt-16 text-center">
        <CalculateBudget />
      </div>
    </div>
  );
}
