import { accessibilityChecks } from "./accessibility";
import { contentChecks } from "./content";
import { imageChecks } from "./images";
import { linkChecks } from "./links";
import { mobileChecks } from "./mobile";
import { seoChecks } from "./seo";
import { technicalChecks } from "./technical";
import type { CategorySpec } from "./types";

/** Every scored category, in the order the report presents them. */
export const categorySpecs: readonly CategorySpec[] = [
  seoChecks,
  contentChecks,
  accessibilityChecks,
  technicalChecks,
  linkChecks,
  imageChecks,
  mobileChecks,
];
