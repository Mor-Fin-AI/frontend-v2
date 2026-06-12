import { TrendingUp, Clock, Flag, LayoutGrid, LucideIcon } from 'lucide-react';
import { DollarIcon } from '../../../../public/Svg/rewards/DollarIcon';
import { MilestoneIcon } from '../../../../public/Svg/rewards/MilestoneIcon';

export interface RewardStat {
    title: string;
    value: number | string;
    subtitle: string;
    icon: LucideIcon | any;
    trend?: number;
    prefix?: string;
    suffix?: string;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    subtitleColor?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const rewardStats: RewardStat[] = [
    {
        title: 'Learning Progress',
        value: 84,
        suffix: '%',
        subtitle: '+12% this month',
        icon: DollarIcon,
        iconBg: 'bg-[#4ADE801A]',
        iconColor: 'text-[#22C38E]',
        valueColor: 'text-[#22C38E]',
        subtitleColor: 'text-primary',
        variant: 'success',
    },
    {
        title: 'Pending Activities',
        value: 3,
        subtitle: '3 in progress',
        icon: Clock,
        iconBg: 'bg-[#F69E231A]',
        iconColor: 'text-[#F69E23]',
        valueColor: 'text-[#F69E23]',
        subtitleColor: 'text-primary',
        variant: 'warning',
    },
    {
        title: 'Learning Milestones',
        value: '8/12',
        subtitle: '67% complete',
        icon: MilestoneIcon,
        iconBg: 'bg-[#8547D11A]',
        iconColor: 'text-[#8C47D1]',
        valueColor: 'text-[#8C47D1]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
    {
        title: 'Participation Level',
        value: 'Gold',
        subtitle: 'Active contributor',
        icon: TrendingUp,
        iconBg: 'bg-[#30ABE81A]',
        iconColor: 'text-[#30ABE8]',
        valueColor: 'text-[#30ABE8]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
];

export const weeklyRewardData = [
    { name: 'Mon', learningModules: 3, achievements: 0, communityParticipation: 1 },
    { name: 'Tue', learningModules: 4, achievements: 2, communityParticipation: 1 },
    { name: 'Wed', learningModules: 2, achievements: 0, communityParticipation: 1 },
    { name: 'Thu', learningModules: 3, achievements: 1, communityParticipation: 2 },
    { name: 'Fri', learningModules: 3, achievements: 3, communityParticipation: 1 },
    { name: 'Sat', learningModules: 1, achievements: 0, communityParticipation: 1 },
    { name: 'Sun', learningModules: 2, achievements: 0, communityParticipation: 1 },
];

export const milestoneChartData = [
    { name: 'Learning Modules', value: 42, color: '#22C38E' },
    { name: 'Achievements', value: 18, color: '#8C47D1' },
    { name: 'Community Participation', value: 12, color: '#30ABE8' },
];

export interface ParticipationActivity {
    id: string;
    date: string;
    activity: string;
    category: string;
    status: 'Completed' | 'In Progress' | 'Pending';
}

export const participationActivityData: ParticipationActivity[] = [
    { id: 'ACT-001', date: 'Mar 1, 2026',  activity: 'Infrastructure Fundamentals Completed', category: 'Learning Module', status: 'Completed' },
    { id: 'ACT-002', date: 'Feb 1, 2026',  activity: 'Governance Participation',               category: 'Governance',      status: 'Completed' },
    { id: 'ACT-003', date: 'Jan 15, 2026', activity: 'Safety Certification',                   category: 'Training',        status: 'Completed' },
    { id: 'ACT-004', date: 'Jan 1, 2026',  activity: 'Community Engagement Activity',           category: 'Participation',   status: 'Completed' },
];

// Keep legacy export alias for backward compat during transition
export type PayoutHistory = ParticipationActivity;
export const payoutHistoryData = participationActivityData;

