"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ReactNode, useState } from "react";
import { wagmiConfig, wagmiInitialState } from "@/lib/wagmi";
import RainbowKitGate from "@/providers/RainbowKitGate";

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig} initialState={wagmiInitialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitGate>{children}</RainbowKitGate>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
