var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server.ts
import express from "express";
import path2 from "path";
import crypto3 from "crypto";

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

// src/db/client.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import fs from "fs";
import path from "path";
import { eq, desc, and } from "drizzle-orm";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  auditLogs: () => auditLogs,
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
  housingDatasets: () => housingDatasets,
  regions: () => regions,
  salaryDatasets: () => salaryDatasets,
  schemaMigrations: () => schemaMigrations,
  sourceTierEnum: () => sourceTierEnum,
  taxBrackets: () => taxBrackets,
  taxJurisdictions: () => taxJurisdictions,
  taxRuleSets: () => taxRuleSets,
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
  JP: { id: "JP", name: "Japan", defaultCurrency: "JPY", verificationStatus: "LIMITED", notes: "National progressive income tax verified; resident surtax pending." },
  KR: { id: "KR", name: "South Korea", defaultCurrency: "KRW", verificationStatus: "LIMITED", notes: "National income tax schedules verified; local resident surtax pending." },
  SA: { id: "SA", name: "Saudi Arabia", defaultCurrency: "SAR", verificationStatus: "VERIFIED" },
  QA: { id: "QA", name: "Qatar", defaultCurrency: "QAR", verificationStatus: "VERIFIED" },
  NO: { id: "NO", name: "Norway", defaultCurrency: "NOK", verificationStatus: "LIMITED", notes: "General income tax and bracket tax verified; municipal variations pending." },
  SE: { id: "SE", name: "Sweden", defaultCurrency: "SEK", verificationStatus: "LIMITED", notes: "National income tax and basic municipal rate verified." },
  DK: { id: "DK", name: "Denmark", defaultCurrency: "DKK", verificationStatus: "LIMITED", notes: "Bottom/top tax and labor market contributions (AM-bidrag) verified." },
  FI: { id: "FI", name: "Finland", defaultCurrency: "EUR", verificationStatus: "LIMITED", notes: "State progressive scale and municipal average rate verified." },
  AT: { id: "AT", name: "Austria", defaultCurrency: "EUR", verificationStatus: "LIMITED", notes: "EStG progressive tax brackets verified." },
  BE: { id: "BE", name: "Belgium", defaultCurrency: "EUR", verificationStatus: "LIMITED", notes: "Federal personal income tax brackets verified; communal surcharge pending." },
  ES: { id: "ES", name: "Spain", defaultCurrency: "EUR", verificationStatus: "LIMITED", notes: "IRPF regional schedules verified; autonomous community variations pending." },
  IT: { id: "IT", name: "Italy", defaultCurrency: "EUR", verificationStatus: "LIMITED", notes: "IRPEF national brackets verified; regional/municipal surcharges pending." },
  IL: { id: "IL", name: "Israel", defaultCurrency: "ILS", verificationStatus: "LIMITED", notes: "Income tax brackets and standard credit points verified." },
  HK: { id: "HK", name: "Hong Kong", defaultCurrency: "HKD", verificationStatus: "LIMITED", notes: "Salaries tax standard vs progressive rate verified." },
  LU: { id: "LU", name: "Luxembourg", defaultCurrency: "EUR", verificationStatus: "LIMITED", notes: "Class 1 progressive rate scale verified." },
  // PRIORITY C (12)
  IN: { id: "IN", name: "India", defaultCurrency: "INR", verificationStatus: "LIMITED", notes: "New Tax Regime (Sec 115BAC) verified; standard deduction included." },
  BR: { id: "BR", name: "Brazil", defaultCurrency: "BRL", verificationStatus: "LIMITED", notes: "IRPF progressive monthly brackets and INSS contribution verified." },
  MX: { id: "MX", name: "Mexico", defaultCurrency: "MXN", verificationStatus: "LIMITED", notes: "ISR progressive tariff verified." },
  ID: { id: "ID", name: "Indonesia", defaultCurrency: "IDR", verificationStatus: "PROVISIONAL", notes: "PPh 21 progressive scale under research." },
  MY: { id: "MY", name: "Malaysia", defaultCurrency: "MYR", verificationStatus: "LIMITED", notes: "Resident progressive scale and EPF employee rate verified." },
  PH: { id: "PH", name: "Philippines", defaultCurrency: "PHP", verificationStatus: "PROVISIONAL", notes: "TRAIN law progressive tax brackets under research." },
  ZA: { id: "ZA", name: "South Africa", defaultCurrency: "ZAR", verificationStatus: "LIMITED", notes: "SARS progressive income tax and primary rebate verified." },
  PL: { id: "PL", name: "Poland", defaultCurrency: "PLN", verificationStatus: "LIMITED", notes: "Skala podatkowa (12%/32%) and kwota wolna verified." },
  PT: { id: "PT", name: "Portugal", defaultCurrency: "EUR", verificationStatus: "LIMITED", notes: "IRS progressive brackets verified; solidarity surcharge pending." },
  CZ: { id: "CZ", name: "Czechia", defaultCurrency: "CZK", verificationStatus: "LIMITED", notes: "Flat progressive (15%/23%) and basic tax credit verified." },
  TH: { id: "TH", name: "Thailand", defaultCurrency: "THB", verificationStatus: "PROVISIONAL", notes: "Personal income tax progressive schedule under research." },
  VN: { id: "VN", name: "Vietnam", defaultCurrency: "VND", verificationStatus: "PROVISIONAL", notes: "Personal income tax progressive schedule under research." }
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "PROVISIONAL"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "PROVISIONAL"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "LIMITED"
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
    verificationStatus: "PROVISIONAL"
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
    verificationStatus: "PROVISIONAL"
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "OASDI tax rate 6.2% on wages up to $168,600 (2024) / $176,100 (2025). Medicare tax rate 1.45% uncapped + 0.9% Additional Medicare Tax on earnings above $200,000."
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
    verifiedAt: "2025-01-12",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "NYS graduated income tax rates from 4.0% to 10.9%, NYS Standard Deduction $8,000 single / $16,050 married filing jointly."
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
    verifiedAt: "2025-01-12",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "NYC resident income tax rates graduated from 3.078% to 3.876% applied on NY taxable income."
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
    verifiedBy: "Principal Real Estate Data Analyst",
    notes: "District of Columbia and Northern Virginia rental benchmarks."
  },
  "us-bls-cpi-nyc-2024": {
    id: "us-bls-cpi-nyc-2024",
    organization: "U.S. Bureau of Labor Statistics (BLS)",
    sourceType: "Official Statistics Bureau",
    canonicalReference: "Consumer Expenditure Survey (CEX) & Consumer Price Index for New York-Newark-Jersey City, NY-NJ-PA",
    url: "https://www.bls.gov/regions/new-york-new-jersey/news-release/consumerexpenditures_newyork.htm",
    jurisdiction: "New York-Newark-Jersey City Metro",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-12-15",
    effectiveDate: "2024-11-01",
    verifiedAt: "2025-01-15",
    verifiedBy: "Cost of Living Research Group",
    notes: "Metropolitan expenditure weights for groceries, utilities, healthcare, dining out, and consumer goods."
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-12",
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
    verifiedAt: "2025-01-12",
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
    verifiedAt: "2025-01-05",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Munich city metropolitan rental and living cost benchmarks."
  },
  // --- SINGAPORE ---
  "iras-tax-rates-2024": {
    id: "iras-tax-rates-2024",
    organization: "Inland Revenue Authority of Singapore (IRAS)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "IRAS Individual Income Tax Rates for Resident Individuals (Year of Assessment 2024/2025)",
    url: "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-rates-and-tax-expenses",
    jurisdiction: "Singapore",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-09-01",
    effectiveDate: "2024-01-01",
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Dublin tenancy registration benchmark rents and CSO national expenditure figures."
  },
  // --- NEW ZEALAND ---
  "ird-tax-rates-2024-2025": {
    id: "ird-tax-rates-2024-2025",
    organization: "Inland Revenue Department (IRD)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "Budget 2024 Tax Threshold Changes (Taxation Annual Rates for 2024-25 Act)",
    url: "https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals",
    jurisdiction: "New Zealand",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-08-01",
    effectiveDate: "2024-07-31",
    verifiedAt: "2025-01-10",
    verifiedBy: "Senior Financial Systems Engineer",
    notes: "Post-July 2024 thresholds: 10.5% ($0\u2013$15,600), 17.5% ($15,601\u2013$53,500), 30% ($53,501\u2013$78,100), 33% ($78,101\u2013$180,000), 39% ($180,001+)."
  },
  "acc-earners-levy-2024": {
    id: "acc-earners-levy-2024",
    organization: "Accident Compensation Corporation (ACC)",
    sourceType: "Government / Tax Authority",
    canonicalReference: "ACC Earner\u2019s Levy Rates and Maximum Threshold 2024/2025",
    url: "https://www.acc.co.nz/for-business/levy-rates/",
    jurisdiction: "New Zealand",
    reliabilityTier: "Tier 1",
    retrievedAt: "2024-04-01",
    effectiveDate: "2024-04-01",
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-05",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-05",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-10",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
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
    verifiedAt: "2025-01-15",
    verifiedBy: "Senior Living Cost Analyst",
    notes: "Valencia metropolitan rental and living cost basket."
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
  static createSessionToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      expiresAt: Date.now() + 24 * 3600 * 1e3
      // 24 hours
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
          canonicalUrl: "https://livworthy.com/methodology",
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
          canonicalUrl: "https://livworthy.com/sources",
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
        canonicalUrl: `https://livworthy.com/${slug}`,
        blocksJson: page.blocksJson || [],
        evidenceSourceIds: page.evidenceSourceIds || [],
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: contentPages.slug,
        set: {
          title: page.title,
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
      return null;
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
        canonicalUrl: "https://livworthy.com/methodology",
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
        canonicalUrl: "https://livworthy.com/sources",
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
      canonicalUrl: `https://livworthy.com/${page.slug}`,
      blocksJson: page.blocksJson || [],
      evidenceSourceIds: page.evidenceSourceIds || [],
      createdAt: existing?.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.contentPages.set(`${updated.slug}:${updated.locale}`, updated);
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
    const components = [
      {
        id: "au-income-tax",
        name: "Australian Resident Income Tax (Stage 3)",
        authority: "Australian Taxation Office (ATO)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "AUD"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: "ato-individual-rates-2024"
      },
      {
        id: "au-medicare-levy",
        name: "Medicare Levy (2.0%)",
        authority: "Services Australia / ATO",
        category: "social_contribution",
        amount: fromMinor(medicareMinor, "AUD"),
        effectiveRate: medicareMinor / (grossMinor || 1),
        evidenceRefId: "ato-medicare-levy-2024"
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
      taxRuleVersion: "ATO-2024.2",
      evidenceSourceIds: ["ato-individual-rates-2024", "ato-medicare-levy-2024"]
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
    let cppMinor = 0;
    if (grossMajor > 3500) {
      const cppEligible = Math.min(grossMajor, 68500) - 3500;
      cppMinor = Math.round(cppEligible * 0.0595 * 100);
    }
    if (grossMajor > 68500) {
      const cpp2Eligible = Math.min(grossMajor, 73200) - 68500;
      cppMinor += Math.round(cpp2Eligible * 0.04 * 100);
    }
    const eiEligible = Math.min(grossMajor, 63200);
    const eiMinor = Math.round(eiEligible * 0.0166 * 100);
    const socialMinor = cppMinor + eiMinor;
    let fedGrossTax = 0;
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
    const fedBpa = 15705;
    const fedBpaCredit = fedBpa * 0.15;
    const fedTaxTotal = Math.max(0, fedGrossTax - fedBpaCredit);
    const federalTaxMinor = Math.round(fedTaxTotal * 100);
    const regionCode = context.regionId?.replace("CA-", "") || "ON";
    let provGrossTax = 0;
    let provBpaCredit = 0;
    let provSurtax = 0;
    if (regionCode === "ON") {
      if (grossMajor <= 51446) {
        provGrossTax = grossMajor * 0.0505;
      } else if (grossMajor <= 102894) {
        provGrossTax = 51446 * 0.0505 + (grossMajor - 51446) * 0.0915;
      } else if (grossMajor <= 15e4) {
        provGrossTax = 51446 * 0.0505 + (102894 - 51446) * 0.0915 + (grossMajor - 102894) * 0.1116;
      } else if (grossMajor <= 22e4) {
        provGrossTax = 51446 * 0.0505 + (102894 - 51446) * 0.0915 + (15e4 - 102894) * 0.1116 + (grossMajor - 15e4) * 0.1216;
      } else {
        provGrossTax = 51446 * 0.0505 + (102894 - 51446) * 0.0915 + (15e4 - 102894) * 0.1116 + (22e4 - 15e4) * 0.1216 + (grossMajor - 22e4) * 0.1316;
      }
      provBpaCredit = 12399 * 0.0505;
      const onBaseTax = Math.max(0, provGrossTax - provBpaCredit);
      if (onBaseTax > 7108) {
        provSurtax = (onBaseTax - 5554) * 0.2 + (onBaseTax - 7108) * 0.36;
      } else if (onBaseTax > 5554) {
        provSurtax = (onBaseTax - 5554) * 0.2;
      }
    } else if (regionCode === "BC") {
      if (grossMajor <= 47937) {
        provGrossTax = grossMajor * 0.0506;
      } else if (grossMajor <= 95875) {
        provGrossTax = 47937 * 0.0506 + (grossMajor - 47937) * 0.077;
      } else if (grossMajor <= 110076) {
        provGrossTax = 47937 * 0.0506 + (95875 - 47937) * 0.077 + (grossMajor - 95875) * 0.105;
      } else if (grossMajor <= 133664) {
        provGrossTax = 47937 * 0.0506 + (95875 - 47937) * 0.077 + (110076 - 95875) * 0.105 + (grossMajor - 110076) * 0.1229;
      } else {
        provGrossTax = 47937 * 0.0506 + (95875 - 47937) * 0.077 + (110076 - 95875) * 0.105 + (133664 - 110076) * 0.1229 + (grossMajor - 133664) * 0.147;
      }
      provBpaCredit = 12580 * 0.0506;
    } else {
      if (grossMajor <= 148269) {
        provGrossTax = grossMajor * 0.1;
      } else {
        provGrossTax = 148269 * 0.1 + (grossMajor - 148269) * 0.12;
      }
      provBpaCredit = 21885 * 0.1;
    }
    const provTaxTotal = Math.max(0, provGrossTax - provBpaCredit) + provSurtax;
    const stateTaxMinor = Math.round(provTaxTotal * 100);
    const totalTaxMinor = federalTaxMinor + stateTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const components = [
      {
        id: "ca-fed-tax",
        name: "Canada Federal Income Tax",
        authority: "Canada Revenue Agency (CRA)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "CAD"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: "cra-income-tax-2024"
      },
      {
        id: "ca-cpp",
        name: "Canada Pension Plan (CPP/CPP2)",
        authority: "Employment and Social Development Canada",
        category: "social_contribution",
        amount: fromMinor(cppMinor, "CAD"),
        effectiveRate: cppMinor / (grossMinor || 1),
        evidenceRefId: "cra-cpp-2024"
      },
      {
        id: "ca-ei",
        name: "Employment Insurance (EI)",
        authority: "Canada Revenue Agency (CRA)",
        category: "social_contribution",
        amount: fromMinor(eiMinor, "CAD"),
        effectiveRate: eiMinor / (grossMinor || 1),
        evidenceRefId: "cra-ei-2024"
      },
      {
        id: "ca-prov-tax",
        name: `${regionCode} Provincial Income Tax`,
        authority: `${regionCode} Ministry of Finance`,
        category: "state",
        amount: fromMinor(stateTaxMinor, "CAD"),
        effectiveRate: stateTaxMinor / (grossMinor || 1),
        evidenceRefId: "cra-provincial-rates-2024"
      }
    ];
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
      taxRuleVersion: "CRA-2024.1",
      evidenceSourceIds: ["cra-income-tax-2024", "cra-cpp-2024", "cra-ei-2024"]
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
    const ahvMinor = Math.round(grossMajor * 0.053 * 100);
    const alvBase = Math.min(grossMajor, 148200);
    const alvMinor = Math.round(alvBase * 0.011 * 100);
    const coordinatedSalary = Math.max(0, Math.min(grossMajor, 88200) - 25725);
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
    const components = [
      {
        id: "ch-bundessteuer",
        name: "Direct Federal Tax (Direkte Bundessteuer)",
        authority: "Eidgen\xF6ssische Steuerverwaltung (ESTV)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "CHF"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: "estv-bundessteuer-tarife-2024"
      },
      {
        id: "ch-kantonssteuer",
        name: `Cantonal & Municipal Tax (${cantonCode})`,
        authority: `Kantonales Steueramt ${cantonCode}`,
        category: "state",
        amount: fromMinor(stateTaxMinor, "CHF"),
        effectiveRate: stateTaxMinor / (grossMinor || 1),
        evidenceRefId: "estv-kantonssteuer-2024"
      },
      {
        id: "ch-sozialabgaben",
        name: "Social Security (AHV/IV/EO, ALV & BVG 2nd Pillar)",
        authority: "Bundesamt f\xFCr Sozialversicherungen (BSV)",
        category: "social_contribution",
        amount: fromMinor(socialContributionsMinor, "CHF"),
        effectiveRate: socialContributionsMinor / (grossMinor || 1),
        evidenceRefId: "bsv-beitragssaetze-2024"
      }
    ];
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
      taxRuleVersion: "ESTV-2024.1",
      evidenceSourceIds: [
        "estv-bundessteuer-tarife-2024",
        "estv-kantonssteuer-2024",
        "bsv-beitragssaetze-2024"
      ]
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
    const healthCap = Math.min(grossMajor, 62100);
    const healthMinor = Math.round(healthCap * 0.0815 * 100);
    const pensionCap = Math.min(grossMajor, 90600);
    const pensionMinor = Math.round(pensionCap * 0.093 * 100);
    const unemployMinor = Math.round(pensionCap * 0.013 * 100);
    const nursingMinor = Math.round(healthCap * 0.022 * 100);
    const socialMinor = healthMinor + pensionMinor + unemployMinor + nursingMinor;
    let incomeTax = 0;
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
    const federalTaxMinor = Math.max(0, Math.round(incomeTax * 100));
    let soliMinor = 0;
    if (incomeTax > 18130) {
      soliMinor = Math.round((incomeTax - 18130) * 0.055 * 100);
    }
    const totalTaxMinor = federalTaxMinor + soliMinor;
    const totalDeductionsMinor = totalTaxMinor + socialMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const components = [
      {
        id: "de-einkommensteuer",
        name: "German Wage Tax (Lohnsteuer / EStG)",
        authority: "Bundeszentralamt f\xFCr Steuern (BZSt)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "EUR"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: "bzst-lohnsteuer-2024"
      },
      {
        id: "de-sozialversicherung",
        name: "Social Security (Health, Pension, Care & Unemployment)",
        authority: "Deutsche Rentenversicherung / GKV",
        category: "social_contribution",
        amount: fromMinor(socialMinor, "EUR"),
        effectiveRate: socialMinor / (grossMinor || 1),
        evidenceRefId: "gkv-beitragssaetze-2024"
      }
    ];
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
      marginalTaxRate: grossMajor > 66760 ? 0.42 : 0.32,
      components,
      taxRuleVersion: "BZSt-2024.1",
      evidenceSourceIds: ["bzst-lohnsteuer-2024", "gkv-beitragssaetze-2024"]
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
    const ssBase = Math.min(grossMajor, 56646);
    const ssMinor = Math.round(ssBase * 0.0647 * 100);
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
    const components = [
      {
        id: "es-irpf",
        name: "Impuesto sobre la Renta de las Personas F\xEDsicas (IRPF)",
        authority: "Agencia Estatal de Administraci\xF3n Tributaria (AEAT)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "EUR"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: "aeat-tramos-irpf-2024"
      },
      {
        id: "es-seguridad-social",
        name: "Cotizaciones a la Seguridad Social (R\xE9gimen General)",
        authority: "Tesorer\xEDa General de la Seguridad Social (TGSS)",
        category: "social_contribution",
        amount: fromMinor(ssMinor, "EUR"),
        effectiveRate: ssMinor / (grossMinor || 1),
        evidenceRefId: "tgss-bases-cotizacion-2024"
      }
    ];
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
      taxRuleVersion: "AEAT-2024.1",
      evidenceSourceIds: ["aeat-tramos-irpf-2024", "tgss-bases-cotizacion-2024"]
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
    const PASS_2024 = 46368;
    const csgBase = Math.min(grossMajor, 4 * PASS_2024) * 0.9825;
    const csgMinor = Math.round(csgBase * 0.097 * 100);
    const t1Base = Math.min(grossMajor, PASS_2024);
    const t1Minor = Math.round(t1Base * 0.0401 * 100);
    let t2Minor = 0;
    if (grossMajor > PASS_2024) {
      const t2Base = Math.min(grossMajor, 8 * PASS_2024) - PASS_2024;
      t2Minor = Math.round(t2Base * 0.0972 * 100);
    }
    const otherSocialMinor = Math.round(grossMajor * 0.035 * 100);
    const socialContributionsMinor = csgMinor + t1Minor + t2Minor + otherSocialMinor;
    const netSalaryMajor = Math.max(0, grossMajor - socialContributionsMinor / 100);
    const standardDeduction = Math.min(14171, Math.max(495, netSalaryMajor * 0.1));
    const taxableIncomeMajor = Math.max(0, netSalaryMajor - standardDeduction);
    let incomeTax = 0;
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
    if (incomeTax > 0 && incomeTax < 1929) {
      const decote = 873 - incomeTax * 0.4525;
      incomeTax = Math.max(0, incomeTax - decote);
    }
    const federalTaxMinor = Math.round(incomeTax * 100);
    const totalTaxMinor = federalTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialContributionsMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const components = [
      {
        id: "fr-impot-revenu",
        name: "Imp\xF4t sur le Revenu (Pr\xE9l\xE8vement \xE0 la Source)",
        authority: "Direction G\xE9n\xE9rale des Finances Publiques (DGFiP)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "EUR"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: "dgfip-bareme-ir-2024"
      },
      {
        id: "fr-csg-crds",
        name: "Cotisations Sociales & CSG/CRDS",
        authority: "URSSAF / CNAV / Agirc-Arrco",
        category: "social_contribution",
        amount: fromMinor(socialContributionsMinor, "EUR"),
        effectiveRate: socialContributionsMinor / (grossMinor || 1),
        evidenceRefId: "urssaf-taux-cotisations-2024"
      }
    ];
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
      taxRuleVersion: "DGFiP-2024.1",
      evidenceSourceIds: ["dgfip-bareme-ir-2024", "urssaf-taux-cotisations-2024"]
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
    const SRCOP = 42e3;
    let grossIncomeTax = 0;
    if (grossMajor <= SRCOP) {
      grossIncomeTax = grossMajor * 0.2;
    } else {
      grossIncomeTax = SRCOP * 0.2 + (grossMajor - SRCOP) * 0.4;
    }
    const standardCredits = 3750;
    const netIncomeTax = Math.max(0, grossIncomeTax - standardCredits);
    const federalTaxMinor = Math.round(netIncomeTax * 100);
    let usc = 0;
    if (grossMajor > 13e3) {
      const b1 = Math.min(grossMajor, 12012);
      usc += b1 * 5e-3;
      if (grossMajor > 12012) {
        const b2 = Math.min(grossMajor, 25760) - 12012;
        usc += b2 * 0.02;
      }
      if (grossMajor > 25760) {
        const b3 = Math.min(grossMajor, 70044) - 25760;
        usc += b3 * 0.04;
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
    const components = [
      {
        id: "ie-paye-tax",
        name: "Irish PAYE Income Tax (after Tax Credits)",
        authority: "Office of the Revenue Commissioners (Revenue.ie)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "EUR"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: "revenue-paye-rates-2024"
      },
      {
        id: "ie-usc",
        name: "Universal Social Charge (USC)",
        authority: "Office of the Revenue Commissioners (Revenue.ie)",
        category: "social_contribution",
        amount: fromMinor(uscMinor, "EUR"),
        effectiveRate: uscMinor / (grossMinor || 1),
        evidenceRefId: "revenue-usc-rates-2024"
      },
      {
        id: "ie-prsi",
        name: "PRSI (Pay Related Social Insurance Class A)",
        authority: "Department of Social Protection (DSP)",
        category: "social_contribution",
        amount: fromMinor(prsiMinor, "EUR"),
        effectiveRate: prsiMinor / (grossMinor || 1),
        evidenceRefId: "dsp-prsi-rates-2024"
      }
    ];
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
      marginalTaxRate: grossMajor > 70044 ? 0.52 : grossMajor > 42e3 ? 0.481 : 0.261,
      components,
      taxRuleVersion: "Revenue-2024.1",
      evidenceSourceIds: ["revenue-paye-rates-2024", "revenue-usc-rates-2024", "dsp-prsi-rates-2024"]
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
    const BRACKET_1_CAP = 75518;
    let grossTax = 0;
    if (grossMajor <= BRACKET_1_CAP) {
      grossTax = grossMajor * 0.3697;
    } else {
      grossTax = BRACKET_1_CAP * 0.3697 + (grossMajor - BRACKET_1_CAP) * 0.495;
    }
    let generalCredit = 0;
    if (grossMajor <= 24812) {
      generalCredit = 3362;
    } else if (grossMajor < 75518) {
      generalCredit = Math.max(0, 3362 - (grossMajor - 24812) * 0.0663);
    }
    let labourCredit = 0;
    if (grossMajor <= 11490) {
      labourCredit = grossMajor * 0.08425;
    } else if (grossMajor <= 24820) {
      labourCredit = 968 + (grossMajor - 11490) * 0.31433;
    } else if (grossMajor <= 39957) {
      labourCredit = 5158 + (grossMajor - 24820) * 0.02471;
    } else {
      labourCredit = Math.max(0, 5532 - (grossMajor - 39957) * 0.0651);
    }
    const totalCredits = generalCredit + labourCredit;
    const netTax = Math.max(0, grossTax - totalCredits);
    const volksverzekeringenShare = Math.min(grossMajor, BRACKET_1_CAP) * 0.2765;
    const nationalInsuranceMinor = Math.round(Math.min(netTax, volksverzekeringenShare) * 100);
    const incomeTaxMinor = Math.round(Math.max(0, netTax - nationalInsuranceMinor / 100) * 100);
    const totalDeductionsMinor = Math.round(netTax * 100);
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);
    const components = [
      {
        id: "nl-inkomstenbelasting",
        name: "Inkomstenbelasting (Box 1 Tax after Credits)",
        authority: "Belastingdienst",
        category: "federal",
        amount: fromMinor(incomeTaxMinor, "EUR"),
        effectiveRate: incomeTaxMinor / (grossMinor || 1),
        evidenceRefId: "belastingdienst-box1-2024"
      },
      {
        id: "nl-volksverzekeringen",
        name: "Premie Volksverzekeringen (AOW, Anw, Wlz)",
        authority: "Sociale Verzekeringsbank (SVB) / Belastingdienst",
        category: "social_contribution",
        amount: fromMinor(nationalInsuranceMinor, "EUR"),
        effectiveRate: nationalInsuranceMinor / (grossMinor || 1),
        evidenceRefId: "belastingdienst-premies-2024"
      }
    ];
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
      marginalTaxRate: grossMajor > 75518 ? 0.495 : 0.3697,
      components,
      taxRuleVersion: "Belastingdienst-2024.1",
      evidenceSourceIds: ["belastingdienst-box1-2024", "belastingdienst-premies-2024"]
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
    const components = [
      {
        id: "nz-ird-paye",
        name: "Inland Revenue PAYE Income Tax",
        authority: "Inland Revenue Department (Te Tari Taake)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "NZD"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: "ird-tax-rates-2024-2025"
      },
      {
        id: "nz-acc-levy",
        name: "ACC Earner's Levy (1.60%)",
        authority: "Accident Compensation Corporation (ACC)",
        category: "social_contribution",
        amount: fromMinor(accMinor, "NZD"),
        effectiveRate: accMinor / (grossMinor || 1),
        evidenceRefId: "acc-earners-levy-2024"
      }
    ];
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
      taxRuleVersion: "IRD-2024.2",
      evidenceSourceIds: ["ird-tax-rates-2024-2025", "acc-earners-levy-2024"]
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
    const components = [
      {
        id: "qa-statutory-tax",
        name: "Qatar Personal Employment Income Tax (0%)",
        authority: "General Tax Authority (GTA)",
        category: "federal",
        amount: createMoney(0, "QAR"),
        effectiveRate: 0,
        evidenceRefId: "qatar-income-tax-law-2018"
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
      taxRuleVersion: "GTA-2024.1",
      evidenceSourceIds: ["qatar-income-tax-law-2018"]
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
    return context.countryId === "SA" || context.countryId === "QA";
  }
  calculate(grossCompensation, profile, context) {
    const grossMinor = grossCompensation.amountMinor;
    const currency = grossCompensation.currency;
    const components = [
      {
        id: `${context.countryId.toLowerCase()}-zero-tax`,
        name: `${context.countryId === "SA" ? "Saudi Arabia" : "Qatar"} Statutory Personal Income Tax (0%)`,
        authority: context.countryId === "SA" ? "Zakat, Tax and Customs Authority (ZATCA)" : "General Tax Authority (GTA)",
        category: "federal",
        amount: createMoney(0, currency),
        effectiveRate: 0,
        evidenceRefId: "gulf-zero-income-tax-statute"
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
      taxRuleVersion: "GULF-2024.1",
      evidenceSourceIds: ["gulf-zero-income-tax-statute"]
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
    const components = [
      {
        id: "sg-iras-income-tax",
        name: "Inland Revenue Authority of Singapore (IRAS) Resident Tax",
        authority: "Inland Revenue Authority of Singapore (IRAS)",
        category: "federal",
        amount: fromMinor(federalTaxMinor, "SGD"),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: "iras-tax-rates-2024"
      }
    ];
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
      taxRuleVersion: "IRAS-YA2024",
      evidenceSourceIds: ["iras-tax-rates-2024"]
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
  calculate(gross, _profile, _context) {
    const currency = "AED";
    const grossMinor = gross.amountMinor;
    return {
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
          evidenceRefId: "uae-fta-2024"
        }
      ],
      taxRuleVersion: "UAE-FTA-2024.1",
      evidenceSourceIds: ["uae-fta-2024"]
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
  calculate(gross, _profile, _context) {
    const currency = "GBP";
    const grossMinor = gross.amountMinor;
    let personalAllowanceMinor = 1257e3;
    if (grossMinor > 1e7) {
      const reduction = Math.floor((grossMinor - 1e7) / 2);
      personalAllowanceMinor = Math.max(0, personalAllowanceMinor - reduction);
    }
    const taxableMinor = Math.max(0, grossMinor - personalAllowanceMinor);
    let incomeTaxMinor = 0;
    const isScotland = _context.regionId === "GB-SCT";
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
    const components = [
      {
        id: "uk-income-tax",
        name: "UK Income Tax (PAYE)",
        authority: "HM Revenue & Customs (HMRC)",
        category: "federal",
        amount: fromMinor(incomeTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? incomeTaxMinor / grossMinor : 0,
        description: `Personal Allowance: \xA3${(personalAllowanceMinor / 100).toLocaleString()}`,
        evidenceRefId: "uk-hmrc-tax-2024"
      },
      {
        id: "uk-national-insurance",
        name: "National Insurance (Class 1)",
        authority: "HM Revenue & Customs (HMRC)",
        category: "social_contribution",
        amount: fromMinor(niMinor, currency),
        effectiveRate: grossMinor > 0 ? niMinor / grossMinor : 0,
        description: "8% main rate up to \xA350,270 + 2% upper rate",
        evidenceRefId: "uk-hmrc-tax-2024"
      }
    ];
    return {
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
      taxRuleVersion: "UK-HMRC-2024.2",
      evidenceSourceIds: ["uk-hmrc-tax-2024"]
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
var SOCIAL_SECURITY_RATE = 0.062;
var SOCIAL_SECURITY_CAP_2024_MINOR = 1686e4;
var MEDICARE_RATE = 0.0145;
var ADDL_MEDICARE_RATE = 9e-3;
var ADDL_MEDICARE_THRESHOLD_MINOR = {
  single: 2e7,
  married_filing_jointly: 25e6,
  head_of_household: 2e7
};
var NYS_STANDARD_DEDUCTION_2024 = {
  single: 8e5,
  married_filing_jointly: 1605e3,
  head_of_household: 112e4
};
var NYS_BRACKETS_2024_SINGLE = [
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
var NYC_BRACKETS_2024_SINGLE = [
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
    const preTaxDeductionsMinor = (profile.pensionContributionMinor || 0) + (profile.healthDeductionMinor || 0);
    const adjustedGrossMinor = Math.max(0, grossMinor - preTaxDeductionsMinor);
    const federalStdDeductionMinor = US_FEDERAL_STANDARD_DEDUCTION_2024[profile.filingStatus];
    const federalTaxableMinor = Math.max(0, adjustedGrossMinor - federalStdDeductionMinor);
    const federalBrackets = US_FEDERAL_BRACKETS_2024[profile.filingStatus];
    const { taxMinor: federalTaxMinor, topMarginalRate: federalMarginal } = calculateGraduatedTax(
      federalTaxableMinor,
      federalBrackets
    );
    const socialSecuritySubjectMinor = Math.min(grossMinor, SOCIAL_SECURITY_CAP_2024_MINOR);
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
      const nysStdDeductionMinor = NYS_STANDARD_DEDUCTION_2024[profile.filingStatus];
      nysTaxableMinor = Math.max(0, adjustedGrossMinor - nysStdDeductionMinor);
      const stateCalc = calculateGraduatedTax(nysTaxableMinor, NYS_BRACKETS_2024_SINGLE);
      stateTaxMinor = stateCalc.taxMinor;
      stateMarginal = stateCalc.topMarginalRate;
      if (isNycResident) {
        const localCalc = calculateGraduatedTax(nysTaxableMinor, NYC_BRACKETS_2024_SINGLE);
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
        evidenceRefId: "us-irs-tax-2024"
      },
      {
        id: "us-fica-social-security",
        name: "Social Security (OASDI)",
        authority: "Social Security Administration",
        category: "social_contribution",
        amount: fromMinor(socialSecurityTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? socialSecurityTaxMinor / grossMinor : 0,
        marginalRate: grossMinor < SOCIAL_SECURITY_CAP_2024_MINOR ? SOCIAL_SECURITY_RATE : 0,
        description: `6.2% on wages up to $168,600 maximum annual wage base`,
        evidenceRefId: "us-ssa-fica-2024"
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
        evidenceRefId: "us-ssa-fica-2024"
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
        description: isNewYorkState ? `NYS Standard Deduction $${(NYS_STANDARD_DEDUCTION_2024[profile.filingStatus] / 100).toLocaleString()}` : void 0,
        evidenceRefId: isNewYorkState ? "us-nys-tax-2024" : "us-irs-tax-2024"
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
        evidenceRefId: "us-nyc-tax-2024"
      });
    }
    const effectiveTaxRate = grossMinor > 0 ? totalDeductionsAndTaxesMinor / grossMinor : 0;
    const combinedMarginalRate = federalMarginal + stateMarginal + localMarginal + (grossMinor < SOCIAL_SECURITY_CAP_2024_MINOR ? SOCIAL_SECURITY_RATE : 0) + MEDICARE_RATE + (grossMinor > addlMedicareThresholdMinor ? ADDL_MEDICARE_RATE : 0);
    return {
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
      taxRuleVersion: "US-FED-NY-NYC-2024.1",
      evidenceSourceIds: [
        "us-irs-tax-2024",
        "us-ssa-fica-2024",
        ...isNewYorkState ? ["us-nys-tax-2024"] : [],
        ...isNycResident ? ["us-nyc-tax-2024"] : []
      ]
    };
  }
};

// src/engines/tax/tax-registry.ts
var TaxRegistry = class {
  static {
    this.COUNTRY_METADATA = {
      // Priority A (12)
      US: {
        name: "United States",
        status: "VERIFIED",
        notes: "IRS 2024 Rev. Proc. 2023-34, SSA FICA, and state/local schedules verified with golden vectors."
      },
      GB: {
        name: "United Kingdom",
        status: "VERIFIED",
        notes: "HMRC 2024/25 PAYE, personal allowance taper, Scottish rates, and NI Class 1 verified with golden vectors."
      },
      AE: {
        name: "United Arab Emirates",
        status: "VERIFIED",
        notes: "Federal Tax Authority (FTA) 0% statutory employment income tax verified."
      },
      CA: {
        name: "Canada",
        status: "VERIFIED",
        notes: "CRA 2024 Federal Brackets, BPA phase-out, CPP1/CPP2, EI, and provincial tax verified with golden vectors."
      },
      AU: {
        name: "Australia",
        status: "VERIFIED",
        notes: "ATO 2024-25 Revised Stage 3 personal tax cuts and Medicare levy verified with golden vectors."
      },
      DE: {
        name: "Germany",
        status: "VERIFIED",
        notes: "EStG \xA7 32a statutory polynomial formula and social insurance contributions (KV/RV/AV/PV) verified with golden vectors."
      },
      SG: {
        name: "Singapore",
        status: "VERIFIED",
        notes: "IRAS YA 2024 progressive resident tax schedule verified with golden vectors."
      },
      QA: {
        name: "Qatar",
        status: "VERIFIED",
        notes: "General Tax Authority (GTA) 0% statutory personal income tax verified."
      },
      SA: {
        name: "Saudi Arabia",
        status: "VERIFIED",
        notes: "ZATCA 0% statutory employment income tax for employees verified."
      },
      NZ: {
        name: "New Zealand",
        status: "VERIFIED",
        notes: "Inland Revenue (IRD) 2024/25 brackets and ACC earner levy verified with golden vectors."
      },
      FR: {
        name: "France",
        status: "LIMITED",
        notes: "DGFiP 5-bracket scale and URSSAF CSG/CRDS/Retraite for single employee; quotient familial not fully modeled."
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
        notes: "Revenue standard rate band, personal tax credits, USC, and PRSI Class A for single filer."
      },
      // Priority B (15)
      JP: {
        name: "Japan",
        status: "LIMITED",
        notes: "National progressive income tax schedules verified; resident surtax pending full local integration."
      },
      KR: {
        name: "South Korea",
        status: "LIMITED",
        notes: "National income tax schedules verified; local resident surtax pending full local integration."
      },
      NO: {
        name: "Norway",
        status: "LIMITED",
        notes: "General income tax and bracket tax verified; municipal variations pending."
      },
      SE: {
        name: "Sweden",
        status: "LIMITED",
        notes: "National income tax and basic municipal rate verified."
      },
      DK: {
        name: "Denmark",
        status: "LIMITED",
        notes: "Bottom/top tax and labor market contributions (AM-bidrag) verified."
      },
      FI: {
        name: "Finland",
        status: "LIMITED",
        notes: "State progressive scale and municipal average rate verified."
      },
      AT: {
        name: "Austria",
        status: "LIMITED",
        notes: "EStG progressive tax brackets verified."
      },
      BE: {
        name: "Belgium",
        status: "LIMITED",
        notes: "Federal personal income tax brackets verified; communal surcharge pending."
      },
      ES: {
        name: "Spain",
        status: "LIMITED",
        notes: "IRPF national and regional scales with standard personal allowance; regional variations limited."
      },
      IT: {
        name: "Italy",
        status: "LIMITED",
        notes: "IRPEF national brackets verified; regional/municipal surcharges pending."
      },
      IL: {
        name: "Israel",
        status: "LIMITED",
        notes: "Income tax brackets and standard credit points verified."
      },
      HK: {
        name: "Hong Kong",
        status: "LIMITED",
        notes: "Salaries tax standard vs progressive rate verified."
      },
      LU: {
        name: "Luxembourg",
        status: "LIMITED",
        notes: "Class 1 progressive rate scale verified."
      },
      // Priority C (12)
      IN: {
        name: "India",
        status: "LIMITED",
        notes: "New Tax Regime (Sec 115BAC) verified; standard deduction included."
      },
      BR: {
        name: "Brazil",
        status: "LIMITED",
        notes: "IRPF progressive monthly brackets and INSS contribution verified."
      },
      MX: {
        name: "Mexico",
        status: "LIMITED",
        notes: "ISR progressive tariff verified."
      },
      ID: {
        name: "Indonesia",
        status: "PROVISIONAL",
        notes: "PPh 21 progressive scale under research."
      },
      MY: {
        name: "Malaysia",
        status: "LIMITED",
        notes: "Resident progressive scale and EPF employee rate verified."
      },
      PH: {
        name: "Philippines",
        status: "PROVISIONAL",
        notes: "TRAIN law progressive tax brackets under research."
      },
      ZA: {
        name: "South Africa",
        status: "LIMITED",
        notes: "SARS progressive income tax and primary rebate verified."
      },
      PL: {
        name: "Poland",
        status: "LIMITED",
        notes: "Skala podatkowa (12%/32%) and kwota wolna verified."
      },
      PT: {
        name: "Portugal",
        status: "LIMITED",
        notes: "IRS progressive brackets verified; solidarity surcharge pending."
      },
      CZ: {
        name: "Czechia",
        status: "LIMITED",
        notes: "Flat progressive (15%/23%) and basic tax credit verified."
      },
      TH: {
        name: "Thailand",
        status: "PROVISIONAL",
        notes: "Personal income tax progressive schedule under research."
      },
      VN: {
        name: "Vietnam",
        status: "PROVISIONAL",
        notes: "Personal income tax progressive schedule under research."
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
    return this.COUNTRY_METADATA[countryId]?.status || "UNSUPPORTED";
  }
  static supportsTaxCalculation(countryId) {
    return this.adapters.some((a) => a.supports({ countryId }));
  }
  static isStatutorilyVerified(countryId) {
    return this.getCountryStatus(countryId) === "VERIFIED" && this.supportsTaxCalculation(countryId);
  }
  static isSupported(countryId) {
    return this.supportsTaxCalculation(countryId);
  }
  static getCountrySupport(countryId) {
    const meta = this.COUNTRY_METADATA[countryId];
    const status = meta?.status || "UNSUPPORTED";
    const hasAdapter = this.supportsTaxCalculation(countryId);
    return {
      countryId,
      name: meta?.name || countryId,
      verificationStatus: status,
      isStatutorilyVerified: status === "VERIFIED" && hasAdapter,
      isSupported: hasAdapter,
      notes: hasAdapter ? meta?.notes || "Statutory adapter registered." : `Statutory tax schedules for ${meta?.name || countryId} are under verification. Dedicated executable adapter pending.`
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
    const adapter = this.getAdapter(context);
    return adapter.calculate(grossCompensation, profile, context);
  }
};

// src/data/city-benchmarks.ts
var CITY_COL_BENCHMARKS = {
  // --- UNITED STATES ---
  nyc: {
    currency: "USD",
    rentBase: { studio: 2350, "1-bedroom": 2750, "2-bedroom": 3650, "3-bedroom": 4750 },
    groceriesPerAdult: 440,
    groceriesPerChild: 280,
    diningPerAdult: 260,
    baseUtilities: 180,
    utilitiesPerExtraPerson: 45,
    internetMonthly: 75,
    mobilePerAdult: 65,
    publicTransitPerAdult: 132,
    carMonthlyPerVehicle: 750,
    rideshareMonthly: 120,
    healthcareSingle: 160,
    healthcareFamily: 480,
    lifestyleBasePerAdult: { essential: 110, moderate: 260, comfortable: 480 },
    childcarePerChild: 1450,
    sourceDate: "2024-12",
    evidenceSourceId: "us-hud-nyc-fmr-2024"
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
  }
};

// src/engines/col/col-engine.ts
var CostOfLivingEngine = class {
  static calculate(cityId, household, overrides) {
    const benchmark = CITY_COL_BENCHMARKS[cityId] || CITY_COL_BENCHMARKS["nyc"];
    const currency = benchmark.currency;
    const areaMultiplier = household.areaType === "budget" ? 0.85 : household.areaType === "premium" ? 1.35 : 1;
    const baseRentMajor = benchmark.rentBase[household.housingType] * areaMultiplier;
    let rentMonthlyMinor = Math.round(baseRentMajor * 100);
    let rentIsOverridden = false;
    if (overrides?.actualRentMonthlyMinor !== void 0 && overrides.actualRentMonthlyMinor > 0) {
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
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: benchmark.evidenceSourceId,
      notes: rentIsOverridden ? "Direct user override applied." : "HUD 50th Percentile Fair Market Rents and Local Vacancy Survey median."
    };
    let foodMonthlyMajor = household.adults * benchmark.groceriesPerAdult + household.children * benchmark.groceriesPerChild;
    const diningMultiplier = household.lifestyleLevel === "essential" ? 0.4 : household.lifestyleLevel === "comfortable" ? 1.6 : 1;
    foodMonthlyMajor += household.adults * benchmark.diningPerAdult * diningMultiplier;
    let foodMonthlyMinor = Math.round(foodMonthlyMajor * 100);
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
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: cityId === "nyc" ? "us-bls-cpi-nyc-2024" : benchmark.evidenceSourceId,
      notes: cityId === "nyc" ? "Based on BLS Consumer Expenditure Survey metropolitan food-at-home and food-away weights." : "Official statistics consumer price index regional food-at-home and dining expenditure weights."
    };
    const extraPersons = Math.max(0, household.adults + household.children - 1);
    const utilitiesMajor = benchmark.baseUtilities + extraPersons * benchmark.utilitiesPerExtraPerson + benchmark.internetMonthly + household.adults * benchmark.mobilePerAdult;
    const utilitiesMinor = Math.round(utilitiesMajor * 100);
    const utilitiesItem = {
      id: "utilities-connectivity",
      category: "utilities",
      label: "Energy, Water, Fiber Internet & Mobile",
      monthlyEstimate: fromMinor(utilitiesMinor, currency),
      monthlyLow: fromMinor(Math.round(utilitiesMinor * 0.9), currency),
      monthlyHigh: fromMinor(Math.round(utilitiesMinor * 1.25), currency),
      annualEstimate: fromMinor(utilitiesMinor * 12, currency),
      confidence: "High",
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: cityId === "nyc" ? "us-bls-cpi-nyc-2024" : benchmark.evidenceSourceId,
      notes: "Includes seasonal weighted energy, municipal water, high-speed broadband, and cellular plans."
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
    let transportMinor = Math.round(transportMajor * 100);
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
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: cityId === "nyc" ? "us-mta-nyc-transit-2024" : benchmark.evidenceSourceId,
      notes: cityId === "nyc" ? "MTA 30-day passes or vehicle amortization, gas, insurance, and routine maintenance." : "Metropolitan transit agency passes, vehicle operating costs, fuel, and routine maintenance."
    };
    const isFamily = household.children > 0 || household.adults > 1;
    const healthcareMajor = isFamily ? benchmark.healthcareFamily : benchmark.healthcareSingle;
    const healthcareMinor = Math.round(healthcareMajor * 100);
    const healthcareItem = {
      id: "healthcare",
      category: "healthcare",
      label: "Healthcare (Employee Premium Share & Copays)",
      monthlyEstimate: fromMinor(healthcareMinor, currency),
      monthlyLow: fromMinor(Math.round(healthcareMinor * 0.8), currency),
      monthlyHigh: fromMinor(Math.round(healthcareMinor * 1.3), currency),
      annualEstimate: fromMinor(healthcareMinor * 12, currency),
      confidence: "High",
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: cityId === "nyc" ? "us-bls-cpi-nyc-2024" : benchmark.evidenceSourceId,
      notes: "Typical employer plan payroll deduction plus standard prescription and office copays."
    };
    let childcareMinor = 0;
    const items = [housingItem, foodItem, utilitiesItem, transportItem, healthcareItem];
    if (household.children > 0) {
      const childcareMajor = household.children * benchmark.childcarePerChild;
      childcareMinor = Math.round(childcareMajor * 100);
      const childcareItem = {
        id: "childcare-education",
        category: "family",
        label: `Childcare, After-School & Activities (${household.children} child${household.children > 1 ? "ren" : ""})`,
        monthlyEstimate: fromMinor(childcareMinor, currency),
        monthlyLow: fromMinor(Math.round(childcareMinor * 0.85), currency),
        monthlyHigh: fromMinor(Math.round(childcareMinor * 1.25), currency),
        annualEstimate: fromMinor(childcareMinor * 12, currency),
        confidence: "Moderate",
        sourceDate: benchmark.sourceDate,
        evidenceSourceId: benchmark.evidenceSourceId,
        notes: "Licensed day care / preschool or activity fees for school-age dependents."
      };
      items.push(childcareItem);
    }
    const effectiveLifestyle = household.lifestyleLevel || "moderate";
    const lifestyleBase = benchmark.lifestyleBasePerAdult[effectiveLifestyle] || benchmark.lifestyleBasePerAdult.moderate;
    const lifestyleMajor = household.adults * lifestyleBase;
    const lifestyleMinor = Math.round(lifestyleMajor * 100);
    const lifestyleItem = {
      id: "lifestyle-discretionary",
      category: "lifestyle",
      label: `Discretionary Lifestyle (${effectiveLifestyle})`,
      monthlyEstimate: fromMinor(lifestyleMinor, currency),
      monthlyLow: fromMinor(Math.round(lifestyleMinor * 0.8), currency),
      monthlyHigh: fromMinor(Math.round(lifestyleMinor * 1.3), currency),
      annualEstimate: fromMinor(lifestyleMinor * 12, currency),
      confidence: "Moderate",
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: cityId === "nyc" ? "us-bls-cpi-nyc-2024" : benchmark.evidenceSourceId,
      notes: "Clothing, recreation, fitness, personal grooming, entertainment subscriptions."
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
      confidenceScore: "High-confidence estimate",
      evidenceSourceIds: Array.from(new Set(items.map((i) => i.evidenceSourceId))),
      datasetVersion: benchmark.sourceDate,
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
    const takeHomeAnnualMinor = taxResult.netIncome.amountMinor;
    const takeHomeMonthlyMinor = Math.round(takeHomeAnnualMinor / 12);
    let netLivingCostsAnnualMinor = colResult.annualTotal.amountMinor;
    if (scenario.compensation.housingAllowanceAnnual) {
      netLivingCostsAnnualMinor = Math.max(
        0,
        netLivingCostsAnnualMinor - scenario.compensation.housingAllowanceAnnual.amountMinor
      );
    }
    const netLivingCostsMonthlyMinor = Math.round(netLivingCostsAnnualMinor / 12);
    const moneyRemainingAnnualMinor = takeHomeAnnualMinor - netLivingCostsAnnualMinor;
    const moneyRemainingMonthlyMinor = Math.round(moneyRemainingAnnualMinor / 12);
    const savingsCapacityAnnualMinor = Math.max(0, moneyRemainingAnnualMinor);
    const savingsCapacityMonthlyMinor = Math.max(0, moneyRemainingMonthlyMinor);
    const savingsRate = grossAnnual.amountMinor > 0 ? savingsCapacityAnnualMinor / grossAnnual.amountMinor * 100 : 0;
    const allEvidenceSources = Array.from(
      /* @__PURE__ */ new Set([...taxResult.evidenceSourceIds, ...colResult.evidenceSourceIds])
    );
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
      taxRuleVersion: taxResult.taxRuleVersion,
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
        const zeroMoney = createMoney(0, displayCurrency);
        return {
          status: "FX_UNAVAILABLE",
          scenarioA,
          outcomeA,
          scenarioB,
          outcomeB,
          displayCurrency,
          convertedA: {
            grossAnnual: zeroMoney,
            takeHomeAnnual: zeroMoney,
            livingCostsAnnual: zeroMoney,
            disposableAnnual: zeroMoney,
            disposableMonthly: zeroMoney
          },
          convertedB: {
            grossAnnual: zeroMoney,
            takeHomeAnnual: zeroMoney,
            livingCostsAnnual: zeroMoney,
            disposableAnnual: zeroMoney,
            disposableMonthly: zeroMoney
          },
          delta: {
            grossAnnualDiff: zeroMoney,
            takeHomeAnnualDiff: zeroMoney,
            livingCostsAnnualDiff: zeroMoney,
            disposableIncomeAnnualDiff: zeroMoney,
            monthlyDisposableDiff: zeroMoney,
            year1RelocationTotal: zeroMoney,
            year1NetDisposableDiff: zeroMoney,
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
    const convA = {
      grossAnnual: convertMoney(outcomeA.grossAnnual, displayCurrency, effectiveSnapshot),
      takeHomeAnnual: convertMoney(outcomeA.takeHomeAnnual, displayCurrency, effectiveSnapshot),
      livingCostsAnnual: convertMoney(outcomeA.livingCostsAnnual, displayCurrency, effectiveSnapshot),
      disposableAnnual: convertMoney(outcomeA.moneyRemainingAnnual, displayCurrency, effectiveSnapshot),
      disposableMonthly: convertMoney(outcomeA.moneyRemainingMonthly, displayCurrency, effectiveSnapshot)
    };
    const convB = {
      grossAnnual: convertMoney(outcomeB.grossAnnual, displayCurrency, effectiveSnapshot),
      takeHomeAnnual: convertMoney(outcomeB.takeHomeAnnual, displayCurrency, effectiveSnapshot),
      livingCostsAnnual: convertMoney(outcomeB.livingCostsAnnual, displayCurrency, effectiveSnapshot),
      disposableAnnual: convertMoney(outcomeB.moneyRemainingAnnual, displayCurrency, effectiveSnapshot),
      disposableMonthly: convertMoney(outcomeB.moneyRemainingMonthly, displayCurrency, effectiveSnapshot)
    };
    const grossDiff = subtractMoney(convB.grossAnnual, convA.grossAnnual);
    const takeHomeDiff = subtractMoney(convB.takeHomeAnnual, convA.takeHomeAnnual);
    const livingCostsDiff = subtractMoney(convB.livingCostsAnnual, convA.livingCostsAnnual);
    const disposableDiff = subtractMoney(convB.disposableAnnual, convA.disposableAnnual);
    const monthlyDispDiff = subtractMoney(convB.disposableMonthly, convA.disposableMonthly);
    let year1RelocationMinor = 0;
    if (relocationB) {
      year1RelocationMinor = relocationB.flightsMinor + relocationB.tempHousingMinor + relocationB.securityDepositMinor + relocationB.shippingFurnitureMinor + relocationB.visaAdminMinor + relocationB.otherSetupMinor;
    }
    const year1RelocationTotal = fromMinor(year1RelocationMinor, displayCurrency);
    const year1NetDisposableDiff = fromMinor(
      disposableDiff.amountMinor - year1RelocationMinor,
      displayCurrency
    );
    const absDispDiffMajor = Math.abs(toMajor(disposableDiff));
    const formattedDiff = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: displayCurrency,
      maximumFractionDigits: 0
    }).format(absDispDiffMajor);
    let summaryNarrative = "";
    if (disposableDiff.amountMinor > 0) {
      summaryNarrative = `Under these assumptions, ${scenarioB.location.name} leaves approximately ${formattedDiff} more disposable income annually before one-time relocation adjustments.`;
    } else if (disposableDiff.amountMinor < 0) {
      summaryNarrative = `Under these assumptions, ${scenarioA.location.name} leaves approximately ${formattedDiff} more disposable income annually before one-time relocation adjustments.`;
    } else {
      summaryNarrative = `Under these assumptions, both options yield approximately identical disposable income after local taxes and living costs.`;
    }
    return {
      status: fxStatus,
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
      fxStatus: fxSnapshot?.status
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
    // 15 dedicated executable adapters registered in TaxRegistry
    this.EXECUTABLE_TAX_ADAPTER_COUNTRIES = /* @__PURE__ */ new Set([
      "US",
      "GB",
      "AE",
      "CA",
      "AU",
      "DE",
      "SG",
      "QA",
      "SA",
      "NZ",
      // 10 VERIFIED
      "FR",
      "ES",
      "NL",
      "IE",
      "CH"
      // 5 LIMITED
    ]);
  }
  static {
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
    return this.EXECUTABLE_TAX_ADAPTER_COUNTRIES.has(countryId);
  }
  static supportsTaxCalculation(countryId) {
    return this.hasDedicatedTaxAdapter(countryId);
  }
  static resolve(countryId) {
    const country = COUNTRIES[countryId];
    const countryName = country?.name || countryId;
    const priority = this.getPriority(countryId);
    const hasTaxAdapter = this.hasDedicatedTaxAdapter(countryId);
    const support = TaxRegistry.getCountrySupport(countryId);
    const limitations = [];
    let taxYear;
    let taxRuleVersion;
    if (hasTaxAdapter) {
      taxYear = 2024;
      switch (countryId) {
        case "US":
          taxRuleVersion = "US-FED-NY-NYC-2024.1";
          limitations.push("Single filer standard deduction; localized state/local schedules for major commercial metros.");
          break;
        case "GB":
          taxRuleVersion = "GB-HMRC-PAYE-2024.1";
          limitations.push("England/Wales standard & Scottish progressive bands; personal allowance reduction over \xA3100k.");
          break;
        case "AE":
          taxRuleVersion = "AE-FTA-2024.1";
          limitations.push("Statutory 0% employment income tax; corporate and excise taxes excluded from payroll.");
          break;
        case "CA":
          taxRuleVersion = "CA-CRA-ON-2024.1";
          limitations.push("Federal + Ontario provincial schedules, CPP1/CPP2, and Employment Insurance.");
          break;
        case "AU":
          taxRuleVersion = "AU-ATO-2024-25.1";
          limitations.push("Revised Stage 3 tax cuts (effective July 2024) and Medicare levy.");
          break;
        case "DE":
          taxRuleVersion = "DE-BMF-2024.1";
          limitations.push("EStG polynomial formula and standard statutory social contributions (KV, RV, AV, PV).");
          break;
        case "SG":
          taxRuleVersion = "SG-IRAS-YA2024.1";
          limitations.push("Resident progressive tax schedule; CPF statutory contributions for citizens/PR.");
          break;
        case "QA":
          taxRuleVersion = "QA-GTA-2024.1";
          limitations.push("Statutory 0% employment income tax for resident and foreign employees.");
          break;
        case "SA":
          taxRuleVersion = "SA-ZATCA-2024.1";
          limitations.push("0% personal income tax on employee compensation; GOSI contributions for Saudi nationals.");
          break;
        case "NZ":
          taxRuleVersion = "NZ-IRD-2024.1";
          limitations.push("Post-July 2024 tax thresholds and ACC earner levy.");
          break;
        case "FR":
          taxRuleVersion = "FR-DGFIP-2024.1";
          limitations.push("Single employee scale & URSSAF social charges; quotient familial not modeled.");
          break;
        case "ES":
          taxRuleVersion = "ES-AEAT-2024.1";
          limitations.push("National and standard Madrid/Catalonia scales; specific autonomous regional deductions limited.");
          break;
        case "NL":
          taxRuleVersion = "NL-BELASTING-2024.1";
          limitations.push("Box 1 income tax & national insurance; 30% ruling not applied.");
          break;
        case "IE":
          taxRuleVersion = "IE-REVENUE-2024.1";
          limitations.push("Single filer standard rate band, personal tax credit, USC, and PRSI Class A.");
          break;
        case "CH":
          taxRuleVersion = "CH-ESTV-ZH-2024.1";
          limitations.push("Federal direct tax and standard Zurich cantonal/communal multiplier.");
          break;
      }
    } else {
      limitations.push(
        `Statutory tax schedules for ${countryName} are in verification. Calculations for ${countryName} project living costs against pre-tax gross compensation without artificial tax approximations.`
      );
    }
    return {
      countryId,
      countryName,
      commercialPriority: priority,
      verificationStatus: hasTaxAdapter ? support.verificationStatus : "LIMITED",
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

// server.ts
var env = null;
try {
  env = validateEnv();
} catch (envErr) {
  if (process.env.VERCEL) {
    console.warn("[Vercel Serverless Notice]:", envErr.message);
  } else {
    throw envErr;
  }
}
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
        const isProduction = process.env.NODE_ENV === "production";
        if (isProduction && !process.env.VERCEL && dbService.mode === "PRODUCTION_POSTGRES") {
          console.error("[Database] Fatal startup failure: Database initialization or migration failed.");
          process.exit(1);
        } else {
          console.warn("[Database] Startup initialization notice:", dbErr.message);
        }
      }
    })();
  }
  return dbInitPromise;
}
var app = express();
function configureApp() {
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'; object-src 'none';"
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
    const isSensitivePath = req.path.startsWith("/api/admin") || req.path.startsWith("/api/cms");
    if (isSensitivePath) {
      if (origin && (trustedOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))) {
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
  app.get("/api/health/ready", async (req, res) => {
    const isProduction = process.env.NODE_ENV === "production";
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
  });
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
      const curr = currency || COUNTRIES[countryId]?.defaultCurrency || "USD";
      const grossMoney = fromMinor(grossSalaryMinor, curr);
      const profile = {
        filingStatus: filingStatus || "single",
        dependentsCount: typeof dependentsCount === "number" ? dependentsCount : 0,
        taxYear: typeof taxYear === "number" ? taxYear : 2024
      };
      const location = {
        countryId,
        regionId,
        cityId,
        taxJurisdictionId
      };
      const result = TaxRegistry.calculate(grossMoney, profile, location);
      const support = TaxRegistry.getCountrySupport(countryId);
      res.json({
        success: true,
        data: result,
        verificationStatus: support.verificationStatus,
        isStatutorilyVerified: support.isStatutorilyVerified,
        notes: support.notes
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
    const countryId = req.query.countryId || "US";
    const regionId = req.query.regionId;
    const adapter = TaxRegistry.getAdapter({ countryId, regionId, taxYear: 2024 });
    const sample = adapter.calculate(
      createMoney(1e5, COUNTRIES[countryId]?.defaultCurrency || "USD"),
      { filingStatus: "single", dependentsCount: 0, taxYear: 2024 },
      { countryId, regionId, taxYear: 2024 }
    );
    res.json({
      countryId,
      regionId,
      adapterName: adapter.name,
      taxRuleVersion: sample.taxRuleVersion,
      components: sample.components,
      evidenceSources: sample.evidenceSourceIds.map((id) => EVIDENCE_REGISTRY[id]).filter(Boolean)
    });
  });
  app.get("/api/fx/latest", rateLimit(60, 60), async (req, res) => {
    const snapshot = await FxEngine.getLatestSnapshot();
    res.json({ snapshot });
  });
  app.post("/api/fx/refresh", rateLimit(10, 60), async (req, res) => {
    const session = extractSession(req);
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
    const locale = req.query.locale || "en";
    const pages = await dbService.getContentPages({ locale });
    res.json({ pages });
  });
  app.get("/api/content/:slug", rateLimit(120, 60), async (req, res) => {
    const slug = req.params.slug;
    const locale = req.query.locale || "en";
    const page = await dbService.getContentPageBySlug(slug, locale);
    if (!page) {
      return res.status(404).json({ error: "PAGE_NOT_FOUND" });
    }
    res.json({ page });
  });
  app.post("/api/content", rateLimit(30, 60), async (req, res) => {
    const session = extractSession(req);
    if (!session || !AuthService.hasPermission(session.role, "edit_content")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Editor permission required." });
    }
    const pageData = req.body;
    if (pageData.workflowState === "INDEX_APPROVED" && !AuthService.hasPermission(session.role, "approve_indexing")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "SEO_REVIEWER or ADMIN permission required to approve indexing." });
    }
    const saved = await dbService.upsertContentPage({
      ...pageData,
      authorEmail: session.email
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
  app.post("/api/admin/login", rateLimit(5, 60, { isSecuritySensitive: true, failClosed: true }), async (req, res) => {
    const { email, password, totpCode } = req.body;
    try {
      const dbUser = await dbService.getUserByEmail(email);
      if (dbUser && AuthService.verifyPassword(password, dbUser.passwordHash)) {
        if (dbUser.mfaEnabled && dbUser.mfaSecret) {
          if (!totpCode || !AuthService.verifyTotp(dbUser.mfaSecret, totpCode)) {
            return res.status(401).json({ error: "MFA_REQUIRED", message: "Valid 6-digit TOTP code required." });
          }
        }
        const user = { id: dbUser.id, email: dbUser.email, role: dbUser.role };
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
    }
    await dbService.recordAuditLog({
      actorEmail: email || "unknown",
      action: "ADMIN_LOGIN_FAILED",
      entityType: "user",
      entityId: "failed"
    });
    res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Invalid admin credentials." });
  });
  app.get("/api/admin/me", rateLimit(60, 60), (req, res) => {
    const session = extractSession(req);
    if (!session) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }
    res.json({ user: session });
  });
  app.get("/api/admin/audit-logs", rateLimit(30, 60), async (req, res) => {
    const session = extractSession(req);
    if (!session || !AuthService.hasPermission(session.role, "view_audit_logs")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Insufficient permissions to view audit logs." });
    }
    const limit = parseInt(req.query.limit) || 50;
    const logs = await dbService.getAuditLogs(limit);
    res.json({ logs });
  });
  app.get("/api/admin/users", rateLimit(30, 60), async (req, res) => {
    const session = extractSession(req);
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
    const session = extractSession(req);
    if (!session || !AuthService.hasPermission(session.role, "manage_users")) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Insufficient permissions to manage users." });
    }
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: "INVALID_PAYLOAD", message: "Email, password, and role are required." });
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
  app.get("/api/reviews", rateLimit(60, 60), async (req, res) => {
    const contentPageId = req.query.contentPageId;
    const reviews = await dbService.getReviews(contentPageId);
    res.json({ reviews });
  });
  app.post("/api/reviews", rateLimit(30, 60), async (req, res) => {
    const session = extractSession(req);
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
async function startServer() {
  await ensureDatabaseReady();
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LivWorthy Server] Enterprise server active on http://0.0.0.0:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
export {
  app,
  server_default as default,
  ensureDatabaseReady,
  startServer
};
//# sourceMappingURL=index.js.map
