import type React from 'react';
import { DocumentText24Regular, DocumentBulletList24Regular, Vote24Regular, ArrowTrending24Regular, PeopleTeam24Regular } from '@fluentui/react-icons';
import { FileTextIcon } from '../../../../public/Svg/governance/FileTextIcon';
import { FileIcon } from '../../../../public/Svg/governance/FileIcon';

// ─── Stat Cards 

export interface GovernanceStat {
    title: string;
    value: number | string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }> | any;
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
        icon: PeopleTeam24Regular,
        iconBg: 'bg-[#30ABE81A]',
        iconColor: 'text-[#30ABE8]',
        valueColor: 'text-[#30ABE8]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
    {
        title: 'Participation Score',
        value: '1,250',
        subtitle: 'Based on platform participation',
        icon: ArrowTrending24Regular,
        iconBg: 'bg-[#F69E231A]',
        iconColor: 'text-[#F69E23]',
        valueColor: 'text-[#F69E23]',
        subtitleColor: 'text-primary',
        variant: 'warning',
    },
];

// ─── Proposals 

export type ProposalStatus = 'Active' | 'Executed' | 'Defeated';
export type ProposalCategory = 'Infrastructure' | 'Education' | 'Platform Resources' | 'Governance';

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
        title: 'Expand Infrastructure Learning Program',
        description: 'Proposal to expand the hands-on infrastructure training program to include three new hub locations.',
        votesFor: '124',
        votesAgainst: '8',
        forPercent: 94,
        author: 'hayden.eth',
        timeLeft: '5 days left',
    },
    {
        id: 'PROP-044',
        status: 'Active',
        category: 'Governance',
        title: 'Update Community Participation Guidelines',
        description: 'Outline quality standards, verification processes, and participation policies for community members.',
        votesFor: '95',
        votesAgainst: '35',
        forPercent: 73,
        author: 'avantiwork.eth',
        timeLeft: '5 days left',
    },
    {
        id: 'PROP-043',
        status: 'Executed',
        category: 'Platform Resources',
        title: 'Platform Resource Allocation Review',
        description: 'Conduct a review of physical resources and digital training materials distributed across local hubs.',
        votesFor: '78',
        votesAgainst: '42',
        forPercent: 65,
        author: 'stablelab.eth',
    },
    {
        id: 'PROP-042',
        status: 'Defeated',
        category: 'Education',
        title: 'Learning Curriculum Enhancement Proposal',
        description: 'Overhaul the existing training modules with updated materials, assessment standards, and platform governance content.',
        votesFor: '60',
        votesAgainst: '40',
        forPercent: 60,
        author: 'v1ask.eth',
    },
];
