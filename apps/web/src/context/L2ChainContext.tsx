"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  L2_EVM_CHAINS,
  type L2ChainSlug,
  getL2ChainBySlug,
} from "@/lib/l2EvmChains";

const STORAGE_KEY = "morfinance-l2-chain";

type L2ChainContextValue = {
  selectedChain: L2ChainSlug;
  setSelectedChain: (slug: L2ChainSlug) => void;
  chain: (typeof L2_EVM_CHAINS)[number];
};

const L2ChainContext = createContext<L2ChainContextValue | undefined>(undefined);

function readStoredChain(): L2ChainSlug {
  if (typeof window === "undefined") return "ethereum";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && getL2ChainBySlug(stored)) {
    return stored as L2ChainSlug;
  }

  return "ethereum";
}

export function L2ChainProvider({ children }: { children: ReactNode }) {
  const [selectedChain, setSelectedChainState] = useState<L2ChainSlug>(() =>
    readStoredChain()
  );

  const setSelectedChain = useCallback((slug: L2ChainSlug) => {
    setSelectedChainState(slug);
    localStorage.setItem(STORAGE_KEY, slug);
  }, []);

  const chain = useMemo(
    () => getL2ChainBySlug(selectedChain) ?? L2_EVM_CHAINS[0],
    [selectedChain]
  );

  const value = useMemo(
    () => ({
      selectedChain,
      setSelectedChain,
      chain,
    }),
    [selectedChain, setSelectedChain, chain]
  );

  return (
    <L2ChainContext.Provider value={value}>{children}</L2ChainContext.Provider>
  );
}

export function useL2Chain() {
  const context = useContext(L2ChainContext);
  if (!context) {
    throw new Error("useL2Chain must be used within L2ChainProvider");
  }
  return context;
}
