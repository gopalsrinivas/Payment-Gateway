# Security and Secrets

## Secret Rules

- Commit only `.env.example` files.
- Keep `.env`, `.env.local`, `.env.production`, database dumps, private keys, and deployment credentials out of Git.
- Keep `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `JWT_SECRET`, and database passwords backend-only.
- Frontend uses only intentional `NEXT_PUBLIC_*` values.
- Never print secrets in logs, workflows, Dockerfiles, Compose files, or documentation.

## Configured Scans

- CodeQL for JavaScript/TypeScript.
- `npm audit --audit-level=high`.
- Trivy filesystem and image scans for HIGH and CRITICAL findings.
- Gitleaks secret scanning.
- Dependabot for npm, GitHub Actions, and Docker.

## Hardening

- Node 22 Alpine runtime images.
- Non-root backend and frontend containers.
- PostgreSQL is not publicly exposed in production Compose.
- Log rotation is configured.
- `no-new-privileges` is enabled where practical.
- Backend production startup fails when required secrets are missing.

## Monitoring and Alerts

Monitor backend/frontend availability, PostgreSQL health, disk usage, HTTP 5xx rate, latency, migration failures, webhook verification failures, payment initialization failures, backup failures, and certificate expiration.

Swagger may be available for staging and interview demos. Restrict or disable it for public production-like deployments when not needed.
