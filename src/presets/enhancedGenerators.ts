// presets/enhancedGenerators.ts
import type { Preset, PresetTheme, Layer, ImageLayer } from "../state/types";
import { LayerType } from "../state/types";
import seedrandom from "seedrandom";

function random(rng: () => number, min: number, max: number) {
  return rng() * (max - min) + min;
}

// ========== PERLIN NOISE PATTERN ==========
export const generateNoisePreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string
): Preset => {
  const rng = seedrandom(seed);
  const canvas = document.createElement("canvas");
  const size = 500;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return generateFallbackPreset(id, name, theme, isNew);
  }

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  const scale = random(rng, 20, 50);
  const baseColor = theme === "dark" ? 40 : 200;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const noise =
        Math.abs(Math.sin(x / scale + rng()) * Math.cos(y / scale + rng())) *
        255;
      const value = baseColor + (theme === "dark" ? noise * 0.3 : -noise * 0.3);
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255 * random(rng, 0.05, 0.15);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const dataUri = canvas.toDataURL();

  const imageLayer: ImageLayer = {
    id: `layer-noise-${id}`,
    name: "Noise Texture",
    type: LayerType.IMAGE,
    visible: true,
    opacity: 1,
    blendMode: "overlay",
    src: dataUri,
    x: 0.5,
    y: 0.5,
    width: 1,
    height: 1,
  };

  const bgColor = theme === "dark" ? "#0a0a0a" : "#f5f5f5";

  return {
    id,
    name,
    category: "Texture",
    theme,
    isNew,
    canvas: { width: size, height: size, background: bgColor },
    layers: [imageLayer],
  };
};

// Fallback for when canvas is not available
function generateFallbackPreset(
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean
): Preset {
  return {
    id,
    name,
    category: "Texture",
    theme,
    isNew,
    canvas: {
      width: 500,
      height: 500,
      background: theme === "dark" ? "#0a0a0a" : "#f5f5f5",
    },
    layers: [],
  };
}

// ========== STRIPED PATTERN ==========
export const generateStripedPreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][]
): Preset => {
  const rng = seedrandom(seed);
  const numStripes = Math.floor(random(rng, 5, 12));
  const angle = [0, 45, 90, 135][Math.floor(rng() * 4)];
  const colors =
    customPalette?.[0] ||
    (theme === "dark"
      ? ["#1e293b", "#334155", "#475569"]
      : ["#f1f5f9", "#e2e8f0", "#cbd5e1"]);

  const stripeWidth = 500 / numStripes;
  const patternContent = Array.from({ length: numStripes }, (_, i) => {
    const color = colors[i % colors.length];
    return `<rect x="${
      i * stripeWidth
    }" y="0" width="${stripeWidth}" height="500" fill="${color}"/>`;
  }).join("");

  const svgString = `<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(${angle} 250 250)">
            ${patternContent}
        </g>
    </svg>`;

  const dataUri = `data:image/svg+xml;base64,${btoa(
    unescape(encodeURIComponent(svgString))
  )}`;

  const imageLayer: ImageLayer = {
    id: `layer-striped-${id}`,
    name: "Stripes",
    type: LayerType.IMAGE,
    visible: true,
    opacity: random(rng, 0.7, 1),
    blendMode: "normal",
    src: dataUri,
    x: 0.5,
    y: 0.5,
    width: 1,
    height: 1,
  };

  return {
    id,
    name,
    category: "Geometric",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: colors[0] },
    layers: [imageLayer],
  };
};

// ========== PARTICLE SYSTEM ==========
export const generateParticlePreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][]
): Preset => {
  const rng = seedrandom(seed);
  const numParticles = Math.floor(random(rng, 30, 80));
  const colors =
    customPalette?.[0] ||
    (theme === "dark"
      ? ["#6366f1", "#8b5cf6", "#ec4899"]
      : ["#3b82f6", "#06b6d4", "#10b981"]);

  const particles = Array.from({ length: numParticles }, (_, i) => {
    const x = random(rng, 0, 100);
    const y = random(rng, 0, 100);
    const r = random(rng, 0.3, 1.5);
    const color = colors[Math.floor(rng() * colors.length)];
    const opacity = random(rng, 0.3, 0.8);

    return `<circle cx="${x}%" cy="${y}%" r="${r}%" fill="${color}" opacity="${opacity}"/>`;
  }).join("");

  const svgString = `<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        ${particles}
    </svg>`;

  const dataUri = `data:image/svg+xml;base64,${btoa(
    unescape(encodeURIComponent(svgString))
  )}`;

  const imageLayer: ImageLayer = {
    id: `layer-particles-${id}`,
    name: "Particles",
    type: LayerType.IMAGE,
    visible: true,
    opacity: 1,
    blendMode: "screen",
    src: dataUri,
    x: 0.5,
    y: 0.5,
    width: 1,
    height: 1,
  };

  const bgColor = theme === "dark" ? "#030712" : "#ffffff";

  return {
    id,
    name,
    category: "Abstract",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: bgColor },
    layers: [imageLayer],
  };
};

// ========== MESH GRADIENT ==========
export const generateMeshPreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  customPalette?: string[][]
): Preset => {
  const rng = seedrandom(seed);
  const colors =
    customPalette?.[0] ||
    (theme === "colored"
      ? ["#667eea", "#764ba2", "#f093fb", "#f5576c"]
      : theme === "dark"
      ? ["#1e293b", "#334155", "#475569"]
      : ["#dbeafe", "#bfdbfe", "#93c5fd"]);

  const numPoints = Math.floor(random(rng, 4, 7));
  const points = Array.from({ length: numPoints }, (_, i) => ({
    cx: random(rng, 20, 80),
    cy: random(rng, 20, 80),
    r: random(rng, 40, 70),
    color: colors[i % colors.length],
  }));

  const gradients = points
    .map(
      (p, i) => `
        <radialGradient id="mesh-${id}-${i}" cx="${p.cx}%" cy="${p.cy}%" r="${p.r}%">
            <stop offset="0%" stop-color="${p.color}" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="${p.color}" stop-opacity="0"/>
        </radialGradient>
    `
    )
    .join("");

  const circles = points
    .map(
      (p, i) => `
        <circle cx="${p.cx}%" cy="${p.cy}%" r="${p.r}%" fill="url(#mesh-${id}-${i})"/>
    `
    )
    .join("");

  const svgString = `<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <defs>${gradients}</defs>
        <rect width="100%" height="100%" fill="${colors[0]}"/>
        ${circles}
    </svg>`;

  const dataUri = `data:image/svg+xml;base64,${btoa(
    unescape(encodeURIComponent(svgString))
  )}`;

  const imageLayer: ImageLayer = {
    id: `layer-mesh-${id}`,
    name: "Mesh Gradient",
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

  return {
    id,
    name,
    category: "Gradients",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: colors[0] },
    layers: [imageLayer],
  };
};
