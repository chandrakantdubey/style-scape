// render/gradientRenderer.ts
import type { GradientLayer, CanvasState } from '../state/types';

export function renderGradientLayer(layer: GradientLayer): string {
  if (!layer.visible) return '';

  const { id, gradientType, angle, stops, cx, cy, r, opacity, blendMode } = layer;
  const defId = `grad-${id}`;

  const stopElements = stops
    .map(s => `<stop offset="${s.offset}%" stop-color="${s.color}" />`)
    .join('');

  let gradientElement;
  if (gradientType === 'radial') {
    const attrs = [`id="${defId}"`];
    if (cx !== undefined) attrs.push(`cx="${cx}%"`);
    if (cy !== undefined) attrs.push(`cy="${cy}%"`);
    if (r !== undefined) attrs.push(`r="${r}%"`);
    gradientElement = `<radialGradient ${attrs.join(' ')}>${stopElements}</radialGradient>`;
  } else {
    gradientElement = `<linearGradient id="${defId}" x1="0%" y1="0%" x2="0%" y2="100%" gradientTransform="rotate(${angle} 0.5 0.5)">${stopElements}</linearGradient>`;
  }

  return `
    <defs>${gradientElement}</defs>
    <g style="opacity: ${opacity}; mix-blend-mode: ${blendMode};">
      <rect x="0" y="0" width="100%" height="100%" fill="url(#${defId})" />
    </g>
  `;
}

export function renderGradientSVG(layer: GradientLayer, canvas: CanvasState): string {
  const { width, height, background } = canvas;
  const gradientContent = renderGradientLayer(layer);

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${background}" />
      ${gradientContent}
    </svg>
  `;
}
