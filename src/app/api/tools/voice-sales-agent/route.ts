import { NextResponse } from "next/server";

function statusPayload() {
  return {
    tool: "voice-sales-agent",
    configured: Boolean(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID?.trim()),
    provider: "ElevenLabs",
  };
}

export async function GET() {
  return NextResponse.json(statusPayload());
}

export async function POST() {
  return NextResponse.json(statusPayload());
}
