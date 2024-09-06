'use client';

import { useEffect, useState } from "react";
import { GreenButton } from "../form/Button";
import { runBudgetAlgo } from "@/actions/budget";
import { useBudget } from "@/context/BudgetContext";

export default function CalculateBudget() {
  const [isLoading, setIsLoading] = useState(false);
  const [canCalculate, setCanCalculate] = useState(false);
  const { financing, regionAllocation, timeConstraints, typology } = useBudget();

  useEffect(() => {
    if (financing && regionAllocation && timeConstraints && typology) {
      setCanCalculate(true);
    } else {
      setCanCalculate(false);
    }
  }, [financing, regionAllocation, timeConstraints, typology]);

  const handleClick = async () => {
    setIsLoading(true);
    console.log(financing, regionAllocation, timeConstraints, typology);
    if (!financing || !regionAllocation || !timeConstraints || !typology) {
      setIsLoading(false);
      return;
    }

    const {adjustedBudget, totalBudget } = await runBudgetAlgo({
      financing,
      regionAllocation,
      timeConstraints,
      typology,
    });

    setIsLoading(false);
  };

  return (
    <GreenButton disabled={!canCalculate} isLoading={isLoading} onClick={handleClick}>Calculate</GreenButton>
  );
}