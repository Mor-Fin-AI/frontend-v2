export const routeMeta: Record<
  string,
  { title: string; breadcrumb: string; subtitle?: string }
> = {
  "/overview": {
    title: "Treasury Flow",
    breadcrumb: "Treasury Flow",
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
  "/settings": {
    title: "Settings",
    breadcrumb: "Settings",
    subtitle: "Appearance, notifications, and dashboard preferences",
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

  return routeMeta[normalized];
}
