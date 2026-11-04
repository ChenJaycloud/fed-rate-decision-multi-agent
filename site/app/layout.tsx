import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "FOMC 观测站 · 美联储利率决议多智能体预测",
  description:
    "基于七个货币政策理论智能体协同的美联储利率决议预测系统：实时数据、结构化概率、可追溯的预测记录与事后评估。研究与实验性质，不构成投资建议。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-paper">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
