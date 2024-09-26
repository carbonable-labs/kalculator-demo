'use client';
import Title from '@/components/form/Title';
import { useStrategy } from '@/context/StrategyContext';
import { YearlyStrategy } from '@/types/types';
import { formatLargeNumber } from '@/utils/output';
import { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function CostChart() {
  const [graphData, setGraphData] = useState([{}]);
  const { strategyResults } = useStrategy();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="font-inter rounded-xl border border-neutral-500 bg-neutral-700/90 px-8 pb-4 pt-4">
          <p className="bold text-center uppercase text-neutral-100">{label}</p>
          <p className="mt-2 text-left text-greenish-500">
            Low: {formatLargeNumber(payload[0].value)}
          </p>
          <p className="mt-2 text-left text-blue-500">
            Medium: {formatLargeNumber(payload[1].value)}
          </p>
          <p className="mt-2 text-left text-orange-500">
            High: {formatLargeNumber(payload[2].value)}
          </p>
        </div>
      );
    }

    return null;
  };

  useEffect(() => {
    if (!strategyResults) {
      return;
    }

    const data = strategyResults?.strategies.map((strategy: YearlyStrategy) => {
      return {
        year: strategy.year,
        low: strategy.cost_low,
        medium: strategy.cost_medium,
        high: strategy.cost_high,
      };
    });
    setGraphData(data);
  }, [strategyResults]);

  return (
    <div className="min-h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <LineChart
          width={500}
          height={300}
          data={graphData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis dataKey="year" />
          <YAxis />
          <Line
            type="monotone"
            dataKey="low"
            stroke="#22c55e"
            strokeWidth={3}
            dot={false}
            activeDot={true}
          />
          <Line
            type="monotone"
            dataKey="medium"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            activeDot={true}
          />
          <Line
            type="monotone"
            dataKey="high"
            stroke="#f97316"
            strokeWidth={3}
            dot={false}
            activeDot={true}
          />
          <Tooltip content={<CustomTooltip />} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4">
        <Title title="Investment timeline" />
      </div>
    </div>
  );
}
