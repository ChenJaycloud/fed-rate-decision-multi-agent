// 静态站点：数据来自 public/data 下的 JSON（由 backend 导出），不再依赖后端服务。

export type PredictionSummary = {
  prediction_id: string;
  meeting_date: string;
  prediction_time: string;
  trigger_type: string;
  predicted_action: "hike" | "hold" | "cut";
  predicted_label: string;
  hike_probability: number;
  hold_probability: number;
  cut_probability: number;
  confidence: number | null;
  status: string;
  target_rate_before: number | null;
  target_range_lower: number | null;
  target_range_upper: number | null;
};

export type MacroCard = {
  key: string;
  label: string;
  unit: string;
  value: number | null;
  period: string | null;
  published_at: string | null;
  previous: { period: string; value: number | null } | null;
  proxy?: boolean;
};

export type Dashboard = {
  next_meeting: { meeting_date: string; statement_time_et: string; has_projections: boolean; days_until: number } | null;
  current_rate: { lower?: number; upper?: number; single?: number; period?: string } | null;
  latest_prediction: PredictionSummary | null;
  latest_prediction_reasoning: string | null;
  macro_cards: MacroCard[];
  freshness: { macro_last_fetched: string | null; last_prediction_time: string | null; snapshot_as_of: string | null };
  disclaimer: string;
};

export type AgentRow = {
  theory_id: string;
  recommendation: string;
  confidence: number | null;
  primary_reason: string | null;
  secondary_reason: string | null;
  theory_explanation: string | null;
  applicability_note: string | null;
  risk_note: string | null;
  probability_distribution_json: string | null;
};

export type PredictionDetail = PredictionSummary & {
  final_reasoning: string | null;
  probability_distribution: Record<string, number>;
  model_name: string | null;
  prompt_version: string | null;
  llm_calls: number | null;
  llm_tokens: number | null;
  llm_elapsed_seconds: number | null;
  snapshot_as_of: string | null;
  agents: AgentRow[];
  snapshot?: {
    as_of: string;
    macro: Record<string, number | null>;
    expectations: Record<string, number | null>;
    policy: { previous_policy_rate: number | null; policy_rate_range: Record<string, number> | null; regime: string | null };
    field_meta: Record<string, unknown>;
  } | null;
  analysis: {
    main_disagreement_dimension: string | null;
    secondary_disagreement_dimension: string | null;
    high_conflict_flag: boolean | null;
    minority_high_confidence_alert: boolean | null;
    policy_phase_signal: { phase?: string; direction_constraint?: string; magnitude_constraint?: string; evidence?: string } | null;
  } | null;
};

export type MeetingRow = {
  meeting_date: string;
  status: string;
  has_projections: boolean;
  prediction: PredictionSummary | null;
  research: { predicted_label: string; direction_correct: boolean | null; label_correct: boolean | null } | null;
  actual: { action: string; label: string; change_bp: number } | null;
  direction_correct: boolean | null;
};

export type ResearchMethod = {
  method: string;
  name: string;
  sample_count: number;
  label_accuracy: number;
  direction_accuracy: number;
  label_correct: number;
  cumulative: { date: string; accuracy: number }[];
};

export type ResearchArchive = {
  available: boolean;
  sample_count: number;
  majority_baseline?: number;
  methods: ResearchMethod[];
  timeline: { month: string; meeting_date: string; predicted_label: string; actual_label: string; predicted_action: string; actual_action: string; correct: boolean }[];
  note: string;
};

export type Performance = {
  live: {
    sample_count: number;
    meeting_count: number;
    direction_accuracy: number | null;
    direction_accuracy_meeting_level: number | null;
    label_accuracy: number | null;
    mean_brier: number | null;
    windows: { window: string; sample_count: number; direction_accuracy: number | null; label_accuracy: number | null; mean_brier: number | null }[];
    agents: { theory_id: string; total: number; correct: number; accuracy: number | null }[];
    confusion: Record<string, Record<string, number>>;
    note: string;
  };
  research_archive: ResearchArchive;
  research_backtest: {
    sample_count: number;
    period: string;
    majority_baseline: number;
    note: string;
    methods: { method: string; label_accuracy: number; direction_accuracy: number; label_correct: number; direction_correct: number }[];
    rows: Record<string, string>[];
  } | null;
};

export type MemoryRule = {
  rule_id: string;
  conflict_pattern: string;
  observable_conditions: string[];
  preferred_direction: string;
  preferred_theory_family: string[];
  downweighted_theory_family: string[];
  magnitude_guidance: string;
  boundary_conditions?: string[];
};

export type MemoryLesson = {
  lesson?: string;
  useful_when?: string;
  misleading_when?: string;
  decision_layer_use?: string;
  evidence_strength?: string;
  helps_with?: string;
  overgeneralization_risk?: string;
  extrapolation_warning?: string;
};

export type MemoryReport = {
  frozen_at: string | null;
  schema_version: string | null;
  memory_scope: string | null;
  training_window: { start: string; end: string; sample_count: number } | null;
  source_record_count: number | null;
  global_lessons: MemoryLesson[];
  normal_regime_lessons: MemoryLesson[];
  special_regime_lessons: MemoryLesson[];
  conditional_applicability_rules: MemoryRule[];
  theory_specific_applicability: Record<string, MemoryLesson[]>;
  conflict_resolution_lessons: MemoryLesson[];
  uncertainty_lessons: MemoryLesson[];
  do_not_use_rules: string[];
  memory_quality_warning: string | null;
};

export const ACTION_TEXT: Record<string, string> = { hike: "加息", hold: "维持", cut: "降息" };
export const THEORY_TEXT: Record<string, string> = {
  standard_taylor: "标准泰勒规则",
  forward_looking_taylor: "前瞻型泰勒规则",
  interest_rate_smoothing: "利率平滑规则",
  open_economy_rule: "开放经济规则",
  financial_stability_rule: "金融稳定增强规则",
  new_keynesian_optimal_rule: "新凯恩斯最优规则",
  balanced_approach_rule: "平衡途径规则",
};

export function pct(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function fmtDate(date: string | null | undefined): string {
  if (!date) return "—";
  return date.slice(0, 10);
}
