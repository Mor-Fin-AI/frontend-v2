"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  Field,
  Input,
  Option,
  Spinner,
  Textarea,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Add24Regular, Send24Regular } from "@fluentui/react-icons";
import { useAuth } from "@/context/AuthContext";
import { useAppToast } from "@/hooks/useAppToast";
import {
  createSupportTicket,
  type SupportTicket,
} from "@/lib/supportTickets";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type TicketCategory,
  type TicketPriority,
} from "@/app/(dashboard)/settings/data";

const useStyles = makeStyles({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    gap: tokens.spacingHorizontalM,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
  submitButton: {
    backgroundColor: "var(--action-green)",
    color: "var(--action-green-foreground)",
    ":hover": {
      backgroundColor: "var(--action-green-hover)",
    },
  },
});

type FormState = {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
};

const initialForm: FormState = {
  subject: "",
  category: "Technical",
  priority: "Medium",
  description: "",
};

type CreateSupportTicketDialogProps = {
  onCreated: (ticket: SupportTicket) => void;
};

export default function CreateSupportTicketDialog({
  onCreated,
}: CreateSupportTicketDialogProps) {
  const styles = useStyles();
  const { user } = useAuth();
  const toast = useAppToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<{
    subject?: string;
    description?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setForm(initialForm);
    setFieldErrors({});
    setIsSubmitting(false);
  };

  const handleOpenChange = (_event: unknown, data: { open: boolean }) => {
    setOpen(data.open);
    if (!data.open) {
      resetState();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = form.subject.trim();
    const description = form.description.trim();
    const errors: typeof fieldErrors = {};

    if (!subject) {
      errors.subject = "Subject is required.";
    }

    if (!description) {
      errors.description = "Description is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!user?.id) {
      toast.error("Sign in required", "You must be signed in to create a ticket.");
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const { data, error } = await createSupportTicket({
      subject,
      category: form.category,
      priority: form.priority,
      description,
    });

    setIsSubmitting(false);

    if (error || !data) {
      toast.error("Ticket not created", error ?? "Failed to create ticket.");
      return;
    }

    toast.success(
      "Support ticket created",
      `${data.id} was submitted. Our team will respond within 1–2 business days.`
    );
    onCreated(data);
    setOpen(false);
    resetState();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="primary" icon={<Add24Regular />} className={styles.submitButton}>
          New ticket
        </Button>
      </DialogTrigger>

      <DialogSurface aria-describedby={undefined}>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Create support ticket</DialogTitle>
            <DialogContent className={styles.form}>
              <Field
                label="Subject"
                required
                validationState={fieldErrors.subject ? "error" : "none"}
                validationMessage={fieldErrors.subject}
              >
                <Input
                  value={form.subject}
                  onChange={(_event, data) => {
                    setForm((current) => ({ ...current, subject: data.value }));
                    if (fieldErrors.subject) {
                      setFieldErrors((current) => ({ ...current, subject: undefined }));
                    }
                  }}
                  placeholder="Brief summary of your issue"
                  maxLength={120}
                />
              </Field>

              <div className={styles.row}>
                <Field label="Category" required>
                  <Dropdown
                    value={form.category}
                    selectedOptions={[form.category]}
                    onOptionSelect={(_event, data) => {
                      const category = data.optionValue as TicketCategory | undefined;
                      if (category) {
                        setForm((current) => ({ ...current, category }));
                      }
                    }}
                  >
                    {TICKET_CATEGORIES.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>

                <Field label="Priority" required>
                  <Dropdown
                    value={form.priority}
                    selectedOptions={[form.priority]}
                    onOptionSelect={(_event, data) => {
                      const priority = data.optionValue as TicketPriority | undefined;
                      if (priority) {
                        setForm((current) => ({ ...current, priority }));
                      }
                    }}
                  >
                    {TICKET_PRIORITIES.map((priority) => (
                      <Option key={priority} value={priority}>
                        {priority}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              </div>

              <Field
                label="Description"
                required
                validationState={fieldErrors.description ? "error" : "none"}
                validationMessage={fieldErrors.description}
              >
                <Textarea
                  value={form.description}
                  onChange={(_event, data) => {
                    setForm((current) => ({ ...current, description: data.value }));
                    if (fieldErrors.description) {
                      setFieldErrors((current) => ({
                        ...current,
                        description: undefined,
                      }));
                    }
                  }}
                  placeholder="Describe the issue, steps to reproduce, and any relevant account or wallet details"
                  rows={5}
                  resize="vertical"
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
                className={styles.submitButton}
                disabled={isSubmitting}
                icon={isSubmitting ? <Spinner size="tiny" /> : <Send24Regular />}
              >
                {isSubmitting ? "Creating..." : "Create ticket"}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
