"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ShieldAlert, LineChart, Lock } from "lucide-react";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { UploadProgress } from "@/components/upload/upload-progress";
import { useBillUpload } from "@/hooks/useBillUpload";
import { useBillStore } from "@/hooks/useBillStore";
import { getSampleBundle } from "@/lib/sampleBill";
import { findDuplicateBundle } from "@/lib/billStorage";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-explained charges",
    description: "Every line item explained in plain English — never invented, never guessed.",
    accent: "bg-primary/15 text-primary",
  },
  {
    icon: ShieldAlert,
    title: "Fee alerts",
    description: "Automatically flags late fees, admin fees, duplicates, and unexpected increases.",
    accent: "bg-destructive/15 text-destructive",
  },
  {
    icon: LineChart,
    title: "Compare over time",
    description: "Upload multiple bills to see totals, categories, and month-over-month changes.",
    accent: "bg-accent text-accent-foreground",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { stage, upload } = useBillUpload();
  const { bundles, addBundle } = useBillStore();

  async function handleFile(file: File) {
    const bundle = await upload(file);
    if (bundle) {
      const duplicate = findDuplicateBundle(bundles, bundle.document.fileName, bundle.document.total);
      if (
        duplicate &&
        window.confirm(
          `You already uploaded "${duplicate.document.fileName}" with the same total. Open the existing bill instead of adding a duplicate?`,
        )
      ) {
        router.push(`/dashboard?bill=${duplicate.document.id}`);
        return;
      }
      addBundle(bundle);
      router.push(`/dashboard?bill=${bundle.document.id}`);
    }
  }

  function handleSampleBill() {
    const bundle = getSampleBundle();
    addBundle(bundle);
    router.push(`/dashboard?bill=${bundle.document.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Every charge,
          <br />
          <span className="text-primary">finally explained.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Upload any bill. ClearBill extracts every line item, explains it in plain English,
          and flags fees you shouldn&apos;t be paying.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        className="mt-12"
      >
        <UploadDropzone onFileAccepted={handleFile} disabled={stage === "extracting" || stage === "explaining"} />
        <UploadProgress stage={stage} />

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleSampleBill}
            disabled={stage === "extracting" || stage === "explaining"}
            className="text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Or try a sample bill →
          </button>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lock className="size-3.5" />
          Your bill stays in your browser — only structured, anonymized data is sent for
          explanation, nothing is stored on a server.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3"
      >
        {FEATURES.map(({ icon: Icon, title, description, accent }) => (
          <div
            key={title}
            className="rounded-2xl border-2 border-foreground bg-card p-5 text-center shadow-[4px_4px_0_0_var(--foreground)]"
          >
            <div className={cn("mx-auto flex size-10 items-center justify-center rounded-full", accent)}>
              <Icon className="size-5" />
            </div>
            <p className="mt-3 font-heading font-semibold tracking-tight">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
