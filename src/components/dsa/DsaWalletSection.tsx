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
import { getArbitrumExplorerAddressUrl } from "@/lib/dsaApi";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getExplorerUrl(chainId: number, address: string) {
  if (chainId === 42161) return getArbitrumExplorerAddressUrl(address);
  if (chainId === 11155111) return `https://sepolia.etherscan.io/address/${address}`;
  return `https://etherscan.io/address/${address}`;
}

interface DsaWalletSectionProps {
  accountLabel: string;
  dsaAddress?: string;
  chainId?: number;
}

export default function DsaWalletSection({
  accountLabel,
  dsaAddress,
  chainId: chainIdProp,
}: DsaWalletSectionProps) {
  const { address, isConnected } = useAccount();
  const walletChainId = useChainId();
  const chainId = chainIdProp ?? walletChainId;
  const { data: balance, isLoading } = useBalance({ address });

  const copyAddress = async (value: string) => {
    await navigator.clipboard.writeText(value);
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
              <span>Wallet connection is required to access live MorDSA data on Arbitrum.</span>
            </div>
            <ConnectWallet compact className="w-full shrink-0 sm:w-auto" />
          </div>
        </PanelCardBody>
      </PanelCard>
    );
  }

  const displayAddress = dsaAddress ?? address!;
  const balanceLabel = balance
    ? `${Number(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
    : "—";

  const balanceDescription = isLoading ? (
    <AppSpinner size="extra-tiny" label="Loading balance" />
  ) : (
    <>
      Wallet: {balanceLabel}
      {dsaAddress ? (
        <span className="mt-1 block text-xs text-muted-foreground">
          MorDSA: {truncateAddress(dsaAddress)}
        </span>
      ) : null}
    </>
  );

  return (
    <PanelCard className="h-full" aria-busy={isLoading}>
      <PanelCardTopBar>
        <PanelCardTopIcon>
          <Wallet24Regular className="h-5 w-5 text-[#22C38E]" />
        </PanelCardTopIcon>
      </PanelCardTopBar>
      <PanelCardHeader
        title={truncateAddress(displayAddress)}
        description={balanceDescription}
        action={
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => void copyAddress(displayAddress)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Copy address"
            >
              <Copy24Regular className="h-4 w-4" />
            </button>
            <a
              href={getExplorerUrl(chainId, displayAddress)}
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
