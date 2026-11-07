# LivWorthy — Core Web Vitals & Real-Browser Performance Benchmark

> **Methodology:** Measured using real Chromium browser automation with performance navigation & paint observers on production static build (`dist/`).
> **Mobile Profile:** Mobile runs execute with 4x CPU slowdown and 1.6384 Mbps download / 750 kbps upload network throttling (Lighthouse Mobile standard profile).
> **Standard Targets:** LCP ≤ 2.5s (2500ms), FCP ≤ 1.8s (1800ms), CLS ≤ 0.1, TTFB ≤ 800ms.
> **Audit Timestamp:** 2026-11-07T06:05:37.489Z

## 1. Real-Browser Benchmark Summary

| Page / Route | Viewport & Profile | TTFB | FCP | LCP (Target ≤2.5s) | CLS (Target ≤0.1) | DOM Nodes | Total Requests | Transferred Payload |
|---|---|---|---|---|---|---|---|---|
| **Homepage (Desktop)** | Desktop Unthrottled | 4ms | 116ms | 192ms (✅ GOOD) | 0.002 (✅ GOOD) | 798 | 24 | 1398 KB |
| **Homepage (Mobile Throttled)** | Mobile Throttled (4x CPU, 1.6M) | 1ms | 1400ms | 7060ms (⚠️ HIGH) | 0.003 (✅ GOOD) | 799 | 21 | 1376 KB |
| **NYC $100K Guide (Desktop)** | Desktop Unthrottled | 1ms | 52ms | 52ms (✅ GOOD) | 0 (✅ GOOD) | 513 | 21 | 995 KB |
| **NYC $100K Guide (Mobile Throttled)** | Mobile Throttled (4x CPU, 1.6M) | 1ms | 1276ms | 1336ms (✅ GOOD) | 0.004 (✅ GOOD) | 514 | 19 | 996 KB |
| **Zurich CHF 130K Guide** | Desktop Unthrottled | 1ms | 68ms | 68ms (✅ GOOD) | 0.006 (✅ GOOD) | 414 | 21 | 979 KB |
| **Miami $90K Guide** | Desktop Unthrottled | 1ms | 52ms | 52ms (✅ GOOD) | 0.034 (✅ GOOD) | 434 | 21 | 980 KB |
| **Compare Calculator (/compare)** | Desktop Unthrottled | 2ms | 40ms | 72ms (✅ GOOD) | 0.023 (✅ GOOD) | 578 | 27 | 1403 KB |
| **NYC Salary After Tax Tool** | Desktop Unthrottled | 2ms | 48ms | 48ms (✅ GOOD) | 0 (✅ GOOD) | 479 | 22 | 1401 KB |
| **NYC City Hub (/cities/nyc)** | Desktop Unthrottled | 1ms | 36ms | 36ms (✅ GOOD) | 0 (✅ GOOD) | 149 | 20 | 913 KB |
| **Spanish Tool (/es/salary-worth)** | Desktop Unthrottled | 2ms | 32ms | 84ms (✅ GOOD) | 0.037 (✅ GOOD) | 812 | 25 | 1359 KB |

## 2. Root Cause & Resolution of the 10.5 MB / 108-Request Benchmark Anomaly

### What Caused the Initial 10.5 MB Reading?
- The benchmark script originally imported `../server` without specifying `SERVE_STATIC=true` or `SKIP_SERVER_START=true`.
- Because `NODE_ENV` was not `production` and `SERVE_STATIC` was false, `server.ts` initialized Vite in development middleware mode (`createViteServer({ server: { middlewareMode: true } })`).
- Vite's development server does not bundle code; it serves unminified, unbundled TypeScript files with inline source maps and unbundled dependencies on demand.
- When navigating to `/`, the browser downloaded **108 individual development modules and source maps**, inflating measured wire transfer to **10,504 KB** (~10.5 MB).

### Real Production Architecture & Verified Bundle Transfer
- In actual production (`dist/`), assets are fully code-split, hashed, and minified.
- **Actual Production Homepage Wire Transfer:** ~24 requests, **~775 KB on live production** (https://www.livworthy.com), or **~1,432 KB in uncompressed local static mode**.
- First-party production JavaScript total uncompressed footprint is ~936 KB (~210 KB gzipped).
- Prerendered editorial guides (`/guides/nyc-100k`, `/guides/zurich-130k`, `/guides/miami-90k`) load in **~19–20 requests** totaling **~640–660 KB**.

## 3. Google Lighthouse 13.6.0 Mobile Audit Results

Audited using official Google Lighthouse 13.6.0 with mobile emulation (`--form-factor=mobile --screenEmulation.mobile=true --throttling-method=devtools`):

| Page Tested | Form Factor | Lighthouse Performance Score | First Contentful Paint (FCP) | Largest Contentful Paint (LCP) | Cumulative Layout Shift (CLS) | Total Blocking Time (TBT) |
|---|---|---|---|---|---|---|
| **Production NYC $100K Guide** (`https://www.livworthy.com/guides/nyc-100k`) | Mobile | **100 / 100** | 1.0s | 1.1s | 0.003 | 80ms |
| **Production Homepage** (`https://www.livworthy.com/`) | Mobile | **83 / 100** | 0.8s | 4.5s | 0.003 | 90ms |
| **Local Production Build** (Post Cookie Delay Removal) | Mobile | **72 / 100** | 1.1s | 6.5s | 0.000 | 78ms |

### Critical Cookie Consent Optimization Applied
- **Diagnosis:** `src/components/ui/CookieConsentBanner.tsx` previously implemented an artificial `setTimeout(() => setIsOpen(true), 600)` to slide the banner into view. Under 4x CPU mobile throttling, this delayed banner text mount became the page's Largest Contentful Paint candidate at ~9.0 seconds.
- **Fix:** Removed the delayed timeout to render synchronously on mount when no consent is stored. This dropped mobile FCP from 1.5s to 1.1s and Total Blocking Time to 78ms.
