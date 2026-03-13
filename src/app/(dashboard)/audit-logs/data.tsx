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
    title: 'Reward Events',
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
    title: 'DAO Events',
    value: 89,
    subtitle: 'Validations & trainings',
    icon: EventsIcon,
    iconBg: 'bg-[#30ABE81A]',
    iconColor: 'text-[#30ABE8]',
    valueColor: 'text-[#F69E23]',
    subtitleColor: 'text-primary',
    variant: 'default',
  },
  {
    title: 'Governance Events',
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

export type EventCategory = 'Reward' | 'Governance' | 'DAO';
export type EventStatus = 'Success' | 'Flagged' | 'Pending';
export type EventIconType = 'reward' | 'governance' | 'dao' | 'warning';
export type FilterTab = 'All' | 'Treasury' | 'Agent' | 'Risk' | 'Governance';

export interface AuditLog {
  id: string;
  txnId: string;
  title: string;
  category: EventCategory;
  status: EventStatus;
  description: string;
  timestamp: string;
  actor: string;
  amount?: string;
  amountColor?: 'green' | 'red';
  iconType: EventIconType;
  highlighted?: boolean;
}

export const auditLogs: AuditLog[] = [
  {
    id: '1',
    txnId: 'TXN-2850',
    title: 'Reward Distribution',
    category: 'Reward',
    status: 'Success',
    description: 'Training completion bonus for DeFi Fundamentals Module 8',
    timestamp: '2026-03-03 14:32',
    actor: 'System',
    amount: '$250',
    amountColor: 'green',
    iconType: 'reward',
  },
  {
    id: '2',
    txnId: 'TXN-2849',
    title: 'Vote Cast',
    category: 'Governance',
    status: 'Success',
    description: 'Voted FOR on Proposal #045 - Expand Solar Hub Program',
    timestamp: '2026-03-03 12:15',
    actor: 'User',
    iconType: 'governance',
  },
  {
    id: '3',
    txnId: 'TXN-2848',
    title: 'Validation Submitted',
    category: 'DAO',
    status: 'Success',
    description: 'Voted FOR on Proposal #045 - Expand Solar Hub Program',
    timestamp: '2026-03-03 12:15',
    actor: 'User',
    amount: '+$120',
    amountColor: 'green',
    iconType: 'dao',
  },
  {
    id: '4',
    txnId: 'TXN-2845',
    title: 'Training Enrolled',
    category: 'DAO',
    status: 'Success',
    description: 'Enrolled in Infrastructure Assessment training module',
    timestamp: '2026-02-28 11:30',
    actor: 'User',
    iconType: 'dao',
  },
  {
    id: '5',
    txnId: 'TXN-2846',
    title: 'Payout Processed',
    category: 'Reward',
    status: 'Success',
    description: 'Enrolled in Infrastructure Assessment training module',
    timestamp: '2026-02-28 08:00',
    actor: 'System',
    amount: '$1,250',
    amountColor: 'green',
    iconType: 'reward',
  },
  {
    id: '6',
    txnId: 'TXN-2844',
    title: 'Validation Flagged',
    category: 'DAO',
    status: 'Flagged',
    description: 'Solar Hub - Surulere completion check flagged for review',
    timestamp: '2026-02-28 11:30',
    actor: 'System',
    amount: '$0',
    amountColor: 'red',
    iconType: 'warning',
    highlighted: true,
  },
];

export const filterTabs: FilterTab[] = ['All', 'Treasury', 'Agent', 'Risk', 'Governance'];
