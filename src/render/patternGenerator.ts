
import type { PatternLayer } from '../state/types';
import { clamp, escapeSvgAttribute, formatNumber } from './svgUtils';

export function generatePatternDef(layer: PatternLayer): string {
  const { id, patternType, scale, angle, foregroundColor, backgroundColor } = layer;
  const pId = `pattern-${escapeSvgAttribute(id)}`;

  let patternContent = '';
  const s = clamp(scale, 6, 240, 24);
  const safeAngle = clamp(angle, -360, 360, 0);
  const fg = escapeSvgAttribute(foregroundColor || '#000000');
  const bg = escapeSvgAttribute(backgroundColor || 'transparent');
  const half = formatNumber(s / 2);
  const quarter = formatNumber(s / 4);
  
  switch(patternType) {
    case 'dots':
      patternContent = `<circle cx="${half}" cy="${half}" r="${formatNumber(Math.min(s * 0.18, s / 4))}" fill="${fg}" />`;
      break;
    case 'lines':
      patternContent = `<path d="M 0,${half} l ${formatNumber(s)},0" stroke-width="1" stroke="${fg}" />`;
      break;
    case 'squares':
      patternContent = `<rect width="${half}" height="${half}" fill="${fg}" /><rect x="${half}" y="${half}" width="${half}" height="${half}" fill="${fg}" />`;
      break;
    case 'crosses':
        patternContent = `<path d="M ${quarter} ${half} H ${formatNumber(s * 0.75)} M ${half} ${quarter} V ${formatNumber(s * 0.75)}" stroke-width="1" stroke="${fg}" fill="none" stroke-linecap="round"/>`;
        break;
    case 'chevrons':
        patternContent = `<path d="M 0 ${half} L ${quarter} ${quarter} L ${half} ${half} L ${formatNumber(s * 0.75)} ${quarter} L ${formatNumber(s)} ${half}" stroke-width="1" stroke="${fg}" fill="none" stroke-linecap="round"/>`;
        break;
    case 'triangles':
        patternContent = `<path d="M 0,0 L ${formatNumber(s)},0 L ${half},${formatNumber(s * 0.866)} Z M 0,${formatNumber(s)} L ${formatNumber(s)},${formatNumber(s)} L ${half},${formatNumber(s * 0.134)} Z" fill="${fg}"/>`;
        break;
    case 'hexagons':
        const r = s / 2.1;
        const cx=s/2;
        const cy=s/2;
        const points = Array.from({length: 6}).map((_, i) => { 
            const angle_deg = 60 * i;
            const angle_rad = Math.PI / 180 * angle_deg;
            return `${formatNumber(cx + r * Math.cos(angle_rad))},${formatNumber(cy + r * Math.sin(angle_rad))}`; 
        }).join(' ');
        patternContent = `<polygon points="${points}" fill="${fg}" />`;
        break;
  }

  return `
    <pattern id="${pId}" patternUnits="userSpaceOnUse" width="${formatNumber(s)}" height="${formatNumber(s)}" patternTransform="rotate(${formatNumber(safeAngle)})">
      <rect width="${formatNumber(s)}" height="${formatNumber(s)}" fill="${bg}" />
      ${patternContent}
    </pattern>
  `;
}
