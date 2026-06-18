import type { ComponentType } from "react";
import type { IconComponentProps } from "@web3icons/react";
import ExchangeBalancer from "@web3icons/react/icons/exchanges/ExchangeBalancer";
import ExchangePancakeSwap from "@web3icons/react/icons/exchanges/ExchangePancakeSwap";
import ExchangeSushiswap from "@web3icons/react/icons/exchanges/ExchangeSushiswap";
import ExchangeUniswap from "@web3icons/react/icons/exchanges/ExchangeUniswap";
import type { DexSlug } from "@/lib/dexRegistry";
import CurveExchangeIcon from "./icons/CurveExchangeIcon";

export type DexIconComponent = ComponentType<
  IconComponentProps & { size?: number | string; className?: string }
>;

export const DEX_ICON_REGISTRY: Record<DexSlug, DexIconComponent> = {
  uniswap: ExchangeUniswap,
  curve: CurveExchangeIcon,
  sushiswap: ExchangeSushiswap,
  balancer: ExchangeBalancer,
  pancakeswap: ExchangePancakeSwap,
};
