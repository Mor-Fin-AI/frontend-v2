import {
  createPublicClient,
  formatEther,
  formatUnits,
  getAddress,
  http,
  isAddress,
  type Address,
} from "viem";
import { arbitrum } from "viem/chains";
import {
  ARBITRUM_WETH,
  erc20Abi,
  getArbitrumRpcUrl,
  loadMorDeployments,
  morDsaAbi,
} from "../lib/contracts.js";
import {
  morModuleDefinitions,
  type MorModuleId,
  flattenDeploymentAddresses,
} from "../lib/moduleRegistry.js";

const morRegistryAbi = [
  {
    type: "function",
    name: "getConnectorCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "isConnectorEnabled",
    stateMutability: "view",
    inputs: [{ name: "connector", type: "address" }],
    outputs: [{ type: "bool" }],
  },
] as const;

const morTreasuryBalanceAbi = [
  {
    type: "function",
    name: "getTreasuryBalance",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "treasuryWallet",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;

const morGovernorAbi = [
  {
    type: "function",
    name: "proposalThreshold",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "votingDelay",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "votingPeriod",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

function getClient() {
  return createPublicClient({
    chain: arbitrum,
    transport: http(getArbitrumRpcUrl()),
  });
}

function addressFromDeployments(
  flat: Record<string, string>,
  key: string
): Address | null {
  const value = flat[key];
  if (!value || !isAddress(value)) return null;
  return getAddress(value);
}

export async function getPlatformStatus() {
  const deployments = loadMorDeployments();
  const flat = flattenDeploymentAddresses(deployments);
  const client = getClient();

  const platformDsa = addressFromDeployments(flat, "dsaProxy");
  const registry = addressFromDeployments(flat, "registry");
  const treasuryBalance = addressFromDeployments(flat, "morTreasuryBalance");
  const governor = addressFromDeployments(flat, "morGovernorTimeLocked");

  const connectorKeys = [
    "aaveConnector",
    "compoundConnector",
    "uniswapConnector",
    "sushiConnector",
    "flashloanAgg",
    "morSpellConnector",
  ] as const;

  const [
    platformEth,
    platformWeth,
    connectorCount,
    treasuryWeth,
    treasuryWallet,
    proposalThreshold,
    votingDelay,
    votingPeriod,
    connectorStatuses,
  ] = await Promise.all([
    platformDsa ? client.getBalance({ address: platformDsa }) : Promise.resolve(0n),
    platformDsa
      ? client.readContract({
          address: ARBITRUM_WETH,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [platformDsa],
        })
      : Promise.resolve(0n),
    registry
      ? client.readContract({
          address: registry,
          abi: morRegistryAbi,
          functionName: "getConnectorCount",
        })
      : Promise.resolve(0n),
    treasuryBalance
      ? client.readContract({
          address: treasuryBalance,
          abi: morTreasuryBalanceAbi,
          functionName: "getTreasuryBalance",
          args: [ARBITRUM_WETH],
        })
      : Promise.resolve(0n),
    treasuryBalance
      ? client.readContract({
          address: treasuryBalance,
          abi: morTreasuryBalanceAbi,
          functionName: "treasuryWallet",
        })
      : Promise.resolve("0x0000000000000000000000000000000000000000" as Address),
    governor
      ? client.readContract({
          address: governor,
          abi: morGovernorAbi,
          functionName: "proposalThreshold",
        })
      : Promise.resolve(0n),
    governor
      ? client.readContract({
          address: governor,
          abi: morGovernorAbi,
          functionName: "votingDelay",
        })
      : Promise.resolve(0n),
    governor
      ? client.readContract({
          address: governor,
          abi: morGovernorAbi,
          functionName: "votingPeriod",
        })
      : Promise.resolve(0n),
    registry
      ? Promise.all(
          connectorKeys.map(async (key) => {
            const connector = addressFromDeployments(flat, key);
            if (!connector) {
              return { key, address: null, enabled: false };
            }
            const enabled = await client.readContract({
              address: registry,
              abi: morRegistryAbi,
              functionName: "isConnectorEnabled",
              args: [connector],
            });
            return { key, address: connector, enabled };
          })
        )
      : Promise.resolve([]),
  ]);

  let platformOwner: Address | null = null;
  if (platformDsa) {
    platformOwner = await client.readContract({
      address: platformDsa,
      abi: morDsaAbi,
      functionName: "owner",
    });
  }

  return {
    chainId: Number(deployments.chainId),
    chain: String(deployments.chain),
    deployedAt:
      typeof deployments.deployedAt === "string"
        ? deployments.deployedAt
        : undefined,
    platformDsa,
    platformOwner,
    platformEthBalance: platformEth.toString(),
    platformEthBalanceFormatted: formatEther(platformEth),
    platformWethBalance: platformWeth.toString(),
    platformWethBalanceFormatted: formatUnits(platformWeth, 18),
    registryConnectorCount: connectorCount.toString(),
    treasuryWethBalance: treasuryWeth.toString(),
    treasuryWethBalanceFormatted: formatUnits(treasuryWeth, 18),
    treasuryWallet,
    governance: {
      proposalThreshold: proposalThreshold.toString(),
      votingDelay: votingDelay.toString(),
      votingPeriod: votingPeriod.toString(),
    },
    connectors: connectorStatuses,
  };
}

export function getModuleContractPayload(moduleId: MorModuleId) {
  const module = morModuleDefinitions.find((item) => item.id === moduleId);
  if (!module) {
    throw new Error(`Unknown module: ${moduleId}`);
  }

  const deployments = loadMorDeployments();
  const flat = flattenDeploymentAddresses(deployments);

  const contracts = module.contracts.map((contract) => ({
    ...contract,
    address: flat[contract.deploymentKey] ?? null,
  }));

  return {
    id: module.id,
    title: module.title,
    routes: module.routes,
    contracts,
  };
}
