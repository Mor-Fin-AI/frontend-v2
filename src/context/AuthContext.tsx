"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { isAdminRole } from "@/middleware/authMiddleware";
import type { Profile, UserRole } from "@/types/database";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  isRecoverySession: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile:", error.message);
    return null;
  }

  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }

    const nextProfile = await fetchProfile(session.user.id);
    setProfile(nextProfile);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") === "recovery") {
      setIsRecoverySession(true);
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoverySession(true);
      }
      if (event === "SIGNED_OUT") {
        setIsRecoverySession(false);
      }
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }

    void refreshProfile();
  }, [session?.user?.id, refreshProfile]);

  useEffect(() => {
    if (!supabase || !session?.user?.id) return;

    const channel = supabase
      .channel(`profile-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase!.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: "Supabase is not configured." };
    }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (!error) {
    return { error: null };
  }

  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return {
      error:
        "Invalid email or password. If you have not run npm run seed:user yet, create the demo account first or register at /register.",
    };
  }

  if (message.includes("email not confirmed")) {
    return {
      error:
        "Email not confirmed. Check your inbox for the confirmation link, or ask an admin to confirm your account in Supabase.",
    };
  }

  return { error: error.message };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: "Supabase is not configured." };
    }

    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: "Supabase is not configured." };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) {
      return { error: "Supabase is not configured." };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      setIsRecoverySession(false);
    }
    return { error: error?.message ?? null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isAuthenticated: Boolean(session?.user),
      isAdmin: isAdminRole(profile?.role as UserRole | undefined),
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      isRecoverySession,
      refreshProfile,
    }),
    [session, profile, loading, isRecoverySession, signIn, signUp, signOut, resetPassword, updatePassword, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
