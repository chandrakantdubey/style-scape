import type { Preset, PresetCategory, PresetTheme } from "../state/types";
import {
  generateGradientPreset,
  generateBlobPreset,
  generatePatternPreset,
  generateWavePreset,
  generateAbstractPreset,
  generateMetallicPreset,
  generateGridPreset,
  generateMinimalistPreset,
} from "./generators";

const PRESETS_PER_THEME = 40;

const CATEGORIES: PresetCategory[] = [
  "Gradients",
  "Decorative",
  "Geometric",
  "Minimalist",
  "Waves",
  "Abstract",
  "Metallic",
  "Grid",
];

const THEMES: PresetTheme[] = ["light", "dark", "colored"];

const generatorMap: Record<
  PresetCategory,
  (
    id: string,
    name: string,
    theme: PresetTheme,
    isNew: boolean,
    seed: string
  ) => Preset
> = {
  Gradients: generateGradientPreset,
  Decorative: generateBlobPreset,
  Geometric: generatePatternPreset,
  Minimalist: generateMinimalistPreset,
  Waves: generateWavePreset,
  Abstract: generateAbstractPreset,
  Metallic: generateMetallicPreset,
  Grid: generateGridPreset,
};

export const presets: Preset[] = CATEGORIES.flatMap((category) => {
  const generator = generatorMap[category];
  return THEMES.flatMap((theme) => {
    return Array.from({ length: PRESETS_PER_THEME }, (_, i) => {
      // const presetIndex = (catIndex * THEMES.length * PRESETS_PER_THEME) + (themeIndex * PRESETS_PER_THEME) + i;
      const id = `${category.toLowerCase().replace(" ", "")}-${theme}-${i}`;
      const name = `${category} ${
        theme.charAt(0).toUpperCase() + theme.slice(1)
      } #${i + 1}`;
      const isNew = i < 5; // Make first 5 of each theme new

      // Use the static `id` as the seed for deterministic generation.
      const seed = id;

      return generator(id, name, theme, isNew, seed);
    });
  });
});
