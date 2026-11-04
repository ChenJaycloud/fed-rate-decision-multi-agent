type Props = {
  lower: number | null | undefined;
  upper: number | null | undefined;
  predictedLabel?: string | null;
  action?: string | null;
};

const STEP_BP: Record<string, number> = {
  "<-50bp": -75,
  "[-50,-25)bp": -37.5,
  "[-25,0)bp": -12.5,
  "0bp": 0,
  "(0,25]bp": 12.5,
  "(25,50]bp": 37.5,
  ">50bp": 62.5,
};

function scale(value: number, min: number, max: number, width: number) {
  return ((value - min) / (max - min)) * width;
}

export function RateCorridor({ lower, upper, predictedLabel, action }: Props) {
  if (lower == null || upper == null) {
    return <div className="text-sm text-slate">目标区间不可得</div>;
  }
  const mid = (lower + upper) / 2;
  const step = STEP_BP[predictedLabel || "0bp"] ?? 0;
  const predictedMid = mid + step / 100;
  const width = 640;
  const height = 132;
  const min = Math.min(lower, predictedMid - 0.25) - 0.375;
  const max = Math.max(upper, predictedMid + 0.25) + 0.375;
  const x = (v: number) => scale(v, min, max, width - 40) + 20;
  const bandTop = 34;
  const bandH = 26;
  const predictedBandTop = 84;

  const ticks: number[] = [];
  const tickStep = 0.25;
  for (let t = Math.ceil(min / tickStep) * tickStep; t <= max + 1e-9; t += tickStep) {
    ticks.push(Math.round(t * 100) / 100);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="目标利率区间与预测路径">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={22} y2={height - 22} stroke="#d8d5ca" strokeWidth={0.6} strokeDasharray={Number.isInteger(t) ? "0" : "2 4"} />
          <text x={x(t)} y={height - 6} textAnchor="middle" fontSize={9} fill="#5b6472" className="num">
            {t.toFixed(2)}
          </text>
        </g>
      ))}

      <rect x={x(lower)} y={bandTop} width={x(upper) - x(lower)} height={bandH} fill="#14263b" opacity={0.9} rx={2} />
      <text x={x(mid)} y={bandTop + bandH / 2 + 3.5} textAnchor="middle" fontSize={10} fill="#f7f6f1" className="num">
        {lower.toFixed(2)} – {upper.toFixed(2)}% 当前
      </text>

      <rect
        x={x(predictedMid - 0.125)}
        y={predictedBandTop}
        width={x(predictedMid + 0.125) - x(predictedMid - 0.125)}
        height={bandH}
        fill={action === "cut" ? "#2e6e62" : action === "hike" ? "#a8452c" : "#5b6472"}
        opacity={0.14}
        stroke={action === "cut" ? "#2e6e62" : action === "hike" ? "#a8452c" : "#5b6472"}
        strokeDasharray="4 3"
        rx={2}
      />
      <text x={x(predictedMid)} y={predictedBandTop + bandH / 2 + 3.5} textAnchor="middle" fontSize={10} fill={action === "hike" ? "#a8452c" : action === "cut" ? "#2e6e62" : "#5b6472"} className="num">
        预测 {step > 0 ? "+" : ""}{step === 0 ? "0" : step}bp 中枢 {predictedMid.toFixed(3)}%
      </text>

      <line
        x1={x(mid)}
        y1={bandTop + bandH}
        x2={x(predictedMid)}
        y2={predictedBandTop}
        stroke="#14263b"
        strokeWidth={1}
        markerEnd="url(#arrow)"
      />
      <defs>
        <marker id="arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#14263b" />
        </marker>
      </defs>
    </svg>
  );
}
