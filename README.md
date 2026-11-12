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

- Three deterministic vector fields: warped curl, multi-vortex orbit, and noise-isoline flow
- GPU-assisted rendering, a Canvas 2D fallback, palettes, blend modes, interference, grain, and animation
- Seeded variations with locked parameter groups, undo/redo, local saves, and validated scene JSON
- Reorderable vector-layer stack with visibility, opacity, colors, detail, and blend controls
- Aspect-ratio previews, text-safe-area overlay, PNG exports up to 4K, and short browser-recorded WebM
- Editable SVG output, generated React/Vue/Angular components, and self-contained offline HTML
- Local-first access; optional Clerk sign-in, private cloud projects, 30 retained revisions, and revocable public snapshots

## Full-stack structure

- **studio/** is the browser app and generated API client.
- **services/api/** is the Express API for owner-scoped projects, optimistic revision updates, and public immutable snapshots.
- **services/db/** defines PostgreSQL storage for projects, revisions, and publications.
- **services/api-zod/** contains request/response validation.
- **services/api/src/middlewares/clerkProxyMiddleware.ts** handles Clerk's same-origin authentication proxy.

The Vercel function in **api/[...path].ts** serves the Express API on the same origin as the studio. Configure **DATABASE_URL**, **CLERK_PUBLISHABLE_KEY**, and **CLERK_SECRET_KEY** in the host's secret manager (never commit credentials). Generate migrations with **pnpm db:generate** and apply them with **pnpm db:migrate**. The Vercel function and Clerk proxy stay under **/api**.

The repository can deploy API code with the studio, but it does not provision PostgreSQL or create the three required secrets. Cloud hosting and database-provider usage limits may apply. Local generation, exports, and browser saves work without the cloud service.

## Development

Use Node.js 22 or newer and pnpm 10.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm test
pnpm api:dev
```

HTML exports work offline. React, Vue, and Angular exports include the same plain JavaScript renderer as the studio; download both a component and **stylescape-runtime.js**. WebM export uses the browser's MediaRecorder implementation, so codec quality varies. The Canvas 2D fallback is intentionally simplified; it does not match every GPU effect.

## Verification

**pnpm build** type-checks and bundles the app. The API has its own **pnpm api:build** and strict typecheck. Test unauthenticated, authenticated, database, and public-share behavior against a configured deployment before production use.
