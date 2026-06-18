"use client";

import { useId } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Spinner,
  type ButtonProps,
  type DialogProps,
} from "@fluentui/react-components";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmAppearance?: ButtonProps["appearance"];
  modalType?: DialogProps["modalType"];
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmAppearance = "primary",
  modalType = "modal",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogId = useId();

  return (
    <Dialog
      open={open}
      onOpenChange={(_event, data) => onOpenChange(data.open)}
      modalType={modalType}
    >
      <DialogSurface
        aria-labelledby={`${dialogId}-title`}
        aria-describedby={`${dialogId}-content`}
      >
        <DialogBody>
          <DialogTitle id={`${dialogId}-title`}>{title}</DialogTitle>
          <DialogContent id={`${dialogId}-content`}>
            <p>{description}</p>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="secondary"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              appearance={confirmAppearance}
              disabled={loading}
              icon={loading ? <Spinner size="extra-tiny" /> : undefined}
              onClick={() => void onConfirm()}
            >
              {confirmLabel}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
