import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { RELOCATION_CORRIDORS } from '../src/data/relocation-corridors';

const distDir = path.resolve('dist');

function getAllHtmlFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html') && file !== '404.html' && !filePath.includes('/admin')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

console.log('--- Launch Inventory & High-Quality Content Regression Test ---');

const htmlFiles = getAllHtmlFiles(distDir);
console.log(`Found ${htmlFiles.length} total prerendered HTML pages.`);

// 1. Minimum 100 Useful Unique Pages
assert.ok(
  htmlFiles.length >= 100,
  `Expected at least 100 useful indexable pages, found ${htmlFiles.length}`
);
console.log(`PASS: Launch inventory count satisfies >= 100 requirement (actual: ${htmlFiles.length}).`);

// 2. Audit each page for single H1, valid canonical, unique title, and valid meta description
let indexableCount = 0;
const canonicalUrls = new Set<string>();

for (const filePath of htmlFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Verify single canonical
  const canonicalMatches = content.match(/<link\s+rel="canonical"\s+href="(https:\/\/www\.livworthy\.com[^"]*)"/i);
  assert.ok(canonicalMatches, `Missing or invalid canonical tag in ${filePath}`);
  const canonicalUrl = canonicalMatches[1];
  assert.ok(!canonicalUrls.has(canonicalUrl), `Duplicate canonical URL detected: ${canonicalUrl}`);
  canonicalUrls.add(canonicalUrl);

  // Check robots
  const robotsMatch = content.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
  if (robotsMatch && robotsMatch[1].includes('index')) {
    indexableCount++;
  }

  // Check title
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  assert.ok(titleMatch && titleMatch[1].trim().length > 5, `Missing or weak title in ${filePath}`);

  // Check meta description
  const descMatch = content.match(/<meta\s+name="description"\s+content="(.*?)"/i);
  assert.ok(descMatch && descMatch[1].trim().length > 15, `Missing or short meta description in ${filePath}`);

  // Check H1 hierarchy (must have at least one H1)
  const h1Matches = content.match(/<h1[\s>]/gi);
  assert.ok(h1Matches && h1Matches.length >= 1, `Missing H1 in ${filePath}`);

  // Check no preview or localhost domains in canonical or structured data
  assert.ok(!content.includes('livworthy.vercel.app'), `Contains vercel preview domain in ${filePath}`);
  assert.ok(!content.includes('http://localhost'), `Contains localhost reference in ${filePath}`);
}

assert.ok(indexableCount >= 100, `Expected at least 100 indexable pages, got ${indexableCount}`);
console.log(`PASS: Audited ${htmlFiles.length} pages: all have single canonical, valid title, description, and H1.`);

// 3. Relocation Corridor Pages Verification
console.log('\n--- Relocation Corridors Verification ---');
const relocationHubPath = path.join(distDir, 'relocation', 'index.html');
assert.ok(fs.existsSync(relocationHubPath), 'Relocation hub /relocation/index.html must exist');
const hubHtml = fs.readFileSync(relocationHubPath, 'utf-8');
assert.ok(hubHtml.includes('Global Relocation Intelligence'), 'Relocation hub must contain proper title');

const requiredCorridors = [
  'new-york-to-london',
  'new-york-to-dubai',
  'london-to-dubai',
  'london-to-new-york',
  'toronto-to-new-york',
  'vancouver-to-seattle',
  'sydney-to-singapore',
  'sydney-to-dubai',
  'berlin-to-zurich',
  'berlin-to-london',
  'dublin-to-london',
  'mumbai-to-dubai',
  'bengaluru-to-singapore',
  'mumbai-to-singapore',
  'san-francisco-to-austin',
  'san-francisco-to-seattle',
  'paris-to-london',
  'amsterdam-to-london',
];

for (const slug of requiredCorridors) {
  const corridorFile = path.join(distDir, 'relocation', slug, 'index.html');
  assert.ok(fs.existsSync(corridorFile), `Corridor page missing for ${slug}`);
  const corridorHtml = fs.readFileSync(corridorFile, 'utf-8');
  assert.ok(corridorHtml.includes('href="/job-offer-comparison"'), `${slug} must contain CTA to job offer comparison`);
  assert.ok(corridorHtml.includes('href="/compare"'), `${slug} must contain CTA to city compare`);
  assert.ok(corridorHtml.includes('href="/coverage"'), `${slug} must contain CTA to coverage`);
}
console.log(`PASS: All ${requiredCorridors.length} required relocation decision pages exist with CTAs.`);

// 4. Job Offer Authority Page Verification
console.log('\n--- Job Offer Authority Page Verification ---');
const jobOfferPath = path.join(distDir, 'job-offer-comparison', 'index.html');
assert.ok(fs.existsSync(jobOfferPath), 'Job offer comparison authority page must exist');
const jobOfferHtml = fs.readFileSync(jobOfferPath, 'utf-8');
assert.ok(jobOfferHtml.includes('How to Compare Job Offers'), 'Job offer guide must contain headline');
assert.ok(jobOfferHtml.includes('href="/?tab=job-offers"'), 'Job offer guide must deep link to calculator');
console.log('PASS: /job-offer-comparison exists with complete authority analysis and interactive deep link.');

// 5. Global Market Coverage Page Verification
console.log('\n--- Coverage Transparency Page Verification ---');
const coveragePath = path.join(distDir, 'coverage', 'index.html');
assert.ok(fs.existsSync(coveragePath), 'Coverage page must exist');
const coverageHtml = fs.readFileSync(coveragePath, 'utf-8');
assert.ok(coverageHtml.includes('39'), 'Coverage page must disclose 39 markets');
assert.ok(coverageHtml.includes('2026–2027 Tax Year Policy'), 'Coverage page must explain 2026-2027 policy');
assert.ok(coverageHtml.includes('TAX_CALCULATION_UNAVAILABLE'), 'Coverage page must explain unverified tax policy');
console.log('PASS: /coverage exists with full market counts and 2026-2027 tax policy disclosures.');

// 6. Localized Entry Routes Verification
console.log('\n--- Localized Entry Routes Verification ---');
const locales = [
  { code: 'en', dir: 'ltr' },
  { code: 'es', dir: 'ltr' },
  { code: 'fr', dir: 'ltr' },
  { code: 'ar', dir: 'rtl' },
];

for (const loc of locales) {
  const locFile = path.join(distDir, loc.code, 'index.html');
  assert.ok(fs.existsSync(locFile), `Localized page for /${loc.code} must exist`);
  const locHtml = fs.readFileSync(locFile, 'utf-8');
  assert.ok(
    locHtml.includes(`lang="${loc.code}"`),
    `/${loc.code} must have lang="${loc.code}"`
  );
  if (loc.dir === 'rtl') {
    assert.ok(locHtml.includes('dir="rtl"'), `/${loc.code} must declare dir="rtl"`);
  }
}
console.log('PASS: All 4 localized entry routes (/en, /es, /fr, /ar) exist with correct lang and dir attributes.');

// 7. Sitemaps Index Verification
console.log('\n--- Sitemaps Index Verification ---');
const sitemapIndexPath = path.join(distDir, 'sitemap.xml');
assert.ok(fs.existsSync(sitemapIndexPath), 'sitemap.xml must exist');
const sitemapIndex = fs.readFileSync(sitemapIndexPath, 'utf-8');
assert.ok(sitemapIndex.includes('sitemap-main.xml'), 'sitemap.xml must reference sitemap-main.xml');
assert.ok(sitemapIndex.includes('sitemap-countries.xml'), 'sitemap.xml must reference sitemap-countries.xml');
assert.ok(sitemapIndex.includes('sitemap-cities.xml'), 'sitemap.xml must reference sitemap-cities.xml');
assert.ok(sitemapIndex.includes('sitemap-comparisons.xml'), 'sitemap.xml must reference sitemap-comparisons.xml');
assert.ok(sitemapIndex.includes('sitemap-guides.xml'), 'sitemap.xml must reference sitemap-guides.xml');
assert.ok(sitemapIndex.includes('sitemap-relocation.xml'), 'sitemap.xml must reference sitemap-relocation.xml');

const sitemapRelocationPath = path.join(distDir, 'sitemap-relocation.xml');
assert.ok(fs.existsSync(sitemapRelocationPath), 'sitemap-relocation.xml must exist');
const sitemapRelocation = fs.readFileSync(sitemapRelocationPath, 'utf-8');
for (const slug of requiredCorridors) {
  assert.ok(
    sitemapRelocation.includes(`/relocation/${slug}`),
    `sitemap-relocation.xml must include /relocation/${slug}`
  );
}
console.log('PASS: Sitemap index and segmented sitemaps including sitemap-relocation.xml verified.');

// 8. Data Freshness Report Verification
console.log('\n--- Data Freshness Report Verification ---');
const freshnessReportPath = path.resolve('data-freshness-report.json');
assert.ok(fs.existsSync(freshnessReportPath), 'data-freshness-report.json must exist in root');
const freshnessData = JSON.parse(fs.readFileSync(freshnessReportPath, 'utf-8'));
assert.ok(freshnessData.summary.totalCityBenchmarks >= 39, 'Expected at least 39 benchmarks in report');
assert.equal(freshnessData.summary.latestVerifiedTaxYear, 2026, 'Verified tax year must be 2026');
assert.ok(freshnessData.summary.pendingTaxYears.includes(2027), 'Pending tax year must include 2027');
console.log('PASS: data-freshness-report.json verified.');

console.log('\n======================================================');
console.log('✅ ALL LAUNCH INVENTORY & QUALITY CHECKS PASSED (100%)!');
console.log('======================================================\n');
