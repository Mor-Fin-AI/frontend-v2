import {
  ArrowRouting24Regular,
  Money24Regular,
  ReceiptMoney24Regular,
  Share24Regular,
} from "@fluentui/react-icons";

export type FeeDistributionBucket = {
  id: string;
  label: string;
  percent: number;
  amountUsd: number;
  status: "Distributed" | "Pending" | "Queued";
};

export interface FeeIntegrationMetrics {
  feeRatePercent: number;
  feeRoutedToTreasuryUsd: number;
  feeRoutedTodayUsd: number;
  positiveVolumeCapturedUsd: number;
  positiveVolumeDeltaPercent: number;
  distributionCompletePercent: number;
  distributionStatus: "Healthy" | "Syncing" | "Delayed";
  distributionBuckets: FeeDistributionBucket[];
}

export interface FeeDistributionLedgerRow {
  id: string;
  timestamp: string;
  source: string;
  bucket: string;
  volumeUsd: number;
  feeUsd: number;
  status: "Distributed" | "Pending" | "Queued";
}

export const feeVolumeTrend = [
  { day: "Mon", volume: 2100000, fees: 21000 },
  { day: "Tue", volume: 2450000, fees: 24500 },
  { day: "Wed", volume: 2280000, fees: 22800 },
  { day: "Thu", volume: 2620000, fees: 26200 },
  { day: "Fri", volume: 2890000, fees: 28900 },
  { day: "Sat", volume: 1980000, fees: 19800 },
  { day: "Sun", volume: 2320000, fees: 23200 },
];

export const feeRoutingSankey = {
  nodes: [
    { nodeId: 0, name: "Transaction Volume", color: "#30ABE8" },
    { nodeId: 1, name: "1% Fee Capture", color: "#22C38E" },
    { nodeId: 2, name: "Treasury", color: "#8764B8" },
    { nodeId: 3, name: "DAO Education", color: "#4F6BED" },
    { nodeId: 4, name: "Infrastructure", color: "#0E7878" },
    { nodeId: 5, name: "Protocol Reserve", color: "#F69E23" },
  ],
  links: [
    { source: 0, target: 1, value: 186420 },
    { source: 1, target: 2, value: 102531 },
    { source: 1, target: 3, value: 46605 },
    { source: 1, target: 4, value: 27963 },
    { source: 1, target: 5, value: 9321 },
  ],
};

export const feeDistributionLedger: FeeDistributionLedgerRow[] = [
  {
    id: "1",
    timestamp: "Today, 09:42",
    source: "DEX Router",
    bucket: "Treasury",
    volumeUsd: 428000,
    feeUsd: 4280,
    status: "Distributed",
  },
  {
    id: "2",
    timestamp: "Today, 08:30",
    source: "Lending Pool",
    bucket: "DAO Education",
    volumeUsd: 186000,
    feeUsd: 1860,
    status: "Distributed",
  },
  {
    id: "3",
    timestamp: "Yesterday",
    source: "Bridge Gateway",
    bucket: "Infrastructure",
    volumeUsd: 92000,
    feeUsd: 920,
    status: "Pending",
  },
  {
    id: "4",
    timestamp: "Yesterday",
    source: "Arbitrage Engine",
    bucket: "Treasury",
    volumeUsd: 384000,
    feeUsd: 3840,
    status: "Distributed",
  },
  {
    id: "5",
    timestamp: "2 days ago",
    source: "Staking Vault",
    bucket: "Protocol Reserve",
    volumeUsd: 45000,
    feeUsd: 450,
    status: "Queued",
  },
  {
    id: "6",
    timestamp: "3 days ago",
    source: "Fee Integration",
    bucket: "Treasury",
    volumeUsd: 512000,
    feeUsd: 5120,
    status: "Distributed",
  },
];

export const feeIntegrationMetrics: FeeIntegrationMetrics = {
  feeRatePercent: 1,
  feeRoutedToTreasuryUsd: 186420,
  feeRoutedTodayUsd: 4280,
  positiveVolumeCapturedUsd: 18642000,
  positiveVolumeDeltaPercent: 6.8,
  distributionCompletePercent: 92,
  distributionStatus: "Healthy",
  distributionBuckets: [
    {
      id: "treasury",
      label: "Treasury",
      percent: 55,
      amountUsd: 102531,
      status: "Distributed",
    },
    {
      id: "education",
      label: "DAO Education Rewards",
      percent: 25,
      amountUsd: 46605,
      status: "Distributed",
    },
    {
      id: "infrastructure",
      label: "Infrastructure Fund",
      percent: 15,
      amountUsd: 27963,
      status: "Pending",
    },
    {
      id: "reserve",
      label: "Protocol Reserve",
      percent: 5,
      amountUsd: 9321,
      status: "Queued",
    },
  ],
};

export const FEE_INTEGRATION_ICON = Money24Regular;

export type FeeIntegrationMetricFormat = "currency" | "percent" | "number";

export interface FeeIntegrationMetric {
  id: string;
  title: string;
  value: number;
  valuePrefix?: string;
  valueSuffix?: string;
  subtitle: string;
  format: FeeIntegrationMetricFormat;
  trend?: number;
  icon: typeof Money24Regular;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

function formatFeeUsd(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function buildFeeIntegrationMetrics(
  metrics: FeeIntegrationMetrics
): FeeIntegrationMetric[] {
  return [
    {
      id: "fee-routed",
      title: "1% Fee Routed to Treasury",
      value: metrics.feeRoutedToTreasuryUsd,
      valuePrefix: "$",
      subtitle: `${metrics.feeRatePercent}% rate · ${formatFeeUsd(metrics.feeRoutedTodayUsd)} routed today`,
      format: "currency",
      icon: ReceiptMoney24Regular,
      iconBg: "bg-[color-mix(in_srgb,var(--action-green)_14%,transparent)]",
      iconColor: "text-[var(--action-green)]",
      valueColor: "text-[var(--action-green)]",
    },
    {
      id: "volume-captured",
      title: "Positive Volume Captured",
      value: metrics.positiveVolumeCapturedUsd,
      valuePrefix: "$",
      subtitle: `+${metrics.positiveVolumeDeltaPercent}% vs prior 24h`,
      format: "currency",
      trend: metrics.positiveVolumeDeltaPercent,
      icon: ArrowRouting24Regular,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-primary",
    },
    {
      id: "distribution-status",
      title: "Fee Distribution Status",
      value: metrics.distributionCompletePercent,
      valueSuffix: "%",
      subtitle: `${metrics.distributionStatus} · Treasury, education, infrastructure, and reserve`,
      format: "percent",
      icon: Share24Regular,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-700 dark:text-amber-400",
      valueColor: "text-amber-700 dark:text-amber-400",
    },
  ];
}

export const feeIntegrationCards = [
  {
    id: "fee-routed",
    title: "1% Fee Routed to Treasury",
    icon: ReceiptMoney24Regular,
    iconBg: "bg-[color-mix(in_srgb,var(--action-green)_14%,transparent)]",
    iconColor: "text-[var(--action-green)]",
    valueColor: "text-[var(--action-green)]",
  },
  {
    id: "volume-captured",
    title: "Positive Volume Captured",
    icon: ArrowRouting24Regular,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    valueColor: "text-primary",
  },
  {
    id: "distribution-status",
    title: "Fee Distribution Status",
    icon: Share24Regular,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-700 dark:text-amber-400",
    valueColor: "text-amber-700 dark:text-amber-400",
  },
] as const;

export function distributionStatusTone(
  status: FeeIntegrationMetrics["distributionStatus"]
): "success" | "warning" | "brand" {
  if (status === "Healthy") return "success";
  if (status === "Delayed") return "warning";
  return "brand";
}

export function bucketStatusTone(
  status: FeeDistributionBucket["status"]
): "success" | "warning" | "neutral" {
  if (status === "Distributed") return "success";
  if (status === "Pending") return "warning";
  return "neutral";
}
