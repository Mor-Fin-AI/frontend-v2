export const routeMeta: Record<
  string,
  { title: string; breadcrumb: string; subtitle?: string }
> = {
  "/overview": {
    title: "Welcome back, {name}",
    breadcrumb: "Welcome back, {name}",
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
    subtitle: "Trainings, validations & participation history"
  },
  "/infrastructure-impact": {
    title: "Infrastructure Impact",
    breadcrumb: "Infrastructure Impact",
    subtitle: "Roads, drainage, pavements & hubs built through the DAO"
  },
  "/governance": {
    title: "Governance",
    breadcrumb: "Governance",
    subtitle: "View proposals and cast your vote"
  },
  "/audit-logs": {
    title: "Platform Activity Logs",
    breadcrumb: "Platform Activity Logs",
    subtitle: "Read-only platform and governance activity logs"
  },
  "/pricing": {
    title: "Pricing",
    breadcrumb: "Pricing",
    subtitle: "Explore learning programs and governance"
  },
};
