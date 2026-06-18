"use client";

import { useEffect, useState } from "react";
import { DismissRegular } from "@fluentui/react-icons";
import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarGroup,
  MessageBarTitle,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useSupportChatContext } from "@/context/SupportChatContext";
import GovernanceAnnouncementDialog from "./GovernanceAnnouncementDialog";
import {
  activeDashboardBanner,
  DASHBOARD_BANNER_STORAGE_KEY,
} from "../data/banner";

const useStyles = makeStyles({
  stickyWrap: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    marginBottom: tokens.spacingVerticalS,
    paddingTop: tokens.spacingVerticalXXS,
    backdropFilter: "blur(8px)",
  },
});

function readDismissedIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(DASHBOARD_BANNER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function persistDismissedIds(ids: string[]) {
  localStorage.setItem(DASHBOARD_BANNER_STORAGE_KEY, JSON.stringify(ids));
}

export default function DashboardStickyBanner() {
  const styles = useStyles();
  const { openChat } = useSupportChatContext();
  const [visible, setVisible] = useState(false);
  const banner = activeDashboardBanner;

  useEffect(() => {
    const dismissed = readDismissedIds();
    setVisible(!dismissed.includes(banner.id));
  }, [banner.id]);

  const dismiss = () => {
    const dismissed = readDismissedIds();
    if (!dismissed.includes(banner.id)) {
      persistDismissedIds([...dismissed, banner.id]);
    }
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.stickyWrap}>
      <MessageBarGroup animate="exit-only">
        <MessageBar intent={banner.intent ?? "info"} shape="square">
          <MessageBarBody>
            <MessageBarTitle>{banner.title}</MessageBarTitle>
            {banner.message}
          </MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="transparent"
                aria-label="Dismiss announcement"
                icon={<DismissRegular />}
                onClick={dismiss}
              />
            }
          >
            {banner.action?.href ? (
              <GovernanceAnnouncementDialog
                banner={banner}
                triggerLabel={banner.action.label}
              />
            ) : banner.action?.action === "support-chat" ? (
              <Button appearance="primary" size="small" onClick={openChat}>
                {banner.action.label}
              </Button>
            ) : null}
          </MessageBarActions>
        </MessageBar>
      </MessageBarGroup>
    </div>
  );
}
