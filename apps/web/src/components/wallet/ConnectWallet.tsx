"use client";

import { lazy, Suspense } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import AppSpinner from "@/components/ui/AppSpinner";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";
import { useRainbowKitReady } from "@/providers/RainbowKitGate";
import clsx from "clsx";

const ConnectWalletRainbow = lazy(
  () => import("@/components/wallet/ConnectWalletRainbow")
);

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type ConnectWalletProps = {
  compact?: boolean;
  className?: string;
};

function ConnectWalletWagmi({ compact = false, className }: ConnectWalletProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const injected =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.type === "injected") ??
    connectors[0];

  if (isConnected && address) {
    return (
      <div className={clsx("max-w-full", className)}>
        <ConnectWalletButton
          onClick={() => disconnect()}
          compact={compact}
          mono
          aria-label="Disconnect wallet"
        >
          {truncateAddress(address)}
        </ConnectWalletButton>
      </div>
    );
  }

  return (
    <div className={clsx("max-w-full", className)}>
      <ConnectWalletButton
        onClick={() => {
          if (injected) {
            connect({ connector: injected });
          }
        }}
        compact={compact}
        loading={isPending}
        loadingLabel="Connecting wallet"
        aria-label="Connect wallet"
      >
        Connect Wallet
      </ConnectWalletButton>
    </div>
  );
}

export default function ConnectWallet(props: ConnectWalletProps) {
  const rainbowReady = useRainbowKitReady();

  if (!rainbowReady) {
    return <ConnectWalletWagmi {...props} />;
  }

  return (
    <Suspense
      fallback={
        <div
          className={clsx(
            "flex items-center justify-center",
            props.compact ? "min-h-9 min-w-[8.5rem]" : "min-h-9 min-w-[9.5rem]",
            props.className
          )}
        >
          <AppSpinner size="tiny" label="Loading wallet" />
        </div>
      }
    >
      <ConnectWalletRainbow {...props} />
    </Suspense>
  );
}
