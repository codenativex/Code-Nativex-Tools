import { NextResponse } from "next/server";
import { getSocialWorkflowStatus } from "@/lib/social-agent/server";
import type { SocialAgentStatusResponse } from "@/lib/social-agent/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [brandSetup, dailyPublisher, approvalPublisher] = await Promise.all([
    getSocialWorkflowStatus(process.env.N8N_SOCIAL_BRAND_SETUP_WORKFLOW_ID),
    getSocialWorkflowStatus(process.env.N8N_SOCIAL_DAILY_PUBLISHER_WORKFLOW_ID),
    getSocialWorkflowStatus(process.env.N8N_SOCIAL_APPROVAL_WORKFLOW_ID),
  ]);
  const body: SocialAgentStatusResponse = {
    ok: brandSetup.reachable && dailyPublisher.reachable && approvalPublisher.reachable,
    checkedAt: new Date().toISOString(),
    brandSetup,
    dailyPublisher,
    approvalPublisher,
  };
  return NextResponse.json(body, { headers: { "cache-control": "no-store" } });
}
