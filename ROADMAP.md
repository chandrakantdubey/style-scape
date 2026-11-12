# Remaining Work

This checklist records work that is not included in the current implementation. The active studio is in **studio/**; the previous application source remains in **src/** for reference. The live site is not replaced until this branch is merged and deployed.

## Before replacing the live site

- [ ] **Preserve existing browser data.** Inspect the legacy favorites and user-preset formats, add an explicit import or migration into the v2 local library, and keep the old values untouched until the user confirms the import. Report imported and unsupported items clearly.
- [ ] **Verify the public and signed-in paths.** With a configured Clerk test account, confirm studio use without login; verify private cloud create/save/revision/delete; open a public snapshot without login; and confirm revocation and cross-account access protections.

## Before enabling cloud projects in production

- [ ] **Configure hosting and PostgreSQL.** Set the three required secrets in the chosen host's secret manager, provision the database, apply the committed migration with `pnpm db:migrate`, and deploy the same-origin `/api` function.
- [ ] **Run production smoke checks.** Verify a visitor can generate and export without signing in, cloud operations require the owner account, public snapshots are read-only and revocable, and errors are logged without exposing private project data.
- [ ] **Review hosting limits and costs** for the selected app host and database before enabling public cloud saves.

## Release checklist

- [ ] Test the deployed studio on desktop and mobile, including SVG, PNG, WebM, and framework exports.
- [ ] Confirm the previous live URL remains unchanged until the new branch is intentionally released; keep the legacy source available for reference.
