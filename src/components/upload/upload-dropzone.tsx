"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFileAccepted: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFileAccepted, disabled }: UploadDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFileAccepted(accepted[0]);
    },
    [onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    disabled,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative flex min-h-80 cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-12 text-center transition-colors",
        isDragActive ? "border-primary bg-accent" : "border-border hover:border-primary/50 hover:bg-accent/40",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input {...getInputProps()} />
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={isDragActive ? { y: -6 } : { y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          {acceptedFiles[0] ? <FileText className="size-7" /> : <UploadCloud className="size-7" />}
        </motion.div>

        <div className="space-y-1.5">
          <p className="text-xl font-medium tracking-tight">
            {isDragActive ? "Drop your bill here" : "Drag and drop your bill"}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse — PDF, PNG, or JPG, up to 15MB
          </p>
        </div>
      </motion.div>
    </div>
  );
}
