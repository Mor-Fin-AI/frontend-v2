import {
  ArrowSwap24Regular,
  Gas24Regular,
  Gauge24Regular,
  Layer24Regular,
  Receipt24Regular,
} from "@fluentui/react-icons";

import type { L2ChainSlug } from "@/lib/l2EvmChains";
import type { DexSlug } from "@/lib/dexRegistry";

export type ArbitrageRegime = "Aggressive" | "Balanced" | "Defensive";

export interface ArbitrageMonitorMetrics {
  regimeScore: number;
  regime: ArbitrageRegime;
  tradesExecutedToday: number;
  gasProfitUsd: number;
  fitTargetUsd: number;
  gasProfitVsFitRatio: number;
  ethPositionModulation: number;
  ethExposureEth: number;
}

export interface ArbitrageExecutionRow {
  id: string;
  txHash?: string;
  pair: string;
  chain: L2ChainSlug;
  route: string;
  routeDexes: [DexSlug, DexSlug];
  profitUsd: number;
  gasUsd: number;
  status: "Executed" | "Skipped" | "Failed";
  executedAt: string;
  isLive?: boolean;
}

export const arbitrageHourlyTrades = [
  { hour: "06:00", trades: 8, profit: 420 },
  { hour: "08:00", trades: 14, profit: 680 },
  { hour: "10:00", trades: 22, profit: 1120 },
  { hour: "12:00", trades: 18, profit: 940 },
  { hour: "14:00", trades: 26, profit: 1380 },
  { hour: "16:00", trades: 20, profit: 1050 },
  { hour: "18:00", trades: 16, profit: 820 },
  { hour: "20:00", trades: 18, profit: 960 },
];

export const arbitrageGasByPair = [
  {
    name: "ETH/USDC",
    series: [
      { key: "gas", legend: "Gas Cost", data: 840, color: "#F69E23" },
      { key: "profit", legend: "Net Profit", data: 1240, color: "#22C38E" },
    ],
  },
  {
    name: "WBTC/ETH",
    series: [
      { key: "gas", legend: "Gas Cost", data: 620, color: "#F69E23" },
      { key: "profit", legend: "Net Profit", data: 980, color: "#22C38E" },
    ],
  },
  {
    name: "MOR/ETH",
    series: [
      { key: "gas", legend: "Gas Cost", data: 410, color: "#F69E23" },
      { key: "profit", legend: "Net Profit", data: 760, color: "#22C38E" },
    ],
  },
  {
    name: "DAI/USDC",
    series: [
      { key: "gas", legend: "Gas Cost", data: 280, color: "#F69E23" },
      { key: "profit", legend: "Net Profit", data: 520, color: "#22C38E" },
    ],
  },
];

export const arbitrageExecutionLog: ArbitrageExecutionRow[] = [
  {
    id: "1",
    pair: "ETH/USDC",
    chain: "arbitrum",
    route: "Uniswap → Curve",
    routeDexes: ["uniswap", "curve"],
    profitUsd: 142.5,
    gasUsd: 18.2,
    status: "Executed",
    executedAt: "09:41",
  },
  {
    id: "2",
    pair: "MOR/ETH",
    chain: "base",
    route: "Sushi → Balancer",
    routeDexes: ["sushiswap", "balancer"],
    profitUsd: 86.4,
    gasUsd: 12.8,
    status: "Executed",
    executedAt: "09:38",
  },
  {
    id: "3",
    pair: "WBTC/ETH",
    chain: "optimism",
    route: "Curve → Uniswap",
    routeDexes: ["curve", "uniswap"],
    profitUsd: 0,
    gasUsd: 22.1,
    status: "Skipped",
    executedAt: "09:35",
  },
  {
    id: "4",
    pair: "DAI/USDC",
    chain: "polygon",
    route: "Balancer → Curve",
    routeDexes: ["balancer", "curve"],
    profitUsd: 34.2,
    gasUsd: 6.4,
    status: "Executed",
    executedAt: "09:31",
  },
  {
    id: "5",
    pair: "ETH/USDC",
    chain: "zksync",
    route: "Curve → Uniswap",
    routeDexes: ["curve", "uniswap"],
    profitUsd: 0,
    gasUsd: 19.6,
    status: "Failed",
    executedAt: "09:28",
  },
  {
    id: "6",
    pair: "MOR/ETH",
    chain: "linea",
    route: "Uniswap → Sushi",
    routeDexes: ["uniswap", "sushiswap"],
    profitUsd: 58.7,
    gasUsd: 11.3,
    status: "Executed",
    executedAt: "09:24",
  },
];

export const arbitrageMonitorMetrics: ArbitrageMonitorMetrics = {
  regimeScore: 78,
  regime: "Balanced",
  tradesExecutedToday: 142,
  gasProfitUsd: 3840,
  fitTargetUsd: 2950,
  gasProfitVsFitRatio: 1.3,
  ethPositionModulation: 62,
  ethExposureEth: 18.4,
};

export const ARBITRAGE_MONITOR_ICON = ArrowSwap24Regular;

export type ArbitrageMetricFormat = "number" | "percent" | "ratio" | "score";

export interface ArbitrageMetric {
  id: string;
  title: string;
  value: number | string;
  valuePrefix?: string;
  valueSuffix?: string;
  subtitle: string;
  format: ArbitrageMetricFormat;
  icon: typeof ArrowSwap24Regular;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

export function buildArbitrageMetrics(
  metrics: ArbitrageMonitorMetrics,
  killSwitchStatus: KillSwitchStatus
): ArbitrageMetric[] {
  const executionSubtitle =
    killSwitchStatus === "running"
      ? "Live executions across monitored pairs"
      : killSwitchStatus === "paused"
        ? "Execution paused — no new trades"
        : "Kill switch active — executions halted";

  return [
    {
      id: "regime-score",
      title: "Regime Score Indicator",
      value: metrics.regimeScore,
      valueSuffix: "/100",
      subtitle: `${metrics.regime} regime · Market confidence for current window`,
      format: "score",
      icon: Gauge24Regular,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-primary",
    },
    {
      id: "trades-today",
      title: "Trades Executed Today",
      value: metrics.tradesExecutedToday,
      subtitle: executionSubtitle,
      format: "number",
      icon: Receipt24Regular,
      iconBg: "bg-[color-mix(in_srgb,var(--action-green)_14%,transparent)]",
      iconColor: "text-[var(--action-green)]",
      valueColor: "text-[var(--action-green)]",
    },
    {
      id: "gas-fit-ratio",
      title: "Gas Profit vs Fit Ratio",
      value: `${metrics.gasProfitVsFitRatio.toFixed(2)}x`,
      subtitle: `Gas profit $${metrics.gasProfitUsd.toLocaleString()} vs fit target $${metrics.fitTargetUsd.toLocaleString()}`,
      format: "ratio",
      icon: Gas24Regular,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-700 dark:text-amber-400",
      valueColor: "text-amber-700 dark:text-amber-400",
    },
    {
      id: "eth-modulation",
      title: "ETH Position Modulation",
      value: metrics.ethPositionModulation,
      valueSuffix: "%",
      subtitle: `Current ETH exposure: ${metrics.ethExposureEth} ETH`,
      format: "percent",
      icon: Layer24Regular,
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-600 dark:text-sky-400",
      valueColor: "text-sky-600 dark:text-sky-400",
    },
  ];
}

export type KillSwitchStatus = "running" | "paused" | "killed";

export const arbitrageMetricCards = [
  {
    id: "regime-score",
    title: "Regime Score Indicator",
    icon: Gauge24Regular,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    valueColor: "text-primary",
  },
  {
    id: "trades-today",
    title: "Trades Executed Today",
    icon: Receipt24Regular,
    iconBg: "bg-[color-mix(in_srgb,var(--action-green)_14%,transparent)]",
    iconColor: "text-[var(--action-green)]",
    valueColor: "text-[var(--action-green)]",
  },
  {
    id: "gas-fit-ratio",
    title: "Gas Profit vs Fit Ratio",
    icon: Gas24Regular,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-700 dark:text-amber-400",
    valueColor: "text-amber-700 dark:text-amber-400",
  },
  {
    id: "eth-modulation",
    title: "ETH Position Modulation",
    icon: Layer24Regular,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600 dark:text-sky-400",
    valueColor: "text-sky-600 dark:text-sky-400",
  },
] as const;

export const killSwitchStatusMeta: Record<
  KillSwitchStatus,
  { label: string; tone: "success" | "warning" | "danger"; hint: string }
> = {
  running: {
    label: "Running",
    tone: "success",
    hint: "Arbitrage engine is actively monitoring and executing eligible trades.",
  },
  paused: {
    label: "Paused",
    tone: "warning",
    hint: "New executions are paused. Open positions remain managed.",
  },
  killed: {
    label: "Kill Switch Active",
    tone: "danger",
    hint: "All automated arbitrage activity is halted until manually reset.",
  },
};
