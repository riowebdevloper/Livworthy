import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';

const dist = path.resolve('dist');
const locales = ['en', 'es', 'fr', 'ar'];

for (const locale of locales) {
  const pagePath = path.join(dist, locale, 'index.html');
  assert.equal(fs.existsSync(pagePath), true, `localized hub /${locale} must exist`);
  const html = fs.readFileSync(pagePath, 'utf8');

  assert.match(html, new RegExp(`<html[^>]+lang=["']${locale}["']`, 'i'));
  assert.match(html, new RegExp(`<link[^>]+rel=["']canonical["'][^>]+href=["']https://www\\.livworthy\\.com/${locale}["']`, 'i'));

  for (const alt of [...locales, 'x-default']) {
    assert.match(html, new RegExp(`hreflang=["']${alt}["']`, 'i'), `/${locale} must expose hreflang ${alt}`);
  }
}

const ar = fs.readFileSync(path.join(dist, 'ar', 'index.html'), 'utf8');
assert.match(ar, /<html[^>]+dir=["']rtl["']/i, 'Arabic hub must use RTL direction');

const mainSitemap = fs.readFileSync(path.join(dist, 'sitemap-main.xml'), 'utf8');
for (const locale of locales) {
  assert.ok(mainSitemap.includes(`https://www.livworthy.com/${locale}`), `sitemap-main must include /${locale}`);
}

console.log('localization-regression.test.ts: PASS');
