# Payment Gateway Demo

# Part-6 – DevOps, CI/CD, Deployment and Operations

---

# 1. Objective

Part 6 operationalizes the complete Payment Gateway Demo built in Parts 1-5.

This phase must provide a repeatable, secure, observable, and interview-ready delivery process for the Node.js backend, Next.js frontend, PostgreSQL database, and Razorpay Test Mode integration.

Part 6 covers local containerization, continuous integration, continuous delivery foundations, deployment configuration, environment separation, secret management, database migrations, monitoring, logging, backups, security scanning, rollback, and operational documentation.

The implementation must remain practical for a demonstration project. Avoid unnecessary enterprise infrastructure, paid services, and complex platform abstractions unless they are clearly optional.

---

# 2. Prerequisites

Before starting Part 6, confirm that:

- Part-1 project setup, authentication, Swagger, logging, health checks, and Docker foundation work.
- Part-2 migrations, seeders, models, relationships, constraints, indexes, audit fields, and soft delete work.
- Part-3 backend APIs and automated tests work.
- Part-4 frontend pages, API integration, route protection, and production build work.
- Part-5 Razorpay Test Mode payment flow, signature verification, webhook processing, idempotency, and tests work.
- Backend and frontend `.env.example` files exist.
- Real `.env` files and secrets are ignored by Git.
- PostgreSQL migrations are the schema source of truth.
- The application can run locally without Docker before container hardening begins.

Required services:

```text
frontend
backend
postgres
```

Optional local-development services:

```text
adminer or pgAdmin
reverse proxy
```

Do not add optional services unless they provide clear value and do not expose production credentials.

---

# 3. Part-6 Scope

Implement or complete:

- Production-ready Dockerfiles for backend and frontend.
- Local Docker Compose configuration.
- Docker health checks and dependency readiness.
- Non-root container execution where practical.
- `.dockerignore` files.
- Environment-specific configuration strategy.
- Secure secret handling documentation.
- Database migration and seed execution strategy.
- CI pipeline for lint, tests, builds, and security checks.
- Docker image build validation.
- Dependency vulnerability scanning.
- Static security scanning.
- Container image scanning.
- Secret scanning.
- Optional image publishing workflow.
- Staging deployment workflow foundation.
- Production deployment guidance without Razorpay Live Mode.
- Release tagging and artifact traceability.
- Logging and request correlation.
- Application and database health checks.
- Monitoring and alerting guidance.
- PostgreSQL backup and restore procedures.
- Rollback procedure.
- Deployment verification and smoke tests.
- Operational runbook.
- README and architecture documentation updates.

---

# 4. Strict Out-of-Scope Rules

Do not implement:

- Razorpay Live Mode.
- Real production payment credentials.
- Automatic production deployment without protected approvals.
- Kubernetes unless supplied only as a clearly optional future extension.
- Terraform or cloud-specific infrastructure unless supplied only as optional examples.
- Paid monitoring dependencies as mandatory requirements.
- Multi-region deployment.
- High-availability PostgreSQL clustering.
- Service mesh.
- Complex GitOps platforms.
- Blue-green or canary infrastructure that cannot be tested in this project.
- Automatic database rollback of destructive migrations.
- Database schema changes unrelated to DevOps requirements.
- New payment or frontend business functionality.

---

# 5. DevOps Principles

Use these principles:

- Build once and promote the same image where practical.
- Keep configuration outside source code.
- Never store secrets in Git.
- Use immutable image tags for releases.
- Use migrations instead of Sequelize schema synchronization.
- Run tests before image publishing or deployment.
- Fail the pipeline on critical quality or security failures.
- Use least privilege.
- Keep logs useful but free of secrets and sensitive payment data.
- Make deployments reversible.
- Separate application health from dependency health.
- Document all required manual steps.
- Do not claim high availability for a single-instance demo deployment.

---

# 6. Target Repository Structure

Preserve the existing structure and add or update the following:

```text
payment_gateway_demo/
|
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── scripts/
│   │   ├── docker-entrypoint.sh
│   │   ├── wait-for-db.js
│   │   └── smoke-test.js
│   └── ...
|
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
|
├── docs/
│   ├── Part-6-DevOps-Payment-Gateway.md
│   ├── deployment-guide.md
│   ├── operations-runbook.md
│   ├── backup-restore-guide.md
│   └── architecture-deployment.md
|
├── scripts/
│   ├── verify-env.js
│   ├── smoke-test.js
│   ├── backup-postgres.sh
│   ├── restore-postgres.sh
│   └── release-check.sh
|
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── security.yml
│   │   ├── docker-build.yml
│   │   └── deploy-staging.yml
│   ├── dependabot.yml
│   └── CODEOWNERS
|
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
├── Makefile                 # optional
└── README.md
```

Create only files that fit the actual repository. Do not create duplicate scripts or workflows when equivalent working files already exist.

---

# 7. Environment Strategy

Use separate configuration for:

```text
development
test
staging
production
```

Rules:

- Commit only `.env.example` files.
- Never commit `.env`, `.env.local`, private keys, database dumps, or credential files.
- Keep Razorpay Key Secret and Webhook Secret backend-only.
- Frontend may receive only public variables prefixed with `NEXT_PUBLIC_`.
- Validate required variables during startup.
- Fail clearly when required configuration is missing.
- Do not print secret values in errors or logs.
- Use different JWT secrets and database credentials for each environment.
- Use Razorpay Test Mode for staging and demo production deployment.

Recommended backend variables:

```env
NODE_ENV=production
PORT=5000
APP_VERSION=replace_with_release_version

DB_HOST=postgres
DB_PORT=5432
DB_NAME=payment_gateway_demo
DB_USER=postgres
DB_PASSWORD=replace_with_secret
DB_SSL=false
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_IDLE_MS=10000
DB_POOL_ACQUIRE_MS=30000

JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=1d

RAZORPAY_KEY_ID=replace_with_test_key_id
RAZORPAY_KEY_SECRET=replace_with_test_key_secret
RAZORPAY_WEBHOOK_SECRET=replace_with_webhook_secret

CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
TRUST_PROXY=false
```

Recommended frontend variables:

```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=replace_with_test_key_id
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=replace_with_release_version
```

---

# 8. Backend Dockerfile

Use a multi-stage Dockerfile when it improves image size and dependency separation.

Requirements:

- Use a supported Node.js LTS image.
- Pin the major Node.js version.
- Set a working directory.
- Copy package manifests before application source for build caching.
- Use `npm ci` when a lock file exists.
- Install production dependencies only in the runtime image.
- Run as a non-root user where practical.
- Set `NODE_ENV=production` in the runtime stage.
- Expose only the backend application port.
- Include a health check or rely on Compose/platform health checks.
- Do not bake `.env` files or secrets into the image.
- Do not run `sequelize.sync()`.
- Use a startup entrypoint that can run migrations safely before the server.
- Ensure graceful shutdown handles `SIGTERM` and `SIGINT`.

Recommended startup order:

```text
validate environment
wait for PostgreSQL
run pending migrations
optionally run explicitly enabled development seeders
start backend server
```

Production seeders must not run automatically unless they are idempotent, explicitly approved, and safe.

---

# 9. Frontend Dockerfile

Use a Next.js multi-stage build.

Requirements:

- Use the same supported Node.js major version as the backend unless a documented reason exists.
- Install dependencies using `npm ci`.
- Run the production build in a builder stage.
- Prefer Next.js standalone output when supported by the current project.
- Copy only required runtime artifacts.
- Run as a non-root user where practical.
- Expose only port `3000`.
- Do not include backend secrets.
- Ensure public build-time variables are deliberately supplied.
- Do not copy development caches, logs, tests, or local `.env` files into the runtime image.

Important limitation:

`NEXT_PUBLIC_*` values are generally embedded at build time. The deployment guide must explain whether frontend images are rebuilt per environment or use a runtime configuration pattern.

For this project, rebuilding the frontend image per environment is acceptable and simpler.

---

# 10. Docker Ignore Rules

Create `backend/.dockerignore` and `frontend/.dockerignore`.

Exclude at minimum:

```text
node_modules
npm-debug.log*
.git
.github
.env
.env.*
!.env.example
logs
coverage
.next
out
Dockerfile*
docker-compose*.yml
*.md
```

Adjust exclusions so required build files are not accidentally omitted.

---

# 11. Docker Compose – Local Development

The root `docker-compose.yml` or `docker-compose.dev.yml` should define:

```text
postgres
backend
frontend
```

PostgreSQL requirements:

- Use a supported PostgreSQL version.
- Use a named volume.
- Configure a health check using `pg_isready`.
- Keep credentials in environment substitution.
- Do not expose PostgreSQL publicly unless required for local development.
- If port `5432` is exposed locally, document that it should not be exposed in production.

Backend requirements:

- Depend on PostgreSQL health, not only container start.
- Use the service name `postgres` as `DB_HOST` inside Compose.
- Expose backend port for local API testing.
- Configure a health check using `/api/v1/health`.
- Mount source only in development mode.
- Do not mount `node_modules` from the host.

Frontend requirements:

- Depend on backend availability where useful.
- Use the browser-reachable backend URL.
- Expose port `3000`.
- Use a production build in production Compose.
- Do not include private backend environment variables.

Network requirements:

- Use one private application network.
- Do not expose unnecessary internal ports.

---

# 12. Production Compose Foundation

Create `docker-compose.prod.yml` only if Compose-based deployment is selected.

Requirements:

- Use prebuilt immutable images.
- Do not build directly on the server unless clearly documented as a small-demo exception.
- Use `restart: unless-stopped` or platform-equivalent behavior.
- Add resource limits where supported.
- Avoid bind mounting application source.
- Use named volumes only for PostgreSQL data and required persistent storage.
- Use an external reverse proxy or platform TLS termination.
- Do not expose PostgreSQL to the public network.
- Inject secrets through the deployment platform or protected environment files outside Git.
- Preserve webhook raw-body behavior through any proxy.

---

# 13. Database Migration Strategy

Migrations are mandatory.

Rules:

- Run `sequelize-cli db:migrate` before starting a new backend release.
- Never use `sequelize.sync({ force: true })` or `sequelize.sync({ alter: true })`.
- Back up the database before risky migrations.
- Prefer backward-compatible expand-and-contract changes.
- Avoid destructive column removal in the same release that removes application usage.
- Do not automatically run migration undo in production.
- Record migration output in deployment logs without database passwords.
- Fail deployment when a migration fails.
- Run only one migration job at a time.

Recommended release order:

```text
backup database when required
run migration job
start or replace backend
verify backend health
deploy frontend
run smoke tests
```

---

# 14. Seed Strategy

Seed categories:

```text
reference seeds
local demo seeds
test fixtures
```

Rules:

- `Admin` and `Customer` roles may be reference seeds.
- Local demo products and demo Admin accounts must not run automatically in staging or production unless explicitly enabled.
- Test data must remain isolated from non-test databases.
- Seeders must be repeatable or must detect existing records safely.
- Never store a real password in documentation.
- A local demo password may be documented only as an obviously non-production credential.

---

# 15. Continuous Integration Pipeline

Create `.github/workflows/ci.yml`.

Trigger on:

```text
pull_request
push to main or development branches
manual workflow dispatch
```

Recommended jobs:

```text
repository checks
backend quality
backend tests with PostgreSQL service
frontend quality and tests
frontend production build
Docker build validation
```

Backend job:

- Checkout source.
- Set up the supported Node.js version.
- Cache npm dependencies.
- Run `npm ci`.
- Start a PostgreSQL service container.
- Use test-only environment values.
- Run migrations.
- Run backend lint.
- Run backend tests.
- Generate coverage if configured.
- Do not use real Razorpay credentials; mock external calls.

Frontend job:

- Run `npm ci`.
- Run frontend lint.
- Run frontend tests.
- Run production build.
- Supply safe placeholder public variables where required.

Docker validation:

- Build backend image.
- Build frontend image.
- Validate Compose configuration.
- Optionally start the stack and run smoke tests.

---

# 16. CI Quality Gates

A pull request must not be considered ready when any required check fails.

Required gates:

- Backend lint passes.
- Backend tests pass.
- Frontend lint passes.
- Frontend tests pass when test tooling exists.
- Frontend production build passes.
- Database migrations apply to a clean test database.
- Docker images build.
- Compose configuration validates.
- Critical secret scanning findings are absent.
- Critical container vulnerabilities are absent or explicitly reviewed.
- No real `.env` or credential file is tracked.

Do not require an unrealistic 100% coverage target. Use a documented practical threshold only if the current test suite can support it.

---

# 17. Security Workflow

Create `.github/workflows/security.yml` or integrate the checks into CI.

Include:

- GitHub CodeQL for JavaScript/TypeScript where supported.
- Dependency review for pull requests where supported.
- `npm audit` with a documented severity threshold.
- Trivy filesystem scan.
- Trivy container image scan.
- Secret scanning using GitHub native protection or a tool such as Gitleaks.
- Optional SBOM generation for release images.

Rules:

- Do not print full vulnerability reports containing secrets.
- Do not ignore all vulnerabilities globally.
- Any suppression must be specific, documented, time-bounded, and justified.
- Fail on critical exploitable findings.
- Review high findings based on reachability and available fixes.

---

# 18. Dependabot

Create `.github/dependabot.yml` for:

```text
backend npm dependencies
frontend npm dependencies
GitHub Actions
Docker base images when supported
```

Recommended schedule:

```text
weekly
```

Group minor and patch updates where useful.

Do not automatically merge major updates.

---

# 19. Docker Image Build and Publishing

Create `.github/workflows/docker-build.yml` only if image publishing is required.

Supported registry examples:

```text
GitHub Container Registry
Docker Hub
cloud platform registry
```

Requirements:

- Authenticate using repository secrets.
- Never place registry passwords in workflow files.
- Build backend and frontend images separately.
- Use immutable tags:

```text
sha-<git-sha>
v1.0.0
```

- A mutable `latest` tag may be optional but must not be the only deployment reference.
- Add OCI labels for source revision and version.
- Generate build provenance or SBOM when practical.
- Publish only after required CI checks pass.

---

# 20. Branch and Release Strategy

Recommended simple strategy:

```text
feature branches
pull request to main
protected main branch
release tags from main
```

Requirements:

- Require CI checks before merge.
- Require at least one review when repository collaboration permits.
- Prevent direct force pushes to main.
- Use semantic release tags such as `v1.0.0`.
- Keep a changelog or release notes.
- Reference the Git commit SHA in deployed application metadata.

---

# 21. Deployment Environments

Recommended environments:

```text
local
staging
demo-production
```

`demo-production` must still use Razorpay Test Mode.

Environment rules:

- Use separate database instances or databases.
- Use separate JWT secrets.
- Use separate Razorpay Test webhook endpoints and secrets where possible.
- Use environment-specific CORS origins.
- Protect staging and production deployment secrets.
- Require manual approval for production-like deployment.
- Avoid using local development seed data in staging or production.

---

# 22. Deployment Options

Document at least one primary deployment path and one optional alternative.

Primary simple option:

```text
Docker Compose on one Linux VM
```

Possible platform option:

```text
frontend on a Next.js-compatible host
backend as a container/web service
managed PostgreSQL
```

Selection criteria:

- Cost.
- Ease of setup.
- HTTPS support.
- Persistent database support.
- Environment secret support.
- Webhook public URL support.
- Log access.
- Rollback support.

Do not claim that a one-VM deployment is highly available.

---

# 23. Reverse Proxy and HTTPS

For VM deployment, use a reverse proxy such as Nginx or Caddy.

Responsibilities:

- Terminate HTTPS.
- Route frontend traffic.
- Route `/api` traffic to backend where chosen.
- Preserve required headers.
- Pass the webhook request body unchanged.
- Apply reasonable request-size and timeout limits.
- Redirect HTTP to HTTPS.
- Forward client and protocol information correctly.

Backend proxy configuration:

- Enable Express `trust proxy` only when deployed behind a trusted proxy.
- Do not trust arbitrary proxy headers in local direct-access mode.

Razorpay webhook endpoint must be publicly reachable over HTTPS for real webhook delivery, even in Test Mode.

---

# 24. Deployment Workflow

Create `.github/workflows/deploy-staging.yml` only when deployment credentials and target details are available.

A safe workflow should:

1. Depend on successful CI.
2. Use an immutable image tag.
3. Use a protected GitHub Environment.
4. Retrieve deployment secrets from protected secrets.
5. Run or trigger migrations exactly once.
6. Deploy backend.
7. Verify backend health.
8. Deploy frontend.
9. Run smoke tests.
10. Record deployed version.
11. Stop and report failure when verification fails.

Production-like deployment should require manual approval.

Do not create fake cloud credentials or pretend deployment succeeded without a configured target.

---

# 25. Health and Readiness

Preserve:

```text
GET /api/v1/health
```

Recommended health response:

```json
{
  "success": true,
  "message": "Application is healthy",
  "data": {
    "status": "UP",
    "database": "UP",
    "environment": "production",
    "version": "v1.0.0",
    "uptimeSeconds": 120
  },
  "statusCode": 200
}
```

Rules:

- Do not expose secrets, credentials, full configuration, stack traces, or internal network details.
- Return non-200 when the application cannot safely serve requests.
- Do not make the health endpoint call Razorpay on every request.
- Add a lightweight frontend availability check through the platform or smoke-test script.

Optional separation:

```text
/api/v1/health/live
/api/v1/health/ready
```

Add separate endpoints only if they fit the existing architecture cleanly.

---

# 26. Logging and Correlation

Continue using Winston.

Requirements:

- Use structured JSON logs in staging and production.
- Include timestamp, level, service, environment, version, request ID, method, route, status code, and duration where available.
- Preserve request IDs across middleware and responses.
- Avoid logging passwords, JWTs, cookies, Razorpay secrets, full signatures, card data, or complete sensitive payloads.
- Mask user email or payment identifiers where detailed logs are unnecessary.
- Log payment state transitions using safe internal IDs.
- Log migration start, completion, and failure.
- Write logs to stdout/stderr in containers.
- Do not depend only on files inside ephemeral containers.

Recommended services:

```text
payment-gateway-backend
payment-gateway-frontend
```

---

# 27. Monitoring and Metrics

For the basic project, the minimum monitoring requirements are:

- Container or platform health status.
- Backend request error rate.
- Backend response latency.
- Backend process restarts.
- PostgreSQL connectivity.
- Disk usage for database persistence.
- Failed migration status.
- Payment verification failures.
- Webhook signature failures.
- Repeated webhook processing failures.

Optional extensions:

- Prometheus metrics endpoint.
- Grafana dashboard.
- OpenTelemetry traces.
- Hosted log aggregation.

Optional observability must not expose payment secrets or sensitive payloads.

---

# 28. Alerting Guidelines

Recommended alerts:

```text
backend unavailable for 5 minutes
frontend unavailable for 5 minutes
high 5xx error rate
PostgreSQL unavailable
migration failure
repeated payment verification failures
repeated webhook processing failures
low database disk space
backup failure
```

For a demo project, document alert rules even when no paid alerting platform is configured.

Do not alert on every customer payment failure because normal user cancellation or test-card failure may generate noise.

---

# 29. PostgreSQL Backup Strategy

At minimum, document logical backups using `pg_dump`.

Requirements:

- Store backups outside the database container volume.
- Encrypt backups when stored remotely.
- Restrict backup access.
- Use timestamped backup names.
- Define retention.
- Test restore regularly.
- Never commit database dumps to Git.
- Do not include production-like personal or payment data in public demo backups.

Example backup name:

```text
payment_gateway_demo_2026-07-15_020000.dump
```

Recommended basic retention for a small demo:

```text
7 daily backups
4 weekly backups
```

This is a guideline, not a high-availability guarantee.

---

# 30. Restore Procedure

The restore guide must include:

1. Stop application writes.
2. Confirm the target environment.
3. Create a fresh target database or validate the restore target.
4. Restore using `pg_restore` or `psql` according to backup format.
5. Run required migrations only when appropriate.
6. Start backend.
7. Verify health.
8. Verify sample users, products, orders, payments, and webhook event records.
9. Run smoke tests.
10. Record the restore result.

Never test restore for the first time during an incident.

---

# 31. Rollback Strategy

Application rollback:

- Keep the previous backend and frontend image tags.
- Re-deploy the previous known-good images.
- Verify health and smoke tests.

Database rollback:

- Prefer forward-fix migrations.
- Do not automatically undo migrations containing production data changes.
- For incompatible migrations, restore from a verified backup only after assessing data-loss impact.
- Use backward-compatible migrations to allow temporary application rollback.

Document which releases include database changes.

---

# 32. Graceful Shutdown

Backend requirements:

- Handle `SIGTERM` and `SIGINT`.
- Stop accepting new connections.
- Close the HTTP server.
- Close Sequelize connection pools.
- Allow in-flight requests a limited time to finish.
- Exit with a non-zero status on unrecoverable shutdown errors.

This prevents abrupt termination during container replacement.

---

# 33. Smoke Tests

Create a reusable smoke-test script.

Minimum checks:

```text
frontend home page returns a successful response
backend health endpoint returns 200
Swagger endpoint is reachable when enabled
register or login test works against an isolated test/demo account
product list endpoint returns a valid response
protected profile endpoint requires authentication
```

Payment checks without real browser automation:

```text
create-order API rejects unauthenticated requests
create-order API returns expected mocked or Test Mode structure
invalid payment signature is rejected
invalid webhook signature is rejected
```

A complete Razorpay Test Mode browser checkout remains a documented manual smoke test unless browser automation is already present.

---

# 34. Operational Runbook

Create `docs/operations-runbook.md` containing:

- Service overview.
- Environment locations.
- Deployment steps.
- Migration steps.
- Health URLs.
- Log access.
- Common failure symptoms.
- PostgreSQL connection failure response.
- Migration failure response.
- Backend startup failure response.
- Frontend build failure response.
- Razorpay webhook failure response.
- Secret rotation steps.
- Backup and restore links.
- Rollback steps.
- Post-incident verification.

Do not include secret values.

---

# 35. Secret Rotation

Document rotation for:

```text
JWT_SECRET
database password
Razorpay Test Key Secret
Razorpay Webhook Secret
container registry credentials
deployment credentials
```

Rules:

- Rotate one category at a time where possible.
- Update protected deployment secrets.
- Redeploy affected services.
- Update webhook configuration when webhook secret changes.
- Verify authentication and payment flow after rotation.
- Revoke old credentials.
- Never expose both old and new secrets in logs or documentation.

JWT secret rotation invalidates existing tokens unless a multi-key strategy exists. Document this user impact.

---

# 36. Security Hardening

Backend:

- Keep Helmet enabled.
- Restrict CORS to configured origins.
- Enable rate limits for authentication and payment-sensitive endpoints if already supported.
- Set request body size limits.
- Use secure error responses.
- Avoid running as root.
- Disable verbose stack traces in production.

Frontend:

- Do not expose private environment variables.
- Add secure headers through Next.js or reverse proxy where appropriate.
- Prevent unsafe HTML injection.
- Keep source maps private or intentionally configured.

Database:

- Do not use a PostgreSQL superuser for the application in production-like deployment.
- Restrict network access.
- Require TLS for remote managed databases.
- Use separate backup credentials where practical.

Containers:

- Use maintained base images.
- Pin image versions.
- Minimize installed packages.
- Scan images.
- Use a read-only filesystem where compatible as an optional hardening step.

---

# 37. Razorpay Operational Requirements

- Continue using Test Mode only.
- Configure the deployed HTTPS webhook URL in Razorpay Test Mode Dashboard.
- Store the webhook secret only in backend deployment secrets.
- Ensure reverse proxies preserve the raw request body.
- Monitor webhook signature failures.
- Keep duplicate event handling enabled.
- Do not retry failed payment verification blindly from CI/CD scripts.
- Do not run a real payment during every automated deployment.
- Use mocked payment integration in CI.
- Run a manual Test Mode checkout after significant payment or proxy changes.

---

# 38. Swagger and Production Exposure

Swagger is useful for staging and interview demonstrations.

Options:

- Keep Swagger enabled in staging.
- Protect or disable Swagger in production-like environments if public exposure is unnecessary.
- Never include real secrets in examples.
- Keep server URLs environment-aware.

The health endpoint must remain available to the deployment platform.

---

# 39. README Updates

Update the root README with:

- Part-6 scope.
- Local non-Docker run instructions.
- Docker development run instructions.
- Production Compose instructions if implemented.
- Environment variables.
- Migration and seed commands.
- CI workflow overview.
- Security scanning overview.
- Image build commands.
- Deployment options.
- HTTPS and webhook requirements.
- Backup and restore instructions.
- Rollback instructions.
- Health and Swagger URLs.
- Known limitations.
- Razorpay Test Mode notice.

---

# 40. Recommended Package Scripts

Backend examples:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "lint": "eslint src tests",
    "test": "node --test",
    "db:migrate": "sequelize-cli db:migrate",
    "db:seed": "sequelize-cli db:seed:all",
    "db:migrate:status": "sequelize-cli db:migrate:status",
    "smoke": "node scripts/smoke-test.js"
  }
}
```

Frontend examples:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "node --test"
  }
}
```

Adapt scripts to the existing project and installed test tooling. Do not introduce duplicate or broken scripts.

---

# 41. Local Docker Commands

Windows CMD examples:

```cmd
copy .env.example .env
docker compose config
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f backend
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed
docker compose down
docker compose down -v
```

Warning:

```text
docker compose down -v
```

removes the local PostgreSQL volume. Mark it clearly as destructive.

---

# 42. Manual Deployment Verification

After deployment verify:

1. Frontend loads over HTTPS.
2. Backend health returns 200.
3. Database reports healthy.
4. Swagger is reachable only according to environment policy.
5. Register and login work.
6. JWT-protected profile works.
7. Product listing works.
8. Cart and order creation work.
9. Razorpay Test Checkout opens.
10. Successful Test Mode payment is verified by backend.
11. Webhook delivery succeeds.
12. Duplicate webhook delivery remains idempotent.
13. Payment and order statuses are consistent.
14. Logs contain request IDs and no secrets.
15. Backup command works.
16. Previous image tag is available for rollback.

---

# 43. Testing Requirements

Automated verification should include:

- Backend lint and tests.
- Frontend lint, tests, and build.
- Migration execution against clean PostgreSQL.
- Docker image builds.
- Compose configuration validation.
- Application startup in containers.
- Health checks.
- Smoke tests.
- Secret scan.
- Dependency scan.
- Container scan.

Do not perform a real Razorpay checkout in CI.

---

# 44. Failure Handling

The pipeline and deployment must clearly fail when:

- Required environment variables are missing.
- Migrations fail.
- Backend tests fail.
- Frontend build fails.
- Docker build fails.
- Health checks fail.
- Smoke tests fail.
- Critical security findings exceed policy.

The final report must distinguish:

```text
passed
failed
skipped
not configured
manual step required
```

---

# 45. Development Order

```text
1. Inspect repository and existing Docker/CI files
2. Confirm Parts 1-5 verification status
3. Standardize environment examples
4. Harden backend Dockerfile
5. Harden frontend Dockerfile
6. Add dockerignore files
7. Complete development Compose
8. Add production Compose foundation if selected
9. Add database readiness and migration entrypoint
10. Add graceful shutdown
11. Add CI workflow
12. Add security workflow
13. Add Dependabot
14. Add image build/publish workflow if configured
15. Add staging deployment workflow foundation if target exists
16. Add smoke tests
17. Add backup and restore scripts
18. Add deployment and operations documentation
19. Run complete validation
20. Commit Part 6
```

---

# 46. Part-6 Deliverables

- Hardened backend Dockerfile.
- Hardened frontend Dockerfile.
- Backend and frontend `.dockerignore` files.
- Working local Docker Compose stack.
- Optional production Compose configuration.
- Safe migration startup strategy.
- Environment validation.
- CI pipeline.
- Security scanning pipeline.
- Dependabot configuration.
- Optional container publishing workflow.
- Optional staging deployment workflow foundation.
- Smoke tests.
- Structured logging and request correlation verification.
- Backup and restore scripts and documentation.
- Rollback procedure.
- Deployment guide.
- Operations runbook.
- Updated README.

---

# 47. Acceptance Criteria

Part 6 is complete only when:

- Parts 1-5 functionality remains working.
- Backend image builds successfully.
- Frontend image builds successfully.
- Containers do not contain real `.env` files or secrets.
- Backend and frontend run as non-root where practical.
- PostgreSQL uses persistent storage and a health check.
- Backend waits for database readiness.
- Pending migrations run safely exactly once per release strategy.
- Development seeders do not run automatically in production-like environments.
- Docker Compose configuration validates.
- Full local stack starts successfully.
- Backend health endpoint reports application and database state without exposing secrets.
- Frontend is reachable.
- CI runs backend lint and tests.
- CI runs frontend lint, tests where configured, and production build.
- CI applies migrations to a clean PostgreSQL service.
- Docker build validation runs in CI.
- Secret scanning is configured.
- Dependency and image scanning are configured.
- Immutable image tag strategy is documented.
- Protected deployment secret strategy is documented.
- Staging or deployment workflow does not contain fake credentials.
- Logs go to stdout/stderr and include request IDs.
- Logs do not expose passwords, tokens, Razorpay secrets, full signatures, or card data.
- Backup and restore procedures are documented and scripts are safe.
- Rollback procedure identifies previous image tags and database limitations.
- HTTPS and public webhook requirements are documented.
- Automated CI does not perform real payments.
- A manual Razorpay Test Mode post-deployment checklist exists.
- All executed commands and their real results are reported honestly.

---

# 48. Recommended Next Phase

Recommended next document:

```text
Part-7-Testing-Documentation-Demo-Preparation.md
```

It may include:

- End-to-end test suite.
- Browser automation.
- API regression collection.
- Performance testing.
- Security test checklist.
- Interview demo script.
- Architecture diagrams.
- Final project documentation.
- Release checklist.
