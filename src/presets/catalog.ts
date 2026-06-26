import type { Preset, PresetCategory, PresetTheme } from "../state/types";
import {
  generateAbstractPreset,
  generateBauhausPreset,
  generateDotsPreset,
  generateGlassPreset,
  generateGradientPreset,
  generateGridPreset,
  generateMeshPreset,
  generateMosaicPreset,
  generateNoisePreset,
  generatePlasmaPreset,
  generateStripesPreset,
  generateTopoPreset,
  generateWavePreset,
} from "./focusedGenerators";

export const ACTIVE_CATEGORIES = [
  "Topo",
  "Bauhaus",
  "Gradients",
  "Plasma",
  "Mosaic",
  "Waves",
  "Mesh",
  "Glassmorphism",
  "Grid",
  "Abstract",
  "Stripes",
  "Dots",
  "Noise",
] as const satisfies readonly PresetCategory[];

export type ActivePresetCategory = (typeof ACTIVE_CATEGORIES)[number];

export const generatorMap: Record<
  ActivePresetCategory,
  (
    id: string,
    name: string,
    theme: PresetTheme,
    isNew: boolean,
    seed: string,
    customPalette?: string[][],
    presetIndex?: number
  ) => Preset
> = {
  Gradients: generateGradientPreset,
  Waves: generateWavePreset,
  Grid: generateGridPreset,
  Glassmorphism: generateGlassPreset,
  Abstract: generateAbstractPreset,
  Mesh: generateMeshPreset,
  Stripes: generateStripesPreset,
  Mosaic: generateMosaicPreset,
  Dots: generateDotsPreset,
  Plasma: generatePlasmaPreset,
  Noise: generateNoisePreset,
  Topo: generateTopoPreset,
  Bauhaus: generateBauhausPreset,
};

export function isActiveCategory(category: string): category is ActivePresetCategory {
  return ACTIVE_CATEGORIES.includes(category as ActivePresetCategory);
}
