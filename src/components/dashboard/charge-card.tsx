"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Charge } from "@/types/bill";
import type { ChargeExplanation } from "@/types/ai";
import { cn } from "@/lib/utils";

interface ChargeCardProps {
  charge: Charge;
  explanation?: ChargeExplanation;
  delay?: number;
}

const CATEGORY_LABEL: Record<Charge["category"], string> = {
  usage: "Usage",
  subscription: "Subscription",
  tax: "Tax",
  fee: "Fee",
  discount: "Discount",
  equipment: "Equipment",
  other: "Other",
};

export function ChargeCard({ charge, explanation, delay = 0 }: ChargeCardProps) {
  const confidencePercent = Math.round((explanation?.confidence ?? 0) * 100);
  const isLowConfidence = !explanation || explanation.confidence < 0.4;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}>
      <Card className="rounded-3xl border-border/60">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">{charge.description}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {CATEGORY_LABEL[charge.category]}
                </Badge>
                {charge.isRecurring && (
                  <Badge variant="outline" className="rounded-full">
                    Recurring
                  </Badge>
                )}
                {explanation?.isOptional === true && (
                  <Badge variant="outline" className="rounded-full border-primary text-primary">
                    Optional
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(charge.amount)}</p>
          </div>

          <p
            className={cn(
              "mt-4 text-sm leading-relaxed",
              isLowConfidence ? "text-muted-foreground italic" : "text-foreground/90",
            )}
          >
            {explanation?.explanation ?? "Unable to verify."}
          </p>

          {explanation?.whyItExists && !isLowConfidence && (
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground/70">Why it exists: </span>
              {explanation.whyItExists}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", isLowConfidence ? "bg-muted-foreground/40" : "bg-primary")}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{confidencePercent}% confidence</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
