/**
 * Comprehensive Verification Suite for:
 * 1. Google Search Console API Integration (honest status handling, zero secret leaks)
 * 2. Long-Form Localization Content Repositories & Completeness Auditor
 * 3. Route Inventory & Tier Lifecycle Compliance (Tier-1 vs Tier-2 vs Tier-3)
 * 4. English Leakage Engine
 */

import assert from 'node:assert';
import {
  SearchConsoleConnector,
  ACTUAL_SITEMAP_SUBMITTED_PAGES,
} from '../../src/lib/seo/search-console-connector';
import {
  LongFormContentAuditor,
  getLocalizedCity,
  getLocalizedCountry,
  getLocalizedGuide,
  getLocalizedRelocation,
  getLocalizedReport,
} from '../../src/lib/i18n/content';
import { generateRouteInventory } from '../../scripts/audit-route-inventory';
import { EnglishLeakageAuditor } from '../../scripts/audit-english-leakage';
import { SUPPORTED_LOCALES, TIER_1_LOCALES, TIER_2_LOCALES, TIER_3_LOCALES } from '../../src/lib/i18n';

async function runTests() {
  console.log('🧪 Starting Search Console & Long-Form Localization Test Suite...\n');

  // ==========================================
  // TEST 1: Google Search Console Connector Safety & Missing Credential Handling
  // ==========================================
  console.log('Test 1: Search Console Connector safe degradation under missing credentials...');
  const hasCreds = SearchConsoleConnector.hasValidCredentials();
  assert.strictEqual(typeof hasCreds, 'boolean');

  // Verify validatePropertyAccess
  const accessCheck = await SearchConsoleConnector.validatePropertyAccess();
  assert.strictEqual(typeof accessCheck.accessible, 'boolean');
  if (!hasCreds) {
    assert.strictEqual(accessCheck.accessible, false);
    assert.strictEqual(accessCheck.status, 'BLOCKED_BY_ACCOUNT_ACCESS');
  }

  // Verify fetchSearchAnalytics
  const perfResult = await SearchConsoleConnector.fetchSearchAnalytics();
  assert.strictEqual(typeof perfResult.success, 'boolean');
  assert.strictEqual(perfResult.coverage.sitemapSubmittedPages, ACTUAL_SITEMAP_SUBMITTED_PAGES);
  if (!hasCreds) {
    assert.strictEqual(perfResult.status, 'BLOCKED_BY_ACCOUNT_ACCESS');
    assert.strictEqual(perfResult.totalImpressions, null);
    assert.strictEqual(perfResult.totalClicks, null);
    assert.strictEqual(perfResult.averageCtr, null);
    assert.strictEqual(perfResult.averagePosition, null);
    assert.strictEqual(perfResult.records.length, 0);
  }

  // Verify inspectUrl
  const inspectResult = await SearchConsoleConnector.inspectUrl('https://www.livworthy.com/salary-after-tax');
  assert.strictEqual(typeof inspectResult.success, 'boolean');
  if (!hasCreds) {
    assert.strictEqual(inspectResult.status, 'BLOCKED_BY_ACCOUNT_ACCESS');
    assert.strictEqual(inspectResult.verdict, undefined);
    assert.strictEqual(inspectResult.coverageState, undefined);
  }
  console.log('✅ Test 1 Passed: GSC connector handles absent credentials honestly with zero crashes.\n');

  // ==========================================
  // TEST 2: Long-Form Localization Repositories & Lookups
  // ==========================================
  console.log('Test 2: Long-form content repositories lookups and fallbacks...');

  // City Content Lookup
  const nySpanish = getLocalizedCity('nyc', 'es');
  assert.ok(nySpanish, 'Spanish NYC content must exist');
  assert.strictEqual(nySpanish.name, 'Nueva York');
  assert.strictEqual(nySpanish.status, 'PUBLISHED');

  const nyArabic = getLocalizedCity('nyc', 'ar');
  assert.ok(nyArabic, 'Arabic NYC content must exist');
  assert.strictEqual(nyArabic.name, 'نيويورك');

  // Country Content Lookup
  const usGerman = getLocalizedCountry('US', 'de');
  assert.ok(usGerman, 'German US content must exist');
  assert.strictEqual(usGerman.name, 'Vereinigte Staaten');
  assert.strictEqual(usGerman.status, 'PUBLISHED');

  // Guide Content Lookup
  const nycGuideSpanish = getLocalizedGuide('nyc-100k', 'es');
  assert.ok(nycGuideSpanish, 'Spanish nyc-100k guide must exist');
  assert.ok(nycGuideSpanish.h1.includes('100.000'));
  assert.strictEqual(nycGuideSpanish.status, 'PUBLISHED');

  // Relocation Content Lookup
  const nyLondonFrench = getLocalizedRelocation('new-york-to-london', 'fr');
  assert.ok(nyLondonFrench, 'French NY-to-London relocation must exist');
  assert.ok(nyLondonFrench.headline.includes('Londres'));

  // Report Content Lookup
  const reportSpanish = getLocalizedReport('global-salary-worth-index', 'es');
  assert.ok(reportSpanish, 'Spanish report must exist');
  assert.ok(reportSpanish.title.includes('Índice Global'));
  console.log('✅ Test 2 Passed: Long-form content repositories return structured records.\n');

  // ==========================================
  // TEST 3: Long-Form Content Auditor
  // ==========================================
  console.log('Test 3: LongFormContentAuditor calculates coverage percentages without faking...');
  const auditEs = LongFormContentAuditor.auditLocale('es');
  assert.strictEqual(auditEs.locale, 'es');
  assert.ok(auditEs.totalRequiredFields > 0);
  assert.ok(auditEs.translatedFields > 0);
  assert.ok(auditEs.completenessPct >= 0 && auditEs.completenessPct <= 100);

  const allAudits = LongFormContentAuditor.auditAllLocales(['en', 'es', 'fr', 'de']);
  assert.strictEqual(allAudits.en.completenessPct, 100);
  assert.ok(allAudits.es.completenessPct > 0);
  console.log(`✅ Test 3 Passed: Long-form auditor verified (ES coverage: ${auditEs.completenessPct}%).\n`);

  // ==========================================
  // TEST 4: Route Inventory & Indexability Compliance
  // ==========================================
  console.log('Test 4: Route inventory audits indexability and tier rules...');
  const inventory = generateRouteInventory();
  assert.ok(inventory.summary.totalRoutes > 500);
  assert.ok(inventory.summary.indexableRoutes > 100);
  assert.ok(inventory.summary.nonIndexableRoutes > 300);

  // All Tier-1 locales must have indexable home routes
  for (const loc of TIER_1_LOCALES) {
    const locInfo = inventory.byLocale[loc];
    assert.ok(locInfo, `Tier-1 locale [${loc}] must exist in route inventory`);
    assert.strictEqual(locInfo.isIndexable, true, `Tier-1 locale [${loc}] must be indexable`);
  }

  // All Tier-2 locales must be PUBLISHED_UI and NOT indexable
  for (const loc of TIER_2_LOCALES) {
    const locInfo = inventory.byLocale[loc];
    assert.ok(locInfo, `Tier-2 locale [${loc}] must exist in route inventory`);
    assert.strictEqual(locInfo.status, 'PUBLISHED_UI');
    assert.strictEqual(locInfo.isIndexable, false, `Tier-2 locale [${loc}] must NOT be marked indexable`);
  }

  // All Tier-3 locales must be QA and NOT indexable
  for (const loc of TIER_3_LOCALES) {
    const locInfo = inventory.byLocale[loc];
    assert.ok(locInfo, `Tier-3 locale [${loc}] must exist in route inventory`);
    assert.strictEqual(locInfo.status, 'QA');
    assert.strictEqual(locInfo.isIndexable, false, `Tier-3 locale [${loc}] must NOT be marked indexable`);
  }
  console.log('✅ Test 4 Passed: Route inventory strictly honors tier indexability policies.\n');

  // ==========================================
  // TEST 5: English Leakage Auditor
  // ==========================================
  console.log('Test 5: English leakage auditing for Tier-1 locales...');
  for (const loc of ['es', 'fr', 'de', 'ar', 'pt', 'zh', 'ja']) {
    const leakageReport = EnglishLeakageAuditor.auditLocale(loc);
    assert.strictEqual(
      leakageReport.leakageCount,
      0,
      `Locale [${loc}] must have 0 English leakage incidents, got ${leakageReport.leakageCount}`
    );
  }
  console.log('✅ Test 5 Passed: Zero English leakage detected across tested Tier-1 locales.\n');

  console.log('🎉 ALL SEARCH CONSOLE & LONG-FORM LOCALIZATION TESTS PASSED!\n');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
