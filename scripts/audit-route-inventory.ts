/**
 * LivWorthy Route Inventory & Indexability Audit Engine
 *
 * Implements Section 13, 14, 23, 24:
 * - Machine-readable JSON route inventory of all public URLs
 * - Explicit categorization: Tier-1 Indexable, Tier-2 Published UI (non-indexable), Tier-3 Dev/QA
 * - Total route counts, localized route counts, and coverage percentage
 */

import fs from 'fs';
import path from 'path';
import {
  SUPPORTED_LOCALES,
  TIER_1_LOCALES,
  TIER_2_LOCALES,
  TIER_3_LOCALES,
  getIndexableLocales,
} from '../src/lib/i18n';
import { LongFormContentAuditor } from '../src/lib/i18n/content';
import {
  buildCountryPath,
  buildCityPath,
  buildGuidePath,
  buildRelocationPath,
} from '../src/lib/routes';
import { CITIES, COUNTRIES } from '../src/data/locations';
import { SALARY_GUIDES } from '../src/data/salary-guides';
import { RELOCATION_CORRIDORS } from '../src/data/relocation-corridors';
import { ALL_EMPIRICAL_REPORTS } from '../src/data/reports-data';

export interface RouteEntry {
  path: string;
  url: string;
  type: 'core' | 'city' | 'country' | 'guide' | 'relocation' | 'report' | 'localized_home' | 'localized_tab';
  locale: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  lifecycleStatus: string;
  isIndexable: boolean;
  robots: string;
}

export interface RouteInventoryReport {
  timestamp: string;
  summary: {
    totalRoutes: number;
    indexableRoutes: number;
    nonIndexableRoutes: number;
    tier1Routes: number;
    tier2Routes: number;
    tier3Routes: number;
    indexableCoveragePct: number;
    longFormCoveragePct: number;
  };
  byLocale: Record<string, {
    locale: string;
    tier: string;
    status: string;
    isIndexable: boolean;
    routeCount: number;
  }>;
  routes: RouteEntry[];
}

export function generateRouteInventory(baseUrl: string = 'https://www.livworthy.com'): RouteInventoryReport {
  const routes: RouteEntry[] = [];

  // Core application and hub pages (English baseline)
  const corePages = [
    { path: '/', type: 'core' as const },
    { path: '/coverage', type: 'core' as const },
    { path: '/relocation', type: 'core' as const },
    { path: '/job-offer-comparison', type: 'core' as const },
    { path: '/countries', type: 'core' as const },
    { path: '/cities', type: 'core' as const },
    { path: '/compare', type: 'core' as const },
    { path: '/guides', type: 'core' as const },
    { path: '/about', type: 'core' as const },
    { path: '/methodology', type: 'core' as const },
    { path: '/sources', type: 'core' as const },
    { path: '/editorial-policy', type: 'core' as const },
    { path: '/data-policy', type: 'core' as const },
    { path: '/corrections', type: 'core' as const },
    { path: '/terms', type: 'core' as const },
    { path: '/privacy', type: 'core' as const },
    // Programmatic city hub pages
    { path: '/salary-after-tax/new-york', type: 'core' as const },
    { path: '/salary-after-tax/london', type: 'core' as const },
    { path: '/salary-after-tax/dubai', type: 'core' as const },
    { path: '/salary-needed/new-york', type: 'core' as const },
    { path: '/salary-needed/london', type: 'core' as const },
    { path: '/cost-of-living/new-york', type: 'core' as const },
  ];

  for (const page of corePages) {
    routes.push({
      path: page.path,
      url: `${baseUrl}${page.path === '/' ? '' : page.path}`,
      type: page.type,
      locale: 'en',
      tier: 'tier1',
      lifecycleStatus: 'INDEXABLE',
      isIndexable: true,
      robots: 'index, follow',
    });
  }

  // Interactive English tabs (non-indexable client state)
  const englishTabs = [
    'salary-worth',
    'salary-needed',
    'salary-after-tax',
    'cost-of-living',
    'compare',
    'job-offers',
  ];
  for (const tab of englishTabs) {
    routes.push({
      path: `/?tab=${tab}`,
      url: `${baseUrl}/?tab=${tab}`,
      type: 'core',
      locale: 'en',
      tier: 'tier1',
      lifecycleStatus: 'INDEXABLE',
      isIndexable: false,
      robots: 'noindex, follow',
    });
  }

  // Country landing pages
  for (const countryId of Object.keys(COUNTRIES)) {
    const routePath = buildCountryPath('en', countryId);
    routes.push({
      path: routePath,
      url: `${baseUrl}${routePath}`,
      type: 'country',
      locale: 'en',
      tier: 'tier1',
      lifecycleStatus: 'INDEXABLE',
      isIndexable: true,
      robots: 'index, follow',
    });
  }

  // City landing pages
  for (const cityId of Object.keys(CITIES)) {
    const routePath = buildCityPath('en', cityId);
    routes.push({
      path: routePath,
      url: `${baseUrl}${routePath}`,
      type: 'city',
      locale: 'en',
      tier: 'tier1',
      lifecycleStatus: 'INDEXABLE',
      isIndexable: true,
      robots: 'index, follow',
    });
  }

  // Salary guide pages
  for (const slug of Object.keys(SALARY_GUIDES)) {
    const routePath = buildGuidePath('en', slug);
    routes.push({
      path: routePath,
      url: `${baseUrl}${routePath}`,
      type: 'guide',
      locale: 'en',
      tier: 'tier1',
      lifecycleStatus: 'INDEXABLE',
      isIndexable: true,
      robots: 'index, follow',
    });
  }

  // Relocation corridor pages
  for (const slug of Object.keys(RELOCATION_CORRIDORS)) {
    const routePath = buildRelocationPath('en', slug);
    routes.push({
      path: routePath,
      url: `${baseUrl}${routePath}`,
      type: 'relocation',
      locale: 'en',
      tier: 'tier1',
      lifecycleStatus: 'INDEXABLE',
      isIndexable: true,
      robots: 'index, follow',
    });
  }

  // Empirical report pages
  for (const report of ALL_EMPIRICAL_REPORTS) {
    const routePath = `/${report.slug}`;
    routes.push({
      path: routePath,
      url: `${baseUrl}${routePath}`,
      type: 'report',
      locale: 'en',
      tier: 'tier1',
      lifecycleStatus: 'INDEXABLE',
      isIndexable: true,
      robots: 'index, follow',
    });
  }

  // Multilingual routes for Tier-1, Tier-2, Tier-3
  const interactiveTabs = [
    'salary-worth',
    'salary-needed',
    'salary-after-tax',
    'cost-of-living',
    'compare',
    'job-offers',
  ];

  for (const [code, cfg] of Object.entries(SUPPORTED_LOCALES)) {
    if (code === 'en') continue; // English covered above
    if (cfg.regionVariantOf) continue; // Regional dialect variants resolve to base language canonicals

    const isIndexable = cfg.isIndexable && cfg.lifecycleStatus === 'INDEXABLE';
    const tier: 'tier1' | 'tier2' | 'tier3' =
      cfg.tier === 1 ? 'tier1' : cfg.tier === 2 ? 'tier2' : 'tier3';

    // Localized home
    routes.push({
      path: `/${code}`,
      url: `${baseUrl}/${code}`,
      type: 'localized_home',
      locale: code,
      tier,
      lifecycleStatus: cfg.lifecycleStatus,
      isIndexable,
      robots: isIndexable ? 'index, follow' : 'noindex, follow',
    });

    // Localized tabs
    for (const tab of interactiveTabs) {
      routes.push({
        path: `/${code}?tab=${tab}`,
        url: `${baseUrl}/${code}?tab=${tab}`,
        type: 'localized_tab',
        locale: code,
        tier,
        lifecycleStatus: cfg.lifecycleStatus,
        isIndexable: false, // Tab query variants are canonicalized or non-indexable
        robots: 'noindex, follow',
      });
    }
  }

  const indexableRoutes = routes.filter((r) => r.isIndexable).length;
  const nonIndexableRoutes = routes.filter((r) => !r.isIndexable).length;
  const tier1Routes = routes.filter((r) => r.tier === 'tier1').length;
  const tier2Routes = routes.filter((r) => r.tier === 'tier2').length;
  const tier3Routes = routes.filter((r) => r.tier === 'tier3').length;

  const byLocale: Record<string, {
    locale: string;
    tier: string;
    status: string;
    isIndexable: boolean;
    routeCount: number;
  }> = {};

  for (const [code, cfg] of Object.entries(SUPPORTED_LOCALES)) {
    const locRoutes = routes.filter((r) => r.locale === code);
    const tierStr = cfg.tier === 1 ? 'tier1' : cfg.tier === 2 ? 'tier2' : 'tier3';
    byLocale[code] = {
      locale: code,
      tier: tierStr,
      status: cfg.lifecycleStatus,
      isIndexable: cfg.isIndexable && cfg.lifecycleStatus === 'INDEXABLE',
      routeCount: locRoutes.length,
    };
  }

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalRoutes: routes.length,
      indexableRoutes,
      nonIndexableRoutes,
      tier1Routes,
      tier2Routes,
      tier3Routes,
      indexableCoveragePct: Math.round((indexableRoutes / routes.length) * 100),
      longFormCoveragePct: LongFormContentAuditor.getOverallCoverage(),
    },
    byLocale,
    routes,
  };
}

async function run() {
  console.log('========================================================');
  console.log('🗺️ LivWorthy Comprehensive Route Inventory & SEO Audit');
  console.log('========================================================\n');

  const inventory = generateRouteInventory();

  console.log(`• Total Cataloged Routes:      ${inventory.summary.totalRoutes}`);
  console.log(`• Indexable Public Routes:     ${inventory.summary.indexableRoutes}`);
  console.log(`• Non-Indexable / UI Routes:   ${inventory.summary.nonIndexableRoutes}`);
  console.log(`• Tier-1 Routes:               ${inventory.summary.tier1Routes}`);
  console.log(`• Tier-2 Routes:               ${inventory.summary.tier2Routes}`);
  console.log(`• Tier-3 Routes:               ${inventory.summary.tier3Routes}`);
  console.log(`• Indexable Coverage:          ${inventory.summary.indexableCoveragePct}%\n`);

  console.log('--- Tier-1 Production Locales (INDEXABLE) ---');
  for (const [code, info] of Object.entries(inventory.byLocale)) {
    if (info.tier === 'tier1') {
      console.log(`  [${code}] Status: ${info.status.padEnd(14)} | Indexable: ${info.isIndexable ? 'YES' : 'NO'} | Routes: ${info.routeCount}`);
    }
  }

  console.log('\n--- Tier-2 Production Locales (PUBLISHED_UI, Non-Indexable) ---');
  for (const [code, info] of Object.entries(inventory.byLocale)) {
    if (info.tier === 'tier2') {
      console.log(`  [${code}] Status: ${info.status.padEnd(14)} | Indexable: ${info.isIndexable ? 'YES' : 'NO'} | Routes: ${info.routeCount}`);
    }
  }

  console.log('\n--- Tier-3 Registry Locales (QA / In-Development) ---');
  for (const [code, info] of Object.entries(inventory.byLocale)) {
    if (info.tier === 'tier3') {
      console.log(`  [${code}] Status: ${info.status.padEnd(14)} | Indexable: ${info.isIndexable ? 'YES' : 'NO'} | Routes: ${info.routeCount}`);
    }
  }

  // Write inventory JSON artifact
  const outDir = path.resolve('dist');
  if (fs.existsSync(outDir)) {
    const outPath = path.join(outDir, 'route-inventory.json');
    fs.writeFileSync(outPath, JSON.stringify(inventory, null, 2), 'utf-8');
    console.log(`\n✅ Route inventory artifact written to: ${outPath}`);
  }

  console.log('\nAudit completed successfully.');
}

if (process.argv[1]?.endsWith('audit-route-inventory.ts')) {
  run().catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
}
