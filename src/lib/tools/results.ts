import type { ApiResponse } from "@/lib/api/http";
import type { AuditReport } from "@/lib/audit/types";

/** Payload rendered by the `code-output` result view. */
export interface CodeOutputResult {
  readonly language: "html" | "json";
  readonly code: string;
  readonly notes: readonly { readonly status: "info" | "warn"; readonly message: string }[];
}

/** Discriminated union of everything a tool run can return. */
export type ToolResult =
  | { readonly view: "audit-report"; readonly report: AuditReport }
  | { readonly view: "code-output"; readonly output: CodeOutputResult };

export type ToolRunResponse = ApiResponse<ToolResult>;
