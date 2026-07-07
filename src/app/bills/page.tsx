"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBillStore } from "@/hooks/useBillStore";
import { computeTotal } from "@/utils/billMath";
import { formatCurrency } from "@/utils/formatCurrency";

export default function BillsPage() {
  const { bundles, removeBundle } = useBillStore();

  function handleDelete(billId: string, label: string) {
    if (window.confirm(`Delete "${label}"? This can't be undone.`)) {
      removeBundle(billId);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">My Bills</h1>
      <p className="mt-2 text-muted-foreground">
        Every bill you&apos;ve uploaded on this device, stored locally in your browser.
      </p>

      {bundles.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">You haven&apos;t uploaded any bills yet.</p>
          <Link href="/" className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">
            Upload a bill
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {bundles.map((bundle, i) => {
            const label = bundle.document.provider ?? bundle.document.fileName;
            return (
              <motion.div key={bundle.document.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}>
                <Card className="rounded-3xl border-border/60">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <Link href={`/dashboard?bill=${bundle.document.id}`} className="min-w-0 flex-1">
                      <p className="truncate font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        {bundle.document.billingPeriodStart ?? "Unknown period"} · {formatCurrency(computeTotal(bundle.document))}
                      </p>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${label}`}
                      onClick={() => handleDelete(bundle.document.id, label)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
