/**
 * SVG renderer.
 *
 * Pure, deterministic: same `AppState` always produces the same SVG
 * string. No `Date`, no `Math.random`, no DOM access. This lets the
 * curated catalog be bootstrapped at build time and lets user-generated
 * presets reproduce across sessions.
 */

import type {
  AppState,
  Layer,
  GradientLayer,
  BlobLayer,
  WaveLayer,
  PatternLayer,
  ImageLayer,
} from "../state/types";
import { generateBlobPath } from "./blobGenerator";
import { generateWavePath } from "./waveGenerator";
import { generatePatternDef } from "./patternGenerator";
import { renderGradientLayer } from "./gradientRenderer";
import { renderImageLayer } from "./imageRenderer";
import { clamp, escapeSvgAttribute, formatNumber } from "./svgUtils";

function renderGradient(layer: GradientLayer): string {
  return renderGradientLayer(layer);
}

function renderBlob(layer: BlobLayer, canvas: AppState["canvas"]): string {
  const size =
    Math.min(canvas.width, canvas.height) * clamp(layer.scale, 0.01, 3, 0.5);
  const path = generateBlobPath(
    layer.seed,
    Math.round(clamp(layer.points, 3, 48, 8)),
    clamp(layer.chaos, 0, 2, 0.5),
    size
  );
  const xPos = canvas.width * clamp(layer.x, -1, 2, 0.5) - size / 2;
  const yPos = canvas.height * clamp(layer.y, -1, 2, 0.5) - size / 2;
  return `<g transform="translate(${formatNumber(xPos)} ${formatNumber(yPos)})"><path d="${path}" fill="${escapeSvgAttribute(layer.color)}" /></g>`;
}

function renderWave(layer: WaveLayer, canvas: AppState["canvas"]): string {
  const { width } = canvas;
  const wavelength = clamp(layer.wavelength, 20, canvas.width * 4, 150);
  const height =
    canvas.height *
    clamp(layer.wavelength / Math.max(canvas.width, 1), 0.1, 1.5, 0.5);
  const path = generateWavePath(
    layer.seed,
    width,
    height,
    Math.round(clamp(layer.points, 2, 80, 10)),
    wavelength,
    clamp(layer.amplitude, 0, canvas.height, 20),
    clamp(layer.angle ?? 0, -360, 360, 0)
  );
  const yPos = canvas.height * clamp(layer.y, -1, 2, 0.5) - height / 2;
  return `<g transform="translate(0 ${formatNumber(yPos)})"><path d="${path}" fill="${escapeSvgAttribute(layer.color)}" /></g>`;
}

function renderPattern(layer: PatternLayer): string {
  return `<rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-${escapeSvgAttribute(layer.id)})" />`;
}

function renderImage(layer: ImageLayer, canvas: AppState["canvas"]): string {
  return renderImageLayer(layer, canvas);
}

function renderLayer(layer: Layer, canvas: AppState["canvas"]): string {
  if (!layer.visible) return "";

  let content = "";
  switch (layer.type) {
    case "gradient":
      return renderGradient(layer);
    case "blob":
      content = renderBlob(layer, canvas);
      break;
    case "wave":
      content = renderWave(layer, canvas);
      break;
    case "pattern":
      content = renderPattern(layer);
      break;
    case "image":
      return renderImage(layer, canvas);
  }

  return `<g style="opacity: ${formatNumber(clamp(layer.opacity, 0, 1, 1))}; mix-blend-mode: ${escapeSvgAttribute(layer.blendMode || "normal")};">${content}</g>`;
}

export function renderSVG(state: AppState): string {
  const { layers, canvas } = state;
  const width = Math.round(clamp(canvas.width, 1, 8192, 500));
  const height = Math.round(clamp(canvas.height, 1, 8192, 500));
  const background = escapeSvgAttribute(canvas.background || "transparent");

  const patternDefs = layers
    .filter((l): l is PatternLayer => l.type === "pattern" && l.visible)
    .map(generatePatternDef)
    .join("");

  const layerContents = layers.map((l) => renderLayer(l, canvas)).join("");

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>${patternDefs}</defs>
      <rect width="100%" height="100%" fill="${background}" />
      ${layerContents}
    </svg>
  `;
}
