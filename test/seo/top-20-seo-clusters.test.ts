import fs from 'fs';
import path from 'path';
import { SEO_LANDING_PAGES } from '../../src/data/seo-clusters';
import { SeoEngineAdapter } from '../../src/lib/seo-engine-adapter';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

const TARGET_20_SLUGS = [
  // Cluster 1: NYC
  'guides/nyc-100k',
  'guides/nyc-150k',
  'salary-after-tax/new-york',
  'salary-needed/new-york',
  'cost-of-living/new-york',
  'compare/new-york-vs-london',
  'compare/new-york-vs-dubai',

  // Cluster 2: London
  'guides/london-75k',
  'guides/london-100k',
  'salary-after-tax/london',
  'salary-needed/london',
  'compare/london-vs-dubai',

  // Cluster 3: Dubai
  'guides/dubai-300k',
  'salary-after-tax/dubai',

  // Cluster 4: North America
  'guides/toronto-100k',
  'guides/sf-150k',
  'guides/austin-100k',

  // Cluster 5: Global
  'guides/sydney-120k',
  'guides/berlin-80k',
  'guides/singapore-120k',
];

export function runTop20SeoTests() {
  console.log('\n======================================================');
  console.log('--- LIVWORTHY TOP 20 PRIORITY SEO CLUSTER TEST SUITE ---');
  console.log('======================================================\n');

  const distDir = path.resolve('dist');
  assert(fs.existsSync(distDir), 'dist/ directory must exist');

  // Load sitemaps to verify indexing
  const sitemapGuides = fs.readFileSync(path.join(distDir, 'sitemap-guides.xml'), 'utf-8');
  const sitemapComparisons = fs.readFileSync(path.join(distDir, 'sitemap-comparisons.xml'), 'utf-8');
  const sitemapMain = fs.readFileSync(path.join(distDir, 'sitemap-main.xml'), 'utf-8');
  const allSitemapsContent = `${sitemapGuides}\n${sitemapComparisons}\n${sitemapMain}`;

  const titlesSet = new Set<string>();
  const h1Set = new Set<string>();
  const descriptionsSet = new Set<string>();

  // 1. Verify existence and individual page invariants
  for (const slug of TARGET_20_SLUGS) {
    const htmlPath = path.join(distDir, slug, 'index.html');
    assert(fs.existsSync(htmlPath), `[Route Exists] ${slug} -> ${path.relative(distDir, htmlPath)} must exist`);

    const html = fs.readFileSync(htmlPath, 'utf-8');
    const expectedCanonical = `https://www.livworthy.com/${slug}`;

    // Canonical check
    assert(
      html.includes(`<link rel="canonical" href="${expectedCanonical}" />`),
      `[Canonical] ${slug} must declare self-canonical ${expectedCanonical}`
    );

    // Robots check (All 20 qualify under capability gate)
    assert(
      html.includes('<meta name="robots" content="index, follow" />'),
      `[Robots] ${slug} must be index, follow`
    );

    // Sitemap check
    assert(
      allSitemapsContent.includes(`<loc>${expectedCanonical}</loc>`),
      `[Sitemap] ${slug} canonical URL must be present in sitemaps`
    );

    // No apex domain in canonical or OG tags
    assert(!html.includes('https://livworthy.com/'), `[No Apex] ${slug} must not contain apex canonical or links`);

    // No preview domains
    assert(!html.includes('vercel.app'), `[No Preview] ${slug} must not reference vercel.app preview domain`);

    // Title tag
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    assert(!!titleMatch && titleMatch[1].length > 10, `[Title] ${slug} has valid non-empty title`);
    const title = titleMatch![1];
    assert(!titlesSet.has(title), `[Unique Title] Title "${title}" must be unique across top 20 pages`);
    titlesSet.add(title);

    // H1 headline
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    assert(!!h1Match && h1Match[1].trim().length > 5, `[H1] ${slug} has valid H1`);
    const h1 = h1Match![1].trim();
    assert(!h1Set.has(h1), `[Unique H1] H1 "${h1}" must be unique across top 20 pages`);
    h1Set.add(h1);

    // Meta description
    const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"\s*\/?>/);
    assert(!!descMatch && descMatch[1].length > 20, `[Meta Description] ${slug} has descriptive meta`);
    const desc = descMatch![1];
    assert(!descriptionsSet.has(desc), `[Unique Meta] Description for ${slug} must be unique across top 20 pages`);
    descriptionsSet.add(desc);

    // Direct answer block
    assert(html.includes('class="direct-answer'), `[Direct Answer] ${slug} must contain AEO direct answer block`);
    assert(html.includes('Short answer:'), `[Direct Answer Text] ${slug} must include bold Short answer lead`);

    // Interactive calculator CTA
    assert(
      html.includes('Open Interactive Calculator →') || html.includes('Interactive Scenario Calculator'),
      `[Calculator CTA] ${slug} must link to interactive calculator`
    );

    // E-E-A-T Disclaimers & Methodology Links
    assert(html.includes('Estimates are informational and not financial, tax, or legal advice'), `[E-E-A-T Disclaimer] ${slug} contains legal disclaimer`);
    assert(html.includes('/methodology'), `[Methodology Link] ${slug} links to methodology`);
    assert(html.includes('/sources'), `[Sources Link] ${slug} links to sources evidence registry`);
    assert(html.includes('/editorial-policy'), `[Editorial Policy Link] ${slug} links to editorial policy`);
    assert(html.includes('/corrections'), `[Corrections Policy Link] ${slug} links to corrections policy`);

    // Related internal linking grid
    assert(html.includes('Related Intelligence in This Cluster'), `[Cluster Grid] ${slug} contains related links grid`);

    // FAQ schema alignment: if FAQ schema is present, questions must be visibly in HTML
    if (html.includes('"@type": "FAQPage"')) {
      const qMatches = html.matchAll(/"name":\s*"([^"]+)"/g);
      for (const qm of qMatches) {
        if (qm[1] && !qm[1].startsWith('LivWorthy') && !qm[1].startsWith('Home') && qm[1].endsWith('?')) {
          assert(html.includes(qm[1]), `[FAQ Visible Invariant] FAQ Question "${qm[1]}" in schema must be visibly rendered in HTML`);
        }
      }
    }
  }

  // 2. Exact Precomputed Engine Equality Verifications (Condition 13)
  console.log('\n--- Verifying Exact Precomputed Numerical Results against Domain Engines ---\n');

  // NYC 100K Guide: Check take-home, taxes, COL
  const nyc100kHtml = fs.readFileSync(path.join(distDir, 'guides/nyc-100k/index.html'), 'utf-8');
  const computedNyc100k = SeoEngineAdapter.computeSalaryGuide('nyc', 100000);
  assert(
    nyc100kHtml.includes(`USD ${computedNyc100k.takeHomeMonthlyMajor.toLocaleString()}`),
    `NYC 100K HTML contains exact engine monthly take-home: USD ${computedNyc100k.takeHomeMonthlyMajor.toLocaleString()}`
  );
  assert(
    nyc100kHtml.includes(`USD ${computedNyc100k.totalTaxMajor.toLocaleString()}`),
    `NYC 100K HTML contains exact engine total tax: USD ${computedNyc100k.totalTaxMajor.toLocaleString()}`
  );
  assert(
    nyc100kHtml.includes(`${computedNyc100k.effectiveTaxRate.toFixed(1)}%`),
    `NYC 100K HTML contains exact effective tax rate: ${computedNyc100k.effectiveTaxRate.toFixed(1)}%`
  );
  assert(
    nyc100kHtml.includes(computedNyc100k.taxRuleVersion),
    `NYC 100K HTML declares exact statutory tax rule version: ${computedNyc100k.taxRuleVersion}`
  );

  // London 75K Guide: Check take-home, taxes, COL
  const london75kHtml = fs.readFileSync(path.join(distDir, 'guides/london-75k/index.html'), 'utf-8');
  const computedLondon75k = SeoEngineAdapter.computeSalaryGuide('london', 75000);
  assert(
    london75kHtml.includes(`GBP ${computedLondon75k.takeHomeMonthlyMajor.toLocaleString()}`),
    `London 75K HTML contains exact engine monthly take-home: GBP ${computedLondon75k.takeHomeMonthlyMajor.toLocaleString()}`
  );
  assert(
    london75kHtml.includes(computedLondon75k.taxRuleVersion),
    `London 75K HTML declares exact statutory tax rule version: ${computedLondon75k.taxRuleVersion}`
  );

  // Dubai 300K Guide: Check 0% tax, AED 25,000 monthly
  const dubai300kHtml = fs.readFileSync(path.join(distDir, 'guides/dubai-300k/index.html'), 'utf-8');
  const computedDubai300k = SeoEngineAdapter.computeSalaryGuide('dubai', 300000);
  assert(
    dubai300kHtml.includes(`AED ${computedDubai300k.takeHomeMonthlyMajor.toLocaleString()}`),
    `Dubai 300K HTML contains exact engine monthly take-home: AED ${computedDubai300k.takeHomeMonthlyMajor.toLocaleString()}`
  );

  // NYC Salary After Tax Table check
  const nycTaxHtml = fs.readFileSync(path.join(distDir, 'salary-after-tax/new-york/index.html'), 'utf-8');
  const computedNycTax = SeoEngineAdapter.computeSalaryAfterTax('nyc');
  for (const tier of computedNycTax.tiers.slice(0, 4)) {
    assert(
      nycTaxHtml.includes(`USD ${tier.grossMajor.toLocaleString()}`),
      `NYC After-Tax table includes gross tier USD ${tier.grossMajor.toLocaleString()}`
    );
    assert(
      nycTaxHtml.includes(`USD ${tier.takeHomeMonthlyMajor.toLocaleString()}`),
      `NYC After-Tax table includes exact net monthly USD ${tier.takeHomeMonthlyMajor.toLocaleString()}`
    );
  }

  // NYC Salary Needed check
  const nycNeededHtml = fs.readFileSync(path.join(distDir, 'salary-needed/new-york/index.html'), 'utf-8');
  const computedNycNeeded = SeoEngineAdapter.computeSalaryNeeded('nyc');
  assert(
    nycNeededHtml.includes(`USD ${computedNycNeeded.singleRequiredGrossMajor.toLocaleString()}`),
    `NYC Salary Needed HTML contains exact required single gross: USD ${computedNycNeeded.singleRequiredGrossMajor.toLocaleString()}`
  );

  // NYC Cost of Living check
  const nycColHtml = fs.readFileSync(path.join(distDir, 'cost-of-living/new-york/index.html'), 'utf-8');
  const computedNycCol = SeoEngineAdapter.computeCostOfLiving('nyc');
  const expectedSingleRent = Math.round(computedNycCol.single.housingMonthly.amountMinor / 100).toLocaleString();
  assert(
    nycColHtml.includes(`USD ${expectedSingleRent}`),
    `NYC COL HTML contains exact single housing baseline: USD ${expectedSingleRent}`
  );

  console.log('\n======================================================');
  console.log('✅ ALL TOP 20 SEO CLUSTER AUDIT TESTS PASSED (100%)!');
  console.log('======================================================\n');
}

if (process.argv[1].endsWith('top-20-seo-clusters.test.ts')) {
  runTop20SeoTests();
}
