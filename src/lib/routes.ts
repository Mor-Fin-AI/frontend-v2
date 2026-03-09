export const routeMeta: Record<
  string,
  { title: string; breadcrumb: string; subtitle?: string }
> = {
  "/overview": {
    title: "Welcome back, James",
    breadcrumb: "Welcome back, James",
    subtitle: "Your personal progress and DAO summary"
  },
  "/my-rewards": {
    title: "My Rewards",
    breadcrumb: "My Rewards",
    subtitle: "Educational rewards, milestones & payout history"
  },
  "/dao-activities": {
    title: "DAO Activities",
    breadcrumb: "DAO Activities",
    subtitle: "Track your participation and contributions"
  },
  "/infrastructure-impact": {
    title: "Infrastructure Impact",
    breadcrumb: "Infrastructure Impact",
    subtitle: "Monitor system health and performance"
  },
  "/governance": {
    title: "Governance",
    breadcrumb: "Governance",
    subtitle: "Participate in decision-making processes"
  },
  "/audit-logs": {
    title: "Audit Logs",
    breadcrumb: "Audit Logs",
    subtitle: "Review system activity and history"
  },
};
