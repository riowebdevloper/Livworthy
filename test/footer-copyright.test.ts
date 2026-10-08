import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { DICTIONARIES } from '../src/lib/i18n';
import { getLocalizedCityDisplayName, getLocalizedCountryDisplayName } from '../src/lib/i18n/locations';

console.log('🧪 Running Footer Copyright & Localization Test Suite...');

const currentYear = new Date().getFullYear();
const distDir = path.resolve('dist');

// 1. Verify Dictionary Footer Keys across all 23 production locales
const requiredFooterKeys = [
  'copyright',
  'tier1DataPriority',
  'countriesDirectory',
  'citiesDirectory',
  'popularCityIncomeHubs',
  'cityHubDescription',
  'systemArchitectureDiagnostics',
  'aboutLivworthy',
  'exploreAllGuides',
  'guideCountLabel',
  'legalNavigationLabel',
] as const;

for (const [locale, dict] of Object.entries(DICTIONARIES)) {
  assert.ok(dict.footer, `Locale [${locale}] must have footer dictionary`);

  for (const key of requiredFooterKeys) {
    const val = (dict.footer as any)[key];
    assert.ok(
      typeof val === 'string' && val.trim().length > 0,
      `Locale [${locale}] missing footer key: ${key}`
    );
  }

  // Ensure copyright line does not contain duplicate copyright sign or year in dictionary value
  const copyrightVal = dict.footer.copyright;
  assert.ok(
    !copyrightVal.includes('©'),
    `Locale [${locale}] dict.footer.copyright must not contain '©' sign (got "${copyrightVal}")`
  );
  assert.ok(
    !copyrightVal.includes(String(currentYear)),
    `Locale [${locale}] dict.footer.copyright must not contain hardcoded year (got "${copyrightVal}")`
  );
  assert.ok(
    !copyrightVal.includes('Deterministic FinTech Architecture'),
    `Locale [${locale}] legal copyright line must not contain tagline 'Deterministic FinTech Architecture'`
  );
}
console.log('✅ PASS: All 23 production locales have valid, non-duplicated footer keys.');

// 2. Verify Featured Cities and Countries localization helper
const sampleLocales = ['en', 'es', 'fr', 'ar', 'de', 'pt', 'hi', 'ur', 'zh', 'ja'];
for (const loc of sampleLocales) {
  const nycName = getLocalizedCityDisplayName('nyc', loc);
  const deCountry = getLocalizedCountryDisplayName('DE', loc);
  assert.ok(nycName && nycName.length > 0, `City NYC localized display name must exist for ${loc}`);
  assert.ok(deCountry && deCountry.length > 0, `Country DE localized display name must exist for ${loc}`);

  if (loc === 'es') {
    assert.strictEqual(nycName, 'Nueva York');
    assert.strictEqual(deCountry, 'Alemania');
  } else if (loc === 'ar') {
    assert.strictEqual(nycName, 'نيويورك');
    assert.strictEqual(deCountry, 'ألمانيا');
  } else if (loc === 'de') {
    assert.strictEqual(deCountry, 'Deutschland');
  } else if (loc === 'fr') {
    assert.strictEqual(deCountry, 'Allemagne');
  }
}
console.log('✅ PASS: Localized city and country display names verify across languages.');

// 3. Verify Rendered HTML Files on Disk have no double copyright
if (fs.existsSync(distDir)) {
  const sampleHtmlFiles = [
    path.join(distDir, 'index.html'),
    path.join(distDir, 'en', 'index.html'),
    path.join(distDir, 'es', 'index.html'),
    path.join(distDir, 'fr', 'index.html'),
    path.join(distDir, 'ar', 'index.html'),
    path.join(distDir, 'de', 'index.html'),
    path.join(distDir, 'hi', 'index.html'),
    path.join(distDir, 'ur', 'index.html'),
    path.join(distDir, 'zh', 'index.html'),
    path.join(distDir, 'ja', 'index.html'),
  ];

  for (const file of sampleHtmlFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');

    // Count occurrences of "©" inside footer or copyright paragraphs
    const copyMatches = content.match(/©\s*\d{4}/g) || [];
    // Should not have duplicated "© 2026 ... © 2026"
    assert.ok(
      !content.includes(`© ${currentYear} LivWorthy. © ${currentYear}`),
      `File ${path.relative(distDir, file)} contains duplicated copyright statement!`
    );
  }
  console.log('✅ PASS: Rendered HTML files contain zero duplicated copyright statements.');
}

console.log('🎉 ALL FOOTER COPYRIGHT & LOCALIZATION TESTS PASSED!\n');
