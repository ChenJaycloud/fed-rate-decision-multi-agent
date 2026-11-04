import { AgentCard } from "@/components/agent-card";
import { BetaBadge } from "@/components/beta-badge";
import { ProbabilityBar } from "@/components/probability-bar";
import { ACTION_TEXT, PredictionDetail, pct } from "@/lib/api";
import { readData } from "@/lib/data";
import { buildAgentInputs, THEORY_PARAMETER_NOTES } from "@/lib/theory-inputs";

export default async function AgentsPage() {
  const detail = await readData<PredictionDetail>("latest_prediction.json");
  if (!detail) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="serif text-2xl">暂无智能体分析</p>
        <p className="mt-3 text-sm text-slate">运行一次实时预测后，这里将展示七个理论智能体各自的判断与依据。</p>
      </div>
    );
  }
  const analysis = detail.analysis;

  return (
    <div className="reveal">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/20 pb-3">
        <h1 className="serif text-3xl">智能体分析 · {detail.meeting_date} 会议</h1>
        <div className="flex items-center gap-2">
          <BetaBadge status={detail.status} />
          <span className="text-xs text-slate">触发：{detail.trigger_type}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="text-sm leading-7 text-ink-soft">
          <p>
            决策结论：<span className="font-medium text-ink">{ACTION_TEXT[detail.predicted_action]}（{detail.predicted_label}）</span>
            。以下为七个理论智能体在各自变量授权范围内给出的独立判断；每张卡片列出该智能体实际看到的输入指标。
          </p>
          {analysis?.main_disagreement_dimension && (
            <p className="mt-2 border-l-2 border-line pl-4 text-slate">
              分歧概要：{analysis.main_disagreement_dimension}
            </p>
          )}
        </div>
        <div className="border border-line bg-white/60 p-4">
          <p className="text-xs text-slate">本次预测三方向概率</p>
          <div className="mt-3">
            <ProbabilityBar hike={detail.hike_probability} hold={detail.hold_probability} cut={detail.cut_probability} height={8} />
          </div>
          <p className="num mt-3 text-xs text-slate">加息 {pct(detail.hike_probability)} ｜ 维持 {pct(detail.hold_probability)} ｜ 降息 {pct(detail.cut_probability)}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {detail.agents.map((agent) => (
          <AgentCard
            key={agent.theory_id}
            agent={agent}
            inputs={buildAgentInputs(agent.theory_id, detail.snapshot)}
            parameters={THEORY_PARAMETER_NOTES[agent.theory_id]}
          />
        ))}
      </div>

      {analysis?.policy_phase_signal && (
        <div className="mt-10 border-t border-line pt-5 text-sm leading-7 text-slate">
          <p className="serif text-base text-ink">政策阶段信号：{analysis.policy_phase_signal.phase ?? "—"}</p>
          <p className="mt-1">{analysis.policy_phase_signal.evidence}</p>
          <p className="mt-1 text-xs">
            方向约束：{analysis.policy_phase_signal.direction_constraint ?? "—"} ｜ 幅度约束：{analysis.policy_phase_signal.magnitude_constraint ?? "—"}
            {analysis.high_conflict_flag ? " ｜ 高冲突：是" : ""}
            {analysis.minority_high_confidence_alert ? " ｜ 少数派高置信警示：是" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
