import {
  ArrowSync24Regular,
  CheckmarkCircle24Regular,
  Handshake24Regular,
  Money24Regular,
  ReceiptMoney24Regular,
  Wallet24Regular,
  Globe24Regular,
  ArrowTrending24Regular,
  LockClosed24Regular,
} from "@fluentui/react-icons";
import type {
  DsaAccountSummary,
  PlatformStatusResponse,
} from "@/lib/dsaApi";
import { getCombinedEthBalance } from "@/lib/dsaApi";
import { STAT_CARD_NEUTRAL } from "@/lib/statCardTheme";
import type { StatCardData } from "@/app/(dashboard)/overview/data";
import {
  treasuryBalanceTrend,
  treasuryFlowMetrics,
  treasuryLedgerRows,
  type TreasuryFlowMetric,
  type TreasuryLedgerRow,
} from "@/app/(dashboard)/overview/treasuryData";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getDsaEthBalance(account: DsaAccountSummary | null) {
  return account ? getCombinedEthBalance(account) : 0;
}

function getEnabledConnectorRatio(platformStatus: PlatformStatusResponse) {
  const total = platformStatus.connectors.length;
  if (total === 0) {
    return 0;
  }
  const enabled = platformStatus.connectors.filter((c) => c.enabled).length;
  return Math.round((enabled / total) * 100);
}

export function buildLiveTreasuryFlowMetrics(
  activeDsa: DsaAccountSummary | null,
  platformStatus: PlatformStatusResponse,
  isPlatformOwner: boolean
): TreasuryFlowMetric[] {
  const dsaEth = getDsaEthBalance(activeDsa);
  const treasuryWeth = Number(platformStatus.treasuryWethBalanceFormatted);
  const platformEth = Number(platformStatus.platformEthBalanceFormatted);
  const platformWeth = Number(platformStatus.platformWethBalanceFormatted);
  const connectorHealth = getEnabledConnectorRatio(platformStatus);
  const combinedTreasury = dsaEth + treasuryWeth;

  const dsaLabel = isPlatformOwner
    ? "Platform MorDSA (deployer)"
    : activeDsa
      ? truncateAddress(activeDsa.address)
      : "MorDSA";

  return [
    {
      id: "treasury-balance",
      title: "Current Treasury Balance",
      value: combinedTreasury,
      valueSuffix: " ETH",
      subtitle: `Live ${dsaLabel} + treasury contract`,
      format: "token",
      icon: Money24Regular,
      ...STAT_CARD_NEUTRAL,
    },
    {
      id: "fees-collected",
      title: "Treasury WETH (live)",
      value: treasuryWeth,
      valueSuffix: " WETH",
      subtitle: "MorTreasuryBalance on Arbitrum",
      format: "token",
      icon: ReceiptMoney24Regular,
      ...STAT_CARD_NEUTRAL,
    },
    {
      id: "borrowed-capital",
      title: "Platform DSA ETH",
      value: platformEth,
      valueSuffix: " ETH",
      subtitle: `${platformWeth.toFixed(4)} WETH in platform MorDSA`,
      format: "token",
      icon: Handshake24Regular,
      ...STAT_CARD_NEUTRAL,
    },
    {
      id: "debt-discharge",
      title: "Connector Health",
      value: connectorHealth,
      valueSuffix: "%",
      subtitle: `${platformStatus.registryConnectorCount} whitelisted on registry`,
      format: "percent",
      icon: CheckmarkCircle24Regular,
      ...STAT_CARD_NEUTRAL,
    },
    {
      id: "capital-recycled",
      title: "MorDSA WETH Balance",
      value: activeDsa ? Number(activeDsa.wethBalanceFormatted) : platformWeth,
      valueSuffix: " WETH",
      subtitle: activeDsa
        ? `Spell nonce ${activeDsa.nonce} on connected account`
        : "Platform MorDSA WETH",
      format: "token",
      icon: ArrowSync24Regular,
      ...STAT_CARD_NEUTRAL,
    },
  ];
}

export type LiveTreasuryChartPoint = {
  month: string;
  balance: number;
  fees: number;
  recycled: number;
};

export function buildLiveTreasuryChartData(
  activeDsa: DsaAccountSummary | null,
  platformStatus: PlatformStatusResponse
): LiveTreasuryChartPoint[] {
  const dsaEth = getDsaEthBalance(activeDsa);
  const treasuryWeth = Number(platformStatus.treasuryWethBalanceFormatted);
  const platformWeth = Number(platformStatus.platformWethBalanceFormatted);

  const historical = treasuryBalanceTrend.slice(0, -1).map((row) => ({
    month: row.month,
    balance: row.balance / 1000,
    fees: row.fees / 1000,
    recycled: row.recycled / 1000,
  }));

  return [
    ...historical,
    {
      month: "Live",
      balance: dsaEth + treasuryWeth,
      fees: treasuryWeth,
      recycled: dsaEth + platformWeth,
    },
  ];
}

export function buildLiveTreasuryLedger(
  activeDsa: DsaAccountSummary | null,
  platformStatus: PlatformStatusResponse,
  connectedAddress?: string
): TreasuryLedgerRow[] {
  const rows: TreasuryLedgerRow[] = [];

  if (activeDsa) {
    rows.push(
      {
        id: "live-dsa-eth",
        timestamp: "Live sync",
        type: "Fee Inflow",
        source: "MorDSA",
        destination: truncateAddress(activeDsa.address),
        amountUsd: Number(activeDsa.ethBalanceFormatted),
        amountLabel: `${Number(activeDsa.ethBalanceFormatted).toFixed(4)} ETH`,
        status: "Settled",
      },
      {
        id: "live-dsa-weth",
        timestamp: "Live sync",
        type: "Recycling",
        source: truncateAddress(activeDsa.address),
        destination: "WETH Reserve",
        amountUsd: Number(activeDsa.wethBalanceFormatted),
        amountLabel: `${Number(activeDsa.wethBalanceFormatted).toFixed(4)} WETH`,
        status: "Settled",
      },
      {
        id: "live-dsa-nonce",
        timestamp: "Live sync",
        type: "Distribution",
        source: "Spell Registry",
        destination: truncateAddress(activeDsa.registry),
        amountUsd: Number(activeDsa.nonce),
        amountLabel: `Nonce ${activeDsa.nonce}`,
        status: "Settled",
      }
    );
  }

  rows.push(
    {
      id: "live-treasury-weth",
      timestamp: "Live sync",
      type: "Fee Inflow",
      source: "MorTreasuryBalance",
      destination: truncateAddress(platformStatus.treasuryWallet),
      amountUsd: Number(platformStatus.treasuryWethBalanceFormatted),
      amountLabel: `${Number(platformStatus.treasuryWethBalanceFormatted).toFixed(4)} WETH`,
      status: "Settled",
    },
    {
      id: "live-platform-eth",
      timestamp: "Live sync",
      type: "Borrowing",
      source: "Platform MorDSA",
      destination: platformStatus.platformDsa
        ? truncateAddress(platformStatus.platformDsa)
        : "Platform DSA",
      amountUsd: Number(platformStatus.platformEthBalanceFormatted),
      amountLabel: `${Number(platformStatus.platformEthBalanceFormatted).toFixed(4)} ETH`,
      status: "Settled",
    }
  );

  if (connectedAddress) {
    rows.unshift({
      id: "live-wallet",
      timestamp: "Connected",
      type: "Distribution",
      source: truncateAddress(connectedAddress),
      destination: activeDsa
        ? truncateAddress(activeDsa.address)
        : "MorDSA lookup",
      amountUsd: activeDsa ? getDsaEthBalance(activeDsa) : 0,
      amountLabel: activeDsa
        ? `${getDsaEthBalance(activeDsa).toFixed(4)} ETH total`
        : "No MorDSA for wallet",
      status: activeDsa ? "Settled" : "Processing",
    });
  }

  return rows;
}

export function buildLiveDashboardStatCards(
  activeDsa: DsaAccountSummary | null,
  platformStatus: PlatformStatusResponse,
  isPlatformOwner: boolean
): StatCardData[] {
  const dsaEth = getDsaEthBalance(activeDsa);
  const treasuryWeth = Number(platformStatus.treasuryWethBalanceFormatted);
  const enabledConnectors = platformStatus.connectors.filter((c) => c.enabled)
    .length;

  return [
    {
      id: "mor-dsa-balance",
      title: isPlatformOwner ? "Platform MorDSA Balance" : "MorDSA Balance",
      value: dsaEth,
      valueSuffix: " ETH",
      subtitle: activeDsa
        ? `Native + WETH · ${truncateAddress(activeDsa.address)}`
        : "No MorDSA linked to wallet",
      icon: Wallet24Regular,
      iconBg: "bg-[#0F292D]",
      iconColor: "text-[#00D4A0]",
      valueColor: "text-[#22C38E]",
    },
    {
      id: "treasury-weth",
      title: "Treasury WETH",
      value: treasuryWeth,
      valueSuffix: " WETH",
      subtitle: "MorTreasuryBalance contract (live)",
      icon: Globe24Regular,
      iconBg: "bg-[#231238]",
      iconColor: "text-[#8547D1]",
      valueColor: "text-[#8C47D1]",
    },
    {
      id: "registry-connectors",
      title: "Active Connectors",
      value: enabledConnectors,
      subtitle: `${platformStatus.registryConnectorCount} on core registry`,
      icon: ArrowTrending24Regular,
      iconBg: "bg-[#312515]",
      iconColor: "text-[#F69E23]",
      valueColor: "text-[#F69E23]",
    },
    {
      id: "spell-nonce",
      title: "Spell Nonce",
      value: activeDsa ? Number(activeDsa.nonce) : 0,
      subtitle: activeDsa ? "On-chain cast counter" : "Connect deployer for platform DSA",
      icon: LockClosed24Regular,
      iconBg: "bg-[#1A323E]",
      iconColor: "text-[#30ABE8]",
      valueColor: "text-[#30ABE8]",
    },
  ];
}

export function getTreasuryMetrics(
  activeDsa: DsaAccountSummary | null,
  platformStatus: PlatformStatusResponse | undefined,
  isPlatformOwner: boolean,
  isLive: boolean
): TreasuryFlowMetric[] {
  if (isLive && platformStatus) {
    return buildLiveTreasuryFlowMetrics(
      activeDsa,
      platformStatus,
      isPlatformOwner
    );
  }
  return treasuryFlowMetrics;
}

export function getTreasuryChartData(
  activeDsa: DsaAccountSummary | null,
  platformStatus: PlatformStatusResponse | undefined,
  isLive: boolean
): LiveTreasuryChartPoint[] {
  if (isLive && platformStatus) {
    return buildLiveTreasuryChartData(activeDsa, platformStatus);
  }
  return treasuryBalanceTrend.map((row) => ({
    month: row.month,
    balance: row.balance / 1000,
    fees: row.fees / 1000,
    recycled: row.recycled / 1000,
  }));
}

export function getTreasuryLedgerRows(
  activeDsa: DsaAccountSummary | null,
  platformStatus: PlatformStatusResponse | undefined,
  connectedAddress: string | undefined,
  isLive: boolean
): TreasuryLedgerRow[] {
  if (isLive && platformStatus) {
    return buildLiveTreasuryLedger(
      activeDsa,
      platformStatus,
      connectedAddress
    );
  }
  return treasuryLedgerRows;
}

export function getDashboardStatCards(
  activeDsa: DsaAccountSummary | null,
  platformStatus: PlatformStatusResponse | undefined,
  isPlatformOwner: boolean,
  isLive: boolean
): StatCardData[] | null {
  if (isLive && platformStatus) {
    return buildLiveDashboardStatCards(
      activeDsa,
      platformStatus,
      isPlatformOwner
    );
  }
  return null;
}
