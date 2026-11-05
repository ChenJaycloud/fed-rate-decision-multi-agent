import { ResearchArchiveChart } from "@/components/research-archive-chart";
import { Performance, pct, THEORY_TEXT } from "@/lib/api";
import { readData } from "@/lib/data";

export default async function PerformancePage() {
  const data = await readData<Performance>("performance.json");
  if (!data) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="serif text-2xl">后端服务未连接</p>
      </div>
    );
  }
  const live = data.live;

  return (
    <div className="reveal">
      <h1 className="serif border-b border-ink/20 pb-3 text-3xl">预测表现</h1>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="serif text-xl">上线后实时预测</h2>
          <span className="text-xs text-slate">统计口径：每场会议取最终预测；beta 与回放记录不计入</span>
        </div>
        {live.sample_count === 0 ? (
          <div className="mt-5 border border-dashed border-line bg-white/40 p-8 text-sm leading-6 text-slate">{live.note}</div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              {[
                { label: "方向准确率（会议级）", value: pct(live.direction_accuracy_meeting_level) },
                { label: "七档准确率", value: pct(live.label_accuracy) },
                { label: "平均方向 Brier", value: live.mean_brier?.toFixed(4) ?? "—" },
                { label: "已评估预测数", value: String(live.sample_count) },
              ].map((item) => (
                <div key={item.label} className="border border-line bg-white/60 p-4">
                  <p className="text-xs text-slate">{item.label}</p>
                  <p className="num serif mt-2 text-3xl">{item.value}</p>
                </div>
              ))}
            </div>
            {live.windows.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate">
                      <th className="pb-2 pr-4 font-normal">预测窗口</th>
                      <th className="pb-2 pr-4 font-normal">样本数</th>
                      <th className="pb-2 pr-4 font-normal">方向准确率</th>
                      <th className="pb-2 pr-4 font-normal">七档准确率</th>
                      <th className="pb-2 font-normal">平均 Brier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {live.windows.map((w) => (
                      <tr key={w.window} className="border-t border-line/70">
                        <td className="py-2 pr-4">{w.window}</td>
                        <td className="num py-2 pr-4">{w.sample_count}</td>
                        <td className="num py-2 pr-4">{pct(w.direction_accuracy)}</td>
                        <td className="num py-2 pr-4">{pct(w.label_accuracy)}</td>
                        <td className="num py-2">{w.mean_brier?.toFixed(4) ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {live.agents.length > 0 && (
              <>
                <h3 className="serif mt-8 text-base">各理论智能体方向命中率（实时）</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {live.agents.map((a) => (
                    <div key={a.theory_id} className="border border-line bg-white/50 px-3 py-2 text-sm">
                      <p className="text-xs text-slate">{THEORY_TEXT[a.theory_id] || a.theory_id}</p>
                      <p className="num mt-1">{pct(a.accuracy)} <span className="text-xs text-slate">({a.correct}/{a.total})</span></p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        <p className="mt-4 text-xs leading-6 text-slate">{live.note}</p>
      </section>

      {data.history?.available && (
        <section className="mt-14 border-t border-ink/20 pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="serif text-xl">历史预测记录</h2>
            <span className="text-xs text-slate">2015–2026 ｜ {data.history.sample_count} 次会议 ｜ 与实时统计分开</span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { label: "方向准确率", value: pct(data.history.direction_accuracy) },
              { label: "七档准确率", value: pct(data.history.label_accuracy) },
              { label: "记录场次", value: String(data.history.sample_count) },
            ].map((item) => (
              <div key={item.label} className="border border-line bg-white/60 p-4">
                <p className="text-xs text-slate">{item.label}</p>
                <p className="num serif mt-2 text-3xl">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="border border-line bg-white/50 p-4">
              <ResearchArchiveChart
                methods={[{ method: "research_C", name: "历史预测", sample_count: data.history.sample_count, label_accuracy: data.history.label_accuracy ?? 0, direction_accuracy: data.history.direction_accuracy ?? 0, label_correct: 0, cumulative: data.history.cumulative }]}
              />
              <p className="num mt-2 text-xs text-slate">按时间顺序的累计方向准确率</p>
            </div>
            <div>
              <table className="w-full text-sm">
                <tbody>
                  {data.history.years.map((y) => (
                    <tr key={y.year} className="border-b border-line/70">
                      <td className="py-2 pr-3 text-xs text-slate">{y.year}</td>
                      <td className="num py-2 text-right text-sm">{pct(y.direction_accuracy)} <span className="text-[11px] text-slate">({y.sample_count} 场)</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.history.agents.length > 0 && (
            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {data.history.agents.map((a) => (
                <div key={a.theory_id} className="border border-line bg-white/50 px-3 py-2 text-sm">
                  <p className="text-xs text-slate">{THEORY_TEXT[a.theory_id] || a.theory_id}</p>
                  <p className="num mt-1">{pct(a.accuracy)} <span className="text-xs text-slate">({a.correct}/{a.total})</span></p>
                </div>
              ))}
            </div>
          )}

          <h3 className="serif mt-8 text-base">逐期结果</h3>
          <div className="mt-3 max-h-[420px] overflow-y-auto border border-line">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="sticky top-0 bg-paper">
                <tr className="text-left text-xs text-slate">
                  <th className="px-3 py-2 font-normal">会议日</th>
                  <th className="px-3 py-2 font-normal">预测档位</th>
                  <th className="px-3 py-2 font-normal">实际档位</th>
                  <th className="px-3 py-2 font-normal">方向</th>
                </tr>
              </thead>
              <tbody>
                {[...data.history.timeline].reverse().map((row) => (
                  <tr key={row.meeting_date} className="border-t border-line/60">
                    <td className="num px-3 py-1.5">{row.meeting_date}</td>
                    <td className="num px-3 py-1.5">{row.predicted_label}</td>
                    <td className="num px-3 py-1.5">{row.actual_label}</td>
                    <td className={`px-3 py-1.5 text-xs ${row.correct ? "text-patina" : "text-rust"}`}>{row.correct ? "命中" : "未命中"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate">{data.history.note}</p>
        </section>
      )}
    </div>
  );
}
