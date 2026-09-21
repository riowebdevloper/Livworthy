import crypto from 'crypto';

export interface EnvConfig {
  NODE_ENV: string;
  DATABASE_URL: string;
  REDIS_URL: string;
  CRON_SECRET: string;
  ADMIN_SESSION_SECRET: string;
  BOOTSTRAP_ADMIN_EMAIL?: string;
  BOOTSTRAP_ADMIN_PASSWORD?: string;
}

const REQUIRED_PRODUCTION_VARS = [
  'DATABASE_URL',
  'REDIS_URL',
  'CRON_SECRET',
  'ADMIN_SESSION_SECRET',
] as const;

let validatedConfig: EnvConfig | null = null;
let ephemeralDevSessionSecret: string | null = null;
let ephemeralDevCronSecret: string | null = null;

/**
 * Centralized server-side environment validation.
 * Fails startup with clear, non-secret errors if required variables are missing in production.
 * Never prints or leaks secret values in logs.
 */
export function validateEnv(): EnvConfig {
  if (validatedConfig) {
    return validatedConfig;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const missing: string[] = [];

  for (const varName of REQUIRED_PRODUCTION_VARS) {
    const val = (process.env[varName] || '').trim();
    if (!val) {
      if (isProduction) {
        missing.push(varName);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[Environment Validation Failed] Missing required production environment variables: ${missing.join(', ')}. ` +
      `Silently substituting mock URLs, localhost, or static fallback secrets in production is strictly forbidden.`
    );
  }

  // Handle ephemeral generation for non-production when secrets are absent
  if (!process.env.ADMIN_SESSION_SECRET) {
    if (!ephemeralDevSessionSecret) {
      ephemeralDevSessionSecret = crypto.randomBytes(32).toString('hex');
    }
  }

  if (!process.env.CRON_SECRET) {
    if (!ephemeralDevCronSecret) {
      ephemeralDevCronSecret = crypto.randomBytes(32).toString('hex');
    }
  }

  validatedConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: (process.env.DATABASE_URL || '').trim(),
    REDIS_URL: (process.env.REDIS_URL || '').trim(),
    CRON_SECRET: (process.env.CRON_SECRET || '').trim() || ephemeralDevCronSecret!,
    ADMIN_SESSION_SECRET: (process.env.ADMIN_SESSION_SECRET || '').trim() || ephemeralDevSessionSecret!,
    BOOTSTRAP_ADMIN_EMAIL: (process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim() || undefined,
    BOOTSTRAP_ADMIN_PASSWORD: (process.env.BOOTSTRAP_ADMIN_PASSWORD || '').trim() || undefined,
  };

  return validatedConfig;
}

export function getRequiredEnv(name: string): string {
  const val = (process.env[name] || '').trim();
  if (!val) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[Environment] Required variable ${name} is missing in production.`);
    }
    // Check config for ephemeral fallbacks
    const cfg = validateEnv();
    if (name === 'ADMIN_SESSION_SECRET') return cfg.ADMIN_SESSION_SECRET;
    if (name === 'CRON_SECRET') return cfg.CRON_SECRET;
    throw new Error(`[Environment] Required variable ${name} is not set.`);
  }
  return val;
}
