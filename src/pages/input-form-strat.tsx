// src/pages/input-form.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';

const InputForm = () => {
  const [budget, setBudget] = useState<number>(0);
  const [timeConstraints, setTimeConstraints] = useState<number>(1);
  const [exPost, setFinancingExPost] = useState<number>(0.5);
  const [exAnte, setFinancingExAnte] = useState<number>(0.5);
  const [nbsRemoval, setNbsRemoval] = useState<number>(0.4);
  const [nbsAvoidance, setNbsAvoidance] = useState<number>(0.3);
  const [biochar, setBiochar] = useState<number>(0.2);
  const [dac, setDac] = useState<number>(0.1);
  const [regionAllocation, setRegionAllocation] = useState({
    northAmerica: 0.2,
    southAmerica: 0.2,
    europe: 0.2,
    africa: 0.2,
    asia: 0.1,
    oceania: 0.1,
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const inputData = {
      timeConstraints,
      budget,
      financing: {
        exPost,
        exAnte,
      },
      typology: {
        nbsRemoval,
        nbsAvoidance,
        biochar,
        dac,
      },
      regionAllocation,
    };

    const response = await fetch('/api/run-strat-algo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });

    const result = await response.json();
    console.log(result);

    // Redirect to a results page or display the result directly
    // router.push('/results');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Input Form</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium">Budget</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Time Constraints</label>
          <input
            type="number"
            value={timeConstraints}
            onChange={(e) => setTimeConstraints(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Financing Ex-Post</label>
          <input
            type="number"
            step="0.01"
            value={exPost}
            onChange={(e) => setFinancingExPost(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Financing Ex-Ante</label>
          <input
            type="number"
            step="0.01"
            value={exAnte}
            onChange={(e) => setFinancingExAnte(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <h2 className="mt-4 text-xl font-bold">Typology</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium">Nbs Removal</label>
          <input
            type="number"
            step="0.01"
            value={nbsRemoval}
            onChange={(e) => setNbsRemoval(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Nbs Avoidance</label>
          <input
            type="number"
            step="0.01"
            value={nbsAvoidance}
            onChange={(e) => setNbsAvoidance(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Biochar</label>
          <input
            type="number"
            step="0.01"
            value={biochar}
            onChange={(e) => setBiochar(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">DAC</label>
          <input
            type="number"
            step="0.01"
            value={dac}
            onChange={(e) => setDac(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <h2 className="mt-4 text-xl font-bold">Region Allocation</h2>

        {Object.keys(regionAllocation).map((region) => (
          <div className="mb-4" key={region}>
            <label className="block text-sm font-medium">{region}</label>
            <input
              type="number"
              step="0.01"
              value={regionAllocation[region as keyof typeof regionAllocation]}
              onChange={(e) =>
                setRegionAllocation({
                  ...regionAllocation,
                  [region]: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded border p-2"
            />
          </div>
        ))}

        <button type="submit" className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
          Run Algorithm
        </button>
      </form>
    </div>
  );
};

export default InputForm;
