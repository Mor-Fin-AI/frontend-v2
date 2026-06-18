"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import AppSpinner from "@/components/ui/AppSpinner";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";
import clsx from "clsx";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type ConnectWalletProps = {
  compact?: boolean;
  className?: string;
};

export default function ConnectWallet({ compact = false, className }: ConnectWalletProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          return (
            <div
              className={clsx(
                "flex items-center justify-center",
                compact ? "min-h-9 min-w-[8.5rem]" : "min-h-9 min-w-[9.5rem]",
                className
              )}
            >
              <AppSpinner size="tiny" label="Loading wallet" />
            </div>
          );
        }

        return (
          <div className={clsx("max-w-full", className)}>
            {!connected ? (
              <ConnectWalletButton
                onClick={openConnectModal}
                compact={compact}
                aria-label="Connect wallet"
              >
                Connect Wallet
              </ConnectWalletButton>
            ) : (
              <ConnectWalletButton
                onClick={openAccountModal}
                compact={compact}
                mono
                aria-label="Open wallet account"
              >
                {truncateAddress(account.address)}
              </ConnectWalletButton>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
