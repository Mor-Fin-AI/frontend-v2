export type MorModuleId =
  | "dashboard"
  | "overview"
  | "dsa-account"
  | "arbitrage-monitor"
  | "fee-integration"
  | "lending-debt-discharge"
  | "governance"
  | "dao-education-rewards"
  | "infrastructure-deployment"
  | "pricing";

export type MorContractRef = {
  deploymentKey: string;
  label: string;
  group: "core" | "governance" | "connectors" | "spells" | "resolvers" | "infra";
};

export type MorModuleDefinition = {
  id: MorModuleId;
  title: string;
  routes: string[];
  contracts: MorContractRef[];
};

export const morModuleDefinitions: MorModuleDefinition[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    routes: ["/dashboard"],
    contracts: [
      { deploymentKey: "morGovernorTimeLocked", label: "Governor", group: "governance" },
      { deploymentKey: "morGovernanceHub", label: "Governance Hub", group: "governance" },
      { deploymentKey: "morTreasuryFlowPanel", label: "Treasury Flow Panel", group: "governance" },
      { deploymentKey: "morRewardsDistributor", label: "Rewards Distributor", group: "governance" },
    ],
  },
  {
    id: "overview",
    title: "Treasury Flow",
    routes: ["/overview"],
    contracts: [
      { deploymentKey: "morTreasuryFlowPanel", label: "Treasury Flow Panel", group: "governance" },
      { deploymentKey: "morTreasuryBalance", label: "Treasury Balance", group: "governance" },
      { deploymentKey: "morTreasuryFlowSpell", label: "Treasury Flow Spell", group: "spells" },
      { deploymentKey: "dsaProxy", label: "Platform DSA", group: "core" },
    ],
  },
  {
    id: "dsa-account",
    title: "DSA Account",
    routes: ["/dsa-account"],
    contracts: [
      { deploymentKey: "morDSAFactory", label: "MorDSA Factory", group: "core" },
      { deploymentKey: "factory", label: "Core DSA Factory", group: "core" },
      { deploymentKey: "morDsaImpl", label: "MorDSA Implementation", group: "core" },
      { deploymentKey: "registry", label: "Core Registry", group: "core" },
      { deploymentKey: "wethConnector", label: "WETH Connector", group: "connectors" },
    ],
  },
  {
    id: "arbitrage-monitor",
    title: "Arbitrage Monitor",
    routes: ["/arbitrage-monitor"],
    contracts: [
      { deploymentKey: "flashloanAgg", label: "Flashloan Aggregator", group: "core" },
      { deploymentKey: "positionResolver", label: "Position Resolver", group: "resolvers" },
      { deploymentKey: "uniswapConnector", label: "Uniswap Connector", group: "connectors" },
      { deploymentKey: "sushiConnector", label: "Sushi Connector", group: "connectors" },
      { deploymentKey: "camelotV3Connector", label: "Camelot V3", group: "connectors" },
      { deploymentKey: "balancerVault", label: "Balancer Vault", group: "infra" },
    ],
  },
  {
    id: "fee-integration",
    title: "Fee Integration",
    routes: ["/fee-integration"],
    contracts: [
      { deploymentKey: "morTreasuryFlowPanel", label: "Treasury Flow Panel", group: "governance" },
      { deploymentKey: "morTreasuryFlowSpell", label: "Treasury Flow Spell", group: "spells" },
      { deploymentKey: "morSpellConnector", label: "Spell Connector", group: "connectors" },
      { deploymentKey: "uniswapConnector", label: "Uniswap Connector", group: "connectors" },
      { deploymentKey: "pancakeSwapV3Connector", label: "PancakeSwap V3", group: "connectors" },
    ],
  },
  {
    id: "lending-debt-discharge",
    title: "Lending & Debt Discharge",
    routes: ["/lending-debt-discharge"],
    contracts: [
      { deploymentKey: "aaveConnector", label: "Aave Connector", group: "connectors" },
      { deploymentKey: "compoundConnector", label: "Compound Connector", group: "connectors" },
      { deploymentKey: "refinanceResolver", label: "Refinance Resolver", group: "resolvers" },
      { deploymentKey: "flashloanAgg", label: "Flashloan Aggregator", group: "core" },
      { deploymentKey: "morTreasuryFlowSpell", label: "Treasury Flow Spell", group: "spells" },
    ],
  },
  {
    id: "governance",
    title: "Governance",
    routes: ["/governance"],
    contracts: [
      { deploymentKey: "morGovernorTimeLocked", label: "Governor", group: "governance" },
      { deploymentKey: "morGovernanceHub", label: "Governance Hub", group: "governance" },
      { deploymentKey: "morTimeLock", label: "Timelock", group: "governance" },
      { deploymentKey: "morSpellRegistry", label: "Spell Registry", group: "governance" },
      { deploymentKey: "morTokenGenesis", label: "MOR Token Genesis", group: "governance" },
      { deploymentKey: "morHybridVoteWeight", label: "Hybrid Vote Weight", group: "governance" },
    ],
  },
  {
    id: "dao-education-rewards",
    title: "DAO Education Rewards",
    routes: ["/dao-education-rewards"],
    contracts: [
      { deploymentKey: "morEducationProgramSpell", label: "Education Program Spell", group: "spells" },
      { deploymentKey: "morCredentialNFTSpell", label: "Credential NFT Spell", group: "spells" },
      { deploymentKey: "morSupervisionCertSpell", label: "Supervision Cert Spell", group: "spells" },
      { deploymentKey: "morRewardsDistributor", label: "Rewards Distributor", group: "governance" },
      { deploymentKey: "morReputationRegistry", label: "Reputation Registry", group: "governance" },
    ],
  },
  {
    id: "infrastructure-deployment",
    title: "Infrastructure Deployment",
    routes: ["/infrastructure-deployment"],
    contracts: [
      { deploymentKey: "morInfrastructureDeploymentSpell", label: "Infrastructure Spell", group: "spells" },
      { deploymentKey: "morSupervisionCertSpell", label: "Supervision Cert Spell", group: "spells" },
      { deploymentKey: "morSpellRegistry", label: "Spell Registry", group: "governance" },
    ],
  },
  {
    id: "pricing",
    title: "Pricing",
    routes: ["/pricing"],
    contracts: [
      { deploymentKey: "morProtocolConfig", label: "Protocol Config", group: "governance" },
      { deploymentKey: "morTreasuryFlowSpell", label: "Treasury Flow Spell", group: "spells" },
      { deploymentKey: "morTokenGenesis", label: "MOR Token Genesis", group: "governance" },
    ],
  },
];

export function resolveMorModule(pathname: string): MorModuleDefinition | null {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  if (normalized.startsWith("/governance/")) {
    return morModuleDefinitions.find((m) => m.id === "governance") ?? null;
  }

  return (
    morModuleDefinitions.find((module) =>
      module.routes.some(
        (route) => normalized === route || normalized.startsWith(`${route}/`)
      )
    ) ?? null
  );
}

export function flattenDeploymentAddresses(
  deployments: Record<string, unknown>
): Record<string, string> {
  const flat: Record<string, string> = {};

  for (const [key, value] of Object.entries(deployments)) {
    if (typeof value === "string" && value.startsWith("0x")) {
      flat[key] = value;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [nestedKey, nestedValue] of Object.entries(
        value as Record<string, unknown>
      )) {
        if (typeof nestedValue === "string" && nestedValue.startsWith("0x")) {
          flat[nestedKey] = nestedValue;
        }
      }
    }
  }

  return flat;
}
