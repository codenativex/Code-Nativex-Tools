import type { ToolDefinition } from "../types";

export const socialMediaPostAgentTool: ToolDefinition = {
  id: "social-media-post-agent",
  slug: "social-media-post-agent",
  name: "Social Media Post Agent",
  category: "ai-agents",
  icon: "agent",
  status: "live",
  summary: "Generate branded daily posts, request WhatsApp approval and publish approved content automatically.",
  description:
    "The Code Nativex Social Media Post Agent studies a business website, builds a reusable brand profile, creates daily captions and branded posters, sends each post to WhatsApp for approval and publishes approved content to Facebook and Instagram.",
  keywords: ["social media agent", "post generator", "whatsapp approval", "facebook automation", "instagram automation", "n8n social media"],
  featured: true,
  addedAt: "2026-09-24",
  fields: [],
  runtime: {
    endpoint: "/api/tools/social-media-post-agent/status",
    stages: [{ id: "status", label: "Checking workflow status" }],
    resultView: "code-output",
  },
  learning: {
    problem: "Businesses need consistent social content, but manual design, approval and publishing consume time every day.",
    audience: ["Agencies", "Local businesses", "Marketing teams", "Content managers"],
    input: "Business website, brand details, posting preferences, connected Google Sheet, WhatsApp Cloud API, Facebook and Instagram accounts.",
    output: "Daily caption and branded poster, WhatsApp YES/NO approval, automatic publishing and tracked post history.",
    howItWorks: [
      "Reads the website and saves a reusable brand profile.",
      "Creates a daily caption and campaign visual without repeating recent posts.",
      "Uploads the final branded poster and sends it to WhatsApp for approval.",
      "YES publishes to the selected platforms; NO requests a fresh version using the same post record.",
      "After five rejections the post is stopped for manual review.",
    ],
    exampleUseCase: "A restaurant receives a branded daily post on WhatsApp, taps YES and the approved post is published to Facebook and Instagram automatically.",
    capabilities: [
      {
        title: "Brand profile from your website",
        body: "Reads your site once and saves a reusable brand profile that every future post is built from.",
      },
      {
        title: "Daily caption and poster",
        body: "Writes a caption and creates a branded poster each day, without repeating recent posts.",
      },
      {
        title: "WhatsApp approval",
        body: "Each finished post is sent to WhatsApp with YES and NO buttons before anything goes live.",
      },
      {
        title: "Automatic publishing",
        body: "Approved posts publish to Facebook and Instagram, and every post is tracked in its history.",
      },
    ],
    requirements: [
      "Your business website and brand details.",
      "The Brand Setup, Daily Publisher and WhatsApp Approval workflows, imported and active in n8n.",
      "OpenAI, Google Sheets, Cloudinary, WhatsApp Cloud API and Meta publishing credentials, connected inside n8n.",
    ],
    limitations: [
      "Nothing is published without a YES on WhatsApp.",
      "After five rejections a post stops and waits for manual review.",
      "Publishing currently covers Facebook and Instagram.",
    ],
  },
};
