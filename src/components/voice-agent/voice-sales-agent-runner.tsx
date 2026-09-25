"use client";

import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const WIDGET_SCRIPT_ID = "elevenlabs-convai-widget-script";
const WIDGET_SCRIPT_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";

function MicrophoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 13v-2M8 16V8M12 19V5M16 16V8M20 13v-2" />
    </svg>
  );
}

export function VoiceSalesAgentRunner() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [showAgent, setShowAgent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID?.trim();

  useEffect(() => {
    if (!showAgent || !agentId || !hostRef.current) return;

    let script = document.getElementById(WIDGET_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = WIDGET_SCRIPT_ID;
      script.src = WIDGET_SCRIPT_SRC;
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }

    const host = hostRef.current;
    host.replaceChildren();

    const widget = document.createElement("elevenlabs-convai");
    widget.setAttribute("agent-id", agentId);
    widget.setAttribute("variant", "expanded");
    widget.setAttribute("dismissible", "false");
    widget.setAttribute("aria-label", "CodeNativeX AI Voice Sales Agent");
    host.appendChild(widget);

    return () => {
      host.replaceChildren();
    };
  }, [agentId, showAgent]);

  function openLiveDemo() {
    setError(null);

    if (!agentId) {
      setError(
        "Voice Agent ID is not configured. Add NEXT_PUBLIC_ELEVENLABS_AGENT_ID to .env.local and restart the app.",
      );
      return;
    }

    // Do not pre-request microphone access here. The official ElevenLabs
    // conversation widget requests and manages microphone permission itself.
    // A separate getUserMedia preflight can create duplicate/stale permission
    // errors even when Chrome already shows the microphone as Allowed.
    setShowAgent(true);
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-card border border-line bg-surface">
        <div className="border-b border-line bg-surface-muted px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">Live voice demo</p>
              <h2 className="mt-1 text-lg font-semibold text-ink">Talk with the CodeNativeX AI Sales Agent</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted">
              <span className="h-2 w-2 rounded-full bg-positive" aria-hidden="true" />
              ElevenLabs voice agent
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {!showAgent ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-full border border-line bg-accent text-on-accent">
                  <WaveIcon />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-ink">Start a natural sales conversation</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                  Ask about CodeNativeX services, explain your business problem, test an objection, or switch naturally
                  between English and Urdu. ElevenLabs will request microphone access when the live conversation starts.
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-ink-muted">
                  {["Company knowledge", "English + Urdu", "Objection handling", "Real-time voice"].map((item) => (
                    <span key={item} className="rounded-full border border-line bg-surface-muted px-3 py-1.5">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-card border border-line bg-surface-muted p-4">
                <p className="text-sm font-semibold text-ink">Ready to test?</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  Use headphones if possible for the cleanest turn-taking and echo control.
                </p>
                <Button onClick={openLiveDemo} fullWidth className="mt-4">
                  <MicrophoneIcon />
                  Try voice agent
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Voice session</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Start the conversation in the ElevenLabs panel below. Allow microphone access if the browser asks.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowAgent(false)}>
                  Close demo
                </Button>
              </div>

              <div
                ref={hostRef}
                className="min-h-32 rounded-card border border-line bg-surface-muted p-3"
                aria-live="polite"
              />
            </div>
          )}
        </div>
      </section>

      {error ? (
        <Alert tone="error" title="Voice demo could not start">
          {error}
        </Alert>
      ) : null}

      <Alert tone="info" title="Privacy note">
        This demo uses ElevenLabs to process the live voice conversation. Do not share passwords, payment card details,
        government IDs, or other sensitive information during a public demo.
      </Alert>
    </div>
  );
}
