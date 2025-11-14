// ============= generator.ts =============
// Improved generator with richer palettes and accurate category representations
import type { Preset, GradientLayer, BlobLayer, PatternLayer, WaveLayer, PresetTheme, ImageLayer, Layer } from '../state/types';
import { LayerType } from '../state/types';
import seedrandom from 'seedrandom';

const PALETTES = {
    colored: [
        // Premium vibrant palettes - carefully curated
        ['#667eea', '#764ba2'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'], ['#30cfd0', '#330867'],
        ['#a8edea', '#fed6e3'], ['#ff9a56', '#ff6a88'], ['#ffecd2', '#fcb69f'],
        ['#ff6e7f', '#bfe9ff'], ['#e0c3fc', '#8ec5fc'], ['#f77062', '#fe5196'],
        ['#c471f5', '#fa71cd'], ['#48c6ef', '#6f86d6'], ['#feada6', '#f5efef'],
        ['#fddb92', '#d1fdff'], ['#89f7fe', '#66a6ff'], ['#cd9cf2', '#f6f3ff'],
        ['#13547a', '#80d0c7'], ['#ee0979', '#ff6a00'], ['#8360c3', '#2ebf91'],
        ['#f857a6', '#ff5858'], ['#7f7fd5', '#86a8e7'], ['#56ab2f', '#a8e063'],
    ],
    light: [
        // Clean, professional light themes
        ['#ffffff', '#f8f9fa'], ['#f0f9ff', '#e0f2fe'], ['#f5f3ff', '#ede9fe'],
        ['#fef3c7', '#fde68a'], ['#e0e7ff', '#c7d2fe'], ['#dcfce7', '#bbf7d0'],
        ['#fff7ed', '#fed7aa'], ['#fce7f3', '#fbcfe8'], ['#ecfeff', '#cffafe'],
        ['#f9fafb', '#f3f4f6'], ['#fef2f2', '#fee2e2'], ['#f0fdf4', '#dcfce7'],
        ['#fffbeb', '#fef3c7'], ['#fafaf9', '#f5f5f4'], ['#f8fafc', '#f1f5f9'],
    ],
    dark: [
        // Rich, sophisticated dark themes
        ['#0f172a', '#1e293b'], ['#1a1a2e', '#16213e'], ['#0d1117', '#161b22'],
        ['#1e1b4b', '#312e81'], ['#134e4a', '#115e59'], ['#171717', '#262626'],
        ['#18181b', '#27272a'], ['#1c1917', '#292524'], ['#14532d', '#166534'],
        ['#450a0a', '#7f1d1d'], ['#1e3a8a', '#1e40af'], ['#4a044e', '#701a75'],
        ['#172554', '#1e3a8a'], ['#431407', '#7c2d12'], ['#022c22', '#064e3b'],
    ],
    metallic: [
        // Authentic metallic sheens
        ['#C0C0C0', '#E8E8E8', '#A8A8A8', '#F5F5F5'], // Silver
        ['#FFD700', '#FFF4C4', '#B8860B', '#FFEC8B'], // Gold
        ['#CD7F32', '#E6B88A', '#8B4513', '#D4A574'], // Bronze
        ['#E5E4E2', '#F8F8F8', '#C9C9C9', '#FFFFFF'], // Platinum
        ['#71797E', '#A9B2B8', '#4A5456', '#8B9498'], // Steel
        ['#B87333', '#DAA520', '#8B6914', '#C9A961'], // Copper
        ['#FFE5B4', '#F5DEB3', '#DEB887', '#F0E68C'], // Brass
        ['#E8B4B8', '#F4C2C2', '#D8A0A6', '#FFE4E1'], // Rose Gold
    ],
    glass: [
        // Glassmorphism palettes
        ['#ffffff', '#f0f0f0'], ['#e0e7ff', '#c7d2fe'], ['#fce7f3', '#fbcfe8'],
        ['#d1fae5', '#a7f3d0'], ['#e0f2fe', '#bae6fd'], ['#fef3c7', '#fde68a'],
    ],
};

function random(rng: () => number, min: number, max: number) {
  return rng() * (max - min) + min;
}

const getCanvasBg = (theme: PresetTheme) => ({ 
    light: '#ffffff', 
    dark: '#0a0a0a', 
    colored: '#fafafa' 
})[theme];

// ========== GRADIENTS: Advanced gradient generation with harmony and conic support ==========
export const generateGradientPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]): Preset => {
  const rng = seedrandom(seed);
  const useUserPalette = customPalette && customPalette.length > 0;
  const themePalettes = PALETTES[theme];
  const userPalettes = customPalette || [];

  // Enhanced gradient types including conic
  const gradientTypes = ['linear', 'radial', 'conic'];
  const gradientType = gradientTypes[Math.floor(rng() * gradientTypes.length)];

  // More sophisticated stop generation with better positioning
  const numStops = Math.floor(random(rng, 2, 5)); // Up to 5 stops for richer gradients

  // Create color stops with better harmony
  const stops = [];
  const basePalette = useUserPalette
    ? userPalettes[Math.floor(rng() * userPalettes.length)]
    : themePalettes[Math.floor(rng() * themePalettes.length)];

  // Generate harmonious color stops
  for (let i = 0; i < numStops; i++) {
    let color: string;
    if (useUserPalette && i > 0) {
      // Use user palette for additional stops, but vary slightly
      const userPalette = userPalettes[Math.floor(rng() * userPalettes.length)];
      color = userPalette[Math.floor(rng() * userPalette.length)];
    } else {
      // Use base palette with some variation for richer gradients
      const paletteIndex = Math.floor(rng() * basePalette.length);
      color = basePalette[paletteIndex];

      // Add slight variation for more interesting gradients
      if (i > 0 && rng() > 0.7) {
        // Occasionally use a different palette color for harmony
        const altIndex = (paletteIndex + Math.floor(rng() * 2) + 1) % basePalette.length;
        color = basePalette[altIndex];
      }
    }

    // Calculate position with more sophisticated distribution
    let offset: number;
    if (numStops === 2) {
      offset = i * 100; // 0% and 100%
    } else if (numStops === 3) {
      offset = i === 0 ? 0 : i === 1 ? random(rng, 30, 70) : 100;
    } else {
      // For 4-5 stops, distribute more evenly with some randomness
      const baseOffset = (i / (numStops - 1)) * 100;
      const variation = random(rng, -15, 15);
      offset = Math.max(0, Math.min(100, baseOffset + variation));
    }

    stops.push({ id: `s${i+1}`, color, offset });
  }

  // Sort stops by offset
  stops.sort((a, b) => a.offset - b.offset);

  // Create gradient layer with enhanced properties
  const layer: GradientLayer = {
    id: `layer-${id}`,
    name: 'Advanced Gradient',
    type: LayerType.GRADIENT,
    visible: true,
    opacity: random(rng, 0.9, 1.0), // Usually fully opaque
    blendMode: 'normal',
    gradientType: gradientType as 'linear' | 'radial',
    angle: gradientType === 'conic'
      ? 0 // Conic gradients don't use angle
      : Math.floor(rng() * 360), // Full 360 degrees for linear
    stops,
  };

  // Add radial/conic specific properties
  if (gradientType === 'radial') {
    (layer as any).cx = random(rng, 25, 75);
    (layer as any).cy = random(rng, 25, 75);
    (layer as any).r = random(rng, 60, 120);
  } else if (gradientType === 'conic') {
    // For now, we'll store conic as radial with special handling
    // This would need SVG conic gradient support or CSS fallback
    (layer as any).gradientType = 'radial'; // Fallback for now
    (layer as any).cx = 50;
    (layer as any).cy = 50;
    (layer as any).r = 100;
  }

  // Occasionally add a secondary gradient layer for more complex effects
  const layers: Layer[] = [layer];

  if (rng() > 0.7 && gradientType !== 'conic') {
    // Add a subtle overlay gradient
    const overlayStops = [
      { id: 'os1', color: 'rgba(255,255,255,0.1)', offset: 0 },
      { id: 'os2', color: 'rgba(255,255,255,0)', offset: 50 },
      { id: 'os3', color: 'rgba(0,0,0,0.05)', offset: 100 },
    ];

    const overlayLayer: GradientLayer = {
      id: `layer-overlay-${id}`,
      name: 'Gradient Overlay',
      type: LayerType.GRADIENT,
      visible: true,
      opacity: random(rng, 0.3, 0.6),
      blendMode: rng() > 0.5 ? 'overlay' : 'soft-light',
      gradientType: gradientType as 'linear' | 'radial',
      angle: layer.angle + random(rng, -45, 45),
      stops: overlayStops,
    };

    if (gradientType === 'radial') {
      (overlayLayer as any).cx = random(rng, 30, 70);
      (overlayLayer as any).cy = random(rng, 30, 70);
      (overlayLayer as any).r = random(rng, 40, 80);
    }

    layers.push(overlayLayer);
  }

  return {
    id,
    name,
    category: 'Gradients',
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: getCanvasBg(theme) },
    layers
  };
};

// ========== DECORATIVE: Enhanced blob compositions with sophisticated layering ==========
export const generateBlobPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]): Preset => {
  const rng = seedrandom(seed);
  const useUserPalette = customPalette && customPalette.length > 0;
  const themePalettes = PALETTES[theme];
  const userPalettes = customPalette || [];

  // Create a sophisticated background gradient
  const bgPalette = themePalettes[Math.floor(rng() * themePalettes.length)];
  const bgLayer: GradientLayer = {
    id: `layer-bg-${id}`,
    name: 'Sophisticated Background',
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    gradientType: rng() > 0.5 ? 'radial' : 'linear',
    angle: rng() > 0.5 ? Math.floor(rng() * 360) : [0, 90, 180, 270][Math.floor(rng() * 4)],
    stops: [
      { id: 'bg1', color: bgPalette[0], offset: 0 },
      { id: 'bg2', color: bgPalette[1] || bgPalette[0], offset: 100 },
    ],
    ...(rng() > 0.5 && { cx: random(rng, 40, 60), cy: random(rng, 40, 60), r: random(rng, 80, 120) })
  };

  // Determine composition style
  const compositionStyle = rng();
  let numBlobs: number;
  let blobConfig: { primary: boolean, secondary?: boolean, accents?: boolean };

  if (compositionStyle < 0.4) {
    // Minimalist: few large blobs
    numBlobs = Math.floor(random(rng, 2, 3));
    blobConfig = { primary: true };
  } else if (compositionStyle < 0.7) {
    // Balanced: medium number with some layering
    numBlobs = Math.floor(random(rng, 3, 4));
    blobConfig = { primary: true, secondary: true };
  } else {
    // Complex: more blobs with accent elements
    numBlobs = Math.floor(random(rng, 4, 6));
    blobConfig = { primary: true, secondary: true, accents: true };
  }

  // Select blend modes based on theme
  const primaryBlendModes = theme === 'dark'
    ? ['soft-light', 'lighten', 'screen']
    : ['soft-light', 'multiply', 'overlay'];
  const secondaryBlendModes = ['overlay', 'soft-light', 'hard-light'];

  // Generate blob layers with sophisticated positioning
  const blobLayers: BlobLayer[] = [];

  // Primary blobs - larger, more prominent
  const primaryCount = Math.ceil(numBlobs * 0.6);
  for (let i = 0; i < primaryCount; i++) {
    const paletteContainer = useUserPalette ? userPalettes : themePalettes;
    const palette = paletteContainer[Math.floor(rng() * paletteContainer.length)];

    // Use golden ratio for more pleasing positioning
    const goldenAngle = (i * 137.5) * (Math.PI / 180);
    const radius = random(rng, 0.25, 0.45);
    const x = 0.5 + Math.cos(goldenAngle) * radius * random(rng, 0.8, 1.2);
    const y = 0.5 + Math.sin(goldenAngle) * radius * random(rng, 0.8, 1.2);

    blobLayers.push({
      id: `layer-blob-primary-${i}-${id}`,
      name: `Primary Blob ${i + 1}`,
      type: LayerType.BLOB,
      visible: true,
      opacity: random(rng, 0.6, 0.9),
      blendMode: primaryBlendModes[Math.floor(rng() * primaryBlendModes.length)],
      color: palette[Math.floor(rng() * palette.length)],
      seed: random(rng, 1, 1000),
      points: Math.floor(random(rng, 8, 12)), // Very smooth
      chaos: random(rng, 0.3, 0.6), // Balanced chaos
      x: Math.max(0.1, Math.min(0.9, x)),
      y: Math.max(0.1, Math.min(0.9, y)),
      scale: random(rng, 0.8, 1.4), // Varied sizes
    });
  }

  // Secondary blobs - smaller, more subtle
  if (blobConfig.secondary) {
    const secondaryCount = Math.floor(numBlobs * 0.3);
    for (let i = 0; i < secondaryCount; i++) {
      const paletteContainer = useUserPalette ? userPalettes : themePalettes;
      const palette = paletteContainer[Math.floor(rng() * paletteContainer.length)];

      blobLayers.push({
        id: `layer-blob-secondary-${i}-${id}`,
        name: `Secondary Blob ${i + 1}`,
        type: LayerType.BLOB,
        visible: true,
        opacity: random(rng, 0.3, 0.6),
        blendMode: secondaryBlendModes[Math.floor(rng() * secondaryBlendModes.length)],
        color: palette[Math.floor(rng() * palette.length)],
        seed: random(rng, 1, 1000),
        points: Math.floor(random(rng, 6, 10)),
        chaos: random(rng, 0.4, 0.7),
        x: random(rng, 0.2, 0.8),
        y: random(rng, 0.2, 0.8),
        scale: random(rng, 0.4, 0.8), // Smaller
      });
    }
  }

  // Accent blobs - very small, high opacity highlights
  if (blobConfig.accents && rng() > 0.6) {
    const accentCount = Math.floor(random(rng, 1, 3));
    for (let i = 0; i < accentCount; i++) {
      const palette = themePalettes[Math.floor(rng() * themePalettes.length)];

      blobLayers.push({
        id: `layer-blob-accent-${i}-${id}`,
        name: `Accent Blob ${i + 1}`,
        type: LayerType.BLOB,
        visible: true,
        opacity: random(rng, 0.8, 1.0),
        blendMode: 'overlay',
        color: palette[Math.floor(rng() * palette.length)],
        seed: random(rng, 1, 1000),
        points: Math.floor(random(rng, 5, 8)),
        chaos: random(rng, 0.2, 0.4), // Low chaos for clean accents
        x: random(rng, 0.1, 0.9),
        y: random(rng, 0.1, 0.9),
        scale: random(rng, 0.2, 0.4), // Very small
      });
    }
  }

  // Occasionally add a subtle texture overlay
  const layers: Layer[] = [bgLayer, ...blobLayers];
  if (rng() > 0.75) {
    const textureLayer: PatternLayer = {
      id: `layer-texture-${id}`,
      name: 'Subtle Texture',
      type: LayerType.PATTERN,
      visible: true,
      opacity: random(rng, 0.02, 0.05),
      blendMode: 'soft-light',
      patternType: 'dots',
      backgroundColor: 'transparent',
      foregroundColor: theme === 'dark' ? '#ffffff' : '#000000',
      scale: random(rng, 3, 8),
      angle: 0,
    };
    layers.push(textureLayer);
  }

  return {
    id,
    name,
    category: 'Decorative',
    theme,
    isNew,
    canvas: { width: 500, height: 500, background: getCanvasBg(theme) },
    layers
  };
};

// ========== GEOMETRIC: Sophisticated geometric compositions with layered shapes ==========
export const generatePatternPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, _customPalette?: string[][]): Preset => {
  const rng = seedrandom(seed);
  const useUserPalette = _customPalette && _customPalette.length > 0;
  const themePalettes = PALETTES[theme];
  const userPalettes = _customPalette || [];

  // Create a dynamic background with multiple gradients
  const bgPalette1 = themePalettes[Math.floor(rng() * themePalettes.length)];
  const bgPalette2 = themePalettes[Math.floor(rng() * themePalettes.length)];

  const backgroundLayers: GradientLayer[] = [];

  // Main background gradient
  backgroundLayers.push({
    id: `layer-bg-main-${id}`,
    name: 'Geometric Background',
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    gradientType: rng() > 0.5 ? 'radial' : 'linear',
    angle: Math.floor(rng() * 360),
    stops: [
      { id: 'bg1', color: bgPalette1[0], offset: 0 },
      { id: 'bg2', color: bgPalette1[1] || bgPalette1[0], offset: 100 },
    ],
    ...(rng() > 0.5 && { cx: random(rng, 40, 60), cy: random(rng, 40, 60), r: random(rng, 80, 120) })
  });

  // Add secondary background gradient for depth
  if (rng() > 0.6) {
    backgroundLayers.push({
      id: `layer-bg-secondary-${id}`,
      name: 'Geometric Depth',
      type: LayerType.GRADIENT,
      visible: true,
      opacity: random(rng, 0.3, 0.6),
      blendMode: rng() > 0.5 ? 'overlay' : 'soft-light',
      gradientType: 'radial',
      angle: 0,
      stops: [
        { id: 'bgd1', color: bgPalette2[0], offset: 0 },
        { id: 'bgd2', color: bgPalette2[1] || bgPalette2[0], offset: 100 },
      ],
      cx: random(rng, 20, 80),
      cy: random(rng, 20, 80),
      r: random(rng, 60, 100)
    });
  }

  // Determine composition style
  const compositionStyle = rng();
  let numLayers: number;
  let shapeConfig: { circles?: boolean, polygons?: boolean, lines?: boolean, complex?: boolean };

  if (compositionStyle < 0.3) {
    // Minimal geometric
    numLayers = Math.floor(random(rng, 2, 4));
    shapeConfig = { circles: true, polygons: true };
  } else if (compositionStyle < 0.6) {
    // Structured geometric
    numLayers = Math.floor(random(rng, 3, 5));
    shapeConfig = { circles: true, polygons: true, lines: true };
  } else {
    // Complex geometric composition
    numLayers = Math.floor(random(rng, 4, 7));
    shapeConfig = { circles: true, polygons: true, lines: true, complex: true };
  }

  // Generate sophisticated geometric layers
  const geometricLayers: ImageLayer[] = [];
  const canvasSize = 500;

  for (let layerIndex = 0; layerIndex < numLayers; layerIndex++) {
    const layerType = rng();
    let svgContent = '';

    // Select color palette for this layer
    const paletteContainer = useUserPalette ? userPalettes : themePalettes;
    const layerPalette = paletteContainer[Math.floor(rng() * paletteContainer.length)];

    if (shapeConfig.circles && layerType < 0.4) {
      // Generate concentric circles with varying opacities
      const centerX = random(rng, 100, 400);
      const centerY = random(rng, 100, 400);
      const numCircles = Math.floor(random(rng, 3, 6));

      for (let i = 0; i < numCircles; i++) {
        const radius = random(rng, 20, 80) * (i + 1) * 0.7;
        const opacity = random(rng, 0.1, 0.4) / (i + 1);
        const color = layerPalette[Math.floor(rng() * layerPalette.length)];

        svgContent += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${color}" opacity="${opacity}" />`;
      }
    } else if (shapeConfig.polygons && layerType < 0.7) {
      // Generate polygons with complex shapes
      const numShapes = Math.floor(random(rng, 2, 4));

      for (let i = 0; i < numShapes; i++) {
        const sides = Math.floor(random(rng, 5, 8));
        const centerX = random(rng, 100, 400);
        const centerY = random(rng, 100, 400);
        const radius = random(rng, 30, 70);
        const rotation = random(rng, 0, 360);
        const color = layerPalette[Math.floor(rng() * layerPalette.length)];
        const opacity = random(rng, 0.3, 0.7);

        // Generate polygon points
        const points = Array.from({ length: sides }, (_, j) => {
          const angle = (j * 360 / sides) + rotation;
          const radian = (angle * Math.PI) / 180;
          const x = centerX + radius * Math.cos(radian);
          const y = centerY + radius * Math.sin(radian);
          return `${x},${y}`;
        }).join(' ');

        svgContent += `<polygon points="${points}" fill="${color}" opacity="${opacity}" />`;
      }
    } else if (shapeConfig.lines && layerType < 0.85) {
      // Generate geometric line patterns
      const numLines = Math.floor(random(rng, 5, 12));
      const color = layerPalette[Math.floor(rng() * layerPalette.length)];

      for (let i = 0; i < numLines; i++) {
        const x1 = random(rng, 50, 450);
        const y1 = random(rng, 50, 450);
        const x2 = random(rng, 50, 450);
        const y2 = random(rng, 50, 450);
        const strokeWidth = random(rng, 1, 4);
        const opacity = random(rng, 0.2, 0.5);

        svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
      }
    } else if (shapeConfig.complex) {
      // Generate complex geometric forms
      const numElements = Math.floor(random(rng, 3, 6));

      for (let i = 0; i < numElements; i++) {
        const elementType = rng();

        if (elementType < 0.4) {
          // Rectangle with rounded corners
          const x = random(rng, 50, 350);
          const y = random(rng, 50, 350);
          const width = random(rng, 50, 150);
          const height = random(rng, 50, 150);
          const rx = random(rng, 5, 20);
          const color = layerPalette[Math.floor(rng() * layerPalette.length)];
          const opacity = random(rng, 0.3, 0.6);

          svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="${color}" opacity="${opacity}" />`;
        } else if (elementType < 0.7) {
          // Triangle
          const x1 = random(rng, 100, 400);
          const y1 = random(rng, 100, 400);
          const x2 = x1 + random(rng, -50, 50);
          const y2 = y1 + random(rng, 30, 80);
          const x3 = x1 + random(rng, -50, 50);
          const y3 = y1 + random(rng, 30, 80);
          const color = layerPalette[Math.floor(rng() * layerPalette.length)];
          const opacity = random(rng, 0.3, 0.6);

          svgContent += `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${color}" opacity="${opacity}" />`;
        } else {
          // Arc segments
          const cx = random(rng, 100, 400);
          const cy = random(rng, 100, 400);
          const r = random(rng, 40, 80);
          const startAngle = random(rng, 0, 360);
          const endAngle = startAngle + random(rng, 60, 180);
          const color = layerPalette[Math.floor(rng() * layerPalette.length)];
          const opacity = random(rng, 0.2, 0.4);
          const strokeWidth = random(rng, 3, 8);

          // Create arc path
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy + r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy + r * Math.sin(endRad);
          const largeArc = endAngle - startAngle > 180 ? 1 : 0;

          svgContent += `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}" stroke="${color}" stroke-width="${strokeWidth}" fill="none" opacity="${opacity}" />`;
        }
      }
    }

    if (svgContent) {
      const svgString = `<svg width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
      const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

      geometricLayers.push({
        id: `layer-geometric-${layerIndex}-${id}`,
        name: `Geometric Layer ${layerIndex + 1}`,
        type: LayerType.IMAGE,
        visible: true,
        opacity: random(rng, 0.4, 0.8),
        blendMode: ['normal', 'multiply', 'overlay', 'soft-light'][Math.floor(rng() * 4)] as any,
        src: dataUri,
        x: 0.5,
        y: 0.5,
        width: 1,
        height: 1
      });
    }
  }

  return {
    id,
    name,
    category: 'Geometric',
    theme,
    isNew,
    canvas: { width: canvasSize, height: canvasSize, background: bgPalette1[0] },
    layers: [...backgroundLayers, ...geometricLayers]
  };
};

// ========== MINIMALIST: Sophisticated simplicity with subtle complexity ==========
export const generateMinimalistPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, _customPalette?: string[][]): Preset => {
  const rng = seedrandom(seed);
  const themePalettes = PALETTES[theme];

  // Determine minimalist style
  const styleType = rng();

  if (styleType < 0.4) {
    // Pure gradient with subtle overlay
    const bgPalette = themePalettes[Math.floor(rng() * themePalettes.length)];
    const accentPalette = themePalettes[Math.floor(rng() * themePalettes.length)];

    const layers: GradientLayer[] = [];

    // Main gradient - very subtle
    layers.push({
      id: `layer-minimal-main-${id}`,
      name: 'Minimal Base',
      type: LayerType.GRADIENT,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      gradientType: rng() > 0.5 ? 'radial' : 'linear',
      angle: [0, 45, 90, 135][Math.floor(rng() * 4)],
      stops: [
        { id: 'm1', color: bgPalette[0], offset: 0 },
        { id: 'm2', color: bgPalette[1] || bgPalette[0], offset: 100 },
      ],
      ...(rng() > 0.5 && { cx: 50, cy: 50, r: 100 })
    });

    // Very subtle accent gradient
    if (rng() > 0.7) {
      layers.push({
        id: `layer-minimal-accent-${id}`,
        name: 'Minimal Accent',
        type: LayerType.GRADIENT,
        visible: true,
        opacity: random(rng, 0.1, 0.3),
        blendMode: 'overlay',
        gradientType: 'radial',
        angle: 0,
        stops: [
          { id: 'ma1', color: accentPalette[0], offset: 0 },
          { id: 'ma2', color: accentPalette[1] || accentPalette[0], offset: 100 },
        ],
        cx: random(rng, 30, 70),
        cy: random(rng, 30, 70),
        r: random(rng, 50, 80)
      });
    }

    return {
      id,
      name,
      category: 'Minimalist',
      theme,
      isNew,
      canvas: { width: 500, height: 500, background: bgPalette[0] },
      layers
    };

  } else if (styleType < 0.7) {
    // Single geometric element with gradient background
    const bgPalette = themePalettes[Math.floor(rng() * themePalettes.length)];
    const elementPalette = themePalettes[Math.floor(rng() * themePalettes.length)];

    const canvasSize = 500;

    // Background gradient
    const bgLayer: GradientLayer = {
      id: `layer-minimal-bg-${id}`,
      name: 'Minimal Background',
      type: LayerType.GRADIENT,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      gradientType: 'linear',
      angle: [0, 90][Math.floor(rng() * 2)],
      stops: [
        { id: 'mbg1', color: bgPalette[0], offset: 0 },
        { id: 'mbg2', color: bgPalette[1] || bgPalette[0], offset: 100 },
      ]
    };

    // Single geometric element
    let svgContent = '';
    const elementType = rng();

    if (elementType < 0.4) {
      // Large centered circle
      const cx = canvasSize / 2;
      const cy = canvasSize / 2;
      const r = random(rng, 80, 120);
      const color = elementPalette[Math.floor(rng() * elementPalette.length)];
      const opacity = random(rng, 0.3, 0.6);
      svgContent = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}" />`;
    } else if (elementType < 0.7) {
      // Large square or rectangle
      const x = random(rng, 150, 200);
      const y = random(rng, 150, 200);
      const width = random(rng, 150, 250);
      const height = random(rng, 150, 250);
      const color = elementPalette[Math.floor(rng() * elementPalette.length)];
      const opacity = random(rng, 0.2, 0.5);
      const rx = random(rng, 0, 20);
      svgContent = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="${color}" opacity="${opacity}" />`;
    } else {
      // Large triangle
      const cx = canvasSize / 2;
      const cy = canvasSize / 2;
      const size = random(rng, 120, 180);
      const x1 = cx;
      const y1 = cy - size / 2;
      const x2 = cx - size / 2;
      const y2 = cy + size / 2;
      const x3 = cx + size / 2;
      const y3 = cy + size / 2;
      const color = elementPalette[Math.floor(rng() * elementPalette.length)];
      const opacity = random(rng, 0.25, 0.55);
      svgContent = `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${color}" opacity="${opacity}" />`;
    }

    const svgString = `<svg width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
    const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

    const elementLayer: ImageLayer = {
      id: `layer-minimal-element-${id}`,
      name: 'Minimal Element',
      type: LayerType.IMAGE,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      src: dataUri,
      x: 0.5,
      y: 0.5,
      width: 1,
      height: 1
    };

    return {
      id,
      name,
      category: 'Minimalist',
      theme,
      isNew,
      canvas: { width: canvasSize, height: canvasSize, background: bgPalette[0] },
      layers: [bgLayer, elementLayer]
    };

  } else {
    // Typography-inspired minimalism with lines
    const bgPalette = themePalettes[Math.floor(rng() * themePalettes.length)];
    const linePalette = themePalettes[Math.floor(rng() * themePalettes.length)];

    const canvasSize = 500;

    // Background gradient
    const bgLayer: GradientLayer = {
      id: `layer-minimal-bg-${id}`,
      name: 'Minimal Background',
      type: LayerType.GRADIENT,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      gradientType: 'linear',
      angle: 90,
      stops: [
        { id: 'mtbg1', color: bgPalette[0], offset: 0 },
        { id: 'mtbg2', color: bgPalette[1] || bgPalette[0], offset: 100 },
      ]
    };

    // Generate minimalist line composition
    let svgContent = '';
    const numLines = Math.floor(random(rng, 3, 7));
    const color = linePalette[Math.floor(rng() * linePalette.length)];

    for (let i = 0; i < numLines; i++) {
      const y = 100 + (i * (300 / (numLines - 1)));
      const x1 = random(rng, 80, 150);
      const x2 = 500 - random(rng, 80, 150);
      const strokeWidth = random(rng, 2, 6);
      const opacity = random(rng, 0.4, 0.8);

      svgContent += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
    }

    const svgString = `<svg width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
    const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

    const lineLayer: ImageLayer = {
      id: `layer-minimal-lines-${id}`,
      name: 'Minimal Lines',
      type: LayerType.IMAGE,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      src: dataUri,
      x: 0.5,
      y: 0.5,
      width: 1,
      height: 1
    };

    return {
      id,
      name,
      category: 'Minimalist',
      theme,
      isNew,
      canvas: { width: canvasSize, height: canvasSize, background: bgPalette[0] },
      layers: [bgLayer, lineLayer]
    };
  }
};

// ========== WAVES: Sophisticated layered wave compositions with organic movement ==========
export const generateWavePreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, _customPalette?: string[][]): Preset => {
  const rng = seedrandom(seed);
  const useUserPalette = _customPalette && _customPalette.length > 0;
  const themePalettes = PALETTES[theme];
  const userPalettes = _customPalette || [];

  // Create sophisticated background
  const bgPalette1 = themePalettes[Math.floor(rng() * themePalettes.length)];
  const bgPalette2 = themePalettes[Math.floor(rng() * themePalettes.length)];

  const backgroundLayers: GradientLayer[] = [];

  // Main background gradient
  backgroundLayers.push({
    id: `layer-wave-bg-main-${id}`,
    name: 'Wave Background',
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    gradientType: rng() > 0.5 ? 'radial' : 'linear',
    angle: rng() > 0.5 ? Math.floor(rng() * 360) : [0, 90, 180][Math.floor(rng() * 3)],
    stops: [
      { id: 'wbg1', color: bgPalette1[0], offset: 0 },
      { id: 'wbg2', color: bgPalette1[1] || bgPalette1[0], offset: 100 },
    ],
    ...(rng() > 0.5 && { cx: random(rng, 40, 60), cy: random(rng, 40, 60), r: random(rng, 80, 120) })
  });

  // Add atmospheric background layer
  if (rng() > 0.6) {
    backgroundLayers.push({
      id: `layer-wave-bg-atmosphere-${id}`,
      name: 'Wave Atmosphere',
      type: LayerType.GRADIENT,
      visible: true,
      opacity: random(rng, 0.3, 0.6),
      blendMode: rng() > 0.5 ? 'overlay' : 'soft-light',
      gradientType: 'radial',
      angle: 0,
      stops: [
        { id: 'wat1', color: bgPalette2[0], offset: 0 },
        { id: 'wat2', color: bgPalette2[1] || bgPalette2[0], offset: 100 },
      ],
      cx: random(rng, 20, 80),
      cy: random(rng, 20, 80),
      r: random(rng, 60, 100)
    });
  }

  // Determine wave composition style
  const compositionStyle = rng();
  let numWaveLayers: number;
  let waveConfig: { flowing?: boolean, turbulent?: boolean, layered?: boolean, organic?: boolean };

  if (compositionStyle < 0.3) {
    // Gentle flowing waves
    numWaveLayers = Math.floor(random(rng, 2, 4));
    waveConfig = { flowing: true };
  } else if (compositionStyle < 0.6) {
    // Turbulent waves
    numWaveLayers = Math.floor(random(rng, 3, 5));
    waveConfig = { turbulent: true };
  } else if (compositionStyle < 0.8) {
    // Layered waves
    numWaveLayers = Math.floor(random(rng, 4, 6));
    waveConfig = { layered: true };
  } else {
    // Organic wave forms
    numWaveLayers = Math.floor(random(rng, 3, 5));
    waveConfig = { organic: true };
  }

  // Generate sophisticated wave layers
  const waveLayers: WaveLayer[] = [];
  const canvasSize = 500;

  for (let layerIndex = 0; layerIndex < numWaveLayers; layerIndex++) {
    const paletteContainer = useUserPalette ? userPalettes : themePalettes;
    const wavePalette = paletteContainer[Math.floor(rng() * paletteContainer.length)];
    const color = wavePalette[Math.floor(rng() * wavePalette.length)];

    let points: number;
    let wavelength: number;
    let amplitude: number;
    let y: number;
    let blendMode: string;
    let opacity: number;

    if (waveConfig.flowing) {
      // Gentle, flowing waves
      points = Math.floor(random(rng, 6, 10));
      wavelength = random(rng, 200, 400);
      amplitude = random(rng, 20, 50);
      y = 0.2 + (layerIndex * 0.15);
      blendMode = ['soft-light', 'overlay'][Math.floor(rng() * 2)];
      opacity = random(rng, 0.4, 0.7);
    } else if (waveConfig.turbulent) {
      // Turbulent, dynamic waves
      points = Math.floor(random(rng, 10, 16));
      wavelength = random(rng, 150, 300);
      amplitude = random(rng, 40, 80);
      y = 0.15 + (layerIndex * 0.2);
      blendMode = ['multiply', 'overlay', 'hard-light'][Math.floor(rng() * 3)];
      opacity = random(rng, 0.3, 0.6);
    } else if (waveConfig.layered) {
      // Layered wave composition
      points = Math.floor(random(rng, 8, 12));
      wavelength = random(rng, 180, 350);
      amplitude = random(rng, 30, 60);
      y = 0.1 + (layerIndex * 0.12);
      blendMode = layerIndex % 2 === 0 ? 'soft-light' : 'overlay';
      opacity = random(rng, 0.25, 0.5) / (layerIndex + 1);
    } else {
      // Organic wave forms
      points = Math.floor(random(rng, 12, 20));
      wavelength = random(rng, 100, 250);
      amplitude = random(rng, 15, 40);
      y = 0.25 + (layerIndex * 0.18);
      blendMode = ['overlay', 'soft-light'][Math.floor(rng() * 2)];
      opacity = random(rng, 0.5, 0.8);
    }

    waveLayers.push({
      id: `layer-wave-${layerIndex}-${id}`,
      name: `Wave Layer ${layerIndex + 1}`,
      type: LayerType.WAVE,
      visible: true,
      opacity,
      blendMode,
      color,
      seed: random(rng, 1, 1000),
      points,
      wavelength,
      amplitude,
      y,
      angle: waveConfig.organic ? random(rng, -30, 30) : random(rng, -10, 10)
    });
  }

  // Add subtle texture overlay for depth
  const layers: Layer[] = [...backgroundLayers, ...waveLayers];
  if (rng() > 0.7) {
    const texturePalette = themePalettes[Math.floor(rng() * themePalettes.length)];

    const textureLayer: PatternLayer = {
      id: `layer-wave-texture-${id}`,
      name: 'Wave Texture',
      type: LayerType.PATTERN,
      visible: true,
      opacity: random(rng, 0.02, 0.06),
      blendMode: 'soft-light',
      patternType: 'dots',
      backgroundColor: 'transparent',
      foregroundColor: texturePalette[Math.floor(rng() * texturePalette.length)],
      scale: random(rng, 4, 10),
      angle: 0,
    };
    layers.push(textureLayer);
  }

  return {
    id,
    name,
    category: 'Waves',
    theme,
    isNew,
    canvas: { width: canvasSize, height: canvasSize, background: bgPalette1[0] },
    layers
  };
};

// ========== ABSTRACT: Artistic but controlled chaos ==========
export const generateAbstractPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, _customPalette?: string[][]): Preset => {
    const rng = seedrandom(seed);
    const numLayers = Math.floor(random(rng, 3, 5)); // Reduced from 5-9
    const useUserPalette = _customPalette && _customPalette.length > 0;
    const themePalettes = PALETTES[theme];
    const userPalettes = _customPalette || [];
    
    // More selective blend modes
    const blendModes = ['soft-light', 'overlay', 'multiply', 'screen'];

    const layers = Array.from({ length: numLayers }, (_, i) => {
        const paletteContainer = useUserPalette ? userPalettes : themePalettes;
        const palette = paletteContainer[Math.floor(rng() * paletteContainer.length)];
        const layerType = rng();

        if (layerType < 0.7) { // Favor blobs
            const blob: BlobLayer = {
                id: `layer-abs-${id}-${i}`, name: `Abstract ${i}`, type: LayerType.BLOB, visible: true,
                opacity: random(rng, 0.3, 0.6), // More controlled opacity
                blendMode: blendModes[Math.floor(rng() * blendModes.length)],
                color: palette[Math.floor(rng() * palette.length)], 
                seed: random(rng, 1, 1000), 
                points: Math.floor(random(rng, 6, 10)), // Smoother shapes
                chaos: random(rng, 0.5, 1.0), // Less extreme chaos
                x: random(rng, 0.2, 0.8), y: random(rng, 0.2, 0.8), 
                scale: random(rng, 0.6, 1.1), // More uniform sizing
            };
            return blob;
        } else {
            const wave: WaveLayer = {
                id: `layer-abs-${id}-${i}`, name: `Abstract ${i}`, type: LayerType.WAVE, visible: true,
                opacity: random(rng, 0.25, 0.5), 
                blendMode: blendModes[Math.floor(rng() * blendModes.length)],
                color: palette[Math.floor(rng() * palette.length)], 
                seed: random(rng, 1, 1000), 
                points: Math.floor(random(rng, 8, 14)), 
                wavelength: random(rng, 150, 400), 
                amplitude: random(rng, 50, 90), 
                y: random(rng, 0.3, 0.7),
                angle: random(rng, 0, 180)
            };
            return wave;
        }
    });
    
    const bgPalette = themePalettes[Math.floor(rng() * themePalettes.length)];
    const bgLayer: GradientLayer = {
        id: `layer-bg-${id}`, name: 'Background', type: LayerType.GRADIENT, visible: true, opacity: 1, blendMode: 'normal',
        gradientType: 'radial', angle: 0, 
        cx: random(rng, 40, 60), cy: random(rng, 40, 60),
        stops: [
            { id: 's1', color: bgPalette[0], offset: 0 },
            { id: 's2', color: bgPalette[1] || bgPalette[0], offset: 100 },
        ]
    };

    return { id, name, category: 'Abstract', theme, isNew, 
        canvas: { width: 500, height: 500, background: bgPalette[0] }, 
        layers: [...layers.reverse(), bgLayer] };
};

// ========== METALLIC: Professional metallic finishes ==========
export const generateMetallicPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, _customPalette?: string[][]): Preset => {
    const rng = seedrandom(seed);
    const palette = PALETTES.metallic[Math.floor(rng() * PALETTES.metallic.length)];
    const [p1, p2, p3, p4] = palette;

    // Base metallic gradient
    const baseLayer: GradientLayer = {
        id: `layer-base-${id}`, name: 'Metallic Base', type: LayerType.GRADIENT, visible: true, opacity: 1, blendMode: 'normal',
        gradientType: 'linear', angle: 135 + random(rng, -30, 30),
        stops: [
            { id: 's1', color: p1, offset: 0 },
            { id: 's2', color: p2 || p1, offset: 50 },
            { id: 's3', color: p3 || p1, offset: 100 },
        ]
    };
    
    // Reflective sheen
    const sheenLayer: GradientLayer = {
        id: `layer-sheen-${id}`, name: 'Sheen', type: LayerType.GRADIENT, visible: true, 
        opacity: 0.5, blendMode: 'overlay',
        gradientType: 'radial', angle: 0, 
        cx: random(rng, 35, 65), cy: random(rng, 35, 65), 
        r: random(rng, 60, 90),
        stops: [
            { id: 's1', color: p4 || p2 || '#ffffff', offset: 0 },
            { id: 's2', color: p2 || p1, offset: 50 },
            { id: 's3', color: p1, offset: 100 },
        ]
    };
    
    // Subtle highlight
    const highlightLayer: GradientLayer = {
        id: `layer-highlight-${id}`, name: 'Highlight', type: LayerType.GRADIENT, visible: true, 
        opacity: 0.25, blendMode: 'soft-light',
        gradientType: 'linear', angle: 90,
        stops: [
            { id: 's1', color: '#ffffff', offset: 0 },
            { id: 's2', color: p2 || '#ffffff', offset: 100 },
        ]
    };

    return { id, name, category: 'Metallic', theme, isNew, 
        canvas: { width: 500, height: 500, background: p3 || p1 }, 
        layers: [highlightLayer, sheenLayer, baseLayer] };
};

// ========== GRID: Sophisticated architectural grid compositions ==========
export const generateGridPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, _customPalette?: string[][]): Preset => {
  const rng = seedrandom(seed);
  const useUserPalette = _customPalette && _customPalette.length > 0;
  const themePalettes = PALETTES[theme];
  const userPalettes = _customPalette || [];

  // Create architectural background
  const bgPalette1 = themePalettes[Math.floor(rng() * themePalettes.length)];
  const bgPalette2 = themePalettes[Math.floor(rng() * themePalettes.length)];

  const backgroundLayers: GradientLayer[] = [];

  // Main architectural background
  backgroundLayers.push({
    id: `layer-grid-bg-main-${id}`,
    name: 'Architectural Background',
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    gradientType: rng() > 0.5 ? 'radial' : 'linear',
    angle: [0, 45, 90, 135][Math.floor(rng() * 4)],
    stops: [
      { id: 'gbg1', color: bgPalette1[0], offset: 0 },
      { id: 'gbg2', color: bgPalette1[1] || bgPalette1[0], offset: 100 },
    ],
    ...(rng() > 0.5 && { cx: random(rng, 40, 60), cy: random(rng, 40, 60), r: random(rng, 80, 120) })
  });

  // Add depth layer
  if (rng() > 0.6) {
    backgroundLayers.push({
      id: `layer-grid-bg-depth-${id}`,
      name: 'Grid Depth',
      type: LayerType.GRADIENT,
      visible: true,
      opacity: random(rng, 0.3, 0.5),
      blendMode: 'overlay',
      gradientType: 'radial',
      angle: 0,
      stops: [
        { id: 'gbd1', color: bgPalette2[0], offset: 0 },
        { id: 'gbd2', color: bgPalette2[1] || bgPalette2[0], offset: 100 },
      ],
      cx: random(rng, 30, 70),
      cy: random(rng, 30, 70),
      r: random(rng, 60, 90)
    });
  }

  // Determine grid composition style
  const gridStyle = rng();
  let gridConfig: { modular?: boolean, isometric?: boolean, architectural?: boolean, organic?: boolean };

  if (gridStyle < 0.3) {
    // Modular grid system
    gridConfig = { modular: true };
  } else if (gridStyle < 0.6) {
    // Isometric perspective
    gridConfig = { isometric: true };
  } else if (gridStyle < 0.8) {
    // Architectural blueprint
    gridConfig = { architectural: true };
  } else {
    // Organic grid patterns
    gridConfig = { organic: true };
  }

  const canvasSize = 500;
  const paletteContainer = useUserPalette ? userPalettes : themePalettes;
  const gridPalette = paletteContainer[Math.floor(rng() * paletteContainer.length)];

  let svgContent = '';

  if (gridConfig.modular) {
    // Modular grid with varying line weights and intersections
    const baseSpacing = random(rng, 30, 60);
    const gridColor1 = gridPalette[Math.floor(rng() * gridPalette.length)];
    const gridColor2 = gridPalette[Math.floor(rng() * gridPalette.length)];

    // Horizontal lines with varying thickness
    for (let y = baseSpacing; y < canvasSize; y += baseSpacing) {
      const thickness = random(rng, 0.5, 2);
      const opacity = random(rng, 0.2, 0.6);
      const color = rng() > 0.7 ? gridColor2 : gridColor1;
      svgContent += `<line x1="0" y1="${y}" x2="${canvasSize}" y2="${y}" stroke="${color}" stroke-width="${thickness}" opacity="${opacity}" />`;
    }

    // Vertical lines with varying thickness
    for (let x = baseSpacing; x < canvasSize; x += baseSpacing) {
      const thickness = random(rng, 0.5, 2);
      const opacity = random(rng, 0.2, 0.6);
      const color = rng() > 0.7 ? gridColor2 : gridColor1;
      svgContent += `<line x1="${x}" y1="0" x2="${x}" y2="${canvasSize}" stroke="${color}" stroke-width="${thickness}" opacity="${opacity}" />`;
    }

    // Add some intersection highlights
    if (rng() > 0.5) {
      const numHighlights = Math.floor(random(rng, 3, 8));
      for (let i = 0; i < numHighlights; i++) {
        const x = Math.floor(rng() * (canvasSize / baseSpacing)) * baseSpacing;
        const y = Math.floor(rng() * (canvasSize / baseSpacing)) * baseSpacing;
        const size = random(rng, 2, 6);
        const color = gridPalette[Math.floor(rng() * gridPalette.length)];
        svgContent += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="0.4" />`;
      }
    }

  } else if (gridConfig.isometric) {
    // Isometric grid with 3D perspective
    const spacing = random(rng, 25, 45);
    const gridColor1 = gridPalette[Math.floor(rng() * gridPalette.length)];
    const gridColor2 = gridPalette[Math.floor(rng() * gridPalette.length)];
    const gridColor3 = gridPalette[Math.floor(rng() * gridPalette.length)];

    // Isometric lines at different angles
    const angles = [30, 90, 150]; // 60-degree increments for isometric

    angles.forEach((angle, angleIndex) => {
      const radian = (angle * Math.PI) / 180;
      const cos = Math.cos(radian);
      const sin = Math.sin(radian);

      for (let i = -10; i < 20; i++) {
        const startX = canvasSize / 2 + i * spacing * cos;
        const startY = canvasSize / 2 + i * spacing * sin;
        const endX = startX + 15 * spacing * cos;
        const endY = startY + 15 * spacing * sin;

        if (startX >= 0 && startX <= canvasSize && startY >= 0 && startY <= canvasSize) {
          const thickness = random(rng, 0.8, 2);
          const opacity = random(rng, 0.3, 0.7);
          const colors = [gridColor1, gridColor2, gridColor3];
          const color = colors[angleIndex % colors.length];

          svgContent += `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="${color}" stroke-width="${thickness}" opacity="${opacity}" />`;
        }
      }
    });

  } else if (gridConfig.architectural) {
    // Architectural blueprint style
    const spacing = random(rng, 35, 55);
    const gridColor1 = gridPalette[Math.floor(rng() * gridPalette.length)];
    const gridColor2 = gridPalette[Math.floor(rng() * gridPalette.length)];

    // Main grid lines
    for (let i = spacing; i < canvasSize; i += spacing) {
      const thickness = i % (spacing * 2) === 0 ? 1.5 : 0.8;
      const opacity = i % (spacing * 2) === 0 ? 0.6 : 0.3;
      const color = i % (spacing * 2) === 0 ? gridColor1 : gridColor2;

      // Horizontal
      svgContent += `<line x1="0" y1="${i}" x2="${canvasSize}" y2="${i}" stroke="${color}" stroke-width="${thickness}" opacity="${opacity}" />`;
      // Vertical
      svgContent += `<line x1="${i}" y1="0" x2="${i}" y2="${canvasSize}" stroke="${color}" stroke-width="${thickness}" opacity="${opacity}" />`;
    }

    // Add dimension lines and annotations
    if (rng() > 0.6) {
      const numAnnotations = Math.floor(random(rng, 2, 5));
      for (let i = 0; i < numAnnotations; i++) {
        const x = random(rng, 50, canvasSize - 50);
        const y = random(rng, 50, canvasSize - 50);
        const width = random(rng, 40, 80);
        const height = random(rng, 40, 80);

        // Dimension box
        svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="${gridColor2}" stroke-width="1" opacity="0.5" stroke-dasharray="5,5" />`;

        // Dimension arrows
        const arrowSize = 8;
        svgContent += `<line x1="${x}" y1="${y + height/2}" x2="${x - arrowSize}" y2="${y + height/2}" stroke="${gridColor2}" stroke-width="1" opacity="0.7" marker-end="url(#arrow)" />`;
        svgContent += `<line x1="${x + width}" y1="${y + height/2}" x2="${x + width + arrowSize}" y2="${y + height/2}" stroke="${gridColor2}" stroke-width="1" opacity="0.7" marker-end="url(#arrow)" />`;
      }

      // Add arrow marker definition
      svgContent = `<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="${gridColor2}" /></marker></defs>${svgContent}`;
    }

  } else {
    // Organic grid patterns
    const gridColor1 = gridPalette[Math.floor(rng() * gridPalette.length)];
    const gridColor2 = gridPalette[Math.floor(rng() * gridPalette.length)];

    // Curved grid lines
    const numCurves = Math.floor(random(rng, 8, 15));

    for (let i = 0; i < numCurves; i++) {
      const y = (i / (numCurves - 1)) * canvasSize;
      const amplitude = random(rng, 20, 50);
      const frequency = random(rng, 2, 5);

      // Create wavy horizontal line
      let pathData = `M 0 ${y}`;
      for (let x = 0; x <= canvasSize; x += 10) {
        const wave = Math.sin((x / canvasSize) * frequency * Math.PI * 2) * amplitude;
        pathData += ` L ${x} ${y + wave}`;
      }

      const thickness = random(rng, 0.5, 1.5);
      const opacity = random(rng, 0.2, 0.5);
      const color = rng() > 0.5 ? gridColor2 : gridColor1;

      svgContent += `<path d="${pathData}" stroke="${color}" stroke-width="${thickness}" fill="none" opacity="${opacity}" />`;
    }

    // Add some organic intersection points
    const numPoints = Math.floor(random(rng, 5, 12));
    for (let i = 0; i < numPoints; i++) {
      const x = random(rng, 20, canvasSize - 20);
      const y = random(rng, 20, canvasSize - 20);
      const size = random(rng, 3, 8);
      const color = gridPalette[Math.floor(rng() * gridPalette.length)];

      svgContent += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="0.3" />`;
    }
  }

  const svgString = `<svg width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
  const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

  const gridLayer: ImageLayer = {
    id: `layer-grid-${id}`,
    name: 'Architectural Grid',
    type: LayerType.IMAGE,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    src: dataUri,
    x: 0.5,
    y: 0.5,
    width: 1,
    height: 1
  };

  return {
    id,
    name,
    category: 'Grid',
    theme,
    isNew,
    canvas: { width: canvasSize, height: canvasSize, background: bgPalette1[0] },
    layers: [...backgroundLayers, gridLayer]
  };
};

// ========== GLASSMORPHISM: Sophisticated frosted glass compositions with depth and reflections ==========
export const generateGlassPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, _customPalette?: string[][]): Preset => {
  const rng = seedrandom(seed);
  const glassPalettes = PALETTES.glass;
  const themePalettes = PALETTES[theme];

  // Create sophisticated background with depth
  const bgPalette1 = themePalettes[Math.floor(rng() * themePalettes.length)];
  const bgPalette2 = themePalettes[Math.floor(rng() * themePalettes.length)];

  const backgroundLayers: GradientLayer[] = [];

  // Main background gradient
  backgroundLayers.push({
    id: `layer-glass-bg-main-${id}`,
    name: 'Glass Background',
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    gradientType: 'radial',
    angle: 0,
    stops: [
      { id: 'gbg1', color: bgPalette1[0], offset: 0 },
      { id: 'gbg2', color: bgPalette1[1] || bgPalette1[0], offset: 100 },
    ],
    cx: 50,
    cy: 50,
    r: 100
  });

  // Add atmospheric depth layer
  if (rng() > 0.5) {
    backgroundLayers.push({
      id: `layer-glass-bg-depth-${id}`,
      name: 'Glass Depth',
      type: LayerType.GRADIENT,
      visible: true,
      opacity: random(rng, 0.4, 0.7),
      blendMode: 'overlay',
      gradientType: rng() > 0.5 ? 'radial' : 'linear',
      angle: rng() > 0.5 ? Math.floor(rng() * 360) : 90,
      stops: [
        { id: 'gbd1', color: bgPalette2[0], offset: 0 },
        { id: 'gbd2', color: bgPalette2[1] || bgPalette2[0], offset: 100 },
      ],
      ...(rng() > 0.5 && { cx: random(rng, 30, 70), cy: random(rng, 30, 70), r: random(rng, 60, 90) })
    });
  }

  // Determine glass composition style
  const glassStyle = rng();
  let glassConfig: { layered?: boolean, reflective?: boolean, frosted?: boolean, crystalline?: boolean };

  if (glassStyle < 0.3) {
    // Layered glass panels
    glassConfig = { layered: true };
  } else if (glassStyle < 0.6) {
    // Reflective glass surfaces
    glassConfig = { reflective: true };
  } else if (glassStyle < 0.8) {
    // Frosted glass effects
    glassConfig = { frosted: true };
  } else {
    // Crystalline glass forms
    glassConfig = { crystalline: true };
  }

  const canvasSize = 500;
  const glassLayers: ImageLayer[] = [];

  for (let layerIndex = 0; layerIndex < (glassConfig.layered ? Math.floor(random(rng, 3, 5)) : Math.floor(random(rng, 2, 4))); layerIndex++) {
    let svgContent = '';

    if (glassConfig.layered) {
      // Layered glass panels with different transparencies
      const numPanels = Math.floor(random(rng, 2, 4));

      for (let i = 0; i < numPanels; i++) {
        const x = random(rng, 50, canvasSize - 150);
        const y = random(rng, 50, canvasSize - 150);
        const width = random(rng, 100, 200);
        const height = random(rng, 80, 150);
        const rx = random(rng, 10, 30);
        const glassColor = glassPalettes[Math.floor(rng() * glassPalettes.length)][Math.floor(rng() * 2)]; // Use first 2 colors for glass
        const opacity = random(rng, 0.1, 0.3) / (i + 1); // Decreasing opacity for layers
        const blur = random(rng, 0.5, 2);

        // Glass panel with subtle border
        svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="${glassColor}" opacity="${opacity}" stroke="rgba(255,255,255,0.2)" stroke-width="1" filter="blur(${blur}px)" />`;

        // Add subtle inner shadow/highlight
        if (rng() > 0.6) {
          const highlightOpacity = opacity * 0.5;
          svgContent += `<rect x="${x + 5}" y="${y + 5}" width="${width - 10}" height="${height - 10}" rx="${rx - 5}" ry="${rx - 5}" fill="rgba(255,255,255,${highlightOpacity})" />`;
        }
      }

    } else if (glassConfig.reflective) {
      // Reflective glass surfaces with light reflections
      const numSurfaces = Math.floor(random(rng, 1, 3));

      for (let i = 0; i < numSurfaces; i++) {
        const x = random(rng, 30, canvasSize - 200);
        const y = random(rng, 30, canvasSize - 200);
        const width = random(rng, 150, 300);
        const height = random(rng, 100, 200);
        const glassColor = glassPalettes[Math.floor(rng() * glassPalettes.length)][Math.floor(rng() * 2)];
        const opacity = random(rng, 0.15, 0.35);

        // Main glass surface
        svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${glassColor}" opacity="${opacity}" />`;

        // Add reflection lines
        const numReflections = Math.floor(random(rng, 3, 8));
        for (let j = 0; j < numReflections; j++) {
          const reflectionY = y + random(rng, 10, height - 10);
          const reflectionWidth = random(rng, width * 0.3, width * 0.8);
          const reflectionOpacity = opacity * random(rng, 0.3, 0.7);
          svgContent += `<line x1="${x + random(rng, 10, 30)}" y1="${reflectionY}" x2="${x + reflectionWidth}" y2="${reflectionY}" stroke="rgba(255,255,255,${reflectionOpacity})" stroke-width="${random(rng, 0.5, 2)}" />`;
        }
      }

    } else if (glassConfig.frosted) {
      // Frosted glass with texture and diffusion
      const numElements = Math.floor(random(rng, 8, 15));

      for (let i = 0; i < numElements; i++) {
        const x = random(rng, 50, canvasSize - 100);
        const y = random(rng, 50, canvasSize - 100);
        const size = random(rng, 40, 80);
        const glassColor = glassPalettes[Math.floor(rng() * glassPalettes.length)][Math.floor(rng() * 2)];
        const opacity = random(rng, 0.1, 0.25);
        const blur = random(rng, 1, 3);

        // Frosted glass circles with blur
        svgContent += `<circle cx="${x}" cy="${y}" r="${size}" fill="${glassColor}" opacity="${opacity}" filter="blur(${blur}px)" />`;

        // Add subtle texture dots within the frosted areas
        const numDots = Math.floor(random(rng, 5, 12));
        for (let j = 0; j < numDots; j++) {
          const dotX = x + random(rng, -size/2, size/2);
          const dotY = y + random(rng, -size/2, size/2);
          const dotSize = random(rng, 1, 3);
          const dotOpacity = opacity * random(rng, 0.5, 1.5);
          const distance = Math.sqrt((dotX - x) ** 2 + (dotY - y) ** 2);
          if (distance <= size) {
            svgContent += `<circle cx="${dotX}" cy="${dotY}" r="${dotSize}" fill="rgba(255,255,255,${dotOpacity})" />`;
          }
        }
      }

    } else {
      // Crystalline glass forms with geometric precision
      const numCrystals = Math.floor(random(rng, 3, 6));

      for (let i = 0; i < numCrystals; i++) {
        const centerX = random(rng, 100, canvasSize - 100);
        const centerY = random(rng, 100, canvasSize - 100);
        const size = random(rng, 60, 100);
        const glassColor = glassPalettes[Math.floor(rng() * glassPalettes.length)][Math.floor(rng() * 2)];
        const opacity = random(rng, 0.2, 0.4);
        const sides = Math.floor(random(rng, 4, 7));

        // Create crystalline polygon
        const points = Array.from({ length: sides }, (_, j) => {
          const angle = (j * 360 / sides) + random(rng, -10, 10);
          const radian = (angle * Math.PI) / 180;
          const distance = size * (0.8 + random(rng, 0, 0.4)); // Varied distances for crystalline effect
          const x = centerX + distance * Math.cos(radian);
          const y = centerY + distance * Math.sin(radian);
          return `${x},${y}`;
        }).join(' ');

        svgContent += `<polygon points="${points}" fill="${glassColor}" opacity="${opacity}" stroke="rgba(255,255,255,0.3)" stroke-width="1" />`;

        // Add crystalline facets (smaller polygons within)
        if (rng() > 0.6) {
          const facetPoints = Array.from({ length: Math.floor(sides/2) }, (_, j) => {
            const angle = ((j * 2) * 360 / sides) + random(rng, -5, 5);
            const radian = (angle * Math.PI) / 180;
            const distance = size * random(rng, 0.2, 0.6);
            const x = centerX + distance * Math.cos(radian);
            const y = centerY + distance * Math.sin(radian);
            return `${x},${y}`;
          }).join(' ');

          const facetOpacity = opacity * random(rng, 0.7, 1.3);
          svgContent += `<polygon points="${facetPoints}" fill="rgba(255,255,255,${facetOpacity})" />`;
        }
      }
    }

    if (svgContent) {
      const svgString = `<svg width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
      const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

      glassLayers.push({
        id: `layer-glass-${layerIndex}-${id}`,
        name: `Glass Layer ${layerIndex + 1}`,
        type: LayerType.IMAGE,
        visible: true,
        opacity: random(rng, 0.7, 1.0),
        blendMode: ['normal', 'overlay', 'soft-light'][Math.floor(rng() * 3)] as any,
        src: dataUri,
        x: 0.5,
        y: 0.5,
        width: 1,
        height: 1
      });
    }
  }

  // Add subtle background texture for more realism
  const layers: Layer[] = [...backgroundLayers, ...glassLayers];
  if (rng() > 0.6) {
    const texturePalette = themePalettes[Math.floor(rng() * themePalettes.length)];

    const textureLayer: PatternLayer = {
      id: `layer-glass-texture-${id}`,
      name: 'Glass Texture',
      type: LayerType.PATTERN,
      visible: true,
      opacity: random(rng, 0.01, 0.03),
      blendMode: 'overlay',
      patternType: 'dots',
      backgroundColor: 'transparent',
      foregroundColor: texturePalette[Math.floor(rng() * texturePalette.length)],
      scale: random(rng, 2, 5),
      angle: 0,
    };
    layers.push(textureLayer);
  }

  return {
    id,
    name,
    category: 'Glassmorphism',
    theme,
    isNew,
    canvas: { width: canvasSize, height: canvasSize, background: bgPalette1[0] },
    layers
  };
};
