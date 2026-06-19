"use client";

import { ReactNode } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { usePublicClient } from "wagmi";
import { defaultChain } from "@/lib/wagmi";

type SafeRainbowKitProviderProps = {
  children: ReactNode;
};

/**
 * RainbowKit's transaction store crashes if mounted before wagmi exposes a
 * public client. Gate the provider until Arbitrum client is ready.
 */
export default function SafeRainbowKitProvider({
  children,
}: SafeRainbowKitProviderProps) {
  const publicClient = usePublicClient({ chainId: defaultChain.id });

  if (!publicClient) {
    return <>{children}</>;
  }

  return (
    <RainbowKitProvider
      initialChain={defaultChain}
      theme={darkTheme({
        accentColor: "#8C47D1",
        accentColorForeground: "white",
        borderRadius: "medium",
      })}
    >
      {children}
    </RainbowKitProvider>
  );
}
