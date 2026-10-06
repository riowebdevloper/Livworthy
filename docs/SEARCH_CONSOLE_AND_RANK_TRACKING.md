# LivWorthy — Search Console, IndexNow, and SERP Rank Tracking Architecture

This specification outlines the technical indexing, search engine integration, and ranking tracking architecture for **LivWorthy** (`https://www.livworthy.com`).

---

## 1. Google Search Console & Bing Webmaster Verification

### Verification Artifacts Configured:
1. **HTML Meta Tag Verification**:
   Configured in `index.html` root header:
   ```html
   <meta name="google-site-verification" content="google-site-verification-token-livworthy" />
   <meta name="msvalidate.01" content="msvalidate-token-livworthy" />
   ```
2. **DNS TXT Record (Primary Institutional Verification)**:
   - Host: `@` (apex domain `livworthy.com`)
   - Type: `TXT`
   - Target: `google-site-verification=...`
3. **Bing Webmaster Verification & Ownership**:
   - Registered under apex domain with automatic DNS delegation via Cloudflare/Vercel nameservers.

---

## 2. Segmented Sitemap Architecture & Submission Schedule

The sitemap index is dynamically accessible at `https://www.livworthy.com/sitemap.xml` pointing to 6 segmented child sitemaps (totaling 166 canonical high-value indexable URLs):

| Sitemap Path | Target Resource Count | Priority | Changefreq | Purpose |
|---|---|---|---|---|
| `/sitemap-main.xml` | 13 URLs | 1.0 | Daily | Homepage, institutional governance, localized landing hubs (`/`, `/en`, `/es`, `/fr`, `/ar`, `/coverage`, `/relocation`, `/job-offer-comparison`, `/about`, `/methodology`, `/sources`) |
| `/sitemap-cities.xml` | 39 URLs | 0.9 | Weekly | Verified commercial metro hubs (`/cities/nyc`, `/cities/london`, `/cities/dubai`, etc.) |
| `/sitemap-countries.xml` | 17 URLs | 0.8 | Weekly | Commercial market directory pages (`/countries/us`, `/countries/uk`, `/countries/uae`, etc.) |
| `/sitemap-guides.xml` | 36 URLs | 0.8 | Weekly | Intent-matched salary purchasing power guides (`/guides/nyc-100k`, `/guides/london-75k`, etc.) |
| `/sitemap-relocation.xml` | 10 URLs | 0.8 | Weekly | Global relocation intelligence corridors (`/relocation/new-york-to-london`, `/relocation/london-to-dubai`, etc.) |
| `/sitemap-comparisons.xml` | 7 URLs | 0.7 | Weekly | Head-to-head metro purchasing power comparisons (`/compare/new-york-vs-london`, etc.) |

---

## 3. IndexNow Instant Search Protocol (Bing / Yandex / Seznam)

When a cost-of-living benchmark or tax rule is updated, LivWorthy issues programmatic IndexNow pings:

### IndexNow Endpoint:
`POST https://api.indexnow.org/indexnow`

```json
{
  "host": "www.livworthy.com",
  "key": "livworthy-indexnow-key-2026",
  "keyLocation": "https://www.livworthy.com/livworthy-indexnow-key-2026.txt",
  "urlList": [
    "https://www.livworthy.com/cities/nyc",
    "https://www.livworthy.com/relocation/new-york-to-london",
    "https://www.livworthy.com/guides/nyc-100k"
  ]
}
```

---

## 4. Priority Search Intent & Organic Rank Tracking Matrix

LivWorthy monitors 10 strategic commercial query clusters across desktop and mobile devices:

| Cluster | Primary Target Keywords | Target Landing Page | Search Intent | Target SERP Position |
|---|---|---|---|---|
| **NYC Salary Worth** | "is 100k a good salary in nyc", "100k salary new york single take home" | `/guides/nyc-100k` | Informational / Financial | Top 3 |
| **London Expat Salary** | "is 75k a good salary in london", "75000 pounds after tax uk" | `/guides/london-75k` | Expat / Career decision | Top 3 |
| **Dubai Tax-Free Living** | "dubai 350k aed salary take home", "cost of living dubai with rent" | `/guides/abudhabi-350k`, `/cities/dubai` | Relocation / FinTech | Top 3 |
| **NYC vs London** | "moving from new york to london salary", "nyc vs london cost of living" | `/relocation/new-york-to-london`, `/compare/new-york-vs-london` | Direct Relocation | Top 1 |
| **London to Dubai** | "moving from london to dubai tax", "london to dubai salary equivalent" | `/relocation/london-to-dubai` | Relocation / Tax optimization | Top 1 |
| **Take-Home Pay** | "salary after tax new york city 2026", "nyc take home pay calculator" | `/salary-after-tax/new-york` | Transactional Calculator | Top 3 |
| **Job Offer Comparison** | "compare two job offers different cities", "job offer comparison calculator" | `/job-offer-comparison` | Career / Executive | Top 1 |
| **International COL** | "cost of living new york 2026", "cost of living london vs dubai" | `/cost-of-living/new-york` | Informational Benchmark | Top 5 |
| **Multilingual Latin America** | "cuanto necesito para vivir en nueva york", "100k dolares nueva york alcanza" | `/es` (Spanish Hub) | International Expat | Top 3 (ES SERP) |
| **GCC Arabic Relocation** | "تكلفة المعيشة في دبي", "راتب كافي في دبي" | `/ar` (Arabic Hub) | Regional GCC | Top 3 (AR SERP) |

---

## 5. Product Analytics & Core Event Tracking

To monitor genuine engagement without harvesting PII, LivWorthy tracks 7 key behavioral conversion events:

1. `calculator_calculation_completed`: Fired when a user enters salary and calculates disposable income.
2. `calculator_tab_switched`: Tracks migration between *Salary Worth*, *Salary Needed*, *Take-Home*, *Living Costs*, and *Comparisons*.
3. `relocation_guide_cta_clicked`: Tracks user progression from calculator results to deep relocation corridor guides.
4. `locale_switched`: Tracks language toggle events (`en`, `es`, `fr`, `ar`).
5. `evidence_drawer_inspected`: Tracks transparency interaction with Tier-1 citations.
6. `assumptions_customized`: Tracks users fine-tuning household structure, rent overrides, or filing status.
7. `job_offer_compared`: Tracks multi-scenario compensation comparison tool usage.
