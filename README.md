# Brand Identity

Production website for **Brand Identity – Alazab Group**.

## Runtime requirement

**Node.js 24 is mandatory.**

The project intentionally rejects installation and production deployment on any Node.js major version other than 24.

```bash
node -v
# must be v24.x.x
```

Version-manager files are included:

- `.nvmrc` → `24`
- `.node-version` → `24`
- `package.json` → `engines.node: >=24 <25`
- `.npmrc` → `engine-strict=true`
- `deploy.sh` → hard-fails unless Node major is exactly `24`

## Local development

```bash
nvm use
pnpm install
pnpm dev
```

## Production build

```bash
pnpm build
```

## Production deployment

```bash
bash deploy.sh
```

The deployment script validates Node.js 24 before dependency installation or build execution.
