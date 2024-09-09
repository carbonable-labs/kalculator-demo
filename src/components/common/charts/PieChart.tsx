import { Cell, Pie, PieChart } from 'recharts';

type DataPoint = Record<string, number>;

interface PieChartProps<T extends DataPoint> {
  data: T[];
  unit: string;
}

export default function PieChartComponent<T extends DataPoint>({ data, unit }: PieChartProps<T>) {
  const barColors: Record<string, string> = {
    nbs: '#29A46F',
    biochar: '#f97316',
    dac: '#3b82f6',
  };

  const displayedNames: Record<string, string> = {
    nbs: 'NbS',
    biochar: 'Biochar',
    dac: 'DAC',
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={'middle'}
        dominantBaseline="central"
        className="text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Transform the data to include a 'name' property for each key
  const transformedData = Object.keys(data[0]).map((key) => ({
    name: displayedNames[key] || key,
    value: data[0][key],
    color: barColors[key],
  }));

  return (
    <div className="flex h-full w-full items-start justify-start md:mt-4">
      <PieChart width={220} height={300}>
        <Pie
          data={transformedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={110}
          innerRadius={60}
          dataKey="value"
        >
          {transformedData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      <div className="ml-4">
        {transformedData.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="mr-3 h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <div className="text-sm font-light capitalize text-neutral-300">{entry.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
