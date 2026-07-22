"use client";

import { Navigate, Outlet, useLocation } from "react-router-dom";
import AppSpinner from "@/components/ui/AppSpinner";
import { useAuth } from "@/context/AuthContext";
import { AUTH_ROUTES } from "@/middleware/authMiddleware";

export default function ProtectedRoute() {
  const { isAuthenticated, loading, isConfigured, isRecoverySession } = useAuth();
  const location = useLocation();

  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm font-semibold text-foreground">Supabase not configured</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add <code className="text-primary">VITE_SUPABASE_URL</code> and{" "}
            <code className="text-primary">VITE_SUPABASE_ANON_KEY</code> to your{" "}
            <code className="text-primary">.env</code> file, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <AppSpinner size="small" label="Checking session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.signIn} replace state={{ from: location.pathname }} />;
  }

  if (isRecoverySession && location.pathname !== AUTH_ROUTES.resetPassword) {
    return <Navigate to={AUTH_ROUTES.resetPassword} replace />;
  }

  return <Outlet />;
}
