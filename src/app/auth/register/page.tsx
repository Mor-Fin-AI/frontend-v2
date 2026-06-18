"use client";

import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField, AuthSubmitButton } from "@/components/auth/AuthFormFields";
import { primaryVariants, staggerTransition } from "@/components/auth/authMotion";
import { useAuth } from "@/context/AuthContext";
import { useAppToast } from "@/hooks/useAppToast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const toast = useAppToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setIsSubmitting(false);
      setError("Passwords do not match.");
      toast.error("Passwords do not match", "Re-type your password to match.");
      return;
    }

    const { error: signUpError } = await signUp(email, password);
    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      toast.error("Account not created", signUpError);
      return;
    }

    toast.success(
      "Account created",
      "Check your email to confirm, then sign in."
    );
    window.setTimeout(() => navigate("/sign-in"), 1200);
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
            Create your account
          </motion.h1>
          <motion.p variants={primaryVariants} className="mb-8 text-center text-muted-foreground">
            Join the Morfinance community — free to get started
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

            <motion.div variants={primaryVariants} className="mb-3">
              <AuthField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                required
                requiredMark
              />
            </motion.div>

            <motion.div variants={primaryVariants} className="mb-4">
              <AuthField
                label="Re-type Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-type your password"
                autoComplete="new-password"
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

            <motion.div
              variants={primaryVariants}
              className="mb-5 flex w-full items-start gap-2"
            >
              <input
                type="checkbox"
                id="terms-checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                required
              />
              <label htmlFor="terms-checkbox" className="text-xs leading-relaxed text-muted-foreground">
                By signing up, I agree to the terms and conditions, privacy policy,
                and cookie policy
              </label>
            </motion.div>

            <motion.div variants={primaryVariants}>
              <AuthSubmitButton loading={isSubmitting} loadingLabel="Creating account">
                Sign up
              </AuthSubmitButton>
            </motion.div>

            <motion.p variants={primaryVariants} className="mt-4 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-primary underline-offset-2 hover:underline">
                Sign in
              </Link>
            </motion.p>
          </form>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
