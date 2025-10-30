import type {
  Preset,
  GradientLayer,
  BlobLayer,
  PatternLayer,
  WaveLayer,
  PresetTheme,
  ImageLayer,
} from "../state/types";
import { LayerType } from "../state/types";
import seedrandom from "seedrandom";

const PALETTES = {
  colored: [
    ["#6dd5ed", "#2193b0"], // Cool Blue
    ["#a1c4fd", "#c2e9fb"], // Light Sky Blue
    ["#d4fc79", "#96e6a1"], // Soft Green
    ["#89f7fe", "#66a6ff"], // Cyan to Blue
    ["#a8edea", "#fed6e3"], // Pastel Teal to Pink
    ["#e0c3fc", "#8ec5fc"], // Lavender to Blue
    ["#4facfe", "#00f2fe"], // Vibrant but Cool Blue
    ["#5ee7df", "#b490ca"], // Teal to Purple
    ["#84fab0", "#8fd3f4"], // Green to Blue
    ["#d299c2", "#fef9d7"], // Soft Lilac to Cream
    ["#764ba2", "#667eea"], // Purple to Blue
    ["#00c3ff", "#ffff1c"], // Blue to Yellow (subtle)
  ],
  light: [
    ["#e0e7ff", "#c7d2fe"], // Periwinkle
    ["#d1fae5", "#a7f3d0"], // Mint Green
    ["#f0f9ff", "#e0f2fe"], // Sky Blue
    ["#f5f3ff", "#ede9fe"], // Lavender
    ["#E6E9F0", "#EEF1F5"], // Light Grey
    ["#d4e9e2", "#eaf6f6"], // Seafoam Green
    ["#f3e7e9", "#e3eeff"], // Pale Pink to Blue
  ],
  dark: [
    ["#1e293b", "#0f172a"], // Slate
    ["#1f2937", "#374151"], // Cool Grey
    ["#1e1b4b", "#312e81"], // Indigo
    ["#030712", "#111827"], // Very Dark Blue/Black
    ["#164e63", "#083344"], // Dark Cyan
    ["#0b192f", "#172a45"], // Navy
    ["#22223b", "#4a4e69"], // Dark Purple/Grey
    ["#2c3e50", "#4ca1af"], // Charcoal to Teal
  ],
  metallic: [
    ["#B0B0B0", "#E0E0E0", "#606060"], // Silver
    ["#FFD700", "#FFFDE4", "#A67C00"], // Gold
    ["#B87333", "#F8DAB4", "#6B421A"], // Bronze
    ["#E5E4E2", "#FFFFFF", "#737271"], // Platinum
    ["#6A7B8D", "#D0D5D9", "#3E4A57"], // Steel
  ],
};

function random(rng: () => number, min: number, max: number) {
  return rng() * (max - min) + min;
}

const getCanvasBg = (theme: PresetTheme) =>
  ({ light: "#f8fafc", dark: "#020617", colored: "#ffffff" }[theme]);

export const generateGradientPreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string
): Preset => {
  const rng = seedrandom(seed);
  // const palette = PALETTES[theme][Math.floor(rng() * PALETTES[theme].length)];
  const gradientType = rng() > 0.6 ? "radial" : "linear";
  const numStops = Math.floor(random(rng, 2, 6));

  const stops = Array.from({ length: numStops }, (_, i) => ({
    id: `s${i + 1}`,
    color:
      PALETTES[theme][Math.floor(rng() * PALETTES[theme].length)][
        Math.floor(rng() * 2)
      ],
    offset: i * (100 / (numStops - 1)),
  })).sort((a, b) => a.offset - b.offset);

  const layer: GradientLayer = {
    id: `layer-${id}`,
    name: "Generated Gradient",
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: "normal",
    gradientType,
    angle: Math.floor(rng() * 360),
    stops,
  };

  return {
    id,
    name,
    category: "Gradients",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: getCanvasBg(theme) },
    layers: [layer],
  };
};

export const generateBlobPreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string
): Preset => {
  const rng = seedrandom(seed);
  const palette = PALETTES[theme][Math.floor(rng() * PALETTES[theme].length)];
  const numBlobs = Math.floor(random(rng, 2, 5)); // Generate 2 to 4 blobs

  const bgLayer: GradientLayer = {
    id: `layer-bg-${id}`,
    name: "Background",
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: "normal",
    gradientType: rng() > 0.5 ? "radial" : "linear",
    angle: random(rng, 0, 360),
    stops: [
      {
        id: "s1",
        color: palette[0] + (theme === "dark" ? "66" : "33"),
        offset: 0,
      },
      {
        id: "s2",
        color: palette[1] + (theme === "dark" ? "33" : "11"),
        offset: 100,
      },
    ],
  };

  const blendModes =
    theme === "dark"
      ? ["lighten", "screen", "color-dodge"]
      : ["overlay", "soft-light", "multiply"];

  const blobLayers = Array.from({ length: numBlobs }, (_, i): BlobLayer => {
    const currentPalette =
      PALETTES[theme][Math.floor(rng() * PALETTES[theme].length)];
    return {
      id: `layer-blob${i}-${id}`,
      name: `Blob ${i + 1}`,
      type: LayerType.BLOB,
      visible: true,
      opacity: random(rng, 0.5, 0.9),
      blendMode: blendModes[Math.floor(rng() * blendModes.length)],
      color: currentPalette[i % 2],
      seed: random(rng, 1, 1000),
      points: Math.floor(random(rng, 5, 12)),
      chaos: random(rng, 0.2, 0.9),
      x: random(rng, 0.2, 0.8),
      y: random(rng, 0.2, 0.8),
      scale: random(rng, 0.4, 1.1),
    };
  });

  return {
    id,
    name,
    category: "Decorative",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: getCanvasBg(theme) },
    layers: [...blobLayers, bgLayer],
  };
};

export const generatePatternPreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string
): Preset => {
  const rng = seedrandom(seed);
  const palette = PALETTES[theme][Math.floor(rng() * PALETTES[theme].length)];
  const types: PatternLayer["patternType"][] = [
    "dots",
    "lines",
    "squares",
    "triangles",
    "hexagons",
    "chevrons",
    "crosses",
  ];

  const layer: PatternLayer = {
    id: `layer-${id}`,
    name: "Generated Pattern",
    type: LayerType.PATTERN,
    visible: true,
    opacity: random(rng, 0.1, 0.4),
    blendMode: theme === "dark" ? "soft-light" : "multiply",
    patternType: types[Math.floor(rng() * types.length)],
    backgroundColor: theme === "colored" ? palette[0] + "1A" : palette[0],
    foregroundColor: palette[1],
    scale: Math.floor(random(rng, 10, 60)),
    angle: [0, 30, 45, 60, 90][Math.floor(rng() * 5)],
  };

  return {
    id,
    name,
    category: "Geometric",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: layer.backgroundColor },
    layers: [layer],
  };
};

export const generateMinimalistPreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string
): Preset => {
  const rng = seedrandom(seed);
  const palette = PALETTES[theme][Math.floor(rng() * PALETTES[theme].length)];
  const types: PatternLayer["patternType"][] = ["dots", "lines"];

  const layer: PatternLayer = {
    id: `layer-${id}`,
    name: "Minimalist Pattern",
    type: LayerType.PATTERN,
    visible: true,
    opacity: random(rng, 0.05, 0.15),
    blendMode: theme === "dark" ? "soft-light" : "multiply",
    patternType: types[Math.floor(rng() * types.length)],
    backgroundColor: "transparent",
    foregroundColor: theme === "dark" ? "#ffffff" : "#000000",
    scale: Math.floor(random(rng, 30, 80)),
    angle: [0, 45, 90][Math.floor(rng() * 3)],
  };

  const bgLayer: GradientLayer = {
    id: `layer-bg-${id}`,
    name: "Background",
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: "normal",
    gradientType: "radial",
    angle: 0,
    stops: [
      { id: "s1", color: palette[0], offset: 0 },
      { id: "s2", color: palette[1], offset: 100 },
    ],
  };

  return {
    id,
    name,
    category: "Minimalist",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: palette[0] },
    layers: [layer, bgLayer],
  };
};

export const generateWavePreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string
): Preset => {
  const rng = seedrandom(seed);
  const palette = PALETTES[theme][Math.floor(rng() * PALETTES[theme].length)];

  const bgLayer: GradientLayer = {
    id: `layer-bg-${id}`,
    name: "Background",
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: "normal",
    gradientType: "linear",
    angle: random(rng, 0, 360),
    stops: [
      { id: "s1", color: palette[0], offset: 0 },
      { id: "s2", color: palette[1], offset: 100 },
    ],
  };

  const waveColor = theme === "dark" ? "#ffffff" : "#000000";
  const blendModes =
    theme === "dark" ? ["overlay", "soft-light"] : ["soft-light", "multiply"];
  const numLayers = Math.floor(random(rng, 1, 5));

  const layers = Array.from(
    { length: numLayers },
    (_, i): WaveLayer => ({
      id: `layer-wave${i}-${id}`,
      name: `Wave ${i + 1}`,
      type: LayerType.WAVE,
      visible: true,
      opacity: random(rng, 0.05, 0.2),
      blendMode: blendModes[Math.floor(rng() * blendModes.length)],
      color: waveColor,
      seed: random(rng, 1, 1000),
      points: Math.floor(random(rng, 5, 20)),
      wavelength: random(rng, 80, 400),
      amplitude: random(rng, 30, 90),
      y: random(rng, 0.3, 0.7),
      angle: [0, 30, 45, 60, 90, 120, 135][Math.floor(rng() * 7)],
    })
  );

  return {
    id,
    name,
    category: "Waves",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: "#111827" },
    layers: [...layers, bgLayer],
  };
};

export const generateAbstractPreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string
): Preset => {
  const rng = seedrandom(seed);
  const numLayers = Math.floor(random(rng, 3, 6));
  const themePalettes = PALETTES[theme];
  const blendModes = [
    "screen",
    "lighten",
    "color-dodge",
    "overlay",
    "soft-light",
    "multiply",
    "difference",
  ];

  const layers = Array.from({ length: numLayers }, (_, i) => {
    const palette = themePalettes[Math.floor(rng() * themePalettes.length)];

    if (rng() > 0.4) {
      // 60% chance for a blob
      const blob: BlobLayer = {
        id: `layer-abs-${id}-${i}`,
        name: `Abstract Blob ${i}`,
        type: LayerType.BLOB,
        visible: true,
        opacity: random(rng, 0.4, 0.9),
        blendMode: blendModes[Math.floor(rng() * blendModes.length)],
        color: palette[Math.floor(rng() * 2)],
        seed: random(rng, 1, 1000),
        points: Math.floor(random(rng, 3, 8)),
        chaos: random(rng, 0.5, 1.2),
        x: random(rng, 0, 1),
        y: random(rng, 0, 1),
        scale: random(rng, 0.4, 1.2),
      };
      return blob;
    } else {
      // 40% chance for a wave
      const wave: WaveLayer = {
        id: `layer-abs-${id}-${i}`,
        name: `Abstract Wave ${i}`,
        type: LayerType.WAVE,
        visible: true,
        opacity: random(rng, 0.3, 0.7),
        blendMode: blendModes[Math.floor(rng() * blendModes.length)],
        color: palette[Math.floor(rng() * 2)],
        seed: random(rng, 1, 1000),
        points: Math.floor(random(rng, 5, 15)),
        wavelength: random(rng, 100, 500),
        amplitude: random(rng, 40, 100),
        y: random(rng, 0.2, 0.8),
        angle: random(rng, 0, 180),
      };
      return wave;
    }
  });

  const bgPalette = themePalettes[Math.floor(rng() * themePalettes.length)];
  return {
    id,
    name,
    category: "Abstract",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: bgPalette[0] },
    layers: layers.reverse(),
  };
};

export const generateMetallicPreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string
): Preset => {
  const rng = seedrandom(seed);
  const palette =
    PALETTES.metallic[Math.floor(rng() * PALETTES.metallic.length)];

  const bgLayer: GradientLayer = {
    id: `layer-bg-${id}`,
    name: "Background",
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: "normal",
    gradientType: "radial",
    angle: 0,
    stops: [
      { id: "s1", color: theme === "light" ? "#E5E5E5" : "#18181b", offset: 0 },
      {
        id: "s2",
        color: theme === "light" ? "#D4D4D8" : "#09090b",
        offset: 100,
      },
    ],
  };

  // Choose sheen type
  const sheenType = random(rng, 0, 1);
  let sheenLayer: GradientLayer;

  if (sheenType < 0.4) {
    // Linear
    sheenLayer = {
      id: `layer-sheen-${id}`,
      name: "Sheen",
      type: LayerType.GRADIENT,
      visible: true,
      opacity: theme === "light" ? 0.7 : 0.5,
      blendMode: "overlay",
      gradientType: "linear",
      angle: random(rng, 0, 360),
      stops: [
        { id: "s1", color: palette[1] + "ff", offset: 0 },
        { id: "s2", color: palette[0] + "80", offset: 40 },
        { id: "s3", color: palette[2] + "99", offset: 60 },
        { id: "s4", color: palette[1] + "ff", offset: 100 },
      ],
    };
  } else if (sheenType < 0.8) {
    // Off-center Radial (simulates conical/spotlight)
    sheenLayer = {
      id: `layer-sheen-${id}`,
      name: "Sheen",
      type: LayerType.GRADIENT,
      visible: true,
      opacity: theme === "light" ? 0.8 : 0.6,
      blendMode: "soft-light",
      gradientType: "radial",
      angle: 0,
      cx: random(rng, 20, 80),
      cy: random(rng, 20, 80),
      r: random(rng, 60, 90),
      stops: [
        { id: "s1", color: palette[1] + "ff", offset: 0 },
        { id: "s2", color: palette[0] + "cc", offset: 35 },
        { id: "s3", color: palette[2] + "80", offset: 70 },
        { id: "s4", color: palette[2] + "00", offset: 100 },
      ],
    };
  } else {
    // Centered Circular
    sheenLayer = {
      id: `layer-sheen-${id}`,
      name: "Sheen",
      type: LayerType.GRADIENT,
      visible: true,
      opacity: theme === "light" ? 0.5 : 0.3,
      blendMode: "overlay",
      gradientType: "radial",
      angle: 0,
      stops: [
        { id: "s1", color: palette[2] + "cc", offset: 0 },
        { id: "s2", color: palette[0] + "80", offset: 50 },
        { id: "s3", color: palette[1] + "cc", offset: 100 },
      ],
    };
  }

  return {
    id,
    name,
    category: "Metallic",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: "#111827" },
    layers: [sheenLayer, bgLayer],
  };
};

export const generateGridPreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string
): Preset => {
  const rng = seedrandom(seed);
  const palette = PALETTES[theme][Math.floor(rng() * PALETTES[theme].length)];

  const gridColor =
    theme === "colored"
      ? palette[1]
      : theme === "light"
      ? "#d1d5db"
      : "#4b5563";
  const bgColorStart =
    theme === "colored"
      ? palette[0]
      : theme === "light"
      ? "#f9fafb"
      : "#1f2937";
  const bgColorEnd =
    theme === "colored"
      ? palette[1]
      : theme === "light"
      ? "#e5e7eb"
      : "#111827";

  const spacing = 16;
  const thickness = random(rng, 0.5, 1.25); // This is now the radius of the dot

  const regions = [
    { x: 0, y: 0, w: 1, h: 1 }, // full
    { x: 0, y: 0, w: 0.33, h: 1 }, // left third
    { x: 0.67, y: 0, w: 0.33, h: 1 }, // right third
    { x: 0, y: 0, w: 1, h: 0.33 }, // top third
    { x: 0, y: 0.67, w: 1, h: 0.33 }, // bottom third
    { x: 0.25, y: 0, w: 0.5, h: 1 }, // center vertical
    { x: 0, y: 0.25, w: 1, h: 0.5 }, // center horizontal
  ];
  const region = regions[Math.floor(rng() * regions.length)];
  const canvasSize = 500;

  const patternId = `p-${id}`;
  const maskId = `m-${id}`;
  const gradId = `g-${id}`;

  const gradCX = (region.x + region.w / 2) * 100;
  const gradCY = (region.y + region.h / 2) * 100;
  const gradR = Math.max(region.w, region.h) * 50 + random(rng, 15, 25);

  const patternSvg = `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${spacing}" height="${spacing}">
            <circle cx="${spacing / 2}" cy="${
    spacing / 2
  }" r="${thickness}" fill="${gridColor}" fill-opacity="${random(
    rng,
    0.2,
    0.5
  )}" />
        </pattern>
    `;

  const maskSvg = `
        <radialGradient id="${gradId}" cx="${gradCX}%" cy="${gradCY}%" r="${gradR}%">
            <stop offset="${random(
              rng,
              20,
              50
            )}%" stop-color="white" stop-opacity="1" />
            <stop offset="100%" stop-color="white" stop-opacity="0" />
        </radialGradient>
        <mask id="${maskId}">
            <rect x="0" y="0" width="${canvasSize}" height="${canvasSize}" fill="url(#${gradId})" />
        </mask>
    `;

  const imageSvgString = `
        <svg width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                ${patternSvg}
                ${maskSvg}
            </defs>
            <rect 
                x="0" 
                y="0" 
                width="${canvasSize}" 
                height="${canvasSize}" 
                fill="url(#${patternId})"
                mask="url(#${maskId})"
            />
        </svg>
    `;

  const dataUri = `data:image/svg+xml;base64,${btoa(
    unescape(encodeURIComponent(imageSvgString))
  )}`;

  const imageLayer: ImageLayer = {
    id: `layer-grid-${id}`,
    name: "Grid",
    type: LayerType.IMAGE,
    visible: true,
    opacity: 1,
    blendMode: "normal",
    src: dataUri,
    x: 0.5,
    y: 0.5,
    width: 1,
    height: 1,
  };

  const bgLayer: GradientLayer = {
    id: `layer-bg-${id}`,
    name: "Background",
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: "normal",
    gradientType: rng() > 0.4 ? "radial" : "linear",
    angle: random(rng, 0, 360),
    stops: [
      { id: "s1", color: bgColorStart, offset: 0 },
      { id: "s2", color: bgColorEnd, offset: 100 },
    ],
  };

  return {
    id,
    name,
    category: "Grid",
    theme,
    isNew,
    canvas: { width: canvasSize, height: canvasSize, background: bgColorStart },
    layers: [imageLayer, bgLayer],
  };
};
