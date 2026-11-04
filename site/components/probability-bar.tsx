type Props = {
  hike: number;
  hold: number;
  cut: number;
  showLabels?: boolean;
  height?: number;
};

const COLORS = { hike: "#a8452c", hold: "#5b6472", cut: "#2e6e62" };

export function ProbabilityBar({ hike, hold, cut, showLabels = true, height = 10 }: Props) {
  const total = hike + hold + cut || 1;
  const items = [
    { key: "hike", label: "加息", value: hike },
    { key: "hold", label: "维持", value: hold },
    { key: "cut", label: "降息", value: cut },
  ] as const;
  return (
    <div className="w-full">
      <div className="flex w-full overflow-hidden rounded-sm" style={{ height }}>
        {items.map((it) => (
          <div
            key={it.key}
            style={{ width: `${(it.value / total) * 100}%`, background: COLORS[it.key] }}
            aria-label={`${it.label} ${(it.value * 100).toFixed(0)}%`}
          />
        ))}
      </div>
      {showLabels && (
        <div className="mt-2 flex justify-between text-xs text-slate">
          {items.map((it) => (
            <span key={it.key} className="num">
              {it.label} {Math.round((it.value / total) * 100)}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
