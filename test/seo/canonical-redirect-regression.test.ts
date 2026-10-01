process.env.NODE_ENV = 'test';
process.env.SKIP_SERVER_START = 'true';
import fs from 'fs';
import path from 'path';
import { app } from '../../server';
import http from 'http';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
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
  console.log('--- LIVWORTHY CANONICAL & REDIRECT REGRESSION SUITE ---');

  const distDir = path.resolve('dist');
  const publicDir = path.resolve('public');

  assert(fs.existsSync(distDir), 'dist directory must exist');

  // [1/5] Audit all generated HTML files in dist/
  console.log('\n[1/5] Auditing Canonical & OpenGraph tags across all generated HTML files...');
  const allHtmlFiles = getAllFiles(distDir).filter((f) => f.endsWith('.html'));
  assert(allHtmlFiles.length > 50, `Expected >50 prerendered HTML files, found: ${allHtmlFiles.length}`);

  let auditedHtmlCount = 0;
  for (const htmlPath of allHtmlFiles) {
    const rel = path.relative(distDir, htmlPath);
    const content = fs.readFileSync(htmlPath, 'utf-8');

    // 1. Canonical tag must exist and must use www.livworthy.com
    const canonicalMatch = content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
    assert(!!canonicalMatch, `${rel} must contain a canonical link`);
    const canonicalUrl = canonicalMatch![1];
    assert(
      canonicalUrl.startsWith('https://www.livworthy.com/'),
      `${rel} canonicalUrl must start with https://www.livworthy.com/ (got ${canonicalUrl})`
    );
    assert(
      !canonicalUrl.includes('https://livworthy.com/') || canonicalUrl.includes('https://www.livworthy.com/'),
      `${rel} canonical must not point to non-www livworthy.com`
    );

    // 2. OpenGraph og:url must match canonical www host
    const ogMatch = content.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i);
    if (ogMatch) {
      const ogUrl = ogMatch[1];
      assert(
        ogUrl.startsWith('https://www.livworthy.com/'),
        `${rel} og:url must start with https://www.livworthy.com/ (got ${ogUrl})`
      );
    }

    // 3. No non-www livworthy.com in JSON-LD structured data URLs
    const jsonLdMatches = content.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const block of jsonLdMatches) {
        assert(
          !block.includes('"https://livworthy.com/'),
          `${rel} structured data must not contain non-www "https://livworthy.com/`
        );
      }
    }

    auditedHtmlCount++;
  }
  console.log(`Verified ${auditedHtmlCount} HTML files. All strictly declare https://www.livworthy.com/.`);

  // [2/5] Audit Sitemaps in dist/ and public/
  console.log('\n[2/5] Auditing Sitemaps in dist/ and public/...');
  const sitemapFiles = ['sitemap.xml', 'sitemap-main.xml', 'sitemap-countries.xml', 'sitemap-cities.xml', 'sitemap-comparisons.xml', 'sitemap-guides.xml'];

  for (const smName of sitemapFiles) {
    const smPath = path.join(distDir, smName);
    assert(fs.existsSync(smPath), `${smName} must exist in dist`);
    const smContent = fs.readFileSync(smPath, 'utf-8');

    // Extract all <loc> elements
    const locMatches = [...smContent.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    assert(locMatches.length > 0, `${smName} must contain at least one <loc> entry`);

    for (const loc of locMatches) {
      assert(
        loc.startsWith('https://www.livworthy.com/'),
        `${smName} location must start with https://www.livworthy.com/ (got ${loc})`
      );
      assert(
        !loc.startsWith('https://livworthy.com/'),
        `${smName} location must not be non-www (got ${loc})`
      );
    }
  }
  console.log('Verified all sitemap index and segmented sitemap files contain 100% www URLs.');

  // [3/5] Audit robots.txt
  console.log('\n[3/5] Auditing robots.txt Sitemap directive...');
  const distRobots = fs.readFileSync(path.join(distDir, 'robots.txt'), 'utf-8');
  const pubRobots = fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf-8');
  assert(
    distRobots.includes('Sitemap: https://www.livworthy.com/sitemap.xml'),
    'dist/robots.txt must point to https://www.livworthy.com/sitemap.xml'
  );
  assert(
    !distRobots.includes('Sitemap: https://livworthy.com/sitemap.xml'),
    'dist/robots.txt must not reference non-www sitemap'
  );
  assert(
    pubRobots.includes('Sitemap: https://www.livworthy.com/sitemap.xml'),
    'public/robots.txt must point to https://www.livworthy.com/sitemap.xml'
  );

  // [4/5] Audit Static Redirect Rules (Cloudflare & Vercel)
  console.log('\n[4/5] Auditing Cloudflare _redirects & Vercel config...');
  const redirectsPath = path.join(publicDir, '_redirects');
  assert(fs.existsSync(redirectsPath), 'public/_redirects must exist');
  const redirectsContent = fs.readFileSync(redirectsPath, 'utf-8');
  assert(
    redirectsContent.includes('https://livworthy.com/* https://www.livworthy.com/:splat 301'),
    '_redirects must have 301 rule for https://livworthy.com/*'
  );

  const vercelPath = path.resolve('vercel.json');
  assert(fs.existsSync(vercelPath), 'vercel.json must exist');
  const vercelJson = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
  assert(Array.isArray(vercelJson.redirects), 'vercel.json must contain redirects array');
  const hostRedirect = vercelJson.redirects.find(
    (r: any) => r.has && r.has.some((h: any) => h.type === 'host' && h.value === 'livworthy.com')
  );
  assert(!!hostRedirect, 'vercel.json must redirect livworthy.com host');
  assert(hostRedirect.destination === 'https://www.livworthy.com/:path*', 'vercel redirect destination must be https://www.livworthy.com/:path*');
  assert(hostRedirect.permanent === true, 'vercel redirect must be permanent');

  // [5/5] Server Redirection Middleware Verification (Simulated HTTP Requests)
  console.log('\n[5/5] Testing Express Server Redirection Middleware & Loop Prevention...');
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;

  async function testRequest(host: string, reqPath: string, extraHeaders: Record<string, string> = {}) {
    return new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders }>((resolve, reject) => {
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
          resolve({ statusCode: res.statusCode || 0, headers: res.headers });
        }
      );
      req.on('error', reject);
      req.end();
    });
  }

  try {
    // Test 5a: Apex host -> 308 redirect to https://www.livworthy.com/
    const r1 = await testRequest('livworthy.com', '/');
    assert(r1.statusCode === 308, `livworthy.com / must return 308 (got ${r1.statusCode})`);
    assert(r1.headers.location === 'https://www.livworthy.com/', `livworthy.com / location must be https://www.livworthy.com/ (got ${r1.headers.location})`);

    // Test 5b: Apex host with subpath -> preserves subpath
    const r2 = await testRequest('livworthy.com', '/about');
    assert(r2.statusCode === 308, `livworthy.com /about must return 308 (got ${r2.statusCode})`);
    assert(r2.headers.location === 'https://www.livworthy.com/about', `livworthy.com /about location must be https://www.livworthy.com/about (got ${r2.headers.location})`);

    // Test 5c: Apex host with query parameters -> preserves query params
    const r3 = await testRequest('livworthy.com', '/?city=sydney&tab=salary-after-tax');
    assert(r3.statusCode === 308, `livworthy.com with query must return 308 (got ${r3.statusCode})`);
    assert(
      r3.headers.location === 'https://www.livworthy.com/?city=sydney&tab=salary-after-tax',
      `Query params must be preserved (got ${r3.headers.location})`
    );

    // Test 5d: X-Forwarded-Host apex -> 308 redirect
    const r4 = await testRequest('some-proxy.internal', '/countries/us', { 'x-forwarded-host': 'livworthy.com' });
    assert(r4.statusCode === 308, `x-forwarded-host livworthy.com must return 308 (got ${r4.statusCode})`);
    assert(
      r4.headers.location === 'https://www.livworthy.com/countries/us',
      `x-forwarded-host must redirect to https://www.livworthy.com/countries/us (got ${r4.headers.location})`
    );

    // Test 5e: www.livworthy.com host -> does NOT redirect (prevents redirect loop)
    const r5 = await testRequest('www.livworthy.com', '/api/health');
    assert(r5.statusCode !== 308 && r5.statusCode !== 301, `www.livworthy.com must NOT redirect (got ${r5.statusCode})`);
    assert(!r5.headers.location, `www.livworthy.com must not return location header`);

    console.log('PASS: Canonical redirect middleware successfully validated with path and query preservation and zero loops.');
  } finally {
    server.close();
  }

  console.log('\n======================================================');
  console.log('ALL CANONICAL & REDIRECT REGRESSION INVARIANTS PASSED!');
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
