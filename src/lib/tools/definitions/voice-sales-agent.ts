import type { ToolDefinition } from "../types";

export const voiceSalesAgentTool: ToolDefinition = {
  id: "voice-sales-agent",
  slug: "voice-sales-agent",
  name: "AI Voice Sales Agent",
  category: "ai-agents",
  icon: "agent",
  status: "beta",
  summary: "Talk live with CodeNativeX's AI sales agent using your microphone.",
  description:
    "Start a real-time voice conversation with the CodeNativeX AI Sales Agent. The agent is grounded in CodeNativeX company knowledge, can explain services, understand requirements, handle common objections professionally and continue in English or Urdu based on the conversation.",
  keywords: [
    "ai voice agent",
    "sales agent",
    "voice sales",
    "elevenlabs agent",
    "conversational ai",
    "urdu ai agent",
  ],
  featured: true,
  addedAt: "2026-09-25",
  fields: [],
  runtime: {
    endpoint: "/api/tools/voice-sales-agent",
    stages: [{ id: "ready", label: "Voice agent ready" }],
    resultView: "code-output",
  },
  learning: {
    problem:
      "Prospects often want to understand a service through a natural conversation instead of reading a long page or waiting for a sales representative.",
    audience: ["Potential clients", "Sales teams", "Agencies", "Businesses evaluating AI voice automation"],
    input:
      "Microphone access and a question, requirement or business problem you want to discuss with the CodeNativeX sales agent.",
    output:
      "A live voice conversation grounded in CodeNativeX company knowledge, with relevant service explanations and natural follow-up questions.",
    howItWorks: [
      "Open the live demo and allow microphone access when your browser asks.",
      "Speak naturally in English or Urdu and explain what you need.",
      "The ElevenLabs voice agent uses the configured CodeNativeX prompt and knowledge base to answer.",
      "The agent asks relevant follow-up questions and handles common objections without inventing prices or company facts.",
    ],
    exampleUseCase:
      "A business owner opens Try now, explains that they already have a website but are not getting enough leads, and discusses whether a website audit, automation or lead generation solution is relevant.",
    capabilities: [
      {
        title: "Real-time voice conversation",
        body: "Speak naturally through your microphone and hear answers in the moment, without typing.",
      },
      {
        title: "Grounded in company knowledge",
        body: "Answers come from the configured CodeNativeX prompt and knowledge base rather than the open web.",
      },
      {
        title: "English and Urdu",
        body: "The conversation continues in whichever of the two languages you speak.",
      },
      {
        title: "Honest sales handling",
        body: "Asks relevant follow-up questions and handles common objections without inventing prices or company facts.",
      },
    ],
    requirements: ["A browser with a working microphone.", "Microphone permission when your browser asks for it."],
    limitations: [
      "This is a standalone browser voice demo.",
      "It is not yet connected to the Lead Generation Agent, outbound phone calling, CRM actions or meeting booking.",
    ],
  },
};
