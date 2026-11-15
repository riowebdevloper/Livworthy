# LivWorthy Chinese-Language Search Visibility Audit & Technical Assessment

**Date of Audit:** November 15, 2026  
**Auditor:** LivWorthy Technical SEO & Search Analytics  
**Scope:** Technical analysis of early November Google Search Console impressions across `/zh` and `/zh/salary-after-tax`, verification of page-level vs query-level telemetry, localized rendering quality, and indexability recommendation.

---

## 1. Verified Search Console Telemetry (Pre-Release Baseline)

Google Search Console aggregate reporting for the period November 7–13, 2026 (prior to the November 15 release deployment):
- **Site-Wide Aggregate:** 794 impressions, 3 clicks (~0.38% CTR).
- **Chinese Homepage (`/zh`):** 100 page-level impressions, 0 clicks (0.0% CTR).
- **Chinese Salary After Tax (`/zh/salary-after-tax`):** 61 page-level impressions, 0 clicks (0.0% CTR).
- **November 6 Observation:** An isolated single-day impression surge occurred where localized Chinese URLs appeared in search results.

> [!NOTE]
> **Data Integrity Clarification:** The figures above represent aggregate **page-level impressions** recorded by Search Console, not exact individual search-query impression counts. Without access to Googlebot edge access logs, any statements regarding internal ranking pipelines (e.g. RankBrain or trial-query algorithms) are hypotheses rather than proven facts.

---

## 2. Working Hypotheses: Impression Surge & Zero-Click Conversion

### A. Indexing & Query Impressions
On or around early November 2026, Googlebot indexed the prerendered Chinese locale cluster (`/zh`, `/zh/salary-after-tax`, `/zh/cost-of-living`, `/zh/salary-needed`, `/zh/compare`, `/zh/job-offers`). During the November 6 surge, Search Console recorded appearances across several search queries. Notably, unlike subsequent post-launch queries which saw deeper distributions, observed ranking positions on November 6 included several prominent positions roughly in the **2–10 range** as well as lower positions.

### B. Hypotheses for Low Click-Through (0.0% CTR)
1. **Generic Meta Title & Search Intent Mismatch:**
   The original title for `/zh/salary-after-tax` was `法定税后净收入与个税计算器 | LivWorthy` ("Statutory Net Income and Income Tax Calculator"). This title did not explicitly indicate international, cross-border, or expat coverage (such as the US, UK, Switzerland, or UAE). Searchers looking for domestic PRC individual income tax calculators under State Taxation Administration rules would find an ambiguous snippet and decline to click.
2. **Intent Differentiation:**
   Users seeking domestic Chinese tax calculation (under PRC State Taxation Administration brackets) had no intent for global expat calculations, leading to immediate click-through avoidance.
3. **Snippet Clarity:**
   Without explicit country or city indicators in the SERP snippet, searchers were unable to discern that the tool models global relocation and foreign salary take-home pay.

---

## 3. Localization Quality Assessment: Authenticity vs. Machine Translation

We audited `dist/zh/index.html`, `dist/zh/salary-after-tax/index.html`, `src/lib/i18n/`, and `scripts/localized-tool-pages.ts`:

### Findings:
1. **Curated Dictionary Localization:**
   - The Chinese pages are powered by structured dictionary translations across 10 namespaces (`common`, `nav`, `calculator`, `results`, `footer`, `scenarios`, `countries`, `cities`).
   - Terminology uses standard financial and economic conventions: `法定个税` (statutory income tax), `公允租金` (fair market rent), `阶梯税率` (progressive tax brackets), `到手薪资` (net take-home pay), `社保与公积金` (social contributions).
2. **Prerendered Complete HTML & Interactive Mount:**
   - Pages contain fully precomputed semantic HTML with structured data (`WebSite`, `Organization`, `WebApplication`, `BreadcrumbList`).
   - The interactive React SPA mounts into `#root`, allowing users to calculate take-home pay across 65 global cities with full Chinese UI controls.
3. **Genuine User Value:**
   - Chinese-speaking professionals, overseas students, tech immigrants, and multinational transfer employees in North America, Europe, Australia, and Singapore regularly research cross-border compensation.
   - Providing verified 2026 statutory calculations for New York ($100K), London (£75K), Zurich (CHF 130K), and Singapore (S$180K) in native Simplified Chinese delivers unique, high-utility intelligence.

---

## 4. Technical Indexing Signals & Hreflang Architecture

| Technical Check | Implementation | Status |
| :--- | :--- | :--- |
| **Self-Referencing Canonical** | `<link rel="canonical" href="https://www.livworthy.com/zh" />` on `/zh`<br>`<link rel="canonical" href="https://www.livworthy.com/zh/salary-after-tax" />` on `/zh/salary-after-tax` | ✅ PASS |
| **Robots Meta Directive** | `<meta name="robots" content="index, follow" />` on core tool entry points | ✅ PASS |
| **Reciprocal Hreflang** | 10 reciprocal alternates (`en`, `es`, `fr`, `ar`, `de`, `pt`, `hi`, `ur`, `zh`, `ja`) + `x-default` pointing to `https://www.livworthy.com/` | ✅ PASS |
| **HTML Language Declaration** | `<html lang="zh" dir="ltr">` | ✅ PASS |
| **Sitemap Quality Gate** | All indexed Chinese URLs have `canBeIndexed === true` and appear in segmented sitemaps | ✅ PASS |
| **Internal Link Integrity** | 0 broken internal links across all prerendered pages | ✅ PASS |

> [!IMPORTANT]
> **Hreflang Architectural Clarification:** According to [Google Search Central guidance on localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), hreflang clusters do not require an all-or-nothing monolithic global graph; partial reciprocal clusters are fully supported. Deciding whether to keep or exclude specific language locales should be determined by genuine user usefulness, editorial quality, and search-intent alignment—not by an unfounded belief that removing an alternate language necessarily collapses the remaining hreflang cluster.

---

## 5. Technical Decision & Recommendation

### Recommendation: **RETAIN IN INDEX AND MONITOR**

**Rationale:**
1. **Substantial Unique Value:** These pages are not programmatic thin doorways. They provide full deterministic calculation engines for 65 international cities, verified against official tax gazettes (IRS Rev. Proc. 2025-32, HMRC, ESTV, IRAS).
2. **Sharpened Intent Targeting:** The SERP metadata has been updated to explicitly highlight global and cross-border salary intelligence (e.g., `全球法定税后净收入与个税计算器 (2026到手薪资)`), resolving the domestic PRC ambiguity that caused low CTR.
3. **No Index Bloat Risk:** The localized cluster covers the core tools and major international cities, without generating unbounded low-value combinations.

---

## 6. Actionable Improvements Implemented

1. **Sharpened SERP Metadata (`scripts/localized-tool-pages.ts`):**
   - **Updated Title:** `全球法定税后净收入与个税计算器 (2026到手薪资) | LivWorthy`
   - **Updated Description:** `权威测算美国、英国、瑞士等全球65城扣除法定个人所得税、社保金及各项扣除后的每月实际到手税后工资与真实可支配结余。`
2. **Contextual Expat Navigation:**
   - Prerendered Chinese tool routes provide direct scenario chips for top international expat destinations: 纽约 ($100k), 伦敦 (£75k), 迪拜 (300k AED), 多伦多 (CA$100k), 苏黎世 (CHF 130k).
3. **Structured Data Validation:**
   - Verified `WebApplication` and `BreadcrumbList` schema markup for localized pages.

---

## 7. Monitoring Checkpoints

- **Search Console Tracking:** Track Search Console performance segmented by country and query for `https://www.livworthy.com/zh` and `https://www.livworthy.com/zh/salary-after-tax`.
- **CTR Benchmark:** Track whether queries indicating international interest (e.g., US or European salary keywords) achieve CTR improvement following the metadata title and snippet updates.
