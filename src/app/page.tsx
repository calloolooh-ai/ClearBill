"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { UploadProgress } from "@/components/upload/upload-progress";
import { useBillUpload } from "@/hooks/useBillUpload";
import { useBillStore } from "@/hooks/useBillStore";

export default function HomePage() {
  const router = useRouter();
  const { stage, error, upload } = useBillUpload();
  const { addBundle } = useBillStore();

  async function handleFile(file: File) {
    const bundle = await upload(file);
    if (bundle) {
      addBundle(bundle);
      router.push(`/dashboard?bill=${bundle.document.id}`);
    }
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
        <UploadProgress stage={stage} error={error} />
      </motion.div>
    </div>
  );
}
