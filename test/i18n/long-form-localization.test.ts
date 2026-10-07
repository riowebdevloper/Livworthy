import assert from 'node:assert';
import { createLocalizedLongFormPages } from '../../scripts/localized-long-form-pages';
import { LONG_FORM_LOCALES, LONG_FORM_COPY } from '../../src/lib/i18n/long-form';

console.log('=== Long-form localization regression ===');

const expected = ['en','es','fr','ar','de','pt','hi','ur','zh','ja','it','nl','ko','ru','tr','pl','id','vi','bn','pa','ms','th','tl'];
assert.deepStrictEqual([...LONG_FORM_LOCALES].sort(), [...expected].sort(), '23 production long-form locales must be present');

for (const locale of expected) {
  const copy = LONG_FORM_COPY[locale];
  assert(copy, `long-form copy missing for ${locale}`);
  for (const key of ['rootTitle','rootIntro','countryTitle','countryIntro','cityTitle','cityIntro','guideTitle','guideIntro','relocationTitle','relocationIntro','reportIntro','evidenceNote'] as const) {
    assert(copy[key] && copy[key].trim().length > 3, `${locale}.${key} must be populated`);
  }
}

const pages = createLocalizedLongFormPages('https://www.livworthy.com');
const has = (path: string) => pages.some((p) => p.relativePath === path);

for (const locale of expected) {
  assert(has(`${locale}/countries/us/index.html`), `${locale} country route missing`);
  assert(has(`${locale}/cities/nyc/index.html`), `${locale} city route missing`);
  assert(has(`${locale}/guides/nyc-100k/index.html`), `${locale} guide route missing`);
  assert(has(`${locale}/relocation/new-york-to-london/index.html`), `${locale} relocation route missing`);
  assert(has(`${locale}/reports/global-salary-worth-index/index.html`), `${locale} report route missing`);
}

const arCity = pages.find((p) => p.relativePath === 'ar/cities/dubai/index.html');
assert(arCity && arCity.dir === 'rtl' && arCity.lang === 'ar', 'Arabic long-form route must be RTL');
assert(!arCity!.bodyContent.includes('Salary Worth'), 'Arabic long-form route must not leak English Salary Worth CTA');
assert(!arCity!.bodyContent.includes('Cost of Living'), 'Arabic long-form route must not leak English Cost of Living CTA');

const urCity = pages.find((p) => p.relativePath === 'ur/cities/dubai/index.html');
assert(urCity && urCity.dir === 'rtl' && urCity.lang === 'ur', 'Urdu long-form route must be RTL');

console.log(`✅ PASS: ${pages.length} localized authority pages generated across 23 production locales`);
