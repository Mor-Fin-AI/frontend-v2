import type React from 'react';
import { Checkmark24Regular } from '@fluentui/react-icons';
import { RoadsIcon } from '../../../../public/Svg/infrastructure/RoadsIcon';
import { DropletsIcon } from '../../../../public/Svg/infrastructure/DropletsIcon';
import { DigitalIcon } from '../../../../public/Svg/infrastructure/DigitalIcon';

// ─── Stat Cards ──────────────────────────────────────────────────────────────

export interface ImpactStat {
    title: string;
    value: number | string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }> | any;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    subtitleColor?: string;
    prefix?: string;
    suffix?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const impactStats: ImpactStat[] = [
    {
        title: 'Learning Modules Completed',
        value: 23,
        subtitle: '8 in progress',
        icon: RoadsIcon,
        iconBg: 'bg-[#4ADE801A]',
        iconColor: 'text-[#22C38E]',
        valueColor: 'text-[#22C38E]',
        subtitleColor: 'text-primary',
        variant: 'success',
    },
    {
        title: 'Community Activities Completed',
        value: 17,
        subtitle: '5 active',
        icon: DropletsIcon,
        iconBg: 'bg-[#30ABE81A]',
        iconColor: 'text-[#30ABE8]',
        valueColor: 'text-[#30ABE8]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
    {
        title: 'Training Sessions Conducted',
        value: 10,
        subtitle: '2 planned',
        icon: DigitalIcon,
        iconBg: 'bg-[#F69E231A]',
        iconColor: 'text-[#F69E23]',
        valueColor: 'text-[#F69E23]',
        subtitleColor: 'text-primary',
        variant: 'warning',
    },
    {
        title: 'Total Platform Participation',
        value: '1,250',
        subtitle: 'Active participants',
        icon: Checkmark24Regular,
        iconBg: 'bg-[#8547D11A]',
        iconColor: 'text-[#8C47D1]',
        valueColor: 'text-[#8C47D1]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
];

// ─── Activity Chart 

export const activityChartData = [
    { month: 'Oct', learning: 3, community: 2, training: 1 },
    { month: 'Nov', learning: 5, community: 1, training: 2 },
    { month: 'Dec', learning: 3, community: 4, training: 2 },
    { month: 'Jan', learning: 4, community: 4, training: 3 },
    { month: 'Feb', learning: 7, community: 2, training: 2 },
    { month: 'Mar', learning: 3, community: 5, training: 1 },
];
 
export type ProjectStatus = 'Active' | 'Completed' | 'Planning';
export type ProjectType = 'Program' | 'Series' | 'Initiative' | 'Training' | 'Workshop';

export interface Project {
    id: string;
    name: string;
    location: string;
    type: ProjectType;
    progress: number;
    status: ProjectStatus;
}

export const projects: Project[] = [
    { id: '1', name: 'Infrastructure Fundamentals Program', location: 'Education',         type: 'Program',    progress: 68,  status: 'Active' },
    { id: '2', name: 'Governance Participation Series',     location: 'Governance',        type: 'Series',     progress: 42,  status: 'Active' },
    { id: '3', name: 'Community Engagement Initiative',     location: 'Community',         type: 'Initiative', progress: 100, status: 'Completed' },
    { id: '4', name: 'Safety Certification Training',       location: 'Safety',            type: 'Training',   progress: 10,  status: 'Planning' },
    { id: '5', name: 'Digital Systems Workshop',             location: 'Digital Systems',   type: 'Workshop',   progress: 25,  status: 'Active' },
];
