# Brand Identity

> **Production runtime requirement:** Node.js **24.x only**. The project rejects installation and deployment on any other Node.js major version.
>
> Enforcement: `.nvmrc`, `.node-version`, `package.json#engines`, `.npmrc#engine-strict`, and `deploy.sh`.

## Project

Production website for **Brand Identity – Alazab Group**.

## Runtime

Node.js 24 is mandatory.

```sh
node -v
# must be v24.x.x
```

Use the repository runtime pin:

```sh
nvm use
```

## Local development

```sh
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

The deployment script exits before dependency installation or build execution when the active Node.js major version is not exactly 24.

## Stack

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS
- Supabase

## Production domain

`https://brand-identity.alazab.com`
