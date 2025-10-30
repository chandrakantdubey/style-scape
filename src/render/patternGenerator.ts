
import type { PatternLayer } from '../state/types';

export function generatePatternDef(layer: PatternLayer): string {
  const { id, patternType, scale, angle, foregroundColor, backgroundColor } = layer;
  const pId = `pattern-${id}`;

  let patternContent = '';
  const s = Math.max(1, scale);
  
  switch(patternType) {
    case 'dots':
      patternContent = `<circle cx="${s/2}" cy="${s/2}" r="${s/4}" fill="${foregroundColor}" />`;
      break;
    case 'lines':
      patternContent = `<path d="M 0,${s/2} l ${s},0" stroke-width="${s/5}" stroke="${foregroundColor}" />`;
      break;
    case 'squares':
      patternContent = `<rect width="${s/2}" height="${s/2}" fill="${foregroundColor}" /><rect x="${s/2}" y="${s/2}" width="${s/2}" height="${s/2}" fill="${foregroundColor}" />`;
      break;
    case 'crosses':
        patternContent = `<path d="M ${s/4} ${s/2} H ${s*3/4} M ${s/2} ${s/4} V ${s*3/4}" stroke-width="${s/8}" stroke="${foregroundColor}" fill="none" stroke-linecap="round"/>`;
        break;
    case 'chevrons':
        patternContent = `<path d="M 0 ${s/2} L ${s/4} ${s/4} L ${s/2} ${s/2} L ${s*3/4} ${s/4} L ${s} ${s/2}" stroke-width="${s/10}" stroke="${foregroundColor}" fill="none" stroke-linecap="round"/>`;
        break;
    case 'triangles':
        patternContent = `<path d="M 0,0 L ${s},0 L ${s/2},${s*0.866} Z M 0,${s} L ${s},${s} L ${s/2},${s*0.134} Z" fill="${foregroundColor}"/>`;
        break;
    case 'hexagons':
        const r = s / 2.1;
        const cx=s/2;
        const cy=s/2;
        const points = Array.from({length: 6}).map((_, i) => { 
            const angle_deg = 60 * i;
            const angle_rad = Math.PI / 180 * angle_deg;
            return `${cx + r * Math.cos(angle_rad)},${cy + r * Math.sin(angle_rad)}`; 
        }).join(' ');
        patternContent = `<polygon points="${points}" fill="${foregroundColor}" />`;
        break;
  }

  return `
    <pattern id="${pId}" patternUnits="userSpaceOnUse" width="${s}" height="${s}" patternTransform="rotate(${angle})">
      <rect width="${s}" height="${s}" fill="${backgroundColor}" />
      ${patternContent}
    </pattern>
  `;
}