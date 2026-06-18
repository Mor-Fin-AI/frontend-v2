"use client";

import { useState } from "react";
import {
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { Shield24Regular } from "@fluentui/react-icons";
import AppBadge from "@/components/ui/AppBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAppToast } from "@/hooks/useAppToast";
import { killSwitchStatusMeta, type KillSwitchStatus } from "../data";

const useStyles = makeStyles({
  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalS,
  },
  description: {
    color: "var(--muted-foreground)",
    display: "block",
    marginTop: tokens.spacingVerticalXXS,
  },
  controlActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalM,
  },
  lastUpdated: {
    display: "block",
    marginTop: tokens.spacingVerticalM,
    color: "var(--muted-foreground)",
    fontSize: tokens.fontSizeBase100,
  },
  resumeButton: {
    backgroundColor: "var(--action-green)",
    color: "var(--action-green-foreground)",
    ":hover": {
      backgroundColor: "var(--action-green-hover)",
    },
    ":hover:active": {
      backgroundColor: "var(--action-green-hover)",
    },
  },
  killButton: {
    backgroundColor: "var(--destructive)",
    color: "#ffffff",
    ":hover": {
      opacity: 0.92,
    },
    ":hover:active": {
      opacity: 0.92,
    },
  },
});

type KillSwitchModalProps = {
  status: KillSwitchStatus;
  onStatusChange: (status: KillSwitchStatus) => void;
};

export default function KillSwitchModal({
  status,
  onStatusChange,
}: KillSwitchModalProps) {
  const styles = useStyles();
  const toast = useAppToast();
  const [open, setOpen] = useState(false);
  const [killConfirmOpen, setKillConfirmOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  );

  const meta = killSwitchStatusMeta[status];

  const setStatus = (next: KillSwitchStatus) => {
    onStatusChange(next);
    setLastUpdated(
      new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    );

    if (next === "running") {
      toast.success("Arbitrage resumed", "Automated execution is running again.");
    } else if (next === "paused") {
      toast.warning("Arbitrage paused", "Automated execution is temporarily paused.");
    } else if (next === "killed") {
      toast.error(
        "Kill switch activated",
        "All automated arbitrage execution has been halted."
      );
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={(_event, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="secondary" icon={<Shield24Regular />}>
          Kill Switch / Status Control
        </Button>
      </DialogTrigger>

      <DialogSurface aria-describedby={undefined}>
        <DialogBody>
          <div className={styles.header}>
            <div>
              <DialogTitle>Kill Switch / Status Control</DialogTitle>
              <Caption1 className={styles.description}>{meta.hint}</Caption1>
            </div>
            <AppBadge tone={meta.tone} appearance="tint" size="medium">
              {meta.label}
            </AppBadge>
          </div>

          <DialogContent>
            <div className={styles.controlActions}>
              <Button
                appearance="primary"
                className={styles.resumeButton}
                disabled={status === "running"}
                onClick={() => setStatus("running")}
              >
                Resume
              </Button>
              <Button
                appearance="secondary"
                disabled={status === "paused"}
                onClick={() => setStatus("paused")}
              >
                Pause
              </Button>
              <Button
                appearance="primary"
                className={mergeClasses(styles.killButton)}
                disabled={status === "killed"}
                onClick={() => setKillConfirmOpen(true)}
              >
                Activate Kill Switch
              </Button>
            </div>

            <Caption1 className={styles.lastUpdated}>
              Last status change: {lastUpdated}
            </Caption1>
          </DialogContent>

          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>

    <ConfirmDialog
      open={killConfirmOpen}
      onOpenChange={setKillConfirmOpen}
      modalType="alert"
      title="Activate kill switch?"
      description="This will immediately halt all automated arbitrage execution. Resume manually when it is safe to continue."
      confirmLabel="Activate kill switch"
      confirmAppearance="primary"
      onConfirm={() => {
        setStatus("killed");
        setKillConfirmOpen(false);
      }}
    />
  </>
  );
}
