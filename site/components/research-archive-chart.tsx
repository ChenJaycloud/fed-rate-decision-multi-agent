"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ResearchMethod } from "@/lib/api";

const COLORS: Record<string, string> = {
  research_C: "#a8452c",
  research_A: "#5b6472",
  research_B: "#2e6e62",
};

export function ResearchArchiveChart({ methods }: { methods: ResearchMethod[] }) {
  const maxLen = Math.max(0, ...methods.map((m) => m.cumulative.length));
  const data = Array.from({ length: maxLen }, (_, i) => {
    const row: Record<string, string | number> = {
      date: methods[0]?.cumulative[i]?.date?.slice(0, 7) ?? "",
    };
    methods.forEach((m) => {
      const point = m.cumulative[i];
      if (point) row[m.method] = point.accuracy;
    });
    return row;
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="#d8d5ca" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#5b6472" }} tickLine={false} axisLine={{ stroke: "#d8d5ca" }} minTickGap={28} />
          <YAxis domain={[0, 1]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fontSize: 10, fill: "#5b6472" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value: any, key: any) => {
              const name = methods.find((m) => m.method === key)?.name ?? key;
              return [`${(Number(value) * 100).toFixed(1)}%`, name];
            }}
            contentStyle={{ border: "1px solid #d8d5ca", borderRadius: 2, fontSize: 12 }}
          />
          {methods.map((m) => (
            <Line key={m.method} type="monotone" dataKey={m.method} stroke={COLORS[m.method] ?? "#14263b"} strokeWidth={m.method === "research_C" ? 2 : 1.2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
