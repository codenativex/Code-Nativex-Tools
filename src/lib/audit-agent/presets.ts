import type { AuditOptions } from "./types";

export type AuditPreset = "quick" | "standard" | "custom";

export const QUICK_OPTIONS: AuditOptions = {
  max_pages: 2,
  performance_pages: 1,
  lighthouse_runs: 1,
  external_links: 10,
  cross_browser: true,
  firefox: false,
  ai_enabled: false,
};

export const STANDARD_OPTIONS: AuditOptions = {
  max_pages: 50,
  performance_pages: 0,
  lighthouse_runs: 1,
  external_links: 100,
  cross_browser: true,
  firefox: false,
  ai_enabled: false,
};

export const PRESET_COPY: Record<AuditPreset, { name: string; summary: string }> = {
  quick: { name: "Quick Test", summary: "Up to 2 pages, Lighthouse on 1" },
  standard: { name: "Standard Audit", summary: "Up to 50 pages, Lighthouse on every audited page" },
  custom: { name: "Custom", summary: "Set each option yourself" },
};
