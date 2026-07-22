"use client";

import { Hamburger, Tooltip, useRestoreFocusTarget } from "@fluentui/react-components";
import { useSidebar } from "@/context/SidebarContext";
import { useIsLargeScreen } from "@/hooks/useMediaQuery";

export default function SidebarToggle() {
  const { open, collapsed, toggle, toggleCollapsed } = useSidebar();
  const isLargeScreen = useIsLargeScreen();
  const restoreFocusTargetAttributes = useRestoreFocusTarget();
  const drawerOpen = isLargeScreen ? !collapsed : open;

  const handleToggle = () => {
    if (isLargeScreen) {
      toggleCollapsed();
      return;
    }
    toggle();
  };

  return (
    <Tooltip content="Toggle navigation" relationship="label">
      <Hamburger
        onClick={handleToggle}
        {...restoreFocusTargetAttributes}
        aria-expanded={drawerOpen}
        aria-label="Toggle navigation"
      />
    </Tooltip>
  );
}
