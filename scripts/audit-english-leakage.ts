/**
 * LivWorthy Automated English Leakage Audit Engine
 *
 * Implements Section 25:
 * - Scans localized dictionaries and long-form content for unexpected English strings
 * - Employs a strict whitelist for brand names, currency symbols, and statutory acronyms
 * - Reports leakage counts per locale with clear diagnostic locations
 */

import fs from 'fs';
import path from 'path';
import { DICTIONARIES, TIER_1_LOCALES, TIER_2_LOCALES, SupportedLocale } from '../src/lib/i18n';
import { LOCALIZED_CITIES } from '../src/lib/i18n/content/cities';
import { LOCALIZED_COUNTRIES } from '../src/lib/i18n/content/countries';
import { LOCALIZED_GUIDES } from '../src/lib/i18n/content/guides';

// Whitelist of valid terms that may legally appear across languages without constituting "leakage"
const WHITELIST = new Set([
  'LivWorthy',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'CAD',
  'AUD',
  'SGD',
  'CHF',
  'INR',
  'JPY',
  'IRS',
  'HMRC',
  'FICA',
  'PAYE',
  'NYC',
  'SF',
  'LA',
  'HUD',
  '2026',
  '2027',
  'JSON',
  'CSV',
  'API',
  'ID',
  'FAQ',
  'VAT',
  '100k',
  '150k',
  '200k',
  '300k',
  '500k',
  'AEO',
  'GEO',
  'SEO',
  'A+',
]);

// Typical English function words whose presence in non-English text indicates raw English prose copy-paste
const SUSPICIOUS_ENGLISH_WORDS = [
  'the',
  'and',
  'with',
  'from',
  'your',
  'this',
  'that',
  'salary',
  'after',
  'living',
  'taxes',
  'calculate',
  'monthly',
  'annual',
  'breakdown',
  'housing',
  'expenses',
];

interface LeakageFinding {
  locale: string;
  location: string;
  key: string;
  suspiciousText: string;
  matchedWords: string[];
}

export class EnglishLeakageAuditor {
  public static auditLocale(locale: string): {
    locale: string;
    totalChecked: number;
    leakageCount: number;
    findings: LeakageFinding[];
  } {
    if (locale === 'en') {
      return { locale: 'en', totalChecked: 0, leakageCount: 0, findings: [] };
    }

    const dict = DICTIONARIES[locale];
    const enDict = DICTIONARIES.en;
    const findings: LeakageFinding[] = [];
    let totalChecked = 0;

    if (!dict) {
      return { locale, totalChecked: 0, leakageCount: 0, findings: [] };
    }

    // Helper to recursively inspect object strings
    function inspectObject(obj: any, enObj: any, prefix: string) {
      for (const key of Object.keys(obj || {})) {
        const val = obj[key];
        const enVal = enObj?.[key];
        const path = prefix ? `${prefix}.${key}` : key;

        if (typeof val === 'string') {
          totalChecked++;
          const trimmed = val.trim();
          const enTrimmed = typeof enVal === 'string' ? enVal.trim() : '';

          // If non-empty, longer than 6 chars, and identical to English baseline
          if (trimmed.length > 6 && trimmed === enTrimmed && !WHITELIST.has(trimmed)) {
            // Check if it contains suspicious English grammar words
            const words = trimmed.toLowerCase().split(/\W+/);
            const suspicious = words.filter((w) => SUSPICIOUS_ENGLISH_WORDS.includes(w));
            if (suspicious.length >= 2) {
              findings.push({
                locale,
                location: 'Dictionary',
                key: path,
                suspiciousText: trimmed.length > 60 ? trimmed.substring(0, 57) + '...' : trimmed,
                matchedWords: suspicious,
              });
            }
          }
        } else if (typeof val === 'object' && val !== null) {
          inspectObject(val, enVal, path);
        }
      }
    }

    inspectObject(dict, enDict, '');

    // Also inspect localized content repositories for this locale
    for (const [cityId, cityLocales] of Object.entries(LOCALIZED_CITIES)) {
      const cityContent = cityLocales[locale];
      const enCity = cityLocales.en;
      if (cityContent && enCity) {
        totalChecked++;
        if (
          cityContent.intro === enCity.intro &&
          cityContent.intro.length > 20 &&
          locale !== 'en'
        ) {
          findings.push({
            locale,
            location: `CityContent:${cityId}`,
            key: 'intro',
            suspiciousText: cityContent.intro,
            matchedWords: ['identical_to_en'],
          });
        }
      }
    }

    // Also scan rendered HTML in dist for this locale if dist exists
    const distDir = path.resolve('dist');
    const locDir = path.join(distDir, locale);
    if (fs.existsSync(locDir)) {
      const htmlFiles = findHtmlFiles(locDir);
      for (const htmlFile of htmlFiles) {
        totalChecked++;
        const raw = fs.readFileSync(htmlFile, 'utf-8');
        const clean = raw
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ');

        const sentences = clean.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 25);
        for (const sentence of sentences) {
          const words = sentence.toLowerCase().split(/\W+/);
          const matchedWords = words.filter((w) => SUSPICIOUS_ENGLISH_WORDS.includes(w));
          if (matchedWords.length >= 4) {
            findings.push({
              locale,
              location: `HTML:${path.relative(distDir, htmlFile)}`,
              key: 'visible_text',
              suspiciousText: sentence.length > 80 ? sentence.substring(0, 77) + '...' : sentence,
              matchedWords,
            });
            break; // One per file is sufficient to flag the file
          }
        }
      }
    }

    return {
      locale,
      totalChecked,
      leakageCount: findings.length,
      findings,
    };
  }
}

function findHtmlFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function run() {
  console.log('======================================================');
  console.log('🔍 LivWorthy Automated English Leakage & HTML Audit');
  console.log('======================================================\n');

  const localesToAudit = [...TIER_1_LOCALES, ...TIER_2_LOCALES].filter((l) => l !== 'en');
  let totalLeakages = 0;

  for (const loc of localesToAudit) {
    const report = EnglishLeakageAuditor.auditLocale(loc);
    if (report.leakageCount === 0) {
      console.log(`✅ [${loc}] Clean — 0 English leakage incidents across ${report.totalChecked} inspected items.`);
    } else {
      console.warn(`⚠️ [${loc}] ${report.leakageCount} suspicious English strings detected:`);
      for (const finding of report.findings.slice(0, 3)) {
        console.warn(`    • ${finding.location} [${finding.key}]: "${finding.suspiciousText}"`);
      }
      if (report.findings.length > 3) {
        console.warn(`    ... and ${report.findings.length - 3} more.`);
      }
      totalLeakages += report.leakageCount;
    }
  }

  console.log(`\n======================================================`);
  console.log(`Audit Finished. Total Leakage Incidents: ${totalLeakages}`);
  console.log(`======================================================\n`);
}

if (process.argv[1]?.endsWith('audit-english-leakage.ts')) {
  run().catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
}
