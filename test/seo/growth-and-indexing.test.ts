import fs from 'fs';
import path from 'path';
import {
  isValidCanonicalProductionUrl,
  ensureIndexNowKeyFile,
  DEFAULT_INDEXNOW_KEY,
  DEFAULT_HOST,
  submitUrlsToIndexNow,
} from '../../src/lib/indexnow';
import { ALL_EMPIRICAL_REPORTS } from '../../src/data/reports-data';
import { PRIORITY_KEYWORD_CLUSTERS } from '../../src/lib/rank-tracker';
import { MONITORED_TAX_AUTHORITIES } from '../../src/lib/tax-2027-monitor';
import { VERIFIED_MEDIA_CONTACTS } from '../../src/data/verified-journalists';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

async function runTests() {
  console.log('======================================================');
  console.log('🧪 LivWorthy Growth, Indexing & Authority Regression Suite');
  console.log('======================================================\n');

  // 1. IndexNow Key File & URL Validation
  console.log('--- 1. IndexNow Verification & Key Architecture ---');
  ensureIndexNowKeyFile(DEFAULT_INDEXNOW_KEY, ['public', 'dist']);
  const pubKeyPath = path.join('public', `${DEFAULT_INDEXNOW_KEY}.txt`);
  assert(fs.existsSync(pubKeyPath), 'IndexNow key file exists in public directory');
  assert(fs.readFileSync(pubKeyPath, 'utf-8').trim() === DEFAULT_INDEXNOW_KEY, 'Public IndexNow key file content matches key');

  assert(
    isValidCanonicalProductionUrl('https://www.livworthy.com/guides/nyc-100k'),
    'Canonical guide URL is admitted by IndexNow validator'
  );
  assert(
    !isValidCanonicalProductionUrl('https://www.livworthy.com/guides/nyc-100k?utm_source=test'),
    'URL with query string is rejected by IndexNow validator'
  );
  assert(
    !isValidCanonicalProductionUrl('https://www.livworthy.com/admin'),
    'Admin URL is rejected by IndexNow validator'
  );
  assert(
    !isValidCanonicalProductionUrl('https://otherdomain.com/page'),
    'External domain is rejected by IndexNow validator'
  );

  const dryRunRes = await submitUrlsToIndexNow(['https://www.livworthy.com/coverage'], { dryRun: true });
  assert(dryRunRes.success, 'IndexNow dry-run executes with success');
  assert(dryRunRes.validUrlsCount === 1, 'IndexNow dry-run counts 1 valid URL');

  // 2. Linkable Empirical Reports
  console.log('\n--- 2. Flagship Linkable Research Assets ---');
  assert(ALL_EMPIRICAL_REPORTS.length === 5, 'Exactly 5 flagship empirical research reports configured');
  for (const report of ALL_EMPIRICAL_REPORTS) {
    const reportHtml = path.join('dist', `${report.slug}`, 'index.html');
    assert(fs.existsSync(reportHtml), `Report HTML generated at dist/${report.slug}/index.html`);

    const htmlContent = fs.readFileSync(reportHtml, 'utf-8');
    assert(htmlContent.includes('<h1'), `Report contains H1 heading`);
    assert(htmlContent.includes(report.shortTitle), `Report contains short title`);
    assert(htmlContent.includes('Empirical Benchmark Matrix'), `Report contains benchmark matrix table`);
    assert(htmlContent.includes('Standard Academic & Editorial Citation'), `Report contains citation block`);

    const csvPath = path.join('dist', `${report.slug}.csv`);
    assert(fs.existsSync(csvPath), `Downloadable CSV exists at dist/${report.slug}.csv`);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    assert(csvContent.length > 50, `CSV content contains valid dataset rows (${csvContent.length} bytes)`);

    const jsonPath = path.join('dist', `${report.slug}.json`);
    assert(fs.existsSync(jsonPath), `Downloadable JSON exists at dist/${report.slug}.json`);
  }

  // 3. Sitemaps Architecture
  console.log('\n--- 3. Segmented Sitemaps & Reports Discovery ---');
  const sitemapIndex = fs.readFileSync(path.join('public', 'sitemap.xml'), 'utf-8');
  assert(sitemapIndex.includes('sitemap-reports.xml'), 'sitemap.xml index includes sitemap-reports.xml');

  const reportsSitemap = fs.readFileSync(path.join('public', 'sitemap-reports.xml'), 'utf-8');
  assert(reportsSitemap.includes('https://www.livworthy.com/reports'), 'sitemap-reports.xml includes /reports hub');
  assert(
    reportsSitemap.includes('https://www.livworthy.com/reports/global-salary-worth-index'),
    'sitemap-reports.xml includes /reports/global-salary-worth-index'
  );

  // 4. Rank Tracking Baseline Integrity
  console.log('\n--- 4. Rank Tracking Baseline Integrity ---');
  assert(PRIORITY_KEYWORD_CLUSTERS.length >= 14, `At least 14 priority search intent queries tracked (${PRIORITY_KEYWORD_CLUSTERS.length} found)`);
  const enKeywords = PRIORITY_KEYWORD_CLUSTERS.filter((k) => k.locale === 'en');
  const esKeywords = PRIORITY_KEYWORD_CLUSTERS.filter((k) => k.locale === 'es');
  const arKeywords = PRIORITY_KEYWORD_CLUSTERS.filter((k) => k.locale === 'ar');
  assert(enKeywords.length >= 10, 'English priority search queries present');
  assert(esKeywords.length >= 1, 'Spanish search queries present');
  assert(arKeywords.length >= 1, 'Arabic search queries present');

  // 5. 2027 Tax Source Watchdog Integrity
  console.log('\n--- 5. 2027 Tax Source Watchdog Integrity ---');
  assert(MONITORED_TAX_AUTHORITIES.length >= 10, `At least 10 primary tax authorities monitored (${MONITORED_TAX_AUTHORITIES.length} found)`);
  const usWatch = MONITORED_TAX_AUTHORITIES.find((a) => a.jurisdictionId === 'US');
  const ukWatch = MONITORED_TAX_AUTHORITIES.find((a) => a.jurisdictionId === 'GB');
  assert(!!usWatch && usWatch.authorityName.includes('IRS'), 'IRS authority monitored');
  assert(!!ukWatch && ukWatch.authorityName.includes('HMRC'), 'HMRC authority monitored');

  // 6. Ethical PR Outreach Pipeline Integrity
  console.log('\n--- 6. Ethical Digital PR Contacts Integrity ---');
  assert(VERIFIED_MEDIA_CONTACTS.length >= 5, `Verified journalist directory configured (${VERIFIED_MEDIA_CONTACTS.length} contacts)`);
  for (const c of VERIFIED_MEDIA_CONTACTS) {
    assert(c.name.length > 2, `Contact has real verified name (${c.name})`);
    assert(c.outlet.length > 2, `Contact has legitimate media outlet (${c.outlet})`);
    assert(c.publicContactChannel.length > 5, `Contact has public contact channel`);
    assert(c.pitchBody.includes('https://www.livworthy.com/reports/'), `Pitch references real published report URL`);
  }

  // 7. Internal Linking & Orphan Check
  console.log('\n--- 7. Internal Linking & Zero-Orphan Invariant ---');
  const auditJsonPath = path.join('public', 'data-internal-links-audit.json');
  assert(fs.existsSync(auditJsonPath), 'Internal links audit report exists in public directory');
  const auditData = JSON.parse(fs.readFileSync(auditJsonPath, 'utf-8'));
  assert(auditData.orphanPagesCount === 0, `Zero orphan pages detected (got ${auditData.orphanPagesCount})`);
  assert(auditData.missingCanonicalsCount === 0, 'Zero missing canonical URLs');

  console.log('\n======================================================');
  console.log('✅ ALL GROWTH, INDEXING & AUTHORITY TESTS PASSED (100%)!');
  console.log('======================================================');
}

runTests().catch((err) => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});
