"use client";

import { milestonesData } from "../data";
import MilestonesListSkeleton from "@/components/ui/skeletons/MilestonesListSkeleton";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardHeaderLink,
} from "@/components/ui/PanelCard";
import AppProgressBar from "@/components/ui/AppProgressBar";
import AppBadge from "@/components/ui/AppBadge";
import { milestoneStatusTone } from "@/lib/badgeTones";
import { makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
  },
  item: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  itemHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase300,
  },
  label: {
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground1,
  },
});

export default function MilestonesList({ isLoading = false }: { isLoading?: boolean }) {
  const styles = useStyles();

  return (
    <PanelCard className="h-full" aria-busy={isLoading}>
      <PanelCardHeader
        title="Learning Milestones"
        description="Module completion progress"
        action={<PanelCardHeaderLink>View all</PanelCardHeaderLink>}
      />
      <PanelCardBody className="flex-1">
        {isLoading ? (
          <MilestonesListSkeleton aria-label="Loading learning milestones" />
        ) : (
        <div className={styles.list}>
          {milestonesData.slice(0, 5).map((milestone) => (
            <div key={milestone.id} className={styles.item}>
              <div className={styles.itemHeader}>
                <span className={styles.label}>{milestone.label}</span>
                <AppBadge
                  tone={milestoneStatusTone[milestone.status] ?? "neutral"}
                  appearance="tint"
                  size="table"
                >
                  {milestone.status}
                </AppBadge>
              </div>
              <AppProgressBar
                percent={(milestone.value / milestone.goal) * 100}
                color={milestone.color}
                shape="rounded"
                thickness="large"
              />
            </div>
          ))}
        </div>
        )}
      </PanelCardBody>
    </PanelCard>
  );
}
