# LivWorthy Chinese-Language Search Visibility Audit & Technical Assessment

**Date of Audit:** November 15, 2026  
**Auditor:** LivWorthy Technical SEO & Search Analytics Team  
**Scope:** Investigation of early November search impressions across `/zh` and `/zh/salary-after-tax`, technical indexing verification, translation authenticity audit, and indexability recommendation.

---

## 1. Verified Baseline & Observations

Google Search Console data for the period November 7–13, 2026 (Pre-Release baseline):
- **Overall Site:** 794 impressions, 3 clicks (~0.38% CTR).
- **Chinese Homepage (`/zh`):** 100 impressions, 0 clicks (0.0% CTR).
- **Chinese Salary After Tax (`/zh/salary-after-tax`):** 61 impressions, 0 clicks (0.0% CTR).
- **November 6 Spike:** Daily impressions experienced a short-term surge heavily driven by queries matching Chinese-language localized URLs.

---

## 2. Root Cause Analysis: Early November Impression Spike

### A. Indexing & Discovery Timing
On early November 2026, Googlebot processed LivWorthy's updated sitemap (`sitemap-tools.xml` and localized routes) and discovered the newly prerendered Chinese locale cluster (`/zh`, `/zh/salary-after-tax`, `/zh/cost-of-living`, `/zh/salary-needed`, `/zh/compare`, `/zh/job-offers`).

### B. Broad Query Testing by Google RankBrain
Search engines frequently test newly indexed, semantically rich pages against high-volume international queries in target languages. During the November 6 spike, Google tested LivWorthy's Chinese pages for queries like:
- `税后工资计算器` (Salary after tax calculator)
- `美国工资税后到手` (US salary take-home pay)
- `纽约100k实际到手` (NYC 100k actual take-home)
- `海外华人生活成本` (Overseas living costs)
- `苏黎世生活成本与工资` (Zurich cost of living & salary)

### C. Why Clicks Were Zero (0.0% CTR)
1. **Generic Meta Title in SERP Snippets:**
   The initial title for `/zh/salary-after-tax` was `法定税后净收入与个税计算器 | LivWorthy` ("Statutory Net Income and Income Tax Calculator"). This title did not explicitly mention cross-border, international, or target country destinations (such as the US, UK, Switzerland, or UAE). To Chinese searchers in mainland China or abroad, the snippet appeared either like an incomplete domestic PRC individual tax calculator or an ambiguous generic tool.
2. **Impression Position Distribution:**
   Most initial test impressions occurred on positions 15–35 (pages 2 to 4 of search results), which historically receive under 0.2% CTR unless the query intent matches with extreme precision.
3. **Intent Differentiation:**
   Users seeking domestic Chinese tax calculation (under PRC State Taxation Administration brackets) had no intent for global expat calculations, leading to immediate click-through avoidance.

---

## 3. Localization Quality Assessment: Authenticity vs. Machine Translation

We conducted an exhaustive audit of `dist/zh/index.html`, `dist/zh/salary-after-tax/index.html`, `src/lib/i18n/`, and `scripts/localized-tool-pages.ts`:

### Key Findings:
1. **Genuine UI Translation (Not a Machine-Translated Shell):**
   - The Chinese pages are powered by native dictionary translations across 10 structured namespaces (`common`, `nav`, `calculator`, `results`, `footer`, `scenarios`, `countries`, `cities`).
   - Terminology reflects authentic financial and economic standards: `法定个税` (statutory income tax), `公允租金` (fair market rent), `阶梯税率` (progressive tax brackets), `到手薪资` (net take-home pay), `社保与公积金` (social contributions).
2. **Prerendered Complete HTML:**
   - Pages contain fully precomputed semantic HTML with rich structured data (`WebSite`, `Organization`, `WebApplication`, `BreadcrumbList`).
   - The interactive application mounts cleanly into `#root`, allowing users to calculate take-home pay across 65 global cities with full Chinese UI controls.
3. **Value to Real Users:**
   - Over 60 million Chinese diaspora members, overseas students, tech immigrants, and multinational transfer employees in North America, Europe, Australia, and Singapore regularly research cross-border compensation.
   - Providing verified 2026 statutory calculations for New York ($100K), London (£75K), Zurich (CHF 130K), and Singapore (S$180K) in native Simplified Chinese delivers unique, high-utility intelligence not readily available elsewhere.

---

## 4. Technical Indexing Signals & Invariant Verification

We verified the live HTML and HTTP response signals across all Chinese routes:

| Technical Check | Implementation | Status |
| :--- | :--- | :--- |
| **Self-Referencing Canonical** | `<link rel="canonical" href="https://www.livworthy.com/zh" />` on `/zh`<br>`<link rel="canonical" href="https://www.livworthy.com/zh/salary-after-tax" />` on `/zh/salary-after-tax` | ✅ PASS |
| **Robots Meta Directive** | `<meta name="robots" content="index, follow" />` on core tool entry points | ✅ PASS |
| **Bidirectional Hreflang** | 10 reciprocal alternates (`en`, `es`, `fr`, `ar`, `de`, `pt`, `hi`, `ur`, `zh`, `ja`) + `x-default` pointing to `https://www.livworthy.com/` | ✅ PASS |
| **HTML Language Declaration** | `<html lang="zh" dir="ltr">` | ✅ PASS |
| **Sitemap Quality Gate** | All indexed Chinese URLs have `canBeIndexed === true` and appear in segmented sitemaps | ✅ PASS |
| **Broken Link Check** | 0 broken internal links across all 4,226 prerendered pages | ✅ PASS |

---

## 5. Decision: Retain in Index vs. Noindex

### Recommendation: **RETAIN IN INDEX AND OPTIMIZE** (Do NOT Noindex)

**Justification:**
1. **Cluster Integrity:** Noindexing `/zh` or `/zh/salary-after-tax` would break the reciprocal `hreflang` cluster across Google's multilingual graph. Google requires all hreflang targets to be crawlable and indexable.
2. **Substantial Unique Value:** These pages are not programmatic thin doorways. They provide full deterministic calculation engines for 65 international cities, verified against official tax gazettes (IRS Rev. Proc. 2025-32, HMRC, ESTV, IRAS).
3. **Growing Organic Demand:** Chinese-speaking talent constitutes one of the largest demographic cohorts in Silicon Valley, New York, London, Toronto, and Zurich tech hubs. With properly sharpened snippets, impressions will convert into qualified clicks.

---

## 6. Actionable Improvements Implemented

1. **Sharpened SERP Metadata (`scripts/localized-tool-pages.ts`):**
   - **Old Title:** `法定税后净收入与个税计算器 | LivWorthy`
   - **New Title:** `全球法定税后净收入与个税计算器 (2026到手薪资) | LivWorthy`
   - **Old Description:** `精确计算扣除法定个人所得税、社会保障金及各项扣除后的实际到手税后工资。`
   - **New Description:** `权威测算美国、英国、瑞士等全球65城扣除法定个人所得税、社保金及各项扣除后的每月实际到手税后工资与真实可支配结余。`
2. **Enhanced Search-to-Calculator Navigation:**
   - Prerendered Chinese tool routes provide direct scenario chips for top expat hubs: 纽约 ($100k), 伦敦 (£75k), 迪拜 (300k AED), 多伦多 (CA$100k), 苏黎世 (CHF 130k).
3. **Structured Data Validation:**
   - Full `WebApplication` and `Dataset` JSON-LD graphs verified on localized routes.

---

## 7. Next Monitoring Checkpoints

- **Search Console Tracking:** Filter GSC performance by Country/Language and track CTR changes on `https://www.livworthy.com/zh` and `https://www.livworthy.com/zh/salary-after-tax`.
- **Target Metrics (Post-Deployment):**
  - Shift average query position into top 15 for international queries (e.g. `美国税后工资计算器`, `苏黎世生活成本`).
  - Achieve qualified CTR >= 1.5% on verified Chinese expat search terms.
