import { defaultScene, mulberry32, PARAM_SPEC, type ParamKey, type Scene } from "@/runtime/stylescape-runtime.js";

export interface NamedPalette {
  id: string;
  name: string;
  background: string;
  colors: string[];
}

export const PALETTES: NamedPalette[] = [
  { id: "oscilloscope", name: "Oscilloscope", background: "#0e1220", colors: ["#ff5a36", "#ffb547", "#f4ecd8", "#4d7cff", "#1d2a6b"] },
  { id: "cyanotype", name: "Cyanotype", background: "#0b2a4a", colors: ["#e8f1f2", "#9cc9e0", "#4b8fc4", "#1f5c99", "#f2c14e"] },
  { id: "riso", name: "Riso Proof", background: "#f2ead9", colors: ["#ff4f7b", "#ff8a3d", "#2e5bff", "#18a68d", "#1b1b3a"] },
  { id: "phosphor", name: "Phosphor", background: "#08130f", colors: ["#c6ff6b", "#64e3a1", "#1fb5a8", "#0f6e74", "#f7f3c6"] },
  { id: "kiln", name: "Kiln", background: "#1c0f0c", colors: ["#ffd29d", "#ff8f5a", "#e0402f", "#8c1c3b", "#3f1240"] },
  { id: "plotter", name: "Plotter Ink", background: "#efe9dc", colors: ["#1a1d33", "#3b3f66", "#c8442c", "#7d8bb3", "#1a1d33"] },
  { id: "aurora", name: "Polar Night", background: "#05070f", colors: ["#7cf7d4", "#3cc1ff", "#8b6bff", "#ff6ad5", "#fff3b0"] },
  { id: "signal", name: "Signal Flare", background: "#151515", colors: ["#ff3d00", "#ff9100", "#ffd600", "#efefe6", "#5c5c66"] },
];

function scene(name: string, seed: number, palette: string, p: Partial<Scene["params"]>, blend: Scene["blend"] = "normal"): Scene {
  const base = defaultScene();
  const pal = PALETTES.find((x) => x.id === palette) ?? PALETTES[0];
  return {
    ...base,
    name,
    seed,
    blend,
    params: { ...base.params, ...p },
    palette: { background: pal.background, colors: [...pal.colors] },
  };
}

export const PRESETS: { id: string; blurb: string; scene: Scene }[] = [
  { id: "meridian", blurb: "Long laminar ribbons over faint moire", scene: scene("Meridian Drift", 1847, "oscilloscope", { count: 380, steps: 180, width: 0.0055, curl: 1.15, noiseScale: 1.25, interference: 0.32, rings: 54, drift: 0.4 }) },
  { id: "tidepool", blurb: "Dense curl eddies, cyanotype print", scene: scene("Tidepool Vortex", 90211, "cyanotype", { count: 620, steps: 110, width: 0.003, curl: 2.6, noiseScale: 2.2, warp: 0.9, interference: 0.18, rings: 90, taper: 0.9 }) },
  { id: "riso", blurb: "Bold multiply strokes on paper", scene: scene("Riso Weather", 4410, "riso", { count: 140, steps: 220, width: 0.016, curl: 0.9, noiseScale: 0.9, opacity: 0.78, interference: 0.12, grain: 0.11, vignette: 0.1, drift: 0.2 }, "multiply") },
  { id: "phosphor", blurb: "Additive glow, interference rings", scene: scene("Phosphor Bloom", 77003, "phosphor", { count: 520, steps: 150, width: 0.0028, opacity: 0.35, curl: 1.8, interference: 0.6, rings: 72, sources: 4, drift: 0.55 }, "additive") },
  { id: "kiln", blurb: "Molten bands, heavy warp", scene: scene("Kiln Strata", 3141, "kiln", { count: 260, steps: 260, width: 0.009, curl: 0.6, noiseScale: 0.7, warp: 1.6, flowAngle: 0.4, interference: 0.22, colorSpread: 0.25 }) },
  { id: "plotter", blurb: "Hairline pen-plotter study", scene: scene("Pen Plotter No. 9", 1209, "plotter", { count: 880, steps: 90, width: 0.0011, taper: 0.3, opacity: 0.85, curl: 1.3, noiseScale: 1.9, interference: 0, grain: 0.04, vignette: 0, drift: 0 }) },
  { id: "aurora", blurb: "Polar curtains, slow additive", scene: scene("Polar Curtain", 52088, "aurora", { count: 300, steps: 300, stepLength: 0.006, width: 0.007, opacity: 0.32, curl: 0.45, flowAngle: 1.57, warp: 1.2, interference: 0.4, rings: 26, sources: 2 }, "additive") },
];

export const LOCK_GROUPS: { id: LockGroup; label: string; keys: ParamKey[] }[] = [
  { id: "field", label: "Field", keys: ["noiseScale", "octaves", "curl", "warp", "flowAngle", "stepLength"] },
  { id: "ribbons", label: "Ribbons", keys: ["count", "steps", "width", "taper", "opacity"] },
  { id: "color", label: "Color", keys: ["colorSpread"] },
  { id: "interference", label: "Interference", keys: ["interference", "rings", "sources", "vignette", "grain"] },
  { id: "motion", label: "Motion", keys: ["drift"] },
];
export type LockGroup = "seed" | "field" | "ribbons" | "color" | "interference" | "motion";

export function variations(base: Scene, locks: Set<LockGroup>, amount: number, n: number, salt: number): Scene[] {
  const out: Scene[] = [];
  for (let i = 0; i < n; i++) {
    const r = mulberry32((base.seed * 31 + salt * 977 + i * 7919) >>> 0);
    const s: Scene = structuredClone(base);
    if (!locks.has("seed")) s.seed = Math.floor(r() * 999999) + 1;
    for (const g of LOCK_GROUPS) {
      if (locks.has(g.id)) continue;
      for (const k of g.keys) {
        const spec = PARAM_SPEC[k];
        const span = spec.max - spec.min;
        let v = s.params[k] + (r() * 2 - 1) * span * 0.35 * amount;
        v = Math.min(spec.max, Math.max(spec.min, v));
        if (spec.step >= 1) v = Math.round(v);
        s.params[k] = v;
      }
    }
    if (!locks.has("color") && r() < amount) {
      const pal = PALETTES[Math.floor(r() * PALETTES.length)];
      s.palette = { background: pal.background, colors: [...pal.colors] };
    }
    s.name = base.name.replace(/ · v\d+$/, "") + " · v" + (i + 1);
    out.push(s);
  }
  return out;
}

export const PARAM_LABELS: Record<ParamKey, { label: string; hint: string; fmt?: (v: number) => string }> = {
  count: { label: "Ribbons", hint: "Number of seeded streamlines" },
  steps: { label: "Length", hint: "Integration steps per ribbon" },
  stepLength: { label: "Step size", hint: "Euler step distance", fmt: (v) => v.toFixed(4) },
  noiseScale: { label: "Frequency", hint: "Base noise frequency" },
  octaves: { label: "Octaves", hint: "Fractal noise layers" },
  curl: { label: "Turbulence", hint: "Angle multiplier of the field" },
  warp: { label: "Domain warp", hint: "Second noise displacing the first" },
  flowAngle: { label: "Heading", hint: "Global rotation in radians" },
  width: { label: "Weight", hint: "Ribbon half-width", fmt: (v) => v.toFixed(4) },
  taper: { label: "Taper", hint: "Thinning toward the ends" },
  opacity: { label: "Opacity", hint: "Ribbon alpha" },
  colorSpread: { label: "Hue scatter", hint: "Random vs vertical palette mapping" },
  interference: { label: "Interference", hint: "Moire wave field strength" },
  rings: { label: "Wavenumber", hint: "Ring density per source" },
  sources: { label: "Emitters", hint: "Wave sources summed" },
  grain: { label: "Grain", hint: "Film noise overlay", fmt: (v) => v.toFixed(3) },
  drift: { label: "Drift", hint: "Animated displacement" },
  vignette: { label: "Vignette", hint: "Edge falloff" },
};
