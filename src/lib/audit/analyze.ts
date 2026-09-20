import * as cheerio from "cheerio";

import { categorySpecs } from "./checks";
import type { Document } from "./checks/types";
import type { FetchedPage } from "./fetch-page";
import type {
  AuditCategoryResult,
  AuditFinding,
  AuditPageFacts,
  AuditReport,
  FindingStatus,
} from "./types";

const STATUS_WEIGHT: Readonly<Record<FindingStatus, number>> = { pass: 1, warn: 0.5, fail: 0 };

/** Extracts the raw observations every check reads from. */
function extractFacts(doc: Document, page: FetchedPage): AuditPageFacts {
  const origin = new URL(page.finalUrl).origin;
  let internalLinks = 0;
  let externalLinks = 0;

  doc("a[href]").each((_, element) => {
    const href = doc(element).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const resolved = new URL(href, page.finalUrl);
      if (resolved.origin === origin) internalLinks += 1;
      else externalLinks += 1;
    } catch {
      /* Unparseable href — surfaced by the descriptive-link-text check instead. */
    }
  });

  const images = doc("img");
  const bodyText = doc("body").clone().find("script, style, noscript").remove().end().text();
  const title = doc("title").first().text().trim();
  const description = doc('meta[name="description"]').first().attr("content")?.trim();
  const canonical = doc('link[rel="canonical"]').first().attr("href")?.trim();
  const lang = doc("html").first().attr("lang")?.trim();

  return {
    title: title || null,
    metaDescription: description || null,
    canonical: canonical || null,
    lang: lang || null,
    wordCount: bodyText.split(/\s+/).filter(Boolean).length,
    headingCounts: { h1: doc("h1").length, h2: doc("h2").length, h3: doc("h3").length },
    internalLinks,
    externalLinks,
    imageCount: images.length,
    imagesMissingAlt: images.filter((_, element) => doc(element).attr("alt") === undefined).length,
    htmlBytes: page.bytes,
  };
}

/** A pass scores full marks, a warning half, an issue nothing. */
function scoreFindings(findings: readonly AuditFinding[]): number {
  if (findings.length === 0) return 100;
  const total = findings.reduce((sum, item) => sum + STATUS_WEIGHT[item.status], 0);
  return Math.round((total / findings.length) * 100);
}

function summarise(score: number, issues: number, warnings: number): string {
  if (issues === 0 && warnings === 0) {
    return "Every automated check passed. Nothing in the markup needs attention right now.";
  }

  const counts = [
    issues > 0 ? `${issues} issue${issues === 1 ? "" : "s"}` : null,
    warnings > 0 ? `${warnings} warning${warnings === 1 ? "" : "s"}` : null,
  ].filter(Boolean);

  const grade =
    score >= 90 ? "in strong shape" : score >= 70 ? "broadly healthy" : score >= 50 ? "workable but weak" : "in poor shape";

  return `This page is ${grade}. The agent found ${counts.join(" and ")} across ${categorySpecs.length} categories.`;
}

/** Runs every category check against a fetched page and assembles the report. */
export function analyzePage(page: FetchedPage): AuditReport {
  const doc = cheerio.load(page.html);
  const facts = extractFacts(doc, page);

  const categories: AuditCategoryResult[] = categorySpecs.map((spec) => {
    const findings = spec.run(doc, facts, page);
    return { id: spec.id, name: spec.name, description: spec.description, score: scoreFindings(findings), findings };
  });

  const allFindings = categories.flatMap((category) => category.findings);
  const overallScore = scoreFindings(allFindings);
  const issues = allFindings.filter((item) => item.status === "fail").length;
  const warnings = allFindings.filter((item) => item.status === "warn").length;

  return {
    requestedUrl: page.requestedUrl,
    finalUrl: page.finalUrl,
    statusCode: page.statusCode,
    fetchedAt: new Date().toISOString(),
    durationMs: page.durationMs,
    overallScore,
    summary: summarise(overallScore, issues, warnings),
    facts,
    categories,
  };
}
