"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FrequencyItem } from "@/lib/types";

export default function FrequencyChart({ data }: { data: FrequencyItem[] }) {
  return (
    <div className="h-80 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="number" tick={{ fontSize: 11 }} interval={4} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar name="당첨번호" dataKey="mainCount" fill="#0ea5e9" />
          <Bar name="보너스" dataKey="bonusCount" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
