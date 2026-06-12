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
    title: "Learning Progress",
    breadcrumb: "Learning Progress",
    subtitle: "Learning activity, achievements & participation history"
  },
  "/dao-activities": {
    title: "Learning & Participation",
    breadcrumb: "Learning & Participation",
    subtitle: "Learning modules, assessments & participation history"
  },
  "/infrastructure-impact": {
    title: "System Health & Performance",
    breadcrumb: "System Health & Performance",
    subtitle: "Platform activity, learning engagement & community participation metrics"
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
