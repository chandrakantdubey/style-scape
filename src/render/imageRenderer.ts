// render/imageRenderer.ts
import type { ImageLayer, CanvasState } from '../state/types';
import { clamp, escapeSvgAttribute, formatNumber } from './svgUtils';

export function renderImageLayer(layer: ImageLayer, canvas: CanvasState): string {
  if (!layer.visible) return '';

  const { src, x, y, width, height, opacity, blendMode } = layer;
  const safeWidth = clamp(width, 0.01, 4, 1);
  const safeHeight = clamp(height, 0.01, 4, 1);
  const actualWidth = canvas.width * safeWidth;
  const actualHeight = canvas.height * safeHeight;
  const actualX = canvas.width * clamp(x, -1, 2, 0.5) - actualWidth / 2;
  const actualY = canvas.height * clamp(y, -1, 2, 0.5) - actualHeight / 2;

  return `<g style="opacity: ${formatNumber(clamp(opacity, 0, 1, 1))}; mix-blend-mode: ${escapeSvgAttribute(blendMode || 'normal')};">
    <image href="${escapeSvgAttribute(src)}" x="${formatNumber(actualX)}" y="${formatNumber(actualY)}" width="${formatNumber(actualWidth)}" height="${formatNumber(actualHeight)}" preserveAspectRatio="xMidYMid slice" />
  </g>`;
}

export function renderImageSVG(layer: ImageLayer, canvas: CanvasState): string {
  const { width, height, background } = canvas;
  const imageContent = renderImageLayer(layer, canvas);

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${background}" />
      ${imageContent}
    </svg>
  `;
}
