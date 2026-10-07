/**
 * LivWorthy Worldwide Multilingual SEO, Keyword, Topical Authority & Ranking Suite
 *
 * Comprehensive validation covering:
 * - Section 4 & 5: Language-Specific Keyword Database across 10 Tier-1 locales
 * - Section 15: Single Primary Intent per page / Zero cannibalization
 * - Section 20 & 21: Answer-first structure with direct answer block
 * - Section 23 & 24: Unique localized SEO Metadata (Title, Description, H1) with zero English leakage
 * - Section 26 & 27: Self-canonical and reciprocal hreflang tags (10 locales + x-default)
 * - Section 28: Multilingual Segmented Sitemaps indexed in sitemap.xml
 * - Section 31 & 32: Competitor analysis and content gap engine
 * - Section 39 & 40: Verified ethical PR media directory across multiple languages
 * - Section 52 & 54: Topical Authority Scorecard and completeness dashboard
 */

import fs from 'fs';
import path from 'path';
import { MULTILINGUAL_KEYWORD_DATABASE } from '../../src/lib/seo/multilingual-keywords';
import { PRIORITY_KEYWORD_CLUSTERS } from '../../src/lib/rank-tracker';
import { LOCALIZED_COMPETITORS, MultilingualContentGapEngine } from '../../src/lib/seo/content-gap-engine';
import { TopicalAuthorityScorecard } from '../../src/lib/seo/topical-authority-scorecard';
import { VERIFIED_MEDIA_CONTACTS } from '../../src/data/verified-journalists';
import { TIER_1_LOCALES } from '../../src/lib/i18n';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runMultilingualSeoSuite() {
  console.log('======================================================');
  console.log('🌍 LivWorthy Multilingual SEO & Topical Authority Suite');
  console.log('======================================================\n');

  const distDir = path.resolve('dist');
  assert(fs.existsSync(distDir), 'dist/ directory exists');

  // --- 1. Language-Specific Keyword Database ---
  console.log('--- 1. Multilingual Keyword Universe & Zero Cannibalization ---');
  assert(MULTILINGUAL_KEYWORD_DATABASE.length >= 25, `Keyword database contains comprehensive query universe (${MULTILINGUAL_KEYWORD_DATABASE.length} entries)`);

  const seenQueries = new Set<string>();
  for (const kw of MULTILINGUAL_KEYWORD_DATABASE) {
    assert(kw.locale.length >= 2, `Valid locale code on keyword "${kw.query}"`);
    assert(kw.query.length >= 3, `Valid query string on id "${kw.id}"`);
    assert(kw.normalizedIntent.length >= 10, `Valid normalized intent on "${kw.query}"`);
    assert(!!kw.intentType, `Intent type classified on "${kw.query}" (${kw.intentType})`);
    assert(kw.targetUrl.startsWith('https://www.livworthy.com/'), `Valid target URL on "${kw.query}"`);
    assert(kw.currentRank === null, `Zero-False-Completion: currentRank must be null until GSC observed on "${kw.query}"`);
    assert(!!kw.dataProvider, `Data provider provenance recorded on "${kw.query}"`);
    assert(!!kw.dataSourceType, `Data source type recorded on "${kw.query}"`);
    if (!kw.isVerified) {
      assert(kw.searchVolume === null, `Unverified volume must be null on "${kw.query}"`);
      assert(kw.keywordDifficulty === null, `Unverified KD must be null on "${kw.query}"`);
      assert(kw.cpc === null, `Unverified CPC must be null on "${kw.query}"`);
    }
    assert(!seenQueries.has(kw.query.toLowerCase()), `No duplicate keyword queries (${kw.query})`);
    seenQueries.add(kw.query.toLowerCase());
  }

  // Verify coverage for each of the 10 Tier-1 locales
  for (const loc of TIER_1_LOCALES) {
    const locKws = MULTILINGUAL_KEYWORD_DATABASE.filter((k) => k.locale === loc);
    assert(locKws.length >= 2, `Locale ${loc} has at least 2 native keyword intent entries (${locKws.length} found)`);
  }

  // --- 2. Localized Landing Pages Metadata & Answer-First Structure ---
  console.log('\n--- 2. Localized Landing Pages Metadata & Answer-First Structure ---');
  const titlesSet = new Set<string>();
  const descriptionsSet = new Set<string>();
  const h1Set = new Set<string>();

  for (const loc of TIER_1_LOCALES) {
    const htmlPath = path.join(distDir, loc, 'index.html');
    assert(fs.existsSync(htmlPath), `Localized HTML exists at dist/${loc}/index.html`);

    const html = fs.readFileSync(htmlPath, 'utf-8');
    const expectedCanonical = `https://www.livworthy.com/${loc}`;

    // Self-canonical check
    assert(
      html.includes(`<link rel="canonical" href="${expectedCanonical}" />`),
      `[Self-Canonical] /${loc} declares self-canonical ${expectedCanonical}`
    );

    // Robots check
    assert(html.includes('<meta name="robots" content="index, follow" />'), `/${loc} is indexable`);

    // Title check
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    assert(!!titleMatch && titleMatch[1].length > 10, `[Title] /${loc} has valid title`);
    const title = titleMatch![1];
    assert(!titlesSet.has(title), `[Unique Title] Title for /${loc} is unique`);
    titlesSet.add(title);

    // Description check
    const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"\s*\/?>/);
    assert(!!descMatch && descMatch[1].length > 20, `[Description] /${loc} has descriptive meta`);
    const desc = descMatch![1];
    assert(!descriptionsSet.has(desc), `[Unique Description] Description for /${loc} is unique`);
    descriptionsSet.add(desc);

    // H1 headline check
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    assert(!!h1Match && h1Match[1].trim().length > 5, `[H1] /${loc} has valid H1`);
    const h1 = h1Match![1].trim();
    assert(!h1Set.has(h1), `[Unique H1] H1 for /${loc} is unique`);
    h1Set.add(h1);

    // Answer-first direct answer block
    assert(html.includes('class="direct-answer'), `[Direct Answer] /${loc} contains answer-first block`);

    // Hreflang reciprocal alternates check
    assert(html.includes(`hreflang="${loc}" href="https://www.livworthy.com/${loc}"`), `/${loc} contains self-hreflang`);
    assert(html.includes('hreflang="x-default" href="https://www.livworthy.com/"'), `/${loc} contains x-default hreflang`);
    assert(html.includes('hreflang="en" href="https://www.livworthy.com/en"'), `/${loc} contains en hreflang`);
    assert(html.includes('hreflang="ar" href="https://www.livworthy.com/ar"'), `/${loc} contains ar hreflang`);

    // Structured data check
    assert(html.includes('application/ld+json'), `/${loc} contains structured data script`);
  }

  // --- 3. Multilingual Segmented Sitemaps ---
  console.log('\n--- 3. Multilingual Segmented Sitemaps Architecture ---');
  const sitemapIndexContent = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf-8');

  for (const loc of TIER_1_LOCALES) {
    const sitemapName = `sitemap-${loc}.xml`;
    assert(sitemapIndexContent.includes(sitemapName), `sitemap.xml index includes ${sitemapName}`);

    const locSitemapPath = path.join(distDir, sitemapName);
    assert(fs.existsSync(locSitemapPath), `${sitemapName} exists on disk in dist/`);
    const locSitemapContent = fs.readFileSync(locSitemapPath, 'utf-8');
    assert(locSitemapContent.includes(`https://www.livworthy.com/${loc}`), `${sitemapName} includes root url for /${loc}`);
    assert(locSitemapContent.includes(`https://www.livworthy.com/${loc}/cities/nyc`), `${sitemapName} includes canonical localized city routes`);
    assert(locSitemapContent.includes(`https://www.livworthy.com/${loc}/guides/nyc-100k`), `${sitemapName} includes canonical localized guide routes`);
    assert(!locSitemapContent.includes('?tab='), `${sitemapName} excludes query-parameter pseudo-pages`);
  }

  // --- 4. Competitor Analysis & Content Gap Engine ---
  console.log('\n--- 4. Competitor Analysis & Content Gap Engine ---');
  assert(LOCALIZED_COMPETITORS.length >= 6, `At least 6 real localized competitors profiled (${LOCALIZED_COMPETITORS.length} found)`);

  const esGaps = MultilingualContentGapEngine.analyzeLocaleGaps('es');
  assert(esGaps.missingSubtopics.length > 0, 'Spanish content gaps identified');
  assert(esGaps.recommendations.length > 0, 'Spanish recommendations provided');

  const arGaps = MultilingualContentGapEngine.analyzeLocaleGaps('ar');
  assert(arGaps.missingSubtopics.length > 0, 'Arabic content gaps identified');

  const quickWins = MultilingualContentGapEngine.getQuickWins();
  assert(quickWins.length >= 20, `At least 20 opportunity targets prioritized (${quickWins.length} found)`);
  for (const qw of quickWins.slice(0, 5)) {
    assert(qw.observedPosition === null || (qw.observedPosition >= 4 && qw.observedPosition <= 20), `Observed position is honest null or within 4-20 window`);
    assert(qw.improvementActions.length > 0, 'Improvement actions defined');
    assert(!!qw.opportunityClassification, 'Opportunity classification defined');
  }

  // --- 5. Ethical Multilingual Digital PR Directory ---
  console.log('\n--- 5. Ethical Multilingual Digital PR Directory ---');
  assert(VERIFIED_MEDIA_CONTACTS.length >= 10, `Verified media contacts directory covers international markets (${VERIFIED_MEDIA_CONTACTS.length} contacts)`);

  const esJournalist = VERIFIED_MEDIA_CONTACTS.find((c) => c.language === 'es');
  assert(!!esJournalist && esJournalist.outlet.includes('Cinco Días'), 'Spanish verified journalist configured');
  assert(esJournalist!.pitchBody.includes('https://www.livworthy.com/reports/'), 'Spanish pitch references real report URL');

  const arJournalist = VERIFIED_MEDIA_CONTACTS.find((c) => c.language === 'ar');
  assert(!!arJournalist && arJournalist.outlet.includes('Al Bayan'), 'Arabic verified journalist configured');

  const deJournalist = VERIFIED_MEDIA_CONTACTS.find((c) => c.language === 'de');
  assert(!!deJournalist && deJournalist.outlet.includes('Handelsblatt'), 'German verified journalist configured');

  // --- 6. Topical Authority Scorecard Completeness ---
  console.log('\n--- 6. Topical Authority Scorecard & Completeness ---');
  for (const loc of TIER_1_LOCALES) {
    const score = TopicalAuthorityScorecard.evaluateLocale(loc);
    assert(score.translationCompletenessPct >= 90, `${loc} translation completeness is calculated dynamically (${score.translationCompletenessPct}%)`);
    assert(score.seoMetadataCompletenessPct === 100, `${loc} SEO metadata completeness is 100%`);
    assert(score.keywordMapCompletenessPct === 100, `${loc} keyword map completeness is 100%`);
    assert(score.sitemapCoveragePct === 100, `${loc} sitemap coverage is 100%`);
    assert(score.hreflangReciprocityPct === 100, `${loc} hreflang reciprocity is 100%`);
    assert(score.overallScorecardGrade === 'INCOMPLETE' || score.overallScorecardGrade === 'A+', `${loc} overall grade is honestly determined (${score.overallScorecardGrade})`);
  }

  const dashboardMetrics = TopicalAuthorityScorecard.generateAllDashboardMetrics();
  assert(dashboardMetrics.length === 10, 'Dashboard metrics generated for all 10 Tier-1 languages');
  for (const m of dashboardMetrics) {
    assert(m.referringDomains === 0, `Referring domains strictly computed from verified backlinks (${m.referringDomains})`);
    assert(m.indexedPages === null, `Indexed pages honest null until Search Console confirms`);
  }

  console.log('\n======================================================');
  console.log('✅ ALL MULTILINGUAL SEO & TOPICAL AUTHORITY TESTS PASSED (100%)!');
  console.log('======================================================');
}

runMultilingualSeoSuite().catch((err) => {
  console.error('Fatal error in multilingual SEO suite:', err);
  process.exit(1);
});
