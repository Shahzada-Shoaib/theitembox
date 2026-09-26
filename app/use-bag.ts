"use client";

import { useSyncExternalStore } from "react";
import { products, type BagItem } from "./products";

const EMPTY_BAG: BagItem[] = [];
const listeners = new Set<() => void>();
let cachedBag = EMPTY_BAG;
let cachedValue: string | null | undefined;

function getSnapshot(): BagItem[] {
  try {
    const raw = localStorage.getItem("tib-bag");
    if (raw === cachedValue) return cachedBag;
    cachedValue = raw;
    const data: unknown = raw ? JSON.parse(raw) : [];
    cachedBag = Array.isArray(data) ? data.filter((item): item is BagItem =>
      typeof item === "object" && item !== null && products.some(p => p.id === item.id) &&
      typeof item.size === "string" && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99) : EMPTY_BAG;
  } catch { /* Retain the in-memory bag when browser storage is unavailable. */ }
  return cachedBag;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === "tib-bag" || event.key === null) listener(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}

function updateBag(updater: (items: BagItem[]) => BagItem[]) {
  cachedBag = updater(getSnapshot());
  try {
    const value = JSON.stringify(cachedBag);
    localStorage.setItem("tib-bag", value);
    cachedValue = value;
  } catch { /* Updates remain usable in memory, without persistence. */ }
  listeners.forEach(listener => listener());
}

export function useBag() {
  const bag = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_BAG);
  return [bag, updateBag] as const;
}
