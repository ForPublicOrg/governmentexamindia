"use client";

import { useSyncExternalStore } from "react";
import { indiaDateKey } from "@/lib/lifecycle";

const snapshot = () => indiaDateKey(new Date());

/**
 * A tab left open across midnight IST would otherwise keep yesterday's answer
 * to "has this deadline passed?". A minute's granularity is far cheaper than
 * being wrong, and the snapshot itself only changes on the day boundary, so
 * this costs one string comparison a minute and no renders in between.
 */
function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

/**
 * Today's IST date, read from the reader's clock rather than baked in.
 *
 * This site is a static export, so every page ships with the date it was built
 * on. Anything time-sensitive rendered from that date starts lying the next
 * morning. `buildDate` is used for the server and hydration renders — it is
 * what the shipped HTML says, so hydration matches — and the real date takes
 * over in the render immediately after.
 */
export function useToday(buildDate: string) {
  return useSyncExternalStore(subscribe, snapshot, () => buildDate);
}
