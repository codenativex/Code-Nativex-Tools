import type * as cheerio from "cheerio";

import type { FetchedPage } from "../fetch-page";
import type { AuditCategoryId, AuditFinding, AuditPageFacts, FindingStatus } from "../types";

export type Document = cheerio.CheerioAPI;

/**
 * One scored category of the audit. Adding a category means adding a module
 * here and registering it in `checks/index.ts` — nothing else changes.
 */
export interface CategorySpec {
  readonly id: AuditCategoryId;
  readonly name: string;
  readonly description: string;
  readonly run: (doc: Document, facts: AuditPageFacts, page: FetchedPage) => readonly AuditFinding[];
}

export function finding(
  id: string,
  title: string,
  status: FindingStatus,
  detail: string,
  options: { evidence?: string; recommendation?: string } = {},
): AuditFinding {
  return { id, title, status, detail, ...options };
}

/** Collapses whitespace and clips evidence to a readable length. */
export function truncate(value: string, max = 180): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  return collapsed.length > max ? `${collapsed.slice(0, max - 1)}…` : collapsed;
}

/** First matching element's attribute, normalised to `null` when absent or blank. */
export function attr(doc: Document, selector: string, name: string): string | null {
  const value = doc(selector).first().attr(name);
  return value?.trim() ? value.trim() : null;
}
