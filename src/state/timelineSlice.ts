/**
 * Undo/Redo timeline helpers.
 *
 * Pure helpers that operate on a `TimelineCarrier` (the `past`,
 * `present`, `future` triple owned by the main store). Features:
 *  - No-op commit when state is structurally unchanged.
 *  - Coalescing of same-label commits within COALESCE_MS so rapid
 *    edits (slider drags) collapse into a single frame.
 *  - FIFO eviction at MAX_FRAMES to bound memory.
 */

import type { AppState } from "./types";

export const MAX_FRAMES = 200;
export const COALESCE_MS = 300;

export type FrameKind = "command" | "snapshot";

export interface TimelineFrame {
  label: string;
  kind: FrameKind;
  ts: number;
  state: AppState;
}

export interface TimelineCarrier {
  past: TimelineFrame[];
  present: AppState;
  future: TimelineFrame[];
}

export function stateEquals(a: AppState, b: AppState): boolean {
  if (a === b) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}

export function canUndo(c: Readonly<TimelineCarrier>): boolean {
  return c.past.length > 0;
}

export function canRedo(c: Readonly<TimelineCarrier>): boolean {
  return c.future.length > 0;
}

function nowMs(): number {
  return Date.now();
}

/**
 * Commit a new present state. Mutates `carrier` in place — designed to
 * run inside an Immer producer.
 */
export function commit(
  carrier: TimelineCarrier,
  next: AppState,
  label: string,
  kind: FrameKind
): void {
  if (stateEquals(carrier.present, next)) return;

  const now = nowMs();
  const last = carrier.past[carrier.past.length - 1];
  const shouldCoalesce =
    !!last && last.label === label && now - last.ts < COALESCE_MS;

  const frame: TimelineFrame = {
    label,
    kind,
    ts: now,
    state: carrier.present,
  };

  if (shouldCoalesce) {
    carrier.past[carrier.past.length - 1] = frame;
  } else {
    carrier.past.push(frame);
    if (carrier.past.length > MAX_FRAMES) {
      carrier.past.shift();
    }
  }

  carrier.present = next;
  carrier.future = [];
}

/** Step backward one frame. No-op when `past` is empty. */
export function undo(carrier: TimelineCarrier): void {
  if (carrier.past.length === 0) return;
  const prev = carrier.past.pop() as TimelineFrame;
  carrier.future.unshift({
    label: prev.label,
    kind: prev.kind,
    ts: nowMs(),
    state: carrier.present,
  });
  carrier.present = prev.state;
}

/** Step forward one frame. No-op when `future` is empty. */
export function redo(carrier: TimelineCarrier): void {
  if (carrier.future.length === 0) return;
  const nxt = carrier.future.shift() as TimelineFrame;
  carrier.past.push({
    label: nxt.label,
    kind: nxt.kind,
    ts: nowMs(),
    state: carrier.present,
  });
  carrier.present = nxt.state;
}
