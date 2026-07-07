"use client";

import { useCallback, useEffect, useState } from "react";
import type { BillBundle } from "@/types/store";
import { BILL_STORAGE_KEY, upsertBundle, removeBundleById, findBundleById, parseStoredBundles } from "@/lib/billStorage";

function readAll(): BillBundle[] {
  if (typeof window === "undefined") return [];
  return parseStoredBundles(window.localStorage.getItem(BILL_STORAGE_KEY));
}

function writeAll(bundles: BillBundle[]) {
  window.localStorage.setItem(BILL_STORAGE_KEY, JSON.stringify(bundles));
}

export function useBillStore() {
  const [bundles, setBundles] = useState<BillBundle[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only available client-side
    setBundles(readAll());
  }, []);

  const addBundle = useCallback((bundle: BillBundle) => {
    setBundles((prev) => {
      const next = upsertBundle(prev, bundle);
      writeAll(next);
      return next;
    });
  }, []);

  const removeBundle = useCallback((billId: string) => {
    setBundles((prev) => {
      const next = removeBundleById(prev, billId);
      writeAll(next);
      return next;
    });
  }, []);

  const getBundle = useCallback(
    (billId: string) => findBundleById(bundles, billId),
    [bundles],
  );

  return { bundles, addBundle, removeBundle, getBundle };
}
