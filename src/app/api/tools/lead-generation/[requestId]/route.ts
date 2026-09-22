import { leadAgentFetch, passThrough } from "@/lib/lead-agent/server";

export async function GET(_request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params;
    const response = await leadAgentFetch(`/api/internal/lead-generation/${encodeURIComponent(requestId)}/progress`);
    return passThrough(response);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Lead agent is unavailable." },
      { status: 502 },
    );
  }
}
