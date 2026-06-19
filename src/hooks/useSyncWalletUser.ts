"use client";

import { useEffect } from "react";
import { useAccount, useEnsName } from "wagmi";
import { useUser } from "@/context/UserContext";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function useSyncWalletUser() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address, query: { enabled: !!address } });
  const { setUser } = useUser();

  useEffect(() => {
    if (!isConnected || !address) {
      setUser((prev) =>
        prev.isWalletConnected
          ? {
              ...prev,
              isWalletConnected: false,
              fullAddress: undefined,
            }
          : prev
      );
      return;
    }

    setUser((prev) => ({
      ...prev,
      name: ensName ?? truncateAddress(address),
      address: truncateAddress(address),
      fullAddress: address,
      isWalletConnected: true,
    }));
  }, [address, ensName, isConnected, setUser]);
}
