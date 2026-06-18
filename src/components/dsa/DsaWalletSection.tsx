"use client";

import { useAccount, useBalance, useChainId } from "wagmi";
import { formatEther } from "viem";
import {
  Wallet24Regular,
  Copy24Regular,
  Open24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import AppSpinner from "@/components/ui/AppSpinner";
import ConnectWallet from "@/components/wallet/ConnectWallet";
import PanelCard, { PanelCardBody, PanelCardHeader, PanelCardTopBar, PanelCardTopIcon } from "@/components/ui/PanelCard";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getExplorerUrl(chainId: number, address: string) {
  if (chainId === 11155111) return `https://sepolia.etherscan.io/address/${address}`;
  return `https://etherscan.io/address/${address}`;
}

interface DsaWalletSectionProps {
  accountLabel: string;
}

export default function DsaWalletSection({ accountLabel }: DsaWalletSectionProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance, isLoading } = useBalance({ address });

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
  };

  if (!isConnected) {
    return (
      <PanelCard className="h-full">
        <PanelCardTopBar>
          <PanelCardTopIcon>
            <Wallet24Regular className="h-5 w-5 text-[#8C47D1]" />
          </PanelCardTopIcon>
        </PanelCardTopBar>
        <PanelCardHeader
          title="Connect Your Wallet"
          description={`Link your wallet to view ${accountLabel} balances and manage transactions.`}
        />
        <PanelCardBody className="flex-1">
          <div className="flex h-full flex-col justify-between gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-start gap-2 text-xs text-amber-600 dark:text-[#F69E23]">
              <Warning24Regular className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Wallet connection is required to access live DSA account data.</span>
            </div>
            <ConnectWallet compact className="w-full shrink-0 sm:w-auto" />
          </div>
        </PanelCardBody>
      </PanelCard>
    );
  }

  const balanceLabel = balance
    ? `${Number(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
    : "—";

  const balanceDescription = isLoading ? (
    <AppSpinner size="extra-tiny" label="Loading balance" />
  ) : (
    balanceLabel
  );

  return (
    <PanelCard className="h-full" aria-busy={isLoading}>
      <PanelCardTopBar>
        <PanelCardTopIcon>
          <Wallet24Regular className="h-5 w-5 text-[#22C38E]" />
        </PanelCardTopIcon>
      </PanelCardTopBar>
      <PanelCardHeader
        title={truncateAddress(address!)}
        description={balanceDescription}
        action={
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={copyAddress}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Copy address"
            >
              <Copy24Regular className="h-4 w-4" />
            </button>
            <a
              href={getExplorerUrl(chainId, address!)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="View on explorer"
            >
              <Open24Regular className="h-4 w-4" />
            </a>
            <ConnectWallet compact />
          </div>
        }
      />
      <PanelCardBody className="flex-1">{null}</PanelCardBody>
    </PanelCard>
  );
}
