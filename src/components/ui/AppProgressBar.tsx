"use client";

import {
  ProgressBar,
  type ProgressBarProps,
  makeStyles,
  mergeClasses,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});

export type AppProgressBarProps = {
  /** Progress percentage from 0 to 100 */
  percent: number;
  /** Custom fill color for the bar */
  color?: string;
  className?: string;
} & Pick<ProgressBarProps, "shape" | "thickness">;

export default function AppProgressBar({
  percent,
  color,
  className,
  shape = "rounded",
  thickness = "large",
}: AppProgressBarProps) {
  const styles = useStyles();
  const value = Math.min(Math.max(percent / 100, 0), 1);

  return (
    <ProgressBar
      className={mergeClasses(styles.root, className)}
      shape={shape}
      thickness={thickness}
      value={value}
      bar={color ? { style: { backgroundColor: color } } : undefined}
    />
  );
}
