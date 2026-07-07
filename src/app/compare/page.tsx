"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { BillPicker } from "@/components/dashboard/bill-picker";
import { BillHistoryLineChart } from "@/charts/bill-history-line-chart";
import { ChargeComparisonChart } from "@/charts/charge-comparison-chart";
import { useBillStore } from "@/hooks/useBillStore";
import { useBillUpload } from "@/hooks/useBillUpload";
import { UploadProgress } from "@/components/upload/upload-progress";
import { formatCurrency, formatPercent } from "@/utils/formatCurrency";
import type { ComparisonResult } from "@/types/comparison";

export default function ComparePage() {
  const { bundles, addBundle } = useBillStore();
  const { stage, error, upload } = useBillUpload();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [comparing, setComparing] = useState(false);

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleFile(file: File) {
    const bundle = await upload(file);
    if (bundle) {
      addBundle(bundle);
      setSelectedIds((prev) => [...prev, bundle.document.id]);
    }
  }

  async function runComparison() {
    const documents = bundles
      .filter((b) => selectedIds.includes(b.document.id))
      .map((b) => b.document);

    if (documents.length < 2) return;

    setComparing(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents }),
      });
      const json = await res.json();
      if (json.success) setResult(json.result);
    } finally {
      setComparing(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-4xl font-semibold tracking-tight">Compare bills</h1>
        <p className="mt-3 text-muted-foreground">
          Upload multiple bills to track totals, categories, and month-over-month changes.
        </p>
      </motion.div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-medium tracking-tight">Add a bill</h2>
          <UploadDropzone onFileAccepted={handleFile} disabled={stage === "extracting" || stage === "explaining"} />
          <UploadProgress stage={stage} error={error} />
        </div>

        <div>
          <h2 className="mb-3 text-lg font-medium tracking-tight">Select bills to compare</h2>
          <BillPicker bundles={bundles} selectedIds={selectedIds} onToggle={toggle} />
          <Button
            className="mt-4 w-full rounded-full"
            disabled={selectedIds.length < 2 || comparing}
            onClick={runComparison}
          >
            {comparing ? "Comparing…" : `Compare ${selectedIds.length} bills`}
          </Button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-12 space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="rounded-3xl border-border/60">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Month-over-month change</p>
                <p className="mt-1 text-2xl font-semibold">{formatCurrency(result.monthlyChange)}</p>
                <p className="text-sm text-muted-foreground">{formatPercent(result.monthlyPercentChange)}</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-border/60">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Biggest increase</p>
                {result.biggestIncreases[0] ? (
                  <>
                    <p className="mt-1 text-2xl font-semibold capitalize">{result.biggestIncreases[0].category}</p>
                    <p className="text-sm text-muted-foreground">
                      +{formatCurrency(result.biggestIncreases[0].change)} ({formatPercent(result.biggestIncreases[0].percentChange)})
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-2xl font-semibold">None</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border-border/60">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-medium tracking-tight">Bill history</h3>
              <BillHistoryLineChart bills={result.bills} />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/60">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-medium tracking-tight">Category comparison</h3>
              <ChargeComparisonChart changes={result.categoryChanges} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
