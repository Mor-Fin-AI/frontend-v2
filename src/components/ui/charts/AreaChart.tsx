'use client';

import {
  Area,
  AreaChart as RechartsAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface AreaChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  height?: number | string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function AreaChart({
  data,
  xKey,
  yKey,
  height = 300,
  color = '#22D3EE',
  gradientFrom = '#22D3EE',
  gradientTo = 'rgba(34, 211, 238, 0)',
}: AreaChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.3} />
              <stop offset="95%" stopColor={gradientTo} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.08)"
            vertical={true}
            horizontal={true}
          />
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
            itemStyle={{ color: '#22D3EE' }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#areaGradient)"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
