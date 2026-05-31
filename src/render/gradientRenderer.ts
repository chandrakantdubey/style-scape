// render/gradientRenderer.ts
import type { GradientLayer, CanvasState } from '../state/types';
import { clamp, escapeSvgAttribute, formatNumber } from './svgUtils';

export function renderGradientLayer(layer: GradientLayer): string {
  if (!layer.visible) return '';

  const { id, gradientType, angle, stops, cx, cy, r, opacity, blendMode } = layer;
  const defId = `grad-${escapeSvgAttribute(id)}`;
  const safeStops = [...stops]
    .filter((stop) => stop.color)
    .sort((a, b) => a.offset - b.offset);

  const stopElements = (safeStops.length > 0 ? safeStops : [{ id: 'fallback', color: '#000000', offset: 0 }])
    .map(s => `<stop offset="${formatNumber(clamp(s.offset, 0, 100, 0))}%" stop-color="${escapeSvgAttribute(s.color)}" />`)
    .join('');

  let gradientElement;
  if (gradientType === 'radial') {
    const attrs = [`id="${defId}"`];
    attrs.push(`cx="${formatNumber(clamp(cx, 0, 100, 50))}%"`);
    attrs.push(`cy="${formatNumber(clamp(cy, 0, 100, 50))}%"`);
    attrs.push(`r="${formatNumber(clamp(r, 1, 160, 75))}%"`);
    gradientElement = `<radialGradient ${attrs.join(' ')}>${stopElements}</radialGradient>`;
  } else {
    const radians = (clamp(angle, -360, 360, 0) - 90) * (Math.PI / 180);
    const x = Math.cos(radians);
    const y = Math.sin(radians);
    const x1 = formatNumber(50 - x * 50);
    const y1 = formatNumber(50 - y * 50);
    const x2 = formatNumber(50 + x * 50);
    const y2 = formatNumber(50 + y * 50);
    gradientElement = `<linearGradient id="${defId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stopElements}</linearGradient>`;
  }

  return `
    <defs>${gradientElement}</defs>
    <g style="opacity: ${formatNumber(clamp(opacity, 0, 1, 1))}; mix-blend-mode: ${escapeSvgAttribute(blendMode || 'normal')};">
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
