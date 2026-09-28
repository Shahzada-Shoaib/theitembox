"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "tib-motion";
const CHANGE_EVENT = "tib-motion-change";
const MEDIA_QUERY = "(prefers-reduced-motion: reduce)";
let memoryPreference: string | null = null;

function getSnapshot() {
  let preference = memoryPreference;
  try { preference = localStorage.getItem(STORAGE_KEY); } catch { /* Use the in-memory preference. */ }
  if (preference === "full" || preference === "reduced") return preference === "reduced";
  return matchMedia(MEDIA_QUERY).matches;
}

function subscribe(listener: () => void) {
  const media = matchMedia(MEDIA_QUERY);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  media.addEventListener("change", listener);
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    media.removeEventListener("change", listener);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

function setReducedMotion(reduced: boolean) {
  memoryPreference = reduced ? "reduced" : "full";
  try { localStorage.setItem(STORAGE_KEY, memoryPreference); } catch { /* Still works without browser storage. */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useMotionPreference() {
  const reducedMotion = useSyncExternalStore(subscribe, getSnapshot, () => false);
  return [reducedMotion, setReducedMotion] as const;
}
