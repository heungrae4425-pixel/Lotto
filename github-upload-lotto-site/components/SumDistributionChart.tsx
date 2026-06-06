"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type SumBucket = {
  range: string;
  count: number;
};

export default function SumDistributionChart({ data }: { data: SumBucket[] }) {
  return (
    <div className="h-72 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Bar name="회차 수" dataKey="count" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
