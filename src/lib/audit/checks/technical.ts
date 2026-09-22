import { finding, type CategorySpec } from "./types";
import type { AuditFinding } from "../types";

export const technicalChecks: CategorySpec = {
  id: "technical",
  name: "Technical & Security",
  description: "Transport security, response size and document-level configuration.",
  run: (doc, facts, page) => {
    const results: AuditFinding[] = [];
    const finalUrl = new URL(page.finalUrl);

    results.push(
      finalUrl.protocol === "https:"
        ? finding("https", "HTTPS", "pass", "The page is served over HTTPS.", { evidence: finalUrl.origin })
        : finding("https", "HTTPS", "fail", "The page is served over plain HTTP.", {
            recommendation: "Serve the site over HTTPS and redirect HTTP traffic permanently.",
          }),
    );

    results.push(
      page.requestedUrl === page.finalUrl
        ? finding("redirects", "Redirects", "pass", "The URL resolved without redirecting.")
        : finding("redirects", "Redirects", "warn", "The requested URL redirected before the page loaded.", {
            evidence: `${page.requestedUrl} → ${page.finalUrl}`,
            recommendation: "Link directly to the final URL to avoid an extra round trip.",
          }),
    );

    const kb = Math.round(facts.htmlBytes / 1024);
    results.push(
      finding(
        "html-size",
        "HTML document size",
        kb <= 150 ? "pass" : kb <= 400 ? "warn" : "fail",
        `The HTML document is ${kb.toLocaleString("en-US")} KB.`,
        kb <= 150
          ? {}
          : { recommendation: "Large documents delay first render. Trim inlined markup, data and styles." },
      ),
    );

    const blockingScripts = doc("head script[src]:not([async]):not([defer])").length;
    results.push(
      finding(
        "blocking-scripts",
        "Render-blocking scripts",
        blockingScripts === 0 ? "pass" : "warn",
        `${blockingScripts} scripts in <head> load without async or defer.`,
        blockingScripts === 0
          ? {}
          : { recommendation: "Add defer (or move to the end of <body>) so parsing is not blocked." },
      ),
    );

    results.push(
      doc('script[type="application/ld+json"]').length > 0
        ? finding("structured-data", "Structured data", "pass", "JSON-LD structured data is present.")
        : finding("structured-data", "Structured data", "warn", "No JSON-LD structured data was found.", {
            recommendation: "Add schema.org markup so search engines can classify the page.",
          }),
    );

    return results;
  },
};
