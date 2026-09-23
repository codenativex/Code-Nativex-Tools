import type { ReactNode } from "react";

import type { ToolCategoryId, ToolDefinition, ToolIconName } from "@/lib/tools/types";

/**
 * Stroke glyphs on a 24×24 grid, drawn in-house so the icon set costs no
 * dependency and stays visually consistent across every tool.
 */
const glyphs: Record<ToolIconName, ReactNode> = {
  scan: (
    <>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <circle cx="11" cy="11" r="3.5" />
      <path d="m13.6 13.6 2.9 2.9" />
    </>
  ),
  leads: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 7.4M21.5 20a6.5 6.5 0 0 0-4-6" />
    </>
  ),
  seo: (
    <>
      <circle cx="11" cy="11" r="7.5" />
      <path d="m21 21-4.2-4.2M8 13.5v-2M11 13.5v-5M14 13.5v-3.5" />
    </>
  ),
  write: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />,
  accessibility: (
    <>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="m5 8.5 7 1.5 7-1.5M12 10v4.5M8.5 21l3.5-6.5 3.5 6.5" />
    </>
  ),
  gauge: (
    <>
      <path d="M4.2 18.5a9 9 0 1 1 15.6 0" />
      <path d="m12 14 4-4" />
      <circle cx="12" cy="14" r="1.2" />
    </>
  ),
  schema: (
    <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
  ),
  sitemap: (
    <>
      <rect x="9" y="3" width="6" height="5" rx="1" />
      <rect x="3" y="16" width="6" height="5" rx="1" />
      <rect x="15" y="16" width="6" height="5" rx="1" />
      <path d="M12 8v4M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    </>
  ),
  compare: <path d="M4 20h16M7 16v-4M12 16V7M17 16v-6" />,
  document: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
      <path d="M14 3v6h6M8 13h8M8 17h5" />
    </>
  ),
  schedule: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  agent: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2.5" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </>
  ),
};

const categoryFallback: Record<ToolCategoryId, ToolIconName> = {
  "ai-agents": "agent",
  "website-auditing": "scan",
  seo: "seo",
  developer: "schema",
  content: "document",
  marketing: "compare",
  automation: "schedule",
  productivity: "schedule",
  business: "compare",
};

export function toolIconName(tool: Pick<ToolDefinition, "icon" | "category">): ToolIconName {
  return tool.icon ?? categoryFallback[tool.category];
}

interface ToolIconProps {
  readonly name: ToolIconName;
  readonly className?: string;
}

export function ToolIcon({ name, className }: ToolIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
    >
      {glyphs[name]}
    </svg>
  );
}
