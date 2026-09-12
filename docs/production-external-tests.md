# External integration release gate

Production approval requires live server-side verification. Documentation and OpenAPI files are reference material only.

## Magicplan

Required runtime configuration:

- `MAGICPLAN_API_KEY`
- `MAGICPLAN_ID`

Verified base host from prior live testing: `https://cloud.magicplan.app/api/v2`.

Before release, execute the exact routes used by `portal-magicplan` from the deployment server with the configured `key` and `customer` headers, record HTTP status and JSON shape, and compare it to the adapter. Do not add cookies unless the cookie-free request demonstrably fails and the cause is confirmed.

## Daftra

Required runtime configuration:

- `DAFTRA_API_KEY`
- `DAFTRA_BASE_URL`

The portal mapping is `projects.daftra_work_order_id`. Before release, test the Work Order lookup and the invoice query used by `portal-daftra` against a real linked Work Order and compare field names/pagination to the live response.

## MinIO

Required runtime configuration:

- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`

`MINIO_ENDPOINT` may already include the bucket path. If it is the generic service endpoint, `MINIO_BUCKET` is additionally required. Test list pagination and one generated signed object URL against a real project prefix.

## Evidence to retain

For every live test retain:

- route (without credentials),
- HTTP status,
- response field structure,
- pagination behavior,
- execution timestamp,
- deployment commit SHA.

Never store live credentials or signed temporary URLs in this repository.
