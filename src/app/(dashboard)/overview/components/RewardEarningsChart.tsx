"use client";

import { motion } from "framer-motion";
import AreaChart from "@/components/ui/charts/AreaChart";
import { rewardEarningsData } from "../data";

export default function RewardEarningsChart() {
    return (
        <div className="bg-[#1E1B2E66]  rounded-2xl p-3 md:p-6">
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-inter text-lg font-bold text-white leading-7">Reward Earnings</h3>
                <span className="font-inter font-medium  text-xs leading-4 text-[#6B7280]">Last 7 days</span>
            </div>
            <AreaChart
                data={rewardEarningsData}
                xKey="day"
                yKey="amount"
                height={363}
                color="#22D3EE"
                gradientFrom="#22D3EE"
            />
        </div>
    );
}
