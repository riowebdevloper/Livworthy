import fs from 'fs';
import path from 'path';
import { CITY_COL_BENCHMARKS } from '../src/data/city-benchmarks';
import { EVIDENCE_SOURCES } from '../src/data/evidence-registry';
import { LATEST_STATUTORY_TAX_YEAR, TaxRegistry } from '../src/engines/tax/tax-registry';

type Freshness = 'CURRENT' | 'AGING' | 'STALE' | 'UNKNOWN';

const now = new Date();
const strict = process.argv.includes('--strict');

function monthAge(value?: string): number | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;
  return (now.getUTCFullYear() - year) * 12 + (now.getUTCMonth() - (month - 1));
}

function classifyMonths(age: number | null): Freshness {
  if (age === null || age < 0) return 'UNKNOWN';
  if (age <= 18) return 'CURRENT';
  if (age <= 30) return 'AGING';
  return 'STALE';
}

function dateAgeDays(value?: string): number | null {
  if (!value) return null;
  const parsed = new Date(value + (value.length === 10 ? 'T00:00:00Z' : ''));
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.floor((now.getTime() - parsed.getTime()) / 86400000);
}

const cityRows = Object.entries(CITY_COL_BENCHMARKS).map(([cityId, benchmark]) => {
  const ageMonths = monthAge(benchmark.sourceDate);
  return {
    cityId,
    sourceDate: benchmark.sourceDate,
    ageMonths,
    status: classifyMonths(ageMonths),
    evidenceSourceId: benchmark.evidenceSourceId,
  };
});

const evidenceRows = Object.values(EVIDENCE_SOURCES).map((source) => {
  const reviewed =
    (source as any).lastReviewedAt ||
    (source as any).verifiedAt ||
    source.retrievedAt ||
    source.effectiveDate;
  const ageDays = dateAgeDays(reviewed);
  return {
    id: source.id,
    organization: source.organization,
    reviewedAt: reviewed || null,
    ageDays,
    status:
      ageDays === null ? 'UNKNOWN' :
      ageDays <= 365 ? 'CURRENT' :
      ageDays <= 730 ? 'AGING' : 'STALE',
  };
});

const citySummary = {
  total: cityRows.length,
  current: cityRows.filter((row) => row.status === 'CURRENT').length,
  aging: cityRows.filter((row) => row.status === 'AGING').length,
  stale: cityRows.filter((row) => row.status === 'STALE').length,
  unknown: cityRows.filter((row) => row.status === 'UNKNOWN').length,
};

const evidenceSummary = {
  total: evidenceRows.length,
  current: evidenceRows.filter((row) => row.status === 'CURRENT').length,
  aging: evidenceRows.filter((row) => row.status === 'AGING').length,
  stale: evidenceRows.filter((row) => row.status === 'STALE').length,
  unknown: evidenceRows.filter((row) => row.status === 'UNKNOWN').length,
};

const taxCoverage = TaxRegistry.getCommercialMarketIds().map((countryId) => ({
  countryId,
  status: TaxRegistry.getCountryStatus(countryId),
  supportedYears: TaxRegistry.getSupportedTaxYears(countryId),
}));

const report = {
  generatedAt: now.toISOString(),
  latestStatutoryTaxYear: LATEST_STATUTORY_TAX_YEAR,
  currentCalendarYear: now.getUTCFullYear(),
  futureYearVerificationNeeded: now.getUTCFullYear() > LATEST_STATUTORY_TAX_YEAR,
  cityBenchmarks: {
    summary: citySummary,
    stale: cityRows.filter((row) => row.status === 'STALE'),
    aging: cityRows.filter((row) => row.status === 'AGING'),
    unknown: cityRows.filter((row) => row.status === 'UNKNOWN'),
  },
  evidence: {
    summary: evidenceSummary,
    stale: evidenceRows.filter((row) => row.status === 'STALE'),
    unknown: evidenceRows.filter((row) => row.status === 'UNKNOWN'),
  },
  taxCoverage,
};

const outPath = path.resolve('data-freshness-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');

console.log('--- LivWorthy Data Freshness Audit ---');
console.log(`City benchmarks: ${citySummary.current} current, ${citySummary.aging} aging, ${citySummary.stale} stale, ${citySummary.unknown} unknown`);
console.log(`Evidence sources: ${evidenceSummary.current} current, ${evidenceSummary.aging} aging, ${evidenceSummary.stale} stale, ${evidenceSummary.unknown} unknown`);
console.log(`Latest verified statutory tax year: ${LATEST_STATUTORY_TAX_YEAR}`);
if (report.futureYearVerificationNeeded) {
  console.log(`ACTION: calendar year ${now.getUTCFullYear()} is newer than verified tax year ${LATEST_STATUTORY_TAX_YEAR}; statutory verification queue must remain active.`);
}
console.log(`Report: ${outPath}`);

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath) {
  const markdown = [
    '# LivWorthy Data Freshness',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '| Dataset | Current | Aging | Stale | Unknown |',
    '| --- | ---: | ---: | ---: | ---: |',
    `| City benchmarks | ${citySummary.current} | ${citySummary.aging} | ${citySummary.stale} | ${citySummary.unknown} |`,
    `| Evidence sources | ${evidenceSummary.current} | ${evidenceSummary.aging} | ${evidenceSummary.stale} | ${evidenceSummary.unknown} |`,
    '',
    `Latest verified statutory tax year: **${LATEST_STATUTORY_TAX_YEAR}**`,
    report.futureYearVerificationNeeded
      ? `> Tax-year action required: calendar year ${now.getUTCFullYear()} is newer than the latest verified statutory year.`
      : '> Tax-year coverage is not behind the current calendar year.',
    '',
  ].join('\n');
  fs.appendFileSync(summaryPath, markdown);
}

if (strict) {
  const criticallyOldCities = cityRows.filter((row) => row.ageMonths !== null && row.ageMonths > 36);
  const criticallyOldEvidence = evidenceRows.filter((row) => row.ageDays !== null && row.ageDays > 1095);
  const missing = cityRows.filter((row) => row.status === 'UNKNOWN').length + evidenceRows.filter((row) => row.status === 'UNKNOWN').length;

  if (criticallyOldCities.length || criticallyOldEvidence.length || missing) {
    console.error(
      `Strict freshness gate failed: ${criticallyOldCities.length} city benchmarks >36 months, ${criticallyOldEvidence.length} evidence records >3 years, ${missing} missing/invalid dates.`
    );
    process.exit(1);
  }
}
