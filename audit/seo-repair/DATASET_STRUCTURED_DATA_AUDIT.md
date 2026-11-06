# LIVWORTHY.COM — SCHEMA.ORG DATASET STRUCTURED DATA AUDIT & REMEDIATION

**Date:** November 2026  
**Auditor:** Senior Technical SEO Engineer & Full-Stack Developer  
**GSC Issues Addressed:**
- `Dataset structured data: missing license`
- `Dataset structured data: missing creator`  
**Automated Verification:** `test/seo/dataset-structured-data.test.ts` (100% passing across 132 Dataset instances)

---

## 1. Executive Summary & Core Decisions

Google Search Console reported two critical Schema.org Dataset structured data observations across LivWorthy:
1. **Missing `license`**
2. **Missing `creator`**

A comprehensive audit of the prerendering pipeline revealed that Dataset structured data was generated across four key generator templates, but suffered from three distinct technical defects:
- Bare ID references that Google's parser failed to resolve (`creator: { '@id': ... }`).
- Complete omission of `creator` on administrative and localized datasets.
- Use of a synthetic Creative Commons license (`CC-BY-4.0`) and fictional entity name (`LivWorthy Quantitative Research Institute`) rather than LivWorthy's verified corporate identity and terms of use.
- Misuse of the general website Terms of Service (`https://www.livworthy.com/terms`) as a dataset `license`.

### Provenance, Ownership & Licensing Decisions
1. **Dataset Provenance & Attribution:**
   - **Homepage Benchmark Dataset (`/#dataset`):** Proprietary composite benchmark integrating verified statutory tax schedules (IRS, HMRC, CRA, ATO, BMF, etc.) and empirical housing benchmarks (HUD 50th percentile FMR, ONS private rent index, Destatis). Synthesized and owned by LivWorthy.
   - **Coverage Registry Dataset (`/coverage#dataset`):** Transparency registry cataloging tax engine adapters, legal citations, and metropolitan baselines across 39 commercial markets. Created and owned by LivWorthy.
   - **Empirical Research Reports (`/reports/:slug#dataset`):** Original quantitative research papers (Global Salary Worth Index 2026, Tech Relocation Affordability 2026, Remote Work PPP 2026, Middle Class Living Standards G7 2026). Authored and published by LivWorthy.
   - **Localized Research Reports (`/:locale/reports/:slug#dataset`):** Native language editions of the research papers across 9 Tier-1 locales.
2. **Licensing Determination:**
   - General website Terms of Service (`https://www.livworthy.com/terms`) is a YMYL liability disclaimer and user agreement. Section 3 explicitly prohibits automated scraping, wholesale reproduction, or reverse-engineering of proprietary datasets. It does **not** grant or document an open data reuse or redistribution license.
   - In Schema.org and Google Search Central Dataset guidelines, `license` is an **optional/recommended property**, NOT a mandatory property.
   - In accordance with publisher truthfulness and strict legal compliance, **we do not fabricate a Creative Commons license, nor do we misrepresent general website terms as an open data license without owner authorization.**
   - For all LivWorthy datasets where no open redistribution license has been established, the optional `license` field is **truthfully omitted**.
   - If LivWorthy establishes a dedicated open or commercial dataset licensing page (e.g., `https://www.livworthy.com/data-license`), that URL can be linked in the future.
3. **Creator & Publisher Integrity:**
   - Inlined complete `@type: "Organization"`, `name: "LivWorthy"`, `url: "https://www.livworthy.com/"`, `logo: "https://www.livworthy.com/logo.png"`.
   - Eliminated all fictitious personas (e.g., "LivWorthy Quantitative Research Institute").

---

## 2. Generator-by-Generator Audit & Root Cause Analysis

### A. Homepage Dataset (`scripts/generate-seo.ts`)
- **Initial Code:**
  ```typescript
  {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'LivWorthy Global Compensation & Living-Cost Benchmark Data',
    description: 'Empirical net income, progressive statutory tax models...',
    creator: { '@id': `${BASE_URL}/#organization` }
  }
  ```
- **Correction Applied:**
  ```typescript
  {
    '@type': 'Dataset',
    '@id': `${BASE_URL}/#dataset`,
    name: 'LivWorthy Global Income, Tax & Cost of Living Benchmark Dataset',
    description:
      'Income and living-cost intelligence across 39 target markets, with statutory tax calculations available for supported jurisdictions, fair-market rent benchmarks, and essential goods expenditure models.',
    url: `${BASE_URL}/`,
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'LivWorthy',
      url: `${BASE_URL}/`,
      logo: `${BASE_URL}/logo.png`,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'LivWorthy',
      url: `${BASE_URL}/`,
      logo: `${BASE_URL}/logo.png`,
    },
    temporalCoverage: `2024/${LATEST_STATUTORY_TAX_YEAR}`,
    spatialCoverage: 'Global (39 Target Commercial Markets)',
  }
  ```

---

### B. Market & Coverage Registry (`scripts/seo-generators-content.ts` - `/coverage`)
- **Correction Applied:**
  ```typescript
  {
    '@type': 'Dataset',
    '@id': `${baseUrl}/coverage#dataset`,
    name: 'LivWorthy Global Market & Tax Engine Coverage Registry',
    url: `${baseUrl}/coverage`,
    description:
      'Official transparency registry tracking verified statutory personal income tax adapters, limited schedule coverage, and cost-of-living metropolitan benchmarks across 39 commercial markets.',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'LivWorthy',
      url: `${baseUrl}/`,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'LivWorthy',
      url: `${baseUrl}/`,
    },
  }
  ```

---

### C. Empirical Research Reports (`scripts/seo-generators-content.ts` - `/reports/:slug`)
- **Correction Applied:**
  ```typescript
  {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${baseUrl}/${report.slug}#dataset`,
    name: report.title,
    description: report.metaDescription,
    url: `${baseUrl}/${report.slug}`,
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'LivWorthy',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'LivWorthy',
      url: baseUrl,
    },
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `${baseUrl}/${report.slug}`,
      },
    ],
  }
  ```

---

### D. Localized Research Reports (`scripts/localized-long-form-pages.ts` - `/:locale/reports/:slug`)
- **Correction Applied:**
  ```typescript
  {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${canonical}#dataset`,
    name: title,
    description: desc,
    url: canonical,
    inLanguage: intl,
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'LivWorthy',
      url: `${baseUrl}/`,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'LivWorthy',
      url: `${baseUrl}/`,
    },
  }
  ```

---

## 3. Automated Verification & Regression Testing

A dedicated test suite in `test/seo/dataset-structured-data.test.ts` validates all 132 Dataset instances across all 4,226 prerendered HTML documents:

```
========================================================
🧪 Dataset Structured Data & Rich Results Audit Suite
========================================================

✅ PASS: Verified 132 Schema.org Dataset structured data instances.
✅ PASS: 100% of Dataset objects have creator, publisher, description, canonical URL, and truthful licensing metadata.

🎉 ALL DATASET STRUCTURED DATA INVARIANTS PASSED 100%!
```

### Invariants Enforced by Test
1. **`name` & `description`:** Non-empty, substantive (>10 characters). Required by Schema.org and Google.
2. **`creator` & `publisher`:** Must be Organization with `name: 'LivWorthy'` and `url: 'https://www.livworthy.com/'`. Zero synthetic research institutes or personas.
3. **`url`:** Absolute canonical HTTPS URL on `https://www.livworthy.com`.
4. **`isAccessibleForFree`:** Boolean `true`.
5. **Truthful Licensing:** Zero fabricated Creative Commons licenses; no asserting general website Terms as an open data license without dedicated dataset licensing terms.

---

## 4. Google Rich Results & Schema.org Specification Conformance

| Schema.org Property | Google Dataset Requirement | LivWorthy Implementation | Status |
|---|---|---|---|
| **`name`** | Required | Explicit Dataset Title | ✅ Pass |
| **`description`** | Required | Substantive Methodology Summary | ✅ Pass |
| **`creator`** | Recommended | Full `@type: "Organization"`, `name: "LivWorthy"`, `url` | ✅ Pass |
| **`publisher`** | Recommended | Full `@type: "Organization"`, `name: "LivWorthy"`, `url` | ✅ Pass |
| **`url`** | Recommended | Canonical HTTPS URL | ✅ Pass |
| **`isAccessibleForFree`**| Recommended | `true` | ✅ Pass |
| **`license`** | Recommended (Optional) | Omitted truthfully until dedicated data license is authorized | ✅ Compliant with Schema.org |
| **`distribution`** | Recommended | `DataDownload` specified on empirical reports | ✅ Pass |
