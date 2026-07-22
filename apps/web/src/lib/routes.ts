import { getProposalById } from "@/app/(dashboard)/governance/data";

export const routeMeta: Record<
  string,
  { title: string; breadcrumb: string; subtitle?: string }
> = {
  "/dashboard": {
    title: "Dashboard",
    breadcrumb: "Dashboard",
    subtitle: "Learning progress, governance activity, and milestones",
  },
  "/overview": {
    title: "Treasury Flow",
    breadcrumb: "Treasury Flow",
  },
  "/dsa-account": {
    title: "DSA Account",
    breadcrumb: "DSA Account",
    subtitle: "Balance, staking, wallet, and transaction history",
  },
  "/arbitrage-monitor": {
    title: "Arbitrage Screen Monitor",
    breadcrumb: "Arbitrage Monitor",
  },
  "/openclaw-agents": {
    title: "OpenClaw Agents",
    breadcrumb: "OpenClaw Agents",
    subtitle: "External OpenClaw install — prompts in this repo, runtime at ~/.openclaw/",
  },
  "/dao-education-rewards": {
    title: "DAO Education Rewards",
    breadcrumb: "DAO Education Rewards",
  },
  "/lending-debt-discharge": {
    title: "Lending & Debt Discharge",
    breadcrumb: "Lending & Debt Discharge",
  },
  "/infrastructure-deployment": {
    title: "Infrastructure Deployment Tracker",
    breadcrumb: "Infrastructure Tracker",
  },
  "/fee-integration": {
    title: "Fee Integration Module",
    breadcrumb: "Fee Integration",
  },
  "/pricing": {
    title: "Pricing",
    breadcrumb: "Pricing",
    subtitle: "Membership tiers and platform plans",
  },
  "/pricing/success": {
    title: "Subscription confirmed",
    breadcrumb: "Success",
    subtitle: "Your Mor Finance membership is active",
  },
  "/pricing/cancel": {
    title: "Checkout canceled",
    breadcrumb: "Canceled",
    subtitle: "No charge was made",
  },
  "/governance": {
    title: "Governance",
    breadcrumb: "Governance",
    subtitle: "Community proposals, voting, and participation",
  },
  "/governance/create": {
    title: "Create Proposal",
    breadcrumb: "Create Proposal",
    subtitle: "Submit a new Mor Governor proposal on Arbitrum",
  },
  "/admin": {
    title: "Admin Dashboard",
    breadcrumb: "Admin",
    subtitle: "Morfinance platform overview and operations",
  },
  "/admin/tickets": {
    title: "Admin Support Queue",
    breadcrumb: "Support Queue",
    subtitle: "Manage user support tickets",
  },
  "/admin/users": {
    title: "User Management",
    breadcrumb: "Users",
    subtitle: "Manage accounts and admin roles",
  },
  "/admin/chat": {
    title: "Support Chat Inbox",
    breadcrumb: "Support Chat",
    subtitle: "Reply to Morfinance support conversations",
  },
  "/settings": {
    title: "Settings",
    breadcrumb: "Settings",
    subtitle: "Appearance, notifications, and support tickets",
  },
  "/settings/general": {
    title: "General Settings",
    breadcrumb: "General",
    subtitle: "Appearance and dashboard preferences",
  },
  "/settings/support": {
    title: "Support Tickets",
    breadcrumb: "Support",
    subtitle: "Create and track support requests",
  },
  "/settings/audit-logs": {
    title: "Audit Logs",
    breadcrumb: "Audit Logs",
    subtitle: "Platform activity, governance events, and security audit trail",
  },
  "/sign-in": {
    title: "Sign in",
    breadcrumb: "Sign in",
    subtitle: "",
  },
  "/register": {
    title: "Create account",
    breadcrumb: "Register",
    subtitle: "",
  },
};

export function resolveRouteMeta(pathname: string) {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  if (normalized.startsWith("/governance/")) {
    if (normalized === "/governance/create") {
      return routeMeta["/governance/create"];
    }
    const proposalId = normalized.split("/").pop() ?? "Proposal";
    const proposal = getProposalById(proposalId);
    return {
      title: proposal?.title ?? (proposalId.startsWith("PROP") ? proposalId : `Proposal #${proposalId}`),
      breadcrumb: proposal?.title ?? (proposalId.startsWith("PROP") ? proposalId : `#${proposalId}`),
      subtitle: proposal
        ? `${proposal.isOnChain ? `#${proposal.id}` : proposal.id} · ${proposal.status}`
        : "Proposal details and on-chain voting",
    };
  }

  return routeMeta[normalized];
}
