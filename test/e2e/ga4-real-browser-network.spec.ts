import { test, expect } from '@playwright/test';

test.describe('GA4 Real Browser Network Requests & Privacy Verification', () => {
  test('1. Static SEO page: records exactly 1 pageview without requiring React SPA', async ({ page }) => {
    const collectRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('google-analytics.com/g/collect') || url.includes('/g/collect')) {
        collectRequests.push(url);
      }
    });

    // Navigate to a static prerendered city page
    const response = await page.goto('/cities/london', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    // Wait for analytics scripts to execute
    await page.waitForTimeout(1500);

    // Verify React module is NOT loaded on static page
    const reactApp = await page.$('#root > div');
    const hasModuleScript = await page.$('script[type="module"]');
    expect(hasModuleScript).toBeNull();

    // Verify dataLayer had the page_view event pushed
    const dataLayer = await page.evaluate(() => (window as any).dataLayer || []);
    const pageViewsInLayer = dataLayer.filter((item: any) => item[0] === 'event' && item[1] === 'page_view');
    expect(pageViewsInLayer.length).toBe(1);

    const pvParams = pageViewsInLayer[0][2];
    expect(pvParams.page_path).toBe('/cities/london');
    expect(pvParams.page_title).toContain('London');
    expect(pvParams.page_location).toContain('/cities/london');
    expect(pvParams.page_location).not.toContain('salary');

    // If network to Google Analytics was reached, verify outbound request
    if (collectRequests.length > 0) {
      const pvHits = collectRequests.filter((u) => u.includes('en=page_view') || !u.includes('en='));
      expect(pvHits.length).toBe(1);
    }
  });

  test('2. Interactive landing page: sanitizes salary parameters and prevents React mount duplicates', async ({ page }) => {
    const collectRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('google-analytics.com/g/collect') || url.includes('/g/collect')) {
        collectRequests.push(url);
      }
    });

    // Landing page with sensitive calculator deep link + valid UTM attribution
    const landingUrl = '/?salary=150000&rent=3500&utm_source=twitter&utm_campaign=summer2026';
    await page.goto(landingUrl, { waitUntil: 'networkidle' });

    // Verify browser address bar preserved deep link for user/calculator hydration
    expect(page.url()).toContain('salary=150000');
    expect(page.url()).toContain('rent=3500');

    // Verify dataLayer page_view count is exactly 1 (no duplicate from React mount)
    const dataLayer = await page.evaluate(() => (window as any).dataLayer || []);
    const pageViewsInLayer = dataLayer.filter((item: any) => item[0] === 'event' && item[1] === 'page_view');
    expect(pageViewsInLayer.length).toBe(1);

    const pvPayload = pageViewsInLayer[0][2];
    // Check strict query allowlist behavior:
    expect(pvPayload.page_location).not.toContain('salary=');
    expect(pvPayload.page_location).not.toContain('rent=');
    expect(pvPayload.page_location).toContain('utm_source=twitter');
    expect(pvPayload.page_location).toContain('utm_campaign=summer2026');
    expect(pvPayload.page_path).not.toContain('salary=');
    expect(pvPayload.page_path).toContain('utm_source=twitter');

    // If outbound GA requests occurred, verify network parameter scrubbing
    for (const reqUrl of collectRequests) {
      expect(reqUrl).not.toContain('salary%3D');
      expect(reqUrl).not.toContain('salary=');
      expect(reqUrl).not.toContain('rent%3D');
      expect(reqUrl).not.toContain('rent=');
    }
  });

  test('3. SPA tab navigation: records 1 virtual pageview per genuine tab switch', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Initial pageview count
    const initialPvCount = await page.evaluate(() => {
      const dl = (window as any).dataLayer || [];
      return dl.filter((item: any) => item[0] === 'event' && item[1] === 'page_view').length;
    });
    expect(initialPvCount).toBe(1);

    // Switch tab to Compare
    const compareTab = page.locator('button:has-text("Compare"), a:has-text("Compare")').first();
    if (await compareTab.isVisible()) {
      await compareTab.click();
      await page.waitForTimeout(500);

      const postNavPvCount = await page.evaluate(() => {
        const dl = (window as any).dataLayer || [];
        return dl.filter((item: any) => item[0] === 'event' && item[1] === 'page_view').length;
      });
      expect(postNavPvCount).toBe(2);
    }
  });

  test('4. Query-only state updates: slider adjustments emit ZERO additional pageviews', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const beforeSliderPvCount = await page.evaluate(() => {
      const dl = (window as any).dataLayer || [];
      return dl.filter((item: any) => item[0] === 'event' && item[1] === 'page_view').length;
    });

    // Simulate 10 rapid slider updates via window.history.replaceState
    await page.evaluate(() => {
      for (let s = 100000; s <= 150000; s += 5000) {
        window.history.replaceState(null, '', `/?salary=${s}&rent=2500`);
      }
    });
    await page.waitForTimeout(600);

    const afterSliderPvCount = await page.evaluate(() => {
      const dl = (window as any).dataLayer || [];
      return dl.filter((item: any) => item[0] === 'event' && item[1] === 'page_view').length;
    });

    // Must be identical: zero artificial pageviews on slider scrubbing
    expect(afterSliderPvCount).toBe(beforeSliderPvCount);
  });

  test('5. 404 error page: dispatches page_not_found with sanitized path and zero PII', async ({ page }) => {
    await page.goto('/non-existent-page-test-404?salary=250000&token=supersecret123', {
      waitUntil: 'domcontentloaded',
    });

    const dataLayer = await page.evaluate(() => (window as any).dataLayer || []);
    const notFoundEvents = dataLayer.filter((item: any) => item[0] === 'event' && item[1] === 'page_not_found');
    expect(notFoundEvents.length).toBe(1);

    const nfParams = notFoundEvents[0][2];
    expect(nfParams.page_path).toBe('/non-existent-page-test-404');
    expect(nfParams.page_path).not.toContain('salary');
    expect(nfParams.page_path).not.toContain('supersecret123');
    expect(nfParams.page_location).not.toContain('salary');
    expect(nfParams.page_location).not.toContain('supersecret123');
  });

  test('6. Consent Mode v2: defaults to denied and updates to granted on consent', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const dataLayer = await page.evaluate(() => (window as any).dataLayer || []);

    // Verify default consent was denied
    const defaultConsent = dataLayer.find((item: any) => item[0] === 'consent' && item[1] === 'default');
    expect(defaultConsent).toBeDefined();
    expect(defaultConsent[2].analytics_storage).toBe('denied');

    // Click Accept Cookies banner
    const acceptBtn = page.locator('button:has-text("Accept All"), button:has-text("Accept")').first();
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      await page.waitForTimeout(300);

      const updatedDataLayer = await page.evaluate(() => (window as any).dataLayer || []);
      const updateConsent = updatedDataLayer.find((item: any) => item[0] === 'consent' && item[1] === 'update');
      expect(updateConsent).toBeDefined();
      expect(updateConsent[2].analytics_storage).toBe('granted');
    }
  });
});

