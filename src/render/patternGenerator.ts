
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
  }

  return `
    <pattern id="${pId}" patternUnits="userSpaceOnUse" width="${s}" height="${s}" patternTransform="rotate(${angle})">
      <rect width="${s}" height="${s}" fill="${backgroundColor}" />
      ${patternContent}
    </pattern>
  `;
}
