"use client";

import {
  Wallet24Regular,
  ShieldCheckmark24Regular,
  ArrowSwap24Regular,
  LockClosed24Regular,
} from "@fluentui/react-icons";
import type { DsaAccountSummary } from "@/lib/dsaApi";
import { getCombinedEthBalance } from "@/lib/dsaApi";
import type { DsaAccountInfo, DsaStat } from "@/components/dsa/data";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function buildLiveDsaStats(
  account: DsaAccountSummary | null,
  hasAccount: boolean
): DsaStat[] {
  const combinedEth = account ? getCombinedEthBalance(account) : 0;

  return [
    {
      title: "DSA Balance",
      value: hasAccount ? combinedEth.toFixed(4) : "—",
      suffix: hasAccount ? " ETH" : undefined,
      subtitle: hasAccount
        ? "Native + WETH on Arbitrum MorDSA"
        : "Create or link a MorDSA account",
      icon: Wallet24Regular,
      iconBg: "bg-[#4ADE801A]",
      iconColor: "text-[#22C38E]",
      valueColor: "text-[#22C38E]",
      subtitleColor: "text-primary",
      variant: "success",
    },
    {
      title: "Spell Nonce",
      value: account?.nonce ?? "—",
      subtitle: "On-chain cast counter",
      icon: LockClosed24Regular,
      iconBg: "bg-[#8547D11A]",
      iconColor: "text-[#8C47D1]",
      valueColor: "text-[#8C47D1]",
      subtitleColor: "text-primary",
      variant: "default",
    },
    {
      title: "WETH Balance",
      value: account ? Number(account.wethBalanceFormatted).toFixed(4) : "—",
      suffix: account ? " WETH" : undefined,
      subtitle: "Wrapped ETH held in DSA",
      icon: ArrowSwap24Regular,
      iconBg: "bg-[#30ABE81A]",
      iconColor: "text-[#30ABE8]",
      valueColor: "text-[#30ABE8]",
      subtitleColor: "text-primary",
      variant: "default",
    },
    {
      title: "Account Status",
      value: hasAccount ? "Linked" : "Not found",
      subtitle: hasAccount ? "MorDSA on Arbitrum One" : "No factory account for wallet",
      icon: ShieldCheckmark24Regular,
      iconBg: "bg-[#F69E231A]",
      iconColor: "text-[#F69E23]",
      valueColor: "text-[#F69E23]",
      subtitleColor: "text-primary",
      variant: hasAccount ? "success" : "warning",
    },
  ];
}

export function buildLiveDsaAccountInfo(
  account: DsaAccountSummary | null,
  owner?: string
): DsaAccountInfo {
  if (!account) {
    return {
      accountId: "—",
      accountType: "MorDSA Smart Account",
      status: "Pending",
      linkedWallet: owner ? truncateAddress(owner) : "Not connected",
      createdAt: "—",
      lastActivity: "—",
    };
  }

  return {
    accountId: truncateAddress(account.address),
    accountType:
      account.source === "platform"
        ? "Platform MorDSA (Arbitrum)"
        : "MorDSA Smart Account (Arbitrum)",
    status: "Active",
    linkedWallet: truncateAddress(account.owner),
    createdAt: "On-chain proxy",
    lastActivity: "Live RPC sync",
  };
}
