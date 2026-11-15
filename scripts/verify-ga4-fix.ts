import { chromium } from '@playwright/test';
import http from 'http';

process.env.SKIP_SERVER_START = 'true';
process.env.SERVE_STATIC = 'true';
process.env.NODE_ENV = 'production';

interface CapturedEvent {
  en: string | null;
  gcs: string | null;
  gcd: string | null;
  sid: string | null;
  traffic_type: string | null;
  dp: string | null;
}

function attachCollector(page: any, events: CapturedEvent[]) {
  page.on('request', (req: any) => {
    const u = req.url();
    if (u.includes('google-analytics.com/g/collect') || u.includes('/g/collect')) {
      const parsed = new URL(u);
      const queryEn = parsed.searchParams.get('en');
      const gcs = parsed.searchParams.get('gcs');
      const gcd = parsed.searchParams.get('gcd');
      const sid = parsed.searchParams.get('sid');
      const traffic_type =
        parsed.searchParams.get('ep.traffic_type') ||
        parsed.searchParams.get('traffic_type') ||
        parsed.searchParams.get('tt');
      const dp = parsed.searchParams.get('dp');

      if (queryEn) {
        events.push({ en: queryEn, gcs, gcd, sid, traffic_type, dp });
      }

      const body = req.postData();
      if (body) {
        const lines = body.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          const sp = new URLSearchParams(line);
          const en = sp.get('en');
          if (en) {
            events.push({
              en,
              gcs,
              gcd,
              sid,
              traffic_type,
              dp: sp.get('dp'),
            });
          }
        }
      }
    }
  });
}

async function verifyGA4Fix() {
  console.log('🧪 Verifying GA4 Zero Active Users Fix on Built Static & SPA Distribution...\n');

  const { app } = await import('../server');
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(3377, resolve));

  const browser = await chromium.launch({ headless: true });

  // TEST A: Static Non-React Prerendered Page (/guides/nyc-100k)
  console.log('--- TEST A: Static Prerendered Page (/guides/nyc-100k) ---');
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    const events: CapturedEvent[] = [];
    attachCollector(page, events);

    console.log('Navigating to http://localhost:3377/guides/nyc-100k...');
    await page.goto('http://localhost:3377/guides/nyc-100k', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const banner = page.locator('#cookie-consent-banner');
    const isBannerVisible = await banner.isVisible();
    console.log(`Cookie banner visible on static page: ${isBannerVisible}`);

    console.log('Events on initial load (unconsented):', events.length);
    if (events.length > 0) {
      console.log('Initial event:', JSON.stringify(events[0], null, 2));
    }

    // Now click Accept All on the static page banner
    console.log('Clicking #btn-cookie-accept-all on static page...');
    const acceptBtn = page.locator('#btn-cookie-accept-all');
    await acceptBtn.click();
    await page.waitForTimeout(1500);

    const isBannerVisibleAfter = await banner.isVisible();
    console.log(`Cookie banner visible after accept: ${isBannerVisibleAfter}`);

    console.log(`Total events after accepting consent: ${events.length}`);
    for (let i = 0; i < events.length; i++) {
      console.log(`  Event #${i + 1}: en=${events[i].en}, gcs=${events[i].gcs}, gcd=${events[i].gcd}, dp=${events[i].dp}`);
    }

    const consentInStorage = await page.evaluate(() => localStorage.getItem('livworthy_cookie_consent'));
    console.log('Saved consent in localStorage:', consentInStorage);

    const passed =
      isBannerVisible &&
      !isBannerVisibleAfter &&
      events.length >= 2 &&
      events[0].gcs === 'G100' &&
      events.some((e) => e.gcs === 'G111');

    console.log(`TEST A RESULT: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
    if (!passed) {
      throw new Error('Test A failed: Static page cookie banner or granted consent transition failure');
    }

    await context.close();
  }

  // TEST B: Interactive SPA Homepage (/) Single Pageview & Granted Pageview
  console.log('--- TEST B: Interactive SPA Homepage (/) ---');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const events: CapturedEvent[] = [];
    attachCollector(page, events);

    console.log('Navigating to http://localhost:3377/ ...');
    await page.goto('http://localhost:3377/', { waitUntil: 'load' });
    await page.waitForTimeout(3000); // Wait long enough to ensure no delayed React mount duplicate

    console.log(`Events on homepage initial load (unconsented): ${events.length}`);
    for (let i = 0; i < events.length; i++) {
      console.log(`  Initial Event #${i + 1}: en=${events[i].en}, gcs=${events[i].gcs}, dp=${events[i].dp}`);
    }

    // Must be EXACTLY 1 pageview initially (no React hydration race duplicate)
    const initialPageViews = events.filter((e) => e.en === 'page_view');
    console.log(`Initial pageviews observed: ${initialPageViews.length}`);

    // Click Accept All
    console.log('Clicking Accept All on homepage...');
    const acceptBtn = page.locator('#btn-cookie-accept-all');
    console.log(`Accept button visible on homepage: ${await acceptBtn.isVisible()}`);
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      await page.waitForTimeout(2000);
    }

    const postConsentPageViews = events.filter((e) => e.en === 'page_view');
    console.log(`Total pageviews after consent granted: ${postConsentPageViews.length}`);
    const hasGrantedPing = events.some((e) => e.gcs === 'G111');
    console.log(`Granted G111 event observed: ${hasGrantedPing}`);

    // Navigate to /compare
    console.log('Navigating to /compare via tab click...');
    const compareTab = page.locator('#tab-compare');
    if (await compareTab.isVisible()) {
      await compareTab.click();
      console.log('Waiting for gtag batch flush...');
      await page.waitForTimeout(6000);
    }

    const postNavPageViews = events.filter((e) => e.en === 'page_view');
    console.log(`Total pageviews after SPA navigation to /compare: ${postNavPageViews.length}`);
    for (let i = 0; i < events.length; i++) {
      console.log(`  [${i + 1}] en=${events[i].en}, gcs=${events[i].gcs}, gcd=${events[i].gcd}, dp=${events[i].dp}`);
    }

    console.log('DEBUG:', {
      c1: initialPageViews.length === 1,
      c2: hasGrantedPing,
      c3: postNavPageViews.length >= 2,
      c4: events.some((e) => e.dp && decodeURIComponent(e.dp).includes('/compare')),
    });

    const passed =
      initialPageViews.length === 1 &&
      hasGrantedPing &&
      postNavPageViews.length >= 2 && // initial + nav
      events.some((e) => e.dp && decodeURIComponent(e.dp).includes('/compare'));

    console.log(`TEST B RESULT: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
    if (!passed) {
      throw new Error(`Test B failed: expected 1 initial, granted event, and nav pageview`);
    }

    await context.close();
  }

  await browser.close();
  server.close();

  console.log('🎉 ALL GA4 ZERO ACTIVE USERS DIAGNOSTIC & FIX TESTS PASSED 100%!');
}

verifyGA4Fix().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
