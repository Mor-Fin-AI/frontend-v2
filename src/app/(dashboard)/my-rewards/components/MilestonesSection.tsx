"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { milestoneChartData } from "../data";
import ChartSkeleton from "@/components/ui/skeletons/ChartSkeleton";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardHeaderLink,
} from "@/components/ui/PanelCard";
import { makeStyles, Skeleton, SkeletonItem, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  content: {
    display: "flex",
    minHeight: "320px",
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: tokens.spacingVerticalL,
  },
  chartWrap: {
    display: "flex",
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "220px",
    maxHeight: "280px",
  },
  legend: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
  },
  legendLabel: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground2,
  },
  swatch: {
    width: "12px",
    height: "12px",
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
  },
  value: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground1,
  },
  legendSkeletonLabel: {
    width: "140px",
    maxWidth: "70%",
  },
  legendSkeletonValue: {
    width: "40px",
  },
});

type MilestonesSectionProps = {
  isLoading?: boolean;
};

export default function MilestonesSection({ isLoading = false }: MilestonesSectionProps) {
  const styles = useStyles();

  return (
    <PanelCard className="h-full" aria-busy={isLoading}>
      <PanelCardHeader
        title="Achievements & Participation"
        description="Progress across learning areas"
        action={<PanelCardHeaderLink>View all</PanelCardHeaderLink>}
      />

      <PanelCardBody className="flex-1">
        {isLoading ? (
          <div className={styles.content}>
            <ChartSkeleton minHeight={240} showLegend={false} aria-label="Loading achievements chart" />
            <Skeleton aria-label="Loading participation breakdown">
              <div className={styles.legend}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className={styles.legendRow}>
                    <SkeletonItem size={16} shape="rectangle" className={styles.legendSkeletonLabel} />
                    <SkeletonItem size={16} shape="rectangle" className={styles.legendSkeletonValue} />
                  </div>
                ))}
              </div>
            </Skeleton>
          </div>
        ) : (
        <div className={styles.content}>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <PieChart>
                <Pie
                  data={milestoneChartData}
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {milestoneChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.legend}>
            {milestoneChartData.map((item, index) => (
              <div key={index} className={styles.legendRow}>
                <div className={styles.legendLabel}>
                  <span
                    className={styles.swatch}
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </div>
                <span className={styles.value}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
        )}
      </PanelCardBody>
    </PanelCard>
  );
}
