"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { ChargeCategory } from "@/types/bill";
import { formatCurrency } from "@/utils/formatCurrency";

const CATEGORY_LABEL: Record<ChargeCategory, string> = {
  usage: "Usage",
  subscription: "Subscription",
  tax: "Tax",
  fee: "Fees",
  discount: "Discounts",
  equipment: "Equipment",
  other: "Other",
};

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#5aa9e6",
  "#f2a65a",
];

interface SpendingPieChartProps {
  categoryTotals: Partial<Record<ChargeCategory, number>>;
}

export function SpendingPieChart({ categoryTotals }: SpendingPieChartProps) {
  const data = Object.entries(categoryTotals)
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([category, value]) => ({
      name: CATEGORY_LABEL[category as ChargeCategory],
      value: value as number,
    }));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No category data to display.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={64} outerRadius={100} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--background)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)" }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
