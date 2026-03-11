'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { milestoneChartData } from '../data';

export default function MilestonesSection() {
    return (
        <div className="bg-[#1E1B2E66] rounded-2xl p-3 md:p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-white text-lg font-bold font-inter leading-7">Milestones</h3>
                <button className="text-[#22C38E] text-xs leading-4 font-medium hover:underline">
                    View All
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center gap-8 ">
                <div className="w-full aspect-square max-h-[210px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={milestoneChartData}
                                innerRadius={75}
                                outerRadius={105}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {milestoneChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full flex flex-col gap-4">
                    {milestoneChartData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-primary text-xs font-inter font-medium leading-5 md:text-sm">{item.name}</span>
                            </div>
                            <span className="text-white md:text-sm text-[10.2px]  font-medium leading-4">
                                {item.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
