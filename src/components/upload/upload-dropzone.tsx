"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PixelReceiptMachine } from "@/components/upload/pixel-receipt-machine";

// Kept below the API route's own 15MB limit so oversized files are rejected
// client-side instead of hitting a hosting-platform body-size limit, which
// returns an HTML error page instead of JSON.
const MAX_FILE_BYTES = 4 * 1024 * 1024;

interface UploadDropzoneProps {
  onFileAccepted: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFileAccepted, disabled }: UploadDropzoneProps) {
  const [celebrate, setCelebrate] = useState(false);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) {
        setCelebrate(true);
        window.setTimeout(() => setCelebrate(false), 950);
        onFileAccepted(accepted[0]);
      }
    },
    [onFileAccepted],
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const tooLarge = rejections.some((r) => r.errors.some((e) => e.code === "file-too-large"));
    toast.error(
      tooLarge
        ? "That file is too large (max 4MB). Try a lower-resolution scan or photo."
        : "That file couldn't be uploaded. Use a PDF, PNG, or JPG.",
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    disabled,
    maxFiles: 1,
    maxSize: MAX_FILE_BYTES,
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
        "group relative flex min-h-72 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-10 text-center transition-colors",
        isDragActive ? "border-primary bg-accent" : "border-border hover:border-primary/50 hover:bg-accent/40",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input {...getInputProps()} />

      <PixelReceiptMachine dragActive={isDragActive} celebrate={celebrate} />

      <p className="font-heading text-lg font-semibold tracking-tight">
        {isDragActive ? "drop it!" : "drag a bill here"}
      </p>
      <p className="text-xs text-muted-foreground">or click to browse · pdf, png, jpg · max 4MB</p>
    </div>
  );
}
