"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { ToolDefinition } from "@/lib/tools/types";
import type { FieldErrors, ToolFormValues } from "@/lib/tools/validate";

interface ToolFormProps {
  readonly tool: ToolDefinition;
  readonly values: ToolFormValues;
  readonly errors: FieldErrors;
  readonly isRunning: boolean;
  readonly onChange: (name: string, value: string) => void;
  readonly onSubmit: () => void;
  readonly submitLabel: string;
}

/** Renders a tool's inputs from its field configuration. */
export function ToolForm({ tool, values, errors, isRunning, onChange, onSubmit, submitLabel }: ToolFormProps) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      {tool.fields.map((field) => {
        const fieldId = `${tool.slug}-${field.name}`;
        const value = values[field.name] ?? "";

        return (
          <Field
            key={field.name}
            id={fieldId}
            label={field.label}
            {...(field.help ? { help: field.help } : {})}
            {...(errors[field.name] ? { error: errors[field.name] } : {})}
            required={field.required}
            action={
              field.example ? (
                <button
                  type="button"
                  onClick={() => onChange(field.name, field.example ?? "")}
                  className="-my-1 rounded px-1 py-1.5 text-xs font-medium text-accent hover:underline"
                >
                  Use example
                </button>
              ) : undefined
            }
          >
            {(controlProps) => {
              if (field.type === "textarea") {
                return (
                  <textarea
                    {...controlProps}
                    name={field.name}
                    rows={4}
                    value={value}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    disabled={isRunning}
                    onChange={(event) => onChange(field.name, event.target.value)}
                    className={`${controlProps.className} resize-y`}
                  />
                );
              }

              if (field.type === "select") {
                return (
                  <select
                    {...controlProps}
                    name={field.name}
                    value={value}
                    disabled={isRunning}
                    onChange={(event) => onChange(field.name, event.target.value)}
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                );
              }

              return (
                <input
                  {...controlProps}
                  name={field.name}
                  type={field.type === "url" ? "url" : "text"}
                  inputMode={field.type === "url" ? "url" : "text"}
                  value={value}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  disabled={isRunning}
                  autoComplete="off"
                  spellCheck={field.type !== "url"}
                  onChange={(event) => onChange(field.name, event.target.value)}
                />
              );
            }}
          </Field>
        );
      })}

      <Button type="submit" size="lg" disabled={isRunning} fullWidth className="sm:w-auto">
        {isRunning ? "Running…" : submitLabel}
      </Button>
    </form>
  );
}
