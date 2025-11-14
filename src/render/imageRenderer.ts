// render/imageRenderer.ts
import type { ImageLayer, CanvasState } from '../state/types';

export function renderImageLayer(layer: ImageLayer, canvas: CanvasState): string {
  if (!layer.visible) return '';

  const { src, x, y, width, height, opacity, blendMode } = layer;
  const actualWidth = canvas.width * width;
  const actualHeight = canvas.height * height;
  const actualX = canvas.width * x - actualWidth / 2;
  const actualY = canvas.height * y - actualHeight / 2;

  return `<g style="opacity: ${opacity}; mix-blend-mode: ${blendMode};">
    <image href="${src}" x="${actualX}" y="${actualY}" width="${actualWidth}" height="${actualHeight}" preserveAspectRatio="xMidYMid slice" />
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
