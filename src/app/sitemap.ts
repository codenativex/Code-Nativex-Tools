import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { tools } from "@/lib/tools/registry";

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/tools", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/learning", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...tools.flatMap((tool) => [
      {
        url: absoluteUrl(`/tools/${tool.slug}`),
        lastModified: new Date(tool.addedAt),
        changeFrequency: "monthly" as const,
        priority: tool.status === "planned" ? 0.4 : 0.8,
      },
      {
        url: absoluteUrl(`/learning/${tool.slug}`),
        lastModified: new Date(tool.addedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
    ]),
  ];
}
