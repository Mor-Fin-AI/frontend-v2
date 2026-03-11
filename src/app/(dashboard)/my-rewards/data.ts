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
        title: 'Total Earned',
        value: 4280,
        prefix: '$',
        subtitle: '+$650 this month',
        icon: DollarIcon,
        iconBg: 'bg-[#4ADE801A]',
        iconColor: 'text-[#22C38E]',
        valueColor: 'text-[#22C38E]',
        subtitleColor: 'text-primary',
        variant: 'success',
    },
    {
        title: 'Pending Rewards',
        value: 320,
        prefix: '$',
        subtitle: '3 pending',
        icon: Clock,
        iconBg: 'bg-[#F69E231A]',
        iconColor: 'text-[#F69E23]',
        valueColor: 'text-[#F69E23]',
        subtitleColor: 'text-primary',
        variant: 'warning',
    },
    {
        title: 'Milestones Hit',
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
        title: 'Reward Multiplier',
        value: '1.5x',
        subtitle: 'Gold tier',
        icon: TrendingUp,
        iconBg: 'bg-[#30ABE81A]',
        iconColor: 'text-[#30ABE8]',
        valueColor: 'text-[#30ABE8]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
];

export const weeklyRewardData = [
    { name: 'Mon', training: 100, milestone: 0, referral: 50 },
    { name: 'Tue', training: 200, milestone: 300, referral: 50 },
    { name: 'Wed', training: 80, milestone: 0, referral: 40 },
    { name: 'Thu', training: 100, milestone: 40, referral: 60 },
    { name: 'Fri', training: 110, milestone: 440, referral: 60 },
    { name: 'Sat', training: 60, milestone: 0, referral: 30 },
    { name: 'Sun', training: 130, milestone: 0, referral: 30 },
];

export const milestoneChartData = [
    { name: 'Traning', value: 42, color: '#22C38E' },
    { name: 'Milestone', value: 18, color: '#8C47D1' },
    { name: 'Referral', value: 12, color: '#30ABE8' },
];

export interface PayoutHistory {
    id: string;
    date: string;
    amount: number;
    method: string;
    status: 'Completed' | 'Pending' | 'Failed';
}

export const payoutHistoryData: PayoutHistory[] = [
    { id: 'PAY-001', date: 'Mar 1, 2026', amount: 1250, method: 'USDC', status: 'Completed' },
    { id: 'PAY-002', date: 'Feb 1, 2026', amount: 950, method: 'USDC', status: 'Completed' },
    { id: 'PAY-003', date: 'Jan 15, 2026', amount: 1150, method: 'ETH', status: 'Completed' },
    { id: 'PAY-004', date: 'Jan 1, 2026', amount: 750, method: 'USDC', status: 'Completed' },
];
