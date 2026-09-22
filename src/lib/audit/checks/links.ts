import { finding, type CategorySpec } from "./types";
import type { AuditFinding } from "../types";

export const linkChecks: CategorySpec = {
  id: "links",
  name: "Links",
  description: "Internal and outbound linking observed in the markup.",
  run: (doc, facts) => {
    const results: AuditFinding[] = [];

    results.push(
      finding(
        "internal-links",
        "Internal links",
        facts.internalLinks >= 3 ? "pass" : "warn",
        `${facts.internalLinks} internal and ${facts.externalLinks} external links were found.`,
        facts.internalLinks >= 3
          ? {}
          : { recommendation: "Link to related pages so crawlers and readers can move through the site." },
      ),
    );

    const emptyAnchors = doc("a[href]").filter(
      (_, element) => doc(element).text().trim().length === 0 && !doc(element).attr("aria-label"),
    ).length;
    results.push(
      finding(
        "empty-anchors",
        "Descriptive link text",
        emptyAnchors === 0 ? "pass" : "warn",
        `${emptyAnchors} links have neither visible text nor an aria-label.`,
        emptyAnchors === 0
          ? {}
          : { recommendation: "Give every link text or an aria-label that describes its destination." },
      ),
    );

    const unsafeTargets = doc('a[target="_blank"]').filter(
      (_, element) => !(doc(element).attr("rel")?.toLowerCase() ?? "").includes("noopener"),
    ).length;
    results.push(
      finding(
        "target-blank-rel",
        "New-tab link safety",
        unsafeTargets === 0 ? "pass" : "warn",
        `${unsafeTargets} links open in a new tab without rel="noopener".`,
        unsafeTargets === 0
          ? {}
          : { recommendation: 'Add rel="noopener noreferrer" to target="_blank" links.' },
      ),
    );

    return results;
  },
};
