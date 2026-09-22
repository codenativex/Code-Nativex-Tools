import type { DiscoverySource } from "./types";

export const DISCOVERY_SOURCES: Array<{ value: DiscoverySource; label: string }> = [
  { value: "google_maps", label: "Local businesses in an area" },
  { value: "linkedin_public_search", label: "Businesses posting requirements on LinkedIn" },
  { value: "job_platform_public_search", label: "Public client projects" },
  { value: "agency_collaboration_public_search", label: "Agency and white-label partners" },
  { value: "google_intent_public_search", label: "Businesses actively looking for help" },
];

export const BUSINESS_CATEGORIES = [
  "Hotels",
  "Salons",
  "Dentists",
  "Restaurants",
  "Real-Estate Agencies",
  "Marketing Agencies",
  "Design Agencies",
  "SaaS Companies",
  "E-Commerce Businesses",
] as const;

export const SERVICES = [
  "New Website",
  "Website Redesign",
  "Frontend Development",
  "MVP Development",
  "SEO Improvement",
  "Performance Optimization",
  "White-Label Development Partnership",
] as const;

export const LEAD_TYPES = [
  "Local Businesses",
  "Direct Clients",
  "Marketing or Design Agencies",
  "White-Label Partners",
  "SaaS Companies",
  "Companies Currently Hiring Developers",
  "Businesses Posting Collaboration Opportunities",
] as const;

export const SOURCE_DEFAULTS: Record<DiscoverySource, { service: string; leadType: string }> = {
  google_maps: { service: "Website Redesign", leadType: "Local Businesses" },
  linkedin_public_search: { service: "Frontend Development", leadType: "Companies Currently Hiring Developers" },
  job_platform_public_search: { service: "New Website", leadType: "Direct Clients" },
  agency_collaboration_public_search: {
    service: "White-Label Development Partnership",
    leadType: "White-Label Partners",
  },
  google_intent_public_search: { service: "Website Redesign", leadType: "Direct Clients" },
};
