import {
  Calendar24Regular,
  People24Regular,
  ShieldCheckmark24Regular,
  Star24Filled,
} from "@fluentui/react-icons";

export interface DaoEducationRewardsMetrics {
  youthTrainingProgress: number;
  youthModulesCompleted: number;
  youthModulesTotal: number;
  youthActiveLearners: number;
  supervisorCertifications: number;
  supervisorCertificationsPending: number;
  rewardCycleName: string;
  rewardCycleDaysRemaining: number;
  rewardCyclePoolMor: number;
  certifiedNftsIssued: number;
  certifiedNftsThisCycle: number;
}

export interface CohortCertificationRow {
  id: string;
  cohort: string;
  learners: number;
  modulesCompleted: number;
  certifications: number;
  nftsMinted: number;
  status: "Active" | "Graduated" | "Pending";
}

export const trainingFunnelData = [
  { stage: "Enrolled", value: 420, color: "#30ABE8" },
  { stage: "In Progress", value: 286, color: "#4F6BED" },
  { stage: "Assessment", value: 198, color: "#8764B8" },
  { stage: "Certified", value: 142, color: "#22C38E" },
  { stage: "NFT Issued", value: 119, color: "#F69E23" },
];

export const certificationPolarData = [
  { category: "Youth Training", count: 186 },
  { category: "Supervisor", count: 42 },
  { category: "Governance", count: 28 },
  { category: "Field Ops", count: 35 },
  { category: "Technical", count: 28 },
];

export const cohortCertificationRows: CohortCertificationRow[] = [
  {
    id: "1",
    cohort: "Coastal Youth Cohort A",
    learners: 64,
    modulesCompleted: 48,
    certifications: 38,
    nftsMinted: 32,
    status: "Active",
  },
  {
    id: "2",
    cohort: "Supervisor Track Q2",
    learners: 28,
    modulesCompleted: 22,
    certifications: 18,
    nftsMinted: 16,
    status: "Active",
  },
  {
    id: "3",
    cohort: "Governance Foundations",
    learners: 42,
    modulesCompleted: 42,
    certifications: 36,
    nftsMinted: 34,
    status: "Graduated",
  },
  {
    id: "4",
    cohort: "Field Ops Intake",
    learners: 52,
    modulesCompleted: 31,
    certifications: 24,
    nftsMinted: 20,
    status: "Active",
  },
  {
    id: "5",
    cohort: "Technical Skills Lab",
    learners: 36,
    modulesCompleted: 12,
    certifications: 8,
    nftsMinted: 6,
    status: "Pending",
  },
];

export const daoEducationRewardsMetrics: DaoEducationRewardsMetrics = {
  youthTrainingProgress: 73,
  youthModulesCompleted: 438,
  youthModulesTotal: 600,
  youthActiveLearners: 186,
  supervisorCertifications: 42,
  supervisorCertificationsPending: 8,
  rewardCycleName: "Q2 2026 Learning Cycle",
  rewardCycleDaysRemaining: 24,
  rewardCyclePoolMor: 125000,
  certifiedNftsIssued: 319,
  certifiedNftsThisCycle: 47,
};

export const DAO_EDUCATION_REWARDS_ICON = People24Regular;

export type DaoEducationMetricFormat = "number" | "percent" | "text";

export interface DaoEducationMetric {
  id: string;
  title: string;
  value: number | string;
  valuePrefix?: string;
  valueSuffix?: string;
  subtitle: string;
  format: DaoEducationMetricFormat;
  icon: typeof People24Regular;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

export function buildDaoEducationMetrics(
  metrics: DaoEducationRewardsMetrics
): DaoEducationMetric[] {
  return [
    {
      id: "youth-training",
      title: "Youth Training Progress",
      value: metrics.youthTrainingProgress,
      valueSuffix: "%",
      subtitle: `${metrics.youthModulesCompleted}/${metrics.youthModulesTotal} modules · ${metrics.youthActiveLearners} active`,
      format: "percent",
      icon: People24Regular,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-primary",
    },
    {
      id: "supervisor-certs",
      title: "Supervisor Certifications",
      value: metrics.supervisorCertifications,
      subtitle: `${metrics.supervisorCertificationsPending} pending review`,
      format: "number",
      icon: ShieldCheckmark24Regular,
      iconBg: "bg-[color-mix(in_srgb,var(--action-green)_14%,transparent)]",
      iconColor: "text-[var(--action-green)]",
      valueColor: "text-[var(--action-green)]",
    },
    {
      id: "reward-cycle",
      title: "Current Reward Cycle",
      value: metrics.rewardCycleDaysRemaining,
      valueSuffix: " days",
      subtitle: `${metrics.rewardCycleName} · ${metrics.rewardCyclePoolMor.toLocaleString()} MOR pool`,
      format: "number",
      icon: Calendar24Regular,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-700 dark:text-amber-400",
      valueColor: "text-amber-700 dark:text-amber-400",
    },
    {
      id: "certified-nfts",
      title: "Certified Issued NFTs",
      value: metrics.certifiedNftsIssued,
      subtitle: `+${metrics.certifiedNftsThisCycle} minted this cycle`,
      format: "number",
      icon: Star24Filled,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
      valueColor: "text-violet-600 dark:text-violet-400",
    },
  ];
}

export const daoEducationRewardCards = [
  {
    id: "youth-training",
    title: "Youth Training Progress",
    icon: People24Regular,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    valueColor: "text-primary",
  },
  {
    id: "supervisor-certs",
    title: "Supervisor Certifications",
    icon: ShieldCheckmark24Regular,
    iconBg: "bg-[color-mix(in_srgb,var(--action-green)_14%,transparent)]",
    iconColor: "text-[var(--action-green)]",
    valueColor: "text-[var(--action-green)]",
  },
  {
    id: "reward-cycle",
    title: "Current Reward Cycle",
    icon: Calendar24Regular,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-700 dark:text-amber-400",
    valueColor: "text-amber-700 dark:text-amber-400",
  },
  {
    id: "certified-nfts",
    title: "Certified Issued NFTs",
    icon: Star24Filled,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    valueColor: "text-violet-600 dark:text-violet-400",
  },
] as const;
