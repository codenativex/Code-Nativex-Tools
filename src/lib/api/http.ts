import { NextResponse } from "next/server";

/** The envelope every API route in the app returns. */
export interface ApiSuccess<T> {
  readonly ok: true;
  readonly data: T;
}

export interface ApiFailure {
  readonly ok: false;
  readonly error: {
    readonly message: string;
    readonly code: string;
    /** Field-level messages, keyed by field name, for form endpoints. */
    readonly fields?: Readonly<Record<string, string>>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function jsonSuccess<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ ok: true as const, data }, { status: 200 });
}

export function jsonError(
  message: string,
  code: string,
  status: number,
  fields?: Readonly<Record<string, string>>,
): NextResponse<ApiFailure> {
  return NextResponse.json({ ok: false as const, error: { message, code, ...(fields ? { fields } : {}) } }, { status });
}

/** Parses a JSON body without leaking parser internals to the client. */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** Turns Zod-style issues into a field-keyed map for the client. */
export function fieldErrors(
  issues: readonly { path: readonly (string | number)[]; message: string }[],
): Record<string, string> {
  return Object.fromEntries(issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]));
}
