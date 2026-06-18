"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  fetchAllTicketsAdmin,
  fetchUserTickets,
  type SupportTicket,
} from "@/lib/supportTickets";

type TicketScope = "user" | "admin";

type UseSupportTicketsOptions = {
  scope: TicketScope;
  userId?: string;
  enabled?: boolean;
};

export function useSupportTickets({
  scope,
  userId,
  enabled = true,
}: UseSupportTicketsOptions) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const loadTickets = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);

    const result =
      scope === "admin"
        ? await fetchAllTicketsAdmin()
        : await fetchUserTickets();

    setTickets(result.data);
    setError(result.error);
    setLoading(false);
  }, [enabled, scope]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    void loadTickets();
  }, [enabled, loadTickets]);

  useEffect(() => {
    if (!supabase || !enabled) {
      setIsLive(false);
      return;
    }

    if (scope === "user" && !userId) {
      setIsLive(false);
      return;
    }

    const channelName =
      scope === "admin"
        ? "support-tickets-admin"
        : `support-tickets-user-${userId}`;

    const filter =
      scope === "user" && userId
        ? `user_id=eq.${userId}`
        : undefined;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_tickets",
          ...(filter ? { filter } : {}),
        },
        (_payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          void loadTickets();
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      setIsLive(false);
      if (channelRef.current && supabase) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, loadTickets, scope, userId]);

  return {
    tickets,
    setTickets,
    loading,
    error,
    setError,
    isLive,
    reload: loadTickets,
  };
}
