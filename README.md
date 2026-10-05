# LivWorthy

LivWorthy is a production-oriented salary, tax and cost-of-living decision platform. It compares take-home pay, local living costs, savings capacity, relocation economics and competing job offers with explicit evidence and tax-rule versioning.

## Core product

- Salary Worth calculator
- Salary Needed calculator
- Salary After Tax calculator
- Cost of Living calculator
- City comparison
- Job offer comparison
- Evidence and methodology surfaces
- SEO landing pages and salary guides
- PostgreSQL persistence with Drizzle
- Redis-backed cache and distributed rate limiting
- FX snapshots and scheduled refresh
- CMS/content workflow, reviews, RBAC and audit logs
- Production admin dashboard at `/admin` (noindex)
- Real-user web-vitals collection
- Accessibility, responsive and production E2E coverage

## Tax-year policy

The latest fully verified statutory period is **2026**.

LivWorthy is **2026–2027 ready**: 2027 can be selected and passed through the API, but the engine deliberately returns `TAX_CALCULATION_UNAVAILABLE` until 2027 statutory schedules are implemented from official sources and covered by regression/golden-vector tests. The platform never silently reuses 2026 rates as if they were 2027 rules.

## Local development

Requirements:

- Node.js 22+
- npm
- PostgreSQL and Redis for production-equivalent mode
- Playwright browsers for E2E tests

```bash
npm ci
cp .env.example .env
npm run dev
```

Without `DATABASE_URL` or `REDIS_URL`, local development uses isolated in-memory fallbacks. Production must provide real PostgreSQL and Redis services.

## Environment variables

- `APP_URL` — canonical application URL
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `CRON_SECRET` — protects the FX refresh cron endpoint
- `ADMIN_SESSION_SECRET` — HMAC secret for admin sessions
- `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` — one-time first-admin provisioning
- `GEMINI_API_KEY` — optional AI integration key when that integration is enabled

Never commit production secrets.

## Quality gates

```bash
npm run lint
npm test
npm run test:e2e
```

The standard test command covers financial-engine behavior, tax golden vectors, 2026/2027 year policy, database/backend behavior, production failure modes, unsupported-tax regressions and SEO regressions. Playwright covers calculator journeys, accessibility, responsive behavior and deployed-route checks.

## Production build

```bash
npm run build
npm start
```

The build produces the Vite frontend, prerendered SEO pages and bundled serverless/server entry points.

## Production requirements

A release is considered production-ready only when:

1. `npm run lint` passes.
2. `npm test` passes.
3. `npm run test:e2e` passes in a production-equivalent environment.
4. PostgreSQL migrations and seeds succeed (including serverless cold-start initialization).
5. Redis is connected.
6. The FX snapshot is available.
7. `/api/health/ready` returns ready.
8. Canonical redirects, robots and sitemaps resolve correctly.
9. No future-year tax result is presented as verified without official rules and tests.

## Key operational endpoints

- `GET /api/health`
- `GET /api/health/ready`
- `GET /api/health/diagnostics`
- `GET /api/tax/years`
- `GET /api/tax/registry`
- `GET /api/fx/latest`
- `GET /api/rum/summary`

## Deployment

The repository contains Vercel configuration for canonical host redirects, caching and security headers. Configure production environment variables in the hosting platform before deployment. Production startup is fail-closed: missing required secrets, PostgreSQL, or Redis configuration must not silently fall back to development services. The canonical public host is `https://www.livworthy.com`.

## Data integrity

Tax, cost-of-living and evidence metadata are versioned. Unsupported jurisdictions or unverified future years must degrade explicitly rather than returning fabricated estimates. New statutory years should be added only after official-source verification, adapter implementation and regression coverage.
