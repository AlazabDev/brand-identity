# Brand Identity

Production website for **Brand Identity – Alazab Group**.

## Runtime requirement

**Node.js 24.x is mandatory.**

The repository is intentionally configured to reject installation or production deployment on any Node.js major version other than 24.

Enforcement layers:

- `.nvmrc` → `24`
- `.node-version` → `24`
- `package.json` → `engines.node: >=24 <25`
- `.npmrc` → `engine-strict=true`
- `deploy.sh` → hard failure unless `node -v` reports major version `24`

```sh
node -v
# required: v24.x.x
```

## Local development

```sh
nvm use
pnpm install
pnpm dev
```

## Quality checks

```sh
pnpm lint
pnpm test
pnpm build
```

## Production deployment

```sh
bash deploy.sh
```

The deployment script validates Node.js 24 before checking pnpm, installing dependencies, or running the production build.

## Stack

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS
- Supabase

## Production domain

`https://brand-identity.alazab.com`
