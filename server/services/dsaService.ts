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
  morDsaFactoryAbi,
} from "../lib/contracts.js";

export type DsaAccountSummary = {
  address: Address;
  owner: Address;
  nonce: string;
  registry: Address;
  ethBalance: string;
  ethBalanceFormatted: string;
  wethBalance: string;
  wethBalanceFormatted: string;
  source: "factory" | "platform";
};

export type DsaOwnerResponse = {
  chainId: number;
  chain: string;
  owner: Address;
  accounts: DsaAccountSummary[];
  platformDsa: Address | null;
  isPlatformOwner: boolean;
  factories: {
    core: Address;
    dao: Address;
  };
};

export type MorDeploymentsResponse = {
  chainId: number;
  chain: string;
  deployedAt?: string;
  core: Record<string, string>;
  governance: Record<string, string>;
  connectors: Record<string, string>;
  spells: Record<string, string>;
  resolvers: Record<string, string>;
};

function getPublicClient() {
  return createPublicClient({
    chain: arbitrum,
    transport: http(getArbitrumRpcUrl()),
  });
}

function asAddress(value: unknown, label: string): Address {
  if (typeof value !== "string" || !isAddress(value)) {
    throw new Error(`Invalid ${label} address in deployments manifest`);
  }
  return getAddress(value);
}

async function readDsaSummary(
  client: ReturnType<typeof getPublicClient>,
  address: Address,
  source: DsaAccountSummary["source"]
): Promise<DsaAccountSummary> {
  const [owner, nonce, registry, ethBalance, wethBalance] = await Promise.all([
    client.readContract({
      address,
      abi: morDsaAbi,
      functionName: "owner",
    }),
    client.readContract({
      address,
      abi: morDsaAbi,
      functionName: "nonce",
    }),
    client.readContract({
      address,
      abi: morDsaAbi,
      functionName: "registry",
    }),
    client.getBalance({ address }),
    client.readContract({
      address: ARBITRUM_WETH,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    }),
  ]);

  return {
    address,
    owner,
    nonce: nonce.toString(),
    registry,
    ethBalance: ethBalance.toString(),
    ethBalanceFormatted: formatEther(ethBalance),
    wethBalance: wethBalance.toString(),
    wethBalanceFormatted: formatUnits(wethBalance, 18),
    source,
  };
}

export function getMorDeploymentsPayload(): MorDeploymentsResponse {
  const d = loadMorDeployments();

  return {
    chainId: Number(d.chainId),
    chain: String(d.chain),
    deployedAt: typeof d.deployedAt === "string" ? d.deployedAt : undefined,
    core: {
      dsaProxy: String(d.dsaProxy),
      morDsaImpl: String(d.morDsaImpl),
      registry: String(d.registry),
      factory: String(d.factory),
      wethConnector: String(d.wethConnector),
      flashloanAgg: String(d.flashloanAgg),
    },
    governance: {
      morRegistry: String(d.morRegistry),
      morDsaFactory: String(d.morDSAFactory),
      morTokenGenesis: String(d.morTokenGenesis),
      morGovernor: String(d.morGovernorTimeLocked),
      morGovernanceHub: String(d.morGovernanceHub),
      morSpellRegistry: String(d.morSpellRegistry),
      morTreasuryFlowPanel: String(d.morTreasuryFlowPanel),
      morTreasuryBalance: String(d.morTreasuryBalance),
    },
    connectors: {
      aave: String(d.aaveConnector),
      compound: String(d.compoundConnector),
      uniswap: String(d.uniswapConnector),
      sushiswap: String(d.sushiConnector),
      camelotV2: String(d.camelotV2Connector),
      camelotV3: String(d.camelotV3Connector),
      pancakeV2: String(d.pancakeSwapV2Connector),
      pancakeV3: String(d.pancakeSwapV3Connector),
      ramsesV3: String(d.ramsesV3Connector),
      zyberSwap: String(d.zyberSwapConnector),
      arbSwap: String(d.arbSwapConnector),
      deltaSwap: String(d.deltaSwapConnector),
      morSpell: String(d.morSpellConnector),
    },
    spells: {
      treasuryFlow: String(d.morTreasuryFlowSpell),
      education: String(d.morEducationProgramSpell),
      infrastructure: String(d.morInfrastructureDeploymentSpell),
      supervisionCert: String(d.morSupervisionCertSpell),
      credentialNft: String(d.morCredentialNFTSpell),
    },
    resolvers: {
      position: String(d.positionResolver),
      refinance: String(d.refinanceResolver),
    },
  };
}

export async function getDsaAccountsForOwner(
  ownerInput: string
): Promise<DsaOwnerResponse> {
  if (!isAddress(ownerInput)) {
    throw new Error("Invalid wallet address");
  }

  const owner = getAddress(ownerInput);
  const deployments = loadMorDeployments();
  const client = getPublicClient();

  const coreFactory = asAddress(deployments.factory, "core factory");
  const daoFactory = asAddress(deployments.morDSAFactory, "DAO factory");
  const platformDsa = asAddress(deployments.dsaProxy, "platform DSA");

  const [coreAccounts, daoAccounts, platformOwner] = await Promise.all([
    client.readContract({
      address: coreFactory,
      abi: morDsaFactoryAbi,
      functionName: "getAccounts",
      args: [owner],
    }),
    client.readContract({
      address: daoFactory,
      abi: morDsaFactoryAbi,
      functionName: "getAccounts",
      args: [owner],
    }),
    client.readContract({
      address: platformDsa,
      abi: morDsaAbi,
      functionName: "owner",
    }),
  ]);

  const unique = new Map<string, DsaAccountSummary["source"]>();
  for (const account of coreAccounts) {
    unique.set(getAddress(account), "factory");
  }
  for (const account of daoAccounts) {
    unique.set(getAddress(account), "factory");
  }

  const accounts = await Promise.all(
    [...unique.entries()].map(([address, source]) =>
      readDsaSummary(client, getAddress(address), source)
    )
  );

  const isPlatformOwner =
    platformOwner.toLowerCase() === owner.toLowerCase();

  if (isPlatformOwner && !unique.has(platformDsa)) {
    accounts.unshift(await readDsaSummary(client, platformDsa, "platform"));
  }

  return {
    chainId: Number(deployments.chainId),
    chain: String(deployments.chain),
    owner,
    accounts,
    platformDsa,
    isPlatformOwner,
    factories: {
      core: coreFactory,
      dao: daoFactory,
    },
  };
}

export async function getDsaAccountByAddress(
  dsaInput: string
): Promise<DsaAccountSummary> {
  if (!isAddress(dsaInput)) {
    throw new Error("Invalid DSA address");
  }

  const address = getAddress(dsaInput);
  const client = getPublicClient();
  return readDsaSummary(client, address, "factory");
}
