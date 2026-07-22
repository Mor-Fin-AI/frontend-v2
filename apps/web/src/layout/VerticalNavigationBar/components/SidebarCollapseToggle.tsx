"use client";

import { Tooltip } from "@fluentui/react-components";
import {
  ChevronLeft24Regular,
  ChevronRight24Regular,
} from "@fluentui/react-icons";
import clsx from "clsx";
import { useSidebar } from "@/context/SidebarContext";
import { useIsLargeScreen } from "@/hooks/useMediaQuery";

export default function SidebarCollapseToggle() {
  const { collapsed, toggleCollapsed } = useSidebar();
  const isLargeScreen = useIsLargeScreen();
  const isCollapsed = collapsed && isLargeScreen;
  const label = isCollapsed ? "Expand sidebar" : "Collapse sidebar";

  const button = (
    <button
      type="button"
      onClick={toggleCollapsed}
      aria-label={label}
      className={clsx(
        "hidden lg:flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
        "mx-auto h-10 w-10"
      )}
    >
      {isCollapsed ? (
        <ChevronRight24Regular className="h-5 w-5" />
      ) : (
        <ChevronLeft24Regular className="h-5 w-5" />
      )}
    </button>
  );

  return (
    <Tooltip content={label} relationship="label" positioning="after">
      {button}
    </Tooltip>
  );
}
