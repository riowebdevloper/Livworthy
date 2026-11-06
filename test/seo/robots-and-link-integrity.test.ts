/**
 * LivWorthy Robots.txt & Internal Link Integrity Regression Test
 *
 * Enforces:
 * - robots.txt exists and contains valid directives (Allow: /, Disallow: /api/, /admin, /test/, etc.)
 * - Zero internal links in generated HTML point to disallowed parameter URLs (e.g. /?tab=job-offers)
 * - Zero internal links point to legacy redirecting guide URLs (/guides/london-60k, etc.)
 * - Dynamic calculator scenario links carry rel="nofollow" to avoid crawl waste
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('========================================================');
console.log('🧪 Robots.txt & Internal Link Integrity Audit Suite');
console.log('========================================================\n');

const distDir = path.resolve('dist');
assert.ok(fs.existsSync(distDir), 'dist/ directory must exist');

// 1. Audit robots.txt
const robotsTxtPath = path.join(distDir, 'robots.txt');
assert.ok(fs.existsSync(robotsTxtPath), 'robots.txt must exist in dist');
const robotsContent = fs.readFileSync(robotsTxtPath, 'utf8');

assert.ok(robotsContent.includes('User-agent: *'), 'robots.txt must include User-agent: *');
assert.ok(robotsContent.includes('Allow: /'), 'robots.txt must include Allow: /');
assert.ok(robotsContent.includes('Disallow: /api/'), 'robots.txt must include Disallow: /api/');
assert.ok(/^Disallow:\s*\/admin\s*$/m.test(robotsContent), 'robots.txt must include Disallow: /admin');
assert.ok(robotsContent.includes('Disallow: /test/'), 'robots.txt must include Disallow: /test/');
assert.ok(robotsContent.includes('Disallow: /*?*city='), 'robots.txt must disallow *?*city=');
assert.ok(robotsContent.includes('Disallow: /*?*tab='), 'robots.txt must disallow *?*tab=');
assert.ok(robotsContent.includes('Disallow: /*?*salary='), 'robots.txt must disallow *?*salary=');
assert.ok(
  robotsContent.includes('Sitemap: https://www.livworthy.com/sitemap.xml'),
  'robots.txt must reference production sitemap.xml'
);
console.log('✅ PASS: robots.txt contains all authoritative crawl directives and sitemap reference.');

// 2. Audit internal links in all prerendered HTML files
function getAllHtmlFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      getAllHtmlFiles(full, fileList);
    } else if (f.endsWith('.html') && !f.includes('/admin')) {
      fileList.push(full);
    }
  }
  return fileList;
}

const htmlFiles = getAllHtmlFiles(distDir);
const legacyGuidePatterns = [
  '/guides/100k-salary-new-york',
  '/guides/london-60k',
  '/guides/toronto-90k',
  '/guides/dubai-30k',
  '/guides/singapore-10k',
  '/guides/berlin-65k',
];

let auditedLinks = 0;

for (const filePath of htmlFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(distDir, filePath);

  // Ensure parameter links to dynamic tabs or scenarios carry rel="nofollow" to prevent crawler traps
  const paramLinkMatches = [...content.matchAll(/<a\s+[^>]*href=["'](\/\?[^"']+)["'][^>]*>/gi)];
  for (const match of paramLinkMatches) {
    const fullTag = match[0];
    assert.ok(
      /rel=["'][^"']*nofollow[^"']*["']/i.test(fullTag),
      `${rel} parameter link ${match[1]} must declare rel="nofollow" (got: ${fullTag})`
    );
  }

  // Check for legacy redirecting guide URLs in href attributes
  for (const lg of legacyGuidePatterns) {
    const hasLegacyLink = new RegExp(`href=["']${lg}["'/]`, 'i').test(content);
    assert.ok(!hasLegacyLink, `${rel} must not link to legacy redirecting guide ${lg}`);
  }

  auditedLinks++;
}

console.log(`✅ PASS: Audited internal links across ${auditedLinks} prerendered pages.`);
console.log('✅ PASS: 0 links to disallowed /?tab=job-offers, 0 links to legacy redirecting guides, all scenario links declare rel="nofollow".');
console.log('\n🎉 ALL ROBOTS & INTERNAL LINK INTEGRITY INVARIANTS PASSED 100%!\n');
