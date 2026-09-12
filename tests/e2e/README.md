# Browser smoke tests

These tests intentionally cover only routes that can run without production credentials.

Authenticated client/admin project tests belong to the live production-readiness pass and must use dedicated test accounts plus the real RLS policies. External Daftra, Magicplan and MinIO routes are not mocked into a green production sign-off; they must be verified directly from the deployment server.
