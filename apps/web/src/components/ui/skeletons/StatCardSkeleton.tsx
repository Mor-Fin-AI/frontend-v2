"use client";

import { Skeleton, SkeletonItem, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  layout: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    width: "100%",
  },
  headerRow: {
    display: "grid",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    gridTemplateColumns: "40px 1fr",
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  valueBar: {
    width: "128px",
    maxWidth: "70%",
  },
  titleBar: {
    width: "96px",
    maxWidth: "55%",
  },
  subBar: {
    width: "80px",
    maxWidth: "45%",
  },
});

type StatCardSkeletonProps = {
  "aria-label"?: string;
};

export default function StatCardSkeleton({
  "aria-label": ariaLabel = "Loading stat card",
}: StatCardSkeletonProps) {
  const styles = useStyles();

  return (
    <Skeleton aria-label={ariaLabel}>
      <div className={styles.layout}>
        <div className={styles.headerRow}>
          <SkeletonItem shape="circle" size={40} />
          <div className={styles.headerText}>
            <SkeletonItem size={28} shape="rectangle" className={styles.valueBar} />
            <SkeletonItem size={12} shape="rectangle" className={styles.titleBar} />
          </div>
        </div>
        <SkeletonItem size={12} shape="rectangle" className={styles.subBar} />
      </div>
    </Skeleton>
  );
}
