"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePublicClient } from "wagmi";
import { defaultChain } from "@/lib/wagmi";

type RainbowKitModule = typeof import("@rainbow-me/rainbowkit");

const RainbowKitReadyContext = createContext(false);

export function useRainbowKitReady() {
  return useContext(RainbowKitReadyContext);
}

type RainbowKitGateProps = {
  children: ReactNode;
};

/**
 * Loads RainbowKit only after wagmi exposes a public client (post-mount).
 * Avoids TransactionStoreProvider crashing on undefined provider.uid.
 */
export default function RainbowKitGate({ children }: RainbowKitGateProps) {
  const publicClient = usePublicClient({ chainId: defaultChain.id });
  const [module, setModule] = useState<RainbowKitModule | null>(null);

  useEffect(() => {
    if (!publicClient || module) return;

    void import("@rainbow-me/rainbowkit").then((loaded) => {
      void import("@rainbow-me/rainbowkit/styles.css");
      setModule(loaded);
    });
  }, [publicClient, module]);

  const ready = Boolean(publicClient && module);
  const Provider = module?.RainbowKitProvider;

  if (!ready || !Provider) {
    return (
      <RainbowKitReadyContext.Provider value={false}>
        {children}
      </RainbowKitReadyContext.Provider>
    );
  }

  return (
    <RainbowKitReadyContext.Provider value={true}>
      <Provider
        initialChain={defaultChain}
        theme={module!.darkTheme({
          accentColor: "#8C47D1",
          accentColorForeground: "white",
          borderRadius: "medium",
        })}
      >
        {children}
      </Provider>
    </RainbowKitReadyContext.Provider>
  );
}
