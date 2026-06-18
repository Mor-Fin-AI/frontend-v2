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
import StatCardSkeleton from "./StatCardSkeleton";

const useStyles = makeStyles({
  card: {
    height: "100%",
  },
});

type StatCardsSkeletonProps = {
  count?: number;
  className?: string;
  "aria-label"?: string;
};

export default function StatCardsSkeleton({
  count = 4,
  className,
  "aria-label": ariaLabel = "Loading stats",
}: StatCardsSkeletonProps) {
  const styles = useStyles();
  const shell = useCardShellStyles();

  return (
    <div
      className={mergeClasses("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      {Array.from({ length: count }).map((_, index) => (
        <FluentCard
          key={index}
          appearance={CARD_APPEARANCE}
          size="medium"
          focusMode={CARD_FOCUS_MODE}
          className={mergeClasses(shell.shell, styles.card)}
        >
          <StatCardSkeleton aria-label={`Loading stat ${index + 1}`} />
        </FluentCard>
      ))}
    </div>
  );
}
