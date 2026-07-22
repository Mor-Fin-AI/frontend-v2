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
  Field,
  Input,
  Spinner,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Send24Regular } from "@fluentui/react-icons";
import AppBadge from "@/components/ui/AppBadge";
import { useAppToast } from "@/hooks/useAppToast";

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
  preview: {
    color: "var(--muted-foreground)",
    display: "block",
    marginTop: tokens.spacingVerticalM,
  },
  sendButton: {
    backgroundColor: "var(--action-green)",
    color: "var(--action-green-foreground)",
    ":hover": {
      backgroundColor: "var(--action-green-hover)",
    },
    ":hover:active": {
      backgroundColor: "var(--action-green-hover)",
    },
  },
});

function formatUsd(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

type TestFeeSendModalProps = {
  feeRatePercent: number;
};

export default function TestFeeSendModal({ feeRatePercent }: TestFeeSendModalProps) {
  const styles = useStyles();
  const toast = useAppToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("1000");
  const [isSending, setIsSending] = useState(false);

  const previewFee = (() => {
    const parsed = Number.parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed * (feeRatePercent / 100);
  })();

  const handleOpenChange = (_event: unknown, data: { open: boolean }) => {
    setOpen(data.open);
    if (!data.open) {
      setIsSending(false);
    }
  };

  const handleSendTestFee = async () => {
    const parsed = Number.parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error(
        "Invalid amount",
        "Enter a valid transaction amount greater than zero."
      );
      return;
    }

    setIsSending(true);

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    const feeAmount = parsed * (feeRatePercent / 100);
    setIsSending(false);
    toast.success(
      "Test fee send succeeded",
      `${formatUsd(parsed)} volume captured → ${formatUsd(feeAmount)} (${feeRatePercent}%) routed to treasury.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="primary" icon={<Send24Regular />} className={styles.sendButton}>
          Test Fee Send
        </Button>
      </DialogTrigger>

      <DialogSurface aria-describedby={undefined}>
        <DialogBody>
          <div className={styles.header}>
            <div>
              <DialogTitle>Test Fee Send Function</DialogTitle>
              <Caption1 className={styles.description}>
                Simulate a fee capture event and verify the {feeRatePercent}% treasury
                routing pipeline.
              </Caption1>
            </div>
            <AppBadge tone="brand" appearance="tint" size="small">
              Sandbox
            </AppBadge>
          </div>

          <DialogContent>
            <Field label="Transaction volume (USD)">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={amount}
                onChange={(_event, data) => setAmount(data.value)}
                placeholder="1000"
              />
            </Field>

            {previewFee !== null ? (
              <Caption1 className={styles.preview}>
                Preview: {formatUsd(previewFee)} fee will route to treasury at{" "}
                {feeRatePercent}%.
              </Caption1>
            ) : null}
          </DialogContent>

          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              className={styles.sendButton}
              disabled={isSending}
              icon={isSending ? <Spinner size="extra-tiny" /> : <Send24Regular />}
              onClick={() => void handleSendTestFee()}
            >
              {isSending ? "Sending..." : "Send Test Fee"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
