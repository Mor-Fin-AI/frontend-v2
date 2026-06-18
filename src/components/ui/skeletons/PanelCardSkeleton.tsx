"use client";

import {
  Card as FluentCard,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import {
  CARD_APPEARANCE,
  CARD_FOCUS_MODE,
  useCardShellStyles,
} from "@/components/ui/cardShell";
import ChartSkeleton from "./ChartSkeleton";
import DataTableSkeleton from "./DataTableSkeleton";
import { Skeleton, SkeletonItem } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
    height: "100%",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
    flex: 1,
  },
  titleBar: {
    width: "220px",
    maxWidth: "80%",
  },
  descriptionBar: {
    width: "160px",
    maxWidth: "60%",
  },
  actionBar: {
    width: "64px",
    flexShrink: 0,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  listRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
  },
  listLabel: {
    width: "140px",
    maxWidth: "70%",
  },
  listValue: {
    width: "48px",
  },
});

type PanelCardSkeletonVariant = "chart" | "table" | "list" | "default";

type PanelCardSkeletonProps = {
  variant?: PanelCardSkeletonVariant;
  showAction?: boolean;
  tableRows?: number;
  tableColumns?: number;
  chartMinHeight?: number;
  className?: string;
  "aria-label"?: string;
};

export default function PanelCardSkeleton({
  variant = "default",
  showAction = false,
  tableRows = 5,
  tableColumns = 4,
  chartMinHeight = 280,
  className,
  "aria-label": ariaLabel = "Loading panel",
}: PanelCardSkeletonProps) {
  const styles = useStyles();
  const shell = useCardShellStyles();

  return (
    <FluentCard
      appearance={CARD_APPEARANCE}
      size="large"
      focusMode={CARD_FOCUS_MODE}
      className={mergeClasses(shell.shell, styles.root, className)}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <Skeleton aria-label={ariaLabel}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <SkeletonItem size={20} shape="rectangle" className={styles.titleBar} />
            <SkeletonItem size={12} shape="rectangle" className={styles.descriptionBar} />
          </div>
          {showAction ? (
            <SkeletonItem size={12} shape="rectangle" className={styles.actionBar} />
          ) : null}
        </div>
      </Skeleton>

      {variant === "chart" ? (
        <ChartSkeleton minHeight={chartMinHeight} aria-label="Loading chart" />
      ) : null}

      {variant === "table" ? (
        <DataTableSkeleton
          rows={tableRows}
          columns={tableColumns}
          aria-label="Loading table"
        />
      ) : null}

      {variant === "list" ? (
        <Skeleton aria-label="Loading list">
          <div className={styles.list}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={styles.listRow}>
                <SkeletonItem size={16} shape="rectangle" className={styles.listLabel} />
                <SkeletonItem size={16} shape="rectangle" className={styles.listValue} />
              </div>
            ))}
          </div>
        </Skeleton>
      ) : null}

      {variant === "default" ? (
        <Skeleton aria-label="Loading content">
          <SkeletonItem size={120} shape="rectangle" />
        </Skeleton>
      ) : null}
    </FluentCard>
  );
}
