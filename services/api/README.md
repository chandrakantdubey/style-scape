# Style Scape API

Express service for private projects, revision history, and revocable public scene snapshots.

## Run

Configure `DATABASE_URL`, `CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY` through your deployment's secret manager. Apply committed migrations using `pnpm db:migrate`, then start with `pnpm api:dev`. It requires Node.js 22 and serves routes under `/api`.

The browser frontend must send these routes to this service on the same origin so Clerk's cookie-based authentication works. Do not expose credentials in client code or commit them.

The OpenAPI contract is in `openapi.yaml`. Requests are validated, private operations are scoped to the verified user, and public links expose immutable scene snapshots only.
