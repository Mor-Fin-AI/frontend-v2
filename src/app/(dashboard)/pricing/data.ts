// ─── Types ───────────────────────────────────────────────────────────────────

import { Users, Shield, UsersRound } from "lucide-react";

export interface PricingFeature {
  text: string;
}

export type TierVariant = "public" | "private";

export interface PricingTier {
  id: TierVariant;
  label: string;
  badge: string;
  icon: string | any;
  description: string;
  price: number;
  priceSuffix: string;
  highlight: string;
  highlightColor: string;
  sectionLabel: string;
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface PricingStat {
  label: string;
  value: string;
  valueColor: string;
}

// ─── Stats Bar 

export const pricingStats: PricingStat[] = [
  {
    label: "Public Milestone Cap",
    value: "$2,425",
    valueColor: "text-[#22C38E]",
  },
  {
    label: "Private Milestone Cap",
    value: "$3,425",
    valueColor: "text-[#8C47D1]",
  },
  {
    label: "Payout Methods",
    value: "MPESA + USDC",
    valueColor: "text-white",
  },
  {
    label: "Platform Fee",
    value: "1%",
    valueColor: "text-white",
  },
];

// ─── Pricing Tiers 

export const pricingTiers: PricingTier[] = [
  {
    id: "public",
    label: "Public",
    badge: "PUBLIC TIER",
    icon: UsersRound,
    description:
      "Construction workers building roads, houses, and community infrastructure on the ground in Mombasa.",
    price: 99,
    priceSuffix: "/Month",
    highlight: "Up to $2,425 in milestone bonuses",
    highlightColor: "text-[#22C38E]",
    sectionLabel: "WHAT YOU GET",
    accentColor: "#22C38E",
    badgeBg: "bg-[#22C38E1A]",
    badgeText: "text-[#22C38E]",
    ctaLabel: "Join Public Tier",
    ctaHref: "#",
    features: [
      { text: "Daily Construction Wages Via MPESA" },
      { text: "10 Milestone Bonuses (Up To $2,425)" },
      { text: "Infrastructure Impact Tracking" },
      { text: "Referral Rewards ($350 / 5 Members)" },
      { text: "Do-Nou Safety Certification Training" },
      { text: "Dashboard: Overview, Rewards, DAO" },
      { text: "Skills Upgrade Modules" },
      { text: "Payout Via MPESA Or USDC" },
    ],
  },
  {
    id: "private",
    label: "Private",
    badge: "PRIVATE TIER",
    icon: Shield,
    description:
      "Coordinators, mentors, surveyors, and supervisors leading the workforce and shaping project direction.",
    price: 999,
    priceSuffix: "/Month",
    highlight: "Up to $3,425 in Leadership Milestones",
    highlightColor: "text-[#8C47D1]",
    sectionLabel: "EVERYTHING IN PUBLIC, PLUS",
    accentColor: "#8C47D1",
    badgeBg: "bg-[#8C47D11A]",
    badgeText: "text-[#8C47D1]",
    ctaLabel: "Join Private Tier",
    ctaHref: "#",
    features: [
      { text: "Leadership Role: Coordinator, Mentor, Or Surveyor" },
      { text: "8 Leadership Milestones (Up To $3,400)" },
      { text: "Project Management Dashboard" },
      { text: "Quarterly Impact Reporting" },
      { text: "Governance Voting On All Proposals" },
      { text: "Full Audit Log Access" },
      { text: "Team Onboarding + Training Tools" },
      { text: "Payout Via MPESA, USDC, Or Bank Transfer" },
    ],
  },
];
