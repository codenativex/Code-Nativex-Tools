import { finding, type CategorySpec } from "./types";
import type { AuditFinding } from "../types";

const CONTROL_SELECTOR = "input:not([type=hidden]), select, textarea";

export const accessibilityChecks: CategorySpec = {
  id: "accessibility",
  name: "Accessibility",
  description: "Automated checks for language, labelling and landmark structure.",
  run: (doc, facts) => {
    const results: AuditFinding[] = [];

    results.push(
      facts.lang
        ? finding("html-lang", "Document language", "pass", "The <html> element declares a language.", {
            evidence: facts.lang,
          })
        : finding("html-lang", "Document language", "fail", "The <html> element has no lang attribute.", {
            recommendation: 'Add lang="en" (or the correct language) so screen readers choose the right voice.',
          }),
    );

    const missingAlt = facts.imagesMissingAlt;
    results.push(
      facts.imageCount === 0
        ? finding("image-alt", "Image alternative text", "pass", "The page contains no <img> elements.")
        : finding(
            "image-alt",
            "Image alternative text",
            missingAlt === 0 ? "pass" : missingAlt <= 2 ? "warn" : "fail",
            `${missingAlt} of ${facts.imageCount} images have no alt attribute.`,
            missingAlt === 0
              ? {}
              : { recommendation: 'Describe meaningful images, and use alt="" for decorative ones.' },
          ),
    );

    const controls = doc(CONTROL_SELECTOR);
    // A control counts as labelled via <label>, aria-label, aria-labelledby or title.
    const unlabelled = controls.filter((_, element) => {
      const $el = doc(element);
      if ($el.attr("aria-label") ?? $el.attr("aria-labelledby") ?? $el.attr("title")) return false;
      const id = $el.attr("id");
      if (id && doc(`label[for="${id}"]`).length > 0) return false;
      return $el.closest("label").length === 0;
    }).length;
    results.push(
      controls.length === 0
        ? finding("form-labels", "Form labels", "pass", "The page contains no form controls.")
        : finding(
            "form-labels",
            "Form labels",
            unlabelled === 0 ? "pass" : "fail",
            `${unlabelled} of ${controls.length} form controls have no associated label.`,
            unlabelled === 0
              ? {}
              : { recommendation: "Associate every control with a <label for> or an aria-label." },
          ),
    );

    const mainCount = doc("main").length;
    results.push(
      finding(
        "landmarks",
        "Landmark regions",
        mainCount === 1 ? "pass" : "warn",
        `${doc("main, nav, header, footer").length} landmark elements were found, including ${mainCount} <main>.`,
        mainCount === 1 ? {} : { recommendation: "Wrap the primary content in a single <main> element." },
      ),
    );

    return results;
  },
};
