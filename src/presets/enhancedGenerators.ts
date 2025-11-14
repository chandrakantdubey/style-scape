// presets/enhancedGenerators.ts - FIXED AND WORKING VERSION
import type {
  Preset,
  PresetTheme,
  ImageLayer,
  GradientLayer,
} from "../state/types";
import { LayerType } from "../state/types";
import seedrandom from "seedrandom";

function random(rng: () => number, min: number, max: number) {
  return rng() * (max - min) + min;
}

// NOISE/TEXTURE PATTERN - FIXED
export const generateNoisePreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  _customPalette?: string[][]
): Preset => {
  const rng = seedrandom(seed);
  const size = 500;

  // Generate noise pattern using canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    // Fallback if canvas is not available - return gradient instead
    const bgColor1 = theme === "dark" ? "#1a1a1a" : "#f5f5f5";
    const bgColor2 = theme === "dark" ? "#2a2a2a" : "#e5e5e5";

    const gradientLayer: GradientLayer = {
      id: `layer-noise-fallback-${id}`,
      name: "Texture",
      type: LayerType.GRADIENT,
      visible: true,
      opacity: 1,
      blendMode: "normal",
      gradientType: "radial",
      angle: 0,
      stops: [
        { id: "s1", color: bgColor1, offset: 0 },
        { id: "s2", color: bgColor2, offset: 100 },
      ],
      cx: 50,
      cy: 50,
      r: 80,
    };

    return {
      id,
      name,
      category: "Texture",
      theme,
      isNew,
      canvas: { width: size, height: size, background: bgColor1 },
      layers: [gradientLayer],
    };
  }

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  const scale = random(rng, 15, 40);
  const baseColor = theme === "dark" ? 30 : 220;
  const noiseIntensity = random(rng, 0.1, 0.3);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const noise =
        Math.abs(
          Math.sin(x / scale + rng() * 2) * Math.cos(y / scale + rng() * 2)
        ) * 255;

      const value =
        baseColor +
        (theme === "dark" ? noise * noiseIntensity : -noise * noiseIntensity);
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255 * random(rng, 0.1, 0.2);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const dataUri = canvas.toDataURL("image/png");

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

  const bgColor = theme === "dark" ? "#0f0f0f" : "#fafafa";

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

// PARTICLE SYSTEM - FIXED
export const generateParticlePreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  _customPalette?: string[][]
): Preset => {
  const rng = seedrandom(seed);
  const numParticles = Math.floor(random(rng, 40, 100));
  const colors =
    theme === "dark"
      ? ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"]
      : ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b"];

  const particles = Array.from({ length: numParticles }, () => {
    const x = random(rng, 0, 100);
    const y = random(rng, 0, 100);
    const r = random(rng, 0.5, 2);
    const color = colors[Math.floor(rng() * colors.length)];
    const opacity = random(rng, 0.4, 0.9);
    return `<circle cx="${x}%" cy="${y}%" r="${r}%" fill="${color}" opacity="${opacity}"/>`;
  }).join("");

  const svgString = `<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">${particles}</svg>`;
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
    category: "Particles",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: bgColor },
    layers: [imageLayer],
  };
};

// MESH GRADIENTS - FIXED
export const generateMeshPreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  _customPalette?: string[][]
): Preset => {
  const rng = seedrandom(seed);

  const colorPalettes = {
    colored: [
      ["#667eea", "#764ba2", "#f093fb", "#f5576c"],
      ["#4facfe", "#00f2fe", "#43e97b", "#38f9d7"],
      ["#fa709a", "#fee140", "#30cfd0", "#330867"],
    ],
    dark: [
      ["#1e293b", "#334155", "#475569", "#64748b"],
      ["#1e1b4b", "#312e81", "#4c1d95", "#6b21a8"],
      ["#134e4a", "#115e59", "#0f766e", "#0d9488"],
    ],
    light: [
      ["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa"],
      ["#fce7f3", "#fbcfe8", "#f9a8d4", "#f472b6"],
      ["#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399"],
    ],
  };

  const colors =
    colorPalettes[theme][Math.floor(rng() * colorPalettes[theme].length)];
  const numPoints = Math.floor(random(rng, 4, 6));

  const points = Array.from({ length: numPoints }, (_, i) => ({
    cx: random(rng, 10, 90),
    cy: random(rng, 10, 90),
    r: random(rng, 40, 70),
    color: colors[i % colors.length],
  }));

  const gradients = points
    .map(
      (p, i) => `
        <radialGradient id="mesh-${id}-${i}" cx="${p.cx}%" cy="${p.cy}%" r="${p.r}%">
            <stop offset="0%" stop-color="${p.color}" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="${p.color}" stop-opacity="0"/>
        </radialGradient>
    `
    )
    .join("");

  const circles = points
    .map(
      (p, i) =>
        `<circle cx="${p.cx}%" cy="${p.cy}%" r="${p.r}%" fill="url(#mesh-${id}-${i})"/>`
    )
    .join("");

  const svgString = `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
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
    category: "Mesh",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: colors[0] },
    layers: [imageLayer],
  };
};

// STRIPED PATTERNS - FIXED
export const generateStripedPreset = (
  id: string,
  name: string,
  theme: PresetTheme,
  isNew: boolean,
  seed: string,
  _customPalette?: string[][]
): Preset => {
  const rng = seedrandom(seed);
  const numStripes = Math.floor(random(rng, 6, 15));
  const angle = [0, 45, 90, 135, 180][Math.floor(rng() * 5)];

  const colorSets = {
    dark: [
      ["#1e293b", "#334155", "#475569"],
      ["#1e1b4b", "#312e81", "#4c1d95"],
      ["#134e4a", "#115e59", "#0f766e"],
    ],
    light: [
      ["#f1f5f9", "#e2e8f0", "#cbd5e1"],
      ["#fce7f3", "#fbcfe8", "#f9a8d4"],
      ["#d1fae5", "#a7f3d0", "#6ee7b7"],
    ],
    colored: [
      ["#667eea", "#764ba2", "#f093fb"],
      ["#4facfe", "#00f2fe", "#43e97b"],
      ["#fa709a", "#fee140", "#30cfd0"],
    ],
  };

  const colors = colorSets[theme][Math.floor(rng() * colorSets[theme].length)];
  const stripeWidth = 500 / numStripes;

  const patternContent = Array.from({ length: numStripes }, (_, i) => {
    const color = colors[i % colors.length];
    return `<rect x="${
      i * stripeWidth
    }" y="0" width="${stripeWidth}" height="500" fill="${color}"/>`;
  }).join("");

  const svgString = `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(${angle} 250 250)">${patternContent}</g>
    </svg>`;

  const dataUri = `data:image/svg+xml;base64,${btoa(
    unescape(encodeURIComponent(svgString))
  )}`;

  const imageLayer: ImageLayer = {
    id: `layer-striped-${id}`,
    name: "Stripes",
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
    category: "Stripe",
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: colors[0] },
    layers: [imageLayer],
  };
};

console.log("✅ Enhanced generators loaded successfully");
