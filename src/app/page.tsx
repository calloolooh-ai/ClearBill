"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { UploadProgress } from "@/components/upload/upload-progress";
import { PixelPropsStrip } from "@/components/home/pixel-props-strip";
import { useBillUpload } from "@/hooks/useBillUpload";
import { useBillStore } from "@/hooks/useBillStore";
import { getSampleBundle } from "@/lib/sampleBill";
import { findDuplicateBundle } from "@/lib/billStorage";

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
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          what&apos;s this <span className="text-primary">charge</span> even for
        </h1>
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

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lock className="size-3.5" />
          stays on your device
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="mt-20"
      >
        <PixelPropsStrip />
      </motion.div>
    </div>
  );
}
