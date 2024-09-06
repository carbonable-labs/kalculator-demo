'use client';
import { useState } from "react";
import { GreenButton } from "../form/Button";

export default function CalculateBudget() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <GreenButton isLoading={isLoading} onClick={handleClick}>Calculate</GreenButton>
  );
}