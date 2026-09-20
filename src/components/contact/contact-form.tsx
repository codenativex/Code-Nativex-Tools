"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { ApiResponse } from "@/lib/api/http";
import { CONTACT_TOPICS, topicFromPlan, type ContactTopic } from "@/lib/contact/config";

interface FormValues {
  name: string;
  email: string;
  company: string;
  topic: ContactTopic;
  message: string;
  /** Honeypot — hidden from people, tempting to bots. */
  website: string;
}

type Status = "idle" | "sending" | "sent" | "error";

const MIN_MESSAGE_LENGTH = 20;
const NETWORK_ERROR = "We could not reach the server. Check your connection and try again.";

function validate(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.name.trim().length < 2) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.message.trim().length < MIN_MESSAGE_LENGTH) {
    errors.message = `Tell us a little more — at least ${MIN_MESSAGE_LENGTH} characters.`;
  }
  return errors;
}

export function ContactForm() {
  const searchParams = useSearchParams();
  const [values, setValues] = useState<FormValues>(() => ({
    name: "",
    email: "",
    company: "",
    topic: topicFromPlan(searchParams.get("plan") ?? undefined),
    message: "",
    website: "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const update = useCallback((name: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!(name in current)) return current;
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

      if (payload?.ok) {
        setStatus("sent");
        return;
      }

      if (payload && !payload.ok) {
        if (payload.error.fields) setErrors(payload.error.fields);
        setErrorMessage(payload.error.message);
      } else {
        setErrorMessage(NETWORK_ERROR);
      }
      setStatus("error");
    } catch {
      setErrorMessage(NETWORK_ERROR);
      setStatus("error");
    }
  }, [values]);

  if (status === "sent") {
    return (
      <div className="rounded-card border border-line bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-ink">Message sent</h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
          Thanks — we have it. You will get a reply at{" "}
          <span className="font-medium text-ink">{values.email}</span>, usually within one working day.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            setValues((current) => ({ ...current, message: "" }));
            setStatus("idle");
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  const isSending = status === "sending";

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="space-y-5 rounded-card border border-line bg-surface p-5 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Your name" required error={errors.name}>
          {(props) => (
            <input
              {...props}
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              disabled={isSending}
              onChange={(event) => update("name", event.target.value)}
            />
          )}
        </Field>

        <Field id="contact-email" label="Email address" required error={errors.email}>
          {(props) => (
            <input
              {...props}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              disabled={isSending}
              onChange={(event) => update("email", event.target.value)}
            />
          )}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-company" label="Company" error={errors.company}>
          {(props) => (
            <input
              {...props}
              name="company"
              type="text"
              autoComplete="organization"
              value={values.company}
              disabled={isSending}
              onChange={(event) => update("company", event.target.value)}
            />
          )}
        </Field>

        <Field id="contact-topic" label="What is this about?" required error={errors.topic}>
          {(props) => (
            <select
              {...props}
              name="topic"
              value={values.topic}
              disabled={isSending}
              onChange={(event) => update("topic", event.target.value)}
            >
              {CONTACT_TOPICS.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field
        id="contact-message"
        label="Message"
        required
        help="What are you trying to do, and what would a good outcome look like?"
        error={errors.message}
      >
        {(props) => (
          <textarea
            {...props}
            name="message"
            rows={6}
            maxLength={4000}
            value={values.message}
            disabled={isSending}
            onChange={(event) => update("message", event.target.value)}
            className={`${props.className} resize-y`}
          />
        )}
      </Field>

      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </div>

      {status === "error" ? (
        <Alert tone="error" title="The message was not sent">
          {errorMessage}
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={isSending} fullWidth className="sm:w-auto">
          {isSending ? "Sending…" : "Send message"}
        </Button>
        <p className="text-xs leading-relaxed text-ink-subtle">
          We use your details only to reply to this enquiry.
        </p>
      </div>
    </form>
  );
}
