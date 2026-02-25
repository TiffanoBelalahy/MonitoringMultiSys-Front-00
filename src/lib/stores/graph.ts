import { writable } from "svelte/store";

export const showGraph = writable(false);

export type TimeRange =
  | "realtime"
  | "1m"
  | "1h"
  | "10h"
  | "1d"
  | "1month";

export const selectedRange = writable<TimeRange>("realtime");

export function toggleGraph() {
  showGraph.update(v => !v);
}

export function setRange(range: TimeRange) {
  selectedRange.set(range);
}