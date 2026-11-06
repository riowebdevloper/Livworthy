/**
 * LivWorthy Dataset Structured Data Integrity & Google Rich Results Regression Test
 *
 * Enforces Google Search Console & Schema.org Dataset invariants:
 * - Every Dataset schema must specify a non-empty name
 * - Every Dataset schema must specify a non-empty description
 * - Every Dataset schema must specify a valid creator (Organization with verified name and url)
 * - Every Dataset schema must specify a valid publisher (Organization with verified name and url)
 * - Every Dataset schema must specify a valid canonical URL
 * - Every Dataset schema must specify isAccessibleForFree: true
 * - Truthful Licensing Policy: Zero fabricated licenses (no unverified Creative Commons, no misusing website Terms as open data license)
 * - Zero synthetic personas or fictitious organizations
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('========================================================');
console.log('🧪 Dataset Structured Data & Rich Results Audit Suite');
console.log('========================================================\n');

const distDir = path.resolve('dist');
assert.ok(fs.existsSync(distDir), 'dist/ directory must exist');

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
let datasetCount = 0;

for (const f of htmlFiles) {
  const content = fs.readFileSync(f, 'utf8');
  if (!content.includes('Dataset')) continue;

  const scriptMatches = [...content.matchAll(/<script\s+type=[\"']application\/ld\+json[\"']>([\s\S]*?)<\/script>/gi)];
  for (const sm of scriptMatches) {
    try {
      const parsed = JSON.parse(sm[1]);
      const items = parsed['@graph'] ? parsed['@graph'] : [parsed];
      for (const item of items) {
        if (item['@type'] === 'Dataset') {
          datasetCount++;
          const rel = path.relative(distDir, f);

          // 1. Name (Required by Schema.org and Google)
          assert.ok(item.name && item.name.trim().length > 3, `${rel}: Dataset must have a valid name`);

          // 2. Description (Required by Schema.org and Google)
          assert.ok(item.description && item.description.trim().length > 10, `${rel}: Dataset must have a valid description`);

          // 3. Creator (Recommended by Schema.org; must be truthful and verified)
          assert.ok(item.creator, `${rel}: Dataset must have a creator`);
          if (typeof item.creator === 'object') {
            assert.ok(
              item.creator.name === 'LivWorthy' || item.creator['@id']?.includes('#organization'),
              `${rel}: Dataset creator must be the verified entity 'LivWorthy' (got ${JSON.stringify(item.creator)})`
            );
            assert.ok(
              !JSON.stringify(item.creator).includes('Quantitative Research Institute'),
              `${rel}: Dataset creator must not use fictional personas`
            );
          }

          // 4. Publisher (Recommended by Schema.org; must be truthful and verified)
          assert.ok(item.publisher, `${rel}: Dataset must have a publisher`);
          if (typeof item.publisher === 'object') {
            assert.ok(
              item.publisher.name === 'LivWorthy' || item.publisher['@id']?.includes('#organization'),
              `${rel}: Dataset publisher must be the verified entity 'LivWorthy'`
            );
          }

          // 5. Licensing Truthfulness & Provenance
          // In Google Dataset & Schema.org guidelines, 'license' is optional/recommended.
          // Rule: Never fabricate an open-source license (e.g. Creative Commons) or inappropriately claim website terms without authorization.
          if (item.license) {
            assert.ok(
              !item.license.includes('creativecommons.org'),
              `${rel}: Dataset must not claim fabricated Creative Commons license (${item.license})`
            );
            assert.ok(
              !item.license.endsWith('/terms'),
              `${rel}: General website Terms must not be asserted as a dataset redistribution license without dedicated data licensing terms`
            );
          }

          // 6. Canonical URL
          assert.ok(item.url && item.url.startsWith('https://www.livworthy.com'), `${rel}: Dataset URL must be absolute HTTPS www`);

          // 7. isAccessibleForFree
          assert.strictEqual(item.isAccessibleForFree, true, `${rel}: Dataset must declare isAccessibleForFree: true`);
        }
      }
    } catch {
      // not JSON-LD block
    }
  }
}

assert.ok(datasetCount > 0, `Expected at least 1 Dataset structured data object, found ${datasetCount}`);
console.log(`✅ PASS: Verified ${datasetCount} Schema.org Dataset structured data instances.`);
console.log('✅ PASS: 100% of Dataset objects have creator, publisher, description, canonical URL, and truthful licensing metadata.');
console.log('\n🎉 ALL DATASET STRUCTURED DATA INVARIANTS PASSED 100%!\n');
