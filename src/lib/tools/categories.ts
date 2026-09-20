import type { ToolCategory, ToolCategoryId } from "./types";

export const toolCategories: readonly ToolCategory[] = [
  { id: "ai-agents", name: "AI Agents", description: "Autonomous agents that research, analyze and report." },
  { id: "website-auditing", name: "Website Auditing", description: "Full-site and single-page health checks." },
  { id: "seo", name: "SEO Tools", description: "Search visibility, metadata and structured data." },
  { id: "developer", name: "Developer Tools", description: "Utilities that shorten the day-to-day build loop." },
  { id: "content", name: "Content Tools", description: "Analysis and generation for written content." },
  { id: "marketing", name: "Marketing Tools", description: "Campaign, competitor and channel intelligence." },
  { id: "automation", name: "Automation", description: "Recurring workflows that run without supervision." },
  { id: "productivity", name: "Productivity", description: "Small tools that remove repetitive work." },
  { id: "business", name: "Business Tools", description: "Reporting and operations for teams and agencies." },
] as const;

const categoryIndex = new Map<ToolCategoryId, ToolCategory>(
  toolCategories.map((category) => [category.id, category]),
);

export function getCategory(id: ToolCategoryId): ToolCategory {
  const category = categoryIndex.get(id);
  if (!category) {
    throw new Error(`Unknown tool category: ${id}`);
  }
  return category;
}
