/** DEX protocols referenced in arbitrage routes and fee routing. */
export const DEX_PROTOCOLS = [
  { slug: "uniswap", name: "Uniswap", aliases: ["uni"] },
  { slug: "curve", name: "Curve", aliases: [] },
  { slug: "sushiswap", name: "SushiSwap", aliases: ["sushi"] },
  { slug: "balancer", name: "Balancer", aliases: [] },
  { slug: "pancakeswap", name: "PancakeSwap", aliases: ["pancake"] },
] as const;

export type DexSlug = (typeof DEX_PROTOCOLS)[number]["slug"];

export function normalizeDexSlug(label: string): DexSlug | null {
  const normalized = label.trim().toLowerCase();

  for (const dex of DEX_PROTOCOLS) {
    if (dex.slug === normalized || dex.name.toLowerCase() === normalized) {
      return dex.slug;
    }
    if (dex.aliases.some((alias) => alias === normalized)) {
      return dex.slug;
    }
  }

  return null;
}

/** Parse routes like `Uniswap → Curve` into DEX slugs. */
export function parseDexRoute(route: string): DexSlug[] {
  return route
    .split(/\s*(?:→|->)\s*/u)
    .map((part) => normalizeDexSlug(part))
    .filter((slug): slug is DexSlug => slug !== null);
}

export function getDexBySlug(slug: DexSlug) {
  return DEX_PROTOCOLS.find((dex) => dex.slug === slug);
}
