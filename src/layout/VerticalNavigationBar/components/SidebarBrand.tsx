"use client";

import { Link } from "react-router-dom";
import clsx from "clsx";
import { Tooltip } from "@fluentui/react-components";
import { useSidebar } from "@/context/SidebarContext";
import { useIsLargeScreen } from "@/hooks/useMediaQuery";

const LOGO_SRC = "/sidebar/side-logo.png";

function BrandIcon() {
  return (
    <span className="inline-flex h-9 w-[42px] shrink-0 items-center justify-center overflow-hidden">
      <img
        src={LOGO_SRC}
        alt=""
        aria-hidden
        className="h-9 w-auto max-w-none -translate-x-px select-none"
        draggable={false}
      />
    </span>
  );
}

export default function SidebarBrand() {
  const { collapsed } = useSidebar();
  const isLargeScreen = useIsLargeScreen();
  const isCollapsed = collapsed && isLargeScreen;

  const brand = (
    <Link
      to="/overview"
      className={clsx(
        "flex items-center transition-all duration-300",
        isCollapsed
          ? "mx-auto h-10 w-10 justify-center"
          : "mx-auto h-10 min-h-10 justify-center gap-2.5 px-1"
      )}
      aria-label="Morfinance home"
    >
      {/* <BrandIcon /> */}
      {!isCollapsed && (
        <span className="whitespace-nowrap text-[17px] font-semibold leading-none tracking-[-0.02em] text-sidebar-foreground transition-colors duration-300">
          Morfinance
        </span>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip content="Morfinance" relationship="label" positioning="after" withArrow>
        {brand}
      </Tooltip>
    );
  }

  return brand;
}
