import { scoreBand, scoreColorVar } from "@/components/audit/score";

interface ScoreDialProps {
  readonly score: number;
  readonly size?: number;
  readonly label: string;
}

const bandLabel = { strong: "Strong", fair: "Needs work", poor: "Poor" } as const;

/** Circular score indicator. Pure SVG — no charting dependency. */
export function ScoreDial({ score, size = 132, label }: ScoreDialProps) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${score} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColorVar(score)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-ink font-semibold"
          style={{ fontSize: size * 0.28 }}
        >
          {score}
        </text>
      </svg>
      <div>
        <p className="text-sm font-semibold text-ink">{bandLabel[scoreBand(score)]}</p>
        <p className="mt-1 text-sm text-ink-muted">{label}</p>
      </div>
    </div>
  );
}
