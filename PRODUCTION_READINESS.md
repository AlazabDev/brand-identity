# Production Release Gate — Brand Identity

This file is the release gate for `brand-identity.alazab.com`.

## Automated gate

The `Production Readiness` workflow must pass on Node.js 24:

- TypeScript typecheck
- ESLint
- Vitest
- Vite production build

A browser smoke suite is available through `pnpm test:e2e` after the production build.

## Database gate

Before release, verify the actual Supabase database — not repository migrations alone:

- `projects` contains `daftra_work_order_id`, `magicplan_project_id`, `magicplan_plan_id`, `minio_prefix`, `progress`, `status`.
- `progress` is constrained to 0..100.
- RLS is enabled for portal tables.
- A client can read only linked projects and milestones.
- An admin can manage links and project integration fields.
- Client profile/project user IDs cascade from `auth.users`.

## Live external-system gate

No external integration is production-approved from documentation alone.

- Magicplan: test from the deployment server with `key` + `customer` headers and compare the live JSON shape with `portal-magicplan`.
- Daftra: test the exact Work Order and invoice requests used by `portal-daftra` against a real linked Work Order.
- MinIO: test list pagination and one signed object URL using the exact production endpoint/bucket configuration.

Do not commit credentials, cookies, access/refresh tokens, or signed temporary URLs as evidence.

## Portal gate

Use dedicated test accounts to verify:

- client login and password reset;
- admin creates a client;
- admin links/unlinks projects;
- client sees only linked projects;
- financial tab loads Daftra for a linked Work Order;
- design tab loads the linked Magicplan project;
- files tab lists MinIO files for the project prefix;
- logout and expired-session behavior.

## Deliberately gated features

The project assistant and approvals workflow are not exposed in production navigation until their server-side contracts are implemented and live-tested. This avoids shipping UI that calls a nonexistent backend or writes to a table that has not been provisioned.

## Repository security gate

Generated Daftra operational exports were removed from the current tree and are ignored going forward. Because the repository is public, deleting them in a new commit does not remove earlier Git history. Public-history remediation / repository visibility must be handled before final production sign-off.
