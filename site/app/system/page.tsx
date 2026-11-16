import Link from "next/link";

export const metadata = { title: "系统构成 · FOMC 观测站" };

const AGENTS: {
  id: string;
  name: string;
  inputs: string[];
  rule: string;
  history: string;
}[] = [
  {
    id: "standard_taylor",
    name: "标准泰勒规则",
    inputs: ["通胀（PCE 同比）", "通胀目标 2%", "产出缺口"],
    rule: "R = r* + π + 0.5(π − π*) + 0.5·gap。通胀缺口与产出缺口的当期符号决定方向；两个信号冲突时说明冲突来源后仍按国内稳定化逻辑出结论。",
    history: "无政策历史",
  },
  {
    id: "forward_looking_taylor",
    name: "前瞻型泰勒规则",
    inputs: ["预期通胀（密歇根 1 年）", "通胀目标 2%", "预期产出缺口（代理）"],
    rule: "以未来通胀压力与未来需求压力替代当期项，在传导时滞前提下判断是否需要在本次会议预防性调整。",
    history: "无政策历史",
  },
  {
    id: "interest_rate_smoothing",
    name: "利率平滑规则",
    inputs: ["上一期政策利率", "通胀", "产出缺口", "通胀目标"],
    rule: "以上一期利率为锚，评估偏离既有路径的必要性与合理步长；通胀/产出只能通过「是否需要偏离、偏离多少」进入判断。",
    history: "仅上一期利率",
  },
  {
    id: "open_economy_rule",
    name: "开放经济规则",
    inputs: ["实际有效汇率", "进口价格同比", "通胀", "目标", "产出缺口"],
    rule: "先形成国内政策倾向，再由汇率传导与输入型通胀检验：外部项与国内项同向时强化，冲突时说明外部约束是否足以修正。",
    history: "无政策历史",
  },
  {
    id: "financial_stability_rule",
    name: "金融稳定增强规则",
    inputs: ["信用同比", "信用/GDP", "房价同比", "股价同比", "企业信用利差", "通胀", "产出缺口"],
    rule: "区分信用杠杆、资产价格脆弱性、风险溢价三类金融失衡，判断是否需要逆风而行（额外收紧或延后放松）。",
    history: "无政策历史",
  },
  {
    id: "new_keynesian_optimal_rule",
    name: "新凯恩斯最优规则",
    inputs: ["核心通胀", "预期通胀", "产出缺口", "预期产出缺口", "完整决策利率历史 + 阶段诊断"],
    rule: "历史依赖的跨期目标准则：逐一比较加息/不变/降息对通胀路径、需求路径、承诺与预期管理的影响。历史路径不是趋势外推。",
    history: "完整历史 + 路径诊断",
  },
  {
    id: "balanced_approach_rule",
    name: "平衡途径规则",
    inputs: ["通胀", "目标 2%", "失业率", "自然失业率（CBO）", "失业缺口 u*−u"],
    rule: "Fed 货币政策报告列示的 balanced-approach rule：R = r* + π + 0.5(π−π*) + 2(u*−u)。通胀项与就业项同权解释方向压力。",
    history: "无政策历史",
  },
];

const LAYERS = [
  {
    n: "01",
    name: "实时数据层",
    desc: "从官方数据源持续采集，记录三个时间戳：数据所属期、真实发布/修订日、系统抓取时刻。",
    items: [
      ["FOMC 日历与声明", "Fed 官网 · 2021–2027 计划内会议、决议日、声明全文"],
      ["宏观数据", "FRED / ALFRED · 21 个序列，初次发布口径（output_type=3）"],
      ["政策利率", "DFEDTAR / DFEDTARU / DFEDTARL · 日频，1982 年起"],
      ["vintage 隔离", "统计数据按真实发布日过滤；CBO 估算序列（潜在 GDP、自然失业率）统一当前口径"],
    ],
  },
  {
    n: "02",
    name: "数据快照层",
    desc: "每次预测冻结一份「当时可见」的输入，带哈希与完整来源，支持事后复现。",
    items: [
      ["防泄漏过滤", "只取 published_at ≤ as_of 且 period ≤ as_of 的观测"],
      ["字段口径", "14 项宏观 + 2 项预期 + 3 项政策输入，与原研究样本逐字段一致"],
      ["派生计算", "同比、产出缺口（同版本 GDP/潜在值）、信用利差、失业缺口"],
      ["可追溯", "快照 JSON 落库 + 哈希去重：数据未变不会重复调用模型"],
    ],
  },
  {
    n: "03",
    name: "七智能体推理层",
    desc: "七个货币政策理论规则各自独立分析，共享一个 LLM 出口，但变量权限不同、提示词不同、互不通信。",
    items: [
      ["变量路由", "每个理论只收到 allowed_variables 白名单内的字段"],
      ["历史权限守卫", "无历史 / 仅上一期利率 / 完整历史，三档权限由代码强制"],
      ["固定输出契约", "9 字段 JSON：推荐标签、七档概率、置信度、主因、次因、关键变量、理论解释、适用性、风险"],
      ["自检与修复", "推荐必须等于最高概率标签；解析失败触发修复提示词重试"],
    ],
  },
  {
    n: "04",
    name: "分析交接层",
    desc: "先把七份输出变成可核对的统计表，再由分析智能体综合出共识、分歧与政策阶段信号。",
    items: [
      ["标签支持表", "七档各自的支持理论、平均/最高概率"],
      ["分歧识别", "主分歧维度、次分歧维度、高冲突标记、少数派高置信警示"],
      ["政策阶段", "phase / 方向约束 / 幅度约束（如 hike_bias + prefer_small）"],
      ["兜底", "分析模型失败时用统计表回退，不中断预测"],
    ],
  },
  {
    n: "05",
    name: "决策层",
    desc: "唯一持有冻结文字记忆的智能体，综合七份理论输出、分析包与记忆规则给出最终七档分布。",
    items: [
      ["记忆比对", "逐条比对 R001–R005 的冲突结构与边界条件，命中则调整方向/幅度"],
      ["结构输出", "最终标签、七档分布、方向判断、主导规则家族、权重画像、完整推理"],
      ["确定性后处理", "相位一致性约束：方向与标签、概率与推荐、幅度与阶段信号自洽"],
      ["三方向聚合", "降息=负向三档之和、维持=0bp、加息=正向三档之和，和为 100%"],
    ],
  },
  {
    n: "06",
    name: "存储·评估·发布",
    desc: "每次预测独立落库、不可覆盖；决议公布后自动对账；公开数据导出为静态 JSON 由 Vercel 托管。",
    items: [
      ["SQLite", "meetings / economic_data / data_snapshots / predictions / agent_predictions / evaluation_results"],
      ["自动评估", "FRED 目标区间推导实际决议；方向/七档命中、Brier Score、各智能体命中"],
      ["分窗口统计", "T-7d 以上 / T-1~7d / T-24h / final，区分同一会议多次预测"],
      ["静态发布", "导出 128 个 JSON（约 2.8 MB）→ GitHub → Vercel 免费托管"],
    ],
  },
];

function FlowDiagram() {
  const W = 980;
  const H = 300;
  const box = (x: number, y: number, w: number, h: number, fill: string, stroke: string) => (
    <rect x={x} y={y} width={w} height={h} rx={3} fill={fill} stroke={stroke} strokeWidth={1} />
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="系统总体架构">
      <defs>
        <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="#5b6472" />
        </marker>
      </defs>
      {/* data sources */}
      <text x="14" y="24" fontSize={12} fill="#5b6472">数据源</text>
      {["Fed 官网", "FRED / ALFRED", "BLS · BEA"].map((t, i) => (
        <g key={t}>
          {box(14, 40 + i * 46, 120, 32, "#f7f6f1", "#d8d5ca")}
          <text x={74} y={60 + i * 46} fontSize={11} fill="#14263b" textAnchor="middle">{t}</text>
        </g>
      ))}
      <line x1="134" y1="102" x2="186" y2="102" stroke="#5b6472" strokeWidth={1} markerEnd="url(#arrow2)" />

      {/* snapshot */}
      {box(194, 60, 130, 84, "#efede4", "#d8d5ca")}
      <text x={259} y={88} fontSize={12} fill="#14263b" textAnchor="middle">数据快照</text>
      <text x={259} y={106} fontSize={10} fill="#5b6472" textAnchor="middle">as_of 防泄漏过滤</text>
      <text x={259} y={123} fontSize={10} fill="#5b6472" textAnchor="middle">哈希 · 可复现</text>
      <line x1="324" y1="102" x2="376" y2="102" stroke="#5b6472" strokeWidth={1} markerEnd="url(#arrow2)" />

      {/* 7 agents */}
      {box(384, 16, 230, 172, "#ffffff", "#d8d5ca")}
      <text x={499} y={36} fontSize={12} fill="#14263b" textAnchor="middle">七个理论智能体（并行、互不通信）</text>
      {AGENTS.map((a, i) => (
        <g key={a.id}>
          <rect x={396} y={46 + i * 20} width={206} height={16} rx={2} fill="#14263b" opacity={0.06 + i * 0.02} />
          <text x={404} y={58 + i * 20} fontSize={10} fill="#14263b">{a.name}</text>
        </g>
      ))}
      <line x1="614" y1="102" x2="666" y2="102" stroke="#5b6472" strokeWidth={1} markerEnd="url(#arrow2)" />

      {/* analysis */}
      {box(674, 60, 140, 84, "#e3ece8", "#cddcd5")}
      <text x={744} y={88} fontSize={12} fill="#14263b" textAnchor="middle">分析交接层</text>
      <text x={744} y={106} fontSize={10} fill="#5b6472" textAnchor="middle">共识 / 分歧 / 阶段</text>
      <text x={744} y={123} fontSize={10} fill="#5b6472" textAnchor="middle">统计表 + LLM 综合</text>
      <line x1="814" y1="102" x2="866" y2="102" stroke="#5b6472" strokeWidth={1} markerEnd="url(#arrow2)" />

      {/* decision */}
      {box(874, 60, 92, 84, "#f2e4de", "#e5cdc2")}
      <text x={920} y={88} fontSize={12} fill="#14263b" textAnchor="middle">决策层</text>
      <text x={920} y={106} fontSize={10} fill="#5b6472" textAnchor="middle">+ 冻结记忆</text>
      <text x={920} y={123} fontSize={10} fill="#5b6472" textAnchor="middle">R001–R005</text>

      {/* bottom band */}
      {box(384, 208, 582, 34, "#f7f6f1", "#d8d5ca")}
      <text x={675} y={229} fontSize={11} fill="#14263b" textAnchor="middle">
        结果 → SQLite 独立落库 → 决议后自动评估（方向 / 七档 / Brier / 各智能体）→ 导出静态 JSON → Vercel
      </text>
      <text x="14" y="278" fontSize={10} fill="#5b6472">每次预测 = 9 次模型调用（7 理论 + 1 分析 + 1 决策）· 约 6 万 tokens · 约 60 秒 · 成本约 0.1 元</text>
    </svg>
  );
}

export default function SystemPage() {
  return (
    <div className="reveal max-w-5xl">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/20 pb-3">
        <h1 className="serif text-3xl">系统构成</h1>
        <span className="text-xs text-slate">实时数据 → 七智能体推理 → 结构化预测 → 落库 → 现实检验</span>
      </div>

      <p className="mt-5 max-w-3xl text-sm leading-7 text-ink-soft">
        FOMC 观测站由六层组成。前两层保证「智能体看到的只有当时真实可见的数据」，中间两层是七个货币政策理论智能体的并行推理与分析汇聚，
        最后两层负责决策、存储、评估与公开。下面这页把每一层的实际组件、七个智能体的输入与规则、以及工程实现完整列出。
      </p>

      <div className="mt-8 border border-line bg-white/50 p-4">
        <FlowDiagram />
      </div>

      <div className="mt-12 space-y-10">
        {LAYERS.map((layer) => (
          <section key={layer.n} className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div>
              <p className="num serif text-3xl text-line">{layer.n}</p>
              <h2 className="serif mt-1 text-xl">{layer.name}</h2>
              <p className="mt-2 text-xs leading-6 text-slate">{layer.desc}</p>
            </div>
            <div className="border-l border-line pl-6">
              <table className="w-full text-sm">
                <tbody>
                  {layer.items.map(([k, v]) => (
                    <tr key={k} className="border-b border-line/60 align-top">
                      <td className="w-36 py-2.5 pr-4 text-xs text-slate">{k}</td>
                      <td className="py-2.5 text-xs leading-6 text-ink-soft">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <h2 className="serif mt-14 border-b border-line pb-2 text-2xl">七个理论智能体的输入与规则</h2>
      <p className="mt-3 text-xs text-slate">每个智能体只能看到自己被授权的字段，提示词不同、历史权限不同；这是原研究最核心的设计，实时系统逐字保留。</p>
      <div className="mt-5 space-y-4">
        {AGENTS.map((a, i) => (
          <div key={a.id} className="border border-line bg-white/50 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="serif text-base">
                <span className="num mr-2 text-xs text-slate">{String(i + 1).padStart(2, "0")}</span>
                {a.name}
              </p>
              <span className="text-xs text-slate">历史权限：{a.history}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.inputs.map((input) => (
                <span key={input} className="rounded-sm border border-line bg-paper px-2 py-0.5 text-[11px] text-ink-soft">
                  {input}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs leading-6 text-ink-soft">{a.rule}</p>
          </div>
        ))}
      </div>

      <h2 className="serif mt-14 border-b border-line pb-2 text-2xl">冻结文字记忆</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        {[
          ["训练窗口", "1983-09 — 2014-12"],
          ["训练样本", "193 次决议"],
          ["冻结时间", "2026-06-19"],
          ["更新策略", "部署后只读，不随新数据更新"],
        ].map(([k, v]) => (
          <div key={k} className="border border-line bg-white/60 p-4">
            <p className="text-xs text-slate">{k}</p>
            <p className="num mt-2 text-sm">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-6 text-slate">
        记忆由训练期逐样本反思笔记归纳而来：全局经验、正常/特殊阶段经验、条件适用规则 R001–R005、逐理论适用性、冲突解决与不确定性经验、禁用规则。
        决策层在每次预测中显式比对规则边界，命中时调整方向与幅度。
        <Link href="/memory" className="ml-1 text-patina underline decoration-line underline-offset-4 hover:text-ink focus-ring">
          查看完整记忆报告
        </Link>
      </p>

      <h2 className="serif mt-14 border-b border-line pb-2 text-2xl">工程实现</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <tbody>
            {[
              ["推理模型", "DeepSeek · deepseek-chat · temperature 0.2 · 统一 LLM Client（重试 / 超时 / 用量记录）"],
              ["编排", "Python 3.10+ · 原 LangGraph 图在实时路径中简化为顺序流水线（7 → 1 → 1）"],
              ["存储", "SQLite（WAL）· 9 张表 · 幂等唯一约束 · 每日备份保留 7 份"],
              ["调度", "APScheduler：日历每日、数据每日两次、触发检查每小时、评估每日"],
              ["触发规则", "final（会议前 24h）/ event（CPI·PCE·非农后 48h）/ premeeting（前 7 天每日）/ weekly · 最小间隔 6h · 日上限 4 次"],
              ["公开站点", "Next.js 14 静态导出 · 128 个 JSON · GitHub → Vercel 免费托管 · 无后端、无密钥暴露"],
              ["可复现", "每次预测保存快照、各层输出、逐次 token 与耗时；历史回放可指定任意会议日重演"],
            ].map(([k, v]) => (
              <tr key={k} className="border-b border-line/60 align-top">
                <td className="w-32 py-2.5 pr-4 text-xs text-slate">{k}</td>
                <td className="py-2.5 text-xs leading-6 text-ink-soft">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="serif mt-14 border-b border-line pb-2 text-2xl">一次预测的全过程</h2>
      <ol className="mt-4 space-y-2 text-sm leading-7 text-ink-soft">
        <li><span className="num mr-2 text-xs text-slate">01</span>更新数据（若距上次超过调度间隔），确认下一场会议与决议时刻。</li>
        <li><span className="num mr-2 text-xs text-slate">02</span>按 as_of 冻结快照，计算 14 项宏观字段、2 项预期与政策路径诊断。</li>
        <li><span className="num mr-2 text-xs text-slate">03</span>七个智能体并行调用（变量白名单 + 历史权限守卫 + 9 字段输出契约）。</li>
        <li><span className="num mr-2 text-xs text-slate">04</span>统计表生成 → 分析智能体综合共识、分歧与政策阶段。</li>
        <li><span className="num mr-2 text-xs text-slate">05</span>决策智能体读取冻结记忆，输出最终七档分布、方向与完整推理；确定性后处理保证自洽。</li>
        <li><span className="num mr-2 text-xs text-slate">06</span>三方向概率聚合 → 独立落库（快照哈希去重）→ 决议公布后自动评估 → 导出发布。</li>
      </ol>

      <div className="mt-12 border-t border-line pt-4 text-xs leading-6 text-slate">
        本页描述与实际运行代码一致；每一层的实现细节可在研究项目仓库中查看。
        <a
          className="ml-1 underline decoration-line underline-offset-4 hover:text-ink focus-ring"
          href="https://github.com/ChenJaycloud/fed-rate-decision-multi-agent"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}
