# Style Scape v2

A local-first procedural graphics studio. No AI services or inference: seeded mathematics generates every scene.

## Run

Use Node.js 22 or newer and pnpm 10.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

The active application lives in **studio/**. The previous source remains in **src/** for reference and is not part of the v2 build.

## Features

- Seeded flow-field ribbons with layered noise and domain warping
- Interference background, grain, palettes, and blend controls
- Controlled variations with parameter-group locks
- Undo/redo, local saved scenes, validated JSON import/export
- PNG export up to 4K; standalone offline HTML
- React component and dependency-free runtime downloads

## Runtime and exports

The editor and HTML/React exports use the same source: studio/src/runtime/stylescape-runtime.js.
Export both the React component and runtime into the same directory.
The runtime handles resize, visibility, reduced motion, and cleanup.

## Current limitations

Saved work stays in this browser; there are no cloud accounts or synchronization.
The Canvas 2D fallback is simplified and static. PNG captures use animation time zero.
There is no video, SVG, general layer editor, or seamless-loop guarantee.
This is the first engine/export milestone, not the entire v2 roadmap.

## Verification

Type checking and production bundling are available through pnpm build.
Browser rendering has been visually checked; automated browser interaction coverage is not included in this first milestone.
