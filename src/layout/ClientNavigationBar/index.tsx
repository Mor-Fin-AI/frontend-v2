"use client";

import { Link } from "react-router-dom";
import clsx from "clsx";
import { Tooltip } from "@fluentui/react-components";
import { useSidebar } from "@/context/SidebarContext";
import { useIsLargeScreen } from "@/hooks/useMediaQuery";
import { Dismiss24Regular, ArrowLeft24Regular } from "@fluentui/react-icons";
import { clientSidebarMenu } from "./menu";
import AppMenu from "@/layout/VerticalNavigationBar/components/AppMenu";
import SidebarBrand from "@/layout/VerticalNavigationBar/components/SidebarBrand";
import SidebarCollapseToggle from "@/layout/VerticalNavigationBar/components/SidebarCollapseToggle";

export default function ClientNavigationBar() {
  const { open, collapsed, close } = useSidebar();
  const isLargeScreen = useIsLargeScreen();
  const isCollapsed = collapsed && isLargeScreen;

  const backLink = (
    <Link
      to="/overview"
      className={clsx(
        "flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground",
        isCollapsed
          ? "mx-auto h-10 w-10 justify-center rounded-lg p-2.5"
          : "mb-6 gap-2"
      )}
      aria-label="Back to User Dashboard"
    >
      <ArrowLeft24Regular className="h-4 w-4 shrink-0" />
      {!isCollapsed && <span>Back to User Dashboard</span>}
    </Link>
  );

  return (
    <>
      {open && (
        <div
          onClick={close}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-sidebar-border bg-sidebar",
          "transform transition-all duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0 lg:h-screen",
          "w-64",
          isCollapsed && "lg:w-[72px]"
        )}
      >
        <div
          className={clsx(
            "flex h-full flex-col",
            isCollapsed ? "px-2 py-4" : "px-4 py-6"
          )}
        >
          <div className="relative mb-6 flex min-h-10 items-center justify-center pr-10 lg:pr-0">
            <SidebarBrand />

            <button
              onClick={close}
              className="absolute right-0 text-muted-foreground hover:text-foreground lg:hidden"
              aria-label="Close sidebar"
            >
              <Dismiss24Regular className="h-5 w-5" />
            </button>
          </div>

          {isCollapsed ? (
            <Tooltip
              content="Back to User Dashboard"
              relationship="label"
              positioning="after"
              withArrow
            >
              {backLink}
            </Tooltip>
          ) : (
            backLink
          )}

          {!isCollapsed && (
            <p className="mb-3 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Client Portal
            </p>
          )}

          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <AppMenu items={clientSidebarMenu} />
          </div>
        </div>

        <div
          className={clsx(
            "border-t border-sidebar-border",
            isCollapsed ? "p-2" : "p-3"
          )}
        >
          <SidebarCollapseToggle />
        </div>
      </aside>
    </>
  );
}
