import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

// Enums
export const verificationStatusEnum = pgEnum('verification_status', [
  'VERIFIED',
  'LIMITED',
  'PROVISIONAL',
  'UNSUPPORTED',
]);

export const taxStatusEnum = pgEnum('tax_status', [
  'VERIFIED',
  'ACTIVE',
  'PROVISIONAL',
  'HISTORICAL',
  'PENDING',
  'SUPERSEDED',
]);

export const contentWorkflowEnum = pgEnum('content_workflow', [
  'IDEA',
  'RESEARCHING',
  'RESEARCHED',
  'DRAFTING',
  'DRAFTED',
  'REVIEWING',
  'APPROVED',
  'PUBLISHED',
  'INDEX_APPROVED',
  'REJECTED',
  'ARCHIVED',
]);

export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'DATA_EDITOR',
  'CONTENT_EDITOR',
  'REVIEWER',
  'SEO_REVIEWER',
  'READ_ONLY',
]);

export const sourceTierEnum = pgEnum('source_tier', [
  'TIER_1_GOVERNMENT',
  'TIER_2_STATISTICS_AGENCY',
  'TIER_3_INSTITUTIONAL',
  'TIER_4_COMMERCIAL',
  'TIER_5_AGGREGATOR',
  'TIER_6_EDITORIAL',
]);

// 1. Geography Tables
export const countries = pgTable('countries', {
  id: varchar('id', { length: 8 }).primaryKey(), // e.g. 'US', 'GB'
  name: text('name').notNull(),
  defaultCurrency: varchar('default_currency', { length: 4 }).notNull(),
  verificationStatus: text('verification_status').notNull().default('LIMITED'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const regions = pgTable('regions', {
  id: varchar('id', { length: 16 }).primaryKey(), // e.g. 'US-NY'
  countryId: varchar('country_id', { length: 8 })
    .notNull()
    .references(() => countries.id),
  name: text('name').notNull(),
  code: varchar('code', { length: 16 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cities = pgTable('cities', {
  id: varchar('id', { length: 32 }).primaryKey(), // e.g. 'nyc', 'austin'
  name: text('name').notNull(),
  countryId: varchar('country_id', { length: 8 })
    .notNull()
    .references(() => countries.id),
  regionId: varchar('region_id', { length: 16 })
    .notNull()
    .references(() => regions.id),
  currency: varchar('currency', { length: 4 }).notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  colIndexVsNyc: doublePrecision('col_index_vs_nyc').notNull().default(100.0),
  rentIndexVsNyc: doublePrecision('rent_index_vs_nyc').notNull().default(100.0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const taxJurisdictions = pgTable('tax_jurisdictions', {
  id: varchar('id', { length: 32 }).primaryKey(),
  countryId: varchar('country_id', { length: 8 })
    .notNull()
    .references(() => countries.id),
  regionId: varchar('region_id', { length: 16 }),
  level: varchar('level', { length: 16 }).notNull(), // 'national', 'subnational', 'municipal'
  name: text('name').notNull(),
  authority: text('authority').notNull(),
});

// 2. Tax Entities
export const taxRuleSets = pgTable('tax_rule_sets', {
  id: varchar('id', { length: 64 }).primaryKey(),
  countryId: varchar('country_id', { length: 8 })
    .notNull()
    .references(() => countries.id),
  taxYear: integer('tax_year').notNull(),
  version: varchar('version', { length: 32 }).notNull(),
  status: text('status').notNull().default('ACTIVE'),
  effectiveStartDate: timestamp('effective_start_date').notNull(),
  effectiveEndDate: timestamp('effective_end_date'),
  ruleData: jsonb('rule_data').notNull(),
  sourceReference: text('source_reference').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const taxBrackets = pgTable('tax_brackets', {
  id: varchar('id', { length: 64 }).primaryKey(),
  ruleSetId: varchar('rule_set_id', { length: 64 })
    .notNull()
    .references(() => taxRuleSets.id),
  filingStatus: varchar('filing_status', { length: 32 }).notNull().default('single'),
  tierOrder: integer('tier_order').notNull(),
  thresholdMinor: integer('threshold_minor').notNull(),
  capMinor: integer('cap_minor'),
  marginalRate: doublePrecision('marginal_rate').notNull(),
});

// 3. Costs & Housing Entities
export const costDatasets = pgTable('cost_datasets', {
  id: varchar('id', { length: 64 }).primaryKey(),
  cityId: varchar('city_id', { length: 32 })
    .notNull()
    .references(() => cities.id),
  datasetVersion: varchar('dataset_version', { length: 32 }).notNull(),
  observationDate: timestamp('observation_date').notNull(),
  retrievalDate: timestamp('retrieval_date').defaultNow().notNull(),
  housingOneBedMinor: integer('housing_one_bed_minor').notNull(),
  housingThreeBedMinor: integer('housing_three_bed_minor').notNull(),
  foodMonthlyMinor: integer('food_monthly_minor').notNull(),
  utilitiesMonthlyMinor: integer('utilities_monthly_minor').notNull(),
  transportMonthlyMinor: integer('transport_monthly_minor').notNull(),
  healthcareMonthlyMinor: integer('healthcare_monthly_minor').notNull(),
  confidenceRating: doublePrecision('confidence_rating').notNull().default(0.95),
  sourceRef: text('source_ref').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. FX Entities
export const fxSnapshots = pgTable('fx_snapshots', {
  id: varchar('id', { length: 64 }).primaryKey(),
  baseCurrency: varchar('base_currency', { length: 4 }).notNull(),
  provider: varchar('provider', { length: 64 }).notNull(),
  providerTimestamp: timestamp('provider_timestamp').notNull(),
  retrievedAt: timestamp('retrieved_at').defaultNow().notNull(),
  status: varchar('status', { length: 16 }).notNull().default('ACTIVE'),
  ratesJson: jsonb('rates_json').notNull(),
});

export const fxRates = pgTable('fx_rates', {
  id: varchar('id', { length: 64 }).primaryKey(),
  snapshotId: varchar('snapshot_id', { length: 64 })
    .notNull()
    .references(() => fxSnapshots.id),
  baseCurrency: varchar('base_currency', { length: 4 }).notNull(),
  quoteCurrency: varchar('quote_currency', { length: 4 }).notNull(),
  rate: doublePrecision('rate').notNull(),
  invertedRate: doublePrecision('inverted_rate').notNull(),
});

// 5. Evidence & Provenance
export const evidenceSources = pgTable('evidence_sources', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: text('name').notNull(),
  tier: text('tier').notNull().default('TIER_1_GOVERNMENT'),
  authority: text('authority').notNull(),
  url: text('url').notNull(),
  methodology: text('methodology').notNull(),
  frequency: varchar('frequency', { length: 32 }).notNull().default('annual'),
  lastVerifiedAt: timestamp('last_verified_at').notNull(),
});

// 6. Persistent Calculations
export const calculationScenarios = pgTable('calculation_scenarios', {
  id: varchar('id', { length: 64 }).primaryKey(),
  cityId: varchar('city_id', { length: 32 })
    .notNull()
    .references(() => cities.id),
  countryId: varchar('country_id', { length: 8 })
    .notNull()
    .references(() => countries.id),
  baseSalaryMinor: integer('base_salary_minor').notNull(),
  currency: varchar('currency', { length: 4 }).notNull(),
  householdType: varchar('household_type', { length: 32 }).notNull().default('single'),
  lifestyleTier: varchar('lifestyle_tier', { length: 32 }).notNull().default('moderate'),
  overridesJson: jsonb('overrides_json'),
  engineVersion: varchar('engine_version', { length: 32 }).notNull().default('1.0.0'),
  taxRuleVersion: varchar('tax_rule_version', { length: 32 }).notNull(),
  costDatasetVersion: varchar('cost_dataset_version', { length: 32 }).notNull(),
  fxSnapshotId: varchar('fx_snapshot_id', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const calculationResults = pgTable('calculation_results', {
  id: varchar('id', { length: 64 }).primaryKey(),
  scenarioId: varchar('scenario_id', { length: 64 })
    .notNull()
    .references(() => calculationScenarios.id),
  grossSalaryAnnualMinor: integer('gross_salary_annual_minor').notNull(),
  takeHomeAnnualMinor: integer('take_home_annual_minor').notNull(),
  totalTaxAnnualMinor: integer('total_tax_annual_minor').notNull(),
  socialContributionsAnnualMinor: integer('social_contributions_annual_minor').notNull(),
  livingCostsAnnualMinor: integer('living_costs_annual_minor').notNull(),
  moneyRemainingAnnualMinor: integer('money_remaining_annual_minor').notNull(),
  effectiveTaxRate: doublePrecision('effective_tax_rate').notNull(),
  fullResultJson: jsonb('full_result_json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. CMS & Content Workflow
export const contentPages = pgTable('content_pages', {
  id: varchar('id', { length: 64 }).primaryKey(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  locale: varchar('locale', { length: 8 }).notNull().default('en'),
  title: text('title').notNull(),
  metaDescription: text('meta_description').notNull(),
  workflowState: text('workflow_state').notNull().default('DRAFTED'),
  isIndexable: boolean('is_indexable').notNull().default(false),
  authorEmail: text('author_email').notNull(),
  reviewerEmail: text('reviewer_email'),
  publishedAt: timestamp('published_at'),
  canonicalUrl: text('canonical_url'),
  blocksJson: jsonb('blocks_json').notNull(),
  evidenceSourceIds: jsonb('evidence_source_ids').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Security, RBAC & Audit
export const users = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  email: varchar('email', { length: 128 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('READ_ONLY'),
  mfaSecret: text('mfa_secret'),
  mfaEnabled: boolean('mfa_enabled').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 64 }).primaryKey(),
  actorEmail: text('actor_email').notNull(),
  action: varchar('action', { length: 64 }).notNull(),
  entityType: varchar('entity_type', { length: 64 }).notNull(),
  entityId: varchar('entity_id', { length: 64 }).notNull(),
  metadataJson: jsonb('metadata_json'),
  ipAddress: varchar('ip_address', { length: 48 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// 9. Real User Monitoring (RUM) Vitals
export const webVitals = pgTable('web_vitals', {
  id: varchar('id', { length: 64 }).primaryKey(),
  metricName: varchar('metric_name', { length: 16 }).notNull(), // 'LCP', 'CLS', 'INP'
  metricValue: doublePrecision('metric_value').notNull(),
  metricRating: varchar('metric_rating', { length: 16 }).notNull(), // 'good', 'needs-improvement', 'poor'
  route: text('route').notNull(),
  device: varchar('device', { length: 16 }).notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

// 10. Dedicated Housing & Salary Datasets
export const housingDatasets = pgTable('housing_datasets', {
  id: varchar('id', { length: 64 }).primaryKey(),
  cityId: varchar('city_id', { length: 32 })
    .notNull()
    .references(() => cities.id),
  bedroomCount: varchar('bedroom_count', { length: 16 }).notNull(), // 'studio', 'one_bed', 'two_bed', 'three_bed'
  neighborhoodTier: varchar('neighborhood_tier', { length: 32 }).notNull().default('city_center'),
  medianMonthlyRentMinor: integer('median_monthly_rent_minor').notNull(),
  p25MonthlyRentMinor: integer('p25_monthly_rent_minor').notNull(),
  p75MonthlyRentMinor: integer('p75_monthly_rent_minor').notNull(),
  currency: varchar('currency', { length: 4 }).notNull(),
  sourceRef: text('source_ref').notNull(),
  retrievalDate: timestamp('retrieval_date').defaultNow().notNull(),
});

export const salaryDatasets = pgTable('salary_datasets', {
  id: varchar('id', { length: 64 }).primaryKey(),
  cityId: varchar('city_id', { length: 32 })
    .notNull()
    .references(() => cities.id),
  roleTitle: text('role_title').notNull(),
  experienceLevel: varchar('experience_level', { length: 32 }).notNull().default('mid'),
  p25AnnualMinor: integer('p25_annual_minor').notNull(),
  p50AnnualMinor: integer('p50_annual_minor').notNull(),
  p75AnnualMinor: integer('p75_annual_minor').notNull(),
  p90AnnualMinor: integer('p90_annual_minor').notNull(),
  currency: varchar('currency', { length: 4 }).notNull(),
  sampleSize: integer('sample_size').notNull().default(100),
  sourceRef: text('source_ref').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Editorial & Review Workflow
export const editorialReviews = pgTable('editorial_reviews', {
  id: varchar('id', { length: 64 }).primaryKey(),
  contentPageId: varchar('content_page_id', { length: 64 })
    .notNull()
    .references(() => contentPages.id),
  reviewerEmail: text('reviewer_email').notNull(),
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED'
  feedbackNotes: text('feedback_notes'),
  statutoryCheckPassed: boolean('statutory_check_passed').notNull().default(true),
  reviewedAt: timestamp('reviewed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Schema Migration Tracking
export const schemaMigrations = pgTable('schema_migrations', {
  id: integer('id').primaryKey(),
  migrationName: text('migration_name').notNull().unique(),
  appliedAt: timestamp('applied_at').defaultNow().notNull(),
});

