import type { MessageBarIntent } from "@fluentui/react-components";

export type DashboardBannerAction = {
  label: string;
  href?: string;
  action?: "support-chat";
};

export type DashboardBannerConfig = {
  id: string;
  title: string;
  message: string;
  intent?: MessageBarIntent;
  action?: DashboardBannerAction;
};

export const DASHBOARD_BANNER_STORAGE_KEY =
  "morfinance-dashboard-banner-dismissed";

export const activeDashboardBanner: DashboardBannerConfig = {
  id: "governance-q2-2026",
  title: "Governance vote now open",
  message:
    "Community Training Budget Q2 is live. Review the proposal and participate before voting closes Friday.",
  intent: "info",
  action: {
    label: "View proposal",
    href: "/governance",
  },
};
