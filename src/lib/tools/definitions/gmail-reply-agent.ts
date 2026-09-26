import type { ToolDefinition } from "../types";

export const gmailReplyAgentTool: ToolDefinition = {
  id: "gmail-reply-agent",
  slug: "gmail-reply-agent",
  name: "Gmail Reply Agent",
  category: "ai-agents",
  icon: "agent",
  status: "live",
  summary: "Automatically triage Gmail messages, reply to safe inquiries and route sensitive emails for human review.",
  description:
    "Monitor the production n8n Gmail automation from Code Nativex Tools. It classifies new emails, replies in the original thread when safe, routes sensitive messages to human review and respects unsubscribe requests.",
  keywords: ["gmail reply agent", "ai email agent", "email automation", "gmail automation", "n8n gmail"],
  featured: true,
  addedAt: "2026-09-24",
  fields: [],
  runtime: {
    endpoint: "/api/tools/gmail-reply-agent/status",
    stages: [{ id: "status", label: "Checking agent status" }],
    resultView: "code-output",
  },
  learning: {
    problem: "Teams lose time on repetitive inbox messages while sensitive emails still need human review.",
    audience: ["Agencies", "Service businesses", "Support teams", "Sales teams"],
    input: "A connected Gmail inbox, approved company facts and the Code Nativex n8n workflows.",
    output: "Same-thread replies, human-review routing, unsubscribe handling and error alerts.",
    howItWorks: ["Receives a new email.", "Classifies intent and risk.", "Replies, routes for review or ignores safely.", "Updates the Gmail thread and labels."],
    exampleUseCase: "A website inquiry receives a professional reply while a refund request is sent for human review.",
    capabilities: [
      {
        title: "Intent and risk triage",
        body: "Every new email is classified by what it is asking for and how sensitive it is before anything is sent.",
      },
      {
        title: "Same-thread replies",
        body: "Safe inquiries get a professional reply inside the original Gmail thread, drawn from your approved company facts.",
      },
      {
        title: "Human review for sensitive mail",
        body: "Refund requests and other sensitive messages are routed to a person instead of being answered automatically.",
      },
      {
        title: "Unsubscribes and error alerts",
        body: "Unsubscribe requests are respected, and a separate workflow raises an alert when something fails.",
      },
    ],
    requirements: [
      "A connected Gmail inbox.",
      "Approved company facts the agent is allowed to use in replies.",
      "The Code Nativex reply and error-alert workflows running in n8n.",
    ],
    limitations: [
      "The agent runs in n8n. This page shows the live status of its workflows; it does not process email in your browser.",
      "Messages classified as sensitive are never answered automatically.",
    ],
  },
};
