"use client";

import { useCallback, useRef, useState } from "react";

import { AuditReportView } from "@/components/audit/audit-report-view";
import { CodeOutputView } from "@/components/tools/code-output-view";
import { ToolForm } from "@/components/tools/tool-form";
import { ToolProgress } from "@/components/tools/tool-progress";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ToolResult, ToolRunResponse } from "@/lib/tools/results";
import type { ToolDefinition } from "@/lib/tools/types";
import { initialToolValues, validateToolValues, type FieldErrors, type ToolFormValues } from "@/lib/tools/validate";

type RunState =
  | { readonly status: "idle" }
  | { readonly status: "running" }
  | { readonly status: "success"; readonly result: ToolResult }
  | { readonly status: "error"; readonly message: string };

interface ToolRunnerProps {
  readonly tool: ToolDefinition;
  readonly submitLabel: string;
}

const NETWORK_ERROR = "We could not reach the server. Check your connection and try again.";
const UNEXPECTED_ERROR = "Something went wrong while running this tool. Please try again.";

function isRunResponse(value: unknown): value is ToolRunResponse {
  return typeof value === "object" && value !== null && "ok" in value;
}

/**
 * Generic execution shell shared by every runnable tool: renders the inputs
 * from configuration, posts to the tool's endpoint, and dispatches the response
 * to the result view the tool declares.
 */
export function ToolRunner({ tool, submitLabel }: ToolRunnerProps) {
  const [values, setValues] = useState<ToolFormValues>(() => initialToolValues(tool));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [run, setRun] = useState<RunState>({ status: "idle" });
  const resultRef = useRef<HTMLDivElement>(null);
  const runtime = tool.runtime;

  const handleChange = useCallback((name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!(name in current)) return current;
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!runtime) return;

    const validationErrors = validateToolValues(tool, values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setRun({ status: "idle" });
      return;
    }

    setErrors({});
    setRun({ status: "running" });

    try {
      const response = await fetch(runtime.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!isRunResponse(payload)) {
        setRun({ status: "error", message: UNEXPECTED_ERROR });
        return;
      }

      if (!payload.ok) {
        if (payload.error.fields) setErrors(payload.error.fields);
        setRun({ status: "error", message: payload.error.message });
        return;
      }

      setRun({ status: "success", result: payload.data });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setRun({ status: "error", message: NETWORK_ERROR });
    }
  }, [runtime, tool, values]);

  if (!runtime) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <ToolForm
          tool={tool}
          values={values}
          errors={errors}
          isRunning={run.status === "running"}
          onChange={handleChange}
          onSubmit={() => void handleSubmit()}
          submitLabel={submitLabel}
        />
      </div>

      {run.status === "running" ? <ToolProgress stages={runtime.stages} /> : null}

      {run.status === "error" ? (
        <Alert tone="error" title="The run did not complete">
          <p>{run.message}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => void handleSubmit()}>
            Try again
          </Button>
        </Alert>
      ) : null}

      {run.status === "idle" ? (
        <div className="rounded-card border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
          <p className="text-sm font-medium text-ink">No results yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">
            Fill in the form above and run the tool. Results appear here, and nothing is shown until the run completes.
          </p>
        </div>
      ) : null}

      {run.status === "success" ? (
        <div ref={resultRef} tabIndex={-1} className="scroll-mt-24">
          {run.result.view === "audit-report" ? (
            <AuditReportView report={run.result.report} />
          ) : (
            <CodeOutputView output={run.result.output} />
          )}
        </div>
      ) : null}
    </div>
  );
}
