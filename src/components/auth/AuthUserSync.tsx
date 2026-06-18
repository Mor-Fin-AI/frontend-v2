"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";

export default function AuthUserSync() {
  const { user, profile } = useAuth();
  const { setUser } = useUser();

  useEffect(() => {
    if (!user) return;

    const email = profile?.email ?? user.email ?? "";
    const displayName =
      profile?.full_name?.trim() || email.split("@")[0] || "User";

    setUser((prev) => ({
      ...prev,
      name: prev.isWalletConnected ? prev.name : displayName,
      address: prev.isWalletConnected ? prev.address : email || prev.address,
      role: profile?.role ?? prev.role ?? "user",
    }));
  }, [user, profile, setUser]);

  return null;
}
