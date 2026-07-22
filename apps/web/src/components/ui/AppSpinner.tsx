"use client";

import {
  Spinner,
  makeStyles,
  mergeClasses,
  tokens,
  type SpinnerProps,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  inline: {
    display: "inline-flex",
    alignItems: "center",
    verticalAlign: "middle",
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: "48px",
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
  },
});

export type AppSpinnerProps = Omit<SpinnerProps, "label"> & {
  layout?: "inline" | "centered";
  label?: string;
};

export default function AppSpinner({
  layout = "inline",
  size = "tiny",
  label = "Loading",
  className,
  ...props
}: AppSpinnerProps) {
  const styles = useStyles();
  const spinnerSize = layout === "centered" && size === "tiny" ? "small" : size;

  if (layout === "centered") {
    return (
      <div
        className={mergeClasses(styles.centered, className)}
        aria-busy="true"
        aria-label={label}
      >
        <Spinner size={spinnerSize} label={label} {...props} />
      </div>
    );
  }

  return (
    <span
      className={mergeClasses(styles.inline, className)}
      aria-busy="true"
      aria-label={label}
    >
      <Spinner size={spinnerSize} label={label} {...props} />
    </span>
  );
}
