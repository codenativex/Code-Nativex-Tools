import { voiceSalesAgentTool } from "./definitions/voice-sales-agent";
import { gmailReplyAgentTool } from "./definitions/gmail-reply-agent";
import { leadGenerationTool } from "./definitions/lead-generation";
import { plannedTools } from "./definitions/planned";
import { socialMediaPostAgentTool } from "./definitions/social-media-post-agent";
import { websiteAuditTool } from "./definitions/website-audit";
import type { ToolCategoryId, ToolDefinition, ToolStatus } from "./types";

/** Single source of truth for every tool on the platform. */
export const tools: readonly ToolDefinition[] = [
  websiteAuditTool,
  leadGenerationTool,
  voiceSalesAgentTool,
  gmailReplyAgentTool,
  socialMediaPostAgentTool,
  ...plannedTools,
];

const toolsBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return toolsBySlug.get(slug);
}

export function getFeaturedTools(): readonly ToolDefinition[] {
  return tools.filter((tool) => tool.featured);
}

export function getRunnableTools(): readonly ToolDefinition[] {
  return tools.filter((tool) => tool.runtime !== undefined);
}

const statusRank: Readonly<Record<ToolStatus, number>> = { live: 0, beta: 1, planned: 2 };

export function getRecentTools(limit = 4): readonly ToolDefinition[] {
  return [...tools]
    .sort(
      (a, b) =>
        b.addedAt.localeCompare(a.addedAt) ||
        statusRank[a.status] - statusRank[b.status] ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit);
}

export function getToolsByCategory(category: ToolCategoryId): readonly ToolDefinition[] {
  return tools.filter((tool) => tool.category === category);
}

export function getPopulatedCategoryIds(): readonly ToolCategoryId[] {
  return [...new Set(tools.map((tool) => tool.category))];
}

export interface ToolQuery {
  readonly search?: string;
  readonly category?: ToolCategoryId | "all";
}

export function queryTools({ search, category }: ToolQuery): readonly ToolDefinition[] {
  const term = search?.trim().toLowerCase() ?? "";

  return tools.filter((tool) => {
    if (category && category !== "all" && tool.category !== category) return false;
    if (term.length === 0) return true;
    const haystack = [tool.name, tool.summary, tool.description, ...tool.keywords]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

