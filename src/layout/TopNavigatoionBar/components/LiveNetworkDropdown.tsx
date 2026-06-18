"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Caption1,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { Checkmark16Regular, ChevronDown16Regular } from "@fluentui/react-icons";
import ChainIcon from "@/components/evm/ChainIcon";
import { L2_EVM_CHAINS } from "@/lib/l2EvmChains";
import { useL2Chain } from "@/context/L2ChainContext";

const useStyles = makeStyles({
  root: {
    position: "relative",
    width: "fit-content",
  },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    minWidth: "160px",
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
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
  triggerLabel: {
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    flex: 1,
  },
  chainName: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase300,
    color: tokens.colorNeutralForeground1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "140px",
  },
  chevron: {
    display: "inline-flex",
    flexShrink: 0,
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
    width: "280px",
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
    right: "24px",
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
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "320px",
    overflowY: "auto",
    padding: tokens.spacingVerticalXS,
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    width: "100%",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
    border: "none",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: "transparent",
    color: tokens.colorNeutralForeground2,
    cursor: "pointer",
    textAlign: "left",
    transitionProperty: "background-color, color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: tokens.colorNeutralForeground1,
    },
  },
  optionSelected: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
    color: tokens.colorNeutralForeground1,
  },
  optionText: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    flex: 1,
  },
  check: {
    flexShrink: 0,
    color: tokens.colorBrandForeground1,
  },
});

export default function LiveNetworkDropdown() {
  const panelId = useId();
  const styles = useStyles();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { selectedChain, setSelectedChain, chain } = useL2Chain();

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

  const handleSelect = (slug: typeof selectedChain) => {
    setSelectedChain(slug);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={mergeClasses(styles.trigger, open && styles.triggerOpen)}
        aria-label="Select L2 network"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <ChainIcon chain={selectedChain} size={22} title={chain.name} />
        <span className={styles.triggerLabel}>
          <span className={styles.chainName}>{chain.name}</span>
        </span>
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

            <div id={panelId} className={styles.panel} role="listbox" aria-label="L2 networks">
              <div className={styles.header}>
                <Text weight="semibold">Select network</Text>
                <Caption1>Choose a chain to scope dashboard data</Caption1>
              </div>

              <div className={styles.list}>
                {L2_EVM_CHAINS.map((item) => {
                  const isSelected = item.slug === selectedChain;

                  return (
                    <button
                      key={item.slug}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={mergeClasses(
                        styles.option,
                        isSelected && styles.optionSelected
                      )}
                      onClick={() => handleSelect(item.slug)}
                    >
                      <ChainIcon chain={item.slug} size={20} title={item.name} />
                      <span className={styles.optionText}>
                        <Text size={300} weight={isSelected ? "semibold" : "regular"}>
                          {item.name}
                        </Text>
                        <Caption1>Chain ID {item.chainId}</Caption1>
                      </span>
                      {isSelected ? (
                        <Checkmark16Regular className={styles.check} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
