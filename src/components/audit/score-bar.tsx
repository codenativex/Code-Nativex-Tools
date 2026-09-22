import { scoreColorVar } from "@/components/audit/score";

interface ScoreBarProps {
  readonly score: number;
  readonly label: string;
}

export function ScoreBar({ score, label }: ScoreBarProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="font-mono text-sm tabular-nums text-ink-muted">{score}</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} score`}
      >
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: scoreColorVar(score) }} />
      </div>
    </div>
  );
}
