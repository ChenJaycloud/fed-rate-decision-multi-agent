import { AgentCard } from "@/components/agent-card";
import { BetaBadge } from "@/components/beta-badge";
import { ProbabilityBar } from "@/components/probability-bar";
import { ACTION_TEXT, AgentRow } from "@/lib/api";
import { meetingDates, readData } from "@/lib/data";

const METHOD_TEXT: Record<string, string> = {
  research_C: "文字反思记忆（发表口径）",
  research_A: "无训练直接聚合",
  research_B: "训练集数值权重",
};

type MeetingDetail = {
  meeting: { meeting_date: string; status: string; has_projections: number; statement_time_et: string };
  predictions: {
    prediction_id: string;
    prediction_time: string;
    trigger_type: string;
    predicted_action: string;
    predicted_label: string;
    hike_probability: number;
    hold_probability: number;
    cut_probability: number;
    confidence: number | null;
    status: string;
    final_reasoning: string | null;
    llm_calls: number | null;
    llm_tokens: number | null;
    agents: AgentRow[];
  }[];
  actual: { actual_action: string; actual_label: string; change_bp: number; rate_before: number; rate_after: number } | null;
  evaluations: { prediction_id: string; window_type: string; direction_correct: number; label_correct: number; brier_direction: number; prediction_status: string }[];
  research_predictions: { method: string; month: string; predicted_label: string; actual_label: string; predicted_action: string; actual_action: string; direction_correct: boolean | null; label_correct: boolean | null }[];
};

export async function generateStaticParams() {
  const dates = await meetingDates();
  return dates.map((date) => ({ date }));
}

export default async function MeetingPage({ params }: { params: { date: string } }) {
  const detail = await readData<MeetingDetail>(`meetings/${params.date}.json`);
  if (!detail) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="serif text-2xl">会议不存在或后端未连接</p>
      </div>
    );
  }
  const latest = detail.predictions[0];

  return (
    <div className="reveal">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/20 pb-3">
        <h1 className="serif text-3xl">{detail.meeting.meeting_date} FOMC 会议</h1>
        <span className="text-xs text-slate">{detail.meeting.status === "completed" ? "已结束" : "未召开"} · 声明 {detail.meeting.statement_time_et} 美东</span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="border border-line bg-white/60 p-4">
          <p className="text-xs text-slate">实际决议</p>
          {detail.actual ? (
            <>
              <p className="num mt-2 text-2xl">
                {ACTION_TEXT[detail.actual.actual_action]} <span className="text-base">{detail.actual.change_bp >= 0 ? "+" : ""}{detail.actual.change_bp}bp</span>
              </p>
              <p className="num mt-1 text-xs text-slate">中枢 {detail.actual.rate_before.toFixed(3)}% → {detail.actual.rate_after.toFixed(3)}%</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate">尚未公布 / 数据未更新</p>
          )}
        </div>
        <div className="border border-line bg-white/60 p-4 md:col-span-2">
          <p className="text-xs text-slate">评估（仅对已评估的正式记录）</p>
          {detail.evaluations.length === 0 ? (
            <p className="mt-2 text-sm text-slate">暂无评估结果{detail.predictions.some((p) => p.status === "beta") ? "；beta 记录不参与准确率统计" : ""}。</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {detail.evaluations.map((e) => (
                <li key={e.prediction_id} className="num text-xs text-ink-soft">
                  {e.prediction_id.slice(0, 26)}… ｜ 窗口 {e.window_type} ｜ 方向{e.direction_correct ? "命中" : "未命中"} ｜ 7 档{e.label_correct ? "命中" : "未命中"} ｜ Brier {e.brier_direction}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {detail.research_predictions?.length > 0 && (
        <>
          <h2 className="serif mt-10 border-b border-line pb-2 text-xl">原研究存档（2015–2025 发表口径）</h2>
          <p className="mt-2 text-xs text-slate">原研究以月度编码记录（月末会议常记入下个月），以下已映射到本场会议。</p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate">
                <th className="pb-2 pr-4 font-normal">方法</th>
                <th className="pb-2 pr-4 font-normal">预测档位</th>
                <th className="pb-2 pr-4 font-normal">实际档位</th>
                <th className="pb-2 font-normal">判定</th>
              </tr>
            </thead>
            <tbody>
              {detail.research_predictions.map((r) => (
                <tr key={r.method} className="border-t border-line/70">
                  <td className="py-2 pr-4 text-xs text-slate">{METHOD_TEXT[r.method] ?? r.method}</td>
                  <td className="num py-2 pr-4">{r.predicted_label}</td>
                  <td className="num py-2 pr-4">{r.actual_label}</td>
                  <td className={`py-2 text-xs ${r.direction_correct ? "text-patina" : "text-rust"}`}>
                    {r.direction_correct == null ? "—" : r.direction_correct ? "方向命中" : "方向未命中"}
                    {r.label_correct != null && (r.label_correct ? " · 七档命中" : " · 七档未命中")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h2 className="serif mt-10 border-b border-line pb-2 text-xl">预测记录（{detail.predictions.length} 条）</h2>
      {detail.predictions.length === 0 ? (
        <p className="mt-4 text-sm text-slate">该会议没有系统预测记录。</p>
      ) : (
        <div className="mt-5 space-y-8">
          {detail.predictions.map((p) => (
            <div key={p.prediction_id} className="border border-line bg-white/50 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm">
                  <span className="num font-medium">{ACTION_TEXT[p.predicted_action]} · {p.predicted_label}</span>
                  <span className="ml-2 text-xs text-slate">触发 {p.trigger_type}</span>
                  <BetaBadge status={p.status} />
                </p>
                <p className="num text-xs text-slate">{p.llm_calls ?? "—"} 次调用 · {p.llm_tokens ?? "—"} tokens</p>
              </div>
              <div className="mt-3 max-w-lg">
                <ProbabilityBar hike={p.hike_probability} hold={p.hold_probability} cut={p.cut_probability} height={7} />
              </div>
              {p.final_reasoning && <p className="mt-3 text-sm leading-7 text-ink-soft">{p.final_reasoning}</p>}
            </div>
          ))}
        </div>
      )}

      {latest && latest.agents.length > 0 && (
        <>
          <h2 className="serif mt-12 border-b border-line pb-2 text-xl">最新一版预测的智能体观点</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {latest.agents.map((agent) => (
              <AgentCard key={agent.theory_id} agent={agent} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
