/**
 * The tool contract.
 *
 * Every tool on the platform is described by a single `ToolDefinition`. Pages,
 * navigation, search, SEO metadata, the learning center and the generic tool
 * runner are all derived from these objects, so adding a tool never requires
 * touching the routing or UI layers.
 */

export type ToolCategoryId =
  | "ai-agents"
  | "seo"
  | "website-auditing"
  | "developer"
  | "content"
  | "marketing"
  | "automation"
  | "productivity"
  | "business";

export interface ToolCategory {
  readonly id: ToolCategoryId;
  readonly name: string;
  readonly description: string;
}

/**
 * `live`    — fully implemented and runnable.
 * `beta`    — runnable, but the analysis surface is still expanding.
 * `planned` — documented in the learning center, not yet runnable.
 */
export type ToolStatus = "live" | "beta" | "planned";

export type ToolFieldType = "url" | "text" | "textarea" | "select";

export interface ToolSelectOption {
  readonly value: string;
  readonly label: string;
}

export interface ToolField {
  readonly name: string;
  readonly label: string;
  readonly type: ToolFieldType;
  readonly placeholder?: string;
  /** Short helper text rendered beneath the control. */
  readonly help?: string;
  /** Prefills the field when the user asks for an example. */
  readonly example?: string;
  readonly required: boolean;
  readonly maxLength?: number;
  readonly options?: readonly ToolSelectOption[];
}

/**
 * A stage shown during processing. Stages must map to work the backend
 * actually performs — they are never decorative.
 */
export interface ToolStage {
  readonly id: string;
  readonly label: string;
}

/** Discriminates which result renderer the tool page mounts. */
export type ToolResultView = "audit-report" | "code-output";

export interface ToolRuntime {
  /** POST endpoint that executes the tool. */
  readonly endpoint: string;
  readonly stages: readonly ToolStage[];
  readonly resultView: ToolResultView;
}

/** Optional long-form section rendered on the tool's learning page. */
export interface ToolLearningSection {
  readonly heading: string;
  readonly body: string;
  readonly bullets?: readonly string[];
}

export interface ToolLearningContent {
  readonly problem: string;
  readonly audience: readonly string[];
  readonly input: string;
  readonly output: string;
  readonly howItWorks: readonly string[];
  readonly exampleUseCase: string;
  readonly sections?: readonly ToolLearningSection[];
}

/** Named glyphs available to tools. Rendering lives in `components/tools/tool-icon`. */
export type ToolIconName =
  | "scan"
  | "leads"
  | "seo"
  | "write"
  | "accessibility"
  | "gauge"
  | "schema"
  | "sitemap"
  | "compare"
  | "document"
  | "schedule"
  | "agent";

export interface ToolDefinition {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly category: ToolCategoryId;
  /** Falls back to the category's icon when omitted. */
  readonly icon?: ToolIconName;
  readonly status: ToolStatus;
  /** One-line summary used on cards and in search. */
  readonly summary: string;
  /** Longer explanation used on the tool page and for meta descriptions. */
  readonly description: string;
  readonly keywords: readonly string[];
  readonly featured: boolean;
  /** ISO date — drives the "recently added" rail and the sitemap. */
  readonly addedAt: string;
  readonly fields: readonly ToolField[];
  readonly runtime?: ToolRuntime;
  readonly learning: ToolLearningContent;
}
