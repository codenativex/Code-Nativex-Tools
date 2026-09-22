import { attr, finding, type CategorySpec } from "./types";
import type { AuditFinding } from "../types";

const ZOOM_BLOCKED = /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/;

export const mobileChecks: CategorySpec = {
  id: "mobile",
  name: "Mobile Readiness",
  description: "Signals that determine how the page behaves on small screens.",
  run: (doc) => {
    const results: AuditFinding[] = [];
    const viewport = attr(doc, 'meta[name="viewport"]', "content");

    if (!viewport) {
      results.push(
        finding("viewport", "Viewport meta tag", "fail", "No viewport meta tag was found.", {
          recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
        }),
      );
    } else {
      const responsive = viewport.includes("width=device-width");
      results.push(
        finding(
          "viewport",
          "Viewport meta tag",
          responsive ? "pass" : "warn",
          responsive ? "A responsive viewport is declared." : "The viewport tag does not use width=device-width.",
          {
            evidence: viewport,
            ...(responsive ? {} : { recommendation: "Use width=device-width, initial-scale=1." }),
          },
        ),
      );

      const blocksZoom = ZOOM_BLOCKED.test(viewport);
      results.push(
        finding(
          "zoom",
          "Pinch zoom",
          blocksZoom ? "fail" : "pass",
          blocksZoom ? "The viewport prevents users from zooming." : "Users can zoom the page.",
          blocksZoom
            ? { recommendation: "Remove user-scalable=no and maximum-scale so the page stays accessible." }
            : {},
        ),
      );
    }

    const fixedWidths = doc('[style*="width:"][style*="px"]').length;
    results.push(
      finding(
        "fixed-widths",
        "Fixed pixel widths",
        fixedWidths === 0 ? "pass" : "warn",
        `${fixedWidths} elements declare a fixed pixel width inline.`,
        fixedWidths === 0
          ? {}
          : { recommendation: "Prefer relative widths and max-width so content reflows on narrow screens." },
      ),
    );

    return results;
  },
};
