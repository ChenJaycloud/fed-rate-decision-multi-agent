import Link from "next/link";
import { ACTION_TEXT, MeetingRow, pct } from "@/lib/api";
import { readData } from "@/lib/data";

export default async function HistoryPage() {
  const data = await readData<{ meetings: MeetingRow[] }>("meetings.json");
  if (!data) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="serif text-2xl">后端服务未连接</p>
      </div>
    );
  }
  const rows = data.meetings.filter((m) => m.prediction || m.actual);
  const upcoming = data.meetings.filter((m) => !m.prediction && !m.actual && m.status === "scheduled").slice(-1);
  const list = [...upcoming, ...rows];

  return (
    <div className="reveal">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/20 pb-3">
        <h1 className="serif text-3xl">会议记录</h1>
        <p className="text-xs text-slate">系统自 2026 年 11 月起持续记录；每条预测独立保存，不覆盖历史版本</p>
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-sm text-slate">暂无记录。第一场正式预测将在下一次触发窗口生成。</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-xs text-slate">
                <th className="pb-2 pr-4 font-normal">会议日</th>
                <th className="pb-2 pr-4 font-normal">系统预测</th>
                <th className="pb-2 pr-4 font-normal">三方向概率（加/维/降）</th>
                <th className="pb-2 pr-4 font-normal">实际决议</th>
                <th className="pb-2 font-normal">方向判定</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.meeting_date} className="border-t border-line/70 align-top">
                  <td className="py-3 pr-4">
                    <Link href={`/history/${m.meeting_date}`} className="num focus-ring underline decoration-line underline-offset-4 hover:text-patina">
                      {m.meeting_date}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    {m.prediction ? (
                      <span className="num">
                        {ACTION_TEXT[m.prediction.predicted_action]} · {m.prediction.predicted_label}
                        {m.prediction.status === "beta" && <span className="ml-2 text-[10px] text-rust">beta</span>}
                      </span>
                    ) : (
                      <span className="text-slate">待预测</span>
                    )}
                  </td>
                  <td className="num py-3 pr-4 text-xs text-ink-soft">
                    {m.prediction ? `${pct(m.prediction.hike_probability)} / ${pct(m.prediction.hold_probability)} / ${pct(m.prediction.cut_probability)}` : "—"}
                  </td>
                  <td className="num py-3 pr-4">{m.actual ? `${ACTION_TEXT[m.actual.action]}（${m.actual.change_bp >= 0 ? "+" : ""}${m.actual.change_bp}bp）` : "—"}</td>
                  <td className="py-3 pr-4">
                    {m.direction_correct == null ? (
                      <span className="text-slate">—</span>
                    ) : m.direction_correct ? (
                      <span className="text-patina">命中</span>
                    ) : (
                      <span className="text-rust">未命中</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-6 text-xs leading-6 text-slate">
        系统上线前的会议只显示实际决议；实时预测从 2026-12 会议开始积累。预测记录分为正式与 beta 测试两类，准确率统计只计入正式记录。
      </p>
    </div>
  );
}
