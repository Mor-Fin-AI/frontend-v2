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
        title: 'Roads Built',
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
        title: 'Drainage Systems',
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
        title: 'Digital Hubs',
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
    { month: 'Oct', roads: 3, drainage: 2, hubs: 1 },
    { month: 'Nov', roads: 5, drainage: 1, hubs: 2 },
    { month: 'Dec', roads: 3, drainage: 4, hubs: 2 },
    { month: 'Jan', roads: 4, drainage: 4, hubs: 3 },
    { month: 'Feb', roads: 7, drainage: 2, hubs: 2 },
    { month: 'Mar', roads: 3, drainage: 5, hubs: 1 },
];

// ─── Projects Table 

export type ProjectStatus = 'Active' | 'Completed' | 'Planning';
export type ProjectType = 'Road' | 'Drainage' | 'Hub';

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
    { id: '1', name: 'Lagos-Ibadan Expressway Repair', location: 'Ogun State',   type: 'Road',     progress: 68,  status: 'Active',    budget: 45000 },
    { id: '2', name: 'Lekki Drainage System',          location: 'Lagos Island',  type: 'Drainage', progress: 42,  status: 'Active',    budget: 28000 },
    { id: '3', name: 'Community Solar Hub',            location: 'Surulere',      type: 'Hub',      progress: 100, status: 'Completed', budget: 15000 },
    { id: '4', name: 'Ikeja Digital Hub',              location: 'Ikeja',         type: 'Hub',      progress: 10,  status: 'Planning',  budget: 32000 },
];
