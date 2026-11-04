/** 各理论智能体的输入指标与参数说明（与 theory_specs 的 allowed_variables 对齐）。 */

type Source = "macro" | "expectations" | "policy";

export type InputSpec = { key: string; label: string; source: Source; digits?: number };

const F = (key: string, label: string, digits = 2, source: Source = "macro"): InputSpec => ({ key, label, digits, source });

export const THEORY_INPUTS: Record<string, InputSpec[]> = {
  standard_taylor: [
    F("inflation_current", "通胀（PCE 同比）"),
    F("inflation_target_mid", "通胀目标"),
    F("output_gap", "产出缺口"),
  ],
  forward_looking_taylor: [
    F("expected_inflation", "预期通胀（密歇根 1 年）", 2, "expectations"),
    F("inflation_target_mid", "通胀目标"),
    F("expected_output_gap", "预期产出缺口（代理）", 2, "expectations"),
  ],
  interest_rate_smoothing: [
    F("previous_policy_rate", "上一期政策利率", 3, "policy"),
    F("inflation_current", "通胀（PCE 同比）"),
    F("inflation_target_mid", "通胀目标"),
    F("output_gap", "产出缺口"),
  ],
  open_economy_rule: [
    F("reer", "实际有效汇率（BIS 广泛美元）"),
    F("import_price_yoy", "进口价格同比"),
    F("inflation_current", "通胀（PCE 同比）"),
    F("inflation_target_mid", "通胀目标"),
    F("output_gap", "产出缺口"),
  ],
  financial_stability_rule: [
    F("domestic_credit_yoy", "私营部门信用同比"),
    F("credit_to_gdp_ratio", "信用 / GDP"),
    F("house_price_yoy", "房价同比"),
    F("stock_price_yoy", "股价同比"),
    F("corporate_credit_spread", "企业信用利差（Baa−Aaa）"),
    F("inflation_current", "通胀（PCE 同比）"),
    F("output_gap", "产出缺口"),
  ],
  new_keynesian_optimal_rule: [
    F("core_inflation", "核心通胀（核心 PCE 同比）"),
    F("expected_inflation", "预期通胀", 2, "expectations"),
    F("output_gap", "产出缺口"),
    F("expected_output_gap", "预期产出缺口", 2, "expectations"),
    F("previous_policy_rate", "当前政策利率", 3, "policy"),
  ],
  balanced_approach_rule: [
    F("inflation_current", "通胀（PCE 同比）"),
    F("inflation_target_mid", "通胀目标"),
    F("unemployment_rate", "失业率"),
    F("longer_run_unemployment_rate", "自然失业率（CBO）"),
    F("unemployment_gap", "失业缺口（u*−u）"),
  ],
};

export const THEORY_PARAMETER_NOTES: Record<string, string[]> = {
  standard_taylor: ["通胀目标 2.0%；规则按通胀缺口与产出缺口的当期符号判断方向", "无显式平滑与预期项（由提示词约束解释边界）"],
  forward_looking_taylor: ["使用 1 年期通胀预期与预期产出缺口；强调传导时滞下的预防性调整", "预期产出缺口暂无公开免费源，以当期产出缺口作持续性代理"],
  interest_rate_smoothing: ["以上一期政策利率为锚，评估偏离既有路径的必要性与步长", "历史访问权限：仅上一期利率"],
  open_economy_rule: ["先形成国内政策倾向，再由汇率与进口价格检验是否修正", "实际汇率使用 BIS 实际广泛美元指数代理"],
  financial_stability_rule: ["区分信用/杠杆、资产价格、风险溢价三类金融失衡", "失衡不显著时不强制给出金融稳定结论"],
  new_keynesian_optimal_rule: ["读取完整决策利率历史（月度路径）与阶段诊断，评估跨期目标准则", "历史路径不是趋势外推：比较加息/不变/降息三类动作"],
  balanced_approach_rule: ["Fed 平衡途径规则：R = r* + π + 0.5(π−π*) + 2(u*−u)", "系数 0.5（通胀缺口）与 2（失业缺口）用于解释方向压力"],
};

export function formatInputValue(snapshot: {
  macro?: Record<string, unknown>;
  expectations?: Record<string, unknown>;
  policy?: { previous_policy_rate?: number | null };
} | null | undefined, spec: InputSpec): string {
  if (!snapshot) return "—";
  if (spec.source === "policy" && spec.key === "previous_policy_rate") {
    const v = snapshot.policy?.previous_policy_rate;
    return v == null ? "—" : `${Number(v).toFixed(spec.digits ?? 3)}%`;
  }
  const bucket = spec.source === "expectations" ? snapshot.expectations : snapshot.macro;
  const raw = bucket?.[spec.key];
  if (raw === null || raw === undefined || typeof raw === "object") return "—";
  const num = Number(raw);
  if (Number.isNaN(num)) return "—";
  return num.toFixed(spec.digits ?? 2);
}

export function buildAgentInputs(
  theoryId: string,
  snapshot: { macro?: Record<string, unknown>; expectations?: Record<string, unknown>; policy?: { previous_policy_rate?: number | null } } | null | undefined,
): { label: string; value: string }[] {
  return (THEORY_INPUTS[theoryId] ?? []).map((spec) => ({
    label: spec.label,
    value: formatInputValue(snapshot, spec),
  }));
}
