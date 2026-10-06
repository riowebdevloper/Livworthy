# LivWorthy — 2027 Tax Year Statutory Integration & Verification Operations

This document establishes the official standard operating procedure (SOP) for integrating, verifying, and publishing statutory individual income tax and social insurance contribution rules for the **2027 Tax Year**.

---

## 1. Core Safety Baseline & Invariant

> [!CRITICAL]
> **Zero Fabrication Invariant**: LivWorthy NEVER extrapolates, guesses, or models future tax brackets before official statutory gazette publication.
> Any calculation requested for an unverified or unpublished tax year (including `taxYear: 2027` prior to official statutory enactment and publication) MUST deterministically return:
> `status: "TAX_CALCULATION_UNAVAILABLE"`
> and `effectiveTaxRate: 0`, preventing misleading financial guidance.

---

## 2. Jurisdiction Registry & Official Primary Gazette Sources

| Jurisdiction ID | Country / Entity | Primary Statutory Authority | Official Publication Channel / URL | Typical Publication Window | 2027 Current State |
|---|---|---|---|---|---|
| `tax-us-fed` | United States (Federal) | Internal Revenue Service (IRS) | IRS Revenue Procedure (Annual Inflation Adjustments) — [irs.gov](https://www.irs.gov) | Oct – Nov 2026 | Pending Official Publication |
| `tax-us-ny-nyc` | New York State & NYC | NYS Dept of Taxation & Finance | Form IT-2105-I Instructions & Tax Law § 601 / § 1304 — [tax.ny.gov](https://www.tax.ny.gov) | Nov – Dec 2026 | Pending Official Publication |
| `tax-us-ca` | California | Franchise Tax Board (FTB) | FTB Form 540 Instructions & Revenue & Taxation Code — [ftb.ca.gov](https://www.ftb.ca.gov) | Oct – Nov 2026 | Pending Official Publication |
| `tax-uk` | United Kingdom | HM Revenue & Customs (HMRC) | Autumn Statement / Finance Bill / Income Tax Act 2007 — [gov.uk](https://www.gov.uk/government/organisations/hm-revenue-customs) | Nov 2026 – Mar 2027 | Pending Official Publication |
| `tax-ca-fed-on` | Canada (Fed + Ontario) | Canada Revenue Agency (CRA) | Indexation Adjustment for Personal Income Tax — [canada.ca](https://www.canada.ca/en/revenue-agency.html) | Nov – Dec 2026 | Pending Official Publication |
| `tax-au` | Australia | Australian Taxation Office (ATO) | Individual Income Tax Rates / Treasury Laws Amendment — [ato.gov.au](https://www.ato.gov.au) | May – Jun 2026 / Dec 2026 | Pending Official Publication |
| `tax-de` | Germany | Bundesministerium der Finanzen (BMF) | Grundfreibetrag & Einkommensteuertarif (EStG) — [bundesfinanzministerium.de](https://www.bundesfinanzministerium.de) | Nov – Dec 2026 | Pending Official Publication |
| `tax-fr` | France | Direction Générale des Finances Publiques (DGFiP) | Loi de finances pour 2027 (Barème de l'impôt sur le revenu) — [impots.gouv.fr](https://www.impots.gouv.fr) | Dec 2026 | Pending Official Publication |
| `tax-es` | Spain | Agencia Tributaria (AEAT) | Ley de Presupuestos Generales del Estado (IRPF) — [agenciatributaria.gob.es](https://www.agenciatributaria.gob.es) | Dec 2026 | Pending Official Publication |
| `tax-nl` | Netherlands | Belastingdienst / Ministerie van Financiën | Belastingplan 2027 (Box 1 Inkomstenbelasting) — [belastingdienst.nl](https://www.belastingdienst.nl) | Sep – Dec 2026 | Pending Official Publication |
| `tax-ie` | Ireland | Revenue Commissioners | Budget 2027 / Finance Bill (Income Tax & USC) — [revenue.ie](https://www.revenue.ie) | Oct – Dec 2026 | Pending Official Publication |
| `tax-ch-zh` | Switzerland (Zurich) | Eidgenössische Steuerverwaltung (ESTV) / Kt. Zürich | Direkte Bundessteuer & Staats- und Gemeindesteuern — [steueramt.zh.ch](https://www.steueramt.zh.ch) | Dec 2026 | Pending Official Publication |
| `tax-sg` | Singapore | Inland Revenue Authority of Singapore (IRAS) | Income Tax Act 1947 & Budget Statement — [iras.gov.sg](https://www.iras.gov.sg) | Feb 2027 | Pending Official Publication |
| `tax-ae` | United Arab Emirates | Federal Tax Authority (FTA) | Federal Decree-Law No. 47 of 2022 (Individual Income: 0%) — [tax.gov.ae](https://tax.gov.ae) | Constant Statutory 0% | Verified Ongoing 0% |
| `tax-sa` | Saudi Arabia | Zakat, Tax and Customs Authority (ZATCA) | Royal Decree (Income Tax: 0%, GOSI: 10% employee contribution) — [zatca.gov.sa](https://zatca.gov.sa) | Constant Statutory | Verified Ongoing |
| `tax-qa` | Qatar | General Tax Authority (GTA) | Income Tax Law No. 24 of 2018 (Individual: 0%) — [gta.gov.qa](https://www.gta.gov.qa) | Constant Statutory 0% | Verified Ongoing 0% |
| `tax-nz` | New Zealand | Inland Revenue Department (Te Tari Taake) | Taxation (Annual Rates for 2026-27) Act — [ird.govt.nz](https://www.ird.govt.nz) | May – Dec 2026 | Pending Official Publication |

---

## 3. Step-by-Step 2027 Integration & Adapter Checklist

When an authority releases official 2027 tax legislation, the following steps must be completed in order:

### Phase 1: Ingestion & Gazette Verification
1. [ ] **Retrieve Primary Document**: Download the authoritative PDF/HTML directly from the official authority domain (no blog or aggregator intermediaries).
2. [ ] **Archive Gazette Source**: Record document ID, publication date, and hash in `src/data/evidence-registry.ts`.
3. [ ] **Document Bracket Thresholds**: Record personal allowance/standard deduction, progressive brackets, surcharges, and social contribution caps.

### Phase 2: Engine Implementation
4. [ ] **Update Jurisdiction Adapter**: Add the `2027` branch into `src/engines/tax/<jurisdiction>/<jurisdiction>-adapter.ts`.
5. [ ] **Preserve Historical 2026 Support**: Ensure existing calculations for `taxYear: 2026` continue to evaluate against 2026 rules without regression.
6. [ ] **Update Rule Version String**: Increment statutory version identifier (e.g. `US-FED-NY-NYC-2027.1`).

### Phase 3: Golden Vector Testing
7. [ ] **Derive Golden Vectors**: Hand-calculate or verify against official government tax calculator worksheets:
   - Low Income ($30,000 / £20,000 / €25,000)
   - Median Professional ($80,000 / £50,000 / €60,000)
   - High Earner ($150,000 / £100,000 / €120,000)
   - Executive Tier ($350,000 / £250,000 / €300,000)
8. [ ] **Add Regression Test Specs**: Add the new golden vectors to `test/golden-vectors.test.ts`.

### Phase 4: Production Gate Verification
9. [ ] Run full test suite: `npm test && npm run test:e2e`.
10. [ ] Run freshness audit: `npx tsx scripts/audit-data-freshness.ts`.
11. [ ] Update `src/engines/tax/tax-registry.ts` to include 2027 in `supportedTaxYears` for the jurisdiction.

---

## 4. Pending 2027 Golden Vector Test Stubs

The following golden vector suites are staged and ready for activation upon official 2027 statutory publication:

```typescript
// Sample Staged Verification Vectors for 2027 Rollout
export const PENDING_2027_GOLDEN_VECTORS = [
  {
    jurisdiction: 'tax-us-fed',
    taxYear: 2027,
    status: 'PENDING_OFFICIAL_IRS_REV_PROC_PUBLICATION',
    expectedBehavior: 'TAX_CALCULATION_UNAVAILABLE until published',
  },
  {
    jurisdiction: 'tax-uk',
    taxYear: 2027,
    status: 'PENDING_AUTUMN_FINANCE_ACT_ROYAL_ASSENT',
    expectedBehavior: 'TAX_CALCULATION_UNAVAILABLE until published',
  },
  {
    jurisdiction: 'tax-de',
    taxYear: 2027,
    status: 'PENDING_BUNDESGESETZBLATT_PUBLICATION',
    expectedBehavior: 'TAX_CALCULATION_UNAVAILABLE until published',
  },
];
```
