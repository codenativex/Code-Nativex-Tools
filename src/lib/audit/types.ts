/** Result shapes returned by the Website Audit Agent. */

export type FindingStatus = "pass" | "warn" | "fail";

export interface AuditFinding {
  readonly id: string;
  readonly title: string;
  readonly status: FindingStatus;
  /** What the agent observed, stated plainly. */
  readonly detail: string;
  /** The literal value read from the page, when there is one. */
  readonly evidence?: string;
  /** Present for anything that is not a pass. */
  readonly recommendation?: string;
}

export type AuditCategoryId =
  | "seo"
  | "content"
  | "accessibility"
  | "technical"
  | "links"
  | "images"
  | "mobile";

export interface AuditCategoryResult {
  readonly id: AuditCategoryId;
  readonly name: string;
  readonly description: string;
  readonly score: number;
  readonly findings: readonly AuditFinding[];
}

export interface AuditPageFacts {
  readonly title: string | null;
  readonly metaDescription: string | null;
  readonly canonical: string | null;
  readonly lang: string | null;
  readonly wordCount: number;
  readonly headingCounts: Readonly<Record<"h1" | "h2" | "h3", number>>;
  readonly internalLinks: number;
  readonly externalLinks: number;
  readonly imageCount: number;
  readonly imagesMissingAlt: number;
  readonly htmlBytes: number;
}

export interface AuditReport {
  readonly requestedUrl: string;
  readonly finalUrl: string;
  readonly statusCode: number;
  readonly fetchedAt: string;
  readonly durationMs: number;
  readonly overallScore: number;
  readonly summary: string;
  readonly facts: AuditPageFacts;
  readonly categories: readonly AuditCategoryResult[];
}

export interface AuditCounts {
  readonly passed: number;
  readonly warnings: number;
  readonly issues: number;
}

export function countFindings(report: AuditReport): AuditCounts {
  let passed = 0;
  let warnings = 0;
  let issues = 0;

  for (const category of report.categories) {
    for (const finding of category.findings) {
      if (finding.status === "pass") passed += 1;
      else if (finding.status === "warn") warnings += 1;
      else issues += 1;
    }
  }

  return { passed, warnings, issues };
}
