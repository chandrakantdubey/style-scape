import seedrandom from "seedrandom";
import type {
  BlobLayer,
  GradientLayer,
  Layer,
  PatternLayer,
  Preset,
  PresetCategory,
  PresetTheme,
  WaveLayer,
} from "../state/types";
import { LayerType } from "../state/types";

const palettes: Record<PresetTheme, string[][]> = {
  light: [
    ["#ffffff", "#e0f2fe", "#38bdf8"],
    ["#faf5ff", "#fbcfe8", "#8b5cf6"],
    ["#f8fafc", "#dcfce7", "#10b981"],
    ["#fff7ed", "#fed7aa", "#f97316"],
  ],
  dark: [
    ["#020617", "#1e1b4b", "#6366f1"],
    ["#030712", "#172554", "#0ea5e9"],
    ["#0f172a", "#134e4a", "#2dd4bf"],
    ["#111827", "#581c87", "#ec4899"],
  ],
  colored: [
    ["#667eea", "#764ba2", "#f093fb"],
    ["#4facfe", "#00f2fe", "#43e97b"],
    ["#fa709a", "#fee140", "#f97316"],
    ["#8b5cf6", "#06b6d4", "#10b981"],
  ],
};

function random(rng: () => number, min: number, max: number) {
  return rng() * (max - min) + min;
}

function pick<T>(rng: () => number, values: readonly T[]): T {
  return values[Math.floor(rng() * values.length)];
}

function getPalette(rng: () => number, theme: PresetTheme, customPalette?: string[][]) {
  const source = customPalette?.length ? customPalette : palettes[theme];
  return pick(rng, source);
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

function gradientLayer(
  id: string,
  name: string,
  colors: string[],
  theme: PresetTheme,
  rng: () => number,
  overrides: Partial<GradientLayer> = {}
): GradientLayer {
  const gradientType = overrides.gradientType ?? (rng() > 0.42 ? "linear" : "radial");

  return {
    id,
    name,
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: "normal",
    gradientType,
    angle: pick(rng, [20, 45, 90, 135, 210, 260, 315]),
    stops: [
      { id: `${id}-s1`, color: colors[0], offset: 0 },
      { id: `${id}-s2`, color: colors[1] ?? colors[0], offset: random(rng, 42, 68) },
      { id: `${id}-s3`, color: colors[2] ?? colors[1] ?? colors[0], offset: 100 },
    ],
    cx: random(rng, 28, 72),
    cy: random(rng, 28, 72),
    r: theme === "dark" ? random(rng, 78, 135) : random(rng, 58, 112),
    ...overrides,
  };
}

export function generateGradientPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][]
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette);
  const layers: Layer[] = [
    gradientLayer(`layer-gradient-base-${id}`, "Gradient Base", palette, theme, rng),
  ];

  if (rng() > 0.48) {
    layers.push(
      gradientLayer(`layer-gradient-light-${id}`, "Gradient Light", [...palette].reverse(), theme, rng, {
        opacity: random(rng, 0.25, 0.55),
        blendMode: theme === "dark" ? "screen" : "soft-light",
        gradientType: "radial",
      })
    );
  }

  return makePreset(id, name, "Gradients", theme, isNew, palette[0], layers);
}

export function generateWavePreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][]
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette);
  const layers: Layer[] = [
    gradientLayer(`layer-wave-bg-${id}`, "Wave Background", palette, theme, rng, {
      gradientType: "linear",
      angle: pick(rng, [90, 120, 150, 210, 270]),
    }),
  ];

  const waveCount = Math.floor(random(rng, 3, 6));
  for (let i = 0; i < waveCount; i++) {
    const wave: WaveLayer = {
      id: `layer-wave-${i}-${id}`,
      name: `Wave ${i + 1}`,
      type: LayerType.WAVE,
      visible: true,
      opacity: random(rng, 0.34, 0.76) / (i > 2 ? 1.45 : 1),
      blendMode: pick(rng, theme === "dark" ? ["screen", "soft-light", "overlay"] : ["multiply", "soft-light", "overlay"]),
      color: palette[i % palette.length],
      seed: random(rng, 1, 1000),
      points: Math.floor(random(rng, 7, 16)),
      wavelength: random(rng, 120, 360),
      amplitude: random(rng, 18, 82),
      y: random(rng, 0.12, 0.88),
      angle: random(rng, -14, 14),
    };
    layers.push(wave);
  }

  return makePreset(id, name, "Waves", theme, isNew, palette[0], layers);
}

export function generateGridPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][]
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette);
  const lineColor = theme === "dark" ? palette[2] ?? "#38bdf8" : palette[1] ?? "#64748b";
  const layers: Layer[] = [
    gradientLayer(`layer-grid-bg-${id}`, "Grid Background", palette, theme, rng, {
      gradientType: "linear",
      angle: pick(rng, [45, 90, 135]),
    }),
  ];

  const baseScale = random(rng, 18, 48);
  const majorScale = baseScale * pick(rng, [3, 4, 5]);
  const minorHorizontal: PatternLayer = {
    id: `layer-grid-minor-h-${id}`,
    name: "Minor Horizontal Grid",
    type: LayerType.PATTERN,
    visible: true,
    opacity: theme === "dark" ? 0.26 : 0.18,
    blendMode: theme === "dark" ? "screen" : "multiply",
    patternType: "lines",
    backgroundColor: "transparent",
    foregroundColor: lineColor,
    scale: baseScale,
    angle: 0,
  };
  const minorVertical: PatternLayer = {
    ...minorHorizontal,
    id: `layer-grid-minor-v-${id}`,
    name: "Minor Vertical Grid",
    angle: 90,
  };
  const majorHorizontal: PatternLayer = {
    ...minorHorizontal,
    id: `layer-grid-major-h-${id}`,
    name: "Major Horizontal Grid",
    opacity: theme === "dark" ? 0.42 : 0.28,
    foregroundColor: palette[2] ?? lineColor,
    scale: majorScale,
  };
  const majorVertical: PatternLayer = {
    ...majorHorizontal,
    id: `layer-grid-major-v-${id}`,
    name: "Major Vertical Grid",
    angle: 90,
  };

  layers.push(minorHorizontal, minorVertical, majorHorizontal, majorVertical);
  return makePreset(id, name, "Grid", theme, isNew, palette[0], layers);
}

export function generateGlassPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][]
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette);
  const layers: Layer[] = [
    gradientLayer(`layer-glass-bg-${id}`, "Glass Background", palette, theme, rng, {
      gradientType: "radial",
    }),
  ];

  for (let i = 0; i < 4; i++) {
    const blob: BlobLayer = {
      id: `layer-glass-panel-${i}-${id}`,
      name: `Glass Panel ${i + 1}`,
      type: LayerType.BLOB,
      visible: true,
      opacity: random(rng, 0.13, 0.3),
      blendMode: theme === "dark" ? "screen" : "soft-light",
      color: i % 2 === 0 ? "#ffffff" : palette[i % palette.length],
      seed: random(rng, 1, 1000),
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
    opacity: 0.32,
    blendMode: "soft-light",
    gradientType: "linear",
    angle: 135,
    stops: [
      { id: `sheen-1-${id}`, color: "#ffffff", offset: 0 },
      { id: `sheen-2-${id}`, color: palette[1] ?? "#ffffff", offset: 100 },
    ],
  });

  return makePreset(id, name, "Glassmorphism", theme, isNew, palette[0], layers);
}

export function generateAbstractPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][]
): Preset {
  const rng = seedrandom(seed);
  const palette = getPalette(rng, theme, customPalette);
  const layers: Layer[] = [
    gradientLayer(`layer-abstract-bg-${id}`, "Abstract Background", palette, theme, rng, {
      gradientType: "radial",
    }),
  ];

  const count = Math.floor(random(rng, 5, 9));
  for (let i = 0; i < count; i++) {
    if (rng() > 0.36) {
      const blob: BlobLayer = {
        id: `layer-abstract-blob-${i}-${id}`,
        name: `Abstract Blob ${i + 1}`,
        type: LayerType.BLOB,
        visible: true,
        opacity: random(rng, 0.22, 0.62),
        blendMode: pick(rng, theme === "dark" ? ["screen", "overlay", "soft-light"] : ["multiply", "overlay", "soft-light"]),
        color: palette[i % palette.length],
        seed: random(rng, 1, 1000),
        points: Math.floor(random(rng, 5, 13)),
        chaos: random(rng, 0.35, 1.25),
        x: random(rng, 0.08, 0.92),
        y: random(rng, 0.08, 0.92),
        scale: random(rng, 0.22, 1.08),
      };
      layers.push(blob);
    } else {
      const wave: WaveLayer = {
        id: `layer-abstract-wave-${i}-${id}`,
        name: `Abstract Stroke ${i + 1}`,
        type: LayerType.WAVE,
        visible: true,
        opacity: random(rng, 0.18, 0.42),
        blendMode: "overlay",
        color: palette[(i + 1) % palette.length],
        seed: random(rng, 1, 1000),
        points: Math.floor(random(rng, 5, 12)),
        wavelength: random(rng, 75, 210),
        amplitude: random(rng, 42, 115),
        y: random(rng, 0.12, 0.88),
        angle: random(rng, -38, 38),
      };
      layers.push(wave);
    }
  }

  return makePreset(id, name, "Abstract", theme, isNew, palette[0], layers);
}
