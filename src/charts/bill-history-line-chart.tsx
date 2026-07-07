"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/utils/formatCurrency";
import type { BillSummary } from "@/types/comparison";

export function BillHistoryLineChart({ bills }: { bills: BillSummary[] }) {
  const data = bills.map((b) => ({
    label: b.billingPeriodStart ?? b.fileName,
    total: b.total ?? 0,
  }));

  if (data.length < 2) {
    return <p className="text-sm text-muted-foreground">Upload at least two bills to see a history trend.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)" }}
        />
        <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
