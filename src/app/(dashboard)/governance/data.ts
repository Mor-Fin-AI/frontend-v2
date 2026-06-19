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
    fullDescription: string;
    votesFor: string;
    votesAgainst: string;
    forPercent: number;
    author: string;
    timeLeft?: string;
    createdAt: string;
    votingEndsAt?: string;
    quorumRequired: string;
    timeline: Array<{ date: string; label: string }>;
    isOnChain?: boolean;
    stateLabel?: string;
    userHasVoted?: boolean;
    proposer?: string;
    targets?: string[];
}

export const proposals: Proposal[] = [
    {
        id: 'PROP-045',
        status: 'Active',
        category: 'Infrastructure',
        title: 'Expand Infrastructure Learning Program',
        description: 'Proposal to expand the hands-on infrastructure training program to include three new hub locations.',
        fullDescription:
            'This proposal requests treasury allocation to expand the infrastructure learning program into three additional regional hubs. Funding covers instructor onboarding, equipment kits, and hub certification audits. Completion targets Q3 with quarterly reporting to the DAO education committee.',
        votesFor: '124',
        votesAgainst: '8',
        forPercent: 94,
        author: 'hayden.eth',
        timeLeft: '5 days left',
        createdAt: 'Feb 12, 2026',
        votingEndsAt: 'Mar 1, 2026',
        quorumRequired: '100 votes',
        timeline: [
            { date: 'Feb 12, 2026', label: 'Proposal submitted' },
            { date: 'Feb 14, 2026', label: 'Community review opened' },
            { date: 'Feb 18, 2026', label: 'Voting period started' },
            { date: 'Mar 1, 2026', label: 'Voting closes' },
        ],
    },
    {
        id: 'PROP-044',
        status: 'Active',
        category: 'Governance',
        title: 'Update Community Participation Guidelines',
        description: 'Outline quality standards, verification processes, and participation policies for community members.',
        fullDescription:
            'A governance update to formalize participation standards across learning modules, validator ceremonies, and proposal review. Includes identity verification tiers, dispute resolution steps, and minimum engagement thresholds for voting eligibility.',
        votesFor: '95',
        votesAgainst: '35',
        forPercent: 73,
        author: 'avantiwork.eth',
        timeLeft: '5 days left',
        createdAt: 'Feb 10, 2026',
        votingEndsAt: 'Mar 1, 2026',
        quorumRequired: '100 votes',
        timeline: [
            { date: 'Feb 10, 2026', label: 'Proposal submitted' },
            { date: 'Feb 13, 2026', label: 'Community review opened' },
            { date: 'Feb 17, 2026', label: 'Voting period started' },
            { date: 'Mar 1, 2026', label: 'Voting closes' },
        ],
    },
    {
        id: 'PROP-043',
        status: 'Executed',
        category: 'Platform Resources',
        title: 'Platform Resource Allocation Review',
        description: 'Conduct a review of physical resources and digital training materials distributed across local hubs.',
        fullDescription:
            'Approved audit of platform resources across all active hubs. The review benchmarks inventory utilization, identifies surplus equipment, and recommends redistribution to underserved regions. Final report published to the governance forum.',
        votesFor: '78',
        votesAgainst: '42',
        forPercent: 65,
        author: 'stablelab.eth',
        createdAt: 'Jan 20, 2026',
        votingEndsAt: 'Feb 5, 2026',
        quorumRequired: '100 votes',
        timeline: [
            { date: 'Jan 20, 2026', label: 'Proposal submitted' },
            { date: 'Jan 24, 2026', label: 'Voting period started' },
            { date: 'Feb 5, 2026', label: 'Proposal executed' },
        ],
    },
    {
        id: 'PROP-042',
        status: 'Defeated',
        category: 'Education',
        title: 'Learning Curriculum Enhancement Proposal',
        description: 'Overhaul the existing training modules with updated materials, assessment standards, and platform governance content.',
        fullDescription:
            'Proposed curriculum overhaul covering assessment rubrics, modular learning paths, and embedded governance literacy content. The proposal did not reach the required approval threshold and has been archived for revision.',
        votesFor: '60',
        votesAgainst: '40',
        forPercent: 60,
        author: 'v1ask.eth',
        createdAt: 'Jan 8, 2026',
        votingEndsAt: 'Jan 25, 2026',
        quorumRequired: '100 votes',
        timeline: [
            { date: 'Jan 8, 2026', label: 'Proposal submitted' },
            { date: 'Jan 12, 2026', label: 'Voting period started' },
            { date: 'Jan 25, 2026', label: 'Proposal defeated' },
        ],
    },
];

export function getProposalById(id: string) {
    return proposals.find((proposal) => proposal.id === id);
}
