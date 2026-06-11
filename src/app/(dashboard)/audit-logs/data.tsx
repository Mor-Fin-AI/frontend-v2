import { Clock, Gift, Activity, Shield, LucideIcon } from 'lucide-react';
import { ClockIcon } from '../../../../public/Svg/audit-log/ClockIcon';
import { EventsIcon } from '../../../../public/Svg/audit-log/EventsIcon';
import VotesEventIcon from '../../../../public/Svg/audit-log/VotesEventIcon';

export interface AuditStat {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon | any;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  subtitleColor?: string;
  prefix?: string;
  trend?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const auditStats: AuditStat[] = [
  {
    title: 'Total Events',
    value: 847,
    subtitle: '+18.3% this month',
    icon: ClockIcon,
    iconBg: 'bg-[#22C38E1A]',
    iconColor: 'text-[#22C38E]',
    valueColor: 'text-[#22C38E]',
    subtitleColor: 'text-primary',
    variant: 'success',
  },
  {
    title: 'Learning Activities',
    value: 342,
    subtitle: 'Last 30 days',
    icon: Gift,
    iconBg: 'bg-[#8547D11A]',
    iconColor: 'text-[#8C47D1]',
    valueColor: 'text-[#8C47D1]',
    subtitleColor: 'text-primary',
    variant: 'default',
  },
  {
    title: 'Participation Activities',
    value: 89,
    subtitle: 'Assessments & modules',
    icon: EventsIcon,
    iconBg: 'bg-[#30ABE81A]',
    iconColor: 'text-[#30ABE8]',
    valueColor: 'text-[#30ABE8]',
    subtitleColor: 'text-primary',
    variant: 'default',
  },
  {
    title: 'Governance Activities',
    value: 28,
    subtitle: 'Votes & proposals',
    icon: VotesEventIcon,
    iconBg: 'bg-[#F69E231A]',
    iconColor: 'text-[#F69E23]',
    valueColor: 'text-[#F69E23]',
    subtitleColor: 'text-primary',
    variant: 'warning',
  },
];

// ─── Audit Log Entries

export type EventCategory = 'Learning' | 'Governance' | 'Participation';
export type EventStatus = 'Success' | 'Flagged' | 'Pending';
export type EventIconType = 'learning' | 'governance' | 'participation' | 'warning';
export type FilterTab = 'All' | 'Platform Operations' | 'Agent' | 'Risk' | 'Governance';

export interface AuditLog {
  id: string;
  actId: string;
  title: string;
  category: EventCategory;
  status: EventStatus;
  description: string;
  timestamp: string;
  actor: string;
  iconType: EventIconType;
  highlighted?: boolean;
}

export const auditLogs: AuditLog[] = [
  {
    id: '1',
    actId: 'ACT-2850',
    title: 'Training Completed',
    category: 'Learning',
    status: 'Success',
    description: 'Training Completed: Market Systems Fundamentals Module 8',
    timestamp: '2026-03-03 14:32',
    actor: 'System',
    iconType: 'learning',
  },
  {
    id: '2',
    actId: 'ACT-2849',
    title: 'Governance Participation',
    category: 'Governance',
    status: 'Success',
    description: 'Governance Participation: Proposal #045 - Expand Solar Hub Program',
    timestamp: '2026-03-03 12:15',
    actor: 'User',
    iconType: 'governance',
  },
  {
    id: '3',
    actId: 'ACT-2848',
    title: 'Assessment Submitted',
    category: 'Participation',
    status: 'Success',
    description: 'Assessment submitted for Likoni House verification',
    timestamp: '2026-03-03 12:15',
    actor: 'User',
    iconType: 'participation',
  },
  {
    id: '4',
    actId: 'ACT-2845',
    title: 'Learning Module Enrolled',
    category: 'Participation',
    status: 'Success',
    description: 'Enrolled in Infrastructure Assessment training module',
    timestamp: '2026-02-28 11:30',
    actor: 'User',
    iconType: 'participation',
  },
  {
    id: '5',
    actId: 'ACT-2846',
    title: 'Certification Issued',
    category: 'Learning',
    status: 'Success',
    description: 'Infrastructure Assessment certification issued',
    timestamp: '2026-02-28 08:00',
    actor: 'System',
    iconType: 'learning',
  },
  {
    id: '6',
    actId: 'ACT-2847',
    title: 'Assessment Flagged For Review',
    category: 'Participation',
    status: 'Flagged',
    description: 'Solar Hub - Surulere completion check flagged for review',
    timestamp: '2026-02-28 11:30',
    actor: 'System',
    iconType: 'warning',
    highlighted: true,
  },
];

export const filterTabs: FilterTab[] = ['All', 'Platform Operations', 'Agent', 'Risk', 'Governance'];
