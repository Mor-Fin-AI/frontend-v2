"use client";

import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField, AuthSubmitButton } from "@/components/auth/AuthFormFields";
import { primaryVariants, staggerTransition } from "@/components/auth/authMotion";

export default function RegisterPage() {
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
            Create your account
          </motion.h1>
          <motion.p variants={primaryVariants} className="mb-8 text-center text-muted-foreground">
            Join the Morfinance community — free to get started
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

            <motion.div variants={primaryVariants} className="mb-3">
              <AuthField
                label="Password"
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
                type="password"
                placeholder="Re-type your password"
                autoComplete="new-password"
                required
                requiredMark
              />
            </motion.div>

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
