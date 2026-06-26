/**
 * Per-category preset generators.
 *
 * Deterministic given (seed, presetIndex). 40 presets per theme cycle
 * through a 12-palette pool, with the variant rotating every 4 indices
 * so we never see two near-identical neighbours.
 *
 * Theme contract:
 *  - light: off-white backgrounds, mid-tone accents at low opacity.
 *           Should feel airy and minimal.
 *  - dark:  near-black backgrounds, bright accents at higher opacity.
 *           Should feel deep and cinematic.
 */

import seedrandom from "seedrandom";
import type {
  BlobLayer,
  GradientLayer,
  Layer,
  PatternLayer,
  Preset,
  PresetCategory,
  PresetTheme,
} from "../state/types";
import { LayerType } from "../state/types";

// ============================================================================
// Theme palettes — 12 per theme so 40 presets cycle ~3.3× per palette
// ============================================================================
//
// Palette slots: [bg-base, bg-tint, accent-soft, accent-strong]
//   - light: bg-base must be near-white; both accents are mid-tone
//   - dark:  bg-base must be near-black; accents are bright
//
// ============================================================================

const palettes: Record<PresetTheme, string[][]> = {
  light: [
    ["#fdfaf6", "#fef0e6", "#fcd7c0", "#fb7185"], // cream → coral
    ["#f8faff", "#eef2ff", "#c7d2fe", "#6366f1"], // mist → indigo
    ["#fff5f8", "#ffe4eb", "#fbcfe8", "#db2777"], // blossom → magenta
    ["#f5fdf7", "#dcfce7", "#a7f3d0", "#0d9488"], // mint → teal
    ["#f5faff", "#e0f2fe", "#bae6fd", "#0284c7"], // sky → blue
    ["#fefdf5", "#fef9c3", "#fde68a", "#d97706"], // butter → amber
    ["#fefafd", "#fce7f3", "#fbb6ce", "#a21caf"], // petal → fuchsia
    ["#f0fdff", "#cffafe", "#a5f3fc", "#0891b2"], // ice → cyan
    ["#faf8ff", "#ede9fe", "#ddd6fe", "#7c3aed"], // lilac → violet
    ["#fafaf9", "#f5f5f4", "#e7e5e4", "#525252"], // stone → graphite
    ["#fefaf0", "#fef3c7", "#fcd34d", "#b45309"], // sand → ochre
    ["#f0fdfa", "#ccfbf1", "#99f6e4", "#0f766e"], // pearl → emerald
  ],
  dark: [
    ["#06070d", "#0b0f1f", "#312e81", "#a5b4fc"], // midnight → indigo
    ["#02040a", "#020617", "#0e7490", "#67e8f9"], // void → cyan
    ["#0a0410", "#1a0b22", "#581c87", "#f0abfc"], // plum → fuchsia
    ["#011714", "#022c22", "#065f46", "#6ee7b7"], // forest → emerald
    ["#050505", "#0a0a0a", "#7c2d12", "#fdba74"], // carbon → orange
    ["#040b1d", "#0c1e3d", "#1e40af", "#93c5fd"], // navy → sky
    ["#0b0418", "#170630", "#4c1d95", "#d8b4fe"], // obsidian → purple
    ["#01020a", "#020410", "#155e75", "#a5f3fc"], // ink → teal
    ["#100506", "#1c0a0a", "#9f1239", "#fda4af"], // garnet → rose
    ["#000a0b", "#001011", "#0f766e", "#99f6e4"], // abyss → mint
    ["#080808", "#111111", "#525252", "#e5e5e5"], // graphite → silver
    ["#06050a", "#0c0a09", "#7e22ce", "#e9d5ff"], // shadow → lavender
  ],
};

// ============================================================================
// Theme-aware intensity profile
// ============================================================================

interface ThemeIntensity {
  patternOpacity: { min: number; max: number };
  patternBlend: string;
  accentOpacity: { min: number; max: number };
}

function intensityFor(theme: PresetTheme): ThemeIntensity {
  if (theme === "light") {
    return {
      patternOpacity: { min: 0.08, max: 0.16 },
      patternBlend: "multiply",
      accentOpacity: { min: 0.25, max: 0.45 },
    };
  }
  return {
    patternOpacity: { min: 0.3, max: 0.5 },
    patternBlend: "screen",
    accentOpacity: { min: 0.45, max: 0.7 },
  };
}

function accentColor(palette: string[], theme: PresetTheme, variant: number): string {
  if (theme === "light") {
    return variant % 2 === 0 ? palette[2] ?? palette[1] : palette[3] ?? palette[2];
  }
  return palette[3] ?? palette[2] ?? "#a78bfa";
}

// ============================================================================
// RNG helpers
// ============================================================================

function random(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min;
}

function pick<T>(rng: () => number, values: readonly T[]): T {
  return values[Math.floor(rng() * values.length)];
}

function getPalette(
  rng: () => number,
  theme: PresetTheme,
  customPalette?: string[][],
  presetIndex?: number
): string[] {
  const source = customPalette?.length ? customPalette : palettes[theme];
  if (presetIndex !== undefined) {
    return source[presetIndex % source.length];
  }
  return pick(rng, source);
}

function variantOf(presetIndex: number | undefined, total: number): number {
  if (presetIndex === undefined) return 0;
  return Math.floor(presetIndex / 4) % total;
}

function makePreset(
  id: string,
  name: string,
  category: PresetCategory,
  theme: PresetTheme,
  isNew: boolean,
  background: string,
  layers: Layer[]
): Preset {
  return {
    id,
    name,
    category,
    theme,
    isNew,
    canvas: { width: 500, height: 500, background },
    layers,
  };
}

// ============================================================================
// Gradient helper
// ============================================================================

function gradientLayer(
  id: string,
  name: string,
  colors: string[],
  theme: PresetTheme,
  rng: () => number,
  overrides: Partial<GradientLayer> = {}
): GradientLayer {
  const gradientType =
    overrides.gradientType ?? (rng() > 0.42 ? "linear" : "radial");

  const stops =
    theme === "light"
      ? [
          { id: `${id}-s1`, color: colors[0], offset: 0 },
          { id: `${id}-s2`, color: colors[1] ?? colors[0], offset: random(rng, 50, 75) },
          { id: `${id}-s3`, color: colors[2] ?? colors[1] ?? colors[0], offset: 100 },
        ]
      : [
          { id: `${id}-s1`, color: colors[0], offset: 0 },
          { id: `${id}-s2`, color: colors[1] ?? colors[0], offset: random(rng, 45, 70) },
          { id: `${id}-s3`, color: colors[2] ?? colors[1] ?? colors[0], offset: 100 },
        ];

  return {
    id,
    name,
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: "normal",
    gradientType,
    angle: pick(rng, [20, 45, 90, 135, 210, 260, 315]),
    stops,
    cx: random(rng, 28, 72),
    cy: random(rng, 28, 72),
    r: theme === "dark" ? random(rng, 78, 135) : random(rng, 58, 112),
    ...overrides,
  };
}

// ============================================================================
// Gradient
// ============================================================================

export function generateGradientPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 4);

  const isLinear = variant < 2;
  const isBold = variant % 2 === 1;
  const angleChoices = isLinear ? [20, 45, 90, 135, 180, 225, 315] : [0];

  const layers: Layer[] = [
    gradientLayer(`layer-gradient-base-${id}`, "Gradient Base", palette, theme, rng, {
      gradientType: isLinear ? "linear" : "radial",
      angle: pick(rng, angleChoices),
    }),
  ];

  if (isBold) {
    const i = intensityFor(theme);
    layers.push(
      gradientLayer(
        `layer-gradient-highlight-${id}`,
        "Gradient Highlight",
        [accentColor(palette, theme, variant), palette[0], "transparent"],
        theme,
        rng,
        {
          opacity: random(rng, i.accentOpacity.min, i.accentOpacity.max),
          blendMode: theme === "dark" ? "screen" : "soft-light",
          gradientType: "radial",
          cx: random(rng, 20, 80),
          cy: random(rng, 20, 80),
          r: random(rng, 45, 85),
        }
      )
    );
  }

  return makePreset(id, name, "Gradients", theme, isNew, palette[0], layers);
}

// ============================================================================
// Waves — proper layered silhouettes
// ============================================================================

interface WaveStyle {
  // 4 distinct silhouettes:
  //   "ranges":  3 mountain ridges in the lower half, fading depth
  //   "ocean":   smooth swells filling the lower 2/3
  //   "aurora":  thin bands across the whole canvas
  //   "ribbons": 5 ribbon waves stacked top to bottom
  kind: "ranges" | "ocean" | "aurora" | "ribbons";
}

const WAVE_STYLES: WaveStyle[] = [
  { kind: "ranges" },
  { kind: "ocean" },
  { kind: "aurora" },
  { kind: "ribbons" },
];

export function generateWavePreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const style = WAVE_STYLES[variantOf(presetIndex, WAVE_STYLES.length)];

  // Background gradient sets the mood.
  const layers: Layer[] = [
    gradientLayer(`layer-wave-bg-${id}`, "Wave Background", palette, theme, rng, {
      gradientType: "linear",
      angle: style.kind === "aurora" ? 200 : 180,
      opacity: 1,
    }),
  ];

  // Wave palette: 3 colors stepping from soft to strong accent.
  // Light theme: soft → soft → strong so the ridge edge stands out.
  // Dark theme:  strong → strong → bright so silhouettes glow.
  const waveColors =
    theme === "light"
      ? [palette[2], palette[2], palette[3] ?? palette[2]]
      : [palette[2], palette[3], palette[3] ?? palette[2]];

  switch (style.kind) {
    case "ranges": {
      // 3 mountain ridges in the bottom half, each progressively more
      // saturated and rising slightly. Many points = ragged peaks.
      const ridges = 3;
      for (let i = 0; i < ridges; i++) {
        const y = 0.55 + i * 0.13;
        layers.push({
          id: `layer-wave-${i}-${id}`,
          name: `Ridge ${i + 1}`,
          type: LayerType.WAVE,
          visible: true,
          opacity: theme === "light" ? 0.65 + i * 0.12 : 0.78 + i * 0.07,
          blendMode: "normal",
          color: waveColors[i],
          seed: random(rng, 1, 10000),
          // Ragged ridges = many points + short wavelength + tall amplitude.
          points: Math.floor(random(rng, 10, 16)),
          wavelength: random(rng, 130, 220),
          amplitude: random(rng, 60, 95),
          y,
          angle: random(rng, -3, 3),
        });
      }
      break;
    }
    case "ocean": {
      // 3 long smooth swells stacked low. Few points + long wavelength.
      const swells = 3;
      for (let i = 0; i < swells; i++) {
        const y = 0.6 + i * 0.13;
        layers.push({
          id: `layer-wave-${i}-${id}`,
          name: `Swell ${i + 1}`,
          type: LayerType.WAVE,
          visible: true,
          opacity: theme === "light" ? 0.62 + i * 0.13 : 0.8 + i * 0.06,
          blendMode: "normal",
          color: waveColors[i],
          seed: random(rng, 1, 10000),
          points: Math.floor(random(rng, 5, 8)),
          wavelength: random(rng, 280, 420),
          amplitude: random(rng, 22, 40),
          y,
          angle: random(rng, -2, 2),
        });
      }
      break;
    }
    case "aurora": {
      // 4 thin translucent bands across the canvas. Low amplitude,
      // long wavelength, screen/multiply blend for ethereal layering.
      const bands = 4;
      for (let i = 0; i < bands; i++) {
        const y = 0.18 + i * 0.22;
        layers.push({
          id: `layer-wave-${i}-${id}`,
          name: `Aurora ${i + 1}`,
          type: LayerType.WAVE,
          visible: true,
          opacity:
            theme === "light"
              ? random(rng, 0.35, 0.55)
              : random(rng, 0.5, 0.75),
          blendMode: theme === "dark" ? "screen" : "multiply",
          color:
            i === 0
              ? palette[2]
              : i === bands - 1
              ? palette[3] ?? palette[2]
              : waveColors[i % waveColors.length],
          seed: random(rng, 1, 10000),
          points: Math.floor(random(rng, 6, 9)),
          wavelength: random(rng, 300, 480),
          amplitude: random(rng, 14, 28),
          y,
          angle: random(rng, -8, 8),
        });
      }
      break;
    }
    case "ribbons": {
      // 5 ribbons stacked top to bottom — fills the whole canvas
      // with overlapping wave bands.
      const count = 5;
      for (let i = 0; i < count; i++) {
        const y = 0.15 + i * 0.16;
        layers.push({
          id: `layer-wave-${i}-${id}`,
          name: `Ribbon ${i + 1}`,
          type: LayerType.WAVE,
          visible: true,
          opacity: theme === "light" ? 0.5 - i * 0.04 : 0.85 - i * 0.06,
          blendMode: "normal",
          color: waveColors[i % waveColors.length],
          seed: random(rng, 1, 10000),
          points: Math.floor(random(rng, 7, 11)),
          wavelength: random(rng, 220, 360),
          amplitude: random(rng, 30, 55),
          y,
          angle: random(rng, -4, 4),
        });
      }
      break;
    }
  }

  // Optional sky glow on ranges and ocean to add atmosphere.
  if (style.kind === "ranges" || style.kind === "ocean") {
    layers.push(
      gradientLayer(
        `layer-wave-glow-${id}`,
        "Sky Glow",
        [palette[0], palette[1] ?? palette[0], "transparent"],
        theme,
        rng,
        {
          gradientType: "radial",
          opacity: theme === "dark" ? 0.5 : 0.25,
          blendMode: theme === "dark" ? "screen" : "soft-light",
          cx: random(rng, 25, 75),
          cy: random(rng, 8, 28),
          r: random(rng, 60, 95),
        }
      )
    );
  }

  return makePreset(id, name, "Waves", theme, isNew, palette[0], layers);
}

// ============================================================================
// Grid (small line scales)
// ============================================================================

export function generateGridPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 4);
  const intensity = intensityFor(theme);
  const lineColor = accentColor(palette, theme, variant);

  const scale =
    variant === 0
      ? random(rng, 5, 8)
      : variant === 1
      ? random(rng, 8, 11)
      : variant === 2
      ? random(rng, 6, 9)
      : random(rng, 4, 7);

  const baseAngle = variant === 2 ? 45 : 0;

  const layers: Layer[] = [
    gradientLayer(`layer-grid-bg-${id}`, "Grid Background", palette, theme, rng, {
      gradientType: pick(rng, ["linear", "radial"]),
      angle: pick(rng, [45, 135, 180, 225]),
    }),
  ];

  const horizontal: PatternLayer = {
    id: `layer-grid-h-${id}`,
    name: "Grid Horizontal",
    type: LayerType.PATTERN,
    visible: true,
    opacity: random(rng, intensity.patternOpacity.min, intensity.patternOpacity.max),
    blendMode: intensity.patternBlend,
    patternType: "lines",
    backgroundColor: "transparent",
    foregroundColor: lineColor,
    scale,
    angle: baseAngle,
  };
  const vertical: PatternLayer = {
    ...horizontal,
    id: `layer-grid-v-${id}`,
    name: "Grid Vertical",
    angle: baseAngle + 90,
  };
  layers.push(horizontal, vertical);

  if (theme === "dark" && rng() > 0.5) {
    layers.push(
      gradientLayer(
        `layer-grid-vignette-${id}`,
        "Grid Vignette",
        ["transparent", palette[0]],
        theme,
        rng,
        {
          gradientType: "radial",
          opacity: 0.55,
          blendMode: "normal",
          cx: 50,
          cy: 50,
          r: 75,
        }
      )
    );
  }

  return makePreset(id, name, "Grid", theme, isNew, palette[0], layers);
}

// ============================================================================
// Glassmorphism
// ============================================================================

export function generateGlassPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 3);
  const panelCount = variant === 0 ? 3 : variant === 1 ? 4 : 5;

  const layers: Layer[] = [
    gradientLayer(`layer-glass-bg-${id}`, "Glass Background", palette, theme, rng, {
      gradientType: "radial",
    }),
  ];

  for (let i = 0; i < panelCount; i++) {
    const blob: BlobLayer = {
      id: `layer-glass-panel-${i}-${id}`,
      name: `Glass Panel ${i + 1}`,
      type: LayerType.BLOB,
      visible: true,
      opacity:
        theme === "light"
          ? random(rng, 0.1, 0.22)
          : random(rng, 0.16, 0.34),
      blendMode: theme === "dark" ? "screen" : "soft-light",
      color: i % 2 === 0 ? "#ffffff" : palette[(i + 1) % palette.length],
      seed: random(rng, 1, 10000),
      points: Math.floor(random(rng, 8, 14)),
      chaos: random(rng, 0.08, 0.26),
      x: random(rng, 0.18, 0.82),
      y: random(rng, 0.16, 0.84),
      scale: random(rng, 0.42, 0.92),
    };
    layers.push(blob);
  }

  layers.push({
    id: `layer-glass-sheen-${id}`,
    name: "Glass Sheen",
    type: LayerType.GRADIENT,
    visible: true,
    opacity: theme === "light" ? 0.18 : 0.32,
    blendMode: "soft-light",
    gradientType: "linear",
    angle: variant === 2 ? 45 : 135,
    stops: [
      { id: `sheen-1-${id}`, color: "#ffffff", offset: 0 },
      { id: `sheen-2-${id}`, color: palette[1] ?? "#ffffff", offset: 100 },
    ],
  });

  return makePreset(id, name, "Glassmorphism", theme, isNew, palette[0], layers);
}

// ============================================================================
// Abstract
// ============================================================================

export function generateAbstractPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 4);
  const intensity = intensityFor(theme);

  const layouts: Array<Array<[number, number]>> = [
    [[0.3, 0.35], [0.7, 0.55], [0.4, 0.75]],
    [[0.25, 0.3], [0.75, 0.3], [0.25, 0.75], [0.75, 0.75]],
    [[0.35, 0.4], [0.65, 0.6]],
    [[0.2, 0.25], [0.55, 0.4], [0.8, 0.3], [0.35, 0.7], [0.7, 0.78]],
  ];
  const layout = layouts[variant];
  const scaleMin = variant === 2 ? 0.7 : variant === 3 ? 0.4 : 0.55;
  const scaleMax = variant === 2 ? 1.1 : variant === 3 ? 0.7 : 0.85;

  const layers: Layer[] = [
    gradientLayer(`layer-abstract-bg-${id}`, "Abstract Background", palette, theme, rng, {
      gradientType: "radial",
    }),
  ];

  for (let i = 0; i < layout.length; i++) {
    const [qx, qy] = layout[i];
    const blob: BlobLayer = {
      id: `layer-abstract-blob-${i}-${id}`,
      name: `Abstract Shape ${i + 1}`,
      type: LayerType.BLOB,
      visible: true,
      opacity: random(rng, intensity.accentOpacity.min, intensity.accentOpacity.max),
      blendMode:
        theme === "dark"
          ? pick(rng, ["screen", "lighten"])
          : pick(rng, ["multiply", "soft-light"]),
      color: palette[(i + 2) % palette.length],
      seed: random(rng, 1, 10000),
      points: Math.floor(random(rng, 6, 10)),
      chaos: random(rng, 0.3, 0.7),
      x: qx + random(rng, -0.06, 0.06),
      y: qy + random(rng, -0.06, 0.06),
      scale: random(rng, scaleMin, scaleMax),
    };
    layers.push(blob);
  }

  return makePreset(id, name, "Abstract", theme, isNew, palette[0], layers);
}

// ============================================================================
// Mesh
// ============================================================================

export function generateMeshPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 3);
  const pools = 4 + variant;
  const intensity = intensityFor(theme);

  const layers: Layer[] = [
    gradientLayer(`layer-mesh-bg-${id}`, "Mesh Base", palette, theme, rng, {
      gradientType: "linear",
      angle: pick(rng, [110, 135, 160, 200, 235]),
    }),
  ];

  const extraPalette =
    customPalette && customPalette.length > 1
      ? customPalette.flat()
      : [...palette, ...(palettes[theme][((presetIndex ?? 0) + 1) % palettes[theme].length] ?? [])];

  for (let i = 0; i < pools; i++) {
    const color = extraPalette[i % extraPalette.length];
    const fallback = extraPalette[(i + 1) % extraPalette.length] ?? color;
    layers.push({
      id: `layer-mesh-pool-${i}-${id}`,
      name: `Mesh Pool ${i + 1}`,
      type: LayerType.GRADIENT,
      visible: true,
      opacity: random(rng, intensity.accentOpacity.min, intensity.accentOpacity.max),
      blendMode:
        theme === "dark"
          ? pick(rng, ["screen", "lighten", "overlay"])
          : pick(rng, ["multiply", "soft-light"]),
      gradientType: "radial",
      angle: 0,
      stops: [
        { id: `mesh-${i}-s1-${id}`, color, offset: 0 },
        { id: `mesh-${i}-s2-${id}`, color: fallback, offset: 60 },
        { id: `mesh-${i}-s3-${id}`, color: "transparent", offset: 100 },
      ],
      cx: random(rng, 8, 92),
      cy: random(rng, 8, 92),
      r: random(rng, 35, 80),
    });
  }

  return makePreset(id, name, "Mesh", theme, isNew, palette[0], layers);
}

// ============================================================================
// Stripes (small scale)
// ============================================================================

export function generateStripesPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 4);
  const intensity = intensityFor(theme);
  const stripeColor = accentColor(palette, theme, variant);

  const primaryAngle = variant === 0 ? 0 : variant === 1 ? 90 : 45;
  const primaryScale = variant === 3 ? random(rng, 6, 10) : random(rng, 4, 8);

  const layers: Layer[] = [
    gradientLayer(`layer-stripes-bg-${id}`, "Stripes Background", palette, theme, rng, {
      gradientType: pick(rng, ["linear", "radial"]),
      angle: pick(rng, [45, 90, 135, 225, 270]),
    }),
  ];

  const primary: PatternLayer = {
    id: `layer-stripes-primary-${id}`,
    name: "Primary Stripes",
    type: LayerType.PATTERN,
    visible: true,
    opacity: random(rng, intensity.patternOpacity.min, intensity.patternOpacity.max),
    blendMode: intensity.patternBlend,
    patternType: "lines",
    backgroundColor: "transparent",
    foregroundColor: stripeColor,
    scale: primaryScale,
    angle: primaryAngle,
  };
  layers.push(primary);

  if (variant === 3) {
    layers.push({
      ...primary,
      id: `layer-stripes-secondary-${id}`,
      name: "Cross-hatch",
      opacity: primary.opacity * 0.7,
      foregroundColor: palette[1] ?? stripeColor,
      scale: primary.scale * 1.6,
      angle: primaryAngle + 90,
    });
  }

  return makePreset(id, name, "Stripes", theme, isNew, palette[0], layers);
}

// ============================================================================
// Mosaic
// ============================================================================

export function generateMosaicPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 4);
  const intensity = intensityFor(theme);
  const tiles = ["triangles", "hexagons", "crosses", "squares"] as const;
  const tile = tiles[variant];
  const tileColor = accentColor(palette, theme, variant);

  const layers: Layer[] = [
    gradientLayer(`layer-mosaic-bg-${id}`, "Mosaic Background", palette, theme, rng, {
      gradientType: "radial",
    }),
  ];

  const base: PatternLayer = {
    id: `layer-mosaic-base-${id}`,
    name: `Mosaic ${tile}`,
    type: LayerType.PATTERN,
    visible: true,
    opacity: random(rng, intensity.patternOpacity.min, intensity.patternOpacity.max),
    blendMode: intensity.patternBlend,
    patternType: tile,
    backgroundColor: "transparent",
    foregroundColor: tileColor,
    scale: random(rng, 18, 42),
    angle: pick(rng, [0, 30, 45, 60]),
  };
  layers.push(base);

  layers.push({
    ...base,
    id: `layer-mosaic-accent-${id}`,
    name: "Mosaic Accent",
    opacity: base.opacity * 0.55,
    foregroundColor: palette[0] ?? tileColor,
    scale: base.scale * random(rng, 0.45, 0.7),
    angle: (base.angle + 30) % 90,
    blendMode: theme === "dark" ? "overlay" : "soft-light",
  });

  return makePreset(id, name, "Mosaic", theme, isNew, palette[0], layers);
}

// ============================================================================
// Dots (small scale)
// ============================================================================

export function generateDotsPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 4);
  const intensity = intensityFor(theme);
  const dotColor = accentColor(palette, theme, variant);

  const scale =
    variant === 0
      ? random(rng, 6, 8)
      : variant === 1
      ? random(rng, 8, 12)
      : variant === 2
      ? random(rng, 12, 16)
      : random(rng, 7, 10);

  const layers: Layer[] = [
    gradientLayer(`layer-dots-bg-${id}`, "Dots Background", palette, theme, rng, {
      gradientType: pick(rng, ["linear", "radial"]),
      angle: pick(rng, [45, 135, 180, 225]),
    }),
  ];

  const dots: PatternLayer = {
    id: `layer-dots-${id}`,
    name: "Dots",
    type: LayerType.PATTERN,
    visible: true,
    opacity: random(rng, intensity.patternOpacity.min, intensity.patternOpacity.max),
    blendMode: intensity.patternBlend,
    patternType: "dots",
    backgroundColor: "transparent",
    foregroundColor: dotColor,
    scale,
    angle: 0,
  };
  layers.push(dots);

  if (variant === 3) {
    layers.push({
      ...dots,
      id: `layer-dots-accent-${id}`,
      name: "Accent Dots",
      opacity: dots.opacity * 0.7,
      foregroundColor: palette[1] ?? dotColor,
      scale: dots.scale * 2.2,
      angle: 30,
    });
  }

  return makePreset(id, name, "Dots", theme, isNew, palette[0], layers);
}

// ============================================================================
// Plasma
// ============================================================================

export function generatePlasmaPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 3);
  const second = palettes[theme][((presetIndex ?? 0) + 5) % palettes[theme].length];
  const merged = [...palette, ...second];
  const intensity = intensityFor(theme);

  const layers: Layer[] = [
    gradientLayer(`layer-plasma-bg-${id}`, "Plasma Base", palette, theme, rng, {
      gradientType: "linear",
      angle: pick(rng, [120, 160, 200, 240]),
    }),
  ];

  const blobCount = 4 + variant;
  const positions: Array<[number, number]> = [
    [0.25, 0.3],
    [0.75, 0.35],
    [0.3, 0.75],
    [0.7, 0.7],
    [0.5, 0.5],
    [0.5, 0.15],
  ];

  for (let i = 0; i < blobCount; i++) {
    const [qx, qy] = positions[i % positions.length];
    const blob: BlobLayer = {
      id: `layer-plasma-blob-${i}-${id}`,
      name: `Plasma Blob ${i + 1}`,
      type: LayerType.BLOB,
      visible: true,
      opacity: random(rng, intensity.accentOpacity.min, intensity.accentOpacity.max),
      blendMode:
        theme === "dark"
          ? pick(rng, ["screen", "lighten", "overlay"])
          : pick(rng, ["multiply", "soft-light"]),
      color: merged[(i + 2) % merged.length],
      seed: random(rng, 1, 10000),
      points: Math.floor(random(rng, 8, 14)),
      chaos: random(rng, 0.15, 0.4),
      x: qx + random(rng, -0.08, 0.08),
      y: qy + random(rng, -0.08, 0.08),
      scale: random(rng, 0.7, 1.05),
    };
    layers.push(blob);
  }

  return makePreset(id, name, "Plasma", theme, isNew, palette[0], layers);
}

// ============================================================================
// Noise
// ============================================================================

export function generateNoisePreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 3);
  const intensity = intensityFor(theme);
  const grainColor = accentColor(palette, theme, variant);

  const layers: Layer[] = [
    gradientLayer(`layer-noise-bg-${id}`, "Noise Background", palette, theme, rng, {
      gradientType: "radial",
      angle: pick(rng, [45, 90, 135]),
    }),
  ];

  const grainScale = variant === 0 ? random(rng, 3, 5) : random(rng, 4, 7);
  layers.push({
    id: `layer-noise-grain-${id}`,
    name: "Grain",
    type: LayerType.PATTERN,
    visible: true,
    opacity: random(rng, intensity.patternOpacity.min, intensity.patternOpacity.max) * 0.8,
    blendMode: intensity.patternBlend,
    patternType: "dots",
    backgroundColor: "transparent",
    foregroundColor: grainColor,
    scale: grainScale,
    angle: 0,
  });

  if (variant === 2) {
    layers.push({
      id: `layer-noise-hatch-${id}`,
      name: "Hatch",
      type: LayerType.PATTERN,
      visible: true,
      opacity: random(rng, 0.08, 0.16),
      blendMode: intensity.patternBlend,
      patternType: "lines",
      backgroundColor: "transparent",
      foregroundColor: grainColor,
      scale: random(rng, 4, 8),
      angle: 45,
    });
  }

  return makePreset(id, name, "Noise", theme, isNew, palette[0], layers);
}

// ============================================================================
// Topo
// ============================================================================

export function generateTopoPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 3);
  const intensity = intensityFor(theme);
  const ringColor = accentColor(palette, theme, variant);

  const systems = variant === 0 ? 1 : variant === 1 ? 2 : 3;

  const layers: Layer[] = [
    gradientLayer(`layer-topo-bg-${id}`, "Topo Background", palette, theme, rng, {
      gradientType: "linear",
      angle: pick(rng, [45, 135, 225]),
    }),
  ];

  for (let s = 0; s < systems; s++) {
    const cx = random(rng, 15, 85);
    const cy = random(rng, 15, 85);
    const ringCount = Math.floor(random(rng, 4, 7));
    for (let r = 0; r < ringCount; r++) {
      const radius = 12 + r * random(rng, 8, 14);
      layers.push({
        id: `layer-topo-${s}-${r}-${id}`,
        name: `Topo Ring ${s + 1}.${r + 1}`,
        type: LayerType.GRADIENT,
        visible: true,
        opacity:
          random(rng, intensity.patternOpacity.min, intensity.patternOpacity.max) *
          (1 - (r / ringCount) * 0.4),
        blendMode: intensity.patternBlend,
        gradientType: "radial",
        angle: 0,
        cx,
        cy,
        r: radius,
        stops: [
          { id: `topo-${s}-${r}-s1-${id}`, color: "transparent", offset: 0 },
          { id: `topo-${s}-${r}-s2-${id}`, color: "transparent", offset: 93 },
          { id: `topo-${s}-${r}-s3-${id}`, color: ringColor, offset: 96 },
          { id: `topo-${s}-${r}-s4-${id}`, color: "transparent", offset: 100 },
        ],
      });
    }
  }

  return makePreset(id, name, "Topo", theme, isNew, palette[0], layers);
}

// ============================================================================
// Bauhaus
// ============================================================================

export function generateBauhausPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][],
  presetIndex?: number
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette, presetIndex);
  const variant = variantOf(presetIndex, 4);

  const baseColor = palette[0];

  const layers: Layer[] = [
    {
      id: `layer-bauhaus-bg-${id}`,
      name: "Bauhaus Background",
      type: LayerType.GRADIENT,
      visible: true,
      opacity: 1,
      blendMode: "normal",
      gradientType: "linear",
      angle: 0,
      stops: [
        { id: `bauhaus-bg-s1-${id}`, color: baseColor, offset: 0 },
        { id: `bauhaus-bg-s2-${id}`, color: baseColor, offset: 100 },
      ],
    },
  ];

  // RNG used only for layout jitter; main composition is deterministic.
  void rng;

  switch (variant) {
    case 0:
      layers.push({
        id: `layer-bauhaus-circle-${id}`,
        name: "Bauhaus Circle",
        type: LayerType.BLOB,
        visible: true,
        opacity: 0.95,
        blendMode: "normal",
        color: palette[1] ?? palette[2],
        seed: 42,
        points: 32,
        chaos: 0.02,
        x: 0.35,
        y: 0.4,
        scale: 0.6,
      });
      layers.push({
        id: `layer-bauhaus-dot-${id}`,
        name: "Bauhaus Dot",
        type: LayerType.BLOB,
        visible: true,
        opacity: 1,
        blendMode: "normal",
        color: palette[3] ?? palette[2],
        seed: 7,
        points: 32,
        chaos: 0.02,
        x: 0.72,
        y: 0.62,
        scale: 0.3,
      });
      break;
    case 1:
      layers.push({
        id: `layer-bauhaus-c1-${id}`,
        name: "Circle Left",
        type: LayerType.BLOB,
        visible: true,
        opacity: 1,
        blendMode: "normal",
        color: palette[1] ?? palette[2],
        seed: 11,
        points: 32,
        chaos: 0.02,
        x: 0.25,
        y: 0.5,
        scale: 0.55,
      });
      layers.push({
        id: `layer-bauhaus-c2-${id}`,
        name: "Circle Right",
        type: LayerType.BLOB,
        visible: true,
        opacity: 0.9,
        blendMode: theme === "dark" ? "screen" : "multiply",
        color: palette[3] ?? palette[2],
        seed: 21,
        points: 32,
        chaos: 0.02,
        x: 0.7,
        y: 0.5,
        scale: 0.55,
      });
      break;
    case 2: {
      const colors = [palette[1], palette[2], palette[3] ?? palette[2]];
      for (let i = 0; i < colors.length; i++) {
        layers.push({
          id: `layer-bauhaus-ring-${i}-${id}`,
          name: `Ring ${i + 1}`,
          type: LayerType.BLOB,
          visible: true,
          opacity: 1,
          blendMode: "normal",
          color: colors[i] ?? baseColor,
          seed: 30 + i,
          points: 32,
          chaos: 0.02,
          x: 0.5,
          y: 0.5,
          scale: 0.75 - i * 0.2,
        });
      }
      break;
    }
    case 3:
      layers.push({
        id: `layer-bauhaus-q1-${id}`,
        name: "Quadrant TL",
        type: LayerType.BLOB,
        visible: true,
        opacity: 1,
        blendMode: "normal",
        color: palette[1] ?? palette[2],
        seed: 5,
        points: 32,
        chaos: 0.02,
        x: 0.25,
        y: 0.25,
        scale: 0.5,
      });
      layers.push({
        id: `layer-bauhaus-q2-${id}`,
        name: "Quadrant BR",
        type: LayerType.BLOB,
        visible: true,
        opacity: 1,
        blendMode: "normal",
        color: palette[3] ?? palette[2],
        seed: 9,
        points: 32,
        chaos: 0.02,
        x: 0.75,
        y: 0.75,
        scale: 0.5,
      });
      break;
  }

  return makePreset(id, name, "Bauhaus", theme, isNew, palette[0], layers);
}
