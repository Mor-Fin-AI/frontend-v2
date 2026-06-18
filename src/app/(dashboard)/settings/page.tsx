"use client";

import { motion, type Variants } from "framer-motion";
import {
  Caption1,
  Switch,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Settings24Regular } from "@fluentui/react-icons";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardTopBar,
  PanelCardTopIcon,
} from "@/components/ui/PanelCard";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useTheme } from "@/context/ThemeContext";

const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const useStyles = makeStyles({
  section: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalL,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
  },
  rowCopy: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  rowTitle: {
    fontWeight: tokens.fontWeightSemibold,
    color: "var(--card-foreground)",
  },
  rowHint: {
    color: "var(--muted-foreground)",
  },
});

export default function SettingsPage() {
  const styles = useStyles();
  const { theme, toggleTheme, isDark } = useTheme();
  const { ref, controls } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      className="mt-6 flex flex-col gap-7"
    >
      <PanelCard>
        <PanelCardTopBar>
          <PanelCardTopIcon>
            <Settings24Regular className="h-5 w-5 text-primary" />
          </PanelCardTopIcon>
        </PanelCardTopBar>

        <PanelCardHeader
          title="Settings"
          description="Manage appearance and dashboard preferences"
        />

        <PanelCardBody className={styles.section}>
          <div className={styles.row}>
            <div className={styles.rowCopy}>
              <Text className={styles.rowTitle}>Dark mode</Text>
              <Caption1 className={styles.rowHint}>
                Switch between light and dark themes across the dashboard.
              </Caption1>
            </div>
            <Switch
              checked={isDark}
              onChange={() => toggleTheme()}
              label={theme === "dark" ? "On" : "Off"}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.rowCopy}>
              <Text className={styles.rowTitle}>Navigation drawer</Text>
              <Caption1 className={styles.rowHint}>
                Use the hamburger menu in the sidebar or top bar to expand and
                collapse the navigation drawer.
              </Caption1>
            </div>
          </div>
        </PanelCardBody>
      </PanelCard>
    </motion.div>
  );
}
