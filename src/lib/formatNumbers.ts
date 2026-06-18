function trimTrailingZeros(value: string): string {
  return value.replace(/\.?0+$/, "");
}

/** Compact USD display: $2.85M, $186.4K, etc. */
export function formatCompactCurrency(
  value: number,
  prefix = "$"
): string {
  const abs = Math.abs(value);

  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    const digits = millions >= 100 ? 0 : millions >= 10 ? 1 : 2;
    return `${prefix}${trimTrailingZeros(millions.toFixed(digits))}M`;
  }

  if (abs >= 1_000) {
    const thousands = abs / 1_000;
    const digits = thousands >= 100 ? 0 : 1;
    return `${prefix}${trimTrailingZeros(thousands.toFixed(digits))}K`;
  }

  return `${prefix}${Math.round(abs).toLocaleString()}`;
}

export function getCompactCurrencyCountUpTarget(value: number): {
  to: number;
  prefix: string;
  suffix: string;
  decimals: number;
} {
  const abs = Math.abs(value);

  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    const decimals = millions >= 100 ? 0 : millions >= 10 ? 1 : 2;
    return { to: millions, prefix: "$", suffix: "M", decimals };
  }

  if (abs >= 1_000) {
    const thousands = abs / 1_000;
    const decimals = thousands >= 100 ? 0 : 1;
    return { to: thousands, prefix: "$", suffix: "K", decimals };
  }

  return { to: abs, prefix: "$", suffix: "", decimals: 0 };
}
