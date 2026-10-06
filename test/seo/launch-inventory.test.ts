import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';
import { COUNTRIES, CITIES } from '../../src/data/locations';
import { POPULAR_GUIDES_LIST } from '../../src/data/salary-guides';
import { TaxRegistry } from '../../src/engines/tax/tax-registry';

const dist = path.resolve('dist');
const sitemapFiles = [
  'sitemap-main.xml',
  'sitemap-countries.xml',
  'sitemap-cities.xml',
  'sitemap-comparisons.xml',
  'sitemap-guides.xml',
];

const urls = new Set<string>();
for (const file of sitemapFiles) {
  const xml = fs.readFileSync(path.join(dist, file), 'utf8');
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(match[1]);
}

assert.ok(urls.size >= 100, `launch inventory must contain at least 100 unique indexable URLs; got ${urls.size}`);
assert.ok(Object.keys(COUNTRIES).length >= 39, 'global inventory must retain at least 39 commercial markets');
assert.ok(Object.keys(CITIES).length >= 58, 'global inventory must retain at least 58 registered cities');
assert.ok(POPULAR_GUIDES_LIST.length >= 36, 'salary-guide inventory must retain at least 36 guides');
assert.equal(TaxRegistry.getSupportedCountryIds().length, 15, '15 jurisdictions must retain executable tax adapters');
assert.equal(TaxRegistry.getCommercialMarketIds().length, 39, 'tax registry must describe all 39 commercial markets');

for (const required of [
  'https://www.livworthy.com/coverage',
  'https://www.livworthy.com/relocation',
  'https://www.livworthy.com/en',
  'https://www.livworthy.com/es',
  'https://www.livworthy.com/fr',
  'https://www.livworthy.com/ar',
]) {
  assert.ok(urls.has(required), `launch inventory must contain ${required}`);
}

console.log(`launch-inventory.test.ts: PASS (${urls.size} unique indexable URLs)`);
