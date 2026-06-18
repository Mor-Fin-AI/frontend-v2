"use client";

import { motion, Variants } from "framer-motion";
import {
  Caption1,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import type { PricingTier } from "../data";
import { FeatureItem } from "./FeatureItem";
import AppBadge from "@/components/ui/AppBadge";
import NeuButton from "@/components/ui/NeuButton";
import PanelCard, {
  PanelCardBody,
  PanelCardFooter,
  PanelCardHeader,
  PanelCardTopBar,
  PanelCardTopIcon,
} from "@/components/ui/PanelCard";

const useStyles = makeStyles({
  glow: {
    pointerEvents: "none",
    position: "absolute",
    top: "-80px",
    right: "-80px",
    width: "224px",
    height: "224px",
    borderRadius: "9999px",
    opacity: 0.16,
    filter: "blur(48px)",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  priceRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingVerticalXS,
  },
  divider: {
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    marginTop: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalL,
  },
  featuresLabel: {
    marginBottom: tokens.spacingVerticalM,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase100,
  },
  price: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
  },
  highlight: {
    marginBottom: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground2,
    fontWeight: tokens.fontWeightMedium,
  },
  features: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalXXL,
    flex: 1,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "1fr 1fr",
      columnGap: tokens.spacingHorizontalL,
    },
  },
});

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function PricingCard({ tier }: { tier: PricingTier }) {
  const { ref, controls } = useScrollAnimation();
  const styles = useStyles();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={cardVariant}
      className="h-full"
    >
      <PanelCard className="relative h-full overflow-hidden">
        <div className={styles.glow} style={{ background: tier.accentColor }} />

        <PanelCardTopBar>
          <div className={styles.badgeRow}>
            <PanelCardTopIcon>
              <tier.icon size={18} />
            </PanelCardTopIcon>
            <AppBadge appearance="tint" tone="neutral" size="small">
              • {tier.badge}
            </AppBadge>
          </div>
        </PanelCardTopBar>

        <PanelCardHeader
          title={tier.label}
          description={tier.description}
          headingAs="h5"
        />

        <PanelCardBody className="relative">
          <div className={styles.priceRow}>
            <span className={styles.price}>${tier.price}</span>
            <Caption1>{tier.priceSuffix}</Caption1>
          </div>

          <Caption1 className={styles.highlight}>
            <span>↑ </span>
            {tier.highlight}
          </Caption1>

          <div className={styles.divider} />

          <p className={styles.featuresLabel}>{tier.sectionLabel}</p>

          <ul className={styles.features}>
            {tier.features.map((f) => (
              <FeatureItem key={f.text} text={f.text} />
            ))}
          </ul>
        </PanelCardBody>

        <PanelCardFooter className="!justify-stretch">
          <NeuButton href={tier.ctaHref} variant="primary" fullWidth>
            {tier.ctaLabel} →
          </NeuButton>
        </PanelCardFooter>
      </PanelCard>
    </motion.div>
  );
}
