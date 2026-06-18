"use client";

import { Skeleton, SkeletonItem, makeStyles, tokens } from "@fluentui/react-components";

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
  },
  label: {
    width: "160px",
    maxWidth: "70%",
  },
  badge: {
    width: "72px",
  },
  bar: {
    width: "100%",
  },
});

type MilestonesListSkeletonProps = {
  rows?: number;
  "aria-label"?: string;
};

export default function MilestonesListSkeleton({
  rows = 5,
  "aria-label": ariaLabel = "Loading milestones",
}: MilestonesListSkeletonProps) {
  const styles = useStyles();

  return (
    <Skeleton aria-label={ariaLabel}>
      <div className={styles.list}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className={styles.item}>
            <div className={styles.itemHeader}>
              <SkeletonItem size={16} shape="rectangle" className={styles.label} />
              <SkeletonItem size={20} shape="rectangle" className={styles.badge} />
            </div>
            <SkeletonItem size={8} shape="rectangle" className={styles.bar} />
          </div>
        ))}
      </div>
    </Skeleton>
  );
}
