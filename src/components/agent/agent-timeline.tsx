import { cn } from "@/lib/utils/cn";

type TimelineDensity = "comfortable" | "compact";

interface AgentTimelineProps {
  readonly steps: readonly string[];
  readonly density?: TimelineDensity;
}

/*
 * Each node is exactly one text line tall (or the text is padded to the node's
 * centre), so the number and the first line of its step share a centre line.
 * The connector runs from the bottom of one node to the top of the next.
 */
const styles: Record<TimelineDensity, { item: string; node: string; connector: string; text: string }> = {
  comfortable: {
    item: "gap-4 pb-6",
    node: "h-8 w-8 text-xs",
    connector: "left-[15.5px] top-8",
    text: "pt-1 text-[0.9375rem] leading-relaxed",
  },
  compact: {
    item: "gap-3 pb-4",
    node: "h-6 w-6 text-[0.6875rem]",
    connector: "left-[11.5px] top-6",
    text: "text-sm leading-6",
  },
};

export function AgentTimeline({ steps, density = "comfortable" }: AgentTimelineProps) {
  const style = styles[density];

  return (
    <ol>
      {steps.map((step, index) => (
        <li key={step} className={cn("relative flex last:pb-0", style.item)}>
          {index < steps.length - 1 ? (
            <span aria-hidden="true" className={cn("absolute bottom-0 w-px bg-line", style.connector)} />
          ) : null}
          <span
            aria-hidden="true"
            className={cn(
              "relative grid shrink-0 place-items-center rounded-full border border-line-strong bg-surface font-mono font-medium text-ink",
              style.node,
            )}
          >
            {index + 1}
          </span>
          <p className={cn("text-ink", style.text)}>{step}</p>
        </li>
      ))}
    </ol>
  );
}
