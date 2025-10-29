import type { Preset, GradientLayer, BlobLayer, PatternLayer, WaveLayer } from '../state/types';
import { LayerType } from '../state/types';
import seedrandom from 'seedrandom';

const PALETTES = [
  ['#8E2DE2', '#4A00E0'], // Violet
  ['#00C9FF', '#92FE9D'], // Teal/Green
  ['#F2994A', '#F2C94C'], // Orange/Yellow
  ['#FF5F6D', '#FFC371'], // Red/Orange
  ['#11998e', '#38ef7d'], // Green
  ['#c2e59c', '#64b3f4'], // Light Green/Blue
  ['#ff7e5f', '#feb47b'], // Coral
  ['#6a11cb', '#2575fc'], // Purple/Blue
  ['#f79d00', '#64f38c'], // Gold/Green
  ['#FF4E50', '#F9D423'], // Red/Yellow
  ['#00d2ff', '#3a7bd5'], // Light Blue/Dark Blue
  ['#f857a6', '#ff5858'], // Pink/Red
  ['#43e97b', '#38f9d7'], // Aqua
  ['#fa709a', '#fee140'], // Pink/Yellow
  ['#a18cd1', '#fbc2eb'], // Lavender/Pink
  ['#fad0c4', '#ffd1ff'], // Light Pink
];

const PATTERN_PALETTES = [
    { bg: '#f7fafc', fg: '#e2e8f0' }, // gray-100, gray-200
    { bg: '#e0e7ff', fg: '#c7d2fe' }, // indigo-100, indigo-200
    { bg: '#fee2e2', fg: '#fecaca' }, // red-100, red-200
    { bg: '#d1fae5', fg: '#a7f3d0' }, // green-100, green-200
    { bg: '#fef3c7', fg: '#fde68a' }, // amber-100, amber-200
    { bg: '#f3e8ff', fg: '#e9d5ff' }, // purple-100, purple-200
]

function random(rng: () => number, min: number, max: number) {
  return rng() * (max - min) + min;
}

export const generateGradientPreset = (id: string, name: string, isNew = false): Preset => {
    const rng = seedrandom(id);
    const palette = PALETTES[Math.floor(rng() * PALETTES.length)];
    const gradientType = rng() > 0.7 ? 'radial' : 'linear';

    const layer: GradientLayer = {
        id: `layer-${id}`,
        name: 'Generated Gradient',
        type: LayerType.GRADIENT,
        visible: true,
        opacity: 1,
        blendMode: 'normal',
        gradientType,
        angle: Math.floor(rng() * 360),
        stops: [
            { id: 's1', color: palette[0], offset: 0 },
            { id: 's2', color: palette[1], offset: 100 },
        ],
    };

    return {
        id,
        name,
        category: 'Gradients',
        isNew,
        canvas: { width: 500, height: 500, background: '#ffffff' },
        layers: [layer],
    };
};

export const generateBlobPreset = (id: string, name: string, isNew = false): Preset => {
    const rng = seedrandom(id);
    const palette = PALETTES[Math.floor(rng() * PALETTES.length)];
    
    const bgLayer: GradientLayer = {
        id: `layer-bg-${id}`,
        name: 'Background',
        type: LayerType.GRADIENT,
        visible: true,
        opacity: 1,
        blendMode: 'normal',
        gradientType: 'radial',
        angle: 0,
        stops: [
            { id: 's1', color: palette[0] + '33', offset: 0 },
            { id: 's2', color: palette[1] + '11', offset: 100 },
        ]
    }

    const blobLayer: BlobLayer = {
        id: `layer-blob-${id}`,
        name: 'Main Blob',
        type: LayerType.BLOB,
        visible: true,
        opacity: 0.8,
        blendMode: 'overlay',
        color: palette[0],
        seed: random(rng, 1, 1000),
        points: Math.floor(random(rng, 5, 10)),
        chaos: random(rng, 0.3, 0.8),
        x: random(rng, 0.2, 0.8),
        y: random(rng, 0.2, 0.8),
        scale: random(rng, 0.6, 1.2),
    };
    
    const blobLayer2 = { ...blobLayer, id: `layer-blob2-${id}`, color: palette[1], seed: random(rng, 1, 1000), x: 1 - blobLayer.x, y: 1-blobLayer.y, scale: blobLayer.scale * 0.8, opacity: 0.7, blendMode: 'lighten' };

    return {
        id,
        name,
        category: 'Decorative',
        isNew,
        canvas: { width: 500, height: 500, background: '#f0f2ff' },
        layers: [blobLayer2, blobLayer, bgLayer],
    };
};

export const generatePatternPreset = (id: string, name: string, isNew = false): Preset => {
    const rng = seedrandom(id);
    const palette = PATTERN_PALETTES[Math.floor(rng() * PATTERN_PALETTES.length)];
    const types: PatternLayer['patternType'][] = ['dots', 'lines', 'squares'];
    
    const layer: PatternLayer = {
        id: `layer-${id}`,
        name: 'Generated Pattern',
        type: LayerType.PATTERN,
        visible: true,
        opacity: 1,
        blendMode: 'normal',
        patternType: types[Math.floor(rng() * types.length)],
        backgroundColor: palette.bg,
        foregroundColor: palette.fg,
        scale: Math.floor(random(rng, 10, 40)),
        angle: [0, 45, 90][Math.floor(rng() * 3)],
    };

    return {
        id,
        name,
        category: 'Geometric',
        isNew,
        canvas: { width: 500, height: 500, background: palette.bg },
        layers: [layer],
    };
};

export const generateWavePreset = (id: string, name: string, isNew = false): Preset => {
    const rng = seedrandom(id);
    const palette = PALETTES[Math.floor(rng() * PALETTES.length)];
    
    const bgLayer: GradientLayer = {
        id: `layer-bg-${id}`,
        name: 'Background',
        type: LayerType.GRADIENT,
        visible: true,
        opacity: 1,
        blendMode: 'normal',
        gradientType: 'linear',
        angle: random(rng, 0, 360),
        stops: [
            { id: 's1', color: palette[0], offset: 0 },
            { id: 's2', color: palette[1], offset: 100 },
        ]
    }

    const waveLayer: WaveLayer = {
        id: `layer-wave1-${id}`,
        name: 'Wave 1',
        type: LayerType.WAVE,
        visible: true,
        opacity: 0.1,
        blendMode: 'soft-light',
        color: '#ffffff',
        seed: random(rng, 1, 1000),
        points: Math.floor(random(rng, 5, 15)),
        wavelength: random(rng, 100, 300),
        amplitude: random(rng, 40, 80),
        y: random(rng, 0.4, 0.6),
    };
    
    const waveLayer2 = {...waveLayer, id: `layer-wave2-${id}`, seed: random(rng, 1, 1000), opacity: 0.15, y: waveLayer.y + random(rng, -0.1, 0.1)};
    const waveLayer3 = {...waveLayer, id: `layer-wave3-${id}`, seed: random(rng, 1, 1000), opacity: 0.05, blendMode: 'overlay', y: waveLayer.y + random(rng, -0.2, 0.2)};

    return {
        id,
        name,
        category: 'Waves',
        isNew,
        canvas: { width: 500, height: 500, background: '#111827' },
        layers: [waveLayer3, waveLayer2, waveLayer, bgLayer],
    };
};


export const generateAbstractPreset = (id: string, name: string, isNew = false): Preset => {
    const rng = seedrandom(id);
    const palette = PALETTES[Math.floor(rng() * PALETTES.length)];
    const numLayers = Math.floor(random(rng, 3, 6));

    const layers = Array.from({ length: numLayers }, (_, i) => {
        const blendModes = ['overlay', 'soft-light', 'screen', 'lighten'];
        const blob: BlobLayer = {
            id: `layer-abs-${id}-${i}`,
            name: `Abstract Blob ${i}`,
            type: LayerType.BLOB,
            visible: true,
            opacity: random(rng, 0.4, 0.9),
            blendMode: blendModes[i % blendModes.length],
            color: PALETTES[Math.floor(rng() * PALETTES.length)][Math.floor(rng() * 2)],
            seed: random(rng, 1, 1000),
            points: Math.floor(random(rng, 4, 8)),
            chaos: random(rng, 0.5, 1),
            x: random(rng, 0.1, 0.9),
            y: random(rng, 0.1, 0.9),
            scale: random(rng, 0.5, 1.1),
        };
        return blob;
    });

    return {
        id,
        name,
        category: 'Abstract',
        isNew,
        canvas: { width: 500, height: 500, background: palette[0] },
        layers: layers.reverse(), // Render last layer first (bottom)
    };
};