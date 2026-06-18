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
  "/governance": {
    title: "Governance",
    breadcrumb: "Governance",
    subtitle: "Community proposals, voting, and participation",
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
    const proposalId = normalized.split("/").pop() ?? "Proposal";
    const proposal = getProposalById(proposalId);
    return {
      title: proposal?.title ?? proposalId,
      breadcrumb: proposal?.title ?? proposalId,
      subtitle: proposal
        ? `${proposal.id} · ${proposal.status}`
        : "Proposal details and voting activity",
    };
  }

  return routeMeta[normalized];
}
