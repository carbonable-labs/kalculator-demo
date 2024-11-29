import { useState } from 'react';
import { useRouter } from 'next/router';

export enum ConfigType {
  CarbonImpact = 'CarbonImpact',
  Durability = 'Durability',
  Biodiversity = 'Biodiversity',
  ProjectMaker = 'ProjectMaker',
}

const InputForm = () => {
  const [timeConstraints, setTimeConstraints] = useState<number>(1);
  const [exPost, setFinancingExPost] = useState<number>(0.5);
  const [exAnte, setFinancingExAnte] = useState<number>(0.5);
  const [budget, setBudget] = useState<number>(100000); // Budget input
  const [regionAllocation, setRegionAllocation] = useState({
    northAmerica: 0.4,
    southAmerica: 0.3,
    europe: 0.2,
    africa: 0.1,
    asia: 0,
    oceania: 0,
  });
  const [selectedConfigTypes, setSelectedConfigTypes] = useState<ConfigType[]>([]);

  const router = useRouter();

  const handleConfigTypeChange = (type: ConfigType) => {
    if (selectedConfigTypes.includes(type)) {
      setSelectedConfigTypes(selectedConfigTypes.filter((t) => t !== type));
    } else {
      setSelectedConfigTypes([...selectedConfigTypes, type]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const inputData = {
      timeConstraints,
      financing: {
        exPost,
        exAnte,
      },
      regionAllocation,
      budget, // Include budget in input data
      configType: selectedConfigTypes, // Include selected config types in input data
    };

    const response = await fetch('/api/run-typo-algo', {
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
      <h1 className="mb-4 text-2xl font-bold">Typo Budget Input Form</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium">Time Constraints (Years)</label>
          <input
            type="number"
            value={timeConstraints}
            onChange={(e) => setTimeConstraints(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

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

        <h2 className="mt-4 text-xl font-bold">Select Config Type</h2>

        {Object.values(ConfigType).map((type) => (
          <div className="mb-4" key={type}>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectedConfigTypes.includes(type)}
                onChange={() => handleConfigTypeChange(type)}
                className="mr-2"
              />
              {type}
            </label>
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
