"use client";

import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField, AuthSubmitButton } from "@/components/auth/AuthFormFields";
import { primaryVariants, staggerTransition } from "@/components/auth/authMotion";

export default function SignInPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    window.setTimeout(() => {
      navigate("/overview");
    }, 600);
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
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                requiredMark
              />
            </motion.div>

            <motion.div variants={primaryVariants} className="mb-6 text-right">
              <button
                type="button"
                className="text-xs text-primary underline-offset-2 hover:underline"
              >
                Forgot password?
              </button>
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
