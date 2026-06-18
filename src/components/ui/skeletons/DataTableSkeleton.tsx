"use client";

import { Skeleton, SkeletonItem, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  headerRow: {
    display: "grid",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    paddingBottom: tokens.spacingVerticalXS,
  },
  row: {
    display: "grid",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
  },
  mediaCell: {
    width: "20px",
  },
  cellSm: {
    width: "72px",
  },
  cellMd: {
    width: "120px",
  },
  cellLg: {
    width: "180px",
  },
  cellFill: {
    width: "100%",
    minWidth: "96px",
  },
});

type DataTableSkeletonProps = {
  rows?: number;
  columns?: number;
  hasMedia?: boolean;
  hideHeader?: boolean;
  "aria-label"?: string;
};

function cellWidthClass(index: number, total: number, styles: ReturnType<typeof useStyles>) {
  if (index === total - 1) return styles.cellSm;
  if (index === 0) return styles.cellMd;
  if (index === 1) return styles.cellLg;
  return styles.cellFill;
}

export default function DataTableSkeleton({
  rows = 5,
  columns = 4,
  hasMedia = true,
  hideHeader = false,
  "aria-label": ariaLabel = "Loading table",
}: DataTableSkeletonProps) {
  const styles = useStyles();
  const gridTemplate = hasMedia
    ? `20px repeat(${columns}, minmax(72px, 1fr))`
    : `repeat(${columns}, minmax(72px, 1fr))`;

  return (
    <Skeleton aria-label={ariaLabel}>
      <div className={styles.root} aria-hidden>
        {!hideHeader ? (
          <div className={styles.headerRow} style={{ gridTemplateColumns: gridTemplate }}>
            {hasMedia ? <SkeletonItem size={12} shape="rectangle" className={styles.mediaCell} /> : null}
            {Array.from({ length: columns }).map((_, index) => (
              <SkeletonItem
                key={`header-${index}`}
                size={12}
                shape="rectangle"
                className={cellWidthClass(index, columns, styles)}
              />
            ))}
          </div>
        ) : null}

        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={styles.row}
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {hasMedia ? <SkeletonItem shape="circle" size={20} /> : null}
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonItem
                key={`cell-${rowIndex}-${colIndex}`}
                size={16}
                shape="rectangle"
                className={cellWidthClass(colIndex, columns, styles)}
              />
            ))}
          </div>
        ))}
      </div>
    </Skeleton>
  );
}
