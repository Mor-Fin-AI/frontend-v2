"use client";

import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField, AuthSubmitButton } from "@/components/auth/AuthFormFields";
import ForgotPasswordDialog from "@/components/auth/ForgotPasswordDialog";
import { primaryVariants, staggerTransition } from "@/components/auth/authMotion";
import { useAuth } from "@/context/AuthContext";
import { useAppToast } from "@/hooks/useAppToast";

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const toast = useAppToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from =
    (location.state as { from?: string } | null)?.from ?? "/overview";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error: signInError } = await signIn(email, password);
    setIsSubmitting(false);

    if (signInError) {
      setError(signInError);
      toast.error("Sign in failed", signInError);
      return;
    }

    toast.success("Welcome back", "Signed in successfully.");
    navigate(from, { replace: true });
  };

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
            Welcome back
          </motion.h1>
          <motion.p variants={primaryVariants} className="mb-8 text-center text-muted-foreground">
            Sign in to your Morfinance account
          </motion.p>

          <form onSubmit={handleSubmit} className="w-full">
            <motion.div variants={primaryVariants} className="mb-3">
              <AuthField
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
                requiredMark
              />
            </motion.div>

            <motion.div variants={primaryVariants} className="mb-2">
              <AuthField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                requiredMark
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

            <motion.div variants={primaryVariants} className="mb-6 text-right">
              <ForgotPasswordDialog />
            </motion.div>

            <motion.div variants={primaryVariants}>
              <AuthSubmitButton loading={isSubmitting} loadingLabel="Signing in">
                Sign in
              </AuthSubmitButton>
            </motion.div>

            <motion.p variants={primaryVariants} className="mt-4 text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-primary underline-offset-2 hover:underline">
                Create account
              </Link>
            </motion.p>
          </form>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
