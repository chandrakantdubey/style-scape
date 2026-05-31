import type { Preset, PresetCategory, PresetTheme } from "../state/types";
import { ACTIVE_CATEGORIES, generatorMap } from "./catalog";

const PRESETS_PER_THEME = 10;

const CATEGORIES: readonly PresetCategory[] = ACTIVE_CATEGORIES;

const THEMES: PresetTheme[] = ["light", "dark", "colored"];

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
