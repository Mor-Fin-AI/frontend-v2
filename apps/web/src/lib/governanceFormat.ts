import type { ProposalCategory } from "@/app/(dashboard)/governance/data";

const CATEGORY_OPTIONS: ProposalCategory[] = [
  "Infrastructure",
  "Education",
  "Platform Resources",
  "Governance",
];

export function isProposalCategory(value: string): value is ProposalCategory {
  return CATEGORY_OPTIONS.includes(value as ProposalCategory);
}

export function formatProposalDescription(input: {
  title: string;
  category: ProposalCategory;
  body: string;
}) {
  return `# ${input.title.trim()}\nCategory: ${input.category}\n\n${input.body.trim()}`;
}

export function parseProposalDescription(description: string) {
  const titleMatch = description.match(/^#\s*(.+)$/m);
  const categoryMatch = description.match(/^Category:\s*(.+)$/m);
  const categoryRaw = categoryMatch?.[1]?.trim() ?? "Governance";

  return {
    title: titleMatch?.[1]?.trim() ?? "Governance proposal",
    category: isProposalCategory(categoryRaw) ? categoryRaw : ("Governance" as ProposalCategory),
    body: description
      .replace(/^#\s*.+\n?/m, "")
      .replace(/^Category:\s*.+\n?/m, "")
      .trim(),
  };
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatVoteCount(value: bigint | number) {
  const n = typeof value === "bigint" ? Number(value) : value;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function mapProposalStateToUiStatus(state: number) {
  switch (state) {
    case 1:
      return "Active" as const;
    case 7:
      return "Executed" as const;
    case 3:
    case 2:
    case 6:
      return "Defeated" as const;
    case 0:
    case 4:
    case 5:
      return "Active" as const;
    default:
      return "Active" as const;
  }
}

export function formatTimeLeft(deadlineSec: number, nowSec = Math.floor(Date.now() / 1000)) {
  const diff = deadlineSec - nowSec;
  if (diff <= 0) return undefined;
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} left`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} left`;
  return "Less than 1 hour left";
}

export function formatProposalDate(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const GOVERNANCE_CATEGORIES = CATEGORY_OPTIONS;
