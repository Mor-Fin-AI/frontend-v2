import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import type { State } from "@wagmi/core";
import { http } from "wagmi";
import { arbitrum, mainnet, sepolia } from "wagmi/chains";

/** Mor contracts deploy on Arbitrum — keep this chain first/default. */
export const appChains = [arbitrum, mainnet, sepolia] as const;

const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() ?? "";

if (!walletConnectProjectId && import.meta.env.DEV) {
  console.warn(
    "[wagmi] VITE_WALLETCONNECT_PROJECT_ID is not set. MetaMask still works; WalletConnect/mobile wallets need a project id from https://cloud.walletconnect.com"
  );
}

const arbitrumRpc =
  import.meta.env.VITE_ARBITRUM_RPC_URL?.trim() ??
  "https://arb1.arbitrum.io/rpc";

export const wagmiConfig = getDefaultConfig({
  appName: "Mor Finance",
  projectId: walletConnectProjectId || "00000000000000000000000000000000",
  chains: [...appChains],
  transports: {
    [arbitrum.id]: http(arbitrumRpc),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
});

export const defaultChain = arbitrum;

/** Ensures RainbowKit has a public client on first paint (avoids uid crash). */
export const wagmiInitialState: State = {
  chainId: defaultChain.id,
  connections: new Map(),
  current: null,
  status: "disconnected",
};
