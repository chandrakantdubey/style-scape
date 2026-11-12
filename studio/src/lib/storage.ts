import { validateScene, type Scene } from "@/runtime/stylescape-runtime.js";

export interface SavedScene {
  id: string;
  name: string;
  updatedAt: number;
  thumb: string;
  scene: Scene;
}

const KEY = "stylescape.v2.library";
const MAX_ITEMS = 40;

export function loadLibrary(): { items: SavedScene[]; error?: string } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { items: [] };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { items: [], error: "Saved library was malformed and was ignored." };
    const items: SavedScene[] = [];
    for (const it of parsed.slice(0, MAX_ITEMS)) {
      if (!it || typeof it !== "object") continue;
      const o = it as Record<string, unknown>;
      const v = validateScene(o.scene);
      if (!v.ok || typeof o.id !== "string") continue;
      items.push({
        id: o.id,
        name: typeof o.name === "string" ? o.name : v.scene.name,
        updatedAt: typeof o.updatedAt === "number" ? o.updatedAt : Date.now(),
        thumb: typeof o.thumb === "string" && o.thumb.startsWith("data:image/") ? o.thumb : "",
        scene: v.scene,
      });
    }
    return { items };
  } catch (e) {
    return { items: [], error: "Could not read local storage: " + (e instanceof Error ? e.message : String(e)) };
  }
}

export function persistLibrary(items: SavedScene[]): string | null {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    return null;
  } catch (e) {
    const quota = e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22);
    return quota ? "Storage is full. Delete saved scenes and try again." : "Saving failed: " + (e instanceof Error ? e.message : String(e));
  }
}

export const LIBRARY_LIMIT = MAX_ITEMS;
