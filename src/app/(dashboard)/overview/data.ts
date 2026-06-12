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
        title: "Learning Progress",
        value: 84,
        valueSuffix: "%",
        subtitle: "+12.4% this month",
        icon: ShieldIcon,
        iconBg: "bg-[#0F292D]",
        iconColor: "text-[#00D4A0]",
        valueColor: "text-[#22C38E]",
    },
    {
        id: "dao-activities",
        title: "Governance Participation",
        value: 24,
        subtitle: "8 this week",
        icon: GlobeIcon,
        iconBg: "bg-[#231238]",
        iconColor: "text-[#8547D1]",
        valueColor: "text-[#8C47D1]",
    },
    {
        id: "impact-score",
        title: "Community Impact Score",
        value: 847,
        subtitle: "+12.4% this month",
        icon: TrendingUp,
        iconBg: "bg-[#312515]",
        iconColor: "text-[#F69E23]",
        valueColor: "text-[#F69E23]",
    },
    {
        id: "active-streak",
        title: "Learning Streak",
        value: 12,
        valueSuffix: " days",
        subtitle: "Best: 30 Days",
        icon: CalendarIcon,
        iconBg: "bg-[#1A323E]",
        iconColor: "text-[#30ABE8]",
        valueColor: "text-[#30ABE8]",
    },
];

export interface LearningActivityData {
    day: string;
    count: number;
}

export const rewardEarningsData: LearningActivityData[] = [
    { day: "Mon", count: 3 },
    { day: "Tue", count: 5 },
    { day: "Wed", count: 4 },
    { day: "Thurs", count: 7 },
    { day: "Fri", count: 9 },
    { day: "Sat", count: 6 },
    { day: "Sun", count: 11 },
];

export interface MilestoneData {
    id: string;
    label: string;
    value: number;
    goal: number;
    status: string;
    color: string;
}

export const milestonesData: MilestoneData[] = [
    { id: "1", label: "Infrastructure Fundamentals",   value: 85,  goal: 100, status: "In Progress", color: "#8C47D1" },
    { id: "2", label: "Safety Certification Module 1", value: 100, goal: 100, status: "Completed",   color: "#22C38E" },
    { id: "3", label: "Quality Assessment Training",   value: 24,  goal: 30,  status: "In Progress", color: "#8C47D1" },
    { id: "4", label: "Site Surveying Module",         value: 100, goal: 100, status: "Completed",   color: "#22C38E" },
    { id: "5", label: "Infrastructure Review Module",  value: 24,  goal: 30,  status: "In Progress", color: "#30ABE8" },
];

export interface ActivityData {
    id: string;
    type: "Learning" | "Vote" | "Training" | "Assessment";
    label: string;
    status?: string;
    time: string;
}

export const recentActivityData: ActivityData[] = [
    { id: "1", type: "Training",   label: "Training Completion",                  status: "Completed", time: "2h ago" },
    { id: "2", type: "Vote",       label: "Governance Proposal #12",               status: "Voted",     time: "2h ago" },
    { id: "3", type: "Learning",   label: "Market Systems Fundamentals Module 3",  status: "Completed", time: "1d ago" },
    { id: "4", type: "Assessment", label: "Quality Assessment Review",             status: "Submitted", time: "2d ago" },
];

