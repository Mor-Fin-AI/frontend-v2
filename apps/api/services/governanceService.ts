import {
  createPublicClient,
  formatEther,
  getAddress,
  http,
  isAddress,
  type Address,
} from "viem";
import { arbitrum } from "viem/chains";
import { getArbitrumRpcUrl, loadMorDeployments } from "../lib/contracts.js";
import { morGovernorAbi, PROPOSAL_STATE_LABELS } from "../lib/governorAbi.js";
import {
  formatProposalDate,
  formatTimeLeft,
  formatVoteCount,
  mapProposalStateToUiStatus,
  parseProposalDescription,
  truncateAddress,
} from "../lib/governanceFormat.js";

export type GovernanceProposalResponse = {
  id: string;
  isOnChain: boolean;
  status: "Active" | "Executed" | "Defeated";
  state: number;
  stateLabel: string;
  category: string;
  title: string;
  description: string;
  fullDescription: string;
  votesFor: string;
  votesAgainst: string;
  forPercent: number;
  author: string;
  proposer?: Address;
  timeLeft?: string;
  createdAt: string;
  votingEndsAt?: string;
  voteStart: number;
  voteEnd: number;
  quorumRequired: string;
  targets: Address[];
  timeline: Array<{ date: string; label: string }>;
  userHasVoted?: boolean;
};

export type GovernanceStatusResponse = {
  chainId: number;
  chain: string;
  governor: Address;
  governanceHub: Address;
  token: Address;
  proposalThreshold: string;
  proposalThresholdFormatted: string;
  votingDelay: string;
  votingPeriod: string;
  quorumNumerator: number;
  activeProposals: number;
  totalProposals: number;
};

function getClient() {
  return createPublicClient({
    chain: arbitrum,
    transport: http(getArbitrumRpcUrl()),
  });
}

function getGovernorAddress(): Address {
  const deployments = loadMorDeployments();
  const governor = deployments.morGovernorTimeLocked;
  if (typeof governor !== "string" || !isAddress(governor)) {
    throw new Error("Invalid morGovernorTimeLocked in deployments");
  }
  return getAddress(governor);
}

async function enrichProposal(
  client: ReturnType<typeof getClient>,
  governor: Address,
  proposalId: bigint,
  description: string,
  proposer: Address,
  voteStart: bigint,
  voteEnd: bigint,
  targets: Address[],
  voterAddress?: string
): Promise<GovernanceProposalResponse> {
  const id = proposalId.toString();
  const parsed = parseProposalDescription(description);
  const voteStartNum = Number(voteStart);
  const voteEndNum = Number(voteEnd);

  const [state, votes, quorumValue, hasVoted] = await Promise.all([
    client.readContract({
      address: governor,
      abi: morGovernorAbi,
      functionName: "state",
      args: [proposalId],
    }),
    client.readContract({
      address: governor,
      abi: morGovernorAbi,
      functionName: "proposalVotes",
      args: [proposalId],
    }),
    client.readContract({
      address: governor,
      abi: morGovernorAbi,
      functionName: "quorum",
      args: [voteStart],
    }),
    voterAddress && isAddress(voterAddress)
      ? client.readContract({
          address: governor,
          abi: morGovernorAbi,
          functionName: "hasVoted",
          args: [proposalId, getAddress(voterAddress)],
        })
      : Promise.resolve(false),
  ]);

  const forVotes = votes[1];
  const againstVotes = votes[0];
  const totalVotes = forVotes + againstVotes;
  const forPercent =
    totalVotes > 0n ? Math.round(Number((forVotes * 100n) / totalVotes)) : 0;

  const stateNum = Number(state);
  const status = mapProposalStateToUiStatus(stateNum);
  const stateLabel = PROPOSAL_STATE_LABELS[stateNum] ?? "Unknown";

  return {
    id,
    isOnChain: true,
    status,
    state: stateNum,
    stateLabel,
    category: parsed.category,
    title: parsed.title,
    description: parsed.body.slice(0, 160) + (parsed.body.length > 160 ? "…" : ""),
    fullDescription: parsed.body,
    votesFor: formatVoteCount(forVotes),
    votesAgainst: formatVoteCount(againstVotes),
    forPercent,
    author: truncateAddress(proposer),
    proposer,
    timeLeft: status === "Active" ? formatTimeLeft(voteEndNum) : undefined,
    createdAt: formatProposalDate(voteStartNum),
    votingEndsAt: formatProposalDate(voteEndNum),
    voteStart: voteStartNum,
    voteEnd: voteEndNum,
    quorumRequired: `${formatVoteCount(quorumValue)} votes`,
    targets,
    userHasVoted: hasVoted,
    timeline: [
      { date: formatProposalDate(voteStartNum), label: "Voting period started" },
      { date: formatProposalDate(voteEndNum), label: "Voting deadline" },
      { date: stateLabel, label: `On-chain state: ${stateLabel}` },
    ],
  };
}

export async function getGovernanceStatus(): Promise<GovernanceStatusResponse> {
  const deployments = loadMorDeployments();
  const client = getClient();
  const governor = getGovernorAddress();
  const hub =
    typeof deployments.morGovernanceHub === "string"
      ? getAddress(deployments.morGovernanceHub)
      : governor;
  const token =
    typeof deployments.morTokenGenesis === "string"
      ? getAddress(deployments.morTokenGenesis)
      : governor;

  const [threshold, votingDelay, votingPeriod, events] = await Promise.all([
    client.readContract({
      address: governor,
      abi: morGovernorAbi,
      functionName: "proposalThreshold",
    }),
    client.readContract({
      address: governor,
      abi: morGovernorAbi,
      functionName: "votingDelay",
    }),
    client.readContract({
      address: governor,
      abi: morGovernorAbi,
      functionName: "votingPeriod",
    }),
    client.getContractEvents({
      address: governor,
      abi: morGovernorAbi,
      eventName: "ProposalCreated",
      fromBlock: 350_000_000n,
      toBlock: "latest",
    }),
  ]);

  const activeStates = new Set([0, 1, 4, 5]);
  let activeProposals = 0;

  if (events.length > 0) {
    const states = await Promise.all(
      events.map((event) =>
        client.readContract({
          address: governor,
          abi: morGovernorAbi,
          functionName: "state",
          args: [event.args.proposalId!],
        })
      )
    );
    activeProposals = states.filter((s) => activeStates.has(Number(s))).length;
  }

  const params = deployments.params as { quorumNumerator?: number } | undefined;

  return {
    chainId: Number(deployments.chainId),
    chain: String(deployments.chain),
    governor,
    governanceHub: hub,
    token,
    proposalThreshold: threshold.toString(),
    proposalThresholdFormatted: formatEther(threshold),
    votingDelay: votingDelay.toString(),
    votingPeriod: votingPeriod.toString(),
    quorumNumerator: params?.quorumNumerator ?? 4,
    activeProposals,
    totalProposals: events.length,
  };
}

export async function getGovernanceProposals(
  voterAddress?: string
): Promise<GovernanceProposalResponse[]> {
  const client = getClient();
  const governor = getGovernorAddress();

  const events = await client.getContractEvents({
    address: governor,
    abi: morGovernorAbi,
    eventName: "ProposalCreated",
    fromBlock: 350_000_000n,
    toBlock: "latest",
  });

  const proposals = await Promise.all(
    events.map((event) =>
      enrichProposal(
        client,
        governor,
        event.args.proposalId!,
        event.args.description ?? "",
        event.args.proposer!,
        event.args.voteStart!,
        event.args.voteEnd!,
        (event.args.targets ?? []) as Address[],
        voterAddress
      )
    )
  );

  return proposals.sort((a, b) => b.voteStart - a.voteStart);
}

export async function getGovernanceProposalById(
  proposalIdInput: string,
  voterAddress?: string
): Promise<GovernanceProposalResponse | null> {
  if (!/^\d+$/.test(proposalIdInput)) {
    return null;
  }

  const client = getClient();
  const governor = getGovernorAddress();
  const proposalId = BigInt(proposalIdInput);

  try {
    const events = await client.getContractEvents({
      address: governor,
      abi: morGovernorAbi,
      eventName: "ProposalCreated",
      args: { proposalId },
      fromBlock: 350_000_000n,
      toBlock: "latest",
    });

    const event = events[0];
    if (!event) {
      return null;
    }

    return enrichProposal(
      client,
      governor,
      proposalId,
      event.args.description ?? "",
      event.args.proposer!,
      event.args.voteStart!,
      event.args.voteEnd!,
      (event.args.targets ?? []) as Address[],
      voterAddress
    );
  } catch {
    return null;
  }
}

export async function getWalletGovernanceStats(walletInput: string) {
  if (!isAddress(walletInput)) {
    throw new Error("Invalid wallet address");
  }

  const client = getClient();
  const governor = getGovernorAddress();
  const voter = getAddress(walletInput);

  const [voteEvents, votingPower] = await Promise.all([
    client.getContractEvents({
      address: governor,
      abi: morGovernorAbi,
      eventName: "VoteCast",
      args: { voter },
      fromBlock: 350_000_000n,
      toBlock: "latest",
    }),
    client.readContract({
      address: governor,
      abi: morGovernorAbi,
      functionName: "getVotes",
      args: [voter, BigInt(Math.floor(Date.now() / 1000))],
    }),
  ]);

  return {
    votesCast: voteEvents.length,
    votingPower: formatEther(votingPower),
    votingPowerRaw: votingPower.toString(),
  };
}
