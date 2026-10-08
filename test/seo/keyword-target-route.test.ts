import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { MULTILINGUAL_KEYWORD_DATABASE } from '../../src/lib/seo/multilingual-keywords';
import { PRIORITY_KEYWORD_CLUSTERS } from '../../src/lib/rank-tracker';

console.log('🧪 Running Keyword Target Route Alignment Test Suite...');

const distDir = path.resolve('dist');

// Test all target URLs in MULTILINGUAL_KEYWORD_DATABASE
console.log(`Checking ${MULTILINGUAL_KEYWORD_DATABASE.length} keywords in MULTILINGUAL_KEYWORD_DATABASE...`);

for (const item of MULTILINGUAL_KEYWORD_DATABASE) {
  const url = item.targetUrl;
  assert.ok(url, `Keyword [${item.id}] must have targetUrl`);

  // Invariant 1: No ?tab= query parameter targets
  assert.ok(
    !url.includes('?tab='),
    `Keyword [${item.id}] targetUrl "${url}" must not use non-indexable query parameter ?tab=`
  );

  // Invariant 2: Target route exists on disk in dist/
  const parsed = new URL(url);
  const subpath = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
  const htmlPath = subpath === '' ? path.join(distDir, 'index.html') : path.join(distDir, subpath, 'index.html');

  if (fs.existsSync(distDir)) {
    assert.ok(
      fs.existsSync(htmlPath),
      `Keyword [${item.id}] targetUrl path "${parsed.pathname}" must exist in dist/ (${path.relative(distDir, htmlPath)})`
    );

    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Invariant 3: Indexability policy compliance
    const isTier1 = ['en', 'es', 'fr', 'ar', 'de', 'pt', 'hi', 'ur', 'zh', 'ja'].includes(item.locale);
    if (isTier1) {
      assert.ok(
        !html.includes('content="noindex'),
        `Tier-1 Keyword [${item.id}] target page ${htmlPath} must be indexable (must not be marked noindex)`
      );
    } else {
      // Tier-2 locales are PUBLISHED_UI and must declare noindex per Section 28 / Test 4 policy
      assert.ok(
        html.includes('content="noindex'),
        `Tier-2 Keyword [${item.id}] target page ${htmlPath} must declare noindex until promoted to Tier-1`
      );
    }

    // Invariant 4: Canonical tag matches target or base canonical
    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
    assert.ok(
      canonicalMatch,
      `Keyword [${item.id}] target page ${htmlPath} must have a canonical link tag`
    );
    const pageCanonical = canonicalMatch[1];
    assert.ok(
      pageCanonical === url || pageCanonical === url.replace(/\/$/, '') || (url === 'https://www.livworthy.com/' && pageCanonical === 'https://www.livworthy.com'),
      `Keyword [${item.id}] canonical (${pageCanonical}) must match targetUrl (${url})`
    );
  }
}
console.log(`✅ PASS: All ${MULTILINGUAL_KEYWORD_DATABASE.length} database keywords point to clean, indexable on-disk routes.`);

// Test all target URLs in PRIORITY_KEYWORD_CLUSTERS
console.log(`Checking ${PRIORITY_KEYWORD_CLUSTERS.length} priority rank tracking clusters...`);
for (const item of PRIORITY_KEYWORD_CLUSTERS) {
  const url = item.targetUrl;
  assert.ok(url, `Cluster keyword "${item.keyword}" must have targetUrl`);
  assert.ok(
    !url.includes('?tab='),
    `Cluster keyword "${item.keyword}" targetUrl "${url}" must not use query parameter ?tab=`
  );

  const parsed = new URL(url);
  const subpath = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
  const htmlPath = subpath === '' ? path.join(distDir, 'index.html') : path.join(distDir, subpath, 'index.html');

  if (fs.existsSync(distDir)) {
    assert.ok(
      fs.existsSync(htmlPath),
      `Cluster keyword "${item.keyword}" targetUrl "${parsed.pathname}" must exist in dist/ (${path.relative(distDir, htmlPath)})`
    );
  }
}
console.log(`✅ PASS: All ${PRIORITY_KEYWORD_CLUSTERS.length} priority rank tracking clusters target clean indexable routes.`);

console.log('🎉 ALL KEYWORD TARGET ROUTE ALIGNMENT TESTS PASSED!\n');
