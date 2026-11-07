# LivWorthy — Core Web Vitals & Real-Browser Performance Benchmark

> **Methodology:** Measured dynamically using real Chromium browser automation with performance navigation & paint observers on the production static build (`dist/`).
> **Mobile Profile:** Mobile runs execute with 4x CPU slowdown and 1.6384 Mbps download / 750 kbps upload network throttling (Lighthouse Mobile standard profile).
> **Standard Lab Targets:** LCP ≤ 2.5s (2500ms), FCP ≤ 1.8s (1800ms), CLS ≤ 0.1, TTFB ≤ 800ms.
> **Important Scope Note:** These results represent local synthetic lab measurements on the production static bundle (`dist/`), NOT live field user data (Chrome User Experience Report / CrUX) or live production measurements.
> **Audit Timestamp:** 2026-11-07T07:10:03.209Z

## 1. Dynamically Measured Real-Browser Benchmark Summary (Lab Synthetic Profile)

| Page / Route | Viewport & Profile | TTFB | FCP | LCP (Target ≤2.5s) | CLS (Target ≤0.1) | DOM Nodes | Total Requests | Transferred Payload |
|---|---|---|---|---|---|---|---|---|
| **Homepage (Desktop)** | Desktop Unthrottled | 4ms | 108ms | 160ms (✅ LAB PASS) | 0 (✅ LAB PASS) | 799 | 24 | 1399 KB |
| **Homepage (Mobile Throttled)** | Mobile Throttled (4x CPU, 1.6M) | 6ms | 1432ms | 1524ms (✅ LAB PASS) | 0 (✅ LAB PASS) | 799 | 21 | 1375 KB |
| **NYC $100K Guide (Desktop)** | Desktop Unthrottled | 1ms | 56ms | 56ms (✅ LAB PASS) | 0 (✅ LAB PASS) | 513 | 20 | 994 KB |
| **NYC $100K Guide (Mobile Throttled)** | Mobile Throttled (4x CPU, 1.6M) | 1ms | 1292ms | 1320ms (✅ LAB PASS) | 0 (✅ LAB PASS) | 514 | 18 | 970 KB |
| **Zurich CHF 130K Guide** | Desktop Unthrottled | 1ms | 48ms | 48ms (✅ LAB PASS) | 0 (✅ LAB PASS) | 414 | 21 | 979 KB |
| **Miami $90K Guide** | Desktop Unthrottled | 1ms | 48ms | 48ms (✅ LAB PASS) | 0 (✅ LAB PASS) | 434 | 20 | 982 KB |
| **Compare Calculator (/compare)** | Desktop Unthrottled | 1ms | 40ms | 376ms (✅ LAB PASS) | 0.024 (✅ LAB PASS) | 578 | 27 | 1402 KB |
| **NYC Salary After Tax Tool** | Desktop Unthrottled | 1ms | 52ms | 52ms (✅ LAB PASS) | 0 (✅ LAB PASS) | 479 | 21 | 1401 KB |
| **NYC City Hub (/cities/nyc)** | Desktop Unthrottled | 1ms | 32ms | 32ms (✅ LAB PASS) | 0 (✅ LAB PASS) | 149 | 26 | 911 KB |
| **Spanish Tool (/es/salary-worth)** | Desktop Unthrottled | 1ms | 32ms | 76ms (✅ LAB PASS) | 0.035 (✅ LAB PASS) | 812 | 25 | 1359 KB |

## 2. Technical Waterfall & Mobile LCP Root-Cause Resolution

### Chronological LCP PerformanceObserver Trace Breakdown
Using Chrome DevTools Protocol (CDP) under Fast 4G network throttling (1.6384 Mbps down, 150ms RTT) and 4x CPU slowdown, we tracked every Largest Contentful Paint candidate during page lifecycle:

1. **Initial Paint (~1,200–1,350ms):** Static prerendered HTML instantly paints the brand image (size: ~3,888 px²) followed immediately by the hero heading `<h1 class="text-3xl sm:text-4xl font-extrabold...">What is your salary really worth?</h1>` (size: **18,460 px²**) at **~1,324ms**.
2. **The Delayed Font Swap Contender (Eliminated):** Previously, `Plus Jakarta Sans` was loaded via Google Fonts with `&display=swap`. When the web font completed downloading over 4G at ~7,000ms, the browser applied font metrics that slightly expanded the H1 from 18,460 px² to 19,240 px², triggering Chrome to re-emit the H1 as a new LCP event at 7,056ms. Switching to `&display=optional` in `index.html` eliminated late font swapping on slow connections.
3. **The Cookie Consent Banner Contender (Resolved):** Previously, `CookieConsentBanner.tsx` rendered an expansive multi-line legal paragraph measuring **29,232 to 52,514 px²**. Because its area exceeded the H1's 18,460 px², Chrome reported the late-mounting cookie banner as the final LCP candidate at ~7,100ms. Streamlining the consent notice to concise copy constrained the banner's largest text element to **< 8,500 px²**. In tested configurations (mobile 375×667, desktop 1280×800), the cookie banner did not become LCP and remained substantially smaller than the H1 across tested locales.
4. **Measured Lab Outcome:** Homepage mobile throttled synthetic LCP is now locked to the initial prerendered H1 at **~1,324–1,412ms**, achieving a **5.7-second reduction** in lab testing and meeting the lab performance target (≤2.5s).

## 3. Historical External Baselines & Multi-Pass Observations

> **Historical Observations Note:** The rows below document dated historical observations recorded on November 7, 2026. They are provided for historical reference and context, and are not dynamically re-measured on each script invocation.
> **Testing Protocol & Reproducibility:**
> - **Local Production Static Mode:** Run `npm run build && npx tsx scripts/measure-core-web-vitals.ts` to reproduce dynamic metrics.
> - **Lighthouse CLI Command:** `npx lighthouse <URL> --form-factor=mobile --screenEmulation.mobile=true --throttling-method=devtools --output=json --output-path=reports/lighthouse-mobile.json`
> - **Vercel Preview Note:** Team-level deployment protection on the PR preview URL (`livworthy-git-feat-editorial-growth-*.vercel.app`) returns HTTP 302 to Vercel SSO when accessed by unauthenticated CLI runners. Automated performance verification is therefore validated on the identical production bundle in local static serving mode and cross-referenced against live production.

### Dated Observations Ledger (Recorded November 7, 2026)

| Test Environment & Target | Method / Form Factor | Performance Score | FCP | LCP | CLS | TBT | Scope & Status |
|---|---|---|---|---|---|---|---|
| **Production Editorial Guide** (`https://www.livworthy.com/guides/nyc-100k`) | Lighthouse Mobile (DevTools Throttling) | **100 / 100** | 1.0s | 1.1s | 0.003 | 80ms | Live Production Snapshot |
| **Production Homepage (Pre-Fix Baseline)** (`https://www.livworthy.com/`) | Lighthouse Mobile (DevTools Throttling) | **83 / 100** | 0.8s | 4.5s | 0.003 | 90ms | Live Production Snapshot |
| **Local Static Production Bundle (Pre-Optimization)** | Lighthouse Mobile (DevTools Throttling) | **72 / 100** | 1.1s | 6.5s | 0.000 | 78ms | Lab Synthetic Baseline |
| **Local Static Production Bundle (Pass 1 - Optimized)** | CDP Throttled Playwright (Fast 4G, 4x CPU) | **LAB PASS** | 1.2s | **1,324ms** | 0.000 | <100ms | Lab Synthetic Test |
| **Local Static Production Bundle (Pass 2 - Optimized)** | CDP Throttled Playwright (Fast 4G, 4x CPU) | **LAB PASS** | 1.3s | **1,412ms** | 0.000 | <100ms | Lab Synthetic Test |
| **Local Static Production Bundle (Pass 3 - Optimized)** | CDP Throttled Playwright (Fast 4G, 4x CPU) | **LAB PASS** | 1.2s | **1,364ms** | 0.000 | <100ms | Lab Synthetic Test |
| **Optimized 3-Pass Median** | CDP Throttled Mobile Profile | **LAB PASS** | **1.2s** | **1,364ms** | **0.000** | **<100ms** | **Lab Target ≤2.5s met** |
