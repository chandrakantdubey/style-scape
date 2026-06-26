/**
 * Persisted state migrator.
 *
 * Total function — never throws. Branches:
 *  1. Already v2 (has `schemaVersion === 2`) → returned as-is.
 *  2. Valid v1 (shape matches the `AppState` schema) → stamp `schemaVersion: 2`
 *     and return, preserving every field by referential identity.
 *  3. Anything else → return a default `AppStateV2`, log once, write a
 *     `migration:failed` marker to localStorage so the UI can surface
 *     a one-time banner.
 */

import type {
  AppState,
  AppStateV2,
  CanvasState,
  Layer,
  Preset,
} from "../state/types";
import { LayerType } from "../state/types";

const MIGRATION_FAILED_KEY = "migration:failed";
let migrationLogged = false;

export function defaultCanvas(): CanvasState {
  return {
    width: 1920,
    height: 1080,
    background: "#0b0f17",
  };
}

export function defaultAppStateV2(): AppStateV2 {
  return {
    layers: [],
    canvas: defaultCanvas(),
    selectedLayerId: null,
    schemaVersion: 2,
  };
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/**
 * Narrow check for a known layer kind. Used to filter out layers with
 * unknown `type` fields while preserving the rest of a Preset.
 */
export function isKnownLayer(x: unknown): x is Layer {
  if (!isPlainObject(x)) return false;
  switch (x.type) {
    case LayerType.GRADIENT:
    case LayerType.BLOB:
    case LayerType.WAVE:
    case LayerType.PATTERN:
    case LayerType.IMAGE:
      return true;
    default:
      return false;
  }
}

function isCanvasState(x: unknown): x is CanvasState {
  return (
    isPlainObject(x) &&
    typeof x.width === "number" &&
    typeof x.height === "number" &&
    typeof x.background === "string"
  );
}

export function isValidV1(x: unknown): x is AppState {
  if (!isPlainObject(x)) return false;
  if (!Array.isArray(x.layers)) return false;
  if (!x.layers.every(isKnownLayer)) return false;
  if (!isCanvasState(x.canvas)) return false;
  if (x.selectedLayerId !== null && typeof x.selectedLayerId !== "string") {
    return false;
  }
  return true;
}

function markFailure(reason: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(MIGRATION_FAILED_KEY, "1");
    }
  } catch {
    // Storage may be unavailable (private mode, quota). Swallow.
  }
  if (!migrationLogged) {
    migrationLogged = true;
    // eslint-disable-next-line no-console
    console.error(`[stylescape] migrateAppState salvage: ${reason}`);
  }
}

export function migrateAppState(raw: unknown): AppStateV2 {
  if (
    isPlainObject(raw) &&
    (raw as Record<string, unknown>).schemaVersion === 2
  ) {
    return raw as unknown as AppStateV2;
  }

  if (isValidV1(raw)) {
    return {
      layers: raw.layers,
      canvas: raw.canvas,
      selectedLayerId: raw.selectedLayerId,
      schemaVersion: 2,
    };
  }

  if (raw === null || raw === undefined) {
    markFailure("missing payload");
  } else if (!isPlainObject(raw)) {
    markFailure(`unexpected payload type: ${typeof raw}`);
  } else {
    markFailure("schema mismatch");
  }
  return defaultAppStateV2();
}

/**
 * Migrate a persisted `user_created_presets` array. Each preset's
 * non-`layers` fields are preserved by referential identity; `layers`
 * is element-wise filtered through `isKnownLayer`.
 */
export function migrateUserPresets(raw: unknown): Preset[] {
  if (!Array.isArray(raw)) return [];
  const out: Preset[] = [];
  for (const item of raw) {
    if (!isPlainObject(item)) continue;
    const layers = Array.isArray(item.layers)
      ? (item.layers as unknown[]).filter(isKnownLayer)
      : [];
    out.push({
      ...(item as unknown as Preset),
      layers,
    });
  }
  return out;
}
