'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { weeklyRewardData } from '../data';

export default function WeeklyRewardChart() {
  return (
    <div className="bg-[#1E1B2E66] rounded-2xl p-3 md:p-6 h-100 xl:h-full flex flex-col">
      <h3 className="text-white text-lg font-semibold mb-6">Weekly Reward Breakdown</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyRewardData} margin={{ top: 50, right: 0, left: -12, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFFFFF1A" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1C24',
                borderColor: '#FFFFFF1A',
                borderRadius: '8px',
                color: '#fff',
              }}
              cursor={{ fill: 'transparent' }}
            />
            <Legend
              verticalAlign="bottom"
              height={20}
              iconType="circle"
              formatter={(value) => <span className="text-white text-[10px] md:text-sm capitalize">{value}</span>}
            />
            <Bar dataKey="training" stackId="a" fill="#22C38E" radius={[0, 0, 0, 0]} barSize={60} />
            <Bar dataKey="milestone" stackId="a" fill="#8C47D1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="referral" stackId="a" fill="#30ABE8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
