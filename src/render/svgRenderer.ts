
import type { AppState, Layer, GradientLayer, BlobLayer, WaveLayer, PatternLayer, ImageLayer } from '../state/types';
import { generateBlobPath } from './blobGenerator';
import { generateWavePath } from './waveGenerator';
import { generatePatternDef } from './patternGenerator';
import { renderGradientLayer } from './gradientRenderer';
import { renderImageLayer } from './imageRenderer';

function renderGradient(layer: GradientLayer): string {
  return renderGradientLayer(layer, { width: 100, height: 100, background: 'transparent' });
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
    const path = generateWavePath(layer.seed, width, height, layer.points, layer.wavelength, layer.amplitude, layer.angle ?? 0);
    const yPos = canvas.height * layer.y - height / 2;
    return `<g transform="translate(0 ${yPos})"><path d="${path}" fill="${layer.color}" /></g>`;
}

function renderPattern(layer: PatternLayer): string {
    return `<rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-${layer.id})" />`;
}

function renderImage(layer: ImageLayer, canvas: AppState['canvas']): string {
  return renderImageLayer(layer, canvas);
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