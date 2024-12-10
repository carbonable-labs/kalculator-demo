import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from 'recharts';
import { formatLargeNumber } from '@/utils/output';
import {
  YearlyStrategy,
  CostByYearAndFinancing,
  CostByYearAndRegion,
  CostByYearAndTypology,
} from '@/types/types';
import { displayedNames, fillMissingYears, getYearRange } from '@/utils/charts';

// Filter type enum
const FilterTypes = {
  GLOBAL: 'global',
  TYPE: 'type',
  FINANCING: 'financing',
  REGION: 'region',
} as const;

type FilterType = (typeof FilterTypes)[keyof typeof FilterTypes];

const barColors: Record<string, string> = {
  // Typologies
  nbsAvoidance: '#6ee7b7',
  nbsRemoval: '#29A46F',
  renewableEnergy: '#FBBF24',
  biochar: '#f97316',
  dac: '#3b82f6',
  // Regions
  africa: '#f59e0b',
  asia: '#10b981',
  europe: '#2563eb',
  northAmerica: '#f87171',
  oceania: '#8b5cf6',
  southAmerica: '#ec4899',
  // Financing
  exAnte: '#145136',
  exPost: '#29A46F',
  // Global
  total: '#3b82f6',
};

interface BudgetResults {
  strategies: YearlyStrategy[];
}

interface FilteredCostChartProps {
  costPerType: CostByYearAndTypology | undefined;
  costPerFinancing: CostByYearAndFinancing | undefined;
  costPerGeography: CostByYearAndRegion | undefined;
  budgetResults: BudgetResults | null;
}

interface ChartDataItem {
  year: number;
  [key: string]: number | string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const FilteredCostChart: React.FC<FilteredCostChartProps> = ({
  costPerType,
  costPerFinancing,
  costPerGeography,
  budgetResults,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterTypes.GLOBAL);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  const prepareGlobalData = (): ChartDataItem[] => {
    if (!budgetResults?.strategies) return [];

    const years = Array.from(
      new Set(budgetResults.strategies.map((s: YearlyStrategy) => s.year)),
    ).sort();

    const { minYear, maxYear } = {
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
    };

    const baseData = years.map((year) => ({
      year,
      total: budgetResults.strategies
        .filter((s) => s.year === year)
        .reduce((acc, curr) => acc + curr.cost_medium, 0),
    }));

    return fillMissingYears(baseData, minYear, maxYear);
  };

  const prepareTypologyData = (): ChartDataItem[] => {
    if (!costPerType) return [];

    const { minYear, maxYear } = getYearRange(costPerType);
    const baseData = Object.keys(costPerType).map((year) => ({
      year: parseInt(year),
      ...costPerType[parseInt(year)],
    }));

    return fillMissingYears(baseData, minYear, maxYear);
  };

  const prepareFinancingData = (): ChartDataItem[] => {
    if (!costPerFinancing) return [];

    const { minYear, maxYear } = getYearRange(costPerFinancing);
    const baseData = Object.keys(costPerFinancing).map((year) => ({
      year: parseInt(year),
      exAnte: costPerFinancing[parseInt(year)].exAnte,
      exPost: costPerFinancing[parseInt(year)].exPost,
    }));

    return fillMissingYears(baseData, minYear, maxYear);
  };

  const prepareRegionData = (): ChartDataItem[] => {
    if (!costPerGeography) return [];

    const { minYear, maxYear } = getYearRange(costPerGeography);
    const baseData = Object.keys(costPerGeography).map((year) => ({
      year: parseInt(year),
      ...costPerGeography[parseInt(year)],
    }));

    return fillMissingYears(baseData, minYear, maxYear);
  };

  useEffect(() => {
    switch (activeFilter) {
      case FilterTypes.GLOBAL:
        setChartData(prepareGlobalData());
        break;
      case FilterTypes.TYPE:
        setChartData(prepareTypologyData());
        break;
      case FilterTypes.FINANCING:
        setChartData(prepareFinancingData());
        break;
      case FilterTypes.REGION:
        setChartData(prepareRegionData());
        break;
    }
  }, [activeFilter, costPerType, costPerFinancing, costPerGeography, budgetResults]);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="font-inter rounded-xl border border-neutral-500 bg-neutral-700/90 px-8 pb-4 pt-4 text-left font-light">
        <p className="bold uppercase text-neutral-100">Year: {label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="mt-2 text-left" style={{ color: entry.color }}>
            {displayedNames[entry.name] || entry.name}: {formatLargeNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const renderBars = () => {
    if (activeFilter === FilterTypes.GLOBAL) {
      return <Bar dataKey="total" fill={barColors.total} name="Total Cost" />;
    }

    // For type and region, dynamically create bars based on available keys
    const allKeys = new Set<string>();
    chartData.forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        if (key !== 'year') {
          allKeys.add(key);
        }
      });
    });
    const keys = Array.from(allKeys);

    return keys.map((key) => (
      <Bar
        key={key}
        dataKey={key}
        name={displayedNames[key] || key}
        stackId="a"
        fill={barColors[key] || '#888888'} // Fallback color if not found
      />
    ));
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end gap-1">
        {(Object.keys(FilterTypes) as Array<keyof typeof FilterTypes>).map((filterKey) => (
          <button
            key={filterKey}
            onClick={() => setActiveFilter(FilterTypes[filterKey])}
            className={`rounded-md px-4 py-2 text-sm font-light uppercase ${
              activeFilter === FilterTypes[filterKey]
                ? 'bg-neutral-500 text-neutral-100'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            {filterKey === 'GLOBAL'
              ? 'Global'
              : `By ${filterKey.charAt(0) + filterKey.slice(1).toLowerCase()}`}
          </button>
        ))}
      </div>

      <div className="min-h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight="400px">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barGap={0}
          >
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
            <Legend style={{ fontWeight: 300 }} />
            {renderBars()}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FilteredCostChart;
