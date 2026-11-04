import { ACTION_TEXT, AgentRow, THEORY_TEXT } from "@/lib/api";
import { ProbabilityBar } from "./probability-bar";

function labelDirection(label: string): "hike" | "hold" | "cut" {
  if (["<-50bp", "[-50,-25)bp", "[-25,0)bp"].includes(label)) return "cut";
  if (label === "0bp") return "hold";
  return "hike";
}

const BORDER: Record<string, string> = { hike: "border-l-rust", hold: "border-l-slate", cut: "border-l-patina" };

export function AgentCard({
  agent,
  inputs,
  parameters,
}: {
  agent: AgentRow;
  inputs?: { label: string; value: string }[];
  parameters?: string[];
}) {
  let dist: Record<string, number> = {};
  try {
    dist = JSON.parse(agent.probability_distribution_json || "{}");
  } catch {
    dist = {};
  }
  const direction = labelDirection(agent.recommendation);
  const values = Object.values(dist);
  const hike = ["(0,25]bp", "(25,50]bp", ">50bp"].reduce((s, k) => s + (dist[k] || 0), 0);
  const cut = ["<-50bp", "[-50,-25)bp", "[-25,0)bp"].reduce((s, k) => s + (dist[k] || 0), 0);
  const hold = dist["0bp"] || 0;
  const anyDist = values.length > 0;

  return (
    <article className={`border border-line border-l-4 ${BORDER[direction]} bg-white/60 p-5`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="serif text-base text-ink">{THEORY_TEXT[agent.theory_id] || agent.theory_id}</h3>
        <span className="num text-sm">{ACTION_TEXT[direction]} · {agent.recommendation}</span>
      </div>
      {anyDist && (
        <div className="mt-3">
          <ProbabilityBar hike={hike} hold={hold} cut={cut} height={6} />
        </div>
      )}
      <p className="mt-3 text-sm leading-6 text-ink-soft">{agent.primary_reason}</p>
      {agent.secondary_reason && <p className="mt-1 text-sm leading-6 text-slate">{agent.secondary_reason}</p>}
      {inputs && inputs.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-xs text-ink/70">本智能体看到的输入</p>
          <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {inputs.map((item) => (
              <div key={item.label} className="flex justify-between border-b border-line/40 py-0.5">
                <span className="text-slate">{item.label}</span>
                <span className="num">{item.value}</span>
              </div>
            ))}
          </div>
          {parameters && parameters.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[11px] leading-5 text-slate">
              {parameters.map((p) => <li key={p}>{p}</li>)}
            </ul>
          )}
        </div>
      )}
      {agent.risk_note && (
        <p className="mt-2 border-t border-line pt-2 text-xs leading-5 text-slate">风险提示：{agent.risk_note}</p>
      )}
    </article>
  );
}
