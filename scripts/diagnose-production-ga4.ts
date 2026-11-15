import { chromium } from '@playwright/test';

interface CapturedRequest {
  url: string;
  method: string;
  postData: string | null;
  status?: number;
  params: Record<string, string>;
}

function parseUrlParams(urlStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    const parsed = new URL(urlStr);
    parsed.searchParams.forEach((val, key) => {
      result[key] = val;
    });
  } catch {}
  return result;
}

async function diagnoseGA4() {
  console.log('🔍 Starting in-depth GA4 Diagnostic on https://www.livworthy.com ...\n');

  const browser = await chromium.launch({ headless: true });

  // TEST 1: Fresh user, Consent Denied by default (first arrival)
  console.log('--- TEST 1: Fresh Visit (Consent Default: Denied) ---');
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    const requests: CapturedRequest[] = [];
    const consoleLogs: string[] = [];

    page.on('console', (msg) => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('request', (req) => {
      const u = req.url();
      if (u.includes('google-analytics.com') || u.includes('googletagmanager.com')) {
        requests.push({
          url: u,
          method: req.method(),
          postData: req.postData(),
          params: parseUrlParams(u),
        });
      }
    });

    page.on('response', (res) => {
      const u = res.url();
      const matched = requests.find((r) => r.url === u);
      if (matched) {
        matched.status = res.status();
      }
    });

    await page.goto('https://www.livworthy.com/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log(`Console logs count: ${consoleLogs.length}`);
    const errors = consoleLogs.filter((l) => l.startsWith('[error]'));
    if (errors.length) {
      console.log('Console Errors:', errors);
    }

    console.log(`Network requests to GA/GTM count: ${requests.length}`);
    for (const r of requests) {
      const shortUrl = r.url.length > 100 ? r.url.substring(0, 100) + '...' : r.url;
      console.log(`  -> ${r.method} [Status: ${r.status || 'unknown'}] ${shortUrl}`);
      if (r.url.includes('/g/collect') || r.url.includes('/collect')) {
        console.log(`     TID: ${r.params['tid']}, Event: ${r.params['en']}, GCS: ${r.params['gcs']}, GCD: ${r.params['gcd']}, SID: ${r.params['sid']}, EP.page_path: ${r.params['ep.page_path']}`);
        if (r.postData) {
          console.log(`     POST Body: ${r.postData.substring(0, 300)}`);
        }
      }
    }

    const dataLayer = await page.evaluate(() => (window as any).dataLayer);
    console.log('Window dataLayer snapshot:');
    console.log(JSON.stringify(dataLayer, null, 2));

    await context.close();
  }

  // TEST 2: User Grants Consent via Cookie Banner
  console.log('\n--- TEST 2: User Clicks "Accept All" on Cookie Banner ---');
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    const requests: CapturedRequest[] = [];
    page.on('request', (req) => {
      const u = req.url();
      if (u.includes('google-analytics.com') || u.includes('googletagmanager.com')) {
        requests.push({
          url: u,
          method: req.method(),
          postData: req.postData(),
          params: parseUrlParams(u),
        });
      }
    });
    page.on('response', (res) => {
      const u = res.url();
      const matched = requests.find((r) => r.url === u);
      if (matched) {
        matched.status = res.status();
      }
    });

    await page.goto('https://www.livworthy.com/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const initialReqCount = requests.length;
    console.log(`Initial requests count: ${initialReqCount}`);

    // Click "Accept All" if present or inspect buttons
    const acceptBtn = page.locator('#btn-cookie-accept-all, button:has-text("Accept All"), button:has-text("Accept")');
    if (await acceptBtn.first().isVisible()) {
      console.log('Clicking Accept button...');
      await acceptBtn.first().click();
      await page.waitForTimeout(2000);
    } else {
      console.log('Accept button not directly visible, opening preferences...');
      const prefBtn = page.locator('#btn-cookie-preferences');
      if (await prefBtn.isVisible()) {
        await prefBtn.click();
        await page.waitForTimeout(500);
        const saveBtn = page.locator('#btn-cookie-save-choices');
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    console.log(`Requests after consent granted (total: ${requests.length}, new: ${requests.length - initialReqCount}):`);
    for (let i = initialReqCount; i < requests.length; i++) {
      const r = requests[i];
      console.log(`  -> ${r.method} [Status: ${r.status || 'unknown'}] ${r.url.substring(0, 100)}`);
      if (r.url.includes('/g/collect') || r.url.includes('/collect')) {
        console.log(`     TID: ${r.params['tid']}, Event: ${r.params['en']}, GCS: ${r.params['gcs']}, GCD: ${r.params['gcd']}, SID: ${r.params['sid']}, EP.page_path: ${r.params['ep.page_path']}`);
        if (r.postData) {
          console.log(`     POST Body: ${r.postData.substring(0, 300)}`);
        }
      }
    }

    // Now test SPA navigation with consent granted
    console.log('\n--- Testing SPA Navigation to /compare ---');
    const preNavReqCount = requests.length;
    const compareLink = page.locator('a[href="/compare"], #tab-compare');
    if (await compareLink.first().isVisible()) {
      await compareLink.first().click();
      await page.waitForTimeout(2000);
    } else {
      console.log('Directly navigating via window.history.pushState...');
      await page.evaluate(() => {
        window.history.pushState({}, '', '/compare');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await page.waitForTimeout(2000);
    }

    console.log(`Requests after navigation (total: ${requests.length}, new: ${requests.length - preNavReqCount}):`);
    for (let i = preNavReqCount; i < requests.length; i++) {
      const r = requests[i];
      console.log(`  -> ${r.method} [Status: ${r.status || 'unknown'}] ${r.url.substring(0, 100)}`);
      if (r.url.includes('/g/collect') || r.url.includes('/collect')) {
        console.log(`     TID: ${r.params['tid']}, Event: ${r.params['en']}, GCS: ${r.params['gcs']}, GCD: ${r.params['gcd']}, SID: ${r.params['sid']}, EP.page_path: ${r.params['ep.page_path']}`);
        if (r.postData) {
          console.log(`     POST Body: ${r.postData.substring(0, 300)}`);
        }
      }
    }

    // Test returning user (Reload page with saved consent in localStorage)
    console.log('\n--- Testing Page Reload with Pre-existing Granted Consent ---');
    const reloadContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      storageState: await context.storageState(),
    });
    const reloadPage = await reloadContext.newPage();
    const reloadRequests: CapturedRequest[] = [];
    reloadPage.on('request', (req) => {
      const u = req.url();
      if (u.includes('google-analytics.com') || u.includes('googletagmanager.com')) {
        reloadRequests.push({
          url: u,
          method: req.method(),
          postData: req.postData(),
          params: parseUrlParams(u),
        });
      }
    });
    reloadPage.on('response', (res) => {
      const u = res.url();
      const matched = reloadRequests.find((r) => r.url === u);
      if (matched) matched.status = res.status();
    });

    await reloadPage.goto('https://www.livworthy.com/', { waitUntil: 'networkidle' });
    await reloadPage.waitForTimeout(2000);

    console.log(`Reload requests count: ${reloadRequests.length}`);
    for (const r of reloadRequests) {
      console.log(`  -> ${r.method} [Status: ${r.status || 'unknown'}] ${r.url.substring(0, 100)}`);
      if (r.url.includes('/g/collect') || r.url.includes('/collect')) {
        console.log(`     TID: ${r.params['tid']}, Event: ${r.params['en']}, GCS: ${r.params['gcs']}, GCD: ${r.params['gcd']}, SID: ${r.params['sid']}, EP.page_path: ${r.params['ep.page_path']}`);
        if (r.postData) {
          console.log(`     POST Body: ${r.postData.substring(0, 300)}`);
        }
      }
    }

    await reloadContext.close();
    await context.close();
  }

  await browser.close();
  console.log('\n✅ Diagnosis test run finished.');
}

diagnoseGA4().catch(console.error);
