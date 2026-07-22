import type React from "react";
import {
  Wallet24Regular,
  ShieldCheckmark24Regular,
  ArrowSwap24Regular,
  LockClosed24Regular,
} from "@fluentui/react-icons";

export type DsaAccountType = "user" | "client";

export interface DsaStat {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
  suffix?: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  subtitleColor?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export interface DsaTransaction {
  id: string;
  date: string;
  type: string;
  amount: string;
  status: "Completed" | "Pending" | "Failed";
  reference: string;
}

export interface DsaAccountInfo {
  accountId: string;
  accountType: string;
  status: "Active" | "Pending" | "Suspended";
  linkedWallet: string;
  createdAt: string;
  lastActivity: string;
}

export const userDsaStats: DsaStat[] = [
  {
    title: "DSA Balance",
    value: 1240.5,
    prefix: "$",
    subtitle: "Available for governance & rewards",
    icon: Wallet24Regular,
    iconBg: "bg-[#4ADE801A]",
    iconColor: "text-[#22C38E]",
    valueColor: "text-[#22C38E]",
    subtitleColor: "text-primary",
    variant: "success",
  },
  {
    title: "Staked Amount",
    value: 500,
    prefix: "$",
    subtitle: "Locked until Apr 2026",
    icon: LockClosed24Regular,
    iconBg: "bg-[#8547D11A]",
    iconColor: "text-[#8C47D1]",
    valueColor: "text-[#8C47D1]",
    subtitleColor: "text-primary",
    variant: "default",
  },
  {
    title: "Monthly Inflow",
    value: 320,
    prefix: "+$",
    subtitle: "From learning rewards",
    icon: ArrowSwap24Regular,
    iconBg: "bg-[#30ABE81A]",
    iconColor: "text-[#30ABE8]",
    valueColor: "text-[#30ABE8]",
    subtitleColor: "text-primary",
    variant: "default",
  },
  {
    title: "Account Status",
    value: "Verified",
    subtitle: "KYC & wallet linked",
    icon: ShieldCheckmark24Regular,
    iconBg: "bg-[#F69E231A]",
    iconColor: "text-[#F69E23]",
    valueColor: "text-[#F69E23]",
    subtitleColor: "text-primary",
    variant: "warning",
  },
];

export const clientDsaStats: DsaStat[] = [
  {
    title: "Client DSA Balance",
    value: 24850,
    prefix: "$",
    subtitle: "Organization treasury",
    icon: Wallet24Regular,
    iconBg: "bg-[#4ADE801A]",
    iconColor: "text-[#22C38E]",
    valueColor: "text-[#22C38E]",
    subtitleColor: "text-primary",
    variant: "success",
  },
  {
    title: "Escrow Held",
    value: 5200,
    prefix: "$",
    subtitle: "Pending project disbursements",
    icon: LockClosed24Regular,
    iconBg: "bg-[#8547D11A]",
    iconColor: "text-[#8C47D1]",
    valueColor: "text-[#8C47D1]",
    subtitleColor: "text-primary",
    variant: "default",
  },
  {
    title: "Team Wallets",
    value: 12,
    subtitle: "Active linked accounts",
    icon: ArrowSwap24Regular,
    iconBg: "bg-[#30ABE81A]",
    iconColor: "text-[#30ABE8]",
    valueColor: "text-[#30ABE8]",
    subtitleColor: "text-primary",
    variant: "default",
  },
  {
    title: "Compliance",
    value: "Approved",
    subtitle: "Client onboarding complete",
    icon: ShieldCheckmark24Regular,
    iconBg: "bg-[#F69E231A]",
    iconColor: "text-[#F69E23]",
    valueColor: "text-[#F69E23]",
    subtitleColor: "text-primary",
    variant: "warning",
  },
];

export const userDsaTransactions: DsaTransaction[] = [
  {
    id: "TXN-1042",
    date: "Mar 15, 2026",
    type: "Reward Credit",
    amount: "+$120.00",
    status: "Completed",
    reference: "Learning milestone payout",
  },
  {
    id: "TXN-1038",
    date: "Mar 10, 2026",
    type: "Stake Deposit",
    amount: "-$200.00",
    status: "Completed",
    reference: "Governance stake lock",
  },
  {
    id: "TXN-1031",
    date: "Mar 5, 2026",
    type: "Membership Fee",
    amount: "-$99.00",
    status: "Completed",
    reference: "Public tier monthly",
  },
  {
    id: "TXN-1024",
    date: "Feb 28, 2026",
    type: "Reward Credit",
    amount: "+$85.50",
    status: "Completed",
    reference: "Participation bonus",
  },
];

export const clientDsaTransactions: DsaTransaction[] = [
  {
    id: "CTX-2201",
    date: "Mar 16, 2026",
    type: "Project Disbursement",
    amount: "-$3,200.00",
    status: "Completed",
    reference: "Mombasa Phase 2 materials",
  },
  {
    id: "CTX-2195",
    date: "Mar 12, 2026",
    type: "Treasury Deposit",
    amount: "+$10,000.00",
    status: "Completed",
    reference: "Client funding round",
  },
  {
    id: "CTX-2188",
    date: "Mar 8, 2026",
    type: "Escrow Release",
    amount: "-$1,500.00",
    status: "Pending",
    reference: "Contractor milestone 3",
  },
  {
    id: "CTX-2179",
    date: "Mar 1, 2026",
    type: "Team Allocation",
    amount: "-$800.00",
    status: "Completed",
    reference: "Coordinator wallet top-up",
  },
];

export const userDsaAccountInfo: DsaAccountInfo = {
  accountId: "DSA-USR-00842",
  accountType: "Member Savings Account",
  status: "Active",
  linkedWallet: "0x71C7...E1A3",
  createdAt: "Jan 12, 2026",
  lastActivity: "Mar 15, 2026",
};

export const clientDsaAccountInfo: DsaAccountInfo = {
  accountId: "DSA-CLT-00019",
  accountType: "Organization Treasury Account",
  status: "Active",
  linkedWallet: "0x4F2a...9B7C",
  createdAt: "Nov 3, 2025",
  lastActivity: "Mar 16, 2026",
};
