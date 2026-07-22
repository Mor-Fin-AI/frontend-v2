"use client";

import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField, AuthSubmitButton } from "@/components/auth/AuthFormFields";
import ForgotPasswordDialog from "@/components/auth/ForgotPasswordDialog";
import { primaryVariants, staggerTransition } from "@/components/auth/authMotion";
import AppSpinner from "@/components/ui/AppSpinner";
import { useAuth } from "@/context/AuthContext";
import { useAppToast } from "@/hooks/useAppToast";
import { AUTH_ROUTES } from "@/middleware/authMiddleware";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading, isRecoverySession, updatePassword } = useAuth();
  const toast = useAppToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canReset = Boolean(session && isRecoverySession);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8) {
      setIsSubmitting(false);
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setIsSubmitting(false);
      setError("Passwords do not match.");
      return;
    }

    const { error: updateError } = await updatePassword(password);
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError);
      toast.error("Password not updated", updateError);
      return;
    }

    toast.success("Password updated", "You can now use your new password.");
    navigate(AUTH_ROUTES.dashboard, { replace: true });
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <AppSpinner size="small" label="Verifying reset link" />
        </div>
      </AuthLayout>
    );
  }

  if (!canReset) {
    return (
      <AuthLayout>
        <motion.div
          initial="initial"
          whileInView="animate"
          transition={staggerTransition}
          viewport={{ once: true }}
          className="flex items-center justify-center pb-4 pt-24 md:py-20"
        >
          <div className="mx-auto w-full max-w-lg px-4 text-center md:pr-0">
            <motion.h1
              variants={primaryVariants}
              className="mb-2 text-3xl font-semibold text-foreground"
            >
              Reset link expired
            </motion.h1>
            <motion.p variants={primaryVariants} className="mb-6 text-muted-foreground">
              This password reset link is invalid or has expired. Request a new link from the
              sign-in page.
            </motion.p>
            <motion.div variants={primaryVariants} className="flex flex-col items-center gap-3">
              <Link
                to={AUTH_ROUTES.signIn}
                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                Back to sign in
              </Link>
              <ForgotPasswordDialog />
            </motion.div>
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div
        initial="initial"
        whileInView="animate"
        transition={staggerTransition}
        viewport={{ once: true }}
        className="flex items-center justify-center pb-4 pt-24 md:py-20"
      >
        <div className="mx-auto my-auto w-full max-w-lg px-4 md:pr-0">
          <motion.h1
            variants={primaryVariants}
            className="mb-2 text-center text-4xl font-semibold text-foreground"
          >
            Set a new password
          </motion.h1>
          <motion.p variants={primaryVariants} className="mb-8 text-center text-muted-foreground">
            Choose a new password for your Morfinance account
          </motion.p>

          <form onSubmit={handleSubmit} className="w-full">
            <motion.div variants={primaryVariants} className="mb-3">
              <AuthField
                label="New password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                requiredMark
                minLength={8}
              />
            </motion.div>

            <motion.div variants={primaryVariants} className="mb-2">
              <AuthField
                label="Confirm password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                required
                requiredMark
                minLength={8}
              />
            </motion.div>

            {error ? (
              <motion.p
                variants={primaryVariants}
                className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </motion.p>
            ) : null}

            <motion.div variants={primaryVariants}>
              <AuthSubmitButton loading={isSubmitting} loadingLabel="Updating password">
                Update password
              </AuthSubmitButton>
            </motion.div>

            <motion.p variants={primaryVariants} className="mt-4 text-center text-xs text-muted-foreground">
              <Link to={AUTH_ROUTES.signIn} className="text-primary underline-offset-2 hover:underline">
                Back to sign in
              </Link>
            </motion.p>
          </form>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
