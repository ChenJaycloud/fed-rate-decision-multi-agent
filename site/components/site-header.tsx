"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "仪表盘" },
  { href: "/agents", label: "智能体分析" },
  { href: "/replay", label: "历史预测" },
  { href: "/history", label: "会议记录" },
  { href: "/performance", label: "预测表现" },
  { href: "/memory", label: "文字记忆" },
  { href: "/about", label: "关于系统" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
        <Link href="/" className="serif text-lg tracking-wide text-ink focus-ring">
          FOMC 观测站
        </Link>
        <span className="hidden text-xs text-slate sm:inline">美联储利率决议多智能体预测</span>
        <nav className="ml-auto flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "focus-ring pb-0.5 transition-colors " +
                  (active ? "border-b border-ink text-ink" : "text-slate hover:text-ink")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
