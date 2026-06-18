"use client";

import React from "react";
import { Link } from "react-router-dom";
import {
  Card as FluentCard,
  Caption1,
  CardFooter,
  CardHeader,
  Text,
  type CardHeaderProps,
  type CardProps,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import {
  CARD_APPEARANCE,
  CARD_FOCUS_MODE,
  useCardShellStyles,
} from "@/components/ui/cardShell";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
    height: "fit-content",
    minHeight: 0,
  },
  topBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    flex: 1,
    minWidth: 0,
    width: "100%",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalS,
    width: "100%",
  },
  footerMeta: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
  },
  fillHeight: {
    height: "100%",
  },
  headerMeta: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground3,
    whiteSpace: "nowrap",
  },
  headerLink: {
    border: "none",
    backgroundColor: "var(--action-green)",
    color: "var(--action-green-foreground)",
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXXS,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    whiteSpace: "nowrap",
    textDecoration: "none",
    boxShadow: "var(--action-green-shadow)",
    transitionProperty: "background-color, box-shadow, transform",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "var(--action-green-hover)",
      boxShadow: "none",
      transform: "translate(3px, 3px)",
    },
    ":focus-visible": {
      outline: `2px solid var(--action-green)`,
      outlineOffset: "2px",
    },
  },
  cardHeader: {
    flexWrap: "nowrap",
    alignItems: "flex-start",
  },
  cardHeaderAction: {
    flexShrink: 0,
    alignSelf: "center",
    whiteSpace: "nowrap",
  },
});

/** @deprecated Tones are unified; all panel cards share the same shell. */
export type PanelTone = "default" | "subtle" | "solid" | "outline";

export type PanelCardProps = Omit<CardProps, "appearance"> & {
  tone?: PanelTone;
  appearance?: CardProps["appearance"];
};

export default function PanelCard({
  className,
  tone: _tone,
  appearance = CARD_APPEARANCE,
  size = "large",
  focusMode = CARD_FOCUS_MODE,
  children,
  ...props
}: PanelCardProps) {
  const styles = useStyles();
  const shell = useCardShellStyles();

  return (
    <FluentCard
      appearance={appearance}
      size={size}
      focusMode={focusMode}
      className={mergeClasses(
        shell.shell,
        styles.root,
        className?.includes("h-full") && styles.fillHeight,
        className
      )}
      {...props}
    >
      {children}
    </FluentCard>
  );
}

type PanelCardTopBarProps = {
  children: React.ReactNode;
  className?: string;
};

export function PanelCardTopBar({ children, className }: PanelCardTopBarProps) {
  const styles = useStyles();
  return <header className={mergeClasses(styles.topBar, className)}>{children}</header>;
}

type PanelCardTopIconProps = {
  children: React.ReactNode;
  className?: string;
};

export function PanelCardTopIcon({ children, className }: PanelCardTopIconProps) {
  const shell = useCardShellStyles();
  return (
    <span className={mergeClasses(shell.topBarIcon, className)}>{children}</span>
  );
}

type PanelCardHeaderProps = {
  title: string;
  description?: React.ReactNode;
  action?: CardHeaderProps["action"];
  image?: CardHeaderProps["image"];
  headerSlot?: React.ReactNode;
  className?: string;
  headingAs?: "h3" | "h4" | "h5";
};

export function PanelCardHeader({
  title,
  description,
  action,
  image,
  headerSlot,
  className,
  headingAs = "h5",
}: PanelCardHeaderProps) {
  const styles = useStyles();
  const shell = useCardShellStyles();

  return (
    <>
      {headerSlot ? (
        <PanelCardTopBar>{headerSlot}</PanelCardTopBar>
      ) : null}

      <CardHeader
        className={mergeClasses(styles.cardHeader, className)}
        image={image}
        header={
          <Text as={headingAs} weight="semibold" style={{ margin: 0 }}>
            {title}
          </Text>
        }
        description={
          description ? (
            typeof description === "string" ? (
              <Caption1 className={shell.caption}>{description}</Caption1>
            ) : (
              <div className={shell.caption}>{description}</div>
            )
          ) : undefined
        }
        action={action}
      />
    </>
  );
}

type PanelCardBodyProps = {
  children: React.ReactNode;
  className?: string;
};

export function PanelCardBody({ children, className }: PanelCardBodyProps) {
  const styles = useStyles();
  return <div className={mergeClasses(styles.body, className)}>{children}</div>;
}

type PanelCardFooterProps = {
  children?: React.ReactNode;
  start?: React.ReactNode;
  end?: React.ReactNode;
  className?: string;
};

export function PanelCardHeaderMeta({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return <Caption1 className={styles.headerMeta}>{children}</Caption1>;
}

export function PanelCardHeaderLink({
  children,
  onClick,
  href,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const styles = useStyles();
  const classes = mergeClasses(styles.headerLink, className);

  if (href) {
    return (
      <Link to={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  );
}

export function PanelCardFooter({
  children,
  start,
  end,
  className,
}: PanelCardFooterProps) {
  const styles = useStyles();

  if (start !== undefined || end !== undefined) {
    return (
      <footer className={mergeClasses(styles.footer, className)}>
        <span className={styles.footerMeta}>{start}</span>
        <span className={styles.footerMeta}>{end}</span>
      </footer>
    );
  }

  return (
    <CardFooter className={mergeClasses(styles.footer, className)}>
      {children}
    </CardFooter>
  );
}
