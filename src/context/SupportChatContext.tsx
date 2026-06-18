"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SupportChatContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
};

const SupportChatContext = createContext<SupportChatContextValue | undefined>(
  undefined
);

export function SupportChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => setOpen(false), []);
  const toggleChat = useCallback(() => setOpen((value) => !value), []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      openChat,
      closeChat,
      toggleChat,
    }),
    [open, openChat, closeChat, toggleChat]
  );

  return (
    <SupportChatContext.Provider value={value}>
      {children}
    </SupportChatContext.Provider>
  );
}

export function useSupportChatContext() {
  const context = useContext(SupportChatContext);

  if (!context) {
    throw new Error("useSupportChatContext must be used within SupportChatProvider");
  }

  return context;
}
