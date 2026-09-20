import { finding, truncate, type CategorySpec } from "./types";
import type { AuditFinding } from "../types";

export const contentChecks: CategorySpec = {
  id: "content",
  name: "Content & Structure",
  description: "Heading hierarchy and the volume of readable content on the page.",
  run: (doc, facts) => {
    const results: AuditFinding[] = [];
    const { h1, h2, h3 } = facts.headingCounts;

    results.push(
      h1 === 1
        ? finding("h1-count", "H1 heading", "pass", "The page has exactly one H1.", {
            evidence: truncate(doc("h1").first().text()),
          })
        : finding(
            "h1-count",
            "H1 heading",
            h1 === 0 ? "fail" : "warn",
            h1 === 0 ? "No H1 heading was found." : `The page has ${h1} H1 headings.`,
            { recommendation: "Use a single H1 that states what the page is about." },
          ),
    );

    results.push(
      h2 > 0
        ? finding("subheadings", "Subheadings", "pass", `The page uses ${h2} H2 and ${h3} H3 headings.`)
        : finding("subheadings", "Subheadings", "warn", "No H2 headings were found.", {
            recommendation: "Break long content into sections with H2 headings.",
          }),
    );

    const words = facts.wordCount;
    results.push(
      finding(
        "word-count",
        "Content volume",
        words >= 300 ? "pass" : words >= 100 ? "warn" : "fail",
        `Roughly ${words.toLocaleString("en-US")} words of readable text were found.`,
        words >= 300
          ? {}
          : {
              recommendation:
                "Thin pages rarely rank. Expand the page or consolidate it with a stronger one.",
            },
      ),
    );

    return results;
  },
};
