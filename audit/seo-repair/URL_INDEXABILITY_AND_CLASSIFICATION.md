# LIVWORTHY.COM — URL INDEXABILITY & INVENTORY CLASSIFICATION AUDIT

**Date:** November 2026  
**Auditor:** Senior Technical SEO Engineer & Full-Stack Developer  
**Target:** Google Search Console Indexing Optimization & Quality Gate Audit  
**Domain:** `https://www.livworthy.com`

---

## 1. Executive Summary & Inventory Overview

LivWorthy employs a programmatic generation architecture producing static prerendered HTML pages for financial calculations, salary guides, cost-of-living comparisons, and empirical research reports across 10 Tier-1 languages, 13 Tier-2 languages, and 23 Tier-3 languages.

To protect domain E-E-A-T, topical authority, and search engine crawl budget, the platform enforces a **Deterministic Page Quality Gate** (`src/lib/seo/page-quality-gate.ts`).

### Current Production Inventory Metrics (from `dist/route-inventory.json`)
- **Total Cataloged Routes:** 787
- **Indexable Public Routes (Quality Gate Approved):** 259
- **Non-Indexable / UI Translation Routes:** 528
- **XML Sitemap Submissions:** 194 unique, canonical, high-value URLs across 17 segmented sitemaps
- **Sitemap Index:** `https://www.livworthy.com/sitemap.xml`
- **Sitemap Violations:** 0 noindex URLs, 0 redirects, 0 canonical mismatches, 0 duplicates.

---

## 2. Four-Tier URL Classification Matrix (A, B, C, D)

As instructed, all URLs discovered, crawled, or cataloged across the LivWorthy ecosystem are classified into four rigorous categories:

### Category A: High-Value Indexable Pages (The Core Organic Footprint)
**Definition:** Pages with comprehensive empirical content, verified 2026 statutory tax engines, verified Cost-of-Living baselines, localized metadata, and zero English leakage.
- **Total Count:** 194 in sitemaps (259 total cataloged Tier-1 public routes)
- **Robots Directive:** `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`
- **Canonical Directive:** Self-referencing absolute HTTPS canonical URL (`https://www.livworthy.com/...`)
- **Sitemap Status:** 100% listed in `/sitemap.xml` and child sitemaps.
- **Representative URL Breakdown:**
  1. **Core Calculators & Financial Tools (8):**
     - `https://www.livworthy.com/` (Homepage & Primary Calculator)
     - `https://www.livworthy.com/salary-after-tax`
     - `https://www.livworthy.com/cost-of-living`
     - `https://www.livworthy.com/salary-worth`
     - `https://www.livworthy.com/job-offers`
     - `https://www.livworthy.com/relocation`
     - `https://www.livworthy.com/tax-calculator`
     - `https://www.livworthy.com/remote-work`
  2. **Tier-1 Verified City Hubs (15):**
     - New York City (`/cities/nyc`), London (`/cities/london`), San Francisco (`/cities/san-francisco`), Toronto (`/cities/toronto`), Sydney (`/cities/sydney`), Berlin (`/cities/berlin`), Singapore (`/cities/singapore`), Zurich (`/cities/zurich`), Dubai (`/cities/dubai`), Tokyo (`/cities/tokyo`), Paris (`/cities/paris`), Dublin (`/cities/dublin`), Amsterdam (`/cities/amsterdam`), Vancouver (`/cities/vancouver`), Hong Kong (`/cities/hong-kong`).
  3. **Verified Long-Form Salary Benchmark Guides (20):**
     - `/guides/nyc-100k`, `/guides/nyc-150k`, `/guides/nyc-200k`, `/guides/london-60k`, `/guides/london-75k`, `/guides/london-100k`, `/guides/toronto-80k`, `/guides/toronto-100k`, `/guides/sydney-90k`, `/guides/sydney-120k`, `/guides/berlin-65k`, `/guides/berlin-80k`, `/guides/singapore-120k`, `/guides/singapore-180k`, etc.
  4. **Empirical Research Reports (4):**
     - `/reports/global-salary-worth-index-2026`
     - `/reports/tech-relocation-affordability-report-2026`
     - `/reports/remote-work-purchasing-power-parity-2026`
     - `/reports/middle-class-living-standards-g7-2026`
  5. **Verified Country Hubs & Methodologies (11):**
     - `/countries/us`, `/countries/gb`, `/countries/ca`, `/countries/au`, `/countries/de`, `/countries/sg`, `/countries/ch`, `/countries/ae`, `/countries/jp`, `/countries/fr`, `/coverage`, `/methodology`, `/about`, `/contact`, `/terms`, `/privacy`.
  6. **Tier-1 Localized Hubs (136):**
     - Fully translated tools, city hubs, and reports for Tier-1 languages: Spanish (`/es/`), French (`/fr/`), Arabic (`/ar/`), German (`/de/`), Portuguese (`/pt/`), Hindi (`/hi/`), Urdu (`/ur/`), Chinese (`/zh/`), Japanese (`/ja/`).

---

### Category B: Duplicate & Alternative Parameter Variants (Consolidate via Canonical/308)
**Definition:** Secondary URLs, tracking parameters, client-side view selectors, legacy URLs, or mobile/desktop protocol variants that represent identical or redundant content.
- **Handling Strategy:** Single-hop 308 Permanent Redirects for protocol/host variants; self-referencing canonical + `noindex, follow` or robots.txt disallow for query parameters.
- **Sitemap Status:** NEVER listed in sitemaps (0% presence).
- **Representative URL Breakdown:**
  1. **Non-WWW Apex URLs (22 in GSC):**
     - `https://livworthy.com/` → 308 → `https://www.livworthy.com/`
     - `https://livworthy.com/guides/nyc-100k` → 308 → `https://www.livworthy.com/guides/nyc-100k`
     - **Verification:** Tested live on Vercel Edge; resolves in 1 hop with identical path and query.
  2. **Client-Side Tab & Scenario Query Parameters:**
     - `/?tab=job-offers`, `/?tab=nyc-100k-guide`, `/?city=nyc&tab=relocation`
     - **Handling:** Disallowed in `robots.txt` (`Disallow: /*?*tab=`, `Disallow: /*?*city=`). Internal links now carry `rel="nofollow"` or link directly to canonical paths (`/job-offers`).
  3. **Duplicate English Prefixes (`/en/*`):**
     - `https://www.livworthy.com/en/salary-after-tax`
     - Canonical root: `https://www.livworthy.com/salary-after-tax`
     - **Handling:** Marked `noindex, follow` with canonical pointing to root `/salary-after-tax` (or self-canonical to prevent canonical drift). Excluded from sitemaps.

---

### Category C: Low-Value, Placeholder, or Unsupported Pages (Intentionally Excluded)
**Definition:** Pages for cities, countries, or topics where LivWorthy does not have verified statutory tax formulas, empirical HUD/Eurostat/ONS cost data, or full editorial translations.
- **Total Count:** 528 cataloged routes
- **Robots Directive:** `<meta name="robots" content="noindex, follow" />`
- **Sitemap Status:** Strictly EXCLUDED from XML sitemaps.
- **Handling Strategy:** Retain `noindex, follow` until statutory data is verified and substantive localized content (>500 words) is authored.
- **Representative URL Breakdown:**
  1. **Tier-2 & Tier-3 Language Stubs (468 routes):**
     - `it/*` (Italian), `nl/*` (Dutch), `ko/*` (Korean), `ru/*` (Russian), `tr/*` (Turkish), `pl/*` (Polish), `id/*` (Indonesian), `vi/*` (Vietnamese), `bn/*` (Bengali), `pa/*` (Punjabi), `ms/*` (Malay), `th/*` (Thai), `tl/*` (Tagalog), etc.
     - *Justification:* These pages offer UI translations for multinational users but lack full native editorial content. Exposing them to Google indexing would create hundreds of near-duplicate pages, triggering Google's "Helpful Content System" penalties.
  2. **Unsupported Markets / Thin Country Stubs (16 routes):**
     - `/countries/br` (Brazil), `/countries/id` (Indonesia), `/countries/ph` (Philippines), `/cities/manila`, etc.
     - *Justification:* These markets are classified as PROVISIONAL or LIMITED in `market-registry.ts`. They do not possess verified 2026 payroll tax calculation engines. The Quality Gate explicitly demotes them to `noindex, follow`.

---

### Category D: Intentionally Excluded Technical & Private Routes
**Definition:** Administrative interfaces, test suites, API endpoints, and private application internals.
- **Handling Strategy:** Blocked in `robots.txt` + `noindex, nofollow` meta tag + HTTP 401/403 where applicable.
- **Representative URL Breakdown:**
  - `/api/*` (Express JSON endpoints)
  - `/admin/*` (CMS and diagnostic dashboards)
  - `/test/*` (Integration and smoke test runners)

---

## 3. Deep-Dive: Investigation of 3,348 "Discovered — Currently Not Indexed" URLs

### Historical Trajectory
- **2026-10-05 (Peak):** 3,348 URLs in "Discovered — currently not indexed"
- **2026-10-12 (Post-Quality Gate Deployment):** 405 URLs in "Discovered — currently not indexed" (an **87.9% reduction**)
- **Total Excluded Pages:** Dropped from 3,381 to 477.

### Why Did Google Discover 3,348 URLs?
1. **Unconstrained Programmatic Permutations:** Early development scripts generated static HTML across:
   - 39 countries × 65 cities × 40 languages × multiple tool variations = ~100,000 potential combinations.
2. **Aggressive Historical Sitemap Generation:** Prior sitemap scripts output hundreds of thin city and localized stubs directly to Googlebot before content depth thresholds were enforced.
3. **Internal Linking Discovery:** Internal navigation footers historically listed every available language and city without `rel="nofollow"` or client-side isolation, allowing Googlebot's crawler to queue thousands of URLs in its discovery buffer.

### Why Google Withheld Them from the Index
Google's crawl scheduling algorithm assigns crawl priority based on PageRank and site quality. When Googlebot discovered thousands of programmatic URLs whose content was either:
- A 155-word UI wrapper with an empty calculator canvas,
- A machine-translated page with English leakage, or
- A duplicate city stub with identical text to another city,
Google placed them in the **"Discovered — currently not indexed"** queue. This was an entirely correct decision by Googlebot, preventing thin content from hurting the domain.

### Remediation & Long-Term Strategy
1. **Deterministic Page Quality Gate:** Demotes all thin pages to `noindex, follow` and excludes them from XML sitemaps.
2. **Sitemap Consolidation:** Sitemaps now strictly contain 194 verified, high-value canonical pages.
3. **Discovery Queue Expiration:** Google will naturally drop obsolete discovered URLs from its queue as subsequent sitemap crawls confirm they are not linked or sitemap-listed.
4. **DO NOT Request Indexing on Category C URLs:** Submitting Category C URLs for indexing would damage site E-E-A-T and re-trigger Google's algorithmic quality filters.

---

## 4. Audit of the 45 "Excluded by ‘noindex’ tag" URLs

In GSC, 45 URLs were reported under `Excluded by 'noindex' tag` with a status of `Validation Failed`.

### Full Categorical Breakdown of the 45 URLs

| Category | URL Examples | Count | Intended Status | Rationale |
|---|---|---:|---|---|
| **Tier-2 UI Stubs** | `https://www.livworthy.com/ms/guides/london-75k`<br>`https://www.livworthy.com/it/cities/dubai`<br>`https://www.livworthy.com/bn/guides/nyc-100k`<br>`https://www.livworthy.com/tl/guides/toronto-100k` | 18 | `noindex, follow` | Tier-2 UI languages lack localized editorial; indexing them causes low-quality multilingual duplicate penalties. |
| **Unsupported Country/City Stubs** | `https://www.livworthy.com/countries/br`<br>`https://www.livworthy.com/countries/id`<br>`https://www.livworthy.com/countries/ph`<br>`https://www.livworthy.com/cities/manila` | 4 | `noindex, follow` | Tax engine unverified for Brazil, Indonesia, Philippines; HUD/Eurostat baselines absent. |
| **Non-Canonical Apex URLs** | `https://livworthy.com/countries/ph`<br>`https://livworthy.com/cities/manila` | 2 | 308 Redirect | Non-www apex requests redirect to `www`. |
| **Duplicate `/en/*` Prefix Routes** | `https://www.livworthy.com/en/salary-worth`<br>`https://www.livworthy.com/en/cities/abudhabi`<br>`https://www.livworthy.com/en/countries/cz` | 9 | `noindex, follow` / canonical to root | English root canonicals live at `/salary-worth`. The `/en/` mirror paths must not compete for rank. |
| **Limited-Market & Thin Profiles** | `https://www.livworthy.com/es/cities/madrid`<br>`https://www.livworthy.com/es/cities/zurich`<br>`https://www.livworthy.com/es/countries/ca` | 12 | `noindex, follow` | Content quality gate demoted pages with <500 words of localized editorial to preserve site trust. |
| **Total** | | **45** | | |

### Why Did Validation Fail in GSC?
A user or administrator initiated "Start Validation" in Google Search Console for the "Excluded by 'noindex' tag" report. 
- Google's validation process attempts to verify that the reported URLs **no longer return noindex**.
- However, all 45 URLs are **supposed to return noindex**.
- When Googlebot re-crawled them, it confirmed that they correctly and intentionally still output `<meta name="robots" content="noindex, follow" />`.
- Google Search Console accordingly marked the validation run as **"Failed"**.

### Actionable Recommendation for GSC
- **DO NOT attempt to re-validate this report.**
- "Excluded by 'noindex' tag" is **not an error**; it is the desired state for non-qualifying pages. Having noindex exclusions confirms that the Quality Gate is successfully protecting your domain.

