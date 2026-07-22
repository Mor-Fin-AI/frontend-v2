"use client";

import { Skeleton, SkeletonItem, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    display: "flex",
    width: "100%",
    minHeight: "280px",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  chart: {
    width: "100%",
    flex: 1,
    minHeight: "220px",
    borderRadius: tokens.borderRadiusMedium,
  },
  legendRow: {
    display: "flex",
    justifyContent: "center",
    gap: tokens.spacingHorizontalL,
  },
  legendItem: {
    width: "72px",
  },
});

type ChartSkeletonProps = {
  minHeight?: number;
  showLegend?: boolean;
  "aria-label"?: string;
};

export default function ChartSkeleton({
  minHeight = 280,
  showLegend = true,
  "aria-label": ariaLabel = "Loading chart",
}: ChartSkeletonProps) {
  const styles = useStyles();

  return (
    <Skeleton aria-label={ariaLabel}>
      <div className={styles.root} style={{ minHeight }}>
        <SkeletonItem size={96} shape="rectangle" className={styles.chart} />
        {showLegend ? (
          <div className={styles.legendRow}>
            <SkeletonItem size={12} shape="rectangle" className={styles.legendItem} />
            <SkeletonItem size={12} shape="rectangle" className={styles.legendItem} />
            <SkeletonItem size={12} shape="rectangle" className={styles.legendItem} />
          </div>
        ) : null}
      </div>
    </Skeleton>
  );
}
