// Stored scenes are bounded JSON recipes, never executable code or embedded assets.
export function validDocument(scene: Record<string, unknown>): boolean {
  if (JSON.stringify(scene).length > 128_000 || ![2, 3].includes(Number(scene.version))) return false;
  if (!scene.params || !scene.palette || typeof scene.name !== "string" || typeof scene.seed !== "number") return false;
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
