"use client";

import { useCallback, useEffect, useState } from "react";
import type { BillBundle } from "@/types/store";

const STORAGE_KEY = "clearbill.bundles";

function readAll(): BillBundle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BillBundle[]) : [];
  } catch {
    return [];
  }
}

function writeAll(bundles: BillBundle[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bundles));
}

export function useBillStore() {
  const [bundles, setBundles] = useState<BillBundle[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only available client-side
    setBundles(readAll());
  }, []);

  const addBundle = useCallback((bundle: BillBundle) => {
    setBundles((prev) => {
      const next = [...prev.filter((b) => b.document.id !== bundle.document.id), bundle];
      writeAll(next);
      return next;
    });
  }, []);

  const removeBundle = useCallback((billId: string) => {
    setBundles((prev) => {
      const next = prev.filter((b) => b.document.id !== billId);
      writeAll(next);
      return next;
    });
  }, []);

  const getBundle = useCallback(
    (billId: string) => bundles.find((b) => b.document.id === billId),
    [bundles],
  );

  return { bundles, addBundle, removeBundle, getBundle };
}
