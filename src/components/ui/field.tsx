"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

const controlClasses =
  "w-full rounded-lg border bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink transition-colors " +
  "placeholder:text-ink-subtle focus:border-accent focus:outline-none disabled:opacity-60";

/** Props the field injects into whichever control it wraps. */
interface ControlProps {
  readonly id: string;
  readonly className: string;
  readonly "aria-required": boolean;
  readonly "aria-describedby"?: string;
  readonly "aria-invalid"?: true;
}

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly help?: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly action?: ReactNode;
  readonly children: (controlProps: ControlProps) => ReactNode;
}

/**
 * Wraps a single form control with its label, help text and error message, and
 * wires up the aria-describedby relationships between them.
 */
export function Field({ id, label, help, error, required, action, children }: FieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required ? <span className="sr-only"> (required)</span> : <span className="ml-1.5 text-xs font-normal text-ink-subtle">Optional</span>}
        </label>
        {action}
      </div>

      {children({
        id,
        className: cn(controlClasses, error ? "border-critical focus:border-critical" : "border-line-strong"),
        "aria-required": Boolean(required),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(error ? { "aria-invalid": true as const } : {}),
      })}

      {error ? (
        <p id={errorId} className="text-sm text-critical">
          {error}
        </p>
      ) : null}
      {help ? (
        <p id={helpId} className="text-sm text-ink-subtle">
          {help}
        </p>
      ) : null}
    </div>
  );
}
