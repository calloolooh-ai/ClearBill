"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/utils/formatCurrency";
import type { CategoryChange } from "@/types/comparison";

const CATEGORY_LABEL: Record<string, string> = {
  usage: "Usage",
  subscription: "Subscription",
  tax: "Tax",
  fee: "Fees",
  discount: "Discounts",
  equipment: "Equipment",
  other: "Other",
};

export function ChargeComparisonChart({ changes }: { changes: CategoryChange[] }) {
  const data = changes.map((c) => ({
    name: CATEGORY_LABEL[c.category] ?? c.category,
    previous: c.from,
    current: c.to,
  }));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No comparison data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)" }}
        />
        <Legend />
        <Bar dataKey="previous" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
        <Bar dataKey="current" fill="var(--primary)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
