"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type SidebarContextType = {
  open: boolean;
  collapsed: boolean;
  toggle: () => void;
  close: () => void;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  open: false,
  collapsed: false,
  toggle: () => {},
  close: () => {},
  toggleCollapsed: () => {},
});

const STORAGE_KEY = "mor-sidebar-collapsed";

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed, hydrated]);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);
  const toggleCollapsed = useCallback(
    () => setCollapsed((prev) => !prev),
    []
  );

  return (
    <SidebarContext.Provider
      value={{ open, collapsed, toggle, close, toggleCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
