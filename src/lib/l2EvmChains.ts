/** Major EVM L2 networks monitored across treasury and arbitrage flows. */
export const L2_EVM_CHAINS = [
  { slug: "ethereum", name: "Ethereum", chainId: 1 },
  { slug: "arbitrum", name: "Arbitrum One", chainId: 42161 },
  { slug: "optimism", name: "Optimism", chainId: 10 },
  { slug: "base", name: "Base", chainId: 8453 },
  { slug: "polygon", name: "Polygon", chainId: 137 },
  { slug: "zksync", name: "zkSync Era", chainId: 324 },
  { slug: "linea", name: "Linea", chainId: 59144 },
  { slug: "scroll", name: "Scroll", chainId: 534352 },
  { slug: "blast", name: "Blast", chainId: 81457 },
  { slug: "mantle", name: "Mantle", chainId: 5000 },
  { slug: "mode", name: "Mode", chainId: 34443 },
  { slug: "unichain", name: "Unichain", chainId: 130 },
  { slug: "bob", name: "BOB", chainId: 60808 },
  { slug: "lisk", name: "Lisk", chainId: 1135 },
  { slug: "taiko", name: "Taiko", chainId: 167000 },
  { slug: "metis", name: "Metis", chainId: 1088 },
  { slug: "boba", name: "Boba", chainId: 288 },
  { slug: "polygon-zkevm", name: "Polygon zkEVM", chainId: 1101 },
] as const;

export type L2ChainSlug = (typeof L2_EVM_CHAINS)[number]["slug"];

export function getL2ChainBySlug(slug: string) {
  return L2_EVM_CHAINS.find((chain) => chain.slug === slug);
}

export function getL2ChainByChainId(chainId: number) {
  return L2_EVM_CHAINS.find((chain) => chain.chainId === chainId);
}
