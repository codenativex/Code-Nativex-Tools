import type { ComponentType } from "react";

import { WebsiteAuditRunner } from "@/components/audit-agent/website-audit-runner";
import { GmailReplyAgentRunner } from "@/components/gmail-agent/gmail-reply-agent-runner";
import { LeadGenerationRunner } from "@/components/lead-agent/lead-generation-runner";
import { SocialMediaPostAgentRunner } from "@/components/social-agent/social-media-post-agent-runner";
import { ToolRunner } from "@/components/tools/tool-runner";
import { ButtonLink } from "@/components/ui/button";
import { VoiceSalesAgentRunner } from "@/components/voice-agent/voice-sales-agent-runner";
import type { ToolDefinition } from "@/lib/tools/types";

/**
 * Agents whose run experience needs its own interface. Registering one here is
 * the only step needed to give an agent a bespoke runner; everything else on
 * the page comes from its definition.
 */
const customRunners: Readonly<Record<string, ComponentType>> = {
  "website-audit": WebsiteAuditRunner,
  "lead-generation": LeadGenerationRunner,
  "gmail-reply-agent": GmailReplyAgentRunner,
  "social-media-post-agent": SocialMediaPostAgentRunner,
  "voice-sales-agent": VoiceSalesAgentRunner,
};

function InDevelopmentPanel({ tool }: { readonly tool: ToolDefinition }) {
  return (
    <div className="rounded-card border border-line bg-surface p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-ink">{tool.name} is in development</h2>
      <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-muted">
        Its specification is published so you can see exactly what it will do before it ships. We don&rsquo;t put
        placeholder results behind a working-looking interface. When the engine is live, this page becomes runnable
        and nothing else about it changes.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={`/learning/${tool.slug}`}>Read the specification</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Tell us what you need
        </ButtonLink>
      </div>
    </div>
  );
}

/** The interactive area of an agent's run page. */
export function AgentWorkspace({ tool }: { readonly tool: ToolDefinition }) {
  const Runner = customRunners[tool.slug];
  if (Runner) return <Runner />;
  if (tool.runtime) return <ToolRunner tool={tool} submitLabel="Run" />;
  return <InDevelopmentPanel tool={tool} />;
}
