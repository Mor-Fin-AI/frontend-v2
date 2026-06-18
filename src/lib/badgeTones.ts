import type { AppBadgeAppearance, AppBadgeTone } from "@/components/ui/AppBadge";
import type { NotificationType } from "@/layout/TopNavigatoionBar/data/notifications";

export const notificationTypeBadge: Record<
  NotificationType,
  { tone: AppBadgeTone; appearance: AppBadgeAppearance }
> = {
  learning: { tone: "brand", appearance: "tint" },
  governance: { tone: "warning", appearance: "tint" },
  reward: { tone: "success", appearance: "tint" },
  system: { tone: "info", appearance: "tint" },
};

export const activityTypeTone: Record<string, AppBadgeTone> = {
  Learning: "brand",
  Vote: "info",
  Training: "brand",
  Assessment: "warning",
};

export const proposalStatusTone: Record<string, AppBadgeTone> = {
  Active: "success",
  Executed: "info",
  Defeated: "danger",
};

export const proposalCategoryTone: Record<string, AppBadgeTone> = {
  Infrastructure: "warning",
  Education: "success",
  "Platform Resources": "info",
  Governance: "brand",
};

export const projectStatusTone: Record<string, AppBadgeTone> = {
  Active: "info",
  Completed: "warning",
  Planning: "warning",
};

export const validationResultTone: Record<string, AppBadgeTone> = {
  Approved: "success",
  Flagged: "danger",
  Pending: "warning",
};

export const trainingStatusTone: Record<string, AppBadgeTone> = {
  InProgress: "info",
  Completed: "success",
  "Not Started": "warning",
};

export const participationStatusTone: Record<string, AppBadgeTone> = {
  Attended: "success",
  Voted: "brand",
  Participated: "info",
};

export const payoutStatusTone: Record<string, AppBadgeTone> = {
  Completed: "success",
  "In Progress": "warning",
  Pending: "warning",
};

export const auditCategoryTone: Record<string, AppBadgeTone> = {
  Learning: "brand",
  Governance: "warning",
  Participation: "info",
};

export const auditStatusTone: Record<string, AppBadgeTone> = {
  Success: "success",
  Flagged: "danger",
  Pending: "warning",
};

export const dsaAccountStatusTone: Record<string, AppBadgeTone> = {
  Active: "success",
  Pending: "warning",
  Suspended: "danger",
};

export const dsaTransactionStatusTone: Record<string, AppBadgeTone> = {
  Completed: "success",
  Pending: "warning",
  Failed: "danger",
};

export const milestoneStatusTone: Record<string, AppBadgeTone> = {
  "In Progress": "brand",
  Completed: "success",
};
