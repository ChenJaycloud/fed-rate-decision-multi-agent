import Link from "next/link";

export const metadata = { title: "关于系统 · FOMC 观测站" };

const AGENTS: [string, string, string][] = [
  ["标准泰勒规则", "通胀缺口 + 当期产出缺口", "政策规则式反应的基准参照"],
  ["前瞻型泰勒规则", "预期通胀 + 预期产出缺口", "检验预防性政策反应"],
  ["利率平滑规则", "上一期政策利率 + 通胀/产出", "刻画政策惯性与渐进调整"],
  ["开放经济规则", "实际汇率 + 进口价格传导", "外部约束对国内规则的修正"],
  ["金融稳定增强规则", "信用/M2 房价/股价/信用利差", "逆风而行与金融脆弱性视角"],
  ["新凯恩斯最优规则", "跨期目标准则 + 完整政策路径", "历史依赖与承诺机制"],
  ["平衡途径规则", "通胀缺口 + 失业率缺口", "美联储货币政策报告列示的规则"],
];

export default function AboutPage() {
  return (
    <div className="reveal max-w-3xl">
      <h1 className="serif border-b border-ink/20 pb-3 text-3xl">关于系统</h1>

      <p className="mt-6 text-sm leading-7 text-ink-soft">
        FOMC 观测站是一个研究与实验性质的美联储利率决议预测系统。它把七个货币政策理论规则转化为独立的分析智能体，
        让每个智能体在各自被授权的变量范围内给出利率变动判断，再经由分析交接层汇总共识与分歧，最终由决策智能体生成结构化预测。
        系统持续获取官方数据、按固定节奏与事件触发执行预测，并在决议公布后自动接受现实检验。
      </p>

      <h2 className="serif mt-10 text-xl">系统架构</h2>
      <ol className="mt-4 space-y-3 text-sm leading-7 text-ink-soft">
        <li><span className="text-ink">数据层</span>：FOMC 官方日历与声明、FRED 宏观序列、历史决议记录；每条观测记录所属期、发布时刻与抓取时刻。</li>
        <li><span className="text-ink">快照层</span>：预测时点冻结一份"当时可见"的数据快照，只使用已发布且所属期不晚于预测时点的数据。</li>
        <li><span className="text-ink">理论层</span>：七个理论智能体并行判断，各自输出推荐标签、七档概率分布与理由；历史权限守卫限制可见的政策路径。</li>
        <li><span className="text-ink">分析交接层</span>：统计标签支持、立场与分歧，再由 LLM 综合成共识/冲突摘要与政策阶段信号。</li>
        <li><span className="text-ink">决策层</span>：读取冻结的训练期文字适用性记忆（不重训），输出最终七档分布与方向；评估层在决议公布后自动比对。</li>
      </ol>

      <h2 className="serif mt-10 text-xl">七个理论智能体</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <tbody>
            {AGENTS.map(([name, vars, role]) => (
              <tr key={name} className="border-b border-line/70">
                <td className="w-44 py-3 pr-4 text-ink">{name}</td>
                <td className="num py-3 pr-4 text-xs text-ink-soft">{vars}</td>
                <td className="py-3 text-xs text-slate">{role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="serif mt-10 text-xl">数据与模型</h2>
      <p className="mt-4 text-sm leading-7 text-ink-soft">
        数据来自 Federal Reserve（FOMC 日历与官方声明）、FRED（圣路易斯联储，含 ALFRED 实时口径发布日）、BLS 与 BEA。
        模型使用 DeepSeek（deepseek-chat）驱动智能体推理；API Key 仅保存在后端，网站只读取后端授权的公开数据。
        每次预测记录模型名、提示词修订版本、逐次 token 用量与耗时，并提供完整推理链存档。
      </p>

      <h2 className="serif mt-10 text-xl">预测与评估方法</h2>
      <p className="mt-4 text-sm leading-7 text-ink-soft">
        预测对象是 FOMC 目标利率区间的变动档位（七档）与三个方向（加息/维持/降息）。三方向概率由七档分布聚合：
        降息为负向三档之和、维持为 0bp、加息为正向三档之和，合计 100%。概率是模型对各结果的主观判断，
        不代表统计意义上的发生频率。决议公布后，系统从 FRED 目标区间推导实际结果，计算方向与档位命中、
        方向 Brier Score 和每个理论智能体的命中记录，并按"会议前 7 天以上 / 1–7 天 / 24 小时 / final"分窗口统计。
        历史回测使用的是事后修订的数据，与当时实时可见的数据存在差别，因此与实时统计严格分开呈现。
      </p>

      <h2 className="serif mt-10 text-xl">研究项目</h2>
      <p className="mt-4 text-sm leading-7 text-ink-soft">
        本系统基于论文《基于货币政策理论智能体的美联储利率决议预测研究》的实验框架改造而来。
        原研究比较了无训练直接聚合、训练集数值权重与训练集文字反思记忆三种决策方式；本实时系统采用文字反思记忆设定，
        记忆在部署后保持冻结，不随新数据更新。
      </p>
      <p className="mt-4 text-sm">
        <a
          className="text-patina underline decoration-line underline-offset-4 hover:text-ink focus-ring"
          href="https://github.com/ChenJaycloud/fed-rate-decision-multi-agent"
          target="_blank"
          rel="noreferrer"
        >
          研究项目 GitHub 仓库
        </a>
      </p>

      <div className="mt-10 border-t border-line pt-4 text-xs leading-6 text-slate">
        免责声明：本系统为研究与实验性质的 AI 预测系统，不构成投资建议。概率为模型输出的主观判断，不代表统计意义上的发生频率。使用者应自行评估信息并承担决策责任。
      </div>
    </div>
  );
}
