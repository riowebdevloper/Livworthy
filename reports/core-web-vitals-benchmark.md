# LivWorthy — Core Web Vitals & Real-Browser Performance Benchmark

> **Methodology:** Measured using real Chromium browser automation with performance navigation & paint observers on local production build.
> **Standard Targets:** LCP ≤ 2.5s (2500ms), FCP ≤ 1.8s (1800ms), CLS ≤ 0.1, TTFB ≤ 800ms.
> **Date:** 2026-11-07T05:16:18.633Z

| Page / Route | Viewport | TTFB | FCP | LCP (Target ≤2.5s) | CLS (Target ≤0.1) | DOM Nodes | Total Requests | Transferred KB |
|---|---|---|---|---|---|---|---|---|
| **Homepage (Desktop)** | Desktop (1280px) | 18ms | 600ms | 600ms (✅ GOOD) | 0.002 (✅ GOOD) | 771 | 107 | 10504 KB |
| **Homepage (Mobile)** | Mobile (375px) | 4ms | 192ms | 792ms (✅ GOOD) | 0 (✅ GOOD) | 783 | 108 | 10503 KB |
| **NYC $100K Guide (Desktop)** | Desktop (1280px) | 2ms | 56ms | 56ms (✅ GOOD) | 0 (✅ GOOD) | 514 | 20 | 659 KB |
| **NYC $100K Guide (Mobile)** | Mobile (375px) | 1ms | 40ms | 40ms (✅ GOOD) | 0 (✅ GOOD) | 514 | 19 | 657 KB |
| **Zurich CHF 130K Guide** | Desktop (1280px) | 1ms | 48ms | 48ms (✅ GOOD) | 0.006 (✅ GOOD) | 415 | 19 | 643 KB |
| **Miami $90K Guide** | Desktop (1280px) | 1ms | 48ms | 48ms (✅ GOOD) | 0.034 (✅ GOOD) | 435 | 20 | 643 KB |
| **Compare Calculator (/compare)** | Desktop (1280px) | 1ms | 40ms | 40ms (✅ GOOD) | 0 (✅ GOOD) | 229 | 20 | 615 KB |
| **NYC Salary After Tax Tool** | Desktop (1280px) | 1ms | 44ms | 44ms (✅ GOOD) | 0 (✅ GOOD) | 467 | 21 | 639 KB |
| **NYC City Hub (/cities/nyc)** | Desktop (1280px) | 1ms | 32ms | 32ms (✅ GOOD) | 0 (✅ GOOD) | 150 | 18 | 574 KB |
| **Spanish Tool (/es/salary-worth)** | Desktop (1280px) | 1ms | 36ms | 36ms (✅ GOOD) | 0 (✅ GOOD) | 234 | 20 | 619 KB |

### Key Architectural Insights:
- **Critical CSS Inlining:** By eliminating the render-blocking stylesheet link and inlining 64KB critical CSS directly into static HTML, First Contentful Paint is achieved in <150ms on static articles.
- **Selective SPA Hydration:** Static editorial pages strip the 430KB React SPA bundle completely, eliminating main-thread JavaScript execution overhead while preserving GA4 tracking.
- **Layout Shift Elimination:** Pre-reserved calculator slots and fixed-ratio headers keep Cumulative Layout Shift well below the 0.1 threshold.
