"use client";

import {
  Card as FluentCard,
  Caption1,
  CardFooter,
  CardHeader,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowTrending24Regular,
  ArrowTrendingDown24Regular,
} from "@fluentui/react-icons";
import CountUp from "react-countup";
import clsx from "clsx";
import AppBadge from "@/components/ui/AppBadge";
import StatCardSkeleton from "@/components/ui/skeletons/StatCardSkeleton";
import {
  CARD_APPEARANCE,
  CARD_FOCUS_MODE,
  useCardShellStyles,
} from "@/components/ui/cardShell";

interface CardProps {
  title: string;
  value: React.ReactNode;
  valueColor?: string;
  subtitle?: string;
  subtitleColor?: string;
  icon: React.ElementType;
  isLoading?: boolean;
  trend?: number;
  prefix?: string;
  suffix?: string;
  iconBg?: string;
  iconColor?: string;
  trendPosition?: "right" | "bottom";
  trendVariant?: "badge" | "text";
  className?: string;
  size?: "small" | "medium" | "large";
}

const useStyles = makeStyles({
  card: {
    position: "relative",
    overflow: "hidden",
  },
  value: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightBold,
    lineHeight: tokens.lineHeightHero800,
    color: tokens.colorNeutralForeground1,
  },
  trend: {
    display: "inline-flex",
    alignItems: "center",
  },
  subtitle: {
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightMedium,
  },
});

function TrendBadge({
  trend,
  variant,
}: {
  trend: number;
  variant: "badge" | "text";
}) {
  const styles = useStyles();
  const isPositive = trend > 0;
  const icon = isPositive ? (
    <ArrowTrending24Regular className="h-4 w-4" />
  ) : (
    <ArrowTrendingDown24Regular className="h-4 w-4" />
  );

  if (variant === "text") {
    return (
      <span
        className={clsx(
          styles.trend,
          isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
        )}
      >
        {icon}
        {Math.abs(trend)}%
      </span>
    );
  }

  return (
    <AppBadge
      className={styles.trend}
      appearance="tint"
      tone={isPositive ? "success" : "danger"}
      size="small"
      icon={icon}
    >
      {Math.abs(trend)}%
    </AppBadge>
  );
}

export default function Card({
  title,
  value,
  subtitle,
  subtitleColor = "text-muted-foreground",
  icon: Icon,
  isLoading = false,
  trend,
  prefix = "",
  suffix = "",
  iconBg,
  iconColor,
  trendPosition = "right",
  trendVariant = "badge",
  className,
  size = "medium",
}: CardProps) {
  const styles = useStyles();
  const shell = useCardShellStyles();

  const valueContent =
    typeof value === "number" ? (
      <CountUp
        end={value}
        duration={1.2}
        separator=","
        prefix={prefix}
        suffix={suffix}
      />
    ) : (
      value
    );

  const trendNode =
    typeof trend === "number" ? (
      <TrendBadge trend={trend} variant={trendVariant} />
    ) : null;

  return (
    <FluentCard
      appearance={CARD_APPEARANCE}
      size={size}
      focusMode={CARD_FOCUS_MODE}
      className={mergeClasses(shell.shell, styles.card, className)}
    >
      {isLoading ? (
        <div aria-busy="true">
          <StatCardSkeleton aria-label={`Loading ${title}`} />
        </div>
      ) : (
        <>
          <CardHeader
            image={
              <div className={mergeClasses(shell.iconWrap, iconBg)}>
                <Icon className={clsx("h-5 w-5", iconColor)} />
              </div>
            }
            header={
              <Text className={styles.value} style={{ margin: 0 }}>
                {valueContent}
              </Text>
            }
            description={<Caption1 className={shell.caption}>{title}</Caption1>}
            action={trendPosition === "right" ? trendNode : undefined}
          />

          {(subtitle || (trendPosition === "bottom" && trendNode)) && (
            <CardFooter className="!justify-between">
              {subtitle ? (
                <Caption1 className={clsx(styles.subtitle, subtitleColor)}>
                  {subtitle}
                </Caption1>
              ) : (
                <span />
              )}
              {trendPosition === "bottom" ? trendNode : null}
            </CardFooter>
          )}
        </>
      )}
    </FluentCard>
  );
}
