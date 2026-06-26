import type { Preset, PresetCategory, PresetTheme } from "../state/types";
import { ACTIVE_CATEGORIES, generatorMap } from "./catalog";

const PRESETS_PER_THEME = 40;

const CATEGORIES: readonly PresetCategory[] = ACTIVE_CATEGORIES;
const THEMES: readonly PresetTheme[] = ["light", "dark"];

/**
 * Seed salt: a tiny tag string per index keeps adjacent seeds from
 * hashing to similar RNG streams (which was the root cause of visual
 * duplicates in early builds).
 */
const SEED_SALTS = [
  "alpha",
  "beta",
  "gamma",
  "delta",
  "epsilon",
  "zeta",
  "eta",
  "theta",
  "iota",
  "kappa",
];

export const presets: Preset[] = CATEGORIES.flatMap((category) => {
  const generator = generatorMap[category];
  return THEMES.flatMap((theme) => {
    return Array.from({ length: PRESETS_PER_THEME }, (_, i) => {
      const id = `${category.toLowerCase().replace(" ", "")}-${theme}-${i}`;
      const name = `${category} ${
        theme.charAt(0).toUpperCase() + theme.slice(1)
      } #${i + 1}`;
      const isNew = i < 3;
      // Salt + index so adjacent seeds yield diverse RNG streams.
      const seed = `${id}-${SEED_SALTS[i % SEED_SALTS.length]}-${i}`;
      return generator(id, name, theme, isNew, seed, undefined, i);
    });
  });
});
