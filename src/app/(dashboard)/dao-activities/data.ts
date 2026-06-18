import type React from 'react';
import { Book24Regular, CheckboxChecked24Regular, CalendarLtr24Regular, Trophy24Regular, Checkmark24Regular, PeopleTeam24Regular } from '@fluentui/react-icons';
import { BookOpenIcon } from '../../../../public/Svg/dao/BookOpenIcon';
import { CertificateIcon } from '../../../../public/Svg/dao/CertificateIcon';

// ─── Stat Cards ──────────────────────────────────────────────────────────────

export interface ActivityStat {
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

export const activityStats: ActivityStat[] = [
    {
        title: 'Trainings Completed',
        value: 5,
        subtitle: '2 in progress',
        icon: BookOpenIcon,
        iconBg: 'bg-[#4ADE801A]',
        iconColor: 'text-[#4ADE80]',
        valueColor: 'text-[#22C38E]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
    {
        title: 'Assessments Completed',
        value: 18,
        subtitle: '3 this week',
        icon: Checkmark24Regular,
        iconBg: 'bg-[#8547D11A]',
        iconColor: 'text-[#8547D1]',
        valueColor: 'text-[#8C47D1]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
    {
        title: 'Events Attended',
        value: 12,
        subtitle: 'Next: Mar 5',
        icon: PeopleTeam24Regular,
        iconBg: 'bg-[#30ABE81A]',
        iconColor: 'text-[#30ABE8]',
        valueColor: 'text-[#30ABE8]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
    {
        title: 'Certifications Earned',
        value: 3,
        subtitle: '1 pending',
        icon: CertificateIcon,
        iconBg: 'bg-[#F69E231A]',
        iconColor: 'text-[#F69E23]',
        valueColor: 'text-[#F69E23]',
        subtitleColor: 'text-primary',
        variant: 'warning',
    },
];

// ─── Active Trainings 

export type TrainingStatus = 'InProgress' | 'Completed' | 'Not Started';

export interface Training {
    id: string;
    title: string;
    status: TrainingStatus;
    modulesCompleted: number;
    totalModules: number;
}

export const activeTrainings: Training[] = [
    {
        id: '1',
        title: 'Market Systems Fundamentals',
        status: 'InProgress',
        modulesCompleted: 8,
        totalModules: 10,
    },
    {
        id: '2',
        title: 'Digital Infrastructure Basics',
        status: 'Completed',
        modulesCompleted: 5,
        totalModules: 5,
    },
    {
        id: '3',
        title: 'Governance Fundamentals',
        status: 'InProgress',
        modulesCompleted: 3,
        totalModules: 6,
    },
    {
        id: '4',
        title: 'Infrastructure Review Training',
        status: 'Not Started',
        modulesCompleted: 0,
        totalModules: 4,
    },
];

// ─── Recent Validations ───────────────────────────────────────────────────────

export type ValidationResult = 'Approved' | 'Flagged' | 'Pending';

export interface Validation {
    id: string;
    project: string;
    date: string;
    type: string;
    result: ValidationResult;
    status: 'Approved' | 'Flagged' | 'Completed';
}

export const recentValidations: Validation[] = [
    { id: '1', project: 'Bamburi Pavement',          date: 'Feb 28, 2026', type: 'Road Kerbs & Pavements', result: 'Approved', status: 'Completed' },
    { id: '2', project: 'Bombolulu Market',          date: 'Feb 25, 2026', type: 'Marketplace Modernisation', result: 'Approved', status: 'Completed' },
    { id: '3', project: 'Likoni House #4',           date: 'Feb 20, 2026', type: 'House Construction',      result: 'Flagged',  status: 'Flagged' },
    { id: '4', project: 'Mtwapa House #12',          date: 'Feb 18, 2026', type: 'House Modernisation',     result: 'Approved', status: 'Completed' },
    { id: '5', project: 'Shanzu Craftsman Workshop', date: 'Feb 15, 2026', type: 'Craftsman Workshops',     result: 'Approved', status: 'Completed' },
];

// ─── Participation History ────────────────────────────────────────────────────

export type EventCategory = 'Meeting' | 'Governance' | 'Ceremony' | 'Validation';
export type ParticipationStatus = 'Attended' | 'Voted' | 'Participated';

export interface ParticipationEvent {
    id: string;
    category: EventCategory;
    title: string;
    date: string;
    status: ParticipationStatus;
}

export const participationHistory: ParticipationEvent[] = [
    { id: '1', category: 'Meeting',    title: 'Community Town Hall Q1',      date: 'Mar 1, 2026',  status: 'Attended'    },
    { id: '2', category: 'Governance', title: 'Proposal Review #45',          date: 'Feb 27, 2026', status: 'Voted'       },
    { id: '3', category: 'Ceremony',   title: 'Training Graduation Cohort 3', date: 'Feb 22, 2026', status: 'Attended'    },
    { id: '4', category: 'Validation', title: 'Infrastructure Audit Sprint',  date: 'Feb 15, 2026', status: 'Participated'},
];
