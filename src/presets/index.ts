import type { Preset } from '../state/types';
import { generateGradientPreset, generateBlobPreset, generatePatternPreset, generateWavePreset, generateAbstractPreset } from './generators';

const PRESET_COUNT = {
    GRADIENTS: 120,
    DECORATIVE: 110,
    GEOMETRIC: 90,
    WAVES: 100,
    ABSTRACT: 110,
};

const gradientPresets: Preset[] = Array.from({ length: PRESET_COUNT.GRADIENTS }, (_, i) => 
    generateGradientPreset(`grad-${i}`, `Gradient Sky ${i + 1}`, i < 10)
);

const decorativePresets: Preset[] = Array.from({ length: PRESET_COUNT.DECORATIVE }, (_, i) => 
    generateBlobPreset(`blob-${i}`, `Soft Blob ${i + 1}`, i < 10)
);

const geometricPresets: Preset[] = Array.from({ length: PRESET_COUNT.GEOMETRIC }, (_, i) =>
    generatePatternPreset(`pattern-${i}`, `Geo Pattern ${i + 1}`, i < 10)
);

const wavePresets: Preset[] = Array.from({ length: PRESET_COUNT.WAVES }, (_, i) =>
    generateWavePreset(`wave-${i}`, `Flowing Wave ${i + 1}`, i < 10)
);

const abstractPresets: Preset[] = Array.from({ length: PRESET_COUNT.ABSTRACT }, (_, i) =>
    generateAbstractPreset(`abstract-${i}`, `Abstract Shape ${i + 1}`, i < 10)
);

export const presets: Preset[] = [
    ...gradientPresets,
    ...decorativePresets,
    ...geometricPresets,
    ...wavePresets,
    ...abstractPresets,
];