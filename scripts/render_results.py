from __future__ import annotations

import csv
from datetime import datetime
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "results" / "three_training_methods_predictions_by_month.csv"
ASSETS = ROOT / "docs" / "assets"
LABELS = ["<-50bp", "[-50,-25)bp", "[-25,0)bp", "0bp", "(0,25]bp", "(25,50]bp", ">50bp"]
DISPLAY_LABELS = ["小于 -50bp", "[-50,-25)bp", "[-25,0)bp", "0bp", "(0,25]bp", "(25,50]bp", "大于 50bp"]
METHODS = [
    ("direct_aggregation_prediction", "无训练直接汇总", "#94a3b8"),
    ("numeric_weight_training_prediction", "数值权重训练", "#3b82f6"),
    ("reflection_memory_training_prediction", "文字反思记忆训练", "#16a34a"),
]


def svg_start(width: int, height: int, title: str) -> list[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-label="{escape(title)}">',
        '<defs><marker id="arrow" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#64748b"/></marker></defs>',
        '<style>text{font-family:"Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif;fill:#172033}.title{font-size:28px;font-weight:700}.sub{font-size:15px;fill:#64748b}.label{font-size:16px}.small{font-size:13px;fill:#475569}.box-title{font-size:19px;font-weight:700}.agent{font-size:15px;font-weight:600}</style>',
        '<rect width="100%" height="100%" rx="20" fill="#f8fafc"/>',
    ]


def text(x: float, y: float, content: str, cls: str = "label", anchor: str = "start") -> str:
    return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" class="{cls}">{escape(content)}</text>'


def write_architecture() -> None:
    out = svg_start(1440, 980, "三种训练方式共用的多智能体预测架构")
    out += [
        text(720, 48, "同一多智能体骨架，三种训练经验进入决策层", "title", "middle"),
        text(720, 77, "宏观输入、七个理论判断与分析交接保持一致；比较决策层如何利用训练样本", "sub", "middle"),
        # Shared pipeline
        '<rect x="40" y="115" width="285" height="175" rx="18" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>',
        text(182, 151, "会议月信息集", "box-title", "middle"),
        text(66, 190, "通胀、产出与就业指标"), text(66, 220, "预期、金融与外部条件"), text(66, 250, "政策历史与利率决议", "small"),
        '<path d="M325 202 H370" stroke="#64748b" stroke-width="3" marker-end="url(#arrow)"/>',
        '<rect x="375" y="115" width="340" height="175" rx="18" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>',
        text(545, 151, "理论判断层 · 7 个规则智能体", "box-title", "middle"),
        text(405, 190, "标准 / 前瞻 Taylor · 利率平滑"),
        text(405, 220, "平衡方法 · 开放经济 · 金融稳定 · 新凯恩斯最优"),
        text(545, 260, "分别输出标签分布、依据与关键变量", "small", "middle"),
        '<path d="M715 202 H760" stroke="#64748b" stroke-width="3" marker-end="url(#arrow)"/>',
        '<rect x="765" y="115" width="285" height="175" rx="18" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>',
        text(907, 151, "分析交接层", "box-title", "middle"),
        text(791, 190, "提炼共识、分歧与风险"), text(791, 220, "整理理由和关键变量"),
        text(907, 260, "形成结构化证据包", "small", "middle"),
        '<path d="M1050 202 H1095" stroke="#64748b" stroke-width="3" marker-end="url(#arrow)"/>',
        '<rect x="1100" y="115" width="300" height="175" rx="18" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>',
        text(1250, 151, "方法化决策层", "box-title", "middle"),
        text(1128, 190, "按各自训练方式综合证据"), text(1128, 220, "输出七档利率变动标签"),
        text(1250, 260, "共享测试集进行并列评价", "small", "middle"),
        text(720, 340, "三种训练方式的差异", "box-title", "middle"),
        # method cards
        '<rect x="45" y="375" width="430" height="300" rx="18" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>',
        '<rect x="45" y="375" width="430" height="58" rx="18" fill="#e2e8f0"/>',
        text(260, 412, "无训练的理论判断直接汇总", "box-title", "middle"),
        text(75, 475, "训练期", "agent"), text(160, 475, "不拟合数值权重，也不形成文字记忆"),
        text(75, 520, "测试期", "agent"), text(160, 520, "按预设聚合逻辑综合理论判断"),
        '<line x1="75" y1="552" x2="445" y2="552" stroke="#e2e8f0"/>',
        text(260, 590, "提供不依赖训练经验的参照", "small", "middle"),
        text(260, 630, "结果：50.6% 七分类准确率", "agent", "middle"),
        '<rect x="505" y="375" width="430" height="300" rx="18" fill="#ffffff" stroke="#3b82f6" stroke-width="2"/>',
        '<rect x="505" y="375" width="430" height="58" rx="18" fill="#dbeafe"/>',
        text(720, 412, "训练集数值权重", "box-title", "middle"),
        text(535, 475, "训练期", "agent"), text(620, 475, "根据理论输出的标签支持度形成权重"),
        text(535, 520, "测试期", "agent"), text(620, 520, "读取冻结权重，不用测试标签更新"),
        '<line x1="535" y1="552" x2="905" y2="552" stroke="#e2e8f0"/>',
        text(720, 590, "显式表示训练期理论支持差异", "small", "middle"),
        text(720, 630, "结果：51.8% 七分类准确率", "agent", "middle"),
        '<rect x="965" y="375" width="430" height="300" rx="18" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>',
        '<rect x="965" y="375" width="430" height="58" rx="18" fill="#dcfce7"/>',
        text(1180, 412, "训练集文字反思记忆", "box-title", "middle"),
        text(995, 475, "训练期", "agent"), text(1080, 475, "复盘预测案例，归纳适用条件与误判"),
        text(995, 520, "测试期", "agent"), text(1080, 520, "读取冻结记忆，不用测试标签更新"),
        '<line x1="995" y1="552" x2="1365" y2="552" stroke="#e2e8f0"/>',
        text(1180, 590, "以结构化经验辅助决策层判断", "small", "middle"),
        text(1180, 630, "结果：75.9% 七分类准确率", "agent", "middle"),
        # evaluation strip
        '<rect x="45" y="720" width="1350" height="185" rx="18" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>',
        text(720, 761, "共同评价设置", "box-title", "middle"),
        text(90, 810, "测试区间：2015—2025", "agent"),
        text(450, 810, "测试样本：83 个会议月份", "agent"),
        text(855, 810, "多数类基准：62.7%（52/83）", "agent"),
        text(720, 858, "保存的历史运行结果；不是当前公开仓库重新运行所得，也不是严格实时回测。", "small", "middle"),
        '</svg>',
    ]
    (ASSETS / "three_methods_architecture.svg").write_text("\n".join(out), encoding="utf-8")


def calculate_metrics(rows: list[dict[str, str]], prediction_key: str) -> dict[str, float | int]:
    actual = [r["actual_label"] for r in rows]
    predicted = [r[prediction_key] for r in rows]
    n = len(rows)
    accuracy = sum(a == p for a, p in zip(actual, predicted)) / n
    f1_scores: list[float] = []
    recalls: list[float] = []
    for label in LABELS:
        tp = sum(a == label and p == label for a, p in zip(actual, predicted))
        fp = sum(a != label and p == label for a, p in zip(actual, predicted))
        fn = sum(a == label and p != label for a, p in zip(actual, predicted))
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1_scores.append(2 * precision * recall / (precision + recall) if precision + recall else 0.0)
        recalls.append(recall)
    def direction(label: str) -> str:
        if label.startswith("<") or label.startswith("[-"):
            return "降息"
        if label == "0bp":
            return "维持"
        return "加息"
    direction_accuracy = sum(direction(a) == direction(p) for a, p in zip(actual, predicted)) / n
    return {
        "n": n,
        "correct": sum(a == p for a, p in zip(actual, predicted)),
        "accuracy": accuracy,
        "macro_f1": sum(f1_scores) / len(f1_scores),
        "balanced_accuracy": sum(recalls) / len(recalls),
        "direction_accuracy": direction_accuracy,
    }


def write_accuracy(rows: list[dict[str, str]]) -> None:
    stats = [(name, calculate_metrics(rows, key), color) for key, name, color in METHODS]
    baseline = max(sum(r["actual_label"] == label for r in rows) for label in LABELS) / len(rows)
    width, height = 1160, 500
    left, top, chart_w, chart_h = 365, 125, 680, 275
    out = svg_start(width, height, "三种训练方式的七分类准确率")
    out += [text(width/2, 45, "三种训练方式：七分类准确率", "title", "middle"),
            text(width/2, 74, "同一组 83 个历史测试月份；虚线为多数类基准", "sub", "middle")]
    for value in (0, 25, 50, 75, 100):
        x = left + chart_w * value / 100
        out.append(f'<line x1="{x:.1f}" y1="{top}" x2="{x:.1f}" y2="{top+chart_h}" stroke="#e2e8f0"/>')
        out.append(text(x, top+chart_h+24, f"{value}%", "small", "middle"))
    bx = left + chart_w * baseline
    out += [f'<line x1="{bx:.1f}" y1="{top-8}" x2="{bx:.1f}" y2="{top+chart_h}" stroke="#475569" stroke-width="2" stroke-dasharray="7 6"/>',
            text(bx+8, top-14, f"多数类基准 {baseline:.1%}", "small")]
    for i, (name, metric, color) in enumerate(stats):
        y = top + 38 + i * 78
        bar_w = chart_w * float(metric["accuracy"])
        out += [text(left-18, y+25, name, "label", "end"),
                f'<rect x="{left}" y="{y}" width="{bar_w:.1f}" height="38" rx="10" fill="{color}"/>',
                text(left+bar_w+12, y+26, f'{float(metric["accuracy"]):.1%} ({metric["correct"]}/{metric["n"]})', "agent")]
    out += [text(width/2, 475, "准确率按逐期预测标签与真实标签完全一致计算；数据为保存的历史运行记录。", "small", "middle"), '</svg>']
    (ASSETS / "three_methods_accuracy.svg").write_text("\n".join(out), encoding="utf-8")


def write_timeline(rows: list[dict[str, str]]) -> None:
    width, height = 1280, 620
    left, top, plot_w, plot_h = 180, 95, 1030, 390
    y_step = plot_h / (len(LABELS)-1)
    x_step = plot_w / (len(rows)-1)
    out = svg_start(width, height, "文字反思记忆训练方法逐期预测与实际标签")
    out += [text(width/2, 44, "文字反思记忆训练：逐期预测与实际标签", "title", "middle"),
            text(width/2, 70, "83 个历史测试月份 · 七档利率变动标签 · 日期按月首编码", "sub", "middle"),
            f'<rect x="{left}" y="{top}" width="{plot_w}" height="{plot_h}" fill="#ffffff" stroke="#cbd5e1"/>']
    for i, label in enumerate(DISPLAY_LABELS):
        y=top+i*y_step
        out += [f'<line x1="{left}" y1="{y:.1f}" x2="{left+plot_w}" y2="{y:.1f}" stroke="#e2e8f0"/>',text(left-14,y+5,label,"small","end")]
    dates=[datetime.strptime(r["decision_month"],"%Y-%m-%d") for r in rows]
    for year in range(dates[0].year,dates[-1].year+1):
        idx=next((j for j,d in enumerate(dates) if d.year==year),None)
        if idx is not None:
            x=left+idx*x_step
            out += [f'<line x1="{x:.1f}" y1="{top}" x2="{x:.1f}" y2="{top+plot_h}" stroke="#f1f5f9"/>',text(x,top+plot_h+27,str(year),"small","middle")]
    def point(i: int, key: str) -> tuple[float,float]:
        return left+i*x_step,top+LABELS.index(rows[i][key])*y_step
    for key,color in (("actual_label","#2563eb"),("reflection_memory_training_prediction","#16a34a")):
        coords=[point(i,key) for i in range(len(rows))]
        path=" ".join(("M" if i==0 else "L")+f"{x:.1f},{y:.1f}" for i,(x,y) in enumerate(coords))
        out.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="2.4" opacity="0.85"/>')
        for x,y in coords: out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3" fill="{color}"/>')
    out += [
        '<line x1="425" y1="555" x2="465" y2="555" stroke="#2563eb" stroke-width="4"/>',text(475,560,"实际标签","small"),
        '<line x1="625" y1="555" x2="665" y2="555" stroke="#16a34a" stroke-width="4"/>',text(675,560,"预测标签","small"),
        text(width/2,600,"会议月份（本次运行以每月 1 日记录，不是精确 FOMC 会期）","small","middle"),'</svg>']
    (ASSETS/"reflection_memory_prediction_timeline.svg").write_text("\n".join(out),encoding="utf-8")


def write_confusion(rows: list[dict[str, str]], prediction_key: str, method_name: str, filename: str) -> None:
    matrix = [[0 for _ in LABELS] for _ in LABELS]
    for row in rows:
        matrix[LABELS.index(row["actual_label"])][LABELS.index(row[prediction_key])] += 1
    width, height = 1120, 820
    left, top, cell = 300, 140, 82
    maximum = max(max(row) for row in matrix)
    out = svg_start(width, height, f"{method_name}的七分类混淆矩阵")
    out += [
        text(width/2, 45, f"{method_name}：七分类混淆矩阵", "title", "middle"),
        text(width/2, 75, "行是实际标签，列是预测标签；对角线为分类正确的样本数", "sub", "middle"),
    ]
    for i, label in enumerate(DISPLAY_LABELS):
        out += [text(left-14, top+i*cell+48, label, "small", "end"),
                text(left+i*cell+cell/2, top-12, label, "small", "middle")]
    for i in range(7):
        for j in range(7):
            value = matrix[i][j]
            strength = value/maximum if maximum else 0
            fill = f"rgb({int(239-190*strength)},{int(246-150*strength)},{int(255-105*strength)})"
            color = "#ffffff" if strength > 0.55 else "#334155"
            out += [f'<rect x="{left+j*cell}" y="{top+i*cell}" width="{cell}" height="{cell}" fill="{fill}" stroke="#ffffff" stroke-width="3"/>',
                    f'<text x="{left+j*cell+cell/2}" y="{top+i*cell+49}" text-anchor="middle" class="box-title" fill="{color}">{value}</text>']
    correct = sum(matrix[i][i] for i in range(7))
    out += [text(left+cell*3.5, top+cell*7+55, "预测标签", "label", "middle"),
            f'<text x="72" y="{top+cell*3.5}" text-anchor="middle" class="label" transform="rotate(-90 72 {top+cell*3.5})">实际标签</text>',
            text(width/2, 800, f"样本数：{len(rows)} · 七分类正确：{correct} · 测试区间：2015—2025", "small", "middle"),
            '</svg>']
    (ASSETS/filename).write_text("\n".join(out), encoding="utf-8")

def main() -> None:
    ASSETS.mkdir(parents=True,exist_ok=True)
    with INPUT.open(encoding="utf-8-sig",newline="") as f: rows=list(csv.DictReader(f))
    if len(rows)!=83: raise SystemExit(f"Expected 83 rows; found {len(rows)}")
    required={"decision_month","actual_label",*(key for key,_,_ in METHODS)}
    if not rows or not required.issubset(rows[0]): raise SystemExit("Input CSV is missing required columns")
    for r in rows:
        if any(r[k] not in LABELS for k in required-{"decision_month"}): raise SystemExit("Unknown label in comparison output table")
    write_architecture(); write_accuracy(rows); write_timeline(rows)
    for key, method_name, _ in METHODS:
        filename = key.replace("_prediction", "") + "_confusion_matrix.svg"
        write_confusion(rows, key, method_name, filename)
    for key,name,_ in METHODS:
        m=calculate_metrics(rows,key)
        print(f'{name}: accuracy={m["correct"]}/{m["n"]}={float(m["accuracy"]):.1%}; macro-F1={float(m["macro_f1"]):.3f}; balanced-accuracy={float(m["balanced_accuracy"]):.3f}; direction={float(m["direction_accuracy"]):.1%}')
    print(f"Rendered six SVG figures from {len(rows)} aligned test months.")


if __name__=="__main__": main()
