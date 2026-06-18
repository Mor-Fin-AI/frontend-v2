"use client";

import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from "@fluentui/react-components";
import type { DashboardBannerConfig } from "../data/banner";

type GovernanceAnnouncementDialogProps = {
  banner: DashboardBannerConfig;
  triggerLabel: string;
};

export default function GovernanceAnnouncementDialog({
  banner,
  triggerLabel,
}: GovernanceAnnouncementDialogProps) {
  const dialogId = useId();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(_event, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="primary" size="small">
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogSurface
        aria-labelledby={`${dialogId}-title`}
        aria-describedby={`${dialogId}-content`}
      >
        <DialogBody>
          <DialogTitle id={`${dialogId}-title`}>{banner.title}</DialogTitle>
          <DialogContent id={`${dialogId}-content`}>
            <p>{banner.message}</p>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              onClick={() => {
                setOpen(false);
                navigate(banner.action?.href ?? "/governance");
              }}
            >
              {banner.action?.label ?? "View proposal"}
            </Button>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
