import {
  ArrowSync24Regular,
  BuildingBank24Regular,
  CalendarClock24Regular,
  CheckmarkCircle24Regular,
} from "@fluentui/react-icons";

export interface LendingDebtDischargeMetrics {
  collateralUsd: number;
  borrowedUsd: number;
  loanToValueRatio: number;
  dischargeTimerActive: boolean;
  dischargeDaysRemaining: number;
  dischargeHoursRemaining: number;
  debtRepaymentPercent: number;
  debtRepaymentStatus: "On Track" | "At Risk" | "Complete";
  debtRepaidUsd: number;
  debtTotalUsd: number;
  borrowedCycleCompletePercent: number;
  borrowedCyclesCompleted: number;
  borrowedCyclesTotal: number;
}

export interface LoanPositionRow {
  id: string;
  borrower: string;
  collateralUsd: number;
  borrowedUsd: number;
  ltvPercent: number;
  repaymentPercent: number;
  dischargeDate: string;
  status: "Active" | "Discharging" | "Repaid";
}

export const dischargeGanttTasks = [
  {
    phase: "Phase 1 — Collateral Lock",
    start: new Date("2026-03-01"),
    end: new Date("2026-04-15"),
    color: "#30ABE8",
  },
  {
    phase: "Phase 2 — Partial Repayment",
    start: new Date("2026-04-15"),
    end: new Date("2026-05-20"),
    color: "#8764B8",
  },
  {
    phase: "Phase 3 — Active Discharge",
    start: new Date("2026-05-20"),
    end: new Date("2026-06-18"),
    color: "#F69E23",
  },
  {
    phase: "Phase 4 — Cycle Close",
    start: new Date("2026-06-18"),
    end: new Date("2026-07-10"),
    color: "#22C38E",
  },
];

export const loanPositionRows: LoanPositionRow[] = [
  {
    id: "1",
    borrower: "Treasury Pool A",
    collateralUsd: 420000,
    borrowedUsd: 280000,
    ltvPercent: 67,
    repaymentPercent: 72,
    dischargeDate: "Jun 18, 2026",
    status: "Discharging",
  },
  {
    id: "2",
    borrower: "Infrastructure Fund",
    collateralUsd: 380000,
    borrowedUsd: 210000,
    ltvPercent: 55,
    repaymentPercent: 84,
    dischargeDate: "Jun 22, 2026",
    status: "Active",
  },
  {
    id: "3",
    borrower: "Education Reserve",
    collateralUsd: 290000,
    borrowedUsd: 180000,
    ltvPercent: 62,
    repaymentPercent: 58,
    dischargeDate: "Jul 02, 2026",
    status: "Active",
  },
  {
    id: "4",
    borrower: "Arbitrage Vault",
    collateralUsd: 360000,
    borrowedUsd: 250000,
    ltvPercent: 69,
    repaymentPercent: 91,
    dischargeDate: "Jun 14, 2026",
    status: "Discharging",
  },
  {
    id: "5",
    borrower: "Legacy Cycle 2",
    collateralUsd: 0,
    borrowedUsd: 0,
    ltvPercent: 0,
    repaymentPercent: 100,
    dischargeDate: "May 30, 2026",
    status: "Repaid",
  },
];

export type LendingMetricFormat = "currency" | "percent" | "status" | "timer";

export interface LendingDebtMetric {
  id: string;
  title: string;
  value: number | string;
  valuePrefix?: string;
  valueSuffix?: string;
  subtitle: string;
  format: LendingMetricFormat;
  statusLabel?: LendingDebtDischargeMetrics["debtRepaymentStatus"];
  icon: typeof BuildingBank24Regular;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

export function buildLendingDebtMetrics(
  metrics: LendingDebtDischargeMetrics
): LendingDebtMetric[] {
  const timerLabel = metrics.dischargeTimerActive
    ? `${metrics.dischargeDaysRemaining}d ${metrics.dischargeHoursRemaining}h`
    : "Inactive";

  return [
    {
      id: "collateral-borrowed",
      title: "Collateral & Borrowed",
      value: metrics.collateralUsd,
      valuePrefix: "$",
      subtitle: `Borrowed ${formatUsd(metrics.borrowedUsd)} · LTV ${metrics.loanToValueRatio}%`,
      format: "currency",
      icon: BuildingBank24Regular,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-primary",
    },
    {
      id: "discharge-timer",
      title: "Discharge Timer Active",
      value: timerLabel,
      subtitle: metrics.dischargeTimerActive
        ? "Timer active · Countdown until discharge window closes"
        : "No active discharge window",
      format: "timer",
      icon: CalendarClock24Regular,
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-600 dark:text-sky-400",
      valueColor: "text-sky-600 dark:text-sky-400",
    },
    {
      id: "repayment-status",
      title: "Debt Repayment Status",
      value: metrics.debtRepaymentPercent,
      valueSuffix: "%",
      subtitle: `${metrics.debtRepaymentStatus} · ${formatUsd(metrics.debtRepaidUsd)} of ${formatUsd(metrics.debtTotalUsd)} repaid`,
      format: "percent",
      statusLabel: metrics.debtRepaymentStatus,
      icon: CheckmarkCircle24Regular,
      iconBg: "bg-[color-mix(in_srgb,var(--action-green)_14%,transparent)]",
      iconColor: "text-[var(--action-green)]",
      valueColor: "text-[var(--action-green)]",
    },
    {
      id: "cycle-complete",
      title: "Borrowed Cycle Complete",
      value: metrics.borrowedCycleCompletePercent,
      valueSuffix: "%",
      subtitle: `${metrics.borrowedCyclesCompleted} of ${metrics.borrowedCyclesTotal} cycles · Multi-phase borrowing progress`,
      format: "percent",
      icon: ArrowSync24Regular,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-700 dark:text-amber-400",
      valueColor: "text-amber-700 dark:text-amber-400",
    },
  ];
}

function formatUsd(value: number) {
  return `$${value.toLocaleString()}`;
}

export const lendingDebtDischargeMetrics: LendingDebtDischargeMetrics = {
  collateralUsd: 1450000,
  borrowedUsd: 920000,
  loanToValueRatio: 63,
  dischargeTimerActive: true,
  dischargeDaysRemaining: 18,
  dischargeHoursRemaining: 6,
  debtRepaymentPercent: 68,
  debtRepaymentStatus: "On Track",
  debtRepaidUsd: 625600,
  debtTotalUsd: 920000,
  borrowedCycleCompletePercent: 75,
  borrowedCyclesCompleted: 3,
  borrowedCyclesTotal: 4,
};

export const LENDING_DEBT_DISCHARGE_ICON = BuildingBank24Regular;

export const lendingDebtDischargeMetricsList = buildLendingDebtMetrics(
  lendingDebtDischargeMetrics
);

export function repaymentStatusTone(
  status: LendingDebtDischargeMetrics["debtRepaymentStatus"]
): "success" | "warning" | "brand" {
  if (status === "Complete") return "success";
  if (status === "At Risk") return "warning";
  return "brand";
}
