import { finding, type CategorySpec } from "./types";
import type { AuditFinding } from "../types";

export const imageChecks: CategorySpec = {
  id: "images",
  name: "Images",
  description: "How images are declared and whether the browser can plan for them.",
  run: (doc, facts) => {
    if (facts.imageCount === 0) {
      return [finding("no-images", "Images", "pass", "The page contains no <img> elements to review.")];
    }

    const results: AuditFinding[] = [];

    const missingDimensions = doc("img").filter((_, element) => {
      const $el = doc(element);
      return !($el.attr("width") && $el.attr("height"));
    }).length;
    results.push(
      finding(
        "image-dimensions",
        "Explicit dimensions",
        missingDimensions === 0 ? "pass" : "warn",
        `${missingDimensions} of ${facts.imageCount} images omit width and height.`,
        missingDimensions === 0
          ? {}
          : {
              recommendation:
                "Declare width and height so the browser can reserve space and avoid layout shift.",
            },
      ),
    );

    const lazyLoaded = doc('img[loading="lazy"]').length;
    results.push(
      finding(
        "image-lazy-loading",
        "Lazy loading",
        lazyLoaded > 0 ? "pass" : "warn",
        `${lazyLoaded} of ${facts.imageCount} images opt into lazy loading.`,
        lazyLoaded > 0 ? {} : { recommendation: 'Add loading="lazy" to images below the fold.' },
      ),
    );

    const responsiveSources = doc("picture source[type], img[srcset]").length;
    results.push(
      finding(
        "image-formats",
        "Responsive sources",
        responsiveSources > 0 ? "pass" : "warn",
        responsiveSources > 0
          ? `${responsiveSources} images provide responsive or alternative sources.`
          : "No image provides a srcset or <picture> source.",
        responsiveSources > 0
          ? {}
          : { recommendation: "Serve responsive sources so smaller screens download smaller files." },
      ),
    );

    return results;
  },
};
