import React from 'react';
import { Bar, BarChart, XAxis, Cell, YAxis } from 'recharts';

type DataPoint = Record<string, number>;

interface BarChartProps<T extends DataPoint> {
  data: T[];
  unit: string;
  maxValue?: number;
}

export default function BarChartComponent<T extends DataPoint>({
  data,
  unit,
  maxValue = 100,
}: BarChartProps<T>) {
  const CustomizedLabel: React.FC<any> = ({ x, y, width, value }) => (
    <text x={x + width / 2} y={y - 10} fill="#878A94" textAnchor="middle" className="text-xs">
      {`${value}${unit}`}
    </text>
  );

  const CustomizedXAxisTick: React.FC<any> = ({ x, y, payload }) => (
    <text x={x} y={y + 10} fill="#878A94" textAnchor="middle" className="text-xs capitalize">
      {payload.value}
    </text>
  );

  const barColors = {
    spot: '#29A46F',
    forward: '#145136',
  };

  // Transform the data to include a 'name' property for each key
  const transformedData = Object.keys(data[0]).map((key) => ({
    name: key,
    value: data[0][key],
  }));

  // Calculate the width based on the number of bars
  const chartWidth = Math.max(200, 100 * transformedData.length);

  return (
    <div className="h-full w-full md:mt-4">
      <BarChart
        width={chartWidth}
        height={400}
        data={transformedData}
        margin={{
          top: 30,
          right: 0,
          left: 0,
          bottom: 20,
        }}
        barGap={12}
      >
        <YAxis hide domain={[0, maxValue] as [number, number]} />
        <XAxis dataKey="name" tick={<CustomizedXAxisTick />} axisLine={false} tickLine={false} />
        <Bar
          dataKey="value"
          barSize={36}
          radius={[10, 10, 0, 0]}
          label={<CustomizedLabel />}
          maxBarSize={300}
        >
          {transformedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={barColors[entry.name as keyof typeof barColors] || '#8884d8'}
            />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
}
