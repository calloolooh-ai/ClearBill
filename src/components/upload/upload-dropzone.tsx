"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { PixelReceiptMachine } from "@/components/upload/pixel-receipt-machine";

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
      <p className="text-xs text-muted-foreground">or click to browse · pdf, png, jpg</p>
    </div>
  );
}
