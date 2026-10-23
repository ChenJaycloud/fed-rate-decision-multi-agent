from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "results" / "system_c_predictions_by_month.csv"
ASSETS = ROOT / "docs" / "assets"
LABELS = ["<-50bp", "[-50,-25)bp", "[-25,0)bp", "0bp", "(0,25]bp", "(25,50]bp", ">50bp"]
DISPLAY_LABELS = ["小于 -50bp", "[-50,-25)bp", "[-25,0)bp", "0bp", "(0,25]bp", "(25,50]bp", "大于 50bp"]


def svg_start(width: int, height: int, title: str) -> list[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-label="{title}">',
        '<defs><marker id="arrow" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#64748b"/></marker></defs>',
        '<style>text{font-family:"Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif;fill:#172033}.title{font-size:28px;font-weight:700}.sub{font-size:15px;fill:#64748b}.label{font-size:15px}.small{font-size:13px}.box-title{font-size:18px;font-weight:700}.agent{font-size:14px;font-weight:600}</style>',
        '<rect width="100%" height="100%" rx="20" fill="#f8fafc"/>',
    ]


def write_architecture() -> None:
    out = svg_start(1440, 820, "System C 多智能体协同预测架构")
    out += [
        '<text x="720" y="54" text-anchor="middle" class="title">System C：训练期文字反思记忆驱动的协同预测</text>',
        '<text x="720" y="82" text-anchor="middle" class="sub">同一会议月信息集 → 七种政策规则判断 → 结构化分歧交接 → 冻结记忆辅助决策</text>',
        # Main path arrows (behind the cards)
        '<path d="M270 268 H315" stroke="#64748b" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M730 268 H775" stroke="#64748b" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M1025 268 H1070" stroke="#64748b" stroke-width="3" marker-end="url(#arrow)"/>',
        # Input card
        '<rect x="35" y="155" width="235" height="225" rx="18" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>',
        '<text x="152" y="192" text-anchor="middle" class="box-title">会议月信息集</text>',
        '<text x="58" y="229" class="label">通胀与产出缺口</text><text x="58" y="258" class="label">就业与预期</text><text x="58" y="287" class="label">外部条件与金融稳定</text><text x="58" y="316" class="label">历史政策路径</text>',
        '<text x="152" y="354" text-anchor="middle" class="small" fill="#075985">结构化宏观输入</text>',
        # Theory group
        '<rect x="315" y="130" width="415" height="280" rx="18" fill="#ffffff" stroke="#6366f1" stroke-width="2"/>',
        '<text x="522" y="165" text-anchor="middle" class="box-title">理论判断层 · 7 个规则智能体</text>',
        '<rect x="340" y="188" width="170" height="55" rx="12" fill="#eef2ff"/><text x="425" y="221" text-anchor="middle" class="agent">标准 / 前瞻 Taylor</text>',
        '<rect x="530" y="188" width="175" height="55" rx="12" fill="#eef2ff"/><text x="617" y="221" text-anchor="middle" class="agent">利率平滑</text>',
        '<rect x="340" y="255" width="170" height="55" rx="12" fill="#eef2ff"/><text x="425" y="288" text-anchor="middle" class="agent">开放经济</text>',
        '<rect x="530" y="255" width="175" height="55" rx="12" fill="#eef2ff"/><text x="617" y="288" text-anchor="middle" class="agent">金融稳定</text>',
        '<rect x="340" y="322" width="170" height="55" rx="12" fill="#eef2ff"/><text x="425" y="355" text-anchor="middle" class="agent">新凯恩斯最优</text>',
        '<rect x="530" y="322" width="175" height="55" rx="12" fill="#eef2ff"/><text x="617" y="355" text-anchor="middle" class="agent">平衡方法</text>',
        # Handover and decision
        '<rect x="775" y="165" width="250" height="205" rx="18" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>',
        '<text x="900" y="201" text-anchor="middle" class="box-title">分析交接层</text><text x="800" y="242" class="label">共识方向 · 主要分歧</text><text x="800" y="273" class="label">理由与关键变量</text><text x="800" y="304" class="label">风险与不确定性</text><text x="900" y="345" text-anchor="middle" class="small">标准化证据包</text>',
        '<rect x="1070" y="145" width="330" height="245" rx="18" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>',
        '<text x="1235" y="183" text-anchor="middle" class="box-title">决策层</text><text x="1098" y="225" class="label">读取当前证据与冻结记忆</text><text x="1098" y="258" class="label">输出七档利率变动标签</text><text x="1098" y="291" class="label">概率、依据与剩余不确定性</text><rect x="1110" y="320" width="250" height="44" rx="12" fill="#bbf7d0"/><text x="1235" y="348" text-anchor="middle" class="agent">预测标签 ŷₜ</text>',
        # Training lane
        '<rect x="35" y="475" width="1365" height="270" rx="22" fill="#fff7ed" stroke="#fb923c" stroke-width="2"/>',
        '<text x="70" y="515" class="box-title">训练期经验形成</text><text x="1360" y="515" text-anchor="end" class="sub">只用训练样本；预测期冻结使用</text>',
        '<rect x="75" y="555" width="250" height="125" rx="16" fill="#ffffff" stroke="#fdba74" stroke-width="2"/><text x="200" y="590" text-anchor="middle" class="agent">历史训练样本</text><text x="200" y="622" text-anchor="middle" class="label">预测后对照真实标签</text><text x="200" y="652" text-anchor="middle" class="small">193 个样本（本次历史实验）</text>',
        '<path d="M325 618 H385" stroke="#64748b" stroke-width="3" marker-end="url(#arrow)"/>',
        '<rect x="385" y="555" width="270" height="125" rx="16" fill="#ffffff" stroke="#fdba74" stroke-width="2"/><text x="520" y="590" text-anchor="middle" class="agent">样本级反思</text><text x="520" y="622" text-anchor="middle" class="label">记录规则适用条件与误判</text><text x="520" y="652" text-anchor="middle" class="small">不改写理论 Agent 的规则</text>',
        '<path d="M655 618 H715" stroke="#64748b" stroke-width="3" marker-end="url(#arrow)"/>',
        '<rect x="715" y="555" width="270" height="125" rx="16" fill="#ffffff" stroke="#fdba74" stroke-width="2"/><text x="850" y="590" text-anchor="middle" class="agent">记忆合成与冻结</text><text x="850" y="622" text-anchor="middle" class="label">压缩为适用性经验与边界</text><text x="850" y="652" text-anchor="middle" class="small">测试过程中不读取真实标签</text>',
        '<path d="M985 618 H1070 V390" fill="none" stroke="#ea580c" stroke-width="3" stroke-dasharray="8 7" marker-end="url(#arrow)"/>',
        '<rect x="1050" y="555" width="300" height="125" rx="16" fill="#ffedd5" stroke="#fb923c" stroke-width="2"/><text x="1200" y="590" text-anchor="middle" class="agent">评估与复核</text><text x="1200" y="622" text-anchor="middle" class="label">准确率 · 混淆矩阵 · 错判分析</text><text x="1200" y="652" text-anchor="middle" class="small">历史样本结果，不代表未来表现</text>',
        '<text x="720" y="785" text-anchor="middle" class="small" fill="#9a3412">公开 Notebook 重点展示 System C；System A/B 对照结果仅在研究草稿中报告，未包含在本公开代码包内。</text>',
        '</svg>',
    ]
    (ASSETS / "system_c_architecture.svg").write_text("\n".join(out), encoding="utf-8")


def write_timeline(rows: list[dict[str, str]]) -> None:
    width, height = 1280, 610
    left, top, plot_w, plot_h = 180, 92, 1030, 390
    y_step = plot_h / 6
    x_step = plot_w / (len(rows) - 1)
    out = svg_start(width, height, "System C 七分类预测与实际标签")
    out += [
        '<text x="640" y="42" text-anchor="middle" class="title">System C：预测标签与实际标签</text>',
        '<text x="640" y="68" text-anchor="middle" class="sub">83 个预测月份 · 七档利率变动标签 · 预测月日期按月首编码</text>',
        f'<rect x="{left}" y="{top}" width="{plot_w}" height="{plot_h}" fill="#ffffff" stroke="#cbd5e1"/>',
    ]
    for i, label in enumerate(DISPLAY_LABELS):
        y = top + i * y_step
        out.append(f'<line x1="{left}" y1="{y:.1f}" x2="{left+plot_w}" y2="{y:.1f}" stroke="#e2e8f0"/>')
        out.append(f'<text x="{left-15}" y="{y+5:.1f}" text-anchor="end" class="small">{label}</text>')
    dates = [datetime.strptime(r["decision_month"], "%Y-%m-%d") for r in rows]
    for year in range(dates[0].year, dates[-1].year + 1):
        idx = next((j for j, d in enumerate(dates) if d.year == year), None)
        if idx is not None:
            x = left + idx * x_step
            out.append(f'<line x1="{x:.1f}" y1="{top}" x2="{x:.1f}" y2="{top+plot_h}" stroke="#f1f5f9"/>')
            out.append(f'<text x="{x:.1f}" y="{top+plot_h+27}" text-anchor="middle" class="small">{year}</text>')
    def point(i: int, key: str) -> tuple[float, float]:
        return left + i * x_step, top + LABELS.index(rows[i][key]) * y_step
    for key, color in (("actual_label", "#2563eb"), ("predicted_label", "#f97316")):
        coords = [point(i, key) for i in range(len(rows))]
        path = " ".join(("M" if i == 0 else "L") + f"{x:.1f},{y:.1f}" for i, (x, y) in enumerate(coords))
        out.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="2.5" opacity="0.85"/>')
        for x, y in coords:
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.1" fill="{color}"/>')
    out += [
        '<line x1="425" y1="548" x2="465" y2="548" stroke="#2563eb" stroke-width="4"/><text x="475" y="553" class="small">实际标签</text>',
        '<line x1="630" y1="548" x2="670" y2="548" stroke="#f97316" stroke-width="4"/><text x="680" y="553" class="small">预测标签</text>',
        '<text x="640" y="590" text-anchor="middle" class="small">会议月份（当前数据按每月 1 日记录，不是精确 FOMC 会期）</text>',
        '</svg>',
    ]
    (ASSETS / "system_c_prediction_timeline.svg").write_text("\n".join(out), encoding="utf-8")


def write_confusion(rows: list[dict[str, str]]) -> None:
    matrix = [[0 for _ in LABELS] for _ in LABELS]
    for r in rows:
        matrix[LABELS.index(r["actual_label"])][LABELS.index(r["predicted_label"])] += 1
    width, height = 1120, 800
    left, top, cell = 300, 130, 82
    maximum = max(max(row) for row in matrix)
    out = svg_start(width, height, "System C 七分类混淆矩阵")
    out += [
        '<text x="560" y="42" text-anchor="middle" class="title">System C：七分类混淆矩阵</text>',
        '<text x="560" y="70" text-anchor="middle" class="sub">行表示实际标签，列表示预测标签；对角线为分类正确的样本数</text>',
    ]
    for i, label in enumerate(DISPLAY_LABELS):
        out.append(f'<text x="{left-16}" y="{top+i*cell+48}" text-anchor="end" class="small">{label}</text>')
        out.append(f'<text x="{left+i*cell+cell/2}" y="{top-12}" text-anchor="middle" class="small">{label}</text>')
    for i in range(7):
        for j in range(7):
            value = matrix[i][j]
            strength = value / maximum if maximum else 0
            fill = f"rgb({int(239-190*strength)},{int(246-150*strength)},{int(255-105*strength)})"
            out.append(f'<rect x="{left+j*cell}" y="{top+i*cell}" width="{cell}" height="{cell}" fill="{fill}" stroke="#ffffff" stroke-width="3"/>')
            color = "#ffffff" if strength > 0.55 else "#334155"
            out.append(f'<text x="{left+j*cell+cell/2}" y="{top+i*cell+49}" text-anchor="middle" class="box-title" fill="{color}">{value}</text>')
    out += [
        f'<text x="{left+cell*3.5}" y="{top+cell*7+55}" text-anchor="middle" class="label">预测标签</text>',
        f'<text x="72" y="{top+cell*3.5}" text-anchor="middle" class="label" transform="rotate(-90 72 {top+cell*3.5})">实际标签</text>',
        '<text x="560" y="790" text-anchor="middle" class="small">样本数：83 · 七分类正确：63 · 观察期：2015—2025（按会议月份编码）</text>',
        '</svg>',
    ]
    (ASSETS / "system_c_confusion_matrix.svg").write_text("\n".join(out), encoding="utf-8")


def write_accuracy_comparison() -> None:
    out = svg_start(1120, 520, "研究稿报告的历史对照准确率")
    left, top, chart_w, chart_h = 360, 135, 650, 275
    out += [
        '<text x="560" y="46" text-anchor="middle" class="title">三种训练经验处理设定：七分类准确率</text>',
        '<text x="560" y="74" text-anchor="middle" class="sub">研究草稿报告值；A/B 对照实现不在当前公开代码包中</text>',
    ]
    for value in (0, 25, 50, 75, 100):
        x = left + chart_w * value / 100
        out.append(f'<line x1="{x:.1f}" y1="{top}" x2="{x:.1f}" y2="{top+chart_h}" stroke="#e2e8f0"/>')
        out.append(f'<text x="{x:.1f}" y="{top+chart_h+24}" text-anchor="middle" class="small">{value}%</text>')
    baseline_x = left + chart_w * 62.7 / 100
    out += [
        f'<line x1="{baseline_x:.1f}" y1="{top-8}" x2="{baseline_x:.1f}" y2="{top+chart_h}" stroke="#64748b" stroke-width="2" stroke-dasharray="7 6"/>',
        f'<text x="{baseline_x+7:.1f}" y="{top-15}" class="small">多数类基准 62.7%</text>',
    ]
    values = [
        ("无训练直接聚合", 50.6, "#94a3b8"),
        ("训练集数值权重", 51.8, "#60a5fa"),
        ("训练期反思记忆", 75.9, "#16a34a"),
    ]
    for i, (name, value, color) in enumerate(values):
        y = top + 42 + i * 82
        width = chart_w * value / 100
        out.append(f'<text x="{left-18}" y="{y+22}" text-anchor="end" class="label">{name}</text>')
        out.append(f'<rect x="{left}" y="{y}" width="{width:.1f}" height="38" rx="10" fill="{color}"/>')
        out.append(f'<text x="{left+width+12:.1f}" y="{y+25}" class="agent">{value:.1f}%</text>')
    out += [
        '<text x="560" y="497" text-anchor="middle" class="small">样本数均为 83；结果来自研究稿记录，不代表可由当前公开仓库直接复现。</text>',
        '</svg>',
    ]
    (ASSETS / "reported_accuracy_comparison.svg").write_text("\n".join(out), encoding="utf-8")

def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    with INPUT.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    if len(rows) != 83:
        raise SystemExit(f"Expected 83 rows; found {len(rows)}")
    for row in rows:
        if row["actual_label"] not in LABELS or row["predicted_label"] not in LABELS:
            raise SystemExit("Unknown label in the curated output table")
    write_architecture()
    write_timeline(rows)
    write_confusion(rows)
    write_accuracy_comparison()
    correct = sum(r["actual_label"] == r["predicted_label"] for r in rows)
    print(f"Rendered four SVG figures from {len(rows)} rows; exact-label accuracy={correct}/{len(rows)}={correct/len(rows):.1%}")


if __name__ == "__main__":
    main()
