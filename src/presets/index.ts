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
  generateGlassPreset,
} from "./generators";

import {
  generateNoisePreset,
  generateStripedPreset,
  generateParticlePreset,
  generateMeshPreset,
} from "./enhancedGenerators";

const PRESETS_PER_THEME = 10;

const CATEGORIES: PresetCategory[] = [
  "Gradients",
  "Decorative",
  "Geometric",
  "Minimalist",
  "Waves",
  "Abstract",
  "Metallic",
  "Grid",
  "Glassmorphism",
  "Texture",
  "Particles",
  "Mesh",
  "Stripe",
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
  Glassmorphism: generateGlassPreset,
  Texture: generateNoisePreset,
  Particles: generateParticlePreset,
  Mesh: generateMeshPreset,
  Stripe: generateStripedPreset,
};

export const presets: Preset[] = CATEGORIES.flatMap((category, _catIndex) => {
  const generator = generatorMap[category];
  return THEMES.flatMap((theme, _themeIndex) => {
    return Array.from({ length: PRESETS_PER_THEME }, (_, i) => {
      const id = `${category.toLowerCase().replace(" ", "")}-${theme}-${i}`;
      const name = `${category} ${
        theme.charAt(0).toUpperCase() + theme.slice(1)
      } #${i + 1}`;
      const isNew = i < 5;
      const seed = id;

      return generator(id, name, theme, isNew, seed);
    });
  });
});
