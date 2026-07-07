"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { UploadStage } from "@/hooks/useBillUpload";

const STEPS: { stage: UploadStage; label: string }[] = [
  { stage: "extracting", label: "Reading your bill" },
  { stage: "explaining", label: "Explaining every charge" },
];

interface UploadProgressProps {
  stage: UploadStage;
}

export function UploadProgress({ stage }: UploadProgressProps) {
  if (stage === "idle" || stage === "error") return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="mx-auto mt-8 max-w-md space-y-3 rounded-3xl border border-border bg-card p-6"
      >
        {STEPS.map((step, i) => {
          const stepIndex = STEPS.findIndex((s) => s.stage === stage);
          const isDone = stage === "done" || i < stepIndex;
          const isActive = step.stage === stage;

          return (
            <div key={step.stage} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
              ) : isActive ? (
                <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
              ) : (
                <div className="size-5 shrink-0 rounded-full border-2 border-muted" />
              )}
              <p className={isDone || isActive ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
                {step.label}
              </p>
            </div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
