"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AgentCard } from "@/components/agent-card";
import { ProbabilityBar } from "@/components/probability-bar";
import { ACTION_TEXT, AgentRow, HistoryStats, THEORY_TEXT, pct } from "@/lib/api";
import { buildAgentInputs, THEORY_PARAMETER_NOTES } from "@/lib/theory-inputs";

type RepMeeting = {
  meeting_date: string;
  replayed: boolean;
  research: null | { predicted_label: string; direction_correct: boolean | null };
  prediction: null | {
    prediction_id: string;
    predicted_action: string;
    predicted_label: string;
    hike_probability: number;
    hold_probability: number;
    cut_probability: number;
    confidence: number | null;
  };
  actual: null | { actual_action: string; actual_label: string; change_bp: number };
  direction_correct: boolean | null;
};

type RepDetail = {
  prediction_id: string;
  predicted_action: string;
  predicted_label: string;
  hike_probability: number;
  hold_probability: number;
  cut_probability: number;
  final_reasoning: string | null;
  agents: AgentRow[];
  actual: null | { actual_action: string; actual_label: string; change_bp: number; rate_before: number; rate_after: number };
  snapshot?: {
    as_of: string;
    macro: Record<string, number | null>;
    expectations: Record<string, number | null>;
    policy: { previous_policy_rate: number | null; policy_rate_range: Record<string, number> | null; regime: string | null };
    warnings: string[];
  } | null;
};

type ArchiveMeeting = {
  meeting: { meeting_date: string };
  actual: null | { actual_action: string; actual_label: string; change_bp: number };
  research_predictions: { method: string; predicted_label: string; actual_label: string; direction_correct: boolean | null; label_correct: boolean | null }[];
};

const MACRO_ROWS: [string, string][] = [
  ["inflation_current", "PCE 同比"],
  ["core_inflation", "核心 PCE 同比"],
  ["output_gap", "产出缺口"],
  ["unemployment_rate", "失业率"],
  ["unemployment_gap", "失业缺口"],
  ["reer", "实际汇率"],
  ["import_price_yoy", "进口价格同比"],
  ["corporate_credit_spread", "信用利差"],
  ["stock_price_yoy", "股价同比"],
  ["house_price_yoy", "房价同比"],
  ["expected_inflation", "通胀预期"],
  ["expected_output_gap", "预期产出缺口"],
];

export function ReplayExplorer() {
  const [meetings, setMeetings] = useState<RepMeeting[]>([]);
  const [history, setHistory] = useState<HistoryStats | null>(null);
  const [year, setYear] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<RepDetail | null>(null);
  const [archive, setArchive] = useState<ArchiveMeeting | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const [m, h] = await Promise.all([
      fetch("/data/replay_meetings.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/data/history.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    if (m) setMeetings(m.meetings);
    if (h) setHistory(h);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const years = useMemo(() => {
    const ys = Array.from(new Set(meetings.map((m) => m.meeting_date.slice(0, 4))));
    return ["all", ...ys.sort()];
  }, [meetings]);

  const visible = useMemo(
    () => meetings.filter((m) => year === "all" || m.meeting_date.startsWith(year)),
    [meetings, year],
  );

  const select = useCallback(async (date: string) => {
    setSelected(date);
    setDetail(null);
    setArchive(null);
    const m = meetings.find((x) => x.meeting_date === date);
    if (m?.replayed) {
      setLoading(true);
      try {
        const res = await fetch(`/data/replay/${date}.json`);
        if (res.ok) setDetail(await res.json());
      } finally {
        setLoading(false);
      }
      return;
    }
    if (m?.research) {
      setLoading(true);
      try {
        const res = await fetch(`/data/meetings/${date}.json`);
        if (res.ok) setArchive(await res.json());
      } finally {
        setLoading(false);
      }
    }
  }, [meetings]);

  return (
    <div className="reveal">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/20 pb-3">
        <h1 className="serif text-3xl">历史预测</h1>
        <p className="text-xs text-slate">2015 年后的任意会议节点 · 预测与真实决议对照</p>
      </div>

      {history?.available && (
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[
            { label: "已记录会议", value: String(history.sample_count) },
            { label: "方向准确率", value: pct(history.direction_accuracy) },
            { label: "七档准确率", value: pct(history.label_accuracy) },
            { label: "年份跨度", value: `${history.years[0]?.year ?? ""}–${history.years[history.years.length - 1]?.year ?? ""}` },
          ].map((item) => (
            <div key={item.label} className="border border-line bg-white/60 p-4">
              <p className="text-xs text-slate">{item.label}</p>
              <p className="num serif mt-2 text-3xl">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        <div>
          <div className="flex flex-wrap gap-1.5">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`focus-ring num rounded-sm border px-2.5 py-1 text-xs ${
                  year === y ? "border-ink bg-ink text-paper" : "border-line bg-white/60 text-slate hover:border-ink/40"
                }`}
              >
                {y === "all" ? "全部" : y}
              </button>
            ))}
          </div>
          <div className="mt-4 max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
            {visible.map((m) => {
              const label = m.prediction?.predicted_label ?? m.research?.predicted_label;
              const correctness = m.replayed ? m.direction_correct : m.research?.direction_correct ?? null;
              const color = !label ? "bg-line" : correctness === null ? "bg-slate" : correctness ? "bg-patina" : "bg-rust";
              return (
                <button
                  key={m.meeting_date}
                  onClick={() => select(m.meeting_date)}
                  className={`focus-ring flex w-full items-center justify-between rounded-sm border px-3 py-2 text-left text-sm ${
                    selected === m.meeting_date ? "border-ink bg-white" : "border-line bg-white/50 hover:border-ink/40"
                  }`}
                >
                  <span className="num">{m.meeting_date}</span>
                  <span className="flex items-center gap-2 text-xs text-slate">
                    {label ? <span className="num">预测 {label}</span> : <span>无记录</span>}
                    <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {!selected && (
            <div className="border border-line bg-white/50 p-10 text-center text-sm text-slate">
              在左侧选择任意一场会议，查看当时系统的判断、七个智能体的理由，以及与真实决议的对照。
            </div>
          )}
          {loading && <div className="p-10 text-center text-sm text-slate">加载中…</div>}

          {archive && (
            <div className="border border-line bg-white/60 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="text-xs text-slate">系统预测</p>
                  <p className="num serif mt-1 text-2xl">
                    {archive.research_predictions.find((r) => r.method === "research_C")?.predicted_label ??
                      archive.research_predictions[0]?.predicted_label ?? "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate">实际决议</p>
                  {archive.actual ? (
                    <p className="num serif mt-1 text-2xl">
                      {ACTION_TEXT[archive.actual.actual_action]}{" "}
                      <span className="text-base">{archive.actual.change_bp >= 0 ? "+" : ""}{archive.actual.change_bp}bp</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-slate">—</p>
                  )}
                </div>
              </div>
              {(() => {
                const row = archive.research_predictions.find((r) => r.method === "research_C") ?? archive.research_predictions[0];
                if (!row) return null;
                return (
                  <p className={`mt-4 text-sm ${row.direction_correct ? "text-patina" : "text-rust"}`}>
                    {row.direction_correct ? "方向命中" : "方向未命中"}
                    {row.label_correct != null && (row.label_correct ? " · 七档命中" : " · 七档未命中")}
                  </p>
                );
              })()}
            </div>
          )}

          {detail && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border border-line bg-white/60 p-5">
                <div>
                  <p className="text-xs text-slate">系统预测</p>
                  <p className="num serif mt-1 text-3xl">
                    {ACTION_TEXT[detail.predicted_action]} <span className="text-base">{detail.predicted_label}</span>
                  </p>
                  <div className="mt-3 w-72">
                    <ProbabilityBar hike={detail.hike_probability} hold={detail.hold_probability} cut={detail.cut_probability} height={7} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate">实际决议</p>
                  {detail.actual ? (
                    <>
                      <p className="num serif mt-1 text-3xl">
                        {ACTION_TEXT[detail.actual.actual_action]}{" "}
                        <span className="text-base">{detail.actual.change_bp >= 0 ? "+" : ""}{detail.actual.change_bp}bp</span>
                      </p>
                      <p className="num mt-1 text-xs text-slate">
                        {detail.actual.rate_before.toFixed(3)}% → {detail.actual.rate_after.toFixed(3)}%（中枢）
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-slate">—</p>
                  )}
                  <p className={`mt-2 text-sm ${detail.predicted_action === detail.actual?.actual_action ? "text-patina" : "text-rust"}`}>
                    {detail.predicted_action === detail.actual?.actual_action ? "方向命中" : "方向未命中"}
                  </p>
                </div>
              </div>

              {detail.snapshot && (
                <div className="border border-line bg-white/50 p-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="serif text-base">当时可见的数据</h3>
                    <span className="num text-xs text-slate">
                      目标区间 {detail.snapshot.policy.policy_rate_range?.lower?.toFixed(2)}–{detail.snapshot.policy.policy_rate_range?.upper?.toFixed(2)}% · 阶段 {detail.snapshot.policy.regime ?? "—"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm sm:grid-cols-3">
                    {MACRO_ROWS.map(([key, label]) => {
                      const v = detail.snapshot?.macro?.[key] ?? detail.snapshot?.expectations?.[key];
                      return (
                        <div key={key} className="flex justify-between border-b border-line/50 py-1">
                          <span className="text-slate">{label}</span>
                          <span className="num">{v == null ? "—" : v.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                  {detail.snapshot.warnings?.length > 0 && (
                    <p className="mt-2 text-xs text-slate">数据提示：{detail.snapshot.warnings.join("；")}</p>
                  )}
                </div>
              )}

              {detail.final_reasoning && (
                <div className="border border-line bg-white/50 p-5 text-sm leading-7 text-ink-soft">{detail.final_reasoning}</div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                {detail.agents.map((agent) => (
                  <AgentCard
                    key={agent.theory_id}
                    agent={agent}
                    inputs={buildAgentInputs(agent.theory_id, detail.snapshot)}
                    parameters={THEORY_PARAMETER_NOTES[agent.theory_id]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {history?.available && history.cumulative.length >= 2 && (
        <div className="mt-12 border-t border-ink/20 pt-8">
          <h2 className="serif text-xl">累计方向准确率</h2>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.cumulative} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="#d8d5ca" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#5b6472" }} tickLine={false} axisLine={{ stroke: "#d8d5ca" }} minTickGap={24} />
                <YAxis domain={[0, 1]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fontSize: 10, fill: "#5b6472" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, "累计方向准确率"]}
                  contentStyle={{ border: "1px solid #d8d5ca", borderRadius: 2, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#14263b" strokeWidth={1.6} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {history.agents.length > 0 && (
            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {history.agents.map((a) => (
                <div key={a.theory_id} className="border border-line bg-white/50 px-3 py-2 text-sm">
                  <p className="text-xs text-slate">{THEORY_TEXT[a.theory_id] || a.theory_id}</p>
                  <p className="num mt-1">
                    {pct(a.accuracy)} <span className="text-xs text-slate">({a.correct}/{a.total})</span>
                  </p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-slate">{history.note}</p>
        </div>
      )}
    </div>
  );
}
