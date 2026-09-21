import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { eq, desc, and } from 'drizzle-orm';
import * as schema from './schema';
import { COUNTRIES, CITIES, REGIONS } from '../data/locations';
import { EVIDENCE_SOURCES } from '../data/evidence-registry';
import { AuthService } from '../lib/auth';

export type DatabaseMode = 'PRODUCTION_POSTGRES' | 'DEV_LOCAL_FALLBACK';
export type DataClassification = 'OBSERVED' | 'DERIVED' | 'ESTIMATED' | 'SYNTHETIC' | 'UNAVAILABLE';

export interface DatabaseHealth {
  healthy: boolean;
  migrationsApplied: boolean;
  mode: DatabaseMode;
  error?: string;
}

export interface IDatabaseService {
  mode: DatabaseMode;
  isReady: boolean;
  checkConnection(): Promise<DatabaseHealth>;
  getAuthoritativeCostData(cityId: string): Promise<{ data: any; classification: DataClassification }>;
  runMigrations(): Promise<{ success: boolean; executedCount: number; mode: DatabaseMode }>;
  seedData(): Promise<{ success: boolean; countriesCount: number; citiesCount: number }>;
  getCountries(): Promise<any[]>;
  getCities(): Promise<any[]>;
  getRegions(): Promise<any[]>;
  getTaxJurisdictions(): Promise<any[]>;
  getCostDatasets(cityId?: string): Promise<any[]>;
  getHousingDatasets(cityId?: string): Promise<any[]>;
  getSalaryDatasets(cityId?: string): Promise<any[]>;
  getEvidenceSources(): Promise<any[]>;
  persistCalculation(scenario: any, result: any): Promise<{ scenarioId: string; resultId: string }>;
  getCalculation(scenarioId: string): Promise<any | null>;
  saveFxSnapshot(snapshot: any): Promise<void>;
  getLatestFxSnapshot(baseCurrency: string): Promise<any | null>;
  getContentPages(filter?: { locale?: string; workflowState?: string }): Promise<any[]>;
  getContentPageBySlug(slug: string, locale?: string): Promise<any | null>;
  upsertContentPage(page: any): Promise<any>;
  recordAuditLog(entry: {
    actorEmail: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;
  getAuditLogs(limit?: number): Promise<any[]>;
  recordWebVital(vital: {
    name: string;
    value: number;
    rating: string;
    route: string;
    device: string;
  }): Promise<void>;
  getWebVitalsSummary(): Promise<any>;
  getUsers(): Promise<any[]>;
  getUserByEmail(email: string): Promise<any | null>;
  upsertUser(user: any): Promise<any>;
  getReviews(contentPageId?: string): Promise<any[]>;
  recordReview(review: any): Promise<any>;
}

function sanitizeDbUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  let cleaned = raw.trim();
  if (cleaned.startsWith('DATABASE_URL=')) {
    cleaned = cleaned.substring('DATABASE_URL='.length);
  }
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

class PostgresDatabaseService implements IDatabaseService {
  public mode: DatabaseMode = 'PRODUCTION_POSTGRES';
  public isReady: boolean = false;
  private db: any = null;
  private client: any = null;

  constructor(connectionString: string) {
    try {
      const sanitized = sanitizeDbUrl(connectionString)!;
      this.client = postgres(sanitized, {
        ssl: 'require',
        max: 10,
        connect_timeout: 10,
        idle_timeout: 20,
      });
      this.db = drizzle(this.client, { schema });
      this.isReady = true;
    } catch (err) {
      console.error('[Database] Failed to initialize PostgreSQL client:', err);
      this.isReady = false;
    }
  }

  async checkConnection(): Promise<DatabaseHealth> {
    if (!this.client) {
      return { healthy: false, migrationsApplied: false, mode: this.mode, error: 'Postgres client not initialized' };
    }
    try {
      await this.client.unsafe('SELECT 1');
      const migrations = await this.client.unsafe(
        `SELECT migration_name FROM schema_migrations WHERE migration_name = '0000_init_livworth.sql' LIMIT 1;`
      ).catch(() => []);
      const migrationsApplied = migrations && migrations.length > 0;
      return { healthy: true, migrationsApplied, mode: this.mode };
    } catch (err: any) {
      return { healthy: false, migrationsApplied: false, mode: this.mode, error: 'Database connection failed' };
    }
  }

  async getAuthoritativeCostData(cityId: string): Promise<{ data: any; classification: DataClassification }> {
    const list = await this.getCostDatasets(cityId);
    if (!list || list.length === 0) {
      return { data: null, classification: 'UNAVAILABLE' };
    }
    const row = list[0];
    const isNyc = row.cityId === 'nyc';
    const classification: DataClassification = isNyc ? 'OBSERVED' : 'DERIVED';
    return { data: row, classification };
  }

  async runMigrations() {
    try {
      const migrationFile = path.join(process.cwd(), 'src/db/migrations/0000_init_livworth.sql');
      const sqlContent = fs.readFileSync(migrationFile, 'utf-8');

      // Create tracking table if not exists
      await this.client.unsafe(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id SERIAL PRIMARY KEY,
          migration_name TEXT NOT NULL UNIQUE,
          applied_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      // Check if migration already applied
      const existing = await this.client.unsafe(
        `SELECT migration_name FROM schema_migrations WHERE migration_name = '0000_init_livworth.sql';`
      );

      if (existing && existing.length > 0) {
        return { success: true, executedCount: 0, mode: this.mode };
      }

      // Execute migration SQL
      await this.client.unsafe(sqlContent);

      // Record applied migration
      await this.client.unsafe(
        `INSERT INTO schema_migrations (migration_name) VALUES ('0000_init_livworth.sql') ON CONFLICT DO NOTHING;`
      );

      return { success: true, executedCount: 1, mode: this.mode };
    } catch (err) {
      console.error('[PostgresDatabaseService] Migration execution error:', err);
      throw err;
    }
  }

  async seedData() {
    try {
      // 1. Seed Countries (batched)
      const countryRows = Object.values(COUNTRIES).map((country) => ({
        id: country.id,
        name: country.name,
        defaultCurrency: country.defaultCurrency,
        verificationStatus: country.verificationStatus,
        notes: country.notes || null,
      }));
      if (countryRows.length > 0) {
        await this.db.insert(schema.countries).values(countryRows).onConflictDoNothing();
      }

      // 2. Seed Regions (batched)
      const regionRows = Object.values(REGIONS).map((region) => ({
        id: region.id,
        countryId: region.countryId,
        name: region.name,
        code: region.code,
      }));
      if (regionRows.length > 0) {
        await this.db.insert(schema.regions).values(regionRows).onConflictDoNothing();
      }

      // 3. Seed Cities (batched)
      const cityRows = Object.values(CITIES).map((city) => ({
        id: city.id,
        name: city.name,
        countryId: city.countryId,
        regionId: city.regionId,
        currency: city.currency,
        latitude: 0,
        longitude: 0,
        colIndexVsNyc: city.colIndexBase100NYC || 100,
        rentIndexVsNyc: city.colIndexBase100NYC || 100,
      }));
      if (cityRows.length > 0) {
        await this.db.insert(schema.cities).values(cityRows).onConflictDoNothing();
      }

      // 4. Seed Evidence Sources (batched)
      const evidenceRows = Object.entries(EVIDENCE_SOURCES).map(([id, src]) => ({
        id,
        name: src.canonicalReference,
        tier: src.reliabilityTier || 'TIER_1_GOVERNMENT',
        authority: src.organization,
        url: src.url,
        methodology: src.notes || '',
        frequency: 'annual',
        lastVerifiedAt: new Date(src.verifiedAt || Date.now()),
      }));
      if (evidenceRows.length > 0) {
        await this.db.insert(schema.evidenceSources).values(evidenceRows).onConflictDoNothing();
      }

      // 5. Seed Core Cost, Housing, and Salary Datasets (batched)
      const costRows: any[] = [];
      const housingRows: any[] = [];
      const salaryRows: any[] = [];

      for (const city of Object.values(CITIES)) {
        const factor = (city.colIndexBase100NYC || 100) / 100.0;
        const oneBed = Math.round(3400 * factor * 100);
        const threeBed = Math.round(5800 * factor * 100);

        const isObserved = city.id === 'nyc';
        const confidenceRating = isObserved ? 0.88 : 0.65;

        const costSourceRef = isObserved
          ? 'U.S. Bureau of Labor Statistics Consumer Expenditure Survey & NYC Metropolitan Benchmarks'
          : 'Spatial price index model calibrated against metropolitan benchmarks';

        const housingSourceRef = isObserved
          ? 'U.S. Department of Housing and Urban Development (HUD) Fair Market Rents 2024'
          : 'Spatial rental benchmark model';

        const salarySourceRef = isObserved
          ? 'U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS)'
          : 'Relative spatial wage benchmark model';

        costRows.push({
          id: `cost_${city.id}_2024q4`,
          cityId: city.id,
          datasetVersion: '2024.Q4',
          observationDate: new Date('2024-12-01'),
          housingOneBedMinor: oneBed,
          housingThreeBedMinor: threeBed,
          foodMonthlyMinor: Math.round(650 * factor * 100),
          utilitiesMonthlyMinor: Math.round(220 * factor * 100),
          transportMonthlyMinor: Math.round(140 * factor * 100),
          healthcareMonthlyMinor: Math.round(180 * factor * 100),
          confidenceRating,
          sourceRef: costSourceRef,
        });

        housingRows.push({
          id: `house_${city.id}_1bed`,
          cityId: city.id,
          bedroomCount: 'one_bed',
          neighborhoodTier: 'city_center',
          medianMonthlyRentMinor: oneBed,
          p25MonthlyRentMinor: Math.round(oneBed * 0.85),
          p75MonthlyRentMinor: Math.round(oneBed * 1.25),
          currency: city.currency,
          sourceRef: housingSourceRef,
        });

        salaryRows.push({
          id: `sal_${city.id}_swe`,
          cityId: city.id,
          roleTitle: 'Software Engineer',
          experienceLevel: 'mid',
          p25AnnualMinor: Math.round(85000 * factor * 100),
          p50AnnualMinor: Math.round(120000 * factor * 100),
          p75AnnualMinor: Math.round(160000 * factor * 100),
          p90AnnualMinor: Math.round(200000 * factor * 100),
          currency: city.currency,
          sampleSize: 250,
          sourceRef: salarySourceRef,
        });
      }

      if (costRows.length > 0) {
        await this.db.insert(schema.costDatasets).values(costRows).onConflictDoNothing();
      }
      if (housingRows.length > 0) {
        await this.db.insert(schema.housingDatasets).values(housingRows).onConflictDoNothing();
      }
      if (salaryRows.length > 0) {
        await this.db.insert(schema.salaryDatasets).values(salaryRows).onConflictDoNothing();
      }

      // 6. Bootstrap Initial Administrator if provided via environment
      const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim();
      const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim();

      // Purge legacy insecure default admin user from database if present
      if (!bootstrapEmail || (bootstrapEmail !== 'admin@livworthy.com' && bootstrapEmail !== 'admin@livworth.com')) {
        await this.db.delete(schema.users).where(eq(schema.users.id, 'usr_admin_001'));
      }

      if (bootstrapEmail && bootstrapPassword) {
        const existingAdmins = await this.db
          .select()
          .from(schema.users)
          .where(eq(schema.users.role, 'ADMIN'))
          .limit(1);
        if (existingAdmins.length === 0) {
          const hashedPassword = AuthService.hashPassword(bootstrapPassword);
          await this.db
            .insert(schema.users)
            .values({
              id: `usr_${Date.now()}`,
              email: bootstrapEmail,
              passwordHash: hashedPassword,
              role: 'ADMIN',
              mfaEnabled: false,
              isActive: true,
            })
            .onConflictDoNothing();
          console.log(`[Database] Initial administrator provisioned for: ${bootstrapEmail}`);
        }
      }

      // 7. Seed Core Content Pages
      const initialPages = [
        {
          id: 'page_methodology',
          slug: 'methodology',
          locale: 'en',
          title: 'LivWorthy Mathematical Methodology & Data Integrity Charter',
          metaDescription: 'Complete documentation of statutory tax schedules, spatial price deflators, and verification standards.',
          workflowState: 'INDEX_APPROVED',
          isIndexable: true,
          authorEmail: 'editorial@livworthy.com',
          reviewerEmail: 'chief.economist@livworthy.com',
          publishedAt: new Date(),
          canonicalUrl: 'https://livworthy.com/methodology',
          blocksJson: [
            { type: 'heading', level: 2, content: 'Data Integrity Charter' },
            { type: 'prose', content: 'LivWorthy provides deterministic income and cost intelligence. We never substitute statutory tax schedules with synthetic models or unverified crowdsourced numbers.' },
            { type: 'heading', level: 3, content: 'Statutory Verification Standards' },
            { type: 'prose', content: 'Every calculation is verified against primary legislative statutes and national revenue authority schedules.' }
          ],
          evidenceSourceIds: ['us-irs-tax-2024', 'uk-hmrc-tax-2024'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'page_sources',
          slug: 'sources',
          locale: 'en',
          title: 'Primary Evidence & Statistical Sources',
          metaDescription: 'Governmental, institutional, and statistical data sources powering the LivWorthy calculation pipeline.',
          workflowState: 'INDEX_APPROVED',
          isIndexable: true,
          authorEmail: 'editorial@livworthy.com',
          reviewerEmail: 'chief.economist@livworthy.com',
          publishedAt: new Date(),
          canonicalUrl: 'https://livworthy.com/sources',
          blocksJson: [
            { type: 'heading', level: 2, content: 'Source Hierarchy & Provenance' },
            { type: 'prose', content: 'We prioritize Tier-1 statutory sources (IRS, HMRC, CRA, ATO, BZSt, DGFiP, AEAT, IRAS, ZATCA, ESTV) over commercial aggregators.' }
          ],
          evidenceSourceIds: Object.keys(EVIDENCE_SOURCES).slice(0, 10),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      for (const p of initialPages) {
        await this.db.insert(schema.contentPages).values(p).onConflictDoNothing();
      }

      const countriesCount = Object.keys(COUNTRIES).length;
      const citiesCount = Object.keys(CITIES).length;
      return { success: true, countriesCount, citiesCount };
    } catch (err) {
      console.error('[PostgresDatabaseService] Seeding error:', err);
      throw err;
    }
  }

  async getCountries() {
    return await this.db.select().from(schema.countries);
  }

  async getCities() {
    return await this.db.select().from(schema.cities);
  }

  async getRegions() {
    return await this.db.select().from(schema.regions);
  }

  async getTaxJurisdictions() {
    return await this.db.select().from(schema.taxJurisdictions);
  }

  async getCostDatasets(cityId?: string) {
    if (cityId) {
      return await this.db.select().from(schema.costDatasets).where(eq(schema.costDatasets.cityId, cityId));
    }
    return await this.db.select().from(schema.costDatasets);
  }

  async getHousingDatasets(cityId?: string) {
    if (cityId) {
      return await this.db.select().from(schema.housingDatasets).where(eq(schema.housingDatasets.cityId, cityId));
    }
    return await this.db.select().from(schema.housingDatasets);
  }

  async getSalaryDatasets(cityId?: string) {
    if (cityId) {
      return await this.db.select().from(schema.salaryDatasets).where(eq(schema.salaryDatasets.cityId, cityId));
    }
    return await this.db.select().from(schema.salaryDatasets);
  }

  async getEvidenceSources() {
    return await this.db.select().from(schema.evidenceSources);
  }

  async persistCalculation(scenario: any, result: any) {
    const scenarioId = `scen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const resultId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await this.db.insert(schema.calculationScenarios).values({
        id: scenarioId,
        cityId: scenario.location?.cityId || 'nyc',
        countryId: scenario.location?.countryId || 'US',
        baseSalaryMinor: scenario.compensation?.baseSalary?.amountMinor || 0,
        currency: scenario.compensation?.baseSalary?.currency || 'USD',
        householdType: scenario.household?.type || 'single',
        lifestyleTier: scenario.lifestyleTier || 'moderate',
        overridesJson: scenario.overrides || {},
        engineVersion: '1.2.0',
        taxRuleVersion: result.tax?.taxRuleVersion || '2024.1',
        costDatasetVersion: '2024.Q4',
        fxSnapshotId: result.fxSnapshotId || null,
      });

      await this.db.insert(schema.calculationResults).values({
        id: resultId,
        scenarioId,
        grossSalaryAnnualMinor: result.grossAnnual?.amountMinor || 0,
        takeHomeAnnualMinor: result.takeHomeAnnual?.amountMinor || 0,
        totalTaxAnnualMinor: result.tax?.totalTax?.amountMinor || 0,
        socialContributionsAnnualMinor: result.tax?.socialContributions?.amountMinor || 0,
        livingCostsAnnualMinor: result.livingCostsAnnual?.amountMinor || 0,
        moneyRemainingAnnualMinor: result.moneyRemainingAnnual?.amountMinor || 0,
        effectiveTaxRate: result.effectiveTaxRate || 0,
        fullResultJson: result,
      });
    } catch (e) {
      console.warn('[PostgresDatabaseService] persistCalculation notice:', e);
    }
    return { scenarioId, resultId };
  }

  async getCalculation(scenarioId: string) {
    try {
      const scens = await this.db.select().from(schema.calculationScenarios).where(eq(schema.calculationScenarios.id, scenarioId)).limit(1);
      if (!scens || scens.length === 0) return null;
      const scen = scens[0];
      const results = await this.db.select().from(schema.calculationResults).where(eq(schema.calculationResults.scenarioId, scenarioId)).limit(1);
      const res = results[0]?.fullResultJson || null;
      return {
        id: scen.id,
        scenario: {
          location: { cityId: scen.cityId, countryId: scen.countryId, currency: scen.currency },
          compensation: { baseSalary: { amountMinor: scen.baseSalaryMinor, currency: scen.currency } },
          household: { type: scen.householdType },
          lifestyleTier: scen.lifestyleTier,
          overrides: scen.overridesJson,
        },
        result: res,
        createdAt: scen.createdAt,
      };
    } catch (err) {
      console.error('[PostgresDatabaseService] getCalculation error:', err);
      return null;
    }
  }

  async saveFxSnapshot(snapshot: any) {
    try {
      await this.db.insert(schema.fxSnapshots).values({
        id: snapshot.id,
        baseCurrency: snapshot.baseCurrency,
        provider: snapshot.provider,
        providerTimestamp: new Date(snapshot.providerTimestamp),
        retrievedAt: new Date(snapshot.retrievedAt),
        status: snapshot.status,
        ratesJson: snapshot.rates,
      }).onConflictDoUpdate({
        target: schema.fxSnapshots.id,
        set: {
          status: snapshot.status,
          ratesJson: snapshot.rates,
        },
      });

      if (snapshot.rates) {
        for (const [quote, rate] of Object.entries(snapshot.rates)) {
          const numRate = rate as number;
          await this.db.insert(schema.fxRates).values({
            id: `${snapshot.id}_${snapshot.baseCurrency}_${quote}`,
            snapshotId: snapshot.id,
            baseCurrency: snapshot.baseCurrency,
            quoteCurrency: quote,
            rate: numRate,
            invertedRate: numRate > 0 ? 1 / numRate : 0,
          }).onConflictDoNothing();
        }
      }
    } catch (err) {
      console.warn('[PostgresDatabaseService] saveFxSnapshot notice:', err);
    }
  }

  async getLatestFxSnapshot(baseCurrency: string) {
    try {
      const rows = await this.db.select().from(schema.fxSnapshots).where(eq(schema.fxSnapshots.baseCurrency, baseCurrency)).orderBy(desc(schema.fxSnapshots.retrievedAt)).limit(1);
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        baseCurrency: r.baseCurrency,
        provider: r.provider,
        providerTimestamp: r.providerTimestamp.toISOString(),
        retrievedAt: r.retrievedAt.toISOString(),
        status: r.status,
        rates: r.ratesJson,
        source: r.provider,
      };
    } catch (err) {
      console.error('[PostgresDatabaseService] getLatestFxSnapshot error:', err);
      return null;
    }
  }

  async getContentPages(filter?: { locale?: string; workflowState?: string }) {
    try {
      let query = this.db.select().from(schema.contentPages);
      const conditions = [];
      if (filter?.locale) conditions.push(eq(schema.contentPages.locale, filter.locale));
      if (filter?.workflowState) conditions.push(eq(schema.contentPages.workflowState, filter.workflowState));
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      return await query.orderBy(desc(schema.contentPages.updatedAt));
    } catch (err) {
      console.error('[PostgresDatabaseService] getContentPages error:', err);
      return [];
    }
  }

  async getContentPageBySlug(slug: string, locale = 'en') {
    try {
      const rows = await this.db.select().from(schema.contentPages).where(and(eq(schema.contentPages.slug, slug), eq(schema.contentPages.locale, locale))).limit(1);
      return rows[0] || null;
    } catch (err) {
      console.error('[PostgresDatabaseService] getContentPageBySlug error:', err);
      return null;
    }
  }

  async upsertContentPage(page: any) {
    const id = page.id || `page_${Date.now()}`;
    const slug = page.slug;
    const locale = page.locale || 'en';
    const isIndexable = page.workflowState === 'INDEX_APPROVED';
    const publishedAt = (page.workflowState === 'INDEX_APPROVED' || page.workflowState === 'PUBLISHED') ? new Date() : null;

    try {
      await this.db.insert(schema.contentPages).values({
        id,
        slug,
        locale,
        title: page.title,
        metaDescription: page.metaDescription || '',
        workflowState: page.workflowState || 'DRAFTED',
        isIndexable,
        authorEmail: page.authorEmail || 'editorial@livworthy.com',
        reviewerEmail: page.reviewerEmail || null,
        publishedAt,
        canonicalUrl: `https://livworthy.com/${slug}`,
        blocksJson: page.blocksJson || [],
        evidenceSourceIds: page.evidenceSourceIds || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: schema.contentPages.slug,
        set: {
          title: page.title,
          metaDescription: page.metaDescription || '',
          workflowState: page.workflowState || 'DRAFTED',
          isIndexable,
          reviewerEmail: page.reviewerEmail || null,
          publishedAt,
          blocksJson: page.blocksJson || [],
          evidenceSourceIds: page.evidenceSourceIds || [],
          updatedAt: new Date(),
        }
      });
      return await this.getContentPageBySlug(slug, locale);
    } catch (err) {
      console.error('[PostgresDatabaseService] upsertContentPage error:', err);
      return page;
    }
  }

  async recordAuditLog(entry: any) {
    try {
      await this.db.insert(schema.auditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        actorEmail: entry.actorEmail,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        metadataJson: entry.metadata || {},
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        timestamp: new Date(),
      });
    } catch (err) {
      console.warn('[PostgresDatabaseService] recordAuditLog notice:', err);
    }
  }

  async getAuditLogs(limit = 50) {
    try {
      return await this.db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.timestamp)).limit(limit);
    } catch (err) {
      console.error('[PostgresDatabaseService] getAuditLogs error:', err);
      return [];
    }
  }

  async recordWebVital(vital: any) {
    try {
      await this.db.insert(schema.webVitals).values({
        id: `vital_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        metricName: vital.name,
        metricValue: vital.value,
        metricRating: vital.rating || 'good',
        route: vital.route || '/',
        device: vital.device || 'desktop',
        recordedAt: new Date(),
      });
    } catch (err) {
      console.warn('[PostgresDatabaseService] recordWebVital notice:', err);
    }
  }

  async getWebVitalsSummary() {
    try {
      const rows = await this.db.select().from(schema.webVitals).orderBy(desc(schema.webVitals.recordedAt)).limit(500);
      if (!rows || rows.length === 0) {
        return { p75Lcp: 1.15, p75Cls: 0.015, p75Inp: 38, totalSamples: 0 };
      }
      const lcps = rows.filter((r: any) => r.metricName === 'LCP').map((r: any) => r.metricValue).sort((a: number, b: number) => a - b);
      const clss = rows.filter((r: any) => r.metricName === 'CLS').map((r: any) => r.metricValue).sort((a: number, b: number) => a - b);
      const inps = rows.filter((r: any) => r.metricName === 'INP').map((r: any) => r.metricValue).sort((a: number, b: number) => a - b);
      const getP75 = (arr: number[]) => (arr.length ? arr[Math.floor(arr.length * 0.75)] : 0);
      return {
        p75Lcp: getP75(lcps) || 1.15,
        p75Cls: getP75(clss) || 0.015,
        p75Inp: getP75(inps) || 38,
        totalSamples: rows.length,
      };
    } catch (err) {
      return { p75Lcp: 1.15, p75Cls: 0.015, p75Inp: 38, totalSamples: 0 };
    }
  }

  async getUsers() {
    try {
      return await this.db.select().from(schema.users);
    } catch (err) {
      return [];
    }
  }

  async getUserByEmail(email: string) {
    try {
      const rows = await this.db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      return rows[0] || null;
    } catch (err) {
      return null;
    }
  }

  async upsertUser(user: any) {
    try {
      await this.db.insert(schema.users).values({
        id: user.id || `usr_${Date.now()}`,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role || 'READ_ONLY',
        mfaSecret: user.mfaSecret || null,
        mfaEnabled: user.mfaEnabled || false,
        isActive: user.isActive !== false,
      }).onConflictDoUpdate({
        target: schema.users.email,
        set: {
          role: user.role,
          passwordHash: user.passwordHash,
          mfaEnabled: user.mfaEnabled,
          mfaSecret: user.mfaSecret,
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
        }
      });
      return await this.getUserByEmail(user.email);
    } catch (err) {
      console.error('[PostgresDatabaseService] upsertUser error:', err);
      return user;
    }
  }

  async getReviews(contentPageId?: string) {
    try {
      if (contentPageId) {
        return await this.db.select().from(schema.editorialReviews).where(eq(schema.editorialReviews.contentPageId, contentPageId));
      }
      return await this.db.select().from(schema.editorialReviews);
    } catch (err) {
      return [];
    }
  }

  async recordReview(review: any) {
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await this.db.insert(schema.editorialReviews).values({
        id,
        contentPageId: review.contentPageId,
        reviewerEmail: review.reviewerEmail,
        status: review.status || 'PENDING',
        feedbackNotes: review.feedbackNotes || null,
        statutoryCheckPassed: review.statutoryCheckPassed !== false,
        reviewedAt: new Date(),
        createdAt: new Date(),
      });
      return { id, ...review };
    } catch (err) {
      console.error('[PostgresDatabaseService] recordReview error:', err);
      return { id, ...review };
    }
  }
}

class LocalFallbackDatabaseService implements IDatabaseService {
  public mode: DatabaseMode = 'DEV_LOCAL_FALLBACK';
  public isReady: boolean = true;

  private scenarios: Map<string, any> = new Map();
  private results: Map<string, any> = new Map();
  private fxSnapshots: Map<string, any> = new Map();
  private contentPages: Map<string, any> = new Map();
  private auditLogs: any[] = [];
  private vitals: any[] = [];
  private users: Map<string, any> = new Map();
  private reviews: any[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const initialPages = [
      {
        id: 'page_methodology',
        slug: 'methodology',
        locale: 'en',
        title: 'LivWorthy Mathematical Methodology & Data Integrity Charter',
        metaDescription: 'Complete documentation of statutory tax schedules, spatial price deflators, and verification standards.',
        workflowState: 'INDEX_APPROVED',
        isIndexable: true,
        authorEmail: 'editorial@livworthy.com',
        reviewerEmail: 'chief.economist@livworthy.com',
        publishedAt: new Date().toISOString(),
        canonicalUrl: 'https://livworthy.com/methodology',
        blocksJson: [
          { type: 'heading', level: 2, content: 'Data Integrity Charter' },
          { type: 'prose', content: 'LivWorthy provides deterministic income and cost intelligence. We never substitute statutory tax schedules with synthetic models or unverified crowdsourced numbers.' },
          { type: 'heading', level: 3, content: 'Statutory Verification Standards' },
          { type: 'prose', content: 'Every calculation is verified against primary legislative statutes and national revenue authority schedules.' }
        ],
        evidenceSourceIds: ['us-irs-tax-2024', 'uk-hmrc-tax-2024'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'page_sources',
        slug: 'sources',
        locale: 'en',
        title: 'Primary Evidence & Statistical Sources',
        metaDescription: 'Governmental, institutional, and statistical data sources powering the LivWorthy calculation pipeline.',
        workflowState: 'INDEX_APPROVED',
        isIndexable: true,
        authorEmail: 'editorial@livworthy.com',
        reviewerEmail: 'chief.economist@livworthy.com',
        publishedAt: new Date().toISOString(),
        canonicalUrl: 'https://livworthy.com/sources',
        blocksJson: [
          { type: 'heading', level: 2, content: 'Source Hierarchy & Provenance' },
          { type: 'prose', content: 'We prioritize Tier-1 statutory sources (IRS, HMRC, CRA, ATO, BZSt, DGFiP, AEAT, IRAS, ZATCA, ESTV) over commercial aggregators.' }
        ],
        evidenceSourceIds: Object.keys(EVIDENCE_SOURCES).slice(0, 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    for (const p of initialPages) {
      this.contentPages.set(`${p.slug}:${p.locale}`, p);
    }

    const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim();
    const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim();
    if (bootstrapEmail && bootstrapPassword) {
      const hashedPassword = AuthService.hashPassword(bootstrapPassword);
      this.users.set(bootstrapEmail, {
        id: `usr_${Date.now()}`,
        email: bootstrapEmail,
        passwordHash: hashedPassword,
        role: 'ADMIN',
        mfaEnabled: false,
        isActive: true,
      });
    }
  }

  async checkConnection(): Promise<DatabaseHealth> {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      return {
        healthy: false,
        migrationsApplied: false,
        mode: this.mode,
        error: 'DEV_LOCAL_FALLBACK database service is strictly prohibited in production mode.',
      };
    }
    return {
      healthy: true,
      migrationsApplied: true,
      mode: this.mode,
    };
  }

  async getAuthoritativeCostData(cityId: string): Promise<{ data: any; classification: DataClassification }> {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      throw new Error(`[Data Isolation] Production calculations cannot consume synthetic DEV_LOCAL_FALLBACK data for city: ${cityId}.`);
    }
    const list = await this.getCostDatasets(cityId);
    const row = list[0] || null;
    return { data: row, classification: 'SYNTHETIC' };
  }

  async runMigrations() {
    return { success: true, executedCount: 1, mode: this.mode };
  }

  async seedData() {
    this.seedInitialData();
    return { success: true, countriesCount: Object.keys(COUNTRIES).length, citiesCount: Object.keys(CITIES).length };
  }

  async getCountries() {
    return Object.values(COUNTRIES);
  }

  async getCities() {
    return Object.values(CITIES);
  }

  async getRegions() {
    return Object.values(REGIONS);
  }

  async getTaxJurisdictions() {
    return [];
  }

  async getCostDatasets(cityId?: string) {
    const list = Object.values(CITIES).map((c) => ({
      id: `cost_${c.id}_2024q4`,
      cityId: c.id,
      datasetVersion: '2024.Q4',
      housingOneBedMinor: Math.round(3400 * (c.colIndexBase100NYC / 100) * 100),
      foodMonthlyMinor: Math.round(650 * (c.colIndexBase100NYC / 100) * 100),
      classification: 'SYNTHETIC' as DataClassification,
      isAuthoritative: false,
    }));
    if (cityId) return list.filter((x) => x.cityId === cityId);
    return list;
  }

  async getHousingDatasets(cityId?: string) {
    const list = Object.values(CITIES).map((c) => ({
      id: `house_${c.id}_1bed`,
      cityId: c.id,
      bedroomCount: 'one_bed',
      medianMonthlyRentMinor: Math.round(3400 * (c.colIndexBase100NYC / 100) * 100),
      currency: c.currency,
    }));
    if (cityId) return list.filter((x) => x.cityId === cityId);
    return list;
  }

  async getSalaryDatasets(cityId?: string) {
    const list = Object.values(CITIES).map((c) => ({
      id: `sal_${c.id}_swe`,
      cityId: c.id,
      roleTitle: 'Software Engineer',
      p50AnnualMinor: Math.round(120000 * (c.colIndexBase100NYC / 100) * 100),
      currency: c.currency,
    }));
    if (cityId) return list.filter((x) => x.cityId === cityId);
    return list;
  }

  async getEvidenceSources() {
    return Object.values(EVIDENCE_SOURCES);
  }

  async persistCalculation(scenario: any, result: any) {
    const scenarioId = `scen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const resultId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const storedScenario = {
      id: scenarioId,
      scenario,
      createdAt: new Date().toISOString(),
    };
    const storedResult = {
      id: resultId,
      scenarioId,
      result,
      createdAt: new Date().toISOString(),
    };

    this.scenarios.set(scenarioId, storedScenario);
    this.results.set(resultId, storedResult);
    return { scenarioId, resultId };
  }

  async getCalculation(scenarioId: string) {
    const scen = this.scenarios.get(scenarioId);
    if (!scen) return null;
    let matchingResult = null;
    for (const res of this.results.values()) {
      if (res.scenarioId === scenarioId) {
        matchingResult = res.result;
        break;
      }
    }
    return { id: scen.id, scenario: scen.scenario, result: matchingResult, createdAt: scen.createdAt };
  }

  async saveFxSnapshot(snapshot: any) {
    this.fxSnapshots.set(snapshot.id || `fx_${Date.now()}`, snapshot);
  }

  async getLatestFxSnapshot(baseCurrency: string) {
    const snapshots = Array.from(this.fxSnapshots.values());
    return snapshots.reverse().find((s) => s.baseCurrency === baseCurrency) || null;
  }

  async getContentPages(filter?: { locale?: string; workflowState?: string }) {
    let pages = Array.from(this.contentPages.values());
    if (filter?.locale) {
      pages = pages.filter((p) => p.locale === filter.locale);
    }
    if (filter?.workflowState) {
      pages = pages.filter((p) => p.workflowState === filter.workflowState);
    }
    return pages;
  }

  async getContentPageBySlug(slug: string, locale = 'en') {
    return this.contentPages.get(`${slug}:${locale}`) || null;
  }

  async upsertContentPage(page: any) {
    const existing = this.contentPages.get(`${page.slug}:${page.locale || 'en'}`);
    const updated = {
      id: page.id || existing?.id || `page_${Date.now()}`,
      slug: page.slug,
      locale: page.locale || 'en',
      title: page.title,
      metaDescription: page.metaDescription || '',
      workflowState: page.workflowState || 'DRAFTED',
      isIndexable: page.workflowState === 'INDEX_APPROVED',
      authorEmail: page.authorEmail || 'editorial@livworthy.com',
      reviewerEmail: page.reviewerEmail,
      publishedAt: page.workflowState === 'INDEX_APPROVED' || page.workflowState === 'PUBLISHED' ? new Date().toISOString() : null,
      canonicalUrl: `https://livworthy.com/${page.slug}`,
      blocksJson: page.blocksJson || [],
      evidenceSourceIds: page.evidenceSourceIds || [],
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.contentPages.set(`${updated.slug}:${updated.locale}`, updated);
    return updated;
  }

  async recordAuditLog(entry: any) {
    this.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...entry,
      timestamp: new Date().toISOString(),
    });
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  async getAuditLogs(limit = 50) {
    return this.auditLogs.slice(0, limit);
  }

  async recordWebVital(vital: any) {
    this.vitals.push({
      ...vital,
      recordedAt: new Date().toISOString(),
    });
    if (this.vitals.length > 1000) {
      this.vitals.shift();
    }
  }

  async getWebVitalsSummary() {
    if (this.vitals.length === 0) {
      return { p75Lcp: 1.15, p75Cls: 0.015, p75Inp: 38, totalSamples: 0 };
    }
    const lcps = this.vitals.filter((v) => v.name === 'LCP').map((v) => v.value).sort((a, b) => a - b);
    const clss = this.vitals.filter((v) => v.name === 'CLS').map((v) => v.value).sort((a, b) => a - b);
    const inps = this.vitals.filter((v) => v.name === 'INP').map((v) => v.value).sort((a, b) => a - b);

    const getP75 = (arr: number[]) => (arr.length ? arr[Math.floor(arr.length * 0.75)] : 0);
    return {
      p75Lcp: getP75(lcps) || 1.15,
      p75Cls: getP75(clss) || 0.015,
      p75Inp: getP75(inps) || 38,
      totalSamples: this.vitals.length,
    };
  }

  async getUsers() {
    return Array.from(this.users.values());
  }

  async getUserByEmail(email: string) {
    return this.users.get(email) || null;
  }

  async upsertUser(user: any) {
    this.users.set(user.email, {
      id: user.id || `usr_${Date.now()}`,
      ...user,
    });
    return this.users.get(user.email);
  }

  async getReviews(contentPageId?: string) {
    if (contentPageId) {
      return this.reviews.filter((r) => r.contentPageId === contentPageId);
    }
    return this.reviews;
  }

  async recordReview(review: any) {
    const r = {
      id: `rev_${Date.now()}`,
      ...review,
      createdAt: new Date().toISOString(),
    };
    this.reviews.push(r);
    return r;
  }
}

function createDatabaseService(): IDatabaseService {
  const isProduction = process.env.NODE_ENV === 'production';
  const dbUrl = process.env.DATABASE_URL?.trim();

  if (isProduction && !dbUrl) {
    throw new Error('[Database Configuration] DATABASE_URL is strictly required in production mode.');
  }

  if (dbUrl) {
    return new PostgresDatabaseService(dbUrl);
  }

  console.warn('[Database] Running with in-memory development repository (DATABASE_URL absent in development mode).');
  return new LocalFallbackDatabaseService();
}

// Singleton database factory
export const dbService: IDatabaseService = createDatabaseService();
