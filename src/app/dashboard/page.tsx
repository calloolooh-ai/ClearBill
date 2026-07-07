"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DollarSign, Receipt, TrendingUp, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChargeCard } from "@/components/dashboard/charge-card";
import { FeeAlerts } from "@/components/dashboard/fee-alerts";
import { SuggestionsPanel } from "@/components/dashboard/suggestions-panel";
import { SpendingPieChart } from "@/charts/spending-pie-chart";
import { Card, CardContent } from "@/components/ui/card";
import { useBillStore } from "@/hooks/useBillStore";
import { computeTotal, largestCharge, countFees, countRecurring, totalsByCategory } from "@/utils/billMath";
import { formatCurrency } from "@/utils/formatCurrency";

function DashboardContent() {
  const billId = useSearchParams().get("bill");
  const { getBundle } = useBillStore();
  const bundle = billId ? getBundle(billId) : undefined;

  if (!bundle) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">No bill found</h1>
        <p className="mt-2 text-muted-foreground">Upload a bill to see its dashboard.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">
          Upload a bill
        </Link>
      </div>
    );
  }

  const { document, explanation, suggestions, feeAlerts } = bundle;
  const explanationById = new Map(explanation.explanations.map((e) => [e.chargeId, e]));

  const total = computeTotal(document);
  const largest = largestCharge(document.charges);
  const feeCount = countFees(document.charges);
  const recurringCount = countRecurring(document.charges);
  const categoryTotals = totalsByCategory(document.charges);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{document.provider ?? document.fileName}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Bill Dashboard</h1>
        </div>
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Upload another bill
        </Link>
      </div>

      {explanation.summary && (
        <p className="mt-4 max-w-2xl text-muted-foreground">{explanation.summary}</p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total bill" value={formatCurrency(total)} icon={DollarSign} delay={0} />
        <StatCard
          label="Largest charge"
          value={largest ? formatCurrency(largest.amount) : "—"}
          icon={TrendingUp}
          delay={0.05}
        />
        <StatCard label="Fees" value={String(feeCount)} icon={Receipt} tone={feeCount > 0 ? "warning" : "default"} delay={0.1} />
        <StatCard label="Recurring charges" value={String(recurringCount)} icon={RefreshCw} delay={0.15} />
      </div>

      {feeAlerts.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-medium tracking-tight">Fee Alerts</h2>
          <FeeAlerts alerts={feeAlerts} />
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <h2 className="text-lg font-medium tracking-tight">Charges</h2>
          {document.charges.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No individual charges could be identified from this bill.
            </p>
          ) : (
            document.charges.map((charge, i) => (
              <ChargeCard key={charge.id} charge={charge} explanation={explanationById.get(charge.id)} delay={i * 0.03} />
            ))
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-3xl border-border/60">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-medium tracking-tight">Spending Breakdown</h3>
              <SpendingPieChart categoryTotals={categoryTotals} />
            </CardContent>
          </Card>
          <SuggestionsPanel suggestions={suggestions.suggestions} />
        </div>
      </div>

      {document.extractionWarnings.length > 0 && (
        <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground/80">Extraction notes</p>
          <ul className="mt-1 list-inside list-disc">
            {document.extractionWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
