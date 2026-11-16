"use client";

import { useEffect, useMemo, useState } from "react";

type Member = {
  name: string;
  role: string;
  affiliation: string;
  bank: string | null;
  url: string | null;
  voting: boolean;
  alternate: boolean;
  speeches: { title: string; url: string; published_at: string; speaker_title: string | null }[];
};

type People = { as_of: string; voting: Member[]; alternates: Member[] };

type NewsItem = {
  kind: "speech" | "press";
  title: string;
  url: string;
  published_at: string;
  speaker: string | null;
  speaker_title: string | null;
  category: string | null;
};

type News = { generated_at: string; items: NewsItem[] };

const BASE = "https://www.federalreserve.gov";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

const ROLE_STYLE: Record<string, string> = {
  主席: "border-rust/40 bg-rust-soft text-rust",
  副主席: "border-patina/40 bg-patina-soft text-patina",
  理事: "border-ink/20 bg-paper-deep text-ink",
  行长: "border-line bg-white text-slate",
};

function MemberCard({ member, active, onClick }: { member: Member; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring w-full rounded-sm border p-3 text-left transition-colors ${
        active ? "border-ink bg-white" : "border-line bg-white/50 hover:border-ink/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`serif flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs ${ROLE_STYLE[member.role] ?? ROLE_STYLE["理事"]}`}>
          {initials(member.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm">{member.name}</span>
          <span className="block text-[11px] text-slate">
            {member.role}
            {member.bank ? ` · ${member.bank}` : " · 理事会"}
          </span>
        </span>
      </div>
    </button>
  );
}

export function FedExplorer() {
  const [people, setPeople] = useState<People | null>(null);
  const [news, setNews] = useState<News | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "speech" | "statement" | "other">("all");
  const [showAllNews, setShowAllNews] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/data/people.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/data/fed_news.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([p, n]) => {
      if (p) setPeople(p);
      if (n) setNews(n);
    });
  }, []);

  const allMembers = useMemo(
    () => [...(people?.voting ?? []), ...(people?.alternates ?? [])],
    [people],
  );
  const selectedMember = allMembers.find((m) => m.name === selected) ?? null;

  const isStatement = (item: NewsItem) =>
    item.kind === "press" && ((item.category ?? "").toLowerCase().includes("monetary") || item.title.toLowerCase().includes("fomc statement"));

  const filtered = useMemo(() => {
    const items = news?.items ?? [];
    if (filter === "speech") return items.filter((i) => i.kind === "speech");
    if (filter === "statement") return items.filter(isStatement);
    if (filter === "other") return items.filter((i) => i.kind === "press" && !isStatement(i));
    return items;
  }, [news, filter]);

  const latestStatement = useMemo(() => (news?.items ?? []).find(isStatement) ?? null, [news]);
  const shown = showAllNews ? filtered.slice(0, 120) : filtered.slice(0, 25);

  return (
    <div className="reveal">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/20 pb-3">
        <h1 className="serif text-3xl">美联储观察</h1>
        <p className="text-xs text-slate">
          官方委员会构成与讲话/新闻 · 数据来自 Federal Reserve · 更新于{" "}
          {news ? new Date(news.generated_at).toLocaleDateString("zh-CN") : "—"}
        </p>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-soft">
        除了预测，这个页面把美联储的「人」和「话」集中在一起：FOMC 的投票成员是谁、他们各自最近说了什么、委员会最近发布了哪些声明与新闻。
        这些官方沟通是理解利率决议的重要背景——当前预测模型只读取宏观数据，尚未把这些文本纳入输入，这正是下一步要增强的方向。
      </p>

      {latestStatement && (
        <div className="mt-6 border border-line bg-white/60 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-xs text-slate">最近的政策声明与新闻</p>
            <span className="num text-xs text-slate">{latestStatement.published_at}</span>
          </div>
          <a
            href={BASE + latestStatement.url}
            target="_blank"
            rel="noreferrer"
            className="serif mt-2 block text-lg leading-7 hover:text-patina focus-ring"
          >
            {latestStatement.title}
          </a>
          <p className="mt-2 text-xs text-slate">点击阅读美联储原文（英文）</p>
        </div>
      )}

      <h2 className="serif mt-10 border-b border-line pb-2 text-xl">FOMC 委员会（2026）</h2>
      <p className="mt-2 text-xs text-slate">12 位投票成员：7 位理事会成员 + 纽约联储主席 + 4 位轮值地区联储主席。点击成员查看其近期官方讲话。</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(people?.voting ?? []).map((m) => (
          <MemberCard key={m.name} member={m} active={selected === m.name} onClick={() => setSelected(m.name)} />
        ))}
      </div>
      {people && people.alternates.length > 0 && (
        <>
          <p className="mt-5 text-xs text-slate">候补成员（无投票权）</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {people.alternates.map((m) => (
              <MemberCard key={m.name} member={m} active={selected === m.name} onClick={() => setSelected(m.name)} />
            ))}
          </div>
        </>
      )}

      {selectedMember && (
        <div className="mt-6 border border-ink/30 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="serif text-lg">{selectedMember.name}</p>
              <p className="mt-1 text-xs text-slate">
                {selectedMember.role} · {selectedMember.bank ? `${selectedMember.bank}联储` : "理事会"}
                {selectedMember.voting ? " · 2026 年投票成员" : selectedMember.alternate ? " · 候补成员" : ""}
              </p>
            </div>
            {selectedMember.url && (
              <a href={selectedMember.url} target="_blank" rel="noreferrer" className="text-xs text-patina underline decoration-line underline-offset-4 hover:text-ink focus-ring">
                官方简历
              </a>
            )}
          </div>
          <p className="mt-4 text-xs text-slate">近期官方讲话（来自 Federal Reserve Board 讲话页）</p>
          {selectedMember.speeches.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-slate">
              暂无收录。地区联储主席的讲话通常发布在各地方联储官网（如 newyorkfed.org），Board 网站只收录理事会成员的讲话。
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {selectedMember.speeches.map((s) => (
                <li key={s.url} className="border-b border-line/60 pb-2 text-sm">
                  <a href={BASE + s.url} target="_blank" rel="noreferrer" className="hover:text-patina focus-ring">
                    {s.title}
                  </a>
                  <span className="num ml-2 text-xs text-slate">{s.published_at}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <h2 className="serif mt-12 border-b border-line pb-2 text-xl">最新动态</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {[
          ["all", "全部"],
          ["statement", "声明"],
          ["speech", "讲话"],
          ["other", "其他新闻"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`focus-ring rounded-sm border px-2.5 py-1 text-xs ${
              filter === key ? "border-ink bg-ink text-paper" : "border-line bg-white/60 text-slate hover:border-ink/40"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate">共 {filtered.length} 条</span>
      </div>
      <ul className="mt-4 space-y-0">
        {shown.map((item) => (
          <li key={item.url} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line/60 py-2.5 text-sm">
            <span className="num w-24 shrink-0 text-xs text-slate">{item.published_at}</span>
            <span className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-[10px] ${
              item.kind === "speech" ? "border-patina/30 bg-patina-soft text-patina" : isStatement(item) ? "border-rust/30 bg-rust-soft text-rust" : "border-line bg-paper-deep text-slate"
            }`}>
              {item.kind === "speech" ? "讲话" : isStatement(item) ? "声明" : "新闻"}
            </span>
            <a href={BASE + item.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 leading-6 hover:text-patina focus-ring">
              {item.title}
            </a>
            {item.speaker && <span className="text-xs text-slate">{item.speaker}</span>}
            {!item.speaker && item.category && <span className="text-xs text-slate">{item.category}</span>}
          </li>
        ))}
      </ul>
      {filtered.length > 25 && (
        <button onClick={() => setShowAllNews((v) => !v)} className="focus-ring mt-3 text-xs text-patina underline decoration-line underline-offset-4 hover:text-ink">
          {showAllNews ? "收起" : `显示更多（${filtered.length} 条）`}
        </button>
      )}

      <h2 className="serif mt-12 border-b border-line pb-2 text-xl">读懂美联储</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {[
          ["FOMC 是什么", "联邦公开市场委员会由 12 位投票成员组成：7 位理事会成员、纽约联储主席，以及 4 位按年轮换的地区联储主席。每年召开 8 次例会，决定联邦基金目标利率区间。"],
          ["决议如何形成", "会前各成员收到经济简报，会上讨论并投票；会后 14:00（美东）发布声明，随后主席举行新闻发布会。声明的措辞变化（如“进一步收紧”改为“保持耐心”）往往比利率本身更受市场关注。"],
          ["为什么读委员讲话", "官员讲话是政策路径的前瞻信号，尤其是主席与副主席的表态。市场常用利率期货与点阵图（SEP，每季度更新）来估算下次会议的加息/降息概率。"],
        ].map(([title, body]) => (
          <div key={title} className="border border-line bg-white/50 p-4">
            <p className="serif text-sm">{title}</p>
            <p className="mt-2 text-xs leading-6 text-slate">{body}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 border-t border-line pt-4 text-xs leading-6 text-slate">
        说明：本页信息来自美联储官网公开页面（联邦公开市场委员会、理事会讲话与新闻稿），每次更新系统时抓取；当前预测模型仅使用宏观数据，
        这些官方文本暂未进入模型输入。内容仅供研究参考，不构成投资建议。
      </p>
    </div>
  );
}
