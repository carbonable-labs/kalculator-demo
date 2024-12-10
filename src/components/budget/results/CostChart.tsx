'use client';
import Title from '@/components/form/Title';
import { useBudget } from '@/context/BudgetContext';
import { YearlyStrategy } from '@/types/types';
import { formatLargeNumber } from '@/utils/output';
import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function CostChart() {
  const [graphData, setGraphData] = useState([{}]);
  const { budgetResults } = useBudget();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="font-inter rounded-xl border border-neutral-500 bg-neutral-700/90 px-8 pb-4 pt-4">
          <p className="bold text-center uppercase text-neutral-100">{label}</p>
          <p className="mt-2 text-left text-greenish-500">
            Low: {payload[0].value ? formatLargeNumber(payload[0].value) : '-'}
          </p>
          <p className="mt-2 text-left text-blue-500">
            Medium: {payload[1].value ? formatLargeNumber(payload[1].value) : '-'}
          </p>
          <p className="mt-2 text-left text-orange-500">
            High: {payload[2].value ? formatLargeNumber(payload[2].value) : '-'}
          </p>
        </div>
      );
    }

    return null;
  };

  useEffect(() => {
    const years = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => 2025 + i);
    const data = years.map((year) => {
      const strategy = budgetResults?.strategies.find((s: YearlyStrategy) => s.year === year);
      return {
        year,
        low: strategy?.cost_low || null,
        medium: strategy?.cost_medium || null,
        high: strategy?.cost_high || null,
      };
    });
    setGraphData(data);
  }, [budgetResults]);

  return (
    <div className="min-h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <BarChart
          width={500}
          height={300}
          data={graphData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barCategoryGap="15%"
          barGap={2}
        >
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
          <Bar dataKey="low" fill="#22c55e" />
          <Bar dataKey="medium" fill="#3b82f6" />
          <Bar dataKey="high" fill="#f97316" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4">
        <Title title="Investment timeline" />
      </div>
    </div>
  );
}
