import fs from 'fs';
import path from 'path';
import { CITY_COL_BENCHMARKS } from '../src/data/city-benchmarks';
import { EVIDENCE_REGISTRY } from '../src/data/evidence-registry';
import { classifyDataFreshness } from '../src/engines/col/col-engine';
import { LATEST_VERIFIED_TAX_YEAR, TAX_YEAR_OPTIONS } from '../src/lib/tax-year-policy';

export interface DataFreshnessReport {
  generatedAt: string;
  auditPolicy: {
    currentThresholdMonths: number;
    agingThresholdMonths: number;
    staleThresholdMonths: number;
    taxPolicy: string;
  };
  summary: {
    totalCityBenchmarks: number;
    currentCount: number;
    agingCount: number;
    staleCount: number;
    unknownCount: number;
    currentPercent: number;
    totalEvidenceSources: number;
    activeTaxYears: number[];
    latestVerifiedTaxYear: number;
    pendingTaxYears: number[];
  };
  taxCoverageStatus: {
    latestVerifiedYear: number;
    pendingVerificationYear: number;
    futureYearSafetyRule: string;
  };
  cityBenchmarks: {
    cityId: string;
    currency: string;
    sourceDate: string;
    freshnessStatus: string;
    evidenceSourceId: string;
  }[];
  evidenceSources: {
    id: string;
    organization: string;
    reliabilityTier: string;
    effectiveDate?: string;
    verifiedAt?: string;
    jurisdiction?: string;
  }[];
}

export function runDataFreshnessAudit(): DataFreshnessReport {
  const now = new Date();
  const cityEntries = Object.entries(CITY_COL_BENCHMARKS);
  let currentCount = 0;
  let agingCount = 0;
  let staleCount = 0;
  let unknownCount = 0;

  const cityBenchmarks = cityEntries.map(([cityId, bm]) => {
    const status = classifyDataFreshness(bm.sourceDate, now);
    if (status === 'CURRENT') currentCount++;
    else if (status === 'AGING') agingCount++;
    else if (status === 'STALE') staleCount++;
    else unknownCount++;

    return {
      cityId,
      currency: bm.currency,
      sourceDate: bm.sourceDate,
      freshnessStatus: status,
      evidenceSourceId: bm.evidenceSourceId,
    };
  });

  const evidenceEntries = Object.entries(EVIDENCE_REGISTRY);
  const evidenceSources = evidenceEntries.map(([id, ev]) => ({
    id,
    organization: ev.organization,
    reliabilityTier: ev.reliabilityTier,
    effectiveDate: ev.effectiveDate,
    verifiedAt: ev.verifiedAt,
    jurisdiction: ev.jurisdiction,
  }));

  const report: DataFreshnessReport = {
    generatedAt: now.toISOString(),
    auditPolicy: {
      currentThresholdMonths: 18,
      agingThresholdMonths: 30,
      staleThresholdMonths: 31,
      taxPolicy: 'Statutory 2026 verified; 2027 structurally supported with fail-safe TAX_CALCULATION_UNAVAILABLE',
    },
    summary: {
      totalCityBenchmarks: cityEntries.length,
      currentCount,
      agingCount,
      staleCount,
      unknownCount,
      currentPercent: Math.round((currentCount / (cityEntries.length || 1)) * 100),
      totalEvidenceSources: evidenceEntries.length,
      activeTaxYears: [...TAX_YEAR_OPTIONS],
      latestVerifiedTaxYear: LATEST_VERIFIED_TAX_YEAR,
      pendingTaxYears: [2027],
    },
    taxCoverageStatus: {
      latestVerifiedYear: LATEST_VERIFIED_TAX_YEAR,
      pendingVerificationYear: 2027,
      futureYearSafetyRule:
        '2027 tax calculations return TAX_CALCULATION_UNAVAILABLE until official statutory rules are published by revenue authorities.',
    },
    cityBenchmarks,
    evidenceSources,
  };

  const reportJson = JSON.stringify(report, null, 2);

  // Write to root
  fs.writeFileSync(path.resolve('data-freshness-report.json'), reportJson, 'utf-8');

  // Write to public/ if exists
  const publicDir = path.resolve('public');
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, 'data-freshness-report.json'), reportJson, 'utf-8');
  }

  // Write to dist/ if exists
  const distDir = path.resolve('dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'data-freshness-report.json'), reportJson, 'utf-8');
  }

  console.log('[Data Freshness Audit] Generated data-freshness-report.json:');
  console.log(`- Benchmarks: ${report.summary.totalCityBenchmarks} (${currentCount} Current, ${agingCount} Aging, ${staleCount} Stale)`);
  console.log(`- Evidence Registry: ${report.summary.totalEvidenceSources} Tier-1/2/3 verified citations`);
  console.log(`- Tax Baseline: ${report.summary.latestVerifiedTaxYear} statutory verified; 2027 pending verification`);

  return report;
}

if (import.meta.url.endsWith('audit-data-freshness.ts') || process.argv[1]?.includes('audit-data-freshness')) {
  runDataFreshnessAudit();
}
