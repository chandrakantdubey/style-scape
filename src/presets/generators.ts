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

// ========== GRADIENTS: Clean, professional gradients ==========
export const generateGradientPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]): Preset => {
    const rng = seedrandom(seed);
    const useUserPalette = customPalette && customPalette.length > 0;
    const themePalettes = PALETTES[theme];
    const userPalettes = customPalette || [];
    
    const gradientType = rng() > 0.35 ? 'radial' : 'linear';
    const numStops = Math.floor(random(rng, 2, 4));
    
    const stops = Array.from({length: numStops}, (_, i) => {
        let color: string;
        if (useUserPalette && i > 0) {
            const userPalette = userPalettes[Math.floor(rng() * userPalettes.length)];
            color = userPalette[Math.floor(rng() * userPalette.length)];
        } else {
            const themePalette = themePalettes[Math.floor(rng() * themePalettes.length)];
            color = themePalette[Math.floor(rng() * themePalette.length)];
        }
        return { id: `s${i+1}`, color, offset: i * (100 / (numStops - 1)) };
    }).sort((a,b) => a.offset - b.offset);

    const layer: GradientLayer = {
        id: `layer-${id}`, name: 'Gradient', type: LayerType.GRADIENT, visible: true, opacity: 1, blendMode: 'normal',
        gradientType, angle: Math.floor(rng() * 360), stops,
        ...(gradientType === 'radial' && {
            cx: random(rng, 40, 60), cy: random(rng, 40, 60), r: random(rng, 70, 100)
        })
    };
    
    return { id, name, category: 'Gradients', theme, isNew, 
        canvas: { width: 500, height: 500, background: getCanvasBg(theme) }, layers: [layer] };
};

// ========== DECORATIVE: Elegant blob compositions ==========
export const generateBlobPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]): Preset => {
    const rng = seedrandom(seed);
    const useUserPalette = customPalette && customPalette.length > 0;
    const themePalettes = PALETTES[theme];
    const userPalettes = customPalette || [];
    
    // Fewer blobs for cleaner look
    const numBlobs = Math.floor(random(rng, 3, 5)); 
    const bgPalette = themePalettes[Math.floor(rng() * themePalettes.length)];
    
    const bgLayer: GradientLayer = {
        id: `layer-bg-${id}`, name: 'Background', type: LayerType.GRADIENT, visible: true, opacity: 1, blendMode: 'normal',
        gradientType: 'radial', angle: 0,
        stops: [
            { id: 's1', color: bgPalette[0], offset: 0 },
            { id: 's2', color: bgPalette[1] || bgPalette[0], offset: 100 },
        ],
        cx: random(rng, 45, 55), cy: random(rng, 45, 55),
    }

    // Simpler blend modes for cleaner look
    const blendModes = theme === 'dark' ? ['soft-light', 'lighten'] : ['soft-light', 'multiply'];

    const blobLayers = Array.from({ length: numBlobs }, (_, i): BlobLayer => {
        const currentPaletteContainer = useUserPalette ? userPalettes : themePalettes;
        const currentPalette = currentPaletteContainer[Math.floor(rng() * currentPaletteContainer.length)];
        return {
            id: `layer-blob${i}-${id}`, name: `Decorative ${i + 1}`, type: LayerType.BLOB, visible: true, 
            opacity: random(rng, 0.4, 0.7), // Lower opacity for subtlety
            blendMode: blendModes[Math.floor(rng() * blendModes.length)],
            color: currentPalette[Math.floor(rng() * currentPalette.length)], 
            seed: random(rng, 1, 1000), 
            points: Math.floor(random(rng, 6, 10)), // More points = smoother
            chaos: random(rng, 0.4, 0.8), // Less chaos = more elegant
            x: random(rng, 0.2, 0.8), y: random(rng, 0.2, 0.8), 
            scale: random(rng, 0.5, 1.0), // More consistent sizing
        };
    });

    return { id, name, category: 'Decorative', theme, isNew, 
        canvas: { width: 500, height: 500, background: getCanvasBg(theme) }, layers: [...blobLayers, bgLayer] };
};

// ========== GEOMETRIC: Clean, purposeful patterns ==========
export const generatePatternPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]): Preset => {
    const rng = seedrandom(seed);
    const useUserPalette = customPalette && customPalette.length > 0;
    const themePalettes = PALETTES[theme];
    const userPalettes = customPalette || [];

    const bgPalette = themePalettes[Math.floor(rng() * themePalettes.length)];
    const fgPaletteContainer = useUserPalette ? userPalettes : themePalettes;
    const fgPalette = fgPaletteContainer[Math.floor(rng() * fgPaletteContainer.length)];

    // Only geometric shapes
    const types: PatternLayer['patternType'][] = ['squares', 'triangles', 'hexagons'];
    
    const patternLayer: PatternLayer = {
        id: `layer-pattern-${id}`, name: 'Pattern', type: LayerType.PATTERN, visible: true, 
        opacity: random(rng, 0.12, 0.25), // Subtle presence
        blendMode: 'multiply', // Consistent blend
        patternType: types[Math.floor(rng() * types.length)],
        backgroundColor: 'transparent',
        foregroundColor: fgPalette[Math.floor(rng() * fgPalette.length)],
        scale: Math.floor(random(rng, 30, 55)), // Larger, cleaner patterns
        angle: [0, 45, 90][Math.floor(rng() * 3)], // Only clean angles
    };

    const bgLayer: GradientLayer = {
        id: `layer-bg-${id}`, name: 'Background', type: LayerType.GRADIENT, visible: true, opacity: 1, blendMode: 'normal',
        gradientType: rng() > 0.5 ? 'linear' : 'radial',
        angle: [0, 45, 90, 135][Math.floor(rng() * 4)], // Clean angles
        stops: [
            { id: 's1', color: bgPalette[0], offset: 0 },
            { id: 's2', color: bgPalette[1] || bgPalette[0], offset: 100 },
        ],
        ...(rng() > 0.5 && { cx: 50, cy: 50 }) // Centered radials
    };

    return { id, name, category: 'Geometric', theme, isNew, 
        canvas: { width: 500, height: 500, background: bgPalette[0] }, layers: [patternLayer, bgLayer] };
};

// ========== MINIMALIST: Pure, clean simplicity ==========
export const generateMinimalistPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]): Preset => {
    const rng = seedrandom(seed);
    const themePalettes = PALETTES[theme];
    const bgPalette = themePalettes[Math.floor(rng() * themePalettes.length)];

    // Pure minimalist - just one clean gradient
    const bgLayer: GradientLayer = {
        id: `layer-bg-${id}`, name: 'Background', type: LayerType.GRADIENT, visible: true, opacity: 1, blendMode: 'normal',
        gradientType: rng() > 0.5 ? 'radial' : 'linear',
        angle: [0, 90, 180][Math.floor(rng() * 3)], // Only vertical/horizontal
        stops: [
            { id: 's1', color: bgPalette[0], offset: 0 },
            { id: 's2', color: bgPalette[1] || bgPalette[0], offset: 100 },
        ],
        ...(rng() > 0.5 && { cx: 50, cy: 50 }) // Centered if radial
    };

    return { id, name, category: 'Minimalist', theme, isNew, 
        canvas: { width: 500, height: 500, background: bgPalette[0] }, layers: [bgLayer] };
};

// ========== WAVES: Fluid, purposeful wave layers ==========
export const generateWavePreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]): Preset => {
    const rng = seedrandom(seed);
    const useUserPalette = customPalette && customPalette.length > 0;
    const themePalettes = PALETTES[theme];
    const userPalettes = customPalette || [];

    const bgPalette = themePalettes[Math.floor(rng() * themePalettes.length)];
    
    const bgLayer: GradientLayer = {
        id: `layer-bg-${id}`, name: 'Background', type: LayerType.GRADIENT, visible: true, opacity: 1, blendMode: 'normal',
        gradientType: 'linear', angle: random(rng, 0, 180),
        stops: [ 
            { id: 's1', color: bgPalette[0], offset: 0 }, 
            { id: 's2', color: bgPalette[1] || bgPalette[0], offset: 100 }
        ]
    }

    // Fewer waves, more deliberate
    const numLayers = Math.floor(random(rng, 2, 4)); // Reduced from 3-6

    const layers = Array.from({length: numLayers}, (_, i): WaveLayer => {
        const wavePaletteContainer = useUserPalette ? userPalettes : themePalettes;
        const wavePalette = wavePaletteContainer[Math.floor(rng() * wavePaletteContainer.length)];
        return {
            id: `layer-wave${i}-${id}`, name: `Wave ${i+1}`, type: LayerType.WAVE, visible: true, 
            opacity: random(rng, 0.2, 0.4), // Subtle, layered effect
            blendMode: 'soft-light', // Consistent blend
            color: wavePalette[Math.floor(rng() * wavePalette.length)],
            seed: random(rng, 1, 1000), 
            points: Math.floor(random(rng, 8, 14)), // Smoother waves
            wavelength: random(rng, 150, 350), // More consistent wavelength
            amplitude: random(rng, 40, 80), 
            y: 0.3 + (i * 0.2), // Evenly spaced
            angle: random(rng, -15, 15) // Slight variations only
        };
    });

    return { id, name, category: 'Waves', theme, isNew, 
        canvas: { width: 500, height: 500, background: bgPalette[0] }, layers: [...layers, bgLayer] };
};

// ========== ABSTRACT: Artistic but controlled chaos ==========
export const generateAbstractPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]): Preset => {
    const rng = seedrandom(seed);
    const numLayers = Math.floor(random(rng, 3, 5)); // Reduced from 5-9
    const useUserPalette = customPalette && customPalette.length > 0;
    const themePalettes = PALETTES[theme];
    const userPalettes = customPalette || [];
    
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
export const generateMetallicPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]): Preset => {
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

// ========== GRID: Clean, architectural grids ==========
export const generateGridPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]): Preset => {
    const rng = seedrandom(seed);
    const useUserPalette = customPalette && customPalette.length > 0;
    const themePalettes = PALETTES[theme];
    const userPalettes = customPalette || [];

    const gridPaletteContainer = useUserPalette ? userPalettes : themePalettes;
    const gridPalette = gridPaletteContainer[Math.floor(rng() * gridPaletteContainer.length)];
    const bgPalette = themePalettes[Math.floor(rng() * themePalettes.length)];

    const gridColor = gridPalette[Math.floor(rng() * gridPalette.length)] || (theme === 'light' ? '#cbd5e1' : '#475569');
    const bgColorStart = bgPalette[0];
    const bgColorEnd = bgPalette[1] || bgColorStart;
    
    const spacing = Math.floor(random(rng, 20, 35)); // More consistent spacing
    const isLines = rng() > 0.5;
    const thickness = random(rng, 0.8, 1.2);

    const regions = [
        { x: 0, y: 0, w: 1, h: 1 },
        { x: 0, y: 0, w: 0.5, h: 1 },
        { x: 0.5, y: 0, w: 0.5, h: 1 },
    ];
    const region = regions[Math.floor(rng() * regions.length)];
    const canvasSize = 500;

    const patternId = `p-${id}`;
    const maskId = `m-${id}`;
    const gradId = `g-${id}`;
    
    const isLinearMask = rng() > 0.4;
    let maskGradient;

    if (isLinearMask) {
        const angle = Math.floor(rng() * 2) * 90; // Only 0 or 90
        maskGradient = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="${angle === 90 ? 100 : 0}%" y2="${angle === 0 ? 100 : 0}%">
            <stop offset="30%" stop-color="white" stop-opacity="1" />
            <stop offset="100%" stop-color="white" stop-opacity="0" />
        </linearGradient>`;
    } else {
        const gradCX = (region.x + region.w / 2) * 100;
        const gradCY = (region.y + region.h / 2) * 100;
        maskGradient = `<radialGradient id="${gradId}" cx="${gradCX}%" cy="${gradCY}%" r="60%">
            <stop offset="30%" stop-color="white" stop-opacity="1" />
            <stop offset="100%" stop-color="white" stop-opacity="0" />
        </radialGradient>`;
    }

    const patternContent = isLines
        ? `<path d="M 0 ${spacing/2} H ${spacing} M ${spacing/2} 0 V ${spacing}" stroke-width="${thickness}" stroke="${gridColor}" stroke-opacity="0.3" />`
        : `<circle cx="${spacing / 2}" cy="${spacing / 2}" r="${thickness}" fill="${gridColor}" fill-opacity="0.3" />`;

    const imageSvgString = `<svg width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${spacing}" height="${spacing}">
                ${patternContent}
            </pattern>
            ${maskGradient}
            <mask id="${maskId}">
                <rect x="0" y="0" width="${canvasSize}" height="${canvasSize}" fill="url(#${gradId})" />
            </mask>
        </defs>
        <rect x="0" y="0" width="${canvasSize}" height="${canvasSize}" fill="url(#${patternId})" mask="url(#${maskId})" />
    </svg>`;

    const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(imageSvgString)))}`;

    const imageLayer: ImageLayer = {
        id: `layer-grid-${id}`, name: 'Grid', type: LayerType.IMAGE, visible: true, opacity: 1, blendMode: 'normal',
        src: dataUri, x: 0.5, y: 0.5, width: 1, height: 1
    };

    const bgLayer: GradientLayer = {
        id: `layer-bg-${id}`, name: 'Background', type: LayerType.GRADIENT, visible: true, opacity: 1, blendMode: 'normal',
        gradientType: 'linear', angle: [0, 90, 180][Math.floor(rng() * 3)],
        stops: [
            { id: 's1', color: bgColorStart, offset: 0 },
            { id: 's2', color: bgColorEnd, offset: 100 },
        ]
    };
    
    return { id, name, category: 'Grid', theme, isNew, 
        canvas: { width: canvasSize, height: canvasSize, background: bgColorStart }, 
        layers: [imageLayer, bgLayer] };
};

// ========== GLASSMORPHISM: Modern frosted glass effect ==========
export const generateGlassPreset = (id: string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]): Preset => {
    const rng = seedrandom(seed);
    const glassPalettes = PALETTES.glass;
    const glassPalette = glassPalettes[Math.floor(rng() * glassPalettes.length)];
    
    const bgPalette = PALETTES[theme][Math.floor(rng() * PALETTES[theme].length)];
    const bgLayer: GradientLayer = {
        id: `layer-bg-${id}`, name: 'Background', type: LayerType.GRADIENT, visible: true, opacity: 1, blendMode: 'normal',
        gradientType: 'radial', angle: 0, cx: 50, cy: 50,
        stops: [
            { id: 's1', color: bgPalette[0], offset: 0 },
            { id: 's2', color: bgPalette[1] || bgPalette[0], offset: 100 },
        ]
    };
    
    // Clean glass panels - fewer, more purposeful
    const numGlassPanels = Math.floor(random(rng, 2, 3));
    const glassLayers = Array.from({ length: numGlassPanels }, (_, i): BlobLayer => {
        return {
            id: `layer-glass${i}-${id}`, name: `Glass ${i + 1}`, type: LayerType.BLOB, visible: true, 
            opacity: random(rng, 0.2, 0.35), blendMode: 'overlay',
            color: glassPalette[Math.floor(rng() * glassPalette.length)],
            seed: random(rng, 1, 1000), 
            points: Math.floor(random(rng, 8, 12)), // Very smooth
            chaos: random(rng, 0.2, 0.5), // Minimal chaos for glass effect
            x: random(rng, 0.3, 0.7), y: random(rng, 0.3, 0.7), 
            scale: random(rng, 0.7, 1.1),
        };
    });
    
    // Very subtle texture
    const textureLayer: PatternLayer = {
        id: `layer-texture-${id}`, name: 'Texture', type: LayerType.PATTERN, visible: true, 
        opacity: 0.03, blendMode: 'soft-light', patternType: 'dots',
        backgroundColor: 'transparent', foregroundColor: '#ffffff',
        scale: random(rng, 4, 7), angle: 0,
    };

    return { id, name, category: 'Glassmorphism', theme, isNew, 
        canvas: { width: 500, height: 500, background: bgPalette[0] }, 
        layers: [textureLayer, ...glassLayers, bgLayer] };
};
