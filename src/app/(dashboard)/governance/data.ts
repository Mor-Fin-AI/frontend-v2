import { FileText, ScrollText, Vote, TrendingUp, LucideIcon, UsersRound } from 'lucide-react';
import { FileTextIcon } from '../../../../public/Svg/governance/FileTextIcon';
import { FileIcon } from '../../../../public/Svg/governance/FileIcon';

// ─── Stat Cards ──────────────────────────────────────────────────────────────

export interface GovernanceStat {
    title: string;
    value: number | string;
    subtitle: string;
    icon: LucideIcon | any;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    subtitleColor?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const governanceStats: GovernanceStat[] = [
    {
        title: 'Active Proposals',
        value: 2,
        subtitle: 'Voting open',
        icon: FileTextIcon,
        iconBg: 'bg-[#22C38E1A]',
        iconColor: 'text-[#22C38E]',
        valueColor: 'text-[#22C38E]',
        subtitleColor: 'text-primary',
        variant: 'success',
    },
    {
        title: 'Total Proposals',
        value: 45,
        subtitle: 'All time',
        icon: FileIcon,
        iconBg: 'bg-[#8547D11A]',
        iconColor: 'text-[#8C47D1]',
        valueColor: 'text-[#8C47D1]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
    {
        title: 'Your Votes Cast',
        value: 18,
        subtitle: '40% participation',
        icon: UsersRound,
        iconBg: 'bg-[#30ABE81A]',
        iconColor: 'text-[#30ABE8]',
        valueColor: 'text-[#30ABE8]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
    {
        title: 'Voting Power',
        value: '1,250',
        subtitle: 'Based on stake',
        icon: TrendingUp,
        iconBg: 'bg-[#F69E231A]',
        iconColor: 'text-[#F69E23]',
        valueColor: 'text-[#F69E23]',
        subtitleColor: 'text-primary',
        variant: 'warning',
    },
];

// ─── Proposals 

export type ProposalStatus = 'Active' | 'Executed' | 'Defeated';
export type ProposalCategory = 'Infrastructure' | 'Rewards' | 'Treasury' | 'Governance';

export interface Proposal {
    id: string;
    status: ProposalStatus;
    category: ProposalCategory;
    title: string;
    description: string;
    votesFor: string;
    votesAgainst: string;
    forPercent: number;
    author: string;
    timeLeft?: string;
}

export const proposals: Proposal[] = [
    {
        id: 'PROP-045',
        status: 'Active',
        category: 'Infrastructure',
        title: 'Expand Solar Hub Program to Abuja',
        description: 'Proposal to allocate $85K from treasury for 3 new solar hubs in Abuja metropolitan area.',
        votesFor: '42.28M',
        votesAgainst: '1.0M',
        forPercent: 98,
        author: 'hayden.eth',
        timeLeft: '5 days left',
    },
    {
        id: 'PROP-044',
        status: 'Active',
        category: 'Rewards',
        title: 'Increase Validator Reward Multiplier',
        description: 'Increase the base reward multiplier for infrastructure validators from 1.2x to 1.5x.',
        votesFor: '42.28M',
        votesAgainst: '1.0M',
        forPercent: 70,
        author: 'avantiwork.eth',
        timeLeft: '5 days left',
    },
    {
        id: 'PROP-043',
        status: 'Executed',
        category: 'Treasury',
        title: 'Increase Validator Reward Multiplier',
        description: 'Diversify 20% of treasury holdings into stable yield-bearing assets.',
        votesFor: '42.28M',
        votesAgainst: '1.0M',
        forPercent: 65,
        author: 'stablelab.eth',
    },
    {
        id: 'PROP-042',
        status: 'Defeated',
        category: 'Governance',
        title: 'Community Training Curriculum Update',
        description: 'Overhaul the existing training modules with new DeFi and governance content.',
        votesFor: '42.28M',
        votesAgainst: '1.0M',
        forPercent: 60,
        author: 'v1ask.eth',
    },
];
