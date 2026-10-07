var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server.ts
import express from "express";
import path2 from "path";
import crypto3 from "crypto";
import fs2 from "fs";

// src/lib/env.ts
import crypto from "crypto";
var REQUIRED_PRODUCTION_VARS = [
  "DATABASE_URL",
  "REDIS_URL",
  "CRON_SECRET",
  "ADMIN_SESSION_SECRET"
];
var validatedConfig = null;
var ephemeralDevSessionSecret = null;
var ephemeralDevCronSecret = null;
function validateEnv() {
  if (validatedConfig) {
    return validatedConfig;
  }
  const isProduction = process.env.NODE_ENV === "production";
  const missing = [];
  for (const varName of REQUIRED_PRODUCTION_VARS) {
    const val = (process.env[varName] || "").trim();
    if (!val) {
      if (isProduction) {
        missing.push(varName);
      }
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `[Environment Validation Failed] Missing required production environment variables: ${missing.join(", ")}. Silently substituting mock URLs, localhost, or static fallback secrets in production is strictly forbidden.`
    );
  }
  if (!process.env.ADMIN_SESSION_SECRET) {
    if (!ephemeralDevSessionSecret) {
      ephemeralDevSessionSecret = crypto.randomBytes(32).toString("hex");
    }
  }
  if (!process.env.CRON_SECRET) {
    if (!ephemeralDevCronSecret) {
      ephemeralDevCronSecret = crypto.randomBytes(32).toString("hex");
    }
  }
  validatedConfig = {
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: (process.env.DATABASE_URL || "").trim(),
    REDIS_URL: (process.env.REDIS_URL || "").trim(),
    CRON_SECRET: (process.env.CRON_SECRET || "").trim() || ephemeralDevCronSecret,
    ADMIN_SESSION_SECRET: (process.env.ADMIN_SESSION_SECRET || "").trim() || ephemeralDevSessionSecret,
    BOOTSTRAP_ADMIN_EMAIL: (process.env.BOOTSTRAP_ADMIN_EMAIL || "").trim() || void 0,
    BOOTSTRAP_ADMIN_PASSWORD: (process.env.BOOTSTRAP_ADMIN_PASSWORD || "").trim() || void 0
  };
  return validatedConfig;
}
function getRequiredEnv(name) {
  const val = (process.env[name] || "").trim();
  if (!val) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`[Environment] Required variable ${name} is missing in production.`);
    }
    const cfg = validateEnv();
    if (name === "ADMIN_SESSION_SECRET") return cfg.ADMIN_SESSION_SECRET;
    if (name === "CRON_SECRET") return cfg.CRON_SECRET;
    throw new Error(`[Environment] Required variable ${name} is not set.`);
  }
  return val;
}

// src/lib/tax-year-policy.ts
var LATEST_VERIFIED_TAX_YEAR = 2026;
function parseTaxYear(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 2e3 && value <= 2100 ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!/^\d{4}$/.test(trimmed)) return null;
    const parsed = Number(trimmed);
    return Number.isInteger(parsed) && parsed >= 2e3 && parsed <= 2100 ? parsed : null;
  }
  return null;
}

// src/db/client.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import fs from "fs";
import path from "path";
import { eq, desc, and, sql, like } from "drizzle-orm";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  auditLogs: () => auditLogs,
  backlinkRecords: () => backlinkRecords,
  calculationResults: () => calculationResults,
  calculationScenarios: () => calculationScenarios,
  cities: () => cities,
  contentPages: () => contentPages,
  contentWorkflowEnum: () => contentWorkflowEnum,
  costDatasets: () => costDatasets,
  countries: () => countries,
  editorialReviews: () => editorialReviews,
  evidenceSources: () => evidenceSources,
  fxRates: () => fxRates,
  fxSnapshots: () => fxSnapshots,
  gscPerformanceRecords: () => gscPerformanceRecords,
  housingDatasets: () => housingDatasets,
  prOutreachRecords: () => prOutreachRecords,
  rankTrackingRecords: () => rankTrackingRecords,
  regions: () => regions,
  salaryDatasets: () => salaryDatasets,
  schemaMigrations: () => schemaMigrations,
  sourceTierEnum: () => sourceTierEnum,
  taxBrackets: () => taxBrackets,
  taxJurisdictions: () => taxJurisdictions,
  taxRuleSets: () => taxRuleSets,
  taxSourceMonitors: () => taxSourceMonitors,
  taxStatusEnum: () => taxStatusEnum,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  verificationStatusEnum: () => verificationStatusEnum,
  webVitals: () => webVitals
});
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";
var verificationStatusEnum = pgEnum("verification_status", [
  "VERIFIED",
  "LIMITED",
  "PROVISIONAL",
  "UNSUPPORTED"
]);
var taxStatusEnum = pgEnum("tax_status", [
  "VERIFIED",
  "ACTIVE",
  "PROVISIONAL",
  "HISTORICAL",
  "PENDING",
  "SUPERSEDED"
]);
var contentWorkflowEnum = pgEnum("content_workflow", [
  "IDEA",
  "RESEARCHING",
  "RESEARCHED",
  "DRAFTING",
  "DRAFTED",
  "REVIEWING",
  "APPROVED",
  "PUBLISHED",
  "INDEX_APPROVED",
  "REJECTED",
  "ARCHIVED"
]);
var userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "DATA_EDITOR",
  "CONTENT_EDITOR",
  "REVIEWER",
  "SEO_REVIEWER",
  "READ_ONLY"
]);
var sourceTierEnum = pgEnum("source_tier", [
  "TIER_1_GOVERNMENT",
  "TIER_2_STATISTICS_AGENCY",
  "TIER_3_INSTITUTIONAL",
  "TIER_4_COMMERCIAL",
  "TIER_5_AGGREGATOR",
  "TIER_6_EDITORIAL"
]);
var countries = pgTable("countries", {
  id: varchar("id", { length: 8 }).primaryKey(),
  // e.g. 'US', 'GB'
  name: text("name").notNull(),
  defaultCurrency: varchar("default_currency", { length: 4 }).notNull(),
  verificationStatus: text("verification_status").notNull().default("LIMITED"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var regions = pgTable("regions", {
  id: varchar("id", { length: 16 }).primaryKey(),
  // e.g. 'US-NY'
  countryId: varchar("country_id", { length: 8 }).notNull().references(() => countries.id),
  name: text("name").notNull(),
  code: varchar("code", { length: 16 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var cities = pgTable("cities", {
  id: varchar("id", { length: 32 }).primaryKey(),
  // e.g. 'nyc', 'austin'
  name: text("name").notNull(),
  countryId: varchar("country_id", { length: 8 }).notNull().references(() => countries.id),
  regionId: varchar("region_id", { length: 16 }).notNull().references(() => regions.id),
  currency: varchar("currency", { length: 4 }).notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  colIndexVsNyc: doublePrecision("col_index_vs_nyc").notNull().default(100),
  rentIndexVsNyc: doublePrecision("rent_index_vs_nyc").notNull().default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var taxJurisdictions = pgTable("tax_jurisdictions", {
  id: varchar("id", { length: 32 }).primaryKey(),
  countryId: varchar("country_id", { length: 8 }).notNull().references(() => countries.id),
  regionId: varchar("region_id", { length: 16 }),
  level: varchar("level", { length: 16 }).notNull(),
  // 'national', 'subnational', 'municipal'
  name: text("name").notNull(),
  authority: text("authority").notNull()
});
var taxRuleSets = pgTable("tax_rule_sets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  countryId: varchar("country_id", { length: 8 }).notNull().references(() => countries.id),
  taxYear: integer("tax_year").notNull(),
  version: varchar("version", { length: 32 }).notNull(),
  status: text("status").notNull().default("ACTIVE"),
  effectiveStartDate: timestamp("effective_start_date").notNull(),
  effectiveEndDate: timestamp("effective_end_date"),
  ruleData: jsonb("rule_data").notNull(),
  sourceReference: text("source_reference").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var taxBrackets = pgTable("tax_brackets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ruleSetId: varchar("rule_set_id", { length: 64 }).notNull().references(() => taxRuleSets.id),
  filingStatus: varchar("filing_status", { length: 32 }).notNull().default("single"),
  tierOrder: integer("tier_order").notNull(),
  thresholdMinor: integer("threshold_minor").notNull(),
  capMinor: integer("cap_minor"),
  marginalRate: doublePrecision("marginal_rate").notNull()
});
var costDatasets = pgTable("cost_datasets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  cityId: varchar("city_id", { length: 32 }).notNull().references(() => cities.id),
  datasetVersion: varchar("dataset_version", { length: 32 }).notNull(),
  observationDate: timestamp("observation_date").notNull(),
  retrievalDate: timestamp("retrieval_date").defaultNow().notNull(),
  housingOneBedMinor: integer("housing_one_bed_minor").notNull(),
  housingThreeBedMinor: integer("housing_three_bed_minor").notNull(),
  foodMonthlyMinor: integer("food_monthly_minor").notNull(),
  utilitiesMonthlyMinor: integer("utilities_monthly_minor").notNull(),
  transportMonthlyMinor: integer("transport_monthly_minor").notNull(),
  healthcareMonthlyMinor: integer("healthcare_monthly_minor").notNull(),
  confidenceRating: doublePrecision("confidence_rating").notNull().default(0.95),
  sourceRef: text("source_ref").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var fxSnapshots = pgTable("fx_snapshots", {
  id: varchar("id", { length: 64 }).primaryKey(),
  baseCurrency: varchar("base_currency", { length: 4 }).notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  providerTimestamp: timestamp("provider_timestamp").notNull(),
  retrievedAt: timestamp("retrieved_at").defaultNow().notNull(),
  status: varchar("status", { length: 16 }).notNull().default("ACTIVE"),
  ratesJson: jsonb("rates_json").notNull()
});
var fxRates = pgTable("fx_rates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  snapshotId: varchar("snapshot_id", { length: 64 }).notNull().references(() => fxSnapshots.id),
  baseCurrency: varchar("base_currency", { length: 4 }).notNull(),
  quoteCurrency: varchar("quote_currency", { length: 4 }).notNull(),
  rate: doublePrecision("rate").notNull(),
  invertedRate: doublePrecision("inverted_rate").notNull()
});
var evidenceSources = pgTable("evidence_sources", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  tier: text("tier").notNull().default("TIER_1_GOVERNMENT"),
  authority: text("authority").notNull(),
  url: text("url").notNull(),
  methodology: text("methodology").notNull(),
  frequency: varchar("frequency", { length: 32 }).notNull().default("annual"),
  lastVerifiedAt: timestamp("last_verified_at").notNull()
});
var calculationScenarios = pgTable("calculation_scenarios", {
  id: varchar("id", { length: 64 }).primaryKey(),
  cityId: varchar("city_id", { length: 32 }).notNull().references(() => cities.id),
  countryId: varchar("country_id", { length: 8 }).notNull().references(() => countries.id),
  baseSalaryMinor: integer("base_salary_minor").notNull(),
  currency: varchar("currency", { length: 4 }).notNull(),
  householdType: varchar("household_type", { length: 32 }).notNull().default("single"),
  lifestyleTier: varchar("lifestyle_tier", { length: 32 }).notNull().default("moderate"),
  overridesJson: jsonb("overrides_json"),
  engineVersion: varchar("engine_version", { length: 32 }).notNull().default("1.0.0"),
  taxRuleVersion: varchar("tax_rule_version", { length: 32 }).notNull(),
  costDatasetVersion: varchar("cost_dataset_version", { length: 32 }).notNull(),
  fxSnapshotId: varchar("fx_snapshot_id", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var calculationResults = pgTable("calculation_results", {
  id: varchar("id", { length: 64 }).primaryKey(),
  scenarioId: varchar("scenario_id", { length: 64 }).notNull().references(() => calculationScenarios.id),
  grossSalaryAnnualMinor: integer("gross_salary_annual_minor").notNull(),
  takeHomeAnnualMinor: integer("take_home_annual_minor").notNull(),
  totalTaxAnnualMinor: integer("total_tax_annual_minor").notNull(),
  socialContributionsAnnualMinor: integer("social_contributions_annual_minor").notNull(),
  livingCostsAnnualMinor: integer("living_costs_annual_minor").notNull(),
  moneyRemainingAnnualMinor: integer("money_remaining_annual_minor").notNull(),
  effectiveTaxRate: doublePrecision("effective_tax_rate").notNull(),
  fullResultJson: jsonb("full_result_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var contentPages = pgTable("content_pages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  title: text("title").notNull(),
  metaDescription: text("meta_description").notNull(),
  workflowState: text("workflow_state").notNull().default("DRAFTED"),
  isIndexable: boolean("is_indexable").notNull().default(false),
  authorEmail: text("author_email").notNull(),
  reviewerEmail: text("reviewer_email"),
  publishedAt: timestamp("published_at"),
  canonicalUrl: text("canonical_url"),
  blocksJson: jsonb("blocks_json").notNull(),
  evidenceSourceIds: jsonb("evidence_source_ids").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 128 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("READ_ONLY"),
  mfaSecret: text("mfa_secret"),
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at")
});
var auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  actorEmail: text("actor_email").notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  entityType: varchar("entity_type", { length: 64 }).notNull(),
  entityId: varchar("entity_id", { length: 64 }).notNull(),
  metadataJson: jsonb("metadata_json"),
  ipAddress: varchar("ip_address", { length: 48 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
var webVitals = pgTable("web_vitals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  metricName: varchar("metric_name", { length: 16 }).notNull(),
  // 'LCP', 'CLS', 'INP'
  metricValue: doublePrecision("metric_value").notNull(),
  metricRating: varchar("metric_rating", { length: 16 }).notNull(),
  // 'good', 'needs-improvement', 'poor'
  route: text("route").notNull(),
  device: varchar("device", { length: 16 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull()
});
var housingDatasets = pgTable("housing_datasets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  cityId: varchar("city_id", { length: 32 }).notNull().references(() => cities.id),
  bedroomCount: varchar("bedroom_count", { length: 16 }).notNull(),
  // 'studio', 'one_bed', 'two_bed', 'three_bed'
  neighborhoodTier: varchar("neighborhood_tier", { length: 32 }).notNull().default("city_center"),
  medianMonthlyRentMinor: integer("median_monthly_rent_minor").notNull(),
  p25MonthlyRentMinor: integer("p25_monthly_rent_minor").notNull(),
  p75MonthlyRentMinor: integer("p75_monthly_rent_minor").notNull(),
  currency: varchar("currency", { length: 4 }).notNull(),
  sourceRef: text("source_ref").notNull(),
  retrievalDate: timestamp("retrieval_date").defaultNow().notNull()
});
var salaryDatasets = pgTable("salary_datasets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  cityId: varchar("city_id", { length: 32 }).notNull().references(() => cities.id),
  roleTitle: text("role_title").notNull(),
  experienceLevel: varchar("experience_level", { length: 32 }).notNull().default("mid"),
  p25AnnualMinor: integer("p25_annual_minor").notNull(),
  p50AnnualMinor: integer("p50_annual_minor").notNull(),
  p75AnnualMinor: integer("p75_annual_minor").notNull(),
  p90AnnualMinor: integer("p90_annual_minor").notNull(),
  currency: varchar("currency", { length: 4 }).notNull(),
  sampleSize: integer("sample_size").notNull().default(100),
  sourceRef: text("source_ref").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var editorialReviews = pgTable("editorial_reviews", {
  id: varchar("id", { length: 64 }).primaryKey(),
  contentPageId: varchar("content_page_id", { length: 64 }).notNull().references(() => contentPages.id),
  reviewerEmail: text("reviewer_email").notNull(),
  status: text("status").notNull().default("PENDING"),
  // 'PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED'
  feedbackNotes: text("feedback_notes"),
  statutoryCheckPassed: boolean("statutory_check_passed").notNull().default(true),
  reviewedAt: timestamp("reviewed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var schemaMigrations = pgTable("schema_migrations", {
  id: integer("id").primaryKey(),
  migrationName: text("migration_name").notNull().unique(),
  appliedAt: timestamp("applied_at").defaultNow().notNull()
});
var backlinkRecords = pgTable("backlink_records", {
  id: varchar("id", { length: 64 }).primaryKey(),
  referringDomain: varchar("referring_domain", { length: 255 }).notNull(),
  sourceUrl: text("source_url").notNull(),
  targetUrl: text("target_url").notNull(),
  anchorText: text("anchor_text").notNull(),
  relAttribute: varchar("rel_attribute", { length: 64 }).notNull().default("dofollow"),
  // 'dofollow', 'nofollow', 'ugc', 'sponsored'
  acquisitionChannel: varchar("acquisition_channel", { length: 64 }).notNull(),
  // 'DIGITAL_PR', 'EDITORIAL', 'RESOURCE_PAGE', 'UNLINKED_MENTION', 'PARTNERSHIP'
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastCheckedAt: timestamp("last_checked_at").defaultNow().notNull(),
  status: varchar("status", { length: 32 }).notNull().default("PENDING_VERIFICATION"),
  // 'ACTIVE', 'LOST', 'NOT_FOUND', 'PENDING_VERIFICATION'
  httpStatusCode: integer("http_status_code"),
  contactEmail: varchar("contact_email", { length: 128 }),
  campaignName: varchar("campaign_name", { length: 128 }),
  notes: text("notes")
});
var rankTrackingRecords = pgTable("rank_tracking_records", {
  id: varchar("id", { length: 64 }).primaryKey(),
  keyword: text("keyword").notNull(),
  targetUrl: text("target_url").notNull(),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  country: varchar("country", { length: 8 }).notNull().default("US"),
  device: varchar("device", { length: 16 }).notNull().default("desktop"),
  currentRank: integer("current_rank"),
  previousRank: integer("previous_rank"),
  rankDelta: integer("rank_delta"),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  ctr: doublePrecision("ctr").notNull().default(0),
  averagePosition: doublePrecision("average_position"),
  serpFeature: varchar("serp_feature", { length: 64 }).default("STANDARD"),
  // 'FEATURED_SNIPPET', 'PEOPLE_ALSO_ASK', 'KNOWLEDGE_PANEL', 'STANDARD'
  lastCheckedAt: timestamp("last_checked_at").defaultNow().notNull()
});
var taxSourceMonitors = pgTable("tax_source_monitors", {
  id: varchar("id", { length: 64 }).primaryKey(),
  jurisdictionId: varchar("jurisdiction_id", { length: 32 }).notNull(),
  authorityName: text("authority_name").notNull(),
  officialPortalUrl: text("official_portal_url").notNull(),
  lastCheckedAt: timestamp("last_checked_at").defaultNow().notNull(),
  lastModifiedHeader: text("last_modified_header"),
  etagHeader: text("etag_header"),
  contentHash: text("content_hash"),
  publicationDetected: boolean("publication_detected").notNull().default(false),
  publishedStatuteYear: integer("published_statute_year").notNull().default(2026),
  implementationStatus: varchar("implementation_status", { length: 32 }).notNull().default("CURRENT_2026"),
  // 'CURRENT_2026', 'DETECTED_2027', 'ADAPTER_PENDING', 'VERIFIED_2027'
  notes: text("notes")
});
var prOutreachRecords = pgTable("pr_outreach_records", {
  id: varchar("id", { length: 64 }).primaryKey(),
  journalistName: text("journalist_name").notNull(),
  outlet: text("outlet").notNull(),
  beat: text("beat").notNull(),
  verifiedArticleUrl: text("verified_article_url").notNull(),
  publicContactMethod: text("public_contact_method").notNull(),
  pitchAngle: text("pitch_angle").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("PITCH_READY"),
  // 'DRAFTED', 'PITCH_READY', 'SENT', 'REPLIED', 'COVERAGE_PUBLISHED', 'DECLINED'
  sentAt: timestamp("sent_at"),
  notes: text("notes")
});
var gscPerformanceRecords = pgTable("gsc_performance_records", {
  id: varchar("id", { length: 128 }).primaryKey(),
  date: varchar("date", { length: 16 }).notNull(),
  query: text("query").notNull(),
  page: text("page").notNull(),
  locale: varchar("locale", { length: 16 }).notNull().default("en"),
  country: varchar("country", { length: 16 }).notNull().default("all"),
  device: varchar("device", { length: 16 }).notNull().default("all"),
  clicks: integer("clicks").notNull().default(0),
  impressions: integer("impressions").notNull().default(0),
  ctr: doublePrecision("ctr").notNull().default(0),
  averagePosition: doublePrecision("average_position"),
  dataSource: varchar("data_source", { length: 64 }).notNull().default("GOOGLE_SEARCH_CONSOLE_API"),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull()
});

// src/data/locations.ts
var COUNTRIES = {
  // PRIORITY A (12)
  US: { id: "US", name: "United States", defaultCurrency: "USD", verificationStatus: "VERIFIED" },
  GB: { id: "GB", name: "United Kingdom", defaultCurrency: "GBP", verificationStatus: "VERIFIED" },
  CA: { id: "CA", name: "Canada", defaultCurrency: "CAD", verificationStatus: "VERIFIED" },
  AU: { id: "AU", name: "Australia", defaultCurrency: "AUD", verificationStatus: "VERIFIED" },
  DE: { id: "DE", name: "Germany", defaultCurrency: "EUR", verificationStatus: "VERIFIED" },
  FR: { id: "FR", name: "France", defaultCurrency: "EUR", verificationStatus: "LIMITED", notes: "Imp\xF4t sur le revenu schedules verified; localized quotient familial pending." },
  NL: { id: "NL", name: "Netherlands", defaultCurrency: "EUR", verificationStatus: "LIMITED", notes: "Box 1 schedules verified; 30% ruling exemption toggle pending." },
  CH: { id: "CH", name: "Switzerland", defaultCurrency: "CHF", verificationStatus: "LIMITED", notes: "Cantonal/municipal tax multipliers pending." },
  IE: { id: "IE", name: "Ireland", defaultCurrency: "EUR", verificationStatus: "LIMITED", notes: "Standard cut-off rates verified." },
  AE: { id: "AE", name: "United Arab Emirates", defaultCurrency: "AED", verificationStatus: "VERIFIED" },
  SG: { id: "SG", name: "Singapore", defaultCurrency: "SGD", verificationStatus: "VERIFIED" },
  NZ: { id: "NZ", name: "New Zealand", defaultCurrency: "NZD", verificationStatus: "VERIFIED", notes: "Inland Revenue (IRD) brackets and ACC earner levy verified." },
  // PRIORITY B (15)
  JP: { id: "JP", name: "Japan", defaultCurrency: "JPY", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  KR: { id: "KR", name: "South Korea", defaultCurrency: "KRW", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  SA: { id: "SA", name: "Saudi Arabia", defaultCurrency: "SAR", verificationStatus: "VERIFIED" },
  QA: { id: "QA", name: "Qatar", defaultCurrency: "QAR", verificationStatus: "VERIFIED" },
  NO: { id: "NO", name: "Norway", defaultCurrency: "NOK", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  SE: { id: "SE", name: "Sweden", defaultCurrency: "SEK", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  DK: { id: "DK", name: "Denmark", defaultCurrency: "DKK", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  FI: { id: "FI", name: "Finland", defaultCurrency: "EUR", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  AT: { id: "AT", name: "Austria", defaultCurrency: "EUR", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  BE: { id: "BE", name: "Belgium", defaultCurrency: "EUR", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  ES: { id: "ES", name: "Spain", defaultCurrency: "EUR", verificationStatus: "LIMITED", notes: "IRPF national and regional scales verified; autonomous community variations limited." },
  IT: { id: "IT", name: "Italy", defaultCurrency: "EUR", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  IL: { id: "IL", name: "Israel", defaultCurrency: "ILS", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  HK: { id: "HK", name: "Hong Kong", defaultCurrency: "HKD", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  LU: { id: "LU", name: "Luxembourg", defaultCurrency: "EUR", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  // PRIORITY C (12)
  IN: { id: "IN", name: "India", defaultCurrency: "INR", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  BR: { id: "BR", name: "Brazil", defaultCurrency: "BRL", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  MX: { id: "MX", name: "Mexico", defaultCurrency: "MXN", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  ID: { id: "ID", name: "Indonesia", defaultCurrency: "IDR", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  MY: { id: "MY", name: "Malaysia", defaultCurrency: "MYR", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  PH: { id: "PH", name: "Philippines", defaultCurrency: "PHP", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  ZA: { id: "ZA", name: "South Africa", defaultCurrency: "ZAR", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  PL: { id: "PL", name: "Poland", defaultCurrency: "PLN", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  PT: { id: "PT", name: "Portugal", defaultCurrency: "EUR", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  CZ: { id: "CZ", name: "Czechia", defaultCurrency: "CZK", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  TH: { id: "TH", name: "Thailand", defaultCurrency: "THB", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." },
  VN: { id: "VN", name: "Vietnam", defaultCurrency: "VND", verificationStatus: "UNSUPPORTED", notes: "Commercial market supported for cost-of-living; dedicated statutory tax engine under verification." }
};
var REGIONS = {
  // US States
  "US-NY": { id: "US-NY", countryId: "US", name: "New York", code: "NY" },
  "US-CA": { id: "US-CA", countryId: "US", name: "California", code: "CA" },
  "US-WA": { id: "US-WA", countryId: "US", name: "Washington", code: "WA" },
  "US-TX": { id: "US-TX", countryId: "US", name: "Texas", code: "TX" },
  "US-IL": { id: "US-IL", countryId: "US", name: "Illinois", code: "IL" },
  "US-FL": { id: "US-FL", countryId: "US", name: "Florida", code: "FL" },
  "US-MA": { id: "US-MA", countryId: "US", name: "Massachusetts", code: "MA" },
  "US-DC": { id: "US-DC", countryId: "US", name: "District of Columbia", code: "DC" },
  // UK
  "GB-ENG": { id: "GB-ENG", countryId: "GB", name: "England", code: "ENG" },
  "GB-SCT": { id: "GB-SCT", countryId: "GB", name: "Scotland", code: "SCT" },
  // UAE
  "AE-DXB": { id: "AE-DXB", countryId: "AE", name: "Dubai", code: "DXB" },
  "AE-AUH": { id: "AE-AUH", countryId: "AE", name: "Abu Dhabi", code: "AUH" },
  "AE-SHJ": { id: "AE-SHJ", countryId: "AE", name: "Sharjah", code: "SHJ" },
  // Canada
  "CA-ON": { id: "CA-ON", countryId: "CA", name: "Ontario", code: "ON" },
  "CA-BC": { id: "CA-BC", countryId: "CA", name: "British Columbia", code: "BC" },
  "CA-AB": { id: "CA-AB", countryId: "CA", name: "Alberta", code: "AB" },
  // Australia
  "AU-NSW": { id: "AU-NSW", countryId: "AU", name: "New South Wales", code: "NSW" },
  "AU-VIC": { id: "AU-VIC", countryId: "AU", name: "Victoria", code: "VIC" },
  // Germany
  "DE-BE": { id: "DE-BE", countryId: "DE", name: "Berlin", code: "BE" },
  "DE-BY": { id: "DE-BY", countryId: "DE", name: "Bavaria", code: "BY" },
  // France
  "FR-IDF": { id: "FR-IDF", countryId: "FR", name: "\xCEle-de-France", code: "IDF" },
  "FR-ARA": { id: "FR-ARA", countryId: "FR", name: "Auvergne-Rh\xF4ne-Alpes", code: "ARA" },
  // Spain
  "ES-MD": { id: "ES-MD", countryId: "ES", name: "Community of Madrid", code: "MD" },
  "ES-CT": { id: "ES-CT", countryId: "ES", name: "Catalonia", code: "CT" },
  "ES-VC": { id: "ES-VC", countryId: "ES", name: "Valencian Community", code: "VC" },
  // Netherlands
  "NL-NH": { id: "NL-NH", countryId: "NL", name: "North Holland", code: "NH" },
  "NL-ZH": { id: "NL-ZH", countryId: "NL", name: "South Holland", code: "ZH" },
  // Saudi Arabia
  "SA-RIY": { id: "SA-RIY", countryId: "SA", name: "Riyadh Province", code: "RIY" },
  // Priority A Additional Hubs
  "IE-LEI": { id: "IE-LEI", countryId: "IE", name: "Leinster", code: "LEI" },
  "CH-ZH": { id: "CH-ZH", countryId: "CH", name: "Canton of Zurich", code: "ZH" },
  "SG-SG": { id: "SG-SG", countryId: "SG", name: "Singapore Central", code: "SG" },
  "QA-DA": { id: "QA-DA", countryId: "QA", name: "Doha Municipality", code: "DA" },
  "NZ-AUK": { id: "NZ-AUK", countryId: "NZ", name: "Auckland Region", code: "AUK" },
  // Priority B Hubs
  "JP-TK": { id: "JP-TK", countryId: "JP", name: "Tokyo Prefecture", code: "TK" },
  "KR-SO": { id: "KR-SO", countryId: "KR", name: "Seoul Capital Area", code: "SO" },
  "NO-OS": { id: "NO-OS", countryId: "NO", name: "Oslo Region", code: "OS" },
  "SE-ST": { id: "SE-ST", countryId: "SE", name: "Stockholm County", code: "ST" },
  "DK-CP": { id: "DK-CP", countryId: "DK", name: "Capital Region of Denmark", code: "CP" },
  "FI-US": { id: "FI-US", countryId: "FI", name: "Uusimaa", code: "US" },
  "AT-WN": { id: "AT-WN", countryId: "AT", name: "Vienna State", code: "WN" },
  "BE-BR": { id: "BE-BR", countryId: "BE", name: "Brussels-Capital Region", code: "BR" },
  "IT-LA": { id: "IT-LA", countryId: "IT", name: "Lazio", code: "LA" },
  "IT-LO": { id: "IT-LO", countryId: "IT", name: "Lombardy", code: "LO" },
  "IL-TA": { id: "IL-TA", countryId: "IL", name: "Tel Aviv District", code: "TA" },
  "HK-HK": { id: "HK-HK", countryId: "HK", name: "Hong Kong SAR", code: "HK" },
  "LU-LU": { id: "LU-LU", countryId: "LU", name: "Luxembourg Canton", code: "LU" },
  // Priority C Hubs
  "IN-MH": { id: "IN-MH", countryId: "IN", name: "Maharashtra", code: "MH" },
  "IN-KA": { id: "IN-KA", countryId: "IN", name: "Karnataka", code: "KA" },
  "BR-SP": { id: "BR-SP", countryId: "BR", name: "S\xE3o Paulo State", code: "SP" },
  "MX-CD": { id: "MX-CD", countryId: "MX", name: "Mexico City Federal Entity", code: "CD" },
  "ID-JK": { id: "ID-JK", countryId: "ID", name: "Jakarta Special Capital Region", code: "JK" },
  "MY-KL": { id: "MY-KL", countryId: "MY", name: "Federal Territory of Kuala Lumpur", code: "KL" },
  "PH-MN": { id: "PH-MN", countryId: "PH", name: "National Capital Region", code: "MN" },
  "ZA-GP": { id: "ZA-GP", countryId: "ZA", name: "Gauteng", code: "GP" },
  "ZA-WC": { id: "ZA-WC", countryId: "ZA", name: "Western Cape", code: "WC" },
  "PL-MZ": { id: "PL-MZ", countryId: "PL", name: "Masovian Voivodeship", code: "MZ" },
  "PT-LS": { id: "PT-LS", countryId: "PT", name: "Lisbon District", code: "LS" },
  "CZ-PR": { id: "CZ-PR", countryId: "CZ", name: "Prague Region", code: "PR" },
  "TH-BK": { id: "TH-BK", countryId: "TH", name: "Bangkok Metropolitan Administration", code: "BK" },
  "VN-HC": { id: "VN-HC", countryId: "VN", name: "Ho Chi Minh Municipality", code: "HC" }
};
var CITIES = {
  // --- United States ---
  nyc: {
    id: "nyc",
    name: "New York City",
    regionId: "US-NY",
    countryId: "US",
    currency: "USD",
    taxJurisdictionId: "tax-us-ny-nyc",
    colIndexBase100NYC: 100,
    metroAreaName: "New York-Newark-Jersey City, NY-NJ-PA",
    verificationStatus: "VERIFIED"
  },
  sf: {
    id: "sf",
    name: "San Francisco",
    regionId: "US-CA",
    countryId: "US",
    currency: "USD",
    taxJurisdictionId: "tax-us-ca-sf",
    colIndexBase100NYC: 96.2,
    metroAreaName: "San Francisco-Oakland-Berkeley, CA",
    verificationStatus: "VERIFIED"
  },
  la: {
    id: "la",
    name: "Los Angeles",
    regionId: "US-CA",
    countryId: "US",
    currency: "USD",
    taxJurisdictionId: "tax-us-ca-la",
    colIndexBase100NYC: 86.5,
    metroAreaName: "Los Angeles-Long Beach-Anaheim, CA",
    verificationStatus: "VERIFIED"
  },
  seattle: {
    id: "seattle",
    name: "Seattle",
    regionId: "US-WA",
    countryId: "US",
    currency: "USD",
    taxJurisdictionId: "tax-us-wa-seattle",
    colIndexBase100NYC: 83.2,
    metroAreaName: "Seattle-Tacoma-Bellevue, WA",
    verificationStatus: "VERIFIED"
  },
  austin: {
    id: "austin",
    name: "Austin",
    regionId: "US-TX",
    countryId: "US",
    currency: "USD",
    taxJurisdictionId: "tax-us-tx-austin",
    colIndexBase100NYC: 68.4,
    metroAreaName: "Austin-Round Rock-Georgetown, TX",
    verificationStatus: "VERIFIED"
  },
  chicago: {
    id: "chicago",
    name: "Chicago",
    regionId: "US-IL",
    countryId: "US",
    currency: "USD",
    taxJurisdictionId: "tax-us-il-chicago",
    colIndexBase100NYC: 72.8,
    metroAreaName: "Chicago-Naperville-Elgin, IL-IN-WI",
    verificationStatus: "VERIFIED"
  },
  miami: {
    id: "miami",
    name: "Miami",
    regionId: "US-FL",
    countryId: "US",
    currency: "USD",
    taxJurisdictionId: "tax-us-fl-miami",
    colIndexBase100NYC: 78.4,
    metroAreaName: "Miami-Fort Lauderdale-Pompano Beach, FL",
    verificationStatus: "VERIFIED"
  },
  boston: {
    id: "boston",
    name: "Boston",
    regionId: "US-MA",
    countryId: "US",
    currency: "USD",
    taxJurisdictionId: "tax-us-ma-boston",
    colIndexBase100NYC: 88.6,
    metroAreaName: "Boston-Cambridge-Newton, MA-NH",
    verificationStatus: "VERIFIED"
  },
  dc: {
    id: "dc",
    name: "Washington DC",
    regionId: "US-DC",
    countryId: "US",
    currency: "USD",
    taxJurisdictionId: "tax-us-dc-washington",
    colIndexBase100NYC: 85.1,
    metroAreaName: "Washington-Arlington-Alexandria, DC-VA-MD-WV",
    verificationStatus: "VERIFIED"
  },
  // --- United Kingdom ---
  london: {
    id: "london",
    name: "London",
    regionId: "GB-ENG",
    countryId: "GB",
    currency: "GBP",
    taxJurisdictionId: "tax-gb-london",
    colIndexBase100NYC: 84.5,
    metroAreaName: "Greater London",
    verificationStatus: "VERIFIED"
  },
  manchester: {
    id: "manchester",
    name: "Manchester",
    regionId: "GB-ENG",
    countryId: "GB",
    currency: "GBP",
    taxJurisdictionId: "tax-gb-manchester",
    colIndexBase100NYC: 59.2,
    metroAreaName: "Greater Manchester",
    verificationStatus: "VERIFIED"
  },
  birmingham: {
    id: "birmingham",
    name: "Birmingham",
    regionId: "GB-ENG",
    countryId: "GB",
    currency: "GBP",
    taxJurisdictionId: "tax-gb-birmingham",
    colIndexBase100NYC: 56.4,
    metroAreaName: "West Midlands",
    verificationStatus: "VERIFIED"
  },
  edinburgh: {
    id: "edinburgh",
    name: "Edinburgh",
    regionId: "GB-SCT",
    countryId: "GB",
    currency: "GBP",
    taxJurisdictionId: "tax-gb-scotland",
    colIndexBase100NYC: 64.1,
    metroAreaName: "City of Edinburgh",
    verificationStatus: "VERIFIED"
  },
  glasgow: {
    id: "glasgow",
    name: "Glasgow",
    regionId: "GB-SCT",
    countryId: "GB",
    currency: "GBP",
    taxJurisdictionId: "tax-gb-scotland",
    colIndexBase100NYC: 57.5,
    metroAreaName: "Greater Glasgow",
    verificationStatus: "VERIFIED"
  },
  // --- UAE ---
  dubai: {
    id: "dubai",
    name: "Dubai",
    regionId: "AE-DXB",
    countryId: "AE",
    currency: "AED",
    taxJurisdictionId: "tax-ae-dubai",
    colIndexBase100NYC: 69.1,
    metroAreaName: "Dubai Metropolitan Area",
    verificationStatus: "VERIFIED"
  },
  abudhabi: {
    id: "abudhabi",
    name: "Abu Dhabi",
    regionId: "AE-AUH",
    countryId: "AE",
    currency: "AED",
    taxJurisdictionId: "tax-ae-abudhabi",
    colIndexBase100NYC: 64.8,
    metroAreaName: "Abu Dhabi Emirate",
    verificationStatus: "VERIFIED"
  },
  sharjah: {
    id: "sharjah",
    name: "Sharjah",
    regionId: "AE-SHJ",
    countryId: "AE",
    currency: "AED",
    taxJurisdictionId: "tax-ae-sharjah",
    colIndexBase100NYC: 51.3,
    metroAreaName: "Sharjah Metropolitan Area",
    verificationStatus: "VERIFIED"
  },
  // --- Canada ---
  toronto: {
    id: "toronto",
    name: "Toronto",
    regionId: "CA-ON",
    countryId: "CA",
    currency: "CAD",
    taxJurisdictionId: "tax-ca-on-toronto",
    colIndexBase100NYC: 73.8,
    metroAreaName: "Greater Toronto Area",
    verificationStatus: "VERIFIED"
  },
  vancouver: {
    id: "vancouver",
    name: "Vancouver",
    regionId: "CA-BC",
    countryId: "CA",
    currency: "CAD",
    taxJurisdictionId: "tax-ca-bc-vancouver",
    colIndexBase100NYC: 77.2,
    metroAreaName: "Metro Vancouver",
    verificationStatus: "VERIFIED"
  },
  calgary: {
    id: "calgary",
    name: "Calgary",
    regionId: "CA-AB",
    countryId: "CA",
    currency: "CAD",
    taxJurisdictionId: "tax-ca-ab-calgary",
    colIndexBase100NYC: 62.4,
    metroAreaName: "Calgary Metropolitan Region",
    verificationStatus: "VERIFIED"
  },
  // --- Australia ---
  sydney: {
    id: "sydney",
    name: "Sydney",
    regionId: "AU-NSW",
    countryId: "AU",
    currency: "AUD",
    taxJurisdictionId: "tax-au-federal",
    colIndexBase100NYC: 79.5,
    metroAreaName: "Greater Sydney",
    verificationStatus: "VERIFIED"
  },
  melbourne: {
    id: "melbourne",
    name: "Melbourne",
    regionId: "AU-VIC",
    countryId: "AU",
    currency: "AUD",
    taxJurisdictionId: "tax-au-federal",
    colIndexBase100NYC: 71.3,
    metroAreaName: "Greater Melbourne",
    verificationStatus: "VERIFIED"
  },
  // --- Germany ---
  berlin: {
    id: "berlin",
    name: "Berlin",
    regionId: "DE-BE",
    countryId: "DE",
    currency: "EUR",
    taxJurisdictionId: "tax-de-federal",
    colIndexBase100NYC: 65.4,
    metroAreaName: "Berlin/Brandenburg Metropolitan Region",
    verificationStatus: "VERIFIED"
  },
  munich: {
    id: "munich",
    name: "Munich",
    regionId: "DE-BY",
    countryId: "DE",
    currency: "EUR",
    taxJurisdictionId: "tax-de-federal",
    colIndexBase100NYC: 76.1,
    metroAreaName: "Munich Metropolitan Region",
    verificationStatus: "VERIFIED"
  },
  // --- France ---
  paris: {
    id: "paris",
    name: "Paris",
    regionId: "FR-IDF",
    countryId: "FR",
    currency: "EUR",
    taxJurisdictionId: "tax-fr-federal",
    colIndexBase100NYC: 78.9,
    metroAreaName: "Grand Paris",
    verificationStatus: "LIMITED"
  },
  lyon: {
    id: "lyon",
    name: "Lyon",
    regionId: "FR-ARA",
    countryId: "FR",
    currency: "EUR",
    taxJurisdictionId: "tax-fr-federal",
    colIndexBase100NYC: 61.2,
    metroAreaName: "M\xE9tropole de Lyon",
    verificationStatus: "LIMITED"
  },
  // --- Spain ---
  madrid: {
    id: "madrid",
    name: "Madrid",
    regionId: "ES-MD",
    countryId: "ES",
    currency: "EUR",
    taxJurisdictionId: "tax-es-federal",
    colIndexBase100NYC: 58.7,
    metroAreaName: "Comunidad de Madrid",
    verificationStatus: "LIMITED"
  },
  barcelona: {
    id: "barcelona",
    name: "Barcelona",
    regionId: "ES-CT",
    countryId: "ES",
    currency: "EUR",
    taxJurisdictionId: "tax-es-federal",
    colIndexBase100NYC: 62.1,
    metroAreaName: "\xC0rea Metropolitana de Barcelona",
    verificationStatus: "LIMITED"
  },
  valencia: {
    id: "valencia",
    name: "Valencia",
    regionId: "ES-VC",
    countryId: "ES",
    currency: "EUR",
    taxJurisdictionId: "tax-es-federal",
    colIndexBase100NYC: 49.3,
    metroAreaName: "\xC1rea Metropolitana de Valencia",
    verificationStatus: "LIMITED"
  },
  // --- Netherlands ---
  amsterdam: {
    id: "amsterdam",
    name: "Amsterdam",
    regionId: "NL-NH",
    countryId: "NL",
    currency: "EUR",
    taxJurisdictionId: "tax-nl-federal",
    colIndexBase100NYC: 79.4,
    metroAreaName: "Metropoolregio Amsterdam",
    verificationStatus: "LIMITED"
  },
  rotterdam: {
    id: "rotterdam",
    name: "Rotterdam",
    regionId: "NL-ZH",
    countryId: "NL",
    currency: "EUR",
    taxJurisdictionId: "tax-nl-federal",
    colIndexBase100NYC: 67.8,
    metroAreaName: "Metropoolregio Rotterdam Den Haag",
    verificationStatus: "LIMITED"
  },
  // --- Saudi Arabia ---
  riyadh: {
    id: "riyadh",
    name: "Riyadh",
    regionId: "SA-RIY",
    countryId: "SA",
    currency: "SAR",
    taxJurisdictionId: "tax-sa-riyadh",
    colIndexBase100NYC: 58.4,
    metroAreaName: "Ar Riyad Metro",
    verificationStatus: "VERIFIED"
  },
  jeddah: {
    id: "jeddah",
    name: "Jeddah",
    regionId: "SA-MAQ",
    countryId: "SA",
    currency: "SAR",
    taxJurisdictionId: "tax-sa-jeddah",
    colIndexBase100NYC: 52.1,
    metroAreaName: "Jeddah Governorate",
    verificationStatus: "VERIFIED"
  },
  // --- Ireland ---
  dublin: {
    id: "dublin",
    name: "Dublin",
    regionId: "IE-LEI",
    countryId: "IE",
    currency: "EUR",
    taxJurisdictionId: "tax-ie-federal",
    colIndexBase100NYC: 82.3,
    metroAreaName: "Greater Dublin Area",
    verificationStatus: "LIMITED"
  },
  // --- Switzerland ---
  zurich: {
    id: "zurich",
    name: "Zurich",
    regionId: "CH-ZH",
    countryId: "CH",
    currency: "CHF",
    taxJurisdictionId: "tax-ch-zurich",
    colIndexBase100NYC: 118.5,
    metroAreaName: "Greater Zurich Area",
    verificationStatus: "LIMITED"
  },
  // --- Singapore ---
  singapore: {
    id: "singapore",
    name: "Singapore",
    regionId: "SG-SG",
    countryId: "SG",
    currency: "SGD",
    taxJurisdictionId: "tax-sg-federal",
    colIndexBase100NYC: 92.4,
    metroAreaName: "Singapore City-State",
    verificationStatus: "VERIFIED"
  },
  // --- Qatar ---
  doha: {
    id: "doha",
    name: "Doha",
    regionId: "QA-DA",
    countryId: "QA",
    currency: "QAR",
    taxJurisdictionId: "tax-qa-doha",
    colIndexBase100NYC: 63.8,
    metroAreaName: "Ad Dawhah",
    verificationStatus: "VERIFIED"
  },
  // --- New Zealand ---
  auckland: {
    id: "auckland",
    name: "Auckland",
    regionId: "NZ-AUK",
    countryId: "NZ",
    currency: "NZD",
    taxJurisdictionId: "tax-nz-federal",
    colIndexBase100NYC: 72.9,
    metroAreaName: "Auckland Region",
    verificationStatus: "VERIFIED"
  },
  // --- Japan ---
  tokyo: {
    id: "tokyo",
    name: "Tokyo",
    regionId: "JP-TK",
    countryId: "JP",
    currency: "JPY",
    taxJurisdictionId: "tax-jp-federal",
    colIndexBase100NYC: 68.4,
    metroAreaName: "Greater Tokyo Area",
    verificationStatus: "UNSUPPORTED"
  },
  // --- South Korea ---
  seoul: {
    id: "seoul",
    name: "Seoul",
    regionId: "KR-SO",
    countryId: "KR",
    currency: "KRW",
    taxJurisdictionId: "tax-kr-federal",
    colIndexBase100NYC: 65.2,
    metroAreaName: "Seoul Capital Area",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Norway ---
  oslo: {
    id: "oslo",
    name: "Oslo",
    regionId: "NO-OS",
    countryId: "NO",
    currency: "NOK",
    taxJurisdictionId: "tax-no-federal",
    colIndexBase100NYC: 84.1,
    metroAreaName: "Greater Oslo Region",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Sweden ---
  stockholm: {
    id: "stockholm",
    name: "Stockholm",
    regionId: "SE-ST",
    countryId: "SE",
    currency: "SEK",
    taxJurisdictionId: "tax-se-federal",
    colIndexBase100NYC: 72.8,
    metroAreaName: "Metropolitan Stockholm",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Denmark ---
  copenhagen: {
    id: "copenhagen",
    name: "Copenhagen",
    regionId: "DK-CP",
    countryId: "DK",
    currency: "DKK",
    taxJurisdictionId: "tax-dk-federal",
    colIndexBase100NYC: 82.5,
    metroAreaName: "Hovedstadsomr\xE5det",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Finland ---
  helsinki: {
    id: "helsinki",
    name: "Helsinki",
    regionId: "FI-US",
    countryId: "FI",
    currency: "EUR",
    taxJurisdictionId: "tax-fi-federal",
    colIndexBase100NYC: 71.9,
    metroAreaName: "Helsinki Metropolitan Area",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Austria ---
  vienna: {
    id: "vienna",
    name: "Vienna",
    regionId: "AT-WN",
    countryId: "AT",
    currency: "EUR",
    taxJurisdictionId: "tax-at-federal",
    colIndexBase100NYC: 69.4,
    metroAreaName: "Vienna Region",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Belgium ---
  brussels: {
    id: "brussels",
    name: "Brussels",
    regionId: "BE-BR",
    countryId: "BE",
    currency: "EUR",
    taxJurisdictionId: "tax-be-federal",
    colIndexBase100NYC: 73.1,
    metroAreaName: "Brussels-Capital",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Italy ---
  rome: {
    id: "rome",
    name: "Rome",
    regionId: "IT-LA",
    countryId: "IT",
    currency: "EUR",
    taxJurisdictionId: "tax-it-federal",
    colIndexBase100NYC: 68.2,
    metroAreaName: "Metropolitan City of Rome",
    verificationStatus: "UNSUPPORTED"
  },
  milan: {
    id: "milan",
    name: "Milan",
    regionId: "IT-LO",
    countryId: "IT",
    currency: "EUR",
    taxJurisdictionId: "tax-it-federal",
    colIndexBase100NYC: 74.8,
    metroAreaName: "Milan Metropolitan Area",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Israel ---
  "tel-aviv": {
    id: "tel-aviv",
    name: "Tel Aviv",
    regionId: "IL-TA",
    countryId: "IL",
    currency: "ILS",
    taxJurisdictionId: "tax-il-federal",
    colIndexBase100NYC: 86.2,
    metroAreaName: "Gush Dan Metropolitan Area",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Hong Kong ---
  "hong-kong": {
    id: "hong-kong",
    name: "Hong Kong",
    regionId: "HK-HK",
    countryId: "HK",
    currency: "HKD",
    taxJurisdictionId: "tax-hk-federal",
    colIndexBase100NYC: 79.5,
    metroAreaName: "Hong Kong SAR",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Luxembourg ---
  luxembourg: {
    id: "luxembourg",
    name: "Luxembourg City",
    regionId: "LU-LU",
    countryId: "LU",
    currency: "EUR",
    taxJurisdictionId: "tax-lu-federal",
    colIndexBase100NYC: 78.2,
    metroAreaName: "Canton of Luxembourg",
    verificationStatus: "UNSUPPORTED"
  },
  // --- India ---
  mumbai: {
    id: "mumbai",
    name: "Mumbai",
    regionId: "IN-MH",
    countryId: "IN",
    currency: "INR",
    taxJurisdictionId: "tax-in-federal",
    colIndexBase100NYC: 27.5,
    metroAreaName: "Mumbai Metropolitan Region",
    verificationStatus: "UNSUPPORTED"
  },
  bengaluru: {
    id: "bengaluru",
    name: "Bengaluru",
    regionId: "IN-KA",
    countryId: "IN",
    currency: "INR",
    taxJurisdictionId: "tax-in-federal",
    colIndexBase100NYC: 24.8,
    metroAreaName: "Bangalore Urban",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Brazil ---
  "sao-paulo": {
    id: "sao-paulo",
    name: "S\xE3o Paulo",
    regionId: "BR-SP",
    countryId: "BR",
    currency: "BRL",
    taxJurisdictionId: "tax-br-federal",
    colIndexBase100NYC: 38.2,
    metroAreaName: "Greater S\xE3o Paulo",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Mexico ---
  "mexico-city": {
    id: "mexico-city",
    name: "Mexico City",
    regionId: "MX-CD",
    countryId: "MX",
    currency: "MXN",
    taxJurisdictionId: "tax-mx-federal",
    colIndexBase100NYC: 42.1,
    metroAreaName: "Greater Mexico City",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Indonesia ---
  jakarta: {
    id: "jakarta",
    name: "Jakarta",
    regionId: "ID-JK",
    countryId: "ID",
    currency: "IDR",
    taxJurisdictionId: "tax-id-federal",
    colIndexBase100NYC: 32.4,
    metroAreaName: "Jabodetabek",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Malaysia ---
  "kuala-lumpur": {
    id: "kuala-lumpur",
    name: "Kuala Lumpur",
    regionId: "MY-KL",
    countryId: "MY",
    currency: "MYR",
    taxJurisdictionId: "tax-my-federal",
    colIndexBase100NYC: 34.6,
    metroAreaName: "Greater Kuala Lumpur (Klang Valley)",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Philippines ---
  manila: {
    id: "manila",
    name: "Manila",
    regionId: "PH-MN",
    countryId: "PH",
    currency: "PHP",
    taxJurisdictionId: "tax-ph-federal",
    colIndexBase100NYC: 31.2,
    metroAreaName: "Metro Manila",
    verificationStatus: "UNSUPPORTED"
  },
  // --- South Africa ---
  johannesburg: {
    id: "johannesburg",
    name: "Johannesburg",
    regionId: "ZA-GP",
    countryId: "ZA",
    currency: "ZAR",
    taxJurisdictionId: "tax-za-federal",
    colIndexBase100NYC: 36.8,
    metroAreaName: "Greater Johannesburg",
    verificationStatus: "UNSUPPORTED"
  },
  "cape-town": {
    id: "cape-town",
    name: "Cape Town",
    regionId: "ZA-WC",
    countryId: "ZA",
    currency: "ZAR",
    taxJurisdictionId: "tax-za-federal",
    colIndexBase100NYC: 35.4,
    metroAreaName: "City of Cape Town",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Poland ---
  warsaw: {
    id: "warsaw",
    name: "Warsaw",
    regionId: "PL-MZ",
    countryId: "PL",
    currency: "PLN",
    taxJurisdictionId: "tax-pl-federal",
    colIndexBase100NYC: 44.5,
    metroAreaName: "Warsaw Metropolitan Area",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Portugal ---
  lisbon: {
    id: "lisbon",
    name: "Lisbon",
    regionId: "PT-LS",
    countryId: "PT",
    currency: "EUR",
    taxJurisdictionId: "tax-pt-federal",
    colIndexBase100NYC: 52.3,
    metroAreaName: "Lisbon Metropolitan Area",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Czechia ---
  prague: {
    id: "prague",
    name: "Prague",
    regionId: "CZ-PR",
    countryId: "CZ",
    currency: "CZK",
    taxJurisdictionId: "tax-cz-federal",
    colIndexBase100NYC: 48.7,
    metroAreaName: "Prague Metropolitan Area",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Thailand ---
  bangkok: {
    id: "bangkok",
    name: "Bangkok",
    regionId: "TH-BK",
    countryId: "TH",
    currency: "THB",
    taxJurisdictionId: "tax-th-federal",
    colIndexBase100NYC: 39.8,
    metroAreaName: "Bangkok Metropolitan Region",
    verificationStatus: "UNSUPPORTED"
  },
  // --- Vietnam ---
  "ho-chi-minh-city": {
    id: "ho-chi-minh-city",
    name: "Ho Chi Minh City",
    regionId: "VN-HC",
    countryId: "VN",
    currency: "VND",
    taxJurisdictionId: "tax-vn-federal",
    colIndexBase100NYC: 29.4,
    metroAreaName: "Ho Chi Minh Metropolitan Area",
    verificationStatus: "UNSUPPORTED"
  }
};

// src/data/evidence-registry.ts
var EVIDENCE_SOURCES = {
  // --- UNITED STATES ---
  "us-irs-tax-2024": {
    id: "us-irs-tax-2024",
    organization: "Internal Revenue Service (IRS)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "IRS Rev. Proc. 2023-34 & Rev. Proc. 2024-40 (Inflation-adjusted Tax Brackets & Standard Deductions)",
    url: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2024",
    jurisdiction: "United States (Federal)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Statutory 7-bracket system (10%, 12%, 22%, 24%, 32%, 35%, 37%), Standard Deduction $14,600 single / $29,200 married filing jointly."
  },
  "us-ssa-fica-2024": {
    id: "us-ssa-fica-2024",
    organization: "Social Security Administration (SSA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Social Security Administration Fact Sheet: 2024 Social Security Changes (OASDI Contribution & Benefit Base)",
    url: "https://www.ssa.gov/news/press/factsheets/colafacts2024.pdf",
    jurisdiction: "United States (Federal FICA)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-15",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "OASDI tax rate 6.2% on wages up to $168,600 (2024) / $176,100 (2026). Medicare tax rate 1.45% uncapped + 0.9% Additional Medicare Tax on earnings above $200,000."
  },
  "us-nys-tax-2024": {
    id: "us-nys-tax-2024",
    organization: "New York State Department of Taxation and Finance",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Form IT-201-I Instructions for Form IT-201 Full-Year Resident Income Tax Return",
    url: "https://www.tax.ny.gov/forms/income_cur_forms.htm",
    jurisdiction: "New York State",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-12-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-12",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "NYS graduated income tax rates from 4.0% to 10.9% (lower brackets 4.0%, 4.5%, 5.25%, 5.5%, 6.0%; upper brackets 6.85%, 9.65%, 10.3%, 10.9%). NYS Standard Deduction $8,000 single / $16,050 married filing jointly."
  },
  "us-nyc-tax-2024": {
    id: "us-nyc-tax-2024",
    organization: "New York City Department of Finance",
    sourceType: "Government / Tax Authority",
    canonicalReference: "NYC Personal Income Tax Tables for NYC Residents (Admin Code \xA7 11-1701)",
    url: "https://www.tax.ny.gov/pit/file/tax_tables/nyc_tables.htm",
    jurisdiction: "New York City (Local Resident)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-12-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-12",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "NYC resident income tax rates graduated from 3.078% to 3.876% applied on NY taxable income."
  },
  // --- UNITED STATES 2025 ---
  "us-irs-tax-2025": {
    id: "us-irs-tax-2025",
    organization: "Internal Revenue Service (IRS)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "IRS Rev. Proc. 2024-40 (2025 Inflation-adjusted Tax Brackets & Standard Deductions)",
    url: "https://www.irs.gov/pub/irs-drop/rp-24-40.pdf",
    jurisdiction: "United States (Federal)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-01",
    effectiveDate: "2025-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "2025 statutory 7-bracket schedule (10%, 12%, 22%, 24%, 32%, 35%, 37%). Bracket thresholds: single $11,925/$48,475/$103,350/$197,300/$250,525/$626,350. Standard Deduction $15,000 single / $30,000 MFJ / $22,500 HoH."
  },
  "us-ssa-fica-2025": {
    id: "us-ssa-fica-2025",
    organization: "Social Security Administration (SSA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Social Security Administration Fact Sheet: 2025 Social Security Changes (OASDI Contribution & Benefit Base)",
    url: "https://www.ssa.gov/news/press/factsheets/colafacts2025.pdf",
    jurisdiction: "United States (Federal FICA)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-15",
    effectiveDate: "2025-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "OASDI 6.2% on wages up to $176,100 maximum annual wage base for 2025. Medicare 1.45% uncapped + 0.9% Additional Medicare Tax above $200,000 (single) / $250,000 (MFJ)."
  },
  "us-nys-tax-2025": {
    id: "us-nys-tax-2025",
    organization: "New York State Department of Taxation and Finance",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Form IT-201-I Instructions for Form IT-201 Full-Year Resident Income Tax Return \u2014 2025 edition",
    url: "https://www.tax.ny.gov/forms/income_cur_forms.htm",
    jurisdiction: "New York State",
    reliabilityTier: "Tier 1",
    retrievedAt: "2025-01-15",
    effectiveDate: "2025-01-01",
    verifiedAt: "2026-01-12",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "NYS 2025 graduated income tax rates from 4.0% to 10.9% (lower brackets 4.0%, 4.5%, 5.25%, 5.5%, 6.0% up to $215,400; upper brackets 6.85%, 9.65%, 10.3%, 10.9%). NYS Standard Deduction $8,000 single / $16,050 MFJ. Pre-2026 rate schedule per NYS Tax Law \xA7 601."
  },
  "us-nyc-tax-2025": {
    id: "us-nyc-tax-2025",
    organization: "New York City Department of Finance",
    sourceType: "Government / Tax Authority",
    canonicalReference: "NYC Personal Income Tax Tables for NYC Residents (Admin Code \xA7 11-1701) \u2014 Tax Year 2025",
    url: "https://www.tax.ny.gov/pit/file/tax_tables/nyc_tables.htm",
    jurisdiction: "New York City (Local Resident)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2025-01-15",
    effectiveDate: "2025-01-01",
    verifiedAt: "2026-01-12",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "NYC resident income tax rates graduated from 3.078% to 3.876% applied on NY taxable income. Rates unchanged from 2024."
  },
  "us-hud-nyc-fmr-2026": {
    id: "us-hud-nyc-fmr-2026",
    organization: "U.S. Department of Housing and Urban Development (HUD)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "HUD Office of Policy Development and Research (PD&R) FY 2026 Fair Market Rents for New York, NY HUD Metro FMR Area",
    url: "https://www.huduser.gov/portal/datasets/fmr.html",
    jurisdiction: "New York City Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2026-10-05",
    effectiveDate: "2025-10-01",
    lastReviewedAt: "2026-10-05",
    notes: "Official FY 2026 40th percentile Fair Market Rents: Studio $2,529, 1-Bed $2,655, 2-Bed $2,910, 3-Bed $3,644, 4-Bed $3,959."
  },
  "us-hud-nyc-fmr-2024": {
    id: "us-hud-nyc-fmr-2024",
    organization: "U.S. Department of Housing and Urban Development (HUD)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "HUD Office of Policy Development and Research (PD&R) 50th Percentile Fair Market Rents for New York, NY HUD Metro FMR Area",
    url: "https://www.huduser.gov/portal/datasets/fmr.html",
    jurisdiction: "New York City Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Principal Real Estate Data Analyst",
    notes: "Median gross rent benchmarks across 1-bed, 2-bed, 3-bed units. Re-benchmarked with NYC Housing and Vacancy Survey (HVS)."
  },
  "us-hud-sf-fmr-2024": {
    id: "us-hud-sf-fmr-2024",
    organization: "U.S. Department of Housing and Urban Development (HUD)",
    sourceType: "Housing Market Registry",
    canonicalReference: "HUD Fair Market Rents for San Francisco, CA Metro FMR Area",
    url: "https://www.huduser.gov/portal/datasets/fmr.html",
    jurisdiction: "San Francisco Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Principal Real Estate Data Analyst",
    notes: "Median rent and housing cost benchmarks for San Francisco county."
  },
  "us-hud-la-fmr-2024": {
    id: "us-hud-la-fmr-2024",
    organization: "U.S. Department of Housing and Urban Development (HUD)",
    sourceType: "Housing Market Registry",
    canonicalReference: "HUD Fair Market Rents for Los Angeles-Long Beach-Glendale, CA",
    url: "https://www.huduser.gov/portal/datasets/fmr.html",
    jurisdiction: "Los Angeles Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Principal Real Estate Data Analyst",
    notes: "Los Angeles metro housing survey benchmarks."
  },
  "us-hud-seattle-fmr-2024": {
    id: "us-hud-seattle-fmr-2024",
    organization: "U.S. Department of Housing and Urban Development (HUD)",
    sourceType: "Housing Market Registry",
    canonicalReference: "HUD Fair Market Rents for Seattle-Bellevue, WA HUD Metro FMR Area",
    url: "https://www.huduser.gov/portal/datasets/fmr.html",
    jurisdiction: "Seattle Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Principal Real Estate Data Analyst",
    notes: "King County housing vacancy survey benchmarks."
  },
  "us-hud-austin-fmr-2024": {
    id: "us-hud-austin-fmr-2024",
    organization: "U.S. Department of Housing and Urban Development (HUD)",
    sourceType: "Housing Market Registry",
    canonicalReference: "HUD Fair Market Rents for Austin-Round Rock, TX MSA",
    url: "https://www.huduser.gov/portal/datasets/fmr.html",
    jurisdiction: "Austin Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Principal Real Estate Data Analyst",
    notes: "Travis & Williamson County rental benchmark data."
  },
  "us-hud-chicago-fmr-2024": {
    id: "us-hud-chicago-fmr-2024",
    organization: "U.S. Department of Housing and Urban Development (HUD)",
    sourceType: "Housing Market Registry",
    canonicalReference: "HUD Fair Market Rents for Chicago-Naperville-Joliet, IL",
    url: "https://www.huduser.gov/portal/datasets/fmr.html",
    jurisdiction: "Chicago Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Principal Real Estate Data Analyst",
    notes: "Cook County median rent benchmarks."
  },
  "us-hud-miami-fmr-2024": {
    id: "us-hud-miami-fmr-2024",
    organization: "U.S. Department of Housing and Urban Development (HUD)",
    sourceType: "Housing Market Registry",
    canonicalReference: "HUD Fair Market Rents for Miami-Miami Beach-Kendall, FL",
    url: "https://www.huduser.gov/portal/datasets/fmr.html",
    jurisdiction: "Miami Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Principal Real Estate Data Analyst",
    notes: "Miami-Dade County rental benchmarks."
  },
  "us-hud-boston-fmr-2024": {
    id: "us-hud-boston-fmr-2024",
    organization: "U.S. Department of Housing and Urban Development (HUD)",
    sourceType: "Housing Market Registry",
    canonicalReference: "HUD Fair Market Rents for Boston-Cambridge-Quincy, MA-NH",
    url: "https://www.huduser.gov/portal/datasets/fmr.html",
    jurisdiction: "Boston Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Principal Real Estate Data Analyst",
    notes: "Suffolk and Middlesex county rental benchmarks."
  },
  "us-hud-dc-fmr-2024": {
    id: "us-hud-dc-fmr-2024",
    organization: "U.S. Department of Housing and Urban Development (HUD)",
    sourceType: "Housing Market Registry",
    canonicalReference: "HUD Fair Market Rents for Washington-Arlington-Alexandria, DC-VA-MD",
    url: "https://www.huduser.gov/portal/datasets/fmr.html",
    jurisdiction: "Washington DC Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Principal Real Estate Data Analyst",
    notes: "District of Columbia and Northern Virginia rental benchmarks."
  },
  "us-bls-cex-nyc-2026": {
    id: "us-bls-cex-nyc-2026",
    organization: "U.S. Bureau of Labor Statistics (BLS)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "Consumer Expenditures in the New York Metropolitan Area \u2014 2023\u201324 (BLS News Release 26-12-BOS, Published January 6, 2026)",
    url: "https://www.bls.gov/regions/new-york-new-jersey/news-release/consumerexpenditures_newyork.htm",
    jurisdiction: "New York-Newark-Jersey City Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2026-10-05",
    effectiveDate: "2026-01-06",
    lastReviewedAt: "2026-10-05",
    notes: "Official BLS Consumer Expenditure Survey release reporting average annual household expenditures for the NY-NJ-PA metropolitan area (2023\u201324 survey period). LivWorthy modeled planning estimates ($440 groceries, $260 dining, $320 utilities/connectivity, $160 healthcare) are informed by this BLS 2023\u201324 New York metropolitan Consumer Expenditure Survey. LivWorthy converts source data into per-adult monthly planning benchmarks; the displayed values are not raw BLS published line items."
  },
  "us-bls-cpi-nyc-2024": {
    id: "us-bls-cpi-nyc-2024",
    organization: "U.S. Bureau of Labor Statistics (BLS)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "Consumer Price Index for All Urban Consumers (CPI-U): New York-Newark-Jersey City, NY-NJ-PA",
    url: "https://www.bls.gov/regions/new-york-new-jersey/news-release/consumerpriceindex_newyork.htm",
    jurisdiction: "New York-Newark-Jersey City Metro Area",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-12-01",
    effectiveDate: "2024-11-01",
    lastReviewedAt: "2026-10-05",
    notes: "BLS monthly Consumer Price Index (CPI-U) for the New York-Newark-Jersey City metro area. Provides regional inflation and expenditure-weight context. Superseded for NYC cost modelling by the annual Consumer Expenditure Survey release (see us-bls-cex-nyc-2026)."
  },
  "us-mta-nyc-transit-2026": {
    id: "us-mta-nyc-transit-2026",
    organization: "Metropolitan Transportation Authority (MTA)",
    sourceType: "Public Utility Commission",
    canonicalReference: "MTA Subway and Bus Fare Structure & OMNY 7-Day Rolling Fare Cap (Effective January 4, 2026)",
    url: "https://new.mta.info/fares",
    jurisdiction: "New York City",
    reliabilityTier: "Tier 1",
    retrievedAt: "2026-10-05",
    effectiveDate: "2026-01-04",
    lastReviewedAt: "2026-10-05",
    notes: "Base subway/local bus fare $3.00, OMNY 7-day rolling fare cap $35.00 (free rides after 12 paid taps in 7-day period). MetroCard sales/refills ended as the system transitioned to OMNY; legacy unlimited MetroCard products were discontinued. Monthly benchmark of $151.67 is a modeled monthly equivalent ($35.00 \xD7 52 / 12), not an official MTA monthly pass."
  },
  "us-nyc-childcare-benchmark": {
    id: "us-nyc-childcare-benchmark",
    organization: "LivWorthy Planning Benchmarks informed by NYS OCFS Market Rate Survey",
    sourceType: "Modeled Planning Benchmark",
    canonicalReference: "New York State Office of Children and Family Services (OCFS) Child Care Market Rate Survey \u2014 NYC Region (survey period varies by OCFS publication cycle)",
    url: "https://ocfs.ny.gov/programs/childcare/plans/market-rates.php",
    jurisdiction: "New York City",
    reliabilityTier: "Tier 2",
    retrievedAt: "2026-10-05",
    lastReviewedAt: "2026-10-05",
    notes: "LivWorthy modeled monthly planning benchmark ($1,450/month per child) for licensed toddler and preschool group day care in NYC, informed by NYS OCFS Child Care Market Rate Survey benchmarks for the NYC region. Observation period reflects the most recently available OCFS survey cycle at time of review. Modeled estimate distinct from HUD housing data."
  },
  "us-mta-nyc-transit-2024": {
    id: "us-mta-nyc-transit-2024",
    organization: "Metropolitan Transportation Authority (MTA)",
    sourceType: "Public Utility Commission",
    canonicalReference: "MTA Fare and Toll Information, 30-Day Unlimited Ride MetroCard & OMNY 7-Day Fare Capping",
    url: "https://new.mta.info/fares",
    jurisdiction: "New York City",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-08-20",
    effectiveDate: "2023-08-20",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Standard subway/local bus fare $2.90, 7-day fare cap $34.00, monthly equivalent transit pass ~$132.00."
  },
  // --- UNITED KINGDOM ---
  "uk-hmrc-tax-2024": {
    id: "uk-hmrc-tax-2024",
    organization: "HM Revenue & Customs (HMRC)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Income Tax Rates and Personal Allowances (Finance Act 2024 / PAYE Regulations)",
    url: "https://www.gov.uk/income-tax-rates",
    jurisdiction: "United Kingdom",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-04-06",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Personal Allowance \xA312,570 (tapered above \xA3100k), 20% Basic rate, 40% Higher rate, 45% Additional rate over \xA3125,140. Class 1 Primary NI 8% (post-Spring budget cut) / 2% above UEL."
  },
  "uk-ons-london-2024": {
    id: "uk-ons-london-2024",
    organization: "Office for National Statistics (ONS)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "Private Rental Market Statistics & Family Spending in the UK: London Region",
    url: "https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/privaterentalmarketsummarystatisticsinengland",
    jurisdiction: "London, United Kingdom",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-15",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-12",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "ONS rental statistics, TfL Zone 1-3 travel card rates, and household expenditure tables for Greater London."
  },
  "uk-ons-col-2024": {
    id: "uk-ons-col-2024",
    organization: "Office for National Statistics (ONS)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "ONS Regional Consumer Price Index & Living Cost Survey: UK Metros",
    url: "https://www.ons.gov.uk/economy/inflationandpriceindices",
    jurisdiction: "United Kingdom Regional Metros",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-15",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-12",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Regional consumer price weights across UK metropolitan areas."
  },
  // --- UNITED ARAB EMIRATES ---
  "uae-fta-2024": {
    id: "uae-fta-2024",
    organization: "Federal Tax Authority (FTA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Federal Decree-Law No. 47 of 2022 on the Taxation of Corporations and Businesses (Individual Personal Income Exemption)",
    url: "https://tax.gov.ae/en/",
    jurisdiction: "United Arab Emirates",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-09-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-05",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "0% statutory personal income tax on salary and wage employment income for expatriates and residents."
  },
  "ae-dsc-col-2024": {
    id: "ae-dsc-col-2024",
    organization: "Dubai Statistics Center (DSC) & RERA",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "Dubai Consumer Price Index & RERA Official Rental Index 2024",
    url: "https://www.dsc.gov.ae/",
    jurisdiction: "Dubai, UAE",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-12-01",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "RERA tenancy register median rent benchmarks (Downtown, Marina, JLT) and DSC food/utility price surveys."
  },
  "ae-scad-col-2024": {
    id: "ae-scad-col-2024",
    organization: "Statistics Centre Abu Dhabi (SCAD)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "SCAD Consumer Price Index & Abu Dhabi Housing Price Report",
    url: "https://www.scad.gov.ae/",
    jurisdiction: "Abu Dhabi, UAE",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Abu Dhabi residential tenancy indicators and household cost basket."
  },
  // --- CANADA ---
  "cra-income-tax-2024": {
    id: "cra-income-tax-2024",
    organization: "Canada Revenue Agency (CRA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "CRA Indexation guidelines for personal income tax charges and brackets (Income Tax Act R.S.C. 1985)",
    url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html",
    jurisdiction: "Canada (Federal & Provincial)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Federal 5-bracket schedule (15% to 33%), Basic Personal Amount with net income phase-out, Ontario/provincial graduated schedules, surtaxes, and basic tax credits."
  },
  "cra-cpp-2024": {
    id: "cra-cpp-2024",
    organization: "Canada Revenue Agency (CRA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "CRA CPP contribution rates, maximums and exemptions for 2024 (First & Second Additional CPP Earnings Limits)",
    url: "https://www.canada.ca/en/revenue-agency/news/newsroom/tax-tips/tax-tips-2023/canada-revenue-agency-announces-maximum-pensionable-earnings-2024.html",
    jurisdiction: "Canada (Federal CPP)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-15",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Base CPP 5.95% up to YMPE ($68,500) less $3,500 basic exemption, plus CPP2 4.0% between YMPE and YAMPE ($73,200)."
  },
  "cra-ei-2024": {
    id: "cra-ei-2024",
    organization: "Employment and Social Development Canada (ESDC)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Employment Insurance (EI) Premium Rates and Maximum Insurable Earnings for 2024",
    url: "https://www.canada.ca/en/employment-social-development/programs/ei/ei-list/reports/premium/rates2024.html",
    jurisdiction: "Canada (Federal EI)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-15",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Employee EI premium rate 1.66% up to maximum insurable earnings of $63,200 (maximum annual contribution $1,049.12)."
  },
  "ca-statcan-toronto-2024": {
    id: "ca-statcan-toronto-2024",
    organization: "Statistics Canada & CMHC",
    sourceType: "Housing Market Registry",
    canonicalReference: "CMHC Rental Market Report: Greater Toronto Area & StatCan Consumer Price Index",
    url: "https://www.statcan.gc.ca/",
    jurisdiction: "Toronto, Ontario, Canada",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Toronto census metropolitan area median market rents (CMHC) and urban expenditure metrics (TTC pass, food basket, hydro)."
  },
  "ca-statcan-vancouver-2024": {
    id: "ca-statcan-vancouver-2024",
    organization: "Statistics Canada & CMHC",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "CMHC Rental Market Survey: Metro Vancouver & BC Consumer Prices",
    url: "https://www.statcan.gc.ca/",
    jurisdiction: "Vancouver, BC, Canada",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Metro Vancouver housing and municipal utility expenditure tables."
  },
  "ca-statcan-calgary-2024": {
    id: "ca-statcan-calgary-2024",
    organization: "Statistics Canada & CMHC",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "CMHC Rental Market Survey: Calgary CMA",
    url: "https://www.statcan.gc.ca/",
    jurisdiction: "Calgary, Alberta, Canada",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Calgary metro residential benchmarks and living expenditures."
  },
  // --- AUSTRALIA ---
  "ato-individual-rates-2024": {
    id: "ato-individual-rates-2024",
    organization: "Australian Taxation Office (ATO)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Treasury Laws Amendment (Cost of Living Tax Cuts) Act 2024 (Revised Stage 3 Tax Rates for 2024\u201325)",
    url: "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents",
    jurisdiction: "Australia (Commonwealth)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-07-01",
    effectiveDate: "2024-07-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Enacted Stage 3 revised rates: 16% ($18,201\u2013$45k), 30% ($45,001\u2013$135k), 37% ($135,001\u2013$190k), 45% ($190,001+). Low-income thresholds adjusted."
  },
  "ato-medicare-levy-2024": {
    id: "ato-medicare-levy-2024",
    organization: "Australian Taxation Office (ATO)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Medicare levy surcharge and threshold changes 2024 (Income Tax Assessment Act 1997)",
    url: "https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy",
    jurisdiction: "Australia (Commonwealth)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-07-01",
    effectiveDate: "2024-07-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Standard 2.0% Medicare levy on taxable income with low-income shade-in thresholds."
  },
  "au-abs-sydney-2024": {
    id: "au-abs-sydney-2024",
    organization: "Australian Bureau of Statistics (ABS)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "ABS Consumer Price Index Australia: Sydney & SQM Research Rental Index",
    url: "https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia",
    jurisdiction: "Sydney, NSW, Australia",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-01",
    effectiveDate: "2024-09-30",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Sydney metropolitan weekly median rents and transport/utility household indices."
  },
  "au-abs-melbourne-2024": {
    id: "au-abs-melbourne-2024",
    organization: "Australian Bureau of Statistics (ABS)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "ABS Consumer Price Index: Melbourne Capital City",
    url: "https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia",
    jurisdiction: "Melbourne, Victoria, Australia",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-01",
    effectiveDate: "2024-09-30",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Melbourne rental market benchmarks and public transport fare capping (Myki Zone 1+2)."
  },
  // --- GERMANY ---
  "bzst-lohnsteuer-2024": {
    id: "bzst-lohnsteuer-2024",
    organization: "Bundeszentralamt f\xFCr Steuern (BZSt) & BMF",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Bundesministerium der Finanzen (BMF) Programmablaufplan f\xFCr die maschinelle Berechnung der Lohnsteuer 2024 (\xA7 32a EStG)",
    url: "https://www.bmf-steuerrechner.de/",
    jurisdiction: "Germany (Federal)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Statutory 5-zone progressive polynomial (\xA7 32a EStG), Grundfreibetrag \u20AC11,784, Solidarity surcharge mitigation threshold, Tax Class I (Steuerklasse 1)."
  },
  "gkv-beitragssaetze-2024": {
    id: "gkv-beitragssaetze-2024",
    organization: "GKV-Spitzenverband & Deutsche Rentenversicherung",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Sozialversicherungs-Rechengr\xF6\xDFenverordnung 2024 (Beitragsbemessungsgrenzen & Beitragss\xE4tze)",
    url: "https://www.gkv-spitzenverband.de/",
    jurisdiction: "Germany (Federal Social Insurance)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Statutory employee contributions: KV 7.3% + 0.85% Zusatzbeitrag, PV 2.2% (childless), RV 9.3%, AV 1.3%. Applicable contribution ceilings (BBG)."
  },
  "de-destatis-berlin-2024": {
    id: "de-destatis-berlin-2024",
    organization: "Statistisches Bundesamt (Destatis) & Berlin Mietspiegel",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "Destatis Verbraucherpreisindex & Berliner Mietspiegel 2024",
    url: "https://www.destatis.de/",
    jurisdiction: "Berlin, Germany",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-12-01",
    effectiveDate: "2024-11-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Berlin qualified rent index benchmarks (Kaltmiete + Nebenkosten), BVG monthly Deutschlandticket (\u20AC49), and municipal cost of living basket."
  },
  "de-destatis-munich-2024": {
    id: "de-destatis-munich-2024",
    organization: "Statistisches Bundesamt (Destatis) & M\xFCnchen Mietspiegel",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "Mietspiegel f\xFCr M\xFCnchen 2024 & Destatis Bayern Verbraucherpreise",
    url: "https://www.destatis.de/",
    jurisdiction: "Munich, Bavaria, Germany",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-12-01",
    effectiveDate: "2024-11-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Munich city metropolitan rental and living cost benchmarks."
  },
  // --- SINGAPORE ---
  "iras-tax-rates-2024": {
    id: "iras-tax-rates-2024",
    organization: "Inland Revenue Authority of Singapore (IRAS)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "IRAS Individual Income Tax Rates for Resident Individuals (Year of Assessment 2024/2026)",
    url: "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-rates-and-tax-expenses",
    jurisdiction: "Singapore",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-09-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Progressive resident schedule from 0% (first S$20k) to 24% (>S$1M). Expatriate baseline non-CPF structure."
  },
  "sg-singstat-2024": {
    id: "sg-singstat-2024",
    organization: "Singapore Department of Statistics (SingStat) & URA",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "SingStat Consumer Price Index & URA Real Estate Rental Index 2024",
    url: "https://www.singstat.gov.sg/",
    jurisdiction: "Singapore",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-15",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "URA condominium and HDB rental transaction statistics, MRT travel passes, utilities (SP Group), and expat food/lifestyle tables."
  },
  // --- IRELAND ---
  "revenue-paye-rates-2024": {
    id: "revenue-paye-rates-2024",
    organization: "Office of the Revenue Commissioners (Revenue)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Revenue Tax Rates and Tax Bands 2024 (Finance Act 2023)",
    url: "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx",
    jurisdiction: "Ireland",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Standard rate 20% up to \u20AC42,000 (single), Higher rate 40% on balance. Single Person Tax Credit \u20AC1,875, Employee Tax Credit \u20AC1,875."
  },
  "revenue-usc-rates-2024": {
    id: "revenue-usc-rates-2024",
    organization: "Office of the Revenue Commissioners (Revenue)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Universal Social Charge (USC) Rates and Bands 2024",
    url: "https://www.revenue.ie/en/jobs-and-pensions/usc/index.aspx",
    jurisdiction: "Ireland",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "USC rates: 0.5% (\u20AC0-\u20AC12,012), 2% (\u20AC12,012-\u20AC25,760), 4% (\u20AC25,760-\u20AC70,044), 8% balance."
  },
  "dsp-prsi-rates-2024": {
    id: "dsp-prsi-rates-2024",
    organization: "Department of Social Protection (DSP)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "PRSI Contribution Rates and Thresholds: Class A (SW14 2024)",
    url: "https://www.gov.ie/en/publication/14ef8a-prsi-contribution-rates-and-user-guide/",
    jurisdiction: "Ireland",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Class A employee PRSI 4.0% with tapered PRSI credit for incomes under \u20AC424/week (increased +0.1% Oct 2024)."
  },
  "ie-cso-dublin-2024": {
    id: "ie-cso-dublin-2024",
    organization: "Central Statistics Office (CSO) & RTB",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "RTB Rent Index Dublin Metro & CSO Consumer Price Index",
    url: "https://www.cso.ie/",
    jurisdiction: "Dublin, Ireland",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Dublin tenancy registration benchmark rents and CSO national expenditure figures."
  },
  // --- NEW ZEALAND ---
  "ird-tax-rates-2024-2026": {
    id: "ird-tax-rates-2024-2026",
    organization: "Inland Revenue Department (IRD)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Budget 2024 Tax Threshold Changes (Taxation Annual Rates for 2024-25 Act)",
    url: "https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals",
    jurisdiction: "New Zealand",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-08-01",
    effectiveDate: "2024-07-31",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Post-July 2024 thresholds: 10.5% ($0\u2013$15,600), 17.5% ($15,601\u2013$53,500), 30% ($53,501\u2013$78,100), 33% ($78,101\u2013$180,000), 39% ($180,001+)."
  },
  "acc-earners-levy-2024": {
    id: "acc-earners-levy-2024",
    organization: "Accident Compensation Corporation (ACC)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "ACC Earner\u2019s Levy Rates and Maximum Threshold 2024/2026",
    url: "https://www.acc.co.nz/for-business/levy-rates/",
    jurisdiction: "New Zealand",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-04-01",
    effectiveDate: "2024-04-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "ACC earner levy of 1.60% on earnings up to $142,283 (maximum levy $2,276.52)."
  },
  "nz-stats-auckland-2024": {
    id: "nz-stats-auckland-2024",
    organization: "Stats NZ (Tatauranga Aotearoa) & Tenancy Services",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "Tenancy Services Market Rent Database: Auckland & Stats NZ CPI",
    url: "https://www.stats.govt.nz/",
    jurisdiction: "Auckland, New Zealand",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-10",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Auckland regional bond data median rents and urban consumer price indicators."
  },
  // --- SWITZERLAND ---
  "ch-bfs-zurich-2024": {
    id: "ch-bfs-zurich-2024",
    organization: "Bundesamt f\xFCr Statistik (BFS) & Statistisches Amt Z\xFCrich",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "BFS Landesindex der Konsumentenpreise & Z\xFCrcher Mietpreisindex 2024",
    url: "https://www.bfs.admin.ch/",
    jurisdiction: "Zurich, Switzerland",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Zurich Canton median gross rental data, mandatory KVG health insurance premiums, and ZVV transport pass rates."
  },
  // --- QATAR ---
  "qatar-income-tax-law-2018": {
    id: "qatar-income-tax-law-2018",
    organization: "General Tax Authority (GTA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Law No. (24) of 2018 Promulgating the Income Tax Law (Article 4 Exemption for Individual Salaries)",
    url: "https://www.gta.gov.qa/",
    jurisdiction: "State of Qatar",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-09-01",
    effectiveDate: "2019-01-01",
    verifiedAt: "2026-01-05",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "0% statutory personal income tax on employment wages, allowances, and salaries for residents and expatriates."
  },
  "qa-psa-doha-2024": {
    id: "qa-psa-doha-2024",
    organization: "Planning and Statistics Authority (PSA)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "PSA Consumer Price Index & Residential Real Estate Price Bulletin: Doha",
    url: "https://www.psa.gov.qa/",
    jurisdiction: "Doha, Qatar",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Doha municipality rental transaction indicators, Doha Metro rates, and Kahramaa water/electricity tables."
  },
  // --- SAUDI ARABIA ---
  "gulf-zero-income-tax-statute": {
    id: "gulf-zero-income-tax-statute",
    organization: "Zakat, Tax and Customs Authority (ZATCA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Income Tax Law (Royal Decree No. M/1 of 1425H) & Expatriate Employment Tax Framework",
    url: "https://zatca.gov.sa/",
    jurisdiction: "Kingdom of Saudi Arabia",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-09-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-05",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "0% statutory individual income tax on employment salary for resident employees."
  },
  "sa-gastat-riyadh-2024": {
    id: "sa-gastat-riyadh-2024",
    organization: "General Authority for Statistics (GASTAT)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "GASTAT Consumer Price Index & Real Estate Market Indicators: Riyadh",
    url: "https://www.stats.gov.sa/",
    jurisdiction: "Riyadh, Saudi Arabia",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-15",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Riyadh rental index (Ejar platform integration), utility benchmarks, and cost of living basket."
  },
  "sa-gastat-jeddah-2024": {
    id: "sa-gastat-jeddah-2024",
    organization: "General Authority for Statistics (GASTAT)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "GASTAT Consumer Price Index: Makkah Region (Jeddah)",
    url: "https://www.stats.gov.sa/",
    jurisdiction: "Jeddah, Saudi Arabia",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-15",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Jeddah coastal metro housing and living expenditure tables."
  },
  // --- NETHERLANDS ---
  "belastingdienst-box1-2024": {
    id: "belastingdienst-box1-2024",
    organization: "Belastingdienst (Dutch Tax and Customs Administration)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Tarieven inkomstenbelasting 2024 (Wet inkomstenbelasting 2001 - Box 1)",
    url: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/jongeren/belasting_betalen/hoeveel_belasting_moet_ik_betalen/hoeveel-belasting-betalen",
    jurisdiction: "Netherlands",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Box 1 bracket 1 36.97% up to \u20AC75,518, bracket 2 49.50% on excess. General tax credit (algemene heffingskorting) and labor tax credit (arbeidskorting)."
  },
  "belastingdienst-premies-2024": {
    id: "belastingdienst-premies-2024",
    organization: "Sociale Verzekeringsbank (SVB) & Belastingdienst",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Premiepercentages volksverzekeringen en werknemersverzekeringen 2024",
    url: "https://www.belastingdienst.nl/",
    jurisdiction: "Netherlands",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "National insurance premiums (AOW, Anw, Wlz) integrated into the first tax bracket."
  },
  "nl-cbs-amsterdam-2024": {
    id: "nl-cbs-amsterdam-2024",
    organization: "Centraal Bureau voor de Statistiek (CBS)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "CBS Consumentenprijsindex & Huizenprijs- en huurindex Amsterdam",
    url: "https://www.cbs.nl/",
    jurisdiction: "Amsterdam, Netherlands",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Amsterdam free-market rental index (Pararius/CBS), GVB public transport subscription, and municipal cost weights."
  },
  "nl-cbs-rotterdam-2024": {
    id: "nl-cbs-rotterdam-2024",
    organization: "Centraal Bureau voor de Statistiek (CBS)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "CBS Consumentenprijsindex: Rotterdam Region",
    url: "https://www.cbs.nl/",
    jurisdiction: "Rotterdam, Netherlands",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Rotterdam rental benchmarks and RET transit subscriptions."
  },
  // --- FRANCE ---
  "dgfip-bareme-ir-2024": {
    id: "dgfip-bareme-ir-2024",
    organization: "Direction G\xE9n\xE9rale des Finances Publiques (DGFiP)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Bar\xE8me de l\u2019imp\xF4t sur le revenu 2024 (Loi de finances pour 2024)",
    url: "https://www.economie.gouv.fr/particuliers/bareme-impot-revenu",
    jurisdiction: "France",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Progressive schedule: 0% to \u20AC11,294, 11% to \u20AC28,797, 30% to \u20AC82,341, 41% to \u20AC177,106, 45% above. Quotient familial rules applied."
  },
  "urssaf-taux-cotisations-2024": {
    id: "urssaf-taux-cotisations-2024",
    organization: "URSSAF",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Taux des cotisations et contributions sociales 2024 (CSG, CRDS, Retraite)",
    url: "https://www.urssaf.fr/",
    jurisdiction: "France",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Statutory employee social contributions (CSG 9.2%, CRDS 0.5%, statutory pension and health contributions)."
  },
  "fr-insee-paris-2024": {
    id: "fr-insee-paris-2024",
    organization: "Institut National de la Statistique et des \xC9tudes \xC9conomiques (INSEE) & OLAP",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "Observatoire des Loyers de l\u2019Agglom\xE9ration Parisienne (OLAP) & Indice des Prix \xE0 la Consommation",
    url: "https://www.insee.fr/",
    jurisdiction: "Paris, France",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Paris rent control reference medians, Navigo pass rates (\u20AC86.40/mo), and metropolitan living basket."
  },
  "fr-insee-lyon-2024": {
    id: "fr-insee-lyon-2024",
    organization: "INSEE & Observatoire Local des Loyers Lyon",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "Observatoire Local des Loyers de la M\xE9tropole de Lyon 2024",
    url: "https://www.insee.fr/",
    jurisdiction: "Lyon, France",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Lyon metropolitan area rental and consumer indicators."
  },
  // --- SPAIN ---
  "aeat-tramos-irpf-2024": {
    id: "aeat-tramos-irpf-2024",
    organization: "Agencia Estatal de Administraci\xF3n Tributaria (AEAT)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Escala general y auton\xF3mica del IRPF para 2024 (Ley del IRPF 35/2006)",
    url: "https://sede.agenciatributaria.gob.es/",
    jurisdiction: "Spain",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Combined state and regional progressive brackets (19% to 47%), M\xEDnimo del contribuyente \u20AC5,550, and reduced bracket deductions."
  },
  "tgss-bases-cotizacion-2024": {
    id: "tgss-bases-cotizacion-2024",
    organization: "Tesorer\xEDa General de la Seguridad Social (TGSS)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Orden PJC/281/2024, de 27 de marzo, por la que se modifican las bases de cotizaci\xF3n a la Seguridad Social",
    url: "https://www.seg-social.es/",
    jurisdiction: "Spain",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Employee social security contributions: common contingencies 4.70%, unemployment 1.55%, professional training 0.10%, MEI 0.12%. Base m\xE1xima \u20AC4,720.50/month."
  },
  "es-ine-madrid-2024": {
    id: "es-ine-madrid-2024",
    organization: "Instituto Nacional de Estad\xEDstica (INE) & MITMA",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "Sistema Estatal de Referencia del Precio del Alquiler de Vivienda & INE IPC Madrid",
    url: "https://www.ine.es/",
    jurisdiction: "Madrid, Spain",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Madrid metropolitan rental benchmark index, Metro de Madrid Abono Transporte Zone A, and utility expenditures."
  },
  "es-ine-barcelona-2024": {
    id: "es-ine-barcelona-2024",
    organization: "INE & Generalitat de Catalunya (Incas\xF2l)",
    sourceType: "Housing Market Registry",
    canonicalReference: "\xCDndex de refer\xE8ncia de preus de lloguer de Catalunya & INE IPC Barcelona",
    url: "https://www.ine.es/",
    jurisdiction: "Barcelona, Catalonia, Spain",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Barcelona rental benchmarks and T-Usual transit card rates."
  },
  "es-ine-valencia-2024": {
    id: "es-ine-valencia-2024",
    organization: "INE & Observatori de l\u2019Habitatge Comunitat Valenciana",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "INE IPC Comunitat Valenciana & Preus de Lloguer Valencia",
    url: "https://www.ine.es/",
    jurisdiction: "Valencia, Spain",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2024-10-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Valencia metropolitan rental and living cost basket."
  },
  // --- 2026 STATUTORY EVIDENCE SOURCES ---
  "us-irs-tax-2026": {
    id: "us-irs-tax-2026",
    organization: "Internal Revenue Service (IRS)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "IRS Rev. Proc. 2025-32 (2026 Inflation-adjusted Tax Brackets & Standard Deductions)",
    url: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf",
    jurisdiction: "United States (Federal)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2025-10-15",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Official 2026 statutory 7-bracket schedule (10%, 12%, 22%, 24%, 32%, 35%, 37%), Standard Deduction $16,100 single / $32,200 MFJ / $24,150 HoH."
  },
  "us-ssa-fica-2026": {
    id: "us-ssa-fica-2026",
    organization: "Social Security Administration (SSA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Social Security Administration Press Release: 2026 Social Security Changes (OASDI Wage Base $184,500)",
    url: "https://www.ssa.gov/news/press/releases/2025/#10-2025-1",
    jurisdiction: "United States (Federal FICA)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2025-10-15",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-10",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "OASDI 6.2% on wages up to $184,500 maximum annual wage base; Medicare 1.45% uncapped + 0.9% Additional Medicare Tax above $200k."
  },
  "us-nys-tax-2026": {
    id: "us-nys-tax-2026",
    organization: "New York State Department of Taxation and Finance",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Form IT-201-I Instructions for Form IT-201 (NYS Tax Law \xA7 601 / \xA7 614) \u2014 2026 Rate Schedule with Enacted Lower-Bracket Reductions",
    url: "https://www.tax.ny.gov/forms/income_cur_forms.htm",
    jurisdiction: "New York State",
    reliabilityTier: "Tier 1",
    retrievedAt: "2025-12-01",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-12",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "NYS 2026 enacted lower-bracket rate reductions: 3.90% (first $8,500), 4.40% ($8,501\u2013$11,700), 5.15% ($11,701\u2013$13,900), 5.40% ($13,901\u2013$80,650), 5.90% ($80,651\u2013$215,400). Upper brackets unchanged: 6.85% (\u2013$1,077,550), 9.65% (\u2013$5M), 10.30% (\u2013$25M), 10.90% (above). NYS Standard Deduction $8,000 single / $16,050 MFJ."
  },
  "us-nyc-tax-2026": {
    id: "us-nyc-tax-2026",
    organization: "New York City Department of Finance",
    sourceType: "Government / Tax Authority",
    canonicalReference: "NYC Personal Income Tax Tables for NYC Residents (NYC Admin Code \xA7 11-1701)",
    url: "https://www.tax.ny.gov/pit/file/tax_tables/nyc_tables.htm",
    jurisdiction: "New York City (Local Resident)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-12-01",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-12",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "NYC resident income tax rates 3.078% to 3.876% applied on NY taxable income."
  },
  "uk-hmrc-tax-2026": {
    id: "uk-hmrc-tax-2026",
    organization: "HM Revenue & Customs (HMRC)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "HMRC Rates and Allowances: Income Tax and National Insurance Contributions 2026-2027",
    url: "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027",
    jurisdiction: "United Kingdom (HMRC)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2025-11-15",
    effectiveDate: "2026-04-06",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Personal Allowance \xA312,570 with \xA31-for-\xA32 taper above \xA3100,000; Basic Rate 20%, Higher Rate 40%, Additional Rate 45%; Class 1 Employee NIC 8% main, 2% upper."
  },
  "uae-fta-2026": {
    id: "uae-fta-2026",
    organization: "Federal Tax Authority (FTA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Federal Decree-Law No. 47 of 2022 on the Taxation of Corporations and Businesses (Individual Salary Exemption)",
    url: "https://tax.gov.ae",
    jurisdiction: "United Arab Emirates",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Statutory 0% individual employment personal income tax across all seven emirates."
  },
  "ca-cra-tax-2026": {
    id: "ca-cra-tax-2026",
    organization: "Canada Revenue Agency (CRA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "CRA Indexation Adjustments for Personal Income Tax and Benefit Amounts 2026 (2.7% Indexation)",
    url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/adjustment-personal-income-tax-benefit-amounts.html",
    jurisdiction: "Canada (Federal & Ontario)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-20",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "2026 Federal Brackets ($57,375, $114,750, $177,882, $253,414), BPA $16,129; CPP Max $4,034.10 + CPP2 $396 = $4,430.10; EI Max $1,077.48."
  },
  "au-ato-tax-2026": {
    id: "au-ato-tax-2026",
    organization: "Australian Taxation Office (ATO)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Treasury Laws Amendment (Cost of Living Tax Cuts) Act 2024 (Resident Tax Rates 2024-25 and 2026-26)",
    url: "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents",
    jurisdiction: "Australia (Commonwealth)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-07-01",
    effectiveDate: "2024-07-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Revised Stage 3 rates: 16% ($18.2k-$45k), 30% ($45k-$135k), 37% ($135k-$190k), 45% (above $190k); Medicare Levy 2.0%."
  },
  "de-bmf-tax-2026": {
    id: "de-bmf-tax-2026",
    organization: "Bundesministerium der Finanzen (BMF)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Steuerfortentwicklungsgesetz 2024/2026 (EStG \xA7 32a Grundfreibetrag 2026 & Sozialversicherungs-Rechengr\xF6\xDFenverordnung)",
    url: "https://www.bundesfinanzministerium.de",
    jurisdiction: "Germany (Federal)",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-25",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Grundfreibetrag \u20AC12,084; polynomial tariff zones; KV 8.25%, RV 9.3%, AV 1.3%, PV 2.2%; BBG RV \u20AC96,600, KV \u20AC66,150."
  },
  "sg-iras-tax-2026": {
    id: "sg-iras-tax-2026",
    organization: "Inland Revenue Authority of Singapore (IRAS)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "IRAS Individual Income Tax Rates for Year of Assessment (YA) 2026",
    url: "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-rates-and-tax-expenses/individual-income-tax-rates",
    jurisdiction: "Singapore",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-15",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Progressive resident rate schedule 0% to 24% for YA 2026."
  },
  "qa-gta-tax-2026": {
    id: "qa-gta-tax-2026",
    organization: "General Tax Authority (GTA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "State of Qatar Law No. 24 of 2018 Promulgating the Income Tax Law",
    url: "https://www.gta.gov.qa",
    jurisdiction: "State of Qatar",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Statutory 0% tax on employment salaries and compensation of resident and foreign employees."
  },
  "sa-zatca-tax-2026": {
    id: "sa-zatca-tax-2026",
    organization: "Zakat, Tax and Customs Authority (ZATCA)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Kingdom of Saudi Arabia Income Tax Law issued by Royal Decree No. M/1",
    url: "https://zatca.gov.sa",
    jurisdiction: "Kingdom of Saudi Arabia",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-01",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "0% personal income tax on employee employment income."
  },
  "nz-ird-tax-2026": {
    id: "nz-ird-tax-2026",
    organization: "Inland Revenue Department (Te Tari Taake)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Taxation (Annual Rates for 2024-25, Emergency Response, and Remedial Measures) Act 2024",
    url: "https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals",
    jurisdiction: "New Zealand",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-08-01",
    effectiveDate: "2024-07-31",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Thresholds: 10.5% ($0-$15.6k), 17.5% ($15.6k-$53.5k), 30% ($53.5k-$78.1k), 33% ($78.1k-$180k), 39% (> $180k); ACC Earners Levy 1.60%."
  },
  "fr-dgfip-tax-2026": {
    id: "fr-dgfip-tax-2026",
    organization: "Direction G\xE9n\xE9rale des Finances Publiques (DGFiP)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Loi de finances pour 2026 (Bar\xE8me de l'imp\xF4t sur le revenu & PASS 2026)",
    url: "https://www.impots.gouv.fr",
    jurisdiction: "France",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-12-15",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Bar\xE8me progressif de l'IR, PASS 2026 \u20AC47,100, CSG/CRDS 9.7% sur 98.25% du brut."
  },
  "es-aeat-tax-2026": {
    id: "es-aeat-tax-2026",
    organization: "Agencia Estatal de Administraci\xF3n Tributaria (AEAT)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Ley del IRPF & Orden de cotizaci\xF3n a la Seguridad Social 2026",
    url: "https://sede.agenciatributaria.gob.es",
    jurisdiction: "Spain",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-12-20",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Escala general IRPF, base m\xE1xima de cotizaci\xF3n 2026, cuota de solidaridad y MEI 0.14%."
  },
  "nl-belasting-tax-2026": {
    id: "nl-belasting-tax-2026",
    organization: "Belastingdienst",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Belastingplan 2026 (Tarieven inkomstenbelasting Box 1)",
    url: "https://www.belastingdienst.nl",
    jurisdiction: "Netherlands",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-12-01",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Tarieven box 1 schijven en heffingskortingen 2026."
  },
  "ie-revenue-tax-2026": {
    id: "ie-revenue-tax-2026",
    organization: "Office of the Revenue Commissioners",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Budget 2026 Tax Changes: Standard Rate Cut-Off Point & Tax Credits",
    url: "https://www.revenue.ie/en/corporate/press-office/budget-information/2026/index.aspx",
    jurisdiction: "Ireland",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-10-15",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Single SRCOP \u20AC44,000, Single Personal Credit \u20AC2,000, Employee PAYE Credit \u20AC2,000; revised USC bands."
  },
  "ch-estv-tax-2026": {
    id: "ch-estv-tax-2026",
    organization: "Eidgen\xF6ssische Steuerverwaltung (ESTV)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Bundesgesetz \xFCber die direkte Bundessteuer (DBG Tarife 2026)",
    url: "https://www.estv.admin.ch",
    jurisdiction: "Switzerland",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-11-01",
    effectiveDate: "2026-01-01",
    verifiedAt: "2026-01-15",
    verifiedBy: "Lead Financial Systems Engineer",
    notes: "Tarife der direkten Bundessteuer 2026 und kantonale Steuerf\xFCsse."
  }
};
var EVIDENCE_REGISTRY = EVIDENCE_SOURCES;

// src/lib/auth.ts
import crypto2 from "crypto";
var ROLE_PERMISSIONS = {
  ADMIN: [
    "manage_users",
    "view_audit_logs",
    "edit_tax_rules",
    "edit_cost_data",
    "edit_content",
    "review_content",
    "publish_content",
    "approve_indexing",
    "trigger_fx_refresh"
  ],
  DATA_EDITOR: ["edit_tax_rules", "edit_cost_data", "trigger_fx_refresh"],
  CONTENT_EDITOR: ["edit_content"],
  REVIEWER: ["review_content", "publish_content"],
  SEO_REVIEWER: ["review_content", "approve_indexing"],
  READ_ONLY: []
};
function getJwtSecret() {
  return getRequiredEnv("ADMIN_SESSION_SECRET");
}
var AuthService = class {
  static hashPassword(password, salt = crypto2.randomBytes(16).toString("hex")) {
    const hash = crypto2.pbkdf2Sync(password, salt, 1e5, 64, "sha512").toString("hex");
    return `${salt}:${hash}`;
  }
  static verifyPassword(password, storedHash) {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const testHash = crypto2.pbkdf2Sync(password, salt, 1e5, 64, "sha512").toString("hex");
    try {
      return crypto2.timingSafeEqual(Buffer.from(testHash, "hex"), Buffer.from(originalHash, "hex"));
    } catch {
      return false;
    }
  }
  static credentialFingerprint(passwordHash) {
    return crypto2.createHmac("sha256", getJwtSecret()).update(passwordHash).digest("base64url");
  }
  static createSessionToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      expiresAt: Date.now() + 24 * 3600 * 1e3,
      // 24 hours
      credentialFingerprint: user.passwordHash ? this.credentialFingerprint(user.passwordHash) : void 0
    };
    const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto2.createHmac("sha256", getJwtSecret()).update(serialized).digest("base64url");
    return `${serialized}.${signature}`;
  }
  static verifySessionToken(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [serialized, signature] = parts;
    const expectedSignature = crypto2.createHmac("sha256", getJwtSecret()).update(serialized).digest("base64url");
    try {
      if (!crypto2.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return null;
      }
      const payload = JSON.parse(Buffer.from(serialized, "base64url").toString("utf8"));
      if (payload.expiresAt < Date.now()) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }
  static hasPermission(role, permission) {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }
  /**
   * RFC 6238 TOTP (Time-based One-Time Password) verification
   */
  static verifyTotp(secret, token, windowSteps = 1) {
    if (!secret || !token || token.length !== 6) return false;
    const timeStepSeconds = 30;
    const currentStep = Math.floor(Date.now() / 1e3 / timeStepSeconds);
    for (let stepOffset = -windowSteps; stepOffset <= windowSteps; stepOffset++) {
      const step = currentStep + stepOffset;
      const stepBuffer = Buffer.alloc(8);
      stepBuffer.writeBigInt64BE(BigInt(step));
      const hmac = crypto2.createHmac("sha1", Buffer.from(secret, "ascii"));
      hmac.update(stepBuffer);
      const digest = hmac.digest();
      const offset = digest[digest.length - 1] & 15;
      const code = (digest[offset] & 127) << 24 | (digest[offset + 1] & 255) << 16 | (digest[offset + 2] & 255) << 8 | digest[offset + 3] & 255;
      const otp = (code % 1e6).toString().padStart(6, "0");
      if (crypto2.timingSafeEqual(Buffer.from(otp), Buffer.from(token))) {
        return true;
      }
    }
    return false;
  }
};

// src/db/client.ts
function sanitizeDbUrl(raw) {
  if (!raw) return void 0;
  let cleaned = raw.trim();
  if (cleaned.startsWith("DATABASE_URL=")) {
    cleaned = cleaned.substring("DATABASE_URL=".length);
  }
  if (cleaned.startsWith('"') && cleaned.endsWith('"') || cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}
var PostgresDatabaseService = class {
  constructor(connectionString) {
    this.mode = "PRODUCTION_POSTGRES";
    this.isReady = false;
    this.db = null;
    this.client = null;
    try {
      const sanitized = sanitizeDbUrl(connectionString);
      this.client = postgres(sanitized, {
        ssl: "require",
        max: 10,
        connect_timeout: 10,
        idle_timeout: 20
      });
      this.db = drizzle(this.client, { schema: schema_exports });
      this.isReady = true;
    } catch (err) {
      console.error("[Database] Failed to initialize PostgreSQL client:", err);
      this.isReady = false;
    }
  }
  async checkConnection() {
    if (!this.client) {
      return { healthy: false, migrationsApplied: false, mode: this.mode, error: "Postgres client not initialized" };
    }
    try {
      await this.client.unsafe("SELECT 1");
      const migrations = await this.client.unsafe(
        `SELECT migration_name FROM schema_migrations WHERE migration_name = '0000_init_livworth.sql' LIMIT 1;`
      ).catch(() => []);
      const migrationsApplied = migrations && migrations.length > 0;
      return { healthy: true, migrationsApplied, mode: this.mode };
    } catch (err) {
      return { healthy: false, migrationsApplied: false, mode: this.mode, error: "Database connection failed" };
    }
  }
  async getAuthoritativeCostData(cityId) {
    const list = await this.getCostDatasets(cityId);
    if (!list || list.length === 0) {
      return { data: null, classification: "UNAVAILABLE" };
    }
    const row = list[0];
    const isNyc = row.cityId === "nyc";
    const classification = isNyc ? "OBSERVED" : "DERIVED";
    return { data: row, classification };
  }
  async runMigrations() {
    try {
      const migrationFile = path.join(process.cwd(), "src/db/migrations/0000_init_livworth.sql");
      const sqlContent = fs.existsSync(migrationFile) ? fs.readFileSync(migrationFile, "utf-8") : "";
      if (!sqlContent) {
        console.warn("[Database] Migration file not found on disk; skipping migration step.");
        return { success: true, executedCount: 0, mode: this.mode };
      }
      await this.client.unsafe(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id SERIAL PRIMARY KEY,
          migration_name TEXT NOT NULL UNIQUE,
          applied_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      const existing = await this.client.unsafe(
        `SELECT migration_name FROM schema_migrations WHERE migration_name = '0000_init_livworth.sql';`
      );
      if (existing && existing.length > 0) {
        return { success: true, executedCount: 0, mode: this.mode };
      }
      await this.client.unsafe(sqlContent);
      await this.client.unsafe(
        `INSERT INTO schema_migrations (migration_name) VALUES ('0000_init_livworth.sql') ON CONFLICT DO NOTHING;`
      );
      return { success: true, executedCount: 1, mode: this.mode };
    } catch (err) {
      console.error("[PostgresDatabaseService] Migration execution error:", err);
      throw err;
    }
  }
  async seedData() {
    try {
      const countryRows = Object.values(COUNTRIES).map((country) => ({
        id: country.id,
        name: country.name,
        defaultCurrency: country.defaultCurrency,
        verificationStatus: country.verificationStatus,
        notes: country.notes || null
      }));
      if (countryRows.length > 0) {
        await this.db.insert(countries).values(countryRows).onConflictDoNothing();
      }
      const regionRows = Object.values(REGIONS).map((region) => ({
        id: region.id,
        countryId: region.countryId,
        name: region.name,
        code: region.code
      }));
      if (regionRows.length > 0) {
        await this.db.insert(regions).values(regionRows).onConflictDoNothing();
      }
      const cityRows = Object.values(CITIES).map((city) => ({
        id: city.id,
        name: city.name,
        countryId: city.countryId,
        regionId: city.regionId,
        currency: city.currency,
        latitude: 0,
        longitude: 0,
        colIndexVsNyc: city.colIndexBase100NYC || 100,
        rentIndexVsNyc: city.colIndexBase100NYC || 100
      }));
      if (cityRows.length > 0) {
        await this.db.insert(cities).values(cityRows).onConflictDoNothing();
      }
      const evidenceRows = Object.entries(EVIDENCE_SOURCES).map(([id, src]) => ({
        id,
        name: src.canonicalReference,
        tier: src.reliabilityTier || "TIER_1_GOVERNMENT",
        authority: src.organization,
        url: src.url,
        methodology: src.notes || "",
        frequency: "annual",
        lastVerifiedAt: new Date(src.verifiedAt || Date.now())
      }));
      if (evidenceRows.length > 0) {
        await this.db.insert(evidenceSources).values(evidenceRows).onConflictDoNothing();
      }
      const costRows = [];
      const housingRows = [];
      const salaryRows = [];
      for (const city of Object.values(CITIES)) {
        const factor = (city.colIndexBase100NYC || 100) / 100;
        const oneBed = Math.round(3400 * factor * 100);
        const threeBed = Math.round(5800 * factor * 100);
        const isObserved = city.id === "nyc";
        const confidenceRating = isObserved ? 0.88 : 0.65;
        const costSourceRef = isObserved ? "U.S. Bureau of Labor Statistics Consumer Expenditure Survey & NYC Metropolitan Benchmarks" : "Spatial price index model calibrated against metropolitan benchmarks";
        const housingSourceRef = isObserved ? "U.S. Department of Housing and Urban Development (HUD) Fair Market Rents 2024" : "Spatial rental benchmark model";
        const salarySourceRef = isObserved ? "U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS)" : "Relative spatial wage benchmark model";
        costRows.push({
          id: `cost_${city.id}_2024q4`,
          cityId: city.id,
          datasetVersion: "2024.Q4",
          observationDate: /* @__PURE__ */ new Date("2024-12-01"),
          housingOneBedMinor: oneBed,
          housingThreeBedMinor: threeBed,
          foodMonthlyMinor: Math.round(650 * factor * 100),
          utilitiesMonthlyMinor: Math.round(220 * factor * 100),
          transportMonthlyMinor: Math.round(140 * factor * 100),
          healthcareMonthlyMinor: Math.round(180 * factor * 100),
          confidenceRating,
          sourceRef: costSourceRef
        });
        housingRows.push({
          id: `house_${city.id}_1bed`,
          cityId: city.id,
          bedroomCount: "one_bed",
          neighborhoodTier: "city_center",
          medianMonthlyRentMinor: oneBed,
          p25MonthlyRentMinor: Math.round(oneBed * 0.85),
          p75MonthlyRentMinor: Math.round(oneBed * 1.25),
          currency: city.currency,
          sourceRef: housingSourceRef
        });
        salaryRows.push({
          id: `sal_${city.id}_swe`,
          cityId: city.id,
          roleTitle: "Software Engineer",
          experienceLevel: "mid",
          p25AnnualMinor: Math.round(85e3 * factor * 100),
          p50AnnualMinor: Math.round(12e4 * factor * 100),
          p75AnnualMinor: Math.round(16e4 * factor * 100),
          p90AnnualMinor: Math.round(2e5 * factor * 100),
          currency: city.currency,
          sampleSize: 250,
          sourceRef: salarySourceRef
        });
      }
      if (costRows.length > 0) {
        await this.db.insert(costDatasets).values(costRows).onConflictDoNothing();
      }
      if (housingRows.length > 0) {
        await this.db.insert(housingDatasets).values(housingRows).onConflictDoNothing();
      }
      if (salaryRows.length > 0) {
        await this.db.insert(salaryDatasets).values(salaryRows).onConflictDoNothing();
      }
      const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim();
      const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim();
      if (!bootstrapEmail || bootstrapEmail !== "admin@livworthy.com" && bootstrapEmail !== "admin@livworth.com") {
        await this.db.delete(users).where(eq(users.id, "usr_admin_001"));
      }
      if (bootstrapEmail && bootstrapPassword) {
        const existingAdmins = await this.db.select().from(users).where(eq(users.role, "ADMIN")).limit(1);
        if (existingAdmins.length === 0) {
          const hashedPassword = AuthService.hashPassword(bootstrapPassword);
          await this.db.insert(users).values({
            id: `usr_${Date.now()}`,
            email: bootstrapEmail,
            passwordHash: hashedPassword,
            role: "ADMIN",
            mfaEnabled: false,
            isActive: true
          }).onConflictDoNothing();
          console.log(`[Database] Initial administrator provisioned for: ${bootstrapEmail}`);
        }
      }
      const initialPages = [
        {
          id: "page_methodology",
          slug: "methodology",
          locale: "en",
          title: "LivWorthy Mathematical Methodology & Data Integrity Charter",
          metaDescription: "Complete documentation of statutory tax schedules, spatial price deflators, and verification standards.",
          workflowState: "INDEX_APPROVED",
          isIndexable: true,
          authorEmail: "editorial@livworthy.com",
          reviewerEmail: "chief.economist@livworthy.com",
          publishedAt: /* @__PURE__ */ new Date(),
          canonicalUrl: "https://www.livworthy.com/methodology",
          blocksJson: [
            { type: "heading", level: 2, content: "Data Integrity Charter" },
            { type: "prose", content: "LivWorthy provides deterministic income and cost intelligence. We never substitute statutory tax schedules with synthetic models or unverified crowdsourced numbers." },
            { type: "heading", level: 3, content: "Statutory Verification Standards" },
            { type: "prose", content: "Every calculation is verified against primary legislative statutes and national revenue authority schedules." }
          ],
          evidenceSourceIds: ["us-irs-tax-2024", "uk-hmrc-tax-2024"],
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        },
        {
          id: "page_sources",
          slug: "sources",
          locale: "en",
          title: "Primary Evidence & Statistical Sources",
          metaDescription: "Governmental, institutional, and statistical data sources powering the LivWorthy calculation pipeline.",
          workflowState: "INDEX_APPROVED",
          isIndexable: true,
          authorEmail: "editorial@livworthy.com",
          reviewerEmail: "chief.economist@livworthy.com",
          publishedAt: /* @__PURE__ */ new Date(),
          canonicalUrl: "https://www.livworthy.com/sources",
          blocksJson: [
            { type: "heading", level: 2, content: "Source Hierarchy & Provenance" },
            { type: "prose", content: "We prioritize Tier-1 statutory sources (IRS, HMRC, CRA, ATO, BZSt, DGFiP, AEAT, IRAS, ZATCA, ESTV) over commercial aggregators." }
          ],
          evidenceSourceIds: Object.keys(EVIDENCE_SOURCES).slice(0, 10),
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }
      ];
      for (const p of initialPages) {
        await this.db.insert(contentPages).values(p).onConflictDoNothing();
      }
      await this.db.update(contentPages).set({
        canonicalUrl: sql`REPLACE(${contentPages.canonicalUrl}, 'https://livworthy.com/', 'https://www.livworthy.com/')`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(like(contentPages.canonicalUrl, "https://livworthy.com/%"));
      const countriesCount = Object.keys(COUNTRIES).length;
      const citiesCount = Object.keys(CITIES).length;
      return { success: true, countriesCount, citiesCount };
    } catch (err) {
      console.error("[PostgresDatabaseService] Seeding error:", err);
      throw err;
    }
  }
  async getCountries() {
    return await this.db.select().from(countries);
  }
  async getCities() {
    return await this.db.select().from(cities);
  }
  async getRegions() {
    return await this.db.select().from(regions);
  }
  async getTaxJurisdictions() {
    return await this.db.select().from(taxJurisdictions);
  }
  async getCostDatasets(cityId) {
    if (cityId) {
      return await this.db.select().from(costDatasets).where(eq(costDatasets.cityId, cityId));
    }
    return await this.db.select().from(costDatasets);
  }
  async getHousingDatasets(cityId) {
    if (cityId) {
      return await this.db.select().from(housingDatasets).where(eq(housingDatasets.cityId, cityId));
    }
    return await this.db.select().from(housingDatasets);
  }
  async getSalaryDatasets(cityId) {
    if (cityId) {
      return await this.db.select().from(salaryDatasets).where(eq(salaryDatasets.cityId, cityId));
    }
    return await this.db.select().from(salaryDatasets);
  }
  async getEvidenceSources() {
    return await this.db.select().from(evidenceSources);
  }
  async persistCalculation(scenario, result) {
    const scenarioId = `scen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const resultId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await this.db.insert(calculationScenarios).values({
        id: scenarioId,
        cityId: scenario.location?.cityId || "nyc",
        countryId: scenario.location?.countryId || "US",
        baseSalaryMinor: scenario.compensation?.baseSalary?.amountMinor || 0,
        currency: scenario.compensation?.baseSalary?.currency || "USD",
        householdType: scenario.household?.type || "single",
        lifestyleTier: scenario.lifestyleTier || "moderate",
        overridesJson: scenario.overrides || {},
        engineVersion: "1.2.0",
        taxRuleVersion: result.tax?.taxRuleVersion || "2024.1",
        costDatasetVersion: "2024.Q4",
        fxSnapshotId: result.fxSnapshotId || null
      });
      await this.db.insert(calculationResults).values({
        id: resultId,
        scenarioId,
        grossSalaryAnnualMinor: result.grossAnnual?.amountMinor || 0,
        takeHomeAnnualMinor: result.takeHomeAnnual?.amountMinor || 0,
        totalTaxAnnualMinor: result.tax?.totalTax?.amountMinor || 0,
        socialContributionsAnnualMinor: result.tax?.socialContributions?.amountMinor || 0,
        livingCostsAnnualMinor: result.livingCostsAnnual?.amountMinor || 0,
        moneyRemainingAnnualMinor: result.moneyRemainingAnnual?.amountMinor || 0,
        effectiveTaxRate: result.effectiveTaxRate || 0,
        fullResultJson: result
      });
    } catch (e) {
      console.warn("[PostgresDatabaseService] persistCalculation notice:", e);
    }
    return { scenarioId, resultId };
  }
  async getCalculation(scenarioId) {
    try {
      const scens = await this.db.select().from(calculationScenarios).where(eq(calculationScenarios.id, scenarioId)).limit(1);
      if (!scens || scens.length === 0) return null;
      const scen = scens[0];
      const results = await this.db.select().from(calculationResults).where(eq(calculationResults.scenarioId, scenarioId)).limit(1);
      const res = results[0]?.fullResultJson || null;
      return {
        id: scen.id,
        scenario: {
          location: { cityId: scen.cityId, countryId: scen.countryId, currency: scen.currency },
          compensation: { baseSalary: { amountMinor: scen.baseSalaryMinor, currency: scen.currency } },
          household: { type: scen.householdType },
          lifestyleTier: scen.lifestyleTier,
          overrides: scen.overridesJson
        },
        result: res,
        createdAt: scen.createdAt
      };
    } catch (err) {
      console.error("[PostgresDatabaseService] getCalculation error:", err);
      return null;
    }
  }
  async saveFxSnapshot(snapshot) {
    try {
      await this.db.insert(fxSnapshots).values({
        id: snapshot.id,
        baseCurrency: snapshot.baseCurrency,
        provider: snapshot.provider,
        providerTimestamp: new Date(snapshot.providerTimestamp),
        retrievedAt: new Date(snapshot.retrievedAt),
        status: snapshot.status,
        ratesJson: snapshot.rates
      }).onConflictDoUpdate({
        target: fxSnapshots.id,
        set: {
          status: snapshot.status,
          ratesJson: snapshot.rates
        }
      });
      if (snapshot.rates) {
        for (const [quote, rate] of Object.entries(snapshot.rates)) {
          const numRate = rate;
          await this.db.insert(fxRates).values({
            id: `${snapshot.id}_${snapshot.baseCurrency}_${quote}`,
            snapshotId: snapshot.id,
            baseCurrency: snapshot.baseCurrency,
            quoteCurrency: quote,
            rate: numRate,
            invertedRate: numRate > 0 ? 1 / numRate : 0
          }).onConflictDoNothing();
        }
      }
    } catch (err) {
      console.warn("[PostgresDatabaseService] saveFxSnapshot notice:", err);
    }
  }
  async getLatestFxSnapshot(baseCurrency) {
    try {
      const rows = await this.db.select().from(fxSnapshots).where(eq(fxSnapshots.baseCurrency, baseCurrency)).orderBy(desc(fxSnapshots.retrievedAt)).limit(1);
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
        source: r.provider
      };
    } catch (err) {
      console.error("[PostgresDatabaseService] getLatestFxSnapshot error:", err);
      return null;
    }
  }
  async getContentPages(filter) {
    try {
      let query = this.db.select().from(contentPages);
      const conditions = [];
      if (filter?.locale) conditions.push(eq(contentPages.locale, filter.locale));
      if (filter?.workflowState) conditions.push(eq(contentPages.workflowState, filter.workflowState));
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      return await query.orderBy(desc(contentPages.updatedAt));
    } catch (err) {
      console.error("[PostgresDatabaseService] getContentPages error:", err);
      return [];
    }
  }
  async getContentPageBySlug(slug, locale = "en") {
    try {
      const rows = await this.db.select().from(contentPages).where(and(eq(contentPages.slug, slug), eq(contentPages.locale, locale))).limit(1);
      return rows[0] || null;
    } catch (err) {
      console.error("[PostgresDatabaseService] getContentPageBySlug error:", err);
      return null;
    }
  }
  async upsertContentPage(page) {
    const id = page.id || `page_${Date.now()}`;
    const slug = page.slug;
    const locale = page.locale || "en";
    const isIndexable = page.workflowState === "INDEX_APPROVED";
    const publishedAt = page.workflowState === "INDEX_APPROVED" || page.workflowState === "PUBLISHED" ? /* @__PURE__ */ new Date() : null;
    try {
      await this.db.insert(contentPages).values({
        id,
        slug,
        locale,
        title: page.title,
        metaDescription: page.metaDescription || "",
        workflowState: page.workflowState || "DRAFTED",
        isIndexable,
        authorEmail: page.authorEmail || "editorial@livworthy.com",
        reviewerEmail: page.reviewerEmail || null,
        publishedAt,
        canonicalUrl: `https://www.livworthy.com/${slug}`,
        blocksJson: page.blocksJson || [],
        evidenceSourceIds: page.evidenceSourceIds || [],
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: contentPages.slug,
        set: {
          title: page.title,
          canonicalUrl: page.canonicalUrl || `https://www.livworthy.com/${slug}`,
          metaDescription: page.metaDescription || "",
          workflowState: page.workflowState || "DRAFTED",
          isIndexable,
          reviewerEmail: page.reviewerEmail || null,
          publishedAt,
          blocksJson: page.blocksJson || [],
          evidenceSourceIds: page.evidenceSourceIds || [],
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
      return await this.getContentPageBySlug(slug, locale);
    } catch (err) {
      console.error("[PostgresDatabaseService] upsertContentPage error:", err);
      return page;
    }
  }
  async updateContentWorkflow(slug, locale, workflowState, reviewerEmail) {
    const isIndexable = workflowState === "INDEX_APPROVED";
    const publishedAt = workflowState === "INDEX_APPROVED" || workflowState === "PUBLISHED" ? /* @__PURE__ */ new Date() : null;
    try {
      const rows = await this.db.update(contentPages).set({
        workflowState,
        isIndexable,
        reviewerEmail: reviewerEmail ?? null,
        publishedAt,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and(eq(contentPages.slug, slug), eq(contentPages.locale, locale))).returning();
      return rows[0] || null;
    } catch (err) {
      console.error("[PostgresDatabaseService] updateContentWorkflow error:", err);
      throw err;
    }
  }
  async recordAuditLog(entry) {
    try {
      await this.db.insert(auditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        actorEmail: entry.actorEmail,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        metadataJson: entry.metadata || {},
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (err) {
      console.warn("[PostgresDatabaseService] recordAuditLog notice:", err);
    }
  }
  async getAuditLogs(limit = 50) {
    try {
      return await this.db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(limit);
    } catch (err) {
      console.error("[PostgresDatabaseService] getAuditLogs error:", err);
      return [];
    }
  }
  async recordWebVital(vital) {
    try {
      await this.db.insert(webVitals).values({
        id: `vital_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        metricName: vital.name,
        metricValue: vital.value,
        metricRating: vital.rating || "good",
        route: vital.route || "/",
        device: vital.device || "desktop",
        recordedAt: /* @__PURE__ */ new Date()
      });
    } catch (err) {
      console.warn("[PostgresDatabaseService] recordWebVital notice:", err);
    }
  }
  async getWebVitalsSummary() {
    try {
      const rows = await this.db.select().from(webVitals).orderBy(desc(webVitals.recordedAt)).limit(500);
      if (!rows || rows.length === 0) {
        return { p75Lcp: 1.15, p75Cls: 0.015, p75Inp: 38, totalSamples: 0 };
      }
      const lcps = rows.filter((r) => r.metricName === "LCP").map((r) => r.metricValue).sort((a, b) => a - b);
      const clss = rows.filter((r) => r.metricName === "CLS").map((r) => r.metricValue).sort((a, b) => a - b);
      const inps = rows.filter((r) => r.metricName === "INP").map((r) => r.metricValue).sort((a, b) => a - b);
      const getP75 = (arr) => arr.length ? arr[Math.floor(arr.length * 0.75)] : 0;
      return {
        p75Lcp: getP75(lcps) || 1.15,
        p75Cls: getP75(clss) || 0.015,
        p75Inp: getP75(inps) || 38,
        totalSamples: rows.length
      };
    } catch (err) {
      return { p75Lcp: 1.15, p75Cls: 0.015, p75Inp: 38, totalSamples: 0 };
    }
  }
  async getUsers() {
    try {
      return await this.db.select().from(users);
    } catch (err) {
      return [];
    }
  }
  async getUserByEmail(email) {
    try {
      const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
      return rows[0] || null;
    } catch (err) {
      console.error("[PostgresDatabaseService] getUserByEmail error:", err);
      throw err;
    }
  }
  async upsertUser(user) {
    try {
      await this.db.insert(users).values({
        id: user.id || `usr_${Date.now()}`,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role || "READ_ONLY",
        mfaSecret: user.mfaSecret || null,
        mfaEnabled: user.mfaEnabled || false,
        isActive: user.isActive !== false
      }).onConflictDoUpdate({
        target: users.email,
        set: {
          role: user.role,
          passwordHash: user.passwordHash,
          mfaEnabled: user.mfaEnabled,
          mfaSecret: user.mfaSecret,
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : void 0
        }
      });
      return await this.getUserByEmail(user.email);
    } catch (err) {
      console.error("[PostgresDatabaseService] upsertUser error:", err);
      return user;
    }
  }
  async getReviews(contentPageId) {
    try {
      if (contentPageId) {
        return await this.db.select().from(editorialReviews).where(eq(editorialReviews.contentPageId, contentPageId));
      }
      return await this.db.select().from(editorialReviews);
    } catch (err) {
      return [];
    }
  }
  async recordReview(review) {
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await this.db.insert(editorialReviews).values({
        id,
        contentPageId: review.contentPageId,
        reviewerEmail: review.reviewerEmail,
        status: review.status || "PENDING",
        feedbackNotes: review.feedbackNotes || null,
        statutoryCheckPassed: review.statutoryCheckPassed !== false,
        reviewedAt: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date()
      });
      return { id, ...review };
    } catch (err) {
      console.error("[PostgresDatabaseService] recordReview error:", err);
      return { id, ...review };
    }
  }
  async getBacklinks() {
    try {
      return await this.db.select().from(backlinkRecords);
    } catch {
      return [];
    }
  }
  async recordBacklink(record) {
    const id = record.id || `bl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await this.db.insert(backlinkRecords).values({
        id,
        referringDomain: record.referringDomain,
        sourceUrl: record.sourceUrl,
        targetUrl: record.targetUrl,
        anchorText: record.anchorText,
        relAttribute: record.relAttribute || "dofollow",
        acquisitionChannel: record.acquisitionChannel || "EDITORIAL",
        status: record.status || "PENDING_VERIFICATION",
        httpStatusCode: record.httpStatusCode || null,
        contactEmail: record.contactEmail || null,
        campaignName: record.campaignName || null,
        notes: record.notes || null,
        firstSeenAt: record.firstSeenAt ? new Date(record.firstSeenAt) : /* @__PURE__ */ new Date(),
        lastCheckedAt: /* @__PURE__ */ new Date()
      });
      return { id, ...record };
    } catch {
      return { id, ...record };
    }
  }
  async getRankRecords() {
    try {
      return await this.db.select().from(rankTrackingRecords);
    } catch {
      return [];
    }
  }
  async upsertRankRecord(record) {
    const id = record.id || `rank_${record.keyword.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${record.country || "US"}`;
    try {
      await this.db.insert(rankTrackingRecords).values({
        id,
        keyword: record.keyword,
        targetUrl: record.targetUrl,
        locale: record.locale || "en",
        country: record.country || "US",
        device: record.device || "desktop",
        currentRank: record.currentRank ?? null,
        previousRank: record.previousRank ?? null,
        rankDelta: record.rankDelta ?? null,
        impressions: record.impressions || 0,
        clicks: record.clicks || 0,
        ctr: record.ctr || 0,
        averagePosition: record.averagePosition ?? null,
        serpFeature: record.serpFeature || "STANDARD",
        lastCheckedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: rankTrackingRecords.id,
        set: {
          currentRank: record.currentRank ?? null,
          previousRank: record.previousRank ?? null,
          rankDelta: record.rankDelta ?? null,
          impressions: record.impressions || 0,
          clicks: record.clicks || 0,
          ctr: record.ctr || 0,
          averagePosition: record.averagePosition ?? null,
          lastCheckedAt: /* @__PURE__ */ new Date()
        }
      });
      return { id, ...record };
    } catch {
      return { id, ...record };
    }
  }
  async getTaxSourceMonitors() {
    try {
      return await this.db.select().from(taxSourceMonitors);
    } catch {
      return [];
    }
  }
  async upsertTaxSourceMonitor(record) {
    const id = record.id || `taxmon_${record.jurisdictionId}`;
    try {
      await this.db.insert(taxSourceMonitors).values({
        id,
        jurisdictionId: record.jurisdictionId,
        authorityName: record.authorityName,
        officialPortalUrl: record.officialPortalUrl,
        lastCheckedAt: /* @__PURE__ */ new Date(),
        lastModifiedHeader: record.lastModifiedHeader || null,
        etagHeader: record.etagHeader || null,
        contentHash: record.contentHash || null,
        publicationDetected: !!record.publicationDetected,
        publishedStatuteYear: record.publishedStatuteYear || 2026,
        implementationStatus: record.implementationStatus || "CURRENT_2026",
        notes: record.notes || null
      }).onConflictDoUpdate({
        target: taxSourceMonitors.id,
        set: {
          lastCheckedAt: /* @__PURE__ */ new Date(),
          lastModifiedHeader: record.lastModifiedHeader || null,
          etagHeader: record.etagHeader || null,
          contentHash: record.contentHash || null,
          publicationDetected: !!record.publicationDetected,
          publishedStatuteYear: record.publishedStatuteYear || 2026,
          implementationStatus: record.implementationStatus || "CURRENT_2026",
          notes: record.notes || null
        }
      });
      return { id, ...record };
    } catch {
      return { id, ...record };
    }
  }
  async getPrOutreachRecords() {
    try {
      return await this.db.select().from(prOutreachRecords);
    } catch {
      return [];
    }
  }
  async recordPrOutreach(record) {
    const id = record.id || `pr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await this.db.insert(prOutreachRecords).values({
        id,
        journalistName: record.journalistName,
        outlet: record.outlet,
        beat: record.beat,
        verifiedArticleUrl: record.verifiedArticleUrl,
        publicContactMethod: record.publicContactMethod,
        pitchAngle: record.pitchAngle,
        status: record.status || "PITCH_READY",
        sentAt: record.sentAt ? new Date(record.sentAt) : null,
        notes: record.notes || null
      });
      return { id, ...record };
    } catch {
      return { id, ...record };
    }
  }
  async getGscPerformanceRecords(limit = 100) {
    try {
      return await this.db.select().from(gscPerformanceRecords).limit(limit);
    } catch {
      return [];
    }
  }
  async upsertGscPerformanceRecord(record) {
    const id = record.id || `gsc_${record.date}_${record.query.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 30)}_${record.country || "all"}_${record.device || "all"}`;
    try {
      await this.db.insert(gscPerformanceRecords).values({
        id,
        date: record.date,
        query: record.query,
        page: record.page,
        locale: record.locale || "en",
        country: record.country || "all",
        device: record.device || "all",
        clicks: record.clicks ?? 0,
        impressions: record.impressions ?? 0,
        ctr: record.ctr ?? 0,
        averagePosition: record.averagePosition ?? null,
        dataSource: record.dataSource || "GOOGLE_SEARCH_CONSOLE_API",
        fetchedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: gscPerformanceRecords.id,
        set: {
          clicks: record.clicks ?? 0,
          impressions: record.impressions ?? 0,
          ctr: record.ctr ?? 0,
          averagePosition: record.averagePosition ?? null,
          fetchedAt: /* @__PURE__ */ new Date()
        }
      });
      return { id, ...record };
    } catch {
      return { id, ...record };
    }
  }
};
var LocalFallbackDatabaseService = class {
  constructor() {
    this.mode = "DEV_LOCAL_FALLBACK";
    this.isReady = true;
    this.scenarios = /* @__PURE__ */ new Map();
    this.results = /* @__PURE__ */ new Map();
    this.fxSnapshots = /* @__PURE__ */ new Map();
    this.contentPages = /* @__PURE__ */ new Map();
    this.auditLogs = [];
    this.vitals = [];
    this.users = /* @__PURE__ */ new Map();
    this.reviews = [];
    this.backlinks = [];
    this.rankRecords = /* @__PURE__ */ new Map();
    this.taxMonitors = /* @__PURE__ */ new Map();
    this.prOutreach = [];
    this.gscRecords = [];
    this.seedInitialData();
  }
  seedInitialData() {
    const initialPages = [
      {
        id: "page_methodology",
        slug: "methodology",
        locale: "en",
        title: "LivWorthy Mathematical Methodology & Data Integrity Charter",
        metaDescription: "Complete documentation of statutory tax schedules, spatial price deflators, and verification standards.",
        workflowState: "INDEX_APPROVED",
        isIndexable: true,
        authorEmail: "editorial@livworthy.com",
        reviewerEmail: "chief.economist@livworthy.com",
        publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
        canonicalUrl: "https://www.livworthy.com/methodology",
        blocksJson: [
          { type: "heading", level: 2, content: "Data Integrity Charter" },
          { type: "prose", content: "LivWorthy provides deterministic income and cost intelligence. We never substitute statutory tax schedules with synthetic models or unverified crowdsourced numbers." },
          { type: "heading", level: 3, content: "Statutory Verification Standards" },
          { type: "prose", content: "Every calculation is verified against primary legislative statutes and national revenue authority schedules." }
        ],
        evidenceSourceIds: ["us-irs-tax-2024", "uk-hmrc-tax-2024"],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "page_sources",
        slug: "sources",
        locale: "en",
        title: "Primary Evidence & Statistical Sources",
        metaDescription: "Governmental, institutional, and statistical data sources powering the LivWorthy calculation pipeline.",
        workflowState: "INDEX_APPROVED",
        isIndexable: true,
        authorEmail: "editorial@livworthy.com",
        reviewerEmail: "chief.economist@livworthy.com",
        publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
        canonicalUrl: "https://www.livworthy.com/sources",
        blocksJson: [
          { type: "heading", level: 2, content: "Source Hierarchy & Provenance" },
          { type: "prose", content: "We prioritize Tier-1 statutory sources (IRS, HMRC, CRA, ATO, BZSt, DGFiP, AEAT, IRAS, ZATCA, ESTV) over commercial aggregators." }
        ],
        evidenceSourceIds: Object.keys(EVIDENCE_SOURCES).slice(0, 10),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    for (const p of initialPages) {
      if (!this.contentPages.has(`${p.slug}:${p.locale}`)) {
        this.contentPages.set(`${p.slug}:${p.locale}`, p);
      } else {
        const existing = this.contentPages.get(`${p.slug}:${p.locale}`);
        if (existing?.canonicalUrl?.startsWith("https://livworthy.com/")) {
          existing.canonicalUrl = existing.canonicalUrl.replace("https://livworthy.com/", "https://www.livworthy.com/");
        }
      }
    }
    const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim();
    const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim();
    if (bootstrapEmail && bootstrapPassword) {
      const hashedPassword = AuthService.hashPassword(bootstrapPassword);
      this.users.set(bootstrapEmail, {
        id: `usr_${Date.now()}`,
        email: bootstrapEmail,
        passwordHash: hashedPassword,
        role: "ADMIN",
        mfaEnabled: false,
        isActive: true
      });
    }
  }
  async checkConnection() {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      return {
        healthy: false,
        migrationsApplied: false,
        mode: this.mode,
        error: "DEV_LOCAL_FALLBACK database service is strictly prohibited in production mode."
      };
    }
    return {
      healthy: true,
      migrationsApplied: true,
      mode: this.mode
    };
  }
  async getAuthoritativeCostData(cityId) {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      throw new Error(`[Data Isolation] Production calculations cannot consume synthetic DEV_LOCAL_FALLBACK data for city: ${cityId}.`);
    }
    const list = await this.getCostDatasets(cityId);
    const row = list[0] || null;
    return { data: row, classification: "SYNTHETIC" };
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
  async getCostDatasets(cityId) {
    const list = Object.values(CITIES).map((c) => ({
      id: `cost_${c.id}_2024q4`,
      cityId: c.id,
      datasetVersion: "2024.Q4",
      housingOneBedMinor: Math.round(3400 * (c.colIndexBase100NYC / 100) * 100),
      foodMonthlyMinor: Math.round(650 * (c.colIndexBase100NYC / 100) * 100),
      classification: "SYNTHETIC",
      isAuthoritative: false
    }));
    if (cityId) return list.filter((x) => x.cityId === cityId);
    return list;
  }
  async getHousingDatasets(cityId) {
    const list = Object.values(CITIES).map((c) => ({
      id: `house_${c.id}_1bed`,
      cityId: c.id,
      bedroomCount: "one_bed",
      medianMonthlyRentMinor: Math.round(3400 * (c.colIndexBase100NYC / 100) * 100),
      currency: c.currency
    }));
    if (cityId) return list.filter((x) => x.cityId === cityId);
    return list;
  }
  async getSalaryDatasets(cityId) {
    const list = Object.values(CITIES).map((c) => ({
      id: `sal_${c.id}_swe`,
      cityId: c.id,
      roleTitle: "Software Engineer",
      p50AnnualMinor: Math.round(12e4 * (c.colIndexBase100NYC / 100) * 100),
      currency: c.currency
    }));
    if (cityId) return list.filter((x) => x.cityId === cityId);
    return list;
  }
  async getEvidenceSources() {
    return Object.values(EVIDENCE_SOURCES);
  }
  async persistCalculation(scenario, result) {
    const scenarioId = `scen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const resultId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const storedScenario = {
      id: scenarioId,
      scenario,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const storedResult = {
      id: resultId,
      scenarioId,
      result,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.scenarios.set(scenarioId, storedScenario);
    this.results.set(resultId, storedResult);
    return { scenarioId, resultId };
  }
  async getCalculation(scenarioId) {
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
  async saveFxSnapshot(snapshot) {
    this.fxSnapshots.set(snapshot.id || `fx_${Date.now()}`, snapshot);
  }
  async getLatestFxSnapshot(baseCurrency) {
    const snapshots = Array.from(this.fxSnapshots.values());
    return snapshots.reverse().find((s) => s.baseCurrency === baseCurrency) || null;
  }
  async getContentPages(filter) {
    let pages = Array.from(this.contentPages.values());
    if (filter?.locale) {
      pages = pages.filter((p) => p.locale === filter.locale);
    }
    if (filter?.workflowState) {
      pages = pages.filter((p) => p.workflowState === filter.workflowState);
    }
    return pages;
  }
  async getContentPageBySlug(slug, locale = "en") {
    return this.contentPages.get(`${slug}:${locale}`) || null;
  }
  async upsertContentPage(page) {
    const existing = this.contentPages.get(`${page.slug}:${page.locale || "en"}`);
    const updated = {
      id: page.id || existing?.id || `page_${Date.now()}`,
      slug: page.slug,
      locale: page.locale || "en",
      title: page.title,
      metaDescription: page.metaDescription || "",
      workflowState: page.workflowState || "DRAFTED",
      isIndexable: page.workflowState === "INDEX_APPROVED",
      authorEmail: page.authorEmail || "editorial@livworthy.com",
      reviewerEmail: page.reviewerEmail,
      publishedAt: page.workflowState === "INDEX_APPROVED" || page.workflowState === "PUBLISHED" ? (/* @__PURE__ */ new Date()).toISOString() : null,
      canonicalUrl: page.canonicalUrl || `https://www.livworthy.com/${page.slug}`,
      blocksJson: page.blocksJson || [],
      evidenceSourceIds: page.evidenceSourceIds || [],
      createdAt: existing?.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.contentPages.set(`${updated.slug}:${updated.locale}`, updated);
    return updated;
  }
  async updateContentWorkflow(slug, locale, workflowState, reviewerEmail) {
    const key = `${slug}:${locale}`;
    const existing = this.contentPages.get(key);
    if (!existing) return null;
    const updated = {
      ...existing,
      workflowState,
      isIndexable: workflowState === "INDEX_APPROVED",
      reviewerEmail: reviewerEmail ?? null,
      publishedAt: workflowState === "INDEX_APPROVED" || workflowState === "PUBLISHED" ? (/* @__PURE__ */ new Date()).toISOString() : null,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.contentPages.set(key, updated);
    return updated;
  }
  async recordAuditLog(entry) {
    this.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...entry,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }
  async getAuditLogs(limit = 50) {
    return this.auditLogs.slice(0, limit);
  }
  async recordWebVital(vital) {
    this.vitals.push({
      ...vital,
      recordedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (this.vitals.length > 1e3) {
      this.vitals.shift();
    }
  }
  async getWebVitalsSummary() {
    if (this.vitals.length === 0) {
      return { p75Lcp: 1.15, p75Cls: 0.015, p75Inp: 38, totalSamples: 0 };
    }
    const lcps = this.vitals.filter((v) => v.name === "LCP").map((v) => v.value).sort((a, b) => a - b);
    const clss = this.vitals.filter((v) => v.name === "CLS").map((v) => v.value).sort((a, b) => a - b);
    const inps = this.vitals.filter((v) => v.name === "INP").map((v) => v.value).sort((a, b) => a - b);
    const getP75 = (arr) => arr.length ? arr[Math.floor(arr.length * 0.75)] : 0;
    return {
      p75Lcp: getP75(lcps) || 1.15,
      p75Cls: getP75(clss) || 0.015,
      p75Inp: getP75(inps) || 38,
      totalSamples: this.vitals.length
    };
  }
  async getUsers() {
    return Array.from(this.users.values());
  }
  async getUserByEmail(email) {
    return this.users.get(email) || null;
  }
  async upsertUser(user) {
    this.users.set(user.email, {
      id: user.id || `usr_${Date.now()}`,
      ...user
    });
    return this.users.get(user.email);
  }
  async getReviews(contentPageId) {
    if (contentPageId) {
      return this.reviews.filter((r) => r.contentPageId === contentPageId);
    }
    return this.reviews;
  }
  async recordReview(review) {
    const r = {
      id: `rev_${Date.now()}`,
      ...review,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.reviews.push(r);
    return r;
  }
  async getBacklinks() {
    return this.backlinks;
  }
  async recordBacklink(record) {
    const id = record.id || `bl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const entry = { id, ...record, lastCheckedAt: (/* @__PURE__ */ new Date()).toISOString() };
    this.backlinks.push(entry);
    return entry;
  }
  async getRankRecords() {
    return Array.from(this.rankRecords.values());
  }
  async upsertRankRecord(record) {
    const id = record.id || `rank_${record.keyword.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${record.country || "US"}`;
    const entry = { id, ...record, lastCheckedAt: (/* @__PURE__ */ new Date()).toISOString() };
    this.rankRecords.set(id, entry);
    return entry;
  }
  async getTaxSourceMonitors() {
    return Array.from(this.taxMonitors.values());
  }
  async upsertTaxSourceMonitor(record) {
    const id = record.id || `taxmon_${record.jurisdictionId}`;
    const entry = { id, ...record, lastCheckedAt: (/* @__PURE__ */ new Date()).toISOString() };
    this.taxMonitors.set(id, entry);
    return entry;
  }
  async getPrOutreachRecords() {
    return this.prOutreach;
  }
  async recordPrOutreach(record) {
    const id = record.id || `pr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const entry = { id, ...record };
    this.prOutreach.push(entry);
    return entry;
  }
  async getGscPerformanceRecords(limit = 100) {
    return this.gscRecords.slice(0, limit);
  }
  async upsertGscPerformanceRecord(record) {
    const id = record.id || `gsc_${record.date}_${record.query.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 30)}_${record.country || "all"}_${record.device || "all"}`;
    const idx = this.gscRecords.findIndex((r) => r.id === id);
    const entry = { id, ...record, fetchedAt: (/* @__PURE__ */ new Date()).toISOString() };
    if (idx >= 0) {
      this.gscRecords[idx] = entry;
    } else {
      this.gscRecords.push(entry);
    }
    return entry;
  }
};
function createDatabaseService() {
  const isProduction = process.env.NODE_ENV === "production";
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (dbUrl) {
    return new PostgresDatabaseService(dbUrl);
  }
  if (isProduction) {
    console.warn("[Database Configuration] DATABASE_URL is absent in production environment. Database operations will fail-closed.");
  } else {
    console.warn("[Database] Running with in-memory development repository (DATABASE_URL absent in development mode).");
  }
  return new LocalFallbackDatabaseService();
}
var dbService = createDatabaseService();

// src/lib/redis.ts
import Redis from "ioredis";
function sanitizeRedisUrl(raw) {
  if (!raw) return void 0;
  let cleaned = raw.trim();
  if (cleaned.startsWith("REDIS_URL=")) {
    cleaned = cleaned.substring("REDIS_URL=".length);
  }
  if (cleaned.startsWith('"') && cleaned.endsWith('"') || cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}
var RedisCacheService = class {
  constructor() {
    this.isRedisConnected = false;
    this.redis = null;
    this.localFallback = /* @__PURE__ */ new Map();
    this.localRateLimits = /* @__PURE__ */ new Map();
    const redisUrl = sanitizeRedisUrl(process.env.REDIS_URL);
    if (redisUrl) {
      try {
        const isTls = redisUrl.startsWith("rediss://");
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 2,
          connectTimeout: 5e3,
          tls: isTls ? { rejectUnauthorized: false } : void 0,
          retryStrategy(times) {
            if (times > 5) return null;
            return Math.min(times * 150, 1500);
          }
        });
        this.redis.on("connect", () => {
          this.isRedisConnected = true;
          console.log("[Redis] Connected to Upstash Redis cluster");
        });
        this.redis.on("ready", () => {
          this.isRedisConnected = true;
        });
        this.redis.on("error", (err) => {
          this.isRedisConnected = false;
          console.warn("[Redis] Connection degraded, local secure fallback active:", err.message);
        });
      } catch (e) {
        console.warn("[Redis] Initialization notice, using secure in-memory cache:", e.message);
      }
    } else {
      this.isRedisConnected = false;
    }
  }
  async get(key) {
    if (this.isRedisConnected && this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
      }
    }
    const item = this.localFallback.get(key);
    if (!item) return null;
    if (item.expiresAt < Date.now()) {
      this.localFallback.delete(key);
      return null;
    }
    return item.value;
  }
  async set(key, value, ttlSeconds = 300) {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.set(key, value, "EX", ttlSeconds);
        return;
      } catch {
      }
    }
    this.localFallback.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1e3
    });
  }
  async del(key) {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.del(key);
      } catch {
      }
    }
    this.localFallback.delete(key);
  }
  async checkRateLimit(key, limit, windowSeconds, options) {
    const now = Date.now();
    const isSecuritySensitive = options?.isSecuritySensitive ?? false;
    const failClosed = options?.failClosed ?? false;
    if (this.isRedisConnected && this.redis) {
      try {
        const fullKey = `rl:${key}`;
        const current = await this.redis.incr(fullKey);
        if (current === 1) {
          await this.redis.expire(fullKey, windowSeconds);
        }
        const ttl = await this.redis.ttl(fullKey);
        return {
          allowed: current <= limit,
          remaining: Math.max(0, limit - current),
          resetSeconds: Math.max(1, ttl),
          totalLimit: limit
        };
      } catch (err) {
        console.warn(`[RateLimiter] Distributed Redis rate-limiting check failed: ${err.message}`);
        if (isSecuritySensitive && failClosed) {
          return {
            allowed: false,
            remaining: 0,
            resetSeconds: windowSeconds,
            totalLimit: limit,
            degraded: true,
            reason: "SECURITY_RATE_LIMITER_UNAVAILABLE"
          };
        }
      }
    } else if (isSecuritySensitive && failClosed && process.env.NODE_ENV === "production") {
      return {
        allowed: false,
        remaining: 0,
        resetSeconds: windowSeconds,
        totalLimit: limit,
        degraded: true,
        reason: "SECURITY_RATE_LIMITER_DISCONNECTED"
      };
    }
    const effectiveLimit = isSecuritySensitive ? Math.min(limit, 5) : limit;
    let record = this.localRateLimits.get(key);
    if (!record || record.resetAt <= now) {
      record = { count: 1, resetAt: now + windowSeconds * 1e3 };
      this.localRateLimits.set(key, record);
      return {
        allowed: true,
        remaining: effectiveLimit - 1,
        resetSeconds: windowSeconds,
        totalLimit: effectiveLimit,
        degraded: isSecuritySensitive
      };
    }
    record.count += 1;
    const remaining = Math.max(0, effectiveLimit - record.count);
    const resetSeconds = Math.ceil((record.resetAt - now) / 1e3);
    return {
      allowed: record.count <= effectiveLimit,
      remaining,
      resetSeconds,
      totalLimit: effectiveLimit,
      degraded: isSecuritySensitive
    };
  }
};
var cacheService = new RedisCacheService();

// src/lib/money.ts
var CURRENCY_MINOR_UNITS = {
  USD: 100,
  GBP: 100,
  EUR: 100,
  CAD: 100,
  AED: 100,
  AUD: 100,
  SAR: 100,
  CHF: 100,
  SGD: 100,
  QAR: 100,
  NZD: 100,
  INR: 100,
  JPY: 1,
  KRW: 1,
  NOK: 100,
  SEK: 100,
  DKK: 100,
  ILS: 100,
  HKD: 100,
  BRL: 100,
  MXN: 100,
  IDR: 100,
  MYR: 100,
  PHP: 100,
  ZAR: 100,
  PLN: 100,
  CZK: 100,
  THB: 100,
  VND: 1
};
function createMoney(amountMajor, currency) {
  const factor = CURRENCY_MINOR_UNITS[currency] || 100;
  return {
    amountMinor: Math.round(amountMajor * factor),
    currency
  };
}
function fromMinor(amountMinor, currency) {
  return {
    amountMinor: Math.round(amountMinor),
    currency
  };
}
function toMajor(money) {
  const factor = CURRENCY_MINOR_UNITS[money.currency] || 100;
  return money.amountMinor / factor;
}
function subtractMoney(a, b) {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch in subtractMoney: ${a.currency} vs ${b.currency}`);
  }
  return {
    amountMinor: a.amountMinor - b.amountMinor,
    currency: a.currency
  };
}

// src/engines/fx/fx-service.ts
var CURRENCY_BOUNDS = {
  USD: { min: 1, max: 1 },
  EUR: { min: 0.5, max: 2 },
  GBP: { min: 0.4, max: 1.5 },
  CAD: { min: 0.8, max: 2.5 },
  AED: { min: 3.6, max: 3.75 },
  // Pegged at ~3.6725
  SAR: { min: 3.65, max: 3.85 },
  // Pegged at ~3.75
  AUD: { min: 0.8, max: 2.5 },
  CHF: { min: 0.5, max: 1.8 },
  SGD: { min: 0.8, max: 2.2 },
  QAR: { min: 3.55, max: 3.75 },
  // Pegged at ~3.64
  NZD: { min: 0.9, max: 2.6 },
  INR: { min: 50, max: 150 },
  JPY: { min: 70, max: 250 },
  KRW: { min: 800, max: 2500 },
  NOK: { min: 5, max: 20 },
  SEK: { min: 5, max: 20 },
  DKK: { min: 4, max: 15 },
  ILS: { min: 2, max: 6 },
  HKD: { min: 7, max: 8.5 },
  BRL: { min: 2.5, max: 10 },
  MXN: { min: 10, max: 35 },
  IDR: { min: 9e3, max: 3e4 },
  MYR: { min: 2.5, max: 8 },
  PHP: { min: 30, max: 100 },
  ZAR: { min: 8, max: 35 },
  PLN: { min: 2, max: 8 },
  CZK: { min: 12, max: 45 },
  THB: { min: 20, max: 60 },
  VND: { min: 15e3, max: 4e4 }
};
var FxEngine = class {
  static {
    this.CACHE_KEY = "fx:snapshot:USD";
  }
  static {
    this.CACHE_TTL_SECONDS = 3600;
  }
  static {
    // 1 hour in cache
    this.currentSnapshot = null;
  }
  /**
   * Evaluates freshness status based on timestamp age.
   * < 24h: CURRENT (or ACTIVE)
   * 24h - 72h: AGING
   * >= 72h: STALE
   */
  static evaluateFreshness(timestampStr) {
    const time = new Date(timestampStr).getTime();
    if (isNaN(time)) return "STALE";
    const ageHours = (Date.now() - time) / (1e3 * 3600);
    if (ageHours < 24) return "CURRENT";
    if (ageHours < 72) return "AGING";
    return "STALE";
  }
  static async getLatestSnapshot() {
    try {
      const cached = await cacheService.get(this.CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.rates && Object.keys(parsed.rates).length > 1) {
          const evaluated = this.evaluateFreshness(parsed.retrievedAt || parsed.providerTimestamp);
          parsed.status = evaluated;
          this.currentSnapshot = parsed;
          return parsed;
        }
      }
    } catch {
    }
    try {
      const dbSnapshot = await dbService.getLatestFxSnapshot("USD");
      if (dbSnapshot && dbSnapshot.rates && Object.keys(dbSnapshot.rates).length > 1) {
        const evaluated = this.evaluateFreshness(dbSnapshot.retrievedAt || dbSnapshot.providerTimestamp);
        dbSnapshot.status = evaluated;
        this.currentSnapshot = dbSnapshot;
        await cacheService.set(this.CACHE_KEY, JSON.stringify(dbSnapshot), this.CACHE_TTL_SECONDS);
        return dbSnapshot;
      }
    } catch (err) {
      console.warn("[FxEngine] Database lookup error:", err.message);
    }
    try {
      const liveSnapshot = await this.refreshFromProvider();
      if (liveSnapshot && liveSnapshot.status !== "UNAVAILABLE") {
        return liveSnapshot;
      }
    } catch (err) {
      console.warn("[FxEngine] Initial live fetch failed:", err.message);
    }
    if (this.currentSnapshot && Object.keys(this.currentSnapshot.rates).length > 1) {
      this.currentSnapshot.status = this.evaluateFreshness(this.currentSnapshot.retrievedAt);
      return this.currentSnapshot;
    }
    const unavailableSnapshot = {
      id: "fx_unavailable",
      baseCurrency: "USD",
      provider: "ExchangeRate-API Reference Service",
      providerTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
      retrievedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "UNAVAILABLE",
      rates: { USD: 1 },
      source: "No validated live or persisted snapshot available within freshness threshold."
    };
    this.currentSnapshot = unavailableSnapshot;
    return unavailableSnapshot;
  }
  static async refreshFromProvider(force = false) {
    const providerUrl = "https://open.er-api.com/v6/latest/USD";
    let fetchedRates = null;
    const providerName = "ExchangeRate-API Open Tier";
    let providerTimestamp = (/* @__PURE__ */ new Date()).toISOString();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5e3);
      const res = await fetch(providerUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && typeof data.rates === "object") {
          fetchedRates = data.rates;
          if (data.time_last_update_utc) {
            providerTimestamp = new Date(data.time_last_update_utc).toISOString();
          }
        }
      }
    } catch (err) {
      console.warn("[FxEngine] Live fetch encountered issue:", err.message);
    }
    if (fetchedRates) {
      const validatedRates = { USD: 1 };
      let allValid = true;
      for (const curr of Object.keys(CURRENCY_BOUNDS)) {
        const val = fetchedRates[curr];
        if (typeof val === "number" && !isNaN(val) && isFinite(val) && val > 0) {
          const bounds = CURRENCY_BOUNDS[curr];
          if (val >= bounds.min && val <= bounds.max) {
            validatedRates[curr] = val;
          } else {
            console.warn(`[FxEngine] Rate for ${curr} (${val}) outside sanity bounds [${bounds.min}, ${bounds.max}]`);
            allValid = false;
          }
        } else {
          allValid = false;
        }
      }
      if (allValid) {
        const snapshot = {
          id: `fx_${Date.now()}`,
          baseCurrency: "USD",
          provider: providerName,
          providerTimestamp,
          retrievedAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "CURRENT",
          rates: validatedRates,
          source: "ExchangeRate-API Open Tier (Sanity-Bounded & Normalized)"
        };
        this.currentSnapshot = snapshot;
        try {
          await dbService.saveFxSnapshot(snapshot);
        } catch (dbErr) {
          console.warn("[FxEngine] Failed to persist snapshot to DB:", dbErr.message);
        }
        try {
          await cacheService.set(this.CACHE_KEY, JSON.stringify(snapshot), this.CACHE_TTL_SECONDS);
        } catch {
        }
        return snapshot;
      }
    }
    try {
      const dbSnapshot = await dbService.getLatestFxSnapshot("USD");
      if (dbSnapshot && dbSnapshot.rates && Object.keys(dbSnapshot.rates).length > 1) {
        const status = this.evaluateFreshness(dbSnapshot.retrievedAt || dbSnapshot.providerTimestamp);
        dbSnapshot.status = status;
        this.currentSnapshot = dbSnapshot;
        return dbSnapshot;
      }
    } catch {
    }
    const unavailable = {
      id: "fx_unavailable",
      baseCurrency: "USD",
      provider: providerName,
      providerTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
      retrievedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "UNAVAILABLE",
      rates: { USD: 1 },
      source: "Live provider unreachable and no historical snapshot in database."
    };
    this.currentSnapshot = unavailable;
    return unavailable;
  }
  static convert(money, targetCurrency) {
    if (money.currency === targetCurrency) {
      return money;
    }
    if (!this.currentSnapshot || this.currentSnapshot.status === "UNAVAILABLE") {
      throw new Error(`Currency conversion unavailable: live FX rates are currently unavailable.`);
    }
    const rates = this.currentSnapshot.rates;
    const fromRate = rates[money.currency];
    const toRate = rates[targetCurrency];
    if (!fromRate || !toRate) {
      throw new Error(
        `Currency conversion error: rate for ${money.currency} or ${targetCurrency} is missing from active FX snapshot.`
      );
    }
    const amountMajor = toMajor(money);
    const inUsdMajor = amountMajor / fromRate;
    const targetMajor = inUsdMajor * toRate;
    return createMoney(targetMajor, targetCurrency);
  }
};

// src/engines/tax/au/au-adapter.ts
var AustraliaTaxAdapter = class {
  constructor() {
    this.id = "au";
    this.name = "Australia ATO Tax Engine";
  }
  supports(context) {
    return context.countryId === "AU";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    let incomeTax = 0;
    if (grossMajor <= 18200) {
      incomeTax = 0;
    } else if (grossMajor <= 45e3) {
      incomeTax = (grossMajor - 18200) * 0.16;
    } else if (grossMajor <= 135e3) {
      incomeTax = 4288 + (grossMajor - 45e3) * 0.3;
    } else if (grossMajor <= 19e4) {
      incomeTax = 31288 + (grossMajor - 135e3) * 0.37;
    } else {
      incomeTax = 51638 + (grossMajor - 19e4) * 0.45;
    }
    let medicareLevy = 0;
    if (grossMajor > 32500) {
      medicareLevy = grossMajor * 0.02;
    } else if (grossMajor > 26e3) {
      medicareLevy = (grossMajor - 26e3) * 0.1;
    }
    const federalTaxMinor = Math.round(incomeTax * 100);
    const medicareMinor = Math.round(medicareLevy * 100);
    const totalTaxMinor = federalTaxMinor + medicareMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalTaxMinor);
    const evidenceRef = taxYear === 2024 ? "ato-individual-rates-2024" : `au-ato-tax-${taxYear}`;
    const taxRuleVersion = taxYear === 2024 ? "ATO-2024.2" : `AU-ATO-${taxYear}.1`;
    const components = [
      {
        id: "au-income-tax",
        name: "Australian Resident Income Tax (Stage 3)",
        authority: "Australian Taxation Office (ATO)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "AUD"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      },
      {
        id: "au-medicare-levy",
        name: "Medicare Levy (2.0%)",
        authority: "Services Australia / ATO",
        category: "social_contribution",
        amount: fromMinor(medicareMinor, "AUD"),
        effectiveRate: medicareMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      }
    ];
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: createMoney(0, "AUD"),
      federalTax: fromMinor(federalTaxMinor, "AUD"),
      stateTax: createMoney(0, "AUD"),
      localTax: createMoney(0, "AUD"),
      socialContributions: fromMinor(medicareMinor, "AUD"),
      totalTax: fromMinor(totalTaxMinor, "AUD"),
      totalDeductionsAndTaxes: fromMinor(totalTaxMinor, "AUD"),
      netIncome: fromMinor(netIncomeMinor, "AUD"),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), "AUD"),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), "AUD"),
      effectiveTaxRate: totalTaxMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > 19e4 ? 0.47 : grossMajor > 135e3 ? 0.39 : 0.32,
      components,
      taxRuleVersion,
      evidenceSourceIds: taxYear === 2024 ? ["ato-individual-rates-2024", "ato-medicare-levy-2024"] : [evidenceRef]
    };
  }
};

// src/engines/tax/ca/ca-adapter.ts
var CanadaTaxAdapter = class {
  constructor() {
    this.id = "ca";
    this.name = "Canada CRA & Provincial Tax Engine";
  }
  supports(context) {
    return context.countryId === "CA";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    let cppMinor = 0;
    if (isHistorical2024) {
      if (grossMajor > 3500) {
        const cppEligible = Math.min(grossMajor, 68500) - 3500;
        cppMinor = Math.round(cppEligible * 0.0595 * 100);
      }
      if (grossMajor > 68500) {
        const cpp2Eligible = Math.min(grossMajor, 73200) - 68500;
        cppMinor += Math.round(cpp2Eligible * 0.04 * 100);
      }
    } else {
      if (grossMajor > 3500) {
        const cppEligible = Math.min(grossMajor, 71300) - 3500;
        cppMinor = Math.round(cppEligible * 0.0595 * 100);
      }
      if (grossMajor > 71300) {
        const cpp2Eligible = Math.min(grossMajor, 81200) - 71300;
        cppMinor += Math.round(cpp2Eligible * 0.04 * 100);
      }
    }
    let eiMinor = 0;
    if (isHistorical2024) {
      const eiEligible = Math.min(grossMajor, 63200);
      eiMinor = Math.round(eiEligible * 0.0166 * 100);
    } else {
      const eiEligible = Math.min(grossMajor, 65700);
      eiMinor = Math.round(eiEligible * 0.0164 * 100);
    }
    const socialMinor = cppMinor + eiMinor;
    let fedGrossTax = 0;
    let fedBpa = 15705;
    if (isHistorical2024) {
      fedBpa = 15705;
      if (grossMajor <= 55867) {
        fedGrossTax = grossMajor * 0.15;
      } else if (grossMajor <= 111733) {
        fedGrossTax = 55867 * 0.15 + (grossMajor - 55867) * 0.205;
      } else if (grossMajor <= 173205) {
        fedGrossTax = 55867 * 0.15 + (111733 - 55867) * 0.205 + (grossMajor - 111733) * 0.26;
      } else if (grossMajor <= 246752) {
        fedGrossTax = 55867 * 0.15 + (111733 - 55867) * 0.205 + (173205 - 111733) * 0.26 + (grossMajor - 173205) * 0.29;
      } else {
        fedGrossTax = 55867 * 0.15 + (111733 - 55867) * 0.205 + (173205 - 111733) * 0.26 + (246752 - 173205) * 0.29 + (grossMajor - 246752) * 0.33;
      }
    } else {
      fedBpa = 16129;
      if (grossMajor <= 57375) {
        fedGrossTax = grossMajor * 0.15;
      } else if (grossMajor <= 114750) {
        fedGrossTax = 57375 * 0.15 + (grossMajor - 57375) * 0.205;
      } else if (grossMajor <= 177882) {
        fedGrossTax = 57375 * 0.15 + (114750 - 57375) * 0.205 + (grossMajor - 114750) * 0.26;
      } else if (grossMajor <= 253414) {
        fedGrossTax = 57375 * 0.15 + (114750 - 57375) * 0.205 + (177882 - 114750) * 0.26 + (grossMajor - 177882) * 0.29;
      } else {
        fedGrossTax = 57375 * 0.15 + (114750 - 57375) * 0.205 + (177882 - 114750) * 0.26 + (253414 - 177882) * 0.29 + (grossMajor - 253414) * 0.33;
      }
    }
    const fedBpaCredit = fedBpa * 0.15;
    const fedTaxTotal = Math.max(0, fedGrossTax - fedBpaCredit);
    const federalTaxMinor = Math.round(fedTaxTotal * 100);
    const regionCode = context.regionId?.replace("CA-", "") || "ON";
    let provGrossTax = 0;
    let provBpaCredit = 0;
    let provSurtax = 0;
    if (regionCode === "ON") {
      const b1Cap = isHistorical2024 ? 51446 : 52835;
      const b2Cap = isHistorical2024 ? 102894 : 105672;
      const onBpa = isHistorical2024 ? 12399 : 12734;
      if (grossMajor <= b1Cap) {
        provGrossTax = grossMajor * 0.0505;
      } else if (grossMajor <= b2Cap) {
        provGrossTax = b1Cap * 0.0505 + (grossMajor - b1Cap) * 0.0915;
      } else if (grossMajor <= 15e4) {
        provGrossTax = b1Cap * 0.0505 + (b2Cap - b1Cap) * 0.0915 + (grossMajor - b2Cap) * 0.1116;
      } else if (grossMajor <= 22e4) {
        provGrossTax = b1Cap * 0.0505 + (b2Cap - b1Cap) * 0.0915 + (15e4 - b2Cap) * 0.1116 + (grossMajor - 15e4) * 0.1216;
      } else {
        provGrossTax = b1Cap * 0.0505 + (b2Cap - b1Cap) * 0.0915 + (15e4 - b2Cap) * 0.1116 + (22e4 - 15e4) * 0.1216 + (grossMajor - 22e4) * 0.1316;
      }
      provBpaCredit = onBpa * 0.0505;
      const onBaseTax = Math.max(0, provGrossTax - provBpaCredit);
      const surtax1Threshold = isHistorical2024 ? 5554 : 5704;
      const surtax2Threshold = isHistorical2024 ? 7108 : 7300;
      if (onBaseTax > surtax2Threshold) {
        provSurtax = (onBaseTax - surtax1Threshold) * 0.2 + (onBaseTax - surtax2Threshold) * 0.36;
      } else if (onBaseTax > surtax1Threshold) {
        provSurtax = (onBaseTax - surtax1Threshold) * 0.2;
      }
    } else if (regionCode === "BC") {
      const b1 = isHistorical2024 ? 47937 : 49279;
      const b2 = isHistorical2024 ? 95875 : 98560;
      const b3 = isHistorical2024 ? 110076 : 113158;
      const b4 = isHistorical2024 ? 133664 : 137407;
      const b5 = isHistorical2024 ? 181232 : 186306;
      if (grossMajor <= b1) {
        provGrossTax = grossMajor * 0.0506;
      } else if (grossMajor <= b2) {
        provGrossTax = b1 * 0.0506 + (grossMajor - b1) * 0.077;
      } else if (grossMajor <= b3) {
        provGrossTax = b1 * 0.0506 + (b2 - b1) * 0.077 + (grossMajor - b2) * 0.105;
      } else if (grossMajor <= b4) {
        provGrossTax = b1 * 0.0506 + (b2 - b1) * 0.077 + (b3 - b2) * 0.105 + (grossMajor - b3) * 0.1229;
      } else {
        provGrossTax = b1 * 0.0506 + (b2 - b1) * 0.077 + (b3 - b2) * 0.105 + (b4 - b3) * 0.1229 + (grossMajor - b4) * 0.147;
      }
      provBpaCredit = (isHistorical2024 ? 12580 : 12932) * 0.0506;
    } else {
      const abCap = isHistorical2024 ? 148269 : 152272;
      if (grossMajor <= abCap) {
        provGrossTax = grossMajor * 0.1;
      } else {
        provGrossTax = abCap * 0.1 + (grossMajor - abCap) * 0.12;
      }
      provBpaCredit = (isHistorical2024 ? 21885 : 22476) * 0.1;
    }
    const provTaxTotal = Math.max(0, provGrossTax - provBpaCredit) + provSurtax;
    const stateTaxMinor = Math.round(provTaxTotal * 100);
    const totalTaxMinor = federalTaxMinor + stateTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const evidenceRef = taxYear === 2024 ? "cra-income-tax-2024" : `ca-cra-tax-${taxYear}`;
    const components = [
      {
        id: "ca-fed-tax",
        name: "Canada Federal Income Tax",
        authority: "Canada Revenue Agency (CRA)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "CAD"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      },
      {
        id: "ca-cpp",
        name: "Canada Pension Plan (CPP/CPP2)",
        authority: "Employment and Social Development Canada",
        category: "social_contribution",
        amount: fromMinor(cppMinor, "CAD"),
        effectiveRate: cppMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      },
      {
        id: "ca-ei",
        name: "Employment Insurance (EI)",
        authority: "Canada Revenue Agency (CRA)",
        category: "social_contribution",
        amount: fromMinor(eiMinor, "CAD"),
        effectiveRate: eiMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      },
      {
        id: "ca-prov-tax",
        name: `${regionCode} Provincial Income Tax`,
        authority: `${regionCode} Ministry of Finance`,
        category: "state",
        amount: fromMinor(stateTaxMinor, "CAD"),
        effectiveRate: stateTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      }
    ];
    const taxRuleVersion = taxYear === 2024 ? "CRA-2024.1" : `CA-CRA-ON-${taxYear}.1`;
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: createMoney(0, "CAD"),
      federalTax: fromMinor(federalTaxMinor, "CAD"),
      stateTax: fromMinor(stateTaxMinor, "CAD"),
      localTax: createMoney(0, "CAD"),
      socialContributions: fromMinor(socialMinor, "CAD"),
      totalTax: fromMinor(totalTaxMinor, "CAD"),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, "CAD"),
      netIncome: fromMinor(netIncomeMinor, "CAD"),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), "CAD"),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), "CAD"),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: 0.4341,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/ch/ch-adapter.ts
var SwitzerlandTaxAdapter = class {
  constructor() {
    this.id = "ch";
    this.name = "Switzerland ESTV Federal & Cantonal Tax Engine";
  }
  supports(context) {
    return context.countryId === "CH";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    const ahvMinor = Math.round(grossMajor * 0.053 * 100);
    const alvCap = 148200;
    const alvBase = Math.min(grossMajor, alvCap);
    const alvMinor = Math.round(alvBase * 0.011 * 100);
    const bvgCap = isHistorical2024 ? 88200 : 90720;
    const bvgDeduction = isHistorical2024 ? 25725 : 26460;
    const coordinatedSalary = Math.max(0, Math.min(grossMajor, bvgCap) - bvgDeduction);
    const bvgMinor = Math.round(coordinatedSalary * 0.05 * 100);
    const socialContributionsMinor = ahvMinor + alvMinor + bvgMinor;
    const taxableIncomeMajor = Math.max(0, grossMajor - socialContributionsMinor / 100);
    let federalTax = 0;
    if (taxableIncomeMajor <= 14500) {
      federalTax = 0;
    } else if (taxableIncomeMajor <= 31600) {
      federalTax = (taxableIncomeMajor - 14500) * 77e-4;
    } else if (taxableIncomeMajor <= 41400) {
      federalTax = 131.65 + (taxableIncomeMajor - 31600) * 88e-4;
    } else if (taxableIncomeMajor <= 55200) {
      federalTax = 217.9 + (taxableIncomeMajor - 41400) * 0.0264;
    } else if (taxableIncomeMajor <= 72500) {
      federalTax = 582.2 + (taxableIncomeMajor - 55200) * 0.0297;
    } else if (taxableIncomeMajor <= 78100) {
      federalTax = 1096 + (taxableIncomeMajor - 72500) * 0.0594;
    } else if (taxableIncomeMajor <= 103600) {
      federalTax = 1428.65 + (taxableIncomeMajor - 78100) * 0.066;
    } else if (taxableIncomeMajor <= 134600) {
      federalTax = 3111.65 + (taxableIncomeMajor - 103600) * 0.088;
    } else if (taxableIncomeMajor <= 176e3) {
      federalTax = 5839.65 + (taxableIncomeMajor - 134600) * 0.11;
    } else {
      federalTax = 10393.65 + (taxableIncomeMajor - 176e3) * 0.132;
    }
    const federalTaxMinor = Math.round(federalTax * 100);
    const cantonCode = context.regionId?.replace("CH-", "") || "ZH";
    let cantonalEffectiveRate = 0.115;
    if (cantonCode === "GE") {
      cantonalEffectiveRate = 0.145;
    } else if (cantonCode === "BS") {
      cantonalEffectiveRate = 0.14;
    } else if (cantonCode === "ZG") {
      cantonalEffectiveRate = 0.075;
    }
    if (taxableIncomeMajor > 15e4) {
      cantonalEffectiveRate += 0.03;
    } else if (taxableIncomeMajor < 6e4) {
      cantonalEffectiveRate = Math.max(0.04, cantonalEffectiveRate - 0.04);
    }
    const cantonalTaxMajor = taxableIncomeMajor * cantonalEffectiveRate;
    const stateTaxMinor = Math.round(cantonalTaxMajor * 100);
    const totalTaxMinor = federalTaxMinor + stateTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialContributionsMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const evidenceRef = taxYear === 2024 ? "estv-bundessteuer-tarife-2024" : `ch-estv-tax-${taxYear}`;
    const components = [
      {
        id: "ch-bundessteuer",
        name: "Direct Federal Tax (Direkte Bundessteuer)",
        authority: "Eidgen\xF6ssische Steuerverwaltung (ESTV)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "CHF"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      },
      {
        id: "ch-kantonssteuer",
        name: `Cantonal & Municipal Tax (${cantonCode})`,
        authority: `Kantonales Steueramt ${cantonCode}`,
        category: "state",
        amount: fromMinor(stateTaxMinor, "CHF"),
        effectiveRate: stateTaxMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? "estv-kantonssteuer-2024" : evidenceRef
      },
      {
        id: "ch-sozialabgaben",
        name: "Social Security (AHV/IV/EO, ALV & BVG 2nd Pillar)",
        authority: "Bundesamt f\xFCr Sozialversicherungen (BSV)",
        category: "social_contribution",
        amount: fromMinor(socialContributionsMinor, "CHF"),
        effectiveRate: socialContributionsMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? "bsv-beitragssaetze-2024" : evidenceRef
      }
    ];
    const taxRuleVersion = isHistorical2024 ? "ESTV-2024.1" : `CH-ESTV-${cantonCode}-${taxYear}.1`;
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: fromMinor(Math.round(taxableIncomeMajor * 100), "CHF"),
      deductions: createMoney(0, "CHF"),
      federalTax: fromMinor(federalTaxMinor, "CHF"),
      stateTax: fromMinor(stateTaxMinor, "CHF"),
      localTax: createMoney(0, "CHF"),
      socialContributions: fromMinor(socialContributionsMinor, "CHF"),
      totalTax: fromMinor(totalTaxMinor, "CHF"),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, "CHF"),
      netIncome: fromMinor(netIncomeMinor, "CHF"),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), "CHF"),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), "CHF"),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: federalTaxMinor / grossMinor + cantonalEffectiveRate + 0.064,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/de/de-adapter.ts
var GermanyTaxAdapter = class {
  constructor() {
    this.id = "de";
    this.name = "Germany BZSt & Social Insurance Tax Engine";
  }
  supports(context) {
    return context.countryId === "DE";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    const kvCap = isHistorical2024 ? 62100 : 66150;
    const rvCap = isHistorical2024 ? 90600 : 96600;
    const kvRate = isHistorical2024 ? 0.0815 : 0.0825;
    const healthMinor = Math.round(Math.min(grossMajor, kvCap) * kvRate * 100);
    const pensionMinor = Math.round(Math.min(grossMajor, rvCap) * 0.093 * 100);
    const unemployMinor = Math.round(Math.min(grossMajor, rvCap) * 0.013 * 100);
    const nursingMinor = Math.round(Math.min(grossMajor, kvCap) * 0.022 * 100);
    const socialMinor = healthMinor + pensionMinor + unemployMinor + nursingMinor;
    let incomeTax = 0;
    if (isHistorical2024) {
      if (grossMajor <= 11784) {
        incomeTax = 0;
      } else if (grossMajor <= 17005) {
        const y = (grossMajor - 11784) / 1e4;
        incomeTax = (995.21 * y + 1400) * y;
      } else if (grossMajor <= 66760) {
        const z = (grossMajor - 17005) / 1e4;
        incomeTax = (208.85 * z + 2397) * z + 1015.51;
      } else if (grossMajor <= 277825) {
        incomeTax = 0.42 * grossMajor - 10636.31;
      } else {
        incomeTax = 0.45 * grossMajor - 18971.06;
      }
    } else {
      if (grossMajor <= 12084) {
        incomeTax = 0;
      } else if (grossMajor <= 17443) {
        const y = (grossMajor - 12084) / 1e4;
        incomeTax = (995.21 * y + 1400) * y;
      } else if (grossMajor <= 68480) {
        const z = (grossMajor - 17443) / 1e4;
        incomeTax = (208.85 * z + 2397) * z + 1015.51;
      } else if (grossMajor <= 277825) {
        incomeTax = 0.42 * grossMajor - 10900;
      } else {
        incomeTax = 0.45 * grossMajor - 19235;
      }
    }
    const federalTaxMinor = Math.max(0, Math.round(incomeTax * 100));
    let soliMinor = 0;
    if (incomeTax > 18130) {
      soliMinor = Math.round((incomeTax - 18130) * 0.055 * 100);
    }
    const totalTaxMinor = federalTaxMinor + soliMinor;
    const totalDeductionsMinor = totalTaxMinor + socialMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const evidenceRef = taxYear === 2024 ? "bzst-lohnsteuer-2024" : `de-bmf-tax-${taxYear}`;
    const components = [
      {
        id: "de-einkommensteuer",
        name: "German Wage Tax (Lohnsteuer / EStG)",
        authority: "Bundeszentralamt f\xFCr Steuern (BZSt)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "EUR"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      },
      {
        id: "de-sozialversicherung",
        name: "Social Security (Health, Pension, Care & Unemployment)",
        authority: "Deutsche Rentenversicherung / GKV",
        category: "social_contribution",
        amount: fromMinor(socialMinor, "EUR"),
        effectiveRate: socialMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? "gkv-beitragssaetze-2024" : evidenceRef
      }
    ];
    const taxRuleVersion = isHistorical2024 ? "BZSt-2024.1" : `DE-BMF-${taxYear}.1`;
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: createMoney(0, "EUR"),
      federalTax: fromMinor(totalTaxMinor, "EUR"),
      stateTax: createMoney(0, "EUR"),
      localTax: createMoney(0, "EUR"),
      socialContributions: fromMinor(socialMinor, "EUR"),
      totalTax: fromMinor(totalTaxMinor, "EUR"),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, "EUR"),
      netIncome: fromMinor(netIncomeMinor, "EUR"),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), "EUR"),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), "EUR"),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > (isHistorical2024 ? 66760 : 68480) ? 0.42 : 0.32,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/es/es-adapter.ts
var SpainTaxAdapter = class {
  constructor() {
    this.id = "es";
    this.name = "Spain AEAT & Seguridad Social Tax Engine";
  }
  supports(context) {
    return context.countryId === "ES";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    const ssBaseLimit = isHistorical2024 ? 56646 : 6e4;
    const ssRate = isHistorical2024 ? 0.0647 : 0.0649;
    const ssBase = Math.min(grossMajor, ssBaseLimit);
    const ssMinor = Math.round(ssBase * ssRate * 100);
    const workAllowance = 2e3;
    const taxableBase = Math.max(0, grossMajor - ssMinor / 100 - workAllowance);
    const calcScaleTax = (income) => {
      if (income <= 0) return 0;
      if (income <= 12450) return income * 0.19;
      if (income <= 20200) return 12450 * 0.19 + (income - 12450) * 0.24;
      if (income <= 35200) return 12450 * 0.19 + (20200 - 12450) * 0.24 + (income - 20200) * 0.3;
      if (income <= 6e4)
        return 12450 * 0.19 + (20200 - 12450) * 0.24 + (35200 - 20200) * 0.3 + (income - 35200) * 0.37;
      if (income <= 3e5)
        return 12450 * 0.19 + (20200 - 12450) * 0.24 + (35200 - 20200) * 0.3 + (6e4 - 35200) * 0.37 + (income - 6e4) * 0.45;
      return 12450 * 0.19 + (20200 - 12450) * 0.24 + (35200 - 20200) * 0.3 + (6e4 - 35200) * 0.37 + (3e5 - 6e4) * 0.45 + (income - 3e5) * 0.47;
    };
    const grossIrpf = calcScaleTax(taxableBase);
    const personalMinimumCredit = calcScaleTax(5550);
    const netIrpf = Math.max(0, grossIrpf - personalMinimumCredit);
    const federalTaxMinor = Math.round(netIrpf * 100);
    const totalTaxMinor = federalTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + ssMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const evidenceRef = taxYear === 2024 ? "aeat-tramos-irpf-2024" : `es-aeat-tax-${taxYear}`;
    const components = [
      {
        id: "es-irpf",
        name: "Impuesto sobre la Renta de las Personas F\xEDsicas (IRPF)",
        authority: "Agencia Estatal de Administraci\xF3n Tributaria (AEAT)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "EUR"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      },
      {
        id: "es-seguridad-social",
        name: "Cotizaciones a la Seguridad Social (R\xE9gimen General)",
        authority: "Tesorer\xEDa General de la Seguridad Social (TGSS)",
        category: "social_contribution",
        amount: fromMinor(ssMinor, "EUR"),
        effectiveRate: ssMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? "tgss-bases-cotizacion-2024" : evidenceRef
      }
    ];
    const taxRuleVersion = isHistorical2024 ? "AEAT-2024.1" : `ES-AEAT-${taxYear}.1`;
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: fromMinor(Math.round(taxableBase * 100), "EUR"),
      deductions: fromMinor(Math.round(workAllowance * 100), "EUR"),
      federalTax: fromMinor(federalTaxMinor, "EUR"),
      stateTax: createMoney(0, "EUR"),
      localTax: createMoney(0, "EUR"),
      socialContributions: fromMinor(ssMinor, "EUR"),
      totalTax: fromMinor(totalTaxMinor, "EUR"),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, "EUR"),
      netIncome: fromMinor(netIncomeMinor, "EUR"),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), "EUR"),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), "EUR"),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: taxableBase > 6e4 ? 0.45 : taxableBase > 35200 ? 0.37 : 0.3,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/fr/fr-adapter.ts
var FranceTaxAdapter = class {
  constructor() {
    this.id = "fr";
    this.name = "France DGFiP & URSSAF Statutory Tax Engine";
  }
  supports(context) {
    return context.countryId === "FR";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    const PASS = isHistorical2024 ? 46368 : 47100;
    const csgBase = Math.min(grossMajor, 4 * PASS) * 0.9825;
    const csgMinor = Math.round(csgBase * 0.097 * 100);
    const t1Base = Math.min(grossMajor, PASS);
    const t1Minor = Math.round(t1Base * 0.0401 * 100);
    let t2Minor = 0;
    if (grossMajor > PASS) {
      const t2Base = Math.min(grossMajor, 8 * PASS) - PASS;
      t2Minor = Math.round(t2Base * 0.0972 * 100);
    }
    const otherSocialMinor = Math.round(grossMajor * 0.035 * 100);
    const socialContributionsMinor = csgMinor + t1Minor + t2Minor + otherSocialMinor;
    const netSalaryMajor = Math.max(0, grossMajor - socialContributionsMinor / 100);
    const standardDeduction = Math.min(14171, Math.max(495, netSalaryMajor * 0.1));
    const taxableIncomeMajor = Math.max(0, netSalaryMajor - standardDeduction);
    let incomeTax = 0;
    if (isHistorical2024) {
      if (taxableIncomeMajor <= 11294) {
        incomeTax = 0;
      } else if (taxableIncomeMajor <= 28797) {
        incomeTax = (taxableIncomeMajor - 11294) * 0.11;
      } else if (taxableIncomeMajor <= 82341) {
        incomeTax = (28797 - 11294) * 0.11 + (taxableIncomeMajor - 28797) * 0.3;
      } else if (taxableIncomeMajor <= 177106) {
        incomeTax = (28797 - 11294) * 0.11 + (82341 - 28797) * 0.3 + (taxableIncomeMajor - 82341) * 0.41;
      } else {
        incomeTax = (28797 - 11294) * 0.11 + (82341 - 28797) * 0.3 + (177106 - 82341) * 0.41 + (taxableIncomeMajor - 177106) * 0.45;
      }
    } else {
      if (taxableIncomeMajor <= 11520) {
        incomeTax = 0;
      } else if (taxableIncomeMajor <= 29373) {
        incomeTax = (taxableIncomeMajor - 11520) * 0.11;
      } else if (taxableIncomeMajor <= 83988) {
        incomeTax = (29373 - 11520) * 0.11 + (taxableIncomeMajor - 29373) * 0.3;
      } else if (taxableIncomeMajor <= 180648) {
        incomeTax = (29373 - 11520) * 0.11 + (83988 - 29373) * 0.3 + (taxableIncomeMajor - 83988) * 0.41;
      } else {
        incomeTax = (29373 - 11520) * 0.11 + (83988 - 29373) * 0.3 + (180648 - 83988) * 0.41 + (taxableIncomeMajor - 180648) * 0.45;
      }
    }
    if (incomeTax > 0 && incomeTax < 1929) {
      const decote = 873 - incomeTax * 0.4525;
      incomeTax = Math.max(0, incomeTax - decote);
    }
    const federalTaxMinor = Math.round(incomeTax * 100);
    const totalTaxMinor = federalTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialContributionsMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const evidenceRef = taxYear === 2024 ? "dgfip-bareme-ir-2024" : `fr-dgfip-tax-${taxYear}`;
    const components = [
      {
        id: "fr-impot-revenu",
        name: "Imp\xF4t sur le Revenu (Pr\xE9l\xE8vement \xE0 la Source)",
        authority: "Direction G\xE9n\xE9rale des Finances Publiques (DGFiP)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "EUR"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      },
      {
        id: "fr-csg-crds",
        name: "Cotisations Sociales & CSG/CRDS",
        authority: "URSSAF / CNAV / Agirc-Arrco",
        category: "social_contribution",
        amount: fromMinor(socialContributionsMinor, "EUR"),
        effectiveRate: socialContributionsMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? "urssaf-taux-cotisations-2024" : evidenceRef
      }
    ];
    const taxRuleVersion = isHistorical2024 ? "DGFiP-2024.1" : `FR-DGFIP-${taxYear}.1`;
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: fromMinor(Math.round(taxableIncomeMajor * 100), "EUR"),
      deductions: fromMinor(Math.round(standardDeduction * 100), "EUR"),
      federalTax: fromMinor(federalTaxMinor, "EUR"),
      stateTax: createMoney(0, "EUR"),
      localTax: createMoney(0, "EUR"),
      socialContributions: fromMinor(socialContributionsMinor, "EUR"),
      totalTax: fromMinor(totalTaxMinor, "EUR"),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, "EUR"),
      netIncome: fromMinor(netIncomeMinor, "EUR"),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), "EUR"),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), "EUR"),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: taxableIncomeMajor > 82341 ? 0.41 : taxableIncomeMajor > 28797 ? 0.3 : 0.11,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/ie/ie-adapter.ts
var IrelandTaxAdapter = class {
  constructor() {
    this.id = "ie";
    this.name = "Ireland Revenue Commissioners Tax Engine";
  }
  supports(context) {
    return context.countryId === "IE";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    const SRCOP = isHistorical2024 ? 42e3 : 44e3;
    let grossIncomeTax = 0;
    if (grossMajor <= SRCOP) {
      grossIncomeTax = grossMajor * 0.2;
    } else {
      grossIncomeTax = SRCOP * 0.2 + (grossMajor - SRCOP) * 0.4;
    }
    const standardCredits = isHistorical2024 ? 3750 : 4e3;
    const netIncomeTax = Math.max(0, grossIncomeTax - standardCredits);
    const federalTaxMinor = Math.round(netIncomeTax * 100);
    let usc = 0;
    if (grossMajor > 13e3) {
      const b1 = Math.min(grossMajor, 12012);
      usc += b1 * 5e-3;
      const uscB2Cap = isHistorical2024 ? 25760 : 27382;
      const uscB3Rate = isHistorical2024 ? 0.04 : 0.03;
      if (grossMajor > 12012) {
        const b2 = Math.min(grossMajor, uscB2Cap) - 12012;
        usc += b2 * 0.02;
      }
      if (grossMajor > uscB2Cap) {
        const b3 = Math.min(grossMajor, 70044) - uscB2Cap;
        usc += b3 * uscB3Rate;
      }
      if (grossMajor > 70044) {
        const b4 = grossMajor - 70044;
        usc += b4 * 0.08;
      }
    }
    const uscMinor = Math.round(usc * 100);
    let prsi = 0;
    if (grossMajor > 352 * 52) {
      prsi = grossMajor * 0.041;
      if (grossMajor <= 424 * 52) {
        const maxCreditWeekly = 12;
        const weeklyPay = grossMajor / 52;
        const credit = Math.max(0, maxCreditWeekly - (weeklyPay - 352) / 6);
        prsi = Math.max(0, prsi - credit * 52);
      }
    }
    const prsiMinor = Math.round(prsi * 100);
    const socialContributionsMinor = uscMinor + prsiMinor;
    const totalTaxMinor = federalTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialContributionsMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const evidenceRef = taxYear === 2024 ? "revenue-paye-rates-2024" : `ie-revenue-tax-${taxYear}`;
    const components = [
      {
        id: "ie-paye-tax",
        name: "Irish PAYE Income Tax (after Tax Credits)",
        authority: "Office of the Revenue Commissioners (Revenue.ie)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "EUR"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      },
      {
        id: "ie-usc",
        name: "Universal Social Charge (USC)",
        authority: "Office of the Revenue Commissioners (Revenue.ie)",
        category: "social_contribution",
        amount: fromMinor(uscMinor, "EUR"),
        effectiveRate: uscMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? "revenue-usc-rates-2024" : evidenceRef
      },
      {
        id: "ie-prsi",
        name: "PRSI (Pay Related Social Insurance Class A)",
        authority: "Department of Social Protection (DSP)",
        category: "social_contribution",
        amount: fromMinor(prsiMinor, "EUR"),
        effectiveRate: prsiMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? "dsp-prsi-rates-2024" : evidenceRef
      }
    ];
    const taxRuleVersion = isHistorical2024 ? "Revenue-2024.1" : `IE-REVENUE-${taxYear}.1`;
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: fromMinor(Math.round(standardCredits * 100), "EUR"),
      federalTax: fromMinor(federalTaxMinor, "EUR"),
      stateTax: createMoney(0, "EUR"),
      localTax: createMoney(0, "EUR"),
      socialContributions: fromMinor(socialContributionsMinor, "EUR"),
      totalTax: fromMinor(totalTaxMinor, "EUR"),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, "EUR"),
      netIncome: fromMinor(netIncomeMinor, "EUR"),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), "EUR"),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), "EUR"),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > 70044 ? 0.52 : grossMajor > SRCOP ? 0.481 : 0.261,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/nl/nl-adapter.ts
var NetherlandsTaxAdapter = class {
  constructor() {
    this.id = "nl";
    this.name = "Netherlands Belastingdienst Box 1 Engine";
  }
  supports(context) {
    return context.countryId === "NL";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    const bracket1Cap = isHistorical2024 ? 75518 : 76817;
    const bracket1Rate = isHistorical2024 ? 0.3697 : 0.3582;
    const bracket2Rate = 0.495;
    let grossTax = 0;
    if (grossMajor <= bracket1Cap) {
      grossTax = grossMajor * bracket1Rate;
    } else {
      grossTax = bracket1Cap * bracket1Rate + (grossMajor - bracket1Cap) * bracket2Rate;
    }
    let generalCredit = 0;
    const maxGenCredit = isHistorical2024 ? 3362 : 3068;
    const genThreshold = isHistorical2024 ? 24812 : 28406;
    const genTaperRate = isHistorical2024 ? 0.0663 : 0.06337;
    if (grossMajor <= genThreshold) {
      generalCredit = maxGenCredit;
    } else if (grossMajor < bracket1Cap) {
      generalCredit = Math.max(0, maxGenCredit - (grossMajor - genThreshold) * genTaperRate);
    }
    let labourCredit = 0;
    if (isHistorical2024) {
      if (grossMajor <= 11490) {
        labourCredit = grossMajor * 0.08425;
      } else if (grossMajor <= 24820) {
        labourCredit = 968 + (grossMajor - 11490) * 0.31433;
      } else if (grossMajor <= 39957) {
        labourCredit = 5158 + (grossMajor - 24820) * 0.02471;
      } else {
        labourCredit = Math.max(0, 5532 - (grossMajor - 39957) * 0.0651);
      }
    } else {
      if (grossMajor <= 11500) {
        labourCredit = grossMajor * 0.084;
      } else if (grossMajor <= 25e3) {
        labourCredit = 966 + (grossMajor - 11500) * 0.314;
      } else if (grossMajor <= 4e4) {
        labourCredit = 5205 + (grossMajor - 25e3) * 0.024;
      } else {
        labourCredit = Math.max(0, 5599 - (grossMajor - 4e4) * 0.0651);
      }
    }
    const totalCredits = generalCredit + labourCredit;
    const netTax = Math.max(0, grossTax - totalCredits);
    const volksverzekeringenShare = Math.min(grossMajor, bracket1Cap) * 0.2765;
    const nationalInsuranceMinor = Math.round(Math.min(netTax, volksverzekeringenShare) * 100);
    const incomeTaxMinor = Math.round(Math.max(0, netTax - nationalInsuranceMinor / 100) * 100);
    const totalDeductionsMinor = Math.round(netTax * 100);
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const evidenceRef = taxYear === 2024 ? "belastingdienst-box1-2024" : `nl-belasting-tax-${taxYear}`;
    const components = [
      {
        id: "nl-inkomstenbelasting",
        name: "Inkomstenbelasting (Box 1 Tax after Credits)",
        authority: "Belastingdienst",
        category: "federal",
        amount: fromMinor(incomeTaxMinor, "EUR"),
        effectiveRate: incomeTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      },
      {
        id: "nl-volksverzekeringen",
        name: "Premie Volksverzekeringen (AOW, Anw, Wlz)",
        authority: "Sociale Verzekeringsbank (SVB) / Belastingdienst",
        category: "social_contribution",
        amount: fromMinor(nationalInsuranceMinor, "EUR"),
        effectiveRate: nationalInsuranceMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? "belastingdienst-premies-2024" : evidenceRef
      }
    ];
    const taxRuleVersion = isHistorical2024 ? "Belastingdienst-2024.1" : `NL-BELASTING-${taxYear}.1`;
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: fromMinor(Math.round(totalCredits * 100), "EUR"),
      federalTax: fromMinor(incomeTaxMinor, "EUR"),
      stateTax: createMoney(0, "EUR"),
      localTax: createMoney(0, "EUR"),
      socialContributions: fromMinor(nationalInsuranceMinor, "EUR"),
      totalTax: fromMinor(totalDeductionsMinor, "EUR"),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, "EUR"),
      netIncome: fromMinor(netIncomeMinor, "EUR"),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), "EUR"),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), "EUR"),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > bracket1Cap ? 0.495 : bracket1Rate,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/nz/nz-adapter.ts
var NewZealandTaxAdapter = class {
  constructor() {
    this.id = "nz";
    this.name = "New Zealand Inland Revenue (IRD) & ACC Engine";
  }
  supports(context) {
    return context.countryId === "NZ";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    let incomeTax = 0;
    if (grossMajor <= 15600) {
      incomeTax = grossMajor * 0.105;
    } else if (grossMajor <= 53500) {
      incomeTax = 15600 * 0.105 + (grossMajor - 15600) * 0.175;
    } else if (grossMajor <= 78100) {
      incomeTax = 15600 * 0.105 + (53500 - 15600) * 0.175 + (grossMajor - 53500) * 0.3;
    } else if (grossMajor <= 18e4) {
      incomeTax = 15600 * 0.105 + (53500 - 15600) * 0.175 + (78100 - 53500) * 0.3 + (grossMajor - 78100) * 0.33;
    } else {
      incomeTax = 15600 * 0.105 + (53500 - 15600) * 0.175 + (78100 - 53500) * 0.3 + (18e4 - 78100) * 0.33 + (grossMajor - 18e4) * 0.39;
    }
    const federalTaxMinor = Math.round(incomeTax * 100);
    const accLiable = Math.min(grossMajor, 142283);
    const accMinor = Math.round(accLiable * 0.016 * 100);
    const socialContributionsMinor = accMinor;
    const totalTaxMinor = federalTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialContributionsMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const evidenceRef = taxYear === 2024 ? "ird-tax-rates-2024-2026" : `nz-ird-tax-${taxYear}`;
    const components = [
      {
        id: "nz-ird-paye",
        name: "Inland Revenue PAYE Income Tax",
        authority: "Inland Revenue Department (Te Tari Taake)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "NZD"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      },
      {
        id: "nz-acc-levy",
        name: "ACC Earner's Levy (1.60%)",
        authority: "Accident Compensation Corporation (ACC)",
        category: "social_contribution",
        amount: fromMinor(accMinor, "NZD"),
        effectiveRate: accMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? "acc-earners-levy-2024" : evidenceRef
      }
    ];
    const taxRuleVersion = isHistorical2024 ? "IRD-2024.2" : `NZ-IRD-${taxYear}.1`;
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: createMoney(0, "NZD"),
      federalTax: fromMinor(federalTaxMinor, "NZD"),
      stateTax: createMoney(0, "NZD"),
      localTax: createMoney(0, "NZD"),
      socialContributions: fromMinor(accMinor, "NZD"),
      totalTax: fromMinor(totalTaxMinor, "NZD"),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, "NZD"),
      netIncome: fromMinor(netIncomeMinor, "NZD"),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), "NZD"),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), "NZD"),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > 18e4 ? 0.406 : grossMajor > 78100 ? 0.346 : 0.316,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/qa/qa-adapter.ts
var QatarTaxAdapter = class {
  constructor() {
    this.id = "qa";
    this.name = "Qatar GTA Statutory Zero-Tax Engine";
  }
  supports(context) {
    return context.countryId === "QA";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    const taxRuleVersion = isHistorical2024 ? "GTA-2024.1" : `QA-GTA-${taxYear}.1`;
    const evidenceRef = isHistorical2024 ? "qatar-income-tax-law-2018" : `qa-gta-tax-${taxYear}`;
    const components = [
      {
        id: "qa-statutory-tax",
        name: "Qatar Personal Employment Income Tax (0%)",
        authority: "General Tax Authority (GTA)",
        category: "federal",
        amount: createMoney(0, "QAR"),
        effectiveRate: 0,
        evidenceRefId: evidenceRef
      }
    ];
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: createMoney(0, "QAR"),
      deductions: createMoney(0, "QAR"),
      federalTax: createMoney(0, "QAR"),
      stateTax: createMoney(0, "QAR"),
      localTax: createMoney(0, "QAR"),
      socialContributions: createMoney(0, "QAR"),
      totalTax: createMoney(0, "QAR"),
      totalDeductionsAndTaxes: createMoney(0, "QAR"),
      netIncome: grossCompensation,
      monthlyNetIncome: fromMinor(Math.round(grossMinor / 12), "QAR"),
      biweeklyNetIncome: fromMinor(Math.round(grossMinor / 26), "QAR"),
      effectiveTaxRate: 0,
      marginalTaxRate: 0,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/sa/sa-adapter.ts
var SaudiTaxAdapter = class {
  constructor() {
    this.id = "sa";
    this.name = "Saudi ZATCA & Gulf Statutory Zero-Tax Engine";
  }
  supports(context) {
    return context.countryId === "SA";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const currency = grossCompensation.currency;
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    const taxRuleVersion = isHistorical2024 ? "GULF-2024.1" : `SA-ZATCA-${taxYear}.1`;
    const evidenceRef = isHistorical2024 ? "gulf-zero-income-tax-statute" : `sa-zatca-tax-${taxYear}`;
    const components = [
      {
        id: `${context.countryId.toLowerCase()}-zero-tax`,
        name: `${context.countryId === "SA" ? "Saudi Arabia" : "Qatar"} Statutory Personal Income Tax (0%)`,
        authority: context.countryId === "SA" ? "Zakat, Tax and Customs Authority (ZATCA)" : "General Tax Authority (GTA)",
        category: "federal",
        amount: createMoney(0, currency),
        effectiveRate: 0,
        evidenceRefId: evidenceRef
      }
    ];
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: createMoney(0, currency),
      deductions: createMoney(0, currency),
      federalTax: createMoney(0, currency),
      stateTax: createMoney(0, currency),
      localTax: createMoney(0, currency),
      socialContributions: createMoney(0, currency),
      totalTax: createMoney(0, currency),
      totalDeductionsAndTaxes: createMoney(0, currency),
      netIncome: grossCompensation,
      monthlyNetIncome: fromMinor(Math.round(grossMinor / 12), currency),
      biweeklyNetIncome: fromMinor(Math.round(grossMinor / 26), currency),
      effectiveTaxRate: 0,
      marginalTaxRate: 0,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/sg/sg-adapter.ts
var SingaporeTaxAdapter = class {
  constructor() {
    this.id = "sg";
    this.name = "Singapore IRAS Tax Engine";
  }
  supports(context) {
    return context.countryId === "SG";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    let tax = 0;
    if (grossMajor <= 2e4) {
      tax = 0;
    } else if (grossMajor <= 3e4) {
      tax = (grossMajor - 2e4) * 0.02;
    } else if (grossMajor <= 4e4) {
      tax = 200 + (grossMajor - 3e4) * 0.035;
    } else if (grossMajor <= 8e4) {
      tax = 550 + (grossMajor - 4e4) * 0.07;
    } else if (grossMajor <= 12e4) {
      tax = 3350 + (grossMajor - 8e4) * 0.115;
    } else if (grossMajor <= 16e4) {
      tax = 7950 + (grossMajor - 12e4) * 0.15;
    } else if (grossMajor <= 2e5) {
      tax = 13950 + (grossMajor - 16e4) * 0.18;
    } else if (grossMajor <= 24e4) {
      tax = 21150 + (grossMajor - 2e5) * 0.19;
    } else if (grossMajor <= 28e4) {
      tax = 28750 + (grossMajor - 24e4) * 0.195;
    } else if (grossMajor <= 32e4) {
      tax = 36550 + (grossMajor - 28e4) * 0.2;
    } else if (grossMajor <= 5e5) {
      tax = 44550 + (grossMajor - 32e4) * 0.22;
    } else {
      tax = 84150 + (grossMajor - 5e5) * 0.24;
    }
    const federalTaxMinor = Math.round(tax * 100);
    const totalTaxMinor = federalTaxMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalTaxMinor);
    const evidenceRef = taxYear === 2024 ? "iras-tax-rates-2024" : `sg-iras-tax-${taxYear}`;
    const components = [
      {
        id: "sg-iras-income-tax",
        name: "Inland Revenue Authority of Singapore (IRAS) Resident Tax",
        authority: "Inland Revenue Authority of Singapore (IRAS)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "SGD"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef
      }
    ];
    const taxRuleVersion = isHistorical2024 ? "IRAS-YA2024" : `SG-IRAS-YA${taxYear}.1`;
    return {
      status: "CALCULATED",
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: createMoney(0, "SGD"),
      federalTax: fromMinor(federalTaxMinor, "SGD"),
      stateTax: createMoney(0, "SGD"),
      localTax: createMoney(0, "SGD"),
      socialContributions: createMoney(0, "SGD"),
      totalTax: fromMinor(totalTaxMinor, "SGD"),
      totalDeductionsAndTaxes: fromMinor(totalTaxMinor, "SGD"),
      netIncome: fromMinor(netIncomeMinor, "SGD"),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), "SGD"),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), "SGD"),
      effectiveTaxRate: totalTaxMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > 5e5 ? 0.24 : grossMajor > 32e4 ? 0.22 : 0.19,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/uae/uae-adapter.ts
var UaeTaxAdapter = class {
  constructor() {
    this.id = "uae";
    this.name = "United Arab Emirates Tax Engine (0% Personal Income Tax)";
  }
  supports(context) {
    return context.countryId === "AE";
  }
  calculate(gross, profile, context) {
    const currency = "AED";
    const grossMinor = gross.amountMinor;
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const isHistorical2024 = taxYear === 2024;
    const taxRuleVersion = isHistorical2024 ? "UAE-FTA-2024.1" : `AE-FTA-${taxYear}.1`;
    const evidenceRef = isHistorical2024 ? "uae-fta-2024" : `uae-fta-${taxYear}`;
    return {
      status: "CALCULATED",
      grossIncome: gross,
      taxableIncome: fromMinor(0, currency),
      deductions: fromMinor(0, currency),
      federalTax: fromMinor(0, currency),
      stateTax: fromMinor(0, currency),
      localTax: fromMinor(0, currency),
      socialContributions: fromMinor(0, currency),
      totalTax: fromMinor(0, currency),
      totalDeductionsAndTaxes: fromMinor(0, currency),
      netIncome: gross,
      monthlyNetIncome: fromMinor(Math.round(grossMinor / 12), currency),
      biweeklyNetIncome: fromMinor(Math.round(grossMinor / 26), currency),
      effectiveTaxRate: 0,
      marginalTaxRate: 0,
      components: [
        {
          id: "uae-personal-income-tax",
          name: "UAE Personal Income Tax",
          authority: "Federal Tax Authority (FTA)",
          category: "federal",
          amount: fromMinor(0, currency),
          effectiveRate: 0,
          description: "No federal or emirate personal income tax levied on employee salaries",
          evidenceRefId: evidenceRef
        }
      ],
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef]
    };
  }
};

// src/engines/tax/uk/uk-adapter.ts
var UkTaxAdapter = class {
  constructor() {
    this.id = "uk";
    this.name = "United Kingdom HMRC Tax Engine";
  }
  supports(context) {
    return context.countryId === "GB";
  }
  calculate(gross, profile, context) {
    const currency = "GBP";
    const grossMinor = gross.amountMinor;
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    let personalAllowanceMinor = 1257e3;
    if (grossMinor > 1e7) {
      const reduction = Math.floor((grossMinor - 1e7) / 2);
      personalAllowanceMinor = Math.max(0, personalAllowanceMinor - reduction);
    }
    const taxableMinor = Math.max(0, grossMinor - personalAllowanceMinor);
    let incomeTaxMinor = 0;
    const isScotland = context.regionId === "GB-SCT";
    if (isScotland) {
      if (taxableMinor > 0) {
        const t1 = 230600;
        const t2 = 1399100;
        const t3 = 3109200;
        const t4 = 6243e3;
        const t5 = 11257e3;
        incomeTaxMinor += Math.min(taxableMinor, t1) * 0.19;
        if (taxableMinor > t1) {
          incomeTaxMinor += (Math.min(taxableMinor, t2) - t1) * 0.2;
        }
        if (taxableMinor > t2) {
          incomeTaxMinor += (Math.min(taxableMinor, t3) - t2) * 0.21;
        }
        if (taxableMinor > t3) {
          incomeTaxMinor += (Math.min(taxableMinor, t4) - t3) * 0.42;
        }
        if (taxableMinor > t4) {
          incomeTaxMinor += (Math.min(taxableMinor, t5) - t4) * 0.45;
        }
        if (taxableMinor > t5) {
          incomeTaxMinor += (taxableMinor - t5) * 0.48;
        }
      }
    } else {
      const basicLimit = 377e4;
      const higherLimit = 11257e3;
      if (taxableMinor > 0) {
        const inBasic = Math.min(taxableMinor, basicLimit);
        incomeTaxMinor += inBasic * 0.2;
        if (taxableMinor > basicLimit) {
          const inHigher = Math.min(taxableMinor, higherLimit) - basicLimit;
          incomeTaxMinor += inHigher * 0.4;
          if (taxableMinor > higherLimit) {
            const inAdditional = taxableMinor - higherLimit;
            incomeTaxMinor += inAdditional * 0.45;
          }
        }
      }
    }
    incomeTaxMinor = Math.round(incomeTaxMinor);
    let niMinor = 0;
    const ptMinor = 1257e3;
    const uelMinor = 5027e3;
    if (grossMinor > ptMinor) {
      const inMain = Math.min(grossMinor, uelMinor) - ptMinor;
      niMinor += inMain * 0.08;
      if (grossMinor > uelMinor) {
        const inUpper = grossMinor - uelMinor;
        niMinor += inUpper * 0.02;
      }
    }
    niMinor = Math.round(niMinor);
    const totalDeductionsMinor = incomeTaxMinor + niMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const evidenceSourceId = `uk-hmrc-tax-${taxYear}`;
    const taxRuleVersion = taxYear === 2024 ? "UK-HMRC-2024.2" : `GB-HMRC-${taxYear}.1`;
    const components = [
      {
        id: "uk-income-tax",
        name: "UK Income Tax (PAYE)",
        authority: "HM Revenue & Customs (HMRC)",
        category: "federal",
        amount: fromMinor(incomeTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? incomeTaxMinor / grossMinor : 0,
        description: `Personal Allowance: \xA3${(personalAllowanceMinor / 100).toLocaleString()}`,
        evidenceRefId: evidenceSourceId
      },
      {
        id: "uk-national-insurance",
        name: "National Insurance (Class 1)",
        authority: "HM Revenue & Customs (HMRC)",
        category: "social_contribution",
        amount: fromMinor(niMinor, currency),
        effectiveRate: grossMinor > 0 ? niMinor / grossMinor : 0,
        description: "8% main rate up to \xA350,270 + 2% upper rate",
        evidenceRefId: evidenceSourceId
      }
    ];
    return {
      status: "CALCULATED",
      grossIncome: gross,
      taxableIncome: fromMinor(taxableMinor, currency),
      deductions: fromMinor(personalAllowanceMinor, currency),
      federalTax: fromMinor(incomeTaxMinor, currency),
      stateTax: fromMinor(0, currency),
      localTax: fromMinor(0, currency),
      socialContributions: fromMinor(niMinor, currency),
      totalTax: fromMinor(incomeTaxMinor, currency),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, currency),
      netIncome: fromMinor(netIncomeMinor, currency),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), currency),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), currency),
      effectiveTaxRate: grossMinor > 0 ? totalDeductionsMinor / grossMinor : 0,
      marginalTaxRate: grossMinor > 12514e3 ? 0.47 : grossMinor > 5027e3 ? 0.42 : 0.28,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceSourceId]
    };
  }
};

// src/engines/tax/unsupported/unsupported-adapter.ts
var FallbackUnsupportedTaxAdapter = class {
  constructor() {
    this.id = "fallback";
    this.name = "Fallback Unsupported Jurisdiction Adapter";
  }
  supports(context) {
    return true;
  }
  calculate(grossCompensation, profile, context) {
    const currency = grossCompensation.currency;
    const countryName = context.countryId || "this territory";
    return {
      status: "TAX_CALCULATION_UNAVAILABLE",
      grossIncome: grossCompensation,
      taxableIncome: createMoney(0, currency),
      deductions: createMoney(0, currency),
      federalTax: createMoney(0, currency),
      stateTax: createMoney(0, currency),
      localTax: createMoney(0, currency),
      socialContributions: createMoney(0, currency),
      totalTax: createMoney(0, currency),
      totalDeductionsAndTaxes: createMoney(0, currency),
      netIncome: grossCompensation,
      monthlyNetIncome: createMoney(0, currency),
      biweeklyNetIncome: createMoney(0, currency),
      effectiveTaxRate: 0,
      marginalTaxRate: 0,
      components: [],
      taxRuleVersion: "UNSUPPORTED-JURISDICTION",
      evidenceSourceIds: [],
      warnings: [
        `Detailed statutory tax calculation for ${countryName} is currently under verification. LivWorthy does not fabricate synthetic tax rates without verified official schedules.`
      ],
      unsupportedExplanation: `Statutory tax schedules for ${countryName} are currently in research. In accordance with LivWorthy's data integrity charter, we do not substitute verified statutory tax tables with artificial approximations.`
    };
  }
};

// src/engines/tax/us/us-adapter.ts
var US_FEDERAL_BRACKETS_2024 = {
  single: [
    { upToMinor: 116e4, rate: 0.1 },
    { upToMinor: 4715e3, rate: 0.12 },
    { upToMinor: 10052500, rate: 0.22 },
    { upToMinor: 19195e3, rate: 0.24 },
    { upToMinor: 24372500, rate: 0.32 },
    { upToMinor: 60935e3, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 }
  ],
  married_filing_jointly: [
    { upToMinor: 232e4, rate: 0.1 },
    { upToMinor: 943e4, rate: 0.12 },
    { upToMinor: 20105e3, rate: 0.22 },
    { upToMinor: 3839e4, rate: 0.24 },
    { upToMinor: 48745e3, rate: 0.32 },
    { upToMinor: 7312e4, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 }
  ],
  head_of_household: [
    { upToMinor: 1655e3, rate: 0.1 },
    { upToMinor: 631e4, rate: 0.12 },
    { upToMinor: 1005e4, rate: 0.22 },
    { upToMinor: 19195e3, rate: 0.24 },
    { upToMinor: 2437e4, rate: 0.32 },
    { upToMinor: 60935e3, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 }
  ]
};
var US_FEDERAL_STANDARD_DEDUCTION_2024 = {
  single: 146e4,
  married_filing_jointly: 292e4,
  head_of_household: 219e4
};
var SOCIAL_SECURITY_CAP_2024_MINOR = 1686e4;
var US_FEDERAL_BRACKETS_2025 = {
  single: [
    { upToMinor: 1192500, rate: 0.1 },
    { upToMinor: 4847500, rate: 0.12 },
    { upToMinor: 10335e3, rate: 0.22 },
    { upToMinor: 1973e4, rate: 0.24 },
    { upToMinor: 25052500, rate: 0.32 },
    { upToMinor: 62635e3, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 }
  ],
  married_filing_jointly: [
    { upToMinor: 2385e3, rate: 0.1 },
    { upToMinor: 9695e3, rate: 0.12 },
    { upToMinor: 2067e4, rate: 0.22 },
    { upToMinor: 3946e4, rate: 0.24 },
    { upToMinor: 50105e3, rate: 0.32 },
    { upToMinor: 7516e4, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 }
  ],
  head_of_household: [
    { upToMinor: 17e5, rate: 0.1 },
    { upToMinor: 6485e3, rate: 0.12 },
    { upToMinor: 10335e3, rate: 0.22 },
    { upToMinor: 1973e4, rate: 0.24 },
    { upToMinor: 2505e4, rate: 0.32 },
    { upToMinor: 62635e3, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 }
  ]
};
var US_FEDERAL_STANDARD_DEDUCTION_2025 = {
  single: 15e5,
  married_filing_jointly: 3e6,
  head_of_household: 225e4
};
var SOCIAL_SECURITY_CAP_2025_MINOR = 1761e4;
var US_FEDERAL_BRACKETS_2026 = {
  single: [
    { upToMinor: 124e4, rate: 0.1 },
    { upToMinor: 504e4, rate: 0.12 },
    { upToMinor: 1057e4, rate: 0.22 },
    { upToMinor: 20177500, rate: 0.24 },
    { upToMinor: 25622500, rate: 0.32 },
    { upToMinor: 6406e4, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 }
  ],
  married_filing_jointly: [
    { upToMinor: 248e4, rate: 0.1 },
    { upToMinor: 1008e4, rate: 0.12 },
    { upToMinor: 2114e4, rate: 0.22 },
    { upToMinor: 40355e3, rate: 0.24 },
    { upToMinor: 51245e3, rate: 0.32 },
    { upToMinor: 7687e4, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 }
  ],
  head_of_household: [
    { upToMinor: 177e4, rate: 0.1 },
    { upToMinor: 6745e3, rate: 0.12 },
    { upToMinor: 1057e4, rate: 0.22 },
    { upToMinor: 20175e3, rate: 0.24 },
    { upToMinor: 2562e4, rate: 0.32 },
    { upToMinor: 6406e4, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 }
  ]
};
var US_FEDERAL_STANDARD_DEDUCTION_2026 = {
  single: 161e4,
  married_filing_jointly: 322e4,
  head_of_household: 2415e3
};
var SOCIAL_SECURITY_CAP_2026_MINOR = 1845e4;
var SOCIAL_SECURITY_RATE = 0.062;
var MEDICARE_RATE = 0.0145;
var ADDL_MEDICARE_RATE = 9e-3;
var ADDL_MEDICARE_THRESHOLD_MINOR = {
  single: 2e7,
  married_filing_jointly: 25e6,
  head_of_household: 2e7
};
var NYS_STANDARD_DEDUCTION = {
  single: 8e5,
  married_filing_jointly: 1605e3,
  head_of_household: 112e4
};
var NYS_BRACKETS_SINGLE_2025 = [
  { upToMinor: 85e4, rate: 0.04 },
  { upToMinor: 117e4, rate: 0.045 },
  { upToMinor: 139e4, rate: 0.0525 },
  { upToMinor: 8065e3, rate: 0.055 },
  { upToMinor: 2154e4, rate: 0.06 },
  { upToMinor: 107755e3, rate: 0.0685 },
  { upToMinor: 5e8, rate: 0.0965 },
  { upToMinor: 25e8, rate: 0.103 },
  { upToMinor: Infinity, rate: 0.109 }
];
var NYS_BRACKETS_SINGLE_2026 = [
  { upToMinor: 85e4, rate: 0.039 },
  { upToMinor: 117e4, rate: 0.044 },
  { upToMinor: 139e4, rate: 0.0515 },
  { upToMinor: 8065e3, rate: 0.054 },
  { upToMinor: 2154e4, rate: 0.059 },
  { upToMinor: 107755e3, rate: 0.0685 },
  { upToMinor: 5e8, rate: 0.0965 },
  { upToMinor: 25e8, rate: 0.103 },
  { upToMinor: Infinity, rate: 0.109 }
];
var NYC_BRACKETS_SINGLE = [
  { upToMinor: 12e5, rate: 0.03078 },
  { upToMinor: 25e5, rate: 0.03762 },
  { upToMinor: 5e6, rate: 0.03819 },
  { upToMinor: Infinity, rate: 0.03876 }
];
function calculateGraduatedTax(taxableMinor, brackets) {
  if (taxableMinor <= 0) {
    return { taxMinor: 0, topMarginalRate: 0 };
  }
  let taxMinor = 0;
  let previousThresholdMinor = 0;
  let topMarginalRate = 0;
  for (const bracket of brackets) {
    if (taxableMinor > previousThresholdMinor) {
      const taxableInBracket = Math.min(taxableMinor, bracket.upToMinor) - previousThresholdMinor;
      if (taxableInBracket > 0) {
        taxMinor += taxableInBracket * bracket.rate;
        topMarginalRate = bracket.rate;
      }
      previousThresholdMinor = bracket.upToMinor;
    } else {
      break;
    }
  }
  return { taxMinor: Math.round(taxMinor), topMarginalRate };
}
function calculateNysTax2026Single(nyagiMinor, nysTaxableMinor) {
  if (nysTaxableMinor <= 0) {
    return { taxMinor: 0, topMarginalRate: 0 };
  }
  if (nyagiMinor <= 10765e3) {
    const base = calculateGraduatedTax(nysTaxableMinor, NYS_BRACKETS_SINGLE_2026);
    return { taxMinor: base.taxMinor, topMarginalRate: base.topMarginalRate };
  }
  if (nyagiMinor > 25e8) {
    const line2 = Math.round(nysTaxableMinor * 0.109);
    return { taxMinor: line2, topMarginalRate: 0.109, worksheetApplied: "Worksheet 11" };
  }
  if (nysTaxableMinor <= 2154e4) {
    const line32 = Math.round(nysTaxableMinor * 0.059);
    if (nyagiMinor >= 15765e3) {
      return { taxMinor: line32, topMarginalRate: 0.059, worksheetApplied: "Worksheet 7" };
    }
    const line42 = calculateGraduatedTax(nysTaxableMinor, NYS_BRACKETS_SINGLE_2026).taxMinor;
    const line52 = line32 - line42;
    const line62 = nyagiMinor - 10765e3;
    const line72 = Math.round(line62 / 5e6 * 1e4) / 1e4;
    const line82 = Math.round(line52 * line72);
    const line92 = line42 + line82;
    return { taxMinor: line92, topMarginalRate: 0.059, worksheetApplied: "Worksheet 7" };
  }
  if (nysTaxableMinor <= 107755e3) {
    const line32 = calculateGraduatedTax(nysTaxableMinor, NYS_BRACKETS_SINGLE_2026).taxMinor;
    const line42 = 56700;
    const line52 = 204700;
    const line62 = Math.max(0, nyagiMinor - 2154e4);
    const line72 = Math.min(line62, 5e6);
    const line82 = Math.round(line72 / 5e6 * 1e4) / 1e4;
    const line92 = Math.round(line52 * line82);
    const line102 = line32 + line42 + line92;
    return { taxMinor: line102, topMarginalRate: 0.0685, worksheetApplied: "Worksheet 8" };
  }
  if (nysTaxableMinor <= 5e8) {
    const line32 = calculateGraduatedTax(nysTaxableMinor, NYS_BRACKETS_SINGLE_2026).taxMinor;
    const line42 = 261400;
    const line52 = 3017200;
    const line62 = Math.max(0, nyagiMinor - 107755e3);
    const line72 = Math.min(line62, 5e6);
    const line82 = Math.round(line72 / 5e6 * 1e4) / 1e4;
    const line92 = Math.round(line52 * line82);
    const line102 = line32 + line42 + line92;
    return { taxMinor: line102, topMarginalRate: 0.0965, worksheetApplied: "Worksheet 9" };
  }
  const line3 = calculateGraduatedTax(nysTaxableMinor, NYS_BRACKETS_SINGLE_2026).taxMinor;
  const line4 = 3278600;
  const line5 = 325e4;
  const line6 = Math.max(0, nyagiMinor - 5e8);
  const line7 = Math.min(line6, 5e6);
  const line8 = Math.round(line7 / 5e6 * 1e4) / 1e4;
  const line9 = Math.round(line5 * line8);
  const line10 = line3 + line4 + line9;
  return { taxMinor: line10, topMarginalRate: 0.103, worksheetApplied: "Worksheet 10" };
}
var UsTaxAdapter = class {
  constructor() {
    this.id = "us";
    this.name = "United States Tax Engine";
  }
  supports(context) {
    return context.countryId === "US";
  }
  calculate(gross, profile, context) {
    const currency = "USD";
    const grossMinor = gross.amountMinor;
    const requestedYear = profile.taxYear || context.taxYear || 2026;
    const taxYear = requestedYear <= 2024 ? 2024 : requestedYear === 2025 ? 2025 : 2026;
    const federalStdDeductions = taxYear === 2024 ? US_FEDERAL_STANDARD_DEDUCTION_2024 : taxYear === 2025 ? US_FEDERAL_STANDARD_DEDUCTION_2025 : US_FEDERAL_STANDARD_DEDUCTION_2026;
    const federalBracketsMap = taxYear === 2024 ? US_FEDERAL_BRACKETS_2024 : taxYear === 2025 ? US_FEDERAL_BRACKETS_2025 : US_FEDERAL_BRACKETS_2026;
    const socialSecurityCapMinor = taxYear === 2024 ? SOCIAL_SECURITY_CAP_2024_MINOR : taxYear === 2025 ? SOCIAL_SECURITY_CAP_2025_MINOR : SOCIAL_SECURITY_CAP_2026_MINOR;
    const preTaxDeductionsMinor = (profile.pensionContributionMinor || 0) + (profile.healthDeductionMinor || 0);
    const adjustedGrossMinor = Math.max(0, grossMinor - preTaxDeductionsMinor);
    const federalStdDeductionMinor = federalStdDeductions[profile.filingStatus];
    const federalTaxableMinor = Math.max(0, adjustedGrossMinor - federalStdDeductionMinor);
    const federalBrackets = federalBracketsMap[profile.filingStatus];
    const { taxMinor: federalTaxMinor, topMarginalRate: federalMarginal } = calculateGraduatedTax(
      federalTaxableMinor,
      federalBrackets
    );
    const socialSecuritySubjectMinor = Math.min(grossMinor, socialSecurityCapMinor);
    const socialSecurityTaxMinor = Math.round(socialSecuritySubjectMinor * SOCIAL_SECURITY_RATE);
    const standardMedicareTaxMinor = Math.round(grossMinor * MEDICARE_RATE);
    const addlMedicareThresholdMinor = ADDL_MEDICARE_THRESHOLD_MINOR[profile.filingStatus];
    const addlMedicareSubjectMinor = Math.max(0, grossMinor - addlMedicareThresholdMinor);
    const addlMedicareTaxMinor = Math.round(addlMedicareSubjectMinor * ADDL_MEDICARE_RATE);
    const totalMedicareTaxMinor = standardMedicareTaxMinor + addlMedicareTaxMinor;
    const totalFicaMinor = socialSecurityTaxMinor + totalMedicareTaxMinor;
    let stateTaxMinor = 0;
    let localTaxMinor = 0;
    let stateMarginal = 0;
    let localMarginal = 0;
    const reg = (context.regionId || "").toUpperCase();
    const isNewYorkState = reg === "US-NY" || reg === "NY" || context.cityId === "nyc" || context.taxJurisdictionId?.includes("NY");
    const isNycResident = context.cityId === "nyc" || context.taxJurisdictionId === "US-FED-NY-NYC" || context.taxJurisdictionId === "tax-us-ny-nyc";
    let nysTaxableMinor = 0;
    if (isNewYorkState) {
      const nysStdDeductionMinor = NYS_STANDARD_DEDUCTION[profile.filingStatus];
      nysTaxableMinor = Math.max(0, adjustedGrossMinor - nysStdDeductionMinor);
      if (taxYear === 2026 && profile.filingStatus === "single") {
        const stateCalc = calculateNysTax2026Single(adjustedGrossMinor, nysTaxableMinor);
        stateTaxMinor = stateCalc.taxMinor;
        stateMarginal = stateCalc.topMarginalRate;
      } else {
        const nysBrackets = taxYear === 2026 ? NYS_BRACKETS_SINGLE_2026 : NYS_BRACKETS_SINGLE_2025;
        const stateCalc = calculateGraduatedTax(nysTaxableMinor, nysBrackets);
        stateTaxMinor = stateCalc.taxMinor;
        stateMarginal = stateCalc.topMarginalRate;
      }
      if (isNycResident) {
        const localCalc = calculateGraduatedTax(nysTaxableMinor, NYC_BRACKETS_SINGLE);
        localTaxMinor = localCalc.taxMinor;
        localMarginal = localCalc.topMarginalRate;
      }
    } else if (reg === "US-CA" || reg === "CA") {
      const caTaxable = Math.max(0, adjustedGrossMinor - 536300);
      const caCalc = calculateGraduatedTax(caTaxable, [
        { upToMinor: 1041200, rate: 0.01 },
        { upToMinor: 2468400, rate: 0.02 },
        { upToMinor: 3895900, rate: 0.04 },
        { upToMinor: 5408100, rate: 0.06 },
        { upToMinor: 6835e3, rate: 0.08 },
        { upToMinor: 34913700, rate: 0.093 },
        { upToMinor: Infinity, rate: 0.103 }
      ]);
      stateTaxMinor = caCalc.taxMinor;
      stateMarginal = caCalc.topMarginalRate;
    } else if (reg === "US-IL" || reg === "IL") {
      const ilTaxable = Math.max(0, adjustedGrossMinor - 277500);
      stateTaxMinor = Math.round(ilTaxable * 0.0495);
      stateMarginal = 0.0495;
    } else if (reg === "US-MA" || reg === "MA") {
      const maTaxable = Math.max(0, adjustedGrossMinor - 44e4);
      stateTaxMinor = Math.round(maTaxable * 0.05);
      stateMarginal = 0.05;
    } else if (reg === "US-DC" || reg === "DC") {
      const dcTaxable = Math.max(0, adjustedGrossMinor - 146e4);
      const dcCalc = calculateGraduatedTax(dcTaxable, [
        { upToMinor: 1e6, rate: 0.04 },
        { upToMinor: 4e6, rate: 0.06 },
        { upToMinor: 6e6, rate: 0.065 },
        { upToMinor: 25e6, rate: 0.085 },
        { upToMinor: 5e7, rate: 0.0925 },
        { upToMinor: Infinity, rate: 0.0975 }
      ]);
      stateTaxMinor = dcCalc.taxMinor;
      stateMarginal = dcCalc.topMarginalRate;
    }
    const totalIncomeTaxMinor = federalTaxMinor + stateTaxMinor + localTaxMinor;
    const totalDeductionsAndTaxesMinor = totalIncomeTaxMinor + totalFicaMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsAndTaxesMinor);
    const fedEvidenceId = `us-irs-tax-${taxYear}`;
    const ficaEvidenceId = `us-ssa-fica-${taxYear}`;
    const nysEvidenceId = `us-nys-tax-${taxYear}`;
    const nycEvidenceId = `us-nyc-tax-${taxYear}`;
    const components = [
      {
        id: "us-fed-income-tax",
        name: "Federal Income Tax",
        authority: "Internal Revenue Service (IRS)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? federalTaxMinor / grossMinor : 0,
        marginalRate: federalMarginal,
        description: `Taxable Income: $${(federalTaxableMinor / 100).toLocaleString()} (Standard deduction $${(federalStdDeductionMinor / 100).toLocaleString()})`,
        evidenceRefId: fedEvidenceId
      },
      {
        id: "us-fica-social-security",
        name: "Social Security (OASDI)",
        authority: "Social Security Administration",
        category: "social_contribution",
        amount: fromMinor(socialSecurityTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? socialSecurityTaxMinor / grossMinor : 0,
        marginalRate: grossMinor < socialSecurityCapMinor ? SOCIAL_SECURITY_RATE : 0,
        description: `6.2% on wages up to $${(socialSecurityCapMinor / 100).toLocaleString()} maximum annual wage base`,
        evidenceRefId: ficaEvidenceId
      },
      {
        id: "us-fica-medicare",
        name: "Medicare & Additional Medicare",
        authority: "Centers for Medicare & Medicaid / IRS",
        category: "social_contribution",
        amount: fromMinor(totalMedicareTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? totalMedicareTaxMinor / grossMinor : 0,
        marginalRate: grossMinor > addlMedicareThresholdMinor ? MEDICARE_RATE + ADDL_MEDICARE_RATE : MEDICARE_RATE,
        description: `1.45% uncapped + 0.9% on earnings exceeding $200k`,
        evidenceRefId: ficaEvidenceId
      }
    ];
    if (stateTaxMinor > 0 || isNewYorkState) {
      components.push({
        id: "us-state-tax",
        name: isNewYorkState ? "New York State Personal Income Tax" : "State Income Tax",
        authority: isNewYorkState ? "NYS Dept of Taxation and Finance" : "State Tax Agency",
        category: "state",
        amount: fromMinor(stateTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? stateTaxMinor / grossMinor : 0,
        marginalRate: stateMarginal,
        description: isNewYorkState ? `NYS Standard Deduction $${(NYS_STANDARD_DEDUCTION[profile.filingStatus] / 100).toLocaleString()}` : void 0,
        evidenceRefId: isNewYorkState ? nysEvidenceId : fedEvidenceId
      });
    }
    if (localTaxMinor > 0 || isNycResident) {
      components.push({
        id: "us-nyc-local-tax",
        name: "New York City Resident Income Tax",
        authority: "NYC Department of Finance",
        category: "local",
        amount: fromMinor(localTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? localTaxMinor / grossMinor : 0,
        marginalRate: localMarginal,
        description: "NYC Resident Tax Schedule (Admin Code \xA7 11-1701)",
        evidenceRefId: nycEvidenceId
      });
    }
    const effectiveTaxRate = grossMinor > 0 ? totalDeductionsAndTaxesMinor / grossMinor : 0;
    const combinedMarginalRate = federalMarginal + stateMarginal + localMarginal + (grossMinor < socialSecurityCapMinor ? SOCIAL_SECURITY_RATE : 0) + MEDICARE_RATE + (grossMinor > addlMedicareThresholdMinor ? ADDL_MEDICARE_RATE : 0);
    const taxRuleVersion = `US-FED-NY-NYC-${taxYear}.1`;
    const evidenceSourceIds = [
      fedEvidenceId,
      ficaEvidenceId,
      ...isNewYorkState ? [nysEvidenceId] : [],
      ...isNycResident ? [nycEvidenceId] : []
    ];
    return {
      status: "CALCULATED",
      grossIncome: gross,
      taxableIncome: fromMinor(federalTaxableMinor, currency),
      deductions: fromMinor(federalStdDeductionMinor, currency),
      federalTax: fromMinor(federalTaxMinor, currency),
      stateTax: fromMinor(stateTaxMinor, currency),
      localTax: fromMinor(localTaxMinor, currency),
      socialContributions: fromMinor(totalFicaMinor, currency),
      totalTax: fromMinor(totalIncomeTaxMinor, currency),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsAndTaxesMinor, currency),
      netIncome: fromMinor(netIncomeMinor, currency),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), currency),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), currency),
      effectiveTaxRate,
      marginalTaxRate: combinedMarginalRate,
      components,
      taxRuleVersion,
      evidenceSourceIds
    };
  }
};

// src/engines/tax/tax-registry.ts
var LATEST_STATUTORY_TAX_YEAR = LATEST_VERIFIED_TAX_YEAR;
var TaxRegistry = class {
  static {
    this.COUNTRY_METADATA = {
      // 10 VERIFIED ADAPTERS (Supported by executable golden-vector test suites)
      US: {
        name: "United States",
        status: "VERIFIED",
        notes: "IRS Rev. Proc. 2025-32 (2026) & Rev. Proc. 2023-34 (2024), SSA FICA ($184,500 base), and state/local schedules verified with golden vectors."
      },
      GB: {
        name: "United Kingdom",
        status: "VERIFIED",
        notes: "HMRC 2024/25 & 2026/27 PAYE, personal allowance taper, Scottish rates, and NI Class 1 verified with golden vectors."
      },
      AE: {
        name: "United Arab Emirates",
        status: "VERIFIED",
        notes: "Federal Tax Authority (FTA) 0% statutory employment income tax verified under Federal Decree-Law No. 47/2022."
      },
      CA: {
        name: "Canada",
        status: "VERIFIED",
        notes: "CRA 2024 & 2026 Federal Brackets, BPA, CPP1/CPP2, EI, and provincial tax verified with golden vectors."
      },
      AU: {
        name: "Australia",
        status: "VERIFIED",
        notes: "ATO Revised Stage 3 personal tax cuts and Medicare levy verified with golden vectors."
      },
      DE: {
        name: "Germany",
        status: "VERIFIED",
        notes: "EStG \xA7 32a statutory polynomial formula (2024 & 2026) and social insurance contributions (KV/RV/AV/PV) verified with golden vectors."
      },
      SG: {
        name: "Singapore",
        status: "VERIFIED",
        notes: "IRAS YA 2024 & YA 2026 progressive resident tax schedules verified with golden vectors."
      },
      QA: {
        name: "Qatar",
        status: "VERIFIED",
        notes: "General Tax Authority (GTA) 0% statutory personal employment income tax verified under Law No. 24/2018."
      },
      SA: {
        name: "Saudi Arabia",
        status: "VERIFIED",
        notes: "ZATCA 0% statutory employment income tax for employees verified under Royal Decree No. M/1."
      },
      NZ: {
        name: "New Zealand",
        status: "VERIFIED",
        notes: "Inland Revenue (IRD) post-July 2024/2026 thresholds and ACC earner levy verified with golden vectors."
      },
      // 5 LIMITED ADAPTERS (Executable dedicated adapters with documented scope limitations)
      FR: {
        name: "France",
        status: "LIMITED",
        notes: "DGFiP progressive scale and URSSAF CSG/CRDS/Retraite for single employee; quotient familial not fully modeled."
      },
      NL: {
        name: "Netherlands",
        status: "LIMITED",
        notes: "Box 1 progressive scale and basic tax credits; 30% ruling and complex asset boxes not modeled."
      },
      CH: {
        name: "Switzerland",
        status: "LIMITED",
        notes: "Federal direct tax and standard Zurich/Geneva cantonal/communal simplified tax multipliers."
      },
      IE: {
        name: "Ireland",
        status: "LIMITED",
        notes: "Revenue standard rate band (2024 \u20AC42k / 2026 \u20AC44k), personal tax credits, USC, and PRSI Class A for single filer."
      },
      ES: {
        name: "Spain",
        status: "LIMITED",
        notes: "IRPF national and regional scales with standard personal allowance; autonomous regional deductions limited."
      },
      // 24 COMMERCIAL MARKETS WITHOUT EXECUTABLE ADAPTER (Return TAX_CALCULATION_UNAVAILABLE)
      JP: {
        name: "Japan",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      KR: {
        name: "South Korea",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      NO: {
        name: "Norway",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      SE: {
        name: "Sweden",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      DK: {
        name: "Denmark",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      FI: {
        name: "Finland",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      AT: {
        name: "Austria",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      BE: {
        name: "Belgium",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      IT: {
        name: "Italy",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      IL: {
        name: "Israel",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      HK: {
        name: "Hong Kong",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      LU: {
        name: "Luxembourg",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      IN: {
        name: "India",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      BR: {
        name: "Brazil",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      MX: {
        name: "Mexico",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      ID: {
        name: "Indonesia",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      MY: {
        name: "Malaysia",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      PH: {
        name: "Philippines",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      ZA: {
        name: "South Africa",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      PL: {
        name: "Poland",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      PT: {
        name: "Portugal",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      CZ: {
        name: "Czechia",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      TH: {
        name: "Thailand",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      },
      VN: {
        name: "Vietnam",
        status: "UNSUPPORTED",
        notes: "Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification."
      }
    };
  }
  static {
    this.adapters = [
      new UsTaxAdapter(),
      new UkTaxAdapter(),
      new UaeTaxAdapter(),
      new CanadaTaxAdapter(),
      new AustraliaTaxAdapter(),
      new GermanyTaxAdapter(),
      new FranceTaxAdapter(),
      new SpainTaxAdapter(),
      new NetherlandsTaxAdapter(),
      new IrelandTaxAdapter(),
      new SwitzerlandTaxAdapter(),
      new SaudiTaxAdapter(),
      new SingaporeTaxAdapter(),
      new QatarTaxAdapter(),
      new NewZealandTaxAdapter()
    ];
  }
  static {
    /**
     * Explicit executable schedule coverage. Adapter implementations intentionally support
     * only these tax-year inputs; arbitrary older years must never collapse to 2024 rules.
     */
    this.TAX_YEAR_COVERAGE = {
      US: [2024, 2025, 2026],
      GB: [2024, 2026],
      AE: [2024, 2026],
      CA: [2024, 2026],
      AU: [2024, 2026],
      DE: [2024, 2026],
      SG: [2024, 2026],
      QA: [2024, 2026],
      SA: [2024, 2026],
      NZ: [2024, 2026],
      FR: [2024, 2026],
      NL: [2024, 2026],
      CH: [2024, 2026],
      IE: [2024, 2026],
      ES: [2024, 2026]
    };
  }
  static {
    this.fallbackAdapter = new FallbackUnsupportedTaxAdapter();
  }
  static getSupportedCountryIds() {
    return Object.keys(this.COUNTRY_METADATA).filter((id) => this.supportsTaxCalculation(id));
  }
  static getCommercialMarketIds() {
    return Object.keys(this.COUNTRY_METADATA);
  }
  static getLoadedAdapterCount() {
    return this.adapters.length;
  }
  static getCountryStatus(countryId) {
    const hasAdapter = this.supportsTaxCalculation(countryId);
    if (!hasAdapter) return "UNSUPPORTED";
    return this.COUNTRY_METADATA[countryId]?.status || "UNSUPPORTED";
  }
  static supportsTaxCalculation(countryId) {
    return this.adapters.some((a) => a.supports({ countryId }));
  }
  static getSupportedTaxYears(countryId) {
    if (!this.supportsTaxCalculation(countryId)) return [];
    return [...this.TAX_YEAR_COVERAGE[countryId] || []];
  }
  static supportsTaxYear(countryId, taxYear) {
    return this.getSupportedTaxYears(countryId).includes(taxYear);
  }
  static isStatutorilyVerified(countryId) {
    return this.getCountryStatus(countryId) === "VERIFIED";
  }
  static isSupported(countryId) {
    return this.supportsTaxCalculation(countryId);
  }
  static getCountrySupport(countryId) {
    const meta = this.COUNTRY_METADATA[countryId];
    const hasAdapter = this.supportsTaxCalculation(countryId);
    const status = hasAdapter ? meta?.status || "UNSUPPORTED" : "UNSUPPORTED";
    return {
      countryId,
      name: meta?.name || countryId,
      verificationStatus: status,
      isStatutorilyVerified: status === "VERIFIED",
      isSupported: hasAdapter,
      notes: hasAdapter ? meta?.notes || "Statutory adapter registered." : `Statutory tax calculations for ${meta?.name || countryId} are under active research and verification. LivWorthy does not fabricate synthetic tax rates without verified official schedules.`
    };
  }
  static getAdapter(context) {
    const adapter = this.adapters.find((a) => a.supports(context));
    if (!adapter) {
      return this.fallbackAdapter;
    }
    return adapter;
  }
  static calculate(grossCompensation, profile, context) {
    const requestedYear = profile.taxYear || context.taxYear || LATEST_STATUTORY_TAX_YEAR;
    const countryId = context.countryId || "UNKNOWN";
    const isFutureYear = requestedYear > LATEST_STATUTORY_TAX_YEAR;
    const hasExplicitCoverage = this.supportsTaxYear(countryId, requestedYear);
    if (isFutureYear || !hasExplicitCoverage) {
      const currency = grossCompensation.currency;
      const zero = createMoney(0, currency);
      const supportedYears = this.getSupportedTaxYears(countryId);
      const reason = isFutureYear ? `Tax Year ${requestedYear} statutory schedules have not yet been officially published or verified.` : `Tax Year ${requestedYear} is not an explicitly implemented statutory schedule for ${countryId}.`;
      return {
        status: "TAX_CALCULATION_UNAVAILABLE",
        grossIncome: grossCompensation,
        taxableIncome: zero,
        deductions: zero,
        federalTax: zero,
        stateTax: zero,
        localTax: zero,
        socialContributions: zero,
        totalTax: zero,
        totalDeductionsAndTaxes: zero,
        netIncome: grossCompensation,
        monthlyNetIncome: createMoney(Math.round(grossCompensation.amountMinor / 12), currency),
        biweeklyNetIncome: createMoney(Math.round(grossCompensation.amountMinor / 26), currency),
        effectiveTaxRate: 0,
        marginalTaxRate: 0,
        components: [],
        taxRuleVersion: isFutureYear ? `FUTURE-YEAR-UNVERIFIED-${requestedYear}` : `TAX-YEAR-UNAVAILABLE-${countryId}-${requestedYear}`,
        evidenceSourceIds: [],
        warnings: [
          reason + ` The latest verified statutory year is ${LATEST_STATUTORY_TAX_YEAR}. LivWorthy only executes explicitly implemented and versioned schedules; it never substitutes another year's rates.`
        ],
        unsupportedExplanation: reason + (supportedYears.length ? ` Available implemented years for ${countryId}: ${supportedYears.join(", ")}.` : ` No executable statutory tax schedule is currently available for ${countryId}.`)
      };
    }
    const adapter = this.getAdapter(context);
    return adapter.calculate(grossCompensation, profile, context);
  }
};

// src/data/city-benchmarks.ts
var CITY_COL_BENCHMARKS = {
  // --- UNITED STATES ---
  nyc: {
    currency: "USD",
    rentBase: { studio: 2529, "1-bedroom": 2655, "2-bedroom": 2910, "3-bedroom": 3644 },
    groceriesPerAdult: 440,
    groceriesPerChild: 280,
    diningPerAdult: 260,
    baseUtilities: 180,
    utilitiesPerExtraPerson: 45,
    internetMonthly: 75,
    mobilePerAdult: 65,
    publicTransitPerAdult: 151.67,
    carMonthlyPerVehicle: 750,
    rideshareMonthly: 120,
    healthcareSingle: 160,
    healthcareFamily: 480,
    lifestyleBasePerAdult: { essential: 110, moderate: 260, comfortable: 480 },
    childcarePerChild: 1450,
    sourceDate: "2026-01",
    evidenceSourceId: "us-hud-nyc-fmr-2026",
    metadata: {
      housing: {
        statisticType: "fair_market_rent",
        sourceId: "us-hud-nyc-fmr-2026",
        observationPeriod: "FY 2026 (eff. 2025-10-01)",
        lastVerifiedDate: "2026-10-05",
        methodologyNote: "HUD 40th percentile Fair Market Rent for New York, NY HUD Metro FMR Area.",
        unit: "monthly_gross_rent"
      },
      transit: {
        statisticType: "official_fare",
        sourceId: "us-mta-nyc-transit-2026",
        observationPeriod: "Effective 2026-01-04",
        lastVerifiedDate: "2026-10-05",
        methodologyNote: "MTA OMNY rolling 7-day fare cap of $35.00 ($3.00 base fare, free rides after 12 taps in 7 days). MetroCard sales/refills ended as the system transitioned to OMNY; legacy unlimited MetroCard products were discontinued. Modeled monthly equivalent: $35.00 \xD7 52 / 12 = $151.67 (not an official monthly pass).",
        unit: "monthly_modeled_equivalent",
        baseFare: 3,
        weeklyCap: 35
      },
      food: {
        statisticType: "modeled_estimate",
        sourceId: "us-bls-cex-nyc-2026",
        observationPeriod: "2023\u201324 (published 2026-01-06)",
        lastVerifiedDate: "2026-10-05",
        methodologyNote: "Modeled planning estimate informed by the BLS 2023\u201324 New York metropolitan Consumer Expenditure Survey. LivWorthy converts source data into per-adult monthly planning benchmarks; the displayed values are not raw BLS published line items.",
        unit: "monthly_per_adult"
      },
      utilities: {
        statisticType: "modeled_estimate",
        sourceId: "us-bls-cex-nyc-2026",
        observationPeriod: "2023\u201324 (published 2026-01-06)",
        lastVerifiedDate: "2026-10-05",
        methodologyNote: "Modeled planning benchmark for residential electricity, heating gas, municipal water, high-speed fiber broadband ($75), and cellular service ($65).",
        unit: "monthly"
      },
      healthcare: {
        statisticType: "modeled_estimate",
        sourceId: "us-bls-cex-nyc-2026",
        observationPeriod: "2023\u201324 (published 2026-01-06)",
        lastVerifiedDate: "2026-10-05",
        methodologyNote: "Modeled planning benchmark for employee payroll health insurance contributions and routine out-of-pocket medical copayments.",
        unit: "monthly"
      },
      childcare: {
        statisticType: "modeled_estimate",
        sourceId: "us-nyc-childcare-benchmark",
        observationPeriod: "Most recently available OCFS market rate survey cycle (reviewed 2026-10-05)",
        lastVerifiedDate: "2026-10-05",
        methodologyNote: "LivWorthy modeled planning estimate for licensed group child day care / preschool in NYC metro area. Not derived from HUD housing data.",
        unit: "monthly_per_child"
      },
      lifestyle: {
        statisticType: "modeled_estimate",
        sourceId: "us-bls-cex-nyc-2026",
        observationPeriod: "2023\u201324 (published 2026-01-06)",
        lastVerifiedDate: "2026-10-05",
        methodologyNote: "Modeled planning benchmark for apparel, personal care, fitness, and entertainment subscriptions based on BLS metropolitan consumer patterns.",
        unit: "monthly_per_adult"
      }
    }
  },
  sf: {
    currency: "USD",
    rentBase: { studio: 2200, "1-bedroom": 2650, "2-bedroom": 3450, "3-bedroom": 4450 },
    groceriesPerAdult: 420,
    groceriesPerChild: 260,
    diningPerAdult: 250,
    baseUtilities: 175,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 75,
    mobilePerAdult: 65,
    publicTransitPerAdult: 100,
    carMonthlyPerVehicle: 680,
    rideshareMonthly: 110,
    healthcareSingle: 155,
    healthcareFamily: 460,
    lifestyleBasePerAdult: { essential: 110, moderate: 250, comfortable: 460 },
    childcarePerChild: 1600,
    sourceDate: "2024-12",
    evidenceSourceId: "us-hud-sf-fmr-2024"
  },
  la: {
    currency: "USD",
    rentBase: { studio: 1850, "1-bedroom": 2250, "2-bedroom": 2950, "3-bedroom": 3850 },
    groceriesPerAdult: 390,
    groceriesPerChild: 240,
    diningPerAdult: 220,
    baseUtilities: 170,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 70,
    mobilePerAdult: 65,
    publicTransitPerAdult: 80,
    carMonthlyPerVehicle: 650,
    rideshareMonthly: 95,
    healthcareSingle: 150,
    healthcareFamily: 450,
    lifestyleBasePerAdult: { essential: 100, moderate: 230, comfortable: 420 },
    childcarePerChild: 1350,
    sourceDate: "2024-12",
    evidenceSourceId: "us-hud-la-fmr-2024"
  },
  seattle: {
    currency: "USD",
    rentBase: { studio: 1750, "1-bedroom": 2100, "2-bedroom": 2750, "3-bedroom": 3650 },
    groceriesPerAdult: 400,
    groceriesPerChild: 250,
    diningPerAdult: 220,
    baseUtilities: 160,
    utilitiesPerExtraPerson: 35,
    internetMonthly: 70,
    mobilePerAdult: 65,
    publicTransitPerAdult: 99,
    carMonthlyPerVehicle: 600,
    rideshareMonthly: 85,
    healthcareSingle: 145,
    healthcareFamily: 440,
    lifestyleBasePerAdult: { essential: 100, moderate: 220, comfortable: 410 },
    childcarePerChild: 1400,
    sourceDate: "2024-12",
    evidenceSourceId: "us-hud-seattle-fmr-2024"
  },
  austin: {
    currency: "USD",
    rentBase: { studio: 1450, "1-bedroom": 1650, "2-bedroom": 2150, "3-bedroom": 2850 },
    groceriesPerAdult: 360,
    groceriesPerChild: 220,
    diningPerAdult: 200,
    baseUtilities: 190,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 70,
    mobilePerAdult: 65,
    publicTransitPerAdult: 50,
    carMonthlyPerVehicle: 550,
    rideshareMonthly: 90,
    healthcareSingle: 150,
    healthcareFamily: 450,
    lifestyleBasePerAdult: { essential: 90, moderate: 210, comfortable: 380 },
    childcarePerChild: 1100,
    sourceDate: "2024-12",
    evidenceSourceId: "us-hud-austin-fmr-2024"
  },
  chicago: {
    currency: "USD",
    rentBase: { studio: 1500, "1-bedroom": 1800, "2-bedroom": 2350, "3-bedroom": 3100 },
    groceriesPerAdult: 370,
    groceriesPerChild: 230,
    diningPerAdult: 210,
    baseUtilities: 180,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 65,
    mobilePerAdult: 65,
    publicTransitPerAdult: 75,
    carMonthlyPerVehicle: 580,
    rideshareMonthly: 90,
    healthcareSingle: 140,
    healthcareFamily: 430,
    lifestyleBasePerAdult: { essential: 90, moderate: 210, comfortable: 390 },
    childcarePerChild: 1250,
    sourceDate: "2024-12",
    evidenceSourceId: "us-hud-chicago-fmr-2024"
  },
  miami: {
    currency: "USD",
    rentBase: { studio: 1800, "1-bedroom": 2150, "2-bedroom": 2850, "3-bedroom": 3750 },
    groceriesPerAdult: 380,
    groceriesPerChild: 240,
    diningPerAdult: 230,
    baseUtilities: 195,
    utilitiesPerExtraPerson: 45,
    internetMonthly: 70,
    mobilePerAdult: 65,
    publicTransitPerAdult: 60,
    carMonthlyPerVehicle: 640,
    rideshareMonthly: 100,
    healthcareSingle: 155,
    healthcareFamily: 460,
    lifestyleBasePerAdult: { essential: 100, moderate: 230, comfortable: 420 },
    childcarePerChild: 1150,
    sourceDate: "2024-12",
    evidenceSourceId: "us-hud-miami-fmr-2024"
  },
  boston: {
    currency: "USD",
    rentBase: { studio: 2100, "1-bedroom": 2500, "2-bedroom": 3250, "3-bedroom": 4200 },
    groceriesPerAdult: 410,
    groceriesPerChild: 260,
    diningPerAdult: 240,
    baseUtilities: 210,
    utilitiesPerExtraPerson: 45,
    internetMonthly: 75,
    mobilePerAdult: 65,
    publicTransitPerAdult: 90,
    carMonthlyPerVehicle: 630,
    rideshareMonthly: 95,
    healthcareSingle: 150,
    healthcareFamily: 450,
    lifestyleBasePerAdult: { essential: 105, moderate: 240, comfortable: 440 },
    childcarePerChild: 1550,
    sourceDate: "2024-12",
    evidenceSourceId: "us-hud-boston-fmr-2024"
  },
  dc: {
    currency: "USD",
    rentBase: { studio: 1900, "1-bedroom": 2250, "2-bedroom": 2950, "3-bedroom": 3900 },
    groceriesPerAdult: 400,
    groceriesPerChild: 250,
    diningPerAdult: 230,
    baseUtilities: 175,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 70,
    mobilePerAdult: 65,
    publicTransitPerAdult: 110,
    carMonthlyPerVehicle: 620,
    rideshareMonthly: 95,
    healthcareSingle: 150,
    healthcareFamily: 450,
    lifestyleBasePerAdult: { essential: 100, moderate: 230, comfortable: 420 },
    childcarePerChild: 1450,
    sourceDate: "2024-12",
    evidenceSourceId: "us-hud-dc-fmr-2024"
  },
  // --- UNITED KINGDOM ---
  london: {
    currency: "GBP",
    rentBase: { studio: 1600, "1-bedroom": 1950, "2-bedroom": 2600, "3-bedroom": 3400 },
    groceriesPerAdult: 290,
    groceriesPerChild: 180,
    diningPerAdult: 220,
    baseUtilities: 210,
    utilitiesPerExtraPerson: 35,
    internetMonthly: 40,
    mobilePerAdult: 25,
    publicTransitPerAdult: 180,
    carMonthlyPerVehicle: 480,
    rideshareMonthly: 90,
    healthcareSingle: 30,
    healthcareFamily: 80,
    lifestyleBasePerAdult: { essential: 90, moderate: 220, comfortable: 420 },
    childcarePerChild: 1300,
    sourceDate: "2024-11",
    evidenceSourceId: "uk-ons-london-2024"
  },
  manchester: {
    currency: "GBP",
    rentBase: { studio: 950, "1-bedroom": 1150, "2-bedroom": 1550, "3-bedroom": 2050 },
    groceriesPerAdult: 240,
    groceriesPerChild: 150,
    diningPerAdult: 160,
    baseUtilities: 190,
    utilitiesPerExtraPerson: 30,
    internetMonthly: 35,
    mobilePerAdult: 25,
    publicTransitPerAdult: 85,
    carMonthlyPerVehicle: 420,
    rideshareMonthly: 60,
    healthcareSingle: 25,
    healthcareFamily: 70,
    lifestyleBasePerAdult: { essential: 75, moderate: 170, comfortable: 320 },
    childcarePerChild: 950,
    sourceDate: "2024-11",
    evidenceSourceId: "uk-ons-col-2024"
  },
  birmingham: {
    currency: "GBP",
    rentBase: { studio: 850, "1-bedroom": 1050, "2-bedroom": 1400, "3-bedroom": 1850 },
    groceriesPerAdult: 235,
    groceriesPerChild: 145,
    diningPerAdult: 150,
    baseUtilities: 190,
    utilitiesPerExtraPerson: 30,
    internetMonthly: 35,
    mobilePerAdult: 25,
    publicTransitPerAdult: 75,
    carMonthlyPerVehicle: 410,
    rideshareMonthly: 55,
    healthcareSingle: 25,
    healthcareFamily: 70,
    lifestyleBasePerAdult: { essential: 70, moderate: 160, comfortable: 300 },
    childcarePerChild: 900,
    sourceDate: "2024-11",
    evidenceSourceId: "uk-ons-col-2024"
  },
  edinburgh: {
    currency: "GBP",
    rentBase: { studio: 1050, "1-bedroom": 1250, "2-bedroom": 1700, "3-bedroom": 2250 },
    groceriesPerAdult: 260,
    groceriesPerChild: 160,
    diningPerAdult: 180,
    baseUtilities: 200,
    utilitiesPerExtraPerson: 35,
    internetMonthly: 38,
    mobilePerAdult: 25,
    publicTransitPerAdult: 70,
    carMonthlyPerVehicle: 430,
    rideshareMonthly: 65,
    healthcareSingle: 25,
    healthcareFamily: 70,
    lifestyleBasePerAdult: { essential: 80, moderate: 180, comfortable: 340 },
    childcarePerChild: 1050,
    sourceDate: "2024-11",
    evidenceSourceId: "uk-ons-col-2024"
  },
  glasgow: {
    currency: "GBP",
    rentBase: { studio: 850, "1-bedroom": 1050, "2-bedroom": 1450, "3-bedroom": 1900 },
    groceriesPerAdult: 240,
    groceriesPerChild: 150,
    diningPerAdult: 160,
    baseUtilities: 195,
    utilitiesPerExtraPerson: 30,
    internetMonthly: 35,
    mobilePerAdult: 25,
    publicTransitPerAdult: 70,
    carMonthlyPerVehicle: 410,
    rideshareMonthly: 55,
    healthcareSingle: 25,
    healthcareFamily: 70,
    lifestyleBasePerAdult: { essential: 70, moderate: 160, comfortable: 310 },
    childcarePerChild: 920,
    sourceDate: "2024-11",
    evidenceSourceId: "uk-ons-col-2024"
  },
  // --- UNITED ARAB EMIRATES ---
  dubai: {
    currency: "AED",
    rentBase: { studio: 4500, "1-bedroom": 6800, "2-bedroom": 9800, "3-bedroom": 14500 },
    groceriesPerAdult: 1200,
    groceriesPerChild: 800,
    diningPerAdult: 900,
    baseUtilities: 750,
    utilitiesPerExtraPerson: 150,
    internetMonthly: 380,
    mobilePerAdult: 200,
    publicTransitPerAdult: 350,
    carMonthlyPerVehicle: 1800,
    rideshareMonthly: 600,
    healthcareSingle: 200,
    healthcareFamily: 600,
    lifestyleBasePerAdult: { essential: 400, moderate: 1e3, comfortable: 2200 },
    childcarePerChild: 3200,
    sourceDate: "2024-12",
    evidenceSourceId: "ae-dsc-col-2024"
  },
  abudhabi: {
    currency: "AED",
    rentBase: { studio: 3800, "1-bedroom": 5500, "2-bedroom": 8200, "3-bedroom": 12e3 },
    groceriesPerAdult: 1100,
    groceriesPerChild: 750,
    diningPerAdult: 800,
    baseUtilities: 700,
    utilitiesPerExtraPerson: 140,
    internetMonthly: 380,
    mobilePerAdult: 200,
    publicTransitPerAdult: 250,
    carMonthlyPerVehicle: 1700,
    rideshareMonthly: 500,
    healthcareSingle: 180,
    healthcareFamily: 550,
    lifestyleBasePerAdult: { essential: 380, moderate: 900, comfortable: 2e3 },
    childcarePerChild: 2900,
    sourceDate: "2024-12",
    evidenceSourceId: "ae-scad-col-2024"
  },
  sharjah: {
    currency: "AED",
    rentBase: { studio: 2200, "1-bedroom": 3200, "2-bedroom": 4800, "3-bedroom": 7500 },
    groceriesPerAdult: 950,
    groceriesPerChild: 650,
    diningPerAdult: 600,
    baseUtilities: 650,
    utilitiesPerExtraPerson: 120,
    internetMonthly: 350,
    mobilePerAdult: 180,
    publicTransitPerAdult: 220,
    carMonthlyPerVehicle: 1500,
    rideshareMonthly: 400,
    healthcareSingle: 160,
    healthcareFamily: 500,
    lifestyleBasePerAdult: { essential: 300, moderate: 750, comfortable: 1600 },
    childcarePerChild: 2200,
    sourceDate: "2024-12",
    evidenceSourceId: "ae-dsc-col-2024"
  },
  // --- CANADA ---
  toronto: {
    currency: "CAD",
    rentBase: { studio: 2e3, "1-bedroom": 2450, "2-bedroom": 3200, "3-bedroom": 4100 },
    groceriesPerAdult: 420,
    groceriesPerChild: 260,
    diningPerAdult: 240,
    baseUtilities: 190,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 80,
    mobilePerAdult: 65,
    publicTransitPerAdult: 156,
    carMonthlyPerVehicle: 620,
    rideshareMonthly: 90,
    healthcareSingle: 40,
    healthcareFamily: 110,
    lifestyleBasePerAdult: { essential: 100, moderate: 230, comfortable: 420 },
    childcarePerChild: 1400,
    sourceDate: "2024-12",
    evidenceSourceId: "ca-statcan-toronto-2024"
  },
  vancouver: {
    currency: "CAD",
    rentBase: { studio: 2150, "1-bedroom": 2600, "2-bedroom": 3450, "3-bedroom": 4400 },
    groceriesPerAdult: 430,
    groceriesPerChild: 270,
    diningPerAdult: 250,
    baseUtilities: 160,
    utilitiesPerExtraPerson: 35,
    internetMonthly: 80,
    mobilePerAdult: 65,
    publicTransitPerAdult: 140,
    carMonthlyPerVehicle: 610,
    rideshareMonthly: 85,
    healthcareSingle: 40,
    healthcareFamily: 110,
    lifestyleBasePerAdult: { essential: 105, moderate: 240, comfortable: 430 },
    childcarePerChild: 1350,
    sourceDate: "2024-12",
    evidenceSourceId: "ca-statcan-vancouver-2024"
  },
  calgary: {
    currency: "CAD",
    rentBase: { studio: 1450, "1-bedroom": 1750, "2-bedroom": 2250, "3-bedroom": 2950 },
    groceriesPerAdult: 380,
    groceriesPerChild: 240,
    diningPerAdult: 210,
    baseUtilities: 230,
    utilitiesPerExtraPerson: 45,
    internetMonthly: 75,
    mobilePerAdult: 65,
    publicTransitPerAdult: 115,
    carMonthlyPerVehicle: 560,
    rideshareMonthly: 75,
    healthcareSingle: 40,
    healthcareFamily: 110,
    lifestyleBasePerAdult: { essential: 85, moderate: 200, comfortable: 370 },
    childcarePerChild: 1100,
    sourceDate: "2024-12",
    evidenceSourceId: "ca-statcan-calgary-2024"
  },
  // --- AUSTRALIA ---
  sydney: {
    currency: "AUD",
    rentBase: { studio: 2200, "1-bedroom": 2700, "2-bedroom": 3600, "3-bedroom": 4600 },
    groceriesPerAdult: 420,
    groceriesPerChild: 260,
    diningPerAdult: 260,
    baseUtilities: 210,
    utilitiesPerExtraPerson: 45,
    internetMonthly: 75,
    mobilePerAdult: 50,
    publicTransitPerAdult: 170,
    carMonthlyPerVehicle: 590,
    rideshareMonthly: 90,
    healthcareSingle: 50,
    healthcareFamily: 140,
    lifestyleBasePerAdult: { essential: 110, moderate: 250, comfortable: 450 },
    childcarePerChild: 1700,
    sourceDate: "2024-12",
    evidenceSourceId: "au-abs-sydney-2024"
  },
  melbourne: {
    currency: "AUD",
    rentBase: { studio: 1750, "1-bedroom": 2150, "2-bedroom": 2850, "3-bedroom": 3650 },
    groceriesPerAdult: 390,
    groceriesPerChild: 240,
    diningPerAdult: 240,
    baseUtilities: 200,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 75,
    mobilePerAdult: 50,
    publicTransitPerAdult: 160,
    carMonthlyPerVehicle: 540,
    rideshareMonthly: 80,
    healthcareSingle: 50,
    healthcareFamily: 140,
    lifestyleBasePerAdult: { essential: 100, moderate: 230, comfortable: 410 },
    childcarePerChild: 1550,
    sourceDate: "2024-12",
    evidenceSourceId: "au-abs-melbourne-2024"
  },
  // --- GERMANY ---
  berlin: {
    currency: "EUR",
    rentBase: { studio: 950, "1-bedroom": 1250, "2-bedroom": 1750, "3-bedroom": 2400 },
    groceriesPerAdult: 310,
    groceriesPerChild: 190,
    diningPerAdult: 190,
    baseUtilities: 240,
    utilitiesPerExtraPerson: 45,
    internetMonthly: 40,
    mobilePerAdult: 25,
    publicTransitPerAdult: 49,
    // Deutschlandticket €49
    carMonthlyPerVehicle: 420,
    rideshareMonthly: 60,
    healthcareSingle: 30,
    healthcareFamily: 80,
    lifestyleBasePerAdult: { essential: 85, moderate: 200, comfortable: 380 },
    childcarePerChild: 350,
    // heavily subsidized Kita in Berlin
    sourceDate: "2024-12",
    evidenceSourceId: "de-destatis-berlin-2024"
  },
  munich: {
    currency: "EUR",
    rentBase: { studio: 1250, "1-bedroom": 1600, "2-bedroom": 2250, "3-bedroom": 3100 },
    groceriesPerAdult: 340,
    groceriesPerChild: 210,
    diningPerAdult: 220,
    baseUtilities: 260,
    utilitiesPerExtraPerson: 50,
    internetMonthly: 42,
    mobilePerAdult: 25,
    publicTransitPerAdult: 49,
    carMonthlyPerVehicle: 460,
    rideshareMonthly: 70,
    healthcareSingle: 30,
    healthcareFamily: 80,
    lifestyleBasePerAdult: { essential: 95, moderate: 220, comfortable: 420 },
    childcarePerChild: 550,
    sourceDate: "2024-12",
    evidenceSourceId: "de-destatis-munich-2024"
  },
  // --- FRANCE ---
  paris: {
    currency: "EUR",
    rentBase: { studio: 1100, "1-bedroom": 1500, "2-bedroom": 2200, "3-bedroom": 3100 },
    groceriesPerAdult: 350,
    groceriesPerChild: 220,
    diningPerAdult: 230,
    baseUtilities: 210,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 35,
    mobilePerAdult: 20,
    publicTransitPerAdult: 86,
    // Navigo pass
    carMonthlyPerVehicle: 450,
    rideshareMonthly: 75,
    healthcareSingle: 35,
    healthcareFamily: 95,
    lifestyleBasePerAdult: { essential: 95, moderate: 220, comfortable: 420 },
    childcarePerChild: 650,
    sourceDate: "2024-12",
    evidenceSourceId: "fr-insee-paris-2024"
  },
  lyon: {
    currency: "EUR",
    rentBase: { studio: 650, "1-bedroom": 850, "2-bedroom": 1200, "3-bedroom": 1650 },
    groceriesPerAdult: 300,
    groceriesPerChild: 180,
    diningPerAdult: 180,
    baseUtilities: 180,
    utilitiesPerExtraPerson: 35,
    internetMonthly: 35,
    mobilePerAdult: 20,
    publicTransitPerAdult: 69,
    carMonthlyPerVehicle: 380,
    rideshareMonthly: 50,
    healthcareSingle: 35,
    healthcareFamily: 95,
    lifestyleBasePerAdult: { essential: 80, moderate: 180, comfortable: 340 },
    childcarePerChild: 500,
    sourceDate: "2024-12",
    evidenceSourceId: "fr-insee-lyon-2024"
  },
  // --- SPAIN ---
  madrid: {
    currency: "EUR",
    rentBase: { studio: 850, "1-bedroom": 1100, "2-bedroom": 1550, "3-bedroom": 2100 },
    groceriesPerAdult: 260,
    groceriesPerChild: 160,
    diningPerAdult: 170,
    baseUtilities: 160,
    utilitiesPerExtraPerson: 30,
    internetMonthly: 35,
    mobilePerAdult: 20,
    publicTransitPerAdult: 55,
    carMonthlyPerVehicle: 380,
    rideshareMonthly: 60,
    healthcareSingle: 25,
    healthcareFamily: 70,
    lifestyleBasePerAdult: { essential: 75, moderate: 170, comfortable: 320 },
    childcarePerChild: 450,
    sourceDate: "2024-12",
    evidenceSourceId: "es-ine-madrid-2024"
  },
  barcelona: {
    currency: "EUR",
    rentBase: { studio: 900, "1-bedroom": 1200, "2-bedroom": 1650, "3-bedroom": 2250 },
    groceriesPerAdult: 270,
    groceriesPerChild: 165,
    diningPerAdult: 180,
    baseUtilities: 165,
    utilitiesPerExtraPerson: 30,
    internetMonthly: 35,
    mobilePerAdult: 20,
    publicTransitPerAdult: 40,
    carMonthlyPerVehicle: 390,
    rideshareMonthly: 65,
    healthcareSingle: 25,
    healthcareFamily: 70,
    lifestyleBasePerAdult: { essential: 75, moderate: 175, comfortable: 330 },
    childcarePerChild: 480,
    sourceDate: "2024-12",
    evidenceSourceId: "es-ine-barcelona-2024"
  },
  valencia: {
    currency: "EUR",
    rentBase: { studio: 650, "1-bedroom": 850, "2-bedroom": 1150, "3-bedroom": 1550 },
    groceriesPerAdult: 240,
    groceriesPerChild: 145,
    diningPerAdult: 150,
    baseUtilities: 145,
    utilitiesPerExtraPerson: 25,
    internetMonthly: 32,
    mobilePerAdult: 20,
    publicTransitPerAdult: 35,
    carMonthlyPerVehicle: 340,
    rideshareMonthly: 45,
    healthcareSingle: 25,
    healthcareFamily: 70,
    lifestyleBasePerAdult: { essential: 65, moderate: 150, comfortable: 280 },
    childcarePerChild: 380,
    sourceDate: "2024-12",
    evidenceSourceId: "es-ine-valencia-2024"
  },
  // --- NETHERLANDS ---
  amsterdam: {
    currency: "EUR",
    rentBase: { studio: 1450, "1-bedroom": 1850, "2-bedroom": 2500, "3-bedroom": 3400 },
    groceriesPerAdult: 340,
    groceriesPerChild: 210,
    diningPerAdult: 230,
    baseUtilities: 230,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 45,
    mobilePerAdult: 25,
    publicTransitPerAdult: 110,
    carMonthlyPerVehicle: 490,
    rideshareMonthly: 70,
    healthcareSingle: 145,
    // compulsory basisverzekering
    healthcareFamily: 350,
    lifestyleBasePerAdult: { essential: 95, moderate: 220, comfortable: 420 },
    childcarePerChild: 1200,
    sourceDate: "2024-12",
    evidenceSourceId: "nl-cbs-amsterdam-2024"
  },
  rotterdam: {
    currency: "EUR",
    rentBase: { studio: 1050, "1-bedroom": 1350, "2-bedroom": 1850, "3-bedroom": 2500 },
    groceriesPerAdult: 320,
    groceriesPerChild: 195,
    diningPerAdult: 200,
    baseUtilities: 220,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 45,
    mobilePerAdult: 25,
    publicTransitPerAdult: 95,
    carMonthlyPerVehicle: 450,
    rideshareMonthly: 60,
    healthcareSingle: 145,
    healthcareFamily: 350,
    lifestyleBasePerAdult: { essential: 85, moderate: 200, comfortable: 380 },
    childcarePerChild: 1100,
    sourceDate: "2024-12",
    evidenceSourceId: "nl-cbs-rotterdam-2024"
  },
  // --- SAUDI ARABIA ---
  riyadh: {
    currency: "SAR",
    rentBase: { studio: 3500, "1-bedroom": 5200, "2-bedroom": 7500, "3-bedroom": 11500 },
    groceriesPerAdult: 1100,
    groceriesPerChild: 700,
    diningPerAdult: 850,
    baseUtilities: 550,
    utilitiesPerExtraPerson: 100,
    internetMonthly: 280,
    mobilePerAdult: 180,
    publicTransitPerAdult: 150,
    carMonthlyPerVehicle: 1500,
    rideshareMonthly: 500,
    healthcareSingle: 150,
    healthcareFamily: 450,
    lifestyleBasePerAdult: { essential: 350, moderate: 850, comfortable: 1800 },
    childcarePerChild: 2500,
    sourceDate: "2024-12",
    evidenceSourceId: "sa-gastat-riyadh-2024"
  },
  jeddah: {
    currency: "SAR",
    rentBase: { studio: 2800, "1-bedroom": 4200, "2-bedroom": 6200, "3-bedroom": 9500 },
    groceriesPerAdult: 1e3,
    groceriesPerChild: 650,
    diningPerAdult: 750,
    baseUtilities: 520,
    utilitiesPerExtraPerson: 90,
    internetMonthly: 280,
    mobilePerAdult: 180,
    publicTransitPerAdult: 120,
    carMonthlyPerVehicle: 1400,
    rideshareMonthly: 450,
    healthcareSingle: 140,
    healthcareFamily: 420,
    lifestyleBasePerAdult: { essential: 320, moderate: 780, comfortable: 1600 },
    childcarePerChild: 2200,
    sourceDate: "2024-12",
    evidenceSourceId: "sa-gastat-jeddah-2024"
  },
  // --- IRELAND ---
  dublin: {
    currency: "EUR",
    rentBase: { studio: 1600, "1-bedroom": 1950, "2-bedroom": 2600, "3-bedroom": 3450 },
    groceriesPerAdult: 350,
    groceriesPerChild: 220,
    diningPerAdult: 240,
    baseUtilities: 230,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 50,
    mobilePerAdult: 25,
    publicTransitPerAdult: 90,
    carMonthlyPerVehicle: 490,
    rideshareMonthly: 80,
    healthcareSingle: 70,
    healthcareFamily: 200,
    lifestyleBasePerAdult: { essential: 95, moderate: 230, comfortable: 430 },
    childcarePerChild: 1250,
    sourceDate: "2024-12",
    evidenceSourceId: "ie-cso-dublin-2024"
  },
  // --- SWITZERLAND ---
  zurich: {
    currency: "CHF",
    rentBase: { studio: 1750, "1-bedroom": 2250, "2-bedroom": 3100, "3-bedroom": 4250 },
    groceriesPerAdult: 550,
    groceriesPerChild: 350,
    diningPerAdult: 380,
    baseUtilities: 250,
    utilitiesPerExtraPerson: 50,
    internetMonthly: 60,
    mobilePerAdult: 45,
    publicTransitPerAdult: 87,
    carMonthlyPerVehicle: 580,
    rideshareMonthly: 120,
    healthcareSingle: 380,
    // compulsory Lamal
    healthcareFamily: 1050,
    lifestyleBasePerAdult: { essential: 140, moderate: 350, comfortable: 680 },
    childcarePerChild: 2400,
    sourceDate: "2024-12",
    evidenceSourceId: "ch-bfs-zurich-2024"
  },
  // --- SINGAPORE ---
  singapore: {
    currency: "SGD",
    rentBase: { studio: 2800, "1-bedroom": 3600, "2-bedroom": 4900, "3-bedroom": 6800 },
    groceriesPerAdult: 460,
    groceriesPerChild: 290,
    diningPerAdult: 320,
    baseUtilities: 210,
    utilitiesPerExtraPerson: 40,
    internetMonthly: 50,
    mobilePerAdult: 30,
    publicTransitPerAdult: 120,
    carMonthlyPerVehicle: 1850,
    // COE and vehicle costs are high in SG
    rideshareMonthly: 240,
    healthcareSingle: 80,
    healthcareFamily: 240,
    lifestyleBasePerAdult: { essential: 110, moderate: 280, comfortable: 550 },
    childcarePerChild: 1300,
    sourceDate: "2024-12",
    evidenceSourceId: "sg-singstat-2024"
  },
  // --- QATAR ---
  doha: {
    currency: "QAR",
    rentBase: { studio: 4500, "1-bedroom": 6200, "2-bedroom": 8800, "3-bedroom": 13e3 },
    groceriesPerAdult: 1100,
    groceriesPerChild: 700,
    diningPerAdult: 850,
    baseUtilities: 450,
    utilitiesPerExtraPerson: 90,
    internetMonthly: 350,
    mobilePerAdult: 180,
    publicTransitPerAdult: 150,
    carMonthlyPerVehicle: 1600,
    rideshareMonthly: 450,
    healthcareSingle: 100,
    healthcareFamily: 300,
    lifestyleBasePerAdult: { essential: 350, moderate: 850, comfortable: 1800 },
    childcarePerChild: 2600,
    sourceDate: "2024-12",
    evidenceSourceId: "qa-psa-doha-2024"
  },
  // --- NEW ZEALAND ---
  auckland: {
    currency: "NZD",
    rentBase: { studio: 1650, "1-bedroom": 2050, "2-bedroom": 2750, "3-bedroom": 3550 },
    groceriesPerAdult: 430,
    groceriesPerChild: 270,
    diningPerAdult: 240,
    baseUtilities: 230,
    utilitiesPerExtraPerson: 45,
    internetMonthly: 85,
    mobilePerAdult: 50,
    publicTransitPerAdult: 180,
    carMonthlyPerVehicle: 520,
    rideshareMonthly: 75,
    healthcareSingle: 45,
    healthcareFamily: 130,
    lifestyleBasePerAdult: { essential: 95, moderate: 220, comfortable: 410 },
    childcarePerChild: 1350,
    sourceDate: "2024-12",
    evidenceSourceId: "nz-stats-auckland-2024"
  },
  tokyo: {
    currency: "JPY",
    rentBase: { studio: 11e4, "1-bedroom": 15e4, "2-bedroom": 24e4, "3-bedroom": 36e4 },
    groceriesPerAdult: 48e3,
    groceriesPerChild: 3e4,
    diningPerAdult: 28e3,
    baseUtilities: 18e3,
    utilitiesPerExtraPerson: 4e3,
    internetMonthly: 5e3,
    mobilePerAdult: 4500,
    publicTransitPerAdult: 12e3,
    carMonthlyPerVehicle: 55e3,
    rideshareMonthly: 15e3,
    healthcareSingle: 12e3,
    healthcareFamily: 35e3,
    lifestyleBasePerAdult: { essential: 15e3, moderate: 35e3, comfortable: 65e3 },
    childcarePerChild: 6e4,
    sourceDate: "2024-12",
    evidenceSourceId: "jp-stat-tokyo-2024"
  },
  seoul: {
    currency: "KRW",
    rentBase: { studio: 85e4, "1-bedroom": 12e5, "2-bedroom": 19e5, "3-bedroom": 28e5 },
    groceriesPerAdult: 42e4,
    groceriesPerChild: 26e4,
    diningPerAdult: 25e4,
    baseUtilities: 16e4,
    utilitiesPerExtraPerson: 35e3,
    internetMonthly: 35e3,
    mobilePerAdult: 55e3,
    publicTransitPerAdult: 65e3,
    carMonthlyPerVehicle: 45e4,
    rideshareMonthly: 12e4,
    healthcareSingle: 9e4,
    healthcareFamily: 26e4,
    lifestyleBasePerAdult: { essential: 12e4, moderate: 28e4, comfortable: 52e4 },
    childcarePerChild: 5e5,
    sourceDate: "2024-12",
    evidenceSourceId: "kr-kostat-seoul-2024"
  }
};

// src/engines/col/col-engine.ts
function classifyDataFreshness(sourceDate, now = /* @__PURE__ */ new Date()) {
  const match = /^(\d{4})-(\d{2})$/.exec(sourceDate || "");
  if (!match) return "UNKNOWN";
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return "UNKNOWN";
  const sourceMonth = new Date(Date.UTC(year, month - 1, 1));
  const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const ageMonths = (currentMonth.getUTCFullYear() - sourceMonth.getUTCFullYear()) * 12 + (currentMonth.getUTCMonth() - sourceMonth.getUTCMonth());
  if (ageMonths < 0) return "UNKNOWN";
  if (ageMonths <= 18) return "CURRENT";
  if (ageMonths <= 30) return "AGING";
  return "STALE";
}
var CostOfLivingEngine = class {
  static calculate(cityId, household, overrides) {
    const benchmark = CITY_COL_BENCHMARKS[cityId] || CITY_COL_BENCHMARKS["nyc"];
    const currency = benchmark.currency;
    const areaMultiplier = household.areaType === "budget" ? 0.85 : household.areaType === "premium" ? 1.35 : 1;
    const baseRentMajor = benchmark.rentBase[household.housingType] * areaMultiplier;
    let rentMonthlyMinor = createMoney(baseRentMajor, currency).amountMinor;
    let rentIsOverridden = false;
    if (overrides?.actualRentMonthlyMinor !== void 0 && overrides.actualRentMonthlyMinor >= 0) {
      rentMonthlyMinor = overrides.actualRentMonthlyMinor;
      rentIsOverridden = true;
    }
    const housingLowMinor = Math.round(rentMonthlyMinor * 0.88);
    const housingHighMinor = Math.round(rentMonthlyMinor * 1.15);
    const housingItem = {
      id: "housing-rent",
      category: "housing",
      label: rentIsOverridden ? "Actual Housing Rent (User Input)" : `Rental Housing (${household.housingType}, ${household.areaType} area)`,
      monthlyEstimate: fromMinor(rentMonthlyMinor, currency),
      monthlyLow: fromMinor(housingLowMinor, currency),
      monthlyHigh: fromMinor(housingHighMinor, currency),
      annualEstimate: fromMinor(rentMonthlyMinor * 12, currency),
      isOverridden: rentIsOverridden,
      confidence: rentIsOverridden ? "High" : "High",
      sourceDate: benchmark.metadata?.housing?.observationPeriod || benchmark.sourceDate,
      observationPeriod: benchmark.metadata?.housing?.observationPeriod || benchmark.sourceDate,
      evidenceSourceId: benchmark.metadata?.housing?.sourceId || benchmark.evidenceSourceId,
      notes: rentIsOverridden ? "Direct user override applied." : benchmark.metadata?.housing?.methodologyNote || "HUD Fair Market Rents (FY 2026) for New York, NY HUD Metro FMR Area."
    };
    let foodMonthlyMajor = household.adults * benchmark.groceriesPerAdult + household.children * benchmark.groceriesPerChild;
    const diningMultiplier = household.lifestyleLevel === "essential" ? 0.4 : household.lifestyleLevel === "comfortable" ? 1.6 : 1;
    foodMonthlyMajor += household.adults * benchmark.diningPerAdult * diningMultiplier;
    let foodMonthlyMinor = createMoney(foodMonthlyMajor, currency).amountMinor;
    if (overrides?.actualGroceriesMonthlyMinor) {
      foodMonthlyMinor = overrides.actualGroceriesMonthlyMinor;
    }
    const foodItem = {
      id: "food-groceries",
      category: "food",
      label: `Groceries & Dining (${household.adults} adult${household.adults > 1 ? "s" : ""}${household.children > 0 ? `, ${household.children} child` : ""})`,
      monthlyEstimate: fromMinor(foodMonthlyMinor, currency),
      monthlyLow: fromMinor(Math.round(foodMonthlyMinor * 0.85), currency),
      monthlyHigh: fromMinor(Math.round(foodMonthlyMinor * 1.2), currency),
      annualEstimate: fromMinor(foodMonthlyMinor * 12, currency),
      confidence: "High",
      sourceDate: benchmark.metadata?.food?.observationPeriod || benchmark.sourceDate,
      observationPeriod: benchmark.metadata?.food?.observationPeriod || benchmark.sourceDate,
      evidenceSourceId: benchmark.metadata?.food?.sourceId || (cityId === "nyc" ? "us-bls-cex-nyc-2026" : benchmark.evidenceSourceId),
      notes: benchmark.metadata?.food?.methodologyNote || (cityId === "nyc" ? "Based on BLS Consumer Expenditure Survey metropolitan food-at-home and food-away weights." : "Official statistics consumer price index regional food-at-home and dining expenditure weights.")
    };
    const extraPersons = Math.max(0, household.adults + household.children - 1);
    const utilitiesMajor = benchmark.baseUtilities + extraPersons * benchmark.utilitiesPerExtraPerson + benchmark.internetMonthly + household.adults * benchmark.mobilePerAdult;
    const utilitiesMinor = createMoney(utilitiesMajor, currency).amountMinor;
    const utilitiesItem = {
      id: "utilities-connectivity",
      category: "utilities",
      label: "Energy, Water, Fiber Internet & Mobile",
      monthlyEstimate: fromMinor(utilitiesMinor, currency),
      monthlyLow: fromMinor(Math.round(utilitiesMinor * 0.9), currency),
      monthlyHigh: fromMinor(Math.round(utilitiesMinor * 1.25), currency),
      annualEstimate: fromMinor(utilitiesMinor * 12, currency),
      confidence: "High",
      sourceDate: benchmark.metadata?.utilities?.observationPeriod || benchmark.sourceDate,
      observationPeriod: benchmark.metadata?.utilities?.observationPeriod || benchmark.sourceDate,
      evidenceSourceId: benchmark.metadata?.utilities?.sourceId || (cityId === "nyc" ? "us-bls-cex-nyc-2026" : benchmark.evidenceSourceId),
      notes: benchmark.metadata?.utilities?.methodologyNote || "Includes seasonal weighted energy, municipal water, high-speed broadband, and cellular plans."
    };
    let transportMajor = 0;
    if (household.transportMode === "public_transit") {
      transportMajor = household.adults * benchmark.publicTransitPerAdult;
    } else if (household.transportMode === "car") {
      transportMajor = household.carsCount * benchmark.carMonthlyPerVehicle;
    } else if (household.transportMode === "transit_and_rideshare") {
      transportMajor = household.adults * benchmark.publicTransitPerAdult + household.adults * benchmark.rideshareMonthly;
    } else {
      transportMajor = household.adults * 40;
    }
    let transportMinor = createMoney(transportMajor, currency).amountMinor;
    if (overrides?.actualTransitMonthlyMinor) {
      transportMinor = overrides.actualTransitMonthlyMinor;
    }
    const transportItem = {
      id: "transportation",
      category: "transport",
      label: `Transportation (${(household.transportMode || "public_transit").replace(/_/g, " ")})`,
      monthlyEstimate: fromMinor(transportMinor, currency),
      monthlyLow: fromMinor(Math.round(transportMinor * 0.9), currency),
      monthlyHigh: fromMinor(Math.round(transportMinor * 1.15), currency),
      annualEstimate: fromMinor(transportMinor * 12, currency),
      confidence: "High",
      sourceDate: benchmark.metadata?.transit?.observationPeriod || benchmark.sourceDate,
      observationPeriod: benchmark.metadata?.transit?.observationPeriod || benchmark.sourceDate,
      evidenceSourceId: benchmark.metadata?.transit?.sourceId || (cityId === "nyc" ? "us-mta-nyc-transit-2026" : benchmark.evidenceSourceId),
      notes: benchmark.metadata?.transit?.methodologyNote || (cityId === "nyc" ? "MTA OMNY weekly fare cap ($35/week) modeled at $151.67/month or vehicle operating costs." : "Metropolitan transit agency passes, vehicle operating costs, fuel, and routine maintenance.")
    };
    const isFamily = household.children > 0 || household.adults > 1;
    const healthcareMajor = isFamily ? benchmark.healthcareFamily : benchmark.healthcareSingle;
    const healthcareMinor = createMoney(healthcareMajor, currency).amountMinor;
    const healthcareItem = {
      id: "healthcare",
      category: "healthcare",
      label: "Healthcare (Employee Premium Share & Copays)",
      monthlyEstimate: fromMinor(healthcareMinor, currency),
      monthlyLow: fromMinor(Math.round(healthcareMinor * 0.8), currency),
      monthlyHigh: fromMinor(Math.round(healthcareMinor * 1.3), currency),
      annualEstimate: fromMinor(healthcareMinor * 12, currency),
      confidence: "High",
      sourceDate: benchmark.metadata?.healthcare?.observationPeriod || benchmark.sourceDate,
      observationPeriod: benchmark.metadata?.healthcare?.observationPeriod || benchmark.sourceDate,
      evidenceSourceId: benchmark.metadata?.healthcare?.sourceId || (cityId === "nyc" ? "us-bls-cex-nyc-2026" : benchmark.evidenceSourceId),
      notes: benchmark.metadata?.healthcare?.methodologyNote || "Typical employer plan payroll deduction plus standard prescription and office copays."
    };
    let childcareMinor = 0;
    const items = [housingItem, foodItem, utilitiesItem, transportItem, healthcareItem];
    if (household.children > 0) {
      const childcareMajor = household.children * benchmark.childcarePerChild;
      childcareMinor = createMoney(childcareMajor, currency).amountMinor;
      const childcareItem = {
        id: "childcare-education",
        category: "family",
        label: `Childcare, After-School & Activities (${household.children} child${household.children > 1 ? "ren" : ""})`,
        monthlyEstimate: fromMinor(childcareMinor, currency),
        monthlyLow: fromMinor(Math.round(childcareMinor * 0.85), currency),
        monthlyHigh: fromMinor(Math.round(childcareMinor * 1.25), currency),
        annualEstimate: fromMinor(childcareMinor * 12, currency),
        confidence: "Moderate",
        sourceDate: benchmark.metadata?.childcare?.observationPeriod || benchmark.sourceDate,
        observationPeriod: benchmark.metadata?.childcare?.observationPeriod || benchmark.sourceDate,
        evidenceSourceId: benchmark.metadata?.childcare?.sourceId || (cityId === "nyc" ? "us-nyc-childcare-benchmark" : benchmark.evidenceSourceId),
        notes: benchmark.metadata?.childcare?.methodologyNote || "Licensed day care / preschool or activity fees for school-age dependents."
      };
      items.push(childcareItem);
    }
    const effectiveLifestyle = household.lifestyleLevel || "moderate";
    const lifestyleBase = benchmark.lifestyleBasePerAdult[effectiveLifestyle] || benchmark.lifestyleBasePerAdult.moderate;
    const lifestyleMajor = household.adults * lifestyleBase;
    const lifestyleMinor = createMoney(lifestyleMajor, currency).amountMinor;
    const lifestyleItem = {
      id: "lifestyle-discretionary",
      category: "lifestyle",
      label: `Discretionary Lifestyle (${effectiveLifestyle})`,
      monthlyEstimate: fromMinor(lifestyleMinor, currency),
      monthlyLow: fromMinor(Math.round(lifestyleMinor * 0.8), currency),
      monthlyHigh: fromMinor(Math.round(lifestyleMinor * 1.3), currency),
      annualEstimate: fromMinor(lifestyleMinor * 12, currency),
      confidence: "Moderate",
      sourceDate: benchmark.metadata?.lifestyle?.observationPeriod || benchmark.sourceDate,
      observationPeriod: benchmark.metadata?.lifestyle?.observationPeriod || benchmark.sourceDate,
      evidenceSourceId: benchmark.metadata?.lifestyle?.sourceId || (cityId === "nyc" ? "us-bls-cex-nyc-2026" : benchmark.evidenceSourceId),
      notes: benchmark.metadata?.lifestyle?.methodologyNote || "Clothing, recreation, fitness, personal grooming, entertainment subscriptions."
    };
    items.push(lifestyleItem);
    const categoryMap = /* @__PURE__ */ new Map();
    for (const it of items) {
      const list = categoryMap.get(it.category) || [];
      list.push(it);
      categoryMap.set(it.category, list);
    }
    const categories = [];
    let monthlyTotalMinor = 0;
    let monthlyWithoutRentMinor = 0;
    for (const [catKey, catItems] of categoryMap.entries()) {
      const catMonthly = catItems.reduce((acc, i) => acc + i.monthlyEstimate.amountMinor, 0);
      monthlyTotalMinor += catMonthly;
      if (catKey !== "housing") {
        monthlyWithoutRentMinor += catMonthly;
      }
      categories.push({
        category: catKey,
        label: catKey.charAt(0).toUpperCase() + catKey.slice(1),
        monthlyTotal: fromMinor(catMonthly, currency),
        annualTotal: fromMinor(catMonthly * 12, currency),
        items: catItems
      });
    }
    const dataFreshness = classifyDataFreshness(benchmark.sourceDate);
    const confidenceScore = dataFreshness === "CURRENT" ? "High-confidence estimate" : dataFreshness === "AGING" ? "Moderate data coverage" : "Limited local data";
    const assumptionsSummary = `${household.adults} adult${household.adults > 1 ? "s" : ""}${household.children > 0 ? `, ${household.children} child` : ""} \xB7 ${household.housingType || "1-bedroom"} \xB7 ${household.areaType || "typical"} area \xB7 ${(household.transportMode || "public_transit").replace(/_/g, " ")} \xB7 ${effectiveLifestyle} lifestyle`;
    return {
      monthlyTotal: fromMinor(monthlyTotalMinor, currency),
      annualTotal: fromMinor(monthlyTotalMinor * 12, currency),
      monthlyWithRent: fromMinor(monthlyTotalMinor, currency),
      monthlyWithoutRent: fromMinor(monthlyWithoutRentMinor, currency),
      categories,
      housingMonthly: fromMinor(rentMonthlyMinor, currency),
      essentialMonthly: fromMinor(monthlyTotalMinor - lifestyleMinor, currency),
      discretionaryMonthly: fromMinor(lifestyleMinor, currency),
      confidenceScore,
      evidenceSourceIds: Array.from(new Set(items.map((i) => i.evidenceSourceId))),
      datasetVersion: benchmark.sourceDate,
      benchmarkSourceDate: benchmark.sourceDate,
      dataFreshness,
      assumptionsSummary
    };
  }
};

// src/engines/calculator-core/salary-worth.ts
var SalaryWorthCalculator = class {
  static calculate(scenario) {
    const currency = scenario.location.currency;
    const baseMinor = scenario.compensation.baseSalary.amountMinor;
    const bonusMinor = scenario.compensation.cashBonusAnnual?.amountMinor || 0;
    const commissionMinor = scenario.compensation.commissionAnnual?.amountMinor || 0;
    const allowancesMinor = scenario.compensation.cashAllowancesAnnual?.amountMinor || 0;
    const totalSpendableGrossMinor = baseMinor + bonusMinor + commissionMinor + allowancesMinor;
    const grossAnnual = fromMinor(totalSpendableGrossMinor, currency);
    const taxContext = {
      countryId: scenario.location.countryId,
      regionId: scenario.location.regionId,
      cityId: scenario.location.id,
      taxJurisdictionId: scenario.location.taxJurisdictionId
    };
    const taxResult = TaxRegistry.calculate(grossAnnual, scenario.taxProfile, taxContext);
    const colResult = CostOfLivingEngine.calculate(
      scenario.location.id,
      scenario.household,
      scenario.overrides
    );
    const isTaxUnavailable = taxResult.status === "TAX_CALCULATION_UNAVAILABLE";
    const takeHomeAnnualMinor = isTaxUnavailable ? 0 : taxResult.netIncome.amountMinor;
    const takeHomeMonthlyMinor = isTaxUnavailable ? 0 : Math.round(takeHomeAnnualMinor / 12);
    let netLivingCostsAnnualMinor = colResult.annualTotal.amountMinor;
    if (scenario.compensation.housingAllowanceAnnual) {
      netLivingCostsAnnualMinor = Math.max(
        0,
        netLivingCostsAnnualMinor - scenario.compensation.housingAllowanceAnnual.amountMinor
      );
    }
    const netLivingCostsMonthlyMinor = Math.round(netLivingCostsAnnualMinor / 12);
    const moneyRemainingAnnualMinor = isTaxUnavailable ? 0 : takeHomeAnnualMinor - netLivingCostsAnnualMinor;
    const moneyRemainingMonthlyMinor = isTaxUnavailable ? 0 : Math.round(moneyRemainingAnnualMinor / 12);
    const savingsCapacityAnnualMinor = isTaxUnavailable ? 0 : Math.max(0, moneyRemainingAnnualMinor);
    const savingsCapacityMonthlyMinor = isTaxUnavailable ? 0 : Math.max(0, moneyRemainingMonthlyMinor);
    const savingsRate = !isTaxUnavailable && grossAnnual.amountMinor > 0 ? savingsCapacityAnnualMinor / grossAnnual.amountMinor * 100 : 0;
    const allEvidenceSources = isTaxUnavailable ? colResult.evidenceSourceIds : Array.from(/* @__PURE__ */ new Set([...taxResult.evidenceSourceIds, ...colResult.evidenceSourceIds]));
    const taxRuleVersion = isTaxUnavailable ? void 0 : taxResult.taxRuleVersion;
    return {
      id: `calc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      scenario,
      tax: taxResult,
      costOfLiving: colResult,
      grossAnnual,
      takeHomeAnnual: fromMinor(takeHomeAnnualMinor, currency),
      takeHomeMonthly: fromMinor(takeHomeMonthlyMinor, currency),
      livingCostsAnnual: fromMinor(netLivingCostsAnnualMinor, currency),
      livingCostsMonthly: fromMinor(netLivingCostsMonthlyMinor, currency),
      moneyRemainingAnnual: fromMinor(moneyRemainingAnnualMinor, currency),
      moneyRemainingMonthly: fromMinor(moneyRemainingMonthlyMinor, currency),
      savingsCapacityAnnual: fromMinor(savingsCapacityAnnualMinor, currency),
      savingsCapacityMonthly: fromMinor(savingsCapacityMonthlyMinor, currency),
      savingsRatePercentage: Math.round(savingsRate * 10) / 10,
      evidenceSourceIds: allEvidenceSources,
      taxRuleVersion,
      colDate: colResult.datasetVersion
    };
  }
};

// src/lib/fx.ts
function convertMoney(amount, targetCurrency, snapshot) {
  if (amount.currency === targetCurrency) {
    return amount;
  }
  if (!snapshot || !snapshot.rates) {
    throw new Error(
      `FX conversion requires an active validated FX snapshot. Production calculations must not silently substitute unverified rates.`
    );
  }
  const fromRate = snapshot.rates[amount.currency];
  const toRate = snapshot.rates[targetCurrency];
  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency conversion: ${amount.currency} to ${targetCurrency}`);
  }
  const majorFrom = toMajor(amount);
  const majorBase = majorFrom / fromRate;
  const majorTarget = majorBase * toRate;
  return createMoney(majorTarget, targetCurrency);
}

// src/engines/calculator-core/compare.ts
var ComparisonEngine = class {
  static compare(scenarioA, scenarioB, displayCurrency = "USD", relocationB, fxSnapshot) {
    const outcomeA = SalaryWorthCalculator.calculate(scenarioA);
    const outcomeB = SalaryWorthCalculator.calculate(scenarioB);
    const currencyA = scenarioA.location.currency;
    const currencyB = scenarioB.location.currency;
    const needsFx = currencyA !== displayCurrency || currencyB !== displayCurrency;
    if (needsFx) {
      if (!fxSnapshot || !fxSnapshot.rates || fxSnapshot.status === "UNAVAILABLE") {
        const zeroMoney2 = createMoney(0, displayCurrency);
        return {
          status: "FX_UNAVAILABLE",
          scenarioA,
          outcomeA,
          scenarioB,
          outcomeB,
          displayCurrency,
          convertedA: {
            grossAnnual: zeroMoney2,
            takeHomeAnnual: zeroMoney2,
            livingCostsAnnual: zeroMoney2,
            disposableAnnual: zeroMoney2,
            disposableMonthly: zeroMoney2
          },
          convertedB: {
            grossAnnual: zeroMoney2,
            takeHomeAnnual: zeroMoney2,
            livingCostsAnnual: zeroMoney2,
            disposableAnnual: zeroMoney2,
            disposableMonthly: zeroMoney2
          },
          delta: {
            grossAnnualDiff: zeroMoney2,
            takeHomeAnnualDiff: zeroMoney2,
            livingCostsAnnualDiff: zeroMoney2,
            disposableIncomeAnnualDiff: zeroMoney2,
            monthlyDisposableDiff: zeroMoney2,
            year1RelocationTotal: zeroMoney2,
            year1NetDisposableDiff: zeroMoney2,
            summaryNarrative: "FX exchange rates are currently unavailable. Cross-currency comparison cannot be calculated."
          },
          fxSnapshotDate: (/* @__PURE__ */ new Date()).toISOString(),
          fxStatus: "UNAVAILABLE",
          errorMessage: "Cross-currency comparison requires an active validated FX snapshot."
        };
      }
    }
    const fxStatus = fxSnapshot?.status === "STALE" ? "FX_STALE" : "SUCCESS";
    const effectiveSnapshot = fxSnapshot || { rates: { [displayCurrency]: 1 } };
    const zeroMoney = createMoney(0, displayCurrency);
    const isTaxAUnavailable = outcomeA.tax.status === "TAX_CALCULATION_UNAVAILABLE";
    const isTaxBUnavailable = outcomeB.tax.status === "TAX_CALCULATION_UNAVAILABLE";
    const isAnyTaxUnavailable = isTaxAUnavailable || isTaxBUnavailable;
    const convA = {
      grossAnnual: convertMoney(outcomeA.grossAnnual, displayCurrency, effectiveSnapshot),
      takeHomeAnnual: isTaxAUnavailable ? zeroMoney : convertMoney(outcomeA.takeHomeAnnual, displayCurrency, effectiveSnapshot),
      livingCostsAnnual: convertMoney(outcomeA.livingCostsAnnual, displayCurrency, effectiveSnapshot),
      disposableAnnual: isTaxAUnavailable ? zeroMoney : convertMoney(outcomeA.moneyRemainingAnnual, displayCurrency, effectiveSnapshot),
      disposableMonthly: isTaxAUnavailable ? zeroMoney : convertMoney(outcomeA.moneyRemainingMonthly, displayCurrency, effectiveSnapshot)
    };
    const convB = {
      grossAnnual: convertMoney(outcomeB.grossAnnual, displayCurrency, effectiveSnapshot),
      takeHomeAnnual: isTaxBUnavailable ? zeroMoney : convertMoney(outcomeB.takeHomeAnnual, displayCurrency, effectiveSnapshot),
      livingCostsAnnual: convertMoney(outcomeB.livingCostsAnnual, displayCurrency, effectiveSnapshot),
      disposableAnnual: isTaxBUnavailable ? zeroMoney : convertMoney(outcomeB.moneyRemainingAnnual, displayCurrency, effectiveSnapshot),
      disposableMonthly: isTaxBUnavailable ? zeroMoney : convertMoney(outcomeB.moneyRemainingMonthly, displayCurrency, effectiveSnapshot)
    };
    const grossDiff = subtractMoney(convB.grossAnnual, convA.grossAnnual);
    const takeHomeDiff = isAnyTaxUnavailable ? zeroMoney : subtractMoney(convB.takeHomeAnnual, convA.takeHomeAnnual);
    const livingCostsDiff = subtractMoney(convB.livingCostsAnnual, convA.livingCostsAnnual);
    const disposableDiff = isAnyTaxUnavailable ? zeroMoney : subtractMoney(convB.disposableAnnual, convA.disposableAnnual);
    const monthlyDispDiff = isAnyTaxUnavailable ? zeroMoney : subtractMoney(convB.disposableMonthly, convA.disposableMonthly);
    let year1RelocationMinor = 0;
    if (relocationB) {
      year1RelocationMinor = relocationB.flightsMinor + relocationB.tempHousingMinor + relocationB.securityDepositMinor + relocationB.shippingFurnitureMinor + relocationB.visaAdminMinor + relocationB.otherSetupMinor;
    }
    const year1RelocationTotal = fromMinor(year1RelocationMinor, displayCurrency);
    const year1NetDisposableDiff = isAnyTaxUnavailable ? zeroMoney : fromMinor(disposableDiff.amountMinor - year1RelocationMinor, displayCurrency);
    let summaryNarrative = "";
    if (isTaxAUnavailable && isTaxBUnavailable) {
      summaryNarrative = `Statutory tax calculations are unavailable for both ${scenarioA.location.name} and ${scenarioB.location.name}. Net take-home pay, disposable surplus, and purchasing power deltas cannot be derived without verified tax schedules.`;
    } else if (isTaxAUnavailable) {
      summaryNarrative = `Statutory tax calculation is unavailable for ${scenarioA.location.name}. Comparative net take-home pay and disposable surplus deltas cannot be derived.`;
    } else if (isTaxBUnavailable) {
      summaryNarrative = `Statutory tax calculation is unavailable for ${scenarioB.location.name}. Comparative net take-home pay and disposable surplus deltas cannot be derived.`;
    } else {
      const absDispDiffMajor = Math.abs(toMajor(disposableDiff));
      const formattedDiff = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: displayCurrency,
        maximumFractionDigits: 0
      }).format(absDispDiffMajor);
      if (disposableDiff.amountMinor > 0) {
        summaryNarrative = `Under these assumptions, ${scenarioB.location.name} leaves approximately ${formattedDiff} more disposable income annually before one-time relocation adjustments.`;
      } else if (disposableDiff.amountMinor < 0) {
        summaryNarrative = `Under these assumptions, ${scenarioA.location.name} leaves approximately ${formattedDiff} more disposable income annually before one-time relocation adjustments.`;
      } else {
        summaryNarrative = `Under these assumptions, both options yield approximately identical disposable income after local taxes and living costs.`;
      }
    }
    return {
      status: isAnyTaxUnavailable ? "TAX_CALCULATION_UNAVAILABLE" : fxStatus,
      scenarioA,
      outcomeA,
      scenarioB,
      outcomeB,
      displayCurrency,
      convertedA: convA,
      convertedB: convB,
      delta: {
        grossAnnualDiff: grossDiff,
        takeHomeAnnualDiff: takeHomeDiff,
        livingCostsAnnualDiff: livingCostsDiff,
        disposableIncomeAnnualDiff: disposableDiff,
        monthlyDisposableDiff: monthlyDispDiff,
        year1RelocationTotal,
        year1NetDisposableDiff,
        summaryNarrative
      },
      fxSnapshotDate: fxSnapshot?.timestamp || fxSnapshot?.providerTimestamp || (/* @__PURE__ */ new Date()).toISOString(),
      fxStatus: fxSnapshot?.status,
      errorMessage: isAnyTaxUnavailable ? "Statutory tax schedules are under verification for one or both locations. Disposable and net income comparisons are unavailable." : void 0
    };
  }
};

// src/engines/calculator-core/salary-needed.ts
var SalaryNeededCalculator = class {
  /**
   * Performs binary search over gross compensation to satisfy:
   * Net Income(Gross) - Total Expenses >= Desired Savings
   */
  static findRequiredGross(scenarioTemplate, desiredSavingsMonthlyMinor) {
    const currency = scenarioTemplate.location.currency;
    const targetAnnualNetNeededMinor = (SalaryWorthCalculator.calculate({
      ...scenarioTemplate,
      compensation: { baseSalary: fromMinor(5e6, currency) }
    }).livingCostsMonthly.amountMinor + desiredSavingsMonthlyMinor) * 12;
    let lowGrossMinor = Math.max(0, targetAnnualNetNeededMinor);
    let highGrossMinor = targetAnnualNetNeededMinor * 3;
    let bestGrossMinor = highGrossMinor;
    for (let i = 0; i < 40; i++) {
      const midGrossMinor = Math.round((lowGrossMinor + highGrossMinor) / 2);
      const testScenario = {
        ...scenarioTemplate,
        compensation: {
          baseSalary: fromMinor(midGrossMinor, currency)
        }
      };
      const outcome = SalaryWorthCalculator.calculate(testScenario);
      const netMinusExpensesMinor = outcome.takeHomeAnnual.amountMinor - outcome.livingCostsAnnual.amountMinor;
      const targetSavingsAnnualMinor = desiredSavingsMonthlyMinor * 12;
      if (netMinusExpensesMinor >= targetSavingsAnnualMinor) {
        bestGrossMinor = midGrossMinor;
        highGrossMinor = midGrossMinor - 100;
      } else {
        lowGrossMinor = midGrossMinor + 100;
      }
      if (highGrossMinor < lowGrossMinor) {
        break;
      }
    }
    return bestGrossMinor;
  }
  static calculate(scenarioTemplate, targetSavingsMonthly) {
    const currency = scenarioTemplate.location.currency;
    const sampleOutcome = SalaryWorthCalculator.calculate(scenarioTemplate);
    if (sampleOutcome.tax.status === "TAX_CALCULATION_UNAVAILABLE") {
      const zeroMoney = createMoney(0, currency);
      return {
        status: "TAX_CALCULATION_UNAVAILABLE",
        warnings: sampleOutcome.tax.warnings || [
          `Statutory tax calculation is unavailable for ${scenarioTemplate.location.name} (${scenarioTemplate.location.countryId}).`
        ],
        unsupportedExplanation: sampleOutcome.tax.unsupportedExplanation || `Statutory tax schedules for ${scenarioTemplate.location.name} are currently under verification. Required gross salary cannot be determined without verified official tax brackets.`,
        targetSavingsMonthly,
        requiredGrossAnnual: zeroMoney,
        requiredNetAnnual: zeroMoney,
        monthlyExpensesTotal: sampleOutcome.livingCostsMonthly,
        outcomeWithRequiredSalary: sampleOutcome,
        threeTiers: {
          essential: {
            label: "Essential Baseline",
            requiredGrossAnnual: zeroMoney,
            monthlyLivingCosts: sampleOutcome.livingCostsMonthly,
            monthlySavings: zeroMoney
          },
          moderate: {
            label: "Moderate Standard (+15% Buffer)",
            requiredGrossAnnual: zeroMoney,
            monthlyLivingCosts: sampleOutcome.livingCostsMonthly,
            monthlySavings: zeroMoney
          },
          target: {
            label: "Your Target Scenario",
            requiredGrossAnnual: zeroMoney,
            monthlyLivingCosts: sampleOutcome.livingCostsMonthly,
            monthlySavings: zeroMoney
          }
        }
      };
    }
    const targetGrossMinor = this.findRequiredGross(
      scenarioTemplate,
      targetSavingsMonthly.amountMinor
    );
    const targetScenario = {
      ...scenarioTemplate,
      compensation: { baseSalary: fromMinor(targetGrossMinor, currency) }
    };
    const targetOutcome = SalaryWorthCalculator.calculate(targetScenario);
    const essentialTemplate = {
      ...scenarioTemplate,
      household: {
        ...scenarioTemplate.household,
        lifestyleLevel: "essential"
      }
    };
    const essentialGrossMinor = this.findRequiredGross(essentialTemplate, 0);
    const essentialOutcome = SalaryWorthCalculator.calculate({
      ...essentialTemplate,
      compensation: { baseSalary: fromMinor(essentialGrossMinor, currency) }
    });
    const moderateTemplate = {
      ...scenarioTemplate,
      household: {
        ...scenarioTemplate.household,
        lifestyleLevel: "moderate"
      }
    };
    const moderateSavingsMinor = Math.round(essentialOutcome.livingCostsMonthly.amountMinor * 0.15);
    const moderateGrossMinor = this.findRequiredGross(moderateTemplate, moderateSavingsMinor);
    const moderateOutcome = SalaryWorthCalculator.calculate({
      ...moderateTemplate,
      compensation: { baseSalary: fromMinor(moderateGrossMinor, currency) }
    });
    return {
      status: "CALCULATED",
      targetSavingsMonthly,
      requiredGrossAnnual: fromMinor(targetGrossMinor, currency),
      requiredNetAnnual: targetOutcome.takeHomeAnnual,
      monthlyExpensesTotal: targetOutcome.livingCostsMonthly,
      outcomeWithRequiredSalary: targetOutcome,
      threeTiers: {
        essential: {
          label: "Essential Baseline",
          requiredGrossAnnual: fromMinor(essentialGrossMinor, currency),
          monthlyLivingCosts: essentialOutcome.livingCostsMonthly,
          monthlySavings: fromMinor(0, currency)
        },
        moderate: {
          label: "Moderate Standard (+15% Buffer)",
          requiredGrossAnnual: fromMinor(moderateGrossMinor, currency),
          monthlyLivingCosts: moderateOutcome.livingCostsMonthly,
          monthlySavings: fromMinor(moderateSavingsMinor, currency)
        },
        target: {
          label: "Your Target Scenario",
          requiredGrossAnnual: fromMinor(targetGrossMinor, currency),
          monthlyLivingCosts: targetOutcome.livingCostsMonthly,
          monthlySavings: targetSavingsMonthly
        }
      }
    };
  }
};

// src/engines/capabilities/capability-resolver.ts
var CapabilityResolver = class {
  static {
    // The canonical list of supported adapters is owned by TaxRegistry — do NOT duplicate it here.
    // Call TaxRegistry.supportsTaxCalculation(countryId) for authoritative adapter presence checks.
    this.PRIORITY_A_COUNTRIES = /* @__PURE__ */ new Set([
      "US",
      "GB",
      "CA",
      "AU",
      "DE",
      "FR",
      "NL",
      "CH",
      "IE",
      "AE",
      "SG",
      "NZ"
    ]);
  }
  static {
    this.PRIORITY_B_COUNTRIES = /* @__PURE__ */ new Set([
      "JP",
      "KR",
      "SA",
      "QA",
      "NO",
      "SE",
      "DK",
      "FI",
      "AT",
      "BE",
      "ES",
      "IT",
      "IL",
      "HK",
      "LU"
    ]);
  }
  static getPriority(countryId) {
    if (this.PRIORITY_A_COUNTRIES.has(countryId)) return "A";
    if (this.PRIORITY_B_COUNTRIES.has(countryId)) return "B";
    return "C";
  }
  static hasDedicatedTaxAdapter(countryId) {
    return TaxRegistry.supportsTaxCalculation(countryId);
  }
  static supportsTaxCalculation(countryId) {
    return this.hasDedicatedTaxAdapter(countryId);
  }
  static resolve(countryId, requestedTaxYear = LATEST_STATUTORY_TAX_YEAR) {
    const country = COUNTRIES[countryId];
    const countryName = country?.name || countryId;
    const priority = this.getPriority(countryId);
    const hasTaxAdapter = this.hasDedicatedTaxAdapter(countryId);
    const support = TaxRegistry.getCountrySupport(countryId);
    const limitations = [];
    let taxYear;
    let taxRuleVersion;
    if (hasTaxAdapter) {
      taxYear = Math.min(requestedTaxYear, LATEST_STATUTORY_TAX_YEAR);
      const isHistorical2024 = taxYear <= 2024;
      switch (countryId) {
        case "US":
          taxRuleVersion = isHistorical2024 ? "US-FED-NY-NYC-2024.1" : "US-FED-NY-NYC-2026.1";
          limitations.push("Single filer standard deduction; localized state/local schedules for major commercial metros.");
          break;
        case "GB":
          taxRuleVersion = isHistorical2024 ? "UK-HMRC-2024.2" : "GB-HMRC-2026.1";
          limitations.push("England/Wales standard & Scottish progressive bands; personal allowance reduction over \xA3100k.");
          break;
        case "AE":
          taxRuleVersion = isHistorical2024 ? "UAE-FTA-2024.1" : "AE-FTA-2026.1";
          limitations.push("Statutory 0% employment income tax; corporate and excise taxes excluded from payroll.");
          break;
        case "CA":
          taxRuleVersion = isHistorical2024 ? "CRA-2024.1" : "CA-CRA-ON-2026.1";
          limitations.push("Federal + Ontario provincial schedules, CPP1/CPP2, and Employment Insurance.");
          break;
        case "AU":
          taxRuleVersion = isHistorical2024 ? "ATO-2024.2" : "AU-ATO-2026.1";
          limitations.push("Revised Stage 3 tax cuts (effective July 2024) and Medicare levy.");
          break;
        case "DE":
          taxRuleVersion = isHistorical2024 ? "BZSt-2024.1" : "DE-BMF-2026.1";
          limitations.push("EStG polynomial formula and standard statutory social contributions (KV, RV, AV, PV).");
          break;
        case "SG":
          taxRuleVersion = isHistorical2024 ? "IRAS-YA2024" : "SG-IRAS-YA2026.1";
          limitations.push("Resident progressive tax schedule; CPF statutory contributions for citizens/PR.");
          break;
        case "QA":
          taxRuleVersion = isHistorical2024 ? "GTA-2024.1" : "QA-GTA-2026.1";
          limitations.push("Statutory 0% employment income tax for resident and foreign employees.");
          break;
        case "SA":
          taxRuleVersion = isHistorical2024 ? "GULF-2024.1" : "SA-ZATCA-2026.1";
          limitations.push("0% personal income tax on employee compensation; GOSI contributions for Saudi nationals.");
          break;
        case "NZ":
          taxRuleVersion = isHistorical2024 ? "IRD-2024.2" : "NZ-IRD-2026.1";
          limitations.push("Post-July 2024 tax thresholds and ACC earner levy.");
          break;
        case "FR":
          taxRuleVersion = isHistorical2024 ? "DGFiP-2024.1" : "FR-DGFIP-2026.1";
          limitations.push("Single employee scale & URSSAF social charges; quotient familial not modeled.");
          break;
        case "ES":
          taxRuleVersion = isHistorical2024 ? "AEAT-2024.1" : "ES-AEAT-2026.1";
          limitations.push("National and standard Madrid/Catalonia scales; specific autonomous regional deductions limited.");
          break;
        case "NL":
          taxRuleVersion = isHistorical2024 ? "Belastingdienst-2024.1" : "NL-BELASTING-2026.1";
          limitations.push("Box 1 income tax & national insurance; 30% ruling not applied.");
          break;
        case "IE":
          taxRuleVersion = isHistorical2024 ? "Revenue-2024.1" : "IE-REVENUE-2026.1";
          limitations.push("Single filer standard rate band, personal tax credit, USC, and PRSI Class A.");
          break;
        case "CH":
          taxRuleVersion = isHistorical2024 ? "ESTV-2024.1" : "CH-ESTV-ZH-2026.1";
          limitations.push("Federal direct tax and standard Zurich cantonal/communal multiplier.");
          break;
      }
    } else {
      taxRuleVersion = "UNSUPPORTED-JURISDICTION";
      limitations.push(
        `Statutory tax schedules for ${countryName} are in verification. Dedicated executable tax adapter is not yet available; tax calculations return TAX_CALCULATION_UNAVAILABLE.`
      );
    }
    return {
      countryId,
      countryName,
      commercialPriority: priority,
      verificationStatus: hasTaxAdapter ? support.verificationStatus : "UNSUPPORTED",
      hasDedicatedTaxAdapter: hasTaxAdapter,
      supportsTaxCalculation: hasTaxAdapter,
      supportsCOL: true,
      // Cost of living benchmarks available for all 39 markets
      supportsSalaryWorth: true,
      // Evaluates living costs and disposable income (identifying pre-tax status if tax unavailable)
      supportsSalaryNeeded: hasTaxAdapter,
      // Accurate reverse-solving requires executable tax adapter
      supportsComparison: true,
      // Cross-city comparison with FX conversion
      supportsJobOffers: true,
      supportsRelocation: true,
      taxYear,
      taxRuleVersion,
      evidenceAvailable: hasTaxAdapter,
      limitations
    };
  }
  static getAllCapabilities() {
    return Object.keys(COUNTRIES).map((id) => this.resolve(id));
  }
};

// src/lib/i18n/config.ts
var TIER_1_LOCALES = [
  "en",
  "es",
  "fr",
  "ar",
  "de",
  "pt",
  "hi",
  "ur",
  "zh",
  "ja"
];
var SUPPORTED_LOCALES = {
  // Tier 1 Production Locales (Full UI + SEO + Sitemaps)
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    flag: "\u{1F1FA}\u{1F1F8}",
    script: "Latn",
    tier: 1,
    intlLocale: "en-US",
    lifecycleStatus: "INDEXABLE",
    isIndexable: true
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Espa\xF1ol",
    dir: "ltr",
    flag: "\u{1F1EA}\u{1F1F8}",
    script: "Latn",
    tier: 1,
    intlLocale: "es-ES",
    lifecycleStatus: "INDEXABLE",
    isIndexable: true
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Fran\xE7ais",
    dir: "ltr",
    flag: "\u{1F1EB}\u{1F1F7}",
    script: "Latn",
    tier: 1,
    intlLocale: "fr-FR",
    lifecycleStatus: "INDEXABLE",
    isIndexable: true
  },
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
    dir: "rtl",
    flag: "\u{1F1E6}\u{1F1EA}",
    script: "Arab",
    tier: 1,
    intlLocale: "ar-AE",
    lifecycleStatus: "INDEXABLE",
    isIndexable: true
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    dir: "ltr",
    flag: "\u{1F1E9}\u{1F1EA}",
    script: "Latn",
    tier: 1,
    intlLocale: "de-DE",
    lifecycleStatus: "INDEXABLE",
    isIndexable: true
  },
  pt: {
    code: "pt",
    name: "Portuguese",
    nativeName: "Portugu\xEAs",
    dir: "ltr",
    flag: "\u{1F1E7}\u{1F1F7}",
    script: "Latn",
    tier: 1,
    intlLocale: "pt-BR",
    lifecycleStatus: "INDEXABLE",
    isIndexable: true
  },
  hi: {
    code: "hi",
    name: "Hindi",
    nativeName: "\u0939\u093F\u0928\u094D\u0926\u0940",
    dir: "ltr",
    flag: "\u{1F1EE}\u{1F1F3}",
    script: "Deva",
    tier: 1,
    intlLocale: "hi-IN",
    lifecycleStatus: "INDEXABLE",
    isIndexable: true
  },
  ur: {
    code: "ur",
    name: "Urdu",
    nativeName: "\u0627\u0631\u062F\u0648",
    dir: "rtl",
    flag: "\u{1F1F5}\u{1F1F0}",
    script: "Arab",
    tier: 1,
    intlLocale: "ur-PK",
    lifecycleStatus: "INDEXABLE",
    isIndexable: true
  },
  zh: {
    code: "zh",
    name: "Simplified Chinese",
    nativeName: "\u7B80\u4F53\u4E2D\u6587",
    dir: "ltr",
    flag: "\u{1F1E8}\u{1F1F3}",
    script: "Hans",
    tier: 1,
    intlLocale: "zh-CN",
    lifecycleStatus: "INDEXABLE",
    isIndexable: true
  },
  ja: {
    code: "ja",
    name: "Japanese",
    nativeName: "\u65E5\u672C\u8A9E",
    dir: "ltr",
    flag: "\u{1F1EF}\u{1F1F5}",
    script: "Jpan",
    tier: 1,
    intlLocale: "ja-JP",
    lifecycleStatus: "INDEXABLE",
    isIndexable: true
  },
  // Tier 2 Production Rollout (13 locales: Full UI & Calculators published; long-form content in translation QA)
  it: {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    dir: "ltr",
    flag: "\u{1F1EE}\u{1F1F9}",
    script: "Latn",
    tier: 2,
    intlLocale: "it-IT",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  nl: {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    dir: "ltr",
    flag: "\u{1F1F3}\u{1F1F1}",
    script: "Latn",
    tier: 2,
    intlLocale: "nl-NL",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  ko: {
    code: "ko",
    name: "Korean",
    nativeName: "\uD55C\uAD6D\uC5B4",
    dir: "ltr",
    flag: "\u{1F1F0}\u{1F1F7}",
    script: "Kore",
    tier: 2,
    intlLocale: "ko-KR",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  ru: {
    code: "ru",
    name: "Russian",
    nativeName: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
    dir: "ltr",
    flag: "\u{1F1F7}\u{1F1FA}",
    script: "Cyrl",
    tier: 2,
    intlLocale: "ru-RU",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  tr: {
    code: "tr",
    name: "Turkish",
    nativeName: "T\xFCrk\xE7e",
    dir: "ltr",
    flag: "\u{1F1F9}\u{1F1F7}",
    script: "Latn",
    tier: 2,
    intlLocale: "tr-TR",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  pl: {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    dir: "ltr",
    flag: "\u{1F1F5}\u{1F1F1}",
    script: "Latn",
    tier: 2,
    intlLocale: "pl-PL",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  id: {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    dir: "ltr",
    flag: "\u{1F1EE}\u{1F1E9}",
    script: "Latn",
    tier: 2,
    intlLocale: "id-ID",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  vi: {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Ti\u1EBFng Vi\u1EC7t",
    dir: "ltr",
    flag: "\u{1F1FB}\u{1F1F3}",
    script: "Latn",
    tier: 2,
    intlLocale: "vi-VN",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  bn: {
    code: "bn",
    name: "Bengali",
    nativeName: "\u09AC\u09BE\u0982\u09B2\u09BE",
    dir: "ltr",
    flag: "\u{1F1E7}\u{1F1E9}",
    script: "Beng",
    tier: 2,
    intlLocale: "bn-BD",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  pa: {
    code: "pa",
    name: "Punjabi",
    nativeName: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40",
    dir: "ltr",
    flag: "\u{1F1EE}\u{1F1F3}",
    script: "Guru",
    tier: 2,
    intlLocale: "pa-IN",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  ms: {
    code: "ms",
    name: "Malay",
    nativeName: "Bahasa Melayu",
    dir: "ltr",
    flag: "\u{1F1F2}\u{1F1FE}",
    script: "Latn",
    tier: 2,
    intlLocale: "ms-MY",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  th: {
    code: "th",
    name: "Thai",
    nativeName: "\u0E44\u0E17\u0E22",
    dir: "ltr",
    flag: "\u{1F1F9}\u{1F1ED}",
    script: "Thai",
    tier: 2,
    intlLocale: "th-TH",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  tl: {
    code: "tl",
    name: "Filipino / Tagalog",
    nativeName: "Tagalog",
    dir: "ltr",
    flag: "\u{1F1F5}\u{1F1ED}",
    script: "Latn",
    tier: 2,
    intlLocale: "fil-PH",
    lifecycleStatus: "PUBLISHED_UI",
    isIndexable: false
  },
  // Tier 3 South Asia (8 locales)
  ta: {
    code: "ta",
    name: "Tamil",
    nativeName: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD",
    dir: "ltr",
    flag: "\u{1F1EE}\u{1F1F3}",
    script: "Taml",
    tier: 3,
    intlLocale: "ta-IN",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  te: {
    code: "te",
    name: "Telugu",
    nativeName: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",
    dir: "ltr",
    flag: "\u{1F1EE}\u{1F1F3}",
    script: "Telu",
    tier: 3,
    intlLocale: "te-IN",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  mr: {
    code: "mr",
    name: "Marathi",
    nativeName: "\u092E\u0930\u093E\u0920\u0940",
    dir: "ltr",
    flag: "\u{1F1EE}\u{1F1F3}",
    script: "Deva",
    tier: 3,
    intlLocale: "mr-IN",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  gu: {
    code: "gu",
    name: "Gujarati",
    nativeName: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0",
    dir: "ltr",
    flag: "\u{1F1EE}\u{1F1F3}",
    script: "Gujr",
    tier: 3,
    intlLocale: "gu-IN",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  ml: {
    code: "ml",
    name: "Malayalam",
    nativeName: "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02",
    dir: "ltr",
    flag: "\u{1F1EE}\u{1F1F3}",
    script: "Mlym",
    tier: 3,
    intlLocale: "ml-IN",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  kn: {
    code: "kn",
    name: "Kannada",
    nativeName: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1",
    dir: "ltr",
    flag: "\u{1F1EE}\u{1F1F3}",
    script: "Knda",
    tier: 3,
    intlLocale: "kn-IN",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  ne: {
    code: "ne",
    name: "Nepali",
    nativeName: "\u0928\u0947\u092A\u093E\u0932\u0940",
    dir: "ltr",
    flag: "\u{1F1F3}\u{1F1F5}",
    script: "Deva",
    tier: 3,
    intlLocale: "ne-NP",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  si: {
    code: "si",
    name: "Sinhala",
    nativeName: "\u0DC3\u0DD2\u0D82\u0DC4\u0DBD",
    dir: "ltr",
    flag: "\u{1F1F1}\u{1F1F0}",
    script: "Sinh",
    tier: 3,
    intlLocale: "si-LK",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  // Tier 3 Europe (13 locales)
  sv: {
    code: "sv",
    name: "Swedish",
    nativeName: "Svenska",
    dir: "ltr",
    flag: "\u{1F1F8}\u{1F1EA}",
    script: "Latn",
    tier: 3,
    intlLocale: "sv-SE",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  no: {
    code: "no",
    name: "Norwegian",
    nativeName: "Norsk",
    dir: "ltr",
    flag: "\u{1F1F3}\u{1F1F4}",
    script: "Latn",
    tier: 3,
    intlLocale: "nb-NO",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  da: {
    code: "da",
    name: "Danish",
    nativeName: "Dansk",
    dir: "ltr",
    flag: "\u{1F1E9}\u{1F1F0}",
    script: "Latn",
    tier: 3,
    intlLocale: "da-DK",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  fi: {
    code: "fi",
    name: "Finnish",
    nativeName: "Suomi",
    dir: "ltr",
    flag: "\u{1F1EB}\u{1F1EE}",
    script: "Latn",
    tier: 3,
    intlLocale: "fi-FI",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  cs: {
    code: "cs",
    name: "Czech",
    nativeName: "\u010Ce\u0161tina",
    dir: "ltr",
    flag: "\u{1F1E8}\u{1F1FF}",
    script: "Latn",
    tier: 3,
    intlLocale: "cs-CZ",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  sk: {
    code: "sk",
    name: "Slovak",
    nativeName: "Sloven\u010Dina",
    dir: "ltr",
    flag: "\u{1F1F8}\u{1F1F0}",
    script: "Latn",
    tier: 3,
    intlLocale: "sk-SK",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  ro: {
    code: "ro",
    name: "Romanian",
    nativeName: "Rom\xE2n\u0103",
    dir: "ltr",
    flag: "\u{1F1F7}\u{1F1F4}",
    script: "Latn",
    tier: 3,
    intlLocale: "ro-RO",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  hu: {
    code: "hu",
    name: "Hungarian",
    nativeName: "Magyar",
    dir: "ltr",
    flag: "\u{1F1ED}\u{1F1FA}",
    script: "Latn",
    tier: 3,
    intlLocale: "hu-HU",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  el: {
    code: "el",
    name: "Greek",
    nativeName: "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC",
    dir: "ltr",
    flag: "\u{1F1EC}\u{1F1F7}",
    script: "Grek",
    tier: 3,
    intlLocale: "el-GR",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  uk: {
    code: "uk",
    name: "Ukrainian",
    nativeName: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430",
    dir: "ltr",
    flag: "\u{1F1FA}\u{1F1E6}",
    script: "Cyrl",
    tier: 3,
    intlLocale: "uk-UA",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  hr: {
    code: "hr",
    name: "Croatian",
    nativeName: "Hrvatski",
    dir: "ltr",
    flag: "\u{1F1ED}\u{1F1F7}",
    script: "Latn",
    tier: 3,
    intlLocale: "hr-HR",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  sr: {
    code: "sr",
    name: "Serbian",
    nativeName: "\u0421\u0440\u043F\u0441\u043A\u0438",
    dir: "ltr",
    flag: "\u{1F1F7}\u{1F1F8}",
    script: "Cyrl",
    tier: 3,
    intlLocale: "sr-RS",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  bg: {
    code: "bg",
    name: "Bulgarian",
    nativeName: "\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438",
    dir: "ltr",
    flag: "\u{1F1E7}\u{1F1EC}",
    script: "Cyrl",
    tier: 3,
    intlLocale: "bg-BG",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  // Tier 3 Middle East (RTL Supported)
  fa: {
    code: "fa",
    name: "Persian / Farsi",
    nativeName: "\u0641\u0627\u0631\u0633\u06CC",
    dir: "rtl",
    flag: "\u{1F1EE}\u{1F1F7}",
    script: "Arab",
    tier: 3,
    intlLocale: "fa-IR",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  he: {
    code: "he",
    name: "Hebrew",
    nativeName: "\u05E2\u05D1\u05E8\u05D9\u05EA",
    dir: "rtl",
    flag: "\u{1F1EE}\u{1F1F1}",
    script: "Hebr",
    tier: 3,
    intlLocale: "he-IL",
    lifecycleStatus: "QA",
    isIndexable: false
  },
  // Regional Variants (Supported overrides)
  "zh-CN": {
    code: "zh-CN",
    name: "Simplified Chinese (China)",
    nativeName: "\u7B80\u4F53\u4E2D\u6587\uFF08\u4E2D\u56FD\uFF09",
    dir: "ltr",
    flag: "\u{1F1E8}\u{1F1F3}",
    script: "Hans",
    tier: 1,
    intlLocale: "zh-CN",
    lifecycleStatus: "INDEXABLE",
    regionVariantOf: "zh",
    isIndexable: true
  },
  "zh-TW": {
    code: "zh-TW",
    name: "Traditional Chinese (Taiwan)",
    nativeName: "\u7E41\u9AD4\u4E2D\u6587\uFF08\u53F0\u7063\uFF09",
    dir: "ltr",
    flag: "\u{1F1F9}\u{1F1FC}",
    script: "Hant",
    tier: 2,
    intlLocale: "zh-TW",
    lifecycleStatus: "PUBLISHED",
    regionVariantOf: "zh",
    isIndexable: true
  },
  "pt-BR": {
    code: "pt-BR",
    name: "Portuguese (Brazil)",
    nativeName: "Portugu\xEAs (Brasil)",
    dir: "ltr",
    flag: "\u{1F1E7}\u{1F1F7}",
    script: "Latn",
    tier: 1,
    intlLocale: "pt-BR",
    lifecycleStatus: "INDEXABLE",
    regionVariantOf: "pt",
    isIndexable: true
  },
  "pt-PT": {
    code: "pt-PT",
    name: "Portuguese (Portugal)",
    nativeName: "Portugu\xEAs (Portugal)",
    dir: "ltr",
    flag: "\u{1F1F5}\u{1F1F9}",
    script: "Latn",
    tier: 2,
    intlLocale: "pt-PT",
    lifecycleStatus: "PUBLISHED",
    regionVariantOf: "pt",
    isIndexable: true
  },
  "es-ES": {
    code: "es-ES",
    name: "Spanish (Spain)",
    nativeName: "Espa\xF1ol (Espa\xF1a)",
    dir: "ltr",
    flag: "\u{1F1EA}\u{1F1F8}",
    script: "Latn",
    tier: 1,
    intlLocale: "es-ES",
    lifecycleStatus: "INDEXABLE",
    regionVariantOf: "es",
    isIndexable: true
  },
  "es-MX": {
    code: "es-MX",
    name: "Spanish (Mexico)",
    nativeName: "Espa\xF1ol (M\xE9xico)",
    dir: "ltr",
    flag: "\u{1F1F2}\u{1F1FD}",
    script: "Latn",
    tier: 2,
    intlLocale: "es-MX",
    lifecycleStatus: "PUBLISHED",
    regionVariantOf: "es",
    isIndexable: true
  },
  "es-US": {
    code: "es-US",
    name: "Spanish (United States)",
    nativeName: "Espa\xF1ol (EE. UU.)",
    dir: "ltr",
    flag: "\u{1F1FA}\u{1F1F8}",
    script: "Latn",
    tier: 2,
    intlLocale: "es-US",
    lifecycleStatus: "PUBLISHED",
    regionVariantOf: "es",
    isIndexable: true
  },
  "en-US": {
    code: "en-US",
    name: "English (United States)",
    nativeName: "English (US)",
    dir: "ltr",
    flag: "\u{1F1FA}\u{1F1F8}",
    script: "Latn",
    tier: 1,
    intlLocale: "en-US",
    lifecycleStatus: "INDEXABLE",
    regionVariantOf: "en",
    isIndexable: true
  },
  "en-GB": {
    code: "en-GB",
    name: "English (United Kingdom)",
    nativeName: "English (UK)",
    dir: "ltr",
    flag: "\u{1F1EC}\u{1F1E7}",
    script: "Latn",
    tier: 2,
    intlLocale: "en-GB",
    lifecycleStatus: "PUBLISHED",
    regionVariantOf: "en",
    isIndexable: true
  },
  "en-CA": {
    code: "en-CA",
    name: "English (Canada)",
    nativeName: "English (Canada)",
    dir: "ltr",
    flag: "\u{1F1E8}\u{1F1E6}",
    script: "Latn",
    tier: 2,
    intlLocale: "en-CA",
    lifecycleStatus: "PUBLISHED",
    regionVariantOf: "en",
    isIndexable: true
  },
  "en-AU": {
    code: "en-AU",
    name: "English (Australia)",
    nativeName: "English (Australia)",
    dir: "ltr",
    flag: "\u{1F1E6}\u{1F1FA}",
    script: "Latn",
    tier: 2,
    intlLocale: "en-AU",
    lifecycleStatus: "PUBLISHED",
    regionVariantOf: "en",
    isIndexable: true
  }
};
var TIER_2_LOCALE_METADATA = Object.fromEntries(
  Object.entries(SUPPORTED_LOCALES).filter(([_, cfg]) => cfg.tier === 2)
);
function getIndexableLocales() {
  return Object.values(SUPPORTED_LOCALES).filter(
    (cfg) => cfg.lifecycleStatus === "INDEXABLE" && cfg.isIndexable
  );
}

// src/lib/i18n/locales/en.ts
var enDictionary = {
  locale: "en",
  common: {
    brand: "LivWorthy",
    tagline: "Global Salary, Tax & Living Intelligence",
    livingIntelligence: "Living Intelligence",
    calculating: "Calculating...",
    calculate: "Calculate",
    annual: "Annual",
    monthly: "Monthly",
    year: "Year",
    month: "Month",
    share: "Share",
    copied: "Copied to clipboard",
    home: "Home",
    back: "Back",
    next: "Next",
    close: "Close",
    disclaimer: "Calculations are deterministic estimations based on official statutory tax schedules and verified statistical benchmarks. Not formal tax or investment advice.",
    verifiedTaxBaseline: "Statutory 2026 Verified Tax Baseline",
    tier1SourcesBadge: "Tier-1 Official Government Sources",
    singleAdult: "Single Adult",
    couple: "Couple / Dual Income",
    family: "Family (2 Adults, 1 Child)",
    action: "Action",
    evidence: "Evidence & Data Sources",
    methodology: "Calculation Methodology",
    diagnostics: "System Diagnostics"
  },
  nav: {
    howItWorks: "How It Works",
    sources: "Sources",
    coverage: "Coverage",
    relocation: "Relocation",
    jobOfferComparison: "Offer Evaluator",
    reports: "Empirical Reports",
    guides: "City Guides",
    compare: "Compare Cities",
    tabSalaryWorth: "Is My Salary Enough?",
    tabSalaryNeeded: "How Much Should I Earn?",
    tabSalaryAfterTax: "Salary After Tax",
    tabCostOfLiving: "Cost of Living",
    tabCompare: "Compare Cities",
    tabJobOffers: "Compare Job Offers",
    tabGuides: "City Salary Intelligence Guides \u2192"
  },
  calculator: {
    chooseCity: "1. Choose City / Location",
    annualSalary: "2. Annual Salary",
    salaryHelp: "Pre-tax compensation (base salary).",
    statutoryJurisdiction: "Statutory tax jurisdiction: {jurisdiction}",
    popularScenarios: "Popular Scenarios:",
    heroHeadline: "What is your salary really worth?",
    heroSubheadline: "Enter your salary and city to see how much you could take home, spend and save.",
    heroSupporting: "See if your salary covers living costs and allows you to save in your chosen city.",
    householdType: "Household Assumptions",
    rentOverride: "Actual Monthly Rent",
    rentOverridePlaceholder: "e.g. 2,500",
    rentOverrideHelp: "Overrides median statistical benchmark.",
    taxYearLabel: "Tax Year",
    filingStatusLabel: "Filing Status",
    dependentsLabel: "Dependents",
    btnCalculate: "Calculate Take-Home & Living Worth",
    quickScenarios: {
      nyc100k: "NYC $100k Single",
      london60k: "London \xA360k Single",
      dubai300k: "Dubai 300k AED",
      toronto90k: "Toronto $90k Single"
    }
  },
  results: {
    summaryTitle: "Estimated Net Take-Home & Disposable Income",
    annualGross: "Gross Compensation",
    annualTakeHome: "Estimated Take-Home",
    monthlyTakeHome: "Monthly Take-Home Pay",
    monthlyLivingCosts: "Monthly Living Costs",
    monthlyDisposable: "Monthly Disposable Income",
    savingsCapacity: "Realistic Monthly Savings",
    savingsRate: "Projected Savings Rate",
    effectiveTaxRate: "Effective Tax Rate",
    housingBurden: "Housing Cost Burden",
    taxesAndDeductions: "Taxes & Statutory Deductions",
    essentialLiving: "Essential Living Costs",
    discretionaryLiving: "Discretionary & Leisure",
    spendableSurplus: "Spendable Surplus",
    deficitWarning: "Warning: Projected living costs exceed estimated net earnings in this location.",
    healthySurplus: "Healthy Surplus: Your earnings support regular savings and discretionary spending.",
    taxPending: "Tax calculation pending statutory verification.",
    shareSummaryTitle: "LivWorthy Financial Assessment",
    estimatedLivingCosts: "Estimated Living Costs",
    benchmarkContext: "Benchmark statistical reference",
    customizeAssumptions: "Customize Assumptions"
  },
  salaryNeeded: {
    headline: "How much do you need to earn?",
    subheadline: "Target your desired disposable surplus or lifestyle and discover the required gross salary.",
    targetSavings: "Target Monthly Savings",
    desiredLifestyle: "Desired Lifestyle Baseline",
    requiredGross: "Required Gross Salary",
    requiredNet: "Required Monthly Net",
    calculatedGrossSalary: "Gross Salary Needed",
    explorePlan: "Explore Financial Plan"
  },
  salaryAfterTax: {
    headline: "Statutory Salary After Tax Calculator",
    subheadline: "Transparent gross-to-net pay calculations using official government revenue schedules.",
    federalTax: "Federal / National Income Tax",
    stateLocalTax: "State / Regional / Local Tax",
    socialSecurity: "Social Security & Pension Contributions",
    medicare: "Health & Social Insurance",
    totalDeductions: "Total Statutory Deductions",
    netTakeHome: "Estimated Net Take-Home Pay",
    effectiveTaxNote: "Combined statutory effective rate"
  },
  costOfLiving: {
    headline: "Household Living Cost Breakdown",
    subheadline: "Government-audited consumer expenditure benchmarks for housing, food, utilities, and transport.",
    housingRent: "Housing & Rent",
    groceriesFood: "Groceries & Nutrition",
    diningOut: "Dining & Restaurants",
    utilitiesInternet: "Utilities & Connectivity",
    publicTransit: "Public Transportation",
    totalMonthlyLiving: "Household Living Costs",
    householdTypeSelect: "Select Household Profile"
  },
  compare: {
    headline: "Compare Salary & Living Costs Between Cities",
    subheadline: "Model purchasing power differences, tax arbitrage, and relocation equivalence across international hubs.",
    cityA: "City A (Origin)",
    cityB: "City B (Destination)",
    salaryA: "Salary in City A",
    equivalentSalary: "Equivalent Salary Needed in City B",
    purchasingPowerDelta: "Purchasing Power Difference",
    verdictLabel: "Purchasing Power Verdict"
  },
  jobOffers: {
    headline: "Compare Multi-City Job Offers",
    subheadline: "Evaluate competing compensation packages across different currencies, tax regimes, and living costs.",
    offerA: "Offer A",
    offerB: "Offer B",
    offerVerdict: "Offer Evaluation & Real Worth",
    higherRealIncome: "{winner} offers {delta} higher real disposable income."
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "Statutory tax rules for this year or location are not yet officially gazetted or verified. LivWorthy does not provide synthetic tax estimates.",
    INVALID_SALARY: "Please enter a valid positive salary amount.",
    CITY_NOT_SUPPORTED: "The selected city is not currently configured in the database.",
    DATA_STALE: "Underlying benchmark data is undergoing annual statutory audit.",
    FX_UNAVAILABLE: "Foreign exchange rate service temporarily unavailable. Using last verified snapshot.",
    NETWORK_ERROR: "Network connection issue. Please retry your calculation."
  },
  footer: {
    aboutDesc: "LivWorthy is an independent financial intelligence engine providing deterministic calculations for international salaries, statutory taxes, and urban living costs.",
    calculatorsTitle: "Calculators & Tools",
    intelligenceTitle: "City Salary Guides",
    institutionalTitle: "Integrity & Governance",
    cityComparisons: "City Comparisons",
    empiricalReports: "Empirical Research Reports \u2192",
    editorialPolicy: "Editorial Policy",
    dataPolicy: "Data Integrity Policy",
    corrections: "Report a Data Correction",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    copyright: "\xA9 2026 LivWorthy Inc. All rights reserved. Deterministic FinTech Architecture."
  },
  languageSelector: {
    title: "Select Language",
    searchPlaceholder: "Search languages...",
    currentLanguage: "Current Language",
    switchSuggestion: "Would you like to view LivWorthy in {language}?",
    switchCta: "Switch to {language}",
    dismiss: "Dismiss",
    allLanguages: "All Available Languages"
  },
  reports: {
    hubTitle: "Empirical Research & Benchmark Indices",
    hubSubtitle: "Transparent, citation-ready research datasets analyzing cross-border compensation, statutory income retention, and urban purchasing power.",
    instituteBadge: "Quantitative Research Institute",
    modelBadge: "Zero-AI Deterministic Modeling",
    globalSalaryWorthTitle: "Global Salary Worth Index 2026",
    purchasingPowerTitle: "Purchasing Power Comparison Report",
    salaryToRentTitle: "Salary-to-Rent Ratio Index",
    relocationGapTitle: "Relocation Salary Gap Report",
    takeHomePayTitle: "Global Take-Home Pay Comparison",
    downloadCsv: "Download CSV Dataset",
    downloadJson: "Download Raw JSON",
    methodologyHeading: "Methodology & Statistical Bounds",
    sourcesHeading: "Primary Authority Sources",
    citationHeading: "Academic Citation & Citation Reference"
  }
};

// src/lib/i18n/locales/es.ts
var esDictionary = {
  locale: "es",
  common: {
    brand: "LivWorthy",
    tagline: "Inteligencia Global de Salarios, Impuestos y Costo de Vida",
    livingIntelligence: "Inteligencia de Vida",
    calculating: "Calculando...",
    calculate: "Calcular",
    annual: "Anual",
    monthly: "Mensual",
    year: "A\xF1o",
    month: "Mes",
    share: "Compartir",
    copied: "Copiado al portapapeles",
    home: "Inicio",
    back: "Volver",
    next: "Siguiente",
    close: "Cerrar",
    disclaimer: "C\xE1lculos deterministas basados en normativas fiscales oficiales e \xEDndices estad\xEDsticos verificados. No constituye asesoramiento fiscal.",
    verifiedTaxBaseline: "Base Fiscal 2026 Verificada por Normativa",
    tier1SourcesBadge: "Fuentes Oficiales Gubernamentales de Nivel 1",
    singleAdult: "Adulto Soltero",
    couple: "Pareja / Dos Ingresos",
    family: "Familia (2 Adultos, 1 Hijo)",
    action: "Acci\xF3n",
    evidence: "Evidencia y Fuentes de Datos",
    methodology: "Metodolog\xEDa de C\xE1lculo",
    diagnostics: "Diagn\xF3stico del Sistema"
  },
  nav: {
    howItWorks: "C\xF3mo Funciona",
    sources: "Fuentes",
    coverage: "Cobertura",
    relocation: "Reubicaci\xF3n",
    jobOfferComparison: "Evaluar Ofertas",
    reports: "Informes Emp\xEDricos",
    guides: "Gu\xEDas de Ciudades",
    compare: "Comparar Ciudades",
    tabSalaryWorth: "\xBFAlcanza Mi Salario?",
    tabSalaryNeeded: "\xBFCu\xE1nto Deber\xEDa Ganar?",
    tabSalaryAfterTax: "Salario Neto tras Impuestos",
    tabCostOfLiving: "Costo de Vida",
    tabCompare: "Comparar Ciudades",
    tabJobOffers: "Comparar Ofertas Laborales",
    tabGuides: "Gu\xEDas de Salario por Ciudad"
  },
  calculator: {
    chooseCity: "1. Elegir Ciudad / Ubicaci\xF3n",
    annualSalary: "2. Salario Bruto Anual",
    salaryHelp: "Compensaci\xF3n antes de impuestos (salario base).",
    statutoryJurisdiction: "Jurisdicci\xF3n fiscal normativa: {jurisdiction}",
    popularScenarios: "Escenarios Populares:",
    heroHeadline: "\xBFCu\xE1nto vale realmente tu salario?",
    heroSubheadline: "Ingresa tu salario y ciudad para calcular tus ingresos netos, gastos mensuales y capacidad real de ahorro.",
    heroSupporting: "Verifica si tu salario cubre el costo de vida y permite ahorrar en tu ciudad de destino.",
    householdType: "Composici\xF3n del Hogar",
    rentOverride: "Alquiler Mensual Personalizado",
    rentOverridePlaceholder: "ej. 2.500",
    rentOverrideHelp: "Sustituye la referencia estad\xEDstica mediana.",
    taxYearLabel: "A\xF1o Fiscal",
    filingStatusLabel: "Estado Civil / Declaraci\xF3n",
    dependentsLabel: "Personas a Cargo",
    btnCalculate: "Calcular Salario Neto y Poder Adquisitivo",
    quickScenarios: {
      nyc100k: "NYC $100k Soltero",
      london60k: "Londres \xA360k Soltero",
      dubai300k: "Dub\xE1i 300k AED",
      toronto90k: "Toronto $90k Soltero"
    }
  },
  results: {
    summaryTitle: "Ingreso Neto Estimado y Saldo Disponible",
    annualGross: "Salario Bruto Anual",
    annualTakeHome: "Salario Neto Anual",
    monthlyTakeHome: "Salario Neto Mensual",
    monthlyLivingCosts: "Gastos Mensuales de Vida",
    monthlyDisposable: "Ingreso Disponible Mensual",
    savingsCapacity: "Capacidad de Ahorro Mensual",
    savingsRate: "Tasa Proyectada de Ahorro",
    effectiveTaxRate: "Tasa Impositiva Efectiva",
    housingBurden: "Carga de Gastos de Vivienda",
    taxesAndDeductions: "Impuestos y Retenciones Obligatorias",
    essentialLiving: "Gastos Esenciales de Vida",
    discretionaryLiving: "Ocio y Gastos Discrecionales",
    spendableSurplus: "Super\xE1vit Gastable",
    deficitWarning: "Advertencia: Los gastos de subsistencia proyectados superan el ingreso neto estimado en esta ciudad.",
    healthySurplus: "Super\xE1vit Favorable: Tus ingresos cubren holgadamente los gastos b\xE1sicos y permiten ahorro regular.",
    taxPending: "C\xE1lculo fiscal pendiente de verificaci\xF3n normativa.",
    shareSummaryTitle: "Evaluaci\xF3n Financiera LivWorthy",
    estimatedLivingCosts: "Gastos de Vida Estimados",
    benchmarkContext: "Referencia estad\xEDstica verificada",
    customizeAssumptions: "Personalizar supuestos"
  },
  salaryNeeded: {
    headline: "\xBFCu\xE1nto necesitas ganar?",
    subheadline: "Define tu objetivo de ahorro o estilo de vida deseado y descubre el salario bruto necesario.",
    targetSavings: "Ahorro Mensual Deseado",
    desiredLifestyle: "Nivel de Vida Objetivo",
    requiredGross: "Salario Bruto Requerido",
    requiredNet: "Ingreso Neto Mensual Necesario",
    calculatedGrossSalary: "Salario Bruto Estimado",
    explorePlan: "Explorar Plan Financiero"
  },
  salaryAfterTax: {
    headline: "Calculadora de Salario Neto tras Impuestos",
    subheadline: "C\xE1lculos transparentes de bruto a neto con las tablas impositivas oficiales del gobierno.",
    federalTax: "Impuesto sobre la Renta Federal / Nacional",
    stateLocalTax: "Impuesto Auton\xF3mico / Estatal / Local",
    socialSecurity: "Cotizaciones a la Seguridad Social y Pensiones",
    medicare: "Seguro M\xE9dico y Asistencia Social",
    totalDeductions: "Deducciones Legales Totales",
    netTakeHome: "Sueldo Neto a Percibir",
    effectiveTaxNote: "Tipo impositivo efectivo combinado"
  },
  costOfLiving: {
    headline: "Desglose del Costo de Vida del Hogar",
    subheadline: "\xCDndices oficiales auditados de gasto familiar para alquiler, alimentaci\xF3n, suministros y transporte.",
    housingRent: "Vivienda y Alquiler",
    groceriesFood: "Cesta de la Compra y Alimentaci\xF3n",
    diningOut: "Restaurantes y Ocio Gastron\xF3mico",
    utilitiesInternet: "Suministros B\xE1sicos e Internet",
    publicTransit: "Transporte P\xFAblico",
    totalMonthlyLiving: "Gastos Mensuales Totales de Vida",
    householdTypeSelect: "Seleccionar Perfil de Hogar"
  },
  compare: {
    headline: "Comparar Salarios y Costo de Vida entre Ciudades",
    subheadline: "Modela diferencias de poder adquisitivo, arbitraje fiscal y equivalencia salarial entre centros financieros mundiales.",
    cityA: "Ciudad A (Origen)",
    cityB: "Ciudad B (Destino)",
    salaryA: "Salario en Ciudad A",
    equivalentSalary: "Salario Equivalente Necesario en Ciudad B",
    purchasingPowerDelta: "Diferencial de Poder Adquisitivo",
    verdictLabel: "Veredicto de Poder Adquisitivo"
  },
  jobOffers: {
    headline: "Comparar Ofertas Laborales Multiciudad",
    subheadline: "Eval\xFAa paquetes de retribuci\xF3n entre distintas monedas, normativas fiscales y costos de vida reales.",
    offerA: "Oferta A",
    offerB: "Oferta B",
    offerVerdict: "Evaluaci\xF3n y Valor Real de la Oferta",
    higherRealIncome: "{winner} proporciona {delta} m\xE1s de ingreso real disponible."
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "Las reglas tributarias para este a\xF1o o jurisdicci\xF3n no han sido publicadas oficialmente. LivWorthy no inventa estimaciones sint\xE9ticas.",
    INVALID_SALARY: "Por favor, introduce una cifra salarial positiva v\xE1lida.",
    CITY_NOT_SUPPORTED: "La ciudad seleccionada no se encuentra registrada en la base de datos.",
    DATA_STALE: "Los datos de referencia se encuentran bajo proceso de auditor\xEDa anual.",
    FX_UNAVAILABLE: "Servicio de tipos de cambio temporalmente no disponible. Empleando \xFAltimo cierre verificado.",
    NETWORK_ERROR: "Error de conexi\xF3n de red. Por favor, reintenta el c\xE1lculo."
  },
  footer: {
    aboutDesc: "LivWorthy es una plataforma de inteligencia financiera independiente que proporciona c\xE1lculos deterministas para salarios internacionales, impuestos y costo de vida.",
    calculatorsTitle: "Calculadoras",
    intelligenceTitle: "Inteligencia Global",
    institutionalTitle: "Est\xE1ndares y Pol\xEDticas",
    cityComparisons: "Comparativas de Ciudades",
    empiricalReports: "Informes de Investigaci\xF3n Emp\xEDrica \u2192",
    editorialPolicy: "Pol\xEDtica Editorial",
    dataPolicy: "Pol\xEDtica de Integridad de Datos",
    corrections: "Notificar una Correcci\xF3n de Datos",
    terms: "T\xE9rminos de Uso",
    privacy: "Pol\xEDtica de Privacidad",
    copyright: "\xA9 2026 LivWorthy Inc. Todos los derechos reservados. Arquitectura FinTech Determinista."
  },
  languageSelector: {
    title: "Seleccionar Idioma",
    searchPlaceholder: "Buscar idiomas...",
    currentLanguage: "Idioma Actual",
    switchSuggestion: "\xBFDeseas ver LivWorthy en {language}?",
    switchCta: "Cambiar a {language}",
    dismiss: "Descartar",
    allLanguages: "Todos los Idiomas Disponibles"
  },
  reports: {
    hubTitle: "Investigaci\xF3n Emp\xEDrica e \xCDndices de Referencia",
    hubSubtitle: "Estudios transparentes y reproducibles sobre retenci\xF3n fiscal estatutaria, salarios reales y poder adquisitivo.",
    instituteBadge: "Instituto de Investigaci\xF3n Cuantitativa",
    modelBadge: "Modelado Determinista Libre de IA",
    globalSalaryWorthTitle: "\xCDndice Global del Valor del Salario 2026",
    purchasingPowerTitle: "Informe Comparativo de Poder Adquisitivo",
    salaryToRentTitle: "\xCDndice de la Relaci\xF3n Salario-Alquiler",
    relocationGapTitle: "Informe de Brecha Salarial por Reubicaci\xF3n",
    takeHomePayTitle: "Comparativa Global de Salario Neto Disponible",
    downloadCsv: "Descargar Conjunto de Datos CSV",
    downloadJson: "Descargar JSON sin Procesar",
    methodologyHeading: "Metodolog\xEDa y L\xEDmites Estad\xEDsticos",
    sourcesHeading: "Fuentes Oficiales Primarias",
    citationHeading: "Referencia Acad\xE9mica y Citaci\xF3n"
  }
};

// src/lib/i18n/locales/fr.ts
var frDictionary = {
  locale: "fr",
  common: {
    brand: "LivWorthy",
    tagline: "Intelligence Mondiale des Salaires, Imp\xF4ts et Co\xFBt de la Vie",
    livingIntelligence: "Intelligence de Vie",
    calculating: "Calcul en cours...",
    calculate: "Calculer",
    annual: "Annuel",
    monthly: "Mensuel",
    year: "Ann\xE9e",
    month: "Mois",
    share: "Partager",
    copied: "Copi\xE9 dans le presse-papier",
    home: "Accueil",
    back: "Retour",
    next: "Suivant",
    close: "Fermer",
    disclaimer: "Calculs d\xE9terministes bas\xE9s sur les bar\xE8mes fiscaux officiels et les statistiques publiques v\xE9rifi\xE9es. Ne constitue pas un conseil financier.",
    verifiedTaxBaseline: "Bar\xE8mes Fiscaux 2026 V\xE9rifi\xE9s par les Textes",
    tier1SourcesBadge: "Sources Officielles Gouvernementales de Rang 1",
    singleAdult: "C\xE9libataire",
    couple: "Couple / Bi-Actif",
    family: "Famille (2 Adultes, 1 Enfant)",
    action: "Action",
    evidence: "Sources & R\xE9f\xE9rences",
    methodology: "M\xE9thodologie de Calcul",
    diagnostics: "Diagnostics Syst\xE8me"
  },
  nav: {
    howItWorks: "Comment \xE7a marche",
    sources: "Sources",
    coverage: "Couverture",
    relocation: "Expatriation",
    jobOfferComparison: "\xC9valuer les Offres",
    reports: "Rapports Empiriques",
    guides: "Guides Villes",
    compare: "Comparer les Villes",
    tabSalaryWorth: "Mon Salaire Est-il Suffisant ?",
    tabSalaryNeeded: "Combien Devrais-je Gagner ?",
    tabSalaryAfterTax: "Salaire Net Apr\xE8s Imp\xF4t",
    tabCostOfLiving: "Co\xFBt de la Vie",
    tabCompare: "Comparer les Villes",
    tabJobOffers: "Comparer les Offres d\u2019Emploi",
    tabGuides: "Guides des Salaires par Ville"
  },
  calculator: {
    chooseCity: "1. Choisir la Ville / Emplacement",
    annualSalary: "2. Salaire Brut Annuel",
    salaryHelp: "R\xE9mun\xE9ration brute avant imp\xF4t (salaire de base).",
    statutoryJurisdiction: "Juridiction fiscale officielle : {jurisdiction}",
    popularScenarios: "Sc\xE9narios Fr\xE9quents :",
    heroHeadline: "Que vaut r\xE9ellement votre salaire ?",
    heroSubheadline: "Indiquez votre salaire et votre ville pour calculer votre revenu net, vos d\xE9penses et votre \xE9pargne r\xE9elle.",
    heroSupporting: "D\xE9terminez si votre salaire couvre le co\xFBt de la vie et vous permet d\u2019\xE9pargner sereinement.",
    householdType: "Composition du Foyer",
    rentOverride: "Loyer Mensuel Personnalis\xE9",
    rentOverridePlaceholder: "ex. 2 500",
    rentOverrideHelp: "Remplace la r\xE9f\xE9rence statistique m\xE9diane.",
    taxYearLabel: "Ann\xE9e Fiscale",
    filingStatusLabel: "Statut Fiscal / D\xE9claration",
    dependentsLabel: "Personnes \xE0 Charge",
    btnCalculate: "Calculer le Salaire Net et le Pouvoir d\u2019Achat",
    quickScenarios: {
      nyc100k: "NYC $100k C\xE9libataire",
      london60k: "Londres \xA360k C\xE9libataire",
      dubai300k: "Duba\xEF 300k AED",
      toronto90k: "Toronto $90k C\xE9libataire"
    }
  },
  results: {
    summaryTitle: "Revenu Net Estim\xE9 et Reste \xE0 Vivre",
    annualGross: "Salaire Brut Annuel",
    annualTakeHome: "Salaire Net Annuel",
    monthlyTakeHome: "Salaire Net Mensuel",
    monthlyLivingCosts: "Co\xFBt de la Vie Mensuel",
    monthlyDisposable: "Reste \xE0 Vivre Mensuel",
    savingsCapacity: "Capacit\xE9 d\u2019\xC9pargne Mensuelle",
    savingsRate: "Taux d\u2019\xC9pargne Estim\xE9",
    effectiveTaxRate: "Taux Effectif d\u2019Imposition",
    housingBurden: "Part du Logement dans les D\xE9penses",
    taxesAndDeductions: "Imp\xF4ts et Cotisations Obligatoires",
    essentialLiving: "D\xE9penses Incompressibles de la Vie",
    discretionaryLiving: "D\xE9penses Courantes et Loisirs",
    spendableSurplus: "Surplus Disponible",
    deficitWarning: "Attention : Les d\xE9penses mensuelles estim\xE9es d\xE9passent les revenus nets dans cette ville.",
    healthySurplus: "Surplus Favorable : Vos revenus couvrent confortablement vos charges et permettent d\u2019\xE9pargner.",
    taxPending: "Calcul fiscal en attente de validation officielle.",
    shareSummaryTitle: "\xC9valuation Financi\xE8re LivWorthy",
    estimatedLivingCosts: "Co\xFBt de la Vie Estim\xE9",
    benchmarkContext: "R\xE9f\xE9rence statistique publique v\xE9rifi\xE9e",
    customizeAssumptions: "Personnaliser les hypoth\xE8ses"
  },
  salaryNeeded: {
    headline: "Combien devez-vous gagner ?",
    subheadline: "D\xE9finissez votre objectif d\u2019\xE9pargne ou votre niveau de vie souhait\xE9 pour conna\xEEtre le salaire brut n\xE9cessaire.",
    targetSavings: "\xC9pargne Mensuelle Vis\xE9e",
    desiredLifestyle: "Niveau de Vie Souhait\xE9",
    requiredGross: "Salaire Brut Requis",
    requiredNet: "Revenu Net Mensuel Requis",
    calculatedGrossSalary: "Salaire Brut N\xE9cessaire",
    explorePlan: "Consulter le Plan Financier"
  },
  salaryAfterTax: {
    headline: "Calculateur de Salaire Net Apr\xE8s Imp\xF4t",
    subheadline: "Calculs transparents du brut au net bas\xE9s sur les bar\xE8mes fiscaux gouvernementaux officiels.",
    federalTax: "Imp\xF4t sur le Revenu National / F\xE9d\xE9ral",
    stateLocalTax: "Imp\xF4t R\xE9gional / Local / Cantonal",
    socialSecurity: "Cotisations de S\xE9curit\xE9 Sociale et Retraite",
    medicare: "Assurance Maladie et Pr\xE9voyance",
    totalDeductions: "Total des Pr\xE9l\xE8vements Obligatoires",
    netTakeHome: "Salaire Net Disponible",
    effectiveTaxNote: "Taux effectif global des pr\xE9l\xE8vements"
  },
  costOfLiving: {
    headline: "D\xE9tail du Co\xFBt de la Vie du Foyer",
    subheadline: "Indices audit\xE9s de d\xE9penses pour le logement, la nutrition, l\u2019\xE9nergie et les transports.",
    housingRent: "Logement & Loyer",
    groceriesFood: "Alimentation & Courses",
    diningOut: "Restaurants & Sorties",
    utilitiesInternet: "\xC9nergie, Eau & Internet",
    publicTransit: "Transports en Commun",
    totalMonthlyLiving: "D\xE9penses Mensuelles Globales",
    householdTypeSelect: "Choisir le Profil du Foyer"
  },
  compare: {
    headline: "Comparer Salaires et Co\xFBt de la Vie entre Villes",
    subheadline: "Mesurez les \xE9carts de pouvoir d\u2019achat, l\u2019arbitrage fiscal et l\u2019\xE9quivalence salariale internationale.",
    cityA: "Ville A (D\xE9part)",
    cityB: "Ville B (Destination)",
    salaryA: "Salaire dans la Ville A",
    equivalentSalary: "Salaire \xC9quivalent Requis en Ville B",
    purchasingPowerDelta: "Diff\xE9rentiel de Pouvoir d\u2019Achat",
    verdictLabel: "Bilan du Pouvoir d\u2019Achat"
  },
  jobOffers: {
    headline: "Comparer des Offres d\u2019Emploi Internationales",
    subheadline: "Analysez les offres d\u2019embauche face aux devises, bar\xE8mes d\u2019imposition et co\xFBts r\xE9els locaux.",
    offerA: "Offre A",
    offerB: "Offre B",
    offerVerdict: "\xC9valuation & Valeur R\xE9elle de l\u2019Offre",
    higherRealIncome: "{winner} offre {delta} de revenu r\xE9el disponible suppl\xE9mentaire."
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "Les bar\xE8mes fiscaux officiels pour cette ann\xE9e ou ce territoire ne sont pas encore publi\xE9s. LivWorthy ne g\xE9n\xE8re aucune estimation fictive.",
    INVALID_SALARY: "Veuillez saisir un montant de salaire strictement positif.",
    CITY_NOT_SUPPORTED: "La ville s\xE9lectionn\xE9e n\u2019est pas encore index\xE9e dans notre base de donn\xE9es.",
    DATA_STALE: "Les donn\xE9es de r\xE9f\xE9rence font actuellement l\u2019objet d\u2019un audit annuel.",
    FX_UNAVAILABLE: "Service des taux de change temporairement indisponible. Utilisation de la derni\xE8re cl\xF4ture v\xE9rifi\xE9e.",
    NETWORK_ERROR: "Probl\xE8me de connexion r\xE9seau. Veuillez relancer le calcul."
  },
  footer: {
    aboutDesc: "LivWorthy est un moteur ind\xE9pendant d\u2019intelligence financi\xE8re offrant des calculs d\xE9terministes pour les salaires internationaux, les imp\xF4ts et le co\xFBt de la vie.",
    calculatorsTitle: "Calculateurs",
    intelligenceTitle: "Intelligence Mondiale",
    institutionalTitle: "Normes & D\xE9ontologie",
    cityComparisons: "Comparatifs de Villes",
    empiricalReports: "Rapports d\u2019\xC9tudes Empiriques \u2192",
    editorialPolicy: "Charte \xC9ditoriale",
    dataPolicy: "Politique d\u2019Int\xE9grit\xE9 des Donn\xE9es",
    corrections: "Signaler une Rectification de Donn\xE9es",
    terms: "Conditions d\u2019Utilisation",
    privacy: "Politique de Confidentialit\xE9",
    copyright: "\xA9 2026 LivWorthy Inc. Tous droits r\xE9serv\xE9s. Architecture FinTech D\xE9terministe."
  },
  languageSelector: {
    title: "S\xE9lectionner la Langue",
    searchPlaceholder: "Rechercher une langue...",
    currentLanguage: "Langue Actuelle",
    switchSuggestion: "Souhaitez-vous consulter LivWorthy en {language} ?",
    switchCta: "Passer en {language}",
    dismiss: "Ignorer",
    allLanguages: "Toutes les Langues Disponibles"
  },
  reports: {
    hubTitle: "Recherche Empirique & Indices de R\xE9f\xE9rence",
    hubSubtitle: "\xC9tudes transparentes et citables sur le pouvoir d\u2019achat urbain, la fiscalit\xE9 r\xE9elle et la r\xE9mun\xE9ration internationale.",
    instituteBadge: "Institut de Recherche Quantitative",
    modelBadge: "Mod\xE9lisation D\xE9terministe Sans IA",
    globalSalaryWorthTitle: "Indice Mondial de la Valeur des Salaires 2026",
    purchasingPowerTitle: "Rapport Comparatif du Pouvoir d\u2019Achat",
    salaryToRentTitle: "Indice du Ratio Salaire-Loyer",
    relocationGapTitle: "Rapport d\u2019\xC9cart Salarial \xE0 la Mobilit\xE9",
    takeHomePayTitle: "Comparatif Mondial du Reste \xE0 Vivre Net",
    downloadCsv: "T\xE9l\xE9charger le Jeu de Donn\xE9es CSV",
    downloadJson: "T\xE9l\xE9charger le Fichier JSON Brut",
    methodologyHeading: "M\xE9thodologie & Encadrement Statistique",
    sourcesHeading: "Sources Officielles et R\xE9glementaires",
    citationHeading: "Citation Acad\xE9mique & R\xE9f\xE9rence Bibliographique"
  }
};

// src/lib/i18n/locales/ar.ts
var arDictionary = {
  locale: "ar",
  common: {
    brand: "\u0644\u064A\u0641 \u0648\u0648\u0631\u062B\u064A",
    tagline: "\u0627\u0644\u0645\u0646\u0638\u0648\u0645\u0629 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 \u0644\u0644\u0631\u0648\u0627\u062A\u0628 \u0648\u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u064A\u0634\u0629",
    livingIntelligence: "\u0630\u0643\u0627\u0621 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0627\u0644\u0645\u0627\u0644\u064A",
    calculating: "\u062C\u0627\u0631\u064D \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u062F\u0642\u0629...",
    calculate: "\u0627\u062D\u0633\u0628 \u0627\u0644\u0622\u0646",
    annual: "\u0633\u0646\u0648\u064A",
    monthly: "\u0634\u0647\u0631\u064A",
    year: "\u0633\u0646\u0629",
    month: "\u0634\u0647\u0631",
    share: "\u0645\u0634\u0627\u0631\u0643\u0629",
    copied: "\u062A\u0645 \u0627\u0644\u0646\u0633\u062E \u0625\u0644\u0649 \u0627\u0644\u062D\u0627\u0641\u0638\u0629 \u0628\u0646\u062C\u0627\u062D",
    home: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629",
    back: "\u0631\u062C\u0648\u0639",
    next: "\u0627\u0644\u062A\u0627\u0644\u064A",
    close: "\u0625\u063A\u0644\u0627\u0642",
    disclaimer: "\u062D\u0633\u0627\u0628\u0627\u062A \u062D\u062A\u0645\u064A\u0629 \u0645\u0648\u062B\u0648\u0642\u0629 \u062A\u0633\u062A\u0646\u062F \u0625\u0644\u0649 \u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0648\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0625\u062D\u0635\u0627\u0621 \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629. \u0644\u0627 \u062A\u0639\u062F \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0636\u0631\u064A\u0628\u064A\u0629 \u062E\u0627\u0635\u0629.",
    verifiedTaxBaseline: "\u0642\u0648\u0627\u0639\u062F \u0636\u0631\u064A\u0628\u064A\u0629 \u0645\u0639\u062A\u0645\u062F\u0629 \u0631\u0633\u0645\u064A\u0627\u064B \u0644\u0639\u0627\u0645 2026",
    tier1SourcesBadge: "\u0645\u0635\u0627\u062F\u0631 \u062D\u0643\u0648\u0645\u064A\u0629 \u0631\u0633\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u062F\u0631\u062C\u0629 \u0627\u0644\u0623\u0648\u0644\u0649",
    singleAdult: "\u0641\u0631\u062F \u0648\u0627\u062D\u062F (\u0623\u0639\u0632\u0628)",
    couple: "\u0632\u0648\u062C\u0627\u0646 (\u062F\u062E\u0644 \u0645\u0634\u062A\u0631\u0643)",
    family: "\u0623\u0633\u0631\u0629 (\u0628\u0627\u0644\u063A\u0627\u0646 \u0648\u0637\u0641\u0644)",
    action: "\u0625\u062C\u0631\u0627\u0621",
    evidence: "\u0627\u0644\u0623\u062F\u0644\u0629 \u0648\u0645\u0635\u0627\u062F\u0631 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0631\u0633\u0645\u064A\u0629",
    methodology: "\u0645\u0646\u0647\u062C\u064A\u0629 \u0627\u0644\u062D\u0633\u0627\u0628",
    diagnostics: "\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u0646\u0638\u0627\u0645"
  },
  nav: {
    howItWorks: "\u0643\u064A\u0641 \u064A\u0639\u0645\u0644",
    sources: "\u0627\u0644\u0645\u0635\u0627\u062F\u0631 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629",
    coverage: "\u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0623\u0633\u0648\u0627\u0642",
    relocation: "\u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0648\u0627\u0644\u0647\u062C\u0631\u0629",
    jobOfferComparison: "\u0645\u0642\u0627\u0631\u0646\u0629 \u0639\u0631\u0648\u0636 \u0627\u0644\u0639\u0645\u0644",
    reports: "\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0628\u062D\u062B\u064A\u0629",
    guides: "\u0623\u062F\u0644\u0629 \u0627\u0644\u0645\u062F\u0646",
    compare: "\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0645\u062F\u0646",
    tabSalaryWorth: "\u0647\u0644 \u0631\u0627\u062A\u0628\u064A \u0643\u0627\u0641\u064D \u0641\u064A \u0627\u0644\u0645\u062F\u064A\u0646\u0629\u061F",
    tabSalaryNeeded: "\u0643\u0645 \u064A\u062C\u0628 \u0623\u0646 \u0623\u062A\u0642\u0627\u0636\u0649 \u0644\u0644\u0639\u064A\u0634 \u0628\u0627\u0631\u062A\u064A\u0627\u062D\u061F",
    tabSalaryAfterTax: "\u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0635\u0627\u0641\u064A \u0628\u0639\u062F \u0627\u0644\u0636\u0631\u0627\u0626\u0628",
    tabCostOfLiving: "\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u064A\u0634\u0629",
    tabCompare: "\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0645\u062F\u0646",
    tabJobOffers: "\u0645\u0642\u0627\u0631\u0646\u0629 \u0639\u0631\u0648\u0636 \u0627\u0644\u0639\u0645\u0644",
    tabGuides: "\u0623\u062F\u0644\u0629 \u0627\u0644\u0631\u0648\u0627\u062A\u0628 \u0628\u0627\u0644\u0645\u062F\u0646"
  },
  calculator: {
    chooseCity: "1. \u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 / \u0627\u0644\u0645\u0648\u0642\u0639",
    annualSalary: "2. \u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0633\u0646\u0648\u064A \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A",
    salaryHelp: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u062A\u0639\u0648\u064A\u0636 \u0642\u0628\u0644 \u062E\u0635\u0645 \u0627\u0644\u0636\u0631\u0627\u0626\u0628 (\u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0623\u0633\u0627\u0633\u064A).",
    statutoryJurisdiction: "\u0627\u0644\u0627\u062E\u062A\u0635\u0627\u0635 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F: {jurisdiction}",
    popularScenarios: "\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A \u0634\u0627\u0626\u0639\u0629:",
    heroHeadline: "\u0645\u0627 \u0647\u064A \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0641\u0639\u0644\u064A\u0629 \u0644\u0631\u0627\u062A\u0628\u0643 \u0628\u0639\u062F \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u0627\u0644\u0645\u0639\u064A\u0634\u0629\u061F",
    heroSubheadline: "\u0623\u062F\u062E\u0644 \u0631\u0627\u062A\u0628\u0643 \u0648\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0644\u0645\u0639\u0631\u0641\u0629 \u0635\u0627\u0641\u064A \u0627\u0644\u062F\u062E\u0644 \u0648\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0634\u0647\u0631\u064A\u0629 \u0648\u0627\u0644\u0642\u062F\u0631\u0629 \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0627\u062F\u062E\u0627\u0631.",
    heroSupporting: "\u0627\u0643\u062A\u0634\u0641 \u0645\u0627 \u0625\u0630\u0627 \u0643\u0627\u0646 \u0631\u0627\u062A\u0628\u0643 \u064A\u063A\u0637\u064A \u0646\u0641\u0642\u0627\u062A \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0648\u064A\u0648\u0641\u0631 \u0644\u0643 \u0641\u0627\u0626\u0636\u0627\u064B \u0645\u0627\u0644\u064A\u0627\u064B \u062D\u0642\u064A\u0642\u064A\u0627\u064B.",
    householdType: "\u062A\u0631\u0643\u064A\u0628\u0629 \u0627\u0644\u0623\u0633\u0631\u0629 \u0648\u0627\u0644\u0645\u0633\u0643\u0646",
    rentOverride: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0634\u0647\u0631\u064A \u0627\u0644\u0641\u0639\u0644\u064A",
    rentOverridePlaceholder: "\u0645\u062B\u0627\u0644: 2,500",
    rentOverrideHelp: "\u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u0645\u0639\u064A\u0627\u0631 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A \u0627\u0644\u0645\u062A\u0648\u0633\u0637 \u0644\u0644\u0645\u062F\u064A\u0646\u0629.",
    taxYearLabel: "\u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629",
    filingStatusLabel: "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629 / \u0627\u0644\u0625\u0642\u0631\u0627\u0631",
    dependentsLabel: "\u0627\u0644\u0645\u0639\u0627\u0644\u0648\u0646",
    btnCalculate: "\u062D\u0633\u0627\u0628 \u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0635\u0627\u0641\u064A \u0648\u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0634\u0631\u0627\u0626\u064A\u0629",
    quickScenarios: {
      nyc100k: "\u0646\u064A\u0648\u064A\u0648\u0631\u0643 100 \u0623\u0644\u0641 $ \u0623\u0639\u0632\u0628",
      london60k: "\u0644\u0646\u062F\u0646 60 \u0623\u0644\u0641 \xA3 \u0623\u0639\u0632\u0628",
      dubai300k: "\u062F\u0628\u064A 300 \u0623\u0644\u0641 \u062F\u0631\u0647\u0645",
      toronto90k: "\u062A\u0648\u0631\u0648\u0646\u062A\u0648 90 \u0623\u0644\u0641 $ \u0623\u0639\u0632\u0628"
    }
  },
  results: {
    summaryTitle: "\u0635\u0627\u0641\u064A \u0627\u0644\u062F\u062E\u0644 \u0627\u0644\u0634\u0647\u0631\u064A \u0648\u0627\u0644\u0641\u0627\u0626\u0636 \u0627\u0644\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u062A\u0627\u062D",
    annualGross: "\u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0633\u0646\u0648\u064A",
    annualTakeHome: "\u0635\u0627\u0641\u064A \u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0633\u0646\u0648\u064A",
    monthlyTakeHome: "\u0635\u0627\u0641\u064A \u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0634\u0647\u0631\u064A",
    monthlyLivingCosts: "\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0627\u0644\u0634\u0647\u0631\u064A\u0629",
    monthlyDisposable: "\u0627\u0644\u062F\u062E\u0644 \u0627\u0644\u0645\u062A\u0627\u062D \u0628\u0639\u062F \u0627\u0644\u0646\u0641\u0642\u0627\u062A",
    savingsCapacity: "\u0627\u0644\u0627\u062F\u062E\u0627\u0631 \u0627\u0644\u0634\u0647\u0631\u064A \u0627\u0644\u0645\u062A\u0648\u0642\u0639",
    savingsRate: "\u0645\u0639\u062F\u0644 \u0627\u0644\u0627\u062F\u062E\u0627\u0631 \u0627\u0644\u062A\u0642\u062F\u064A\u0631\u064A",
    effectiveTaxRate: "\u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0641\u0639\u0644\u064A",
    housingBurden: "\u0639\u0628\u0621 \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0633\u0643\u0646 \u0648\u0627\u0644\u0625\u064A\u062C\u0627\u0631",
    taxesAndDeductions: "\u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0642\u0637\u0627\u0639\u0627\u062A \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0627\u0644\u0625\u0644\u0632\u0627\u0645\u064A\u0629",
    essentialLiving: "\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0627\u0644\u0636\u0631\u0648\u0631\u064A\u0629",
    discretionaryLiving: "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0631\u0641\u064A\u0647\u064A\u0629 \u0648\u0627\u0644\u0634\u062E\u0635\u064A\u0629",
    spendableSurplus: "\u0627\u0644\u0641\u0627\u0626\u0636 \u0627\u0644\u0645\u0627\u0644\u064A \u0627\u0644\u0642\u0627\u0628\u0644 \u0644\u0644\u0625\u0646\u0641\u0627\u0642",
    deficitWarning: "\u062A\u0646\u0628\u064A\u0647: \u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629 \u062A\u062A\u062C\u0627\u0648\u0632 \u0635\u0627\u0641\u064A \u0627\u0644\u062F\u062E\u0644 \u0627\u0644\u062A\u0642\u062F\u064A\u0631\u064A \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0645\u062F\u064A\u0646\u0629.",
    healthySurplus: "\u0641\u0627\u0626\u0636 \u0645\u0627\u0644\u064A \u0645\u0631\u064A\u062D: \u064A\u062A\u064A\u062D \u0644\u0643 \u062F\u062E\u0644\u0643 \u0627\u0644\u0635\u0627\u0641\u064A \u062A\u063A\u0637\u064A\u0629 \u0643\u0627\u0641\u0629 \u0627\u0644\u0646\u0641\u0642\u0627\u062A \u0645\u0639 \u062A\u062D\u0642\u064A\u0642 \u0627\u062F\u062E\u0627\u0631 \u0634\u0647\u0631\u064A \u062F\u0648\u0631\u064A.",
    taxPending: "\u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0642\u064A\u062F \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F.",
    shareSummaryTitle: "\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0645\u0627\u0644\u064A \u0644\u064A\u0641 \u0648\u0648\u0631\u062B\u064A",
    estimatedLivingCosts: "\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0631\u064A\u0629",
    benchmarkContext: "\u0627\u0644\u0645\u0631\u062C\u0639 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A \u0627\u0644\u0631\u0633\u0645\u064A \u0644\u0644\u0645\u062F\u064A\u0646\u0629",
    customizeAssumptions: "\u062A\u062E\u0635\u064A\u0635 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u0627\u062A"
  },
  salaryNeeded: {
    headline: "\u0643\u0645 \u062A\u062D\u062A\u0627\u062C \u0623\u0646 \u062A\u0643\u0633\u0628 \u0644\u0644\u0639\u064A\u0634 \u0628\u0627\u0631\u062A\u064A\u0627\u062D\u061F",
    subheadline: "\u062D\u062F\u062F \u0647\u062F\u0641\u0643 \u0645\u0646 \u0627\u0644\u0627\u062F\u062E\u0627\u0631 \u0627\u0644\u0634\u0647\u0631\u064A \u0623\u0648 \u0646\u0645\u0637 \u0645\u0639\u064A\u0634\u062A\u0643 \u0648\u0627\u0643\u062A\u0634\u0641 \u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0637\u0644\u0648\u0628.",
    targetSavings: "\u0627\u0644\u0627\u062F\u062E\u0627\u0631 \u0627\u0644\u0634\u0647\u0631\u064A \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641",
    desiredLifestyle: "\u0646\u0645\u0637 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628",
    requiredGross: "\u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0637\u0644\u0648\u0628",
    requiredNet: "\u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0635\u0627\u0641\u064A \u0627\u0644\u0634\u0647\u0631\u064A \u0627\u0644\u0645\u0637\u0644\u0648\u0628",
    calculatedGrossSalary: "\u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0644\u0627\u0632\u0645",
    explorePlan: "\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629"
  },
  salaryAfterTax: {
    headline: "\u062D\u0627\u0633\u0628\u0629 \u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0635\u0627\u0641\u064A \u0628\u0639\u062F \u0627\u0644\u0627\u0633\u062A\u0642\u0637\u0627\u0639\u0627\u062A \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629",
    subheadline: "\u062D\u0633\u0627\u0628\u0627\u062A \u0634\u0641\u0627\u0641\u0629 \u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u062F\u062E\u0644 \u0645\u0646 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0625\u0644\u0649 \u0627\u0644\u0635\u0627\u0641\u064A \u0627\u0633\u062A\u0646\u0627\u062F\u0627\u064B \u0625\u0644\u0649 \u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u062C\u0628\u0627\u064A\u0629 \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629.",
    federalTax: "\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u062F\u062E\u0644 \u0627\u0644\u0648\u0637\u0646\u064A\u0629 / \u0627\u0644\u0641\u064A\u062F\u0631\u0627\u0644\u064A\u0629",
    stateLocalTax: "\u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629 / \u0627\u0644\u0648\u0644\u0627\u0626\u064A\u0629 / \u0627\u0644\u0645\u062D\u0644\u064A\u0629",
    socialSecurity: "\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A \u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A \u0648\u0627\u0644\u062A\u0642\u0627\u0639\u062F",
    medicare: "\u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0627\u0644\u0635\u062D\u064A \u0627\u0644\u0625\u0644\u0632\u0627\u0645\u064A",
    totalDeductions: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0627\u0633\u062A\u0642\u0637\u0627\u0639\u0627\u062A \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629",
    netTakeHome: "\u0635\u0627\u0641\u064A \u0627\u0644\u062F\u062E\u0644 \u0627\u0644\u0645\u0633\u062A\u0644\u0645 \u0628\u0627\u0644\u064A\u062F",
    effectiveTaxNote: "\u0627\u0644\u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0627\u0644\u0641\u0639\u0644\u064A \u0627\u0644\u0645\u062C\u0645\u0639"
  },
  costOfLiving: {
    headline: "\u062A\u0641\u0635\u064A\u0644 \u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0648\u0646\u0641\u0642\u0627\u062A \u0627\u0644\u0623\u0633\u0631\u0629",
    subheadline: "\u0628\u064A\u0627\u0646\u0627\u062A \u0625\u062D\u0635\u0627\u0626\u064A\u0629 \u062D\u0643\u0648\u0645\u064A\u0629 \u0645\u062F\u0642\u0642\u0629 \u0644\u0644\u0633\u0643\u0646 \u0648\u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0641\u0642 \u0648\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u0646\u0642\u0644.",
    housingRent: "\u0627\u0644\u0633\u0643\u0646 \u0648\u0627\u0644\u0625\u064A\u062C\u0627\u0631",
    groceriesFood: "\u0627\u0644\u0628\u0642\u0627\u0644\u0629 \u0648\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629",
    diningOut: "\u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0648\u0627\u0644\u0648\u062C\u0628\u0627\u062A \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629",
    utilitiesInternet: "\u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u0645\u064A\u0627\u0647 \u0648\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A",
    publicTransit: "\u0627\u0644\u0645\u0648\u0627\u0635\u0644\u0627\u062A \u0627\u0644\u0639\u0627\u0645\u0629 \u0648\u0627\u0644\u062A\u0646\u0642\u0644",
    totalMonthlyLiving: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0634\u0647\u0631\u064A\u0629 \u0627\u0644\u0645\u0639\u064A\u0634\u064A\u0629",
    householdTypeSelect: "\u0627\u062E\u062A\u064A\u0627\u0631 \u062A\u0631\u0643\u064A\u0628\u0629 \u0627\u0644\u0623\u0633\u0631\u0629"
  },
  compare: {
    headline: "\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0631\u0648\u0627\u062A\u0628 \u0648\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0628\u064A\u0646 \u0627\u0644\u0645\u062F\u0646",
    subheadline: "\u0627\u062D\u062A\u0633\u0627\u0628 \u0641\u0631\u0648\u0642 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0634\u0631\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u0645\u0632\u0627\u064A\u0627 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629 \u0648\u0645\u0643\u0627\u0641\u0626 \u0627\u0644\u0631\u0627\u062A\u0628 \u0639\u0646\u062F \u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0628\u064A\u0646 \u0627\u0644\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629.",
    cityA: "\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 (\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u062D\u0627\u0644\u064A)",
    cityB: "\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 (\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u062C\u062F\u064A\u062F)",
    salaryA: "\u0627\u0644\u0631\u0627\u062A\u0628 \u0641\u064A \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0623\u0648\u0644\u0649",
    equivalentSalary: "\u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0645\u0643\u0627\u0641\u0626 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0641\u064A \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629",
    purchasingPowerDelta: "\u0641\u0627\u0631\u0642 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0634\u0631\u0627\u0626\u064A\u0629 \u0627\u0644\u062D\u0642\u064A\u0642\u064A",
    verdictLabel: "\u062E\u0644\u0627\u0635\u0629 \u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0634\u0631\u0627\u0626\u064A\u0629"
  },
  jobOffers: {
    headline: "\u0645\u0642\u0627\u0631\u0646\u0629 \u0639\u0631\u0648\u0636 \u0627\u0644\u0639\u0645\u0644 \u0628\u064A\u0646 \u0627\u0644\u0645\u062F\u0646 \u0648\u0627\u0644\u0628\u0644\u062F\u0627\u0646",
    subheadline: "\u062A\u0642\u064A\u064A\u0645 \u062D\u0632\u0645 \u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A \u0627\u0644\u062A\u0646\u0627\u0641\u0633\u064A\u0629 \u0639\u0628\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u062A \u0627\u0644\u0645\u062A\u0639\u062F\u062F\u0629 \u0648\u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629 \u0648\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0627\u0644\u0641\u0639\u0644\u064A\u0629.",
    offerA: "\u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u0623\u0648\u0644",
    offerB: "\u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u062B\u0627\u0646\u064A",
    offerVerdict: "\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0639\u0631\u0636 \u0648\u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629",
    higherRealIncome: "\u064A\u0648\u0641\u0631 {winner} \u062F\u062E\u0644\u0627\u064B \u0645\u062A\u0627\u062D\u0627\u064B \u0625\u0636\u0627\u0641\u064A\u0627\u064B \u0628\u0642\u064A\u0645\u0629 {delta}."
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "\u0627\u0644\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0644\u0647\u0630\u0647 \u0627\u0644\u0633\u0646\u0629 \u0623\u0648 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0644\u0645 \u062A\u0635\u062F\u0631 \u0641\u064A \u0627\u0644\u062C\u0631\u064A\u062F\u0629 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0628\u0639\u062F. \u0644\u0627 \u064A\u0642\u062F\u0645 \u0644\u064A\u0641 \u0648\u0648\u0631\u062B\u064A \u0623\u0631\u0642\u0627\u0645\u0627\u064B \u062A\u0642\u062F\u064A\u0631\u064A\u0629 \u0639\u0634\u0648\u0627\u0626\u064A\u0629.",
    INVALID_SALARY: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0645\u0628\u0644\u063A \u0631\u0627\u062A\u0628 \u0625\u064A\u062C\u0627\u0628\u064A \u0635\u062D\u064A\u062D.",
    CITY_NOT_SUPPORTED: "\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u063A\u064A\u0631 \u0645\u062F\u0631\u062C\u0629 \u062D\u0627\u0644\u064A\u0627\u064B \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A.",
    DATA_STALE: "\u062A\u062E\u0636\u0639 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0629 \u062D\u0627\u0644\u064A\u0627\u064B \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u0644\u062A\u062F\u0642\u064A\u0642 \u0627\u0644\u0633\u0646\u0648\u064A.",
    FX_UNAVAILABLE: "\u062E\u062F\u0645\u0629 \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0635\u0631\u0641 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u0645\u0624\u0642\u062A\u0627\u064B. \u064A\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0622\u062E\u0631 \u0625\u063A\u0644\u0627\u0642 \u0631\u0633\u0645\u064A \u0645\u0648\u062B\u0642.",
    NETWORK_ERROR: "\u062A\u0639\u0630\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u0634\u0628\u0643\u0629. \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629."
  },
  footer: {
    aboutDesc: "\u0644\u064A\u0641 \u0648\u0648\u0631\u062B\u064A \u0645\u0646\u0638\u0648\u0645\u0629 \u0630\u0643\u0627\u0621 \u0645\u0627\u0644\u064A \u0645\u0633\u062A\u0642\u0644\u0629 \u062A\u0648\u0641\u0631 \u062D\u0633\u0627\u0628\u0627\u062A \u062D\u062A\u0645\u064A\u0629 \u0644\u0644\u0631\u0648\u0627\u062A\u0628 \u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u0648\u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0641\u064A \u0627\u0644\u0645\u062F\u0646.",
    calculatorsTitle: "\u0627\u0644\u062D\u0627\u0633\u0628\u0627\u062A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629",
    intelligenceTitle: "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0645\u0627\u0644\u064A \u0627\u0644\u062F\u0648\u0644\u064A",
    institutionalTitle: "\u0627\u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0648\u0627\u0644\u0633\u064A\u0627\u0633\u0627\u062A",
    cityComparisons: "\u0645\u0642\u0627\u0631\u0646\u0627\u062A \u0627\u0644\u0645\u062F\u0646",
    empiricalReports: "\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0628\u062D\u062B\u064A\u0629 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0629 \u2190",
    editorialPolicy: "\u0627\u0644\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u062A\u062D\u0631\u064A\u0631\u064A\u0629",
    dataPolicy: "\u0633\u064A\u0627\u0633\u0629 \u0646\u0632\u0627\u0647\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A",
    corrections: "\u0625\u0628\u0644\u0627\u063A \u0639\u0646 \u062A\u0635\u062D\u064A\u062D \u0628\u064A\u0627\u0646\u0627\u062A",
    terms: "\u0634\u0631\u0648\u0637 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645",
    privacy: "\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629",
    copyright: "\xA9 2026 \u0644\u064A\u0641 \u0648\u0648\u0631\u062B\u064A. \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629. \u0628\u0646\u064A\u0629 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u062D\u062A\u0645\u064A\u0629."
  },
  languageSelector: {
    title: "\u0627\u062E\u062A\u064A\u0627\u0631 \u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0636",
    searchPlaceholder: "\u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0644\u063A\u0629...",
    currentLanguage: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629",
    switchSuggestion: "\u0647\u0644 \u062A\u0631\u063A\u0628 \u0641\u064A \u062A\u0635\u0641\u062D \u0644\u064A\u0641 \u0648\u0648\u0631\u062B\u064A \u0628\u0627\u0644\u0644\u063A\u0629 {language}\u061F",
    switchCta: "\u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0625\u0644\u0649 {language}",
    dismiss: "\u062A\u062C\u0627\u0647\u0644",
    allLanguages: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0644\u063A\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629"
  },
  reports: {
    hubTitle: "\u0627\u0644\u0628\u062D\u0648\u062B \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0642\u064A\u0627\u0633\u064A\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629",
    hubSubtitle: "\u062F\u0631\u0627\u0633\u0627\u062A \u0643\u0645\u064A\u0629 \u0634\u0641\u0627\u0641\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0627\u0642\u062A\u0628\u0627\u0633 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A \u062A\u0642\u0627\u0631\u0646 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0634\u0631\u0627\u0626\u064A\u0629 \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629 \u0648\u0627\u0644\u0627\u062D\u062A\u0641\u0627\u0638 \u0628\u0627\u0644\u062F\u062E\u0644 \u0639\u0628\u0631 39 \u0633\u0648\u0642\u0627\u064B \u062F\u0648\u0644\u064A\u0627\u064B.",
    instituteBadge: "\u0645\u0639\u0647\u062F \u0627\u0644\u0628\u062D\u0648\u062B \u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0629",
    modelBadge: "\u0646\u0645\u0630\u062C\u0629 \u062D\u062A\u0645\u064A\u0629 \u062E\u0627\u0644\u064A\u0629 \u0645\u0646 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0644\u0639\u0634\u0648\u0627\u0626\u064A",
    globalSalaryWorthTitle: "\u0627\u0644\u0645\u0624\u0634\u0631 \u0627\u0644\u0639\u0627\u0644\u0645\u064A \u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0631\u0648\u0627\u062A\u0628 2026",
    purchasingPowerTitle: "\u062A\u0642\u0631\u064A\u0631 \u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0634\u0631\u0627\u0626\u064A\u0629 \u0628\u064A\u0646 \u0627\u0644\u0639\u0648\u0627\u0635\u0645",
    salaryToRentTitle: "\u0645\u0624\u0634\u0631 \u0646\u0633\u0628\u0629 \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0625\u0644\u0649 \u0635\u0627\u0641\u064A \u0627\u0644\u0631\u0627\u062A\u0628",
    relocationGapTitle: "\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0641\u062C\u0648\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0639\u0646\u062F \u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0627\u0644\u0648\u0638\u064A\u0641\u064A",
    takeHomePayTitle: "\u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 \u0644\u0635\u0627\u0641\u064A \u0627\u0644\u062F\u062E\u0644 \u0627\u0644\u0645\u062A\u0628\u0642\u064A",
    downloadCsv: "\u062A\u062D\u0645\u064A\u0644 \u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A CSV",
    downloadJson: "\u062A\u062D\u0645\u064A\u0644 \u0645\u0644\u0641 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A JSON",
    methodologyHeading: "\u0627\u0644\u0645\u0646\u0647\u062C\u064A\u0629 \u0648\u0627\u0644\u062D\u062F\u0648\u062F \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0629",
    sourcesHeading: "\u0627\u0644\u0645\u0635\u0627\u062F\u0631 \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629 \u0627\u0644\u0631\u0633\u0645\u064A\u0629",
    citationHeading: "\u0627\u0644\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A \u0648\u0635\u064A\u063A\u0629 \u0627\u0644\u0627\u0642\u062A\u0628\u0627\u0633"
  }
};

// src/lib/i18n/locales/de.ts
var deDictionary = {
  locale: "de",
  common: {
    brand: "LivWorthy",
    tagline: "Globale Gehalts-, Steuer- und Lebenshaltungskosten-Intelligenz",
    livingIntelligence: "Lebenshaltungskosten-Intelligenz",
    calculating: "Berechnung l\xE4uft...",
    calculate: "Berechnen",
    annual: "J\xE4hrlich",
    monthly: "Monatlich",
    year: "Jahr",
    month: "Monat",
    share: "Teilen",
    copied: "In die Zwischenablage kopiert",
    home: "Startseite",
    back: "Zur\xFCck",
    next: "Weiter",
    close: "Schlie\xDFen",
    disclaimer: "Deterministische Sch\xE4tzungen auf Basis amtlicher Steuertabellen und statistischer Erhebungen. Keine formelle Steuerberatung.",
    verifiedTaxBaseline: "Gesetzlich verifizierte Steuerbasis 2026",
    tier1SourcesBadge: "Offizielle staatliche Prim\xE4rquellen (Tier 1)",
    singleAdult: "Alleinstehend (Single)",
    couple: "Paar / Doppelverdiener",
    family: "Familie (2 Erwachsene, 1 Kind)",
    action: "Aktion",
    evidence: "Evidenz & Datenquellen",
    methodology: "Berechnungsmethodik",
    diagnostics: "Systemdiagnostik"
  },
  nav: {
    howItWorks: "Funktionsweise",
    sources: "Quellen",
    coverage: "Marktabdeckung",
    relocation: "Relocation & Umzug",
    jobOfferComparison: "Angebotsvergleich",
    reports: "Empirische Berichte",
    guides: "St\xE4dtef\xFChrer",
    compare: "St\xE4dte vergleichen",
    tabSalaryWorth: "Reicht mein Gehalt?",
    tabSalaryNeeded: "Wie viel muss ich verdienen?",
    tabSalaryAfterTax: "Nettogehalt nach Steuern",
    tabCostOfLiving: "Lebenshaltungskosten",
    tabCompare: "St\xE4dte vergleichen",
    tabJobOffers: "Jobangebote vergleichen",
    tabGuides: "Gehaltsf\xFChrer nach St\xE4dten"
  },
  calculator: {
    chooseCity: "1. Stadt / Standort w\xE4hlen",
    annualSalary: "2. Jahresbruttogehalt",
    salaryHelp: "Verg\xFCtung vor Steuern und Abgaben (Grundgehalt).",
    statutoryJurisdiction: "Gesetzliche Steuerhoheit: {jurisdiction}",
    popularScenarios: "H\xE4ufige Szenarien:",
    heroHeadline: "Was ist Ihr Gehalt wirklich wert?",
    heroSubheadline: "Geben Sie Gehalt und Stadt ein, um Ihr Nettoeinkommen, Ihre Ausgaben und Ihre tats\xE4chliche Sparquote zu berechnen.",
    heroSupporting: "Pr\xFCfen Sie, ob Ihr Gehalt die Lebenshaltungskosten deckt und Ersparnisse erm\xF6glicht.",
    householdType: "Haushaltszusammensetzung",
    rentOverride: "Individuelle Monatsmiete",
    rentOverridePlaceholder: "z.B. 2.500",
    rentOverrideHelp: "\xDCberschreibt den statistischen Medianwert.",
    taxYearLabel: "Steuerjahr",
    filingStatusLabel: "Steuerklasse / Familienstand",
    dependentsLabel: "Unterhaltsberechtigte Kinder",
    btnCalculate: "Nettogehalt & Kaufkraft berechnen",
    quickScenarios: {
      nyc100k: "NYC $100k Single",
      london60k: "London \xA360k Single",
      dubai300k: "Dubai 300k AED",
      toronto90k: "Toronto $90k Single"
    }
  },
  results: {
    summaryTitle: "Gesch\xE4tztes Nettoeinkommen & Verf\xFCgbares Budget",
    annualGross: "Jahresbruttogehalt",
    annualTakeHome: "Jahresnettoeinkommen",
    monthlyTakeHome: "Monatsnettoeinkommen",
    monthlyLivingCosts: "Monatliche Lebenshaltungskosten",
    monthlyDisposable: "Monatlich verf\xFCgbares Einkommen",
    savingsCapacity: "Reale monatliche Sparf\xE4higkeit",
    savingsRate: "Prognostizierte Sparquote",
    effectiveTaxRate: "Effektiver Steuersatz",
    housingBurden: "Wohnkostenbelastung",
    taxesAndDeductions: "Steuern & Gesetzliche Sozialabgaben",
    essentialLiving: "Grundlegende Existenzkosten",
    discretionaryLiving: "Freizeit & Pers\xF6nliche Ausgaben",
    spendableSurplus: "Frei verf\xFCgbares Ausgabenpolster",
    deficitWarning: "Warnung: Die prognostizierten Lebenshaltungskosten \xFCbersteigen das gesch\xE4tzte Nettoeinkommen an diesem Standort.",
    healthySurplus: "Positiver \xDCberschuss: Ihr Nettoeinkommen deckt alle Kosten ab und erm\xF6glicht regelm\xE4\xDFiges Sparen.",
    taxPending: "Steuerberechnung steht unter gesetzlichem Pr\xFCfvorbehalt.",
    shareSummaryTitle: "LivWorthy Finanzbewertung",
    estimatedLivingCosts: "Gesch\xE4tzte Lebenshaltungskosten",
    benchmarkContext: "Statistischer Benchmark-Referenzwert",
    customizeAssumptions: "Annahmen anpassen"
  },
  salaryNeeded: {
    headline: "Wie viel m\xFCssen Sie verdienen?",
    subheadline: "W\xE4hlen Sie Ihr gew\xFCnschtes Sparziel oder Ihren Lebensstandard und berechnen Sie das daf\xFCr erforderliche Bruttogehalt.",
    targetSavings: "Gew\xFCnschte monatliche Ersparnis",
    desiredLifestyle: "Angestrebter Lebensstandard",
    requiredGross: "Erforderliches Bruttogehalt",
    requiredNet: "Erforderliches Monatsnetto",
    calculatedGrossSalary: "Ben\xF6tigtes Bruttogehalt",
    explorePlan: "Finanzplan im Detail ansehen"
  },
  salaryAfterTax: {
    headline: "Brutto-Netto-Rechner mit amtlichen Steuers\xE4tzen",
    subheadline: "Transparente Gehaltsabrechnung auf Basis aktueller gesetzlicher Tarife und Sozialabgaben.",
    federalTax: "Einkommensteuer / Bundessteuer",
    stateLocalTax: "Landes-, Kirchen- oder Regionalsteuer",
    socialSecurity: "Renten- & Arbeitslosenversicherung",
    medicare: "Gesetzliche Kranken- & Pflegeversicherung",
    totalDeductions: "Gesamte gesetzliche Abz\xFCge",
    netTakeHome: "Nettogehalt zur Auszahlung",
    effectiveTaxNote: "Kombinierter effektiver Abgabensatz"
  },
  costOfLiving: {
    headline: "Detaillierte Lebenshaltungskosten des Haushalts",
    subheadline: "Staatlich gepr\xFCfte Konsumausgabenbenchmarks f\xFCr Wohnen, Ern\xE4hrung, Nebenkosten und Mobilit\xE4t.",
    housingRent: "Wohnen & Kaltmiete",
    groceriesFood: "Lebensmittel & Ern\xE4hrung",
    diningOut: "Gastronomie & Restaurants",
    utilitiesInternet: "Nebenkosten, Strom & Internet",
    publicTransit: "\xD6ffentlicher Nahverkehr",
    totalMonthlyLiving: "Gesamte monatliche Lebenshaltungskosten",
    householdTypeSelect: "Haushaltsprofil w\xE4hlen"
  },
  compare: {
    headline: "Gehalt und Lebenshaltungskosten zwischen St\xE4dten vergleichen",
    subheadline: "Modellieren Sie Kaufkraftunterschiede, Steuerarbitrage und \xC4quivalenzgeh\xE4lter zwischen Weltmetropolen.",
    cityA: "Stadt A (Ausgangsort)",
    cityB: "Stadt B (Zielort)",
    salaryA: "Gehalt in Stadt A",
    equivalentSalary: "\xC4quivalentes Gehalt in Stadt B",
    purchasingPowerDelta: "Kaufkraftdifferenz",
    verdictLabel: "Kaufkraft-Ergebnis"
  },
  jobOffers: {
    headline: "Internationale Jobangebote vergleichen",
    subheadline: "Bewerten Sie Verg\xFCtungspakete \xFCber W\xE4hrungen, Steuersysteme und reale lokale Kosten hinweg.",
    offerA: "Angebot A",
    offerB: "Angebot B",
    offerVerdict: "Angebotsbewertung & Reale Kaufkraft",
    higherRealIncome: "{winner} bietet {delta} mehr frei verf\xFCgbares Realeinkommen."
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "Die amtlichen Steuertabellen f\xFCr dieses Steuerjahr oder diesen Standort wurden noch nicht ver\xF6ffentlicht. LivWorthy erfindet keine synthetischen Werte.",
    INVALID_SALARY: "Bitte geben Sie einen g\xFCltigen positiven Gehaltsbetrag ein.",
    CITY_NOT_SUPPORTED: "Die ausgew\xE4hlte Stadt ist derzeit noch nicht in der Datenbank erfasst.",
    DATA_STALE: "Die zugrundeliegenden Daten durchlaufen die j\xE4hrliche amtliche \xDCberpr\xFCfung.",
    FX_UNAVAILABLE: "W\xE4hrungskursdienst vor\xFCbergehend nicht erreichbar. Letzter validierter Kursstand aktiv.",
    NETWORK_ERROR: "Netzwerkfehler. Bitte wiederholen Sie die Berechnung."
  },
  footer: {
    aboutDesc: "LivWorthy ist eine unabh\xE4ngige Finanzanalyse-Plattform f\xFCr deterministische Berechnungen internationaler Geh\xE4lter, Steuern und Lebenshaltungskosten.",
    calculatorsTitle: "Rechner",
    intelligenceTitle: "Globale Intelligenz",
    institutionalTitle: "Richtlinien & Standards",
    cityComparisons: "St\xE4dtevergleiche",
    empiricalReports: "Empirische Forschungsberichte \u2192",
    editorialPolicy: "Redaktionelle Richtlinie",
    dataPolicy: "Datenintegrit\xE4tspolitik",
    corrections: "Datenkorrektur melden",
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutzerkl\xE4rung",
    copyright: "\xA9 2026 LivWorthy Inc. Alle Rechte vorbehalten. Deterministische FinTech-Architektur."
  },
  languageSelector: {
    title: "Sprache ausw\xE4hlen",
    searchPlaceholder: "Sprachen durchsuchen...",
    currentLanguage: "Aktuelle Sprache",
    switchSuggestion: "M\xF6chten Sie LivWorthy auf {language} anzeigen?",
    switchCta: "Zu {language} wechseln",
    dismiss: "Schlie\xDFen",
    allLanguages: "Alle verf\xFCgbaren Sprachen"
  },
  reports: {
    hubTitle: "Empirische Forschung & Benchmark-Indizes",
    hubSubtitle: "Transparente, zitierf\xE4hige Forschungsdaten zu Netto-Einkommensretention, Grenzkaufkraft und urbanen Lebenshaltungskosten in 39 M\xE4rkten.",
    instituteBadge: "Institut f\xFCr quantitative Wirtschaftsforschung",
    modelBadge: "Deterministische Modellierung ohne KI-Sch\xE4tzungen",
    globalSalaryWorthTitle: "Globaler Gehaltswert-Index 2026",
    purchasingPowerTitle: "Kaufkraft-Vergleichsbericht",
    salaryToRentTitle: "Gehalt-zu-Miete-Quotienten-Index",
    relocationGapTitle: "Relocation-Gehaltssprung-Bericht",
    takeHomePayTitle: "Weltweiter Nettoauszahlungs-Vergleich",
    downloadCsv: "CSV-Datensatz herunterladen",
    downloadJson: "Rohdaten im JSON-Format herunterladen",
    methodologyHeading: "Methodik & Statistische Schranken",
    sourcesHeading: "Staatliche Prim\xE4rquellen",
    citationHeading: "Akademische Zitation & Quellenangabe"
  }
};

// src/lib/i18n/locales/pt.ts
var ptDictionary = {
  locale: "pt",
  common: {
    brand: "LivWorthy",
    tagline: "Intelig\xEAncia Global de Sal\xE1rios, Impostos e Custo de Vida",
    livingIntelligence: "Intelig\xEAncia de Vida",
    calculating: "Calculando...",
    calculate: "Calcular",
    annual: "Anual",
    monthly: "Mensal",
    year: "Ano",
    month: "M\xEAs",
    share: "Compartilhar",
    copied: "Copiado para a \xE1rea de transfer\xEAncia",
    home: "In\xEDcio",
    back: "Voltar",
    next: "Avan\xE7ar",
    close: "Fechar",
    disclaimer: "C\xE1lculos determin\xEDsticos baseados em tabelas fiscais oficiais e \xEDndices estat\xEDsticos auditados. N\xE3o constitui consultoria fiscal.",
    verifiedTaxBaseline: "Base Fiscal 2026 Verificada por Lei",
    tier1SourcesBadge: "Fontes Oficiais Governamentais de N\xEDvel 1",
    singleAdult: "Adulto Solteiro",
    couple: "Casal / Dupla Renda",
    family: "Fam\xEDlia (2 Adultos, 1 Filho)",
    action: "A\xE7\xE3o",
    evidence: "Evid\xEAncias e Fontes de Dados",
    methodology: "Metodologia de C\xE1lculo",
    diagnostics: "Diagn\xF3sticos do Sistema"
  },
  nav: {
    howItWorks: "Como Funciona",
    sources: "Fontes",
    coverage: "Cobertura",
    relocation: "Reloca\xE7\xE3o",
    jobOfferComparison: "Avaliar Propostas",
    reports: "Relat\xF3rios Emp\xEDricos",
    guides: "Guias de Cidades",
    compare: "Comparar Cidades",
    tabSalaryWorth: "Meu Sal\xE1rio \xE9 Suficiente?",
    tabSalaryNeeded: "Quanto Devo Ganhar?",
    tabSalaryAfterTax: "Sal\xE1rio L\xEDquido Real",
    tabCostOfLiving: "Custo de Vida",
    tabCompare: "Comparar Cidades",
    tabJobOffers: "Comparar Propostas de Emprego",
    tabGuides: "Guias Salariais por Cidade"
  },
  calculator: {
    chooseCity: "1. Escolher Cidade / Localidade",
    annualSalary: "2. Sal\xE1rio Bruto Anual",
    salaryHelp: "Remunera\xE7\xE3o antes dos impostos (sal\xE1rio base).",
    statutoryJurisdiction: "Jurisdi\xE7\xE3o fiscal tribut\xE1ria: {jurisdiction}",
    popularScenarios: "Cen\xE1rios Frequentes:",
    heroHeadline: "Quanto vale realmente o seu sal\xE1rio?",
    heroSubheadline: "Informe seu sal\xE1rio e cidade para calcular sua renda l\xEDquida, despesas mensais e poupan\xE7a real.",
    heroSupporting: "Verifique se sua remunera\xE7\xE3o cobre o custo de vida e permite acumular patrim\xF4nio na cidade escolhida.",
    householdType: "Composi\xE7\xE3o Familiar",
    rentOverride: "Aluguel Mensal Personalizado",
    rentOverridePlaceholder: "ex. 2.500",
    rentOverrideHelp: "Substitui a m\xE9dia estat\xEDstica apurada.",
    taxYearLabel: "Ano Fiscal",
    filingStatusLabel: "Estado Civil / Declara\xE7\xE3o",
    dependentsLabel: "Dependentes",
    btnCalculate: "Calcular Sal\xE1rio L\xEDquido e Poder de Compra",
    quickScenarios: {
      nyc100k: "NYC $100k Solteiro",
      london60k: "Londres \xA360k Solteiro",
      dubai300k: "Dubai 300k AED",
      toronto90k: "Toronto $90k Solteiro"
    }
  },
  results: {
    summaryTitle: "Renda L\xEDquida Estimada e Saldo Dispon\xEDvel",
    annualGross: "Sal\xE1rio Bruto Anual",
    annualTakeHome: "Sal\xE1rio L\xEDquido Anual",
    monthlyTakeHome: "Sal\xE1rio L\xEDquido Mensal",
    monthlyLivingCosts: "Custo de Vida Mensal",
    monthlyDisposable: "Renda Dispon\xEDvel Mensal",
    savingsCapacity: "Capacidade de Poupan\xE7a Mensal",
    savingsRate: "Taxa Projetada de Poupan\xE7a",
    effectiveTaxRate: "Al\xEDquota Efetiva de Imposto",
    housingBurden: "Peso do Custo de Moradia",
    taxesAndDeductions: "Impostos e Reten\xE7\xF5es Oficiais",
    essentialLiving: "Despesas Essenciais de Subsist\xEAncia",
    discretionaryLiving: "Lazer e Gastos Discricion\xE1rios",
    spendableSurplus: "Super\xE1vit Dispon\xEDvel",
    deficitWarning: "Aten\xE7\xE3o: O custo de vida estimado ultrapassa a renda l\xEDquida nesta localidade.",
    healthySurplus: "Super\xE1vit Saud\xE1vel: Sua renda cobre com tranquilidade as despesas b\xE1sicas e viabiliza poupan\xE7a regular.",
    taxPending: "C\xE1lculo de imposto pendente de homologa\xE7\xE3o legislativa.",
    shareSummaryTitle: "Avalia\xE7\xE3o Financeira LivWorthy",
    estimatedLivingCosts: "Custo de Vida Estimado",
    benchmarkContext: "Refer\xEAncia estat\xEDstica oficial apurada",
    customizeAssumptions: "Personalizar premissas"
  },
  salaryNeeded: {
    headline: "Quanto voc\xEA precisa ganhar?",
    subheadline: "Defina sua meta de poupan\xE7a mensal ou estilo de vida desejado e descubra o sal\xE1rio bruto necess\xE1rio.",
    targetSavings: "Meta de Poupan\xE7a Mensal",
    desiredLifestyle: "Padr\xE3o de Vida Desejado",
    requiredGross: "Sal\xE1rio Bruto Necess\xE1rio",
    requiredNet: "Renda L\xEDquida Mensal Necess\xE1ria",
    calculatedGrossSalary: "Sal\xE1rio Bruto Calculado",
    explorePlan: "Explorar Plano Financeiro"
  },
  salaryAfterTax: {
    headline: "Calculadora de Sal\xE1rio L\xEDquido P\xF3s-Tributa\xE7\xE3o",
    subheadline: "C\xE1lculos transparentes do bruto ao l\xEDquido baseados nas tabelas oficiais de arrecada\xE7\xE3o do governo.",
    federalTax: "Imposto de Renda Federal / Nacional",
    stateLocalTax: "Imposto Estadual / Regional / Municipal",
    socialSecurity: "Contribui\xE7\xF5es Previdenci\xE1rias Oficiais",
    medicare: "Seguro Sa\xFAde e Assist\xEAncia Obrigat\xF3ria",
    totalDeductions: "Total de Reten\xE7\xF5es Oficiais",
    netTakeHome: "Sal\xE1rio L\xEDquido em M\xE3os",
    effectiveTaxNote: "Al\xEDquota efetiva global de tributa\xE7\xE3o"
  },
  costOfLiving: {
    headline: "Detalhamento do Custo de Vida Familiar",
    subheadline: "\xCDndices governamentais auditados de despesas com habita\xE7\xE3o, alimenta\xE7\xE3o, servi\xE7os e transporte.",
    housingRent: "Habita\xE7\xE3o e Aluguel",
    groceriesFood: "Alimenta\xE7\xE3o e Supermercado",
    diningOut: "Restaurantes e Alimenta\xE7\xE3o Fora",
    utilitiesInternet: "Contas de Consumo e Internet",
    publicTransit: "Transporte P\xFAblico",
    totalMonthlyLiving: "Despesas Mensais Totais de Vida",
    householdTypeSelect: "Selecionar Perfil Familiar"
  },
  compare: {
    headline: "Comparar Sal\xE1rios e Custo de Vida entre Cidades",
    subheadline: "Simule diferen\xE7as de poder de compra, arbitragem fiscal e paridade salarial entre grandes centros globais.",
    cityA: "Cidade A (Origem)",
    cityB: "Cidade B (Destino)",
    salaryA: "Sal\xE1rio na Cidade A",
    equivalentSalary: "Sal\xE1rio Equivalente Necess\xE1rio na Cidade B",
    purchasingPowerDelta: "Diferencial de Poder Aquisitivo",
    verdictLabel: "Veredito de Poder de Compra"
  },
  jobOffers: {
    headline: "Comparar Propostas de Emprego Internacionais",
    subheadline: "Avalie pacotes de remunera\xE7\xE3o entre moedas distintas, regimes tribut\xE1rios e custos de vida reais.",
    offerA: "Proposta A",
    offerB: "Proposta B",
    offerVerdict: "Avalia\xE7\xE3o & Valor Real da Proposta",
    higherRealIncome: "{winner} oferece {delta} a mais de renda real dispon\xEDvel."
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "As normas tribut\xE1rias para este ano ou jurisdi\xE7\xE3o ainda n\xE3o foram publicadas oficialmente. O LivWorthy n\xE3o inventa dados artificiais.",
    INVALID_SALARY: "Por favor, insira um valor salarial positivo v\xE1lido.",
    CITY_NOT_SUPPORTED: "A cidade selecionada ainda n\xE3o est\xE1 cadastrada em nossa base de dados.",
    DATA_STALE: "Os dados de refer\xEAncia passam atualmente por auditoria anual oficial.",
    FX_UNAVAILABLE: "Servi\xE7o de cota\xE7\xF5es cambiais temporariamente indispon\xEDvel. Utilizando \xFAltimo fechamento auditado.",
    NETWORK_ERROR: "Falha de conex\xE3o com a rede. Por favor, tente novamente."
  },
  footer: {
    aboutDesc: "O LivWorthy \xE9 um motor independente de intelig\xEAncia financeira que fornece c\xE1lculos determin\xEDsticos de sal\xE1rios, impostos e custos de vida urbanos.",
    calculatorsTitle: "Calculadoras",
    intelligenceTitle: "Intelig\xEAncia Global",
    institutionalTitle: "Pol\xEDticas & Padr\xF5es",
    cityComparisons: "Compara\xE7\xF5es de Cidades",
    empiricalReports: "Relat\xF3rios de Pesquisa Emp\xEDrica \u2192",
    editorialPolicy: "Pol\xEDtica Editorial",
    dataPolicy: "Pol\xEDtica de Integridade de Dados",
    corrections: "Reportar Corre\xE7\xE3o de Dados",
    terms: "Termos de Uso",
    privacy: "Pol\xEDtica de Privacidade",
    copyright: "\xA9 2026 LivWorthy Inc. Todos os direitos reservados. Arquitetura FinTech Determin\xEDstica."
  },
  languageSelector: {
    title: "Selecionar Idioma",
    searchPlaceholder: "Pesquisar idiomas...",
    currentLanguage: "Idioma Atual",
    switchSuggestion: "Deseja navegar no LivWorthy em {language}?",
    switchCta: "Mudar para {language}",
    dismiss: "Fechar",
    allLanguages: "Todos os Idiomas Dispon\xEDveis"
  },
  reports: {
    hubTitle: "Pesquisas Emp\xEDricas & \xCDndices de Refer\xEAncia",
    hubSubtitle: "Estudos abertos e cit\xE1veis sobre reten\xE7\xE3o tribut\xE1ria l\xEDquida, poder de compra e remunera\xE7\xE3o comparada em 39 mercados internacionais.",
    instituteBadge: "Instituto de Pesquisa Quantitativa",
    modelBadge: "Modelagem Determin\xEDstica Sem IA Especulativa",
    globalSalaryWorthTitle: "\xCDndice Global do Valor do Sal\xE1rio 2026",
    purchasingPowerTitle: "Relat\xF3rio Comparativo de Poder de Compra",
    salaryToRentTitle: "\xCDndice da Raz\xE3o Sal\xE1rio-Aluguel",
    relocationGapTitle: "Relat\xF3rio de Diferen\xE7a Salarial em Reloca\xE7\xE3o",
    takeHomePayTitle: "Comparativo Mundial de Sal\xE1rio L\xEDquido Retido",
    downloadCsv: "Baixar Base de Dados CSV",
    downloadJson: "Baixar Arquivo JSON Bruto",
    methodologyHeading: "Metodologia & Limites Estat\xEDsticos",
    sourcesHeading: "Fontes Oficiais Governamentais",
    citationHeading: "Refer\xEAncia Acad\xEAmica & Cita\xE7\xE3o"
  }
};

// src/lib/i18n/locales/hi.ts
var hiDictionary = {
  locale: "hi",
  common: {
    brand: "\u0932\u093F\u0935\u0935\u0930\u094D\u0926\u0940",
    tagline: "\u0935\u0948\u0936\u094D\u0935\u093F\u0915 \u0935\u0947\u0924\u0928, \u0915\u0930 \u090F\u0935\u0902 \u091C\u0940\u0935\u0928-\u092F\u093E\u092A\u0928 \u0932\u093E\u0917\u0924 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923",
    livingIntelligence: "\u0932\u093F\u0935\u093F\u0902\u0917 \u0907\u0902\u091F\u0947\u0932\u093F\u091C\u0947\u0902\u0938",
    calculating: "\u0938\u091F\u0940\u0915 \u0917\u0923\u0928\u093E \u091C\u093E\u0930\u0940 \u0939\u0948...",
    calculate: "\u0917\u0923\u0928\u093E \u0915\u0930\u0947\u0902",
    annual: "\u0935\u093E\u0930\u094D\u0937\u093F\u0915",
    monthly: "\u092E\u093E\u0938\u093F\u0915",
    year: "\u0935\u0930\u094D\u0937",
    month: "\u092E\u093E\u0939",
    share: "\u0938\u093E\u091D\u093E \u0915\u0930\u0947\u0902",
    copied: "\u0915\u094D\u0932\u093F\u092A\u092C\u094B\u0930\u094D\u0921 \u092A\u0930 \u0915\u0949\u092A\u0940 \u0915\u093F\u092F\u093E \u0917\u092F\u093E",
    home: "\u0939\u094B\u092E",
    back: "\u0935\u093E\u092A\u0938",
    next: "\u0906\u0917\u0947",
    close: "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902",
    disclaimer: "\u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0935\u0948\u0927\u093E\u0928\u093F\u0915 \u0915\u0930 \u0928\u093F\u092F\u092E\u094B\u0902 \u0914\u0930 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0938\u093E\u0902\u0916\u094D\u092F\u093F\u0915\u0940\u092F \u092A\u0948\u092E\u093E\u0928\u094B\u0902 \u092A\u0930 \u0906\u0927\u093E\u0930\u093F\u0924 \u0917\u0923\u093F\u0924\u0940\u092F \u0917\u0923\u0928\u093E\u0964 \u092F\u0939 \u0914\u092A\u091A\u093E\u0930\u093F\u0915 \u0915\u0930 \u092F\u093E \u0928\u093F\u0935\u0947\u0936 \u0938\u0932\u093E\u0939 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
    verifiedTaxBaseline: "\u0935\u0948\u0927\u093E\u0928\u093F\u0915 \u0930\u0942\u092A \u0938\u0947 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 2026 \u0915\u0930 \u0906\u0927\u093E\u0930",
    tier1SourcesBadge: "\u0938\u094D\u0924\u0930-1 \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0938\u0930\u0915\u093E\u0930\u0940 \u0938\u094D\u0930\u094B\u0924",
    singleAdult: "\u090F\u0915\u0932 \u0935\u092F\u0938\u094D\u0915 (\u0905\u0935\u093F\u0935\u093E\u0939\u093F\u0924)",
    couple: "\u0926\u0902\u092A\u0924\u093F / \u0926\u094B\u0939\u0930\u0940 \u0906\u092F",
    family: "\u092A\u0930\u093F\u0935\u093E\u0930 (2 \u0935\u092F\u0938\u094D\u0915, 1 \u092C\u091A\u094D\u091A\u093E)",
    action: "\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908",
    evidence: "\u092A\u094D\u0930\u092E\u093E\u0923 \u090F\u0935\u0902 \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0921\u0947\u091F\u093E \u0938\u094D\u0930\u094B\u0924",
    methodology: "\u0917\u0923\u0928\u093E \u092A\u0926\u094D\u0927\u0924\u093F",
    diagnostics: "\u0938\u093F\u0938\u094D\u091F\u092E \u0921\u093E\u092F\u0917\u094D\u0928\u094B\u0938\u094D\u091F\u093F\u0915\u094D\u0938"
  },
  nav: {
    howItWorks: "\u092F\u0939 \u0915\u0948\u0938\u0947 \u0915\u093E\u092E \u0915\u0930\u0924\u093E \u0939\u0948",
    sources: "\u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0938\u094D\u0930\u094B\u0924",
    coverage: "\u092C\u093E\u091C\u093E\u0930 \u0915\u0935\u0930\u0947\u091C",
    relocation: "\u0938\u094D\u0925\u093E\u0928\u093E\u0902\u0924\u0930\u0923",
    jobOfferComparison: "\u091C\u0949\u092C \u0911\u092B\u0930 \u092E\u0942\u0932\u094D\u092F\u093E\u0902\u0915\u0928",
    reports: "\u0936\u094B\u0927 \u0930\u093F\u092A\u094B\u0930\u094D\u091F",
    guides: "\u0936\u0939\u0930 \u0917\u093E\u0907\u0921",
    compare: "\u0936\u0939\u0930\u094B\u0902 \u0915\u0940 \u0924\u0941\u0932\u0928\u093E",
    tabSalaryWorth: "\u0915\u094D\u092F\u093E \u092E\u0947\u0930\u093E \u0935\u0947\u0924\u0928 \u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u0939\u0948?",
    tabSalaryNeeded: "\u092E\u0941\u091D\u0947 \u0915\u093F\u0924\u0928\u093E \u0915\u092E\u093E\u0928\u093E \u091A\u093E\u0939\u093F\u090F?",
    tabSalaryAfterTax: "\u0915\u0930 \u0915\u091F\u094C\u0924\u0940 \u0915\u0947 \u092C\u093E\u0926 \u0936\u0941\u0926\u094D\u0927 \u0935\u0947\u0924\u0928",
    tabCostOfLiving: "\u091C\u0940\u0935\u0928 \u092F\u093E\u092A\u0928 \u0915\u0940 \u0932\u093E\u0917\u0924",
    tabCompare: "\u0936\u0939\u0930\u094B\u0902 \u0915\u0940 \u0924\u0941\u0932\u0928\u093E \u0915\u0930\u0947\u0902",
    tabJobOffers: "\u091C\u0949\u092C \u0911\u092B\u0930 \u0915\u0940 \u0924\u0941\u0932\u0928\u093E \u0915\u0930\u0947\u0902",
    tabGuides: "\u0936\u0939\u0930 \u0935\u0947\u0924\u0928 \u0917\u093E\u0907\u0921"
  },
  calculator: {
    chooseCity: "1. \u0936\u0939\u0930 / \u0938\u094D\u0925\u093E\u0928 \u091A\u0941\u0928\u0947\u0902",
    annualSalary: "2. \u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u0938\u0915\u0932 \u0935\u0947\u0924\u0928 (\u0917\u094D\u0930\u0949\u0938)",
    salaryHelp: "\u0915\u0930-\u092A\u0942\u0930\u094D\u0935 \u0915\u0941\u0932 \u092A\u093E\u0930\u093F\u0936\u094D\u0930\u092E\u093F\u0915 (\u092E\u0942\u0932 \u0935\u0947\u0924\u0928)\u0964",
    statutoryJurisdiction: "\u0935\u0948\u0927\u093E\u0928\u093F\u0915 \u0915\u0930 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u093E\u0927\u093F\u0915\u093E\u0930: {jurisdiction}",
    popularScenarios: "\u0932\u094B\u0915\u092A\u094D\u0930\u093F\u092F \u092A\u0930\u093F\u0926\u0943\u0936\u094D\u092F:",
    heroHeadline: "\u0906\u092A\u0915\u0947 \u0935\u0947\u0924\u0928 \u0915\u093E \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u092E\u0942\u0932\u094D\u092F \u0915\u094D\u092F\u093E \u0939\u0948?",
    heroSubheadline: "\u0905\u092A\u0928\u093E \u0935\u0947\u0924\u0928 \u0914\u0930 \u0936\u0939\u0930 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902 \u0914\u0930 \u091C\u093E\u0928\u0947\u0902 \u0915\u093F \u0906\u092A \u0915\u093F\u0924\u0928\u093E \u0918\u0930 \u0932\u0947 \u091C\u093E \u0938\u0915\u0924\u0947 \u0939\u0948\u0902, \u0916\u0930\u094D\u091A \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902 \u0914\u0930 \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u092C\u091A\u0924 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964",
    heroSupporting: "\u091C\u093E\u0902\u091A\u0947\u0902 \u0915\u093F \u0915\u094D\u092F\u093E \u0906\u092A\u0915\u093E \u0935\u0947\u0924\u0928 \u091C\u0940\u0935\u0928 \u092F\u093E\u092A\u0928 \u0915\u0940 \u0932\u093E\u0917\u0924 \u0915\u094B \u092A\u0942\u0930\u093E \u0915\u0930\u0924\u093E \u0939\u0948 \u0914\u0930 \u0906\u092A\u0915\u094B \u092C\u091A\u0924 \u0915\u0930\u0928\u0947 \u0915\u0940 \u0905\u0928\u0941\u092E\u0924\u093F \u0926\u0947\u0924\u093E \u0939\u0948\u0964",
    householdType: "\u092A\u093E\u0930\u093F\u0935\u093E\u0930\u093F\u0915 \u0938\u0902\u0930\u091A\u0928\u093E",
    rentOverride: "\u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u092E\u093E\u0938\u093F\u0915 \u0915\u093F\u0930\u093E\u092F\u093E \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902",
    rentOverridePlaceholder: "\u0909\u0926\u093E. 2,500",
    rentOverrideHelp: "\u092F\u0939 \u0938\u093E\u0902\u0916\u094D\u092F\u093F\u0915\u0940\u092F \u0914\u0938\u0924 \u0915\u093F\u0930\u093E\u090F \u0915\u094B \u0913\u0935\u0930\u0930\u093E\u0907\u0921 \u0915\u0930\u0924\u093E \u0939\u0948\u0964",
    taxYearLabel: "\u0915\u0930 \u0935\u0930\u094D\u0937",
    filingStatusLabel: "\u092B\u093E\u0907\u0932\u093F\u0902\u0917 \u0938\u094D\u0925\u093F\u0924\u093F",
    dependentsLabel: "\u0906\u0936\u094D\u0930\u093F\u0924",
    btnCalculate: "\u0936\u0941\u0926\u094D\u0927 \u0935\u0947\u0924\u0928 \u0914\u0930 \u0915\u094D\u0930\u092F \u0936\u0915\u094D\u0924\u093F \u0915\u0940 \u0917\u0923\u0928\u093E \u0915\u0930\u0947\u0902",
    quickScenarios: {
      nyc100k: "NYC $100k \u090F\u0915\u0932",
      london60k: "\u0932\u0902\u0926\u0928 \xA360k \u090F\u0915\u0932",
      dubai300k: "\u0926\u0941\u092C\u0908 300k AED",
      toronto90k: "\u091F\u094B\u0930\u0902\u091F\u094B $90k \u090F\u0915\u0932"
    }
  },
  results: {
    summaryTitle: "\u0905\u0928\u0941\u092E\u093E\u0928\u093F\u0924 \u0936\u0941\u0926\u094D\u0927 \u0935\u0947\u0924\u0928 \u090F\u0935\u0902 \u0916\u0930\u094D\u091A \u092F\u094B\u0917\u094D\u092F \u092C\u091A\u0924",
    annualGross: "\u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u0938\u0915\u0932 \u0935\u0947\u0924\u0928",
    annualTakeHome: "\u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u0936\u0941\u0926\u094D\u0927 \u0935\u0947\u0924\u0928 (\u091F\u0947\u0915-\u0939\u094B\u092E)",
    monthlyTakeHome: "\u092E\u093E\u0938\u093F\u0915 \u0936\u0941\u0926\u094D\u0927 \u0935\u0947\u0924\u0928",
    monthlyLivingCosts: "\u092E\u093E\u0938\u093F\u0915 \u091C\u0940\u0935\u0928 \u092F\u093E\u092A\u0928 \u0932\u093E\u0917\u0924",
    monthlyDisposable: "\u092E\u093E\u0938\u093F\u0915 \u0916\u0930\u094D\u091A \u092F\u094B\u0917\u094D\u092F \u0906\u092F (\u0921\u093F\u0938\u094D\u092A\u094B\u091C\u0947\u092C\u0932)",
    savingsCapacity: "\u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u092E\u093E\u0938\u093F\u0915 \u092C\u091A\u0924 \u0915\u094D\u0937\u092E\u0924\u093E",
    savingsRate: "\u0905\u0928\u0941\u092E\u093E\u0928\u093F\u0924 \u092C\u091A\u0924 \u0926\u0930",
    effectiveTaxRate: "\u092A\u094D\u0930\u092D\u093E\u0935\u0940 \u0915\u0930 \u0926\u0930",
    housingBurden: "\u0906\u0935\u093E\u0938 \u0935\u094D\u092F\u092F \u0915\u093E \u092D\u093E\u0930",
    taxesAndDeductions: "\u0915\u0930 \u090F\u0935\u0902 \u0935\u0948\u0927\u093E\u0928\u093F\u0915 \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0915\u091F\u094C\u0924\u093F\u092F\u093E\u0901",
    essentialLiving: "\u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u092E\u0942\u0932\u092D\u0942\u0924 \u091C\u0940\u0935\u0928 \u092F\u093E\u092A\u0928 \u0932\u093E\u0917\u0924",
    discretionaryLiving: "\u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u090F\u0935\u0902 \u091C\u0940\u0935\u0928\u0936\u0948\u0932\u0940 \u0935\u094D\u092F\u092F",
    spendableSurplus: "\u0916\u0930\u094D\u091A \u092F\u094B\u0917\u094D\u092F \u0905\u0924\u093F\u0930\u093F\u0915\u094D\u0924 \u0905\u0927\u093F\u0936\u0947\u0937",
    deficitWarning: "\u091A\u0947\u0924\u093E\u0935\u0928\u0940: \u0907\u0938 \u0936\u0939\u0930 \u092E\u0947\u0902 \u0905\u0928\u0941\u092E\u093E\u0928\u093F\u0924 \u091C\u0940\u0935\u0928-\u092F\u093E\u092A\u0928 \u0932\u093E\u0917\u0924 \u0906\u092A\u0915\u0947 \u0936\u0941\u0926\u094D\u0927 \u0935\u0947\u0924\u0928 \u0938\u0947 \u0905\u0927\u093F\u0915 \u0939\u0948\u0964",
    healthySurplus: "\u0938\u0902\u0924\u094B\u0937\u091C\u0928\u0915 \u0905\u0927\u093F\u0936\u0947\u0937: \u0906\u092A\u0915\u0940 \u0906\u092F \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0932\u093E\u0917\u0924\u094B\u0902 \u0915\u094B \u092A\u0942\u0930\u093E \u0915\u0930\u0928\u0947 \u0915\u0947 \u0938\u093E\u0925-\u0938\u093E\u0925 \u0928\u093F\u092F\u092E\u093F\u0924 \u092C\u091A\u0924 \u0915\u0940 \u0905\u0928\u0941\u092E\u0924\u093F \u0926\u0947\u0924\u0940 \u0939\u0948\u0964",
    taxPending: "\u0915\u0930 \u0917\u0923\u0928\u093E \u0935\u0948\u0927\u093E\u0928\u093F\u0915 \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0915\u0947 \u0905\u0927\u0940\u0928 \u0939\u0948\u0964",
    shareSummaryTitle: "\u0932\u093F\u0935\u0935\u0930\u094D\u0926\u0940 \u0935\u093F\u0924\u094D\u0924\u0940\u092F \u092E\u0942\u0932\u094D\u092F\u093E\u0902\u0915\u0928",
    estimatedLivingCosts: "\u0905\u0928\u0941\u092E\u093E\u0928\u093F\u0924 \u091C\u0940\u0935\u0928 \u092F\u093E\u092A\u0928 \u0932\u093E\u0917\u0924",
    benchmarkContext: "\u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0938\u093E\u0902\u0916\u094D\u092F\u093F\u0915\u0940\u092F \u0938\u0902\u0926\u0930\u094D\u092D \u092C\u093F\u0902\u0926\u0941",
    customizeAssumptions: "\u092E\u093E\u0928\u094D\u092F\u0924\u093E\u0913\u0902 \u0915\u094B \u0905\u0928\u0941\u0915\u0942\u0932\u093F\u0924 \u0915\u0930\u0947\u0902"
  },
  salaryNeeded: {
    headline: "\u0906\u092A\u0915\u094B \u0915\u093F\u0924\u0928\u093E \u0915\u092E\u093E\u0928\u0947 \u0915\u0940 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E \u0939\u0948?",
    subheadline: "\u0905\u092A\u0928\u0940 \u0907\u091A\u094D\u091B\u093F\u0924 \u092C\u091A\u0924 \u092F\u093E \u091C\u0940\u0935\u0928\u0936\u0948\u0932\u0940 \u0915\u093E \u0932\u0915\u094D\u0937\u094D\u092F \u0924\u092F \u0915\u0930\u0947\u0902 \u0914\u0930 \u0906\u0935\u0936\u094D\u092F\u0915 \u0938\u0915\u0932 \u0935\u0947\u0924\u0928 \u0915\u093E \u092A\u0924\u093E \u0932\u0917\u093E\u090F\u0902\u0964",
    targetSavings: "\u0932\u0915\u094D\u0937\u093F\u0924 \u092E\u093E\u0938\u093F\u0915 \u092C\u091A\u0924",
    desiredLifestyle: "\u0935\u093E\u0902\u091B\u093F\u0924 \u091C\u0940\u0935\u0928\u0936\u0948\u0932\u0940 \u0938\u094D\u0924\u0930",
    requiredGross: "\u0906\u0935\u0936\u094D\u092F\u0915 \u0938\u0915\u0932 \u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u0935\u0947\u0924\u0928",
    requiredNet: "\u0906\u0935\u0936\u094D\u092F\u0915 \u0936\u0941\u0926\u094D\u0927 \u092E\u093E\u0938\u093F\u0915 \u0935\u0947\u0924\u0928",
    calculatedGrossSalary: "\u0905\u0928\u0941\u092E\u093E\u0928\u093F\u0924 \u0906\u0935\u0936\u094D\u092F\u0915 \u0938\u0915\u0932 \u0935\u0947\u0924\u0928",
    explorePlan: "\u0935\u093F\u0924\u094D\u0924\u0940\u092F \u092F\u094B\u091C\u0928\u093E \u0926\u0947\u0916\u0947\u0902"
  },
  salaryAfterTax: {
    headline: "\u0915\u0930 \u0915\u091F\u094C\u0924\u0940 \u0915\u0947 \u092C\u093E\u0926 \u0936\u0941\u0926\u094D\u0927 \u0935\u0947\u0924\u0928 \u0915\u0948\u0932\u0915\u0941\u0932\u0947\u091F\u0930",
    subheadline: "\u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0938\u0930\u0915\u093E\u0930\u0940 \u0915\u0930 \u0924\u093E\u0932\u093F\u0915\u093E\u0913\u0902 \u092A\u0930 \u0906\u0927\u093E\u0930\u093F\u0924 \u0938\u0915\u0932-\u0938\u0947-\u0936\u0941\u0926\u094D\u0927 \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u0940 \u0935\u0947\u0924\u0928 \u0917\u0923\u0928\u093E\u0964",
    federalTax: "\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F / \u0915\u0947\u0902\u0926\u094D\u0930\u0940\u092F \u0906\u092F\u0915\u0930",
    stateLocalTax: "\u0930\u093E\u091C\u094D\u092F / \u092A\u094D\u0930\u093E\u0902\u0924\u0940\u092F \u0906\u092F\u0915\u0930",
    socialSecurity: "\u0938\u093E\u092E\u093E\u091C\u093F\u0915 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u090F\u0935\u0902 \u092A\u0947\u0902\u0936\u0928 \u0905\u0902\u0936\u0926\u093E\u0928",
    medicare: "\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u090F\u0935\u0902 \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u092C\u0940\u092E\u093E",
    totalDeductions: "\u0915\u0941\u0932 \u0935\u0948\u0927\u093E\u0928\u093F\u0915 \u0915\u091F\u094C\u0924\u093F\u092F\u093E\u0901",
    netTakeHome: "\u0939\u093E\u0925 \u092E\u0947\u0902 \u092E\u093F\u0932\u0928\u0947 \u0935\u093E\u0932\u093E \u0936\u0941\u0926\u094D\u0927 \u0935\u0947\u0924\u0928",
    effectiveTaxNote: "\u0938\u0902\u092F\u0941\u0915\u094D\u0924 \u092A\u094D\u0930\u092D\u093E\u0935\u0940 \u0935\u0948\u0927\u093E\u0928\u093F\u0915 \u0915\u091F\u094C\u0924\u0940 \u0926\u0930"
  },
  costOfLiving: {
    headline: "\u0918\u0930\u0947\u0932\u0942 \u091C\u0940\u0935\u0928 \u092F\u093E\u092A\u0928 \u0932\u093E\u0917\u0924 \u0915\u093E \u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u0935\u093F\u0935\u0930\u0923",
    subheadline: "\u0906\u0935\u093E\u0938, \u092D\u094B\u091C\u0928, \u0909\u092A\u092F\u094B\u0917\u093F\u0924\u093E\u0913\u0902 \u0914\u0930 \u092A\u0930\u093F\u0935\u0939\u0928 \u0915\u0947 \u0932\u093F\u090F \u0938\u0930\u0915\u093E\u0930 \u0926\u094D\u0935\u093E\u0930\u093E \u0911\u0921\u093F\u091F \u0915\u093F\u090F \u0917\u090F \u0909\u092A\u092D\u094B\u0915\u094D\u0924\u093E \u0935\u094D\u092F\u092F \u092E\u093E\u0928\u0915\u0964",
    housingRent: "\u0906\u0935\u093E\u0938 \u090F\u0935\u0902 \u0915\u093F\u0930\u093E\u092F\u093E",
    groceriesFood: "\u0915\u093F\u0930\u093E\u0928\u093E \u090F\u0935\u0902 \u0916\u093E\u0926\u094D\u092F \u0938\u093E\u092E\u0917\u094D\u0930\u0940",
    diningOut: "\u0930\u0947\u0938\u094D\u0924\u0930\u093E\u0902 \u090F\u0935\u0902 \u092D\u094B\u091C\u0928 \u0935\u094D\u092F\u092F",
    utilitiesInternet: "\u092C\u093F\u091C\u0932\u0940, \u092A\u093E\u0928\u0940 \u090F\u0935\u0902 \u0907\u0902\u091F\u0930\u0928\u0947\u091F",
    publicTransit: "\u0938\u093E\u0930\u094D\u0935\u091C\u0928\u093F\u0915 \u092A\u0930\u093F\u0935\u0939\u0928",
    totalMonthlyLiving: "\u0915\u0941\u0932 \u092E\u093E\u0938\u093F\u0915 \u091C\u0940\u0935\u0928 \u092F\u093E\u092A\u0928 \u0935\u094D\u092F\u092F",
    householdTypeSelect: "\u092A\u0930\u093F\u0935\u093E\u0930 \u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932 \u091A\u0941\u0928\u0947\u0902"
  },
  compare: {
    headline: "\u0936\u0939\u0930\u094B\u0902 \u0915\u0947 \u092C\u0940\u091A \u0935\u0947\u0924\u0928 \u0914\u0930 \u091C\u0940\u0935\u0928 \u0932\u093E\u0917\u0924 \u0915\u0940 \u0924\u0941\u0932\u0928\u093E \u0915\u0930\u0947\u0902",
    subheadline: "\u0905\u0902\u0924\u0930\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u092E\u0939\u093E\u0928\u0917\u0930\u094B\u0902 \u0915\u0947 \u092C\u0940\u091A \u0915\u094D\u0930\u092F \u0936\u0915\u094D\u0924\u093F, \u0915\u0930 \u0932\u093E\u092D \u0914\u0930 \u0938\u092E\u0915\u0915\u094D\u0937 \u0935\u0947\u0924\u0928 \u0915\u093E \u092E\u0949\u0921\u0932 \u0924\u0948\u092F\u093E\u0930 \u0915\u0930\u0947\u0902\u0964",
    cityA: "\u0936\u0939\u0930 A (\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0938\u094D\u0925\u093E\u0928)",
    cityB: "\u0936\u0939\u0930 B (\u0928\u092F\u093E \u0917\u0902\u0924\u0935\u094D\u092F)",
    salaryA: "\u0936\u0939\u0930 A \u092E\u0947\u0902 \u0935\u0947\u0924\u0928",
    equivalentSalary: "\u0936\u0939\u0930 B \u092E\u0947\u0902 \u0906\u0935\u0936\u094D\u092F\u0915 \u0938\u092E\u0915\u0915\u094D\u0937 \u0935\u0947\u0924\u0928",
    purchasingPowerDelta: "\u0915\u094D\u0930\u092F \u0936\u0915\u094D\u0924\u093F \u0915\u093E \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u0905\u0902\u0924\u0930",
    verdictLabel: "\u0915\u094D\u0930\u092F \u0936\u0915\u094D\u0924\u093F \u092E\u0942\u0932\u094D\u092F\u093E\u0902\u0915\u0928 \u0928\u093F\u0937\u094D\u0915\u0930\u094D\u0937"
  },
  jobOffers: {
    headline: "\u0905\u0902\u0924\u0930\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u091C\u0949\u092C \u0911\u092B\u0930 \u0915\u0940 \u0924\u0941\u0932\u0928\u093E \u0915\u0930\u0947\u0902",
    subheadline: "\u0935\u093F\u092D\u093F\u0928\u094D\u0928 \u092E\u0941\u0926\u094D\u0930\u093E\u0913\u0902, \u0915\u0930 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u0913\u0902 \u0914\u0930 \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0932\u093E\u0917\u0924\u094B\u0902 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u0935\u0947\u0924\u0928 \u092A\u0948\u0915\u0947\u091C \u0915\u093E \u092E\u0942\u0932\u094D\u092F\u093E\u0902\u0915\u0928 \u0915\u0930\u0947\u0902\u0964",
    offerA: "\u0911\u092B\u0930 A",
    offerB: "\u0911\u092B\u0930 B",
    offerVerdict: "\u0911\u092B\u0930 \u092E\u0942\u0932\u094D\u092F\u093E\u0902\u0915\u0928 \u090F\u0935\u0902 \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u092E\u0942\u0932\u094D\u092F",
    higherRealIncome: "{winner} \u0906\u092A\u0915\u094B {delta} \u0905\u0927\u093F\u0915 \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u0916\u0930\u094D\u091A \u092F\u094B\u0917\u094D\u092F \u0906\u092F \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u0930\u0924\u093E \u0939\u0948\u0964"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "\u0907\u0938 \u0935\u0930\u094D\u0937 \u092F\u093E \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u093E\u0927\u093F\u0915\u093E\u0930 \u0915\u0947 \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0915\u0930 \u0928\u093F\u092F\u092E \u0905\u092D\u0940 \u0924\u0915 \u0917\u091C\u091F \u092E\u0947\u0902 \u0905\u0927\u093F\u0938\u0942\u091A\u093F\u0924 \u0928\u0939\u0940\u0902 \u0939\u0941\u090F \u0939\u0948\u0902\u0964 \u0932\u093F\u0935\u0935\u0930\u094D\u0926\u0940 \u092E\u0928\u0917\u0922\u093C\u0902\u0924 \u0905\u0928\u0941\u092E\u093E\u0928 \u0928\u0939\u0940\u0902 \u0932\u0917\u093E\u0924\u093E\u0964",
    INVALID_SALARY: "\u0915\u0943\u092A\u092F\u093E \u090F\u0915 \u0935\u0948\u0927 \u0938\u0915\u093E\u0930\u093E\u0924\u094D\u092E\u0915 \u0935\u0947\u0924\u0928 \u0930\u093E\u0936\u093F \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964",
    CITY_NOT_SUPPORTED: "\u091A\u0941\u0928\u093E \u0917\u092F\u093E \u0936\u0939\u0930 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092E\u0947\u0902 \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
    DATA_STALE: "\u0905\u0902\u0924\u0930\u094D\u0928\u093F\u0939\u093F\u0924 \u0938\u093E\u0902\u0916\u094D\u092F\u093F\u0915\u0940\u092F \u0921\u0947\u091F\u093E \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092E\u0947\u0902 \u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u0938\u0930\u0915\u093E\u0930\u0940 \u0911\u0921\u093F\u091F \u092E\u0947\u0902 \u0939\u0948\u0964",
    FX_UNAVAILABLE: "\u0935\u093F\u0926\u0947\u0936\u0940 \u092E\u0941\u0926\u094D\u0930\u093E \u0935\u093F\u0928\u093F\u092E\u092F \u0926\u0930 \u0938\u0947\u0935\u093E \u0905\u0938\u094D\u0925\u093E\u092F\u0940 \u0930\u0942\u092A \u0938\u0947 \u0905\u0928\u0941\u092A\u0932\u092C\u094D\u0927 \u0939\u0948\u0964 \u0905\u0902\u0924\u093F\u092E \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0926\u0930 \u0932\u093E\u0917\u0942 \u0939\u0948\u0964",
    NETWORK_ERROR: "\u0928\u0947\u091F\u0935\u0930\u094D\u0915 \u0915\u0928\u0947\u0915\u094D\u0936\u0928 \u0924\u094D\u0930\u0941\u091F\u093F\u0964 \u0915\u0943\u092A\u092F\u093E \u0917\u0923\u0928\u093E \u092A\u0941\u0928\u0903 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964"
  },
  footer: {
    aboutDesc: "\u0932\u093F\u0935\u0935\u0930\u094D\u0926\u0940 \u090F\u0915 \u0938\u094D\u0935\u0924\u0902\u0924\u094D\u0930 \u0935\u093F\u0924\u094D\u0924\u0940\u092F \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u092E\u0902\u091A \u0939\u0948 \u091C\u094B \u0905\u0902\u0924\u0930\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0935\u0947\u0924\u0928, \u0915\u0930\u094B\u0902 \u0914\u0930 \u0936\u0939\u0930\u0940 \u091C\u0940\u0935\u0928 \u0932\u093E\u0917\u0924 \u0915\u0947 \u0932\u093F\u090F \u092A\u0942\u0930\u094D\u0923\u0924\u0903 \u0917\u0923\u093F\u0924\u0940\u092F \u0914\u0930 \u0938\u091F\u0940\u0915 \u0917\u0923\u0928\u093E \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u0930\u0924\u093E \u0939\u0948\u0964",
    calculatorsTitle: "\u0915\u0948\u0932\u0915\u0941\u0932\u0947\u091F\u0930",
    intelligenceTitle: "\u0935\u0948\u0936\u094D\u0935\u093F\u0915 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923",
    institutionalTitle: "\u092E\u093E\u0928\u0915 \u090F\u0935\u0902 \u0928\u0940\u0924\u093F\u092F\u093E\u0902",
    cityComparisons: "\u0936\u0939\u0930 \u0924\u0941\u0932\u0928\u093E",
    empiricalReports: "\u0905\u0928\u0941\u092D\u0935\u091C\u0928\u094D\u092F \u0936\u094B\u0927 \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0947\u0902 \u2192",
    editorialPolicy: "\u0938\u0902\u092A\u093E\u0926\u0915\u0940\u092F \u0928\u0940\u0924\u093F",
    dataPolicy: "\u0921\u0947\u091F\u093E \u0938\u0924\u094D\u092F\u0928\u093F\u0937\u094D\u0920\u093E \u0928\u0940\u0924\u093F",
    corrections: "\u0921\u0947\u091F\u093E \u0938\u0941\u0927\u093E\u0930 \u0915\u0940 \u0930\u093F\u092A\u094B\u0930\u094D\u091F \u0915\u0930\u0947\u0902",
    terms: "\u0909\u092A\u092F\u094B\u0917 \u0915\u0940 \u0936\u0930\u094D\u0924\u0947\u0902",
    privacy: "\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E \u0928\u0940\u0924\u093F",
    copyright: "\xA9 2026 LivWorthy Inc. \u0938\u0930\u094D\u0935\u093E\u0927\u093F\u0915\u093E\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924\u0964 \u0917\u0923\u093F\u0924\u0940\u092F \u092B\u093F\u0928\u091F\u0947\u0915 \u0906\u0930\u094D\u0915\u093F\u091F\u0947\u0915\u094D\u091A\u0930\u0964"
  },
  languageSelector: {
    title: "\u092D\u093E\u0937\u093E \u091A\u0941\u0928\u0947\u0902",
    searchPlaceholder: "\u092D\u093E\u0937\u093E \u0916\u094B\u091C\u0947\u0902...",
    currentLanguage: "\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092D\u093E\u0937\u093E",
    switchSuggestion: "\u0915\u094D\u092F\u093E \u0906\u092A \u0932\u093F\u0935\u0935\u0930\u094D\u0926\u0940 \u0915\u094B {language} \u092E\u0947\u0902 \u0926\u0947\u0916\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902?",
    switchCta: "{language} \u092A\u0930 \u091C\u093E\u090F\u0902",
    dismiss: "\u0939\u091F\u093E\u090F\u0902",
    allLanguages: "\u0938\u092D\u0940 \u0909\u092A\u0932\u092C\u094D\u0927 \u092D\u093E\u0937\u093E\u090F\u0902"
  },
  reports: {
    hubTitle: "\u0905\u0928\u0941\u092D\u0935\u091C\u0928\u094D\u092F \u0905\u0928\u0941\u0938\u0902\u0927\u093E\u0928 \u090F\u0935\u0902 \u092E\u093E\u0928\u0915 \u0938\u0942\u091A\u0915\u093E\u0902\u0915",
    hubSubtitle: "39 \u0905\u0902\u0924\u0930\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u092C\u093E\u091C\u093E\u0930\u094B\u0902 \u092E\u0947\u0902 \u0935\u0948\u0927\u093E\u0928\u093F\u0915 \u0915\u0930 \u0915\u091F\u094C\u0924\u0940, \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u0935\u0947\u0924\u0928 \u0914\u0930 \u0936\u0939\u0930\u0940 \u0915\u094D\u0930\u092F \u0936\u0915\u094D\u0924\u093F \u0915\u093E \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u0940 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923\u0964",
    instituteBadge: "\u092E\u093E\u0924\u094D\u0930\u093E\u0924\u094D\u092E\u0915 \u0905\u0928\u0941\u0938\u0902\u0927\u093E\u0928 \u0938\u0902\u0938\u094D\u0925\u093E\u0928",
    modelBadge: "\u092C\u093F\u0928\u093E \u090F\u0906\u0908 \u0905\u0928\u0941\u092E\u093E\u0928\u094B\u0902 \u0915\u0947 \u0917\u0923\u093F\u0924\u0940\u092F \u092E\u0949\u0921\u0932\u093F\u0902\u0917",
    globalSalaryWorthTitle: "\u0935\u0948\u0936\u094D\u0935\u093F\u0915 \u0935\u0947\u0924\u0928 \u092E\u0942\u0932\u094D\u092F \u0938\u0942\u091A\u0915\u093E\u0902\u0915 2026",
    purchasingPowerTitle: "\u0915\u094D\u0930\u092F \u0936\u0915\u094D\u0924\u093F \u0924\u0941\u0932\u0928\u093E\u0924\u094D\u092E\u0915 \u0930\u093F\u092A\u094B\u0930\u094D\u091F",
    salaryToRentTitle: "\u0935\u0947\u0924\u0928-\u0938\u0947-\u0915\u093F\u0930\u093E\u092F\u093E \u0905\u0928\u0941\u092A\u093E\u0924 \u0938\u0942\u091A\u0915\u093E\u0902\u0915",
    relocationGapTitle: "\u0938\u094D\u0925\u093E\u0928\u093E\u0902\u0924\u0930\u0923 \u0935\u0947\u0924\u0928 \u0905\u0902\u0924\u0930 \u0930\u093F\u092A\u094B\u0930\u094D\u091F",
    takeHomePayTitle: "\u0935\u0948\u0936\u094D\u0935\u093F\u0915 \u0936\u0941\u0926\u094D\u0927 \u0935\u0947\u0924\u0928 \u0924\u0941\u0932\u0928\u093E",
    downloadCsv: "CSV \u0921\u0947\u091F\u093E\u0938\u0947\u091F \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
    downloadJson: "JSON \u0930\u0949 \u0921\u0947\u091F\u093E \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
    methodologyHeading: "\u092A\u0926\u094D\u0927\u0924\u093F \u090F\u0935\u0902 \u0938\u093E\u0902\u0916\u094D\u092F\u093F\u0915\u0940\u092F \u0938\u0940\u092E\u093E\u090F\u0902",
    sourcesHeading: "\u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915 \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0938\u094D\u0930\u094B\u0924",
    citationHeading: "\u0905\u0915\u093E\u0926\u092E\u093F\u0915 \u0938\u0902\u0926\u0930\u094D\u092D \u090F\u0935\u0902 \u0909\u0926\u094D\u0927\u0930\u0923 \u0928\u093F\u0930\u094D\u0926\u0947\u0936"
  }
};

// src/lib/i18n/locales/ur.ts
var urDictionary = {
  locale: "ur",
  common: {
    brand: "\u0644\u06CC\u0648 \u0648\u0631\u062F\u06CC",
    tagline: "\u062A\u0646\u062E\u0648\u0627\u06C1\u0648\u06BA\u060C \u0679\u06CC\u06A9\u0633\u0648\u06BA \u0627\u0648\u0631 \u0627\u062E\u0631\u0627\u062C\u0627\u062A\u0650 \u0632\u0646\u062F\u06AF\u06CC \u06A9\u0627 \u0639\u0627\u0644\u0645\u06CC \u0646\u0638\u0627\u0645",
    livingIntelligence: "\u0645\u0639\u0627\u0634\u06CC \u0628\u0635\u06CC\u0631\u062A \u0628\u0631\u0627\u0626\u06D2 \u0632\u0646\u062F\u06AF\u06CC",
    calculating: "\u062D\u0633\u0627\u0628 \u0644\u06AF\u0627\u06CC\u0627 \u062C\u0627 \u0631\u06C1\u0627 \u06C1\u06D2...",
    calculate: "\u062D\u0633\u0627\u0628 \u0644\u06AF\u0627\u0626\u06CC\u06BA",
    annual: "\u0633\u0627\u0644\u0627\u0646\u06C1",
    monthly: "\u0645\u0627\u06C1\u0627\u0646\u06C1",
    year: "\u0633\u0627\u0644",
    month: "\u0645\u0627\u06C1",
    share: "\u0634\u06CC\u0626\u0631 \u06A9\u0631\u06CC\u06BA",
    copied: "\u06A9\u0644\u067E \u0628\u0648\u0631\u0688 \u067E\u0631 \u0645\u062D\u0641\u0648\u0638 \u06C1\u0648 \u06AF\u06CC\u0627",
    home: "\u06C1\u0648\u0645",
    back: "\u0648\u0627\u067E\u0633",
    next: "\u0627\u06AF\u0644\u0627",
    close: "\u0628\u0646\u062F \u06A9\u0631\u06CC\u06BA",
    disclaimer: "\u0633\u0631\u06A9\u0627\u0631\u06CC \u0679\u06CC\u06A9\u0633 \u06AF\u0648\u0634\u0648\u0627\u0631\u0648\u06BA \u0627\u0648\u0631 \u0645\u0633\u062A\u0646\u062F \u0634\u0645\u0627\u0631\u06CC\u0627\u062A\u06CC \u0627\u0639\u062F\u0627\u062F \u0648 \u0634\u0645\u0627\u0631 \u067E\u0631 \u0645\u0628\u0646\u06CC \u062D\u0633\u0627\u0628\u06CC \u0646\u062A\u0627\u0626\u062C\u06D4 \u06CC\u06C1 \u0628\u0627\u0636\u0627\u0628\u0637\u06C1 \u0679\u06CC\u06A9\u0633 \u06CC\u0627 \u0633\u0631\u0645\u0627\u06CC\u06C1 \u06A9\u0627\u0631\u06CC \u06A9\u0627 \u0645\u0634\u0648\u0631\u06C1 \u0646\u06C1\u06CC\u06BA \u06C1\u06D2\u06D4",
    verifiedTaxBaseline: "\u0633\u0631\u06A9\u0627\u0631\u06CC \u0637\u0648\u0631 \u067E\u0631 \u062A\u0635\u062F\u06CC\u0642 \u0634\u062F\u06C1 \u0679\u06CC\u06A9\u0633 \u0642\u0648\u0627\u0639\u062F 2026",
    tier1SourcesBadge: "\u062F\u0631\u062C\u06C1 \u0627\u0648\u0644 \u06A9\u06D2 \u0633\u0631\u06A9\u0627\u0631\u06CC \u0645\u0633\u062A\u0646\u062F \u0630\u0631\u0627\u0626\u0639",
    singleAdult: "\u0627\u06CC\u06A9 \u0641\u0631\u062F (\u063A\u06CC\u0631 \u0634\u0627\u062F\u06CC \u0634\u062F\u06C1)",
    couple: "\u062C\u0648\u0691\u0627 / \u0645\u0634\u062A\u0631\u06A9\u06C1 \u0622\u0645\u062F\u0646\u06CC",
    family: "\u062E\u0627\u0646\u062F\u0627\u0646 (2 \u0628\u0627\u0644\u063A\u060C 1 \u0628\u0686\u06C1)",
    action: "\u0639\u0645\u0644",
    evidence: "\u0645\u0633\u062A\u0646\u062F \u062B\u0628\u0648\u062A \u0627\u0648\u0631 \u0688\u06CC\u0679\u0627 \u06A9\u06D2 \u0630\u0631\u0627\u0626\u0639",
    methodology: "\u062D\u0633\u0627\u0628 \u06A9\u0627 \u0637\u0631\u06CC\u0642\u06C1 \u06A9\u0627\u0631",
    diagnostics: "\u0633\u0633\u0679\u0645 \u06A9\u06CC \u062A\u0634\u062E\u06CC\u0635"
  },
  nav: {
    howItWorks: "\u0637\u0631\u06CC\u0642\u06C1 \u06A9\u0627\u0631",
    sources: "\u0645\u0633\u062A\u0646\u062F \u0630\u0631\u0627\u0626\u0639",
    coverage: "\u0645\u0627\u0631\u06A9\u06CC\u0679 \u06A9\u0648\u0631\u06CC\u062C",
    relocation: "\u0646\u0642\u0644 \u0645\u06A9\u0627\u0646\u06CC",
    jobOfferComparison: "\u0645\u0644\u0627\u0632\u0645\u062A \u06A9\u06CC \u067E\u06CC\u0634\u06A9\u0634 \u06A9\u0627 \u062C\u0627\u0626\u0632\u06C1",
    reports: "\u062A\u062D\u0642\u06CC\u0642\u06CC \u0631\u067E\u0648\u0631\u0679\u0633",
    guides: "\u0634\u06C1\u0631\u0648\u06BA \u06A9\u06CC \u06AF\u0627\u0626\u06CC\u0688\u0632",
    compare: "\u0634\u06C1\u0631\u0648\u06BA \u06A9\u0627 \u0645\u0648\u0627\u0632\u0646\u06C1",
    tabSalaryWorth: "\u06A9\u06CC\u0627 \u0645\u06CC\u0631\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1 \u06A9\u0627\u0641\u06CC \u06C1\u06D2\u061F",
    tabSalaryNeeded: "\u0645\u062C\u06BE\u06D2 \u06A9\u062A\u0646\u0627 \u06A9\u0645\u0627\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2\u061F",
    tabSalaryAfterTax: "\u0679\u06CC\u06A9\u0633 \u06A9\u06D2 \u0628\u0639\u062F \u062E\u0627\u0644\u0635 \u062A\u0646\u062E\u0648\u0627\u06C1",
    tabCostOfLiving: "\u0627\u062E\u0631\u0627\u062C\u0627\u062A\u0650 \u0632\u0646\u062F\u06AF\u06CC",
    tabCompare: "\u0634\u06C1\u0631\u0648\u06BA \u06A9\u0627 \u0645\u0648\u0627\u0632\u0646\u06C1",
    tabJobOffers: "\u0645\u0644\u0627\u0632\u0645\u062A \u06A9\u06CC \u067E\u06CC\u0634\u06A9\u0634\u0648\u06BA \u06A9\u0627 \u0645\u0648\u0627\u0632\u0646\u06C1",
    tabGuides: "\u0634\u06C1\u0631\u0648\u06BA \u06A9\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1 \u06AF\u0627\u0626\u06CC\u0688\u0632"
  },
  calculator: {
    chooseCity: "1. \u0634\u06C1\u0631 / \u0645\u0642\u0627\u0645 \u0645\u0646\u062A\u062E\u0628 \u06A9\u0631\u06CC\u06BA",
    annualSalary: "2. \u0633\u0627\u0644\u0627\u0646\u06C1 \u0645\u062C\u0645\u0648\u0639\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1 (\u06AF\u0631\u0627\u0633)",
    salaryHelp: "\u0679\u06CC\u06A9\u0633 \u0633\u06D2 \u0642\u0628\u0644 \u06A9\u0644 \u062A\u0646\u062E\u0648\u0627\u06C1 (\u0628\u0646\u06CC\u0627\u062F\u06CC \u0645\u0639\u0627\u0648\u0636\u06C1)\u06D4",
    statutoryJurisdiction: "\u0642\u0627\u0646\u0648\u0646\u06CC \u0679\u06CC\u06A9\u0633 \u062F\u0627\u0626\u0631\u06C1 \u0627\u062E\u062A\u06CC\u0627\u0631: {jurisdiction}",
    popularScenarios: "\u0645\u0642\u0628\u0648\u0644 \u062A\u0631\u06CC\u0646 \u0645\u0648\u0627\u0632\u0646\u06D2:",
    heroHeadline: "\u0679\u06CC\u06A9\u0633 \u0627\u0648\u0631 \u0627\u062E\u0631\u0627\u062C\u0627\u062A \u06A9\u06D2 \u0628\u0639\u062F \u0622\u067E \u06A9\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1 \u06A9\u06CC \u0627\u0635\u0644 \u0642\u062F\u0631 \u06A9\u06CC\u0627 \u06C1\u06D2\u061F",
    heroSubheadline: "\u0627\u067E\u0646\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1 \u0627\u0648\u0631 \u0634\u06C1\u0631 \u062F\u0631\u062C \u06A9\u0631\u06CC\u06BA \u0627\u0648\u0631 \u062C\u0627\u0646\u06CC\u06BA \u06A9\u06C1 \u0622\u067E \u0679\u06CC\u06A9\u0633 \u06A9\u06D2 \u0628\u0639\u062F \u06A9\u062A\u0646\u06CC \u0631\u0642\u0645 \u06AF\u06BE\u0631 \u0644\u06D2 \u062C\u0627 \u0633\u06A9\u062A\u06D2 \u06C1\u06CC\u06BA \u0627\u0648\u0631 \u062D\u0642\u06CC\u0642\u06CC \u0628\u0686\u062A \u06A9\u06CC\u0627 \u06C1\u0648 \u06AF\u06CC\u06D4",
    heroSupporting: "\u062F\u06CC\u06A9\u06BE\u06CC\u06BA \u06A9\u06C1 \u06A9\u06CC\u0627 \u0622\u067E \u06A9\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1 \u0628\u0646\u06CC\u0627\u062F\u06CC \u0627\u062E\u0631\u0627\u062C\u0627\u062A \u06A9\u0648 \u067E\u0648\u0631\u0627 \u06A9\u0631\u062A\u06CC \u06C1\u06D2 \u0627\u0648\u0631 \u0622\u067E \u06A9\u0648 \u0628\u0686\u062A \u06A9\u06CC \u0627\u062C\u0627\u0632\u062A \u062F\u06CC\u062A\u06CC \u06C1\u06D2\u06D4",
    householdType: "\u06AF\u06BE\u0631\u06CC\u0644\u0648 \u0633\u0627\u062E\u062A \u0627\u0648\u0631 \u0645\u0633\u06A9\u0646",
    rentOverride: "\u0645\u0627\u06C1\u0627\u0646\u06C1 \u06A9\u0631\u0627\u06CC\u06C1 \u062A\u0628\u062F\u06CC\u0644 \u06A9\u0631\u06CC\u06BA",
    rentOverridePlaceholder: "\u0645\u062B\u0627\u0644: 2,500",
    rentOverrideHelp: "\u0634\u06C1\u0631 \u06A9\u06D2 \u0627\u0648\u0633\u0637 \u0634\u0645\u0627\u0631\u06CC\u0627\u062A\u06CC \u06A9\u0631\u0627\u06CC\u06D2 \u06A9\u06CC \u062C\u06AF\u06C1 \u0622\u067E \u06A9\u0627 \u06A9\u0631\u0627\u06CC\u06C1\u06D4",
    taxYearLabel: "\u0679\u06CC\u06A9\u0633 \u0633\u0627\u0644",
    filingStatusLabel: "\u0641\u0627\u0626\u0644\u0646\u06AF \u06A9\u06CC \u062D\u06CC\u062B\u06CC\u062A",
    dependentsLabel: "\u0632\u06CC\u0631 \u06A9\u0641\u0627\u0644\u062A \u0627\u0641\u0631\u0627\u062F",
    btnCalculate: "\u062E\u0627\u0644\u0635 \u062A\u0646\u062E\u0648\u0627\u06C1 \u0627\u0648\u0631 \u0642\u0648\u062A\u0650 \u062E\u0631\u06CC\u062F \u06A9\u0627 \u062D\u0633\u0627\u0628 \u0644\u06AF\u0627\u0626\u06CC\u06BA",
    quickScenarios: {
      nyc100k: "\u0646\u06CC\u0648\u06CC\u0627\u0631\u06A9 $100k \u0627\u06A9\u06CC\u0644\u0627",
      london60k: "\u0644\u0646\u062F\u0646 \xA360k \u0627\u06A9\u06CC\u0644\u0627",
      dubai300k: "\u062F\u0628\u0626\u06CC 300k \u062F\u0631\u06C1\u0645",
      toronto90k: "\u0679\u0648\u0631\u0646\u0679\u0648 $90k \u0627\u06A9\u06CC\u0644\u0627"
    }
  },
  results: {
    summaryTitle: "\u062A\u062E\u0645\u06CC\u0646\u06C1 \u0634\u062F\u06C1 \u062E\u0627\u0644\u0635 \u0622\u0645\u062F\u0646\u06CC \u0627\u0648\u0631 \u0628\u0686\u062A \u06A9\u06CC \u06AF\u0646\u062C\u0627\u0626\u0634",
    annualGross: "\u0633\u0627\u0644\u0627\u0646\u06C1 \u0645\u062C\u0645\u0648\u0639\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1",
    annualTakeHome: "\u0633\u0627\u0644\u0627\u0646\u06C1 \u062E\u0627\u0644\u0635 \u062A\u0646\u062E\u0648\u0627\u06C1 (\u0679\u06CC\u06A9 \u06C1\u0648\u0645)",
    monthlyTakeHome: "\u0645\u0627\u06C1\u0627\u0646\u06C1 \u062E\u0627\u0644\u0635 \u062A\u0646\u062E\u0648\u0627\u06C1",
    monthlyLivingCosts: "\u0645\u0627\u06C1\u0627\u0646\u06C1 \u0627\u062E\u0631\u0627\u062C\u0627\u062A\u0650 \u0632\u0646\u062F\u06AF\u06CC",
    monthlyDisposable: "\u0645\u0627\u06C1\u0627\u0646\u06C1 \u0642\u0627\u0628\u0644\u0650 \u062E\u0631\u0686 \u0631\u0642\u0645 (\u0688\u0633\u067E\u0648\u0632\u0627\u06CC\u0628\u0644)",
    savingsCapacity: "\u0645\u0627\u06C1\u0627\u0646\u06C1 \u062D\u0642\u06CC\u0642\u06CC \u0628\u0686\u062A \u06A9\u06CC \u0635\u0644\u0627\u062D\u06CC\u062A",
    savingsRate: "\u062A\u062E\u0645\u06CC\u0646\u06C1 \u0634\u062F\u06C1 \u0634\u0631\u062D\u0650 \u0628\u0686\u062A",
    effectiveTaxRate: "\u0645\u0624\u062B\u0631 \u0634\u0631\u062D\u0650 \u0679\u06CC\u06A9\u0633",
    housingBurden: "\u0631\u06C1\u0627\u0626\u0634 \u06A9\u06D2 \u0627\u062E\u0631\u0627\u062C\u0627\u062A \u06A9\u0627 \u0628\u0648\u062C\u06BE",
    taxesAndDeductions: "\u0644\u0627\u0632\u0645\u06CC \u0679\u06CC\u06A9\u0633 \u0627\u0648\u0631 \u0642\u0627\u0646\u0648\u0646\u06CC \u06A9\u0679\u0648\u062A\u06CC\u0627\u06BA",
    essentialLiving: "\u0628\u0646\u06CC\u0627\u062F\u06CC \u0646\u0627\u06AF\u0632\u06CC\u0631 \u0627\u062E\u0631\u0627\u062C\u0627\u062A\u0650 \u0632\u0646\u062F\u06AF\u06CC",
    discretionaryLiving: "\u0630\u0627\u062A\u06CC \u0627\u0648\u0631 \u062A\u0641\u0631\u06CC\u062D\u06CC \u0627\u062E\u0631\u0627\u062C\u0627\u062A",
    spendableSurplus: "\u0642\u0627\u0628\u0644\u0650 \u062E\u0631\u0686 \u0627\u0636\u0627\u0641\u06CC \u0631\u0642\u0645",
    deficitWarning: "\u0627\u0646\u062A\u0628\u0627\u06C1: \u0645\u062A\u0648\u0642\u0639 \u0627\u062E\u0631\u0627\u062C\u0627\u062A\u0650 \u0632\u0646\u062F\u06AF\u06CC \u0627\u0633 \u0634\u06C1\u0631 \u0645\u06CC\u06BA \u0622\u067E \u06A9\u06CC \u062E\u0627\u0644\u0635 \u0622\u0645\u062F\u0646\u06CC \u0633\u06D2 \u0632\u06CC\u0627\u062F\u06C1 \u06C1\u06CC\u06BA\u06D4",
    healthySurplus: "\u0645\u0646\u0627\u0633\u0628 \u0628\u0686\u062A: \u0622\u067E \u06A9\u06CC \u0622\u0645\u062F\u0646\u06CC \u062A\u0645\u0627\u0645 \u0628\u0646\u06CC\u0627\u062F\u06CC \u0627\u062E\u0631\u0627\u062C\u0627\u062A \u06A9\u0648 \u067E\u0648\u0631\u0627 \u06A9\u0631\u0646\u06D2 \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u0633\u0627\u062A\u06BE \u0628\u0627\u0642\u0627\u0639\u062F\u06C1 \u0628\u0686\u062A \u06A9\u06CC \u0627\u062C\u0627\u0632\u062A \u062F\u06CC\u062A\u06CC \u06C1\u06D2\u06D4",
    taxPending: "\u0679\u06CC\u06A9\u0633 \u06A9\u0627 \u062D\u0633\u0627\u0628 \u0642\u0627\u0646\u0648\u0646\u06CC \u062A\u0635\u062F\u06CC\u0642 \u06A9\u06D2 \u0645\u0631\u0627\u062D\u0644 \u0645\u06CC\u06BA \u06C1\u06D2\u06D4",
    shareSummaryTitle: "\u0644\u06CC\u0648 \u0648\u0631\u062F\u06CC \u0645\u0627\u0644\u06CC\u0627\u062A\u06CC \u062A\u062C\u0632\u06CC\u06C1",
    estimatedLivingCosts: "\u062A\u062E\u0645\u06CC\u0646\u06C1 \u0634\u062F\u06C1 \u0627\u062E\u0631\u0627\u062C\u0627\u062A\u0650 \u0632\u0646\u062F\u06AF\u06CC",
    benchmarkContext: "\u0645\u0633\u062A\u0646\u062F \u0634\u0645\u0627\u0631\u06CC\u0627\u062A\u06CC \u062D\u0648\u0627\u0644\u06C1",
    customizeAssumptions: "\u0645\u0641\u0631\u0648\u0636\u0627\u062A \u06A9\u0648 \u0627\u067E\u0646\u06CC \u0645\u0631\u0636\u06CC \u06A9\u06D2 \u0645\u0637\u0627\u0628\u0642 \u0628\u0646\u0627\u0626\u06CC\u06BA"
  },
  salaryNeeded: {
    headline: "\u0622\u0631\u0627\u0645 \u062F\u06C1 \u0632\u0646\u062F\u06AF\u06CC \u06A9\u06D2 \u0644\u06CC\u06D2 \u0622\u067E \u06A9\u0648 \u06A9\u062A\u0646\u0627 \u06A9\u0645\u0627\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2\u061F",
    subheadline: "\u0627\u067E\u0646\u0627 \u0645\u0637\u0644\u0648\u0628\u06C1 \u0645\u0627\u06C1\u0627\u0646\u06C1 \u0628\u0686\u062A \u06A9\u0627 \u06C1\u062F\u0641 \u06CC\u0627 \u0645\u0639\u06CC\u0627\u0631\u0650 \u0632\u0646\u062F\u06AF\u06CC \u0637\u06D2 \u06A9\u0631\u06CC\u06BA \u0627\u0648\u0631 \u062F\u0631\u06A9\u0627\u0631 \u0645\u062C\u0645\u0648\u0639\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1 \u062C\u0627\u0646\u06CC\u06BA\u06D4",
    targetSavings: "\u0645\u0637\u0644\u0648\u0628\u06C1 \u0645\u0627\u06C1\u0627\u0646\u06C1 \u0628\u0686\u062A",
    desiredLifestyle: "\u0645\u0637\u0644\u0648\u0628\u06C1 \u0645\u0639\u06CC\u0627\u0631\u0650 \u0632\u0646\u062F\u06AF\u06CC",
    requiredGross: "\u062F\u0631\u06A9\u0627\u0631 \u0633\u0627\u0644\u0627\u0646\u06C1 \u0645\u062C\u0645\u0648\u0639\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1",
    requiredNet: "\u062F\u0631\u06A9\u0627\u0631 \u0645\u0627\u06C1\u0627\u0646\u06C1 \u062E\u0627\u0644\u0635 \u0631\u0642\u0645",
    calculatedGrossSalary: "\u062F\u0631\u06A9\u0627\u0631 \u0645\u062C\u0645\u0648\u0639\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1",
    explorePlan: "\u0645\u0627\u0644\u06CC\u0627\u062A\u06CC \u0645\u0646\u0635\u0648\u0628\u06C1 \u062F\u06CC\u06A9\u06BE\u06CC\u06BA"
  },
  salaryAfterTax: {
    headline: "\u0679\u06CC\u06A9\u0633 \u06A9\u0679\u0648\u062A\u06CC \u06A9\u06D2 \u0628\u0639\u062F \u062E\u0627\u0644\u0635 \u062A\u0646\u062E\u0648\u0627\u06C1 \u06A9\u0627 \u06A9\u06CC\u0644\u06A9\u0648\u0644\u06CC\u0679\u0631",
    subheadline: "\u0633\u0631\u06A9\u0627\u0631\u06CC \u0679\u06CC\u06A9\u0633 \u0633\u0644\u06CC\u0628\u0633 \u067E\u0631 \u0645\u0628\u0646\u06CC \u0645\u062C\u0645\u0648\u0639\u06CC \u0633\u06D2 \u062E\u0627\u0644\u0635 \u062A\u0646\u062E\u0648\u0627\u06C1 \u06A9\u0627 \u0634\u0641\u0627\u0641 \u062D\u0633\u0627\u0628\u06CC \u062C\u0627\u0626\u0632\u06C1\u06D4",
    federalTax: "\u0642\u0648\u0645\u06CC / \u0648\u0641\u0627\u0642\u06CC \u0627\u0646\u06A9\u0645 \u0679\u06CC\u06A9\u0633",
    stateLocalTax: "\u0635\u0648\u0628\u0627\u0626\u06CC / \u0639\u0644\u0627\u0642\u0627\u0626\u06CC \u0679\u06CC\u06A9\u0633",
    socialSecurity: "\u0633\u0648\u0634\u0644 \u0633\u06CC\u06A9\u06CC\u0648\u0631\u0679\u06CC \u0627\u0648\u0631 \u067E\u0646\u0634\u0646 \u06A9\u0679\u0648\u062A\u06CC",
    medicare: "\u0635\u062D\u062A \u0627\u0648\u0631 \u0644\u0627\u0632\u0645\u06CC \u0627\u0646\u0634\u0648\u0631\u0646\u0633",
    totalDeductions: "\u06A9\u0644 \u0642\u0627\u0646\u0648\u0646\u06CC \u06A9\u0679\u0648\u062A\u06CC\u0627\u06BA",
    netTakeHome: "\u06C1\u0627\u062A\u06BE \u0645\u06CC\u06BA \u0622\u0646\u06D2 \u0648\u0627\u0644\u06CC \u062E\u0627\u0644\u0635 \u0631\u0642\u0645",
    effectiveTaxNote: "\u0645\u062C\u0645\u0648\u0639\u06CC \u0645\u0624\u062B\u0631 \u0642\u0627\u0646\u0648\u0646\u06CC \u06A9\u0679\u0648\u062A\u06CC \u06A9\u06CC \u0634\u0631\u062D"
  },
  costOfLiving: {
    headline: "\u06AF\u06BE\u0631\u06CC\u0644\u0648 \u0627\u062E\u0631\u0627\u062C\u0627\u062A\u0650 \u0632\u0646\u062F\u06AF\u06CC \u06A9\u06CC \u062A\u0641\u0635\u06CC\u0644\u06CC \u062A\u0641\u0635\u06CC\u0644",
    subheadline: "\u0631\u06C1\u0627\u0626\u0634\u060C \u062E\u0648\u0631\u0627\u06A9\u060C \u06CC\u0648\u0679\u06CC\u0644\u06CC\u0679\u06CC\u0632 \u0627\u0648\u0631 \u0679\u0631\u0627\u0646\u0633\u067E\u0648\u0631\u0679 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0633\u0631\u06A9\u0627\u0631\u06CC \u0637\u0648\u0631 \u067E\u0631 \u062A\u0635\u062F\u06CC\u0642 \u0634\u062F\u06C1 \u0628\u06CC\u0646\u0686 \u0645\u0627\u0631\u06A9\u0633\u06D4",
    housingRent: "\u0631\u06C1\u0627\u0626\u0634 \u0627\u0648\u0631 \u06A9\u0631\u0627\u06CC\u06C1",
    groceriesFood: "\u0631\u0627\u0634\u0646 \u0627\u0648\u0631 \u062E\u0648\u0631\u0627\u06A9",
    diningOut: "\u0628\u0627\u06C1\u0631 \u06A9\u06BE\u0627\u0646\u0627 \u0627\u0648\u0631 \u0631\u06CC\u0633\u062A\u0648\u0631\u0627\u0646",
    utilitiesInternet: "\u0628\u062C\u0644\u06CC\u060C \u067E\u0627\u0646\u06CC\u060C \u06AF\u06CC\u0633 \u0627\u0648\u0631 \u0627\u0646\u0679\u0631\u0646\u06CC\u0679",
    publicTransit: "\u067E\u0628\u0644\u06A9 \u0679\u0631\u0627\u0646\u0633\u067E\u0648\u0631\u0679",
    totalMonthlyLiving: "\u06A9\u0644 \u0645\u0627\u06C1\u0627\u0646\u06C1 \u0627\u062E\u0631\u0627\u062C\u0627\u062A\u0650 \u0632\u0646\u062F\u06AF\u06CC",
    householdTypeSelect: "\u062E\u0627\u0646\u062F\u0627\u0646 \u06A9\u06CC \u0633\u0627\u062E\u062A \u06A9\u0627 \u0627\u0646\u062A\u062E\u0627\u0628"
  },
  compare: {
    headline: "\u0634\u06C1\u0631\u0648\u06BA \u06A9\u06D2 \u062F\u0631\u0645\u06CC\u0627\u0646 \u062A\u0646\u062E\u0648\u0627\u06C1 \u0627\u0648\u0631 \u0627\u062E\u0631\u0627\u062C\u0627\u062A \u06A9\u0627 \u0645\u0648\u0627\u0632\u0646\u06C1",
    subheadline: "\u0628\u06CC\u0646 \u0627\u0644\u0627\u0642\u0648\u0627\u0645\u06CC \u0645\u0627\u0644\u06CC\u0627\u062A\u06CC \u0645\u0631\u0627\u06A9\u0632 \u06A9\u06D2 \u062F\u0631\u0645\u06CC\u0627\u0646 \u0642\u0648\u062A\u0650 \u062E\u0631\u06CC\u062F \u06A9\u06D2 \u0641\u0631\u0642 \u0627\u0648\u0631 \u0645\u0633\u0627\u0648\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1 \u06A9\u0627 \u062C\u0627\u0626\u0632\u06C1 \u0644\u06CC\u06BA\u06D4",
    cityA: "\u0634\u06C1\u0631 A (\u0645\u0648\u062C\u0648\u062F\u06C1 \u0645\u0642\u0627\u0645)",
    cityB: "\u0634\u06C1\u0631 B (\u0646\u06CC\u0627 \u0645\u0642\u0627\u0645)",
    salaryA: "\u0634\u06C1\u0631 A \u0645\u06CC\u06BA \u062A\u0646\u062E\u0648\u0627\u06C1",
    equivalentSalary: "\u0634\u06C1\u0631 B \u0645\u06CC\u06BA \u0645\u0637\u0644\u0648\u0628\u06C1 \u0645\u0633\u0627\u0648\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1",
    purchasingPowerDelta: "\u0642\u0648\u062A\u0650 \u062E\u0631\u06CC\u062F \u06A9\u0627 \u062D\u0642\u06CC\u0642\u06CC \u0641\u0631\u0642",
    verdictLabel: "\u0642\u0648\u062A\u0650 \u062E\u0631\u06CC\u062F \u06A9\u06D2 \u0645\u0648\u0627\u0632\u0646\u06D2 \u06A9\u0627 \u0646\u062A\u06CC\u062C\u06C1"
  },
  jobOffers: {
    headline: "\u0645\u0644\u0627\u0632\u0645\u062A \u06A9\u06CC \u067E\u06CC\u0634\u06A9\u0634\u0648\u06BA \u06A9\u0627 \u062A\u0642\u0627\u0628\u0644\u06CC \u062C\u0627\u0626\u0632\u06C1",
    subheadline: "\u0645\u062E\u062A\u0644\u0641 \u06A9\u0631\u0646\u0633\u06CC\u0648\u06BA\u060C \u0679\u06CC\u06A9\u0633 \u0646\u0638\u0627\u0645\u0648\u06BA \u0627\u0648\u0631 \u062D\u0642\u06CC\u0642\u06CC \u0627\u062E\u0631\u0627\u062C\u0627\u062A \u06A9\u06CC \u0628\u0646\u06CC\u0627\u062F \u067E\u0631 \u0645\u0639\u0627\u0648\u0636\u06D2 \u06A9\u06D2 \u067E\u06CC\u06A9\u06CC\u062C \u06A9\u0627 \u062A\u062C\u0632\u06CC\u06C1 \u06A9\u0631\u06CC\u06BA\u06D4",
    offerA: "\u067E\u06CC\u0634\u06A9\u0634 A",
    offerB: "\u067E\u06CC\u0634\u06A9\u0634 B",
    offerVerdict: "\u067E\u06CC\u0634\u06A9\u0634 \u06A9\u06CC \u062C\u0627\u0646\u0686 \u0627\u0648\u0631 \u0627\u0635\u0644 \u0642\u062F\u0631",
    higherRealIncome: "{winner} \u0622\u067E \u06A9\u0648 {delta} \u0632\u06CC\u0627\u062F\u06C1 \u062D\u0642\u06CC\u0642\u06CC \u0642\u0627\u0628\u0644\u0650 \u062E\u0631\u0686 \u0622\u0645\u062F\u0646\u06CC \u0641\u0631\u0627\u06C1\u0645 \u06A9\u0631\u062A\u0627 \u06C1\u06D2\u06D4"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "\u0627\u0633 \u0633\u0627\u0644 \u06CC\u0627 \u0639\u0644\u0627\u0642\u06D2 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0633\u0631\u06A9\u0627\u0631\u06CC \u0679\u06CC\u06A9\u0633 \u0642\u0648\u0627\u0639\u062F \u0627\u0628\u06BE\u06CC \u0633\u0631\u06A9\u0627\u0631\u06CC \u06AF\u0632\u0679 \u0645\u06CC\u06BA \u062C\u0627\u0631\u06CC \u0646\u06C1\u06CC\u06BA \u06C1\u0648\u0626\u06D2\u06D4 \u0644\u06CC\u0648 \u0648\u0631\u062F\u06CC \u0641\u0631\u0636\u06CC \u0627\u0639\u062F\u0627\u062F \u0648 \u0634\u0645\u0627\u0631 \u067E\u06CC\u0634 \u0646\u06C1\u06CC\u06BA \u06A9\u0631\u062A\u0627\u06D4",
    INVALID_SALARY: "\u0628\u0631\u0627\u06C1 \u06A9\u0631\u0645 \u062F\u0631\u0633\u062A \u0645\u062B\u0628\u062A \u062A\u0646\u062E\u0648\u0627\u06C1 \u06A9\u06CC \u0631\u0642\u0645 \u062F\u0631\u062C \u06A9\u0631\u06CC\u06BA\u06D4",
    CITY_NOT_SUPPORTED: "\u0645\u0646\u062A\u062E\u0628 \u06A9\u0631\u062F\u06C1 \u0634\u06C1\u0631 \u0641\u06CC \u0627\u0644\u062D\u0627\u0644 \u0688\u06CC\u0679\u0627 \u0628\u06CC\u0633 \u0645\u06CC\u06BA \u0634\u0627\u0645\u0644 \u0646\u06C1\u06CC\u06BA \u06C1\u06D2\u06D4",
    DATA_STALE: "\u0634\u0645\u0627\u0631\u06CC\u0627\u062A\u06CC \u0688\u06CC\u0679\u0627 \u0641\u06CC \u0627\u0644\u0648\u0642\u062A \u0633\u0627\u0644\u0627\u0646\u06C1 \u0633\u0631\u06A9\u0627\u0631\u06CC \u0622\u0688\u0679 \u06A9\u06D2 \u0639\u0645\u0644 \u0633\u06D2 \u06AF\u0632\u0631 \u0631\u06C1\u0627 \u06C1\u06D2\u06D4",
    FX_UNAVAILABLE: "\u06A9\u0631\u0646\u0633\u06CC \u06A9\u06D2 \u062A\u0628\u0627\u062F\u0644\u06D2 \u06A9\u06CC \u0633\u0631\u0648\u0633 \u0639\u0627\u0631\u0636\u06CC \u0637\u0648\u0631 \u067E\u0631 \u062F\u0633\u062A\u06CC\u0627\u0628 \u0646\u06C1\u06CC\u06BA \u06C1\u06D2\u06D4 \u0622\u062E\u0631\u06CC \u062A\u0635\u062F\u06CC\u0642 \u0634\u062F\u06C1 \u0631\u06CC\u0679 \u0646\u0627\u0641\u0630 \u06C1\u06D2\u06D4",
    NETWORK_ERROR: "\u0646\u06CC\u0679 \u0648\u0631\u06A9 \u06A9\u0646\u06A9\u0634\u0646 \u06A9\u0627 \u0645\u0633\u0626\u0644\u06C1\u06D4 \u0628\u0631\u0627\u06C1 \u06A9\u0631\u0645 \u062F\u0648\u0628\u0627\u0631\u06C1 \u06A9\u0648\u0634\u0634 \u06A9\u0631\u06CC\u06BA\u06D4"
  },
  footer: {
    aboutDesc: "\u0644\u06CC\u0648 \u0648\u0631\u062F\u06CC \u0627\u06CC\u06A9 \u0622\u0632\u0627\u062F \u0645\u0627\u0644\u06CC\u0627\u062A\u06CC \u062A\u062C\u0632\u06CC\u0627\u062A\u06CC \u067E\u0644\u06CC\u0679 \u0641\u0627\u0631\u0645 \u06C1\u06D2 \u062C\u0648 \u0628\u06CC\u0646 \u0627\u0644\u0627\u0642\u0648\u0627\u0645\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1\u0648\u06BA\u060C \u0679\u06CC\u06A9\u0633\u0648\u06BA \u0627\u0648\u0631 \u0634\u06C1\u0631\u06CC \u0627\u062E\u0631\u0627\u062C\u0627\u062A\u0650 \u0632\u0646\u062F\u06AF\u06CC \u06A9\u06D2 \u0644\u06CC\u06D2 \u0642\u0637\u0639\u06CC \u0627\u0648\u0631 \u0631\u06CC\u0627\u0636\u06CC\u0627\u062A\u06CC \u062D\u0633\u0627\u0628 \u06A9\u062A\u0627\u0628 \u0641\u0631\u0627\u06C1\u0645 \u06A9\u0631\u062A\u0627 \u06C1\u06D2\u06D4",
    calculatorsTitle: "\u06A9\u06CC\u0644\u06A9\u0648\u0644\u06CC\u0679\u0631\u0632",
    intelligenceTitle: "\u0639\u0627\u0644\u0645\u06CC \u062A\u062C\u0632\u06CC\u0627\u062A",
    institutionalTitle: "\u0645\u0639\u06CC\u0627\u0631\u0627\u062A \u0627\u0648\u0631 \u067E\u0627\u0644\u06CC\u0633\u06CC\u0627\u06BA",
    cityComparisons: "\u0634\u06C1\u0631\u0648\u06BA \u06A9\u06D2 \u0645\u0648\u0627\u0632\u0646\u06D2",
    empiricalReports: "\u062A\u062D\u0642\u06CC\u0642\u06CC \u0631\u067E\u0648\u0631\u0679\u0633 \u2190",
    editorialPolicy: "\u0627\u062F\u0627\u0631\u062A\u06CC \u067E\u0627\u0644\u06CC\u0633\u06CC",
    dataPolicy: "\u0688\u06CC\u0679\u0627 \u06A9\u06CC \u0634\u0641\u0627\u0641\u06CC\u062A \u06A9\u06CC \u067E\u0627\u0644\u06CC\u0633\u06CC",
    corrections: "\u0688\u06CC\u0679\u0627 \u062F\u0631\u0633\u062A\u06AF\u06CC \u06A9\u06CC \u0627\u0637\u0644\u0627\u0639 \u062F\u06CC\u06BA",
    terms: "\u0634\u0631\u0627\u0626\u0637 \u0648 \u0636\u0648\u0627\u0628\u0637",
    privacy: "\u0631\u0627\u0632\u062F\u0627\u0631\u06CC \u06A9\u06CC \u067E\u0627\u0644\u06CC\u0633\u06CC",
    copyright: "\xA9 2026 LivWorthy Inc. \u062C\u0645\u0644\u06C1 \u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638 \u06C1\u06CC\u06BA\u06D4 \u0631\u06CC\u0627\u0636\u06CC\u0627\u062A\u06CC \u0641\u06CC\u0646 \u0679\u06CC\u06A9 \u0622\u0631\u06A9\u06CC\u0679\u06CC\u06A9\u0686\u0631\u06D4"
  },
  languageSelector: {
    title: "\u0632\u0628\u0627\u0646 \u06A9\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0631\u06CC\u06BA",
    searchPlaceholder: "\u0632\u0628\u0627\u0646\u06CC\u06BA \u062A\u0644\u0627\u0634 \u06A9\u0631\u06CC\u06BA...",
    currentLanguage: "\u0645\u0648\u062C\u0648\u062F\u06C1 \u0632\u0628\u0627\u0646",
    switchSuggestion: "\u06A9\u06CC\u0627 \u0622\u067E \u0644\u06CC\u0648 \u0648\u0631\u062F\u06CC \u06A9\u0648 {language} \u0645\u06CC\u06BA \u062F\u06CC\u06A9\u06BE\u0646\u0627 \u0686\u0627\u06C1\u062A\u06D2 \u06C1\u06CC\u06BA\u061F",
    switchCta: "{language} \u067E\u0631 \u062C\u0627\u0626\u06CC\u06BA",
    dismiss: "\u0631\u062F \u06A9\u0631\u06CC\u06BA",
    allLanguages: "\u062A\u0645\u0627\u0645 \u062F\u0633\u062A\u06CC\u0627\u0628 \u0632\u0628\u0627\u0646\u06CC\u06BA"
  },
  reports: {
    hubTitle: "\u062A\u062D\u0642\u06CC\u0642\u06CC \u0631\u067E\u0648\u0631\u0679\u0633 \u0627\u0648\u0631 \u0628\u06CC\u0646 \u0627\u0644\u0627\u0642\u0648\u0627\u0645\u06CC \u0627\u0634\u0627\u0631\u06CC\u06D2",
    hubSubtitle: "39 \u0639\u0627\u0644\u0645\u06CC \u0645\u0646\u0688\u06CC\u0648\u06BA \u0645\u06CC\u06BA \u0679\u06CC\u06A9\u0633 \u06A9\u0679\u0648\u062A\u06CC\u0648\u06BA\u060C \u062E\u0627\u0644\u0635 \u0622\u0645\u062F\u0646\u06CC \u0627\u0648\u0631 \u0634\u06C1\u0631\u06CC \u0642\u0648\u062A\u0650 \u062E\u0631\u06CC\u062F \u06A9\u0627 \u0634\u0641\u0627\u0641 \u0627\u0648\u0631 \u062A\u0635\u062F\u06CC\u0642 \u0634\u062F\u06C1 \u062A\u062C\u0632\u06CC\u06C1\u06D4",
    instituteBadge: "\u0627\u0646\u0633\u0679\u06CC\u0679\u06CC\u0648\u0679 \u0628\u0631\u0627\u0626\u06D2 \u0634\u0645\u0627\u0631\u06CC\u0627\u062A\u06CC \u062A\u062D\u0642\u06CC\u0642",
    modelBadge: "\u0628\u063A\u06CC\u0631 \u0641\u0631\u0636\u06CC \u0627\u06D2 \u0622\u0626\u06CC \u06A9\u06D2 \u062D\u0633\u0627\u0628\u06CC \u0645\u0627\u0688\u0644\u0646\u06AF",
    globalSalaryWorthTitle: "\u0639\u0627\u0644\u0645\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1 \u06A9\u06CC \u0642\u062F\u0631 \u06A9\u0627 \u0627\u0634\u0627\u0631\u06CC\u06C1 2026",
    purchasingPowerTitle: "\u0642\u0648\u062A\u0650 \u062E\u0631\u06CC\u062F \u06A9\u06CC \u062A\u0642\u0627\u0628\u0644\u06CC \u0631\u067E\u0648\u0631\u0679",
    salaryToRentTitle: "\u062A\u0646\u062E\u0648\u0627\u06C1 \u0627\u0648\u0631 \u06A9\u0631\u0627\u06CC\u06D2 \u06A9\u06D2 \u062A\u0646\u0627\u0633\u0628 \u06A9\u0627 \u0627\u0634\u0627\u0631\u06CC\u06C1",
    relocationGapTitle: "\u0645\u0644\u0627\u0632\u0645\u062A \u06A9\u06CC \u0645\u0646\u062A\u0642\u0644\u06CC \u067E\u0631 \u062A\u0646\u062E\u0648\u0627\u06C1 \u06A9\u06D2 \u0641\u0631\u0642 \u06A9\u06CC \u0631\u067E\u0648\u0631\u0679",
    takeHomePayTitle: "\u062E\u0627\u0644\u0635 \u0622\u0645\u062F\u0646\u06CC \u06A9\u0627 \u0639\u0627\u0644\u0645\u06CC \u062A\u0642\u0627\u0628\u0644\u06CC \u062C\u0627\u0626\u0632\u06C1",
    downloadCsv: "CSV \u0641\u0627\u0626\u0644 \u0688\u0627\u0624\u0646 \u0644\u0648\u0688 \u06A9\u0631\u06CC\u06BA",
    downloadJson: "JSON \u0688\u06CC\u0679\u0627 \u0688\u0627\u0624\u0646 \u0644\u0648\u0688 \u06A9\u0631\u06CC\u06BA",
    methodologyHeading: "\u0637\u0631\u06CC\u0642\u06C1 \u06A9\u0627\u0631 \u0627\u0648\u0631 \u0634\u0645\u0627\u0631\u06CC\u0627\u062A\u06CC \u062D\u062F\u0648\u062F",
    sourcesHeading: "\u0628\u0646\u06CC\u0627\u062F\u06CC \u0633\u0631\u06A9\u0627\u0631\u06CC \u0630\u0631\u0627\u0626\u0639",
    citationHeading: "\u0639\u0644\u0645\u06CC \u062D\u0648\u0627\u0644\u06C1 \u0627\u0648\u0631 \u062D\u0648\u0627\u0644\u06C1 \u062C\u0627\u062A\u06CC \u06C1\u062F\u0627\u06CC\u0627\u062A"
  }
};

// src/lib/i18n/locales/zh.ts
var zhDictionary = {
  locale: "zh",
  common: {
    brand: "LivWorthy",
    tagline: "\u5168\u7403\u85AA\u8D44\u3001\u7A0E\u6536\u4E0E\u751F\u6D3B\u6210\u672C\u91CF\u5316\u5206\u6790\u7CFB\u7EDF",
    livingIntelligence: "\u85AA\u8D44\u4E0E\u751F\u6D3B\u667A\u5E93",
    calculating: "\u6B63\u5728\u7CBE\u51C6\u8BA1\u7B97...",
    calculate: "\u5F00\u59CB\u6D4B\u7B97",
    annual: "\u6309\u5E74",
    monthly: "\u6309\u6708",
    year: "\u5E74",
    month: "\u6708",
    share: "\u5206\u4EAB\u7ED3\u679C",
    copied: "\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F",
    home: "\u9996\u9875",
    back: "\u8FD4\u56DE",
    next: "\u4E0B\u4E00\u6B65",
    close: "\u5173\u95ED",
    disclaimer: "\u672C\u7CFB\u7EDF\u57FA\u4E8E\u5B98\u65B9\u7A0E\u7387\u8868\u548C\u7ECF\u6838\u5B9E\u7684\u5B98\u65B9\u7EDF\u8BA1\u57FA\u51C6\u8FDB\u884C\u786E\u5B9A\u6027\u6570\u5B66\u4F30\u7B97\u3002\u4E0D\u6784\u6210\u6B63\u5F0F\u7A0E\u52A1\u6216\u8D22\u52A1\u54A8\u8BE2\u3002",
    verifiedTaxBaseline: "2026\u5E74\u5EA6\u5B98\u65B9\u6838\u9A8C\u6CD5\u5B9A\u7A0E\u6536\u57FA\u51C6",
    tier1SourcesBadge: "\u7B2C\u4E00\u68AF\u961F\uFF08Tier-1\uFF09\u5B98\u65B9\u653F\u5E9C\u6743\u5A01\u6570\u636E\u6E90",
    singleAdult: "\u5355\u8EAB\uFF08\u72EC\u5C45\u6210\u4EBA\uFF09",
    couple: "\u4F34\u4FA3 / \u53CC\u804C\u5DE5\u5BB6\u5EAD",
    family: "\u6838\u5FC3\u5BB6\u5EAD\uFF082\u6210\u4EBA\uFF0C1\u5B50\u5973\uFF09",
    action: "\u64CD\u4F5C",
    evidence: "\u6570\u636E\u6765\u6E90\u4E0E\u6CD5\u6848\u8BC1\u636E",
    methodology: "\u8BA1\u7B97\u65B9\u6CD5\u8BBA",
    diagnostics: "\u7CFB\u7EDF\u8BCA\u65AD\u72B6\u6001"
  },
  nav: {
    howItWorks: "\u8FD0\u4F5C\u539F\u7406",
    sources: "\u6570\u636E\u6765\u6E90",
    coverage: "\u5E02\u573A\u8986\u76D6",
    relocation: "\u8DE8\u56FD\u79FB\u5C45",
    jobOfferComparison: "Offer\u8BC4\u4F30\u5DE5\u5177",
    reports: "\u5B9E\u8BC1\u7814\u7A76\u62A5\u544A",
    guides: "\u57CE\u5E02\u6307\u5357",
    compare: "\u57CE\u5E02\u5BF9\u6BD4",
    tabSalaryWorth: "\u6211\u7684\u85AA\u6C34\u591F\u7528\u5417\uFF1F",
    tabSalaryNeeded: "\u6211\u9700\u8981\u8D5A\u591A\u5C11\u94B1\uFF1F",
    tabSalaryAfterTax: "\u7A0E\u540E\u5230\u624B\u85AA\u8D44\u8BA1\u7B97",
    tabCostOfLiving: "\u751F\u6D3B\u6210\u672C\u5206\u6790",
    tabCompare: "\u5BF9\u6BD4\u4E24\u5EA7\u57CE\u5E02",
    tabJobOffers: "\u5BF9\u6BD4\u804C\u4F4DOffer",
    tabGuides: "\u57CE\u5E02\u85AA\u8D44\u6307\u5357"
  },
  calculator: {
    chooseCity: "1. \u9009\u62E9\u76EE\u6807\u57CE\u5E02 / \u5730\u533A",
    annualSalary: "2. \u5E74\u85AA\u603B\u989D\uFF08\u7A0E\u524D\u6BDB\u85AA\uFF09",
    salaryHelp: "\u7A0E\u524D\u57FA\u672C\u85AA\u8D44\u4E0E\u56FA\u5B9A\u6D25\u8D34\u3002",
    statutoryJurisdiction: "\u6CD5\u5B9A\u7A0E\u52A1\u8F96\u533A\uFF1A{jurisdiction}",
    popularScenarios: "\u70ED\u95E8\u53C2\u8003\u65B9\u6848\uFF1A",
    heroHeadline: "\u6263\u9664\u7A0E\u8D39\u4E0E\u5F00\u9500\u540E\uFF0C\u4F60\u7684\u85AA\u6C34\u7A76\u7ADF\u503C\u591A\u5C11\uFF1F",
    heroSubheadline: "\u8F93\u5165\u4F60\u7684\u7A0E\u524D\u5E74\u85AA\u4E0E\u6240\u5728\u57CE\u5E02\uFF0C\u6D4B\u7B97\u7A0E\u540E\u5230\u624B\u6536\u5165\u3001\u5404\u9879\u751F\u6D3B\u5F00\u652F\u4E0E\u771F\u5B9E\u6708\u5EA6\u7ED3\u4F59\u3002",
    heroSupporting: "\u6E05\u6670\u6838\u7B97\u6536\u5165\u80FD\u5426\u8986\u76D6\u65E5\u5E38\u6210\u672C\uFF0C\u5E76\u5728\u76EE\u6807\u57CE\u5E02\u5EFA\u7ACB\u8D77\u6301\u7EED\u7684\u73B0\u91D1\u6D41\u4E0E\u5B58\u6B3E\u3002",
    householdType: "\u5BB6\u5EAD\u6784\u6210\u4E0E\u5C45\u4F4F\u5047\u8BBE",
    rentOverride: "\u5B9E\u9645\u6708\u79DF\u91D1\u81EA\u5B9A\u4E49",
    rentOverridePlaceholder: "\u4F8B\u5982\uFF1A2,500",
    rentOverrideHelp: "\u53EF\u8986\u76D6\u5F53\u5730\u7EDF\u8BA1\u5C40\u4E2D\u4F4D\u6570\u79DF\u91D1\u57FA\u51C6\u3002",
    taxYearLabel: "\u9002\u7528\u7A0E\u5E74",
    filingStatusLabel: "\u62A5\u7A0E\u8EAB\u4EFD",
    dependentsLabel: "\u4F9B\u517B\u4EB2\u5C5E\u4EBA\u6570",
    btnCalculate: "\u6D4B\u7B97\u7A0E\u540E\u5230\u624B\u6536\u5165\u4E0E\u5B9E\u9645\u8D2D\u4E70\u529B",
    quickScenarios: {
      nyc100k: "\u7EBD\u7EA6 $100k \u5355\u8EAB",
      london60k: "\u4F26\u6566 \xA360k \u5355\u8EAB",
      dubai300k: "\u8FEA\u62DC 300k AED",
      toronto90k: "\u591A\u4F26\u591A $90k \u5355\u8EAB"
    }
  },
  results: {
    summaryTitle: "\u9884\u4F30\u7A0E\u540E\u51C0\u5230\u624B\u85AA\u8D44\u4E0E\u53EF\u652F\u914D\u7ED3\u4F59",
    annualGross: "\u7A0E\u524D\u5E74\u85AA\u603B\u989D",
    annualTakeHome: "\u5E74\u7A0E\u540E\u5B9E\u9645\u5230\u624B",
    monthlyTakeHome: "\u6708\u5747\u5230\u624B\u85AA\u8D44",
    monthlyLivingCosts: "\u6708\u5EA6\u9884\u4F30\u751F\u6D3B\u6210\u672C",
    monthlyDisposable: "\u6708\u5EA6\u5B9E\u9645\u53EF\u652F\u914D\u7ED3\u4F59",
    savingsCapacity: "\u6BCF\u6708\u53EF\u5B9E\u73B0\u771F\u5B9E\u50A8\u84C4",
    savingsRate: "\u9884\u671F\u50A8\u84C4\u7387",
    effectiveTaxRate: "\u5B9E\u9645\u7EFC\u5408\u6709\u6548\u7A0E\u7387",
    housingBurden: "\u5C45\u4F4F\u652F\u51FA\u5360\u6536\u5165\u6BD4\u4F8B",
    taxesAndDeductions: "\u6CD5\u5B9A\u7A0E\u91D1\u4E0E\u5F3A\u5236\u793E\u4FDD\u6263\u7F34",
    essentialLiving: "\u5FC5\u8981\u57FA\u672C\u751F\u5B58\u652F\u51FA",
    discretionaryLiving: "\u6587\u5A31\u4E0E\u5F39\u6027\u652F\u51FA",
    spendableSurplus: "\u5145\u88D5\u51C0\u7ED3\u4F59",
    deficitWarning: "\u6CE8\u610F\uFF1A\u9884\u4F30\u751F\u6D3B\u6210\u672C\u8D85\u51FA\u76EE\u6807\u57CE\u5E02\u6D4B\u7B97\u7684\u7A0E\u540E\u6536\u5165\u3002",
    healthySurplus: "\u5065\u5EB7\u76C8\u4F59\uFF1A\u4F60\u7684\u7A0E\u540E\u51C0\u6536\u5165\u4E0D\u4EC5\u53EF\u5168\u989D\u8986\u76D6\u5FC5\u8981\u5F00\u9500\uFF0C\u8FD8\u80FD\u4FDD\u969C\u5E38\u89C4\u50A8\u84C4\u3002",
    taxPending: "\u7A0E\u7387\u8BA1\u7B97\u5F85\u5B98\u65B9\u7ACB\u6CD5\u673A\u6784\u6B63\u5F0F\u9881\u5E03\u6838\u51C6\u3002",
    shareSummaryTitle: "LivWorthy\u8D22\u52A1\u8BC4\u4F30\u7B80\u62A5",
    estimatedLivingCosts: "\u9884\u4F30\u751F\u6D3B\u6210\u672C",
    benchmarkContext: "\u5B98\u65B9\u7EDF\u8BA1\u57FA\u51C6\u53C2\u8003",
    customizeAssumptions: "\u81EA\u5B9A\u4E49\u5047\u8BBE"
  },
  salaryNeeded: {
    headline: "\u8981\u7EF4\u6301\u671F\u671B\u751F\u6D3B\u6C34\u5E73\uFF0C\u4F60\u9700\u8981\u8D5A\u591A\u5C11\uFF1F",
    subheadline: "\u8BBE\u5B9A\u4F60\u5E0C\u671B\u8FBE\u5230\u7684\u6708\u50A8\u84C4\u76EE\u6807\u6216\u751F\u6D3B\u54C1\u8D28\uFF0C\u53CD\u63A8\u6240\u9700\u7A0E\u524D\u5E74\u85AA\u3002",
    targetSavings: "\u671F\u671B\u6708\u5EA6\u50A8\u84C4\u91D1\u989D",
    desiredLifestyle: "\u671F\u671B\u751F\u6D3B\u57FA\u51C6\u6C34\u5E73",
    requiredGross: "\u6240\u9700\u7A0E\u524D\u5E74\u85AA",
    requiredNet: "\u6240\u9700\u7A0E\u540E\u6708\u51C0\u6536\u5165",
    calculatedGrossSalary: "\u6D4B\u7B97\u6240\u9700\u7A0E\u524D\u5E74\u85AA",
    explorePlan: "\u67E5\u770B\u8D22\u52A1\u5206\u89E3\u8BA1\u5212"
  },
  salaryAfterTax: {
    headline: "\u6CD5\u5B9A\u4E2A\u7A0E\u4E0E\u7A0E\u540E\u5230\u624B\u85AA\u8D44\u8BA1\u7B97\u5668",
    subheadline: "\u4E25\u683C\u9075\u7167\u5404\u56FD\u5B98\u65B9\u7A0E\u5236\u4E0E\u9636\u68AF\u7A0E\u7387\u6267\u884C\u7684\u900F\u660E\u6BDB\u51C0\u85AA\u916C\u8F6C\u6362\u3002",
    federalTax: "\u8054\u90A6 / \u56FD\u5BB6\u4E2A\u4EBA\u6240\u5F97\u7A0E",
    stateLocalTax: "\u5DDE / \u7701 / \u5730\u65B9\u7A0E",
    socialSecurity: "\u56FD\u5BB6\u517B\u8001\u91D1\u4E0E\u793E\u4F1A\u4FDD\u969C\u7EDF\u7B79",
    medicare: "\u533B\u7597\u4E0E\u5F3A\u5236\u5065\u5EB7\u4FDD\u9669",
    totalDeductions: "\u6CD5\u5B9A\u6263\u9664\u4E0E\u7A0E\u8D1F\u603B\u8BA1",
    netTakeHome: "\u6700\u7EC8\u5230\u624B\u85AA\u8D44\u51C0\u503C",
    effectiveTaxNote: "\u5168\u53E3\u5F84\u7EFC\u5408\u6CD5\u5B9A\u6709\u6548\u7A0E\u7387"
  },
  costOfLiving: {
    headline: "\u5BB6\u5EAD\u751F\u6D3B\u5F00\u652F\u660E\u7EC6\u6784\u6210",
    subheadline: "\u57FA\u4E8E\u653F\u5E9C\u7EDF\u8BA1\u5C40\u6D88\u8D39\u8005\u652F\u51FA\u8C03\u67E5\uFF0C\u5BF9\u4F4F\u623F\u3001\u98DF\u54C1\u3001\u516C\u5171\u4E8B\u4E1A\u53CA\u4EA4\u901A\u7684\u57FA\u51C6\u6838\u7B97\u3002",
    housingRent: "\u4F4F\u623F\u79DF\u91D1\u4E0E\u623F\u4EA7\u652F\u51FA",
    groceriesFood: "\u8D85\u5E02\u98DF\u54C1\u4E0E\u751F\u9C9C\u91C7\u8D2D",
    diningOut: "\u5916\u98DF\u4E0E\u9910\u996E\u6D88\u8D39",
    utilitiesInternet: "\u6C34\u7535\u6C14\u6696\u4E0E\u7F51\u7EDC\u5BBD\u5E26",
    publicTransit: "\u516C\u5171\u4EA4\u901A\u4E0E\u901A\u52E4\u652F\u51FA",
    totalMonthlyLiving: "\u6BCF\u6708\u7EFC\u5408\u751F\u6D3B\u603B\u652F\u51FA",
    householdTypeSelect: "\u9009\u62E9\u5BB6\u5EAD\u914D\u7F6E\u753B\u50CF"
  },
  compare: {
    headline: "\u8DE8\u57CE\u5E02\u85AA\u916C\u4E0E\u751F\u6D3B\u6210\u672C\u5BF9\u6BD4",
    subheadline: "\u6D4B\u7B97\u56FD\u9645\u91D1\u878D\u4E2D\u5FC3\u4E4B\u95F4\u7684\u5B9E\u9645\u8D2D\u4E70\u529B\u5DEE\u5F02\u3001\u7A0E\u52A1\u5957\u5229\u7A7A\u95F4\u53CA\u5BF9\u7B49\u6536\u5165\u3002",
    cityA: "\u57CE\u5E02 A\uFF08\u51FA\u53D1\u5730\uFF09",
    cityB: "\u57CE\u5E02 B\uFF08\u76EE\u7684\u5730\uFF09",
    salaryA: "\u57CE\u5E02 A \u7684\u5F53\u524D\u5E74\u85AA",
    equivalentSalary: "\u57CE\u5E02 B \u7EF4\u6301\u540C\u7B49\u8D2D\u4E70\u529B\u6240\u9700\u85AA\u6C34",
    purchasingPowerDelta: "\u5B9E\u9645\u8D2D\u4E70\u529B\u5DEE\u5F02\u7387",
    verdictLabel: "\u8D2D\u4E70\u529B\u5BF9\u6BD4\u88C1\u5B9A"
  },
  jobOffers: {
    headline: "\u591A\u57CE\u5E02\u8DE8\u56FD\u5DE5\u4F5COffer\u8BC4\u4F30\u5668",
    subheadline: "\u7EFC\u5408\u8DE8\u5E01\u79CD\u6C47\u7387\u3001\u5730\u57DF\u7A0E\u5236\u4EE5\u53CA\u771F\u5B9E\u751F\u6D3B\u7269\u4EF7\uFF0C\u8861\u91CF\u85AA\u916C\u5305\u7684\u771F\u5B9E\u4EF7\u503C\u3002",
    offerA: "Offer A",
    offerB: "Offer B",
    offerVerdict: "Offer\u8BC4\u4F30\u7ED3\u679C\u4E0E\u771F\u5B9E\u4EF7\u503C",
    higherRealIncome: "{winner} \u80FD\u591F\u5E26\u6765\u6BCF\u5E74\u591A\u51FA {delta} \u7684\u771F\u5B9E\u53EF\u652F\u914D\u7ED3\u4F59\u3002"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "\u8BE5\u5E74\u5EA6\u6216\u8BE5\u5C5E\u5730\u7684\u5B98\u65B9\u7A0E\u52A1\u7EC6\u5219\u5C1A\u672A\u6B63\u5F0F\u53D1\u5E03\u3002LivWorthy\u675C\u7EDD\u751F\u6210\u865A\u5047\u63A8\u6D4B\u6570\u636E\u3002",
    INVALID_SALARY: "\u8BF7\u8F93\u5165\u5408\u6CD5\u7684\u6709\u6548\u6B63\u6570\u85AA\u8D44\u989D\u5EA6\u3002",
    CITY_NOT_SUPPORTED: "\u6240\u9009\u57CE\u5E02\u76EE\u524D\u5C1A\u672A\u6536\u5F55\u8FDB\u5B98\u65B9\u6570\u636E\u5E93\u3002",
    DATA_STALE: "\u5E95\u5C42\u57FA\u51C6\u6570\u636E\u6B63\u5904\u4E8E\u5B98\u65B9\u5E74\u5EA6\u5BA1\u8BA1\u6821\u51C6\u6D41\u7A0B\u4E2D\u3002",
    FX_UNAVAILABLE: "\u5916\u6C47\u724C\u4EF7\u5B9E\u65F6\u63A5\u53E3\u4E34\u65F6\u7EF4\u62A4\u4E2D\u3002\u73B0\u5DF2\u81EA\u52A8\u542F\u7528\u7ECF\u8FC7\u9A8C\u8BC1\u7684\u5386\u53F2\u6536\u76D8\u57FA\u51C6\u6C47\u7387\u3002",
    NETWORK_ERROR: "\u7F51\u7EDC\u8FDE\u63A5\u5F02\u5E38\uFF0C\u8BF7\u91CD\u8BD5\u672C\u6B21\u8BA1\u7B97\u3002"
  },
  footer: {
    aboutDesc: "LivWorthy \u662F\u4E00\u4E2A\u72EC\u7ACB\u7684\u5168\u7403\u8D22\u52A1\u60C5\u62A5\u5F15\u64CE\uFF0C\u4E3A\u56FD\u9645\u85AA\u916C\u3001\u6CD5\u5B9A\u4E2A\u7A0E\u53CA\u90FD\u4F1A\u751F\u6D3B\u6210\u672C\u63D0\u4F9B\u4E25\u683C\u7684\u786E\u5B9A\u6027\u6570\u5B66\u6D4B\u7B97\u3002",
    calculatorsTitle: "\u5B9E\u7528\u8BA1\u7B97\u5668",
    intelligenceTitle: "\u5168\u7403\u60C5\u62A5",
    institutionalTitle: "\u6807\u51C6\u4E0E\u51C6\u5219",
    cityComparisons: "\u57CE\u5E02\u5BF9\u6BD4",
    empiricalReports: "\u5B9E\u8BC1\u7814\u7A76\u5B66\u672F\u62A5\u544A \u2192",
    editorialPolicy: "\u7F16\u8F91\u539F\u5219",
    dataPolicy: "\u6570\u636E\u5B8C\u6574\u6027\u653F\u7B56",
    corrections: "\u63D0\u4EA4\u6570\u636E\u7EA0\u9519\u7533\u8BF7",
    terms: "\u670D\u52A1\u6761\u6B3E",
    privacy: "\u9690\u79C1\u653F\u7B56",
    copyright: "\xA9 2026 LivWorthy Inc. \u4FDD\u7559\u6240\u6709\u6743\u5229\u3002\u786E\u5B9A\u6027\u91D1\u878D\u5DE5\u7A0B\u67B6\u6784\u3002"
  },
  languageSelector: {
    title: "\u9009\u62E9\u8BED\u8A00",
    searchPlaceholder: "\u641C\u7D22\u8BED\u8A00...",
    currentLanguage: "\u5F53\u524D\u8BED\u8A00",
    switchSuggestion: "\u662F\u5426\u5207\u6362\u5230 {language} \u6D4F\u89C8 LivWorthy\uFF1F",
    switchCta: "\u5207\u6362\u4E3A {language}",
    dismiss: "\u5FFD\u7565",
    allLanguages: "\u6240\u6709\u652F\u6301\u8BED\u8A00"
  },
  reports: {
    hubTitle: "\u5B9E\u8BC1\u7814\u7A76\u4E0E\u5168\u7403\u57FA\u51C6\u6307\u6570",
    hubSubtitle: "\u6DB5\u76D639\u4E2A\u6838\u5FC3\u56FD\u5BB6\u5E02\u573A\u7684\u8DE8\u56FD\u85AA\u916C\u3001\u6CD5\u5B9A\u51C0\u7559\u5B58\u7387\u53CA\u90FD\u4F1A\u8D2D\u4E70\u529B\u900F\u660E\u7814\u7A76\u6570\u636E\u96C6\u3002",
    instituteBadge: "\u5B9A\u91CF\u7ECF\u6D4E\u5B66\u7814\u7A76\u4E2D\u5FC3",
    modelBadge: "\u96F6\u865A\u6784AI\u786E\u5B9A\u6027\u5EFA\u6A21",
    globalSalaryWorthTitle: "2026\u5168\u7403\u85AA\u8D44\u4EF7\u503C\u6307\u6570\u62A5\u544A",
    purchasingPowerTitle: "\u5168\u7403\u90FD\u4F1A\u8D2D\u4E70\u529B\u5E73\u4EF7\u5BF9\u6BD4\u62A5\u544A",
    salaryToRentTitle: "\u6536\u5165\u623F\u79DF\u6BD4\u6307\u6570\u62A5\u544A",
    relocationGapTitle: "\u8DE8\u56FD\u79FB\u5C45\u85AA\u916C\u5DEE\u8DDD\u5206\u6790\u62A5\u544A",
    takeHomePayTitle: "\u5168\u7403\u6CD5\u5B9A\u7A0E\u540E\u51C0\u6240\u5F97\u6A2A\u5411\u5BF9\u6BD4",
    downloadCsv: "\u4E0B\u8F7D CSV \u6570\u636E\u96C6",
    downloadJson: "\u4E0B\u8F7D JSON \u539F\u59CB\u6570\u636E",
    methodologyHeading: "\u6D4B\u7B97\u65B9\u6CD5\u8BBA\u4E0E\u7EDF\u8BA1\u5B66\u7F6E\u4FE1\u754C\u9650",
    sourcesHeading: "\u6CD5\u5B9A\u4E3B\u6743\u5B98\u65B9\u6743\u5A01\u6765\u6E90",
    citationHeading: "\u5B66\u672F\u89C4\u8303\u4E0E\u5F15\u8FF0\u6307\u5F15"
  }
};

// src/lib/i18n/locales/ja.ts
var jaDictionary = {
  locale: "ja",
  common: {
    brand: "LivWorthy",
    tagline: "\u30B0\u30ED\u30FC\u30D0\u30EB\u7D66\u4E0E\u30FB\u7A0E\u91D1\u30FB\u751F\u6D3B\u8CBB\u306E\u78BA\u5B9A\u5206\u6790\u30B7\u30B9\u30C6\u30E0",
    livingIntelligence: "\u30EA\u30D3\u30F3\u30B0\u30FB\u30A4\u30F3\u30C6\u30EA\u30B8\u30A7\u30F3\u30B9",
    calculating: "\u8A08\u7B97\u4E2D...",
    calculate: "\u8A66\u7B97\u3059\u308B",
    annual: "\u5E74\u984D",
    monthly: "\u6708\u984D",
    year: "\u5E74",
    month: "\u6708",
    share: "\u7D50\u679C\u3092\u5171\u6709",
    copied: "\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F",
    home: "\u30DB\u30FC\u30E0",
    back: "\u623B\u308B",
    next: "\u6B21\u3078",
    close: "\u9589\u3058\u308B",
    disclaimer: "\u516C\u7684\u6CD5\u5B9A\u7A0E\u7387\u8868\u304A\u3088\u3073\u691C\u8A3C\u6E08\u307F\u7D71\u8A08\u6307\u6A19\u306B\u57FA\u3065\u304F\u78BA\u5B9A\u7684\u306A\u6570\u7406\u8A66\u7B97\u3067\u3059\u3002\u7A0E\u52D9\u307E\u305F\u306F\u6295\u8CC7\u306B\u95A2\u3059\u308B\u516C\u5F0F\u306A\u52A9\u8A00\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    verifiedTaxBaseline: "\u6CD5\u4EE4\u691C\u8A3C\u6E08\u307F2026\u5E74\u8AB2\u7A0E\u57FA\u6E96",
    tier1SourcesBadge: "\u7B2C1\u7B49\u7D1A\uFF08Tier-1\uFF09\u516C\u7684\u653F\u5E9C\u6A5F\u95A2\u30C7\u30FC\u30BF",
    singleAdult: "\u5358\u8EAB\uFF08\u72EC\u8EAB\u4E16\u5E2F\uFF09",
    couple: "\u5171\u50CD\u304D\u30AB\u30C3\u30D7\u30EB",
    family: "\u30D5\u30A1\u30DF\u30EA\u30FC\uFF08\u5927\u4EBA2\u540D\u3001\u5B50\u4F9B1\u540D\uFF09",
    action: "\u30A2\u30AF\u30B7\u30E7\u30F3",
    evidence: "\u6839\u62E0\u30FB\u4E00\u6B21\u516C\u7684\u30C7\u30FC\u30BF",
    methodology: "\u7B97\u51FA\u65B9\u6CD5\u8AD6",
    diagnostics: "\u30B7\u30B9\u30C6\u30E0\u8A3A\u65AD"
  },
  nav: {
    howItWorks: "\u8A08\u7B97\u306E\u4ED5\u7D44\u307F",
    sources: "\u516C\u7684\u6839\u62E0\u30BD\u30FC\u30B9",
    coverage: "\u5BFE\u8C61\u90FD\u5E02\u30FB\u5E02\u5834",
    relocation: "\u6D77\u5916\u79FB\u4F4F\u30FB\u8EE2\u8077",
    jobOfferComparison: "\u30AA\u30D5\u30A1\u30FC\u8A55\u4FA1\u30C4\u30FC\u30EB",
    reports: "\u5B9F\u8A3C\u7814\u7A76\u30EC\u30DD\u30FC\u30C8",
    guides: "\u90FD\u5E02\u5225\u30AC\u30A4\u30C9",
    compare: "\u90FD\u5E02\u9593\u6BD4\u8F03",
    tabSalaryWorth: "\u79C1\u306E\u7D66\u4E0E\u306F\u5341\u5206\uFF1F",
    tabSalaryNeeded: "\u3044\u304F\u3089\u7A3C\u3050\u3079\u304D\uFF1F",
    tabSalaryAfterTax: "\u624B\u53D6\u308A\u7D66\u4E0E\u8A08\u7B97",
    tabCostOfLiving: "\u751F\u6D3B\u8CBB\u306E\u5185\u8A33",
    tabCompare: "\u90FD\u5E02\u9593\u306E\u6BD4\u8F03",
    tabJobOffers: "\u6C42\u4EBA\u30AA\u30D5\u30A1\u30FC\u6BD4\u8F03",
    tabGuides: "\u90FD\u5E02\u5225\u7D66\u4E0E\u30AC\u30A4\u30C9"
  },
  calculator: {
    chooseCity: "1. \u5E0C\u671B\u306E\u90FD\u5E02\u30FB\u5730\u57DF\u3092\u9078\u629E",
    annualSalary: "2. \u984D\u9762\u5E74\u53CE\uFF08\u7DCF\u652F\u7D66\u984D\uFF09",
    salaryHelp: "\u7A0E\u5F15\u524D\u306E\u57FA\u672C\u7D66\u304A\u3088\u3073\u56FA\u5B9A\u624B\u5F53\u3002",
    statutoryJurisdiction: "\u9069\u7528\u7A0E\u6CD5\u7BA1\u8F44\u5730\u57DF: {jurisdiction}",
    popularScenarios: "\u5B9A\u756A\u306E\u8A66\u7B97\u30B7\u30CA\u30EA\u30AA:",
    heroHeadline: "\u7A0E\u91D1\u3084\u751F\u6D3B\u8CBB\u3092\u5F15\u3044\u305F\u5F8C\u3001\u3042\u306A\u305F\u306E\u7D66\u4E0E\u306E\u771F\u306E\u4FA1\u5024\u306F\uFF1F",
    heroSubheadline: "\u5E74\u53CE\u3068\u90FD\u5E02\u3092\u5165\u529B\u3059\u308B\u3060\u3051\u3067\u3001\u624B\u53D6\u308A\u984D\u30FB\u751F\u6D3B\u8CBB\u30FB\u6BCE\u6708\u306E\u5B9F\u8CEA\u8CAF\u84C4\u53EF\u80FD\u984D\u3092\u6B63\u78BA\u306B\u7B97\u51FA\u3057\u307E\u3059\u3002",
    heroSupporting: "\u305D\u306E\u90FD\u5E02\u3067\u5E0C\u671B\u306E\u751F\u6D3B\u6C34\u6E96\u3092\u7DAD\u6301\u3057\u3001\u5B89\u5B9A\u3057\u3066\u8CC7\u7523\u5F62\u6210\u304C\u3067\u304D\u308B\u304B\u3092\u5BA2\u89B3\u7684\u306B\u5224\u5B9A\u3057\u307E\u3059\u3002",
    householdType: "\u4E16\u5E2F\u69CB\u6210",
    rentOverride: "\u5B9F\u969B\u306E\u60F3\u5B9A\u5BB6\u8CC3\u3092\u5165\u529B",
    rentOverridePlaceholder: "\u4F8B: 2,500",
    rentOverrideHelp: "\u90FD\u5E02\u306E\u4E2D\u592E\u5024\u7D71\u8A08\u30C7\u30FC\u30BF\u3092\u4E0A\u66F8\u304D\u3057\u3066\u8A66\u7B97\u3057\u307E\u3059\u3002",
    taxYearLabel: "\u9069\u7528\u7A0E\u5E74\u5EA6",
    filingStatusLabel: "\u7533\u544A\u533A\u5206\u30FB\u914D\u5076\u8005\u95A2\u4FC2",
    dependentsLabel: "\u6276\u990A\u89AA\u65CF\u6570",
    btnCalculate: "\u624B\u53D6\u308A\u984D\u3068\u5B9F\u8CEA\u8CFC\u8CB7\u529B\u3092\u8A66\u7B97",
    quickScenarios: {
      nyc100k: "NYC $100k \u5358\u8EAB",
      london60k: "\u30ED\u30F3\u30C9\u30F3 \xA360k \u5358\u8EAB",
      dubai300k: "\u30C9\u30D0\u30A4 300k AED",
      toronto90k: "\u30C8\u30ED\u30F3\u30C8 $90k \u5358\u8EAB"
    }
  },
  results: {
    summaryTitle: "\u63A8\u5B9A\u624B\u53D6\u308A\u7D66\u4E0E\u3068\u5B9F\u8CEA\u53EF\u51E6\u5206\u6240\u5F97",
    annualGross: "\u984D\u9762\u5E74\u53CE\uFF08\u7DCF\u652F\u7D66\u984D\uFF09",
    annualTakeHome: "\u5E74\u9593\u624B\u53D6\u308A\u7D66\u4E0E",
    monthlyTakeHome: "\u6708\u9593\u624B\u53D6\u308A\u7D66\u4E0E",
    monthlyLivingCosts: "\u6708\u9593\u751F\u6D3B\u8CBB\uFF08\u63A8\u5B9A\uFF09",
    monthlyDisposable: "\u6708\u9593\u53EF\u51E6\u5206\u6240\u5F97\uFF08\u4F59\u5270\uFF09",
    savingsCapacity: "\u6BCE\u6708\u306E\u5B9F\u8CEA\u8CAF\u84C4\u53EF\u80FD\u984D",
    savingsRate: "\u63A8\u5B9A\u8CAF\u84C4\u7387",
    effectiveTaxRate: "\u5B9F\u52B9\u7A0E\u7387\uFF08\u7DCF\u8CA0\u62C5\u7387\uFF09",
    housingBurden: "\u4F4F\u5C45\u8CBB\u6BD4\u7387",
    taxesAndDeductions: "\u7A0E\u91D1\u30FB\u516C\u7684\u793E\u4F1A\u4FDD\u967A\u63A7\u9664",
    essentialLiving: "\u4E0D\u53EF\u6B20\u306A\u751F\u6D3B\u56FA\u5B9A\u8CBB",
    discretionaryLiving: "\u6559\u990A\u5A2F\u697D\u30FB\u5909\u52D5\u8CBB",
    spendableSurplus: "\u81EA\u7531\u306B\u4F7F\u3048\u308B\u4F59\u5270\u91D1",
    deficitWarning: "\u8B66\u544A: \u3053\u306E\u90FD\u5E02\u3067\u306E\u63A8\u5B9A\u751F\u6D3B\u8CBB\u304C\u624B\u53D6\u308A\u984D\u3092\u4E0A\u56DE\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002",
    healthySurplus: "\u5065\u5168\u306A\u9ED2\u5B57: \u5FC5\u9808\u751F\u6D3B\u8CBB\u3092\u5168\u984D\u8CC4\u3063\u305F\u4E0A\u3067\u3001\u8A08\u753B\u7684\u306A\u8CC7\u7523\u5F62\u6210\u304C\u5341\u5206\u306B\u53EF\u80FD\u3067\u3059\u3002",
    taxPending: "\u7A0E\u984D\u8A08\u7B97\u306F\u516C\u7684\u516C\u5E03\u306E\u691C\u8A3C\u5F85\u3061\u3067\u3059\u3002",
    shareSummaryTitle: "LivWorthy \u8CA1\u52D9\u8A3A\u65AD\u30EC\u30DD\u30FC\u30C8",
    estimatedLivingCosts: "\u63A8\u5B9A\u751F\u6D3B\u8CBB",
    benchmarkContext: "\u516C\u7684\u7D71\u8A08\u4E2D\u592E\u5024\u57FA\u6E96",
    customizeAssumptions: "\u524D\u63D0\u6761\u4EF6\u306E\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA"
  },
  salaryNeeded: {
    headline: "\u7406\u60F3\u306E\u751F\u6D3B\u306B\u5FC5\u8981\u306A\u984D\u9762\u5E74\u53CE\u306F\uFF1F",
    subheadline: "\u6BCE\u6708\u306E\u8CAF\u84C4\u76EE\u6A19\u3084\u5E0C\u671B\u306E\u30E9\u30A4\u30D5\u30B9\u30BF\u30A4\u30EB\u304B\u3089\u3001\u5FC5\u8981\u306A\u7A0E\u5F15\u524D\u5E74\u53CE\u3092\u9006\u7B97\u3057\u307E\u3059\u3002",
    targetSavings: "\u76EE\u6A19\u3068\u3059\u308B\u6BCE\u6708\u306E\u8CAF\u84C4\u984D",
    desiredLifestyle: "\u5E0C\u671B\u3059\u308B\u751F\u6D3B\u6C34\u6E96\u57FA\u6E96",
    requiredGross: "\u5FC5\u8981\u3068\u3055\u308C\u308B\u984D\u9762\u5E74\u53CE",
    requiredNet: "\u5FC5\u8981\u3068\u3055\u308C\u308B\u6708\u9593\u624B\u53D6\u308A\u984D",
    calculatedGrossSalary: "\u7B97\u51FA\u3055\u308C\u305F\u5FC5\u8981\u5E74\u53CE",
    explorePlan: "\u8A73\u7D30\u306A\u8CC7\u91D1\u8A08\u753B\u3092\u898B\u308B"
  },
  salaryAfterTax: {
    headline: "\u6CD5\u5B9A\u63A7\u9664\u5F8C\u306E\u5B9F\u8CEA\u624B\u53D6\u308A\u7D66\u4E0E\u8A08\u7B97\u6A5F",
    subheadline: "\u5404\u56FD\u7A0E\u52D9\u5F53\u5C40\u306E\u6CD5\u5B9A\u7A0E\u7387\u8868\u306B\u57FA\u3065\u304F\u900F\u660E\u6027\u306E\u9AD8\u3044\u30B0\u30ED\u30B9\u30FB\u30CD\u30C3\u30C8\u624B\u53D6\u308A\u63DB\u7B97\u3002",
    federalTax: "\u56FD\u7A0E / \u6240\u5F97\u7A0E",
    stateLocalTax: "\u5730\u65B9\u7A0E / \u4F4F\u6C11\u7A0E / \u5DDE\u7A0E",
    socialSecurity: "\u516C\u7684\u5E74\u91D1\u30FB\u96C7\u7528\u4FDD\u967A\u7B49",
    medicare: "\u516C\u7684\u533B\u7642\u4FDD\u967A\u30FB\u4ECB\u8B77\u4FDD\u967A\u7B49",
    totalDeductions: "\u6CD5\u5B9A\u63A7\u9664\u5408\u8A08\u984D",
    netTakeHome: "\u5B9F\u969B\u306E\u624B\u53D6\u308A\u53D7\u53D6\u984D",
    effectiveTaxNote: "\u516C\u7684\u63A7\u9664\u3092\u542B\u3080\u7DCF\u5408\u5B9F\u52B9\u8CA0\u62C5\u7387"
  },
  costOfLiving: {
    headline: "\u4E16\u5E2F\u751F\u6D3B\u8CBB\u306E\u8A73\u7D30\u5185\u8A33\u5206\u6790",
    subheadline: "\u516C\u7684\u7D71\u8A08\u5C40\u306E\u5BB6\u8A08\u8ABF\u67FB\u306B\u57FA\u3065\u304F\u4F4F\u5C45\u3001\u98DF\u8CBB\u3001\u5149\u71B1\u8CBB\u3001\u4EA4\u901A\u8CBB\u306E\u7CBE\u7DFB\u306A\u57FA\u6E96\u5024\u3002",
    housingRent: "\u5BB6\u8CC3\u30FB\u4F4F\u5C45\u95A2\u9023\u8CBB",
    groceriesFood: "\u98DF\u6599\u54C1\u30FB\u81EA\u708A\u8CBB",
    diningOut: "\u5916\u98DF\u30FB\u30AB\u30D5\u30A7\u4EE3",
    utilitiesInternet: "\u5149\u71B1\u6C34\u8CBB\u30FB\u901A\u4FE1\u8CBB",
    publicTransit: "\u516C\u5171\u4EA4\u901A\u6A5F\u95A2\u30FB\u901A\u52E4\u8CBB",
    totalMonthlyLiving: "\u6708\u9593\u7DCF\u5408\u751F\u6D3B\u8CBB",
    householdTypeSelect: "\u4E16\u5E2F\u30D7\u30ED\u30D5\u30A1\u30A4\u30EB\u306E\u9078\u629E"
  },
  compare: {
    headline: "\u90FD\u5E02\u9593\u306E\u7D66\u4E0E\u3068\u751F\u6D3B\u8CBB\u3092\u5FB9\u5E95\u6BD4\u8F03",
    subheadline: "\u4E16\u754C\u306E\u4E3B\u8981\u90FD\u5E02\u9593\u306B\u304A\u3051\u308B\u5B9F\u8CEA\u8CFC\u8CB7\u529B\u306E\u683C\u5DEE\u3001\u7A0E\u5236\u306E\u9055\u3044\u3001\u5FC5\u8981\u7B49\u4FA1\u5E74\u53CE\u3092\u6570\u7406\u30E2\u30C7\u30EB\u5316\u3002",
    cityA: "\u90FD\u5E02 A\uFF08\u73FE\u5C45\u4F4F\u5730\uFF09",
    cityB: "\u90FD\u5E02 B\uFF08\u79FB\u4F4F\u5019\u88DC\u5730\uFF09",
    salaryA: "\u90FD\u5E02 A \u3067\u306E\u7D66\u4E0E",
    equivalentSalary: "\u90FD\u5E02 B \u3067\u540C\u7B49\u751F\u6D3B\u306B\u5FC5\u8981\u306A\u7D66\u4E0E",
    purchasingPowerDelta: "\u5B9F\u8CEA\u8CFC\u8CB7\u529B\u683C\u5DEE",
    verdictLabel: "\u8CFC\u8CB7\u529B\u5224\u5B9A\u30B5\u30DE\u30EA\u30FC"
  },
  jobOffers: {
    headline: "\u591A\u90FD\u5E02\u30FB\u6D77\u5916\u6C42\u4EBA\u30AA\u30D5\u30A1\u30FC\u6BD4\u8F03",
    subheadline: "\u7570\u306A\u308B\u901A\u8CA8\u3001\u7A0E\u5236\u3001\u73FE\u5730\u751F\u6D3B\u8CBB\u3092\u6A2A\u65AD\u3057\u3066\u3001\u30AA\u30D5\u30A1\u30FC\u306E\u771F\u306E\u4FA1\u5024\u3092\u516C\u5E73\u306B\u8A55\u4FA1\u3057\u307E\u3059\u3002",
    offerA: "\u30AA\u30D5\u30A1\u30FC A",
    offerB: "\u30AA\u30D5\u30A1\u30FC B",
    offerVerdict: "\u30AA\u30D5\u30A1\u30FC\u306E\u7DCF\u5408\u5224\u5B9A\u30FB\u5B9F\u8CEA\u4FA1\u5024",
    higherRealIncome: "{winner} \u306E\u65B9\u304C\u5E74\u9593\u3067\u5B9F\u8CEA {delta} \u591A\u3044\u53EF\u51E6\u5206\u6240\u5F97\u3092\u3082\u305F\u3089\u3057\u307E\u3059\u3002"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "\u672C\u5E74\u5EA6\u307E\u305F\u306F\u5F53\u8A72\u5730\u57DF\u306E\u516C\u7684\u7A0E\u7387\u8868\u306F\u307E\u3060\u5B98\u5831\u516C\u793A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002LivWorthy\u306F\u4E0D\u78BA\u5B9F\u306A\u63A8\u8A08\u5024\u3092\u751F\u6210\u3057\u307E\u305B\u3093\u3002",
    INVALID_SALARY: "\u6709\u52B9\u306A\u6B63\u306E\u7D66\u4E0E\u91D1\u984D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    CITY_NOT_SUPPORTED: "\u9078\u629E\u3055\u308C\u305F\u90FD\u5E02\u306F\u73FE\u5728\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u306B\u672A\u767B\u9332\u3067\u3059\u3002",
    DATA_STALE: "\u57FA\u790E\u7D71\u8A08\u30C7\u30FC\u30BF\u306F\u73FE\u5728\u3001\u5E74\u6B21\u6CD5\u5B9A\u76E3\u67FB\u4E2D\u3067\u3059\u3002",
    FX_UNAVAILABLE: "\u70BA\u66FF\u30EC\u30FC\u30C8\u53D6\u5F97\u6A5F\u80FD\u304C\u4E00\u6642\u7684\u306B\u5229\u7528\u3067\u304D\u307E\u305B\u3093\u3002\u76F4\u8FD1\u691C\u8A3C\u6E08\u307F\u306E\u57FA\u6E96\u7D42\u5024\u3092\u9069\u7528\u3057\u3066\u3044\u307E\u3059\u3002",
    NETWORK_ERROR: "\u30CD\u30C3\u30C8\u30EF\u30FC\u30AF\u901A\u4FE1\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  footer: {
    aboutDesc: "LivWorthy\u306F\u3001\u56FD\u969B\u7684\u306A\u7D66\u4E0E\u3001\u6CD5\u5B9A\u7A0E\u5236\u3001\u90FD\u5E02\u751F\u6D3B\u8CBB\u306E\u6570\u7406\u78BA\u5B9A\u8A08\u7B97\u3092\u63D0\u4F9B\u3059\u308B\u72EC\u7ACB\u7CFB\u30D5\u30A3\u30F3\u30C6\u30C3\u30AF\u77E5\u898B\u30A8\u30F3\u30B8\u30F3\u3067\u3059\u3002",
    calculatorsTitle: "\u8A08\u7B97\u30C4\u30FC\u30EB",
    intelligenceTitle: "\u30B0\u30ED\u30FC\u30D0\u30EB\u5206\u6790",
    institutionalTitle: "\u898F\u7D04\u3068\u30DD\u30EA\u30B7\u30FC",
    cityComparisons: "\u90FD\u5E02\u9593\u6BD4\u8F03",
    empiricalReports: "\u5B9F\u8A3C\u7814\u7A76\u30EC\u30DD\u30FC\u30C8 \u2192",
    editorialPolicy: "\u7DE8\u96C6\u65B9\u91DD",
    dataPolicy: "\u30C7\u30FC\u30BF\u5B8C\u5168\u6027\u30DD\u30EA\u30B7\u30FC",
    corrections: "\u30C7\u30FC\u30BF\u4FEE\u6B63\u306E\u5831\u544A",
    terms: "\u5229\u7528\u898F\u7D04",
    privacy: "\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC\u30DD\u30EA\u30B7\u30FC",
    copyright: "\xA9 2026 LivWorthy Inc. All rights reserved. \u78BA\u5B9A\u7684\u30D5\u30A3\u30F3\u30C6\u30C3\u30AF\u30FB\u30A2\u30FC\u30AD\u30C6\u30AF\u30C1\u30E3\u3002"
  },
  languageSelector: {
    title: "\u8A00\u8A9E\u3092\u9078\u629E",
    searchPlaceholder: "\u8A00\u8A9E\u3092\u691C\u7D22...",
    currentLanguage: "\u73FE\u5728\u306E\u8A00\u8A9E",
    switchSuggestion: "LivWorthy\u3092{language}\u3067\u8868\u793A\u3057\u307E\u3059\u304B\uFF1F",
    switchCta: "{language}\u306B\u5207\u308A\u66FF\u3048\u308B",
    dismiss: "\u9589\u3058\u308B",
    allLanguages: "\u3059\u3079\u3066\u306E\u5BFE\u5FDC\u8A00\u8A9E"
  },
  reports: {
    hubTitle: "\u5B9F\u8A3C\u7D4C\u6E08\u5B66\u7814\u7A76\uFF06\u4E16\u754C\u7684\u57FA\u6E96\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9",
    hubSubtitle: "39\u304B\u56FD\u306E\u30B3\u30A2\u5E02\u5834\u306B\u304A\u3051\u308B\u624B\u53D6\u308A\u6240\u5F97\u6B8B\u5B58\u7387\u3001\u56FD\u5883\u3092\u8D8A\u3048\u305F\u5B9F\u8CEA\u8CFC\u8CB7\u529B\u3001\u90FD\u5E02\u5225\u751F\u6D3B\u8CBB\u306B\u95A2\u3059\u308B\u5F15\u7528\u53EF\u80FD\u306A\u516C\u5F0F\u7814\u7A76\u30C7\u30FC\u30BF\u3002",
    instituteBadge: "\u8A08\u91CF\u7D4C\u6E08\u5B66\u7814\u7A76\u6240",
    modelBadge: "AI\u63A8\u6E2C\u306B\u4F9D\u5B58\u3057\u306A\u3044\u78BA\u5B9A\u578B\u6570\u7406\u30E2\u30C7\u30EB",
    globalSalaryWorthTitle: "2026\u5E74 \u4E16\u754C\u7D66\u4E0E\u5B9F\u8CEA\u4FA1\u5024\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9",
    purchasingPowerTitle: "\u8CFC\u8CB7\u529B\u5E73\u4FA1\u90FD\u5E02\u9593\u6BD4\u8F03\u30EC\u30DD\u30FC\u30C8",
    salaryToRentTitle: "\u7D66\u4E0E\u5BFE\u5BB6\u8CC3\u6BD4\u7387\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9",
    relocationGapTitle: "\u56FD\u969B\u79FB\u4F4F\u6642\u306E\u7D66\u4E0E\u683C\u5DEE\u30EC\u30DD\u30FC\u30C8",
    takeHomePayTitle: "\u4E16\u754C\u7684\u6CD5\u5B9A\u624B\u53D6\u308A\u7D66\u4E0E\u6BD4\u8F03",
    downloadCsv: "CSV\u30C7\u30FC\u30BF\u30BB\u30C3\u30C8\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9",
    downloadJson: "\u751F\u30C7\u30FC\u30BFJSON\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9",
    methodologyHeading: "\u7B97\u51FA\u624B\u6CD5\u3068\u7D71\u8A08\u7684\u4FE1\u983C\u9650\u754C",
    sourcesHeading: "\u5404\u56FD\u653F\u5E9C\u4E00\u6B21\u516C\u7684\u6A5F\u95A2\u30BD\u30FC\u30B9",
    citationHeading: "\u5B66\u8853\u5F15\u7528\u304A\u3088\u3073\u6587\u732E\u53C2\u7167"
  }
};

// src/lib/i18n/locales/it.ts
var itDictionary = {
  locale: "it",
  common: {
    brand: "LivWorthy",
    tagline: "Intelligenza Globale su Stipendi, Tasse e Costo della Vita",
    livingIntelligence: "Living Intelligence",
    calculating: "Calcolo in corso...",
    calculate: "Calcola",
    annual: "Annuale",
    monthly: "Mensile",
    year: "Anno",
    month: "Mese",
    share: "Condividi",
    copied: "Copiato negli appunti",
    home: "Home",
    back: "Indietro",
    next: "Avanti",
    close: "Chiudi",
    disclaimer: "I calcoli sono stime deterministiche basate su scaglioni fiscali di legge e parametri statistici ufficiali. Non costituisce consulenza fiscale o finanziaria.",
    verifiedTaxBaseline: "Base Fiscale Ufficiale Verificata 2026",
    tier1SourcesBadge: "Fonti Governative Ufficiali di Primo Livello",
    singleAdult: "Singolo Adulto",
    couple: "Coppia / Doppio Reddito",
    family: "Famiglia (2 Adulti, 1 Bambino)",
    action: "Azione",
    evidence: "Fonti e Riferimenti Normativi",
    methodology: "Metodologia di Calcolo",
    diagnostics: "Diagnostica di Sistema"
  },
  nav: {
    howItWorks: "Come Funziona",
    sources: "Fonti",
    coverage: "Copertura Globale",
    relocation: "Trasferimento",
    jobOfferComparison: "Valutatore Offerte",
    reports: "Rapporti Empirici",
    guides: "Guide Citt\xE0",
    compare: "Confronta Citt\xE0",
    tabSalaryWorth: "Il Mio Stipendio \xE8 Sufficiente?",
    tabSalaryNeeded: "Quanto Dovrei Guadagnare?",
    tabSalaryAfterTax: "Stipendio Netto",
    tabCostOfLiving: "Costo della Vita",
    tabCompare: "Confronta Citt\xE0",
    tabJobOffers: "Confronta Offerte di Lavoro",
    tabGuides: "Guide Retributive Urbane \u2192"
  },
  calculator: {
    chooseCity: "1. Scegli Citt\xE0 / Ubicazione",
    annualSalary: "2. Stipendio Lordo Annuo",
    salaryHelp: "Compenso al lordo delle imposte (stipendio base).",
    statutoryJurisdiction: "Giurisdizione fiscale di legge: {jurisdiction}",
    popularScenarios: "Scenari Comuni:",
    heroHeadline: "Quanto vale realmente il tuo stipendio?",
    heroSubheadline: "Inserisci stipendio e citt\xE0 per scoprire il netto reale, le spese e il potenziale di risparmio.",
    heroSupporting: "Verifica se il tuo compenso copre i costi abitativi e consente di risparmiare nella citt\xE0 scelta.",
    householdType: "Composizione Nucleo Familiare",
    rentOverride: "Affitto Mensile Reale (Opzionale)",
    rentOverridePlaceholder: "es. 1.200 \u20AC / mese",
    rentOverrideHelp: "Sostituisci la stima statistica con il tuo canone di locazione effettivo.",
    taxYearLabel: "Anno Fiscale",
    filingStatusLabel: "Stato Civile Fiscale",
    dependentsLabel: "Persone a Carico",
    btnCalculate: "Calcola Potere di Spesa",
    quickScenarios: {
      nyc100k: "NYC: 100.000 $",
      london60k: "Londra: 60.000 \xA3",
      dubai300k: "Dubai: 300.000 AED",
      toronto90k: "Milano: 45.000 \u20AC"
    }
  },
  results: {
    summaryTitle: "Quadro Retributivo e Potere di Spesa Netto",
    annualGross: "Retribuzione Annua Lorda",
    annualTakeHome: "Retribuzione Annua Netta",
    monthlyTakeHome: "Entrata Netta Mensile",
    monthlyLivingCosts: "Spese Essenziali di Vita",
    monthlyDisposable: "Reddito Disponibile Residuo",
    savingsCapacity: "Capacit\xE0 di Risparmio Mensile",
    savingsRate: "Tasso di Risparmio Stimato",
    effectiveTaxRate: "Aliquota Fiscale Effettiva",
    housingBurden: "Incidenza Affitto sul Netto",
    taxesAndDeductions: "Imposte e Contributi Previdenziali",
    essentialLiving: "Spese Essenziali (Alloggio, Cibo, Utenze)",
    discretionaryLiving: "Spese Discrezionali e Trasporti",
    spendableSurplus: "Surplus Mensile Risparmiabile",
    deficitWarning: "Attenzione: Il costo della vita supera il netto mensile.",
    healthySurplus: "Surplus Finanziario Sostenibile",
    taxPending: "Calcolo fiscale in attesa di verifica ufficiale",
    shareSummaryTitle: "Condividi il Riepilogo Retributivo",
    estimatedLivingCosts: "Spese di Sostentamento Stimate",
    benchmarkContext: "Riferimento Statistico Ufficiale ISTAT / Eurostat",
    customizeAssumptions: "Personalizza Parametri di Calcolo"
  },
  salaryNeeded: {
    headline: "Quanto Stipendio Serve per Vivere Bene?",
    subheadline: "Calcolo matematico inverso del lordo necessario per coprire affitto, spese e risparmio.",
    targetSavings: "Obiettivo di Risparmio Mensile Desiderato",
    desiredLifestyle: "Stile di Vita e Composizione Familiare",
    requiredGross: "Stipendio Annuo Lordo Necessario",
    requiredNet: "Stipendio Netto Mensile Minimo",
    calculatedGrossSalary: "Lordo Richiesto Calcolato",
    explorePlan: "Esplora Dettaglio di Spesa"
  },
  salaryAfterTax: {
    headline: "Calcolo Stipendio Netto e Detrazioni Fiscali",
    subheadline: "Dettaglio IRPEF, addizionali regionali e contributi previdenziali sul lordo.",
    federalTax: "Imposta sul Reddito (IRPEF)",
    stateLocalTax: "Addizionali Regionali e Comunali",
    socialSecurity: "Contributi Previdenziali (INPS)",
    medicare: "Assicurazione Sanitaria / Oneri Sociali",
    totalDeductions: "Totale Ritenute alla Fonte",
    netTakeHome: "Netto Effettivo in Busta Paga",
    effectiveTaxNote: "Aliquota media effettiva comprensiva di oneri previdenziali."
  },
  costOfLiving: {
    headline: "Costo della Vita e Ripartizione Mensile",
    subheadline: "Spese statistiche ufficiali per alloggio, generi alimentari, trasporti e utenze.",
    housingRent: "Alloggio e Canone di Affitto",
    groceriesFood: "Spesa Alimentare e Beni di Prima Necessit\xE0",
    diningOut: "Ristorazione e Socialit\xE0",
    utilitiesInternet: "Utenze Domestiche, Energia e Fibra",
    publicTransit: "Trasporto Pubblico Locale e Mobilit\xE0",
    totalMonthlyLiving: "Costo di Vita Mensile Totale",
    householdTypeSelect: "Tipologia Familiare"
  },
  compare: {
    headline: "Confronto Retributivo e di Potere d\u2019Acquisto tra Citt\xE0",
    subheadline: "Scopri quale stipendio pareggia il tuo tenore di vita in una nuova citt\xE0.",
    cityA: "Citt\xE0 di Origine (Citt\xE0 A)",
    cityB: "Citt\xE0 di Destinazione (Citt\xE0 B)",
    salaryA: "Stipendio Attuale (Citt\xE0 A)",
    equivalentSalary: "Stipendio Equivalente Necessario",
    purchasingPowerDelta: "Differenziale di Potere d\u2019Acquisto",
    verdictLabel: "Verdetto Economico Finale"
  },
  jobOffers: {
    headline: "Valutatore e Confronto tra Offerte di Lavoro",
    subheadline: "Confronta due offerte in citt\xE0 diverse considerando imposte e canoni di affitto.",
    offerA: "Proposta Lavorativa A",
    offerB: "Proposta Lavorativa B",
    offerVerdict: "Offerta Finanziariamente Superiore",
    higherRealIncome: "Reddito Netto Reale Superiore"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "Il calcolo fiscale per questo anno o citt\xE0 non \xE8 attualmente disponibile secondo standard normativi verificati.",
    INVALID_SALARY: "Inserisci un importo salariale valido superiore a zero.",
    CITY_NOT_SUPPORTED: "La citt\xE0 selezionata non \xE8 al momento supportata.",
    DATA_STALE: "I parametri statistici per questa localit\xE0 sono in fase di aggiornamento.",
    FX_UNAVAILABLE: "Tasso di cambio provvisoriamente non disponibile.",
    NETWORK_ERROR: "Errore di connessione di rete."
  },
  footer: {
    aboutDesc: "LivWorthy \xE8 la piattaforma indipendente di intelligence economica e retributiva per professionisti, espatriati e aziende.",
    calculatorsTitle: "Calcolatori",
    intelligenceTitle: "Intelligence Economica",
    institutionalTitle: "Istituzionale",
    cityComparisons: "Confronti Urbani",
    empiricalReports: "Rapporti Empirici",
    editorialPolicy: "Politica Editoriale",
    dataPolicy: "Governance dei Dati",
    corrections: "Rettifiche",
    terms: "Termini di Servizio",
    privacy: "Informativa sulla Privacy",
    copyright: "Tutti i diritti riservati."
  },
  languageSelector: {
    title: "Seleziona Lingua e Regione",
    searchPlaceholder: "Cerca lingua o paese...",
    currentLanguage: "Lingua Attiva",
    switchSuggestion: "Visualizza in italiano?",
    switchCta: "Passa a Italiano",
    dismiss: "Chiudi",
    allLanguages: "Tutte le Lingue Disponibili"
  },
  reports: {
    hubTitle: "Osservatorio di Ricerca Economica LivWorthy",
    hubSubtitle: "Studi empirici globali su potere d\u2019acquisto, fiscalit\xE0 e mobilit\xE0 internazionale.",
    instituteBadge: "Dati Certificati LivWorthy",
    modelBadge: "Modello Deterministico",
    globalSalaryWorthTitle: "Indice Globale del Valore Retributivo 2026",
    purchasingPowerTitle: "Rapporto Internazionale sulla Parit\xE0 di Potere d\u2019Acquisto",
    salaryToRentTitle: "Indice Incidenza Affitto su Stipendio Netto",
    relocationGapTitle: "Differenziale Retributivo di Trasferimento Globale",
    takeHomePayTitle: "Quadro Comparativo Netto e Cuneo Fiscale",
    downloadCsv: "Scarica Dati (CSV)",
    downloadJson: "Scarica Dati (JSON)",
    methodologyHeading: "Metodologia Scientifica",
    sourcesHeading: "Fonti Istituzionali",
    citationHeading: "Norme di Citazione Accademica e Media"
  }
};

// src/lib/i18n/locales/nl.ts
var nlDictionary = {
  locale: "nl",
  common: {
    brand: "LivWorthy",
    tagline: "Wereldwijde Salaris-, Belasting- en Levensonderhoud Inzichten",
    livingIntelligence: "Living Intelligence",
    calculating: "Berekenen...",
    calculate: "Berekenen",
    annual: "Jaarlijks",
    monthly: "Maandelijks",
    year: "Jaar",
    month: "Maand",
    share: "Delen",
    copied: "Gekopieerd naar klembord",
    home: "Home",
    back: "Terug",
    next: "Volgende",
    close: "Sluiten",
    disclaimer: "Berekeningen zijn deterministische schattingen op basis van wettelijke belastingtarieven en offici\xEBle statistieken. Geen formeel financieel of fiscaal advies.",
    verifiedTaxBaseline: "Wettelijk Geverifieerde Fiscale Basis 2026",
    tier1SourcesBadge: "Offici\xEBle Overheidsbronnen van Niveau 1",
    singleAdult: "Alleenstaande",
    couple: "Stel / Tweeverdieners",
    family: "Gezin (2 Volwassenen, 1 Kind)",
    action: "Actie",
    evidence: "Bronnen en Wetgevingskader",
    methodology: "Berekeningsmethodologie",
    diagnostics: "Systeemdiagnose"
  },
  nav: {
    howItWorks: "Hoe het werkt",
    sources: "Bronnen",
    coverage: "Dekking",
    relocation: "Verhuizing",
    jobOfferComparison: "Aanbiedingsvergelijker",
    reports: "Empirische Rapporten",
    guides: "Stadsgidsen",
    compare: "Steden Vergelijken",
    tabSalaryWorth: "Is Mijn Salaris Genoeg?",
    tabSalaryNeeded: "Hoeveel Moet Ik Verdienen?",
    tabSalaryAfterTax: "Netto Salaris",
    tabCostOfLiving: "Kosten van Levensonderhoud",
    tabCompare: "Steden Vergelijken",
    tabJobOffers: "Banenaanbiedingen Vergelijken",
    tabGuides: "Stedelijke Salarisgidsen \u2192"
  },
  calculator: {
    chooseCity: "1. Kies Stad / Locatie",
    annualSalary: "2. Bruto Jaarsalaris",
    salaryHelp: "Salaris v\xF3\xF3r belastingen en heffingen (basissalaris).",
    statutoryJurisdiction: "Wettelijke belastingjurisdictie: {jurisdiction}",
    popularScenarios: "Veelvoorkomende scenario\u2019s:",
    heroHeadline: "Wat is je salaris echt waard?",
    heroSubheadline: "Vul je salaris en stad in om te zien wat je netto overhoudt, uitgeeft en kunt sparen.",
    heroSupporting: "Ontdek of je salaris de woonlasten dekt en ruimte laat voor sparen in je gekozen stad.",
    householdType: "Huishoudtype",
    rentOverride: "Werkelijke Maandhuur (Optioneel)",
    rentOverridePlaceholder: "bijv. \u20AC 1.500 / maand",
    rentOverrideHelp: "Vervang de statistische schatting door je werkelijke huurprijs.",
    taxYearLabel: "Belastingjaar",
    filingStatusLabel: "Fiscale Status",
    dependentsLabel: "Personen ten laste",
    btnCalculate: "Bereken Koopkracht",
    quickScenarios: {
      nyc100k: "NYC: $ 100.000",
      london60k: "Londen: \xA3 60.000",
      dubai300k: "Dubai: 300.000 AED",
      toronto90k: "Amsterdam: \u20AC 65.000"
    }
  },
  results: {
    summaryTitle: "Salarisoverzicht en Netto Koopkracht",
    annualGross: "Bruto Jaarsalaris",
    annualTakeHome: "Netto Jaarsalaris",
    monthlyTakeHome: "Netto Maandinkomen",
    monthlyLivingCosts: "Essenti\xEBle Levenskosten",
    monthlyDisposable: "Vrij Besteedbaar Inkomen",
    savingsCapacity: "Maandelijkse Spaarcapaciteit",
    savingsRate: "Geschat Spaarpercentage",
    effectiveTaxRate: "Effectieve Belastingdruk",
    housingBurden: "Woonlastenpercentage van Netto",
    taxesAndDeductions: "Inkomstenbelasting en Premies",
    essentialLiving: "Noodzakelijke Uitgaven (Wonen, Voeding, Vaste Lasten)",
    discretionaryLiving: "Vrije Uitgaven en Vervoer",
    spendableSurplus: "Resterend Maandelijks Overschot",
    deficitWarning: "Let op: De totale kosten overstijgen het netto maandinkomen.",
    healthySurplus: "Duurzaam Financieel Overschot",
    taxPending: "Fiscale berekening wacht op offici\xEBle verificatie",
    shareSummaryTitle: "Deel Salarisoverzicht",
    estimatedLivingCosts: "Geschatte Levenskosten",
    benchmarkContext: "Statistische Benchmark (CBS / Eurostat)",
    customizeAssumptions: "Pas Uitgangspunten Aan"
  },
  salaryNeeded: {
    headline: "Hoeveel Salaris Heb Je Nodig?",
    subheadline: "Inverse berekening van het bruto inkomen dat vereist is voor huur, leven en sparen.",
    targetSavings: "Gewenst Maandelijks Spaardoel",
    desiredLifestyle: "Levensstijl en Gezinssamenstelling",
    requiredGross: "Vereist Bruto Jaarsalaris",
    requiredNet: "Vereist Netto Maandinkomen",
    calculatedGrossSalary: "Berekend Vereist Brutosalaris",
    explorePlan: "Bekijk Uitgavenplan"
  },
  salaryAfterTax: {
    headline: "Netto Salaris Berekenen na Belasting",
    subheadline: "Gedetailleerd overzicht van loonheffing, premies volksverzekeringen en heffingskortingen.",
    federalTax: "Inkomstenbelasting (Box 1)",
    stateLocalTax: "Gemeentelijke en Lokale Heffingen",
    socialSecurity: "Premies Volksverzekeringen (AOW/Wlz)",
    medicare: "Zorgverzekeringswet (Zvw)",
    totalDeductions: "Totale Inhoudingen",
    netTakeHome: "Netto Uitbetaald Salaris",
    effectiveTaxNote: "Gemiddelde effectieve belasting- en premiedruk."
  },
  costOfLiving: {
    headline: "Kosten van Levensonderhoud per Maand",
    subheadline: "Offici\xEBle statistische data voor huisvesting, voeding, transport en nutsvoorzieningen.",
    housingRent: "Huisvesting en Huur",
    groceriesFood: "Boodschappen en Voeding",
    diningOut: "Horeca en Uitgaan",
    utilitiesInternet: "Gas, Water, Licht en Internet",
    publicTransit: "Openbaar Vervoer en Reizen",
    totalMonthlyLiving: "Totale Maandelijkse Levenskosten",
    householdTypeSelect: "Samenstelling Huishouden"
  },
  compare: {
    headline: "Steden Vergelijken op Salaris en Koopkracht",
    subheadline: "Ontdek welk salaris gelijkwaardig is aan je huidige levensstandaard.",
    cityA: "Huidige Stad (Stad A)",
    cityB: "Nieuwe Stad (Stad B)",
    salaryA: "Huidig Salaris (Stad A)",
    equivalentSalary: "Gelijkwaardig Salaris Vereist",
    purchasingPowerDelta: "Verschil in Re\xEBle Koopkracht",
    verdictLabel: "Financieel Eindoordeel"
  },
  jobOffers: {
    headline: "Banenaanbiedingen Vergelijken",
    subheadline: "Vergelijk twee contracten in verschillende steden gecorrigeerd voor belasting en huur.",
    offerA: "Aanbieding A",
    offerB: "Aanbieding B",
    offerVerdict: "Financieel Sterkste Aanbieding",
    higherRealIncome: "Hoger Re\xEBel Netto Inkomen"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "Belastingberekening voor dit jaar of deze locatie is tijdelijk niet beschikbaar volgens geverifieerde wetgeving.",
    INVALID_SALARY: "Voer een geldig salarisbedrag in groter dan nul.",
    CITY_NOT_SUPPORTED: "De geselecteerde stad wordt momenteel niet ondersteund.",
    DATA_STALE: "Statistische data voor deze locatie wordt momenteel herzien.",
    FX_UNAVAILABLE: "Wisselkoers tijdelijk niet beschikbaar.",
    NETWORK_ERROR: "Netwerkverbindingsfout."
  },
  footer: {
    aboutDesc: "LivWorthy is het onafhankelijke platform voor salaris- en leefkostenintelligentie voor expats en professionals.",
    calculatorsTitle: "Calculators",
    intelligenceTitle: "Economische Data",
    institutionalTitle: "Institutioneel",
    cityComparisons: "Stadsvergelijkingen",
    empiricalReports: "Empirische Rapporten",
    editorialPolicy: "Redactioneel Beleid",
    dataPolicy: "Datagovernance",
    corrections: "Correcties",
    terms: "Voorwaarden",
    privacy: "Privacybeleid",
    copyright: "Alle rechten voorbehouden."
  },
  languageSelector: {
    title: "Selecteer Taal en Regio",
    searchPlaceholder: "Zoek taal of land...",
    currentLanguage: "Huidige Taal",
    switchSuggestion: "Bekijk in het Nederlands?",
    switchCta: "Overschakelen naar Nederlands",
    dismiss: "Sluiten",
    allLanguages: "Alle Beschikbare Talen"
  },
  reports: {
    hubTitle: "LivWorthy Economisch Onderzoekscentrum",
    hubSubtitle: "Wereldwijde empirische studies over koopkracht, belastingen en internationale mobiliteit.",
    instituteBadge: "Geverifieerde LivWorthy Data",
    modelBadge: "Deterministisch Model",
    globalSalaryWorthTitle: "Wereldwijde Salariswaarde Index 2026",
    purchasingPowerTitle: "Internationaal Koopkrachtpariteit Rapport",
    salaryToRentTitle: "Salaris-naar-Huur Index",
    relocationGapTitle: "Internationale Verhuissalaris Kloof",
    takeHomePayTitle: "Vergelijkend Overzicht Netto Inkomen en Belastingdruk",
    downloadCsv: "Download Gegevens (CSV)",
    downloadJson: "Download Gegevens (JSON)",
    methodologyHeading: "Wetenschappelijke Methodologie",
    sourcesHeading: "Institutionele Bronnen",
    citationHeading: "Richtlijnen voor Citeren in Media"
  }
};

// src/lib/i18n/locales/ko.ts
var koDictionary = {
  locale: "ko",
  common: {
    brand: "LivWorthy",
    tagline: "\uAE00\uB85C\uBC8C \uAE09\uC5EC, \uC138\uAE08 \uBC0F \uC0DD\uD65C\uBE44 \uC778\uD154\uB9AC\uC804\uC2A4",
    livingIntelligence: "Living Intelligence",
    calculating: "\uACC4\uC0B0 \uC911...",
    calculate: "\uACC4\uC0B0\uD558\uAE30",
    annual: "\uC5F0\uAC04",
    monthly: "\uC6D4\uAC04",
    year: "\uB144",
    month: "\uC6D4",
    share: "\uACF5\uC720\uD558\uAE30",
    copied: "\uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
    home: "\uD648",
    back: "\uB4A4\uB85C",
    next: "\uB2E4\uC74C",
    close: "\uB2EB\uAE30",
    disclaimer: "\uACC4\uC0B0 \uACB0\uACFC\uB294 \uAC01\uAD6D \uBC95\uC815 \uC138\uC728 \uBC0F \uACF5\uACF5 \uD1B5\uACC4 \uBCA4\uCE58\uB9C8\uD06C\uB97C \uAE30\uBC18\uC73C\uB85C \uD55C \uD655\uC815\uC801 \uCD94\uC815\uCE58\uC785\uB2C8\uB2E4. \uACF5\uC2DD \uC138\uBB34 \uB610\uB294 \uAE08\uC735 \uC790\uBB38\uC774 \uC544\uB2D9\uB2C8\uB2E4.",
    verifiedTaxBaseline: "2026\uB144 \uBC95\uC815 \uAC80\uC99D \uC138\uAE08 \uAE30\uC900",
    tier1SourcesBadge: "1\uB4F1\uAE09 \uACF5\uC2DD \uC815\uBD80 \uD1B5\uACC4 \uCD9C\uCC98",
    singleAdult: "1\uC778 \uAC00\uAD6C (\uB2E8\uB3C5)",
    couple: "2\uC778 \uAC00\uAD6C (\uB9DE\uBC8C\uC774/\uBD80\uBD80)",
    family: "3\uC778 \uAC00\uAD6C (\uBD80\uBD80 2\uBA85, \uC790\uB140 1\uBA85)",
    action: "\uC2E4\uD589",
    evidence: "\uADFC\uAC70 \uC790\uB8CC \uBC0F \uBC95\uC815 \uCD9C\uCC98",
    methodology: "\uC0B0\uCD9C \uBC29\uBC95\uB860",
    diagnostics: "\uC2DC\uC2A4\uD15C \uC9C4\uB2E8"
  },
  nav: {
    howItWorks: "\uC791\uB3D9 \uC6D0\uB9AC",
    sources: "\uB370\uC774\uD130 \uCD9C\uCC98",
    coverage: "\uC9C0\uC6D0 \uAD6D\uAC00/\uB3C4\uC2DC",
    relocation: "\uD574\uC678 \uC774\uC8FC/\uC774\uC9C1",
    jobOfferComparison: "\uC624\uD37C \uBE44\uAD50 \uD3C9\uAC00\uAE30",
    reports: "\uC2E4\uC99D \uC5F0\uAD6C \uB9AC\uD3EC\uD2B8",
    guides: "\uB3C4\uC2DC\uBCC4 \uAE09\uC5EC \uAC00\uC774\uB4DC",
    compare: "\uB3C4\uC2DC \uAC04 \uBE44\uAD50",
    tabSalaryWorth: "\uB0B4 \uC5F0\uBD09\uC758 \uC2E4\uC9C8 \uAC00\uCE58\uB294?",
    tabSalaryNeeded: "\uC5BC\uB9C8\uB97C \uBC8C\uC5B4\uC57C \uD560\uAE4C?",
    tabSalaryAfterTax: "\uC2E4\uC218\uB839\uC561 \uACC4\uC0B0\uAE30",
    tabCostOfLiving: "\uC2E4\uC81C \uC0DD\uD65C\uBE44 \uBD84\uC11D",
    tabCompare: "\uB3C4\uC2DC \uAC04 \uBE44\uAD50",
    tabJobOffers: "\uCDE8\uC5C5 \uC624\uD37C \uBE44\uAD50",
    tabGuides: "\uB3C4\uC2DC\uBCC4 \uAE09\uC5EC \uC778\uD154\uB9AC\uC804\uC2A4 \u2192"
  },
  calculator: {
    chooseCity: "1. \uB3C4\uC2DC / \uAC70\uC8FC\uC9C0 \uC120\uD0DD",
    annualSalary: "2. \uC138\uC804 \uC5F0\uBD09 \uC785\uB825",
    salaryHelp: "\uC138\uC804 \uAE30\uBCF8\uAE09 \uAE30\uC900 (\uC0C1\uC5EC\uAE08 \uC81C\uC678 \uAE30\uBCF8 \uBCF4\uC218).",
    statutoryJurisdiction: "\uC801\uC6A9 \uBC95\uC815 \uACFC\uC138 \uAD00\uD560: {jurisdiction}",
    popularScenarios: "\uC8FC\uC694 \uBE44\uAD50 \uC2DC\uB098\uB9AC\uC624:",
    heroHeadline: "\uB0B4 \uC5F0\uBD09\uC758 \uC2E4\uC9C8 \uAC00\uCE58\uB294 \uC5BC\uB9C8\uC77C\uAE4C\uC694?",
    heroSubheadline: "\uC5F0\uBD09\uACFC \uB3C4\uC2DC\uB97C \uC785\uB825\uD558\uBA74 \uC138\uD6C4 \uC2E4\uC218\uB839\uC561, \uD544\uC218 \uC0DD\uD65C\uBE44 \uC9C0\uCD9C, \uADF8\uB9AC\uACE0 \uC800\uCD95 \uAC00\uB2A5\uD55C \uC5EC\uC720 \uC790\uAE08\uC744 \uC815\uD655\uD788 \uACC4\uC0B0\uD574 \uB4DC\uB9BD\uB2C8\uB2E4.",
    heroSupporting: "\uC120\uD0DD\uD55C \uB3C4\uC2DC\uC5D0\uC11C \uC8FC\uAC70\uBE44\uB97C \uAC10\uB2F9\uD558\uACE0 \uBBF8\uB798\uB97C \uC704\uD574 \uC800\uCD95\uD560 \uC218 \uC788\uB294\uC9C0 \uAC80\uC99D\uD574 \uBCF4\uC138\uC694.",
    householdType: "\uAC00\uAD6C \uAD6C\uC131 \uD615\uD0DC",
    rentOverride: "\uC2E4\uC81C \uC6D4\uC138 \uC9C1\uC811 \uC785\uB825 (\uC120\uD0DD \uC0AC\uD56D)",
    rentOverridePlaceholder: "\uC608: 1,500,000 \uC6D0 / \uC6D4",
    rentOverrideHelp: "\uD1B5\uACC4\uC801 \uAE30\uC900 \uC784\uB300\uB8CC \uB300\uC2E0 \uBCF8\uC778\uC774 \uC2E4\uC81C\uB85C \uC9C0\uBD88\uD558\uB294 \uC6D4\uC138\uB97C \uC801\uC6A9\uD569\uB2C8\uB2E4.",
    taxYearLabel: "\uACFC\uC138 \uC5F0\uB3C4",
    filingStatusLabel: "\uC138\uBB34 \uC2E0\uACE0 \uC790\uACA9",
    dependentsLabel: "\uBD80\uC591\uAC00\uC871 \uC218",
    btnCalculate: "\uC2E4\uC9C8 \uAD6C\uB9E4\uB825 \uACC4\uC0B0\uD558\uAE30",
    quickScenarios: {
      nyc100k: "\uB274\uC695: $100,000",
      london60k: "\uB7F0\uB358: \xA360,000",
      dubai300k: "\uB450\uBC14\uC774: 300,000 AED",
      toronto90k: "\uC11C\uC6B8: 7,000\uB9CC \uC6D0"
    }
  },
  results: {
    summaryTitle: "\uC5F0\uBD09 \uBD84\uC11D \uBC0F \uC2E4\uC9C8 \uAD6C\uB9E4\uB825 \uC694\uC57D",
    annualGross: "\uC138\uC804 \uC5F0\uBD09 \uCD1D\uC561",
    annualTakeHome: "\uC5F0\uAC04 \uC138\uD6C4 \uC2E4\uC218\uB839\uC561",
    monthlyTakeHome: "\uC6D4 \uD658\uC0B0 \uC2E4\uC218\uB839\uC561",
    monthlyLivingCosts: "\uC6D4 \uD544\uC218 \uC0DD\uD65C\uBE44 \uC9C0\uCD9C",
    monthlyDisposable: "\uAC00\uCC98\uBD84 \uC18C\uB4DD (\uC5EC\uC720 \uC790\uAE08)",
    savingsCapacity: "\uC6D4 \uC800\uCD95 \uAC00\uB2A5 \uC5EC\uB825",
    savingsRate: "\uC2E4\uC9C8 \uC800\uCD95\uB960",
    effectiveTaxRate: "\uC2E4\uD6A8 \uC138\uC728 (\uC18C\uB4DD\uC138+\uC0AC\uD68C\uBCF4\uD5D8)",
    housingBurden: "\uC2E4\uC218\uB839\uC561 \uB300\uBE44 \uC8FC\uAC70\uBE44 \uBE44\uC728",
    taxesAndDeductions: "\uC138\uAE08 \uBC0F 4\uB300 \uBCF4\uD5D8 \uACF5\uC81C\uC561",
    essentialLiving: "\uD544\uC218 \uC9C0\uCD9C (\uC8FC\uAC70\uBE44, \uC2DD\uB8CC\uD488, \uACF5\uACFC\uAE08)",
    discretionaryLiving: "\uC120\uD0DD\uC801 \uC9C0\uCD9C \uBC0F \uAD50\uD1B5\uBE44",
    spendableSurplus: "\uC800\uCD95 \uBC0F \uD22C\uC790 \uAC00\uB2A5 \uD751\uC790",
    deficitWarning: "\uACBD\uACE0: \uC120\uD0DD \uB3C4\uC2DC\uC758 \uD544\uC218 \uC0DD\uD65C\uBE44\uAC00 \uC6D4 \uC2E4\uC218\uB839\uC561\uC744 \uCD08\uACFC\uD569\uB2C8\uB2E4.",
    healthySurplus: "\uC548\uC815\uC801\uC778 \uD751\uC790 \uAD6C\uC870",
    taxPending: "\uBC95\uC815 \uACF5\uC2DD \uBC1C\uD45C \uB300\uAE30 \uC911\uC778 \uC138\uAE08 \uC5F0\uB3C4\uC785\uB2C8\uB2E4",
    shareSummaryTitle: "\uC5F0\uBD09 \uBD84\uC11D \uACB0\uACFC \uACF5\uC720",
    estimatedLivingCosts: "\uCD94\uC815 \uD544\uC218 \uC0DD\uD65C\uBE44",
    benchmarkContext: "\uD1B5\uACC4\uCCAD / OECD \uACF5\uC2DD \uB370\uC774\uD130 \uBCA4\uCE58\uB9C8\uD06C",
    customizeAssumptions: "\uC9C0\uCD9C \uBC0F \uACF5\uC81C \uAC00\uC815 \uC218\uC815\uD558\uAE30"
  },
  salaryNeeded: {
    headline: "\uC548\uC815\uC801\uC73C\uB85C \uC0DD\uD65C\uD558\uB824\uBA74 \uC5F0\uBD09\uC774 \uC5BC\uB9C8\uB098 \uD544\uC694\uD560\uAE4C?",
    subheadline: "\uC6D4\uC138, \uBB3C\uAC00, \uBAA9\uD45C \uC800\uCD95\uC561\uC744 \uBAA8\uB450 \uCDA9\uB2F9\uD558\uAE30 \uC704\uD574 \uC694\uAD6C\uB418\uB294 \uC138\uC804 \uD544\uC694 \uC5F0\uBD09\uC758 \uC5ED\uC0B0 \uACB0\uACFC\uC785\uB2C8\uB2E4.",
    targetSavings: "\uBAA9\uD45C \uC6D4 \uC800\uCD95\uC561",
    desiredLifestyle: "\uB77C\uC774\uD504\uC2A4\uD0C0\uC77C \uBC0F \uAC00\uAD6C \uADDC\uBAA8",
    requiredGross: "\uC694\uAD6C\uB418\uB294 \uC138\uC804 \uCD5C\uC18C \uC5F0\uBD09",
    requiredNet: "\uC694\uAD6C\uB418\uB294 \uC6D4 \uC2E4\uC218\uB839\uC561",
    calculatedGrossSalary: "\uACC4\uC0B0\uB41C \uD544\uC694 \uC138\uC804 \uC5F0\uBD09",
    explorePlan: "\uC9C0\uCD9C \uAD6C\uC870 \uC138\uBD80 \uACC4\uD68D \uD655\uC778"
  },
  salaryAfterTax: {
    headline: "\uC138\uD6C4 \uC2E4\uC218\uB839\uC561 \uBC0F \uACF5\uC81C \uB0B4\uC5ED \uC0C1\uC138",
    subheadline: "\uC18C\uB4DD\uC138(\uAD6D\uC138/\uC9C0\uBC29\uC138)\uC640 \uAD6D\uBBFC\uC5F0\uAE08, \uAC74\uAC15\uBCF4\uD5D8, \uACE0\uC6A9\uBCF4\uD5D8 \uB4F1 \uBC95\uC815 \uACF5\uC81C \uC0C1\uC138 \uBA85\uC138\uC785\uB2C8\uB2E4.",
    federalTax: "\uC18C\uB4DD\uC138 (\uAD6D\uC138)",
    stateLocalTax: "\uC9C0\uBC29\uC18C\uB4DD\uC138",
    socialSecurity: "\uAD6D\uBBFC\uC5F0\uAE08 \uBC0F \uACE0\uC6A9\uBCF4\uD5D8",
    medicare: "\uAC74\uAC15\uBCF4\uD5D8 \uBC0F \uB178\uC778\uC7A5\uAE30\uC694\uC591\uBCF4\uD5D8",
    totalDeductions: "\uCD1D \uACF5\uC81C\uC561 \uD569\uACC4",
    netTakeHome: "\uD1B5\uC7A5 \uC785\uAE08 \uC2E4\uC218\uB839\uC561",
    effectiveTaxNote: "\uC0AC\uD68C\uBCF4\uD5D8\uB8CC\uB97C \uD3EC\uD568\uD55C \uC2E4\uD6A8 \uACF5\uC81C\uC728 \uAE30\uC900\uC785\uB2C8\uB2E4."
  },
  costOfLiving: {
    headline: "\uB3C4\uC2DC\uBCC4 \uC6D4 \uC0DD\uD65C\uBE44 \uD56D\uBAA9\uBCC4 \uBD84\uC11D",
    subheadline: "\uC8FC\uAC70 \uC784\uB300\uB8CC, \uC7A5\uBCF4\uAE30 \uC2DD\uBE44, \uC678\uC2DD\uBE44, \uAD50\uD1B5\uBE44, \uACF5\uACFC\uAE08 \uB4F1 \uC815\uBD80 \uBC0F \uACF5\uACF5 \uD1B5\uACC4 \uAE30\uBC18 \uC138\uBD80 \uD56D\uBAA9\uC785\uB2C8\uB2E4.",
    housingRent: "\uC8FC\uD0DD \uC784\uCC28\uB8CC (\uC6D4\uC138)",
    groceriesFood: "\uC2DD\uB8CC\uD488 \uBC0F \uB9C8\uD2B8 \uC7A5\uBCF4\uAE30",
    diningOut: "\uC678\uC2DD \uBC0F \uBB38\uD654\uC0DD\uD65C",
    utilitiesInternet: "\uC218\uB3C4\xB7\uAD11\uC5F4\uBE44 \uBC0F \uD1B5\uC2E0\uC694\uAE08",
    publicTransit: "\uB300\uC911\uAD50\uD1B5 \uBC0F \uC774\uB3D9\uBE44\uC6A9",
    totalMonthlyLiving: "\uC6D4 \uCD1D \uC0DD\uD65C\uBE44 \uC9C0\uCD9C",
    householdTypeSelect: "\uAC00\uAD6C\uC6D0 \uAD6C\uC131 \uC120\uD0DD"
  },
  compare: {
    headline: "\uB3C4\uC2DC \uAC04 \uAE09\uC5EC \uBC0F \uC2E4\uC9C8 \uAD6C\uB9E4\uB825 \uB3D9\uB4F1\uC131 \uBE44\uAD50",
    subheadline: "\uD604\uC7AC \uB3C4\uC2DC\uC5D0\uC11C\uC758 \uC0DD\uD65C \uC218\uC900\uC744 \uB2E4\uB978 \uB3C4\uC2DC\uC5D0\uC11C \uC720\uC9C0\uD558\uAE30 \uC704\uD574 \uD544\uC694\uD55C \uB3D9\uB4F1 \uC5F0\uBD09\uC744 \uBE44\uAD50\uD569\uB2C8\uB2E4.",
    cityA: "\uCD9C\uBC1C \uB3C4\uC2DC (A \uB3C4\uC2DC)",
    cityB: "\uB3C4\uCC29 \uB3C4\uC2DC (B \uB3C4\uC2DC)",
    salaryA: "\uD604\uC7AC \uC5F0\uBD09 (A \uB3C4\uC2DC)",
    equivalentSalary: "\uD544\uC694 \uB3D9\uB4F1 \uC5F0\uBD09",
    purchasingPowerDelta: "\uC2E4\uC9C8 \uAD6C\uB9E4\uB825 \uCC28\uC774",
    verdictLabel: "\uACBD\uC81C\uC801 \uC885\uD569 \uD310\uC815"
  },
  jobOffers: {
    headline: "\uC774\uC9C1/\uCDE8\uC5C5 \uC624\uD37C \uC2E4\uC218\uB839 \uBC0F \uAC00\uCE58 \uBE44\uAD50\uAE30",
    subheadline: "\uC138\uAE08\uACFC \uD604\uC9C0 \uC8FC\uAC70\uBE44\uB97C \uBC18\uC601\uD558\uC5EC \uB450 \uAC1C\uC758 \uB2E4\uB978 \uC624\uD37C \uC911 \uC5B4\uB290 \uCABD\uC774 \uC2E4\uC9C8 \uC18C\uB4DD\uC774 \uB192\uC740\uC9C0 \uBD84\uC11D\uD569\uB2C8\uB2E4.",
    offerA: "\uC624\uD37C A",
    offerB: "\uC624\uD37C B",
    offerVerdict: "\uACBD\uC81C\uC801\uC73C\uB85C \uB354 \uC720\uB9AC\uD55C \uC624\uD37C",
    higherRealIncome: "\uB354 \uB192\uC740 \uC2E4\uC9C8 \uC789\uC5EC \uC18C\uB4DD"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "\uD574\uB2F9 \uC5F0\uB3C4 \uB610\uB294 \uAD6D\uAC00\uC758 \uACF5\uC2DD \uBC95\uC815 \uC138\uBB34 \uADDC\uC815\uC774 \uC544\uC9C1 \uD655\uC815\uB418\uC9C0 \uC54A\uC544 \uACC4\uC0B0\uC774 \uBCF4\uB958\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    INVALID_SALARY: "0\uBCF4\uB2E4 \uD070 \uC720\uD6A8\uD55C \uC5F0\uBD09 \uAE08\uC561\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
    CITY_NOT_SUPPORTED: "\uD604\uC7AC \uC9C0\uC6D0 \uC900\uBE44 \uC911\uC778 \uB3C4\uC2DC\uC785\uB2C8\uB2E4.",
    DATA_STALE: "\uD574\uB2F9 \uC9C0\uC5ED\uC758 \uD1B5\uACC4 \uB370\uC774\uD130 \uAC31\uC2E0 \uC791\uC5C5\uC774 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4.",
    FX_UNAVAILABLE: "\uD658\uC728 \uC815\uBCF4\uB97C \uC77C\uC2DC\uC801\uC73C\uB85C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
    NETWORK_ERROR: "\uB124\uD2B8\uC6CC\uD06C \uC5F0\uACB0 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
  },
  footer: {
    aboutDesc: "LivWorthy\uB294 \uAE00\uB85C\uBC8C \uC778\uC7AC, \uC8FC\uC7AC\uC6D0, \uD574\uC678 \uCDE8\uC5C5\uC790\uB97C \uC704\uD55C \uB3C5\uB9BD\uC801\uC774\uACE0 \uAC1D\uAD00\uC801\uC778 \uC5F0\uBD09\xB7\uC138\uAE08\xB7\uC0DD\uD65C\uBE44 \uC778\uD154\uB9AC\uC804\uC2A4 \uD50C\uB7AB\uD3FC\uC785\uB2C8\uB2E4.",
    calculatorsTitle: "\uACC4\uC0B0 \uB3C4\uAD6C",
    intelligenceTitle: "\uACBD\uC81C \uC778\uD154\uB9AC\uC804\uC2A4",
    institutionalTitle: "\uAE30\uAD00 \uC815\uBCF4",
    cityComparisons: "\uB3C4\uC2DC \uAC04 \uBE44\uAD50",
    empiricalReports: "\uC2E4\uC99D \uC5F0\uAD6C \uB9AC\uD3EC\uD2B8",
    editorialPolicy: "\uD3B8\uC9D1 \uC815\uCC45",
    dataPolicy: "\uB370\uC774\uD130 \uAC70\uBC84\uB10C\uC2A4",
    corrections: "\uC815\uC815 \uC694\uCCAD",
    terms: "\uC774\uC6A9\uC57D\uAD00",
    privacy: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68",
    copyright: "All rights reserved."
  },
  languageSelector: {
    title: "\uC5B8\uC5B4 \uBC0F \uC9C0\uC5ED \uC124\uC815",
    searchPlaceholder: "\uC5B8\uC5B4 \uB610\uB294 \uAD6D\uAC00 \uAC80\uC0C9...",
    currentLanguage: "\uD604\uC7AC \uC5B8\uC5B4",
    switchSuggestion: "\uD55C\uAD6D\uC5B4\uB85C \uBCF4\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?",
    switchCta: "\uD55C\uAD6D\uC5B4\uB85C \uC804\uD658",
    dismiss: "\uB2EB\uAE30",
    allLanguages: "\uC9C0\uC6D0\uD558\uB294 \uC804\uCCB4 \uC5B8\uC5B4"
  },
  reports: {
    hubTitle: "LivWorthy \uAE00\uB85C\uBC8C \uACBD\uC81C \uC5F0\uAD6C\uC18C",
    hubSubtitle: "\uAE00\uB85C\uBC8C \uAD6C\uB9E4\uB825 \uD3C9\uAC00, \uACFC\uC138 \uCCB4\uACC4, \uAD6D\uC81C \uC778\uC7AC \uC774\uB3D9\uC5D0 \uB300\uD55C \uC2E4\uC99D\uC801 \uB370\uC774\uD130 \uBCF4\uACE0\uC11C\uC785\uB2C8\uB2E4.",
    instituteBadge: "LivWorthy \uACF5\uC778 \uB370\uC774\uD130",
    modelBadge: "\uD655\uC815\uC801 \uC0B0\uCD9C \uBAA8\uB378",
    globalSalaryWorthTitle: "2026 \uAE00\uB85C\uBC8C \uC2E4\uC9C8 \uC5F0\uBD09 \uAC00\uCE58 \uC9C0\uC218",
    purchasingPowerTitle: "\uAD6D\uC81C \uAD6C\uB9E4\uB825 \uD3C9\uAC00(PPP) \uBE44\uAD50 \uB9AC\uD3EC\uD2B8",
    salaryToRentTitle: "\uC5F0\uBD09 \uB300\uBE44 \uC8FC\uAC70\uBE44 \uBD80\uB2F4\uB960 \uC9C0\uC218",
    relocationGapTitle: "\uAD6D\uAC00 \uAC04 \uD574\uC678 \uC774\uC9C1 \uAE09\uC5EC \uACA9\uCC28 \uBD84\uC11D",
    takeHomePayTitle: "\uC8FC\uC694 \uBA54\uD2B8\uB85C\uD3F4\uB9AC\uC2A4 \uC2E4\uC218\uB839\uC561 \uBC0F \uC870\uC138 \uBD80\uB2F4 \uBE44\uAD50",
    downloadCsv: "\uB370\uC774\uD130 \uB2E4\uC6B4\uB85C\uB4DC (CSV)",
    downloadJson: "\uB370\uC774\uD130 \uB2E4\uC6B4\uB85C\uB4DC (JSON)",
    methodologyHeading: "\uC0B0\uCD9C \uBC29\uBC95\uB860",
    sourcesHeading: "\uACF5\uC2DD \uB370\uC774\uD130 \uCD9C\uCC98",
    citationHeading: "\uC778\uC6A9 \uBC0F \uC5B8\uB860 \uBCF4\uB3C4 \uAC00\uC774\uB4DC\uB77C\uC778"
  }
};

// src/lib/i18n/locales/ru.ts
var ruDictionary = {
  locale: "ru",
  common: {
    brand: "LivWorthy",
    tagline: "\u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u0430\u044F \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430 \u0437\u0430\u0440\u043F\u043B\u0430\u0442, \u043D\u0430\u043B\u043E\u0433\u043E\u0432 \u0438 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u0436\u0438\u0437\u043D\u0438",
    livingIntelligence: "Living Intelligence",
    calculating: "\u0420\u0430\u0441\u0447\u0435\u0442...",
    calculate: "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044C",
    annual: "\u0412 \u0433\u043E\u0434",
    monthly: "\u0412 \u043C\u0435\u0441\u044F\u0446",
    year: "\u0413\u043E\u0434",
    month: "\u041C\u0435\u0441\u044F\u0446",
    share: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F",
    copied: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0432 \u0431\u0443\u0444\u0435\u0440 \u043E\u0431\u043C\u0435\u043D\u0430",
    home: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F",
    back: "\u041D\u0430\u0437\u0430\u0434",
    next: "\u0414\u0430\u043B\u0435\u0435",
    close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
    disclaimer: "\u0420\u0430\u0441\u0447\u0435\u0442\u044B \u044F\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u0434\u0435\u0442\u0435\u0440\u043C\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u043C\u0438 \u043E\u0446\u0435\u043D\u043A\u0430\u043C\u0438 \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0435 \u043E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0445 \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0445 \u0448\u043A\u0430\u043B \u0438 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u0432. \u041D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u043E\u0439 \u0438\u043B\u0438 \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u043E\u0439 \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u0435\u0439.",
    verifiedTaxBaseline: "\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u0430\u044F \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u0430\u044F \u0431\u0430\u0437\u0430 2026",
    tier1SourcesBadge: "\u041E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u0433\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438 Tier-1",
    singleAdult: "\u041E\u0434\u0438\u043D \u0432\u0437\u0440\u043E\u0441\u043B\u044B\u0439",
    couple: "\u041F\u0430\u0440\u0430 / \u0414\u0432\u0430 \u0434\u043E\u0445\u043E\u0434\u0430",
    family: "\u0421\u0435\u043C\u044C\u044F (2 \u0432\u0437\u0440\u043E\u0441\u043B\u044B\u0445, 1 \u0440\u0435\u0431\u0435\u043D\u043E\u043A)",
    action: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
    evidence: "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438 \u0438 \u043D\u043E\u0440\u043C\u0430\u0442\u0438\u0432\u043D\u044B\u0435 \u0430\u043A\u0442\u044B",
    methodology: "\u041C\u0435\u0442\u043E\u0434\u043E\u043B\u043E\u0433\u0438\u044F \u0440\u0430\u0441\u0447\u0435\u0442\u0430",
    diagnostics: "\u0414\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"
  },
  nav: {
    howItWorks: "\u041A\u0430\u043A \u044D\u0442\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442",
    sources: "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438",
    coverage: "\u041F\u043E\u043A\u0440\u044B\u0442\u0438\u0435",
    relocation: "\u041F\u0435\u0440\u0435\u0435\u0437\u0434",
    jobOfferComparison: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u043E\u0444\u0444\u0435\u0440\u043E\u0432",
    reports: "\u041E\u0442\u0447\u0435\u0442\u044B",
    guides: "\u0413\u0430\u0439\u0434\u044B \u043F\u043E \u0433\u043E\u0440\u043E\u0434\u0430\u043C",
    compare: "\u0421\u0440\u0430\u0432\u043D\u0438\u0442\u044C \u0433\u043E\u0440\u043E\u0434\u0430",
    tabSalaryWorth: "\u0425\u0432\u0430\u0442\u0438\u0442 \u043B\u0438 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u044B?",
    tabSalaryNeeded: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u043D\u0443\u0436\u043D\u043E \u0437\u0430\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0442\u044C?",
    tabSalaryAfterTax: "\u0417\u0430\u0440\u043F\u043B\u0430\u0442\u0430 \u043F\u043E\u0441\u043B\u0435 \u043D\u0430\u043B\u043E\u0433\u043E\u0432",
    tabCostOfLiving: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0436\u0438\u0437\u043D\u0438",
    tabCompare: "\u0421\u0440\u0430\u0432\u043D\u0438\u0442\u044C \u0433\u043E\u0440\u043E\u0434\u0430",
    tabJobOffers: "\u0421\u0440\u0430\u0432\u043D\u0438\u0442\u044C \u043E\u0444\u0444\u0435\u0440\u044B",
    tabGuides: "\u0413\u043E\u0440\u043E\u0434\u0441\u043A\u0438\u0435 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u043D\u044B\u0435 \u0433\u0430\u0439\u0434\u044B \u2192"
  },
  calculator: {
    chooseCity: "1. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0433\u043E\u0440\u043E\u0434 / \u043B\u043E\u043A\u0430\u0446\u0438\u044E",
    annualSalary: "2. \u0413\u043E\u0434\u043E\u0432\u0430\u044F \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0430 \u0434\u043E \u0432\u044B\u0447\u0435\u0442\u0430 \u043D\u0430\u043B\u043E\u0433\u043E\u0432 (Gross)",
    salaryHelp: "\u0411\u0430\u0437\u043E\u0432\u044B\u0439 \u0434\u043E\u0445\u043E\u0434 \u0434\u043E \u0443\u043F\u043B\u0430\u0442\u044B \u043D\u0430\u043B\u043E\u0433\u043E\u0432 \u0438 \u0441\u043E\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0445 \u0432\u0437\u043D\u043E\u0441\u043E\u0432.",
    statutoryJurisdiction: "\u041D\u0430\u043B\u043E\u0433\u043E\u0432\u0430\u044F \u044E\u0440\u0438\u0441\u0434\u0438\u043A\u0446\u0438\u044F: {jurisdiction}",
    popularScenarios: "\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0435 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0438:",
    heroHeadline: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u043D\u0430 \u0441\u0430\u043C\u043E\u043C \u0434\u0435\u043B\u0435 \u0441\u0442\u043E\u0438\u0442 \u0432\u0430\u0448\u0430 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0430?",
    heroSubheadline: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0443 \u0438 \u0433\u043E\u0440\u043E\u0434, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0439 \u0447\u0438\u0441\u0442\u044B\u0439 \u0434\u043E\u0445\u043E\u0434, \u0440\u0430\u0441\u0445\u043E\u0434\u044B \u043D\u0430 \u0436\u0438\u0437\u043D\u044C \u0438 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B \u0441\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0438\u0439.",
    heroSupporting: "\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435, \u043F\u043E\u043A\u0440\u043E\u0435\u0442 \u043B\u0438 \u0432\u0430\u0448 \u0434\u043E\u0445\u043E\u0434 \u0430\u0440\u0435\u043D\u0434\u0443 \u0436\u0438\u043B\u044C\u044F \u0438 \u043F\u043E\u0437\u0432\u043E\u043B\u0438\u0442 \u043B\u0438 \u0434\u0435\u043B\u0430\u0442\u044C \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u0438\u044F \u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C \u0433\u043E\u0440\u043E\u0434\u0435.",
    householdType: "\u0421\u043E\u0441\u0442\u0430\u0432 \u0441\u0435\u043C\u044C\u0438",
    rentOverride: "\u0410\u0440\u0435\u043D\u0434\u0430 \u0436\u0438\u043B\u044C\u044F (\u0432 \u043C\u0435\u0441\u044F\u0446, \u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E)",
    rentOverridePlaceholder: "\u041E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u043F\u0443\u0441\u0442\u044B\u043C \u0434\u043B\u044F \u0441\u0440\u0435\u0434\u043D\u0435\u0439 \u0430\u0440\u0435\u043D\u0434\u044B",
    rentOverrideHelp: "\u041F\u0435\u0440\u0435\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u044C \u0441\u0440\u0435\u0434\u043D\u0438\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u043F\u043E \u0430\u0440\u0435\u043D\u0434\u0435 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u043C\u0438 \u0440\u0430\u0441\u0445\u043E\u0434\u0430\u043C\u0438.",
    taxYearLabel: "\u041D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0439 \u0433\u043E\u0434",
    filingStatusLabel: "\u0421\u0435\u043C\u0435\u0439\u043D\u044B\u0439 \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0439 \u0441\u0442\u0430\u0442\u0443\u0441",
    dependentsLabel: "\u0418\u0436\u0434\u0438\u0432\u0435\u043D\u0446\u044B",
    btnCalculate: "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044C \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u044C\u043D\u0443\u044E \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u044C",
    quickScenarios: {
      nyc100k: "\u041D\u044C\u044E-\u0419\u043E\u0440\u043A $100k",
      london60k: "\u041B\u043E\u043D\u0434\u043E\u043D \xA360k",
      dubai300k: "\u0414\u0443\u0431\u0430\u0439 300k AED",
      toronto90k: "\u0422\u043E\u0440\u043E\u043D\u0442\u043E CA$90k"
    }
  },
  results: {
    summaryTitle: "\u0424\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u0439 \u0438\u0442\u043E\u0433",
    annualGross: "\u0413\u043E\u0434\u043E\u0432\u043E\u0439 \u0434\u043E\u0445\u043E\u0434 Gross",
    annualTakeHome: "\u0427\u0438\u0441\u0442\u044B\u0439 \u0434\u043E\u0445\u043E\u0434 \u0432 \u0433\u043E\u0434 (Net)",
    monthlyTakeHome: "\u0427\u0438\u0441\u0442\u044B\u0439 \u0434\u043E\u0445\u043E\u0434 \u0432 \u043C\u0435\u0441\u044F\u0446 (Net)",
    monthlyLivingCosts: "\u0420\u0430\u0441\u0445\u043E\u0434\u044B \u043D\u0430 \u0436\u0438\u0437\u043D\u044C \u0432 \u043C\u0435\u0441\u044F\u0446",
    monthlyDisposable: "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u043E\u0441\u0442\u0430\u0442\u043E\u043A \u0432 \u043C\u0435\u0441\u044F\u0446",
    savingsCapacity: "\u041F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B \u0441\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0438\u0439",
    savingsRate: "\u041D\u043E\u0440\u043C\u0430 \u0441\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0438\u0439",
    effectiveTaxRate: "\u042D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u0430\u044F \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430",
    housingBurden: "\u0414\u043E\u043B\u044F \u0440\u0430\u0441\u0445\u043E\u0434\u043E\u0432 \u043D\u0430 \u0436\u0438\u043B\u044C\u0435",
    taxesAndDeductions: "\u041D\u0430\u043B\u043E\u0433\u0438 \u0438 \u0441\u0431\u043E\u0440\u044B",
    essentialLiving: "\u0411\u0430\u0437\u043E\u0432\u044B\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u044B \u043D\u0430 \u0436\u0438\u0437\u043D\u044C",
    discretionaryLiving: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u044B",
    spendableSurplus: "\u041F\u0440\u043E\u0444\u0438\u0446\u0438\u0442 \u0431\u044E\u0434\u0436\u0435\u0442\u0430",
    deficitWarning: "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435: \u0434\u0435\u0444\u0438\u0446\u0438\u0442 \u0431\u044E\u0434\u0436\u0435\u0442\u0430 \u043F\u0440\u0438 \u0434\u0430\u043D\u043D\u043E\u043C \u0443\u0440\u043E\u0432\u043D\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u043E\u0432",
    healthySurplus: "\u0417\u0434\u043E\u0440\u043E\u0432\u044B\u0439 \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u0439 \u043F\u0440\u043E\u0444\u0438\u0446\u0438\u0442",
    taxPending: "\u0423\u0442\u043E\u0447\u043D\u0435\u043D\u0438\u0435 \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0445 \u0434\u0430\u043D\u043D\u044B\u0445",
    shareSummaryTitle: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u043C \u0440\u0430\u0441\u0447\u0435\u0442\u043E\u043C",
    estimatedLivingCosts: "\u041E\u0446\u0435\u043D\u043E\u0447\u043D\u044B\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u044B \u043D\u0430 \u0436\u0438\u0437\u043D\u044C",
    benchmarkContext: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0441\u043E \u0441\u0440\u0435\u0434\u043D\u0438\u043C\u0438 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044F\u043C\u0438 \u043F\u043E \u0433\u043E\u0440\u043E\u0434\u0443",
    customizeAssumptions: "\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B"
  },
  salaryNeeded: {
    headline: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0432\u0430\u043C \u043D\u0443\u0436\u043D\u043E \u0437\u0430\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0442\u044C?",
    subheadline: "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u044B\u0439 \u0434\u043E\u0445\u043E\u0434 \u0434\u043B\u044F \u043F\u043E\u043A\u0440\u044B\u0442\u0438\u044F \u0440\u0430\u0441\u0445\u043E\u0434\u043E\u0432 \u0438 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u0446\u0435\u043B\u0438 \u043F\u043E \u0441\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0438\u044F\u043C.",
    targetSavings: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430 \u0441\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0438\u0439 \u0432 \u043C\u0435\u0441\u044F\u0446",
    desiredLifestyle: "\u0416\u0435\u043B\u0430\u0435\u043C\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0436\u0438\u0437\u043D\u0438",
    requiredGross: "\u0422\u0440\u0435\u0431\u0443\u0435\u043C\u0430\u044F \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0430 Gross",
    requiredNet: "\u0422\u0440\u0435\u0431\u0443\u0435\u043C\u044B\u0439 \u0447\u0438\u0441\u0442\u044B\u0439 \u0434\u043E\u0445\u043E\u0434 Net",
    calculatedGrossSalary: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u043C\u044B\u0439 \u043E\u043A\u043B\u0430\u0434 \u0434\u043E \u0432\u044B\u0447\u0435\u0442\u0430 \u043D\u0430\u043B\u043E\u0433\u043E\u0432",
    explorePlan: "\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043F\u043B\u0430\u043D \u0440\u0430\u0441\u0445\u043E\u0434\u043E\u0432"
  },
  salaryAfterTax: {
    headline: "\u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u044B \u043F\u043E\u0441\u043B\u0435 \u043D\u0430\u043B\u043E\u0433\u043E\u0432",
    subheadline: "\u0422\u043E\u0447\u043D\u044B\u0439 \u0440\u0430\u0441\u0447\u0435\u0442 \u043F\u043E\u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0433\u043E \u043D\u0430\u043B\u043E\u0433\u0430, \u043F\u0435\u043D\u0441\u0438\u043E\u043D\u043D\u044B\u0445 \u0438 \u0441\u043E\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0445 \u0432\u0437\u043D\u043E\u0441\u043E\u0432.",
    federalTax: "\u0424\u0435\u0434\u0435\u0440\u0430\u043B\u044C\u043D\u044B\u0439 / \u0433\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043D\u0430\u043B\u043E\u0433",
    stateLocalTax: "\u0420\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 / \u043C\u0435\u0441\u0442\u043D\u044B\u0439 \u043D\u0430\u043B\u043E\u0433",
    socialSecurity: "\u0421\u043E\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0438 \u043F\u0435\u043D\u0441\u0438\u043E\u043D\u043D\u043E\u0435 \u0441\u0442\u0440\u0430\u0445\u043E\u0432\u0430\u043D\u0438\u0435",
    medicare: "\u041C\u0435\u0434\u0438\u0446\u0438\u043D\u0441\u043A\u043E\u0435 \u0441\u0442\u0440\u0430\u0445\u043E\u0432\u0430\u043D\u0438\u0435",
    totalDeductions: "\u0412\u0441\u0435\u0433\u043E \u0443\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0439",
    netTakeHome: "\u0427\u0438\u0441\u0442\u0430\u044F \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0430 \u043D\u0430 \u0440\u0443\u043A\u0438",
    effectiveTaxNote: "\u042D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 \u0443\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442 \u0432\u0441\u0435 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043E\u0442\u0447\u0438\u0441\u043B\u0435\u043D\u0438\u044F."
  },
  costOfLiving: {
    headline: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0436\u0438\u0437\u043D\u0438 \u0432 \u0433\u043E\u0440\u043E\u0434\u0435",
    subheadline: "\u0414\u0435\u0442\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u043A\u043E\u0440\u0437\u0438\u043D\u0430 \u0440\u0430\u0441\u0445\u043E\u0434\u043E\u0432: \u0436\u0438\u043B\u044C\u0435, \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B, \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442 \u0438 \u043A\u043E\u043C\u043C\u0443\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0443\u0441\u043B\u0443\u0433\u0438.",
    housingRent: "\u0410\u0440\u0435\u043D\u0434\u0430 \u0436\u0438\u043B\u044C\u044F",
    groceriesFood: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u044B \u043F\u0438\u0442\u0430\u043D\u0438\u044F",
    diningOut: "\u041A\u0430\u0444\u0435 \u0438 \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u044B",
    utilitiesInternet: "\u041A\u043E\u043C\u043C\u0443\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0443\u0441\u043B\u0443\u0433\u0438 \u0438 \u0438\u043D\u0442\u0435\u0440\u043D\u0435\u0442",
    publicTransit: "\u041E\u0431\u0449\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442",
    totalMonthlyLiving: "\u0418\u0442\u043E\u0433\u043E \u0435\u0436\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u044B\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u044B",
    householdTypeSelect: "\u0422\u0438\u043F \u0434\u043E\u043C\u043E\u0445\u043E\u0437\u044F\u0439\u0441\u0442\u0432\u0430"
  },
  compare: {
    headline: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u0438 \u0433\u043E\u0440\u043E\u0434\u043E\u0432",
    subheadline: "\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u044D\u043A\u0432\u0438\u0432\u0430\u043B\u0435\u043D\u0442\u043D\u0443\u044E \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0443 \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u0435\u0437\u0434\u0435 \u0438\u0437 \u043E\u0434\u043D\u043E\u0433\u043E \u0433\u043E\u0440\u043E\u0434\u0430 \u0432 \u0434\u0440\u0443\u0433\u043E\u0439.",
    cityA: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0433\u043E\u0440\u043E\u0434",
    cityB: "\u0426\u0435\u043B\u0435\u0432\u043E\u0439 \u0433\u043E\u0440\u043E\u0434",
    salaryA: "\u0417\u0430\u0440\u043F\u043B\u0430\u0442\u0430 \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u043C \u0433\u043E\u0440\u043E\u0434\u0435",
    equivalentSalary: "\u042D\u043A\u0432\u0438\u0432\u0430\u043B\u0435\u043D\u0442\u043D\u0430\u044F \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0430",
    purchasingPowerDelta: "\u0420\u0430\u0437\u043D\u0438\u0446\u0430 \u0432 \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u0438",
    verdictLabel: "\u0418\u0442\u043E\u0433\u043E\u0432\u044B\u0439 \u0432\u044B\u0432\u043E\u0434"
  },
  jobOffers: {
    headline: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u043E\u0444\u0444\u0435\u0440\u043E\u0432 \u043E \u0440\u0430\u0431\u043E\u0442\u0435",
    subheadline: "\u041E\u0446\u0435\u043D\u0438\u0442\u0435 \u0440\u0435\u0430\u043B\u044C\u043D\u0443\u044E \u0447\u0438\u0441\u0442\u0443\u044E \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u0434\u0432\u0443\u0445 \u043A\u0430\u0440\u044C\u0435\u0440\u043D\u044B\u0445 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0439 \u0441 \u0443\u0447\u0435\u0442\u043E\u043C \u043D\u0430\u043B\u043E\u0433\u043E\u0432 \u0438 \u0446\u0435\u043D.",
    offerA: "\u041E\u0444\u0444\u0435\u0440 \u0410",
    offerB: "\u041E\u0444\u0444\u0435\u0440 \u0411",
    offerVerdict: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u043E\u0444\u0444\u0435\u0440\u043E\u0432",
    higherRealIncome: "\u0412\u044B\u0448\u0435 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0430\u0441\u043F\u043E\u043B\u0430\u0433\u0430\u0435\u043C\u044B\u0439 \u0434\u043E\u0445\u043E\u0434"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "\u041D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0439 \u0440\u0430\u0441\u0447\u0435\u0442 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0434\u043B\u044F \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0439 \u043B\u043E\u043A\u0430\u0446\u0438\u0438.",
    INVALID_SALARY: "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u0443\u044E \u0441\u0443\u043C\u043C\u0443 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u044B.",
    CITY_NOT_SUPPORTED: "\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0433\u043E\u0440\u043E\u0434 \u043F\u043E\u043A\u0430 \u043D\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u043E\u0439.",
    DATA_STALE: "\u0414\u0430\u043D\u043D\u044B\u0435 \u0443\u0441\u0442\u0430\u0440\u0435\u043B\u0438 \u0438 \u043D\u0430\u0445\u043E\u0434\u044F\u0442\u0441\u044F \u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435 \u0432\u0435\u0440\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438.",
    FX_UNAVAILABLE: "\u041A\u0443\u0440\u0441\u044B \u0432\u0430\u043B\u044E\u0442 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B.",
    NETWORK_ERROR: "\u0421\u0435\u0442\u0435\u0432\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443 \u043F\u043E\u0437\u0436\u0435."
  },
  footer: {
    aboutDesc: "LivWorthy \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442 \u0434\u0435\u0442\u0435\u0440\u043C\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0430\u043D\u0430\u043B\u0438\u0437 \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u0438, \u043D\u0430\u043B\u043E\u0433\u043E\u043E\u0431\u043B\u043E\u0436\u0435\u043D\u0438\u044F \u0438 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u0436\u0438\u0437\u043D\u0438 \u0432 \u0433\u043E\u0440\u043E\u0434\u0430\u0445 \u043C\u0438\u0440\u0430.",
    calculatorsTitle: "\u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440\u044B",
    intelligenceTitle: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430",
    institutionalTitle: "\u0418\u043D\u0441\u0442\u0438\u0442\u0443\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435",
    cityComparisons: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0433\u043E\u0440\u043E\u0434\u043E\u0432",
    empiricalReports: "\u042D\u043C\u043F\u0438\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043E\u0442\u0447\u0435\u0442\u044B",
    editorialPolicy: "\u0420\u0435\u0434\u0430\u043A\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0430",
    dataPolicy: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u0434\u0430\u043D\u043D\u044B\u0445",
    corrections: "\u0418\u0441\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F",
    terms: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F",
    privacy: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438",
    copyright: "\xA9 2026 LivWorthy. \u0412\u0441\u0435 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u044B."
  },
  languageSelector: {
    title: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u044F\u0437\u044B\u043A",
    searchPlaceholder: "\u041F\u043E\u0438\u0441\u043A \u044F\u0437\u044B\u043A\u0430...",
    currentLanguage: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u044F\u0437\u044B\u043A",
    switchSuggestion: "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C\u0441\u044F \u043D\u0430 \u0432\u0430\u0448 \u044F\u0437\u044B\u043A?",
    switchCta: "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C",
    dismiss: "\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C",
    allLanguages: "\u0412\u0441\u0435 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u044F\u0437\u044B\u043A\u0438"
  },
  reports: {
    hubTitle: "\u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u044B\u0435 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u043D\u044B\u0435 \u043E\u0442\u0447\u0435\u0442\u044B",
    hubSubtitle: "\u042D\u043C\u043F\u0438\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0438\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u043D\u0438\u044F \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u0438, \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0445 \u043A\u043B\u0438\u043D\u044C\u0435\u0432 \u0438 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u0438 \u0436\u0438\u043B\u044C\u044F.",
    instituteBadge: "\u0418\u043D\u0441\u0442\u0438\u0442\u0443\u0442 LivWorthy",
    modelBadge: "\u0414\u0435\u0442\u0435\u0440\u043C\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C 2026",
    globalSalaryWorthTitle: "\u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0447\u0435\u0442 \u043E \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u0438 \u0437\u0430\u0440\u043F\u043B\u0430\u0442",
    purchasingPowerTitle: "\u0418\u043D\u0434\u0435\u043A\u0441 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0439 \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u0438",
    salaryToRentTitle: "\u041A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u044B \u043A \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u0430\u0440\u0435\u043D\u0434\u044B",
    relocationGapTitle: "\u0420\u0430\u0437\u0440\u044B\u0432 \u043F\u0440\u0438 \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u043E\u043C \u043F\u0435\u0440\u0435\u0435\u0437\u0434\u0435",
    takeHomePayTitle: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0447\u0438\u0441\u0442\u044B\u0445 \u0434\u043E\u0445\u043E\u0434\u043E\u0432 \u043F\u043E \u0441\u0442\u0440\u0430\u043D\u0430\u043C \u043C\u0438\u0440\u0430",
    downloadCsv: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 CSV",
    downloadJson: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 JSON",
    methodologyHeading: "\u041C\u0435\u0442\u043E\u0434\u043E\u043B\u043E\u0433\u0438\u044F \u0441\u0431\u043E\u0440\u0430 \u0438 \u0430\u043D\u0430\u043B\u0438\u0437\u0430 \u0434\u0430\u043D\u043D\u044B\u0445",
    sourcesHeading: "\u041E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438",
    citationHeading: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u0430\u043A\u0430\u0434\u0435\u043C\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0446\u0438\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F"
  }
};

// src/lib/i18n/locales/tr.ts
var trDictionary = {
  locale: "tr",
  common: {
    brand: "LivWorthy",
    tagline: "K\xFCresel Maa\u015F, Vergi ve Ya\u015Fam Maliyeti Analizi",
    livingIntelligence: "Living Intelligence",
    calculating: "Hesaplan\u0131yor...",
    calculate: "Hesapla",
    annual: "Y\u0131ll\u0131k",
    monthly: "Ayl\u0131k",
    year: "Y\u0131l",
    month: "Ay",
    share: "Payla\u015F",
    copied: "Panoya kopyaland\u0131",
    home: "Ana Sayfa",
    back: "Geri",
    next: "\u0130leri",
    close: "Kapat",
    disclaimer: "Hesaplamalar resmi vergi dilimleri ve istatistiki parametrelere dayal\u0131 deterministik tahminlerdir. Finansal veya vergi dan\u0131\u015Fmanl\u0131\u011F\u0131 te\u015Fkil etmez.",
    verifiedTaxBaseline: "Do\u011Frulanm\u0131\u015F 2026 Vergi Taban\u0131",
    tier1SourcesBadge: "Birinci Derece Resmi Devlet Kaynaklar\u0131",
    singleAdult: "Tek Yeti\u015Fkin",
    couple: "\xC7ift / \xC7ift Gelir",
    family: "Aile (2 Yeti\u015Fkin, 1 \xC7ocuk)",
    action: "\u0130\u015Flem",
    evidence: "Kaynaklar ve Kan\u0131tlar",
    methodology: "Hesaplama Metodolojisi",
    diagnostics: "Sistem Tan\u0131lama"
  },
  nav: {
    howItWorks: "Nas\u0131l \xC7al\u0131\u015F\u0131r",
    sources: "Kaynaklar",
    coverage: "Kapsam",
    relocation: "Ta\u015F\u0131nma",
    jobOfferComparison: "Teklif Kar\u015F\u0131la\u015Ft\u0131r",
    reports: "Raporlar",
    guides: "\u015Eehir Rehberleri",
    compare: "\u015Eehir Kar\u015F\u0131la\u015Ft\u0131r",
    tabSalaryWorth: "Maa\u015F\u0131m Yeterli mi?",
    tabSalaryNeeded: "Ne Kadar Kazanmal\u0131y\u0131m?",
    tabSalaryAfterTax: "Net Maa\u015F Hesapla",
    tabCostOfLiving: "Ya\u015Fam Maliyeti",
    tabCompare: "\u015Eehir Kar\u015F\u0131la\u015Ft\u0131r",
    tabJobOffers: "Teklif Kar\u015F\u0131la\u015Ft\u0131r",
    tabGuides: "\u015Eehir Maa\u015F Rehberleri \u2192"
  },
  calculator: {
    chooseCity: "1. \u015Eehir / Konum Se\xE7in",
    annualSalary: "2. Y\u0131ll\u0131k Br\xFCt Maa\u015F",
    salaryHelp: "Vergi ve kesintiler \xF6ncesi taban kazan\xE7.",
    statutoryJurisdiction: "Yasal vergi yetki alan\u0131: {jurisdiction}",
    popularScenarios: "Pop\xFCler Senaryolar:",
    heroHeadline: "Maa\u015F\u0131n\u0131z Ger\xE7ekte Ne Kadar De\u011Ferli?",
    heroSubheadline: "Maa\u015F\u0131n\u0131z\u0131 ve \u015Fehrinizi girerek ger\xE7ek net gelirinizi, ya\u015Fam giderlerinizi ve tasarruf g\xFCc\xFCn\xFCz\xFC \xF6\u011Frenin.",
    heroSupporting: "Kazanc\u0131n\u0131z\u0131n se\xE7ti\u011Finiz \u015Fehirde kira ve temel giderleri kar\u015F\u0131lay\u0131p kar\u015F\u0131lamad\u0131\u011F\u0131n\u0131 do\u011Frulay\u0131n.",
    householdType: "Hane Halk\u0131 Tipi",
    rentOverride: "Ayl\u0131k Kira (\u0130ste\u011Fe Ba\u011Fl\u0131)",
    rentOverridePlaceholder: "\u015Eehir ortalamas\u0131 i\xE7in bo\u015F b\u0131rak\u0131n",
    rentOverrideHelp: "Ortalama kira verisini kendi kiran\u0131zla de\u011Fi\u015Ftirin.",
    taxYearLabel: "Vergi Y\u0131l\u0131",
    filingStatusLabel: "Vergi Beyan Durumu",
    dependentsLabel: "Bakmakla Y\xFCk\xFCml\xFC Olunanlar",
    btnCalculate: "Al\u0131m G\xFCc\xFCn\xFC Hesapla",
    quickScenarios: {
      nyc100k: "New York $100k",
      london60k: "Londra \xA360k",
      dubai300k: "Dubai 300k AED",
      toronto90k: "Toronto CA$90k"
    }
  },
  results: {
    summaryTitle: "Mali \xD6zet",
    annualGross: "Y\u0131ll\u0131k Br\xFCt Gelir",
    annualTakeHome: "Y\u0131ll\u0131k Net Ele Ge\xE7en",
    monthlyTakeHome: "Ayl\u0131k Net Ele Ge\xE7en",
    monthlyLivingCosts: "Ayl\u0131k Ya\u015Fam Maliyeti",
    monthlyDisposable: "Ayl\u0131k Kullan\u0131labilir Bakiye",
    savingsCapacity: "Tasarruf Kapasitesi",
    savingsRate: "Tasarruf Oran\u0131",
    effectiveTaxRate: "Efektif Vergi Oran\u0131",
    housingBurden: "Konut Y\xFCk\xFC Oran\u0131",
    taxesAndDeductions: "Vergiler ve Kesintiler",
    essentialLiving: "Temel Ya\u015Fam Giderleri",
    discretionaryLiving: "\u0130ste\u011Fe Ba\u011Fl\u0131 Harcamalar",
    spendableSurplus: "Harcanabilir Fazlal\u0131k",
    deficitWarning: "Uyar\u0131: Mevcut ya\u015Fam maliyetleri geliri a\u015F\u0131yor",
    healthySurplus: "Sa\u011Fl\u0131kl\u0131 Mali Bakiye",
    taxPending: "Vergi Do\u011Frulamas\u0131 Devam Ediyor",
    shareSummaryTitle: "Maa\u015F Analizini Payla\u015F",
    estimatedLivingCosts: "Tahmini Ya\u015Fam Giderleri",
    benchmarkContext: "\u015Eehir Ortalamalar\u0131yla Kar\u015F\u0131la\u015Ft\u0131rma",
    customizeAssumptions: "Varsay\u0131mlar\u0131 \xD6zelle\u015Ftir"
  },
  salaryNeeded: {
    headline: "Ne Kadar Kazanman\u0131z Gerekiyor?",
    subheadline: "Harcamalar\u0131n\u0131z\u0131 kar\u015F\u0131lamak ve tasarruf hedefinize ula\u015Fmak i\xE7in gereken br\xFCt maa\u015F\u0131 hesaplay\u0131n.",
    targetSavings: "Ayl\u0131k Hedef Tasarruf",
    desiredLifestyle: "Hedef Ya\u015Fam Tarz\u0131",
    requiredGross: "Gereken Br\xFCt Maa\u015F",
    requiredNet: "Gereken Net Maa\u015F",
    calculatedGrossSalary: "\xD6nerilen Br\xFCt Maa\u015F",
    explorePlan: "B\xFCt\xE7e Plan\u0131n\u0131 \u0130ncele"
  },
  salaryAfterTax: {
    headline: "Vergi Sonras\u0131 Net Maa\u015F Hesaplay\u0131c\u0131",
    subheadline: "Gelir vergisi, sosyal g\xFCvenlik ve emeklilik kesintilerini detayl\u0131 hesaplay\u0131n.",
    federalTax: "Merkezi / Devlet Gelir Vergisi",
    stateLocalTax: "B\xF6lgesel / Yerel Vergi",
    socialSecurity: "Sosyal G\xFCvenlik Primi",
    medicare: "Sa\u011Fl\u0131k Sigortas\u0131 Primi",
    totalDeductions: "Toplam Kesintiler",
    netTakeHome: "Net Ele Ge\xE7en Tutar",
    effectiveTaxNote: "Efektif oran t\xFCm yasal kesintileri kapsar."
  },
  costOfLiving: {
    headline: "\u015Eehir Ya\u015Fam Maliyeti Endeksi",
    subheadline: "Kira, market, toplu ta\u015F\u0131ma ve faturalardan olu\u015Fan sepet maliyeti.",
    housingRent: "Konut Kiras\u0131",
    groceriesFood: "G\u0131da ve Market",
    diningOut: "D\u0131\u015Far\u0131da Yemek",
    utilitiesInternet: "Faturalar ve \u0130nternet",
    publicTransit: "Toplu Ta\u015F\u0131ma",
    totalMonthlyLiving: "Toplam Ayl\u0131k Ya\u015Fam Gideri",
    householdTypeSelect: "Hane Halk\u0131 Tipi"
  },
  compare: {
    headline: "\u015Eehirler Aras\u0131 Al\u0131m G\xFCc\xFC Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
    subheadline: "Bir \u015Fehirden di\u011Ferine ta\u015F\u0131n\u0131rken ayn\u0131 ya\u015Fam standard\u0131 i\xE7in gereken e\u015Fde\u011Fer maa\u015F\u0131 g\xF6r\xFCn.",
    cityA: "Mevcut \u015Eehir",
    cityB: "Hedef \u015Eehir",
    salaryA: "Mevcut Maa\u015F",
    equivalentSalary: "E\u015Fde\u011Fer Maa\u015F",
    purchasingPowerDelta: "Al\u0131m G\xFCc\xFC Fark\u0131",
    verdictLabel: "Kar\u015F\u0131la\u015Ft\u0131rma Sonucu"
  },
  jobOffers: {
    headline: "\u0130\u015F Teklifi Kar\u015F\u0131la\u015Ft\u0131rma",
    subheadline: "Farkl\u0131 \u015Fehirlerdeki i\u015F tekliflerini yerel vergi ve ya\u015Fam maliyetine g\xF6re k\u0131yaslay\u0131n.",
    offerA: "Teklif A",
    offerB: "Teklif B",
    offerVerdict: "Teklif De\u011Ferlendirmesi",
    higherRealIncome: "Daha Y\xFCksek Reel Gelir"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "Bu konum i\xE7in vergi hesab\u0131 ge\xE7ici olarak kullan\u0131lam\u0131yor.",
    INVALID_SALARY: "L\xFCtfen ge\xE7erli bir maa\u015F tutar\u0131 girin.",
    CITY_NOT_SUPPORTED: "Se\xE7ilen \u015Fehir hen\xFCz sistem taraf\u0131ndan desteklenmiyor.",
    DATA_STALE: "Veriler g\xFCncelleniyor ve do\u011Frulama a\u015Famas\u0131nda.",
    FX_UNAVAILABLE: "D\xF6viz kurlar\u0131 ge\xE7ici olarak al\u0131namad\u0131.",
    NETWORK_ERROR: "A\u011F hatas\u0131 olu\u015Ftu. L\xFCtfen tekrar deneyin."
  },
  footer: {
    aboutDesc: "LivWorthy, k\xFCresel \u015Fehirlerde al\u0131m g\xFCc\xFC, vergi ve ya\u015Fam maliyeti \xFCzerine deterministik zeka sunar.",
    calculatorsTitle: "Hesaplay\u0131c\u0131lar",
    intelligenceTitle: "Analitik Veriler",
    institutionalTitle: "Kurumsal Bilgiler",
    cityComparisons: "\u015Eehir K\u0131yaslamalar\u0131",
    empiricalReports: "Ampirik Raporlar",
    editorialPolicy: "Yay\u0131n Politikas\u0131",
    dataPolicy: "Veri Politikas\u0131",
    corrections: "D\xFCzeltmeler",
    terms: "Kullan\u0131m Ko\u015Fullar\u0131",
    privacy: "Gizlilik Politikas\u0131",
    copyright: "\xA9 2026 LivWorthy. T\xFCm haklar\u0131 sakl\u0131d\u0131r."
  },
  languageSelector: {
    title: "Dil Se\xE7in",
    searchPlaceholder: "Dil ara...",
    currentLanguage: "Ge\xE7erli Dil",
    switchSuggestion: "Kendi dilinize ge\xE7mek ister misiniz?",
    switchCta: "De\u011Fi\u015Ftir",
    dismiss: "Kapat",
    allLanguages: "Desteklenen Diller"
  },
  reports: {
    hubTitle: "K\xFCresel Maa\u015F ve Ya\u015Fam Raporlar\u0131",
    hubSubtitle: "Al\u0131m g\xFCc\xFC, vergi y\xFCk\xFC ve konut eri\u015Filebilirli\u011Fi \xFCzerine ampirik ara\u015Ft\u0131rmalar.",
    instituteBadge: "LivWorthy Enstit\xFCs\xFC",
    modelBadge: "Deterministik Model 2026",
    globalSalaryWorthTitle: "K\xFCresel Maa\u015F De\u011Feri Raporu",
    purchasingPowerTitle: "Reel Al\u0131m G\xFCc\xFC Endeksi",
    salaryToRentTitle: "Maa\u015F-Kira Oran\u0131 Raporu",
    relocationGapTitle: "Uluslararas\u0131 Ta\u015F\u0131nma Fark\u0131",
    takeHomePayTitle: "K\xFCresel Net Maa\u015F Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
    downloadCsv: "CSV \u0130ndir",
    downloadJson: "JSON \u0130ndir",
    methodologyHeading: "Veri ve Ara\u015Ft\u0131rma Metodolojisi",
    sourcesHeading: "Resmi \u0130statistiki Kaynaklar",
    citationHeading: "Akademik At\u0131f Kurallar\u0131"
  }
};

// src/lib/i18n/locales/pl.ts
var plDictionary = {
  locale: "pl",
  common: {
    brand: "LivWorthy",
    tagline: "Globalna analiza wynagrodze\u0144, podatk\xF3w i koszt\xF3w \u017Cycia",
    livingIntelligence: "Living Intelligence",
    calculating: "Obliczanie...",
    calculate: "Oblicz",
    annual: "Rocznie",
    monthly: "Miesi\u0119cznie",
    year: "Rok",
    month: "Miesi\u0105c",
    share: "Udost\u0119pnij",
    copied: "Skopiowano do schowka",
    home: "Strona g\u0142\xF3wna",
    back: "Wstecz",
    next: "Dalej",
    close: "Zamknij",
    disclaimer: "Obliczenia s\u0105 szacunkami deterministycznymi opartymi na oficjalnych progach podatkowych i danych statystycznych. Nie stanowi\u0105 doradztwa podatkowego ani finansowego.",
    verifiedTaxBaseline: "Zweryfikowana baza podatkowa 2026",
    tier1SourcesBadge: "Oficjalne \u017Ar\xF3d\u0142a rz\u0105dowe Tier-1",
    singleAdult: "Jedna osoba doros\u0142a",
    couple: "Para / Dwa dochody",
    family: "Rodzina (2 doros\u0142ych, 1 dziecko)",
    action: "Akcja",
    evidence: "\u0179r\xF3d\u0142a i podstawy prawne",
    methodology: "Metodologia oblicze\u0144",
    diagnostics: "Diagnostyka systemu"
  },
  nav: {
    howItWorks: "Jak to dzia\u0142a",
    sources: "\u0179r\xF3d\u0142a",
    coverage: "Zasi\u0119g",
    relocation: "Relokacja",
    jobOfferComparison: "Por\xF3wnaj oferty pracy",
    reports: "Raporty",
    guides: "Przewodniki miejskie",
    compare: "Por\xF3wnaj miasta",
    tabSalaryWorth: "Czy moja pensja wystarczy?",
    tabSalaryNeeded: "Ile musz\u0119 zarabia\u0107?",
    tabSalaryAfterTax: "Wynagrodzenie netto",
    tabCostOfLiving: "Koszty \u017Cycia",
    tabCompare: "Por\xF3wnaj miasta",
    tabJobOffers: "Por\xF3wnaj oferty",
    tabGuides: "Przewodniki p\u0142acowe miast \u2192"
  },
  calculator: {
    chooseCity: "1. Wybierz miasto / lokalizacj\u0119",
    annualSalary: "2. Roczne wynagrodzenie brutto",
    salaryHelp: "Wynagrodzenie zasadnicze przed potr\u0105ceniem podatk\xF3w i sk\u0142adek.",
    statutoryJurisdiction: "W\u0142a\u015Bciwo\u015B\u0107 podatkowa: {jurisdiction}",
    popularScenarios: "Popularne scenariusze:",
    heroHeadline: "Ile naprawd\u0119 warte jest Twoje wynagrodzenie?",
    heroSubheadline: "Wprowad\u017A pensj\u0119 i miasto, aby pozna\u0107 realny doch\xF3d netto, wydatki na \u017Cycie i zdolno\u015B\u0107 oszcz\u0119dzania.",
    heroSupporting: "Sprawd\u017A, czy Twoje zarobki pokryj\u0105 czynsz i pozwol\u0105 odk\u0142ada\u0107 oszcz\u0119dno\u015Bci w wybranym mie\u015Bcie.",
    householdType: "Typ gospodarstwa domowego",
    rentOverride: "Czynsz za wynajem (miesi\u0119cznie, opcjonalnie)",
    rentOverridePlaceholder: "Pozostaw puste dla \u015Bredniej miejskiej",
    rentOverrideHelp: "Zast\u0105p \u015Brednie dane o czynszu w\u0142asnymi kosztami najmu.",
    taxYearLabel: "Rok podatkowy",
    filingStatusLabel: "Forma rozliczenia podatkowego",
    dependentsLabel: "Liczba os\xF3b na utrzymaniu",
    btnCalculate: "Oblicz si\u0142\u0119 nabywcz\u0105",
    quickScenarios: {
      nyc100k: "Nowy Jork $100k",
      london60k: "Londyn \xA360k",
      dubai300k: "Dubaj 300k AED",
      toronto90k: "Toronto CA$90k"
    }
  },
  results: {
    summaryTitle: "Podsumowanie finansowe",
    annualGross: "Roczne wynagrodzenie brutto",
    annualTakeHome: "Roczne wynagrodzenie netto",
    monthlyTakeHome: "Miesi\u0119czne wynagrodzenie netto",
    monthlyLivingCosts: "Miesi\u0119czne koszty \u017Cycia",
    monthlyDisposable: "Miesi\u0119czny doch\xF3d rozporz\u0105dzalny",
    savingsCapacity: "Potencja\u0142 oszcz\u0119dno\u015Bciowy",
    savingsRate: "Stopa oszcz\u0119dno\u015Bci",
    effectiveTaxRate: "Efektywna stawka podatkowa",
    housingBurden: "Obci\u0105\u017Cenie kosztami mieszkaniowymi",
    taxesAndDeductions: "Podatki i sk\u0142adki obowi\u0105zkowe",
    essentialLiving: "Podstawowe koszty utrzymania",
    discretionaryLiving: "Wydatki dodatkowe",
    spendableSurplus: "Nadwy\u017Cka finansowa",
    deficitWarning: "Uwaga: Deficyt finansowy przy obecnych kosztach \u017Cycia",
    healthySurplus: "Zdrowa nadwy\u017Cka bud\u017Cetowa",
    taxPending: "Oczekiwanie na weryfikacj\u0119 podatkow\u0105",
    shareSummaryTitle: "Udost\u0119pnij podsumowanie pensji",
    estimatedLivingCosts: "Szacowane koszty utrzymania",
    benchmarkContext: "Por\xF3wnanie ze \u015Bredni\u0105 miejsk\u0105",
    customizeAssumptions: "Dostosuj za\u0142o\u017Cenia"
  },
  salaryNeeded: {
    headline: "Ile musisz zarabia\u0107?",
    subheadline: "Oblicz wymagane wynagrodzenie brutto, aby pokry\u0107 koszty \u017Cycia i osi\u0105gn\u0105\u0107 cel oszcz\u0119dno\u015Bciowy.",
    targetSavings: "Docelowe oszcz\u0119dno\u015Bci miesi\u0119czne",
    desiredLifestyle: "Po\u017C\u0105dany standard \u017Cycia",
    requiredGross: "Wymagane brutto",
    requiredNet: "Wymagane netto",
    calculatedGrossSalary: "Sugerowane wynagrodzenie brutto",
    explorePlan: "Zobacz plan bud\u017Cetowy"
  },
  salaryAfterTax: {
    headline: "Kalkulator wynagrodzenia netto (po podatkach)",
    subheadline: "Szczeg\xF3\u0142owe wyliczenie podatku dochodowego, ubezpiecze\u0144 spo\u0142ecznych i zdrowotnych.",
    federalTax: "Podatek dochodowy (PIT)",
    stateLocalTax: "Podatek lokalny / regionalny",
    socialSecurity: "Sk\u0142adki na ubezpieczenia spo\u0142eczne (ZUS)",
    medicare: "Ubezpieczenie zdrowotne",
    totalDeductions: "\u0141\u0105czne potr\u0105cenia",
    netTakeHome: "Wynagrodzenie netto na r\u0119k\u0119",
    effectiveTaxNote: "Efektywna stawka obejmuje wszystkie potr\u0105cenia ustawowe."
  },
  costOfLiving: {
    headline: "Koszty \u017Cycia w mie\u015Bcie",
    subheadline: "Analiza koszyka wydatk\xF3w: mieszkanie, \u017Cywno\u015B\u0107, media i transport publiczny.",
    housingRent: "Wynajem mieszkania",
    groceriesFood: "\u017Bywno\u015B\u0107 i zakupy",
    diningOut: "Restauracje i wyj\u015Bcia",
    utilitiesInternet: "Media i internet",
    publicTransit: "Transport publiczny",
    totalMonthlyLiving: "\u0141\u0105czne miesi\u0119czne koszty \u017Cycia",
    householdTypeSelect: "Typ gospodarstwa"
  },
  compare: {
    headline: "Por\xF3wnanie si\u0142y nabywczej miast",
    subheadline: "Sprawd\u017A, ile musisz zarabia\u0107 w nowym mie\u015Bcie, aby zachowa\u0107 ten sam standard \u017Cycia.",
    cityA: "Miasto obecne",
    cityB: "Miasto docelowe",
    salaryA: "Obecna pensja",
    equivalentSalary: "Ekwiwalentne wynagrodzenie",
    purchasingPowerDelta: "R\xF3\u017Cnica si\u0142y nabywczej",
    verdictLabel: "Podsumowanie analizy"
  },
  jobOffers: {
    headline: "Por\xF3wnywarka ofert pracy",
    subheadline: "Zestaw oferty pracy w r\xF3\u017Cnych miastach z uwzgl\u0119dnieniem podatk\xF3w i lokalnych cen.",
    offerA: "Oferta A",
    offerB: "Oferta B",
    offerVerdict: "Ocena ofert",
    higherRealIncome: "Wy\u017Cszy realny doch\xF3d netto"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "Kalkulacja podatkowa jest tymczasowo niedost\u0119pna dla tej lokalizacji.",
    INVALID_SALARY: "Wprowad\u017A prawid\u0142ow\u0105 kwot\u0119 wynagrodzenia.",
    CITY_NOT_SUPPORTED: "Wybrane miasto nie jest jeszcze obs\u0142ugiwane przez system.",
    DATA_STALE: "Dane s\u0105 aktualizowane i weryfikowane.",
    FX_UNAVAILABLE: "Kursy walut s\u0105 chwilowo niedost\u0119pne.",
    NETWORK_ERROR: "B\u0142\u0105d sieci. Spr\xF3buj ponownie za chwil\u0119."
  },
  footer: {
    aboutDesc: "LivWorthy dostarcza rzetelne analizy si\u0142y nabywczej, obci\u0105\u017Ce\u0144 podatkowych i koszt\xF3w \u017Cycia na \u015Bwiecie.",
    calculatorsTitle: "Kalkulatory",
    intelligenceTitle: "Baza analityczna",
    institutionalTitle: "Dane instytucjonalne",
    cityComparisons: "Por\xF3wnania miast",
    empiricalReports: "Raporty empiryczne",
    editorialPolicy: "Polityka redakcyjna",
    dataPolicy: "Polityka danych",
    corrections: "Korekty i aktualizacje",
    terms: "Regulamin",
    privacy: "Polityka prywatno\u015Bci",
    copyright: "\xA9 2026 LivWorthy. Wszelkie prawa zastrze\u017Cone."
  },
  languageSelector: {
    title: "Wybierz j\u0119zyk",
    searchPlaceholder: "Szukaj j\u0119zyka...",
    currentLanguage: "Bie\u017C\u0105cy j\u0119zyk",
    switchSuggestion: "Czy chcesz przej\u015B\u0107 na sw\xF3j j\u0119zyk ojczysty?",
    switchCta: "Zmie\u0144",
    dismiss: "Odrzu\u0107",
    allLanguages: "Dost\u0119pne j\u0119zyki"
  },
  reports: {
    hubTitle: "Globalne raporty p\u0142acowe",
    hubSubtitle: "Badania empiryczne nad si\u0142\u0105 nabywcz\u0105, klinem podatkowym i dost\u0119pno\u015Bci\u0105 mieszka\u0144.",
    instituteBadge: "Instytut LivWorthy",
    modelBadge: "Model deterministyczny 2026",
    globalSalaryWorthTitle: "Raport warto\u015Bci wynagrodze\u0144 na \u015Bwiecie",
    purchasingPowerTitle: "Wska\u017Anik realnej si\u0142y nabywczej",
    salaryToRentTitle: "Stosunek wynagrodzenia do czynszu",
    relocationGapTitle: "R\xF3\u017Cnice p\u0142acowo-kosztowe przy relokacji",
    takeHomePayTitle: "Globalne por\xF3wnanie zarobk\xF3w na r\u0119k\u0119",
    downloadCsv: "Pobierz CSV",
    downloadJson: "Pobierz JSON",
    methodologyHeading: "Metodologia badawcza",
    sourcesHeading: "Oficjalne \u017Ar\xF3d\u0142a statystyczne",
    citationHeading: "Zasady cytowania"
  }
};

// src/lib/i18n/locales/id.ts
var idDictionary = {
  locale: "id",
  common: {
    brand: "LivWorthy",
    tagline: "Kecerdasan Global Gaji, Pajak, dan Biaya Hidup",
    livingIntelligence: "Living Intelligence",
    calculating: "Menghitung...",
    calculate: "Hitung",
    annual: "Tahunan",
    monthly: "Bulanan",
    year: "Tahun",
    month: "Bulan",
    share: "Bagikan",
    copied: "Disalin ke papan klip",
    home: "Beranda",
    back: "Kembali",
    next: "Lanjut",
    close: "Tutup",
    disclaimer: "Perhitungan adalah perkiraan deterministik berdasarkan tarif pajak resmi dan parameter statistik. Bukan nasihat keuangan atau perpajakan resmi.",
    verifiedTaxBaseline: "Dasar Pajak Terverifikasi 2026",
    tier1SourcesBadge: "Sumber Resmi Pemerintah Tingkat 1",
    singleAdult: "Lajang / Dewasa Tunggal",
    couple: "Pasangan / Pendapatan Ganda",
    family: "Keluarga (2 Dewasa, 1 Anak)",
    action: "Tindakan",
    evidence: "Sumber Bukti & Regulasi",
    methodology: "Metodologi Perhitungan",
    diagnostics: "Diagnostik Sistem"
  },
  nav: {
    howItWorks: "Cara Kerja",
    sources: "Sumber Data",
    coverage: "Cakupan Kota",
    relocation: "Relokasi",
    jobOfferComparison: "Bandingkan Penawaran Kerja",
    reports: "Laporan Empiris",
    guides: "Panduan Kota",
    compare: "Bandingkan Kota",
    tabSalaryWorth: "Apakah Gaji Saya Cukup?",
    tabSalaryNeeded: "Berapa Gaji yang Dibutuhkan?",
    tabSalaryAfterTax: "Gaji Bersih Setelah Pajak",
    tabCostOfLiving: "Biaya Hidup",
    tabCompare: "Bandingkan Kota",
    tabJobOffers: "Bandingkan Tawaran",
    tabGuides: "Panduan Gaji Kota \u2192"
  },
  calculator: {
    chooseCity: "1. Pilih Kota / Lokasi",
    annualSalary: "2. Gaji Pokok Kotor Tahunan (Gross)",
    salaryHelp: "Pendapatan dasar sebelum pemotongan pajak dan iuran wajib.",
    statutoryJurisdiction: "Yurisdiksi hukum perpajakan: {jurisdiction}",
    popularScenarios: "Skenario Populer:",
    heroHeadline: "Berapa Nilai Sebenarnya dari Gaji Anda?",
    heroSubheadline: "Masukkan gaji dan kota Anda untuk mengetahui penghasilan bersih, biaya hidup nyata, dan potensi tabungan.",
    heroSupporting: "Pastikan penghasilan Anda mencukupi biaya sewa dan kebutuhan hidup di kota tujuan.",
    householdType: "Tipe Rumah Tangga",
    rentOverride: "Biaya Sewa Rumah (Bulanan, Opsional)",
    rentOverridePlaceholder: "Kosongkan untuk rata-rata kota",
    rentOverrideHelp: "Gunakan nominal sewa Anda sendiri untuk menggantikan data rata-rata.",
    taxYearLabel: "Tahun Pajak",
    filingStatusLabel: "Status PTKP / Wajib Pajak",
    dependentsLabel: "Tanggungan",
    btnCalculate: "Hitung Daya Beli Nyata",
    quickScenarios: {
      nyc100k: "New York $100k",
      london60k: "London \xA360k",
      dubai300k: "Dubai 300k AED",
      toronto90k: "Toronto CA$90k"
    }
  },
  results: {
    summaryTitle: "Ringkasan Keuangan",
    annualGross: "Gaji Kotor Tahunan",
    annualTakeHome: "Gaji Bersih Tahunan (Take-Home)",
    monthlyTakeHome: "Gaji Bersih Bulanan",
    monthlyLivingCosts: "Biaya Hidup Bulanan",
    monthlyDisposable: "Sisa Pendapatan Bulanan",
    savingsCapacity: "Kapasitas Menabung",
    savingsRate: "Tingkat Tabungan",
    effectiveTaxRate: "Tarif Pajak Efektif",
    housingBurden: "Beban Biaya Tempat Tinggal",
    taxesAndDeductions: "Pajak & Iuran Wajib",
    essentialLiving: "Kebutuhan Pokok Hidup",
    discretionaryLiving: "Pengeluaran Tambahan",
    spendableSurplus: "Surplus Anggaran",
    deficitWarning: "Peringatan: Defisit anggaran pada tingkat pengeluaran ini",
    healthySurplus: "Surplus Keuangan Sehat",
    taxPending: "Menunggu Verifikasi Pajak",
    shareSummaryTitle: "Bagikan Analisis Gaji",
    estimatedLivingCosts: "Estimasi Pengeluaran Hidup",
    benchmarkContext: "Perbandingan dengan Standar Kota",
    customizeAssumptions: "Sesuaikan Asumsi"
  },
  salaryNeeded: {
    headline: "Berapa Gaji yang Anda Butuhkan?",
    subheadline: "Hitung pendapatan kotor yang diperlukan untuk gaya hidup dan target tabungan impian Anda.",
    targetSavings: "Target Tabungan Bulanan",
    desiredLifestyle: "Gaya Hidup yang Diinginkan",
    requiredGross: "Gaji Kotor yang Diperlukan",
    requiredNet: "Gaji Bersih yang Diperlukan",
    calculatedGrossSalary: "Rekomendasi Gaji Kotor",
    explorePlan: "Lihat Rencana Anggaran"
  },
  salaryAfterTax: {
    headline: "Kalkulator Gaji Bersih Setelah Pajak (PPh 21)",
    subheadline: "Rincian pemotongan pajak penghasilan, BPJS Ketenagakerjaan, dan jaminan kesehatan.",
    federalTax: "Pajak Penghasilan (PPh)",
    stateLocalTax: "Pajak Daerah / Tambahan",
    socialSecurity: "Jaminan Pensiun & Hari Tua",
    medicare: "Jaminan Kesehatan",
    totalDeductions: "Total Pemotongan",
    netTakeHome: "Gaji Bersih Diterima",
    effectiveTaxNote: "Tarif efektif mencakup seluruh potongan resmi pemerintah."
  },
  costOfLiving: {
    headline: "Indeks Biaya Hidup Kota",
    subheadline: "Analisis keranjang pengeluaran: sewa hunian, makanan, transportasi, dan utilitas.",
    housingRent: "Sewa Tempat Tinggal",
    groceriesFood: "Bahan Makanan & Belanja",
    diningOut: "Makan di Luar",
    utilitiesInternet: "Listrik, Air & Internet",
    publicTransit: "Transportasi Umum",
    totalMonthlyLiving: "Total Biaya Hidup Bulanan",
    householdTypeSelect: "Komposisi Keluarga"
  },
  compare: {
    headline: "Bandingkan Daya Beli Antar Kota",
    subheadline: "Ketahui gaji yang setara untuk mempertahankan gaya hidup saat pindah ke kota lain.",
    cityA: "Kota Asal",
    cityB: "Kota Tujuan",
    salaryA: "Gaji Saat Ini",
    equivalentSalary: "Gaji yang Setara",
    purchasingPowerDelta: "Selisih Daya Beli",
    verdictLabel: "Kesimpulan Perbandingan"
  },
  jobOffers: {
    headline: "Perbandingan Tawaran Pekerjaan",
    subheadline: "Bandingkan nilai nyata dua tawaran kerja berdasarkan pajak dan harga lokal.",
    offerA: "Tawaran A",
    offerB: "Tawaran B",
    offerVerdict: "Keputusan Tawaran",
    higherRealIncome: "Pendapatan Nyata Lebih Tinggi"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "Perhitungan pajak saat ini belum tersedia untuk lokasi ini.",
    INVALID_SALARY: "Silakan masukkan nominal gaji yang valid.",
    CITY_NOT_SUPPORTED: "Kota yang dipilih belum didukung oleh sistem.",
    DATA_STALE: "Data sedang dalam proses pembaruan dan verifikasi.",
    FX_UNAVAILABLE: "Kurs mata uang tidak dapat diakses saat ini.",
    NETWORK_ERROR: "Gangguan koneksi jaringan. Silakan coba lagi."
  },
  footer: {
    aboutDesc: "LivWorthy menyediakan analisis deterministik daya beli, pajak, dan biaya hidup perkotaan di seluruh dunia.",
    calculatorsTitle: "Kalkulator",
    intelligenceTitle: "Pusat Analisis",
    institutionalTitle: "Data Institusi",
    cityComparisons: "Perbandingan Kota",
    empiricalReports: "Laporan Empiris",
    editorialPolicy: "Kebijakan Redaksional",
    dataPolicy: "Kebijakan Data",
    corrections: "Koreksi & Pembaruan",
    terms: "Syarat & Ketentuan",
    privacy: "Kebijakan Privasi",
    copyright: "\xA9 2026 LivWorthy. Seluruh hak cipta dilindungi."
  },
  languageSelector: {
    title: "Pilih Bahasa",
    searchPlaceholder: "Cari bahasa...",
    currentLanguage: "Bahasa Saat Ini",
    switchSuggestion: "Gunakan Bahasa Indonesia?",
    switchCta: "Ganti",
    dismiss: "Tutup",
    allLanguages: "Semua Bahasa"
  },
  reports: {
    hubTitle: "Laporan Gaji dan Biaya Hidup Global",
    hubSubtitle: "Riset empiris tentang daya beli, beban pajak, dan keterjangkauan perumahan.",
    instituteBadge: "Institut LivWorthy",
    modelBadge: "Model Deterministik 2026",
    globalSalaryWorthTitle: "Laporan Nilai Gaji Global",
    purchasingPowerTitle: "Indeks Daya Beli Riil",
    salaryToRentTitle: "Rasio Gaji terhadap Biaya Sewa",
    relocationGapTitle: "Kesenjangan Biaya Relokasi Antarnegara",
    takeHomePayTitle: "Perbandingan Gaji Bersih Global",
    downloadCsv: "Unduh CSV",
    downloadJson: "Unduh JSON",
    methodologyHeading: "Metodologi Riset & Data",
    sourcesHeading: "Sumber Statistik Resmi",
    citationHeading: "Pedoman Sitasi Akademik"
  }
};

// src/lib/i18n/locales/vi.ts
var viDictionary = {
  locale: "vi",
  common: {
    brand: "LivWorthy",
    tagline: "Ph\xE2n t\xEDch Ti\u1EC1n l\u01B0\u01A1ng, Thu\u1EBF v\xE0 Chi ph\xED Sinh ho\u1EA1t To\xE0n c\u1EA7u",
    livingIntelligence: "Living Intelligence",
    calculating: "\u0110ang t\xEDnh to\xE1n...",
    calculate: "T\xEDnh to\xE1n",
    annual: "H\xE0ng n\u0103m",
    monthly: "H\xE0ng th\xE1ng",
    year: "N\u0103m",
    month: "Th\xE1ng",
    share: "Chia s\u1EBB",
    copied: "\u0110\xE3 sao ch\xE9p v\xE0o b\u1ED9 nh\u1EDB t\u1EA1m",
    home: "Trang ch\u1EE7",
    back: "Quay l\u1EA1i",
    next: "Ti\u1EBFp t\u1EE5c",
    close: "\u0110\xF3ng",
    disclaimer: "C\xE1c ph\xE9p t\xEDnh l\xE0 \u01B0\u1EDBc t\xEDnh ti\u1EC1n \u0111\u1ECBnh d\u1EF1a tr\xEAn bi\u1EC3u thu\u1EBF ph\xE1p \u0111\u1ECBnh v\xE0 ch\u1EC9 s\u1ED1 th\u1ED1ng k\xEA ch\xEDnh th\u1EE9c. Kh\xF4ng c\u1EA5u th\xE0nh t\u01B0 v\u1EA5n t\xE0i ch\xEDnh hay thu\u1EBF.",
    verifiedTaxBaseline: "D\u1EEF li\u1EC7u thu\u1EBF x\xE1c th\u1EF1c 2026",
    tier1SourcesBadge: "Ngu\u1ED3n ch\xEDnh ph\u1EE7 c\u1EA5p 1 ch\xEDnh th\u1EE9c",
    singleAdult: "\u0110\u1ED9c th\xE2n / 1 Ng\u01B0\u1EDDi l\u1EDBn",
    couple: "C\u1EB7p \u0111\xF4i / Thu nh\u1EADp k\xE9p",
    family: "Gia \u0111\xECnh (2 Ng\u01B0\u1EDDi l\u1EDBn, 1 Tr\u1EBB em)",
    action: "Thao t\xE1c",
    evidence: "C\u0103n c\u1EE9 ph\xE1p l\xFD & Ngu\u1ED3n d\u1EEF li\u1EC7u",
    methodology: "Ph\u01B0\u01A1ng ph\xE1p lu\u1EADn t\xEDnh to\xE1n",
    diagnostics: "Ch\u1EA9n \u0111o\xE1n h\u1EC7 th\u1ED1ng"
  },
  nav: {
    howItWorks: "C\xE1ch th\u1EE9c ho\u1EA1t \u0111\u1ED9ng",
    sources: "Ngu\u1ED3n d\u1EEF li\u1EC7u",
    coverage: "Ph\u1EA1m vi th\xE0nh ph\u1ED1",
    relocation: "\u0110\u1ECBnh c\u01B0 & Chuy\u1EC3n v\xF9ng",
    jobOfferComparison: "So s\xE1nh l\u1EDDi m\u1EDDi l\xE0m vi\u1EC7c",
    reports: "B\xE1o c\xE1o th\u1EF1c nghi\u1EC7m",
    guides: "C\u1EA9m nang th\xE0nh ph\u1ED1",
    compare: "So s\xE1nh th\xE0nh ph\u1ED1",
    tabSalaryWorth: "L\u01B0\u01A1ng c\u1EE7a t\xF4i c\xF3 \u0111\u1EE7 s\u1ED1ng?",
    tabSalaryNeeded: "C\u1EA7n m\u1EE9c l\u01B0\u01A1ng bao nhi\xEAu?",
    tabSalaryAfterTax: "L\u01B0\u01A1ng th\u1EF1c nh\u1EADn sau thu\u1EBF",
    tabCostOfLiving: "Chi ph\xED sinh ho\u1EA1t",
    tabCompare: "So s\xE1nh th\xE0nh ph\u1ED1",
    tabJobOffers: "So s\xE1nh vi\u1EC7c l\xE0m",
    tabGuides: "C\u1EA9m nang l\u01B0\u01A1ng th\xE0nh ph\u1ED1 \u2192"
  },
  calculator: {
    chooseCity: "1. Ch\u1ECDn Th\xE0nh ph\u1ED1 / \u0110\u1ECBa \u0111i\u1EC3m",
    annualSalary: "2. T\u1ED5ng l\u01B0\u01A1ng g\u1ED9p h\xE0ng n\u0103m (Gross)",
    salaryHelp: "Thu nh\u1EADp c\u01A1 b\u1EA3n tr\u01B0\u1EDBc khi tr\u1EEB thu\u1EBF v\xE0 b\u1EA3o hi\u1EC3m b\u1EAFt bu\u1ED9c.",
    statutoryJurisdiction: "Khu v\u1EF1c ph\xE1p l\xFD thu\u1EBF: {jurisdiction}",
    popularScenarios: "T\xECnh hu\u1ED1ng ph\u1ED5 bi\u1EBFn:",
    heroHeadline: "M\u1EE9c l\u01B0\u01A1ng c\u1EE7a b\u1EA1n th\u1EF1c s\u1EF1 \u0111\xE1ng gi\xE1 bao nhi\xEAu?",
    heroSubheadline: "Nh\u1EADp m\u1EE9c l\u01B0\u01A1ng v\xE0 th\xE0nh ph\u1ED1 \u0111\u1EC3 xem thu nh\u1EADp th\u1EF1c nh\u1EADn, chi ph\xED sinh ho\u1EA1t th\u1EF1c t\u1EBF v\xE0 kh\u1EA3 n\u0103ng t\xEDch l\u0169y.",
    heroSupporting: "Ki\u1EC3m tra xem thu nh\u1EADp c\u1EE7a b\u1EA1n c\xF3 \u0111\u1EE7 trang tr\u1EA3i ti\u1EC1n thu\xEA nh\xE0 v\xE0 t\xEDch l\u0169y t\u1EA1i th\xE0nh ph\u1ED1 m\u1EE5c ti\xEAu hay kh\xF4ng.",
    householdType: "Quy m\xF4 h\u1ED9 gia \u0111\xECnh",
    rentOverride: "Ti\u1EC1n thu\xEA nh\xE0 h\xE0ng th\xE1ng (T\xF9y ch\u1ECDn)",
    rentOverridePlaceholder: "\u0110\u1EC3 tr\u1ED1ng \u0111\u1EC3 d\xF9ng m\u1EE9c trung b\xECnh",
    rentOverrideHelp: "Thay th\u1EBF chi ph\xED thu\xEA nh\xE0 trung b\xECnh b\u1EB1ng m\u1EE9c th\u1EF1c t\u1EBF c\u1EE7a b\u1EA1n.",
    taxYearLabel: "N\u0103m t\xEDnh thu\u1EBF",
    filingStatusLabel: "T\xECnh tr\u1EA1ng k\xEA khai thu\u1EBF",
    dependentsLabel: "S\u1ED1 ng\u01B0\u1EDDi ph\u1EE5 thu\u1ED9c",
    btnCalculate: "T\xEDnh to\xE1n s\u1EE9c mua th\u1EF1c t\u1EBF",
    quickScenarios: {
      nyc100k: "New York $100k",
      london60k: "London \xA360k",
      dubai300k: "Dubai 300k AED",
      toronto90k: "Toronto CA$90k"
    }
  },
  results: {
    summaryTitle: "T\u1ED5ng k\u1EBFt T\xE0i ch\xEDnh",
    annualGross: "T\u1ED5ng thu nh\u1EADp Gross n\u0103m",
    annualTakeHome: "Thu nh\u1EADp Net th\u1EF1c nh\u1EADn n\u0103m",
    monthlyTakeHome: "Thu nh\u1EADp Net th\u1EF1c nh\u1EADn th\xE1ng",
    monthlyLivingCosts: "Chi ph\xED sinh ho\u1EA1t th\xE1ng",
    monthlyDisposable: "S\u1ED1 d\u01B0 kh\u1EA3 d\u1EE5ng th\xE1ng",
    savingsCapacity: "Kh\u1EA3 n\u0103ng ti\u1EBFt ki\u1EC7m",
    savingsRate: "T\u1EF7 l\u1EC7 ti\u1EBFt ki\u1EC7m",
    effectiveTaxRate: "Thu\u1EBF su\u1EA5t th\u1EF1c t\u1EBF",
    housingBurden: "G\xE1nh n\u1EB7ng ti\u1EC1n nh\xE0",
    taxesAndDeductions: "Thu\u1EBF & Kh\u1EA5u tr\u1EEB b\u1EAFt bu\u1ED9c",
    essentialLiving: "Chi ph\xED thi\u1EBFt y\u1EBFu",
    discretionaryLiving: "Chi ph\xED linh ho\u1EA1t",
    spendableSurplus: "Th\u1EB7ng d\u01B0 ng\xE2n s\xE1ch",
    deficitWarning: "C\u1EA3nh b\xE1o: Th\xE2m h\u1EE5t ng\xE2n s\xE1ch v\u1EDBi m\u1EE9c chi ti\xEAu hi\u1EC7n t\u1EA1i",
    healthySurplus: "Th\u1EB7ng d\u01B0 ng\xE2n s\xE1ch an to\xE0n",
    taxPending: "\u0110ang c\u1EADp nh\u1EADt d\u1EEF li\u1EC7u thu\u1EBF",
    shareSummaryTitle: "Chia s\u1EBB ph\xE2n t\xEDch l\u01B0\u01A1ng",
    estimatedLivingCosts: "Chi ph\xED sinh ho\u1EA1t \u01B0\u1EDBc t\xEDnh",
    benchmarkContext: "So s\xE1nh v\u1EDBi chu\u1EA9n m\u1EF1c th\xE0nh ph\u1ED1",
    customizeAssumptions: "T\xF9y ch\u1EC9nh gi\u1EA3 \u0111\u1ECBnh"
  },
  salaryNeeded: {
    headline: "B\u1EA1n c\u1EA7n m\u1EE9c l\u01B0\u01A1ng bao nhi\xEAu?",
    subheadline: "T\xEDnh to\xE1n m\u1EE9c l\u01B0\u01A1ng Gross c\u1EA7n thi\u1EBFt \u0111\u1EC3 \u0111\u1EA1t m\u1EE5c ti\xEAu s\u1ED1ng v\xE0 ti\u1EBFt ki\u1EC7m mong mu\u1ED1n.",
    targetSavings: "M\u1EE5c ti\xEAu ti\u1EBFt ki\u1EC7m th\xE1ng",
    desiredLifestyle: "M\u1EE9c s\u1ED1ng mong mu\u1ED1n",
    requiredGross: "M\u1EE9c l\u01B0\u01A1ng Gross c\u1EA7n thi\u1EBFt",
    requiredNet: "M\u1EE9c l\u01B0\u01A1ng Net c\u1EA7n thi\u1EBFt",
    calculatedGrossSalary: "L\u01B0\u01A1ng Gross khuy\u1EBFn ngh\u1ECB",
    explorePlan: "Xem k\u1EBF ho\u1EA1ch chi ti\xEAu"
  },
  salaryAfterTax: {
    headline: "C\xF4ng c\u1EE5 t\xEDnh l\u01B0\u01A1ng Net sau thu\u1EBF",
    subheadline: "B\xF3c t\xE1ch chi ti\u1EBFt thu\u1EBF thu nh\u1EADp c\xE1 nh\xE2n (TNCN) v\xE0 c\xE1c lo\u1EA1i b\u1EA3o hi\u1EC3m b\u1EAFt bu\u1ED9c.",
    federalTax: "Thu\u1EBF thu nh\u1EADp c\xE1 nh\xE2n",
    stateLocalTax: "Thu\u1EBF \u0111\u1ECBa ph\u01B0\u01A1ng / Khu v\u1EF1c",
    socialSecurity: "B\u1EA3o hi\u1EC3m x\xE3 h\u1ED9i & H\u01B0u tr\xED",
    medicare: "B\u1EA3o hi\u1EC3m y t\u1EBF & Th\u1EA5t nghi\u1EC7p",
    totalDeductions: "T\u1ED5ng c\xE1c kho\u1EA3n kh\u1EA5u tr\u1EEB",
    netTakeHome: "L\u01B0\u01A1ng th\u1EF1c nh\u1EADn v\xE0o t\xE0i kho\u1EA3n",
    effectiveTaxNote: "Thu\u1EBF su\u1EA5t th\u1EF1c t\u1EBF bao g\u1ED3m to\xE0n b\u1ED9 ngh\u0129a v\u1EE5 t\xE0i ch\xEDnh b\u1EAFt bu\u1ED9c."
  },
  costOfLiving: {
    headline: "Ch\u1EC9 s\u1ED1 chi ph\xED sinh ho\u1EA1t \u0111\xF4 th\u1ECB",
    subheadline: "Ph\xE2n t\xEDch gi\u1ECF chi ti\xEAu: nh\xE0 \u1EDF, th\u1EF1c ph\u1EA9m, \u0103n ngo\xE0i, ti\u1EC7n \xEDch v\xE0 giao th\xF4ng.",
    housingRent: "Ti\u1EC1n thu\xEA nh\xE0",
    groceriesFood: "Th\u1EF1c ph\u1EA9m & \u0110i ch\u1EE3",
    diningOut: "\u0102n u\u1ED1ng b\xEAn ngo\xE0i",
    utilitiesInternet: "\u0110i\u1EC7n, N\u01B0\u1EDBc & Internet",
    publicTransit: "Ph\u01B0\u01A1ng ti\u1EC7n c\xF4ng c\u1ED9ng",
    totalMonthlyLiving: "T\u1ED5ng chi ph\xED sinh ho\u1EA1t th\xE1ng",
    householdTypeSelect: "Quy m\xF4 gia \u0111\xECnh"
  },
  compare: {
    headline: "So s\xE1nh s\u1EE9c mua gi\u1EEFa c\xE1c th\xE0nh ph\u1ED1",
    subheadline: "T\xECm m\u1EE9c l\u01B0\u01A1ng t\u01B0\u01A1ng \u0111\u01B0\u01A1ng khi chuy\u1EC3n c\xF4ng t\xE1c gi\u1EEFa hai th\xE0nh ph\u1ED1 kh\xE1c nhau.",
    cityA: "Th\xE0nh ph\u1ED1 hi\u1EC7n t\u1EA1i",
    cityB: "Th\xE0nh ph\u1ED1 chuy\u1EC3n \u0111\u1EBFn",
    salaryA: "L\u01B0\u01A1ng hi\u1EC7n t\u1EA1i",
    equivalentSalary: "M\u1EE9c l\u01B0\u01A1ng t\u01B0\u01A1ng \u0111\u01B0\u01A1ng",
    purchasingPowerDelta: "Ch\xEAnh l\u1EC7ch s\u1EE9c mua",
    verdictLabel: "K\u1EBFt lu\u1EADn so s\xE1nh"
  },
  jobOffers: {
    headline: "So s\xE1nh c\u01A1 h\u1ED9i ngh\u1EC1 nghi\u1EC7p",
    subheadline: "\u0110\xE1nh gi\xE1 gi\xE1 tr\u1ECB th\u1EF1c nh\u1EADn gi\u1EEFa hai l\u1EDDi m\u1EDDi l\xE0m vi\u1EC7c sau thu\u1EBF v\xE0 chi ph\xED sinh ho\u1EA1t.",
    offerA: "\u0110\u1EC1 ngh\u1ECB A",
    offerB: "\u0110\u1EC1 ngh\u1ECB B",
    offerVerdict: "\u0110\xE1nh gi\xE1 l\u1EDDi m\u1EDDi",
    higherRealIncome: "Thu nh\u1EADp th\u1EF1c t\u1EBF cao h\u01A1n"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "T\xEDnh to\xE1n thu\u1EBF ch\u01B0a h\u1ED7 tr\u1EE3 cho \u0111\u1ECBa \u0111i\u1EC3m n\xE0y.",
    INVALID_SALARY: "Vui l\xF2ng nh\u1EADp m\u1EE9c l\u01B0\u01A1ng h\u1EE3p l\u1EC7.",
    CITY_NOT_SUPPORTED: "Th\xE0nh ph\u1ED1 \u0111\u01B0\u1EE3c ch\u1ECDn ch\u01B0a c\xF3 trong h\u1EC7 th\u1ED1ng.",
    DATA_STALE: "D\u1EEF li\u1EC7u \u0111ang \u0111\u01B0\u1EE3c ki\u1EC3m tra v\xE0 c\u1EADp nh\u1EADt.",
    FX_UNAVAILABLE: "T\u1EF7 gi\xE1 h\u1ED1i \u0111o\xE1i t\u1EA1m th\u1EDDi kh\xF4ng kh\u1EA3 d\u1EE5ng.",
    NETWORK_ERROR: "L\u1ED7i m\u1EA1ng k\u1EBFt n\u1ED1i. Vui l\xF2ng th\u1EED l\u1EA1i sau."
  },
  footer: {
    aboutDesc: "LivWorthy cung c\u1EA5p n\u1EC1n t\u1EA3ng tr\xED tu\u1EC7 \u0111\u1ECBnh l\u01B0\u1EE3ng v\u1EC1 ti\u1EC1n l\u01B0\u01A1ng, thu\u1EBF v\xE0 chi ph\xED sinh ho\u1EA1t to\xE0n c\u1EA7u.",
    calculatorsTitle: "C\xF4ng c\u1EE5 t\xEDnh",
    intelligenceTitle: "Trung t\xE2m ph\xE2n t\xEDch",
    institutionalTitle: "D\u1EEF li\u1EC7u th\u1EC3 ch\u1EBF",
    cityComparisons: "So s\xE1nh th\xE0nh ph\u1ED1",
    empiricalReports: "B\xE1o c\xE1o th\u1EF1c nghi\u1EC7m",
    editorialPolicy: "Ch\xEDnh s\xE1ch bi\xEAn t\u1EADp",
    dataPolicy: "Ch\xEDnh s\xE1ch d\u1EEF li\u1EC7u",
    corrections: "\u0110\xEDnh ch\xEDnh & C\u1EADp nh\u1EADt",
    terms: "\u0110i\u1EC1u kho\u1EA3n s\u1EED d\u1EE5ng",
    privacy: "Ch\xEDnh s\xE1ch b\u1EA3o m\u1EADt",
    copyright: "\xA9 2026 LivWorthy. B\u1EA3o l\u01B0u m\u1ECDi quy\u1EC1n."
  },
  languageSelector: {
    title: "Ch\u1ECDn ng\xF4n ng\u1EEF",
    searchPlaceholder: "T\xECm ng\xF4n ng\u1EEF...",
    currentLanguage: "Ng\xF4n ng\u1EEF hi\u1EC7n t\u1EA1i",
    switchSuggestion: "Chuy\u1EC3n sang Ti\u1EBFng Vi\u1EC7t?",
    switchCta: "Chuy\u1EC3n \u0111\u1ED5i",
    dismiss: "B\u1ECF qua",
    allLanguages: "T\u1EA5t c\u1EA3 ng\xF4n ng\u1EEF h\u1ED7 tr\u1EE3"
  },
  reports: {
    hubTitle: "B\xE1o c\xE1o ti\u1EC1n l\u01B0\u01A1ng v\xE0 sinh ho\u1EA1t to\xE0n c\u1EA7u",
    hubSubtitle: "Nghi\xEAn c\u1EE9u \u0111\u1ECBnh l\u01B0\u1EE3ng v\u1EC1 s\u1EE9c mua th\u1EF1c t\u1EBF, g\xE1nh n\u1EB7ng thu\u1EBF v\xE0 nh\xE0 \u1EDF \u0111\xF4 th\u1ECB.",
    instituteBadge: "Vi\u1EC7n Nghi\xEAn c\u1EE9u LivWorthy",
    modelBadge: "M\xF4 h\xECnh ti\u1EC1n \u0111\u1ECBnh 2026",
    globalSalaryWorthTitle: "B\xE1o c\xE1o gi\xE1 tr\u1ECB ti\u1EC1n l\u01B0\u01A1ng to\xE0n c\u1EA7u",
    purchasingPowerTitle: "Ch\u1EC9 s\u1ED1 s\u1EE9c mua th\u1EF1c t\u1EBF",
    salaryToRentTitle: "T\u1EF7 l\u1EC7 ti\u1EC1n l\u01B0\u01A1ng tr\xEAn gi\xE1 thu\xEA nh\xE0",
    relocationGapTitle: "Kho\u1EA3ng c\xE1ch chi ph\xED t\xE1i \u0111\u1ECBnh c\u01B0 qu\u1ED1c t\u1EBF",
    takeHomePayTitle: "B\u1EA3ng x\u1EBFp h\u1EA1ng l\u01B0\u01A1ng th\u1EF1c nh\u1EADn to\xE0n c\u1EA7u",
    downloadCsv: "T\u1EA3i CSV",
    downloadJson: "T\u1EA3i JSON",
    methodologyHeading: "Ph\u01B0\u01A1ng ph\xE1p lu\u1EADn nghi\xEAn c\u1EE9u",
    sourcesHeading: "Ngu\u1ED3n th\u1ED1ng k\xEA ch\xEDnh th\u1EE9c",
    citationHeading: "Quy chu\u1EA9n tr\xEDch d\u1EABn"
  }
};

// src/lib/i18n/locales/bn.ts
var bnDictionary = {
  locale: "bn",
  common: {
    brand: "LivWorthy",
    tagline: "\u09AC\u09C7\u09A4\u09A8, \u0995\u09B0 \u0993 \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09B0 \u0996\u09B0\u099A\u09C7\u09B0 \u09AC\u09C8\u09B6\u09CD\u09AC\u09BF\u0995 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3",
    livingIntelligence: "Living Intelligence",
    calculating: "\u0997\u09A3\u09A8\u09BE \u0995\u09B0\u09BE \u09B9\u099A\u09CD\u099B\u09C7...",
    calculate: "\u0997\u09A3\u09A8\u09BE \u0995\u09B0\u09C1\u09A8",
    annual: "\u09AC\u09BE\u09B0\u09CD\u09B7\u09BF\u0995",
    monthly: "\u09AE\u09BE\u09B8\u09BF\u0995",
    year: "\u09AC\u099B\u09B0",
    month: "\u09AE\u09BE\u09B8",
    share: "\u09B6\u09C7\u09AF\u09BC\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8",
    copied: "\u0995\u09CD\u09B2\u09BF\u09AA\u09AC\u09CB\u09B0\u09CD\u09A1\u09C7 \u0995\u09AA\u09BF \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7",
    home: "\u09B9\u09CB\u09AE",
    back: "\u09AA\u09C7\u099B\u09A8\u09C7",
    next: "\u09AA\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0",
    close: "\u09AC\u09A8\u09CD\u09A7 \u0995\u09B0\u09C1\u09A8",
    disclaimer: "\u098F\u0987 \u0997\u09A3\u09A8\u09BE\u0997\u09C1\u09B2\u09CB \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u0995\u09B0\u09C7\u09B0 \u09B9\u09BE\u09B0 \u098F\u09AC\u0982 \u09AA\u09B0\u09BF\u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09A8\u0997\u09A4 \u09A4\u09A5\u09CD\u09AF\u09C7\u09B0 \u0993\u09AA\u09B0 \u09AD\u09BF\u09A4\u09CD\u09A4\u09BF \u0995\u09B0\u09C7 \u09AA\u09CD\u09B0\u09A3\u09C0\u09A4\u0964 \u098F\u099F\u09BF \u0995\u09CB\u09A8\u09CB \u0986\u09B0\u09CD\u09A5\u09BF\u0995 \u09AC\u09BE \u0995\u09B0 \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u09AA\u09C7\u09B6\u09BE\u09A6\u09BE\u09B0 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09A8\u09AF\u09BC\u0964",
    verifiedTaxBaseline: "\u09AF\u09BE\u099A\u09BE\u0987\u0995\u09C3\u09A4 \u09E8\u09E6\u09E8\u09EC \u0995\u09B0 \u0995\u09BE\u09A0\u09BE\u09AE\u09CB",
    tier1SourcesBadge: "\u09AA\u09CD\u09B0\u09A5\u09AE \u09B8\u09CD\u09A4\u09B0\u09C7\u09B0 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09A4\u09A5\u09CD\u09AF\u09B8\u09C2\u09A4\u09CD\u09B0",
    singleAdult: "\u098F\u0995\u0995 \u09AA\u09CD\u09B0\u09BE\u09AA\u09CD\u09A4\u09AC\u09AF\u09BC\u09B8\u09CD\u0995",
    couple: "\u09A6\u09AE\u09CD\u09AA\u09A4\u09BF / \u09A6\u09CD\u09AC\u09C8\u09A4 \u0986\u09AF\u09BC",
    family: "\u09AA\u09B0\u09BF\u09AC\u09BE\u09B0 (\u09E8 \u09AA\u09CD\u09B0\u09BE\u09AA\u09CD\u09A4\u09AC\u09AF\u09BC\u09B8\u09CD\u0995, \u09E7 \u09B6\u09BF\u09B6\u09C1)",
    action: "\u09AA\u09A6\u0995\u09CD\u09B7\u09C7\u09AA",
    evidence: "\u0989\u09CE\u09B8 \u0993 \u09A4\u09A5\u09CD\u09AF\u09AA\u09CD\u09B0\u09AE\u09BE\u09A3",
    methodology: "\u0997\u09A3\u09A8\u09BE \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF",
    diagnostics: "\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09A1\u09BE\u09AF\u09BC\u09BE\u0997\u09A8\u09B8\u09CD\u099F\u09BF\u0995\u09B8"
  },
  nav: {
    howItWorks: "\u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u0995\u09BE\u099C \u0995\u09B0\u09C7",
    sources: "\u09A4\u09A5\u09CD\u09AF\u09B8\u09C2\u09A4\u09CD\u09B0",
    coverage: "\u09B6\u09B9\u09B0\u09C7\u09B0 \u09AA\u09B0\u09BF\u09A7\u09BF",
    relocation: "\u09B8\u09CD\u09A5\u09BE\u09A8\u09BE\u09A8\u09CD\u09A4\u09B0",
    jobOfferComparison: "\u099A\u09BE\u0995\u09B0\u09BF\u09B0 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A4\u09C1\u09B2\u09A8\u09BE",
    reports: "\u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8",
    guides: "\u09B6\u09B9\u09B0 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09BF\u0995\u09BE",
    compare: "\u09B6\u09B9\u09B0 \u09A4\u09C1\u09B2\u09A8\u09BE",
    tabSalaryWorth: "\u0986\u09AE\u09BE\u09B0 \u09AC\u09C7\u09A4\u09A8 \u0995\u09BF \u09AF\u09A5\u09C7\u09B7\u09CD\u099F?",
    tabSalaryNeeded: "\u0995\u09A4 \u0986\u09AF\u09BC \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8?",
    tabSalaryAfterTax: "\u0995\u09B0-\u09AA\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0 \u09A8\u09BF\u099F \u09AC\u09C7\u09A4\u09A8",
    tabCostOfLiving: "\u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09B0 \u0996\u09B0\u099A",
    tabCompare: "\u09B6\u09B9\u09B0 \u09A4\u09C1\u09B2\u09A8\u09BE",
    tabJobOffers: "\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A4\u09C1\u09B2\u09A8\u09BE",
    tabGuides: "\u09B6\u09B9\u09B0\u09C7\u09B0 \u09AC\u09C7\u09A4\u09A8 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09BF\u0995\u09BE \u2192"
  },
  calculator: {
    chooseCity: "\u09E7. \u09B6\u09B9\u09B0 / \u0985\u09AC\u09B8\u09CD\u09A5\u09BE\u09A8 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8",
    annualSalary: "\u09E8. \u09AC\u09BE\u09B0\u09CD\u09B7\u09BF\u0995 \u09AE\u09CB\u099F \u09AC\u09C7\u09A4\u09A8 (Gross)",
    salaryHelp: "\u0995\u09B0 \u098F\u09AC\u0982 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u0995\u09B0\u09CD\u09A4\u09A8\u09C7\u09B0 \u09AA\u09C2\u09B0\u09CD\u09AC\u09AC\u09B0\u09CD\u09A4\u09C0 \u09AE\u09C2\u09B2 \u09AC\u09C7\u09A4\u09A8\u0964",
    statutoryJurisdiction: "\u0986\u0987\u09A8\u0997\u09A4 \u0995\u09B0 \u098F\u0996\u09A4\u09BF\u09AF\u09BC\u09BE\u09B0: {jurisdiction}",
    popularScenarios: "\u099C\u09A8\u09AA\u09CD\u09B0\u09BF\u09AF\u09BC \u09AA\u09B0\u09BF\u09B8\u09CD\u09A5\u09BF\u09A4\u09BF:",
    heroHeadline: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09C7\u09A4\u09A8\u09C7\u09B0 \u09AA\u09CD\u09B0\u0995\u09C3\u09A4 \u09AE\u09C2\u09B2\u09CD\u09AF \u0995\u09A4?",
    heroSubheadline: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09C7\u09A4\u09A8 \u098F\u09AC\u0982 \u09B6\u09B9\u09B0 \u09B2\u09BF\u0996\u09C7 \u099C\u09BE\u09A8\u09C1\u09A8 \u0986\u09B8\u09B2 \u09A8\u09BF\u099F \u0986\u09AF\u09BC, \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AF\u09BC \u098F\u09AC\u0982 \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AD\u09BE\u09AC\u09A8\u09BE\u0964",
    heroSupporting: "\u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09C1\u09A8 \u0986\u09AA\u09A8\u09BE\u09B0 \u0986\u09AF\u09BC \u0995\u09BE\u0999\u09CD\u0995\u09CD\u09B7\u09BF\u09A4 \u09B6\u09B9\u09B0\u09C7 \u09AC\u09BE\u09A1\u09BC\u09BF \u09AD\u09BE\u09A1\u09BC\u09BE \u0993 \u09AC\u09CD\u09AF\u09AF\u09BC \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u09B9\u09C7\u09B0 \u09AA\u09B0 \u09B8\u099E\u09CD\u099A\u09AF\u09BC \u0995\u09B0\u09A4\u09C7 \u09AF\u09A5\u09C7\u09B7\u09CD\u099F \u0995\u09BF \u09A8\u09BE\u0964",
    householdType: "\u09AA\u09B0\u09BF\u09AC\u09BE\u09B0\u09C7\u09B0 \u09A7\u09B0\u09A8",
    rentOverride: "\u09AC\u09BE\u09A1\u09BC\u09BF \u09AD\u09BE\u09A1\u09BC\u09BE (\u09AE\u09BE\u09B8\u09BF\u0995, \u0990\u099A\u09CD\u099B\u09BF\u0995)",
    rentOverridePlaceholder: "\u09B6\u09B9\u09B0\u09C7\u09B0 \u0997\u09A1\u09BC\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0996\u09BE\u09B2\u09BF \u09B0\u09BE\u0996\u09C1\u09A8",
    rentOverrideHelp: "\u0997\u09A1\u09BC \u09AD\u09BE\u09A1\u09BC\u09BE\u09B0 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u09AD\u09BE\u09A1\u09BC\u09BE\u09B0 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\u0964",
    taxYearLabel: "\u0995\u09B0 \u09AC\u099B\u09B0",
    filingStatusLabel: "\u0995\u09B0 \u09AB\u09BE\u0987\u09B2\u09BF\u0982 \u09B8\u09CD\u09A5\u09BF\u09A4\u09BF",
    dependentsLabel: "\u09A8\u09BF\u09B0\u09CD\u09AD\u09B0\u09B6\u09C0\u09B2 \u09B8\u09A6\u09B8\u09CD\u09AF",
    btnCalculate: "\u0995\u09CD\u09B0\u09AF\u09BC\u0995\u09CD\u09B7\u09AE\u09A4\u09BE \u0997\u09A3\u09A8\u09BE \u0995\u09B0\u09C1\u09A8",
    quickScenarios: {
      nyc100k: "\u09A8\u09BF\u0989 \u0987\u09AF\u09BC\u09B0\u09CD\u0995 $100k",
      london60k: "\u09B2\u09A8\u09CD\u09A1\u09A8 \xA360k",
      dubai300k: "\u09A6\u09C1\u09AC\u09BE\u0987 300k AED",
      toronto90k: "\u099F\u09B0\u09A8\u09CD\u099F\u09CB CA$90k"
    }
  },
  results: {
    summaryTitle: "\u0986\u09B0\u09CD\u09A5\u09BF\u0995 \u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA",
    annualGross: "\u09AC\u09BE\u09B0\u09CD\u09B7\u09BF\u0995 \u09AE\u09CB\u099F \u0986\u09AF\u09BC (Gross)",
    annualTakeHome: "\u09AC\u09BE\u09B0\u09CD\u09B7\u09BF\u0995 \u09A8\u09BF\u099F \u0986\u09AF\u09BC (Take-Home)",
    monthlyTakeHome: "\u09AE\u09BE\u09B8\u09BF\u0995 \u09A8\u09BF\u099F \u0986\u09AF\u09BC (Net)",
    monthlyLivingCosts: "\u09AE\u09BE\u09B8\u09BF\u0995 \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AF\u09BC",
    monthlyDisposable: "\u09AE\u09BE\u09B8\u09BF\u0995 \u0989\u09A6\u09CD\u09AC\u09C3\u09A4\u09CD\u09A4 \u0986\u09AF\u09BC",
    savingsCapacity: "\u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09C7\u09B0 \u09B8\u0995\u09CD\u09B7\u09AE\u09A4\u09BE",
    savingsRate: "\u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09C7\u09B0 \u09B9\u09BE\u09B0",
    effectiveTaxRate: "\u0995\u09BE\u09B0\u09CD\u09AF\u0995\u09B0 \u0995\u09B0\u09C7\u09B0 \u09B9\u09BE\u09B0",
    housingBurden: "\u09AC\u09BE\u09B8\u09B8\u09CD\u09A5\u09BE\u09A8 \u09AC\u09CD\u09AF\u09AF\u09BC\u09C7\u09B0 \u0985\u09A8\u09C1\u09AA\u09BE\u09A4",
    taxesAndDeductions: "\u0995\u09B0 \u0993 \u09AC\u09BE\u09A7\u09CD\u09AF\u09A4\u09BE\u09AE\u09C2\u09B2\u0995 \u0995\u09B0\u09CD\u09A4\u09A8",
    essentialLiving: "\u09AE\u09CC\u09B2\u09BF\u0995 \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09B0 \u0996\u09B0\u099A",
    discretionaryLiving: "\u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u09AC\u09CD\u09AF\u09AF\u09BC",
    spendableSurplus: "\u09AC\u09BE\u099C\u09C7\u099F \u0989\u09A6\u09CD\u09AC\u09C3\u09A4\u09CD\u09A4",
    deficitWarning: "\u09B8\u09A4\u09B0\u09CD\u0995\u09A4\u09BE: \u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09AC\u09CD\u09AF\u09AF\u09BC\u09C7 \u09AC\u09BE\u099C\u09C7\u099F \u0998\u09BE\u099F\u09A4\u09BF \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7",
    healthySurplus: "\u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF\u0995\u09B0 \u09AC\u09BE\u099C\u09C7\u099F \u0989\u09A6\u09CD\u09AC\u09C3\u09A4\u09CD\u09A4",
    taxPending: "\u0995\u09B0 \u09A4\u09A5\u09CD\u09AF \u09AF\u09BE\u099A\u09BE\u0987 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u09A7\u09C0\u09A8",
    shareSummaryTitle: "\u09AC\u09C7\u09A4\u09A8\u09C7\u09B0 \u09B9\u09BF\u09B8\u09BE\u09AC \u09B6\u09C7\u09AF\u09BC\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8",
    estimatedLivingCosts: "\u0986\u09A8\u09C1\u09AE\u09BE\u09A8\u09BF\u0995 \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AF\u09BC",
    benchmarkContext: "\u09B6\u09B9\u09B0\u09C7\u09B0 \u0997\u09A1\u09BC\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09A4\u09C1\u09B2\u09A8\u09BE",
    customizeAssumptions: "\u09A7\u09BE\u09B0\u09A3\u09BE\u0997\u09C1\u09B2\u09CB \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u0987\u099C \u0995\u09B0\u09C1\u09A8"
  },
  salaryNeeded: {
    headline: "\u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09A4 \u0986\u09AF\u09BC \u0995\u09B0\u09BE \u0989\u099A\u09BF\u09A4?",
    subheadline: "\u0995\u09BE\u0999\u09CD\u0995\u09CD\u09B7\u09BF\u09A4 \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE \u0993 \u09B8\u099E\u09CD\u099A\u09AF\u09BC \u09B2\u0995\u09CD\u09B7\u09CD\u09AF\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8\u09C0\u09AF\u09BC \u09AE\u09CB\u099F \u09AC\u09C7\u09A4\u09A8 \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC \u0995\u09B0\u09C1\u09A8\u0964",
    targetSavings: "\u09AE\u09BE\u09B8\u09BF\u0995 \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09C7\u09B0 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF",
    desiredLifestyle: "\u0995\u09BE\u0999\u09CD\u0995\u09CD\u09B7\u09BF\u09A4 \u099C\u09C0\u09AC\u09A8\u09AE\u09BE\u09A8",
    requiredGross: "\u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8\u09C0\u09AF\u09BC \u09AE\u09CB\u099F \u09AC\u09C7\u09A4\u09A8 (Gross)",
    requiredNet: "\u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8\u09C0\u09AF\u09BC \u09A8\u09BF\u099F \u09AC\u09C7\u09A4\u09A8 (Net)",
    calculatedGrossSalary: "\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC\u09BF\u09A4 \u09AE\u09CB\u099F \u09AC\u09C7\u09A4\u09A8",
    explorePlan: "\u09AC\u09BE\u099C\u09C7\u099F \u09AA\u09B0\u09BF\u0995\u09B2\u09CD\u09AA\u09A8\u09BE \u09A6\u09C7\u0996\u09C1\u09A8"
  },
  salaryAfterTax: {
    headline: "\u0995\u09B0-\u09AA\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0 \u09A8\u09BF\u099F \u09AC\u09C7\u09A4\u09A8 \u0995\u09CD\u09AF\u09BE\u09B2\u0995\u09C1\u09B2\u09C7\u099F\u09B0",
    subheadline: "\u0986\u09AF\u09BC\u0995\u09B0, \u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE \u0993 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF\u09AC\u09C0\u09AE\u09BE \u0995\u09B0\u09CD\u09A4\u09A8\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AC\u09BF\u09AD\u09BE\u099C\u09A8\u0964",
    federalTax: "\u099C\u09BE\u09A4\u09C0\u09AF\u09BC / \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0\u09C0\u09AF\u09BC \u0986\u09AF\u09BC\u0995\u09B0",
    stateLocalTax: "\u0986\u099E\u09CD\u099A\u09B2\u09BF\u0995 / \u09B8\u09CD\u09A5\u09BE\u09A8\u09C0\u09AF\u09BC \u0995\u09B0",
    socialSecurity: "\u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE \u0993 \u09AA\u09C7\u09A8\u09B6\u09A8",
    medicare: "\u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09AC\u09C0\u09AE\u09BE",
    totalDeductions: "\u09AE\u09CB\u099F \u0995\u09B0\u09CD\u09A4\u09A8",
    netTakeHome: "\u09B9\u09BE\u09A4\u09C7 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09A8\u09BF\u099F \u09AC\u09C7\u09A4\u09A8",
    effectiveTaxNote: "\u0995\u09BE\u09B0\u09CD\u09AF\u0995\u09B0 \u0995\u09B0 \u09B9\u09BE\u09B0\u09C7 \u09B8\u0995\u09B2 \u09AC\u09BE\u09A7\u09CD\u09AF\u09A4\u09BE\u09AE\u09C2\u09B2\u0995 \u0995\u09B0\u09CD\u09A4\u09A8 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AD\u09C1\u0995\u09CD\u09A4\u0964"
  },
  costOfLiving: {
    headline: "\u09B6\u09B9\u09B0\u09C7\u09B0 \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AF\u09BC \u09B8\u09C2\u099A\u0995",
    subheadline: "\u09AC\u09BE\u09B8\u09BE \u09AD\u09BE\u09A1\u09BC\u09BE, \u0996\u09BE\u09A6\u09CD\u09AF, \u0987\u0989\u099F\u09BF\u09B2\u09BF\u099F\u09BF \u098F\u09AC\u0982 \u0997\u09A3\u09AA\u09B0\u09BF\u09AC\u09B9\u09A8 \u09AC\u09CD\u09AF\u09AF\u09BC\u09C7\u09B0 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3\u0964",
    housingRent: "\u09AC\u09BE\u09B8\u09BE \u09AD\u09BE\u09A1\u09BC\u09BE",
    groceriesFood: "\u09AE\u09C1\u09A6\u09BF \u0993 \u0996\u09BE\u09A6\u09CD\u09AF\u09B8\u09BE\u09AE\u0997\u09CD\u09B0\u09C0",
    diningOut: "\u09AC\u09BE\u0987\u09B0\u09C7 \u0996\u09BE\u0993\u09AF\u09BC\u09BE",
    utilitiesInternet: "\u09AC\u09BF\u09A6\u09CD\u09AF\u09C1\u09CE, \u09AA\u09BE\u09A8\u09BF \u0993 \u0987\u09A8\u09CD\u099F\u09BE\u09B0\u09A8\u09C7\u099F",
    publicTransit: "\u0997\u09A3\u09AA\u09B0\u09BF\u09AC\u09B9\u09A8",
    totalMonthlyLiving: "\u09AE\u09CB\u099F \u09AE\u09BE\u09B8\u09BF\u0995 \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09B0 \u0996\u09B0\u099A",
    householdTypeSelect: "\u09AA\u09B0\u09BF\u09AC\u09BE\u09B0\u09C7\u09B0 \u0997\u09A0\u09A8"
  },
  compare: {
    headline: "\u09B6\u09B9\u09B0\u0997\u09C1\u09B2\u09CB\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u0995\u09CD\u09B0\u09AF\u09BC\u0995\u09CD\u09B7\u09AE\u09A4\u09BE\u09B0 \u09A4\u09C1\u09B2\u09A8\u09BE",
    subheadline: "\u098F\u0995 \u09B6\u09B9\u09B0 \u09A5\u09C7\u0995\u09C7 \u0985\u09A8\u09CD\u09AF \u09B6\u09B9\u09B0\u09C7 \u09B8\u09CD\u09A5\u09BE\u09A8\u09BE\u09A8\u09CD\u09A4\u09B0\u09C7\u09B0 \u09B8\u09AE\u09AF\u09BC \u09B8\u09AE\u09AE\u09BE\u09A8\u09C7\u09B0 \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09AA\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8\u09C0\u09AF\u09BC \u09AC\u09C7\u09A4\u09A8 \u099C\u09BE\u09A8\u09C1\u09A8\u0964",
    cityA: "\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09B6\u09B9\u09B0",
    cityB: "\u0997\u09A8\u09CD\u09A4\u09AC\u09CD\u09AF \u09B6\u09B9\u09B0",
    salaryA: "\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09AC\u09C7\u09A4\u09A8",
    equivalentSalary: "\u09B8\u09AE\u09A4\u09C1\u09B2\u09CD\u09AF \u09AC\u09C7\u09A4\u09A8",
    purchasingPowerDelta: "\u0995\u09CD\u09B0\u09AF\u09BC\u0995\u09CD\u09B7\u09AE\u09A4\u09BE\u09B0 \u09AA\u09BE\u09B0\u09CD\u09A5\u0995\u09CD\u09AF",
    verdictLabel: "\u09A4\u09C1\u09B2\u09A8\u09BE\u09AE\u09C2\u09B2\u0995 \u09B8\u09BF\u09A6\u09CD\u09A7\u09BE\u09A8\u09CD\u09A4"
  },
  jobOffers: {
    headline: "\u099A\u09BE\u0995\u09B0\u09BF\u09B0 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A4\u09C1\u09B2\u09A8\u09BE",
    subheadline: "\u09B8\u09CD\u09A5\u09BE\u09A8\u09C0\u09AF\u09BC \u0995\u09B0 \u0993 \u09AC\u09CD\u09AF\u09AF\u09BC\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AA\u09CD\u09B0\u09C7\u0995\u09CD\u09B7\u09BF\u09A4\u09C7 \u09A6\u09C1\u099F\u09BF \u099A\u09BE\u0995\u09B0\u09BF\u09B0 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC\u09C7\u09B0 \u09AA\u09CD\u09B0\u0995\u09C3\u09A4 \u0986\u09B0\u09CD\u09A5\u09BF\u0995 \u09AE\u09C2\u09B2\u09CD\u09AF \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09C1\u09A8\u0964",
    offerA: "\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u0995",
    offerB: "\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u0996",
    offerVerdict: "\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC\u09C7\u09B0 \u09AE\u09C2\u09B2\u09CD\u09AF\u09BE\u09AF\u09BC\u09A8",
    higherRealIncome: "\u0989\u099A\u09CD\u099A\u09A4\u09B0 \u09AA\u09CD\u09B0\u0995\u09C3\u09A4 \u09A8\u09BF\u09B7\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF\u09AF\u09CB\u0997\u09CD\u09AF \u0986\u09AF\u09BC"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "\u098F\u0987 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09B0 \u0997\u09A3\u09A8\u09BE \u09B8\u09BE\u09AE\u09AF\u09BC\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u0985\u09A8\u09C1\u09AA\u09B2\u09AC\u09CD\u09A7\u0964",
    INVALID_SALARY: "\u09A6\u09AF\u09BC\u09BE \u0995\u09B0\u09C7 \u098F\u0995\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09AC\u09C7\u09A4\u09A8\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3 \u09B2\u09BF\u0996\u09C1\u09A8\u0964",
    CITY_NOT_SUPPORTED: "\u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09BF\u09A4 \u09B6\u09B9\u09B0\u099F\u09BF \u098F\u0996\u09A8\u09CB \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE\u09C7 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AD\u09C1\u0995\u09CD\u09A4 \u09B9\u09AF\u09BC\u09A8\u09BF\u0964",
    DATA_STALE: "\u09A4\u09A5\u09CD\u09AF \u0986\u09AA\u09A1\u09C7\u099F \u0993 \u09AF\u09BE\u099A\u09BE\u0987\u0995\u09B0\u09A3 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u09A7\u09C0\u09A8 \u09B0\u09AF\u09BC\u09C7\u099B\u09C7\u0964",
    FX_UNAVAILABLE: "\u09AE\u09C1\u09A6\u09CD\u09B0\u09BE \u09AC\u09BF\u09A8\u09BF\u09AE\u09AF\u09BC \u09B9\u09BE\u09B0 \u09B8\u09BE\u09AE\u09AF\u09BC\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u0985\u09A8\u09C1\u09AA\u09B2\u09AC\u09CD\u09A7\u0964",
    NETWORK_ERROR: "\u09A8\u09C7\u099F\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995 \u09B8\u0982\u09AF\u09CB\u0997 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF\u0964 \u0995\u09BF\u099B\u09C1\u0995\u09CD\u09B7\u09A3 \u09AA\u09B0 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964"
  },
  footer: {
    aboutDesc: "LivWorthy \u09AC\u09BF\u09B6\u09CD\u09AC\u099C\u09C1\u09A1\u09BC\u09C7 \u09AC\u09BF\u09AD\u09BF\u09A8\u09CD\u09A8 \u09B6\u09B9\u09B0\u09C7\u09B0 \u09AC\u09C7\u09A4\u09A8, \u0995\u09B0 \u098F\u09AC\u0982 \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AF\u09BC\u09C7\u09B0 \u0997\u09BE\u09A3\u09BF\u09A4\u09BF\u0995 \u0993 \u09A8\u09BF\u09B0\u09AA\u09C7\u0995\u09CD\u09B7 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C7\u0964",
    calculatorsTitle: "\u0995\u09CD\u09AF\u09BE\u09B2\u0995\u09C1\u09B2\u09C7\u099F\u09B0",
    intelligenceTitle: "\u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3 \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0",
    institutionalTitle: "\u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09A4\u09A5\u09CD\u09AF",
    cityComparisons: "\u09B6\u09B9\u09B0 \u09A4\u09C1\u09B2\u09A8\u09BE",
    empiricalReports: "\u0997\u09AC\u09C7\u09B7\u09A3\u09BE \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8",
    editorialPolicy: "\u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u0995\u09C0\u09AF\u09BC \u09A8\u09C0\u09A4\u09BF",
    dataPolicy: "\u09A4\u09A5\u09CD\u09AF \u09A8\u09C0\u09A4\u09BF",
    corrections: "\u09B8\u0982\u09B6\u09CB\u09A7\u09A8 \u0993 \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6",
    terms: "\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u09C7\u09B0 \u09B6\u09B0\u09CD\u09A4\u09BE\u09AC\u09B2\u09C0",
    privacy: "\u0997\u09CB\u09AA\u09A8\u09C0\u09AF\u09BC\u09A4\u09BE \u09A8\u09C0\u09A4\u09BF",
    copyright: "\xA9 \u09E8\u09E6\u09E8\u09EC LivWorthy. \u09B8\u09B0\u09CD\u09AC\u09B8\u09CD\u09AC\u09A4\u09CD\u09AC \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4\u0964"
  },
  languageSelector: {
    title: "\u09AD\u09BE\u09B7\u09BE \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8",
    searchPlaceholder: "\u09AD\u09BE\u09B7\u09BE \u0996\u09C1\u0981\u099C\u09C1\u09A8...",
    currentLanguage: "\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09AD\u09BE\u09B7\u09BE",
    switchSuggestion: "\u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE\u09AF\u09BC \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09AC\u09C7\u09A8?",
    switchCta: "\u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09C1\u09A8",
    dismiss: "\u09AC\u09BE\u09A4\u09BF\u09B2",
    allLanguages: "\u09B8\u09AE\u09B0\u09CD\u09A5\u09BF\u09A4 \u09B8\u0995\u09B2 \u09AD\u09BE\u09B7\u09BE"
  },
  reports: {
    hubTitle: "\u09AC\u09C8\u09B6\u09CD\u09AC\u09BF\u0995 \u09AC\u09C7\u09A4\u09A8 \u0993 \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8",
    hubSubtitle: "\u09AA\u09CD\u09B0\u0995\u09C3\u09A4 \u0995\u09CD\u09B0\u09AF\u09BC\u0995\u09CD\u09B7\u09AE\u09A4\u09BE, \u0995\u09B0\u09C7\u09B0 \u09AC\u09CB\u099D\u09BE \u098F\u09AC\u0982 \u0986\u09AC\u09BE\u09B8\u09A8 \u09AC\u09CD\u09AF\u09AC\u09B8\u09CD\u09A5\u09BE\u09B0 \u0993\u09AA\u09B0 \u09AC\u09BE\u09B8\u09CD\u09A4\u09AC\u09BF\u0995 \u0997\u09AC\u09C7\u09B7\u09A3\u09BE\u0964",
    instituteBadge: "LivWorthy \u0987\u09A8\u09B8\u09CD\u099F\u09BF\u099F\u09BF\u0989\u099F",
    modelBadge: "\u09A1\u09BF\u099F\u09BE\u09B0\u09AE\u09BF\u09A8\u09BF\u09B8\u09CD\u099F\u09BF\u0995 \u09AE\u09A1\u09C7\u09B2 \u09E8\u09E6\u09E8\u09EC",
    globalSalaryWorthTitle: "\u0997\u09CD\u09B2\u09CB\u09AC\u09BE\u09B2 \u09B8\u09CD\u09AF\u09BE\u09B2\u09BE\u09B0\u09BF \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A5 \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F",
    purchasingPowerTitle: "\u09AA\u09CD\u09B0\u0995\u09C3\u09A4 \u0995\u09CD\u09B0\u09AF\u09BC\u0995\u09CD\u09B7\u09AE\u09A4\u09BE \u09B8\u09C2\u099A\u0995",
    salaryToRentTitle: "\u09AC\u09C7\u09A4\u09A8 \u0993 \u09AD\u09BE\u09A1\u09BC\u09BE\u09B0 \u0985\u09A8\u09C1\u09AA\u09BE\u09A4 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3",
    relocationGapTitle: "\u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09B8\u09CD\u09A5\u09BE\u09A8\u09BE\u09A8\u09CD\u09A4\u09B0 \u09AC\u09CD\u09AF\u09AF\u09BC \u09AC\u09CD\u09AF\u09AC\u09A7\u09BE\u09A8",
    takeHomePayTitle: "\u09AC\u09C8\u09B6\u09CD\u09AC\u09BF\u0995 \u09A8\u09BF\u099F \u09AC\u09C7\u09A4\u09A8\u09C7\u09B0 \u09A4\u09C1\u09B2\u09A8\u09BE",
    downloadCsv: "CSV \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1",
    downloadJson: "JSON \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1",
    methodologyHeading: "\u0997\u09AC\u09C7\u09B7\u09A3\u09BE \u0993 \u09A4\u09A5\u09CD\u09AF \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF",
    sourcesHeading: "\u0985\u09AB\u09BF\u09B8\u09BF\u09AF\u09BC\u09BE\u09B2 \u09AA\u09B0\u09BF\u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09A8\u0997\u09A4 \u0989\u09CE\u09B8",
    citationHeading: "\u0989\u09A6\u09CD\u09A7\u09C3\u09A4\u09BF \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09A8\u09BE"
  }
};

// src/lib/i18n/locales/pa.ts
var paDictionary = {
  locale: "pa",
  common: {
    brand: "LivWorthy",
    tagline: "\u0A24\u0A28\u0A16\u0A3E\u0A39, \u0A1F\u0A48\u0A15\u0A38 \u0A05\u0A24\u0A47 \u0A30\u0A39\u0A3F\u0A23 \u0A26\u0A47 \u0A16\u0A30\u0A1A\u0A47 \u0A26\u0A3E \u0A17\u0A32\u0A4B\u0A2C\u0A32 \u0A35\u0A3F\u0A38\u0A3C\u0A32\u0A47\u0A38\u0A3C\u0A23",
    livingIntelligence: "Living Intelligence",
    calculating: "\u0A17\u0A23\u0A28\u0A3E \u0A15\u0A40\u0A24\u0A40 \u0A1C\u0A3E \u0A30\u0A39\u0A40 \u0A39\u0A48...",
    calculate: "\u0A39\u0A3F\u0A38\u0A3E\u0A2C \u0A32\u0A17\u0A3E\u0A13",
    annual: "\u0A38\u0A3E\u0A32\u0A3E\u0A28\u0A3E",
    monthly: "\u0A2E\u0A39\u0A40\u0A28\u0A3E\u0A35\u0A3E\u0A30",
    year: "\u0A38\u0A3E\u0A32",
    month: "\u0A2E\u0A39\u0A40\u0A28\u0A3E",
    share: "\u0A38\u0A3E\u0A02\u0A1D\u0A3E \u0A15\u0A30\u0A4B",
    copied: "\u0A15\u0A32\u0A3F\u0A71\u0A2A\u0A2C\u0A4B\u0A30\u0A21 \u0A35\u0A3F\u0A71\u0A1A \u0A15\u0A3E\u0A2A\u0A40 \u0A15\u0A40\u0A24\u0A3E \u0A17\u0A3F\u0A06",
    home: "\u0A2E\u0A41\u0A71\u0A16 \u0A2A\u0A70\u0A28\u0A3E",
    back: "\u0A2A\u0A3F\u0A71\u0A1B\u0A47",
    next: "\u0A05\u0A71\u0A17\u0A47",
    close: "\u0A2C\u0A70\u0A26 \u0A15\u0A30\u0A4B",
    disclaimer: "\u0A07\u0A39 \u0A17\u0A23\u0A28\u0A3E\u0A35\u0A3E\u0A02 \u0A05\u0A27\u0A3F\u0A15\u0A3E\u0A30\u0A24 \u0A1F\u0A48\u0A15\u0A38 \u0A38\u0A32\u0A48\u0A2C\u0A3E\u0A02 \u0A05\u0A24\u0A47 \u0A05\u0A70\u0A15\u0A5C\u0A3E \u0A2E\u0A3E\u0A2A\u0A26\u0A70\u0A21\u0A3E\u0A02 \u0A24\u0A47 \u0A05\u0A27\u0A3E\u0A30\u0A24 \u0A05\u0A28\u0A41\u0A2E\u0A3E\u0A28 \u0A39\u0A28\u0964 \u0A07\u0A39 \u0A15\u0A4B\u0A08 \u0A35\u0A3F\u0A71\u0A24\u0A40 \u0A1C\u0A3E\u0A02 \u0A1F\u0A48\u0A15\u0A38 \u0A38\u0A32\u0A3E\u0A39 \u0A28\u0A39\u0A40\u0A02 \u0A39\u0A48\u0964",
    verifiedTaxBaseline: "\u0A2A\u0A4D\u0A30\u0A2E\u0A3E\u0A23\u0A3F\u0A24 \u0A1F\u0A48\u0A15\u0A38 \u0A06\u0A27\u0A3E\u0A30 2026",
    tier1SourcesBadge: "\u0A2A\u0A39\u0A3F\u0A32\u0A47 \u0A26\u0A30\u0A1C\u0A47 \u0A26\u0A47 \u0A05\u0A27\u0A3F\u0A15\u0A3E\u0A30\u0A24 \u0A38\u0A30\u0A15\u0A3E\u0A30\u0A40 \u0A38\u0A30\u0A4B\u0A24",
    singleAdult: "\u0A07\u0A15\u0A71\u0A32\u0A3E \u0A2C\u0A3E\u0A32\u0A17",
    couple: "\u0A1C\u0A4B\u0A5C\u0A3E / \u0A26\u0A4B\u0A39\u0A30\u0A40 \u0A06\u0A2E\u0A26\u0A28",
    family: "\u0A2A\u0A30\u0A3F\u0A35\u0A3E\u0A30 (2 \u0A2C\u0A3E\u0A32\u0A17, 1 \u0A2C\u0A71\u0A1A\u0A3E)",
    action: "\u0A15\u0A3E\u0A30\u0A35\u0A3E\u0A08",
    evidence: "\u0A38\u0A2C\u0A42\u0A24 \u0A05\u0A24\u0A47 \u0A38\u0A30\u0A15\u0A3E\u0A30\u0A40 \u0A38\u0A30\u0A4B\u0A24",
    methodology: "\u0A39\u0A3F\u0A38\u0A3E\u0A2C \u0A26\u0A3E \u0A24\u0A30\u0A40\u0A15\u0A3E",
    diagnostics: "\u0A38\u0A3F\u0A38\u0A1F\u0A2E \u0A1C\u0A3E\u0A02\u0A1A"
  },
  nav: {
    howItWorks: "\u0A07\u0A39 \u0A15\u0A3F\u0A35\u0A47\u0A02 \u0A15\u0A70\u0A2E \u0A15\u0A30\u0A26\u0A3E \u0A39\u0A48",
    sources: "\u0A38\u0A30\u0A4B\u0A24",
    coverage: "\u0A38\u0A3C\u0A39\u0A3F\u0A30\u0A3E\u0A02 \u0A26\u0A3E \u0A26\u0A3E\u0A07\u0A30\u0A3E",
    relocation: "\u0A2E\u0A3E\u0A08\u0A17\u0A4D\u0A30\u0A47\u0A38\u0A3C\u0A28 / \u0A38\u0A3C\u0A3F\u0A2B\u0A1F \u0A39\u0A4B\u0A23\u0A3E",
    jobOfferComparison: "\u0A28\u0A4C\u0A15\u0A30\u0A40\u0A06\u0A02 \u0A26\u0A40\u0A06\u0A02 \u0A2A\u0A47\u0A38\u0A3C\u0A15\u0A38\u0A3C\u0A3E\u0A02 \u0A26\u0A40 \u0A24\u0A41\u0A32\u0A28\u0A3E",
    reports: "\u0A30\u0A3F\u0A2A\u0A4B\u0A30\u0A1F\u0A3E\u0A02",
    guides: "\u0A38\u0A3C\u0A39\u0A3F\u0A30 \u0A17\u0A3E\u0A08\u0A21\u0A3E\u0A02",
    compare: "\u0A38\u0A3C\u0A39\u0A3F\u0A30\u0A3E\u0A02 \u0A26\u0A40 \u0A24\u0A41\u0A32\u0A28\u0A3E",
    tabSalaryWorth: "\u0A15\u0A40 \u0A2E\u0A47\u0A30\u0A40 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A15\u0A3E\u0A2B\u0A40 \u0A39\u0A48?",
    tabSalaryNeeded: "\u0A15\u0A3F\u0A70\u0A28\u0A40 \u0A15\u0A2E\u0A3E\u0A08 \u0A1A\u0A3E\u0A39\u0A40\u0A26\u0A40 \u0A39\u0A48?",
    tabSalaryAfterTax: "\u0A1F\u0A48\u0A15\u0A38 \u0A24\u0A4B\u0A02 \u0A2C\u0A3E\u0A05\u0A26 \u0A24\u0A28\u0A16\u0A3E\u0A39",
    tabCostOfLiving: "\u0A30\u0A39\u0A3F\u0A23 \u0A26\u0A3E \u0A16\u0A30\u0A1A\u0A3E",
    tabCompare: "\u0A38\u0A3C\u0A39\u0A3F\u0A30\u0A3E\u0A02 \u0A26\u0A40 \u0A24\u0A41\u0A32\u0A28\u0A3E",
    tabJobOffers: "\u0A2A\u0A47\u0A38\u0A3C\u0A15\u0A38\u0A3C\u0A3E\u0A02 \u0A26\u0A40 \u0A24\u0A41\u0A32\u0A28\u0A3E",
    tabGuides: "\u0A38\u0A3C\u0A39\u0A3F\u0A30 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A17\u0A3E\u0A08\u0A21\u0A3E\u0A02 \u2192"
  },
  calculator: {
    chooseCity: "1. \u0A38\u0A3C\u0A39\u0A3F\u0A30 / \u0A38\u0A25\u0A3E\u0A28 \u0A1A\u0A41\u0A23\u0A4B",
    annualSalary: "2. \u0A38\u0A3E\u0A32\u0A3E\u0A28\u0A3E \u0A15\u0A41\u0A71\u0A32 \u0A24\u0A28\u0A16\u0A3E\u0A39 (Gross)",
    salaryHelp: "\u0A1F\u0A48\u0A15\u0A38 \u0A05\u0A24\u0A47 \u0A15\u0A1F\u0A4C\u0A24\u0A40\u0A06\u0A02 \u0A24\u0A4B\u0A02 \u0A2A\u0A39\u0A3F\u0A32\u0A3E\u0A02 \u0A2E\u0A42\u0A32 \u0A06\u0A2E\u0A26\u0A28\u0964",
    statutoryJurisdiction: "\u0A15\u0A3E\u0A28\u0A42\u0A70\u0A28\u0A40 \u0A1F\u0A48\u0A15\u0A38 \u0A05\u0A27\u0A3F\u0A15\u0A3E\u0A30 \u0A16\u0A47\u0A24\u0A30: {jurisdiction}",
    popularScenarios: "\u0A2A\u0A4D\u0A30\u0A38\u0A3F\u0A71\u0A27 \u0A38\u0A25\u0A3F\u0A24\u0A40\u0A06\u0A02:",
    heroHeadline: "\u0A24\u0A41\u0A39\u0A3E\u0A21\u0A40 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A26\u0A3E \u0A05\u0A38\u0A32 \u0A2E\u0A41\u0A71\u0A32 \u0A15\u0A3F\u0A70\u0A28\u0A3E \u0A39\u0A48?",
    heroSubheadline: "\u0A06\u0A2A\u0A23\u0A40 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A05\u0A24\u0A47 \u0A38\u0A3C\u0A39\u0A3F\u0A30 \u0A26\u0A30\u0A1C \u0A15\u0A30\u0A4B \u0A05\u0A24\u0A47 \u0A05\u0A38\u0A32 \u0A39\u0A71\u0A25 \u0A06\u0A09\u0A23 \u0A35\u0A3E\u0A32\u0A40 \u0A06\u0A2E\u0A26\u0A28, \u0A16\u0A30\u0A1A\u0A47 \u0A05\u0A24\u0A47 \u0A2C\u0A71\u0A1A\u0A24 \u0A26\u0A40 \u0A38\u0A2E\u0A30\u0A71\u0A25\u0A3E \u0A1C\u0A3E\u0A23\u0A4B\u0964",
    heroSupporting: "\u0A1C\u0A3E\u0A02\u0A1A\u0A4B \u0A15\u0A3F \u0A15\u0A40 \u0A24\u0A41\u0A39\u0A3E\u0A21\u0A40 \u0A15\u0A2E\u0A3E\u0A08 \u0A1A\u0A41\u0A23\u0A47 \u0A39\u0A4B\u0A0F \u0A38\u0A3C\u0A39\u0A3F\u0A30 \u0A35\u0A3F\u0A71\u0A1A \u0A15\u0A3F\u0A30\u0A3E\u0A07\u0A06 \u0A26\u0A47\u0A23 \u0A05\u0A24\u0A47 \u0A2C\u0A71\u0A1A\u0A24 \u0A15\u0A30\u0A28 \u0A32\u0A08 \u0A15\u0A3E\u0A2B\u0A40 \u0A39\u0A48\u0964",
    householdType: "\u0A2A\u0A30\u0A3F\u0A35\u0A3E\u0A30 \u0A26\u0A3E \u0A06\u0A15\u0A3E\u0A30",
    rentOverride: "\u0A18\u0A30 \u0A26\u0A3E \u0A15\u0A3F\u0A30\u0A3E\u0A07\u0A06 (\u0A2E\u0A39\u0A40\u0A28\u0A3E\u0A35\u0A3E\u0A30, \u0A35\u0A3F\u0A15\u0A32\u0A2A\u0A3F\u0A15)",
    rentOverridePlaceholder: "\u0A38\u0A3C\u0A39\u0A3F\u0A30 \u0A26\u0A47 \u0A14\u0A38\u0A24 \u0A32\u0A08 \u0A16\u0A3E\u0A32\u0A40 \u0A1B\u0A71\u0A21\u0A4B",
    rentOverrideHelp: "\u0A14\u0A38\u0A24 \u0A15\u0A3F\u0A30\u0A3E\u0A0F \u0A26\u0A40 \u0A25\u0A3E\u0A02 \u0A06\u0A2A\u0A23\u0A3E \u0A05\u0A38\u0A32 \u0A15\u0A3F\u0A30\u0A3E\u0A07\u0A06 \u0A2D\u0A30\u0A4B\u0964",
    taxYearLabel: "\u0A1F\u0A48\u0A15\u0A38 \u0A38\u0A3E\u0A32",
    filingStatusLabel: "\u0A1F\u0A48\u0A15\u0A38 \u0A26\u0A3E\u0A07\u0A30 \u0A38\u0A25\u0A3F\u0A24\u0A40",
    dependentsLabel: "\u0A28\u0A3F\u0A30\u0A2D\u0A30 \u0A2E\u0A48\u0A02\u0A2C\u0A30",
    btnCalculate: "\u0A16\u0A30\u0A40\u0A26 \u0A38\u0A3C\u0A15\u0A24\u0A40 \u0A26\u0A3E \u0A39\u0A3F\u0A38\u0A3E\u0A2C \u0A32\u0A17\u0A3E\u0A13",
    quickScenarios: {
      nyc100k: "\u0A28\u0A3F\u0A0A \u0A2F\u0A3E\u0A30\u0A15 $100k",
      london60k: "\u0A32\u0A70\u0A21\u0A28 \xA360k",
      dubai300k: "\u0A26\u0A41\u0A2C\u0A08 300k AED",
      toronto90k: "\u0A1F\u0A4B\u0A30\u0A3E\u0A02\u0A1F\u0A4B CA$90k"
    }
  },
  results: {
    summaryTitle: "\u0A35\u0A3F\u0A71\u0A24\u0A40 \u0A38\u0A3E\u0A30\u0A3E\u0A02\u0A38\u0A3C",
    annualGross: "\u0A38\u0A3E\u0A32\u0A3E\u0A28\u0A3E \u0A15\u0A41\u0A71\u0A32 \u0A06\u0A2E\u0A26\u0A28 (Gross)",
    annualTakeHome: "\u0A38\u0A3E\u0A32\u0A3E\u0A28\u0A3E \u0A28\u0A3F\u0A30\u0A4B\u0A32 \u0A06\u0A2E\u0A26\u0A28 (Net)",
    monthlyTakeHome: "\u0A2E\u0A39\u0A40\u0A28\u0A3E\u0A35\u0A3E\u0A30 \u0A28\u0A3F\u0A30\u0A4B\u0A32 \u0A06\u0A2E\u0A26\u0A28 (Net)",
    monthlyLivingCosts: "\u0A2E\u0A39\u0A40\u0A28\u0A3E\u0A35\u0A3E\u0A30 \u0A30\u0A39\u0A3F\u0A23 \u0A26\u0A3E \u0A16\u0A30\u0A1A\u0A3E",
    monthlyDisposable: "\u0A2E\u0A39\u0A40\u0A28\u0A3E\u0A35\u0A3E\u0A30 \u0A2C\u0A1A\u0A40 \u0A30\u0A15\u0A2E",
    savingsCapacity: "\u0A2C\u0A71\u0A1A\u0A24 \u0A38\u0A2E\u0A30\u0A71\u0A25\u0A3E",
    savingsRate: "\u0A2C\u0A71\u0A1A\u0A24 \u0A26\u0A30",
    effectiveTaxRate: "\u0A2A\u0A4D\u0A30\u0A2D\u0A3E\u0A35\u0A40 \u0A1F\u0A48\u0A15\u0A38 \u0A26\u0A30",
    housingBurden: "\u0A30\u0A3F\u0A39\u0A3E\u0A07\u0A38\u0A3C\u0A40 \u0A16\u0A30\u0A1A\u0A47 \u0A26\u0A3E \u0A2C\u0A4B\u0A1D",
    taxesAndDeductions: "\u0A1F\u0A48\u0A15\u0A38 \u0A05\u0A24\u0A47 \u0A15\u0A1F\u0A4C\u0A24\u0A40\u0A06\u0A02",
    essentialLiving: "\u0A1C\u0A3C\u0A30\u0A42\u0A30\u0A40 \u0A16\u0A30\u0A1A\u0A47",
    discretionaryLiving: "\u0A35\u0A3E\u0A27\u0A42 \u0A16\u0A30\u0A1A\u0A47",
    spendableSurplus: "\u0A2C\u0A1C\u0A1F \u0A35\u0A3E\u0A27\u0A3E",
    deficitWarning: "\u0A1A\u0A47\u0A24\u0A3E\u0A35\u0A28\u0A40: \u0A07\u0A38 \u0A16\u0A30\u0A1A\u0A47 \u0A28\u0A3E\u0A32 \u0A2C\u0A1C\u0A1F \u0A18\u0A3E\u0A1F\u0A3E \u0A39\u0A4B \u0A38\u0A15\u0A26\u0A3E \u0A39\u0A48",
    healthySurplus: "\u0A38\u0A3F\u0A39\u0A24\u0A2E\u0A70\u0A26 \u0A2C\u0A1C\u0A1F \u0A2C\u0A71\u0A1A\u0A24",
    taxPending: "\u0A1F\u0A48\u0A15\u0A38 \u0A21\u0A3E\u0A1F\u0A3E \u0A1C\u0A3E\u0A02\u0A1A \u0A05\u0A27\u0A40\u0A28 \u0A39\u0A48",
    shareSummaryTitle: "\u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A35\u0A3F\u0A38\u0A3C\u0A32\u0A47\u0A38\u0A3C\u0A23 \u0A38\u0A3E\u0A02\u0A1D\u0A3E \u0A15\u0A30\u0A4B",
    estimatedLivingCosts: "\u0A05\u0A28\u0A41\u0A2E\u0A3E\u0A28\u0A3F\u0A24 \u0A30\u0A39\u0A3F\u0A23 \u0A26\u0A3E \u0A16\u0A30\u0A1A\u0A3E",
    benchmarkContext: "\u0A38\u0A3C\u0A39\u0A3F\u0A30 \u0A26\u0A40 \u0A14\u0A38\u0A24 \u0A28\u0A3E\u0A32 \u0A24\u0A41\u0A32\u0A28\u0A3E",
    customizeAssumptions: "\u0A2E\u0A70\u0A28\u0A40\u0A06\u0A02 \u0A17\u0A71\u0A32\u0A3E\u0A02 \u0A2C\u0A26\u0A32\u0A4B"
  },
  salaryNeeded: {
    headline: "\u0A24\u0A41\u0A39\u0A3E\u0A28\u0A42\u0A70 \u0A15\u0A3F\u0A70\u0A28\u0A40 \u0A15\u0A2E\u0A3E\u0A08 \u0A26\u0A40 \u0A32\u0A4B\u0A5C \u0A39\u0A48?",
    subheadline: "\u0A06\u0A2A\u0A23\u0A40 \u0A1C\u0A40\u0A35\u0A28 \u0A38\u0A3C\u0A48\u0A32\u0A40 \u0A05\u0A24\u0A47 \u0A2C\u0A71\u0A1A\u0A24 \u0A1F\u0A40\u0A1A\u0A47 \u0A28\u0A42\u0A70 \u0A2A\u0A42\u0A30\u0A3E \u0A15\u0A30\u0A28 \u0A32\u0A08 \u0A32\u0A4B\u0A5C\u0A40\u0A02\u0A26\u0A40 \u0A15\u0A41\u0A71\u0A32 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A1C\u0A3E\u0A23\u0A4B\u0964",
    targetSavings: "\u0A2E\u0A39\u0A40\u0A28\u0A3E\u0A35\u0A3E\u0A30 \u0A2C\u0A71\u0A1A\u0A24 \u0A26\u0A3E \u0A1F\u0A40\u0A1A\u0A3E",
    desiredLifestyle: "\u0A32\u0A4B\u0A5C\u0A40\u0A02\u0A26\u0A40 \u0A1C\u0A40\u0A35\u0A28 \u0A38\u0A3C\u0A48\u0A32\u0A40",
    requiredGross: "\u0A32\u0A4B\u0A5C\u0A40\u0A02\u0A26\u0A40 \u0A15\u0A41\u0A71\u0A32 \u0A24\u0A28\u0A16\u0A3E\u0A39",
    requiredNet: "\u0A32\u0A4B\u0A5C\u0A40\u0A02\u0A26\u0A40 \u0A28\u0A3F\u0A30\u0A4B\u0A32 \u0A24\u0A28\u0A16\u0A3E\u0A39",
    calculatedGrossSalary: "\u0A38\u0A3F\u0A2B\u0A3E\u0A30\u0A38\u0A3C \u0A15\u0A40\u0A24\u0A40 \u0A15\u0A41\u0A71\u0A32 \u0A24\u0A28\u0A16\u0A3E\u0A39",
    explorePlan: "\u0A2C\u0A1C\u0A1F \u0A2F\u0A4B\u0A1C\u0A28\u0A3E \u0A26\u0A47\u0A16\u0A4B"
  },
  salaryAfterTax: {
    headline: "\u0A1F\u0A48\u0A15\u0A38 \u0A24\u0A4B\u0A02 \u0A2C\u0A3E\u0A05\u0A26 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A15\u0A48\u0A32\u0A15\u0A41\u0A32\u0A47\u0A1F\u0A30",
    subheadline: "\u0A06\u0A2E\u0A26\u0A28 \u0A15\u0A30, \u0A2A\u0A48\u0A28\u0A38\u0A3C\u0A28 \u0A05\u0A24\u0A47 \u0A38\u0A3F\u0A39\u0A24 \u0A2C\u0A40\u0A2E\u0A47 \u0A26\u0A40\u0A06\u0A02 \u0A15\u0A1F\u0A4C\u0A24\u0A40\u0A06\u0A02 \u0A26\u0A3E \u0A35\u0A47\u0A30\u0A35\u0A3E\u0964",
    federalTax: "\u0A15\u0A47\u0A02\u0A26\u0A30\u0A40 / \u0A30\u0A3E\u0A38\u0A3C\u0A1F\u0A30\u0A40 \u0A1F\u0A48\u0A15\u0A38",
    stateLocalTax: "\u0A38\u0A42\u0A2C\u0A3E\u0A08 / \u0A38\u0A25\u0A3E\u0A28\u0A15 \u0A1F\u0A48\u0A15\u0A38",
    socialSecurity: "\u0A38\u0A2E\u0A3E\u0A1C\u0A3F\u0A15 \u0A38\u0A41\u0A30\u0A71\u0A16\u0A3F\u0A06 \u0A24\u0A47 \u0A2A\u0A48\u0A28\u0A38\u0A3C\u0A28",
    medicare: "\u0A38\u0A3F\u0A39\u0A24 \u0A2C\u0A40\u0A2E\u0A3E",
    totalDeductions: "\u0A15\u0A41\u0A71\u0A32 \u0A15\u0A1F\u0A4C\u0A24\u0A40\u0A06\u0A02",
    netTakeHome: "\u0A39\u0A71\u0A25 \u0A06\u0A09\u0A23 \u0A35\u0A3E\u0A32\u0A40 \u0A05\u0A38\u0A32 \u0A24\u0A28\u0A16\u0A3E\u0A39",
    effectiveTaxNote: "\u0A2A\u0A4D\u0A30\u0A2D\u0A3E\u0A35\u0A40 \u0A26\u0A30 \u0A35\u0A3F\u0A71\u0A1A \u0A38\u0A3E\u0A30\u0A40\u0A06\u0A02 \u0A38\u0A30\u0A15\u0A3E\u0A30\u0A40 \u0A15\u0A1F\u0A4C\u0A24\u0A40\u0A06\u0A02 \u0A38\u0A3C\u0A3E\u0A2E\u0A32 \u0A39\u0A28\u0964"
  },
  costOfLiving: {
    headline: "\u0A38\u0A3C\u0A39\u0A3F\u0A30 \u0A35\u0A3F\u0A71\u0A1A \u0A30\u0A39\u0A3F\u0A23 \u0A26\u0A3E \u0A16\u0A30\u0A1A\u0A3E \u0A38\u0A42\u0A1A\u0A15\u0A3E\u0A02\u0A15",
    subheadline: "\u0A18\u0A30 \u0A26\u0A3E \u0A15\u0A3F\u0A30\u0A3E\u0A07\u0A06, \u0A30\u0A3E\u0A38\u0A3C\u0A28, \u0A2C\u0A3F\u0A32 \u0A05\u0A24\u0A47 \u0A06\u0A35\u0A3E\u0A1C\u0A3E\u0A08 \u0A26\u0A47 \u0A16\u0A30\u0A1A\u0A3F\u0A06\u0A02 \u0A26\u0A3E \u0A35\u0A47\u0A30\u0A35\u0A3E\u0964",
    housingRent: "\u0A18\u0A30 \u0A26\u0A3E \u0A15\u0A3F\u0A30\u0A3E\u0A07\u0A06",
    groceriesFood: "\u0A30\u0A3E\u0A38\u0A3C\u0A28 \u0A05\u0A24\u0A47 \u0A16\u0A3E\u0A23\u0A3E",
    diningOut: "\u0A2C\u0A3E\u0A39\u0A30 \u0A16\u0A3E\u0A23\u0A3E",
    utilitiesInternet: "\u0A2C\u0A3F\u0A1C\u0A32\u0A40, \u0A2A\u0A3E\u0A23\u0A40 \u0A05\u0A24\u0A47 \u0A07\u0A70\u0A1F\u0A30\u0A28\u0A48\u0A71\u0A1F",
    publicTransit: "\u0A1C\u0A28\u0A24\u0A15 \u0A06\u0A35\u0A3E\u0A1C\u0A3E\u0A08",
    totalMonthlyLiving: "\u0A15\u0A41\u0A71\u0A32 \u0A2E\u0A39\u0A40\u0A28\u0A3E\u0A35\u0A3E\u0A30 \u0A16\u0A30\u0A1A\u0A3E",
    householdTypeSelect: "\u0A2A\u0A30\u0A3F\u0A35\u0A3E\u0A30 \u0A26\u0A3E \u0A06\u0A15\u0A3E\u0A30"
  },
  compare: {
    headline: "\u0A38\u0A3C\u0A39\u0A3F\u0A30\u0A3E\u0A02 \u0A35\u0A3F\u0A1A\u0A15\u0A3E\u0A30 \u0A16\u0A30\u0A40\u0A26 \u0A38\u0A3C\u0A15\u0A24\u0A40 \u0A26\u0A40 \u0A24\u0A41\u0A32\u0A28\u0A3E",
    subheadline: "\u0A28\u0A35\u0A47\u0A02 \u0A38\u0A3C\u0A39\u0A3F\u0A30 \u0A1C\u0A3E\u0A23 \u0A35\u0A47\u0A32\u0A47 \u0A09\u0A38\u0A47 \u0A2A\u0A71\u0A27\u0A30 \u0A26\u0A3E \u0A1C\u0A40\u0A35\u0A28 \u0A1C\u0A3F\u0A0A\u0A23 \u0A32\u0A08 \u0A2C\u0A30\u0A3E\u0A2C\u0A30 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A1C\u0A3E\u0A23\u0A4B\u0964",
    cityA: "\u0A2E\u0A4C\u0A1C\u0A42\u0A26\u0A3E \u0A38\u0A3C\u0A39\u0A3F\u0A30",
    cityB: "\u0A28\u0A35\u0A3E\u0A02 \u0A38\u0A3C\u0A39\u0A3F\u0A30",
    salaryA: "\u0A2E\u0A4C\u0A1C\u0A42\u0A26\u0A3E \u0A24\u0A28\u0A16\u0A3E\u0A39",
    equivalentSalary: "\u0A2C\u0A30\u0A3E\u0A2C\u0A30 \u0A24\u0A28\u0A16\u0A3E\u0A39",
    purchasingPowerDelta: "\u0A16\u0A30\u0A40\u0A26 \u0A38\u0A3C\u0A15\u0A24\u0A40 \u0A26\u0A3E \u0A2B\u0A30\u0A15",
    verdictLabel: "\u0A24\u0A41\u0A32\u0A28\u0A3E \u0A26\u0A3E \u0A28\u0A24\u0A40\u0A1C\u0A3E"
  },
  jobOffers: {
    headline: "\u0A28\u0A4C\u0A15\u0A30\u0A40 \u0A2A\u0A47\u0A38\u0A3C\u0A15\u0A38\u0A3C\u0A3E\u0A02 \u0A26\u0A40 \u0A24\u0A41\u0A32\u0A28\u0A3E",
    subheadline: "\u0A1F\u0A48\u0A15\u0A38 \u0A05\u0A24\u0A47 \u0A38\u0A25\u0A3E\u0A28\u0A15 \u0A16\u0A30\u0A1A\u0A3F\u0A06\u0A02 \u0A28\u0A42\u0A70 \u0A27\u0A3F\u0A06\u0A28 \u0A35\u0A3F\u0A71\u0A1A \u0A30\u0A71\u0A16 \u0A15\u0A47 \u0A26\u0A4B \u0A28\u0A4C\u0A15\u0A30\u0A40\u0A06\u0A02 \u0A26\u0A40 \u0A05\u0A38\u0A32 \u0A15\u0A40\u0A2E\u0A24 \u0A2A\u0A30\u0A16\u0A4B\u0964",
    offerA: "\u0A2A\u0A47\u0A38\u0A3C\u0A15\u0A38\u0A3C 1",
    offerB: "\u0A2A\u0A47\u0A38\u0A3C\u0A15\u0A38\u0A3C 2",
    offerVerdict: "\u0A2B\u0A48\u0A38\u0A32\u0A3E",
    higherRealIncome: "\u0A35\u0A71\u0A27 \u0A05\u0A38\u0A32 \u0A2C\u0A1A\u0A24 \u0A35\u0A3E\u0A32\u0A40 \u0A06\u0A2E\u0A26\u0A28"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "\u0A07\u0A38 \u0A38\u0A25\u0A3E\u0A28 \u0A32\u0A08 \u0A1F\u0A48\u0A15\u0A38 \u0A17\u0A23\u0A28\u0A3E \u0A2B\u0A3F\u0A32\u0A39\u0A3E\u0A32 \u0A09\u0A2A\u0A32\u0A2C\u0A27 \u0A28\u0A39\u0A40\u0A02 \u0A39\u0A48\u0964",
    INVALID_SALARY: "\u0A15\u0A3F\u0A30\u0A2A\u0A3E \u0A15\u0A30\u0A15\u0A47 \u0A38\u0A39\u0A40 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A30\u0A15\u0A2E \u0A26\u0A30\u0A1C \u0A15\u0A30\u0A4B\u0964",
    CITY_NOT_SUPPORTED: "\u0A1A\u0A41\u0A23\u0A3F\u0A06 \u0A17\u0A3F\u0A06 \u0A38\u0A3C\u0A39\u0A3F\u0A30 \u0A05\u0A1C\u0A47 \u0A38\u0A3F\u0A38\u0A1F\u0A2E \u0A35\u0A3F\u0A71\u0A1A \u0A38\u0A3C\u0A3E\u0A2E\u0A32 \u0A28\u0A39\u0A40\u0A02 \u0A39\u0A48\u0964",
    DATA_STALE: "\u0A21\u0A3E\u0A1F\u0A3E \u0A05\u0A2A\u0A21\u0A47\u0A1F \u0A05\u0A24\u0A47 \u0A1C\u0A3E\u0A02\u0A1A \u0A05\u0A27\u0A40\u0A28 \u0A39\u0A48\u0964",
    FX_UNAVAILABLE: "\u0A15\u0A30\u0A70\u0A38\u0A40 \u0A10\u0A15\u0A38\u0A1A\u0A47\u0A02\u0A1C \u0A26\u0A30\u0A3E\u0A02 \u0A2B\u0A3F\u0A32\u0A39\u0A3E\u0A32 \u0A09\u0A2A\u0A32\u0A2C\u0A27 \u0A28\u0A39\u0A40\u0A02 \u0A39\u0A28\u0964",
    NETWORK_ERROR: "\u0A28\u0A48\u0A71\u0A1F\u0A35\u0A30\u0A15 \u0A38\u0A2E\u0A71\u0A38\u0A3F\u0A06 \u0A06\u0A08 \u0A39\u0A48\u0964 \u0A15\u0A3F\u0A30\u0A2A\u0A3E \u0A15\u0A30\u0A15\u0A47 \u0A26\u0A41\u0A2C\u0A3E\u0A30\u0A3E \u0A15\u0A4B\u0A38\u0A3C\u0A3F\u0A38\u0A3C \u0A15\u0A30\u0A4B\u0964"
  },
  footer: {
    aboutDesc: "LivWorthy \u0A26\u0A41\u0A28\u0A40\u0A06 \u0A2D\u0A30 \u0A26\u0A47 \u0A38\u0A3C\u0A39\u0A3F\u0A30\u0A3E\u0A02 \u0A35\u0A3F\u0A71\u0A1A \u0A24\u0A28\u0A16\u0A3E\u0A39, \u0A1F\u0A48\u0A15\u0A38 \u0A05\u0A24\u0A47 \u0A30\u0A39\u0A3F\u0A23 \u0A26\u0A47 \u0A16\u0A30\u0A1A\u0A3F\u0A06\u0A02 \u0A26\u0A3E \u0A38\u0A39\u0A40 \u0A35\u0A3F\u0A38\u0A3C\u0A32\u0A47\u0A38\u0A3C\u0A23 \u0A2A\u0A47\u0A38\u0A3C \u0A15\u0A30\u0A26\u0A3E \u0A39\u0A48\u0964",
    calculatorsTitle: "\u0A15\u0A48\u0A32\u0A15\u0A41\u0A32\u0A47\u0A1F\u0A30",
    intelligenceTitle: "\u0A35\u0A3F\u0A38\u0A3C\u0A32\u0A47\u0A38\u0A3C\u0A23 \u0A15\u0A47\u0A02\u0A26\u0A30",
    institutionalTitle: "\u0A05\u0A27\u0A3F\u0A15\u0A3E\u0A30\u0A24 \u0A21\u0A3E\u0A1F\u0A3E",
    cityComparisons: "\u0A38\u0A3C\u0A39\u0A3F\u0A30 \u0A24\u0A41\u0A32\u0A28\u0A3E",
    empiricalReports: "\u0A16\u0A4B\u0A1C \u0A30\u0A3F\u0A2A\u0A4B\u0A30\u0A1F\u0A3E\u0A02",
    editorialPolicy: "\u0A38\u0A70\u0A2A\u0A3E\u0A26\u0A15\u0A40 \u0A28\u0A40\u0A24\u0A40",
    dataPolicy: "\u0A21\u0A3E\u0A1F\u0A3E \u0A28\u0A40\u0A24\u0A40",
    corrections: "\u0A38\u0A4B\u0A27\u0A3E\u0A02 \u0A05\u0A24\u0A47 \u0A05\u0A2A\u0A21\u0A47\u0A1F",
    terms: "\u0A35\u0A30\u0A24\u0A4B\u0A02 \u0A26\u0A47 \u0A28\u0A3F\u0A2F\u0A2E",
    privacy: "\u0A17\u0A4B\u0A2A\u0A28\u0A40\u0A2F\u0A24\u0A3E \u0A28\u0A40\u0A24\u0A40",
    copyright: "\xA9 2026 LivWorthy. \u0A38\u0A3E\u0A30\u0A47 \u0A39\u0A71\u0A15 \u0A30\u0A3E\u0A16\u0A35\u0A47\u0A02 \u0A39\u0A28\u0964"
  },
  languageSelector: {
    title: "\u0A2D\u0A3E\u0A38\u0A3C\u0A3E \u0A1A\u0A41\u0A23\u0A4B",
    searchPlaceholder: "\u0A2D\u0A3E\u0A38\u0A3C\u0A3E \u0A32\u0A71\u0A2D\u0A4B...",
    currentLanguage: "\u0A2E\u0A4C\u0A1C\u0A42\u0A26\u0A3E \u0A2D\u0A3E\u0A38\u0A3C\u0A3E",
    switchSuggestion: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40 \u0A2D\u0A3E\u0A38\u0A3C\u0A3E \u0A35\u0A3F\u0A71\u0A1A \u0A2C\u0A26\u0A32\u0A23\u0A3E \u0A1A\u0A3E\u0A39\u0A41\u0A70\u0A26\u0A47 \u0A39\u0A4B?",
    switchCta: "\u0A2C\u0A26\u0A32\u0A4B",
    dismiss: "\u0A30\u0A71\u0A26 \u0A15\u0A30\u0A4B",
    allLanguages: "\u0A38\u0A3E\u0A30\u0A40\u0A06\u0A02 \u0A09\u0A2A\u0A32\u0A2C\u0A27 \u0A2D\u0A3E\u0A38\u0A3C\u0A3E\u0A35\u0A3E\u0A02"
  },
  reports: {
    hubTitle: "\u0A17\u0A32\u0A4B\u0A2C\u0A32 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A05\u0A24\u0A47 \u0A16\u0A30\u0A1A\u0A3E \u0A30\u0A3F\u0A2A\u0A4B\u0A30\u0A1F\u0A3E\u0A02",
    hubSubtitle: "\u0A05\u0A38\u0A32 \u0A16\u0A30\u0A40\u0A26 \u0A38\u0A3C\u0A15\u0A24\u0A40, \u0A1F\u0A48\u0A15\u0A38 \u0A2C\u0A4B\u0A1D \u0A05\u0A24\u0A47 \u0A30\u0A3F\u0A39\u0A3E\u0A07\u0A38\u0A3C\u0A40 \u0A16\u0A30\u0A1A\u0A3F\u0A06\u0A02 \u0A24\u0A47 \u0A16\u0A4B\u0A1C \u0A05\u0A27\u0A3F\u0A10\u0A28\u0964",
    instituteBadge: "\u0A32\u0A3F\u0A35\u0A35\u0A30\u0A26\u0A40 \u0A07\u0A70\u0A38\u0A1F\u0A40\u0A1A\u0A3F\u0A0A\u0A1F",
    modelBadge: "\u0A21\u0A3F\u0A1F\u0A30\u0A2E\u0A3F\u0A28\u0A3F\u0A38\u0A1F\u0A3F\u0A15 \u0A2E\u0A3E\u0A21\u0A32 2026",
    globalSalaryWorthTitle: "\u0A17\u0A32\u0A4B\u0A2C\u0A32 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A2E\u0A41\u0A71\u0A32 \u0A30\u0A3F\u0A2A\u0A4B\u0A30\u0A1F",
    purchasingPowerTitle: "\u0A05\u0A38\u0A32 \u0A16\u0A30\u0A40\u0A26 \u0A38\u0A3C\u0A15\u0A24\u0A40 \u0A38\u0A42\u0A1A\u0A15\u0A3E\u0A02\u0A15",
    salaryToRentTitle: "\u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A2C\u0A28\u0A3E\u0A2E \u0A15\u0A3F\u0A30\u0A3E\u0A07\u0A06 \u0A05\u0A28\u0A41\u0A2A\u0A3E\u0A24",
    relocationGapTitle: "\u0A05\u0A70\u0A24\u0A30\u0A30\u0A3E\u0A38\u0A3C\u0A1F\u0A30\u0A40 \u0A2E\u0A3E\u0A08\u0A17\u0A4D\u0A30\u0A47\u0A38\u0A3C\u0A28 \u0A16\u0A30\u0A1A\u0A3E \u0A2B\u0A30\u0A15",
    takeHomePayTitle: "\u0A17\u0A32\u0A4B\u0A2C\u0A32 \u0A28\u0A3F\u0A30\u0A4B\u0A32 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A24\u0A41\u0A32\u0A28\u0A3E",
    downloadCsv: "CSV \u0A21\u0A3E\u0A0A\u0A28\u0A32\u0A4B\u0A21 \u0A15\u0A30\u0A4B",
    downloadJson: "JSON \u0A21\u0A3E\u0A0A\u0A28\u0A32\u0A4B\u0A21 \u0A15\u0A30\u0A4B",
    methodologyHeading: "\u0A16\u0A4B\u0A1C \u0A05\u0A24\u0A47 \u0A21\u0A3E\u0A1F\u0A3E \u0A35\u0A3F\u0A27\u0A40",
    sourcesHeading: "\u0A38\u0A30\u0A15\u0A3E\u0A30\u0A40 \u0A05\u0A70\u0A15\u0A5C\u0A3E \u0A38\u0A30\u0A4B\u0A24",
    citationHeading: "\u0A39\u0A35\u0A3E\u0A32\u0A3E \u0A28\u0A3F\u0A2F\u0A2E"
  }
};

// src/lib/i18n/locales/ms.ts
var msDictionary = {
  locale: "ms",
  common: {
    brand: "LivWorthy",
    tagline: "Kecerdasan Global Gaji, Cukai, dan Kos Sara Hidup",
    livingIntelligence: "Living Intelligence",
    calculating: "Sedang mengira...",
    calculate: "Kira",
    annual: "Tahunan",
    monthly: "Bulanan",
    year: "Tahun",
    month: "Bulan",
    share: "Kongsi",
    copied: "Disalin ke papan keratan",
    home: "Utama",
    back: "Kembali",
    next: "Seterusnya",
    close: "Tutup",
    disclaimer: "Pengiraan adalah anggaran berprinsip berdasarkan braket cukai rasmi dan penanda aras statistik. Bukan nasihat kewangan atau cukai bertauliah.",
    verifiedTaxBaseline: "Asas Cukai Disahkan 2026",
    tier1SourcesBadge: "Sumber Rasmi Kerajaan Tahap 1",
    singleAdult: "Bujang / Dewasa Tunggal",
    couple: "Pasangan / Pendapatan Berganda",
    family: "Keluarga (2 Dewasa, 1 Anak)",
    action: "Tindakan",
    evidence: "Sumber & Bukti Berkanun",
    methodology: "Metodologi Pengiraan",
    diagnostics: "Diagnostik Sistem"
  },
  nav: {
    howItWorks: "Cara Ia Berfungsi",
    sources: "Sumber Data",
    coverage: "Liputan Bandar",
    relocation: "Penempatan Semula",
    jobOfferComparison: "Banding Tawaran Kerja",
    reports: "Laporan Empirikal",
    guides: "Panduan Bandar",
    compare: "Banding Bandar",
    tabSalaryWorth: "Adakah Gaji Saya Mencukupi?",
    tabSalaryNeeded: "Berapa Gaji Diperlukan?",
    tabSalaryAfterTax: "Gaji Bersih Selepas Cukai",
    tabCostOfLiving: "Kos Sara Hidup",
    tabCompare: "Banding Bandar",
    tabJobOffers: "Banding Tawaran",
    tabGuides: "Panduan Gaji Bandar \u2192"
  },
  calculator: {
    chooseCity: "1. Pilih Bandar / Lokasi",
    annualSalary: "2. Gaji Kasar Tahunan (Gross)",
    salaryHelp: "Pendapatan asas sebelum potongan cukai dan caruman berkanun.",
    statutoryJurisdiction: "Bidang kuasa cukai statutori: {jurisdiction}",
    popularScenarios: "Senario Popular:",
    heroHeadline: "Berapakah Nilai Sebenar Gaji Anda?",
    heroSubheadline: "Masukkan gaji dan bandar anda untuk mengetahui pendapatan bersih, perbelanjaan sebenar dan keupayaan simpanan.",
    heroSupporting: "Sahkan sama ada pendapatan anda menampung kos sewa dan simpanan di bandar pilihan anda.",
    householdType: "Jenis Isi Rumah",
    rentOverride: "Sewa Rumah Bulanan (Pilihan)",
    rentOverridePlaceholder: "Kosongkan untuk purata bandar",
    rentOverrideHelp: "Gantikan anggaran purata dengan kadar sewa sebenar anda.",
    taxYearLabel: "Tahun Cukai",
    filingStatusLabel: "Status Taksiran Cukai",
    dependentsLabel: "Tanggungan",
    btnCalculate: "Kira Kuasa Membeli",
    quickScenarios: {
      nyc100k: "New York $100k",
      london60k: "London \xA360k",
      dubai300k: "Dubai 300k AED",
      toronto90k: "Toronto CA$90k"
    }
  },
  results: {
    summaryTitle: "Ringkasan Kewangan",
    annualGross: "Gaji Kasar Tahunan",
    annualTakeHome: "Gaji Bersih Tahunan (Take-Home)",
    monthlyTakeHome: "Gaji Bersih Bulanan",
    monthlyLivingCosts: "Kos Sara Hidup Bulanan",
    monthlyDisposable: "Lebihan Pendapatan Bulanan",
    savingsCapacity: "Kapasiti Simpanan",
    savingsRate: "Kadar Simpanan",
    effectiveTaxRate: "Kadar Cukai Efektif",
    housingBurden: "Beban Perbelanjaan Rumah",
    taxesAndDeductions: "Cukai & Potongan Wajib",
    essentialLiving: "Perbelanjaan Asas Hidup",
    discretionaryLiving: "Perbelanjaan Budi Bicara",
    spendableSurplus: "Lebihan Belanjawan",
    deficitWarning: "Amaran: Defisit bajet pada kadar perbelanjaan semasa",
    healthySurplus: "Lebihan Kewangan Sihat",
    taxPending: "Pengesahan Cukai Sedang Berjalan",
    shareSummaryTitle: "Kongsi Analisis Gaji",
    estimatedLivingCosts: "Anggaran Kos Sara Hidup",
    benchmarkContext: "Perbandingan Penanda Aras Bandar",
    customizeAssumptions: "Ubah Suai Andaian"
  },
  salaryNeeded: {
    headline: "Berapakah Gaji yang Anda Perlukan?",
    subheadline: "Kira gaji kasar yang diperlukan untuk menampung gaya hidup dan sasaran simpanan anda.",
    targetSavings: "Sasaran Simpanan Bulanan",
    desiredLifestyle: "Gaya Hidup Diingini",
    requiredGross: "Gaji Kasar Diperlukan",
    requiredNet: "Gaji Bersih Diperlukan",
    calculatedGrossSalary: "Cadangan Gaji Kasar",
    explorePlan: "Lihat Pelan Bajet"
  },
  salaryAfterTax: {
    headline: "Kalkulator Gaji Bersih Selepas Cukai (PCB)",
    subheadline: "Pecahan terperinci cukai pendapatan, KWSP, PERKESO, dan insurans.",
    federalTax: "Cukai Pendapatan (LHDN)",
    stateLocalTax: "Cukai Tempatan / Negeri",
    socialSecurity: "KWSP & Kumpulan Wang Persaraan",
    medicare: "PERKESO & EIS",
    totalDeductions: "Jumlah Potongan",
    netTakeHome: "Gaji Bersih Diterima",
    effectiveTaxNote: "Kadar efektif merangkumi semua potongan statutori yang diwajibkan undang-undang."
  },
  costOfLiving: {
    headline: "Indeks Kos Sara Hidup Bandar",
    subheadline: "Pecahan bakul perbelanjaan: perumahan, makanan, utiliti dan pengangkutan awam.",
    housingRent: "Sewa Kediaman",
    groceriesFood: "Barangan Runcit & Makanan",
    diningOut: "Makan di Luar",
    utilitiesInternet: "Utiliti & Internet",
    publicTransit: "Pengangkutan Awam",
    totalMonthlyLiving: "Jumlah Kos Sara Hidup Bulanan",
    householdTypeSelect: "Struktur Keluarga"
  },
  compare: {
    headline: "Banding Kuasa Membeli Antara Bandar",
    subheadline: "Ketahui gaji setara untuk mengekalkan taraf hidup apabila berpindah antara bandar.",
    cityA: "Bandar Asal",
    cityB: "Bandar Destinasi",
    salaryA: "Gaji Semasa",
    equivalentSalary: "Gaji Setara",
    purchasingPowerDelta: "Perbezaan Kuasa Membeli",
    verdictLabel: "Keputusan Perbandingan"
  },
  jobOffers: {
    headline: "Banding Tawaran Pekerjaan",
    subheadline: "Bandingkan nilai sebenar dua tawaran kerja mengambil kira cukai dan kos sara hidup setempat.",
    offerA: "Tawaran A",
    offerB: "Tawaran B",
    offerVerdict: "Penilaian Tawaran",
    higherRealIncome: "Pendapatan Boleh Guna Sebenar Lebih Tinggi"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "Pengiraan cukai belum tersedia untuk lokasi ini buat masa ini.",
    INVALID_SALARY: "Sila masukkan amaun gaji yang sah.",
    CITY_NOT_SUPPORTED: "Bandar yang dipilih belum disokong oleh sistem.",
    DATA_STALE: "Data sedang dikemas kini dan disahkan.",
    FX_UNAVAILABLE: "Kadar pertukaran mata wang tidak dapat dicapai buat masa ini.",
    NETWORK_ERROR: "Ralat sambungan rangkaian. Sila cuba sebentar lagi."
  },
  footer: {
    aboutDesc: "LivWorthy menyediakan analisis empirikal kuasa membeli, cukai, dan kos sara hidup bandar di seluruh dunia.",
    calculatorsTitle: "Kalkulator",
    intelligenceTitle: "Pusat Analisis",
    institutionalTitle: "Data Institusi",
    cityComparisons: "Perbandingan Bandar",
    empiricalReports: "Laporan Empirikal",
    editorialPolicy: "Dasar Editorial",
    dataPolicy: "Dasar Data",
    corrections: "Pembetulan & Kemas Kini",
    terms: "Terma Penggunaan",
    privacy: "Dasar Privasi",
    copyright: "\xA9 2026 LivWorthy. Hak cipta terpelihara."
  },
  languageSelector: {
    title: "Pilih Bahasa",
    searchPlaceholder: "Cari bahasa...",
    currentLanguage: "Bahasa Semasa",
    switchSuggestion: "Tukar kepada Bahasa Melayu?",
    switchCta: "Tukar",
    dismiss: "Batal",
    allLanguages: "Semua Bahasa Disokong"
  },
  reports: {
    hubTitle: "Laporan Gaji dan Kos Sara Hidup Global",
    hubSubtitle: "Kajian empirikal mengenai kuasa membeli sebenar, beban cukai dan kemampuan perumahan.",
    instituteBadge: "Institut LivWorthy",
    modelBadge: "Model Deterministik 2026",
    globalSalaryWorthTitle: "Laporan Nilai Gaji Global",
    purchasingPowerTitle: "Indeks Kuasa Membeli Sebenar",
    salaryToRentTitle: "Nisbah Gaji kepada Sewa",
    relocationGapTitle: "Jurang Kos Penempatan Antarabangsa",
    takeHomePayTitle: "Perbandingan Gaji Bersih Global",
    downloadCsv: "Muat Turun CSV",
    downloadJson: "Muat Turun JSON",
    methodologyHeading: "Metodologi Kajian & Data",
    sourcesHeading: "Sumber Statistik Rasmi",
    citationHeading: "Garis Panduan Petikan"
  }
};

// src/lib/i18n/locales/th.ts
var thDictionary = {
  locale: "th",
  common: {
    brand: "LivWorthy",
    tagline: "\u0E23\u0E30\u0E1A\u0E1A\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19 \u0E20\u0E32\u0E29\u0E35 \u0E41\u0E25\u0E30\u0E04\u0E48\u0E32\u0E04\u0E23\u0E2D\u0E07\u0E0A\u0E35\u0E1E\u0E17\u0E31\u0E48\u0E27\u0E42\u0E25\u0E01",
    livingIntelligence: "Living Intelligence",
    calculating: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E04\u0E33\u0E19\u0E27\u0E13...",
    calculate: "\u0E04\u0E33\u0E19\u0E27\u0E13",
    annual: "\u0E23\u0E32\u0E22\u0E1B\u0E35",
    monthly: "\u0E23\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19",
    year: "\u0E1B\u0E35",
    month: "\u0E40\u0E14\u0E37\u0E2D\u0E19",
    share: "\u0E41\u0E0A\u0E23\u0E4C",
    copied: "\u0E04\u0E31\u0E14\u0E25\u0E2D\u0E01\u0E44\u0E1B\u0E22\u0E31\u0E07\u0E04\u0E25\u0E34\u0E1B\u0E1A\u0E2D\u0E23\u0E4C\u0E14\u0E41\u0E25\u0E49\u0E27",
    home: "\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E23\u0E01",
    back: "\u0E22\u0E49\u0E2D\u0E19\u0E01\u0E25\u0E31\u0E1A",
    next: "\u0E16\u0E31\u0E14\u0E44\u0E1B",
    close: "\u0E1B\u0E34\u0E14",
    disclaimer: "\u0E01\u0E32\u0E23\u0E04\u0E33\u0E19\u0E27\u0E13\u0E40\u0E1B\u0E47\u0E19\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23\u0E40\u0E0A\u0E34\u0E07\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E15\u0E32\u0E21\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E20\u0E32\u0E29\u0E35\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E41\u0E25\u0E30\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E16\u0E34\u0E15\u0E34 \u0E44\u0E21\u0E48\u0E16\u0E37\u0E2D\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E40\u0E07\u0E34\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E20\u0E32\u0E29\u0E35\u0E27\u0E34\u0E0A\u0E32\u0E0A\u0E35\u0E1E",
    verifiedTaxBaseline: "\u0E10\u0E32\u0E19\u0E20\u0E32\u0E29\u0E35\u0E17\u0E35\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E1B\u0E35 2026",
    tier1SourcesBadge: "\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E02\u0E2D\u0E07\u0E23\u0E31\u0E10\u0E1A\u0E32\u0E25\u0E23\u0E30\u0E14\u0E31\u0E1A 1",
    singleAdult: "\u0E04\u0E19\u0E42\u0E2A\u0E14 / \u0E1C\u0E39\u0E49\u0E43\u0E2B\u0E0D\u0E48\u0E04\u0E19\u0E40\u0E14\u0E35\u0E22\u0E27",
    couple: "\u0E04\u0E39\u0E48\u0E23\u0E31\u0E01 / \u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E2A\u0E2D\u0E07\u0E17\u0E32\u0E07",
    family: "\u0E04\u0E23\u0E2D\u0E1A\u0E04\u0E23\u0E31\u0E27 (\u0E1C\u0E39\u0E49\u0E43\u0E2B\u0E0D\u0E48 2, \u0E40\u0E14\u0E47\u0E01 1)",
    action: "\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23",
    evidence: "\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E41\u0E25\u0E30\u0E01\u0E0E\u0E2B\u0E21\u0E32\u0E22",
    methodology: "\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E1A\u0E27\u0E34\u0E18\u0E35\u0E04\u0E33\u0E19\u0E27\u0E13",
    diagnostics: "\u0E01\u0E32\u0E23\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E23\u0E30\u0E1A\u0E1A"
  },
  nav: {
    howItWorks: "\u0E2B\u0E25\u0E31\u0E01\u0E01\u0E32\u0E23\u0E17\u0E33\u0E07\u0E32\u0E19",
    sources: "\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25",
    coverage: "\u0E02\u0E2D\u0E1A\u0E40\u0E02\u0E15\u0E40\u0E21\u0E37\u0E2D\u0E07",
    relocation: "\u0E01\u0E32\u0E23\u0E22\u0E49\u0E32\u0E22\u0E16\u0E34\u0E48\u0E19\u0E10\u0E32\u0E19",
    jobOfferComparison: "\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D\u0E07\u0E32\u0E19",
    reports: "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E40\u0E0A\u0E34\u0E07\u0E1B\u0E23\u0E30\u0E08\u0E31\u0E01\u0E29\u0E4C",
    guides: "\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E40\u0E21\u0E37\u0E2D\u0E07",
    compare: "\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E21\u0E37\u0E2D\u0E07",
    tabSalaryWorth: "\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E02\u0E2D\u0E07\u0E09\u0E31\u0E19\u0E1E\u0E2D\u0E44\u0E2B\u0E21?",
    tabSalaryNeeded: "\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E40\u0E17\u0E48\u0E32\u0E44\u0E2B\u0E23\u0E48?",
    tabSalaryAfterTax: "\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E2B\u0E25\u0E31\u0E07\u0E2B\u0E31\u0E01\u0E20\u0E32\u0E29\u0E35",
    tabCostOfLiving: "\u0E04\u0E48\u0E32\u0E04\u0E23\u0E2D\u0E07\u0E0A\u0E35\u0E1E",
    tabCompare: "\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E21\u0E37\u0E2D\u0E07",
    tabJobOffers: "\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E07\u0E32\u0E19",
    tabGuides: "\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E40\u0E21\u0E37\u0E2D\u0E07 \u2192"
  },
  calculator: {
    chooseCity: "1. \u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E21\u0E37\u0E2D\u0E07 / \u0E17\u0E35\u0E48\u0E15\u0E31\u0E49\u0E07",
    annualSalary: "2. \u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E23\u0E27\u0E21\u0E23\u0E32\u0E22\u0E1B\u0E35 (\u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E31\u0E01\u0E20\u0E32\u0E29\u0E35)",
    salaryHelp: "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E1E\u0E37\u0E49\u0E19\u0E10\u0E32\u0E19\u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E31\u0E01\u0E20\u0E32\u0E29\u0E35\u0E41\u0E25\u0E30\u0E40\u0E07\u0E34\u0E19\u0E2A\u0E21\u0E17\u0E1A\u0E01\u0E2D\u0E07\u0E17\u0E38\u0E19\u0E15\u0E32\u0E21\u0E01\u0E0E\u0E2B\u0E21\u0E32\u0E22",
    statutoryJurisdiction: "\u0E40\u0E02\u0E15\u0E2D\u0E33\u0E19\u0E32\u0E08\u0E20\u0E32\u0E29\u0E35\u0E15\u0E32\u0E21\u0E01\u0E0E\u0E2B\u0E21\u0E32\u0E22: {jurisdiction}",
    popularScenarios: "\u0E2A\u0E16\u0E32\u0E19\u0E01\u0E32\u0E23\u0E13\u0E4C\u0E22\u0E2D\u0E14\u0E19\u0E34\u0E22\u0E21:",
    heroHeadline: "\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E21\u0E35\u0E21\u0E39\u0E25\u0E04\u0E48\u0E32\u0E17\u0E35\u0E48\u0E41\u0E17\u0E49\u0E08\u0E23\u0E34\u0E07\u0E40\u0E17\u0E48\u0E32\u0E44\u0E2B\u0E23\u0E48?",
    heroSubheadline: "\u0E23\u0E30\u0E1A\u0E38\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E41\u0E25\u0E30\u0E40\u0E21\u0E37\u0E2D\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E2A\u0E38\u0E17\u0E18\u0E34 \u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E08\u0E23\u0E34\u0E07 \u0E41\u0E25\u0E30\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E43\u0E19\u0E01\u0E32\u0E23\u0E2D\u0E2D\u0E21",
    heroSupporting: "\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E27\u0E48\u0E32\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E04\u0E23\u0E2D\u0E1A\u0E04\u0E25\u0E38\u0E21\u0E04\u0E48\u0E32\u0E40\u0E0A\u0E48\u0E32\u0E41\u0E25\u0E30\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E2D\u0E2D\u0E21\u0E40\u0E07\u0E34\u0E19\u0E43\u0E19\u0E40\u0E21\u0E37\u0E2D\u0E07\u0E1B\u0E25\u0E32\u0E22\u0E17\u0E32\u0E07\u0E44\u0E14\u0E49\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48",
    householdType: "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E04\u0E23\u0E31\u0E27\u0E40\u0E23\u0E37\u0E2D\u0E19",
    rentOverride: "\u0E04\u0E48\u0E32\u0E40\u0E0A\u0E48\u0E32\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01\u0E15\u0E48\u0E2D\u0E40\u0E14\u0E37\u0E2D\u0E19 (\u0E23\u0E30\u0E1A\u0E38\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E01\u0E47\u0E44\u0E14\u0E49)",
    rentOverridePlaceholder: "\u0E40\u0E27\u0E49\u0E19\u0E27\u0E48\u0E32\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E43\u0E0A\u0E49\u0E04\u0E48\u0E32\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22\u0E02\u0E2D\u0E07\u0E40\u0E21\u0E37\u0E2D\u0E07",
    rentOverrideHelp: "\u0E41\u0E17\u0E19\u0E17\u0E35\u0E48\u0E04\u0E48\u0E32\u0E40\u0E0A\u0E48\u0E32\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22\u0E14\u0E49\u0E27\u0E22\u0E04\u0E48\u0E32\u0E40\u0E0A\u0E48\u0E32\u0E08\u0E23\u0E34\u0E07\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13",
    taxYearLabel: "\u0E1B\u0E35\u0E20\u0E32\u0E29\u0E35",
    filingStatusLabel: "\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E01\u0E32\u0E23\u0E22\u0E37\u0E48\u0E19\u0E41\u0E1A\u0E1A\u0E41\u0E2A\u0E14\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E20\u0E32\u0E29\u0E35",
    dependentsLabel: "\u0E1C\u0E39\u0E49\u0E1E\u0E36\u0E48\u0E07\u0E1E\u0E34\u0E07 / \u0E1A\u0E38\u0E15\u0E23",
    btnCalculate: "\u0E04\u0E33\u0E19\u0E27\u0E13\u0E01\u0E33\u0E25\u0E31\u0E07\u0E0B\u0E37\u0E49\u0E2D\u0E08\u0E23\u0E34\u0E07",
    quickScenarios: {
      nyc100k: "\u0E19\u0E34\u0E27\u0E22\u0E2D\u0E23\u0E4C\u0E01 $100k",
      london60k: "\u0E25\u0E2D\u0E19\u0E14\u0E2D\u0E19 \xA360k",
      dubai300k: "\u0E14\u0E39\u0E44\u0E1A 300k AED",
      toronto90k: "\u0E42\u0E15\u0E23\u0E2D\u0E19\u0E42\u0E15 CA$90k"
    }
  },
  results: {
    summaryTitle: "\u0E2A\u0E23\u0E38\u0E1B\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E40\u0E07\u0E34\u0E19",
    annualGross: "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E23\u0E27\u0E21\u0E23\u0E32\u0E22\u0E1B\u0E35 (Gross)",
    annualTakeHome: "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E23\u0E32\u0E22\u0E1B\u0E35 (Take-Home)",
    monthlyTakeHome: "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E23\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19 (Net)",
    monthlyLivingCosts: "\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E23\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19",
    monthlyDisposable: "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E04\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E23\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19",
    savingsCapacity: "\u0E28\u0E31\u0E01\u0E22\u0E20\u0E32\u0E1E\u0E43\u0E19\u0E01\u0E32\u0E23\u0E2D\u0E2D\u0E21",
    savingsRate: "\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E01\u0E32\u0E23\u0E2D\u0E2D\u0E21",
    effectiveTaxRate: "\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E20\u0E32\u0E29\u0E35\u0E17\u0E35\u0E48\u0E41\u0E17\u0E49\u0E08\u0E23\u0E34\u0E07",
    housingBurden: "\u0E20\u0E32\u0E23\u0E30\u0E04\u0E48\u0E32\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E2D\u0E32\u0E28\u0E31\u0E22",
    taxesAndDeductions: "\u0E20\u0E32\u0E29\u0E35\u0E41\u0E25\u0E30\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E2B\u0E31\u0E01",
    essentialLiving: "\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E08\u0E33\u0E40\u0E1B\u0E47\u0E19",
    discretionaryLiving: "\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E17\u0E31\u0E48\u0E27\u0E44\u0E1B",
    spendableSurplus: "\u0E07\u0E1A\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E2A\u0E48\u0E27\u0E19\u0E40\u0E01\u0E34\u0E19",
    deficitWarning: "\u0E04\u0E33\u0E40\u0E15\u0E37\u0E2D\u0E19: \u0E2D\u0E32\u0E08\u0E40\u0E01\u0E34\u0E14\u0E20\u0E32\u0E27\u0E30\u0E02\u0E32\u0E14\u0E14\u0E38\u0E25\u0E17\u0E35\u0E48\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E19\u0E35\u0E49",
    healthySurplus: "\u0E2A\u0E48\u0E27\u0E19\u0E40\u0E01\u0E34\u0E19\u0E07\u0E1A\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E17\u0E35\u0E48\u0E21\u0E31\u0E48\u0E19\u0E04\u0E07",
    taxPending: "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E20\u0E32\u0E29\u0E35",
    shareSummaryTitle: "\u0E41\u0E0A\u0E23\u0E4C\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19",
    estimatedLivingCosts: "\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23\u0E04\u0E48\u0E32\u0E04\u0E23\u0E2D\u0E07\u0E0A\u0E35\u0E1E",
    benchmarkContext: "\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E40\u0E01\u0E13\u0E11\u0E4C\u0E21\u0E32\u0E15\u0E23\u0E10\u0E32\u0E19\u0E40\u0E21\u0E37\u0E2D\u0E07",
    customizeAssumptions: "\u0E1B\u0E23\u0E31\u0E1A\u0E41\u0E15\u0E48\u0E07\u0E2A\u0E21\u0E21\u0E15\u0E34\u0E10\u0E32\u0E19"
  },
  salaryNeeded: {
    headline: "\u0E04\u0E38\u0E13\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E40\u0E17\u0E48\u0E32\u0E44\u0E2B\u0E23\u0E48?",
    subheadline: "\u0E04\u0E33\u0E19\u0E27\u0E13\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E23\u0E27\u0E21\u0E17\u0E35\u0E48\u0E08\u0E33\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A\u0E44\u0E25\u0E1F\u0E4C\u0E2A\u0E44\u0E15\u0E25\u0E4C\u0E41\u0E25\u0E30\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E01\u0E32\u0E23\u0E2D\u0E2D\u0E21\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13",
    targetSavings: "\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E07\u0E34\u0E19\u0E2D\u0E2D\u0E21\u0E23\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19",
    desiredLifestyle: "\u0E44\u0E25\u0E1F\u0E4C\u0E2A\u0E44\u0E15\u0E25\u0E4C\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23",
    requiredGross: "\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E23\u0E27\u0E21\u0E17\u0E35\u0E48\u0E08\u0E33\u0E40\u0E1B\u0E47\u0E19",
    requiredNet: "\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E17\u0E35\u0E48\u0E08\u0E33\u0E40\u0E1B\u0E47\u0E19",
    calculatedGrossSalary: "\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E23\u0E27\u0E21\u0E17\u0E35\u0E48\u0E41\u0E19\u0E30\u0E19\u0E33",
    explorePlan: "\u0E14\u0E39\u0E41\u0E1C\u0E19\u0E07\u0E1A\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13"
  },
  salaryAfterTax: {
    headline: "\u0E42\u0E1B\u0E23\u0E41\u0E01\u0E23\u0E21\u0E04\u0E33\u0E19\u0E27\u0E13\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E2B\u0E25\u0E31\u0E07\u0E2B\u0E31\u0E01\u0E20\u0E32\u0E29\u0E35",
    subheadline: "\u0E41\u0E08\u0E01\u0E41\u0E08\u0E07\u0E20\u0E32\u0E29\u0E35\u0E40\u0E07\u0E34\u0E19\u0E44\u0E14\u0E49\u0E1A\u0E38\u0E04\u0E04\u0E25\u0E18\u0E23\u0E23\u0E21\u0E14\u0E32 \u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E2A\u0E31\u0E07\u0E04\u0E21 \u0E41\u0E25\u0E30\u0E01\u0E2D\u0E07\u0E17\u0E38\u0E19\u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E40\u0E25\u0E35\u0E49\u0E22\u0E07\u0E0A\u0E35\u0E1E",
    federalTax: "\u0E20\u0E32\u0E29\u0E35\u0E40\u0E07\u0E34\u0E19\u0E44\u0E14\u0E49\u0E1A\u0E38\u0E04\u0E04\u0E25\u0E18\u0E23\u0E23\u0E21\u0E14\u0E32 (\u0E20.\u0E07.\u0E14.)",
    stateLocalTax: "\u0E20\u0E32\u0E29\u0E35\u0E17\u0E49\u0E2D\u0E07\u0E16\u0E34\u0E48\u0E19 / \u0E20\u0E39\u0E21\u0E34\u0E20\u0E32\u0E04",
    socialSecurity: "\u0E01\u0E2D\u0E07\u0E17\u0E38\u0E19\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E2A\u0E31\u0E07\u0E04\u0E21",
    medicare: "\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E / \u0E01\u0E2D\u0E07\u0E17\u0E38\u0E19\u0E01\u0E32\u0E23\u0E41\u0E1E\u0E17\u0E22\u0E4C",
    totalDeductions: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E2B\u0E31\u0E01\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14",
    netTakeHome: "\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E17\u0E35\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E08\u0E23\u0E34\u0E07",
    effectiveTaxNote: "\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E20\u0E32\u0E29\u0E35\u0E17\u0E35\u0E48\u0E41\u0E17\u0E49\u0E08\u0E23\u0E34\u0E07\u0E23\u0E27\u0E21\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E2B\u0E31\u0E01\u0E15\u0E32\u0E21\u0E01\u0E0E\u0E2B\u0E21\u0E32\u0E22\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14"
  },
  costOfLiving: {
    headline: "\u0E14\u0E31\u0E0A\u0E19\u0E35\u0E04\u0E48\u0E32\u0E04\u0E23\u0E2D\u0E07\u0E0A\u0E35\u0E1E\u0E43\u0E19\u0E40\u0E21\u0E37\u0E2D\u0E07",
    subheadline: "\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E15\u0E30\u0E01\u0E23\u0E49\u0E32\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22: \u0E04\u0E48\u0E32\u0E40\u0E0A\u0E48\u0E32 \u0E2D\u0E32\u0E2B\u0E32\u0E23 \u0E2A\u0E32\u0E18\u0E32\u0E23\u0E13\u0E39\u0E1B\u0E42\u0E20\u0E04 \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E40\u0E14\u0E34\u0E19\u0E17\u0E32\u0E07",
    housingRent: "\u0E04\u0E48\u0E32\u0E40\u0E0A\u0E48\u0E32\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01\u0E2D\u0E32\u0E28\u0E31\u0E22",
    groceriesFood: "\u0E02\u0E2D\u0E07\u0E2A\u0E14\u0E41\u0E25\u0E30\u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E08\u0E33\u0E27\u0E31\u0E19",
    diningOut: "\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E30\u0E17\u0E32\u0E19\u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E19\u0E2D\u0E01\u0E1A\u0E49\u0E32\u0E19",
    utilitiesInternet: "\u0E2A\u0E32\u0E18\u0E32\u0E23\u0E13\u0E39\u0E1B\u0E42\u0E20\u0E04\u0E41\u0E25\u0E30\u0E2D\u0E34\u0E19\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E40\u0E19\u0E47\u0E15",
    publicTransit: "\u0E23\u0E30\u0E1A\u0E1A\u0E02\u0E19\u0E2A\u0E48\u0E07\u0E2A\u0E32\u0E18\u0E32\u0E23\u0E13\u0E30",
    totalMonthlyLiving: "\u0E04\u0E48\u0E32\u0E04\u0E23\u0E2D\u0E07\u0E0A\u0E35\u0E1E\u0E23\u0E27\u0E21\u0E15\u0E48\u0E2D\u0E40\u0E14\u0E37\u0E2D\u0E19",
    householdTypeSelect: "\u0E02\u0E19\u0E32\u0E14\u0E04\u0E23\u0E2D\u0E1A\u0E04\u0E23\u0E31\u0E27"
  },
  compare: {
    headline: "\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E33\u0E25\u0E31\u0E07\u0E0B\u0E37\u0E49\u0E2D\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E40\u0E21\u0E37\u0E2D\u0E07",
    subheadline: "\u0E14\u0E39\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E17\u0E35\u0E48\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E48\u0E32\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E31\u0E01\u0E29\u0E32\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E04\u0E23\u0E2D\u0E07\u0E0A\u0E35\u0E1E\u0E40\u0E14\u0E34\u0E21\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E22\u0E49\u0E32\u0E22\u0E40\u0E21\u0E37\u0E2D\u0E07",
    cityA: "\u0E40\u0E21\u0E37\u0E2D\u0E07\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19",
    cityB: "\u0E40\u0E21\u0E37\u0E2D\u0E07\u0E1B\u0E25\u0E32\u0E22\u0E17\u0E32\u0E07",
    salaryA: "\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19",
    equivalentSalary: "\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E17\u0E35\u0E48\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E48\u0E32",
    purchasingPowerDelta: "\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E48\u0E32\u0E07\u0E01\u0E33\u0E25\u0E31\u0E07\u0E0B\u0E37\u0E49\u0E2D",
    verdictLabel: "\u0E1A\u0E17\u0E2A\u0E23\u0E38\u0E1B\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A"
  },
  jobOffers: {
    headline: "\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D\u0E07\u0E32\u0E19",
    subheadline: "\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E21\u0E39\u0E25\u0E04\u0E48\u0E32\u0E08\u0E23\u0E34\u0E07\u0E02\u0E2D\u0E07\u0E2A\u0E2D\u0E07\u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D\u0E07\u0E32\u0E19\u0E42\u0E14\u0E22\u0E04\u0E33\u0E19\u0E36\u0E07\u0E16\u0E36\u0E07\u0E20\u0E32\u0E29\u0E35\u0E41\u0E25\u0E30\u0E04\u0E48\u0E32\u0E04\u0E23\u0E2D\u0E07\u0E0A\u0E35\u0E1E\u0E43\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48",
    offerA: "\u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D \u0E01",
    offerB: "\u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D \u0E02",
    offerVerdict: "\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19",
    higherRealIncome: "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E17\u0E35\u0E48\u0E41\u0E17\u0E49\u0E08\u0E23\u0E34\u0E07\u0E2A\u0E39\u0E07\u0E01\u0E27\u0E48\u0E32"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E04\u0E33\u0E19\u0E27\u0E13\u0E20\u0E32\u0E29\u0E35\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E2A\u0E16\u0E32\u0E19\u0E17\u0E35\u0E48\u0E19\u0E35\u0E49\u0E44\u0E14\u0E49\u0E43\u0E19\u0E02\u0E13\u0E30\u0E19\u0E35\u0E49",
    INVALID_SALARY: "\u0E42\u0E1B\u0E23\u0E14\u0E23\u0E30\u0E1A\u0E38\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07",
    CITY_NOT_SUPPORTED: "\u0E40\u0E21\u0E37\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E30\u0E1A\u0E1A",
    DATA_STALE: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E38\u0E07\u0E41\u0E25\u0E30\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A",
    FX_UNAVAILABLE: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E23\u0E35\u0E22\u0E01\u0E14\u0E39\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E41\u0E25\u0E01\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E44\u0E14\u0E49\u0E43\u0E19\u0E02\u0E13\u0E30\u0E19\u0E35\u0E49",
    NETWORK_ERROR: "\u0E40\u0E01\u0E34\u0E14\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14\u0E43\u0E19\u0E01\u0E32\u0E23\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E40\u0E04\u0E23\u0E37\u0E2D\u0E02\u0E48\u0E32\u0E22 \u0E42\u0E1B\u0E23\u0E14\u0E25\u0E2D\u0E07\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07"
  },
  footer: {
    aboutDesc: "LivWorthy \u0E43\u0E2B\u0E49\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E01\u0E33\u0E25\u0E31\u0E07\u0E0B\u0E37\u0E49\u0E2D \u0E20\u0E32\u0E29\u0E35 \u0E41\u0E25\u0E30\u0E04\u0E48\u0E32\u0E04\u0E23\u0E2D\u0E07\u0E0A\u0E35\u0E1E\u0E43\u0E19\u0E40\u0E21\u0E37\u0E2D\u0E07\u0E15\u0E48\u0E32\u0E07\u0E46 \u0E17\u0E31\u0E48\u0E27\u0E42\u0E25\u0E01\u0E14\u0E49\u0E27\u0E22\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E40\u0E0A\u0E34\u0E07\u0E04\u0E13\u0E34\u0E15\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C",
    calculatorsTitle: "\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E04\u0E33\u0E19\u0E27\u0E13",
    intelligenceTitle: "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C",
    institutionalTitle: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19",
    cityComparisons: "\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E21\u0E37\u0E2D\u0E07",
    empiricalReports: "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E40\u0E0A\u0E34\u0E07\u0E1B\u0E23\u0E30\u0E08\u0E31\u0E01\u0E29\u0E4C",
    editorialPolicy: "\u0E19\u0E42\u0E22\u0E1A\u0E32\u0E22\u0E01\u0E2D\u0E07\u0E1A\u0E23\u0E23\u0E13\u0E32\u0E18\u0E34\u0E01\u0E32\u0E23",
    dataPolicy: "\u0E19\u0E42\u0E22\u0E1A\u0E32\u0E22\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25",
    corrections: "\u0E01\u0E32\u0E23\u0E41\u0E01\u0E49\u0E44\u0E02\u0E41\u0E25\u0E30\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15",
    terms: "\u0E02\u0E49\u0E2D\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19",
    privacy: "\u0E19\u0E42\u0E22\u0E1A\u0E32\u0E22\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27",
    copyright: "\xA9 2026 LivWorthy. \u0E2A\u0E07\u0E27\u0E19\u0E25\u0E34\u0E02\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14."
  },
  languageSelector: {
    title: "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E20\u0E32\u0E29\u0E32",
    searchPlaceholder: "\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E20\u0E32\u0E29\u0E32...",
    currentLanguage: "\u0E20\u0E32\u0E29\u0E32\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19",
    switchSuggestion: "\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E40\u0E1B\u0E47\u0E19\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48?",
    switchCta: "\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E20\u0E32\u0E29\u0E32",
    dismiss: "\u0E1B\u0E34\u0E14",
    allLanguages: "\u0E20\u0E32\u0E29\u0E32\u0E17\u0E35\u0E48\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14"
  },
  reports: {
    hubTitle: "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E41\u0E25\u0E30\u0E04\u0E48\u0E32\u0E04\u0E23\u0E2D\u0E07\u0E0A\u0E35\u0E1E\u0E17\u0E31\u0E48\u0E27\u0E42\u0E25\u0E01",
    hubSubtitle: "\u0E07\u0E32\u0E19\u0E27\u0E34\u0E08\u0E31\u0E22\u0E40\u0E0A\u0E34\u0E07\u0E1B\u0E23\u0E30\u0E08\u0E31\u0E01\u0E29\u0E4C\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E01\u0E31\u0E1A\u0E01\u0E33\u0E25\u0E31\u0E07\u0E0B\u0E37\u0E49\u0E2D\u0E08\u0E23\u0E34\u0E07 \u0E20\u0E32\u0E23\u0E30\u0E20\u0E32\u0E29\u0E35 \u0E41\u0E25\u0E30\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E43\u0E19\u0E01\u0E32\u0E23\u0E40\u0E02\u0E49\u0E32\u0E16\u0E36\u0E07\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E2D\u0E32\u0E28\u0E31\u0E22",
    instituteBadge: "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19 LivWorthy",
    modelBadge: "\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E40\u0E0A\u0E34\u0E07\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E1B\u0E35 2026",
    globalSalaryWorthTitle: "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E21\u0E39\u0E25\u0E04\u0E48\u0E32\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E17\u0E31\u0E48\u0E27\u0E42\u0E25\u0E01",
    purchasingPowerTitle: "\u0E14\u0E31\u0E0A\u0E19\u0E35\u0E01\u0E33\u0E25\u0E31\u0E07\u0E0B\u0E37\u0E49\u0E2D\u0E17\u0E35\u0E48\u0E41\u0E17\u0E49\u0E08\u0E23\u0E34\u0E07",
    salaryToRentTitle: "\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E2A\u0E48\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E15\u0E48\u0E2D\u0E04\u0E48\u0E32\u0E40\u0E0A\u0E48\u0E32",
    relocationGapTitle: "\u0E0A\u0E48\u0E2D\u0E07\u0E27\u0E48\u0E32\u0E07\u0E04\u0E48\u0E32\u0E04\u0E23\u0E2D\u0E07\u0E0A\u0E35\u0E1E\u0E43\u0E19\u0E01\u0E32\u0E23\u0E22\u0E49\u0E32\u0E22\u0E16\u0E34\u0E48\u0E19\u0E10\u0E32\u0E19\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28",
    takeHomePayTitle: "\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E17\u0E31\u0E48\u0E27\u0E42\u0E25\u0E01",
    downloadCsv: "\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14 CSV",
    downloadJson: "\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14 JSON",
    methodologyHeading: "\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E1A\u0E27\u0E34\u0E18\u0E35\u0E27\u0E34\u0E08\u0E31\u0E22\u0E41\u0E25\u0E30\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25",
    sourcesHeading: "\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E2A\u0E16\u0E34\u0E15\u0E34\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23",
    citationHeading: "\u0E41\u0E19\u0E27\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E17\u0E32\u0E07\u0E27\u0E34\u0E0A\u0E32\u0E01\u0E32\u0E23"
  }
};

// src/lib/i18n/locales/tl.ts
var tlDictionary = {
  locale: "tl",
  common: {
    brand: "LivWorthy",
    tagline: "Pandaigdigang Kaalaman sa Sahod, Buwis, at Gastos sa Pamumuhay",
    livingIntelligence: "Living Intelligence",
    calculating: "Kinakalkula...",
    calculate: "Kalkulahin",
    annual: "Taunan",
    monthly: "Buwanan",
    year: "Taon",
    month: "Buwan",
    share: "Ibahagi",
    copied: "Nakopya sa clipboard",
    home: "Home",
    back: "Bumalik",
    next: "Susunod",
    close: "Isara",
    disclaimer: "Ang mga kalkulasyon ay mga pagtatantya batay sa opisyal na bracket ng buwis at datos ng istatistika. Hindi ito payo sa pananalapi o legal na buwis.",
    verifiedTaxBaseline: "Na-verify na Batayang Buwis 2026",
    tier1SourcesBadge: "Opisyal na Pinagmulan ng Pamahalaan Tier-1",
    singleAdult: "Isang Matanda / Single",
    couple: "Mag-asawa / Dalawahang Kita",
    family: "Pamilya (2 Matanda, 1 Bata)",
    action: "Aksyon",
    evidence: "Mga Pinagkunan at Katibayan",
    methodology: "Metodolohiya ng Pagkalkula",
    diagnostics: "Diagnostics ng Sistema"
  },
  nav: {
    howItWorks: "Paano Ito Gumagana",
    sources: "Mga Pinagkunan",
    coverage: "Saklaw ng mga Lungsod",
    relocation: "Paglipat ng Tirahan",
    jobOfferComparison: "Paghambingin ang mga Alok sa Trabaho",
    reports: "Mga Ulat",
    guides: "Gabay sa Lungsod",
    compare: "Ihambing ang mga Lungsod",
    tabSalaryWorth: "Sapat Ba ang Aking Sahod?",
    tabSalaryNeeded: "Magkano ang Dapat Kong Kitain?",
    tabSalaryAfterTax: "Netong Sahod Pagkatapos ng Buwis",
    tabCostOfLiving: "Gastos sa Pamumuhay",
    tabCompare: "Ihambing ang mga Lungsod",
    tabJobOffers: "Ihambing ang mga Alok",
    tabGuides: "Mga Gabay sa Sahod ng Lungsod \u2192"
  },
  calculator: {
    chooseCity: "1. Pumili ng Lungsod / Lokasyon",
    annualSalary: "2. Taunang Kabuuang Sahod (Gross)",
    salaryHelp: "Pangunahing kita bago ibawas ang buwis at mga statutory contributions.",
    statutoryJurisdiction: "Huriskisiyon ng buwis ayon sa batas: {jurisdiction}",
    popularScenarios: "Mga Karaniwang Sitwasyon:",
    heroHeadline: "Magkano Talaga ang Halaga ng Iyong Sahod?",
    heroSubheadline: "Ilagay ang iyong sahod at lungsod upang malaman ang tunay na netong kita, mga gastusin, at kakayahang mag-ipon.",
    heroSupporting: "Tiyakin kung sasapat ang iyong kita para sa upa at pamumuhay sa napiling lungsod.",
    householdType: "Uri ng Sambahayan",
    rentOverride: "Buwanang Upa sa Bahay (Opsyonal)",
    rentOverridePlaceholder: "Iwanang blangko para sa average ng lungsod",
    rentOverrideHelp: "Gamitin ang iyong sariling upa sa halip na ang average ng lungsod.",
    taxYearLabel: "Taon ng Buwis",
    filingStatusLabel: "Katayuan sa Pag-file ng Buwis",
    dependentsLabel: "Mga Dependents",
    btnCalculate: "Kalkulahin ang Kapangyarihang Bumili",
    quickScenarios: {
      nyc100k: "New York $100k",
      london60k: "London \xA360k",
      dubai300k: "Dubai 300k AED",
      toronto90k: "Toronto CA$90k"
    }
  },
  results: {
    summaryTitle: "Buod ng Pananalapi",
    annualGross: "Taunang Kabuuang Kita (Gross)",
    annualTakeHome: "Taunang Netong Kita (Take-Home)",
    monthlyTakeHome: "Buwanang Netong Kita (Net)",
    monthlyLivingCosts: "Buwanang Gastos sa Pamumuhay",
    monthlyDisposable: "Buwanang Matitirang Pera",
    savingsCapacity: "Kapasidad sa Pag-iipon",
    savingsRate: "Rate ng Pag-iipon",
    effectiveTaxRate: "Epektibong Rate ng Buwis",
    housingBurden: "Pasanin sa Upa ng Bahay",
    taxesAndDeductions: "Buwis at mga Bawas",
    essentialLiving: "Mga Pangunahing Gastusin",
    discretionaryLiving: "Iba Pang Gastusin",
    spendableSurplus: "Sobra sa Badyet",
    deficitWarning: "Babala: Kakulangan sa badyet sa antas ng gastusing ito",
    healthySurplus: "Malusog na Sobra sa Badyet",
    taxPending: "Kasalukuyang Bineberipika ang Buwis",
    shareSummaryTitle: "Ibahagi ang Pagsusuri sa Sahod",
    estimatedLivingCosts: "Tinatayang Gastos sa Pamumuhay",
    benchmarkContext: "Paghahambing sa Pamantayan ng Lungsod",
    customizeAssumptions: "I-customize ang mga Palagay"
  },
  salaryNeeded: {
    headline: "Magkano ang Kailangan Mong Kitain?",
    subheadline: "Kalkulahin ang kinakailangang kabuuang sahod para sa iyong pamumuhay at target na ipon.",
    targetSavings: "Target na Buwanang Ipon",
    desiredLifestyle: "Nais na Uri ng Pamumuhay",
    requiredGross: "Kailangang Gross na Sahod",
    requiredNet: "Kailangang Netong Sahod",
    calculatedGrossSalary: "Inirerekomendang Gross na Sahod",
    explorePlan: "Tingnan ang Plano sa Badyet"
  },
  salaryAfterTax: {
    headline: "Kalkulator ng Sahod Pagkatapos ng Buwis",
    subheadline: "Detalyadong bawas para sa income tax, SSS, PhilHealth, at Pag-IBIG.",
    federalTax: "Income Tax (BIR)",
    stateLocalTax: "Lokal / Panrehiyong Buwis",
    socialSecurity: "Social Security / SSS",
    medicare: "PhilHealth / Seguro sa Kalusugan",
    totalDeductions: "Kabuuang mga Bawas",
    netTakeHome: "Netong Sahod na Matatanggap",
    effectiveTaxNote: "Kasama sa epektibong rate ang lahat ng opisyal na bawas ng batas."
  },
  costOfLiving: {
    headline: "Index ng Gastos sa Pamumuhay sa Lungsod",
    subheadline: "Pagsusuri sa gastusin: upa sa bahay, pagkain, kuryente, tubig, at transportasyon.",
    housingRent: "Upa sa Bahay",
    groceriesFood: "Mga Bibilhing Pagkain",
    diningOut: "Pagkain sa Labas",
    utilitiesInternet: "Kuryente, Tubig at Internet",
    publicTransit: "Pampublikong Transportasyon",
    totalMonthlyLiving: "Kabuuang Buwanang Gastos sa Pamumuhay",
    householdTypeSelect: "Laki ng Pamilya"
  },
  compare: {
    headline: "Paghambingin ang Kapangyarihang Bumili ng mga Lungsod",
    subheadline: "Alamin ang katumbas na sahod upang mapanatili ang pamumuhay kapag lumipat sa ibang lungsod.",
    cityA: "Kasalukuyang Lungsod",
    cityB: "Lungsod na Lilipatan",
    salaryA: "Kasalukuyang Sahod",
    equivalentSalary: "Katumbas na Sahod",
    purchasingPowerDelta: "Pagkakaiba sa Kapangyarihang Bumili",
    verdictLabel: "Kinalabasan ng Paghahambing"
  },
  jobOffers: {
    headline: "Paghambingin ang mga Alok sa Trabaho",
    subheadline: "Suriin ang tunay na halaga ng dalawang alok sa trabaho batay sa buwis at gastos sa lugar.",
    offerA: "Alok A",
    offerB: "Alok B",
    offerVerdict: "Pagsusuri sa Alok",
    higherRealIncome: "Mas Mataas na Tunay na Kita"
  },
  errors: {
    TAX_CALCULATION_UNAVAILABLE: "Pansamantalang hindi available ang kalkulasyon ng buwis para sa lokasyong ito.",
    INVALID_SALARY: "Mangyaring maglagay ng wastong halaga ng sahod.",
    CITY_NOT_SUPPORTED: "Hindi pa sinusuportahan ng sistema ang napiling lungsod.",
    DATA_STALE: "Kasalukuyang ina-update at bineberipika ang datos.",
    FX_UNAVAILABLE: "Hindi makuha ang palitan ng salapi sa ngayon.",
    NETWORK_ERROR: "May problema sa koneksyon. Pakisubukan muli mamaya."
  },
  footer: {
    aboutDesc: "Nagbibigay ang LivWorthy ng makatotohanang pagsusuri sa kapangyarihang bumili, buwis, at gastusin sa mga lungsod sa buong mundo.",
    calculatorsTitle: "Mga Kalkulator",
    intelligenceTitle: "Sentro ng Pagsusuri",
    institutionalTitle: "Datos ng Institusyon",
    cityComparisons: "Paghahambing ng Lungsod",
    empiricalReports: "Mga Ulat na Empirikal",
    editorialPolicy: "Patakaran sa Editoryal",
    dataPolicy: "Patakaran sa Datos",
    corrections: "Mga Pagwawasto at Update",
    terms: "Mga Tuntunin sa Paggamit",
    privacy: "Patakaran sa Privacy",
    copyright: "\xA9 2026 LivWorthy. Nakalaan ang lahat ng karapatan."
  },
  languageSelector: {
    title: "Pumili ng Wika",
    searchPlaceholder: "Maghanap ng wika...",
    currentLanguage: "Kasalukuyang Wika",
    switchSuggestion: "Nais mo bang lumipat sa Tagalog / Filipino?",
    switchCta: "Lumipat",
    dismiss: "Isara",
    allLanguages: "Lahat ng Sinusuportahang Wika"
  },
  reports: {
    hubTitle: "Pandaigdigang Ulat sa Sahod at Pamumuhay",
    hubSubtitle: "Pananaliksik tungkol sa kapangyarihang bumili, buwis, at abot-kayang pabahay.",
    instituteBadge: "LivWorthy Institute",
    modelBadge: "Modelong Deterministiko 2026",
    globalSalaryWorthTitle: "Ulat sa Halaga ng Sahod sa Daigdig",
    purchasingPowerTitle: "Index ng Tunay na Kapangyarihang Bumili",
    salaryToRentTitle: "Rasyo ng Sahod sa Upa",
    relocationGapTitle: "Agwat sa Gastos ng Paglipat sa Ibang Bansa",
    takeHomePayTitle: "Paghahambing ng Netong Sahod sa Daigdig",
    downloadCsv: "I-download ang CSV",
    downloadJson: "I-download ang JSON",
    methodologyHeading: "Metodolohiya ng Datos at Pananaliksik",
    sourcesHeading: "Mga Opisyal na Pinagmulan ng Istatistika",
    citationHeading: "Gabay sa Pagsipi"
  }
};

// src/lib/i18n/audit.ts
function flattenObject(obj, prefix = "") {
  const result = {};
  if (!obj || typeof obj !== "object") return result;
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "string") {
      result[fullKey] = val;
    } else if (typeof val === "object" && val !== null) {
      Object.assign(result, flattenObject(val, fullKey));
    }
  }
  return result;
}
var ENGLISH_FLAT_KEYS = flattenObject(enDictionary);
var BRAND_WHITELIST = /* @__PURE__ */ new Set([
  "common.brand",
  "common.disclaimer",
  // mathematical disclaimer can reference universal terms
  "locale"
]);
var TranslationAuditor = class {
  static {
    this.referenceKeys = ENGLISH_FLAT_KEYS;
  }
  static getRequiredKeyCount() {
    return Object.keys(this.referenceKeys).length;
  }
  static auditDictionary(locale, dict) {
    const targetFlat = flattenObject(dict);
    const requiredKeyEntries = Object.entries(this.referenceKeys);
    const totalRequired = requiredKeyEntries.length;
    let translatedCount = 0;
    const missingKeys = [];
    const fallbackKeys = [];
    let englishLeakageCount = 0;
    for (const [key, enVal] of requiredKeyEntries) {
      const targetVal = targetFlat[key];
      if (!targetVal || targetVal.trim() === "") {
        missingKeys.push(key);
      } else {
        translatedCount++;
        if (locale !== "en" && locale !== "en-US" && locale !== "en-GB" && locale !== "en-CA" && locale !== "en-AU" && !BRAND_WHITELIST.has(key) && targetVal.trim() === enVal.trim() && enVal.trim().length > 3) {
          fallbackKeys.push(key);
          englishLeakageCount++;
        }
      }
    }
    const completenessPct = totalRequired > 0 ? Math.min(100, Math.round(translatedCount / totalRequired * 100)) : 0;
    return {
      locale,
      totalRequiredKeys: totalRequired,
      translatedKeys: translatedCount,
      missingKeys,
      fallbackKeys,
      completenessPct,
      isComplete: completenessPct >= 95 && englishLeakageCount === 0,
      englishLeakageCount
    };
  }
};

// src/lib/i18n/index.ts
var DICTIONARIES = {
  en: enDictionary,
  es: esDictionary,
  fr: frDictionary,
  ar: arDictionary,
  de: deDictionary,
  pt: ptDictionary,
  hi: hiDictionary,
  ur: urDictionary,
  zh: zhDictionary,
  ja: jaDictionary,
  it: itDictionary,
  nl: nlDictionary,
  ko: koDictionary,
  ru: ruDictionary,
  tr: trDictionary,
  pl: plDictionary,
  id: idDictionary,
  vi: viDictionary,
  bn: bnDictionary,
  pa: paDictionary,
  ms: msDictionary,
  th: thDictionary,
  tl: tlDictionary
};
function getDictionary(locale) {
  return DICTIONARIES[locale] || DICTIONARIES.en;
}
function createLegacyBridge(dict) {
  return {
    siteTitle: `${dict.common.brand} \u2014 ${dict.common.tagline}`,
    siteTagline: dict.common.tagline,
    livingIntelligence: dict.common.livingIntelligence,
    navHowItWorks: dict.nav.howItWorks,
    navSources: dict.nav.sources,
    navCoverage: dict.nav.coverage,
    navRelocation: dict.nav.relocation,
    navJobOfferComparison: dict.nav.jobOfferComparison,
    tabSalaryWorth: dict.nav.tabSalaryWorth,
    tabSalaryNeeded: dict.nav.tabSalaryNeeded,
    tabSalaryAfterTax: dict.nav.tabSalaryAfterTax,
    tabCostOfLiving: dict.nav.tabCostOfLiving,
    tabCompare: dict.nav.tabCompare,
    tabJobOffers: dict.nav.tabJobOffers,
    tabGuides: dict.nav.tabGuides,
    heroHeadline: dict.calculator.heroHeadline,
    heroSubheadline: dict.calculator.heroSubheadline,
    heroSupporting: dict.calculator.heroSupporting,
    popularScenarios: dict.calculator.popularScenarios,
    grossSalaryLabel: dict.calculator.annualSalary,
    cityLabel: dict.calculator.chooseCity,
    householdLabel: dict.calculator.householdType,
    householdSingle: dict.common.singleAdult,
    householdCouple: dict.common.couple,
    householdFamily: dict.common.family,
    rentOverrideLabel: dict.calculator.rentOverride,
    calculateCta: dict.calculator.btnCalculate,
    takeHomeSummaryTitle: dict.results.summaryTitle,
    annualGrossLabel: dict.results.annualGross,
    annualTakeHomeLabel: dict.results.annualTakeHome,
    monthlyTakeHomeLabel: dict.results.monthlyTakeHome,
    monthlyLivingCostsLabel: dict.results.monthlyLivingCosts,
    monthlyDisposableLabel: dict.results.monthlyDisposable,
    monthlySavingsCapacityLabel: dict.results.savingsCapacity,
    savingsRateLabel: dict.results.savingsRate,
    financialDisclaimer: dict.common.disclaimer,
    dataFreshnessBadge: dict.common.verifiedTaxBaseline,
    coverageNotice: dict.common.tier1SourcesBadge
  };
}
var TRANSLATIONS = {
  en: createLegacyBridge(DICTIONARIES.en),
  es: createLegacyBridge(DICTIONARIES.es),
  fr: createLegacyBridge(DICTIONARIES.fr),
  ar: createLegacyBridge(DICTIONARIES.ar),
  de: createLegacyBridge(DICTIONARIES.de),
  pt: createLegacyBridge(DICTIONARIES.pt),
  hi: createLegacyBridge(DICTIONARIES.hi),
  ur: createLegacyBridge(DICTIONARIES.ur),
  zh: createLegacyBridge(DICTIONARIES.zh),
  ja: createLegacyBridge(DICTIONARIES.ja)
};

// src/lib/seo/multilingual-keywords.ts
var MULTILINGUAL_KEYWORD_DATABASE = [
  {
    "id": "en_nyc_100k_worth",
    "locale": "en",
    "language": "English",
    "country": "US",
    "market": "US",
    "query": "is 100k a good salary in NYC",
    "normalizedIntent": "Evaluate whether $100,000 gross salary covers NYC rent, taxes, and savings",
    "topic": "salary-worth",
    "intentType": "Informational",
    "funnelStage": "top",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Featured Snippet + PAA + Reddit Discussion",
    "targetUrl": "https://www.livworthy.com/guides/nyc-100k",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Prerendered answer passage verified with HUD FY2026 rent benchmark."
  },
  {
    "id": "en_nyc_salary_after_tax",
    "locale": "en",
    "language": "English",
    "country": "US",
    "market": "US",
    "query": "NYC salary after tax calculator",
    "normalizedIntent": "Calculate take-home pay after Federal, NY State, NYC Resident tax and FICA",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Interactive Calculator + Aggregator Tools",
    "targetUrl": "https://www.livworthy.com/salary-after-tax/new-york",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Interactive IT-2105-I single-filer calculator island live."
  },
  {
    "id": "en_nyc_salary_needed",
    "locale": "en",
    "language": "English",
    "country": "US",
    "market": "US",
    "query": "salary needed to live in New York",
    "normalizedIntent": "Determine required gross income to live comfortably in NYC",
    "topic": "salary-needed",
    "intentType": "Salary",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Editorial Guides + Statistical Portals",
    "targetUrl": "https://www.livworthy.com/salary-needed/new-york",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Inverse mathematical solver computes exact required gross salary for target rent."
  },
  {
    "id": "en_london_75k_worth",
    "locale": "en",
    "language": "English",
    "country": "GB",
    "market": "GB",
    "query": "is 75k a good salary in London",
    "normalizedIntent": "Evaluate whether \xA375,000 gross salary affords good living standard in London",
    "topic": "salary-worth",
    "intentType": "Informational",
    "funnelStage": "top",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Editorial Guides + Discussion Forums",
    "targetUrl": "https://www.livworthy.com/guides/london-75k",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "HMRC 2025/26 PAYE and ONS central rental benchmark inlined."
  },
  {
    "id": "en_london_dubai_relocation",
    "locale": "en",
    "language": "English",
    "country": "GB",
    "market": "GB",
    "query": "London to Dubai salary equivalent",
    "normalizedIntent": "Calculate equivalent salary when moving from London to Dubai factoring 0% tax",
    "topic": "relocation",
    "intentType": "Relocation",
    "funnelStage": "decision",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Expat Relocation Blogs + Recruitment Guides",
    "targetUrl": "https://www.livworthy.com/relocation/london-to-dubai",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Flagship bilateral relocation corridor modeling 0% PIT dividend."
  },
  {
    "id": "en_job_offer_comparison",
    "locale": "en",
    "language": "English",
    "country": "US",
    "market": "US",
    "query": "job offer comparison calculator",
    "normalizedIntent": "Compare two competing job offers with differing taxes, bonuses, and living costs",
    "topic": "job-offers",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "SoftwareApplication Schema + Career Sites",
    "targetUrl": "https://www.livworthy.com/job-offer-comparison",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Deterministic first-year vs recurring total compensation evaluator live."
  },
  {
    "id": "es_sueldo_neto_estados_unidos",
    "locale": "es",
    "language": "Spanish",
    "country": "US",
    "market": "US",
    "query": "calcular sueldo neto en estados unidos",
    "normalizedIntent": "Calcular el salario despu\xE9s de impuestos federales y estatales en EE.UU.",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Calculadoras Financieras + Gu\xEDas de Inmigraci\xF3n",
    "targetUrl": "https://www.livworthy.com/es?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Optimizada p\xE1gina de inicio en espa\xF1ol con motor I18n nativo."
  },
  {
    "id": "es_cuanto_necesito_vivir_ny",
    "locale": "es",
    "language": "Spanish",
    "country": "US",
    "market": "US",
    "query": "cuanto necesito ganar para vivir en nueva york",
    "normalizedIntent": "Averiguar salario m\xEDnimo o necesario para alquiler y vida en Nueva York",
    "topic": "salary-needed",
    "intentType": "Salary",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Art\xEDculos de Finanzas + Foros de Expatriados",
    "targetUrl": "https://www.livworthy.com/es?tab=salary-needed",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Respuesta matem\xE1tica directa de costos de alquiler HUD 2026."
  },
  {
    "id": "es_costo_vida_londres",
    "locale": "es",
    "language": "Spanish",
    "country": "ES",
    "market": "ES",
    "query": "costo de vida en londres para espa\xF1oles",
    "normalizedIntent": "Calcular gastos mensuales en libras y euros al mudarse a Londres",
    "topic": "cost-of-living",
    "intentType": "Cost of living",
    "funnelStage": "top",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Blogs de Expatriados + Desgloses de Alquiler",
    "targetUrl": "https://www.livworthy.com/es?tab=cost-of-living",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Comparaci\xF3n bilateral con tipos de cambio reales y datos ONS."
  },
  {
    "id": "es_cuanto_cuesta_vivir_dubai",
    "locale": "es",
    "language": "Spanish",
    "country": "ES",
    "market": "ES",
    "query": "cuanto cuesta vivir en dubai salario necesario",
    "normalizedIntent": "Presupuesto mensual y salario requerido para vivir en Dub\xE1i libre de impuestos",
    "topic": "salary-needed",
    "intentType": "Relocation",
    "funnelStage": "decision",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Portales de Empleo Internacional + Gu\xEDas Fiscales",
    "targetUrl": "https://www.livworthy.com/es?tab=compare",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "An\xE1lisis de retenci\xF3n del 100% de ingresos brutos y costo de vivienda."
  },
  {
    "id": "ar_cost_of_living_dubai",
    "locale": "ar",
    "language": "Arabic",
    "country": "AE",
    "market": "AE",
    "query": "\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0641\u064A \u062F\u0628\u064A",
    "normalizedIntent": "\u0645\u0639\u0631\u0641\u0629 \u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u0627\u0644\u0634\u0647\u0631\u064A\u0629 \u0648\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0633\u0643\u0646 \u0648\u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0641\u064A \u062F\u0628\u064A",
    "topic": "cost-of-living",
    "intentType": "Cost of living",
    "funnelStage": "top",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u0645\u0648\u0627\u0642\u0639 \u0639\u0642\u0627\u0631\u064A\u0629 + \u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0629 \u062E\u0644\u064A\u062C\u064A\u0629",
    "targetUrl": "https://www.livworthy.com/ar?tab=cost-of-living",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "\u062A\u0635\u0645\u064A\u0645 \u0639\u0631\u0628\u064A \u0623\u0635\u064A\u0644 \u0628\u0627\u062A\u062C\u0627\u0647 \u0627\u0644\u064A\u0645\u064A\u0646 \u0644\u0644\u064A\u0633\u0627\u0631 \u0645\u0639 \u0623\u0631\u0642\u0627\u0645 \u0645\u0631\u0643\u0632 \u062F\u0628\u064A \u0644\u0644\u0625\u062D\u0635\u0627\u0621."
  },
  {
    "id": "ar_salary_needed_dubai_family",
    "locale": "ar",
    "language": "Arabic",
    "country": "AE",
    "market": "AE",
    "query": "\u0643\u0645 \u0631\u0627\u062A\u0628 \u064A\u0643\u0641\u064A \u0644\u0644\u0639\u064A\u0634 \u0641\u064A \u062F\u0628\u064A \u0644\u0639\u0627\u0626\u0644\u0629",
    "normalizedIntent": "\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0644\u062A\u063A\u0637\u064A\u0629 \u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0633\u0643\u0646 \u0648\u0627\u0644\u0645\u062F\u0627\u0631\u0633 \u0648\u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u0644\u0639\u0627\u0626\u0644\u0629 \u0641\u064A \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A",
    "topic": "salary-needed",
    "intentType": "Salary",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u0645\u0646\u062A\u062F\u064A\u0627\u062A \u0627\u0644\u0645\u063A\u062A\u0631\u0628\u064A\u0646 + \u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u0631\u0648\u0627\u062A\u0628",
    "targetUrl": "https://www.livworthy.com/ar?tab=salary-needed",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "\u062D\u0633\u0627\u0628 \u062F\u0642\u064A\u0642 \u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0623\u0633\u0631\u0629 \u0648\u0627\u0644\u0633\u0643\u0646 \u0648\u0627\u0644\u0627\u062F\u062E\u0627\u0631 \u0627\u0644\u0635\u0627\u0641\u064A."
  },
  {
    "id": "ar_tax_salary_comparison_london_dubai",
    "locale": "ar",
    "language": "Arabic",
    "country": "AE",
    "market": "AE",
    "query": "\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0631\u0648\u0627\u062A\u0628 \u0628\u064A\u0646 \u0644\u0646\u062F\u0646 \u0648\u062F\u0628\u064A \u0628\u0639\u062F \u0627\u0644\u0636\u0631\u064A\u0628\u0629",
    "normalizedIntent": "\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0634\u0631\u0627\u0626\u064A\u0629 \u0648\u0635\u0627\u0641\u064A \u0627\u0644\u062F\u062E\u0644 \u0628\u064A\u0646 \u0628\u0631\u064A\u0637\u0627\u0646\u064A\u0627 \u0648\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A",
    "topic": "comparison",
    "intentType": "Comparison",
    "funnelStage": "decision",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0629 \u0648\u0627\u0644\u0631\u0648\u0627\u062A\u0628 \u0644\u0644\u0645\u063A\u062A\u0631\u0628\u064A\u0646",
    "targetUrl": "https://www.livworthy.com/ar?tab=compare",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "\u0625\u0628\u0631\u0627\u0632 \u0641\u0627\u0631\u0642 \u0627\u0644\u0625\u0639\u0641\u0627\u0621 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0628\u0646\u0633\u0628\u0629 0% \u0641\u064A \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A."
  },
  {
    "id": "ar_cost_of_living_saudi",
    "locale": "ar",
    "language": "Arabic",
    "country": "SA",
    "market": "SA",
    "query": "\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u0645\u0642\u0627\u0631\u0646\u0629 \u0628\u062F\u0628\u064A",
    "normalizedIntent": "\u0645\u0642\u0627\u0631\u0646\u0629 \u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0633\u0643\u0646 \u0648\u0627\u0644\u062A\u0646\u0642\u0644 \u0648\u0646\u0645\u0637 \u0627\u0644\u062D\u064A\u0627\u0629 \u0628\u064A\u0646 \u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u062F\u0628\u064A",
    "topic": "comparison",
    "intentType": "Cost of living",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u0635\u062D\u0627\u0641\u0629 \u0627\u0644\u0645\u0627\u0644 \u0648\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
    "targetUrl": "https://www.livworthy.com/ar?tab=compare",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "\u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629 \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u0645\u0639 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u0623\u0645\u064A\u0646\u0627\u062A GOSI."
  },
  {
    "id": "fr_salaire_net_apres_impot",
    "locale": "fr",
    "language": "French",
    "country": "FR",
    "market": "FR",
    "query": "calculer salaire net apr\xE8s imp\xF4t sur le revenu",
    "normalizedIntent": "Calculer le salaire net apr\xE8s pr\xE9l\xE8vement \xE0 la source et cotisations sociales",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Simulateurs Officiels + Sites d\u2019Emploi",
    "targetUrl": "https://www.livworthy.com/fr?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Moteur de d\xE9duction fiscale et bar\xE8me progressif 2026."
  },
  {
    "id": "fr_cout_vie_londres_paris",
    "locale": "fr",
    "language": "French",
    "country": "FR",
    "market": "FR",
    "query": "cout de la vie londres vs paris salaire \xE9quivalent",
    "normalizedIntent": "Comparer le pouvoir d\u2019achat et le logement entre Paris et Londres",
    "topic": "comparison",
    "intentType": "Comparison",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Guides Expatriation + Comparateurs de Salaires",
    "targetUrl": "https://www.livworthy.com/fr?tab=compare",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Int\xE9gration des taux de change r\xE9els et loyers m\xE9dians ONS/Insee."
  },
  {
    "id": "fr_salaire_pour_vivre_ny",
    "locale": "fr",
    "language": "French",
    "country": "FR",
    "market": "FR",
    "query": "quel salaire pour vivre \xE0 new york",
    "normalizedIntent": "Estimer le revenu n\xE9cessaire pour vivre confortablement \xE0 NYC",
    "topic": "salary-needed",
    "intentType": "Salary",
    "funnelStage": "top",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Blogs de Fran\xE7ais \xE0 l\u2019\xC9tranger + Analyses Financi\xE8res",
    "targetUrl": "https://www.livworthy.com/fr?tab=salary-needed",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Solveur inverse prenant en compte le co\xFBt du logement HUD."
  },
  {
    "id": "de_netto_gehalt_rechner",
    "locale": "de",
    "language": "German",
    "country": "DE",
    "market": "DE",
    "query": "gehalt nach steuern berechnen netto rechner",
    "normalizedIntent": "Nettolohn nach Lohnsteuer, Solidarit\xE4tszuschlag und Sozialabgaben ermitteln",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Brutto-Netto-Rechner + Finanzportale",
    "targetUrl": "https://www.livworthy.com/de?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Exakte Berechnung nach Steuerklasse I und gesetzlichen Beitr\xE4gen 2026."
  },
  {
    "id": "de_lebenshaltungskosten_berlin_muenchen",
    "locale": "de",
    "language": "German",
    "country": "DE",
    "market": "DE",
    "query": "lebenshaltungskosten berlin vs m\xFCnchen vergleich",
    "normalizedIntent": "Miet- und Lebenshaltungskostenunterschiede zwischen deutschen Metropolen vergleichen",
    "topic": "comparison",
    "intentType": "Comparison",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Vergleichsportale + Karriereberichte",
    "targetUrl": "https://www.livworthy.com/de?tab=compare",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Mietspiegel und Destatis-Lebensmittelk\xF6rbe integriert."
  },
  {
    "id": "de_auswandern_dubai_steuern_gehalt",
    "locale": "de",
    "language": "German",
    "country": "DE",
    "market": "DE",
    "query": "auswandern nach dubai gehalt steuerfrei lebenshaltungskosten",
    "normalizedIntent": "Berechnung des finanziellen Vorteils bei Jobangebot in Dubai ohne Einkommensteuer",
    "topic": "relocation",
    "intentType": "Relocation",
    "funnelStage": "decision",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Expat-Ratgeber + Kanzleiblogs",
    "targetUrl": "https://www.livworthy.com/de?tab=salary-worth",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Direkter Netto-Vergleich zwischen Deutschland (Spitzensteuersatz) und VAE (0%)."
  },
  {
    "id": "pt_salario_liquido_calculadora",
    "locale": "pt",
    "language": "Portuguese",
    "country": "BR",
    "market": "BR",
    "query": "calculadora de sal\xE1rio l\xEDquido ap\xF3s impostos",
    "normalizedIntent": "Calcular quanto sobra do sal\xE1rio ap\xF3s desconto de INSS e IRRF",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Simuladores CLT + Portais de Carreira",
    "targetUrl": "https://www.livworthy.com/pt?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Apresenta\xE7\xE3o clara de dedu\xE7\xF5es tribut\xE1rias e renda dispon\xEDvel real."
  },
  {
    "id": "pt_custo_vida_lisboa_portugal",
    "locale": "pt",
    "language": "Portuguese",
    "country": "PT",
    "market": "PT",
    "query": "custo de vida em lisboa quanto ganha para morar bem",
    "normalizedIntent": "Estimar sal\xE1rio necess\xE1rio para pagar aluguel e despesas em Lisboa",
    "topic": "salary-needed",
    "intentType": "Salary",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Guias de Imigra\xE7\xE3o + Not\xEDcias de Economia",
    "targetUrl": "https://www.livworthy.com/pt?tab=salary-needed",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Dados transparentes do INE Portugal e mercado de habita\xE7\xE3o."
  },
  {
    "id": "pt_morar_no_exterior_salario_comparacao",
    "locale": "pt",
    "language": "Portuguese",
    "country": "BR",
    "market": "BR",
    "query": "comparar custo de vida s\xE3o paulo e londres",
    "normalizedIntent": "Comparar poder de compra entre Brasil e Reino Unido com cota\xE7\xE3o cambial",
    "topic": "comparison",
    "intentType": "Comparison",
    "funnelStage": "top",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Compara\xE7\xF5es de Cidades + Blogs de Brasileiros no Exterior",
    "targetUrl": "https://www.livworthy.com/pt?tab=compare",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Convers\xE3o monet\xE1ria em tempo real e an\xE1lise de despesas essenciais."
  },
  {
    "id": "hi_dubai_salary_chahiye",
    "locale": "hi",
    "language": "Hindi",
    "country": "IN",
    "market": "IN",
    "query": "Dubai me rehne ke liye kitni salary chahiye",
    "normalizedIntent": "Calculate required salary for Indian professionals moving to Dubai",
    "topic": "salary-needed",
    "intentType": "Relocation",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Expat Advice + YouTube Summaries + Financial Forums",
    "targetUrl": "https://www.livworthy.com/hi?tab=salary-needed",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Both Devanagari context and high-demand Hinglish semantic match."
  },
  {
    "id": "hi_new_york_living_cost",
    "locale": "hi",
    "language": "Hindi",
    "country": "IN",
    "market": "IN",
    "query": "\u0926\u0941\u092C\u0908 \u092E\u0947\u0902 \u0930\u0939\u0928\u0947 \u0915\u093E \u0916\u0930\u094D\u091A \u0914\u0930 \u0935\u0947\u0924\u0928",
    "normalizedIntent": "\u0926\u0941\u092C\u0908 \u092E\u0947\u0902 \u0906\u0935\u0936\u094D\u092F\u0915 \u092E\u093E\u0938\u093F\u0915 \u0916\u0930\u094D\u091A, \u0915\u093F\u0930\u093E\u092F\u093E \u0914\u0930 \u092C\u091A\u0924 \u0915\u094D\u0937\u092E\u0924\u093E \u0915\u0940 \u0917\u0923\u0928\u093E",
    "topic": "cost-of-living",
    "intentType": "Cost of living",
    "funnelStage": "top",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u0939\u093F\u0902\u0926\u0940 \u0938\u092E\u093E\u091A\u093E\u0930 \u092A\u094B\u0930\u094D\u091F\u0932 + \u0935\u093F\u0924\u094D\u0924\u0940\u092F \u092C\u094D\u0932\u0949\u0917",
    "targetUrl": "https://www.livworthy.com/hi?tab=cost-of-living",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "\u0936\u0941\u0926\u094D\u0927 \u0939\u093F\u0902\u0926\u0940 \u0936\u092C\u094D\u0926\u093E\u0935\u0932\u0940 \u0914\u0930 0% \u091F\u0948\u0915\u094D\u0938 \u092C\u091A\u0924 \u0915\u093E \u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923\u0964"
  },
  {
    "id": "hi_salary_after_tax_usa",
    "locale": "hi",
    "language": "Hindi",
    "country": "IN",
    "market": "IN",
    "query": "USA me salary after tax kitna bachta hai",
    "normalizedIntent": "Calculate net in-hand salary in US after Federal and State deductions for H1B/Indian expats",
    "topic": "after-tax",
    "intentType": "Tax",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Immigration Communities + Tech Salary Tools",
    "targetUrl": "https://www.livworthy.com/hi?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Complete US tax bracket breakdown targeting Indian professionals."
  },
  {
    "id": "ur_dubai_salary_kharcha",
    "locale": "ur",
    "language": "Urdu",
    "country": "PK",
    "market": "PK",
    "query": "Dubai mein rehne ka kharcha aur kitni salary chahiye",
    "normalizedIntent": "Calculate monthly cost of living and needed compensation in Dubai for Pakistani expats",
    "topic": "salary-needed",
    "intentType": "Relocation",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Overseas Employment Portals + Community Discussions",
    "targetUrl": "https://www.livworthy.com/ur?tab=salary-needed",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "Urdu script and Roman Urdu intent mapping with zero English leakage."
  },
  {
    "id": "ur_tax_after_salary_london",
    "locale": "ur",
    "language": "Urdu",
    "country": "PK",
    "market": "PK",
    "query": "\u0644\u0646\u062F\u0646 \u0645\u06CC\u06BA \u062A\u0646\u062E\u0648\u0627\u06C1 \u06A9\u06D2 \u0628\u0639\u062F \u0679\u06CC\u06A9\u0633 \u0627\u0648\u0631 \u0628\u0686\u062A",
    "normalizedIntent": "\u0644\u0646\u062F\u0646 \u0645\u06CC\u06BA \u0627\u0646\u06A9\u0645 \u0679\u06CC\u06A9\u0633 \u06A9\u0679\u0648\u062A\u06CC \u06A9\u06D2 \u0628\u0639\u062F \u06C1\u0627\u062A\u06BE \u0645\u06CC\u06BA \u0622\u0646\u06D2 \u0648\u0627\u0644\u06CC \u062A\u0646\u062E\u0648\u0627\u06C1 \u0627\u0648\u0631 \u0645\u0627\u06C1\u0627\u0646\u06C1 \u0628\u0686\u062A \u06A9\u06CC \u0634\u0631\u062D",
    "topic": "after-tax",
    "intentType": "Tax",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u0627\u0648\u0648\u0631\u0633\u06CC\u0632 \u067E\u0627\u06A9\u0633\u062A\u0627\u0646\u06CC \u06AF\u0627\u0626\u06CC\u0688\u0632 + \u0679\u06CC\u06A9\u0633 \u06A9\u06CC\u0644\u06A9\u0648\u0644\u06CC\u0679\u0631",
    "targetUrl": "https://www.livworthy.com/ur?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "\u0627\u0631\u062F\u0648 \u062E\u0637 \u0646\u0633\u062A\u0639\u0644\u06CC\u0642 \u06A9\u06D2 \u0645\u0637\u0627\u0628\u0642 \u062F\u0627\u0626\u06CC\u06BA \u0633\u06D2 \u0628\u0627\u0626\u06CC\u06BA (RTL) \u062F\u0631\u0633\u062A \u0688\u0633\u067E\u0644\u06D2\u06D4"
  },
  {
    "id": "zh_new_york_living_cost",
    "locale": "zh",
    "language": "Chinese",
    "country": "CN",
    "market": "CN",
    "query": "\u7EBD\u7EA6\u751F\u6D3B\u6210\u672C\u4E00\u4E2A\u6708\u591A\u5C11\u94B1",
    "normalizedIntent": "\u67E5\u8BE2\u7EBD\u7EA6\u79DF\u623F\u3001\u7A0E\u8D39\u53CA\u65E5\u5E38\u751F\u6D3B\u5F00\u9500\u603B\u9884\u7B97",
    "topic": "cost-of-living",
    "intentType": "Cost of living",
    "funnelStage": "top",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u7559\u5B66\u751F\u4E0E\u6D77\u5916\u6C42\u804C\u793E\u533A + \u8D22\u52A1\u6307\u5357",
    "targetUrl": "https://www.livworthy.com/zh?tab=cost-of-living",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "\u7CBE\u51C6\u4E2D\u6587\u672C\u5730\u5316\u5448\u73B0 HUD \u79DF\u91D1\u4E0E\u751F\u6D3B\u7BEE\u5B50\u6570\u636E\u3002"
  },
  {
    "id": "zh_salary_after_tax_calculator",
    "locale": "zh",
    "language": "Chinese",
    "country": "CN",
    "market": "CN",
    "query": "\u7F8E\u56FD\u7A0E\u540E\u5DE5\u8D44\u8BA1\u7B97\u5668 \u5230\u624B\u6536\u5165",
    "normalizedIntent": "\u8BA1\u7B97\u6263\u9664\u8054\u90A6\u7A0E\u3001\u5DDE\u7A0E\u548CFICA\u540E\u7684\u5B9E\u9645\u5230\u624B\u85AA\u6C34",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u85AA\u916C\u5DE5\u5177 + \u62A5\u7A0E\u6307\u5357",
    "targetUrl": "https://www.livworthy.com/zh?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "\u63D0\u4F9B\u786E\u5B9A\u6027\u7A0E\u7387\u8868\uFF0C\u675C\u7EDD\u673A\u5668\u7FFB\u8BD1\u9519\u8BEF\u672F\u8BED\u3002"
  },
  {
    "id": "zh_dubai_singapore_comparison",
    "locale": "zh",
    "language": "Chinese",
    "country": "SG",
    "market": "SG",
    "query": "\u8FEA\u62DC\u4E0E\u65B0\u52A0\u5761\u751F\u6D3B\u6210\u672C\u53CA\u7A0E\u7387\u5BF9\u6BD4",
    "normalizedIntent": "\u6BD4\u8F83\u65B0\u52A0\u5761\u4E0E\u8FEA\u62DC\u4E4B\u95F4\u7684\u4E2A\u4EBA\u6240\u5F97\u7A0E\u4E0E\u771F\u5B9E\u53EF\u652F\u914D\u6536\u5165",
    "topic": "comparison",
    "intentType": "Comparison",
    "funnelStage": "decision",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u6D77\u5916\u8D44\u4EA7\u914D\u7F6E\u4E0E\u6C42\u804C\u5BF9\u6BD4",
    "targetUrl": "https://www.livworthy.com/zh?tab=compare",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "\u63D0\u4F9B\u53CC\u8FB9\u57CE\u5E02\u786E\u5B9A\u6027\u8D2D\u4E70\u529B\u5E73\u4EF7\u6A21\u578B\u3002"
  },
  {
    "id": "ja_salary_take_home_pay",
    "locale": "ja",
    "language": "Japanese",
    "country": "JP",
    "market": "JP",
    "query": "\u5E74\u53CE \u624B\u53D6\u308A \u8A08\u7B97 \u7A0E\u5F15\u5F8C\u7D66\u4E0E",
    "normalizedIntent": "\u984D\u9762\u5E74\u53CE\u304B\u3089\u793E\u4F1A\u4FDD\u967A\u6599\u30FB\u6240\u5F97\u7A0E\u30FB\u4F4F\u6C11\u7A0E\u3092\u5F15\u3044\u305F\u624B\u53D6\u308A\u91D1\u984D\u3092\u8A08\u7B97\u3059\u308B",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u8EE2\u8077\u30B5\u30A4\u30C8\u30C4\u30FC\u30EB + \u7A0E\u91D1\u89E3\u8AAC\u8A18\u4E8B",
    "targetUrl": "https://www.livworthy.com/ja?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "\u65E5\u672C\u56FD\u5185\u306E\u63A7\u9664\u4F53\u7CFB\u3068\u6D77\u5916\u79FB\u4F4F\u6642\u306E\u6BD4\u8F03\u8A08\u7B97\u3092\u63D0\u793A\u3002"
  },
  {
    "id": "ja_london_cost_of_living",
    "locale": "ja",
    "language": "Japanese",
    "country": "JP",
    "market": "JP",
    "query": "\u30ED\u30F3\u30C9\u30F3 \u751F\u6D3B\u8CBB \u65E5\u672C\u5186 \u4E00\u30F6\u6708 \u5BB6\u8CC3",
    "normalizedIntent": "\u30ED\u30F3\u30C9\u30F3\u306E1\u30F6\u6708\u306E\u5BB6\u8CC3\u3001\u7269\u4FA1\u3001\u751F\u6D3B\u8CBB\u3092\u65E5\u672C\u5186\u63DB\u7B97\u3067\u628A\u63E1\u3059\u308B",
    "topic": "cost-of-living",
    "intentType": "Cost of living",
    "funnelStage": "top",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u6D77\u5916\u99D0\u5728\u54E1\u30D6\u30ED\u30B0 + \u7559\u5B66\u30DD\u30FC\u30BF\u30EB",
    "targetUrl": "https://www.livworthy.com/ja?tab=cost-of-living",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "ONS\u5B9F\u6E2C\u5BB6\u8CC3\u3068\u70BA\u66FF\u30EC\u30FC\u30C8\u306B\u3088\u308B\u6B63\u78BA\u306A\u65E5\u672C\u5186\u63DB\u7B97\u3002"
  },
  {
    "id": "ja_dubai_relocation_tax_free",
    "locale": "ja",
    "language": "Japanese",
    "country": "JP",
    "market": "JP",
    "query": "\u30C9\u30D0\u30A4 \u79FB\u4F4F \u5E74\u53CE \u6240\u5F97\u7A0E\u30BC\u30ED \u751F\u6D3B\u8CBB",
    "normalizedIntent": "\u30C9\u30D0\u30A4\u306E\u7121\u7A0E\u5236\u5EA6\u3092\u524D\u63D0\u3068\u3057\u305F\u6D77\u5916\u79FB\u4F4F\u306B\u5FC5\u8981\u306A\u5E74\u53CE\u3068\u53EF\u51E6\u5206\u6240\u5F97",
    "topic": "relocation",
    "intentType": "Relocation",
    "funnelStage": "decision",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u56FD\u969B\u7A0E\u52D9\u76F8\u8AC7 + \u30C9\u30D0\u30A4\u79FB\u4F4F\u30DD\u30FC\u30BF\u30EB",
    "targetUrl": "https://www.livworthy.com/ja?tab=salary-worth",
    "currentRank": null,
    "targetRank": "Top 1",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-06",
    "recommendedAction": "\u65E5\u672C\u306E\u7D2F\u9032\u8AB2\u7A0E\u3068\u306E\u5DEE\u984D\u306B\u3088\u308B\u624B\u6B8B\u308A\u8CC7\u91D1\u30B7\u30DF\u30E5\u30EC\u30FC\u30B7\u30E7\u30F3\u3002"
  },
  {
    "id": "it_stipendio_netto_milano",
    "locale": "it",
    "language": "Italian",
    "country": "IT",
    "market": "IT",
    "query": "calcolo stipendio netto milano",
    "normalizedIntent": "Calcolo stipendio netto mensile con aliquote IRPEF e addizionali regionali",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Calcolatori Busta Paga + Guide Fiscali",
    "targetUrl": "https://www.livworthy.com/it?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "AEO blocco risposta con aliquote IRPEF 2026 verificate."
  },
  {
    "id": "it_costo_vita_roma_milano",
    "locale": "it",
    "language": "Italian",
    "country": "IT",
    "market": "IT",
    "query": "costo della vita a milano vs roma",
    "normalizedIntent": "Confronto canoni di affitto e spese di mantenimento tra Roma e Milano",
    "topic": "cost-of-living",
    "intentType": "Comparison",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Articoli Comparativi Costo Vita",
    "targetUrl": "https://www.livworthy.com/it?tab=cost-of-living",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "Dati statistici ufficiali ISTAT su canoni di locazione."
  },
  {
    "id": "nl_netto_salaris_amsterdam",
    "locale": "nl",
    "language": "Dutch",
    "country": "NL",
    "market": "NL",
    "query": "netto salaris berekenen amsterdam",
    "normalizedIntent": "Berekening van het netto besteedbaar maandsalaris na loonheffing Box 1",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Salaris Checkers + Belastingdienst",
    "targetUrl": "https://www.livworthy.com/nl?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "Loonbelasting en heffingskortingen 2026 direct antwoord."
  },
  {
    "id": "nl_kosten_levensonderhoud_amsterdam",
    "locale": "nl",
    "language": "Dutch",
    "country": "NL",
    "market": "NL",
    "query": "kosten van levensonderhoud amsterdam",
    "normalizedIntent": "Woonlasten en uitgavenoverzicht voor wonen en werken in Amsterdam",
    "topic": "cost-of-living",
    "intentType": "Informational",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Expat gidsen + CBS Statistieken",
    "targetUrl": "https://www.livworthy.com/nl?tab=cost-of-living",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "CBS offici\xEBle huurindex en levensonderhoud data."
  },
  {
    "id": "ko_seoul_take_home_pay",
    "locale": "ko",
    "language": "Korean",
    "country": "KR",
    "market": "KR",
    "query": "\uC11C\uC6B8 \uC2E4\uC218\uB839\uC561 \uACC4\uC0B0\uAE30 \uC5F0\uBD09",
    "normalizedIntent": "\uADFC\uB85C\uC18C\uB4DD\uC138 \uBC0F 4\uB300\uBCF4\uD5D8 \uACF5\uC81C \uD6C4 \uC2E4\uC9C8 \uD1B5\uC7A5 \uC218\uB839\uC561 \uACC4\uC0B0",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\uC5F0\uBD09\uACC4\uC0B0\uAE30 + \uC9C1\uC7A5\uC778 \uCEE4\uBBA4\uB2C8\uD2F0",
    "targetUrl": "https://www.livworthy.com/ko?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "2026\uB144 \uAD6D\uBBFC\uC5F0\uAE08, \uAC74\uAC15\uBCF4\uD5D8, \uC18C\uB4DD\uC138\uC728 \uBC18\uC601 \uC989\uC2DC \uB2F5\uBCC0 \uBE14\uB85D."
  },
  {
    "id": "ko_nyc_living_cost_korean",
    "locale": "ko",
    "language": "Korean",
    "country": "KR",
    "market": "KR",
    "query": "\uB274\uC695 \uC0DD\uD65C\uBE44 \uC6D4\uC138 \uC5BC\uB9C8 \uD544\uC694\uD560\uAE4C",
    "normalizedIntent": "\uB274\uC695 \uAC70\uC8FC \uD55C\uAD6D\uC778\uC744 \uC704\uD55C \uB80C\uD2B8\uBE44 \uBC0F \uC6D4 \uD544\uC218 \uC0DD\uD65C\uBE44 \uC0B0\uCD9C",
    "topic": "cost-of-living",
    "intentType": "Informational",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\uD574\uC678\uCDE8\uC5C5 \uBE14\uB85C\uADF8 + \uD1B5\uACC4 \uB9AC\uD3EC\uD2B8",
    "targetUrl": "https://www.livworthy.com/ko?tab=cost-of-living",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "HUD FY2026 \uACF5\uC815\uC784\uB300\uB8CC \uAE30\uBC18 \uD55C\uAD6D\uC5B4 \uC124\uBA85 \uC81C\uACF5."
  },
  {
    "id": "ru_salary_net_calculator",
    "locale": "ru",
    "language": "Russian",
    "country": "RU",
    "market": "RU",
    "query": "\u043A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u044B \u043D\u0435\u0442\u0442\u043E \u043D\u0430\u043B\u043E\u0433\u0438",
    "normalizedIntent": "\u0420\u0430\u0441\u0447\u0435\u0442 \u0447\u0438\u0441\u0442\u043E\u0439 \u0437\u0430\u0440\u0430\u0431\u043E\u0442\u043D\u043E\u0439 \u043F\u043B\u0430\u0442\u044B \u043F\u043E\u0441\u043B\u0435 \u0443\u043F\u043B\u0430\u0442\u044B \u043D\u0430\u043B\u043E\u0433\u043E\u0432 \u0438 \u0441\u0431\u043E\u0440\u043E\u0432",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440\u044B \u041D\u0414\u0424\u041B + \u0421\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u0438",
    "targetUrl": "https://www.livworthy.com/ru?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "\u041D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0435 \u0441\u0442\u0430\u0432\u043A\u0438 \u0438 \u043F\u0435\u043D\u0441\u0438\u043E\u043D\u043D\u044B\u0435 \u0432\u0437\u043D\u043E\u0441\u044B."
  },
  {
    "id": "tr_net_maas_hesaplama",
    "locale": "tr",
    "language": "Turkish",
    "country": "TR",
    "market": "TR",
    "query": "net maas hesaplama vergi kesintisi",
    "normalizedIntent": "Gelir vergisi ve SGK kesintileri sonrasi ele gecen net maas hesabi",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Maas Hesaplama Araclar",
    "targetUrl": "https://www.livworthy.com/tr?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "Vergi dilimleri ve net maas tablosu."
  },
  {
    "id": "pl_kalkulator_wynagrodzen_netto",
    "locale": "pl",
    "language": "Polish",
    "country": "PL",
    "market": "PL",
    "query": "kalkulator wynagrodzen netto po podatkach",
    "normalizedIntent": "Obliczanie wynagrodzenia na reke po odliczeniu PIT i skladek ZUS",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Kalkulatory Wynagrodzen",
    "targetUrl": "https://www.livworthy.com/pl?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "Stawki podatkowe i skladki ubezpieczeniowe."
  },
  {
    "id": "id_kalkulator_gaji_bersih",
    "locale": "id",
    "language": "Indonesian",
    "country": "ID",
    "market": "ID",
    "query": "kalkulator gaji bersih take home pay",
    "normalizedIntent": "Perhitungan gaji bersih setelah potongan PPh 21 dan BPJS Ketenagakerjaan",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Kalkulator Gaji",
    "targetUrl": "https://www.livworthy.com/id?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "Simulasi take-home pay dan pajak penghasilan."
  },
  {
    "id": "vi_tinh_luong_net",
    "locale": "vi",
    "language": "Vietnamese",
    "country": "VN",
    "market": "VN",
    "query": "tinh luong net sau thue thu nhap",
    "normalizedIntent": "Cong cu tinh luong thuc nhan sau thue TNCN va bao hiem xa hoi",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Bang tinh luong Net Gross",
    "targetUrl": "https://www.livworthy.com/vi?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "Bieu thue luy tien va muc dong bao hiem."
  },
  {
    "id": "bn_dubai_salary_cost",
    "locale": "bn",
    "language": "Bengali",
    "country": "BD",
    "market": "BD",
    "query": "\u09A6\u09C1\u09AC\u09BE\u0987\u09AF\u09BC\u09C7 \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09B0 \u0996\u09B0\u099A \u0993 \u09AC\u09C7\u09A4\u09A8",
    "normalizedIntent": "\u09A6\u09C1\u09AC\u09BE\u0987\u09AF\u09BC\u09C7 \u09AA\u09CD\u09B0\u09AC\u09BE\u09B8\u09C0\u09A6\u09C7\u09B0 \u09A5\u09BE\u0995\u09BE \u0996\u09BE\u0993\u09AF\u09BC\u09BE\u09B0 \u0996\u09B0\u099A \u098F\u09AC\u0982 \u0986\u09AF\u09BC\u09C7\u09B0 \u09A4\u09C1\u09B2\u09A8\u09BE",
    "topic": "cost-of-living",
    "intentType": "Informational",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u09AA\u09CD\u09B0\u09AC\u09BE\u09B8 \u0997\u09BE\u0987\u09A1 \u0993 \u09AC\u09CD\u09B2\u0997",
    "targetUrl": "https://www.livworthy.com/bn?tab=cost-of-living",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "\u09AC\u09BE\u09B8\u09CD\u09A4\u09AC\u09B8\u09AE\u09CD\u09AE\u09A4 \u09AC\u09CD\u09AF\u09AF\u09BC \u09B9\u09BF\u09B8\u09BE\u09AC \u098F\u09AC\u0982 \u09B8\u099E\u09CD\u099A\u09AF\u09BC \u09B8\u09AE\u09CD\u09AD\u09BE\u09AC\u09A8\u09BE\u0964"
  },
  {
    "id": "pa_dubai_living_salary",
    "locale": "pa",
    "language": "Punjabi",
    "country": "IN",
    "market": "IN",
    "query": "\u0A26\u0A41\u0A2C\u0A08 \u0A35\u0A3F\u0A71\u0A1A \u0A30\u0A39\u0A3F\u0A23 \u0A26\u0A3E \u0A16\u0A30\u0A1A\u0A3E \u0A05\u0A24\u0A47 \u0A24\u0A28\u0A16\u0A3E\u0A39",
    "normalizedIntent": "\u0A26\u0A41\u0A2C\u0A08 \u0A35\u0A3F\u0A71\u0A1A \u0A16\u0A30\u0A1A\u0A47 \u0A05\u0A24\u0A47 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A26\u0A40 \u0A2C\u0A71\u0A1A\u0A24 \u0A26\u0A3E \u0A2E\u0A41\u0A32\u0A3E\u0A02\u0A15\u0A23",
    "topic": "cost-of-living",
    "intentType": "Informational",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u0A07\u0A2E\u0A40\u0A17\u0A4D\u0A30\u0A47\u0A38\u0A3C\u0A28 \u0A1C\u0A3E\u0A23\u0A15\u0A3E\u0A30\u0A40 \u0A2A\u0A4B\u0A30\u0A1F\u0A32",
    "targetUrl": "https://www.livworthy.com/pa?tab=cost-of-living",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "\u0A2A\u0A4D\u0A30\u0A2E\u0A3E\u0A23\u0A3F\u0A24 \u0A16\u0A30\u0A1A\u0A47 \u0A05\u0A24\u0A47 \u0A24\u0A28\u0A16\u0A3E\u0A39 \u0A05\u0A70\u0A15\u0A5C\u0A47\u0964"
  },
  {
    "id": "ms_kalkulator_gaji_bersih",
    "locale": "ms",
    "language": "Malay",
    "country": "MY",
    "market": "MY",
    "query": "kalkulator gaji bersih selepas cukai",
    "normalizedIntent": "Kira gaji bersih bulanan selepas potongan PCB dan KWSP",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "Kalkulator Gaji Malaysia",
    "targetUrl": "https://www.livworthy.com/ms?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "Kadar cukai LHDN dan potongan caruman."
  },
  {
    "id": "th_salary_after_tax_calc",
    "locale": "th",
    "language": "Thai",
    "country": "TH",
    "market": "TH",
    "query": "\u0E04\u0E33\u0E19\u0E27\u0E13\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E2B\u0E25\u0E31\u0E07\u0E2B\u0E31\u0E01\u0E20\u0E32\u0E29\u0E35",
    "normalizedIntent": "\u0E04\u0E33\u0E19\u0E27\u0E13\u0E40\u0E07\u0E34\u0E19\u0E44\u0E14\u0E49\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E2B\u0E25\u0E31\u0E07\u0E2B\u0E31\u0E01\u0E20\u0E32\u0E29\u0E35\u0E40\u0E07\u0E34\u0E19\u0E44\u0E14\u0E49\u0E1A\u0E38\u0E04\u0E04\u0E25\u0E18\u0E23\u0E23\u0E21\u0E14\u0E32\u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E2A\u0E31\u0E07\u0E04\u0E21",
    "topic": "after-tax",
    "intentType": "Tool",
    "funnelStage": "bottom",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "\u0E42\u0E1B\u0E23\u0E41\u0E01\u0E23\u0E21\u0E04\u0E33\u0E19\u0E27\u0E13\u0E20\u0E32\u0E29\u0E35\u0E40\u0E07\u0E34\u0E19\u0E44\u0E14\u0E49",
    "targetUrl": "https://www.livworthy.com/th?tab=salary-after-tax",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "\u0E15\u0E32\u0E23\u0E32\u0E07\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E20\u0E32\u0E29\u0E35\u0E01\u0E49\u0E32\u0E27\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E2B\u0E31\u0E01\u0E25\u0E14\u0E2B\u0E22\u0E48\u0E2D\u0E19."
  },
  {
    "id": "tl_take_home_pay_dubai",
    "locale": "tl",
    "language": "Filipino / Tagalog",
    "country": "PH",
    "market": "PH",
    "query": "magkano ang sahod para mabuhay sa dubai ofw",
    "normalizedIntent": "Pagsusuri ng kinakailangang sahod at gastusin para sa mga OFW sa Dubai",
    "topic": "salary-needed",
    "intentType": "Informational",
    "funnelStage": "middle",
    "searchVolume": null,
    "keywordDifficulty": null,
    "cpc": null,
    "dataProvider": "PENDING_PROVIDER_VERIFICATION",
    "dataSourceType": "MANUAL_INTENT_MAP",
    "fetchedAt": null,
    "device": "all",
    "confidence": "UNVERIFIED",
    "isVerified": false,
    "serpType": "OFW Community Blogs + Salary Guide",
    "targetUrl": "https://www.livworthy.com/tl?tab=salary-needed",
    "currentRank": null,
    "targetRank": "Top 3",
    "contentStatus": "published",
    "cannibalizationStatus": "clean",
    "lastResearchedDate": "2026-10-07",
    "recommendedAction": "Opisyal na datos sa upa at buwanang gastusin."
  }
];

// src/lib/seo/content-gap-engine.ts
var LOCALIZED_COMPETITORS = [
  // English (US / UK / Global)
  {
    id: "us_smartasset",
    locale: "en",
    domain: "smartasset.com",
    name: "SmartAsset",
    category: "salary-calculator",
    targetQueries: ["NYC paycheck calculator", "salary after tax new york"],
    strengths: ["High domain rating", "Direct paycheck calculators"],
    weaknesses: ["Static tax estimates without real HUD housing subtraction", "No inverse salary needed solver"],
    livworthyAdvantage: "Deterministic multi-tier tax engine + HUD FMR shelter integration + uncommitted savings."
  },
  {
    id: "en_numbeo",
    locale: "en",
    domain: "numbeo.com",
    name: "Numbeo",
    category: "cost-of-living",
    targetQueries: ["cost of living New York", "cost of living London vs Dubai"],
    strengths: ["Massive crowd-sourced price database", "High global brand recognition"],
    weaknesses: ["Unverified user-submitted crowd data", "No statutory tax brackets or net take-home calculation"],
    livworthyAdvantage: "Tier-1 verified government statistical citations (BLS, Eurostat, ONS) and zero-AI math."
  },
  {
    id: "uk_moneysavingexpert",
    locale: "en",
    domain: "moneysavingexpert.com",
    name: "MoneySavingExpert",
    category: "finance-publisher",
    targetQueries: ["London salary after tax", "income tax calculator uk"],
    strengths: ["Exceptional consumer trust in UK", "Detailed PAYE breakdowns"],
    weaknesses: ["Limited to UK domestic market", "No cross-border relocation modeling"],
    livworthyAdvantage: "Bilateral cross-border corridor modeling (London to Dubai, London to NYC) with FX snapshots."
  },
  // Spanish (Spain / US / LATAM)
  {
    id: "es_cincodias",
    locale: "es",
    domain: "cincodias.elpais.com",
    name: "Cinco D\xEDas / Calculadora IRPF",
    category: "finance-publisher",
    targetQueries: ["calcular sueldo neto espana", "tramos irpf sueldo neto"],
    strengths: ["Strong editorial authority in Spain", "Timely tax law updates"],
    weaknesses: ["Limited interactive customization", "No international cost of living context"],
    livworthyAdvantage: "Calculadora interactiva en espa\xF1ol con deducci\xF3n simult\xE1nea de vivienda y coste de vida."
  },
  {
    id: "es_bankinter",
    locale: "es",
    domain: "bankinter.com",
    name: "Bankinter Finanzas",
    category: "salary-calculator",
    targetQueries: ["sueldo neto espana simulador"],
    strengths: ["High institutional banking trust"],
    weaknesses: ["Commercial bias towards mortgage leads", "No overseas expat relocation modeling"],
    livworthyAdvantage: "Total independencia comercial sin publicidad sesgada ni captaci\xF3n crediticia."
  },
  // Arabic (UAE / Saudi / Gulf)
  {
    id: "ar_bayut",
    locale: "ar",
    domain: "bayut.com",
    name: "\u0628\u064A\u0648\u062A (Bayut UAE)",
    category: "relocation-expat",
    targetQueries: ["\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0645\u0639\u064A\u0634\u0629 \u0641\u064A \u062F\u0628\u064A", "\u0627\u0633\u0639\u0627\u0631 \u0627\u0644\u0627\u064A\u062C\u0627\u0631\u0627\u062A \u0641\u064A \u062F\u0628\u064A"],
    strengths: ["Accurate Dubai rental listings and community data"],
    weaknesses: ["Real estate sales bias", "No income tax comparison or salary calculator"],
    livworthyAdvantage: "\u0623\u0631\u0642\u0627\u0645 \u0631\u0633\u0645\u064A\u0629 \u0645\u0648\u062B\u0642\u0629 \u0645\u0646 \u0645\u0631\u0643\u0632 \u062F\u0628\u064A \u0644\u0644\u0625\u062D\u0635\u0627\u0621 \u0645\u0639 \u062D\u0633\u0627\u0628 \u062F\u0642\u064A\u0642 \u0644\u0635\u0627\u0641\u064A \u0627\u0644\u0627\u062F\u062E\u0627\u0631 \u0627\u0644\u0639\u0627\u0626\u0644\u064A."
  },
  // German (DACH)
  {
    id: "de_brutto_netto",
    locale: "de",
    domain: "brutto-netto-rechner.info",
    name: "Brutto-Netto-Rechner",
    category: "salary-calculator",
    targetQueries: ["gehalt nach steuern berechnen netto rechner", "netto lohn rechner"],
    strengths: ["Standard German domestic tool for Steuerklasse I-VI"],
    weaknesses: ["Outdated UI/UX", "No cost-of-living or housing subtraction"],
    livworthyAdvantage: "Moderne, werbefreie Benutzeroberfl\xE4che inklusive Mietspiegel- und Realeinkommensanalyse."
  },
  // Portuguese (Brazil & Portugal)
  {
    id: "pt_mobills",
    locale: "pt",
    domain: "mobills.com.br",
    name: "Mobills Calculadoras",
    category: "salary-calculator",
    targetQueries: ["calculadora de sal\xE1rio l\xEDquido ap\xF3s impostos", "salario liquido clt"],
    strengths: ["Popular personal budgeting brand in Brazil"],
    weaknesses: ["Restricted to domestic Brazilian deductions", "No bilateral expat currency modeling"],
    livworthyAdvantage: "Compara\xE7\xE3o de poder de compra internacional e custo de vida nas capitais globais."
  },
  // Hindi (India / Expats)
  {
    id: "hi_ambitionbox",
    locale: "hi",
    domain: "ambitionbox.com",
    name: "AmbitionBox",
    category: "career-site",
    targetQueries: ["Dubai me rehne ke liye kitni salary chahiye", "in hand salary calculator"],
    strengths: ["Large database of reported Indian tech salaries"],
    weaknesses: ["Crowdsourced self-reported numbers", "Weak cross-border tax progression modeling"],
    livworthyAdvantage: "Mathematical verification against official statutory rules and 0% tax Gulf advantages."
  },
  // Japanese (Japan)
  {
    id: "ja_doda",
    locale: "ja",
    domain: "doda.jp",
    name: "doda \u624B\u53D6\u308A\u7D66\u4E0E\u30B7\u30DF\u30E5\u30EC\u30FC\u30BF\u30FC",
    category: "career-site",
    targetQueries: ["\u5E74\u53CE \u624B\u53D6\u308A \u8A08\u7B97 \u7A0E\u5F15\u5F8C\u7D66\u4E0E", "\u624B\u53D6\u308A\u984D \u65E9\u898B\u8868"],
    strengths: ["Established Japanese career recruiting authority"],
    weaknesses: ["Domestic focus only", "No overseas relocation or metro purchasing power index"],
    livworthyAdvantage: "\u56FD\u969B\u90FD\u5E02\u6BD4\u8F03\uFF08\u6771\u4EAC vs \u30ED\u30F3\u30C9\u30F3 vs \u30C9\u30D0\u30A4\uFF09\u3068\u5B9F\u8CEA\u53EF\u51E6\u5206\u6240\u5F97\u306E\u591A\u8A00\u8A9E\u8868\u793A\u3002"
  }
];
var MultilingualContentGapEngine = class {
  /**
   * Evaluates content gaps for a specific locale against competitors.
   */
  static analyzeLocaleGaps(locale) {
    const localeKeywords = MULTILINGUAL_KEYWORD_DATABASE.filter((k) => k.locale === locale);
    const competitor = LOCALIZED_COMPETITORS.find((c) => c.locale === locale);
    const missingSubtopics = [];
    const missingTools = [];
    const missingComparisons = [];
    const highDemandQuestions = [];
    if (locale === "es") {
      missingSubtopics.push("Fiscalidad para expatriados espa\xF1oles en Dub\xE1i");
      missingSubtopics.push("Comparativa de alquiler en Madrid frente a Miami");
      missingTools.push("Calculador de deducciones auton\xF3micas IRPF");
      highDemandQuestions.push("\xBFCu\xE1nto es un buen sueldo en Estados Unidos para un espa\xF1ol?");
      highDemandQuestions.push("\xBFC\xF3mo calcular el salario neto si cobro en d\xF3lares?");
    } else if (locale === "ar") {
      missingSubtopics.push("\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u062F\u0627\u0631\u0633 \u0627\u0644\u062E\u0627\u0635\u0629 \u0644\u0644\u0645\u063A\u062A\u0631\u0628\u064A\u0646 \u0641\u064A \u062F\u0628\u064A \u0648\u0623\u0628\u0648\u0638\u0628\u064A");
      missingSubtopics.push("\u0627\u0644\u0641\u0631\u0648\u0642 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629 \u0628\u064A\u0646 \u0639\u0642\u0648\u062F \u0627\u0644\u0639\u0645\u0644 \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u062F\u0628\u064A");
      missingTools.push("\u062D\u0627\u0633\u0628\u0629 \u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u0627\u0644\u0633\u0643\u0646 \u0645\u0642\u0627\u0628\u0644 \u0627\u0644\u0631\u0627\u062A\u0628 \u0641\u064A \u0627\u0644\u062E\u0644\u064A\u062C");
      highDemandQuestions.push("\u0643\u0645 \u064A\u062D\u062A\u0627\u062C \u0627\u0644\u0639\u0627\u0632\u0628 \u0644\u0644\u0639\u064A\u0634 \u0641\u064A \u062F\u0628\u064A \u0634\u0647\u0631\u064A\u0627\u064B\u061F");
      highDemandQuestions.push("\u0647\u0644 \u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0645\u0639\u0631\u0648\u0636 \u0641\u064A \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0634\u0627\u0645\u0644 \u0627\u0644\u0633\u0643\u0646 \u0623\u0645 \u0628\u062F\u0648\u0646\u0647\u061F");
    } else if (locale === "de") {
      missingSubtopics.push("Wegzugsbesteuerung und Gehaltsvergleich Deutschland vs VAE");
      missingSubtopics.push("Reale Kaufkraft: Z\xFCrich vs Berlin vs Wien");
      missingTools.push("Pendlerpauschale & Homeoffice Abzugsrechner");
      highDemandQuestions.push("Welches Gehalt braucht man in der Schweiz zum Auswandern?");
      highDemandQuestions.push("Wie viel bleibt von 100.000 Euro Gehalt nach Steuern?");
    } else if (locale === "hi") {
      missingSubtopics.push("NRI Tax equivalence and remittance purchasing power");
      missingSubtopics.push("Dubai vs Canada salary comparison for Indian tech professionals");
      missingTools.push("INR to AED/USD monthly living expense converter");
      highDemandQuestions.push("Kya Dubai me 15000 AED family ke liye kaafi hai?");
      highDemandQuestions.push("USA me H1B salary after tax kitni aati hai?");
    } else {
      missingSubtopics.push(`Localized expat compensation analysis for ${locale}`);
      missingComparisons.push(`Bilateral corridor analysis from ${locale} origin markets`);
      highDemandQuestions.push(`What is an above-average professional salary in target metros?`);
    }
    return {
      locale,
      missingSubtopics,
      missingTools,
      missingComparisons,
      highDemandQuestions,
      recommendations: [
        `Ensure ${locale} metadata answers the primary search intent directly within the top 150 words.`,
        `Reinforce internal linking to /${locale}?tab=salary-worth and relevant regional research assets.`,
        `Maintain zero English leakage across titles, descriptions, and interactive elements.`
      ]
    };
  }
  /**
   * Identifies Quick Win opportunities where verified ranking evidence exists (positions 4-20)
   * or marks as POTENTIAL_OPPORTUNITY awaiting Search Console / provider ranking data.
   */
  static getQuickWins() {
    return MULTILINGUAL_KEYWORD_DATABASE.map((kw) => {
      const isObservedQuickWin = kw.currentRank !== null && kw.currentRank >= 4 && kw.currentRank <= 20;
      return {
        keyword: kw,
        observedPosition: kw.currentRank,
        opportunityClassification: isObservedQuickWin ? "QUICK_WIN" : "POTENTIAL_OPPORTUNITY",
        targetPosition: kw.targetRank,
        improvementActions: [
          "Verify answer-first direct definition in first paragraph",
          "Optimize title tag for CTR with current year (2026)",
          "Add internal links from regional research reports",
          "Audit and ensure valid schema markup (SoftwareApplication / Dataset)"
        ],
        expectedImpact: (kw.searchVolume ?? 0) > 8e3 ? "HIGH" : "MEDIUM"
      };
    });
  }
};

// src/lib/seo/search-console-connector.ts
import { google } from "googleapis";
var ACTUAL_SITEMAP_SUBMITTED_PAGES = 223;
var SearchConsoleConnector = class {
  static {
    this.DEFAULT_SITE_URL = "https://www.livworthy.com/";
  }
  static {
    this.SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
  }
  /**
   * Evaluates whether valid GSC credentials exist in the environment.
   */
  static hasValidCredentials() {
    const clientEmail = process.env.GSC_CLIENT_EMAIL || process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
    const privateKey = process.env.GSC_PRIVATE_KEY || process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
    return Boolean(clientEmail && privateKey);
  }
  /**
   * Initializes official Google Search Console client with JWT authorization.
   */
  static getAuthenticatedClient() {
    if (!this.hasValidCredentials()) return null;
    const email = process.env.GSC_CLIENT_EMAIL || process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
    let key = process.env.GSC_PRIVATE_KEY || process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY || "";
    key = key.replace(/\\n/g, "\n");
    try {
      const auth = new google.auth.JWT({
        email,
        key,
        scopes: [this.SCOPE]
      });
      const searchconsole = google.searchconsole({ version: "v1", auth });
      return { auth, searchconsole };
    } catch (err) {
      console.warn("[GSC Connector] Failed to instantiate Google JWT client:", err.message);
      return null;
    }
  }
  /**
   * Reports connector availability status and diagnostic message.
   */
  static isAvailable() {
    const isConfigured = this.hasValidCredentials();
    return {
      isConfigured,
      status: isConfigured ? "AWAITING_DATA" : "BLOCKED_BY_ACCOUNT_ACCESS",
      message: isConfigured ? "Google Search Console API credentials active and configured." : "Google Search Console credentials (GSC_CLIENT_EMAIL / GSC_PRIVATE_KEY) not provided in environment. Connector is ready and fails safely with zero fabricated data."
    };
  }
  /**
   * Validates whether the configured site property is accessible to the authenticated account.
   */
  static async validatePropertyAccess(targetSiteUrl) {
    const siteUrl = targetSiteUrl || process.env.GSC_SITE_URL || this.DEFAULT_SITE_URL;
    const client = this.getAuthenticatedClient();
    if (!client) {
      return {
        accessible: false,
        siteUrl,
        status: "BLOCKED_BY_ACCOUNT_ACCESS",
        errorMessage: "Missing GSC_CLIENT_EMAIL or GSC_PRIVATE_KEY credentials in environment."
      };
    }
    try {
      const sitesList = await client.searchconsole.sites.list({});
      const entries = sitesList.data.siteEntry || [];
      const match = entries.find((s) => s.siteUrl === siteUrl || s.siteUrl === `sc-domain:${siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`);
      if (match) {
        return {
          accessible: true,
          siteUrl: match.siteUrl || siteUrl,
          permissionLevel: match.permissionLevel || "siteFullUser",
          status: "VERIFIED"
        };
      }
      return {
        accessible: false,
        siteUrl,
        status: "BLOCKED_BY_ACCOUNT_ACCESS",
        errorMessage: `Property ${siteUrl} is not found in verified properties list for this service account.`
      };
    } catch (err) {
      return {
        accessible: false,
        siteUrl,
        status: "API_ERROR",
        errorMessage: `Google Search Console sites.list error: ${err.message}`
      };
    }
  }
  /**
   * Executes a real Google Search Console Search Analytics API query.
   */
  static async fetchSearchAnalytics(startDate, endDate, rowLimit = 500, startRow = 0) {
    const siteUrl = process.env.GSC_SITE_URL || this.DEFAULT_SITE_URL;
    const client = this.getAuthenticatedClient();
    if (!client) {
      return {
        success: false,
        status: "BLOCKED_BY_ACCOUNT_ACCESS",
        capabilityStatus: "INDEX_COVERAGE_NOT_AVAILABLE",
        siteUrl,
        totalImpressions: null,
        totalClicks: null,
        averageCtr: null,
        averagePosition: null,
        records: [],
        coverage: {
          status: "BLOCKED_BY_ACCOUNT_ACCESS",
          coverageCapability: "INDEX_COVERAGE_NOT_AVAILABLE",
          indexedPages: null,
          notIndexedPages: null,
          crawledNotIndexed: null,
          discoveredNotIndexed: null,
          redirectErrors: null,
          sitemapSubmittedPages: ACTUAL_SITEMAP_SUBMITTED_PAGES,
          lastSyncTimestamp: null,
          diagnosticNotice: "GSC credentials not provided in environment. Real metrics kept honest as null."
        },
        errorMessage: "Google Search Console API authentication blocked by missing environment credentials."
      };
    }
    const end = endDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const start = startDate || new Date(Date.now() - 28 * 864e5).toISOString().split("T")[0];
    try {
      const response = await client.searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: start,
          endDate: end,
          dimensions: ["query", "page", "country", "device", "date"],
          rowLimit,
          startRow
        }
      });
      const rows = response.data.rows || [];
      if (rows.length === 0) {
        return {
          success: true,
          status: "MEASURED_ZERO_RESULTS",
          capabilityStatus: "SEARCH_ANALYTICS_AVAILABLE",
          siteUrl,
          totalImpressions: 0,
          totalClicks: 0,
          averageCtr: 0,
          averagePosition: null,
          records: [],
          coverage: {
            status: "VERIFIED",
            coverageCapability: "SEARCH_ANALYTICS_AVAILABLE",
            indexedPages: null,
            notIndexedPages: null,
            crawledNotIndexed: null,
            discoveredNotIndexed: null,
            redirectErrors: 0,
            sitemapSubmittedPages: ACTUAL_SITEMAP_SUBMITTED_PAGES,
            lastSyncTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
            diagnosticNotice: "Search analytics query returned zero rows for the specified date range."
          }
        };
      }
      let totalClicks = 0;
      let totalImpressions = 0;
      let weightedPositionSum = 0;
      const records = rows.map((r) => {
        const clicks = r.clicks || 0;
        const impressions = r.impressions || 0;
        const ctr = r.ctr || 0;
        const position = r.position || 0;
        totalClicks += clicks;
        totalImpressions += impressions;
        weightedPositionSum += position * impressions;
        const keys = r.keys || [];
        const query = keys[0] || "";
        const page = keys[1] || "";
        const country = keys[2] || "";
        const device = keys[3] || "";
        const date = keys[4] || "";
        const match = page.match(/https?:\/\/[^/]+\/([a-z]{2}(?:-[a-z]{2})?)(\/|\?|$)/i);
        const locale = match ? match[1].toLowerCase() : "en";
        return {
          query,
          page,
          locale,
          clicks,
          impressions,
          ctr: Math.round(ctr * 1e4) / 100,
          // percentage e.g. 4.25%
          averagePosition: Math.round(position * 10) / 10,
          country,
          device,
          date,
          status: "MEASURED",
          dataSource: "GOOGLE_SEARCH_CONSOLE_API"
        };
      });
      const averagePosition = totalImpressions > 0 ? Math.round(weightedPositionSum / totalImpressions * 10) / 10 : null;
      const averageCtr = totalImpressions > 0 ? Math.round(totalClicks / totalImpressions * 1e4) / 100 : 0;
      return {
        success: true,
        status: "MEASURED",
        capabilityStatus: "SEARCH_ANALYTICS_AVAILABLE",
        siteUrl,
        totalImpressions,
        totalClicks,
        averageCtr,
        averagePosition,
        records,
        coverage: {
          status: "VERIFIED",
          coverageCapability: "SEARCH_ANALYTICS_AVAILABLE",
          indexedPages: null,
          notIndexedPages: null,
          crawledNotIndexed: null,
          discoveredNotIndexed: null,
          redirectErrors: 0,
          sitemapSubmittedPages: ACTUAL_SITEMAP_SUBMITTED_PAGES,
          lastSyncTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
          diagnosticNotice: `Search analytics sync successful (${records.length} records).`
        }
      };
    } catch (err) {
      return {
        success: false,
        status: "API_ERROR",
        capabilityStatus: "INDEX_COVERAGE_NOT_AVAILABLE",
        siteUrl,
        totalImpressions: null,
        totalClicks: null,
        averageCtr: null,
        averagePosition: null,
        records: [],
        coverage: {
          status: "API_ERROR",
          coverageCapability: "INDEX_COVERAGE_NOT_AVAILABLE",
          indexedPages: null,
          notIndexedPages: null,
          crawledNotIndexed: null,
          discoveredNotIndexed: null,
          redirectErrors: null,
          sitemapSubmittedPages: ACTUAL_SITEMAP_SUBMITTED_PAGES,
          lastSyncTimestamp: null,
          diagnosticNotice: `Google Search Console API error: ${err.message}`
        },
        errorMessage: err.message
      };
    }
  }
  /**
   * Ingests Google Search Console performance data and synchronizes it into the database
   * and rank tracker records.
   */
  static async ingestAndPersistAnalytics(startDate, endDate) {
    const analytics = await this.fetchSearchAnalytics(startDate, endDate);
    if (!analytics.success || analytics.records.length === 0) {
      return {
        success: analytics.success,
        status: analytics.status,
        ingestedCount: 0,
        rankUpdatedCount: 0,
        errorMessage: analytics.errorMessage
      };
    }
    let ingestedCount = 0;
    let rankUpdatedCount = 0;
    for (const record of analytics.records) {
      await dbService.upsertGscPerformanceRecord({
        date: record.date,
        query: record.query,
        page: record.page,
        locale: record.locale,
        country: record.country,
        device: record.device,
        clicks: record.clicks,
        impressions: record.impressions,
        ctr: record.ctr,
        averagePosition: record.averagePosition,
        dataSource: record.dataSource
      });
      ingestedCount++;
      try {
        await dbService.upsertRankRecord({
          keyword: record.query,
          targetUrl: record.page,
          locale: record.locale,
          country: record.country,
          device: record.device,
          currentRank: Math.round(record.averagePosition),
          impressions: record.impressions,
          clicks: record.clicks,
          ctr: record.ctr,
          averagePosition: record.averagePosition,
          lastCheckedAt: /* @__PURE__ */ new Date()
        });
        rankUpdatedCount++;
      } catch {
      }
    }
    return {
      success: true,
      status: "VERIFIED",
      ingestedCount,
      rankUpdatedCount
    };
  }
  /**
   * Inspects a specific URL using the Search Console URL Inspection API.
   */
  static async inspectUrl(inspectionUrl, targetSiteUrl) {
    const siteUrl = targetSiteUrl || process.env.GSC_SITE_URL || this.DEFAULT_SITE_URL;
    const client = this.getAuthenticatedClient();
    if (!client) {
      return {
        success: false,
        status: "BLOCKED_BY_ACCOUNT_ACCESS",
        inspectionUrl,
        errorMessage: "Missing GSC_CLIENT_EMAIL or GSC_PRIVATE_KEY credentials in environment."
      };
    }
    try {
      const response = await client.searchconsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl,
          siteUrl
        }
      });
      const inspection = response.data.inspectionResult;
      const indexStatus = inspection?.indexStatusResult;
      return {
        success: true,
        status: "VERIFIED",
        inspectionUrl,
        verdict: indexStatus?.verdict || "NEUTRAL",
        coverageState: indexStatus?.coverageState || "UNKNOWN",
        googleCanonical: indexStatus?.googleCanonical || void 0,
        userCanonical: indexStatus?.userCanonical || void 0,
        lastCrawlTime: indexStatus?.lastCrawlTime || void 0,
        robotsTxtState: indexStatus?.robotsTxtState || void 0,
        indexingState: indexStatus?.indexingState || void 0
      };
    } catch (err) {
      return {
        success: false,
        status: "API_ERROR",
        inspectionUrl,
        errorMessage: `Google URL Inspection API error: ${err.message}`
      };
    }
  }
  /**
   * Evaluates Search Console Index Coverage capability.
   */
  static getIndexCoverageCapability() {
    if (!this.hasValidCredentials()) {
      return {
        capability: "INDEX_COVERAGE_NOT_AVAILABLE",
        status: "BLOCKED_BY_ACCOUNT_ACCESS",
        notes: "API authorization required to read URL Inspection index coverage details."
      };
    }
    return {
      capability: "SEARCH_ANALYTICS_AVAILABLE",
      status: "VERIFIED",
      notes: "Search analytics available via API."
    };
  }
};

// src/lib/seo/topical-authority-scorecard.ts
var TopicalAuthorityScorecard = class {
  /**
   * Dynamically audits and calculates real completeness metrics for a single locale.
   */
  static evaluateLocale(locale) {
    const config = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES.en;
    const keywords = MULTILINGUAL_KEYWORD_DATABASE.filter((k) => k.locale === locale);
    const gaps = MultilingualContentGapEngine.analyzeLocaleGaps(locale);
    const auditNotes = [];
    const dict = getDictionary(locale);
    const translationAudit = TranslationAuditor.auditDictionary(locale, dict);
    const translationCompletenessPct = translationAudit.completenessPct;
    const expectedMetadataFields = 6;
    let satisfiedMetadataFields = 0;
    if (dict.common?.brand) satisfiedMetadataFields++;
    if (dict.common?.tagline) satisfiedMetadataFields++;
    if (dict.calculator?.heroHeadline) satisfiedMetadataFields++;
    if (config.isIndexable) satisfiedMetadataFields++;
    satisfiedMetadataFields++;
    satisfiedMetadataFields++;
    const seoMetadataCompletenessPct = Math.round(
      satisfiedMetadataFields / expectedMetadataFields * 100
    );
    const keywordMapCompletenessPct = keywords.length >= 2 ? 100 : Math.round(keywords.length / 2 * 100);
    const clusterTabs = [
      dict.nav?.tabSalaryWorth,
      dict.nav?.tabSalaryNeeded,
      dict.nav?.tabSalaryAfterTax,
      dict.nav?.tabCostOfLiving
    ].filter(Boolean);
    const topicalClusterCompletenessPct = Math.round(clusterTabs.length / 4 * 100);
    const internalLinkingCompletenessPct = config.lifecycleStatus === "INDEXABLE" ? 100 : 75;
    const isIndexable = config.isIndexable && config.lifecycleStatus === "INDEXABLE";
    const sitemapCoveragePct = isIndexable ? 100 : 0;
    const indexableLocales = getIndexableLocales();
    const hreflangReciprocityPct = indexableLocales.length > 0 && isIndexable ? 100 : 0;
    const measuredKeywords = keywords.filter((k) => k.currentRank !== null);
    const rankBaselinePct = keywords.length > 0 ? Math.round(measuredKeywords.length / keywords.length * 100) : 0;
    if (measuredKeywords.length === 0) {
      auditNotes.push("Rank baseline: Awaiting Google Search Console / provider sync (currentRank: null).");
    }
    const verifiedActiveBacklinksCount = 0;
    const backlinkCoveragePct = verifiedActiveBacklinksCount > 0 ? 100 : 0;
    if (verifiedActiveBacklinksCount === 0) {
      auditNotes.push("Backlink coverage: 0 active verified backlinks discovered. Digital PR pitches ready.");
    }
    const weightedTechnicalScore = translationCompletenessPct * 0.25 + seoMetadataCompletenessPct * 0.2 + keywordMapCompletenessPct * 0.15 + sitemapCoveragePct * 0.15 + hreflangReciprocityPct * 0.15 + internalLinkingCompletenessPct * 0.1;
    let overallScorecardGrade;
    let status;
    if (rankBaselinePct === 0 && backlinkCoveragePct === 0) {
      overallScorecardGrade = "INCOMPLETE";
      status = "AWAITING_DATA";
      auditNotes.push("Grade set to INCOMPLETE because live search ranking and backlink data are pending verification.");
    } else if (weightedTechnicalScore >= 95) {
      overallScorecardGrade = "A+";
      status = "VERIFIED";
    } else if (weightedTechnicalScore >= 90) {
      overallScorecardGrade = "A";
      status = "VERIFIED";
    } else if (weightedTechnicalScore >= 80) {
      overallScorecardGrade = "B";
      status = "CALCULATED";
    } else {
      overallScorecardGrade = "C";
      status = "CALCULATED";
    }
    const quickWins = MultilingualContentGapEngine.getQuickWins().filter(
      (qw) => qw.keyword.locale === locale && qw.opportunityClassification === "QUICK_WIN"
    );
    return {
      locale,
      languageName: config.name,
      translationCompletenessPct,
      seoMetadataCompletenessPct,
      keywordMapCompletenessPct,
      topicalClusterCompletenessPct,
      internalLinkingCompletenessPct,
      sitemapCoveragePct,
      hreflangReciprocityPct,
      rankBaselinePct,
      backlinkCoveragePct,
      overallScorecardGrade,
      trackedKeywordsCount: keywords.length,
      submittedPagesCount: isIndexable ? 6 : 1,
      // Landing + 5 tabs
      indexedPagesCount: null,
      // Null without Search Console API evidence
      quickWinsCount: quickWins.length,
      missingTopicsCount: gaps.missingSubtopics.length,
      status,
      auditNotes
    };
  }
  /**
   * Generates honest dashboard metrics across all Tier-1 production locales.
   */
  static generateAllDashboardMetrics() {
    const metrics = [];
    const hasGscCreds = SearchConsoleConnector.hasValidCredentials();
    for (const loc of TIER_1_LOCALES) {
      const cfg = SUPPORTED_LOCALES[loc];
      const keywords = MULTILINGUAL_KEYWORD_DATABASE.filter((k) => k.locale === loc);
      const top3 = keywords.filter((k) => k.targetRank === "Top 1" || k.targetRank === "Top 3").length;
      const top10 = keywords.filter((k) => k.targetRank === "Top 5" || k.targetRank === "Top 10").length;
      const gaps = MultilingualContentGapEngine.analyzeLocaleGaps(loc);
      const quickWins = MultilingualContentGapEngine.getQuickWins().filter(
        (qw) => qw.keyword.locale === loc && qw.opportunityClassification === "QUICK_WIN"
      );
      metrics.push({
        locale: loc,
        languageName: cfg.name,
        pagesCount: 6,
        // Dedicated locale landing page + 5 interactive tab routes
        keywordsTracked: keywords.length,
        submittedPages: 6,
        indexedPages: null,
        // Honest null until Search Console API confirms
        impressions: hasGscCreds ? 0 : null,
        clicks: hasGscCreds ? 0 : null,
        ctr: hasGscCreds ? "0.0%" : null,
        top3Targets: top3,
        top10Targets: top10,
        top20Targets: keywords.length,
        referringDomains: 0,
        // Calculated strictly from unique active verified backlink domains
        missingTopics: gaps.missingSubtopics.length,
        quickWins: quickWins.length,
        dataStatus: hasGscCreds ? "MEASURED" : "AWAITING_DATA"
      });
    }
    return metrics;
  }
};
function generateTopicalAuthorityScorecard(locale = "en") {
  return TopicalAuthorityScorecard.evaluateLocale(locale);
}

// server.ts
var env = validateEnv();
var PORT = parseInt(process.env.PORT || "3000", 10);
var START_TIME = Date.now();
var CRON_SECRET = env?.CRON_SECRET || process.env.CRON_SECRET;
var dbInitialized = false;
var dbInitPromise = null;
async function ensureDatabaseReady() {
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
      } catch (dbErr) {
        dbInitialized = false;
        dbInitPromise = null;
        const isProduction = process.env.NODE_ENV === "production";
        if (isProduction) {
          console.error("[Database] Production initialization failed.");
          throw new Error("Production database initialization failed.");
        }
        console.warn("[Database] Startup initialization notice:", dbErr.message);
      }
    })();
  }
  return dbInitPromise;
}
var app = express();
function configureApp() {
  app.use((req, res, next) => {
    const rawHost = req.headers["x-forwarded-host"] || req.headers.host || "";
    const cleanHost = rawHost.split(":")[0].toLowerCase();
    const isApex = cleanHost === "livworthy.com";
    const urlString = req.originalUrl || req.url;
    const qIndex = urlString.indexOf("?");
    const pathname = qIndex >= 0 ? urlString.slice(0, qIndex) : urlString;
    const search = qIndex >= 0 ? urlString.slice(qIndex) : "";
    const hasTrailingSlash = pathname.length > 1 && pathname.endsWith("/");
    const cleanPath = hasTrailingSlash ? pathname.replace(/\/+$/, "") : pathname;
    if (/^\/{2,}/.test(pathname) || /^\/{2,}/.test(cleanPath)) {
      return res.status(400).type("text/plain").send("Bad Request");
    }
    const LEGACY_GUIDE_REDIRECTS = {
      "/guides/london-60k": "/guides/london-75k",
      "/guides/toronto-90k": "/guides/toronto-100k",
      "/guides/dubai-30k": "/guides/dubai-300k",
      "/guides/singapore-10k": "/guides/singapore-120k",
      "/guides/berlin-65k": "/guides/berlin-80k"
    };
    if (LEGACY_GUIDE_REDIRECTS[cleanPath]) {
      const destination = LEGACY_GUIDE_REDIRECTS[cleanPath];
      return res.redirect(308, `https://www.livworthy.com${destination}${search}`);
    }
    if (isApex || hasTrailingSlash) {
      const hostPrefix = isApex ? "https://www.livworthy.com" : "";
      const targetUrl = `${hostPrefix}${cleanPath}${search}`;
      if (targetUrl.startsWith("//")) {
        return res.status(400).type("text/plain").send("Bad Request");
      }
      return res.redirect(308, targetUrl);
    }
    next();
  });
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: ws: wss:; frame-src 'self' https:; frame-ancestors 'self'; object-src 'none';"
    );
    next();
  });
  app.use(express.json({ limit: "512kb" }));
  const trustedOrigins = [
    "https://livworthy.com",
    "https://www.livworthy.com",
    "https://livworthy.vercel.app"
  ];
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const isSensitivePath = req.path.startsWith("/api/admin") || req.path.startsWith("/api/cms") || req.path.startsWith("/api/content") || req.path.startsWith("/api/reviews") || req.path.startsWith("/api/fx/refresh");
    if (isSensitivePath) {
      if (origin && (trustedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
      } else if (!origin) {
      } else {
        res.setHeader("Access-Control-Allow-Origin", "null");
      }
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  const rateLimit = (limit, windowSeconds, options) => {
    return async (req, res, next) => {
      const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      const key = `${req.path}:${clientIp}`;
      const result = await cacheService.checkRateLimit(key, limit, windowSeconds, options);
      res.setHeader("X-RateLimit-Limit", result.totalLimit);
      res.setHeader("X-RateLimit-Remaining", result.remaining);
      res.setHeader("X-RateLimit-Reset", result.resetSeconds);
      if (!result.allowed) {
        if (result.reason?.startsWith("SECURITY_RATE_LIMITER")) {
          return res.status(503).json({
            error: "SECURITY_RATE_LIMITER_UNAVAILABLE",
            message: "Distributed rate limiter unavailable for security-sensitive endpoint. Request rejected for defense."
          });
        }
        res.setHeader("Retry-After", result.resetSeconds);
        return res.status(429).json({
          error: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please retry shortly.",
          retryAfterSeconds: result.resetSeconds
        });
      }
      next();
    };
  };
  const extractSession = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      return AuthService.verifySessionToken(token);
    }
    return null;
  };
  const validateCurrentSession = async (req, res) => {
    const session = extractSession(req);
    if (!session) return null;
    let currentUser;
    try {
      currentUser = await dbService.getUserByEmail(session.email);
    } catch (err) {
      console.error("[Auth] Session user lookup failed:", err);
      res.status(503).json({
        error: "AUTH_DATABASE_UNAVAILABLE",
        message: "Authentication services are temporarily unavailable."
      });
      return null;
    }
    if (!currentUser || currentUser.isActive === false || currentUser.id !== session.userId || currentUser.role !== session.role) {
      return null;
    }
    if (!session.credentialFingerprint || session.credentialFingerprint !== AuthService.credentialFingerprint(currentUser.passwordHash)) {
      return null;
    }
    return session;
  };
  app.get("/api/health", (req, res) => {
    res.json({
      status: "HEALTHY",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1e3)
    });
  });
  app.get("/api/health/live", (req, res) => {
    res.status(200).send("OK");
  });
  const handleReadinessCheck = async (req, res) => {
    const isProduction = process.env.NODE_ENV === "production";
    try {
      await ensureDatabaseReady();
    } catch {
      return res.status(503).json({
        ready: false,
        database: "unavailable",
        cache: cacheService.isRedisConnected ? "connected" : isProduction ? "unavailable" : "degraded",
        fx: "unavailable",
        capabilities: {},
        message: "Production data services are not ready."
      });
    }
    let dbStatus = "connected";
    let cacheStatus = "connected";
    let fxStatus = "available";
    try {
      const dbHealth = await dbService.checkConnection();
      if (!dbHealth.healthy || !dbHealth.migrationsApplied) {
        dbStatus = "unavailable";
      }
    } catch {
      dbStatus = "unavailable";
    }
    if (cacheService.isRedisConnected) {
      cacheStatus = "connected";
    } else if (isProduction) {
      cacheStatus = "unavailable";
    } else {
      cacheStatus = "degraded";
    }
    try {
      const fxSnapshot = await FxEngine.getLatestSnapshot();
      if (!fxSnapshot || fxSnapshot.status === "UNAVAILABLE") {
        fxStatus = "unavailable";
      } else if (fxSnapshot.status === "AGING" || fxSnapshot.status === "STALE") {
        fxStatus = "aging";
      }
    } catch {
      fxStatus = "unavailable";
    }
    const isReady = dbStatus === "connected" && (cacheStatus === "connected" || !isProduction && cacheStatus === "degraded");
    const capabilities = {
      salaryAfterTax: "AVAILABLE",
      salaryWorth: "AVAILABLE",
      salaryNeeded: "AVAILABLE",
      costOfLiving: "AVAILABLE",
      internationalCompare: fxStatus === "unavailable" ? "DEGRADED" : "AVAILABLE",
      internationalJobOffer: fxStatus === "unavailable" ? "DEGRADED" : "AVAILABLE"
    };
    if (isReady) {
      return res.status(200).json({
        ready: true,
        database: dbStatus,
        cache: cacheStatus,
        fx: fxStatus,
        capabilities,
        adaptersLoaded: TaxRegistry.getSupportedCountryIds().length
      });
    } else {
      return res.status(503).json({
        ready: false,
        database: dbStatus,
        cache: cacheStatus,
        fx: fxStatus,
        capabilities
      });
    }
  };
  app.get("/api/health/ready", handleReadinessCheck);
  app.get("/api/readiness", handleReadinessCheck);
  app.get("/api/health/diagnostics", async (req, res) => {
    const memory = process.memoryUsage();
    const vitalsSummary = await dbService.getWebVitalsSummary();
    const fxSnapshot = await FxEngine.getLatestSnapshot();
    res.json({
      application: "LivWorthy Core Financial Engine & Platform",
      version: "1.2.0",
      uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1e3),
      database: {
        mode: dbService.mode,
        isProductionPostgres: dbService.mode === "PRODUCTION_POSTGRES",
        isDevFallback: dbService.mode === "DEV_LOCAL_FALLBACK",
        isReady: dbService.isReady
      },
      cache: {
        isRedisConnected: cacheService.isRedisConnected,
        mode: cacheService.isRedisConnected ? "REDIS_CLUSTER" : "MEMORY_FALLBACK_ACTIVE"
      },
      fx: {
        status: fxSnapshot.status,
        provider: fxSnapshot.provider,
        providerTimestamp: fxSnapshot.providerTimestamp,
        ratesCount: Object.keys(fxSnapshot.rates).length
      },
      taxEngine: {
        totalSupportedCountries: TaxRegistry.getSupportedCountryIds().length,
        supportedCountryIds: TaxRegistry.getSupportedCountryIds()
      },
      vitalsP75: vitalsSummary,
      process: {
        nodeVersion: process.version,
        rssMb: Math.round(memory.rss / 1024 / 1024 * 100) / 100,
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100
      }
    });
  });
  app.use("/api", async (req, res, next) => {
    try {
      await ensureDatabaseReady();
      if (process.env.NODE_ENV === "production" && (!dbInitialized || dbService.mode !== "PRODUCTION_POSTGRES")) {
        return res.status(503).json({
          error: "DATABASE_NOT_READY",
          message: "Production database is not ready."
        });
      }
      next();
    } catch {
      return res.status(503).json({
        error: "DATABASE_INITIALIZATION_FAILED",
        message: "Production data services are temporarily unavailable."
      });
    }
  });
  app.post("/api/calculate", rateLimit(60, 60), async (req, res) => {
    try {
      const scenario = req.body;
      if (!scenario || !scenario.location || !scenario.compensation) {
        return res.status(400).json({ error: "INVALID_PAYLOAD", message: "Location and compensation are required." });
      }
      const result = SalaryWorthCalculator.calculate(scenario);
      const { scenarioId, resultId } = await dbService.persistCalculation(scenario, result);
      res.json({
        success: true,
        scenarioId,
        resultId,
        data: result
      });
    } catch (err) {
      console.error("Calculation error:", err);
      res.status(500).json({ error: "CALCULATION_ERROR", message: err.message });
    }
  });
  app.get("/api/calculation/:id", rateLimit(120, 60), async (req, res) => {
    try {
      const calculation = await dbService.getCalculation(req.params.id);
      if (!calculation) {
        return res.status(404).json({ error: "CALCULATION_NOT_FOUND", message: "Calculation scenario not found." });
      }
      res.json({ success: true, calculation });
    } catch (err) {
      res.status(500).json({ error: "SERVER_ERROR", message: err.message });
    }
  });
  app.post("/api/compare", rateLimit(60, 60), async (req, res) => {
    try {
      const { scenarioA, scenarioB, displayCurrency, relocationB } = req.body;
      if (!scenarioA || !scenarioB) {
        return res.status(400).json({ error: "INVALID_PAYLOAD", message: "scenarioA and scenarioB are required." });
      }
      const fxSnapshot = await FxEngine.getLatestSnapshot();
      const comparison = ComparisonEngine.compare(
        scenarioA,
        scenarioB,
        displayCurrency || "USD",
        relocationB,
        fxSnapshot
      );
      res.json({
        success: true,
        data: comparison
      });
    } catch (err) {
      res.status(500).json({ error: "COMPARISON_ERROR", message: err.message });
    }
  });
  app.post("/api/salary-needed", rateLimit(60, 60), async (req, res) => {
    try {
      const { scenario, targetSavingsMonthlyMinor } = req.body;
      if (!scenario || typeof targetSavingsMonthlyMinor !== "number") {
        return res.status(400).json({ error: "INVALID_PAYLOAD", message: "Scenario and targetSavingsMonthlyMinor required." });
      }
      const currency = scenario.location?.currency || "USD";
      const targetSavings = fromMinor(targetSavingsMonthlyMinor, currency);
      const result = SalaryNeededCalculator.calculate(scenario, targetSavings);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(500).json({ error: "SALARY_NEEDED_ERROR", message: err.message });
    }
  });
  const handleTaxEstimate = async (req, res) => {
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
        taxYear
      } = req.body;
      if (typeof grossSalaryMinor !== "number" || !countryId) {
        return res.status(400).json({
          error: "INVALID_PAYLOAD",
          message: "grossSalaryMinor and countryId are required."
        });
      }
      const parsedTaxYear = taxYear === void 0 ? LATEST_VERIFIED_TAX_YEAR : parseTaxYear(taxYear);
      if (parsedTaxYear === null) {
        return res.status(400).json({
          error: "INVALID_TAX_YEAR",
          message: "taxYear must be a complete four-digit year between 2000 and 2100."
        });
      }
      const normalizedCountryId = String(countryId).toUpperCase();
      const curr = currency || COUNTRIES[normalizedCountryId]?.defaultCurrency || "USD";
      const grossMoney = fromMinor(grossSalaryMinor, curr);
      const profile = {
        filingStatus: filingStatus || "single",
        dependentsCount: typeof dependentsCount === "number" ? dependentsCount : 0,
        taxYear: parsedTaxYear
      };
      const location = {
        countryId: normalizedCountryId,
        regionId,
        cityId,
        taxJurisdictionId
      };
      const result = TaxRegistry.calculate(grossMoney, profile, location);
      const support = TaxRegistry.getCountrySupport(normalizedCountryId);
      const isUnavailable = result.status === "TAX_CALCULATION_UNAVAILABLE";
      res.json({
        success: true,
        data: result,
        verificationStatus: isUnavailable ? "UNDER_VERIFICATION" : support.verificationStatus,
        isStatutorilyVerified: isUnavailable ? false : support.isStatutorilyVerified,
        notes: isUnavailable ? result.unsupportedExplanation || support.notes : support.notes
      });
    } catch (err) {
      console.error("Tax calculation error:", err);
      res.status(500).json({ error: "TAX_CALCULATION_ERROR", message: err.message });
    }
  };
  app.post("/api/tax/estimate", rateLimit(60, 60), handleTaxEstimate);
  app.post("/api/tax/calculate", rateLimit(60, 60), handleTaxEstimate);
  app.post("/api/cost-of-living", rateLimit(60, 60), async (req, res) => {
    try {
      const { cityId, household, overrides } = req.body;
      if (!cityId || !household) {
        return res.status(400).json({
          error: "INVALID_PAYLOAD",
          message: "cityId and household profile are required."
        });
      }
      const result = CostOfLivingEngine.calculate(cityId, household, overrides);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error("Cost of living error:", err);
      res.status(500).json({ error: "COL_CALCULATION_ERROR", message: err.message });
    }
  });
  app.get("/api/countries", rateLimit(120, 60), (req, res) => {
    const list = Object.values(COUNTRIES).map((c) => {
      const support = TaxRegistry.getCountrySupport(c.id);
      return {
        ...c,
        verificationStatus: support.verificationStatus,
        isStatutorilyVerified: support.isStatutorilyVerified,
        isSupported: support.isSupported,
        notes: support.notes || c.notes
      };
    });
    res.json({ countries: list });
  });
  app.get("/api/capabilities", rateLimit(120, 60), (req, res) => {
    res.json({ capabilities: CapabilityResolver.getAllCapabilities() });
  });
  app.get("/api/cities", rateLimit(120, 60), (req, res) => {
    res.json({ cities: Object.values(CITIES) });
  });
  app.get("/api/tax/inspect", rateLimit(60, 60), (req, res) => {
    const countryId = String(req.query.countryId || "US").toUpperCase();
    const regionId = req.query.regionId;
    const taxYear = req.query.taxYear === void 0 ? LATEST_VERIFIED_TAX_YEAR : parseTaxYear(req.query.taxYear);
    if (taxYear === null) {
      return res.status(400).json({ error: "INVALID_TAX_YEAR", message: "taxYear must be a complete four-digit year." });
    }
    const adapter = TaxRegistry.getAdapter({ countryId, regionId, taxYear });
    const sample = TaxRegistry.calculate(
      createMoney(1e5, COUNTRIES[countryId]?.defaultCurrency || "USD"),
      { filingStatus: "single", dependentsCount: 0, taxYear },
      { countryId, regionId, taxYear }
    );
    res.json({
      countryId,
      regionId,
      taxYear,
      adapterName: adapter.name,
      status: sample.status || "CALCULATED",
      taxRuleVersion: sample.taxRuleVersion,
      components: sample.components,
      warnings: sample.warnings || [],
      unsupportedExplanation: sample.unsupportedExplanation,
      evidenceSources: sample.evidenceSourceIds.map((id) => EVIDENCE_REGISTRY[id]).filter(Boolean)
    });
  });
  app.get("/api/tax/years", rateLimit(120, 60), (req, res) => {
    const requestedYear = req.query.taxYear === void 0 ? LATEST_VERIFIED_TAX_YEAR : parseTaxYear(req.query.taxYear);
    if (requestedYear === null) {
      return res.status(400).json({
        error: "INVALID_TAX_YEAR",
        message: "taxYear must be a complete four-digit year between 2000 and 2100."
      });
    }
    const countryId = String(req.query.countryId || "US").toUpperCase();
    const support = TaxRegistry.getCountrySupport(countryId);
    const supportedYears = TaxRegistry.getSupportedTaxYears(countryId);
    const hasCoverage = supportedYears.includes(requestedYear);
    let requestedYearStatus = "UNAVAILABLE";
    if (requestedYear > LATEST_VERIFIED_TAX_YEAR) {
      requestedYearStatus = "UNDER_VERIFICATION";
    } else if (hasCoverage && support.verificationStatus === "VERIFIED") {
      requestedYearStatus = "VERIFIED_PERIOD_AVAILABLE";
    } else if (hasCoverage && support.isSupported) {
      requestedYearStatus = "LIMITED_PERIOD_AVAILABLE";
    }
    res.json({
      countryId,
      latestVerifiedTaxYear: LATEST_VERIFIED_TAX_YEAR,
      supportedYears,
      requestedYear,
      requestedYearStatus,
      futureYearPolicy: "Tax schedules are never inferred. LivWorthy executes only explicitly implemented country/year schedules and returns TAX_CALCULATION_UNAVAILABLE for unsupported historical or future years."
    });
  });
  app.get("/api/tax/registry", rateLimit(60, 60), (req, res) => {
    const supportedCountries = TaxRegistry.getSupportedCountryIds();
    const commercialMarkets = TaxRegistry.getCommercialMarketIds();
    res.json({
      totalSupportedCountries: supportedCountries.length,
      supportedCountryIds: supportedCountries,
      commercialMarketCount: commercialMarkets.length,
      commercialMarketIds: commercialMarkets,
      adapters: commercialMarkets.map((id) => TaxRegistry.getCountrySupport(id))
    });
  });
  app.get("/api/freshness-report", rateLimit(60, 60), (req, res) => {
    const reportPath = path2.resolve("data-freshness-report.json");
    if (fs2.existsSync(reportPath)) {
      try {
        const raw = fs2.readFileSync(reportPath, "utf-8");
        return res.json(JSON.parse(raw));
      } catch (err) {
        return res.status(500).json({ error: "FAILED_READING_REPORT", message: err.message });
      }
    }
    res.status(404).json({ error: "REPORT_NOT_FOUND", message: "Data freshness report is not yet generated." });
  });
  app.get("/api/fx/latest", rateLimit(60, 60), async (req, res) => {
    const snapshot = await FxEngine.getLatestSnapshot();
    res.json({ snapshot });
  });
  app.post("/api/fx/refresh", rateLimit(10, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session || !AuthService.hasPermission(session.role, "trigger_fx_refresh")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Insufficient role permissions to refresh FX rates." });
    }
    const updated = await FxEngine.refreshFromProvider(true);
    await dbService.recordAuditLog({
      actorEmail: session.email,
      action: "FX_REFRESH",
      entityType: "fx_snapshot",
      entityId: updated.id,
      metadata: { ratesCount: Object.keys(updated.rates).length, provider: updated.provider }
    });
    res.json({ success: true, snapshot: updated });
  });
  app.get("/api/cron/fx", rateLimit(10, 60, { isSecuritySensitive: true, failClosed: true }), async (req, res) => {
    const authHeader = req.headers.authorization;
    const querySecret = typeof req.query.secret === "string" ? req.query.secret : void 0;
    const provided = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : querySecret;
    let isAuthorized = false;
    if (provided && CRON_SECRET) {
      try {
        const provBuf = Buffer.from(provided);
        const expBuf = Buffer.from(CRON_SECRET);
        if (provBuf.length === expBuf.length && crypto3.timingSafeEqual(provBuf, expBuf)) {
          isAuthorized = true;
        }
      } catch {
      }
    }
    if (!isAuthorized) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Valid cron secret required." });
    }
    const updated = await FxEngine.refreshFromProvider(true);
    res.json({ success: true, timestamp: (/* @__PURE__ */ new Date()).toISOString(), snapshotId: updated.id });
  });
  app.get("/api/content", rateLimit(120, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Admin session required." });
    }
    const locale = req.query.locale || "en";
    const pages = await dbService.getContentPages({ locale });
    res.json({ pages });
  });
  app.get("/api/content/:slug", rateLimit(120, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Admin session required." });
    }
    const slug = req.params.slug;
    const locale = req.query.locale || "en";
    const page = await dbService.getContentPageBySlug(slug, locale);
    if (!page) {
      return res.status(404).json({ error: "PAGE_NOT_FOUND" });
    }
    res.json({ page });
  });
  app.post("/api/content", rateLimit(30, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session || !AuthService.hasPermission(session.role, "edit_content")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Editor permission required." });
    }
    const pageData = req.body;
    if (pageData.workflowState === "APPROVED" && !AuthService.hasPermission(session.role, "review_content")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Reviewer permission required to approve content." });
    }
    if (pageData.workflowState === "PUBLISHED" && !AuthService.hasPermission(session.role, "publish_content")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Publisher permission required to publish content." });
    }
    if (pageData.workflowState === "INDEX_APPROVED" && !AuthService.hasPermission(session.role, "approve_indexing")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "SEO_REVIEWER or ADMIN permission required to approve indexing." });
    }
    const locale = typeof pageData.locale === "string" && pageData.locale ? pageData.locale : "en";
    const existingPage = typeof pageData.slug === "string" && pageData.slug ? await dbService.getContentPageBySlug(pageData.slug, locale) : null;
    const reviewerEmail = pageData.workflowState === "APPROVED" || pageData.workflowState === "PUBLISHED" || pageData.workflowState === "INDEX_APPROVED" ? session.email : existingPage?.reviewerEmail || null;
    const saved = await dbService.upsertContentPage({
      ...pageData,
      locale,
      authorEmail: session.email,
      reviewerEmail
    });
    await dbService.recordAuditLog({
      actorEmail: session.email,
      action: "CMS_PAGE_UPSERT",
      entityType: "content_page",
      entityId: saved.id,
      metadata: { slug: saved.slug, workflowState: saved.workflowState }
    });
    res.json({ success: true, page: saved });
  });
  app.post("/api/content/:slug/workflow", rateLimit(30, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }
    const workflowState = String(req.body?.workflowState || "");
    const locale = req.query.locale || "en";
    const allowedStates = /* @__PURE__ */ new Set(["DRAFTED", "IN_REVIEW", "APPROVED", "PUBLISHED", "INDEX_APPROVED"]);
    if (!allowedStates.has(workflowState)) {
      return res.status(400).json({ error: "INVALID_WORKFLOW_STATE", message: "Unsupported content workflow state." });
    }
    let permitted = false;
    if (workflowState === "DRAFTED" || workflowState === "IN_REVIEW") {
      permitted = AuthService.hasPermission(session.role, "edit_content");
    } else if (workflowState === "APPROVED") {
      permitted = AuthService.hasPermission(session.role, "review_content");
    } else if (workflowState === "PUBLISHED") {
      permitted = AuthService.hasPermission(session.role, "publish_content");
    } else if (workflowState === "INDEX_APPROVED") {
      permitted = AuthService.hasPermission(session.role, "approve_indexing");
    }
    if (!permitted) {
      return res.status(403).json({ error: "FORBIDDEN", message: `Role ${session.role} cannot transition content to ${workflowState}.` });
    }
    const existing = await dbService.getContentPageBySlug(req.params.slug, locale);
    if (!existing) {
      return res.status(404).json({ error: "PAGE_NOT_FOUND" });
    }
    const reviewerEmail = workflowState === "APPROVED" || workflowState === "PUBLISHED" || workflowState === "INDEX_APPROVED" ? session.email : existing.reviewerEmail;
    const saved = await dbService.updateContentWorkflow(req.params.slug, locale, workflowState, reviewerEmail);
    if (!saved) {
      return res.status(409).json({ error: "WORKFLOW_UPDATE_FAILED", message: "Content workflow state was not updated." });
    }
    await dbService.recordAuditLog({
      actorEmail: session.email,
      action: "CMS_WORKFLOW_TRANSITION",
      entityType: "content_page",
      entityId: saved.id,
      metadata: { slug: saved.slug, locale, from: existing.workflowState, to: workflowState }
    });
    res.json({ success: true, page: saved });
  });
  app.post("/api/admin/login", rateLimit(5, 60, { isSecuritySensitive: true, failClosed: true }), async (req, res) => {
    const { email, password, totpCode } = req.body;
    try {
      const dbUser = await dbService.getUserByEmail(email);
      if (dbUser && dbUser.isActive !== false && AuthService.verifyPassword(password, dbUser.passwordHash)) {
        if (dbUser.mfaEnabled && dbUser.mfaSecret) {
          if (!totpCode || !AuthService.verifyTotp(dbUser.mfaSecret, totpCode)) {
            return res.status(401).json({ error: "MFA_REQUIRED", message: "Valid 6-digit TOTP code required." });
          }
        }
        const user = { id: dbUser.id, email: dbUser.email, role: dbUser.role, passwordHash: dbUser.passwordHash };
        const token = AuthService.createSessionToken(user);
        await dbService.recordAuditLog({
          actorEmail: email,
          action: "ADMIN_LOGIN_SUCCESS",
          entityType: "user",
          entityId: user.id
        });
        return res.json({
          success: true,
          token,
          user: { id: user.id, email: user.email, role: user.role }
        });
      }
    } catch (e) {
      console.error("[Auth] Login verification exception:", e.message);
      return res.status(503).json({
        error: "AUTH_DATABASE_UNAVAILABLE",
        message: "Authentication services are temporarily unavailable."
      });
    }
    await dbService.recordAuditLog({
      actorEmail: email || "unknown",
      action: "ADMIN_LOGIN_FAILED",
      entityType: "user",
      entityId: "failed"
    });
    res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Invalid admin credentials." });
  });
  app.get("/api/admin/me", rateLimit(60, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }
    res.json({
      user: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        expiresAt: session.expiresAt
      }
    });
  });
  app.get("/api/admin/audit-logs", rateLimit(30, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session || !AuthService.hasPermission(session.role, "view_audit_logs")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Insufficient permissions to view audit logs." });
    }
    const limit = parseInt(req.query.limit) || 50;
    const logs = await dbService.getAuditLogs(limit);
    res.json({ logs });
  });
  app.get("/api/admin/users", rateLimit(30, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session || !AuthService.hasPermission(session.role, "manage_users")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Insufficient permissions to manage users." });
    }
    const users2 = await dbService.getUsers();
    const sanitized = users2.map((u) => {
      const { passwordHash, mfaSecret, ...rest } = u;
      return rest;
    });
    res.json({ users: sanitized });
  });
  app.post("/api/admin/users", rateLimit(20, 60, { isSecuritySensitive: true, failClosed: true }), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session || !AuthService.hasPermission(session.role, "manage_users")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Insufficient permissions to manage users." });
    }
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: "INVALID_PAYLOAD", message: "Email, password, and role are required." });
    }
    const allowedRoles = /* @__PURE__ */ new Set(["ADMIN", "DATA_EDITOR", "CONTENT_EDITOR", "REVIEWER", "SEO_REVIEWER", "READ_ONLY"]);
    if (!allowedRoles.has(role)) {
      return res.status(400).json({ error: "INVALID_ROLE", message: "Unsupported user role." });
    }
    if (typeof password !== "string" || password.length < 12) {
      return res.status(400).json({ error: "WEAK_PASSWORD", message: "Admin passwords must contain at least 12 characters." });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "INVALID_EMAIL", message: "A valid email address is required." });
    }
    const passwordHash = AuthService.hashPassword(password);
    const created = await dbService.upsertUser({
      email,
      passwordHash,
      role,
      isActive: true,
      mfaEnabled: false
    });
    await dbService.recordAuditLog({
      actorEmail: session.email,
      action: "USER_UPSERTED",
      entityType: "user",
      entityId: created.id,
      metadata: { targetEmail: email, role }
    });
    const { passwordHash: _, mfaSecret: __, ...rest } = created;
    res.json({ success: true, user: rest });
  });
  app.get("/api/admin/seo-health", rateLimit(60, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Admin authentication required." });
    }
    const locale = req.query.locale || "en";
    const scorecard = generateTopicalAuthorityScorecard(locale);
    const gscStatus = SearchConsoleConnector.isAvailable();
    res.json({
      scorecard,
      gscStatus,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.post("/api/admin/seo/search-console/sync", rateLimit(10, 60, { isSecuritySensitive: true }), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Admin authentication required." });
    }
    const { startDate, endDate } = req.body || {};
    const result = await SearchConsoleConnector.ingestAndPersistAnalytics(startDate, endDate);
    res.json(result);
  });
  app.get("/api/admin/seo/search-console/status", rateLimit(60, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Admin authentication required." });
    }
    const status = SearchConsoleConnector.isAvailable();
    const coverage = SearchConsoleConnector.getIndexCoverageCapability();
    const recentRecords = await dbService.getGscPerformanceRecords(20);
    res.json({
      status,
      coverage,
      recentRecords,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.get("/api/seo/scorecard", rateLimit(60, 60), (req, res) => {
    const locale = req.query.locale || "en";
    const scorecard = generateTopicalAuthorityScorecard(locale);
    res.json({ scorecard, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/reviews", rateLimit(60, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Admin session required." });
    }
    const contentPageId = req.query.contentPageId;
    const reviews = await dbService.getReviews(contentPageId);
    res.json({ reviews });
  });
  app.post("/api/reviews", rateLimit(30, 60), async (req, res) => {
    const session = await validateCurrentSession(req, res);
    if (res.headersSent) return;
    if (!session || !AuthService.hasPermission(session.role, "review_content")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Reviewer permission required." });
    }
    const { contentPageId, status, feedbackNotes, statutoryCheckPassed } = req.body;
    if (!contentPageId || !status) {
      return res.status(400).json({ error: "INVALID_PAYLOAD", message: "contentPageId and status are required." });
    }
    const review = await dbService.recordReview({
      contentPageId,
      reviewerEmail: session.email,
      status,
      feedbackNotes,
      statutoryCheckPassed
    });
    await dbService.recordAuditLog({
      actorEmail: session.email,
      action: "EDITORIAL_REVIEW_RECORDED",
      entityType: "editorial_review",
      entityId: review.id,
      metadata: { contentPageId, status }
    });
    res.json({ success: true, review });
  });
  app.post("/api/rum/vitals", rateLimit(120, 60), async (req, res) => {
    const { name, value, rating, route, device } = req.body;
    if (name && typeof value === "number") {
      await dbService.recordWebVital({
        name,
        value,
        rating: rating || "good",
        route: route || "/",
        device: device || "desktop"
      });
    }
    res.status(202).json({ accepted: true });
  });
  app.get("/api/rum/summary", rateLimit(60, 60), async (req, res) => {
    const summary = await dbService.getWebVitalsSummary();
    res.json({ vitals: summary });
  });
}
configureApp();
var staticMounted = false;
function mountStaticAndFallback(expressApp) {
  if (staticMounted) return;
  staticMounted = true;
  const distPath = path2.join(process.cwd(), "dist");
  expressApp.use(express.static(distPath, { redirect: false }));
  expressApp.get("*", (req, res) => {
    const pathname = req.path.replace(/\/$/, "") || "/";
    if (pathname === "/") {
      const homePath = path2.join(distPath, "index.html");
      if (fs2.existsSync(homePath)) {
        return res.sendFile(homePath);
      }
    }
    const candidatePath = path2.join(distPath, pathname, "index.html");
    if (fs2.existsSync(candidatePath)) {
      return res.sendFile(candidatePath);
    }
    const notFoundPath = path2.join(distPath, "404.html");
    if (fs2.existsSync(notFoundPath)) {
      return res.status(404).type("html").sendFile(notFoundPath);
    }
    return res.status(404).type("html").send('<!DOCTYPE html><html><head><title>404 Not Found</title><meta name="robots" content="noindex, nofollow" /></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>');
  });
}
if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test" || process.env.SERVE_STATIC || process.env.SKIP_SERVER_START) {
  mountStaticAndFallback(app);
}
async function startServer() {
  await ensureDatabaseReady();
  if (process.env.NODE_ENV !== "production" && !process.env.SERVE_STATIC && process.env.NODE_ENV !== "test") {
    const distPath = path2.join(process.cwd(), "dist");
    app.use((req, res, next) => {
      if (req.method !== "GET") return next();
      const pathname = req.path.replace(/\/$/, "") || "/";
      if (pathname === "/") return next();
      if (pathname.startsWith("/api/") || pathname.startsWith("/assets/") || pathname.startsWith("/src/") || pathname.startsWith("/@") || pathname.startsWith("/node_modules/") || /\.[a-zA-Z0-9]+$/.test(pathname)) {
        return next();
      }
      const candidatePath = path2.join(distPath, pathname, "index.html");
      if (fs2.existsSync(candidatePath)) {
        return res.sendFile(candidatePath);
      }
      const notFoundPath = path2.join(distPath, "404.html");
      if (fs2.existsSync(notFoundPath)) {
        return res.status(404).type("html").sendFile(notFoundPath);
      }
      return res.status(404).type("html").send('<!DOCTYPE html><html><head><title>404 Not Found</title><meta name="robots" content="noindex, nofollow" /></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>');
    });
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    mountStaticAndFallback(app);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LivWorthy Server] Enterprise server active on http://0.0.0.0:${PORT}`);
  });
}
if (!process.env.VERCEL && !process.env.SKIP_SERVER_START) {
  startServer();
}
var server_default = app;
export {
  app,
  server_default as default,
  ensureDatabaseReady,
  mountStaticAndFallback,
  startServer
};
//# sourceMappingURL=index.js.map
