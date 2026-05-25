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
import { activityChartData } from '../data';

export default function ActivityChart() {
    return (
        <div className="bg-[#1E1B2E1A] border-[1.4px] border-[#FFFFFF0D] rounded-2xl p-3 md:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-base md:text-lg font-medium font-inter leading-7">Active Trainings</h3>
                <button className="flex items-center gap-1 px-3 py-2 rounded-md bg-[#16212C] text-[#4ADE80] text-sm font-medium font-inter leading-6 hover:bg-[#FFFFFF1A] transition-colors">
                    Last 6 Months
                </button>
            </div>

            <div className="w-full h-[300px] focus:outline-none [&_*]:focus:outline-none">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart
                        data={activityChartData}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                        barGap={6}
                        barCategoryGap="10%"
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFFFFF1A" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'Inter' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'Inter' }}
                        />
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
                            height={36}
                            content={(props: any) => {
                                const { payload } = props;
                                return (
                                    <div className="flex flex-row justify-center items-center p-0 gap-1 md:gap-3 lg:gap-5 w-full">
                                        {payload?.map((entry: any, index: number) => (
                                            <div key={`item-${index}`} className="flex flex-row items-center p-0 gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full flex-none"
                                                    style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="font-inter font-medium text-[10px] md:text-sm leading-4 text-white flex items-center">
                                                    {entry.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="construction" name="Construction" fill="#22C38E" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="modernisation" name="Modernisation" fill="#30ABE8" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="workshops" name="Workshops" fill="#F69E23" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
