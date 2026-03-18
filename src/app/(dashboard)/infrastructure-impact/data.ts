import { Network, Droplets, Cpu, DollarSign, LucideIcon, Check } from 'lucide-react';
import { RoadsIcon } from '../../../../public/Svg/infrastructure/RoadsIcon';
import { DropletsIcon } from '../../../../public/Svg/infrastructure/DropletsIcon';
import { DigitalIcon } from '../../../../public/Svg/infrastructure/DigitalIcon';

// ─── Stat Cards ──────────────────────────────────────────────────────────────

export interface ImpactStat {
    title: string;
    value: number | string;
    subtitle: string;
    icon: LucideIcon | any;
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
        title: 'Houses Built',
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
        title: 'Houses Modernised',
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
        title: 'Workshops Built',
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
        title: 'Total Investment',
        value: '$2.1M',
        subtitle: '$340K this quarter',
        icon: Check,
        iconBg: 'bg-[#8547D11A]',
        iconColor: 'text-[#8C47D1]',
        valueColor: 'text-[#8C47D1]',
        subtitleColor: 'text-primary',
        variant: 'default',
    },
];

// ─── Activity Chart 

export const activityChartData = [
    { month: 'Oct', construction: 3, modernisation: 2, workshops: 1 },
    { month: 'Nov', construction: 5, modernisation: 1, workshops: 2 },
    { month: 'Dec', construction: 3, modernisation: 4, workshops: 2 },
    { month: 'Jan', construction: 4, modernisation: 4, workshops: 3 },
    { month: 'Feb', construction: 7, modernisation: 2, workshops: 2 },
    { month: 'Mar', construction: 3, modernisation: 5, workshops: 1 },
];
 
export type ProjectStatus = 'Active' | 'Completed' | 'Planning';
export type ProjectType = 'House Construction' | 'House Modernisation' | 'Road Kerbs & Pavements' | 'Marketplace Modernisation' | 'Craftsman Workshops';

export interface Project {
    id: string;
    name: string;
    location: string;
    type: ProjectType;
    progress: number;
    status: ProjectStatus;
    budget: number;
}

export const projects: Project[] = [
    { id: '1', name: 'Bamburi Housing Project',        location: 'Bamburi',         type: 'House Construction',     progress: 68,  status: 'Active',    budget: 45000 },
    { id: '2', name: 'Bombolulu Market Upgrade',       location: 'Bombolulu',      type: 'Marketplace Modernisation', progress: 42,  status: 'Active',    budget: 28000 },
    { id: '3', name: 'Likoni Pavement Installation',   location: 'Likoni',         type: 'Road Kerbs & Pavements', progress: 100, status: 'Completed', budget: 15000 },
    { id: '4', name: 'Mtwapa Artisan Workshop',        location: 'Mtwapa',         type: 'Craftsman Workshops',     progress: 10,  status: 'Planning',  budget: 32000 },
    { id: '5', name: 'Shanzu-Nyali House Refurbish',   location: 'Shanzu-Nyali',    type: 'House Modernisation',    progress: 25,  status: 'Active',    budget: 18000 },
];
