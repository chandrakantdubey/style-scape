import type { Preset, PresetCategory, PresetTheme } from "../state/types";
import {
  generateAbstractPreset,
  generateGlassPreset,
  generateGradientPreset,
  generateGridPreset,
  generateWavePreset,
} from "./focusedGenerators";

export const ACTIVE_CATEGORIES = [
  "Gradients",
  "Waves",
  "Grid",
  "Glassmorphism",
  "Abstract",
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
    customPalette?: string[][]
  ) => Preset
> = {
  Gradients: generateGradientPreset,
  Waves: generateWavePreset,
  Grid: generateGridPreset,
  Glassmorphism: generateGlassPreset,
  Abstract: generateAbstractPreset,
};

export function isActiveCategory(category: string): category is ActivePresetCategory {
  return ACTIVE_CATEGORIES.includes(category as ActivePresetCategory);
}
