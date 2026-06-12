"use client";

import { milestonesData } from "../data";

export default function MilestonesList() {
    return (
        <div className="bg-[#1E1B2E66]  rounded-2xl p-6 flex flex-col w-full h-full ">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white font-inter leading-7">Learning Milestones</h3>
                <button className="text-xs text-[#22C38E] font-inter font-medium leading-4 hover:underline">View All</button>
            </div>
            <div className="space-y-8">
                {milestonesData.slice(0, 5).map((milestone) => (
                    <div key={milestone.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-white font-medium leading-5">{milestone.label}</span>
                            <span className="font-semibold" style={{ color: milestone.color }}>
                                {milestone.status}
                            </span>
                        </div>
                        <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                    width: `${(milestone.value / milestone.goal) * 100}%`,
                                    backgroundColor: milestone.color,
                                    boxShadow: `0 0 10px ${milestone.color}40`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
