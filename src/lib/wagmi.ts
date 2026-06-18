import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  blast,
  linea,
  mainnet,
  mantle,
  optimism,
  polygon,
  scroll,
  sepolia,
  zkSync,
} from "wagmi/chains";

/** L2 + L1 chains surfaced in the wallet connector and chain icon registry. */
export const appChains = [
  mainnet,
  sepolia,
  arbitrum,
  optimism,
  base,
  polygon,
  zkSync,
  linea,
  scroll,
  blast,
  mantle,
] as const;

export const wagmiConfig = getDefaultConfig({
  appName: "Mor Finance",
  projectId:
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ??
    "00000000000000000000000000000000",
  chains: [...appChains],
  ssr: false,
});
