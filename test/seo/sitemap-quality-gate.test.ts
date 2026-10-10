/**
 * Automated Test: Sitemap Quality Gate & Zero-Thin Indexability Verification
 *
 * Implements Section 1, 13, 27 of the AdSense Content Quality Execution:
 * - Every URL in every public XML sitemap must satisfy canBeIndexed(page) === true
 * - 0 sitemap URLs may declare noindex
 * - 0 indexable pages may be classified as C_THIN or F_INCOMPLETE
 * - Zero quality gate contradictions
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  canBeIndexed,
  calculateEffectiveWordCount,
  extractMeaningfulHtmlText,
  extractCleanText,
} from '../../src/lib/seo/page-quality-gate';

console.log('======================================================');
console.log('🧪 Sitemap Quality Gate & Zero-Thin Indexability Suite');
console.log('======================================================\n');

const distDir = path.resolve('dist');
assert.ok(fs.existsSync(distDir), 'dist/ directory must exist');

// 1. Collect all URLs from all sitemap XML files
const sitemapUrls = new Set<string>();
const sitemapFiles = fs
  .readdirSync(distDir)
  .filter((f) => f.startsWith('sitemap') && f.endsWith('.xml') && f !== 'sitemap.xml');

assert.ok(sitemapFiles.length >= 10, `Expected at least 10 sitemap files, found ${sitemapFiles.length}`);

for (const smFile of sitemapFiles) {
  const content = fs.readFileSync(path.join(distDir, smFile), 'utf-8');
  const matches = content.match(/<loc>(.*?)<\/loc>/g);
  if (matches) {
    for (const m of matches) {
      const url = m.replace(/<\/?loc>/g, '').trim();
      sitemapUrls.add(url);
    }
  }
}

console.log(`Found ${sitemapUrls.size} unique URLs across ${sitemapFiles.length} sitemaps.`);

// 2. Audit each sitemap URL against canBeIndexed and ensure 200 OK HTML on disk
let passedQualityGateCount = 0;
let sitemapNoindexViolations = 0;

for (const url of sitemapUrls) {
  const urlObj = new URL(url);
  const relPath = urlObj.pathname.replace(/^\//, '');
  const htmlPath = relPath === '' ? path.join(distDir, 'index.html') : path.join(distDir, relPath, 'index.html');

  assert.ok(fs.existsSync(htmlPath), `Sitemap URL [${url}] does not exist on disk at ${htmlPath}`);

  const html = fs.readFileSync(htmlPath, 'utf-8');

  // Verify robots directive
  const robotsMatch = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
  const isNoindex = robotsMatch && robotsMatch[1].toLowerCase().includes('noindex');
  if (isNoindex) {
    sitemapNoindexViolations++;
    console.error(`❌ VIOLATION: Sitemap URL has noindex: ${url}`);
  }

  // Canonical tag check
  const canonMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const canonical = canonMatch ? canonMatch[1] : '';
  assert.strictEqual(canonical, url, `Canonical URL mismatch on ${url}: got ${canonical}`);

  // Title tag check
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // H1 tag check
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1Match ? extractCleanText(h1Match[1]) : '';

  // Meta description check
  const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i);
  const description = descMatch ? descMatch[1].trim() : '';

  const meaningfulText = extractMeaningfulHtmlText(html);
  const meaningfulWords = calculateEffectiveWordCount(meaningfulText);

  let pageType = 'general';
  if (relPath.includes('cities/')) pageType = 'city-intelligence';
  else if (relPath.includes('countries/')) pageType = 'country-intelligence';
  else if (relPath.includes('salary-worth') || relPath.includes('salary-needed') || relPath.includes('salary-after-tax') || relPath.includes('cost-of-living') || relPath.includes('compare') || relPath.includes('job-offers')) pageType = 'calculator-tool';
  else if (relPath.includes('guides/')) pageType = 'salary-guide';
  else if (relPath.includes('relocation/')) pageType = 'relocation-corridor';
  else if (relPath.includes('reports/')) pageType = 'empirical-report';

  const gateResult = canBeIndexed({
    url,
    relativePath: relPath,
    title,
    description,
    h1Text,
    robots: isNoindex ? 'noindex, follow' : 'index, follow',
    meaningfulWords,
    pageType,
  });

  assert.ok(
    gateResult.canBeIndexed,
    `Sitemap URL [${url}] failed quality gate: ${gateResult.reasons.join(', ')}`
  );
  passedQualityGateCount++;
}

assert.strictEqual(sitemapNoindexViolations, 0, 'Sitemap must contain 0 noindex URLs');
console.log(`✅ PASS: All ${passedQualityGateCount} sitemap URLs satisfy canBeIndexed === true (0 noindex violations)`);

// 3. Verify that zero indexable pages in dist/ are C_THIN or F_INCOMPLETE
const auditReportPath = path.resolve('reports', 'adsense-content-audit.json');
if (fs.existsSync(auditReportPath)) {
  const auditData = JSON.parse(fs.readFileSync(auditReportPath, 'utf-8'));
  assert.strictEqual(auditData.summary.indexableThinCount, 0, 'Indexable C_THIN count must be exactly 0');
  assert.strictEqual(auditData.summary.indexableIncompleteCount, 0, 'Indexable F_INCOMPLETE count must be exactly 0');
  assert.strictEqual(auditData.summary.sitemapNoindexCount, 0, 'Sitemap noindex contradictions must be exactly 0');
  assert.strictEqual(auditData.summary.finalStatus, 'READY_FOR_RESUBMISSION', 'Audit status must be READY_FOR_RESUBMISSION');
  console.log(`✅ PASS: Audit report confirms indexable C_THIN = 0, F_INCOMPLETE = 0, status = READY_FOR_RESUBMISSION`);
}

console.log('\n🎉 ALL SITEMAP QUALITY GATE TESTS PASSED 100%!\n');
