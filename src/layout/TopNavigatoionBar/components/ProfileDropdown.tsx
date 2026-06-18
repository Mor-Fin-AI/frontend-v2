"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDisconnect, useAccount, useEnsName } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import {
  Caption1,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import AppSpinner from "@/components/ui/AppSpinner";
import ProfilePersona from "@/components/wallet/ProfilePersona";
import { ChevronDown16Regular, SignOut24Regular } from "@fluentui/react-icons";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ui/ThemeToggle";

const AVATAR_SIZE = "small" as const;

const useStyles = makeStyles({
  root: {
    position: "relative",
    width: "fit-content",
  },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalXS} ${tokens.spacingVerticalXXS} ${tokens.spacingVerticalXXS}`,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
    cursor: "pointer",
    transitionProperty: "background-color, border-color, color, box-shadow",
    transitionDuration: "200ms",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      borderTopColor: tokens.colorNeutralStroke1,
      borderRightColor: tokens.colorNeutralStroke1,
      borderBottomColor: tokens.colorNeutralStroke1,
      borderLeftColor: tokens.colorNeutralStroke1,
      color: tokens.colorNeutralForeground1,
    },
    ":focus-visible": {
      outline: `2px solid ${tokens.colorBrandStroke1}`,
      outlineOffset: "2px",
    },
  },
  triggerOpen: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
    borderTopColor: tokens.colorNeutralStroke1,
    borderRightColor: tokens.colorNeutralStroke1,
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftColor: tokens.colorNeutralStroke1,
    color: tokens.colorNeutralForeground1,
    boxShadow: tokens.shadow2,
  },
  chevron: {
    display: "inline-flex",
    marginRight: tokens.spacingHorizontalXXS,
    transitionProperty: "transform",
    transitionDuration: "200ms",
  },
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  flyout: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 10px)",
    zIndex: 50,
    width: "260px",
    maxWidth: "calc(100vw - 24px)",
  },
  bridge: {
    position: "absolute",
    top: "-12px",
    left: 0,
    right: 0,
    height: "12px",
    backgroundColor: "transparent",
  },
  arrow: {
    position: "absolute",
    right: "18px",
    top: 0,
    width: "12px",
    height: "12px",
    transform: "translateY(-50%) rotate(45deg)",
    backgroundColor: tokens.colorNeutralBackground2,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    borderLeft: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  panel: {
    overflow: "hidden",
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    boxShadow: tokens.shadow16,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    padding: tokens.spacingVerticalXS,
  },
  menuItem: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    border: "none",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: "transparent",
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightRegular,
    color: tokens.colorNeutralForeground2,
    textAlign: "left",
    cursor: "pointer",
    transitionProperty: "background-color, color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: tokens.colorNeutralForeground1,
    },
  },
  themeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    margin: `0 ${tokens.spacingHorizontalXS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  themeLabel: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  themeTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground1,
  },
  themeHint: {
    color: tokens.colorNeutralForeground3,
  },
  divider: {
    height: "1px",
    margin: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralStroke2,
  },
  signOut: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    color: tokens.colorPaletteRedForeground1,
    ":hover": {
      backgroundColor: tokens.colorPaletteRedBackground1,
      color: tokens.colorPaletteRedForeground1,
    },
  },
});

const defaultUser = {
  name: "",
  address: "Not connected",
  role: "",
  isWalletConnected: false,
};

function getAvatarName(name: string, isConnected: boolean) {
  if (name && name !== "Guest") return name;
  return isConnected ? "User" : "Account";
}

export default function ProfileDropdown() {
  const panelId = useId();
  const navigate = useNavigate();
  const styles = useStyles();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { user, setUser } = useUser();
  const { theme } = useTheme();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { isLoading: isEnsLoading } = useEnsName({
    address,
    query: { enabled: isConnected && !!address },
  });

  const walletAddress =
    isConnected && address ? address : user.fullAddress ?? null;

  const avatarName = getAvatarName(user.name, !!user.isWalletConnected);
  const displayName =
    user.name && user.name !== "Guest" ? user.name : avatarName;
  const showNameLoading = isConnected && !!address && isEnsLoading;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSignOut = () => {
    if (user.isWalletConnected) {
      disconnect();
    }
    setUser(defaultUser);
    setOpen(false);
  };

  const navigateTo = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={mergeClasses(styles.trigger, open && styles.triggerOpen)}
        aria-label="Open account menu"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <ProfilePersona
          address={walletAddress}
          name={avatarName}
          size={AVATAR_SIZE}
          variant="compact"
        />
        <ChevronDown16Regular
          className={mergeClasses(styles.chevron, open && styles.chevronOpen)}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.flyout}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className={styles.bridge} aria-hidden />
            <span className={styles.arrow} aria-hidden />

            <div id={panelId} className={styles.panel} role="menu">
              <div className={styles.header}>
                <ProfilePersona
                  address={walletAddress}
                  name={displayName}
                  size="medium"
                  variant="full"
                  secondaryText={user.address || "Not connected"}
                  primaryText={
                    showNameLoading ? (
                      <AppSpinner size="extra-tiny" label="Loading profile name" />
                    ) : undefined
                  }
                />
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  role="menuitem"
                  className={styles.menuItem}
                  onClick={() => navigateTo("/overview")}
                >
                  Treasury Flow
                </button>
              </div>

              <div className={styles.themeRow}>
                <div className={styles.themeLabel}>
                  <Text className={styles.themeTitle}>Theme</Text>
                  <Caption1 className={styles.themeHint}>
                    {theme === "dark" ? "Dark mode" : "Light mode"}
                  </Caption1>
                </div>
                <ThemeToggle />
              </div>

              <div className={styles.divider} />

              <div className={styles.section}>
                <button
                  type="button"
                  role="menuitem"
                  className={mergeClasses(styles.menuItem, styles.signOut)}
                  onClick={handleSignOut}
                >
                  <SignOut24Regular className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
