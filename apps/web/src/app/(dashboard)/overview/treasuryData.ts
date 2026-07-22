import {
  ArrowSync24Regular,
  CheckmarkCircle24Regular,
  Handshake24Regular,
  Money24Regular,
  ReceiptMoney24Regular,
} from "@fluentui/react-icons";
import { STAT_CARD_NEUTRAL } from "@/lib/statCardTheme";

export type TreasuryMetricFormat = "currency" | "percent" | "status" | "token";

export interface TreasuryFlowMetric {
  id: string;
  title: string;
  value: number | string;
  valuePrefix?: string;
  valueSuffix?: string;
  subtitle: string;
  format: TreasuryMetricFormat;
  icon: typeof Money24Regular;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

export interface TreasuryLedgerRow {
  id: string;
  timestamp: string;
  type: "Fee Inflow" | "Borrowing" | "Discharge" | "Recycling" | "Distribution";
  source: string;
  destination: string;
  amountUsd: number;
  amountLabel?: string;
  status: "Settled" | "Pending" | "Processing";
}

export const treasuryBalanceTrend = [
  { month: "Jan", balance: 2100000, fees: 142000, recycled: 280000 },
  { month: "Feb", balance: 2280000, fees: 158000, recycled: 310000 },
  { month: "Mar", balance: 2410000, fees: 171000, recycled: 335000 },
  { month: "Apr", balance: 2560000, fees: 179000, recycled: 368000 },
  { month: "May", balance: 2690000, fees: 184000, recycled: 395000 },
  { month: "Jun", balance: 2847500, fees: 186420, recycled: 412800 },
];

export const treasurySankeyData = {
  nodes: [
    { nodeId: 0, name: "Protocol Fees", color: "#22C38E" },
    { nodeId: 1, name: "Borrowed Capital", color: "#30ABE8" },
    { nodeId: 2, name: "Treasury Reserve", color: "#8764B8" },
    { nodeId: 3, name: "Debt Discharge", color: "#F69E23" },
    { nodeId: 4, name: "Education Fund", color: "#4F6BED" },
    { nodeId: 5, name: "Infrastructure", color: "#0E7878" },
    { nodeId: 6, name: "Recycled Capital", color: "#22C38E" },
  ],
  links: [
    { source: 0, target: 2, value: 102000 },
    { source: 0, target: 4, value: 46000 },
    { source: 0, target: 5, value: 28000 },
    { source: 2, target: 1, value: 920000 },
    { source: 1, target: 3, value: 625000 },
    { source: 3, target: 6, value: 412800 },
  ],
};

export const treasuryLedgerRows: TreasuryLedgerRow[] = [
  {
    id: "1",
    timestamp: "Today, 09:42",
    type: "Fee Inflow",
    source: "Fee Integration",
    destination: "Treasury Reserve",
    amountUsd: 4280,
    status: "Settled",
  },
  {
    id: "2",
    timestamp: "Today, 08:15",
    type: "Recycling",
    source: "Debt Discharge",
    destination: "Treasury Reserve",
    amountUsd: 185000,
    status: "Settled",
  },
  {
    id: "3",
    timestamp: "Yesterday",
    type: "Borrowing",
    source: "Treasury Reserve",
    destination: "Lending Pool",
    amountUsd: 250000,
    status: "Processing",
  },
  {
    id: "4",
    timestamp: "Yesterday",
    type: "Discharge",
    source: "Lending Pool",
    destination: "Debt Discharge",
    amountUsd: 92000,
    status: "Settled",
  },
  {
    id: "5",
    timestamp: "2 days ago",
    type: "Distribution",
    source: "Treasury Reserve",
    destination: "DAO Education",
    amountUsd: 46605,
    status: "Settled",
  },
  {
    id: "6",
    timestamp: "3 days ago",
    type: "Fee Inflow",
    source: "Arbitrage Monitor",
    destination: "Treasury Reserve",
    amountUsd: 3840,
    status: "Settled",
  },
  {
    id: "7",
    timestamp: "4 days ago",
    type: "Recycling",
    source: "Debt Discharge",
    destination: "Treasury Reserve",
    amountUsd: 227800,
    status: "Pending",
  },
];

export const treasuryFlowMetrics: TreasuryFlowMetric[] = [
  {
    id: "treasury-balance",
    title: "Current Treasury Balance",
    value: 2847500,
    valuePrefix: "$",
    subtitle: "Available liquidity across treasury wallets",
    format: "currency",
    icon: Money24Regular,
    ...STAT_CARD_NEUTRAL,
  },
  {
    id: "fees-collected",
    title: "Total Fee Collected",
    value: 186420,
    valuePrefix: "$",
    subtitle: "+4.2% vs last 30 days",
    format: "currency",
    icon: ReceiptMoney24Regular,
    ...STAT_CARD_NEUTRAL,
  },
  {
    id: "borrowed-capital",
    title: "Borrowed Capital Active",
    value: 920000,
    valuePrefix: "$",
    subtitle: "12 active borrowing positions",
    format: "currency",
    icon: Handshake24Regular,
    ...STAT_CARD_NEUTRAL,
  },
  {
    id: "debt-discharge",
    title: "Debt Discharge Status",
    value: 68,
    valueSuffix: "%",
    subtitle: "On track for Q3 discharge target",
    format: "percent",
    icon: CheckmarkCircle24Regular,
    ...STAT_CARD_NEUTRAL,
  },
  {
    id: "capital-recycled",
    title: "Net Capital Recycled",
    value: 412800,
    valuePrefix: "$",
    subtitle: "Capital returned to treasury this cycle",
    format: "currency",
    icon: ArrowSync24Regular,
    ...STAT_CARD_NEUTRAL,
  },
];
