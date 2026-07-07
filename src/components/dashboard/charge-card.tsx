"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatCurrency";
import type { BillDocument, Charge } from "@/types/bill";
import type { ChargeExplanation } from "@/types/ai";
import { cn } from "@/lib/utils";

interface ChargeCardProps {
  document: BillDocument;
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

export function ChargeCard({ document, charge, explanation, delay = 0 }: ChargeCardProps) {
  const confidencePercent = Math.round((explanation?.confidence ?? 0) * 100);
  const isLowConfidence = !explanation || explanation.confidence < 0.4;

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || asking) return;

    setAsking(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, chargeId: charge.id, question: question.trim() }),
      });
      const json = await res.json();
      setAnswer(json.success ? json.answer : "Unable to verify.");
    } catch {
      setAnswer("Unable to verify.");
    } finally {
      setAsking(false);
    }
  }

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

          <form onSubmit={handleAsk} className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about this charge…"
              disabled={asking}
              className="h-8 flex-1 rounded-full border border-border bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring"
            />
            <Button type="submit" size="icon-sm" variant="outline" disabled={asking || !question.trim()}>
              {asking ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </form>
          {answer && <p className="mt-2 text-sm text-muted-foreground">{answer}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
