# Production Readiness Gate

This branch is the production-hardening line for `brand-identity.alazab.com`.

## Must pass before merge

- [ ] Node.js 24 typecheck passes.
- [ ] ESLint passes without errors.
- [ ] Vitest passes.
- [ ] Vite production build passes.
- [ ] Supabase generated types are regenerated from the actual production schema.
- [ ] Portal RLS is verified with an admin account and a client account.
- [ ] `portal-daftra` routes are tested live from the server against a real Work Order.
- [ ] `portal-magicplan` routes are tested live from the server using `key` + `customer` headers.
- [ ] `portal-files` is tested live against the configured MinIO target.
- [ ] Password reset redirect is allowed in Supabase Auth configuration.
- [ ] Client creation / project linking / unlinking are tested end-to-end.
- [ ] No runtime `.env` file or generated business datasets are tracked in Git.
- [ ] Public repository history containing generated operational data is remediated separately before production sign-off.
- [ ] Production deploy runs from a reproducible pnpm lockfile.
- [ ] Browser smoke test covers home, portal login, portal dashboard and one linked project.

## External integration policy

No external API route is considered production-ready from documentation alone. Daftra, Magicplan and MinIO operations must be verified from the deployment server and the observed response shape must match the portal adapter before sign-off.
