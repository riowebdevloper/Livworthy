import { dbService } from '../db/client';

export interface TrackedKeywordItem {
  id: string;
  keyword: string;
  targetUrl: string;
  locale: string;
  country: string;
  device: 'desktop' | 'mobile';
  currentRank: number | null; // null represents unranked / not yet indexed in Top 100
  previousRank: number | null;
  rankDelta: number | null;
  targetPosition: string; // e.g. 'Top 1', 'Top 3', 'Top 5'
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number | null;
  competingSerpType: string;
  serpFeaturesPresent: string[];
  recommendedAction: string;
  lastCheckedAt: string;
}

export const PRIORITY_KEYWORD_CLUSTERS: Omit<TrackedKeywordItem, 'id' | 'currentRank' | 'previousRank' | 'rankDelta' | 'impressions' | 'clicks' | 'ctr' | 'averagePosition' | 'lastCheckedAt'>[] = [
  {
    keyword: 'is 100k a good salary in NYC',
    targetUrl: 'https://www.livworthy.com/guides/nyc-100k',
    locale: 'en',
    country: 'US',
    device: 'desktop',
    targetPosition: 'Top 3',
    competingSerpType: 'Featured Snippet + PAA + Reddit Discussion',
    serpFeaturesPresent: ['Featured Snippet', 'People Also Ask'],
    recommendedAction: 'Prerendered answer passage verified; submit via IndexNow and monitor GSC impressions.',
  },
  {
    keyword: 'NYC salary calculator',
    targetUrl: 'https://www.livworthy.com/salary-after-tax/new-york',
    locale: 'en',
    country: 'US',
    device: 'desktop',
    targetPosition: 'Top 3',
    competingSerpType: 'Interactive Calculator + Aggregator Tools (SmartAsset, Talent.com)',
    serpFeaturesPresent: ['Site Links', 'Related Searches'],
    recommendedAction: 'Interactive IT-2105-I single-filer calculator island live; internal links verified.',
  },
  {
    keyword: 'NYC take home pay calculator',
    targetUrl: 'https://www.livworthy.com/salary-after-tax/new-york',
    locale: 'en',
    country: 'US',
    device: 'mobile',
    targetPosition: 'Top 3',
    competingSerpType: 'Payroll Calculators + Ad Sitelinks',
    serpFeaturesPresent: ['People Also Ask'],
    recommendedAction: 'Mobile-first take-home breakdown with exact FICA/State/City withholdings.',
  },
  {
    keyword: 'salary needed to live in New York',
    targetUrl: 'https://www.livworthy.com/salary-needed/new-york',
    locale: 'en',
    country: 'US',
    device: 'desktop',
    targetPosition: 'Top 3',
    competingSerpType: 'Editorial Guides + Statistical Portals',
    serpFeaturesPresent: ['Featured Snippet'],
    recommendedAction: 'Inverse mathematical solver computes exact required gross salary for target rent.',
  },
  {
    keyword: 'is 75k a good salary in London',
    targetUrl: 'https://www.livworthy.com/guides/london-75k',
    locale: 'en',
    country: 'GB',
    device: 'desktop',
    targetPosition: 'Top 3',
    competingSerpType: 'Editorial Guides + Reddit / Mumsnet forums',
    serpFeaturesPresent: ['People Also Ask', 'Discussion Forums'],
    recommendedAction: 'HMRC 2025/26 PAYE and ONS central rental benchmark inlined.',
  },
  {
    keyword: 'London salary after tax',
    targetUrl: 'https://www.livworthy.com/salary-after-tax/london',
    locale: 'en',
    country: 'GB',
    device: 'desktop',
    targetPosition: 'Top 3',
    competingSerpType: 'MoneySavingExpert + Reed / Totaljobs tax tools',
    serpFeaturesPresent: ['Calculators', 'Sitelinks'],
    recommendedAction: 'Exact Class 1 NI and personal allowance taper verified with golden vectors.',
  },
  {
    keyword: 'London to Dubai salary equivalent',
    targetUrl: 'https://www.livworthy.com/relocation/london-to-dubai',
    locale: 'en',
    country: 'GB',
    device: 'desktop',
    targetPosition: 'Top 1',
    competingSerpType: 'Expat Relocation Blogs + Recruitment Guides',
    serpFeaturesPresent: ['People Also Ask'],
    recommendedAction: 'Flagship bilateral relocation corridor modeling 0% PIT dividend.',
  },
  {
    keyword: 'moving from New York to London salary',
    targetUrl: 'https://www.livworthy.com/relocation/new-york-to-london',
    locale: 'en',
    country: 'US',
    device: 'desktop',
    targetPosition: 'Top 1',
    competingSerpType: 'Expat Financial Consultancies',
    serpFeaturesPresent: ['Related Searches'],
    recommendedAction: 'Compensatory salary gap analysis factoring in UK higher-rate tax schedules.',
  },
  {
    keyword: 'job offer comparison calculator',
    targetUrl: 'https://www.livworthy.com/job-offer-comparison',
    locale: 'en',
    country: 'US',
    device: 'desktop',
    targetPosition: 'Top 1',
    competingSerpType: 'Career Platforms (Levels.fyi, Glassdoor)',
    serpFeaturesPresent: ['SoftwareApplication Schema'],
    recommendedAction: 'Deterministic first-year vs recurring total compensation evaluator published.',
  },
  {
    keyword: 'compare salaries between cities',
    targetUrl: 'https://www.livworthy.com/compare',
    locale: 'en',
    country: 'US',
    device: 'desktop',
    targetPosition: 'Top 5',
    competingSerpType: 'Numbeo + PayScale city comparison hubs',
    serpFeaturesPresent: ['Comparison Tables'],
    recommendedAction: 'Interactive comparison directory with dated benchmark FX snapshots.',
  },
  {
    keyword: 'cost of living New York',
    targetUrl: 'https://www.livworthy.com/cost-of-living/new-york',
    locale: 'en',
    country: 'US',
    device: 'desktop',
    targetPosition: 'Top 5',
    competingSerpType: 'Numbeo + Expatistan + MIT Living Wage',
    serpFeaturesPresent: ['Knowledge Panel', 'People Also Ask'],
    recommendedAction: 'HUD FMR FY2026 + MTA fare transit schedule primary evidence cited.',
  },
  {
    keyword: 'cost of living London vs Dubai',
    targetUrl: 'https://www.livworthy.com/compare/london-vs-dubai',
    locale: 'en',
    country: 'GB',
    device: 'desktop',
    targetPosition: 'Top 1',
    competingSerpType: 'Expat Relocation Portals + Forums',
    serpFeaturesPresent: ['Comparison Snippets'],
    recommendedAction: 'Dedicated head-to-head comparison page with empirical rent differential.',
  },
  {
    keyword: 'cuanto necesito para vivir en nueva york',
    targetUrl: 'https://www.livworthy.com/es',
    locale: 'es',
    country: 'US',
    device: 'mobile',
    targetPosition: 'Top 3',
    competingSerpType: 'Spanish-language expat blogs + US embassy guidance',
    serpFeaturesPresent: ['Preguntas Relacionadas (PAA)'],
    recommendedAction: 'Native Spanish entry hub with localized cost breakdown and methodology.',
  },
  {
    keyword: 'تكلفة المعيشة في دبي',
    targetUrl: 'https://www.livworthy.com/ar',
    locale: 'ar',
    country: 'AE',
    device: 'mobile',
    targetPosition: 'Top 3',
    competingSerpType: 'Arabic Gulf news outlets + Bayut / PropertyFinder',
    serpFeaturesPresent: ['Local Pack', 'Related Questions'],
    recommendedAction: 'Native Arabic RTL layout with Dubai Statistics Center verified figures.',
  },
];

/**
 * Initializes and syncs baseline rank tracking records in database.
 * Per the Zero-False-Completion Rule, rankings without live GSC data are
 * recorded honestly as null (awaiting initial search engine indexation cycle).
 */
export async function initializeRankTracker(): Promise<TrackedKeywordItem[]> {
  const existing = await dbService.getRankRecords();
  if (existing && existing.length > 0) {
    return existing;
  }

  const seeded: TrackedKeywordItem[] = [];
  const now = new Date().toISOString();

  for (const k of PRIORITY_KEYWORD_CLUSTERS) {
    const entry: TrackedKeywordItem = {
      id: `rank_${k.keyword.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${k.country}`,
      ...k,
      currentRank: null, // Zero-False-Completion: null until reported by Search Console
      previousRank: null,
      rankDelta: null,
      impressions: 0,
      clicks: 0,
      ctr: 0.0,
      averagePosition: null,
      lastCheckedAt: now,
    };

    await dbService.upsertRankRecord(entry);
    seeded.push(entry);
  }

  return seeded;
}
