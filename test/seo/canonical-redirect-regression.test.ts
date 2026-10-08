process.env.NODE_ENV = 'test';
process.env.SKIP_SERVER_START = 'true';
import fs from 'fs';
import path from 'path';
import http from 'http';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

async function runRegressionSuite() {
  console.log('--- LIVWORTHY SEO & ROUTING TECHNICAL REGRESSION SUITE (TESTS A-J) ---');

  const distDir = path.resolve('dist');
  const publicDir = path.resolve('public');

  assert(fs.existsSync(distDir), 'dist directory must exist');

  // =========================================================================
  // TEST A: CANONICAL HOST INVARIANT
  // No indexable generated page can contain canonical apex/non-www or preview domains.
  // =========================================================================
  console.log('\n[TEST A] Auditing Canonical Host & Tags across all generated HTML files...');
  const allHtmlFiles = getAllFiles(distDir).filter((f) => f.endsWith('.html'));
  assert(allHtmlFiles.length > 50, `Expected >50 prerendered HTML files, found: ${allHtmlFiles.length}`);

  let auditedHtmlCount = 0;
  for (const htmlPath of allHtmlFiles) {
    const rel = path.relative(distDir, htmlPath);
    const content = fs.readFileSync(htmlPath, 'utf-8');

    // 404 error page is non-indexable and does not require canonical
    if (rel === '404.html') {
      assert(content.includes('noindex'), '404.html must specify noindex');
      continue;
    }

    const canonicalMatches = [...content.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)];
    assert(canonicalMatches.length === 1, `${rel} must contain exactly ONE canonical link tag (found ${canonicalMatches.length})`);

    const canonicalUrl = canonicalMatches[0][1];
    assert(
      canonicalUrl.startsWith('https://www.livworthy.com/'),
      `${rel} canonicalUrl must start with https://www.livworthy.com/ (got ${canonicalUrl})`
    );
    assert(
      !canonicalUrl.startsWith('https://livworthy.com/'),
      `${rel} canonical must not point to apex non-www (got ${canonicalUrl})`
    );
    assert(
      !canonicalUrl.includes('.vercel.app') && !canonicalUrl.includes('localhost'),
      `${rel} canonical must not contain preview or localhost host (got ${canonicalUrl})`
    );

    // OpenGraph og:url must match canonical www host
    const ogMatch = content.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i);
    if (ogMatch) {
      const ogUrl = ogMatch[1];
      assert(
        ogUrl.startsWith('https://www.livworthy.com/'),
        `${rel} og:url must start with https://www.livworthy.com/ (got ${ogUrl})`
      );
      assert(!ogUrl.startsWith('https://livworthy.com/'), `${rel} og:url must not use apex host`);
    }

    // JSON-LD structured data URLs must use www.livworthy.com
    const jsonLdMatches = content.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const block of jsonLdMatches) {
        assert(
          !block.includes('"https://livworthy.com/'),
          `${rel} structured data must not contain non-www "https://livworthy.com/`
        );
        assert(
          !block.includes('livworthy.vercel.app'),
          `${rel} structured data must not reference livworthy.vercel.app`
        );
      }
    }

    auditedHtmlCount++;
  }
  console.log(`PASS: Verified ${auditedHtmlCount} HTML files. All strictly declare https://www.livworthy.com/ canonical.`);

  // Admin must never be indexable, including the exact clean URL and descendants.
  const robotsPath = path.join(distDir, 'robots.txt');
  assert(fs.existsSync(robotsPath), 'robots.txt must exist in dist');
  const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  assert(
    /^Disallow:\s*\/admin\s*$/m.test(robotsContent),
    'Robots must block exact /admin route and all descendants with Disallow: /admin'
  );
  const adminHtmlPath = path.join(distDir, 'admin', 'index.html');
  assert(fs.existsSync(adminHtmlPath), 'Admin shell must exist at dist/admin/index.html');
  const adminHtml = fs.readFileSync(adminHtmlPath, 'utf-8').toLowerCase();
  assert(adminHtml.includes('noindex') && adminHtml.includes('nofollow'), 'Admin shell must be noindex,nofollow');
  console.log('PASS: Admin route is excluded from crawler indexing at robots and document levels.');

  // =========================================================================
  // TEST B: SITEMAP HOST INVARIANT
  // Every sitemap URL starts with: https://www.livworthy.com/
  // =========================================================================
  console.log('\n[TEST B] Auditing Sitemap Host across all sitemap files...');
  const sitemapFiles = [
    'sitemap.xml',
    'sitemap-main.xml',
    'sitemap-countries.xml',
    'sitemap-cities.xml',
    'sitemap-comparisons.xml',
    'sitemap-guides.xml',
  ];

  const allContentLocs: string[] = [];

  for (const smName of sitemapFiles) {
    const smPath = path.join(distDir, smName);
    assert(fs.existsSync(smPath), `${smName} must exist in dist`);
    const smContent = fs.readFileSync(smPath, 'utf-8');

    const locMatches = [...smContent.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    assert(locMatches.length > 0, `${smName} must contain at least one <loc> entry`);

    for (const loc of locMatches) {
      assert(
        loc.startsWith('https://www.livworthy.com/'),
        `${smName} location must start with https://www.livworthy.com/ (got ${loc})`
      );
      assert(
        !loc.startsWith('https://livworthy.com/'),
        `${smName} location must not be apex non-www (got ${loc})`
      );
      assert(
        !loc.includes('.vercel.app') && !loc.includes('localhost'),
        `${smName} location must not contain preview or localhost domains (got ${loc})`
      );
      assert(!loc.includes('?'), `${smName} location must not contain query parameters (got ${loc})`);
    }

    if (smName !== 'sitemap.xml') {
      allContentLocs.push(...locMatches);
    }
  }
  console.log('PASS: All sitemaps strictly declare 100% https://www.livworthy.com/ URLs.');

  // =========================================================================
  // TEST C: SITEMAP STATUS INVARIANT
  // Every sitemap URL corresponds to a valid generated page on disk.
  // =========================================================================
  console.log('\n[TEST C] Verifying all sitemap URLs correspond to valid generated HTML files in dist/...');
  for (const loc of allContentLocs) {
    const parsed = new URL(loc);
    const subpath = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
    const expectedHtmlPath = subpath === ''
      ? path.join(distDir, 'index.html')
      : path.join(distDir, subpath, 'index.html');

    assert(
      fs.existsSync(expectedHtmlPath),
      `Sitemap URL ${loc} must correspond to existing file ${path.relative(distDir, expectedHtmlPath)}`
    );
  }
  console.log(`PASS: Verified ${allContentLocs.length} sitemap URLs. 100% correspond to generated HTML files.`);

  // =========================================================================
  // TEST D: NO NOINDEX SITEMAP ENTRIES
  // No sitemap URL may have noindex.
  // =========================================================================
  console.log('\n[TEST D] Verifying ZERO sitemap URLs contain noindex directives...');
  for (const loc of allContentLocs) {
    const parsed = new URL(loc);
    const subpath = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
    const htmlPath = subpath === ''
      ? path.join(distDir, 'index.html')
      : path.join(distDir, subpath, 'index.html');

    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    assert(
      !htmlContent.toLowerCase().includes('content="noindex') &&
      !htmlContent.toLowerCase().includes('content=\'noindex'),
      `Sitemap URL ${loc} must not contain noindex (in ${path.relative(distDir, htmlPath)})`
    );
  }
  console.log('PASS: 0 sitemap URLs contain noindex. Capability gate successfully preserved.');

  // =========================================================================
  // TEST E: CANONICAL SELF-REFERENCE INVARIANT
  // Each sitemap page canonical equals its sitemap URL.
  // =========================================================================
  console.log('\n[TEST E] Verifying canonical self-reference across all sitemap pages...');
  for (const loc of allContentLocs) {
    const parsed = new URL(loc);
    const subpath = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
    const htmlPath = subpath === ''
      ? path.join(distDir, 'index.html')
      : path.join(distDir, subpath, 'index.html');

    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    const canonicalMatch = htmlContent.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
    assert(!!canonicalMatch, `${loc} must have a canonical tag`);
    const pageCanonical = canonicalMatch![1];

    assert(
      pageCanonical === loc,
      `Page canonical (${pageCanonical}) must exactly equal sitemap URL (${loc})`
    );
  }
  console.log('PASS: 100% of sitemap pages have self-referencing canonicals matching their exact loc.');

  // =========================================================================
  // TEST F: DUPLICATE SITEMAP URLS INVARIANT
  // Count = unique count across each sitemap and combined.
  // =========================================================================
  console.log('\n[TEST F] Verifying zero duplicate sitemap URLs...');
  const uniqueContentLocs = new Set(allContentLocs);
  assert(
    allContentLocs.length === uniqueContentLocs.size,
    `Expected unique count (${uniqueContentLocs.size}) to equal total count (${allContentLocs.length})`
  );
  console.log(`PASS: All ${allContentLocs.length} URLs across segmented sitemaps are 100% unique.`);

  // =========================================================================
  // TEST G, H, I: SERVER HTTP BEHAVIOR (404s, Trailing Slash, Apex Redirection)
  // =========================================================================
  console.log('\n[TESTS G, H, I] Starting Express server to audit HTTP routing invariants...');
  const { app } = await import('../../server');
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;

  async function testRequest(host: string, reqPath: string, extraHeaders: Record<string, string> = {}) {
    return new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }>((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: reqPath,
          method: 'GET',
          headers: {
            host,
            ...extraHeaders,
          },
        },
        (res) => {
          let body = '';
          res.setEncoding('utf-8');
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => resolve({ statusCode: res.statusCode || 0, headers: res.headers, body }));
        }
      );
      req.on('error', reject);
      req.end();
    });
  }

  try {
    // -----------------------------------------------------------------------
    // TEST G: UNKNOWN ROUTES RETURN 404
    // -----------------------------------------------------------------------
    console.log('\n[TEST G] Testing real HTTP 404 responses for unknown routes...');
    const unknownPaths = [
      '/this-page-does-not-exist',
      '/random-seo-page-123',
      '/countries/not-a-country',
      '/cities/not-a-city',
      '/guides/not-a-guide',
    ];

    for (const p of unknownPaths) {
      const res = await testRequest('www.livworthy.com', p);
      assert(res.statusCode === 404, `${p} must return HTTP 404 (got ${res.statusCode})`);
      assert(!res.body.includes('Is My Salary Enough? — LivWorthy'), `${p} must not return homepage SPA shell`);
      assert(res.body.includes('404') || res.body.includes('Page Not Found'), `${p} response body must indicate 404 error`);
    }
    console.log('PASS: All unknown paths strictly return HTTP 404 (no soft 404s).');

    // -----------------------------------------------------------------------
    // TEST H: STANDARDIZE TRAILING-SLASH POLICY
    // Trailing slash redirects to non-trailing slash (except homepage /)
    // -----------------------------------------------------------------------
    console.log('\n[TEST H] Testing trailing-slash normalization (NO trailing slash except homepage)...');
    
    // Valid canonical URLs return 200 directly
    const rRoot = await testRequest('www.livworthy.com', '/');
    assert(rRoot.statusCode === 200, `Homepage / must return HTTP 200 directly (got ${rRoot.statusCode})`);

    const rAbout = await testRequest('www.livworthy.com', '/about');
    assert(rAbout.statusCode === 200, `/about must return HTTP 200 directly (got ${rAbout.statusCode})`);

    const rCountries = await testRequest('www.livworthy.com', '/countries');
    assert(rCountries.statusCode === 200, `/countries must return HTTP 200 directly (got ${rCountries.statusCode})`);

    const rCompare = await testRequest('www.livworthy.com', '/compare');
    assert(rCompare.statusCode === 200, `/compare must return HTTP 200 directly (got ${rCompare.statusCode})`);

    // Trailing slash requests return 308 redirect to non-trailing slash URL
    const trailingCases = [
      { from: '/about/', to: '/about' },
      { from: '/countries/us/', to: '/countries/us' },
      { from: '/cities/nyc/', to: '/cities/nyc' },
      { from: '/guides/nyc-100k/', to: '/guides/nyc-100k' },
      { from: '/compare/new-york-vs-london/', to: '/compare/new-york-vs-london' },
      { from: '/about/?tab=test', to: '/about?tab=test' },
    ];

    for (const tc of trailingCases) {
      const res = await testRequest('www.livworthy.com', tc.from);
      assert(res.statusCode === 308, `${tc.from} must return 308 redirect (got ${res.statusCode})`);
      assert(res.headers.location === tc.to, `${tc.from} must redirect to ${tc.to} (got ${res.headers.location})`);
    }
    console.log('PASS: Trailing-slash policy strictly enforced with 308 redirects.');

    // Reject multiple leading slashes to prevent protocol-relative/network-path redirects
    const multiSlashCases = ['//attacker.com', '//attacker.com/', '///test', '////about/'];
    for (const ms of multiSlashCases) {
      const res = await testRequest('www.livworthy.com', ms);
      assert(res.statusCode === 400, `${ms} must be rejected with HTTP 400 Bad Request (got ${res.statusCode})`);
    }
    console.log('PASS: Paths with multiple leading slashes rejected with HTTP 400 (preventing network-path open redirect).');

    // -----------------------------------------------------------------------
    // TEST I: APEX -> WWW NORMALIZATION IN SINGLE HOP
    // -----------------------------------------------------------------------
    console.log('\n[TEST I] Testing Apex host (livworthy.com) -> www normalization in a single hop...');
    const rApexRoot = await testRequest('livworthy.com', '/');
    assert(rApexRoot.statusCode === 308, `livworthy.com / must return 308 (got ${rApexRoot.statusCode})`);
    assert(rApexRoot.headers.location === 'https://www.livworthy.com/', `livworthy.com / location must be https://www.livworthy.com/ (got ${rApexRoot.headers.location})`);

    const rApexAbout = await testRequest('livworthy.com', '/about');
    assert(rApexAbout.statusCode === 308, `livworthy.com /about must return 308 (got ${rApexAbout.statusCode})`);
    assert(rApexAbout.headers.location === 'https://www.livworthy.com/about', `livworthy.com /about location must be https://www.livworthy.com/about (got ${rApexAbout.headers.location})`);

    const rApexQuery = await testRequest('livworthy.com', '/guides/nyc-100k?x=1');
    assert(rApexQuery.statusCode === 308, `livworthy.com with query must return 308 (got ${rApexQuery.statusCode})`);
    assert(
      rApexQuery.headers.location === 'https://www.livworthy.com/guides/nyc-100k?x=1',
      `Apex query string must be preserved (got ${rApexQuery.headers.location})`
    );

    // Verify consolidated legacy guide redirect with query preservation
    const rLegacyGuide = await testRequest('livworthy.com', '/guides/100k-salary-new-york?x=1');
    assert(rLegacyGuide.statusCode === 308, `Legacy guide must return 308 (got ${rLegacyGuide.statusCode})`);
    assert(
      rLegacyGuide.headers.location === 'https://www.livworthy.com/guides/nyc-100k?x=1',
      `Legacy guide must redirect to canonical nyc-100k with query preserved (got ${rLegacyGuide.headers.location})`
    );

    // Apex with trailing slash -> directly redirects to www without trailing slash in a SINGLE hop!
    const rApexTrailing = await testRequest('livworthy.com', '/about/');
    assert(rApexTrailing.statusCode === 308, `livworthy.com /about/ must return 308 (got ${rApexTrailing.statusCode})`);
    assert(
      rApexTrailing.headers.location === 'https://www.livworthy.com/about',
      `livworthy.com /about/ must redirect directly to https://www.livworthy.com/about in 1 hop (got ${rApexTrailing.headers.location})`
    );

    // X-Forwarded-Host apex handling
    const rProxy = await testRequest('some-proxy.internal', '/countries/us', { 'x-forwarded-host': 'livworthy.com' });
    assert(rProxy.statusCode === 308, `x-forwarded-host livworthy.com must return 308 (got ${rProxy.statusCode})`);
    assert(
      rProxy.headers.location === 'https://www.livworthy.com/countries/us',
      `x-forwarded-host must redirect to https://www.livworthy.com/countries/us (got ${rProxy.headers.location})`
    );

    console.log('PASS: Apex to www host normalization passes with path/query preservation in a single hop.');

    // -----------------------------------------------------------------------
    // TEST I.2: LEGACY GUIDE REDIRECTS (1-HOP FROM BOTH WWW AND APEX)
    // -----------------------------------------------------------------------
    console.log('\n[TEST I.2] Testing Legacy Guide single-hop redirects from www and apex...');
    const legacyRedirectCases = [
      { from: '/guides/london-60k', to: 'https://www.livworthy.com/guides/london-75k' },
      { from: '/guides/toronto-90k', to: 'https://www.livworthy.com/guides/toronto-100k' },
      { from: '/guides/dubai-30k', to: 'https://www.livworthy.com/guides/dubai-300k' },
      { from: '/guides/singapore-10k', to: 'https://www.livworthy.com/guides/singapore-120k' },
      { from: '/guides/berlin-65k', to: 'https://www.livworthy.com/guides/berlin-80k' },
      { from: '/guides/london-60k/', to: 'https://www.livworthy.com/guides/london-75k' },
      { from: '/guides/london-60k?ref=salary', to: 'https://www.livworthy.com/guides/london-75k?ref=salary' },
    ];

    for (const lrc of legacyRedirectCases) {
      // From www
      const resWww = await testRequest('www.livworthy.com', lrc.from);
      assert(resWww.statusCode === 308, `www ${lrc.from} must return 308 (got ${resWww.statusCode})`);
      assert(resWww.headers.location === lrc.to, `www ${lrc.from} must redirect to ${lrc.to} in 1 hop (got ${resWww.headers.location})`);

      // From apex
      const resApex = await testRequest('livworthy.com', lrc.from);
      assert(resApex.statusCode === 308, `apex ${lrc.from} must return 308 (got ${resApex.statusCode})`);
      assert(resApex.headers.location === lrc.to, `apex ${lrc.from} must redirect directly to ${lrc.to} in 1 hop (got ${resApex.headers.location})`);
    }
    console.log('PASS: Legacy guide redirects resolve in exactly ONE hop from both www and apex hosts.');

    // -----------------------------------------------------------------------
    // TEST I.3: GOOGLEBOT REQUEST SIMULATION
    // -----------------------------------------------------------------------
    console.log('\n[TEST I.3] Testing Googlebot User-Agent requests...');
    const botPaths = ['/', '/about', '/countries/us', '/cities/nyc', '/guides/nyc-100k'];
    for (const bp of botPaths) {
      const resBot = await testRequest('www.livworthy.com', bp, {
        'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      });
      assert(resBot.statusCode === 200, `Googlebot requesting ${bp} must receive HTTP 200 (got ${resBot.statusCode})`);
      assert(!resBot.headers['x-robots-tag']?.includes('noindex'), `Googlebot ${bp} must not have X-Robots-Tag: noindex`);
      assert(!resBot.headers.location, `Googlebot ${bp} must not trigger bot-specific redirect`);
    }
    console.log('PASS: Googlebot receives identical clean 200 responses without bot-specific challenges or redirects.');
  } finally {
    server.close();
  }

  // =========================================================================
  // TEST J: NO PREVIEW DOMAINS & ARCHITECTURE HYGIENE
  // Verify wrangler.jsonc and public/_redirects are removed.
  // Verify zero references to preview domains in generated SEO assets.
  // =========================================================================
  console.log('\n[TEST J] Auditing deployment architecture hygiene & absence of preview domains...');
  
  assert(!fs.existsSync(path.resolve('wrangler.jsonc')), 'wrangler.jsonc must be removed (no Cloudflare Workers SPA fallback conflict)');
  assert(!fs.existsSync(path.resolve('public/_redirects')), 'public/_redirects must be removed (no unsupported/redundant domain redirects)');
  assert(!fs.existsSync(path.resolve('.wrangler')), '.wrangler directory must be removed');

  const vercelPath = path.resolve('vercel.json');
  assert(fs.existsSync(vercelPath), 'vercel.json must exist as deployment authority');
  const vercelJson = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
  assert(vercelJson.cleanUrls === true, 'vercel.json must specify cleanUrls: true');
  assert(vercelJson.trailingSlash === false, 'vercel.json must specify trailingSlash: false');

  // Verify robots.txt clean grouping
  const distRobots = fs.readFileSync(path.join(distDir, 'robots.txt'), 'utf-8');
  assert(distRobots.includes('User-agent: *'), 'dist/robots.txt must configure User-agent: *');
  assert(distRobots.includes('Disallow: /api/'), 'dist/robots.txt must disallow /api/');
  assert(/^Disallow:\s*\/admin\s*$/m.test(distRobots), 'dist/robots.txt must disallow /admin (covering exact route and descendants)');
  assert(distRobots.includes('Disallow: /test/'), 'dist/robots.txt must disallow /test/');
  assert(distRobots.includes('Sitemap: https://www.livworthy.com/sitemap.xml'), 'dist/robots.txt points to sitemap.xml');
  assert(!distRobots.includes('User-agent: Googlebot\nAllow: /'), 'dist/robots.txt must not contain a bot-specific group that bypasses disallows');

  // Verify llms.txt uses https://www.livworthy.com
  const distLlms = fs.readFileSync(path.join(distDir, 'llms.txt'), 'utf-8');
  assert(!distLlms.includes('https://livworthy.com/'), 'llms.txt must not contain apex URLs');
  assert(!distLlms.includes('livworthy.vercel.app'), 'llms.txt must not contain vercel.app URLs');
  assert(distLlms.includes('https://www.livworthy.com/compare'), 'llms.txt includes /compare directory');

  console.log('PASS: Architecture hygiene verified. Vercel authority established. Cloudflare conflicts eliminated.');

  // =========================================================================
  // TEST K: SITEMAP QUALITY & AUDIT CONSISTENCY INVARIANT
  // 1. All sitemap URLs must be: non-redirect, indexable, self-canonical, not noindex, zero duplicates
  // 2. Route inventory indexable paths must correspond to real generated HTML files in dist/
  // =========================================================================
  console.log('\n[TEST K] Verifying sitemap quality and route audit consistency...');
  const sitemapXmlFiles = fs.readdirSync(distDir).filter((f) => f.startsWith('sitemap-') && f.endsWith('.xml'));
  const visitedUrls = new Set<string>();

  for (const smFile of sitemapXmlFiles) {
    const smContent = fs.readFileSync(path.join(distDir, smFile), 'utf-8');
    const urls = [...smContent.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

    for (const url of urls) {
      assert(!visitedUrls.has(url), `Duplicate sitemap URL detected across sitemaps: ${url}`);
      visitedUrls.add(url);

      const parsed = new URL(url);
      const subpath = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
      const htmlFile = subpath === '' ? path.join(distDir, 'index.html') : path.join(distDir, subpath, 'index.html');

      assert(fs.existsSync(htmlFile), `Sitemap URL ${url} must exist in dist/ as ${path.relative(distDir, htmlFile)}`);
      const html = fs.readFileSync(htmlFile, 'utf-8');

      // Must NOT have noindex
      assert(!html.includes('content="noindex'), `Sitemap URL ${url} must not declare noindex`);

      // Must have self-canonical
      const canMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
      assert(Boolean(canMatch), `Sitemap URL ${url} must have canonical link tag`);
      assert(canMatch![1] === url, `Sitemap URL ${url} must be self-canonical (got ${canMatch![1]})`);
    }
  }

  // Audit consistency check
  const { generateRouteInventory } = await import('../../scripts/audit-route-inventory');
  const inventory = generateRouteInventory();
  for (const entry of inventory.routes) {
    if (entry.isIndexable) {
      const subpath = entry.path.replace(/^\//, '').replace(/\/$/, '');
      const htmlFile = subpath === '' ? path.join(distDir, 'index.html') : path.join(distDir, subpath, 'index.html');
      assert(
        fs.existsSync(htmlFile),
        `Audit route ${entry.path} marked as indexable must exist in dist/ (${path.relative(distDir, htmlFile)})`
      );
    }
  }
  console.log(`PASS: Verified ${visitedUrls.size} sitemap URLs are self-canonical, indexable, and 100% consistent with route inventory.`);

  console.log('\n======================================================');
  console.log('ALL SEO & ROUTING TECHNICAL INVARIANTS (A-K) PASSED!');
  console.log('======================================================\n');
}

runRegressionSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
