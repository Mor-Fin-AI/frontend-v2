import type { Address } from "viem";
import type {
  LendingDebtDischargeMetrics,
  LendingDebtMetric,
  LoanPositionRow,
} from "@/app/(dashboard)/lending-debt-discharge/data";
import { buildLendingDebtMetrics } from "@/app/(dashboard)/lending-debt-discharge/data";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type LendingDischargeMetricsResponse = {
  collateralEth: string;
  borrowedEth: string;
  loanToValueRatio: number;
  dischargeTimerActive: boolean;
  dischargeDaysRemaining: number;
  dischargeHoursRemaining: number;
  debtRepaymentPercent: number;
  debtRepaymentStatus: "On Track" | "At Risk" | "Complete";
  debtRepaidEth: string;
  debtTotalEth: string;
  borrowedCycleCompletePercent: number;
  borrowedCyclesCompleted: number;
  borrowedCyclesTotal: number;
  dischargesPending: number;
  dischargesActive: number;
  dischargesFailed: number;
  lastUpdatedAt: number | null;
  isLive: true;
};

export type LendingLoanPositionResponse = {
  id: string;
  borrower: string;
  dsaAddress: Address;
  collateralEth: string;
  borrowedEth: string;
  ltvPercent: number;
  repaymentPercent: number;
  dischargeDate: string;
  status: "Active" | "Discharging" | "Repaid";
  dischargeId: string;
  amountLabel?: string;
};

export type LendingGanttTaskResponse = {
  phase: string;
  start: string;
  end: string;
  color: string;
};

export type LendingDischargeResponse = {
  chainId: number;
  chain: string;
  treasuryFlowPanel: Address;
  platformDsa: Address | null;
  metrics: LendingDischargeMetricsResponse;
  loanPositions: LendingLoanPositionResponse[];
  ganttTasks: LendingGanttTaskResponse[];
  connectors: Array<{ key: string; enabled: boolean; address: Address | null }>;
};

export async function fetchLendingDischargeData(walletAddress?: string) {
  const query = walletAddress
    ? `?wallet=${encodeURIComponent(walletAddress)}`
    : "";
  const response = await fetch(`${API_BASE}/lending/discharge${query}`);
  const payload = (await response.json().catch(() => ({}))) as LendingDischargeResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load lending discharge data.");
  }

  return payload;
}

export function mapLiveMetrics(
  metrics: LendingDischargeMetricsResponse
): LendingDebtDischargeMetrics {
  return {
    collateralUsd: Number(metrics.collateralEth),
    borrowedUsd: Number(metrics.borrowedEth),
    loanToValueRatio: metrics.loanToValueRatio,
    dischargeTimerActive: metrics.dischargeTimerActive,
    dischargeDaysRemaining: metrics.dischargesActive,
    dischargeHoursRemaining: metrics.dischargesPending,
    debtRepaymentPercent: metrics.debtRepaymentPercent,
    debtRepaymentStatus: metrics.debtRepaymentStatus,
    debtRepaidUsd: Number(metrics.debtRepaidEth),
    debtTotalUsd: Number(metrics.debtTotalEth),
    borrowedCycleCompletePercent: metrics.borrowedCycleCompletePercent,
    borrowedCyclesCompleted: metrics.borrowedCyclesCompleted,
    borrowedCyclesTotal: metrics.borrowedCyclesTotal,
    isLive: true,
    collateralLabel: `${Number(metrics.collateralEth).toFixed(4)} ETH`,
    borrowedLabel: `${Number(metrics.borrowedEth).toFixed(4)} WETH`,
  };
}

export function mapLiveLoanPositions(
  rows: LendingLoanPositionResponse[]
): LoanPositionRow[] {
  return rows.map((row) => ({
    id: row.id,
    borrower: row.borrower,
    collateralUsd: Number(row.collateralEth),
    borrowedUsd: Number(row.borrowedEth),
    ltvPercent: row.ltvPercent,
    repaymentPercent: row.repaymentPercent,
    dischargeDate: row.dischargeDate,
    status: row.status,
    collateralLabel: `${row.collateralEth} ETH`,
    borrowedLabel: row.amountLabel ?? `${row.borrowedEth} WETH`,
    isLive: true,
  }));
}

export function buildLiveLendingMetrics(
  metrics: LendingDischargeMetricsResponse
): LendingDebtMetric[] {
  const mapped = mapLiveMetrics(metrics);
  const base = buildLendingDebtMetrics(mapped);

  return base.map((metric) => {
    if (metric.id === "collateral-borrowed") {
      return {
        ...metric,
        value: Number(metrics.collateralEth),
        valueSuffix: " ETH",
        valuePrefix: undefined,
        format: "token" as const,
        subtitle: `Borrowed ${Number(metrics.borrowedEth).toFixed(4)} WETH · LTV ${metrics.loanToValueRatio}%`,
      };
    }
    if (metric.id === "discharge-timer") {
      return {
        ...metric,
        value: metrics.dischargeTimerActive
          ? `${metrics.dischargesActive} active · ${metrics.dischargesPending} pending`
          : "Inactive",
        subtitle: metrics.dischargeTimerActive
          ? "Live discharge counters from MorTreasuryFlowPanel"
          : "No active discharges on-chain",
      };
    }
    if (metric.id === "repayment-status") {
      return {
        ...metric,
        subtitle: `${metrics.debtRepaymentStatus} · ${Number(metrics.debtRepaidEth).toFixed(4)} of ${Number(metrics.debtTotalEth).toFixed(4)} WETH recycled`,
      };
    }
    if (metric.id === "cycle-complete") {
      return {
        ...metric,
        subtitle: `${metrics.borrowedCyclesCompleted} of ${metrics.borrowedCyclesTotal} discharges complete · ${metrics.dischargesFailed} failed`,
      };
    }
    return metric;
  });
}
