import express from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { validateEnv } from './src/lib/env';
import { LATEST_VERIFIED_TAX_YEAR, resolveTaxYear } from './src/lib/tax-year-policy';
import { dbService } from './src/db/client';
import { cacheService } from './src/lib/redis';
import { FxEngine } from './src/engines/fx/fx-service';
import { TaxRegistry } from './src/engines/tax/tax-registry';
import { SalaryWorthCalculator } from './src/engines/calculator-core/salary-worth';
import { ComparisonEngine } from './src/engines/calculator-core/compare';
import { SalaryNeededCalculator } from './src/engines/calculator-core/salary-needed';
import { CostOfLivingEngine } from './src/engines/col/col-engine';
import { AuthService } from './src/lib/auth';
import { COUNTRIES, CITIES } from './src/data/locations';
import { EVIDENCE_REGISTRY } from './src/data/evidence-registry';
import { createMoney, fromMinor } from './src/lib/money';
import { CapabilityResolver } from './src/engines/capabilities/capability-resolver';

const env = validateEnv();
const PORT = parseInt(process.env.PORT || '3000', 10);
const START_TIME = Date.now();
const CRON_SECRET = env?.CRON_SECRET || process.env.CRON_SECRET;

let dbInitialized = false;
let dbInitPromise: Promise<void> | null = null;

export async function ensureDatabaseReady(): Promise<void> {
  if (dbInitialized) return;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        console.log(`[Database] Initializing in ${dbService.mode} mode...`);
        const migRes = await dbService.runMigrations();
        console.log(`[Database] Migrations verified (executed: ${migRes.executedCount})`);
        const seedRes = await dbService.seedData();
        console.log(`[Database] Seed verified (${seedRes.countriesCount} countries, ${seedRes.citiesCount} cities)`);
        dbInitialized = true;
      } catch (dbErr: any) {
        dbInitialized = false;
        dbInitPromise = null;
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
          console.error('[Database] Production initialization failed.');
          throw new Error('Production database initialization failed.');
        }
        console.warn('[Database] Startup initialization notice:', dbErr.message);
      }
    })();
  }
  return dbInitPromise;
}

export const app = express();

function configureApp() {
  // Canonical Host & Trailing Slash Redirection:
  // 1. Permanently redirect non-www livworthy.com to https://www.livworthy.com
  // 2. Permanently redirect trailing-slash requests (e.g. /about/) to non-trailing slash (/about), except root /
  // 3. Complete both normalizations in a SINGLE 308 redirect hop (no redirect chains)
  app.use((req, res, next) => {
    const rawHost = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
    const cleanHost = rawHost.split(':')[0].toLowerCase();
    const isApex = cleanHost === 'livworthy.com';

    const urlString = req.originalUrl || req.url;
    const qIndex = urlString.indexOf('?');
    const pathname = qIndex >= 0 ? urlString.slice(0, qIndex) : urlString;
    const search = qIndex >= 0 ? urlString.slice(qIndex) : '';

    const hasTrailingSlash = pathname.length > 1 && pathname.endsWith('/');
    const cleanPath = hasTrailingSlash ? pathname.replace(/\/+$/, '') : pathname;

    // Reject paths with multiple leading slashes (e.g. //attacker.com) before building targetUrl
    // to prevent res.redirect from emitting a protocol-relative/network-path destination.
    if (/^\/{2,}/.test(pathname) || /^\/{2,}/.test(cleanPath)) {
      return res.status(400).type('text/plain').send('Bad Request');
    }

    const LEGACY_GUIDE_REDIRECTS: Record<string, string> = {
      '/guides/london-60k': '/guides/london-75k',
      '/guides/toronto-90k': '/guides/toronto-100k',
      '/guides/dubai-30k': '/guides/dubai-300k',
      '/guides/singapore-10k': '/guides/singapore-120k',
      '/guides/berlin-65k': '/guides/berlin-80k',
    };

    if (LEGACY_GUIDE_REDIRECTS[cleanPath]) {
      const destination = LEGACY_GUIDE_REDIRECTS[cleanPath];
      return res.redirect(308, `https://www.livworthy.com${destination}${search}`);
    }

    if (isApex || hasTrailingSlash) {
      const hostPrefix = isApex ? 'https://www.livworthy.com' : '';
      const targetUrl = `${hostPrefix}${cleanPath}${search}`;
      if (targetUrl.startsWith('//')) {
        return res.status(400).type('text/plain').send('Bad Request');
      }
      return res.redirect(308, targetUrl);
    }
    next();
  });

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: ws: wss:; frame-src 'self' https:; frame-ancestors 'self'; object-src 'none';"
    );
    next();
  });

  // Body parser with strict size limits
  app.use(express.json({ limit: '512kb' }));

  // CORS Middleware - Strict for Admin/CMS, Open for Public Calculators
  const trustedOrigins = [
    'https://livworthy.com',
    'https://www.livworthy.com',
    'https://livworthy.vercel.app',
  ];

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const isSensitivePath =
      req.path.startsWith('/api/admin') ||
      req.path.startsWith('/api/cms') ||
      req.path.startsWith('/api/content') ||
      req.path.startsWith('/api/reviews') ||
      req.path.startsWith('/api/fx/refresh');

    if (isSensitivePath) {
      if (
        origin &&
        (trustedOrigins.includes(origin) ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:'))
      ) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      } else if (!origin) {
        // Direct server-side or same-origin request
      } else {
        res.setHeader('Access-Control-Allow-Origin', 'null');
      }
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Rate Limiter Helper
  const rateLimit = (
    limit: number,
    windowSeconds: number,
    options?: { isSecuritySensitive?: boolean; failClosed?: boolean }
  ) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const key = `${req.path}:${clientIp}`;
      const result = await cacheService.checkRateLimit(key, limit, windowSeconds, options);

      res.setHeader('X-RateLimit-Limit', result.totalLimit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetSeconds);

      if (!result.allowed) {
        if (result.reason?.startsWith('SECURITY_RATE_LIMITER')) {
          return res.status(503).json({
            error: 'SECURITY_RATE_LIMITER_UNAVAILABLE',
            message: 'Distributed rate limiter unavailable for security-sensitive endpoint. Request rejected for defense.',
          });
        }
        res.setHeader('Retry-After', result.resetSeconds);
        return res.status(429).json({
          error: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded. Please retry shortly.',
          retryAfterSeconds: result.resetSeconds,
        });
      }
      next();
    };
  };

  // Auth Extraction Helper
  const extractSession = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return AuthService.verifySessionToken(token);
    }
    return null;
  };

  // 1. HEALTH & DIAGNOSTIC ENDPOINTS
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
    });
  });

  app.get('/api/health/live', (req, res) => {
    res.status(200).send('OK');
  });

  const handleReadinessCheck = async (req: express.Request, res: express.Response) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // On serverless cold starts, readiness must initialize migrations/seeds itself.
    // Otherwise the first readiness probe can incorrectly report an uninitialized DB.
    try {
      await ensureDatabaseReady();
    } catch {
      return res.status(503).json({
        ready: false,
        database: 'unavailable',
        cache: cacheService.isRedisConnected ? 'connected' : isProduction ? 'unavailable' : 'degraded',
        fx: 'unavailable',
        capabilities: {},
        message: 'Production data services are not ready.',
      });
    }

    let dbStatus: 'connected' | 'unavailable' = 'connected';
    let cacheStatus: 'connected' | 'degraded' | 'unavailable' = 'connected';
    let fxStatus: 'available' | 'aging' | 'unavailable' = 'available';

    // 1. Check Database health & migrations
    try {
      const dbHealth = await dbService.checkConnection();
      if (!dbHealth.healthy || !dbHealth.migrationsApplied) {
        dbStatus = 'unavailable';
      }
    } catch {
      dbStatus = 'unavailable';
    }

    // 2. Check Redis cache
    if (cacheService.isRedisConnected) {
      cacheStatus = 'connected';
    } else if (isProduction) {
      cacheStatus = 'unavailable';
    } else {
      cacheStatus = 'degraded';
    }

    // 3. Check FX Engine operational state
    try {
      const fxSnapshot = await FxEngine.getLatestSnapshot();
      if (!fxSnapshot || fxSnapshot.status === 'UNAVAILABLE') {
        fxStatus = 'unavailable';
      } else if (fxSnapshot.status === 'AGING' || fxSnapshot.status === 'STALE') {
        fxStatus = 'aging';
      }
    } catch {
      fxStatus = 'unavailable';
    }

    // Critical dependency verification
    const isReady = dbStatus === 'connected' && (cacheStatus === 'connected' || (!isProduction && cacheStatus === 'degraded'));

    const capabilities = {
      salaryAfterTax: 'AVAILABLE',
      salaryWorth: 'AVAILABLE',
      salaryNeeded: 'AVAILABLE',
      costOfLiving: 'AVAILABLE',
      internationalCompare: fxStatus === 'unavailable' ? 'DEGRADED' : 'AVAILABLE',
      internationalJobOffer: fxStatus === 'unavailable' ? 'DEGRADED' : 'AVAILABLE',
    };

    if (isReady) {
      return res.status(200).json({
        ready: true,
        database: dbStatus,
        cache: cacheStatus,
        fx: fxStatus,
        capabilities,
        adaptersLoaded: TaxRegistry.getSupportedCountryIds().length,
      });
    } else {
      return res.status(503).json({
        ready: false,
        database: dbStatus,
        cache: cacheStatus,
        fx: fxStatus,
        capabilities,
      });
    }
  };

  app.get('/api/health/ready', handleReadinessCheck);
  app.get('/api/readiness', handleReadinessCheck);

  app.get('/api/health/diagnostics', async (req, res) => {
    const memory = process.memoryUsage();
    const vitalsSummary = await dbService.getWebVitalsSummary();
    const fxSnapshot = await FxEngine.getLatestSnapshot();

    res.json({
      application: 'LivWorthy Core Financial Engine & Platform',
      version: '1.2.0',
      uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
      database: {
        mode: dbService.mode,
        isProductionPostgres: dbService.mode === 'PRODUCTION_POSTGRES',
        isDevFallback: dbService.mode === 'DEV_LOCAL_FALLBACK',
        isReady: dbService.isReady,
      },
      cache: {
        isRedisConnected: cacheService.isRedisConnected,
        mode: cacheService.isRedisConnected ? 'REDIS_CLUSTER' : 'MEMORY_FALLBACK_ACTIVE',
      },
      fx: {
        status: fxSnapshot.status,
        provider: fxSnapshot.provider,
        providerTimestamp: fxSnapshot.providerTimestamp,
        ratesCount: Object.keys(fxSnapshot.rates).length,
      },
      taxEngine: {
        totalSupportedCountries: TaxRegistry.getSupportedCountryIds().length,
        supportedCountryIds: TaxRegistry.getSupportedCountryIds(),
      },
      vitalsP75: vitalsSummary,
      process: {
        nodeVersion: process.version,
        rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      },
    });
  });

  // SERVERLESS DATABASE INITIALIZATION GATE
  // Vercel does not call startServer(), so production API requests must explicitly
  // await migrations/seeding on each cold start. The promise is memoized per instance.
  app.use('/api', async (req, res, next) => {
    try {
      await ensureDatabaseReady();
      if (process.env.NODE_ENV === 'production' && (!dbInitialized || dbService.mode !== 'PRODUCTION_POSTGRES')) {
        return res.status(503).json({
          error: 'DATABASE_NOT_READY',
          message: 'Production database is not ready.',
        });
      }
      next();
    } catch {
      return res.status(503).json({
        error: 'DATABASE_INITIALIZATION_FAILED',
        message: 'Production data services are temporarily unavailable.',
      });
    }
  });

  // 2. CORE FINANCIAL & TAX ENGINE APIS
  app.post('/api/calculate', rateLimit(60, 60), async (req, res) => {
    try {
      const scenario = req.body;
      if (!scenario || !scenario.location || !scenario.compensation) {
        return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'Location and compensation are required.' });
      }

      const result = SalaryWorthCalculator.calculate(scenario);

      // Asynchronously persist calculation to DB
      const { scenarioId, resultId } = await dbService.persistCalculation(scenario, result);

      res.json({
        success: true,
        scenarioId,
        resultId,
        data: result,
      });
    } catch (err: any) {
      console.error('Calculation error:', err);
      res.status(500).json({ error: 'CALCULATION_ERROR', message: err.message });
    }
  });

  app.get('/api/calculation/:id', rateLimit(120, 60), async (req, res) => {
    try {
      const calculation = await dbService.getCalculation(req.params.id);
      if (!calculation) {
        return res.status(404).json({ error: 'CALCULATION_NOT_FOUND', message: 'Calculation scenario not found.' });
      }
      res.json({ success: true, calculation });
    } catch (err: any) {
      res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
  });

  app.post('/api/compare', rateLimit(60, 60), async (req, res) => {
    try {
      const { scenarioA, scenarioB, displayCurrency, relocationB } = req.body;
      if (!scenarioA || !scenarioB) {
        return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'scenarioA and scenarioB are required.' });
      }

      const fxSnapshot = await FxEngine.getLatestSnapshot();
      const comparison = ComparisonEngine.compare(
        scenarioA,
        scenarioB,
        displayCurrency || 'USD',
        relocationB,
        fxSnapshot
      );
      res.json({
        success: true,
        data: comparison,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'COMPARISON_ERROR', message: err.message });
    }
  });

  app.post('/api/salary-needed', rateLimit(60, 60), async (req, res) => {
    try {
      const { scenario, targetSavingsMonthlyMinor } = req.body;
      if (!scenario || typeof targetSavingsMonthlyMinor !== 'number') {
        return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'Scenario and targetSavingsMonthlyMinor required.' });
      }

      const currency = scenario.location?.currency || 'USD';
      const targetSavings = fromMinor(targetSavingsMonthlyMinor, currency);
      const result = SalaryNeededCalculator.calculate(scenario, targetSavings);
      res.json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'SALARY_NEEDED_ERROR', message: err.message });
    }
  });

  // Authoritative Tax Calculation / Estimation
  const handleTaxEstimate = async (req: express.Request, res: express.Response) => {
    try {
      const {
        grossSalaryMinor,
        currency,
        countryId,
        regionId,
        cityId,
        taxJurisdictionId,
        filingStatus,
        dependentsCount,
        taxYear,
      } = req.body;

      if (typeof grossSalaryMinor !== 'number' || !countryId) {
        return res.status(400).json({
          error: 'INVALID_PAYLOAD',
          message: 'grossSalaryMinor and countryId are required.',
        });
      }

      const curr = (currency || COUNTRIES[countryId]?.defaultCurrency || 'USD') as any;
      const grossMoney = fromMinor(grossSalaryMinor, curr);
      const profile = {
        filingStatus: filingStatus || 'single',
        dependentsCount: typeof dependentsCount === 'number' ? dependentsCount : 0,
        taxYear: resolveTaxYear(taxYear),
      };
      const location = {
        countryId,
        regionId,
        cityId,
        taxJurisdictionId,
      };

      const result = TaxRegistry.calculate(grossMoney, profile, location);
      const support = TaxRegistry.getCountrySupport(countryId);
      const isUnavailable = result.status === 'TAX_CALCULATION_UNAVAILABLE';

      res.json({
        success: true,
        data: result,
        verificationStatus: isUnavailable ? 'UNDER_VERIFICATION' : support.verificationStatus,
        isStatutorilyVerified: isUnavailable ? false : support.isStatutorilyVerified,
        notes: isUnavailable ? (result.unsupportedExplanation || support.notes) : support.notes,
      });
    } catch (err: any) {
      console.error('Tax calculation error:', err);
      res.status(500).json({ error: 'TAX_CALCULATION_ERROR', message: err.message });
    }
  };

  app.post('/api/tax/estimate', rateLimit(60, 60), handleTaxEstimate);
  app.post('/api/tax/calculate', rateLimit(60, 60), handleTaxEstimate);

  // Authoritative Cost of Living Calculation
  app.post('/api/cost-of-living', rateLimit(60, 60), async (req, res) => {
    try {
      const { cityId, household, overrides } = req.body;
      if (!cityId || !household) {
        return res.status(400).json({
          error: 'INVALID_PAYLOAD',
          message: 'cityId and household profile are required.',
        });
      }

      const result = CostOfLivingEngine.calculate(cityId, household, overrides);
      res.json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error('Cost of living error:', err);
      res.status(500).json({ error: 'COL_CALCULATION_ERROR', message: err.message });
    }
  });

  // 3. GEOGRAPHY & EVIDENCE METADATA
  app.get('/api/countries', rateLimit(120, 60), (req, res) => {
    const list = Object.values(COUNTRIES).map((c) => {
      const support = TaxRegistry.getCountrySupport(c.id);
      return {
        ...c,
        verificationStatus: support.verificationStatus,
        isStatutorilyVerified: support.isStatutorilyVerified,
        isSupported: support.isSupported,
        notes: support.notes || c.notes,
      };
    });
    res.json({ countries: list });
  });

  app.get('/api/capabilities', rateLimit(120, 60), (req, res) => {
    res.json({ capabilities: CapabilityResolver.getAllCapabilities() });
  });

  app.get('/api/cities', rateLimit(120, 60), (req, res) => {
    res.json({ cities: Object.values(CITIES) });
  });

  app.get('/api/tax/inspect', rateLimit(60, 60), (req, res) => {
    const countryId = (req.query.countryId as string) || 'US';
    const regionId = req.query.regionId as string | undefined;

    const taxYear = resolveTaxYear(req.query.taxYear);
    const adapter = TaxRegistry.getAdapter({ countryId, regionId, taxYear });
    const sample = TaxRegistry.calculate(
      createMoney(100000, COUNTRIES[countryId]?.defaultCurrency || 'USD'),
      { filingStatus: 'single', dependentsCount: 0, taxYear },
      { countryId, regionId, taxYear }
    );

    res.json({
      countryId,
      regionId,
      taxYear,
      adapterName: adapter.name,
      status: sample.status || 'CALCULATED',
      taxRuleVersion: sample.taxRuleVersion,
      components: sample.components,
      warnings: sample.warnings || [],
      unsupportedExplanation: sample.unsupportedExplanation,
      evidenceSources: sample.evidenceSourceIds.map((id) => EVIDENCE_REGISTRY[id]).filter(Boolean),
    });
  });


  app.get('/api/tax/years', rateLimit(120, 60), (req, res) => {
    const requestedYear = resolveTaxYear(req.query.taxYear);
    res.json({
      latestVerifiedTaxYear: LATEST_VERIFIED_TAX_YEAR,
      requestedYear,
      requestedYearStatus:
        requestedYear <= LATEST_VERIFIED_TAX_YEAR ? 'VERIFIED_PERIOD_AVAILABLE' : 'UNDER_VERIFICATION',
      futureYearPolicy:
        'Future statutory schedules are never inferred. Years newer than the latest verified period return TAX_CALCULATION_UNAVAILABLE until official rules are implemented and tested.',
    });
  });

  app.get('/api/tax/registry', rateLimit(60, 60), (req, res) => {
    const supportedCountries = TaxRegistry.getSupportedCountryIds();
    const commercialMarkets = TaxRegistry.getCommercialMarketIds();
    res.json({
      totalSupportedCountries: supportedCountries.length,
      supportedCountryIds: supportedCountries,
      commercialMarketCount: commercialMarkets.length,
      commercialMarketIds: commercialMarkets,
      adapters: commercialMarkets.map((id) => TaxRegistry.getCountrySupport(id)),
    });
  });

  // 4. FX RATES & CRON REFRESH
  app.get('/api/fx/latest', rateLimit(60, 60), async (req, res) => {
    const snapshot = await FxEngine.getLatestSnapshot();
    res.json({ snapshot });
  });

  app.post('/api/fx/refresh', rateLimit(10, 60), async (req, res) => {
    const session = extractSession(req);
    if (!session || !AuthService.hasPermission(session.role, 'trigger_fx_refresh')) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient role permissions to refresh FX rates.' });
    }

    const updated = await FxEngine.refreshFromProvider(true);
    await dbService.recordAuditLog({
      actorEmail: session.email,
      action: 'FX_REFRESH',
      entityType: 'fx_snapshot',
      entityId: updated.id,
      metadata: { ratesCount: Object.keys(updated.rates).length, provider: updated.provider },
    });

    res.json({ success: true, snapshot: updated });
  });

  app.get('/api/cron/fx', rateLimit(10, 60, { isSecuritySensitive: true, failClosed: true }), async (req, res) => {
    const authHeader = req.headers.authorization;
    const querySecret = typeof req.query.secret === 'string' ? req.query.secret : undefined;
    const provided = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : querySecret;

    let isAuthorized = false;
    if (provided && CRON_SECRET) {
      try {
        const provBuf = Buffer.from(provided);
        const expBuf = Buffer.from(CRON_SECRET);
        if (provBuf.length === expBuf.length && crypto.timingSafeEqual(provBuf, expBuf)) {
          isAuthorized = true;
        }
      } catch {}
    }

    if (!isAuthorized) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Valid cron secret required.' });
    }

    const updated = await FxEngine.refreshFromProvider(true);
    res.json({ success: true, timestamp: new Date().toISOString(), snapshotId: updated.id });
  });

  // 5. CMS & CONTENT WORKFLOW
  app.get('/api/content', rateLimit(120, 60), async (req, res) => {
    const locale = (req.query.locale as string) || 'en';
    const pages = await dbService.getContentPages({ locale });
    res.json({ pages });
  });

  app.get('/api/content/:slug', rateLimit(120, 60), async (req, res) => {
    const slug = req.params.slug;
    const locale = (req.query.locale as string) || 'en';
    const page = await dbService.getContentPageBySlug(slug, locale);
    if (!page) {
      return res.status(404).json({ error: 'PAGE_NOT_FOUND' });
    }
    res.json({ page });
  });

  app.post('/api/content', rateLimit(30, 60), async (req, res) => {
    const session = extractSession(req);
    if (!session || !AuthService.hasPermission(session.role, 'edit_content')) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Editor permission required.' });
    }

    const pageData = req.body;
    if (pageData.workflowState === 'APPROVED' && !AuthService.hasPermission(session.role, 'review_content')) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Reviewer permission required to approve content.' });
    }
    if (pageData.workflowState === 'PUBLISHED' && !AuthService.hasPermission(session.role, 'publish_content')) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Publisher permission required to publish content.' });
    }
    if (pageData.workflowState === 'INDEX_APPROVED' && !AuthService.hasPermission(session.role, 'approve_indexing')) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'SEO_REVIEWER or ADMIN permission required to approve indexing.' });
    }

    const saved = await dbService.upsertContentPage({
      ...pageData,
      authorEmail: session.email,
    });

    await dbService.recordAuditLog({
      actorEmail: session.email,
      action: 'CMS_PAGE_UPSERT',
      entityType: 'content_page',
      entityId: saved.id,
      metadata: { slug: saved.slug, workflowState: saved.workflowState },
    });

    res.json({ success: true, page: saved });
  });


  app.post('/api/content/:slug/workflow', rateLimit(30, 60), async (req, res) => {
    const session = extractSession(req);
    if (!session) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const workflowState = String(req.body?.workflowState || '');
    const locale = (req.query.locale as string) || 'en';
    const allowedStates = new Set(['DRAFTED', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'INDEX_APPROVED']);
    if (!allowedStates.has(workflowState)) {
      return res.status(400).json({ error: 'INVALID_WORKFLOW_STATE', message: 'Unsupported content workflow state.' });
    }

    let permitted = false;
    if (workflowState === 'DRAFTED' || workflowState === 'IN_REVIEW') {
      permitted = AuthService.hasPermission(session.role, 'edit_content');
    } else if (workflowState === 'APPROVED') {
      permitted = AuthService.hasPermission(session.role, 'review_content');
    } else if (workflowState === 'PUBLISHED') {
      permitted = AuthService.hasPermission(session.role, 'publish_content');
    } else if (workflowState === 'INDEX_APPROVED') {
      permitted = AuthService.hasPermission(session.role, 'approve_indexing');
    }

    if (!permitted) {
      return res.status(403).json({ error: 'FORBIDDEN', message: `Role ${session.role} cannot transition content to ${workflowState}.` });
    }

    const existing = await dbService.getContentPageBySlug(req.params.slug, locale);
    if (!existing) {
      return res.status(404).json({ error: 'PAGE_NOT_FOUND' });
    }

    const saved = await dbService.upsertContentPage({
      ...existing,
      workflowState,
      reviewerEmail:
        workflowState === 'APPROVED' || workflowState === 'PUBLISHED' || workflowState === 'INDEX_APPROVED'
          ? session.email
          : existing.reviewerEmail,
    });

    await dbService.recordAuditLog({
      actorEmail: session.email,
      action: 'CMS_WORKFLOW_TRANSITION',
      entityType: 'content_page',
      entityId: saved.id,
      metadata: { slug: saved.slug, locale, from: existing.workflowState, to: workflowState },
    });

    res.json({ success: true, page: saved });
  });

  // 6. ADMIN AUTHENTICATION & RBAC
  app.post('/api/admin/login', rateLimit(5, 60, { isSecuritySensitive: true, failClosed: true }), async (req, res) => {
    const { email, password, totpCode } = req.body;

    try {
      const dbUser = await dbService.getUserByEmail(email);
      if (dbUser && dbUser.isActive !== false && AuthService.verifyPassword(password, dbUser.passwordHash)) {
        if (dbUser.mfaEnabled && dbUser.mfaSecret) {
          if (!totpCode || !AuthService.verifyTotp(dbUser.mfaSecret, totpCode)) {
            return res.status(401).json({ error: 'MFA_REQUIRED', message: 'Valid 6-digit TOTP code required.' });
          }
        }
        const user = { id: dbUser.id, email: dbUser.email, role: dbUser.role as any };
        const token = AuthService.createSessionToken(user);

        await dbService.recordAuditLog({
          actorEmail: email,
          action: 'ADMIN_LOGIN_SUCCESS',
          entityType: 'user',
          entityId: user.id,
        });

        return res.json({
          success: true,
          token,
          user: { id: user.id, email: user.email, role: user.role },
        });
      }
    } catch (e: any) {
      console.error('[Auth] Login verification exception:', e.message);
    }

    await dbService.recordAuditLog({
      actorEmail: email || 'unknown',
      action: 'ADMIN_LOGIN_FAILED',
      entityType: 'user',
      entityId: 'failed',
    });

    res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid admin credentials.' });
  });

  app.get('/api/admin/me', rateLimit(60, 60), (req, res) => {
    const session = extractSession(req);
    if (!session) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }
    res.json({ user: session });
  });

  app.get('/api/admin/audit-logs', rateLimit(30, 60), async (req, res) => {
    const session = extractSession(req);
    if (!session || !AuthService.hasPermission(session.role, 'view_audit_logs')) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient permissions to view audit logs.' });
    }
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await dbService.getAuditLogs(limit);
    res.json({ logs });
  });

  app.get('/api/admin/users', rateLimit(30, 60), async (req, res) => {
    const session = extractSession(req);
    if (!session || !AuthService.hasPermission(session.role, 'manage_users')) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient permissions to manage users.' });
    }
    const users = await dbService.getUsers();
    // Exclude password hashes from response
    const sanitized = users.map((u) => {
      const { passwordHash, mfaSecret, ...rest } = u;
      return rest;
    });
    res.json({ users: sanitized });
  });

  app.post('/api/admin/users', rateLimit(20, 60, { isSecuritySensitive: true, failClosed: true }), async (req, res) => {
    const session = extractSession(req);
    if (!session || !AuthService.hasPermission(session.role, 'manage_users')) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient permissions to manage users.' });
    }
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'Email, password, and role are required.' });
    }
    const allowedRoles = new Set(['ADMIN', 'DATA_EDITOR', 'CONTENT_EDITOR', 'REVIEWER', 'SEO_REVIEWER', 'READ_ONLY']);
    if (!allowedRoles.has(role)) {
      return res.status(400).json({ error: 'INVALID_ROLE', message: 'Unsupported user role.' });
    }
    if (typeof password !== 'string' || password.length < 12) {
      return res.status(400).json({ error: 'WEAK_PASSWORD', message: 'Admin passwords must contain at least 12 characters.' });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'INVALID_EMAIL', message: 'A valid email address is required.' });
    }
    const passwordHash = AuthService.hashPassword(password);
    const created = await dbService.upsertUser({
      email,
      passwordHash,
      role,
      isActive: true,
      mfaEnabled: false,
    });
    await dbService.recordAuditLog({
      actorEmail: session.email,
      action: 'USER_UPSERTED',
      entityType: 'user',
      entityId: created.id,
      metadata: { targetEmail: email, role },
    });
    const { passwordHash: _, mfaSecret: __, ...rest } = created;
    res.json({ success: true, user: rest });
  });

  app.get('/api/reviews', rateLimit(60, 60), async (req, res) => {
    const contentPageId = req.query.contentPageId as string | undefined;
    const reviews = await dbService.getReviews(contentPageId);
    res.json({ reviews });
  });

  app.post('/api/reviews', rateLimit(30, 60), async (req, res) => {
    const session = extractSession(req);
    if (!session || !AuthService.hasPermission(session.role, 'review_content')) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Reviewer permission required.' });
    }
    const { contentPageId, status, feedbackNotes, statutoryCheckPassed } = req.body;
    if (!contentPageId || !status) {
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'contentPageId and status are required.' });
    }
    const review = await dbService.recordReview({
      contentPageId,
      reviewerEmail: session.email,
      status,
      feedbackNotes,
      statutoryCheckPassed,
    });
    await dbService.recordAuditLog({
      actorEmail: session.email,
      action: 'EDITORIAL_REVIEW_RECORDED',
      entityType: 'editorial_review',
      entityId: review.id,
      metadata: { contentPageId, status },
    });
    res.json({ success: true, review });
  });

  // 7. REAL USER MONITORING (RUM) WEB VITALS
  app.post('/api/rum/vitals', rateLimit(120, 60), async (req, res) => {
    const { name, value, rating, route, device } = req.body;
    if (name && typeof value === 'number') {
      await dbService.recordWebVital({
        name,
        value,
        rating: rating || 'good',
        route: route || '/',
        device: device || 'desktop',
      });
    }
    res.status(202).json({ accepted: true });
  });

  app.get('/api/rum/summary', rateLimit(60, 60), async (req, res) => {
    const summary = await dbService.getWebVitalsSummary();
    res.json({ vitals: summary });
  });
}

configureApp();

let staticMounted = false;
export function mountStaticAndFallback(expressApp: express.Express) {
  if (staticMounted) return;
  staticMounted = true;
  const distPath = path.join(process.cwd(), 'dist');
  expressApp.use(express.static(distPath, { redirect: false }));
  expressApp.get('*', (req, res) => {
    const pathname = req.path.replace(/\/$/, '') || '/';
    if (pathname === '/') {
      const homePath = path.join(distPath, 'index.html');
      if (fs.existsSync(homePath)) {
        return res.sendFile(homePath);
      }
    }
    const candidatePath = path.join(distPath, pathname, 'index.html');
    if (fs.existsSync(candidatePath)) {
      return res.sendFile(candidatePath);
    }
    const notFoundPath = path.join(distPath, '404.html');
    if (fs.existsSync(notFoundPath)) {
      return res.status(404).type('html').sendFile(notFoundPath);
    }
    return res.status(404).type('html').send('<!DOCTYPE html><html><head><title>404 Not Found</title><meta name="robots" content="noindex, nofollow" /></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>');
  });
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' || process.env.SERVE_STATIC || process.env.SKIP_SERVER_START) {
  mountStaticAndFallback(app);
}

export async function startServer() {
  await ensureDatabaseReady();

  // Vite middleware for development vs static build in production (or SERVE_STATIC=1)
  if (process.env.NODE_ENV !== 'production' && !process.env.SERVE_STATIC && process.env.NODE_ENV !== 'test') {
    const distPath = path.join(process.cwd(), 'dist');

    // In dev mode, serve pre-generated institutional HTML pages from dist/ before
    // handing off to Vite's SPA middleware. This allows routing regression tests
    // (which run against the dev server) to correctly receive standalone pages for
    // /about, /methodology, /sources, /editorial-policy, /data-policy, /corrections,
    // /terms, /privacy, /countries/*, /cities/*, /compare/*, /guides/*
    // without being rewritten to the SPA shell.
    app.use((req, res, next) => {
      // Only handle GET requests for paths that may have a prerendered file
      if (req.method !== 'GET') return next();
      const pathname = req.path.replace(/\/$/, '') || '/';
      // Do NOT intercept root route / in dev mode; let Vite handle the SPA
      if (pathname === '/') return next();
      // Skip API routes, asset paths, and Vite internal paths
      if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/assets/') ||
        pathname.startsWith('/src/') ||
        pathname.startsWith('/@') ||
        pathname.startsWith('/node_modules/') ||
        /\.[a-zA-Z0-9]+$/.test(pathname)
      ) {
        return next();
      }
      // Build the candidate file path: /about -> dist/about/index.html
      const candidatePath = path.join(distPath, pathname, 'index.html');
      if (fs.existsSync(candidatePath)) {
        return res.sendFile(candidatePath);
      }
      const notFoundPath = path.join(distPath, '404.html');
      if (fs.existsSync(notFoundPath)) {
        return res.status(404).type('html').sendFile(notFoundPath);
      }
      return res.status(404).type('html').send('<!DOCTYPE html><html><head><title>404 Not Found</title><meta name="robots" content="noindex, nofollow" /></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>');
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    mountStaticAndFallback(app);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LivWorthy Server] Enterprise server active on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL && !process.env.SKIP_SERVER_START) {
  startServer();
}

export default app;

