import { ShieldCheck, Globe, TrendingUp, Calendar } from "lucide-react";
import { ShieldIcon } from "../../../../public/Svg/oveview/ShieldIcon";
import { GlobeIcon } from "../../../../public/Svg/oveview/GlobeIcon";
import { CalendarIcon } from "../../../../public/Svg/oveview/CalenderIcon";

export interface StatCardData {
    id: string;
    title: string;
    value: number;
    valuePrefix?: string;
    valueSuffix?: string;
    subtitle: string;
    trend?: number;
    icon: any;
    iconBg: string;
    iconColor: string;
    valueColor: string;
}

export const statCardsData: StatCardData[] = [
    {
        id: "total-rewards",
        title: "Total Rewards Earned",
        value: 4280,
        valuePrefix: "$",
        subtitle: "+12.4% this month",
        icon: ShieldIcon,
        iconBg: "bg-[#0F292D]",
        iconColor: "text-[#00D4A0]",
        valueColor: "text-[#22C38E]",
    },
    {
        id: "dao-activities",
        title: "DAO Activities",
        value: 24,
        subtitle: "8 this week",
        icon: GlobeIcon,
        iconBg: "bg-[#231238]",
        iconColor: "text-[#8547D1]",
        valueColor: "text-[#8C47D1]",
    },
    {
        id: "impact-score",
        title: "Impact Score",
        value: 847,
        subtitle: "+12.4% this month",
        icon: TrendingUp,
        iconBg: "bg-[#312515]",
        iconColor: "text-[#F69E23]",
        valueColor: "text-[#F69E23]",
    },
    {
        id: "active-streak",
        title: "Active Streak",
        value: 12,
        valueSuffix: " days",
        subtitle: "Best: 30 Days",
        icon: CalendarIcon,
        iconBg: "bg-[#1A323E]",
        iconColor: "text-[#30ABE8]",
        valueColor: "text-[#30ABE8]",
    },
];

export interface RewardEarningData {
    day: string;
    amount: number;
}

export const rewardEarningsData: RewardEarningData[] = [
    { day: "Mon", amount: 85 },
    { day: "Tue", amount: 130 },
    { day: "Wed", amount: 110 },
    { day: "Thurs", amount: 180 },
    { day: "Fri", amount: 255 },
    { day: "Sat", amount: 170 },
    { day: "Sun", amount: 340 },
];

export interface MilestoneData {
    id: string;
    label: string;
    value: number;
    goal: number;
    reward: string;
    color: string;
}

export const milestonesData: MilestoneData[] = [
    { id: "1", label: "100 Trades Completed", value: 85, goal: 100, reward: "$500", color: "#8C47D1" },
    { id: "2", label: "$10K Total Volume", value: 100, goal: 100, reward: "$1000", color: "#22C38E" },
    { id: "3", label: "30-Day Streak", value: 24, goal: 30, reward: "$800", color: "#8C47D1" },
    { id: "4", label: "First Governance Vote", value: 100, goal: 100, reward: "$150", color: "#22C38E" },
    { id: "5", label: "30-Day Streak", value: 24, goal: 30, reward: "$800", color: "#8C47D1" },
];

export interface ActivityData {
    id: string;
    type: "Rewards" | "Vote" | "Training" | "Validation";
    label: string;
    value?: string;
    time: string;
}

export const recentActivityData: ActivityData[] = [
    { id: "1", type: "Rewards", label: "Training completion bonus", value: "+$250", time: "2h ago" },
    { id: "2", type: "Vote", label: "Infrastructure proposal #12", time: "2h ago" },
    { id: "3", type: "Training", label: "DeFi Fundamentals Module 3", value: "+$50", time: "1d ago" },
    { id: "4", type: "Validation", label: "Road quality assessment", value: "+$120", time: "2d ago" },
];
