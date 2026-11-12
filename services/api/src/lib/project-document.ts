// Stored scenes are bounded JSON recipes, never executable code or embedded assets.
export function validDocument(scene: Record<string, unknown>): boolean {
  if (JSON.stringify(scene).length > 128_000 || Number(scene.version) !== 2) return false;
  if (!scene.params || !scene.palette || typeof scene.name !== "string" || typeof scene.seed !== "number") return false;
  if (scene.fieldMode !== undefined && !["curl", "orbit", "contour"].includes(String(scene.fieldMode))) return false;
  if (scene.layers !== undefined && (!Array.isArray(scene.layers) || scene.layers.length > 12 ||
    scene.layers.some((layer) => !layer || typeof layer !== "object" ||
      typeof layer.id !== "string" || !/^[a-zA-Z0-9_-]{1,40}$/.test(layer.id) ||
      !["orbits", "contours", "grid"].includes(String(layer.kind)) ||
      typeof layer.visible !== "boolean" ||
      typeof layer.opacity !== "number" || !Number.isFinite(layer.opacity) || layer.opacity < 0 || layer.opacity > 1 ||
      !Number.isInteger(layer.colorIndex) || layer.colorIndex < 0 || layer.colorIndex > 4 ||
      !Number.isInteger(layer.detail) || layer.detail < 4 || layer.detail > 48 ||
      !["normal", "multiply", "additive"].includes(String(layer.blend))))) return false;
  let nodes = 0;
  function visit(value: unknown, depth: number): boolean {
    if (++nodes > 6000 || depth > 12) return false;
    if (value === null || typeof value === "boolean") return true;
    if (typeof value === "number") return Number.isFinite(value);
    if (typeof value === "string") return value.length <= 500 && !/(<script|javascript:|data:|https?:\/\/)/i.test(value);
    if (Array.isArray(value)) return value.length <= 100 && value.every((v) => visit(v, depth + 1));
    if (typeof value === "object") return Object.entries(value).every(([k, v]) =>
      !["__proto__", "constructor", "prototype"].includes(k) && visit(v, depth + 1));
    return false;
  }
  return visit(scene, 0);
}
