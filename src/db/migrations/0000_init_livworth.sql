-- Migration: 0000_init_livworth.sql
-- Production PostgreSQL DDL for LivWorth Platform

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS countries (
  id VARCHAR(8) PRIMARY KEY,
  name TEXT NOT NULL,
  default_currency VARCHAR(4) NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'LIMITED',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regions (
  id VARCHAR(16) PRIMARY KEY,
  country_id VARCHAR(8) NOT NULL REFERENCES countries(id),
  name TEXT NOT NULL,
  code VARCHAR(16) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
  id VARCHAR(32) PRIMARY KEY,
  name TEXT NOT NULL,
  country_id VARCHAR(8) NOT NULL REFERENCES countries(id),
  region_id VARCHAR(16) NOT NULL REFERENCES regions(id),
  currency VARCHAR(4) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  col_index_vs_nyc DOUBLE PRECISION NOT NULL DEFAULT 100.0,
  rent_index_vs_nyc DOUBLE PRECISION NOT NULL DEFAULT 100.0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_jurisdictions (
  id VARCHAR(32) PRIMARY KEY,
  country_id VARCHAR(8) NOT NULL REFERENCES countries(id),
  region_id VARCHAR(16),
  level VARCHAR(16) NOT NULL,
  name TEXT NOT NULL,
  authority TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tax_rule_sets (
  id VARCHAR(64) PRIMARY KEY,
  country_id VARCHAR(8) NOT NULL REFERENCES countries(id),
  tax_year INTEGER NOT NULL,
  version VARCHAR(32) NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  effective_start_date TIMESTAMP NOT NULL,
  effective_end_date TIMESTAMP,
  rule_data JSONB NOT NULL,
  source_reference TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_brackets (
  id VARCHAR(64) PRIMARY KEY,
  rule_set_id VARCHAR(64) NOT NULL REFERENCES tax_rule_sets(id),
  filing_status VARCHAR(32) NOT NULL DEFAULT 'single',
  tier_order INTEGER NOT NULL,
  threshold_minor INTEGER NOT NULL,
  cap_minor INTEGER,
  marginal_rate DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS cost_datasets (
  id VARCHAR(64) PRIMARY KEY,
  city_id VARCHAR(32) NOT NULL REFERENCES cities(id),
  dataset_version VARCHAR(32) NOT NULL,
  observation_date TIMESTAMP NOT NULL,
  retrieval_date TIMESTAMP NOT NULL DEFAULT NOW(),
  housing_one_bed_minor INTEGER NOT NULL,
  housing_three_bed_minor INTEGER NOT NULL,
  food_monthly_minor INTEGER NOT NULL,
  utilities_monthly_minor INTEGER NOT NULL,
  transport_monthly_minor INTEGER NOT NULL,
  healthcare_monthly_minor INTEGER NOT NULL,
  confidence_rating DOUBLE PRECISION NOT NULL DEFAULT 0.95,
  source_ref TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS housing_datasets (
  id VARCHAR(64) PRIMARY KEY,
  city_id VARCHAR(32) NOT NULL REFERENCES cities(id),
  bedroom_count VARCHAR(16) NOT NULL,
  neighborhood_tier VARCHAR(32) NOT NULL DEFAULT 'city_center',
  median_monthly_rent_minor INTEGER NOT NULL,
  p25_monthly_rent_minor INTEGER NOT NULL,
  p75_monthly_rent_minor INTEGER NOT NULL,
  currency VARCHAR(4) NOT NULL,
  source_ref TEXT NOT NULL,
  retrieval_date TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_datasets (
  id VARCHAR(64) PRIMARY KEY,
  city_id VARCHAR(32) NOT NULL REFERENCES cities(id),
  role_title TEXT NOT NULL,
  experience_level VARCHAR(32) NOT NULL DEFAULT 'mid',
  p25_annual_minor INTEGER NOT NULL,
  p50_annual_minor INTEGER NOT NULL,
  p75_annual_minor INTEGER NOT NULL,
  p90_annual_minor INTEGER NOT NULL,
  currency VARCHAR(4) NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 100,
  source_ref TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fx_snapshots (
  id VARCHAR(64) PRIMARY KEY,
  base_currency VARCHAR(4) NOT NULL,
  provider VARCHAR(64) NOT NULL,
  provider_timestamp TIMESTAMP NOT NULL,
  retrieved_at TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
  rates_json JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS fx_rates (
  id VARCHAR(64) PRIMARY KEY,
  snapshot_id VARCHAR(64) NOT NULL REFERENCES fx_snapshots(id),
  base_currency VARCHAR(4) NOT NULL,
  quote_currency VARCHAR(4) NOT NULL,
  rate DOUBLE PRECISION NOT NULL,
  inverted_rate DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_sources (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'TIER_1_GOVERNMENT',
  authority TEXT NOT NULL,
  url TEXT NOT NULL,
  methodology TEXT NOT NULL,
  frequency VARCHAR(32) NOT NULL DEFAULT 'annual',
  last_verified_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS calculation_scenarios (
  id VARCHAR(64) PRIMARY KEY,
  city_id VARCHAR(32) NOT NULL REFERENCES cities(id),
  country_id VARCHAR(8) NOT NULL REFERENCES countries(id),
  base_salary_minor INTEGER NOT NULL,
  currency VARCHAR(4) NOT NULL,
  household_type VARCHAR(32) NOT NULL DEFAULT 'single',
  lifestyle_tier VARCHAR(32) NOT NULL DEFAULT 'moderate',
  overrides_json JSONB,
  engine_version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
  tax_rule_version VARCHAR(32) NOT NULL,
  cost_dataset_version VARCHAR(32) NOT NULL,
  fx_snapshot_id VARCHAR(64),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calculation_results (
  id VARCHAR(64) PRIMARY KEY,
  scenario_id VARCHAR(64) NOT NULL REFERENCES calculation_scenarios(id),
  gross_salary_annual_minor INTEGER NOT NULL,
  take_home_annual_minor INTEGER NOT NULL,
  total_tax_annual_minor INTEGER NOT NULL,
  social_contributions_annual_minor INTEGER NOT NULL,
  living_costs_annual_minor INTEGER NOT NULL,
  money_remaining_annual_minor INTEGER NOT NULL,
  effective_tax_rate DOUBLE PRECISION NOT NULL,
  full_result_json JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_pages (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) NOT NULL UNIQUE,
  locale VARCHAR(8) NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  workflow_state TEXT NOT NULL DEFAULT 'DRAFTED',
  is_indexable BOOLEAN NOT NULL DEFAULT FALSE,
  author_email TEXT NOT NULL,
  reviewer_email TEXT,
  published_at TIMESTAMP,
  canonical_url TEXT,
  blocks_json JSONB NOT NULL,
  evidence_source_ids JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS editorial_reviews (
  id VARCHAR(64) PRIMARY KEY,
  content_page_id VARCHAR(64) NOT NULL REFERENCES content_pages(id),
  reviewer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  feedback_notes TEXT,
  statutory_check_passed BOOLEAN NOT NULL DEFAULT TRUE,
  reviewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(128) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'READ_ONLY',
  mfa_secret TEXT,
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  actor_email TEXT NOT NULL,
  action VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  metadata_json JSONB,
  ip_address VARCHAR(48),
  user_agent TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS web_vitals (
  id VARCHAR(64) PRIMARY KEY,
  metric_name VARCHAR(16) NOT NULL,
  metric_value DOUBLE PRECISION NOT NULL,
  metric_rating VARCHAR(16) NOT NULL,
  route TEXT NOT NULL,
  device VARCHAR(16) NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance & query isolation
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_id);
CREATE INDEX IF NOT EXISTS idx_cost_datasets_city ON cost_datasets(city_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_city ON calculation_scenarios(city_id);
CREATE INDEX IF NOT EXISTS idx_content_slug_locale ON content_pages(slug, locale);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
