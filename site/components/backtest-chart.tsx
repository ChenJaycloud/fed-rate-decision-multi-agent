"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function BacktestChart({
  data,
}: {
  data: { name: string; label: number; direction: number }[];
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }} barGap={4}>
          <CartesianGrid stroke="#d8d5ca" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5b6472" }} axisLine={{ stroke: "#d8d5ca" }} tickLine={false} />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
            tick={{ fontSize: 11, fill: "#5b6472" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: any, name: any) => [`${(Number(value) * 100).toFixed(1)}%`, name === "label" ? "七分类准确率" : "方向准确率"]}
            contentStyle={{ border: "1px solid #d8d5ca", borderRadius: 2, fontSize: 12 }}
          />
          <Bar dataKey="label" name="七分类准确率" fill="#14263b" maxBarSize={26} />
          <Bar dataKey="direction" name="方向准确率" maxBarSize={26}>
            {data.map((entry, index) => (
              <Cell key={index} fill="#2e6e62" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
