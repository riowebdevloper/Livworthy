import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

function runAuditTests() {
  console.log('--- LIVWORTHY AEO, GEO, LLMO & E-E-A-T AUDIT SUITE ---');
  const distDir = path.resolve('dist');
  const publicDir = path.resolve('public');

  // Test 1: llms.txt in dist and public
  const distLlmsPath = path.join(distDir, 'llms.txt');
  const pubLlmsPath = path.join(publicDir, 'llms.txt');
  assert(fs.existsSync(distLlmsPath), 'dist/llms.txt must exist');
  assert(fs.existsSync(pubLlmsPath), 'public/llms.txt must exist');

  const llmsContent = fs.readFileSync(distLlmsPath, 'utf-8');
  assert(llmsContent.includes('LivWorthy'), 'llms.txt includes LivWorthy brand');
  assert(llmsContent.includes('Zero-AI Financial Calculation Policy'), 'llms.txt includes Zero-AI calculation policy');
  assert(llmsContent.includes('https://livworthy.com/methodology'), 'llms.txt links to methodology');
  assert(llmsContent.includes('https://livworthy.com/sources'), 'llms.txt links to sources registry');
  assert(!llmsContent.toLowerCase().includes('rank #1'), 'llms.txt makes no false Google rank claims');
  assert(!llmsContent.toLowerCase().includes('guaranteed ranking'), 'llms.txt makes no ranking guarantees');

  // Test 2: robots.txt with search and AI crawlers
  const robotsPath = path.join(distDir, 'robots.txt');
  assert(fs.existsSync(robotsPath), 'dist/robots.txt must exist');
  const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  assert(robotsContent.includes('Disallow: /api/'), 'robots.txt disallows /api/');
  assert(robotsContent.includes('Disallow: /admin/'), 'robots.txt disallows /admin/');
  assert(robotsContent.includes('Disallow: /test/'), 'robots.txt disallows /test/');
  assert(robotsContent.includes('User-agent: Googlebot'), 'robots.txt configures Googlebot');
  assert(robotsContent.includes('User-agent: GPTBot'), 'robots.txt configures GPTBot');
  assert(robotsContent.includes('User-agent: PerplexityBot'), 'robots.txt configures PerplexityBot');
  assert(robotsContent.includes('Sitemap: https://livworthy.com/sitemap.xml'), 'robots.txt references sitemap');

  // Test 3: Institutional E-E-A-T Transparency pages in dist
  const transparencyPaths = [
    'about/index.html',
    'methodology/index.html',
    'sources/index.html',
    'editorial-policy/index.html',
    'data-policy/index.html',
    'corrections/index.html',
    'terms/index.html',
    'privacy/index.html',
  ];

  for (const relPath of transparencyPaths) {
    const fullPath = path.join(distDir, relPath);
    assert(fs.existsSync(fullPath), `Transparency page must exist: ${relPath}`);

    const html = fs.readFileSync(fullPath, 'utf-8');
    assert(html.includes('<h1'), `${relPath} contains H1 headline`);
    assert(html.includes('<link rel="canonical"'), `${relPath} contains canonical link`);
    assert(html.includes('<meta name="description"'), `${relPath} contains meta description`);
    assert(html.includes('application/ld+json'), `${relPath} contains structured data`);
    assert(!html.toLowerCase().includes('fake cpa'), `${relPath} does not contain fake credentials`);
    assert(!html.toLowerCase().includes('award-winning economist'), `${relPath} does not contain fake expert claims`);
  }

  // Test 4: Sitemaps
  const sitemapIndexPath = path.join(distDir, 'sitemap.xml');
  const sitemapMainPath = path.join(distDir, 'sitemap-main.xml');
  assert(fs.existsSync(sitemapIndexPath), 'sitemap.xml must exist');
  assert(fs.existsSync(sitemapMainPath), 'sitemap-main.xml must exist');

  const mainContent = fs.readFileSync(sitemapMainPath, 'utf-8');
  assert(mainContent.includes('https://livworthy.com/about'), 'sitemap-main.xml includes /about');
  assert(mainContent.includes('https://livworthy.com/methodology'), 'sitemap-main.xml includes /methodology');
  assert(mainContent.includes('https://livworthy.com/sources'), 'sitemap-main.xml includes /sources');
  assert(mainContent.includes('https://livworthy.com/editorial-policy'), 'sitemap-main.xml includes /editorial-policy');
  assert(mainContent.includes('https://livworthy.com/data-policy'), 'sitemap-main.xml includes /data-policy');
  assert(mainContent.includes('https://livworthy.com/corrections'), 'sitemap-main.xml includes /corrections');
  assert(mainContent.includes('https://livworthy.com/terms'), 'sitemap-main.xml includes /terms');
  assert(mainContent.includes('https://livworthy.com/privacy'), 'sitemap-main.xml includes /privacy');

  // Test 5: Guide page with AEO block, Fact Table, and Article JSON-LD
  const sampleGuidePath = path.join(distDir, 'guides/nyc-100k/index.html');
  assert(fs.existsSync(sampleGuidePath), 'Sample guide nyc-100k must exist');
  const guideHtml = fs.readFileSync(sampleGuidePath, 'utf-8');
  assert(guideHtml.includes('AEO Direct Answer & Verdict'), 'Guide includes AEO Direct Answer header');
  assert(guideHtml.includes('<table'), 'Guide includes semantic fact table');
  assert(guideHtml.includes('Gross Annual Salary'), 'Guide fact table includes Gross Annual Salary');
  assert(guideHtml.includes('application/ld+json'), 'Guide includes JSON-LD');
  assert(guideHtml.includes('"@type": "Article"'), 'Guide includes Article schema');
  assert(guideHtml.includes('LivWorthy Financial Research & Intelligence Team'), 'Guide author is truthful organization');

  // Test 6: Homepage Dataset & Organization Schema
  const homePath = path.join(distDir, 'index.html');
  assert(fs.existsSync(homePath), 'dist/index.html must exist');
  const homeHtml = fs.readFileSync(homePath, 'utf-8');
  assert(homeHtml.includes('"@type": "Dataset"'), 'Homepage includes Dataset structured data');
  assert(homeHtml.includes('"publishingPrinciples": "https://livworthy.com/editorial-policy"'), 'Homepage includes publishingPrinciples');
  assert(homeHtml.includes('"correctionsPolicy": "https://livworthy.com/corrections"'), 'Homepage includes correctionsPolicy');

  console.log('\n✅ ALL AEO, GEO, LLMO & E-E-A-T TESTS PASSED PERFECTLY!\n');
}

runAuditTests();
