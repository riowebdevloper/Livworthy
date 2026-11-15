import { chromium } from '@playwright/test';

async function inspectPayloads() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const collectCalls: Array<{
    url: string;
    queryParams: Record<string, string>;
    postBody: string | null;
    parsedBody: Record<string, string>;
    status?: number;
  }> = [];

  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('google-analytics.com/g/collect') || u.includes('/g/collect')) {
      const qParams: Record<string, string> = {};
      const parsedUrl = new URL(u);
      parsedUrl.searchParams.forEach((v, k) => {
        qParams[k] = v;
      });

      const body = req.postData();
      const bParams: Record<string, string> = {};
      if (body) {
        // Body can contain multiple lines if batched, or URL-encoded form data
        const lines = body.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          const search = new URLSearchParams(line);
          search.forEach((v, k) => {
            bParams[k] = v;
          });
        }
      }

      collectCalls.push({
        url: u,
        queryParams: qParams,
        postBody: body,
        parsedBody: bParams,
      });
    }
  });

  page.on('response', (res) => {
    const u = res.url();
    const found = collectCalls.find((c) => c.url === u);
    if (found) found.status = res.status();
  });

  console.log('--- Loading https://www.livworthy.com/ with default consent ---');
  await page.goto('https://www.livworthy.com/', { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(2500);

  console.log(`Collect calls after load: ${collectCalls.length}`);
  for (let i = 0; i < collectCalls.length; i++) {
    const c = collectCalls[i];
    console.log(`\nCall #${i + 1}:`);
    console.log(`  Query params:`, JSON.stringify(c.queryParams, null, 2));
    console.log(`  Parsed body:`, JSON.stringify(c.parsedBody, null, 2));
    console.log(`  Status:`, c.status);
  }

  // Now accept consent
  console.log('\n--- Clicking Accept on Cookie Banner ---');
  const countBeforeConsent = collectCalls.length;
  const acceptBtn = page.locator('#btn-cookie-accept-all, button:has-text("Accept All"), button:has-text("Accept")');
  if (await acceptBtn.first().isVisible()) {
    await acceptBtn.first().click();
    await page.waitForTimeout(2000);
  }

  console.log(`Collect calls after consent update: ${collectCalls.length - countBeforeConsent} new calls`);
  for (let i = countBeforeConsent; i < collectCalls.length; i++) {
    const c = collectCalls[i];
    console.log(`\nCall #${i + 1} (post-consent):`);
    console.log(`  Query params:`, JSON.stringify(c.queryParams, null, 2));
    console.log(`  Parsed body:`, JSON.stringify(c.parsedBody, null, 2));
    console.log(`  Status:`, c.status);
  }

  // Now interact with calculator
  console.log('\n--- Interacting with Calculator ---');
  const countBeforeCalc = collectCalls.length;
  const calcBtn = page.locator('#btn-calculate');
  if (await calcBtn.isVisible()) {
    console.log('Clicking #btn-calculate...');
    await calcBtn.click();
    await page.waitForTimeout(2000);
  }

  console.log(`Collect calls after calculator edit: ${collectCalls.length - countBeforeCalc} new calls`);
  for (let i = countBeforeCalc; i < collectCalls.length; i++) {
    const c = collectCalls[i];
    console.log(`\nCall #${i + 1} (calculator interaction):`);
    console.log(`  Query params:`, JSON.stringify(c.queryParams, null, 2));
    console.log(`  Parsed body:`, JSON.stringify(c.parsedBody, null, 2));
    console.log(`  Status:`, c.status);
  }

  // Now navigate to a guide page (e.g. /guides/nyc-100k)
  console.log('\n--- Navigating to /guides/nyc-100k ---');
  const countBeforeNav = collectCalls.length;
  await page.goto('https://www.livworthy.com/guides/nyc-100k', { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(2500);

  console.log(`Collect calls after navigation to guide: ${collectCalls.length - countBeforeNav} new calls`);
  for (let i = countBeforeNav; i < collectCalls.length; i++) {
    const c = collectCalls[i];
    console.log(`\nCall #${i + 1} (guide navigation):`);
    console.log(`  Query params:`, JSON.stringify(c.queryParams, null, 2));
    console.log(`  Parsed body:`, JSON.stringify(c.parsedBody, null, 2));
    console.log(`  Status:`, c.status);
  }

  await browser.close();
}

inspectPayloads().catch(console.error);
