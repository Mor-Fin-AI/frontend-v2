"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  fetchNotifications,
  mapRealtimeNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import type { NotificationItem } from "@/layout/TopNavigatoionBar/data/notifications";

type UseNotificationsOptions = {
  userId?: string;
  enabled?: boolean;
};

export function useNotifications({
  userId,
  enabled = true,
}: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await fetchNotifications();
    setNotifications(result.data);
    setError(result.error);
    setLoading(false);
  }, [enabled, userId]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!supabase || !enabled || !userId) {
      setIsLive(false);
      return;
    }

    const channel = supabase
      .channel(`notifications-user-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id?: string };
            if (oldRow.id) {
              setNotifications((current) =>
                current.filter((item) => item.id !== oldRow.id)
              );
            }
            return;
          }

          const row = payload.new as {
            id: string;
            title: string;
            message: string;
            type: NotificationItem["type"];
            read: boolean;
            href?: string | null;
            created_at: string;
          };

          const mapped = mapRealtimeNotification(row);

          setNotifications((current) => {
            const withoutExisting = current.filter((item) => item.id !== mapped.id);
            return [mapped, ...withoutExisting].sort((a, b) => {
              const aTime = a.time.includes("ago") ? 0 : 1;
              const bTime = b.time.includes("ago") ? 0 : 1;
              return aTime - bTime;
            });
          });
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
  }, [enabled, userId]);

  const markRead = useCallback(async (notificationId: string) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item
      )
    );

    const result = await markNotificationRead(notificationId);
    if (result.error) {
      void loadNotifications();
    }
  }, [loadNotifications]);

  const markAllRead = useCallback(async () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));

    const result = await markAllNotificationsRead();
    if (result.error) {
      void loadNotifications();
    }
  }, [loadNotifications]);

  return {
    notifications,
    loading,
    error,
    isLive,
    reload: loadNotifications,
    markRead,
    markAllRead,
  };
}
