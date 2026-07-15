# Codex Prompt – Part 6

# DevOps, CI/CD, Deployment and Operations for Payment Gateway Demo

## Objective

You are a Senior DevOps-aware Full Stack Developer.

Continue the existing Payment Gateway Demo repository and implement ONLY Part 6: DevOps, CI/CD, Deployment and Operations.

Read the complete repository and all Parts 1-6 documentation before changing files.

Use these documents as the main specifications, in this order:

```text
docs/Part-1-Project-Setup-Payment-Gateway.md
docs/Part-2-Database-Design-Payment-Gateway.md
docs/Part-3-Backend-APIs-Payment-Gateway.md
docs/Part-4-Frontend-Payment-Gateway.md
docs/Part-5-Razorpay-Integration-Payment-Gateway.md
docs/Part-6-DevOps-Payment-Gateway.md
```

Part 6 must operationalize the current Node.js, Express, Sequelize, PostgreSQL, Next.js, and Razorpay Test Mode application without redesigning correct business functionality from Parts 1-5.

---

# Mandatory Repository Inspection

Before modifying files:

1. Run `git status`.
2. Inspect the root repository structure.
3. Read all six specification documents completely.
4. Inspect backend and frontend `package.json` files and lock files.
5. Identify the actual Node.js and PostgreSQL versions currently used.
6. Inspect existing backend and frontend Dockerfiles.
7. Inspect all Compose files.
8. Inspect `.gitignore`, `.dockerignore`, and `.env.example` files.
9. Inspect GitHub Actions workflows, Dependabot, CodeQL, and security configuration.
10. Inspect backend startup, database connection, migrations, seeders, health endpoint, logging, and graceful shutdown behavior.
11. Inspect frontend build configuration and determine whether Next.js standalone output is already enabled.
12. Inspect existing tests and package scripts.
13. Inspect Razorpay webhook raw-body handling and confirm a reverse proxy will not break it.
14. Identify correct existing functionality that must be preserved.
15. Identify conflicts between documentation and actual code.
16. Provide a concise implementation plan.
17. List files expected to be created or modified.
18. Do not edit files until the inspection summary is complete.

Do not overwrite correct files blindly.

---

# Critical Repository Rules

- Preserve all working Parts 1-5 functionality.
- Do not delete existing documentation.
- Do not redesign database tables or APIs unless a real blocking defect is found and documented.
- Do not change stable API routes without a documented reason.
- Use migrations as the schema source of truth.
- Never use `sequelize.sync({ force: true })`.
- Never use `sequelize.sync({ alter: true })`.
- Never drop the database.
- Never commit real `.env` files.
- Never add real Razorpay, JWT, database, registry, or deployment credentials.
- Never expose Razorpay Key Secret or Webhook Secret to the frontend.
- Use Razorpay Test Mode only.
- Do not make real payments from CI.
- Do not create fake successful deployment results.
- Keep the implementation small, clear, secure, and interview-ready.
- Avoid Kubernetes, Terraform, service mesh, and complex cloud infrastructure in this phase unless clearly supplied only as optional future documentation.

---

# Part-6 Scope

Implement or complete:

```text
backend production Dockerfile
frontend production Dockerfile
backend .dockerignore
frontend .dockerignore
local Docker Compose
optional production Docker Compose foundation
environment validation
database readiness handling
migration execution strategy
gracious backend shutdown
CI workflow
security scanning workflow
Dependabot configuration
Docker build validation
optional image publishing workflow
optional staging deployment workflow foundation
health and smoke tests
logging and request-correlation verification
backup and restore scripts
rollback documentation
deployment guide
operations runbook
README updates
```

---

# Strict Out-of-Scope Rules

Do not implement:

- Razorpay Live Mode.
- Refunds, settlements, subscriptions, coupons, or new payment features.
- New frontend business pages.
- New backend business APIs unrelated to operational needs.
- Automatic production deployment without protected approval.
- Kubernetes as the primary solution.
- Terraform as the primary solution.
- Multi-region or high-availability claims.
- Paid monitoring as a mandatory dependency.
- Destructive automatic migration rollback.
- Fake registry, cloud, SSH, or deployment secrets.

---

# Required Architecture

Preserve the application architecture:

```text
Browser
  -> Next.js frontend container
  -> Express backend container
  -> PostgreSQL
  -> Razorpay Test API
```

Operational flow:

```text
Git push / pull request
  -> CI quality checks
  -> tests and builds
  -> security checks
  -> Docker image build
  -> optional immutable image publishing
  -> protected staging deployment
  -> migrations
  -> health checks
  -> smoke tests
```

---

# Environment Configuration

Inspect and standardize safe example variables.

Required principles:

- Commit only `.env.example` files.
- Ensure `.env`, `.env.local`, `.env.production`, key files, dumps, and credentials are ignored.
- Keep backend and frontend variables separated.
- Validate required backend variables at startup.
- Do not print secret values.
- Frontend may contain only intended `NEXT_PUBLIC_*` variables.
- Document that `NEXT_PUBLIC_*` values are generally embedded during build.
- Use different configuration for development, test, staging, and production.

Preserve actual variable names used by the code. Do not rename variables unnecessarily.

---

# Backend Dockerfile

Implement a production-ready backend Dockerfile.

Requirements:

- Use the project-compatible supported Node.js LTS major version.
- Pin the major version.
- Use `npm ci` when a lock file exists.
- Optimize dependency caching by copying package manifests first.
- Create a minimal runtime stage where practical.
- Install production dependencies only in the runtime image.
- Set `NODE_ENV=production`.
- Do not copy `.env` files.
- Do not bake secrets into build args or image layers.
- Run as a non-root user where compatible.
- Expose only the backend port.
- Start through the existing production command or a safe entrypoint.
- Preserve raw-body webhook handling.
- Do not run development seeders automatically.
- Support graceful `SIGTERM` and `SIGINT` shutdown.

If migration execution is placed in an entrypoint:

```text
validate environment
wait for PostgreSQL
run sequelize-cli db:migrate
start backend
```

Prevent multiple parallel application replicas from racing migrations. For a one-instance demo Compose deployment, entrypoint migration is acceptable. For a multi-instance platform, document a separate one-off migration job.

---

# Frontend Dockerfile

Implement a production Next.js multi-stage Dockerfile.

Requirements:

- Use the same supported Node.js major version where practical.
- Use `npm ci`.
- Run the real production build.
- Prefer standalone output only when compatible with the existing Next.js configuration.
- Copy only required runtime artifacts.
- Do not include backend secrets.
- Run as a non-root user where compatible.
- Expose port `3000`.
- Preserve the current App Router behavior.
- Provide public environment variables deliberately during build.
- Do not copy `.next/cache`, test output, logs, or local environment files into the runtime image.

Do not invent standalone paths without first confirming the actual Next.js build output.

---

# Docker Ignore Files

Create or improve:

```text
backend/.dockerignore
frontend/.dockerignore
```

Exclude:

```text
node_modules
.git
.github
.env
.env.*
!.env.example
logs
coverage
npm-debug.log*
.next/cache
local database dumps
```

Do not accidentally exclude files required for `npm ci` or application build.

---

# Docker Compose

Create or update the local Compose configuration with:

```text
postgres
backend
frontend
```

PostgreSQL:

- Use a supported pinned PostgreSQL image.
- Use a named data volume.
- Add `pg_isready` health check.
- Use environment substitution.
- Use the `postgres` service name as backend `DB_HOST`.
- Do not expose PostgreSQL publicly in production Compose.

Backend:

- Depend on PostgreSQL health where the Compose version supports it.
- Add a health check using the actual health endpoint.
- Expose the configured backend port locally.
- Use development mounts only in a development override file.
- Do not mount host `node_modules`.

Frontend:

- Expose port `3000`.
- Use the correct browser-reachable API base URL.
- Do not pass backend-only secrets.
- Use production command in production Compose.

Run and validate:

```text
docker compose config
docker compose build
docker compose up -d
docker compose ps
```

Do not claim success unless commands actually succeed.

---

# Database Migrations and Seeds

Requirements:

- Run pending migrations before serving the new release.
- Do not use Sequelize sync.
- Fail startup or deployment when migrations fail.
- Do not automatically undo migrations.
- Keep development seed execution separate and opt-in.
- Preserve reference seeds such as roles.
- Ensure tests run migrations against an isolated test database.
- Document expand-and-contract migration guidance.
- Document backup requirements for destructive migrations.

If current migrations are defective, fix only the blocking defect and document the change.

---

# Backend Graceful Shutdown

Inspect existing server startup and implement graceful shutdown when missing.

Handle:

```text
SIGTERM
SIGINT
```

Shutdown order:

1. Stop accepting new HTTP requests.
2. Allow current requests a limited completion window.
3. Close the HTTP server.
4. Close Sequelize/database connections.
5. Exit cleanly.

Do not add complex process managers inside the container.

---

# CI Workflow

Create or update:

```text
.github/workflows/ci.yml
```

Triggers:

```text
pull_request
push to main
push to development if the branch exists
workflow_dispatch
```

Use jobs that match the repository:

## Backend Job

- Checkout.
- Set up the supported Node.js version.
- Enable npm cache.
- Run `npm ci`.
- Start PostgreSQL as a GitHub Actions service.
- Use safe test-only variables.
- Run migrations.
- Run backend lint.
- Run backend tests.
- Do not call real Razorpay APIs.

## Frontend Job

- Run `npm ci`.
- Run frontend lint.
- Run frontend tests when configured.
- Run Next.js production build.
- Supply safe placeholder public variables when required.

## Docker Job

- Build backend image.
- Build frontend image.
- Validate Compose configuration.
- Optionally start the stack and run smoke tests if this can be done reliably.

Use job dependencies to avoid publishing or deployment after failed quality checks.

---

# Security Workflow

Create or update:

```text
.github/workflows/security.yml
```

Include only tools that can run correctly in this repository:

- CodeQL for JavaScript/TypeScript.
- `npm audit` with a documented threshold.
- Trivy filesystem scan.
- Trivy backend and frontend image scans.
- Secret scanning through Gitleaks or supported GitHub capability.
- Optional SBOM generation.

Rules:

- Fail on confirmed critical findings unless a narrowly documented exception exists.
- Do not disable all checks to make the pipeline green.
- Do not commit generated reports containing sensitive data.
- Upload safe SARIF or build artifacts only where supported.
- Pin third-party GitHub Actions to stable versions or commit SHAs when practical.

---

# Dependabot

Create or update:

```text
.github/dependabot.yml
```

Cover:

```text
/backend npm
/frontend npm
GitHub Actions
Docker
```

Use a weekly schedule.

Do not configure automatic merging of major-version updates.

---

# Docker Image Workflow

Create `.github/workflows/docker-build.yml` only when the repository benefits from a separate workflow.

Requirements:

- Build backend and frontend images.
- Use immutable tags based on Git SHA and release tag.
- Use registry credentials only through GitHub Secrets.
- Never hardcode registry credentials.
- Add source revision and version labels.
- Publish only after CI succeeds.
- Skip publishing when required registry configuration is unavailable and report it as `not configured`.

Do not add fake secrets.

---

# Deployment Workflow Foundation

Create `.github/workflows/deploy-staging.yml` only when an actual deployment target is configured or when a safe non-executing foundation can be useful.

Requirements:

- Use GitHub Environments.
- Reference immutable image tags.
- Require CI success.
- Use protected secrets.
- Run migrations exactly once.
- Deploy backend and verify health.
- Deploy frontend and verify availability.
- Run smoke tests.
- Report the deployed version.
- Require manual approval for production-like deployment.

When no target exists:

- Do not invent hostnames, SSH keys, cloud accounts, or registry paths.
- Create documentation and a disabled/manual workflow template only if it adds value.
- Clearly report deployment as `not configured`.

---

# Health Checks

Preserve or improve:

```text
GET /api/v1/health
```

The response may include:

```text
application status
database status
environment
version
uptime
```

It must not expose:

```text
passwords
JWT secret
Razorpay secrets
database credentials
stack traces
internal connection strings
```

Do not call Razorpay on each health request.

Add Compose and platform health checks using the actual endpoint.

---

# Logging

Continue using the existing Winston configuration.

Verify or implement:

- JSON logs in staging and production.
- Human-readable logs in development when already supported.
- stdout/stderr output for containers.
- Request ID/correlation ID.
- Method, route, status, response duration, service, environment, and version where available.
- Safe migration, deployment, payment transition, and webhook failure logs.

Never log:

```text
passwords
JWT tokens
cookies
Razorpay Key Secret
Razorpay Webhook Secret
full signatures
card data
complete sensitive request bodies
```

Do not rely only on files stored inside ephemeral containers.

---

# Smoke Tests

Create a reusable smoke-test script in the location that best fits the repository.

Check at minimum:

- Frontend is reachable.
- Backend health returns 200.
- Database is reported healthy.
- Product list returns a valid response.
- Protected profile rejects missing authentication.
- Login works using an isolated configured demo/test account when appropriate.
- Invalid payment verification signature is rejected.
- Invalid webhook signature is rejected.

Do not execute a real Razorpay payment in automated CI.

Document one manual post-deployment Test Mode checkout.

---

# Backup and Restore

Create safe scripts and documentation for PostgreSQL logical backup and restore.

Suggested files:

```text
scripts/backup-postgres.sh
scripts/restore-postgres.sh
docs/backup-restore-guide.md
```

Requirements:

- Use environment variables instead of hardcoded credentials.
- Confirm required variables exist.
- Use timestamped backup names.
- Store backups outside the container volume.
- Do not commit dumps.
- Add warnings before destructive restore operations.
- Do not silently overwrite a database.
- Document `pg_dump`, `pg_restore`, and verification commands.
- Make Windows alternatives clear when shell scripts are not directly usable.

Do not execute a destructive restore against the user's existing database.

---

# Rollback Documentation

Document:

- Previous backend and frontend image tags.
- How to redeploy a previous application version.
- Health and smoke-test verification after rollback.
- Why database migration rollback is not automatic.
- Backward-compatible migration strategy.
- When backup restore may be required.
- Data-loss risks.

Prefer forward-fix database migrations.

---

# Deployment and Operations Documentation

Create or update:

```text
docs/deployment-guide.md
docs/operations-runbook.md
docs/backup-restore-guide.md
```

Include:

- Local Docker setup.
- Linux VM Compose deployment path.
- Optional managed-platform path.
- HTTPS and reverse proxy guidance.
- Razorpay Test webhook URL configuration.
- Environment and secret setup.
- Migration and seed strategy.
- Health URLs.
- Log access.
- Deployment verification.
- Common failure troubleshooting.
- Backup, restore, rollback, and secret rotation.

Do not include real credentials.

---

# Reverse Proxy and HTTPS

When providing Nginx or Caddy configuration:

- Keep it minimal.
- Terminate TLS.
- Redirect HTTP to HTTPS.
- Route frontend and backend correctly.
- Preserve headers.
- Ensure Razorpay webhook request body is not transformed.
- Configure reasonable timeouts and body-size limits.
- Enable Express `trust proxy` only for trusted deployment topology.

Do not generate certificate private keys.

---

# README Updates

Update the root README with:

- Part-6 overview.
- Docker commands.
- Compose services.
- Environment setup.
- Migrations and seed commands.
- CI and security checks.
- Image build and tags.
- Deployment options.
- HTTPS/webhook requirement.
- Health and Swagger URLs.
- Backup and restore.
- Rollback.
- Known limitations.
- Razorpay Test Mode notice.

Preserve useful existing Parts 1-5 instructions.

---

# Required Verification

Run every applicable command and report the real result.

At minimum:

```text
git status
backend npm ci
backend lint
backend tests
backend migration status or clean test migration
frontend npm ci
frontend lint
frontend tests if configured
frontend production build
docker compose config
backend Docker build
frontend Docker build
full Compose startup when environment permits
backend health check
frontend availability check
smoke tests
secret scan when configured
dependency scan when configured
container image scan when configured
```

Do not claim a command passed unless it was actually executed successfully.

When a check cannot run because credentials or deployment infrastructure are unavailable, mark it clearly as:

```text
not configured
manual step required
```

Do not replace missing deployment infrastructure with invented values.

---

# Windows CMD Commands

Provide exact Windows CMD commands for:

- Copying example environment files.
- Installing backend dependencies.
- Running backend lint and tests.
- Running migrations and seeders.
- Installing frontend dependencies.
- Running frontend lint, tests, and build.
- Validating and starting Docker Compose.
- Viewing logs.
- Running smoke tests.
- Stopping containers.
- Backing up PostgreSQL from Docker.
- Restoring to a safe new local database.

Clearly mark destructive commands such as volume removal and restore overwrite.

---

# Security Review Checklist

Confirm:

- No real `.env` files are tracked.
- No Razorpay secret exists in frontend files or frontend image.
- No secrets exist in Dockerfiles, Compose files, workflows, or logs.
- CI uses only safe test values.
- Registry and deployment secrets are referenced, not embedded.
- PostgreSQL is not publicly exposed in production configuration.
- Containers run as non-root where practical.
- Images use maintained pinned base versions.
- Dependency, secret, and image scans exist.
- Swagger does not contain secrets.
- Webhook raw-body handling remains correct through proxy configuration.
- Automated CI does not perform a real payment.

---

# Acceptance Criteria

Part 6 is complete only when:

- Parts 1-5 functionality remains working.
- Backend production image builds.
- Frontend production image builds.
- Real environment files are not copied into images.
- Backend and frontend use non-root runtime users where practical.
- PostgreSQL has a persistent named volume and health check.
- Backend waits for PostgreSQL readiness.
- Migrations run safely according to the documented deployment strategy.
- Development seeders do not run automatically in production-like environments.
- Compose configuration validates.
- Local stack starts when required local variables are supplied.
- Backend health returns 200 and safely reports database state.
- Frontend is reachable.
- Backend lint and tests pass.
- Frontend lint and production build pass.
- Frontend tests pass when configured.
- Clean test database migrations pass.
- CI workflow contains the required quality checks.
- Security scanning is configured.
- Dependabot is configured.
- Docker image tags are immutable for releases.
- No fake deployment credentials exist.
- Deployment steps use protected secrets and approvals.
- Logs use stdout/stderr and contain request IDs.
- Logs do not expose secrets or sensitive payment information.
- Backup and restore scripts are safe and documented.
- Rollback procedure is documented.
- HTTPS and Razorpay webhook deployment requirements are documented.
- Real payments are excluded from CI.
- Manual Razorpay Test Mode post-deployment verification is documented.
- All command results are reported honestly.
- Part 7 is not implemented.

---

# After Implementation

Provide:

1. Repository inspection summary.
2. Existing functionality preserved.
3. DevOps design decisions.
4. Files created.
5. Files modified.
6. Environment and secret strategy.
7. Backend container implementation.
8. Frontend container implementation.
9. Docker Compose implementation.
10. Migration and seed strategy.
11. Graceful shutdown implementation.
12. CI workflow.
13. Security workflow.
14. Dependabot configuration.
15. Image publishing status.
16. Deployment workflow status.
17. Health and smoke tests.
18. Logging review.
19. Backup and restore implementation.
20. Rollback strategy.
21. Documentation updates.
22. Backend verification results.
23. Frontend verification results.
24. Docker verification results.
25. Security scan results.
26. Exact Windows CMD commands.
27. Manual deployment steps.
28. Remaining limitations.
29. Part-7 readiness.

---

# Final Output Format

Use exactly these headings:

```text
## Summary
## Repository Inspection
## Implementation Plan
## Existing Functionality Preserved
## Files Created
## Files Modified
## Environment and Secrets
## Backend Docker
## Frontend Docker
## Docker Compose
## Database Migrations and Seeds
## Graceful Shutdown
## CI Pipeline
## Security Scanning
## Dependabot
## Container Image Publishing
## Deployment Workflow
## Health Checks and Smoke Tests
## Logging and Monitoring
## Backup and Restore
## Rollback Strategy
## Documentation Updates
## Backend Verification Results
## Frontend Verification Results
## Docker Verification Results
## Security Verification Results
## Windows CMD Commands
## Manual Deployment Steps
## Remaining Limitations
## Part 7 Readiness
```
