/**
 * LivWorthy Analytics Measurement, 404 Prevention & Broken Link Regression Test
 *
 * Enforces:
 * - GA4 Measurement ID integrity across index.html and 404.html
 * - 404 error tracking event reporting
 * - Zero broken internal links across all prerendered static HTML pages
 * - Client-side SPA analytics engagement tracking integration
 * - UTM query parameter preservation through edge redirects
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('========================================================');
console.log('🧪 GA4 Measurement, 404 Prevention & Link Integrity Suite');
console.log('========================================================\n');

const EXPECTED_GA_ID = 'G-BQBKMVS7PN';
const distDir = path.resolve('dist');
assert.ok(fs.existsSync(distDir), 'dist/ directory must exist');

// 1. GA4 Configuration Invariants
console.log('▶ Test 1: Verifying GA4 Tag Installation, History Shield & Consent Mode v2...');
const indexHtmlPath = path.resolve('index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
assert.ok(indexHtmlContent.includes(EXPECTED_GA_ID), `index.html must configure measurement ID ${EXPECTED_GA_ID}`);
assert.ok(indexHtmlContent.includes("gtag('consent', 'default'"), 'index.html must implement Google Consent Mode v2 default');
assert.ok(indexHtmlContent.includes("'analytics_storage': 'denied'"), 'index.html must default analytics_storage to denied before user consent');
assert.ok(indexHtmlContent.includes("send_page_view': false") || indexHtmlContent.includes('"send_page_view": false'), 'index.html must pass send_page_view: false to prevent duplicate initial pageviews');
assert.ok(indexHtmlContent.includes('sanitizeAnalyticsUrl'), 'index.html must sanitize URL before passing to GA4 config');
assert.ok(indexHtmlContent.includes('Object.defineProperty(history, \'pushState\''), 'index.html must include History Shield protecting pushState from automatic GA4 scraping');
assert.ok(indexHtmlContent.includes('Object.defineProperty(history, \'replaceState\''), 'index.html must include History Shield protecting replaceState from automatic GA4 scraping');
console.log('  ✔ index.html GA4, History Shield and Consent Mode v2 verified.');

console.log('▶ Test 2: Verifying 404 Error Path Logging & Privacy Consent Invariants...');
const notFoundHtmlPath = path.resolve('public/404.html');
const notFoundContent = fs.readFileSync(notFoundHtmlPath, 'utf8');
assert.ok(notFoundContent.includes(EXPECTED_GA_ID), `404.html must configure measurement ID ${EXPECTED_GA_ID}`);
assert.ok(notFoundContent.includes("gtag('consent', 'default'"), '404.html must implement Google Consent Mode v2 default before tracking');
assert.ok(notFoundContent.includes("'analytics_storage': 'denied'"), '404.html must deny analytics by default before consent');
assert.ok(notFoundContent.includes("localStorage.getItem('livworthy_cookie_consent')"), '404.html must honor saved user cookie consent state');
assert.ok(notFoundContent.includes('page_not_found'), '404.html must log custom page_not_found event');
assert.ok(notFoundContent.includes('window.location.pathname'), '404.html must report exact 404 path to GA4');
assert.ok(!notFoundContent.includes('page_location: window.location.href'), '404.html must NOT leak sensitive query parameters in page_location');
assert.ok(notFoundContent.includes('cleanLocation'), '404.html must use sanitized query-stripped URL for location');
console.log('  ✔ 404.html GA4 event, Consent Mode v2 and privacy URL sanitization verified.');

// 2. Client Analytics Module Verification
console.log('▶ Test 3: Verifying Client Analytics & Privacy-Preserving Engagement Module...');
const analyticsModulePath = path.resolve('src/lib/analytics.ts');
assert.ok(fs.existsSync(analyticsModulePath), 'src/lib/analytics.ts must exist');
const analyticsContent = fs.readFileSync(analyticsModulePath, 'utf8');
assert.ok(analyticsContent.includes('export function trackPageView'), 'analytics.ts must export trackPageView');
assert.ok(analyticsContent.includes('export function trackCalculatorEngagement'), 'analytics.ts must export trackCalculatorEngagement');
assert.ok(analyticsContent.includes('export function trackCalculationOutcome'), 'analytics.ts must export trackCalculationOutcome');
assert.ok(analyticsContent.includes('export function sanitizeUrlForAnalytics'), 'analytics.ts must export sanitizeUrlForAnalytics');

// Privacy & Genuine Engagement Invariants:
assert.ok(!analyticsContent.includes('engagement_time_msec: 1000'), 'analytics.ts must NOT inject hardcoded 1000ms engagement time');
assert.ok(!analyticsContent.includes('engagement_time_msec: 2500'), 'analytics.ts must NOT inject hardcoded 2500ms engagement time');
assert.ok(!analyticsContent.includes('salary_amount:'), 'analytics.ts must NOT send raw salary amounts (PII/sensitive financial data)');
assert.ok(!analyticsContent.includes('salary_tier:'), 'analytics.ts must NOT send un-normalized cross-currency salary tiers');

// Unit test URL sanitization
import { sanitizeUrlForAnalytics, trackPageView, resetAnalyticsState, trackCalculationOutcome } from '../../src/lib/analytics';
const testUrl1 = 'https://www.livworthy.com/?salary=150000&rent=3500&city=nyc&utm_source=google&utm_campaign=brand';
const clean1 = sanitizeUrlForAnalytics(testUrl1);
assert.strictEqual(clean1.includes('salary='), false, 'URL sanitizer must strip salary query parameter');
assert.strictEqual(clean1.includes('rent='), false, 'URL sanitizer must strip rent query parameter');
assert.strictEqual(clean1.includes('utm_source=google'), true, 'URL sanitizer must preserve marketing utm_source');
assert.strictEqual(clean1.includes('utm_campaign=brand'), true, 'URL sanitizer must preserve marketing utm_campaign');
assert.strictEqual(clean1.includes('city=nyc'), true, 'URL sanitizer must preserve city parameter');

const testPath2 = '/compare?salary=120000&tab=compare';
const clean2 = sanitizeUrlForAnalytics(testPath2);
assert.strictEqual(clean2, '/compare?tab=compare', 'Relative path sanitizer must strip salary and preserve tab');

const testPath3 = '/guides/nyc-100k?token=secret123&salary=100000#section';
const clean3 = sanitizeUrlForAnalytics(testPath3);
assert.strictEqual(clean3, '/guides/nyc-100k', 'URL sanitizer must strip token, salary, and hash fragment');
console.log('  ✔ Sensitive URL query parameter sanitization verified.');

// Deduplication testing in browser-mocked environment
const gtagEventsDispatched: Array<{ name: string; params: any }> = [];
(globalThis as any).window = {
  location: {
    origin: 'https://www.livworthy.com',
    href: 'https://www.livworthy.com/compare?salary=120000&rent=3000',
    pathname: '/compare',
    search: '?salary=120000&rent=3000',
  },
  gtag: (type: string, name: string, params: any) => {
    if (type === 'event') gtagEventsDispatched.push({ name, params });
  },
};
(globalThis as any).document = { title: 'LivWorthy Test' };
resetAnalyticsState();

const firstCall = trackPageView('/compare?salary=120000', 'Compare View');
assert.strictEqual(firstCall, true, 'First route navigation must fire virtual pageview');
assert.strictEqual(gtagEventsDispatched.length, 1);
assert.strictEqual(gtagEventsDispatched[0].params.page_path, '/compare');
assert.strictEqual(gtagEventsDispatched[0].params.page_location, 'https://www.livworthy.com/compare');
assert.strictEqual(gtagEventsDispatched[0].params.page_location.includes('salary='), false, 'page_location must never contain salary');

const duplicateCall = trackPageView('/compare?salary=120000', 'Compare View');
assert.strictEqual(duplicateCall, false, 'Immediate duplicate call to same route must be suppressed');
assert.strictEqual(gtagEventsDispatched.length, 1, 'Event count must remain 1 after duplicate attempt');

const secondRouteCall = trackPageView('/salary-after-tax', 'Tax View');
assert.strictEqual(secondRouteCall, true, 'Navigation to distinct route must fire virtual pageview');
assert.strictEqual(gtagEventsDispatched.length, 2);
console.log('  ✔ SPA virtual pageview deduplication guard and sanitized payload verified.');

// Test calculation outcome payload privacy
trackCalculationOutcome('salary-worth', 'nyc', 'USD');
assert.strictEqual(gtagEventsDispatched.length, 3);
const calcEvent = gtagEventsDispatched[2];
assert.strictEqual(calcEvent.name, 'calculate_salary');
assert.strictEqual(calcEvent.params.calculator_name, 'salary-worth');
assert.strictEqual(calcEvent.params.city_id, 'nyc');
assert.strictEqual(calcEvent.params.currency, 'USD');
assert.strictEqual(calcEvent.params.salary_amount, undefined, 'calculate_salary must NOT transmit salary_amount');
assert.strictEqual(calcEvent.params.salary_tier, undefined, 'calculate_salary must NOT transmit salary_tier');
assert.strictEqual(calcEvent.params.page_location.includes('salary='), false, 'calculate_salary page_location must be sanitized');
console.log('  ✔ calculate_salary privacy and payload invariants verified.');

const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
assert.ok(appContent.includes('trackPageView('), 'App.tsx must dispatch trackPageView on navigation');
assert.ok(appContent.includes('trackCalculatorEngagement('), 'App.tsx must dispatch trackCalculatorEngagement on tab switch');
assert.ok(appContent.includes('triggerUserInitiatedCalculation('), 'App.tsx must gate calculation tracking behind explicit user calculation triggers');
assert.ok(appContent.includes('replaceStateTimerRef'), 'App.tsx must debounce replaceState query sync to prevent history flooding');
assert.ok(appContent.includes('TAB_TITLES'), 'App.tsx must set document.title appropriately on tab transitions');
console.log('  ✔ App.tsx user-initiated calculation gating and debounced history verified.');

// 3. Vercel Redirects for Legacy / Broken Links
console.log('▶ Test 4: Verifying Vercel Edge Redirects for Historical Broken Paths...');
const vercelConfig = JSON.parse(fs.readFileSync(path.resolve('vercel.json'), 'utf8'));
const redirects: { source: string; destination: string; permanent?: boolean }[] = vercelConfig.redirects || [];

const requiredRedirectSources = [
  '/editorial',
  '/salary-after-tax/san-francisco',
  '/salary-after-tax/chicago',
  '/salary-after-tax/seattle',
  '/salary-after-tax/los-angeles',
  '/salary-after-tax/boston',
  '/salary-after-tax/miami',
];

for (const reqSource of requiredRedirectSources) {
  const match = redirects.find((r) => r.source === reqSource);
  assert.ok(match, `vercel.json must define redirect for historical path ${reqSource}`);
  assert.strictEqual(match.permanent, true, `Redirect for ${reqSource} must be permanent (308)`);
}
console.log('  ✔ Historical broken paths protected by edge 308 redirects.');

// 4. Exhaustive Internal Link Scan (Zero 404s in Prerendered HTML)
console.log('▶ Test 5: Exhaustive Crawl of All Prerendered HTML Internal Links...');
function findHtmlFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findHtmlFiles(fullPath));
    } else if (file.endsWith('.html') && !file.includes('/admin')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = findHtmlFiles(distDir);
const knownPaths = new Set<string>();
function collectKnown(dir: string) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    const rel = path.relative(distDir, full);
    knownPaths.add('/' + rel);
    if (stat.isDirectory()) {
      collectKnown(full);
    }
  }
}
collectKnown(distDir);

function isValidPath(href: string): boolean {
  if (href === '/' || href === '') return true;
  let clean = href.split('?')[0].split('#')[0].replace('https://www.livworthy.com', '');
  if (!clean.startsWith('/')) clean = '/' + clean;
  clean = clean.replace(/\/+$/, '');

  if (knownPaths.has(clean)) return true;
  if (knownPaths.has(clean + '/index.html')) return true;
  if (knownPaths.has(clean + '.html')) return true;

  // Check if handled by edge redirect in vercel.json
  const hasRedirect = redirects.some((r) => r.source === clean || r.source === clean + '/');
  if (hasRedirect) return true;

  return false;
}

const brokenTargets = new Map<string, string[]>();

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(distDir, file);
  const matches = [...content.matchAll(/<a\s+[^>]*?href=[\"']([^\"']+)[\"'][^>]*?>/gi)];
  for (const m of matches) {
    const href = m[1].trim();
    if (href.startsWith('/') || href.startsWith('https://www.livworthy.com/')) {
      const clean = href.replace('https://www.livworthy.com', '');
      if (clean.startsWith('/api') || clean.startsWith('/admin') || clean.startsWith('/test')) continue;
      if (!isValidPath(clean)) {
        if (!brokenTargets.has(clean)) brokenTargets.set(clean, []);
        brokenTargets.get(clean)!.push(rel);
      }
    }
  }
}

if (brokenTargets.size > 0) {
  console.error('❌ Broken internal links found:');
  for (const [target, sources] of brokenTargets.entries()) {
    console.error(`  Target: ${target} (from ${sources.length} pages, sample: ${sources.slice(0, 2).join(', ')})`);
  }
}

assert.strictEqual(brokenTargets.size, 0, `Expected 0 broken internal links in prerendered HTML, found ${brokenTargets.size}`);
console.log(`  ✔ Verified 0 broken internal links across ${htmlFiles.length} prerendered pages.`);

console.log('\n🎉 ALL GA4 MEASUREMENT & LINK INTEGRITY TESTS PASSED 100%!\n');

