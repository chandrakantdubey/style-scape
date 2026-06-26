# StyleScape

Procedural background pattern generator. Browse a curated library, tweak with a color palette, and export to CSS, SVG, or PNG.

![React 19](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-6-blue) ![Vite](https://img.shields.io/badge/Vite-8-purple) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan)

## What it does

- **Eight pattern categories**: Gradients, Waves, Grid, Glassmorphism, Abstract, Mesh, Stripes, Mosaic
- **Three themes per category**: Light, Dark, Colored
- **240+ curated presets** in the library, plus "Generate 10 more" on demand
- **Custom palette generator**: pick 2–5 colors, choose a pattern type, get 10 unique variations
- **One-click export**: copy to clipboard as CSS, Tailwind, React, Vue, Svelte, or download as SVG / PNG
- **Favorites + session memory**: bookmark patterns and resume where you left off
- **Keyboard shortcuts**: navigate the entire app without a mouse

## Quick start

```bash
git clone <repo-url>
cd style-scape
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | Generate a coverage report |

## How it works

A `Preset` is a pure value of `{ canvas, layers[] }`. Every layer is one of five primitives:

| Layer | Renders | Used by |
| --- | --- | --- |
| `GradientLayer` | Linear or radial CSS-style gradient | every category |
| `BlobLayer` | Closed organic SVG path with controllable chaos | Glassmorphism, Abstract |
| `WaveLayer` | Sine/spline wave path | Waves, Abstract |
| `PatternLayer` | Tiled SVG `<pattern>` (dots, lines, hexagons, …) | Grid, Stripes, Mosaic |
| `ImageLayer` | Embedded `<image>` ref | User imports |

`renderSVG(state)` walks the layer list and produces a deterministic SVG string. Same input always yields the same output, which lets us bootstrap the curated catalog at build time and reproduce user-generated variations across sessions.

```
src/
├── App.tsx                      # Routes + global background cycle widget
├── components/                  # UI primitives (Icons, KeyboardShortcuts)
├── hooks/                       # useFavorites, useDebounce, useSessionState, …
├── pages/
│   ├── HomePage.tsx             # Library browser
│   ├── GeneratorPage.tsx        # Custom-palette generator
│   └── PatternDetailPage.tsx    # Single-pattern view + export controls
├── presets/
│   ├── catalog.ts               # Category registry + generator map
│   ├── focusedGenerators.ts     # 8 per-category preset generators
│   └── index.ts                 # Bootstraps the curated catalog
├── render/                      # Pure SVG rendering pipeline
├── state/
│   ├── store.ts                 # Zustand store with undo/redo
│   ├── timelineSlice.ts         # Undo/redo helpers (coalesce + bound)
│   └── types.ts                 # Core type system
└── utils/
    ├── colorAnalyzer.ts         # Average-luminance helper for theming
    └── migrateAppState.ts       # v1 → v2 persisted-state migrator
```

## Adding a new pattern category

1. Add the category name to `PresetCategory` in `src/state/types.ts`.
2. Write a generator function in `src/presets/focusedGenerators.ts` that returns a `Preset`. It receives `(id, name, theme, isNew, seed, customPalette?)` and must be deterministic given the same `seed`.
3. Register the generator in `ACTIVE_CATEGORIES` and `generatorMap` in `src/presets/catalog.ts`.

The library page, generator page, and category filter all read from `ACTIVE_CATEGORIES` automatically — no UI work needed.

## Persisted state

User data lives in `localStorage`:

- `bggen_v1` — the current pattern state (`AppState`)
- `user_created_presets` — array of user-generated presets

Both are loaded through `migrateAppState` / `migrateUserPresets` in `src/utils/migrateAppState.ts`. The migrator is total (never throws) and stamps a `schemaVersion: 2` field so future format changes can be detected.

## Tech stack

- **React 19** + the React Compiler
- **TypeScript** with strict mode
- **Vite 8** for dev / build, with Tailwind CSS 4 via its Vite plugin
- **Zustand 5** + Immer for state, with a small undo/redo timeline layered on top
- **react-router 7** for client-side routing
- **react-colorful** for the color pickers
- **seedrandom** for deterministic generation
- **Vitest** + `@testing-library/react` for tests

## License

MIT.
