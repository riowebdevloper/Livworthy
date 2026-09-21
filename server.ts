import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { validateEnv } from './src/lib/env';
import { dbService } from './src/db/client';
import { cacheService } from './src/lib/redis';
import { FxEngine } from './src/engines/fx/fx-service';
import { TaxRegistry } from './src/engines/tax/tax-registry';
import { SalaryWorthCalculator } from './src/engines/calculator-core/salary-worth';
import { ComparisonEngine } from './src/engines/calculator-core/compare';
import { SalaryNeededCalculator } from './src/engines/calculator-core/salary-needed';
import { AuthService } from './src/lib/auth';
import { COUNTRIES, CITIES } from './src/data/locations';
import { EVIDENCE_REGISTRY } from './src/data/evidence-registry';
import { createMoney, fromMinor } from './src/lib/money';

const env = validateEnv();
const PORT = parseInt(process.env.PORT || '3000', 10);
const START_TIME = Date.now();
const CRON_SECRET = env.CRON_SECRET;

async function startServer() {
  try {
    console.log(`[Database] Initializing in ${dbService.mode} mode...`);
    const migRes = await dbService.runMigrations();
    console.log(`[Database] Migrations verified (executed: ${migRes.executedCount})`);
    const seedRes = await dbService.seedData();
    console.log(`[Database] Seed verified (${seedRes.countriesCount} countries, ${seedRes.citiesCount} cities)`);
  } catch (dbErr: any) {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction || dbService.mode === 'PRODUCTION_POSTGRES') {
      console.error('[Database] Fatal startup failure: Database initialization or migration failed.');
      process.exit(1);
    } else {
      console.warn('[Database] Startup initialization notice:', dbErr.message);
    }
  }

  const app = express();

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https:;"
    );
    next();
  });

  // Body parser with strict size limits
  app.use(express.json({ limit: '512kb' }));

  // CORS Middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
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

  app.get('/api/health/ready', async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
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

    if (isReady) {
      return res.status(200).json({
        ready: true,
        database: dbStatus,
        cache: cacheStatus,
        fx: fxStatus,
        adaptersLoaded: TaxRegistry.getSupportedCountryIds().length,
      });
    } else {
      return res.status(503).json({
        ready: false,
        database: dbStatus,
        cache: cacheStatus,
        fx: fxStatus,
      });
    }
  });

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

  app.get('/api/cities', rateLimit(120, 60), (req, res) => {
    res.json({ cities: Object.values(CITIES) });
  });

  app.get('/api/tax/inspect', rateLimit(60, 60), (req, res) => {
    const countryId = (req.query.countryId as string) || 'US';
    const regionId = req.query.regionId as string | undefined;

    const adapter = TaxRegistry.getAdapter({ countryId, regionId, taxYear: 2024 });
    const sample = adapter.calculate(
      createMoney(100000, COUNTRIES[countryId]?.defaultCurrency || 'USD'),
      { filingStatus: 'single', dependentsCount: 0, taxYear: 2024 },
      { countryId, regionId, taxYear: 2024 }
    );

    res.json({
      countryId,
      regionId,
      adapterName: adapter.name,
      taxRuleVersion: sample.taxRuleVersion,
      components: sample.components,
      evidenceSources: sample.evidenceSourceIds.map((id) => EVIDENCE_REGISTRY[id]).filter(Boolean),
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
    // Check if promoting to INDEX_APPROVED: requires approve_indexing permission
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

  // 6. ADMIN AUTHENTICATION & RBAC
  app.post('/api/admin/login', rateLimit(5, 60, { isSecuritySensitive: true, failClosed: true }), async (req, res) => {
    const { email, password, totpCode } = req.body;

    try {
      const dbUser = await dbService.getUserByEmail(email);
      if (dbUser && AuthService.verifyPassword(password, dbUser.passwordHash)) {
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

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LivWorthy Server] Enterprise server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
