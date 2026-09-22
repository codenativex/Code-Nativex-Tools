import { leadAgentFetch, passThrough } from "@/lib/lead-agent/server";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const response = await leadAgentFetch("/api/internal/lead-generation/run", {
      method: "POST",
      body,
    });
    return passThrough(response);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Lead agent is unavailable." },
      { status: 502 },
    );
  }
}
