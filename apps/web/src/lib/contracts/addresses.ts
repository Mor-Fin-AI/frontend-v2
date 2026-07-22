import type { Address } from "viem";
import deployments from "./deployments.arbitrum.json";

export type MorDeployments = typeof deployments;

export const MOR_CHAIN_ID = deployments.chainId as 42161;
export const MOR_CHAIN_SLUG = deployments.chain as "arbitrum";

/** Arbitrum WETH9 */
export const ARBITRUM_WETH: Address =
  "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

export const morContractAddresses = {
  dsaProxy: deployments.dsaProxy as Address,
  morDsaImpl: deployments.morDsaImpl as Address,
  registry: deployments.registry as Address,
  factory: deployments.factory as Address,
  morRegistry: deployments.morRegistry as Address,
  morDsaFactory: deployments.morDSAFactory as Address,
  morGovernor: deployments.morGovernorTimeLocked as Address,
  morGovernanceHub: deployments.morGovernanceHub as Address,
  morTreasuryFlowPanel: deployments.morTreasuryFlowPanel as Address,
  morTreasuryBalance: deployments.morTreasuryBalance as Address,
  morSpellRegistry: deployments.morSpellRegistry as Address,
  positionResolver: deployments.positionResolver as Address,
  refinanceResolver: deployments.refinanceResolver as Address,
  flashloanAgg: deployments.flashloanAgg as Address,
  wethConnector: deployments.wethConnector as Address,
} as const;

export const morConnectorAddresses = {
  aave: deployments.aaveConnector as Address,
  compound: deployments.compoundConnector as Address,
  uniswap: deployments.uniswapConnector as Address,
  sushiswap: deployments.sushiConnector as Address,
  camelotV2: deployments.camelotV2Connector as Address,
  camelotV3: deployments.camelotV3Connector as Address,
  pancakeV2: deployments.pancakeSwapV2Connector as Address,
  pancakeV3: deployments.pancakeSwapV3Connector as Address,
  ramsesV3: deployments.ramsesV3Connector as Address,
  zyberSwap: deployments.zyberSwapConnector as Address,
  arbSwap: deployments.arbSwapConnector as Address,
  deltaSwap: deployments.deltaSwapConnector as Address,
  morSpell: deployments.morSpellConnector as Address,
} as const;

export const morSpellAddresses = {
  treasuryFlow: deployments.morTreasuryFlowSpell as Address,
  education: deployments.morEducationProgramSpell as Address,
  infrastructure: deployments.morInfrastructureDeploymentSpell as Address,
  supervisionCert: deployments.morSupervisionCertSpell as Address,
  credentialNft: deployments.morCredentialNFTSpell as Address,
} as const;

export function getDefaultRpcUrl() {
  return (
    import.meta.env.VITE_ARBITRUM_RPC_URL ??
    "https://arb1.arbitrum.io/rpc"
  );
}
