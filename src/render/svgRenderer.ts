
import type { AppState, Layer, GradientLayer, BlobLayer, WaveLayer, PatternLayer, ImageLayer } from '../state/types';
import { generateBlobPath } from './blobGenerator';
import { generateWavePath } from './waveGenerator';
import { generatePatternDef } from './patternGenerator';

function renderGradient(layer: GradientLayer): string {
  const { id, gradientType, angle, stops } = layer;
  const defId = `grad-${id}`;
  
  const stopElements = stops
    .map(s => `<stop offset="${s.offset}%" stop-color="${s.color}" />`)
    .join('');

  let gradientElement;
  if (gradientType === 'radial') {
    gradientElement = `<radialGradient id="${defId}">${stopElements}</radialGradient>`;
  } else {
    gradientElement = `<linearGradient id="${defId}" x1="0%" y1="0%" x2="0%" y2="100%" gradientTransform="rotate(${angle} 0.5 0.5)">${stopElements}</linearGradient>`;
  }

  return `
    <defs>${gradientElement}</defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#${defId})" />
  `;
}

function renderBlob(layer: BlobLayer, canvas: AppState['canvas']): string {
    const size = Math.min(canvas.width, canvas.height) * layer.scale;
    const path = generateBlobPath(layer.seed, layer.points, layer.chaos, size);
    const xPos = canvas.width * layer.x - size / 2;
    const yPos = canvas.height * layer.y - size / 2;
    return `<g transform="translate(${xPos} ${yPos})"><path d="${path}" fill="${layer.color}" /></g>`;
}

function renderWave(layer: WaveLayer, canvas: AppState['canvas']): string {
    const { width } = canvas;
    const height = canvas.height * layer.wavelength;
    const path = generateWavePath(layer.seed, width, height, layer.points, layer.wavelength, layer.amplitude);
    const yPos = canvas.height * layer.y - height / 2;
    return `<g transform="translate(0 ${yPos})"><path d="${path}" fill="${layer.color}" /></g>`;
}

function renderPattern(layer: PatternLayer): string {
    return `<rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-${layer.id})" />`;
}

function renderImage(layer: ImageLayer, canvas: AppState['canvas']): string {
    const { src, x, y, width, height } = layer;
    const actualWidth = canvas.width * width;
    const actualHeight = canvas.height * height;
    const actualX = canvas.width * x - actualWidth / 2;
    const actualY = canvas.height * y - actualHeight / 2;
    return `<image href="${src}" x="${actualX}" y="${actualY}" width="${actualWidth}" height="${actualHeight}" preserveAspectRatio="xMidYMid slice" />`;
}

function renderLayer(layer: Layer, canvas: AppState['canvas']): string {
  if (!layer.visible) return '';

  let content = '';
  switch (layer.type) {
    case 'gradient': content = renderGradient(layer); break;
    case 'blob': content = renderBlob(layer, canvas); break;
    case 'wave': content = renderWave(layer, canvas); break;
    case 'pattern': content = renderPattern(layer); break;
    case 'image': content = renderImage(layer, canvas); break;
  }
  
  return `<g style="opacity: ${layer.opacity}; mix-blend-mode: ${layer.blendMode};">${content}</g>`;
}

export function renderSVG(state: AppState): string {
  const { layers, canvas } = state;
  const { width, height, background } = canvas;
  
  const patternDefs = layers
    .filter((l): l is PatternLayer => l.type === 'pattern' && l.visible)
    .map(generatePatternDef)
    .join('');

  // Render layers in reverse order for correct stacking (CSS-like)
  const layerContents = [...layers].reverse().map(l => renderLayer(l, canvas)).join('');

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>${patternDefs}</defs>
      <rect width="100%" height="100%" fill="${background}" />
      ${layerContents}
    </svg>
  `;
}
