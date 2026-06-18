"use client";

import { useId, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Spinner,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useAuth } from "@/context/AuthContext";
import { useAppToast } from "@/hooks/useAppToast";

const useStyles = makeStyles({
  trigger: {
    fontSize: tokens.fontSizeBase100,
    padding: 0,
    minWidth: 0,
    height: "auto",
    color: "var(--primary)",
    backgroundColor: "transparent",
    ":hover": {
      backgroundColor: "transparent",
      textDecoration: "underline",
    },
  },
});

export default function ForgotPasswordDialog() {
  const styles = useStyles();
  const dialogId = useId();
  const { resetPassword } = useAuth();
  const toast = useAppToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (_event: unknown, data: { open: boolean }) => {
    setOpen(data.open);
    if (!data.open) {
      setEmail("");
      setEmailError(null);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Enter the email address for your Morfinance account.");
      return;
    }

    setEmailError(null);
    setIsSubmitting(true);

    const { error } = await resetPassword(trimmed);
    setIsSubmitting(false);

    if (error) {
      toast.error("Reset link not sent", error);
      return;
    }

    toast.success(
      "Check your email",
      "If an account exists for that email, a reset link has been sent."
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modalType="non-modal">
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="transparent" className={styles.trigger}>
          Forgot password?
        </Button>
      </DialogTrigger>

      <DialogSurface aria-describedby={undefined}>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle id={`${dialogId}-title`}>Reset your password</DialogTitle>
            <DialogContent id={`${dialogId}-content`}>
              <p className="mb-4 text-sm text-muted-foreground">
                Enter your account email and we&apos;ll send a password reset link.
              </p>

              <Field
                label="Email"
                required
                validationState={emailError ? "error" : "none"}
                validationMessage={emailError ?? undefined}
              >
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(_event, data) => {
                    setEmail(data.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="you@example.com"
                />
              </Field>
            </DialogContent>

            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogTrigger>
              <Button
                type="submit"
                appearance="primary"
                disabled={isSubmitting}
                icon={isSubmitting ? <Spinner size="extra-tiny" /> : undefined}
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
