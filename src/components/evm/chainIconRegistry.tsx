import type { ComponentType } from "react";
import type { IconComponentProps } from "@web3icons/react";
import NetworkArbitrumOne from "@web3icons/react/icons/networks/NetworkArbitrumOne";
import NetworkBase from "@web3icons/react/icons/networks/NetworkBase";
import NetworkBlast from "@web3icons/react/icons/networks/NetworkBlast";
import NetworkBob from "@web3icons/react/icons/networks/NetworkBob";
import NetworkBoba from "@web3icons/react/icons/networks/NetworkBoba";
import NetworkEthereum from "@web3icons/react/icons/networks/NetworkEthereum";
import NetworkLinea from "@web3icons/react/icons/networks/NetworkLinea";
import NetworkLisk from "@web3icons/react/icons/networks/NetworkLisk";
import NetworkMantle from "@web3icons/react/icons/networks/NetworkMantle";
import NetworkMetisAndromeda from "@web3icons/react/icons/networks/NetworkMetisAndromeda";
import NetworkMode from "@web3icons/react/icons/networks/NetworkMode";
import NetworkOptimism from "@web3icons/react/icons/networks/NetworkOptimism";
import NetworkPolygon from "@web3icons/react/icons/networks/NetworkPolygon";
import NetworkPolygonZkevm from "@web3icons/react/icons/networks/NetworkPolygonZkevm";
import NetworkScroll from "@web3icons/react/icons/networks/NetworkScroll";
import NetworkTaiko from "@web3icons/react/icons/networks/NetworkTaiko";
import NetworkUnichain from "@web3icons/react/icons/networks/NetworkUnichain";
import NetworkZksync from "@web3icons/react/icons/networks/NetworkZksync";
import type { L2ChainSlug } from "@/lib/l2EvmChains";

export type Web3IconComponent = ComponentType<IconComponentProps>;

export const CHAIN_ICON_REGISTRY: Record<L2ChainSlug, Web3IconComponent> = {
  ethereum: NetworkEthereum,
  arbitrum: NetworkArbitrumOne,
  optimism: NetworkOptimism,
  base: NetworkBase,
  polygon: NetworkPolygon,
  zksync: NetworkZksync,
  linea: NetworkLinea,
  scroll: NetworkScroll,
  blast: NetworkBlast,
  mantle: NetworkMantle,
  mode: NetworkMode,
  unichain: NetworkUnichain,
  bob: NetworkBob,
  lisk: NetworkLisk,
  taiko: NetworkTaiko,
  metis: NetworkMetisAndromeda,
  boba: NetworkBoba,
  "polygon-zkevm": NetworkPolygonZkevm,
};
