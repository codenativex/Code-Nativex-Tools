import type { ToolDefinition } from "./types";

export type FieldErrors = Readonly<Record<string, string>>;
export type ToolFormValues = Readonly<Record<string, string>>;

/**
 * Client-side validation derived from the tool's field configuration. This is a
 * UX affordance only — every endpoint revalidates on the server.
 */
export function validateToolValues(tool: ToolDefinition, values: ToolFormValues): FieldErrors {
  const errors: Record<string, string> = {};

  for (const field of tool.fields) {
    const value = (values[field.name] ?? "").trim();

    if (field.required && value.length === 0) {
      errors[field.name] = `${field.label} is required.`;
      continue;
    }
    if (value.length === 0) continue;

    if (field.maxLength && value.length > field.maxLength) {
      errors[field.name] = `${field.label} must be ${field.maxLength} characters or fewer.`;
      continue;
    }

    if (field.type === "url" && !isLikelyUrl(value)) {
      errors[field.name] = "Enter a valid URL, for example https://example.com.";
    }
  }

  return errors;
}

function isLikelyUrl(value: string): boolean {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Initial values for a tool form, honouring select defaults. */
export function initialToolValues(tool: ToolDefinition): ToolFormValues {
  return Object.fromEntries(
    tool.fields.map((field) => [field.name, field.type === "select" ? (field.options?.[0]?.value ?? "") : ""]),
  );
}
