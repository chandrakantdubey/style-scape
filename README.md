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
- Aspect-ratio previews, text-safe-area overlay, PNG exports up to 4K, and short browser-recorded WebM
- Generated React, Vue 3, and Angular components, plus a self-contained offline HTML export
- Local-first access; optional Clerk sign-in, private cloud projects, 30 retained revisions, and revocable public snapshots

## Full-stack structure

- **studio/** is the browser app and generated API client.
- **services/api/** is the Express API for owner-scoped projects, optimistic revision updates, and public immutable snapshots.
- **services/db/** defines PostgreSQL storage for projects, revisions, and publications.
- **services/api-zod/** contains request/response validation.
- **services/api/src/middlewares/clerkProxyMiddleware.ts** handles Clerk's same-origin authentication proxy.

Start the web and API workflows separately. Provision PostgreSQL and configure Clerk and database secrets through the deployment environment (never commit credentials). Apply the schema with **pnpm db:push** before starting the API. The API must be served under the same origin at **/api** so browser cookies are not shared with an unrelated host.

The included Vercel configuration builds the static studio only; it does not provision PostgreSQL or deploy the API. For cloud projects, deploy the API and database as well, with same-origin **/api** routing and the environment variables listed in **services/api** and **services/db**. Local scene generation, exports, and browser saves work independently.

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
