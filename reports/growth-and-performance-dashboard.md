# LivWorthy Organic Growth & Performance Tracking Dashboard

**Connected GA4 Property ID:** `558916208`  
**Measurement ID:** `G-BQBKMVS7PN`  
**Google Tag Manager Container:** `GTM-WRWRFQF8`  
**Reporting Cadence:** Weekly (Monday baseline review)  
**Historical Pre-Release Baseline Period:** November 7–13, 2026

---

## 1. Verified Historical Baselines (Pre-Release: Nov 7–13, 2026)

### Google Search Console Baseline

| Page / Query Route | Impressions | Clicks | CTR | Historical Context |
| :--- | :--- | :--- | :--- | :--- |
| **Site-Wide Aggregate** | 794 | 3 | 0.38% | Baseline prior to release deployment |
| **NYC $100K Guide (`/guides/nyc-100k`)** | 280 | 1 | 0.36% | High impressions, snippet needed sharpening |
| **Zurich CHF 130K Guide (`/guides/zurich-130k`)** | 101 | 1 | 0.99% | Strong expat intent, above-average CTR |
| **Miami $90K Guide (`/guides/miami-90k`)** | 52 | 1 | 1.92% | Strongest relative CTR in cluster |
| **Chinese Homepage (`/zh`)** | 100 | 0 | 0.00% | Page-level impressions on international queries |
| **Chinese Salary After Tax (`/zh/salary-after-tax`)** | 61 | 0 | 0.00% | Generic title caused domestic/expat intent clash |

### GA4 Pre-Release Diagnostic Baseline
- **Identified Defect:** Cookieless pings (`G100`) from users who didn't grant cookies or visited static pages without module scripts were excluded from GA4 Active Users because Behavioral Modeling requires 1,000 consented users/day.
- **Resolution Deployed (Commit `80fb0dc`):**
  1. Injected fallback zero-dependency cookie banner across all 4,224 prerendered pages.
  2. Dispatched immediate granted `page_view` (`G111`) upon user acceptance.
  3. Deduplicated initial React SPA mount pageviews.
  4. Flagged test/automation traffic (`traffic_type: 'test'`).

---

## 2. Weekly Performance Tracking Template (Fill Weekly)

### Week Ending: [YYYY-MM-DD]

#### A. Google Search Console Metrics (Weekly Totals)

| Canonical Priority Route | Impressions | Clicks | Average CTR | Average Position | Top Converting Query |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/guides/nyc-100k` | | | | | |
| `/guides/miami-90k` | | | | | |
| `/guides/zurich-130k` | | | | | |
| `/salary-worth` | | | | | |
| `/salary-after-tax` | | | | | |
| `/compare` | | | | | |
| `/cost-of-living` | | | | | |
| **Total Site-Wide** | | | | | |

#### B. Google Analytics 4 Telemetry (Consented Users)

| Metric | Target / Benchmark | Actual (This Week) | WoW Growth (%) | Notes / Anomalies |
| :--- | :--- | :--- | :--- | :--- |
| **Consented Active Users (1-day)** | > 50 / day | | | |
| **Weekly Active Users (7-day)** | > 350 / week | | | |
| **Total Sessions** | > 500 / week | | | |
| **Average Engagement Time** | > 1m 30s | | | |
| **Engagement Rate** | > 65% | | | |
| **Calculator Interactions (`calculate_salary`)** | > 200 / week | | | |
| **City Comparisons (`city_compared`)** | > 100 / week | | | |
| **Scenario Saves (`scenario_saved`)** | > 25 / week | | | |

#### C. Full Conversion & Engagement Funnel

```
[ Organic Search / Social Landing ]  --> 100% of Entrants
               │
               ▼
[ Interactive Tool Engagement ]      --> Target: >= 45% (Interacts with slider, selects city)
               │
               ▼
[ Deep Calculation / Comparison ]   --> Target: >= 25% (Runs full salary / city model)
               │
               ▼
[ Retention Action ]                 --> Target: >= 8% (Saves scenario / Returns via link)
```

---

## 3. Privacy-Safe Analytics Invariants Verification

When reviewing weekly GA4 data in Google Analytics Explorer, confirm these privacy and data integrity invariants:

1. **No Financial Leakage:** Ensure `calculate_salary`, `calculator_started`, and `city_compared` event parameters contain ONLY:
   - `tool_name` (e.g., `salary-worth`, `salary-after-tax`)
   - `city_id` (e.g., `nyc`, `zurich`, `miami`)
   - `currency` (e.g., `USD`, `CHF`, `GBP`)
   - **NEVER** raw salary integers, income brackets, or personal rent figures.
2. **Test Traffic Exclusion Filter:** Verify in **GA4 Admin > Data filters** that the `Internal Traffic` filter (`traffic_type = 'test'`) is active and successfully excluding test runs and automated smoke tests from production active user counts.
3. **Single Pageview Consistency:** Verify that average pageviews per session reflects true navigation, with no double-counting on page mount.
