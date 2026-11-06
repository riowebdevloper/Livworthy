# LIVWORTHY.COM — GOOGLE SEARCH CONSOLE AUDIT & ROOT CAUSE ANALYSIS

**Domain:** `https://www.livworthy.com`  
**GSC Property:** `livworthy.com`  
**Date:** November 2026  
**Engineering Execution Mode:** Senior Technical SEO Engineer & Full-Stack Developer  

---

## 1. Executive Summary & GSC Observation Verification

This audit examines the historical Google Search Console (GSC) observations from the provided dataset (`data/gsc-audit/`) against the live production environment (`https://www.livworthy.com`) and local codebase.

### Historical GSC Data vs. Current Verification Matrix

| GSC Issue Reported | Historical Reported Pages | Current Live/Verified Status | Root Cause Classification | Resolution Status |
|---|---|---|---|---|
| **Blocked by robots.txt** | Unknown | Confirmed 0 canonical pages blocked | Internal links to client-side query parameters (`/?city=...`, `/?tab=job-offers`) triggered crawler discovery of disallowed patterns. | **FIXED:** Replaced parameterized internal links with canonical paths and added `rel="nofollow"` to dynamic scenario launcher links. |
| **Excluded by ‘noindex’ tag** | 45 | 45 verified across 5 distinct categories | 18 Tier-2 locale stubs + 4 unsupported country stubs + 9 duplicate `/en/*` paths + 2 apex requests + 12 limited-market stubs. | **VERIFIED & SECURED:** Legitimate exclusions preserved; verified sitemaps contain exactly 0 noindex URLs. Operational fix for GSC validation mistake documented. |
| **Crawled — currently not indexed** | 1 (`/zh/salary-after-tax`) | 1 verified | Non-English Tier-1 tool pages were generated without the comprehensive educational/calculation breakdown module (`loc === 'en'` guard), leaving thin 155-word HTML shells. | **FIXED:** Expanded educational/methodology module across all Tier-1 tool pages; word count increased from 155 to 950 words. |
| **Discovered — currently not indexed** | 3,348 (peak Oct 5) | Dropped to 405 (Oct 12) | Legacy programmatic generation previously generated thousands of permutations of unverified cities, thin guides, and un-localized language combinations without quality gates. | **RESOLVED & GATED:** Deterministic Page Quality Gate, prune sitemaps to high-value canonical pages, and prevent auto-generation of thin stubs. |
| **Page with redirect** | 22 | 22 verified (apex + queries) | Google discovering non-www apex URLs (`https://livworthy.com/*`) and parameterized variants, which 308 redirect in a single hop to `https://www.livworthy.com/*`. | **VERIFIED:** Legitimate, healthy 308 single-hop redirects working perfectly on live Vercel edge and Express. Zero redirect chains. Internal links cleaned. |
| **Alternative page with proper canonical tag** | 4 | 4 verified | Secondary URL variants (such as `/en/*` duplicate prefixes or desktop/mobile variants) correctly specifying self-referencing or root canonical URLs. | **VERIFIED:** Healthy, standards-compliant canonical signaling. No action required for legitimate canonical alternatives. |
| **Redirect error** | Unknown (0 in CSV) | 0 | None found. Live production audit confirmed 100% single-hop 308 redirects without loops. | **VERIFIED CLEAN** |
| **Dataset structured data: missing license** | Unknown | Confirmed in `/coverage`, `/reports/*`, and localized reports | Fictional CC-BY-4.0 used on reports; `/coverage` and localized report schemas omitted `license`. General `/terms` was briefly linked, but does not grant open dataset reuse rights. | **RESOLVED:** In accordance with Schema.org & Google Dataset guidelines, optional `license` is truthfully omitted for proprietary datasets where no open redistribution license exists. No synthetic licenses fabricated. |
| **Dataset structured data: missing creator** | Unknown | Confirmed across all Dataset schemas | Homepage schema used bare ID reference `{ '@id': ... }` without inline Organization schema; `/coverage` and localized report schemas omitted `creator` entirely; `/reports/*` used fictional organization name. | **FIXED:** Inlined full `@type: 'Organization'`, `name: 'LivWorthy'`, `url: 'https://www.livworthy.com/'` across all 132 Dataset instances. |

---

## 2. Detailed Root Cause Analysis

### Issue A: Dataset Structured Data (Missing `license` & Missing `creator`)
- **Root Cause 1 (`scripts/generate-seo.ts:186`):** The Homepage Dataset schema declared `creator: { '@id': `${BASE_URL}/#organization` }`. Google Rich Results Validator and GSC Dataset extraction parser fail when `creator` is merely an unresolved ID reference without inline `@type: 'Organization'` and `name: 'LivWorthy'`.
- **Root Cause 2 (`scripts/seo-generators-content.ts:540`):** The Market & Tax Engine Coverage Registry (`/coverage`) Dataset declared only `name`, `url`, `description`, and `publisher`. It completely omitted `creator`.
- **Root Cause 3 (`scripts/seo-generators-content.ts:1098`):** Empirical Research Reports (`/reports/:slug`) declared `license: 'https://creativecommons.org/licenses/by/4.0/'` and `creator: { name: 'LivWorthy Quantitative Research Institute' }`. This violated strict publisher truth guidelines by inventing an open-source license not granted by LivWorthy, and inventing a non-registered entity name.
- **Root Cause 4 (`scripts/localized-long-form-pages.ts:70-76`):** Localized report pages emitted a Schema.org `Dataset` containing only `@type`, `name`, `url`, and `inLanguage`. `description` and `creator` were completely absent.
- **Licensing Decision:** LivWorthy's datasets are original proprietary models. Website Terms of Service explicitly prohibit unauthorized scraping or redistribution for commercial products. Under Google and Schema.org specifications, `license` is an optional property. Fabricating a Creative Commons license or asserting website terms as an open data license is untruthful. The optional `license` property is therefore truthfully omitted.

### Issue B: Crawled — Currently Not Indexed (`/zh/salary-after-tax`)
- **Root Cause (`scripts/localized-tool-pages.ts:674`):** The educational and methodological breakdown module was guarded by:
  ```typescript
  ${loc === 'en' ? renderCalculatorEducationalHtml(tool) : ''}
  ```
  Consequently, English tool pages (`/salary-after-tax`, etc.) received comprehensive 800+ word guides with progressive tax explanations, FMR rent adjustments, and methodology. All non-English Tier-1 tool pages (including `zh/salary-after-tax`) were rendered as thin 155-word shells consisting only of placeholder calculating text and brief disclaimers. Googlebot crawled `zh/salary-after-tax`, determined it lacked sufficient substantive content to justify indexing, and classified it as "Crawled - currently not indexed".

### Issue C: "Blocked by robots.txt" and Parameter Crawl Waste
- **Root Cause (`scripts/seo-generators-content.ts` & `scripts/generate-seo.ts`):** Prerendered HTML on pages like `/job-offer-comparison` contained `<a href="/?tab=job-offers">` and `/guides/*` contained `<a href="/?city=${city.id}&salary=${g.salaryMajor}&tab=nyc-100k-guide&guide=${g.slug}">`.
- `public/robots.txt` contains:
  ```
  Disallow: /*?*city=
  Disallow: /*?*tab=
  Disallow: /*?*salary=
  ```
  Googlebot discovered these parameter links during internal page crawls, attempted to fetch them, and hit the `robots.txt` disallow rules, resulting in "Blocked by robots.txt" reports.

### Issue D: 45 "Excluded by ‘noindex’ tag" URLs
- **Root Cause Analysis of the 45 URLs (`data/gsc-audit/validation/Table.csv`):**
  1. **18 Tier-2 Language Stubs:** `ms/*` (4), `it/*` (7), `bn/*` (2), `tl/*` (5). Tier-2 languages (Italian, Malay, Bengali, Tagalog) are currently published for client-side UI translation only; their long-form editorial profiles are not fully localized. Under platform architecture policy, they are intentionally flagged with `noindex, follow` to prevent thin duplicate translations from diluting domain topical authority.
  2. **4 Unsupported Country/City Stubs:** `/countries/br`, `/countries/id`, `/countries/ph`, `/cities/manila`. These markets lack verified statutory tax engines and empirical COL baselines. They are intentionally kept `noindex, follow`.
  3. **2 Non-Canonical Apex URLs:** `https://livworthy.com/countries/ph`, `https://livworthy.com/cities/manila`. Apex host requests return 308 redirects to `https://www.livworthy.com`.
  4. **9 Duplicate `/en/*` Paths:** `/en/salary-worth`, `/en/cities/abudhabi`, `/en/countries/cz`, etc. English content canonically resides at the root path (`/salary-worth`, etc.). The `/en/*` mirror routes are intentionally marked `noindex, follow` with self-canonical or root canonical tags.
  5. **12 Limited Verification Stubs:** European/global stubs like `es/cities/madrid`, `es/cities/zurich`, `es/cities/warsaw`, `es/countries/ca` where statutory coverage is classified as LIMITED and bespoke localized editorial has not yet been authored.
- **Why GSC Validation Failed:** A site operator mistakenly initiated "Validate Fix" in Google Search Console on the "Excluded by 'noindex' tag" category. Because these 45 URLs are intentionally excluded by the Quality Gate, Google recrawled them, verified that they still return `<meta name="robots" content="noindex, follow" />`, and correctly marked the validation request as "Failed". **Validation must not be requested for intentionally excluded URLs.**

### Issue E: 3,348 Discovered — Currently Not Indexed URLs
- **Root Cause:** In earlier development iterations, the generator output thousands of combinatorial pages across 39 countries, 65 cities, 40 locales, and permutations without content depth gating or sitemap segmentation. Google discovered these URLs before the strict Quality Gate (`page-quality-gate.ts`) was implemented.
- **Progress:** Between 2026-10-05 and 2026-10-12, the implementation of the Deterministic Quality Gate and sitemap pruning reduced the unindexed page count from 3,381 down to 477 (a 86% reduction), and discovered-not-indexed dropped from 3,348 to 405.

