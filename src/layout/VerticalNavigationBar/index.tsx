"use client";

import NavDrawerMenu from "./components/NavDrawerMenu";
import { useSidebar } from "@/context/SidebarContext";
import { useIsLargeScreen } from "@/hooks/useMediaQuery";

export default function VerticalNavigationBar() {
  const { open, close } = useSidebar();
  const isLargeScreen = useIsLargeScreen();

  return (
    <>
      {open && !isLargeScreen ? (
        <div
          onClick={close}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden
        />
      ) : null}

      <NavDrawerMenu />
    </>
  );
}
