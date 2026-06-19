"use client";

import { Caption1, Text } from "@fluentui/react-components";
import { CheckmarkCircle24Regular } from "@fluentui/react-icons";
import { useLiveDsaWalletData } from "@/hooks/useLiveDsaWalletData";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function LiveMorDataBanner() {
  const {
    isConnected,
    isLive,
    isLoading,
    activeDsa,
    isPlatformOwner,
    connectedAddress,
  } = useLiveDsaWalletData();

  if (!isConnected || isLoading) {
    return null;
  }

  if (!isLive) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <Caption1 className="text-muted-foreground">
          Wallet connected — loading live Mor contract data from Arbitrum…
        </Caption1>
      </div>
    );
  }

  const dsaLabel = activeDsa
    ? truncateAddress(activeDsa.address)
    : "No MorDSA found";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#22C38E]/30 bg-[#22C38E]/5 px-4 py-3">
      <CheckmarkCircle24Regular className="mt-0.5 h-5 w-5 shrink-0 text-[#22C38E]" />
      <div className="min-w-0">
        <Text weight="semibold" block>
          Live Mor contract data
        </Text>
        <Caption1 block className="mt-1 text-muted-foreground">
          {isPlatformOwner
            ? `Showing platform MorDSA for deployer ${connectedAddress ? truncateAddress(connectedAddress) : ""} · ${dsaLabel}`
            : activeDsa
              ? `Showing MorDSA ${dsaLabel} for ${connectedAddress ? truncateAddress(connectedAddress) : "connected wallet"}`
              : `Connected ${connectedAddress ? truncateAddress(connectedAddress) : ""} — treasury metrics from live contracts`}
        </Caption1>
      </div>
    </div>
  );
}
