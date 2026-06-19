import {
  createPublicClient,
  formatEther,
  getAddress,
  http,
  isAddress,
  type Address,
} from "viem";
import { arbitrum } from "viem/chains";
import {
  ARBITRUM_WETH,
  getArbitrumRpcUrl,
  loadMorDeployments,
} from "../lib/contracts.js";
import { getDsaAccountsForOwner } from "./dsaService.js";
import {
  dischargeStatusLabel,
  mapDischargeToLoanStatus,
  morTreasuryFlowPanelAbi,
} from "../lib/treasuryFlowPanelAbi.js";

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

function getClient() {
  return createPublicClient({
    chain: arbitrum,
    transport: http(getArbitrumRpcUrl()),
  });
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatEthAmount(value: bigint) {
  return Number(formatEther(value));
}

function computeRepaymentStatus(
  percent: number,
  activeDischarges: number
): "On Track" | "At Risk" | "Complete" {
  if (percent >= 100 || activeDischarges === 0) return "Complete";
  if (percent < 40) return "At Risk";
  return "On Track";
}

function computeLtv(borrowed: bigint, collateral: bigint) {
  if (collateral === 0n) return 0;
  return Math.round(Number((borrowed * 10000n) / collateral) / 100);
}

function computeRepaymentPercent(returned: bigint, deployed: bigint) {
  if (deployed === 0n) return returned > 0n ? 100 : 0;
  return Math.min(100, Math.round(Number((returned * 100n) / deployed)));
}

function formatDischargeDate(unixSeconds: bigint | number) {
  const sec = Number(unixSeconds);
  if (!sec) return "—";
  return new Date(sec * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const GANTT_COLORS = ["#30ABE8", "#8764B8", "#F69E23", "#22C38E", "#8547D1"];

export async function getLendingDischargeData(
  walletAddress?: string
): Promise<LendingDischargeResponse> {
  const deployments = loadMorDeployments();
  const client = getClient();

  const flowPanel = getAddress(String(deployments.morTreasuryFlowPanel));
  const platformDsaRaw = deployments.dsaProxy;
  const platformDsa =
    typeof platformDsaRaw === "string" && isAddress(platformDsaRaw)
      ? getAddress(platformDsaRaw)
      : null;

  const connectorKeys = ["aaveConnector", "compoundConnector"] as const;
  const registry = getAddress(String(deployments.registry));

  const morRegistryAbi = [
    {
      type: "function",
      name: "isConnectorEnabled",
      stateMutability: "view",
      inputs: [{ name: "connector", type: "address" }],
      outputs: [{ type: "bool" }],
    },
  ] as const;

  const [globalPanel, wethPanel, dischargeEvents, connectorStatuses] =
    await Promise.all([
      client.readContract({
        address: flowPanel,
        abi: morTreasuryFlowPanelAbi,
        functionName: "getGlobalFlowPanel",
      }),
      client.readContract({
        address: flowPanel,
        abi: morTreasuryFlowPanelAbi,
        functionName: "getTokenFlowPanel",
        args: [ARBITRUM_WETH],
      }),
      client.getContractEvents({
        address: flowPanel,
        abi: morTreasuryFlowPanelAbi,
        eventName: "DischargeStatusUpdated",
        fromBlock: 350_000_000n,
        toBlock: "latest",
      }),
      Promise.all(
        connectorKeys.map(async (key) => {
          const addressRaw = deployments[key];
          if (typeof addressRaw !== "string" || !isAddress(addressRaw)) {
            return { key, address: null, enabled: false };
          }
          const address = getAddress(addressRaw);
          const enabled = await client.readContract({
            address: registry,
            abi: morRegistryAbi,
            functionName: "isConnectorEnabled",
            args: [address],
          });
          return { key, address, enabled };
        })
      ),
    ]);

  const uniqueDischargeIds = [
    ...new Set(dischargeEvents.map((event) => event.args.dischargeId!)),
  ];

  const dischargeRecords = await Promise.all(
    uniqueDischargeIds.map(async (dischargeId) => {
      const record = await client.readContract({
        address: flowPanel,
        abi: morTreasuryFlowPanelAbi,
        functionName: "getDischarge",
        args: [dischargeId],
      });
      return record;
    })
  );

  const collateral = globalPanel.treasuryBalanceSum;
  const borrowed = globalPanel.borrowCapitalActiveSum;
  const recycled = globalPanel.netCapitalRecycledSum;
  const pending = Number(globalPanel.dischargesPending);
  const active = Number(globalPanel.dischargesActive);
  const completed = Number(globalPanel.dischargesCompleted);
  const failed = Number(globalPanel.dischargesFailed);
  const lastUpdatedAt = Number(globalPanel.lastUpdatedAt) || null;

  const debtTotal = borrowed + recycled;
  const debtRepaymentPercent =
    debtTotal > 0n
      ? Math.min(100, Math.round(Number((recycled * 100n) / debtTotal)))
      : completed > 0
        ? 100
        : 0;

  const cyclesTotal = pending + active + completed + failed;
  const cycleCompletePercent =
    cyclesTotal > 0 ? Math.round((completed / cyclesTotal) * 100) : 0;

  const metrics: LendingDischargeMetricsResponse = {
    collateralEth: formatEther(collateral),
    borrowedEth: formatEther(borrowed),
    loanToValueRatio: computeLtv(borrowed, collateral),
    dischargeTimerActive: active > 0,
    dischargeDaysRemaining: active,
    dischargeHoursRemaining: pending,
    debtRepaymentPercent,
    debtRepaymentStatus: computeRepaymentStatus(debtRepaymentPercent, active),
    debtRepaidEth: formatEther(recycled),
    debtTotalEth: formatEther(debtTotal > 0n ? debtTotal : borrowed),
    borrowedCycleCompletePercent: cycleCompletePercent,
    borrowedCyclesCompleted: completed,
    borrowedCyclesTotal: cyclesTotal,
    dischargesPending: pending,
    dischargesActive: active,
    dischargesFailed: failed,
    lastUpdatedAt,
    isLive: true,
  };

  const loanPositions: LendingLoanPositionResponse[] = await Promise.all(
    dischargeRecords.map(async (record, index) => {
      const dsa = getAddress(record.dsa);
      const [dsaEth, dsaBorrow] = await Promise.all([
        client.getBalance({ address: dsa }),
        client.readContract({
          address: flowPanel,
          abi: morTreasuryFlowPanelAbi,
          functionName: "dsaBorrowActive",
          args: [dsa, ARBITRUM_WETH],
        }),
      ]);

      const collateralEth = formatEthAmount(dsaEth);
      const borrowedEth = formatEthAmount(
        record.capitalDeployed > 0n ? record.capitalDeployed : dsaBorrow
      );
      const repaymentPercent = computeRepaymentPercent(
        record.capitalReturned,
        record.capitalDeployed
      );

      return {
        id: record.dischargeId,
        borrower: truncateAddress(dsa),
        dsaAddress: dsa,
        collateralEth: collateralEth.toFixed(4),
        borrowedEth: borrowedEth.toFixed(4),
        ltvPercent: computeLtv(
          record.capitalDeployed > 0n ? record.capitalDeployed : dsaBorrow,
          dsaEth
        ),
        repaymentPercent,
        dischargeDate: formatDischargeDate(
          record.completedAt > 0n ? record.completedAt : record.startedAt
        ),
        status: mapDischargeToLoanStatus(Number(record.status)),
        dischargeId: record.dischargeId,
        amountLabel: `${borrowedEth.toFixed(4)} WETH borrowed`,
      };
    })
  );

  if (platformDsa && !loanPositions.some((p) => p.dsaAddress === platformDsa)) {
    const [platformEth, platformBorrow] = await Promise.all([
      client.getBalance({ address: platformDsa }),
      client.readContract({
        address: flowPanel,
        abi: morTreasuryFlowPanelAbi,
        functionName: "dsaBorrowActive",
        args: [platformDsa, ARBITRUM_WETH],
      }),
    ]);

    if (platformEth > 0n || platformBorrow > 0n) {
      loanPositions.unshift({
        id: "platform-dsa",
        borrower: "Platform MorDSA",
        dsaAddress: platformDsa,
        collateralEth: formatEthAmount(platformEth).toFixed(4),
        borrowedEth: formatEthAmount(platformBorrow).toFixed(4),
        ltvPercent: computeLtv(platformBorrow, platformEth),
        repaymentPercent: computeRepaymentPercent(
          wethPanel.netCapitalRecycled,
          platformBorrow > 0n ? platformBorrow : wethPanel.borrowCapitalActive
        ),
        dischargeDate: lastUpdatedAt
          ? formatDischargeDate(lastUpdatedAt)
          : "Live sync",
        status: active > 0 ? "Discharging" : "Active",
        dischargeId: "platform",
        amountLabel: `${formatEthAmount(platformBorrow).toFixed(4)} WETH active borrow`,
      });
    }
  }

  if (walletAddress && isAddress(walletAddress)) {
    try {
      const owner = getAddress(walletAddress);
      const dsaResponse = await getDsaAccountsForOwner(owner);
      for (const account of dsaResponse.accounts) {
        if (loanPositions.some((p) => p.dsaAddress === account.address)) {
          continue;
        }
        const [dsaEth, dsaBorrow] = await Promise.all([
          client.getBalance({ address: account.address }),
          client.readContract({
            address: flowPanel,
            abi: morTreasuryFlowPanelAbi,
            functionName: "dsaBorrowActive",
            args: [account.address, ARBITRUM_WETH],
          }),
        ]);
        if (dsaEth === 0n && dsaBorrow === 0n) continue;

        loanPositions.push({
          id: account.address,
          borrower: truncateAddress(owner),
          dsaAddress: account.address,
          collateralEth: formatEthAmount(dsaEth).toFixed(4),
          borrowedEth: formatEthAmount(dsaBorrow).toFixed(4),
          ltvPercent: computeLtv(dsaBorrow, dsaEth),
          repaymentPercent: 0,
          dischargeDate: "Connected wallet",
          status: dsaBorrow > 0n ? "Active" : "Repaid",
          dischargeId: account.address,
          amountLabel: `${formatEthAmount(dsaBorrow).toFixed(4)} WETH · your MorDSA`,
        });
      }
    } catch {
      // ignore invalid wallet lookup failures
    }
  }

  loanPositions.sort(
    (a, b) => Number(b.borrowedEth) - Number(a.borrowedEth)
  );

  const ganttTasks: LendingGanttTaskResponse[] = dischargeRecords
    .filter((record) => Number(record.startedAt) > 0)
    .slice(0, 6)
    .map((record, index) => {
      const start = new Date(Number(record.startedAt) * 1000);
      const end =
        Number(record.completedAt) > 0
          ? new Date(Number(record.completedAt) * 1000)
          : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

      return {
        phase: `Discharge ${truncateAddress(record.dischargeId)} · ${dischargeStatusLabel(Number(record.status))}`,
        start: start.toISOString(),
        end: end.toISOString(),
        color: GANTT_COLORS[index % GANTT_COLORS.length],
      };
    });

  if (ganttTasks.length === 0 && lastUpdatedAt) {
    const syncDate = new Date(lastUpdatedAt * 1000);
    ganttTasks.push({
      phase: "Treasury flow panel sync",
      start: syncDate.toISOString(),
      end: new Date(syncDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      color: GANTT_COLORS[0],
    });
  }

  return {
    chainId: Number(deployments.chainId),
    chain: String(deployments.chain),
    treasuryFlowPanel: flowPanel,
    platformDsa,
    metrics,
    loanPositions,
    ganttTasks,
    connectors: connectorStatuses,
  };
}
