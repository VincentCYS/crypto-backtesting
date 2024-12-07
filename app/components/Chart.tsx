'use client';

import {
    Brush,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface ChartProps {
  chartData: any[];
  brushTimeframe: [number, number];
  handleBrushChange: (brushRange: any) => void;
  comparisonCoin: string;
}

export function Chart({ chartData, brushTimeframe, handleBrushChange, comparisonCoin }: ChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
      <div className="h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#ffffff"
            />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <YAxis 
              label={{ 
                value: 'Performance %', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: 'currentColor' }
              }}
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)}%`,
               name === 'portfolio' ? 'Portfolio' : name
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              key="portfolio"
              type="monotone"
              dataKey="portfolio"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name="Portfolio 1"
            />
            {chartData[0]?.comparison !== undefined && (
              <Line
                key="comparison"
                type="monotone"
                dataKey="comparison"
                stroke="#f7931a"
                strokeWidth={2}
                dot={false}
                name="Portfolio 2"
              />
            )}
            <Brush
              dataKey="date"
              height={30}
              stroke="#8884d8"
              fill="#1f2937"
              onChange={handleBrushChange}
              startIndex={brushTimeframe[0]}
              endIndex={brushTimeframe[1]}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 