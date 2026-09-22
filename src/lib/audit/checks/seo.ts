import { attr, finding, truncate, type CategorySpec } from "./types";
import type { AuditFinding } from "../types";

export const seoChecks: CategorySpec = {
  id: "seo",
  name: "SEO & Metadata",
  description: "Title, description, canonical and social metadata read from the page head.",
  run: (doc, facts) => {
    const results: AuditFinding[] = [];

    if (!facts.title) {
      results.push(
        finding("title-missing", "Page title", "fail", "No <title> element was found.", {
          recommendation: "Add a unique title of roughly 50–60 characters describing this page.",
        }),
      );
    } else {
      const length = facts.title.length;
      const inRange = length >= 25 && length <= 65;
      results.push(
        finding("title-length", "Page title", inRange ? "pass" : "warn", `The title is ${length} characters long.`, {
          evidence: truncate(facts.title),
          ...(inRange ? {} : { recommendation: "Aim for 50–60 characters so search results are not truncated." }),
        }),
      );
    }

    if (!facts.metaDescription) {
      results.push(
        finding("description-missing", "Meta description", "fail", "No meta description was found.", {
          recommendation: "Add a 120–160 character description summarising the page.",
        }),
      );
    } else {
      const length = facts.metaDescription.length;
      const inRange = length >= 70 && length <= 165;
      results.push(
        finding(
          "description-length",
          "Meta description",
          inRange ? "pass" : "warn",
          `The description is ${length} characters long.`,
          {
            evidence: truncate(facts.metaDescription),
            ...(inRange ? {} : { recommendation: "Aim for 120–160 characters." }),
          },
        ),
      );
    }

    results.push(
      facts.canonical
        ? finding("canonical", "Canonical URL", "pass", "A canonical URL is declared.", { evidence: facts.canonical })
        : finding("canonical", "Canonical URL", "warn", "No canonical link was found.", {
            recommendation: 'Declare <link rel="canonical"> to consolidate duplicate URLs.',
          }),
    );

    const ogTags = [
      attr(doc, 'meta[property="og:title"]', "content"),
      attr(doc, 'meta[property="og:description"]', "content"),
      attr(doc, 'meta[property="og:image"]', "content"),
    ];
    const ogCount = ogTags.filter(Boolean).length;
    results.push(
      finding(
        "open-graph",
        "Open Graph tags",
        ogCount === 3 ? "pass" : ogCount > 0 ? "warn" : "fail",
        `${ogCount} of 3 core Open Graph tags (title, description, image) are present.`,
        ogCount === 3
          ? {}
          : { recommendation: "Add og:title, og:description and og:image for reliable link previews." },
      ),
    );

    const robots = attr(doc, 'meta[name="robots"]', "content");
    const blocked = robots?.toLowerCase().includes("noindex") ?? false;
    results.push(
      blocked
        ? finding(
            "robots-meta",
            "Indexability",
            "fail",
            "This page declares noindex and will be dropped from search results.",
            { evidence: robots ?? undefined, recommendation: "Remove noindex if this page should rank." },
          )
        : finding("robots-meta", "Indexability", "pass", "No meta robots directive blocks indexing.", {
            ...(robots ? { evidence: robots } : {}),
          }),
    );

    return results;
  },
};
