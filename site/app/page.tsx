import Link from "next/link";
import { BetaBadge } from "@/components/beta-badge";
import { ProbabilityBar } from "@/components/probability-bar";
import { RateCorridor } from "@/components/rate-corridor";
import { Section } from "@/components/section";
import { ACTION_TEXT, Dashboard, fmtDate, PredictionDetail, THEORY_TEXT } from "@/lib/api";
import { readData } from "@/lib/data";

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function meetingDateCn(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${d.getUTCMonth() + 1} 月 ${d.getUTCDate()} 日`;
}

function weekdayCn(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return WEEKDAYS[d.getUTCDay()];
}

function fmtPeriod(period: string | null) {
  if (!period) return "—";
  const [y, m] = period.split("-");
  return `${y} 年 ${Number(m)} 月`;
}

export default async function DashboardPage() {
  const data = await readData<Dashboard>("dashboard.json");
  if (!data) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="serif text-2xl">后端服务未连接</p>
        <p className="mt-3 text-sm leading-6 text-slate">
          请先在 backend 目录启动 API（uvicorn app.api.main:app --port 8000），并确认已运行过数据接入与至少一次预测。
        </p>
      </div>
    );
  }

  const meeting = data.next_meeting;
  const pred = data.latest_prediction;
  const detail = pred ? await readData<PredictionDetail>("latest_prediction.json") : null;

  return (
    <div className="reveal">
      {/* 头部：下一场会议 */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/20 pb-3">
        <p className="text-sm text-slate">
          下一场 FOMC 会议{meeting?.has_projections ? " · 含经济预测摘要（SEP）" : ""}
        </p>
        <p className="text-xs text-slate">目标区间决策于美东时间 {meeting?.statement_time_et ?? "14:00"} 公布</p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          {meeting ? (
            <>
              <h1 className="serif text-6xl leading-none tracking-tight sm:text-7xl">{meetingDateCn(meeting.meeting_date)}</h1>
              <p className="mt-3 text-sm text-slate">
                {weekdayCn(meeting.meeting_date)} · 目标区间决议 · 距今 <span className="num text-ink">{meeting.days_until}</span> 天
              </p>
            </>
          ) : (
            <h1 className="serif text-5xl">暂无会议日程</h1>
          )}

          <div className="mt-8">
            {pred ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-slate">系统当前预测</span>
                  <BetaBadge status={pred.status} />
                </div>
                <div className="mt-2 flex items-end gap-4">
                  <span className={`serif text-5xl ${pred.predicted_action === "hike" ? "text-rust" : pred.predicted_action === "cut" ? "text-patina" : "text-slate"}`}>
                    {ACTION_TEXT[pred.predicted_action]}
                  </span>
                  <span className="num pb-2 text-lg text-ink-soft">{pred.predicted_label}</span>
                </div>
                <div className="mt-5 max-w-md">
                  <ProbabilityBar hike={pred.hike_probability} hold={pred.hold_probability} cut={pred.cut_probability} />
                </div>
                <p className="mt-2 text-xs text-slate">
                  概率是模型对各结果的主观判断，不代表统计意义上的发生频率。
                </p>
                <Link href="/agents" className="focus-ring mt-4 inline-block text-sm text-patina underline decoration-line underline-offset-4 hover:text-ink">
                  查看七个智能体的独立判断
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate">尚未生成预测。数据更新与触发规则就绪后将在下一次触发窗口自动运行。</p>
            )}
          </div>
        </div>

        <div className="border-l-0 lg:border-l lg:border-line lg:pl-10">
          <div className="flex items-baseline justify-between">
            <h2 className="serif text-lg">目标利率走廊与预测路径</h2>
            <span className="num text-xs text-slate">
              {data.current_rate?.lower != null
                ? `${data.current_rate.lower.toFixed(2)} – ${data.current_rate.upper?.toFixed(2)}%`
                : "区间不可得"}
            </span>
          </div>
          <div className="mt-6">
            <RateCorridor
              lower={data.current_rate?.lower}
              upper={data.current_rate?.upper}
              predictedLabel={pred?.predicted_label}
              action={pred?.predicted_action}
            />
          </div>
          {data.latest_prediction_reasoning && (
            <div className="mt-6 border-t border-line pt-4">
              <p className="text-sm leading-7 text-ink-soft">
                {data.latest_prediction_reasoning.length > 220
                  ? `${data.latest_prediction_reasoning.slice(0, 220)}…`
                  : data.latest_prediction_reasoning}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 最新经济数据 */}
      <Section title="最新经济数据" note="仅展示预测时点已公开发布的数据；所属期与发布日期并列">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-slate">
                <th className="pb-2 pr-4 font-normal">指标</th>
                <th className="pb-2 pr-4 font-normal">最新值</th>
                <th className="pb-2 pr-4 font-normal">所属期</th>
                <th className="pb-2 pr-4 font-normal">发布日</th>
                <th className="pb-2 font-normal">上一期</th>
              </tr>
            </thead>
            <tbody>
              {data.macro_cards.map((card) => {
                const prev = card.previous?.value ?? null;
                const delta = card.value != null && prev != null ? card.value - prev : null;
                return (
                  <tr key={card.key} className="border-t border-line/70">
                    <td className="py-3 pr-4">{card.label}{card.proxy ? <sup className="ml-1 text-[10px] text-rust">代理</sup> : null}</td>
                    <td className="num py-3 pr-4 text-base">
                      {card.value == null ? "—" : card.value.toFixed(card.key === "nfp_change_k" ? 0 : 2)}
                      <span className="ml-1 text-xs text-slate">{card.unit}</span>
                      {delta != null && (
                        <span className={`num ml-2 text-xs ${delta >= 0 ? "text-rust" : "text-patina"}`}>
                          {delta >= 0 ? "+" : ""}{delta.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="num py-3 pr-4 text-ink-soft">{fmtPeriod(card.period)}</td>
                    <td className="num py-3 pr-4 text-slate">{fmtDate(card.published_at)}</td>
                    <td className="num py-3 text-slate">
                      {prev == null ? "—" : `${prev.toFixed(card.key === "nfp_change_k" ? 0 : 2)}（${fmtPeriod(card.previous?.period ?? null)}）`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 最新预测摘要 */}
      {detail && detail.agents?.length > 0 && (
        <Section title="最新预测摘要" note="七个理论智能体的立场一览">
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {detail.agents.map((agent) => (
              <div key={agent.theory_id} className="border border-line bg-white/50 p-3">
                <p className="text-xs text-slate">{THEORY_TEXT[agent.theory_id] || agent.theory_id}</p>
                <p className="num mt-1">{ACTION_TEXT[agentDirection(agent.recommendation)]} · {agent.recommendation}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 数据新鲜度 */}
      <div className="mt-14 border-t border-line pt-4 text-xs leading-6 text-slate">
        <p>
          宏观数据最近抓取：{data.freshness.macro_last_fetched ? new Date(data.freshness.macro_last_fetched).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) : "—"}
          ｜最近预测：{data.freshness.last_prediction_time ? new Date(data.freshness.last_prediction_time).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) : "—"}
          ｜预测所用快照：{data.freshness.snapshot_as_of ?? "—"}
        </p>
        <p className="mt-1">{data.disclaimer}</p>
      </div>
    </div>
  );
}

function agentDirection(label: string): "hike" | "hold" | "cut" {
  if (["<-50bp", "[-50,-25)bp", "[-25,0)bp"].includes(label)) return "cut";
  if (label === "0bp") return "hold";
  return "hike";
}
