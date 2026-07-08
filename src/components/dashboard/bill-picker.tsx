"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/formatCurrency";
import type { BillBundle } from "@/types/store";

interface BillPickerProps {
  bundles: BillBundle[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function BillPicker({ bundles, selectedIds, onToggle }: BillPickerProps) {
  if (bundles.length === 0) {
    return <p className="text-sm text-muted-foreground">upload 2+ bills first</p>;
  }

  return (
    <div className="space-y-2">
      {bundles.map((bundle) => (
        <label
          key={bundle.document.id}
          className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition hover:bg-accent/40"
        >
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedIds.includes(bundle.document.id)}
              onCheckedChange={() => onToggle(bundle.document.id)}
            />
            <div>
              <p className="text-sm font-medium">{bundle.document.provider ?? bundle.document.fileName}</p>
              <p className="text-xs text-muted-foreground">{bundle.document.billingPeriodStart ?? "Unknown period"}</p>
            </div>
          </div>
          <p className="text-sm font-medium tabular-nums">{formatCurrency(bundle.document.total)}</p>
        </label>
      ))}
    </div>
  );
}
