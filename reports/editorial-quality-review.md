# LivWorthy — Human Editorial Quality Review & Audit Checklist

> **Standard:** Rigorous evaluation against original human analysis, natural sentence cadence, factual statutory substantiation, and zero synthetic persona fabrication.
> **Date:** November 7, 2026
> **Review Scope:** Priority indexable salary guides (`/guides/nyc-100k`, `/guides/zurich-130k`, `/guides/miami-90k`) and canonical interactive tool routes.

---

## 1. Editorial Quality Checklist

Each published guide must satisfy 14 core editorial criteria before indexation:

| # | Review Dimension | Required Standard | Status |
|---|---|---|---|
| 1 | **Natural Reading Flow** | Varied sentence lengths, conversational yet professional cadence, absence of repetitive template structures. | PASS |
| 2 | **Original Analysis** | Substantial value beyond raw government tables (e.g., solo vs roommate budget trade-offs, 40× screening math). | PASS |
| 3 | **Distinctiveness** | Custom city-specific narrative (e.g. MTA OMNY cap in NYC, summer AC electric in Miami, Krankenkasse LAMal in Zurich). Zero copied paragraphs. | PASS |
| 4 | **Answer Completeness** | Direct opening answer with both monthly and annual figures, effective tax rates, and disposable cash flow. | PASS |
| 5 | **Financial Accuracy** | 100% statutory adherence (Form IT-2105-I page 10 schedule, BSV Pillar 3a CHF 7,258 limit, IRS Rev. Proc. 2025-32). | PASS |
| 6 | **Readability & Typography** | Headings 24–30px, body 16px (`text-base`), metadata ≥12px. No cramped 10px text. Comfortable line height. | PASS |
| 7 | **Factual Citations** | Contextual inline clickable citations (`[Text](source:id)`) linking directly to primary PDFs/statutory schedules. | PASS |
| 8 | **Contextual Links** | Seamless cross-linking to interactive calculators and bilateral comparisons. No spammy anchor text. | PASS |
| 9 | **Appropriate Tone** | Objective, balanced, respectful financial advisory perspective. Zero hype ("unlock massive wealth"). | PASS |
| 10 | **Useful Calculations** | Itemized monthly expense tables that reconcile to the exact dollar against net take-home pay (100.0% sum). | PASS |
| 11 | **Clear Assumptions** | Explicit filing status (Single, standard deduction, no retirement match) and budget conventions documented. | PASS |
| 12 | **Correct Heading Nesting**| Strict semantic hierarchy: H1 (1 per page) → H2 (major themes) → H3 (specific subsections). No skipped levels. | PASS |
| 13 | **Mobile Reading Flow** | Tables scroll horizontally with `overflow-x-auto`. No clipping, no cramped cards, no banner overlaps. | PASS |
| 14 | **Actionable Next Steps** | Direct access to interactive calculators allowing users to test their own rent overrides and deduction amounts. | PASS |

---

## 2. Priority Page Evaluations

### A. NYC $100K Salary Guide (`/guides/nyc-100k`)
- **Reading Flow & Tone:** Rewritten from corporate AI boilerplate ("Navigating the dynamic financial landscape...") to direct, practical prose ("On a $100,000 salary in New York City, rent makes a bigger difference to your monthly budget than almost any small spending cut...").
- **Financial Reconciliation:** $100,000 gross yields $70,879 net annually ($5,907/mo rounded) after Federal ($13,170), FICA ($7,650), NYS ($4,860 per IT-2105-I), and NYC ($3,441). Itemized expenses ($4,247) + savings ($1,660) reconcile to the exact dollar ($5,907 net, 100.0%).
- **Inline Citations:** Directly cites `IRS Rev. Proc. 2025-32`, `Form IT-2105-I`, `NYC Admin Code § 11-1701`, `HUD FY 2026 FMR`, and `MTA OMNY fare capping`.
- **Original Scenarios:** Adds Roommate vs Solo living cash flow comparison (extra $15,780/yr savings) and Landlord 40× screening guideline analysis ($2,500 ceiling vs $2,655 HUD benchmark).

### B. Zurich CHF 130K Salary Guide (`/guides/zurich-130k`)
- **Reading Flow & Tone:** Clear, nuanced explanation of the Swiss 3-pillar system, cantonal tax feet, and private health insurance.
- **Financial Reconciliation:** 130,000 CHF gross yields 8,369 CHF/mo net (22.8% effective tax) across AHV/IV/EO/ALV (8,320 CHF), BVG (3,213 CHF illustrative rate for age 35–44), and direct taxes (18,044 CHF). Budget expenses (4,130 CHF) + savings (4,239 CHF) reconcile exactly to 8,369 CHF.
- **Inline Citations:** Directly cites `ESTV DBG 2026`, `BSV Pillar 3a (7,258 CHF limit)`, `BFS Mietpreisindex`, and `BAG Priminfo`.
- **Original Scenarios:** Explains that basic health insurance (Krankenkasse LAMal) is legally mandatory yet **never deducted from payroll**, budgeting 380 CHF/mo out-of-pocket, and details the 50,000+ CHF annual wealth accumulation velocity.

### C. Miami $90K Salary Guide (`/guides/miami-90k`)
- **Reading Flow & Tone:** Realistic South Florida cost analysis balancing Florida's 0% personal state income tax against regional auto insurance and summer AC cooling realities.
- **Financial Reconciliation:** $90,000 gross yields $72,145 net ($6,012/mo) at 19.8% effective tax. Expenses ($3,740) + savings ($2,272) reconcile exactly to $6,012.
- **Inline Citations:** Directly cites `Article VII, Section 5 of the Florida Constitution`, `IRS Rev. Proc. 2025-32`, `HUD FY 2026 FMR`, and `FLHSMV mandatory vehicle insurance`.
- **Original Scenarios:** Added Car Ownership ($520/mo) vs Car-Free living (Brickell/Downtown free Metromover) saving $370/mo ($4,440/yr).

---

## 3. Editorial Integrity & Automation Disclosure

- **Calculation Logic:** Deterministic mathematical execution governed by statutory tax adapters in `src/engines/tax/`. Zero generative AI math hallucinations.
- **Authorship Disclosure:** Researched and edited by the LivWorthy Financial Research & Intelligence Team. Zero fabricated human personas, fictional credentials, or stock headshots.
- **Verification Dates:** Every cited schedule is accompanied by its date of verification and authoritative agency canonical reference.
