import { MemoryLesson, MemoryReport, MemoryRule, THEORY_TEXT } from "@/lib/api";
import { readData } from "@/lib/data";

export const metadata = { title: "文字记忆报告 · FOMC 观测站" };
const STRENGTH_TEXT: Record<string, string> = { strong: "强证据", medium: "中等证据", weak: "弱证据" };
const DIRECTION_TEXT: Record<string, string> = { cut: "偏降息", hike: "偏加息", hold: "偏维持" };
const DIRECTION_CLASS: Record<string, string> = { cut: "text-patina", hike: "text-rust", hold: "text-slate" };

function LessonCard({ lesson }: { lesson: MemoryLesson }) {
  return (
    <div className="border border-line bg-white/50 p-4">
      <p className="text-sm leading-7 text-ink-soft">{lesson.lesson}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate">
        {lesson.evidence_strength && <span>证据强度：{STRENGTH_TEXT[lesson.evidence_strength] ?? lesson.evidence_strength}</span>}
        {lesson.helps_with && <span>作用：{lesson.helps_with === "direction" ? "方向" : lesson.helps_with === "magnitude" ? "幅度" : lesson.helps_with}</span>}
        {lesson.overgeneralization_risk && <span className="text-rust/80">过度泛化风险：{lesson.overgeneralization_risk}</span>}
        {lesson.extrapolation_warning && <span className="text-rust/80">外推警告：{lesson.extrapolation_warning}</span>}
      </div>
    </div>
  );
}

function RuleCard({ rule }: { rule: MemoryRule }) {
  return (
    <div className="border border-line bg-white/60 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="num serif text-base">{rule.rule_id}</p>
        <p className={`text-sm ${DIRECTION_CLASS[rule.preferred_direction] ?? "text-slate"}`}>{DIRECTION_TEXT[rule.preferred_direction] ?? rule.preferred_direction}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{rule.conflict_pattern}</p>
      <div className="mt-3 grid gap-2 text-xs text-slate sm:grid-cols-2">
        <div>
          <p className="text-ink/70">可观察条件</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {rule.observable_conditions?.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
        <div className="space-y-1">
          <p><span className="text-ink/70">优先理论：</span>{rule.preferred_theory_family?.map((t) => THEORY_TEXT[t] ?? t).join("、")}</p>
          {rule.downweighted_theory_family?.length > 0 && <p><span className="text-ink/70">降权理论：</span>{rule.downweighted_theory_family.map((t) => THEORY_TEXT[t] ?? t).join("、")}</p>}
          <p><span className="text-ink/70">幅度指引：</span>{rule.magnitude_guidance}</p>
        </div>
      </div>
      {rule.boundary_conditions && rule.boundary_conditions.length > 0 && (
        <p className="mt-2 border-t border-line pt-2 text-xs leading-5 text-slate">
          边界条件：{rule.boundary_conditions.join("；")}
        </p>
      )}
    </div>
  );
}

export default async function MemoryPage() {
  const data = await readData<MemoryReport>("memory.json");
  if (!data) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="serif text-2xl">记忆报告不可用</p>
        <p className="mt-3 text-sm text-slate">未找到冻结文字记忆快照，或后端未连接。</p>
      </div>
    );
  }

  return (
    <div className="reveal max-w-4xl">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/20 pb-3">
        <h1 className="serif text-3xl">文字反思记忆报告</h1>
        <span className="text-xs text-slate">部署后冻结 · 决策层只读 · 不随新数据更新</span>
      </div>

      <p className="mt-5 text-sm leading-7 text-ink-soft">
        这份记忆由训练期（{data.training_window?.start ?? "—"} 至 {data.training_window?.end ?? "—"}，共 {data.training_window?.sample_count ?? "—"} 个决议样本）
        的逐期反思笔记归纳而成：每个样本记录哪些理论信号帮助了判断、哪些误导、适用条件是什么、不应过度泛化什么；
        再由记忆合成步骤归纳为结构化的全局经验、阶段经验、条件适用规则与逐理论适用性。决策智能体在每次预测时读取这份冻结记忆，
        用它识别冲突模式（如 R001–R005）、调整理论权重与幅度判断——但不据此重训或更新自身。
      </p>
      <p className="mt-2 text-xs text-slate">
        冻结时间 {data.frozen_at?.slice(0, 19).replace("T", " ") ?? "—"} ｜ 架构 {data.schema_version ?? "—"} ｜ 训练来源记录 {data.source_record_count ?? "—"} 条
      </p>

      {data.memory_quality_warning && (
        <div className="mt-5 border border-rust/30 bg-rust-soft/60 p-4 text-xs leading-6 text-rust">
          质量提示：{data.memory_quality_warning}
        </div>
      )}

      <h2 className="serif mt-10 border-b border-line pb-2 text-xl">条件适用规则（{data.conditional_applicability_rules.map((r) => r.rule_id).join("、")}）</h2>
      <p className="mt-2 text-xs text-slate">决策层在每次预测中显式比对当前冲突结构与这些规则的边界条件，命中时按规则调整方向与幅度。</p>
      <div className="mt-4 space-y-4">
        {data.conditional_applicability_rules.map((rule) => <RuleCard key={rule.rule_id} rule={rule} />)}
      </div>

      <h2 className="serif mt-10 border-b border-line pb-2 text-xl">全局经验</h2>
      <div className="mt-4 grid gap-3">
        {data.global_lessons.map((lesson, i) => <LessonCard key={i} lesson={lesson} />)}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="serif text-base">正常阶段经验</h3>
          <div className="mt-3 space-y-3">
            {data.normal_regime_lessons.map((lesson, i) => <LessonCard key={i} lesson={lesson} />)}
          </div>
        </div>
        <div>
          <h3 className="serif text-base">特殊阶段经验</h3>
          <div className="mt-3 space-y-3">
            {data.special_regime_lessons.map((lesson, i) => <LessonCard key={i} lesson={lesson} />)}
          </div>
        </div>
      </div>

      <h2 className="serif mt-10 border-b border-line pb-2 text-xl">逐理论适用性</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-xs text-slate">
              <th className="pb-2 pr-4 font-normal">理论</th>
              <th className="pb-2 pr-4 font-normal">何时有用</th>
              <th className="pb-2 pr-4 font-normal">何时误导</th>
              <th className="pb-2 pr-4 font-normal">决策层用法</th>
              <th className="pb-2 font-normal">证据</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.theory_specific_applicability).map(([theoryId, items]) => {
              const item = items?.[0] ?? ({} as MemoryLesson);
              return (
                <tr key={theoryId} className="border-t border-line/70 align-top">
                  <td className="py-3 pr-4">{THEORY_TEXT[theoryId] ?? theoryId}</td>
                  <td className="py-3 pr-4 text-xs leading-5 text-ink-soft">{item.useful_when ?? "—"}</td>
                  <td className="py-3 pr-4 text-xs leading-5 text-ink-soft">{item.misleading_when ?? "—"}</td>
                  <td className="py-3 pr-4 text-xs leading-5 text-ink-soft">{item.decision_layer_use ?? "—"}</td>
                  <td className="py-3 text-xs text-slate">{STRENGTH_TEXT[item.evidence_strength ?? ""] ?? item.evidence_strength ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="serif text-base">冲突解决经验</h3>
          <div className="mt-3 space-y-3">
            {data.conflict_resolution_lessons.map((lesson, i) => <LessonCard key={i} lesson={lesson} />)}
          </div>
        </div>
        <div>
          <h3 className="serif text-base">不确定性经验</h3>
          <div className="mt-3 space-y-3">
            {data.uncertainty_lessons.map((lesson, i) => <LessonCard key={i} lesson={lesson} />)}
          </div>
        </div>
      </div>

      <h2 className="serif mt-10 border-b border-line pb-2 text-xl">禁用规则</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-7 text-ink-soft">
        {data.do_not_use_rules.map((rule, i) => <li key={i}>{rule}</li>)}
      </ul>
    </div>
  );
}
