import { SeoLandingPage } from '../types/seo-page';
import { SeoEngineAdapter } from './seo-engine-adapter';
import { CITIES, COUNTRIES } from '../data/locations';
import { EVIDENCE_SOURCES } from '../data/evidence-registry';
import { TaxRegistry } from '../engines/tax/tax-registry';
import { createMoney, toMajor } from './money';

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getCategoryTotal(colResult: any, categoryName: string): number {
  const match = colResult.categories.find((c: any) => c.category === categoryName);
  return match ? Math.round(match.monthlyTotal.amountMinor / 100) : 0;
}

function renderEvidenceSection(sourceIds: string[]): string {
  if (!sourceIds || sourceIds.length === 0) return '';
  const uniqueIds = Array.from(new Set(sourceIds));
  const sources = uniqueIds
    .map((id) => EVIDENCE_SOURCES[id])
    .filter(Boolean);

  if (sources.length === 0) return '';

  return `
    <!-- Primary Sources & Statutory Authority -->
    <section aria-label="Primary Sources and Statutory Authority" class="mt-12 pt-8 border-t border-[#DCE3E0]">
      <div class="mb-4">
        <h2 class="text-xl font-bold text-[#102A2E]">Primary Sources &amp; Statutory Authority</h2>
        <p class="text-xs text-[#60706D] mt-0.5">
          Calculations are executed deterministically from official government publications, statutory tax legislation, and verified agency schedules.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        ${sources
          .map(
            (s) => `
          <div class="p-4 bg-white border border-[#DCE3E0] rounded-xl shadow-2xs hover:border-[#167D75] transition-colors flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#167D75] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  ${escapeHtml(s.jurisdiction)}
                </span>
                <span class="text-[10px] text-[#60706D] font-mono">
                  ${escapeHtml(s.reliabilityTier)}
                </span>
              </div>
              <h3 class="text-xs font-bold text-[#102A2E] leading-snug">
                ${escapeHtml(s.organization)}
              </h3>
              <p class="text-[11px] text-[#334D4A] mt-1 leading-relaxed">
                ${escapeHtml(s.canonicalReference)}
              </p>
              <div class="mt-2 text-[10px] text-[#60706D] space-y-0.5">
                ${s.effectiveDate ? `<div>Effective / Period: <strong>${escapeHtml(s.effectiveDate)}</strong></div>` : ''}
                <div>Last reviewed: <strong>${escapeHtml(s.lastReviewedAt || s.verifiedAt || '')}</strong></div>
              </div>
            </div>
            ${
              s.url
                ? `
              <div class="mt-3 pt-2.5 border-t border-[#F7F8F5]">
                <a
                  href="${escapeHtml(s.url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[11px] font-semibold text-[#167D75] hover:underline inline-flex items-center gap-1"
                >
                  <span>Official Primary Source</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            `
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    </section>
  `;
}

const BASE_URL = 'https://www.livworthy.com';

export interface RenderedSeoPageResult {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: 'index, follow' | 'noindex, follow';
  bodyContent: string;
  structuredData: any;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
}

export class SeoPageRenderer {
  public static render(page: SeoLandingPage): RenderedSeoPageResult {
    const canonicalUrl = `${BASE_URL}/${page.slug}`;

    // 1. Build Structured Data Graph
    const breadcrumbItems = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
    ];

    if (page.countryId && COUNTRIES[page.countryId]) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: COUNTRIES[page.countryId].name,
        item: `${BASE_URL}/countries/${page.countryId.toLowerCase()}`,
      });
    }

    if (page.cityId && CITIES[page.cityId]) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: breadcrumbItems.length + 1,
        name: CITIES[page.cityId].name,
        item: `${BASE_URL}/cities/${page.cityId}`,
      });
    } else if (page.pageType === 'comparison') {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: 'City Comparisons',
        item: `${BASE_URL}/compare`,
      });
    }

    breadcrumbItems.push({
      '@type': 'ListItem',
      position: breadcrumbItems.length + 1,
      name: page.h1,
      item: canonicalUrl,
    });

    const faqSchemaItems = page.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }));

    const structuredData: any = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbItems,
        },
        {
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: page.seoTitle,
          description: page.metaDescription,
          publisher: { '@id': `${BASE_URL}/#organization` },
        },
        ...(page.pageType === 'salary-guide'
          ? [
              {
                '@type': 'Article',
                headline: page.h1,
                description: page.metaDescription,
                publisher: { '@id': `${BASE_URL}/#organization` },
                author: {
                  '@type': 'Organization',
                  name: 'LivWorthy Financial Research & Intelligence Team',
                  url: `${BASE_URL}/about`,
                },
                mainEntityOfPage: canonicalUrl,
              },
            ]
          : []),
        ...(faqSchemaItems.length > 0
          ? [
              {
                '@type': 'FAQPage',
                mainEntity: faqSchemaItems,
              },
            ]
          : []),
        ...(page.pageType === 'salary-after-tax' && page.cityId === 'nyc'
          ? [
              {
                '@type': 'WebApplication',
                name: 'NYC Salary After Tax Calculator 2026',
                url: canonicalUrl,
                applicationCategory: 'FinanceApplication',
                operatingSystem: 'All',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                },
              },
            ]
          : []),
      ],
    };

    // 2. Fetch Authoritative Engine Computations
    let dynamicHtml = '';
    let taxRuleVersion = 'STATUTORY-CURRENT';
    let evidenceSourceIds: string[] = [];

    if (page.pageType === 'salary-guide' && page.cityId && page.salaryMajor) {
      const computed = SeoEngineAdapter.computeSalaryGuide(page.cityId, page.salaryMajor);
      taxRuleVersion = computed.taxRuleVersion;
      evidenceSourceIds = computed.evidenceSourceIds;

      const city = CITIES[page.cityId];
      const currency = page.currency || city?.currency || 'USD';

      dynamicHtml = `
        <!-- Financial Breakdown Card -->
        <section aria-label="Financial Breakdown" class="mt-8 p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <div class="flex items-center justify-between border-b border-[#DCE3E0] pb-3 mb-5">
            <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">Tax Year 2026 Statutory Calculation</span>
            <span class="text-xs font-mono text-[#60706D]">${escapeHtml(computed.taxRuleVersion)}</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div class="p-4 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0]">
              <span class="text-xs font-medium text-[#60706D] block">Gross Annual Salary</span>
              <span class="text-xl sm:text-2xl font-black text-[#102A2E] mt-1 block">${currency} ${computed.grossMajor.toLocaleString()}</span>
            </div>
            <div class="p-4 bg-teal-50/50 rounded-xl border border-teal-200">
              <span class="text-xs font-medium text-teal-800 block">Monthly Take-Home</span>
              <span class="text-xl sm:text-2xl font-black text-[#167D75] mt-1 block">${currency} ${computed.takeHomeMonthlyMajor.toLocaleString()}</span>
              <span class="text-[11px] text-[#60706D] mt-0.5 block">${currency} ${computed.takeHomeAnnualMajor.toLocaleString()}/yr</span>
            </div>
            <div class="p-4 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0]">
              <span class="text-xs font-medium text-[#60706D] block">Effective Tax & Deductions</span>
              <span class="text-xl sm:text-2xl font-black text-[#102A2E] mt-1 block">${computed.effectiveTaxRate.toFixed(1)}%</span>
              <span class="text-[11px] text-[#60706D] mt-0.5 block">${currency} ${computed.totalTaxMajor.toLocaleString()} total</span>
            </div>
            <div class="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <span class="text-xs font-medium text-emerald-800 block">Monthly Surplus Savings</span>
              <span class="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">${currency} ${computed.savingsMonthlyMajor.toLocaleString()}</span>
              <span class="text-[11px] text-[#60706D] mt-0.5 block">${computed.savingsRatePercentage.toFixed(1)}% savings rate</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse border border-[#DCE3E0] rounded-xl overflow-hidden">
              <thead>
                <tr class="bg-[#F7F8F5] text-[#102A2E] font-bold">
                  <th class="p-3 border-b border-[#DCE3E0]">Financial Component</th>
                  <th class="p-3 border-b border-[#DCE3E0]">Monthly Amount</th>
                  <th class="p-3 border-b border-[#DCE3E0]">Annual Total</th>
                  <th class="p-3 border-b border-[#DCE3E0]">Share of Gross</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#DCE3E0] bg-white text-[#334D4A]">
                <tr>
                  <td class="p-3 font-semibold text-[#102A2E]">Gross Annual Salary</td>
                  <td class="p-3">${currency} ${Math.round(computed.grossMajor / 12).toLocaleString()}</td>
                  <td class="p-3 font-bold text-[#102A2E]">${currency} ${computed.grossMajor.toLocaleString()}</td>
                  <td class="p-3">100.0%</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-[#102A2E]">Statutory Income Tax & Payroll</td>
                  <td class="p-3">${currency} ${Math.round(computed.totalTaxMajor / 12).toLocaleString()}</td>
                  <td class="p-3 font-semibold text-[#102A2E]">${currency} ${computed.totalTaxMajor.toLocaleString()}</td>
                  <td class="p-3">${computed.effectiveTaxRate.toFixed(1)}%</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-[#102A2E]">Baseline Housing & Rent (1-Bed)</td>
                  <td class="p-3">${currency} ${computed.housingMonthlyMajor.toLocaleString()}</td>
                  <td class="p-3 font-semibold text-[#102A2E]">${currency} ${(computed.housingMonthlyMajor * 12).toLocaleString()}</td>
                  <td class="p-3">${((computed.housingMonthlyMajor * 12 / computed.grossMajor) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-[#102A2E]">Other Essential Living Costs</td>
                  <td class="p-3">${currency} ${(computed.livingCostsMonthlyMajor - computed.housingMonthlyMajor).toLocaleString()}</td>
                  <td class="p-3 font-semibold text-[#102A2E]">${currency} ${((computed.livingCostsMonthlyMajor - computed.housingMonthlyMajor) * 12).toLocaleString()}</td>
                  <td class="p-3">${(((computed.livingCostsMonthlyMajor - computed.housingMonthlyMajor) * 12 / computed.grossMajor) * 100).toFixed(1)}%</td>
                </tr>
                <tr class="bg-emerald-50/30 font-bold">
                  <td class="p-3 text-emerald-900">Uncommitted Discretionary Cash Flow</td>
                  <td class="p-3 text-emerald-700">${currency} ${computed.savingsMonthlyMajor.toLocaleString()}</td>
                  <td class="p-3 text-emerald-700">${currency} ${(computed.savingsMonthlyMajor * 12).toLocaleString()}</td>
                  <td class="p-3 text-emerald-900">${computed.savingsRatePercentage.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      `;
    } else if (page.pageType === 'salary-after-tax' && page.cityId) {
      const computed = SeoEngineAdapter.computeSalaryAfterTax(page.cityId);
      taxRuleVersion = computed.taxRuleVersion;
      evidenceSourceIds = computed.evidenceSourceIds;
      const currency = computed.currency;

      let calculatorHtml = '';
      if (page.cityId === 'nyc') {
        const defGross = createMoney(100000, 'USD');
        const defResult = TaxRegistry.calculate(
          defGross,
          { filingStatus: 'single', dependentsCount: 0, taxYear: 2026 },
          { countryId: 'US', regionId: 'US-NY', cityId: 'nyc', taxYear: 2026 }
        );
        const defNetAnnual = toMajor(defResult.netIncome);
        const defNetMonthly = toMajor(defResult.monthlyNetIncome);
        const defNetBiweekly = Math.round((defNetAnnual / 26) * 100) / 100;
        const defTotalTax = toMajor(defResult.totalDeductionsAndTaxes);
        const defFederal = toMajor(defResult.federalTax);
        const defState = toMajor(defResult.stateTax);
        const defLocal = toMajor(defResult.localTax);
        const defSSComponent = defResult.components.find((c) => c.id === 'us-fica-social-security');
        const defMedComponent = defResult.components.find((c) => c.id === 'us-fica-medicare');
        const defSS = defSSComponent ? toMajor(defSSComponent.amount) : 0;
        const defMed = defMedComponent ? toMajor(defMedComponent.amount) : 0;
        const defRate = defResult.effectiveTaxRate <= 1 ? defResult.effectiveTaxRate * 100 : defResult.effectiveTaxRate;

        calculatorHtml = `
          <!-- Interactive NYC Salary Calculator Island -->
          <div id="interactive-salary-calculator" class="mt-6">
            <div aria-label="Interactive NYC Salary Calculator" class="p-5 sm:p-7 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE3E0] pb-3 mb-5">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-[#167D75]"></span>
                  <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">
                    Interactive Scenario Calculator • 2026 Tax Year • Single Filer • NYC Resident
                  </span>
                </div>
                <span class="text-[11px] font-mono text-[#60706D] bg-[#F7F8F5] px-2.5 py-0.5 rounded-md border border-[#DCE3E0]">
                  ${escapeHtml(defResult.taxRuleVersion)}
                </span>
              </div>

              <div class="space-y-4 mb-6">
                <div>
                  <label for="nyc-gross-salary-static" class="block text-xs font-bold text-[#102A2E] uppercase tracking-wide mb-1.5">
                    Annual Gross Salary (USD)
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base font-bold text-[#60706D]">$</span>
                    <input
                      id="nyc-gross-salary-static"
                      type="number"
                      value="100000"
                      readonly
                      class="w-full pl-8 pr-4 py-2.5 text-lg font-bold text-[#102A2E] bg-white border border-[#DCE3E0] rounded-xl focus:outline-none shadow-xs"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
                <div class="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-teal-900 block">Monthly Take-Home</span>
                  <span class="text-xl sm:text-2xl font-black text-[#167D75] mt-1 block">$${defNetMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span class="text-[11px] text-[#60706D] mt-0.5 block">$${defNetAnnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/yr</span>
                </div>
                <div class="p-3.5 bg-[#F7F8F5] border border-[#DCE3E0] rounded-xl">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-[#60706D] block">Biweekly Paycheck</span>
                  <span class="text-xl sm:text-2xl font-black text-[#102A2E] mt-1 block">$${defNetBiweekly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span class="text-[11px] text-[#60706D] mt-0.5 block">26 pay periods/yr</span>
                </div>
                <div class="p-3.5 bg-[#F7F8F5] border border-[#DCE3E0] rounded-xl">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-[#60706D] block">Effective Tax Rate</span>
                  <span class="text-xl sm:text-2xl font-black text-[#102A2E] mt-1 block">${defRate.toFixed(1)}%</span>
                  <span class="text-[11px] text-[#60706D] mt-0.5 block">All 4 tax layers combined</span>
                </div>
                <div class="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-rose-900 block">Total Withholdings</span>
                  <span class="text-xl sm:text-2xl font-black text-rose-700 mt-1 block">$${defTotalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span class="text-[11px] text-[#60706D] mt-0.5 block">$${Math.round(defTotalTax / 12).toLocaleString()}/mo withheld</span>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse border border-[#DCE3E0] rounded-xl overflow-hidden">
                  <thead>
                    <tr class="bg-[#F7F8F5] text-[#102A2E] font-bold">
                      <th class="p-3 border-b border-[#DCE3E0]">Tax / Withholding Layer</th>
                      <th class="p-3 border-b border-[#DCE3E0]">Statutory Authority</th>
                      <th class="p-3 border-b border-[#DCE3E0]">Annual Amount</th>
                      <th class="p-3 border-b border-[#DCE3E0]">Monthly Amount</th>
                      <th class="p-3 border-b border-[#DCE3E0]">Effective Share</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#DCE3E0] bg-white text-[#334D4A]">
                    <tr>
                      <td class="p-3 font-semibold text-[#102A2E]">Federal Income Tax</td>
                      <td class="p-3 text-[#60706D]">IRS Rev. Proc. 2025-32 ($16,100 std deduction)</td>
                      <td class="p-3 font-semibold text-[#102A2E]">$${defFederal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3">$${(defFederal / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3">${((defFederal / 100000) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td class="p-3 font-semibold text-[#102A2E]">Social Security (FICA)</td>
                      <td class="p-3 text-[#60706D]">6.2% on wages up to $184,500 wage base</td>
                      <td class="p-3 font-semibold text-[#102A2E]">$${defSS.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3">$${(defSS / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3">${((defSS / 100000) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td class="p-3 font-semibold text-[#102A2E]">Medicare (FICA)</td>
                      <td class="p-3 text-[#60706D]">1.45% uncapped + 0.9% above $200k</td>
                      <td class="p-3 font-semibold text-[#102A2E]">$${defMed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3">$${(defMed / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3">${((defMed / 100000) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td class="p-3 font-semibold text-[#102A2E]">New York State Income Tax</td>
                      <td class="p-3 text-[#60706D]">NYS Tax Law § 601 (3.90%–10.90% + IT-2105-I Worksheets)</td>
                      <td class="p-3 font-semibold text-[#102A2E]">$${defState.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3">$${(defState / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3">${((defState / 100000) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td class="p-3 font-semibold text-[#102A2E]">NYC Resident Income Tax</td>
                      <td class="p-3 text-[#60706D]">NYC Admin Code § 11-1701 (3.078%–3.876%)</td>
                      <td class="p-3 font-semibold text-[#102A2E]">$${defLocal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3">$${(defLocal / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3">${((defLocal / 100000) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr class="bg-[#F7F8F5] font-bold text-[#102A2E]">
                      <td class="p-3">Total Taxes &amp; Deductions</td>
                      <td class="p-3 text-[#60706D]">All 4 statutory withholdings combined</td>
                      <td class="p-3 text-rose-700">$${defTotalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3 text-rose-700">$${(defTotalTax / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3 text-rose-700">${defRate.toFixed(1)}%</td>
                    </tr>
                    <tr class="bg-teal-50/50 font-bold text-[#167D75]">
                      <td class="p-3">Net Take-Home Pay</td>
                      <td class="p-3 text-teal-800">Gross salary minus all statutory taxes</td>
                      <td class="p-3 text-xl">$${defNetAnnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3 text-xl">$${defNetMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="p-3 text-teal-800">${(100 - defRate).toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      }

      dynamicHtml = `
        ${calculatorHtml}

        <!-- Crawlable Salary After Tax Benchmark Table -->
        <section aria-label="Salary Benchmark Tiers" class="mt-8 p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <div class="flex items-center justify-between border-b border-[#DCE3E0] pb-3 mb-4">
            <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">Verified Statutory Deductions Schedule (${computed.taxYear})</span>
            <span class="text-xs font-mono text-[#60706D]">${escapeHtml(computed.taxRuleVersion)}</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse border border-[#DCE3E0] rounded-xl overflow-hidden">
              <thead>
                <tr class="bg-[#F7F8F5] text-[#102A2E] font-bold">
                  <th class="p-3 border-b border-[#DCE3E0]">Gross Salary</th>
                  <th class="p-3 border-b border-[#DCE3E0]">Federal Tax</th>
                  <th class="p-3 border-b border-[#DCE3E0]">FICA</th>
                  <th class="p-3 border-b border-[#DCE3E0]">NYS Tax</th>
                  <th class="p-3 border-b border-[#DCE3E0]">NYC Tax</th>
                  <th class="p-3 border-b border-[#DCE3E0]">Total Deductions</th>
                  <th class="p-3 border-b border-[#DCE3E0]">Annual Take-Home</th>
                  <th class="p-3 border-b border-[#DCE3E0]">Monthly Take-Home</th>
                  <th class="p-3 border-b border-[#DCE3E0]">Effective Tax Rate</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#DCE3E0] bg-white text-[#334D4A]">
                ${computed.tiers
                  .map(
                    (t) => `
                  <tr class="hover:bg-teal-50/30 transition-colors">
                    <td class="p-3 font-bold text-[#102A2E]">${currency} ${t.grossMajor.toLocaleString()}</td>
                    <td class="p-3">${currency} ${t.federalTaxMajor.toLocaleString()}</td>
                    <td class="p-3">${currency} ${t.socialContributionsMajor.toLocaleString()}</td>
                    <td class="p-3">${currency} ${t.stateTaxMajor.toLocaleString()}</td>
                    <td class="p-3">${currency} ${t.localTaxMajor.toLocaleString()}</td>
                    <td class="p-3">${currency} ${t.totalTaxMajor.toLocaleString()}</td>
                    <td class="p-3 font-semibold text-[#167D75]">${currency} ${t.takeHomeAnnualMajor.toLocaleString()}</td>
                    <td class="p-3 font-bold text-[#167D75]">${currency} ${t.takeHomeMonthlyMajor.toLocaleString()}</td>
                    <td class="p-3 font-mono font-semibold">${t.effectiveTaxRate.toFixed(1)}%</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>
      `;
    } else if (page.pageType === 'salary-needed' && page.cityId) {
      const computed = SeoEngineAdapter.computeSalaryNeeded(page.cityId);
      taxRuleVersion = computed.taxRuleVersion;
      evidenceSourceIds = computed.evidenceSourceIds;
      const currency = computed.currency;

      dynamicHtml = `
        <!-- Salary Needed Benchmarks -->
        <section aria-label="Salary Needed Benchmarks" class="mt-8 p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <div class="flex items-center justify-between border-b border-[#DCE3E0] pb-3 mb-4">
            <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">Modeled Household Requirements (Tax Year ${computed.taxYear})</span>
            <span class="text-xs font-mono text-[#60706D]">${escapeHtml(computed.taxRuleVersion)}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="p-5 bg-[#F7F8F5] border border-[#DCE3E0] rounded-xl">
              <span class="text-xs font-bold uppercase text-[#167D75]">Single Adult</span>
              <div class="text-2xl font-black text-[#102A2E] mt-2">${currency} ${computed.singleRequiredGrossMajor.toLocaleString()}</div>
              <p class="text-xs text-[#60706D] mt-1">Required gross to cover 1-bed flat &amp; ${currency} 1,000/mo savings.</p>
              <div class="mt-3 pt-3 border-t border-[#DCE3E0] text-xs">
                Monthly Expenses: <strong>${currency} ${computed.singleExpensesMonthlyMajor.toLocaleString()}</strong>
              </div>
            </div>
            <div class="p-5 bg-teal-50/50 border border-teal-200 rounded-xl">
              <span class="text-xs font-bold uppercase text-teal-800">Couple Household</span>
              <div class="text-2xl font-black text-[#167D75] mt-2">${currency} ${computed.coupleRequiredGrossMajor.toLocaleString()}</div>
              <p class="text-xs text-[#60706D] mt-1">Required combined gross for shared 1-bed &amp; ${currency} 1,500/mo savings.</p>
              <div class="mt-3 pt-3 border-t border-teal-200 text-xs">
                Monthly Expenses: <strong>${currency} ${computed.coupleExpensesMonthlyMajor.toLocaleString()}</strong>
              </div>
            </div>
            <div class="p-5 bg-[#F7F8F5] border border-[#DCE3E0] rounded-xl">
              <span class="text-xs font-bold uppercase text-[#167D75]">Family of Four</span>
              <div class="text-2xl font-black text-[#102A2E] mt-2">${currency} ${computed.familyRequiredGrossMajor.toLocaleString()}</div>
              <p class="text-xs text-[#60706D] mt-1">Required combined gross for 2-bed flat &amp; ${currency} 2,000/mo savings.</p>
              <div class="mt-3 pt-3 border-t border-[#DCE3E0] text-xs">
                Monthly Expenses: <strong>${currency} ${computed.familyExpensesMonthlyMajor.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </section>
      `;
    } else if (page.pageType === 'cost-of-living' && page.cityId) {
      const computed = SeoEngineAdapter.computeCostOfLiving(page.cityId);
      evidenceSourceIds = computed.evidenceSourceIds;
      const currency = computed.currency;

      dynamicHtml = `
        <!-- Cost of Living Breakdown -->
        <section aria-label="Cost of Living Breakdown" class="mt-8 p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <div class="flex items-center justify-between border-b border-[#DCE3E0] pb-3 mb-4">
            <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">Cost of Living Breakdown (COL Index: ${computed.singleColIndex})</span>
            <span class="text-xs font-mono text-[#60706D]">Dataset ${escapeHtml(computed.datasetVersion)}</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse border border-[#DCE3E0] rounded-xl overflow-hidden">
              <thead>
                <tr class="bg-[#F7F8F5] text-[#102A2E] font-bold">
                  <th class="p-3 border-b border-[#DCE3E0]">Expense Category</th>
                  <th class="p-3 border-b border-[#DCE3E0]">Single Adult</th>
                  <th class="p-3 border-b border-[#DCE3E0]">Couple (2 Adults)</th>
                  <th class="p-3 border-b border-[#DCE3E0]">Family of Four</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#DCE3E0] bg-white text-[#334D4A]">
                <tr>
                  <td class="p-3 font-semibold text-[#102A2E]">Housing & Rent</td>
                  <td class="p-3 font-bold text-[#102A2E]">${currency} ${Math.round(computed.single.housingMonthly.amountMinor / 100).toLocaleString()}</td>
                  <td class="p-3 font-bold text-[#102A2E]">${currency} ${Math.round(computed.couple.housingMonthly.amountMinor / 100).toLocaleString()}</td>
                  <td class="p-3 font-bold text-[#102A2E]">${currency} ${Math.round(computed.family.housingMonthly.amountMinor / 100).toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-[#102A2E]">Food & Groceries</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.single, 'food').toLocaleString()}</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.couple, 'food').toLocaleString()}</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.family, 'food').toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-[#102A2E]">Transportation</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.single, 'transport').toLocaleString()}</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.couple, 'transport').toLocaleString()}</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.family, 'transport').toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-[#102A2E]">Utilities & Internet</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.single, 'utilities').toLocaleString()}</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.couple, 'utilities').toLocaleString()}</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.family, 'utilities').toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-[#102A2E]">Healthcare & Wellness</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.single, 'healthcare').toLocaleString()}</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.couple, 'healthcare').toLocaleString()}</td>
                  <td class="p-3">${currency} ${getCategoryTotal(computed.family, 'healthcare').toLocaleString()}</td>
                </tr>
                <tr class="bg-teal-50/40 font-bold">
                  <td class="p-3 text-[#167D75]">Total Monthly Living Expenses</td>
                  <td class="p-3 text-[#167D75]">${currency} ${Math.round(computed.single.monthlyTotal.amountMinor / 100).toLocaleString()}</td>
                  <td class="p-3 text-[#167D75]">${currency} ${Math.round(computed.couple.monthlyTotal.amountMinor / 100).toLocaleString()}</td>
                  <td class="p-3 text-[#167D75]">${currency} ${Math.round(computed.family.monthlyTotal.amountMinor / 100).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      `;
    } else if (page.pageType === 'comparison' && page.cityAId && page.cityBId) {
      const computed = SeoEngineAdapter.computeComparison(page.slug, page.cityAId, page.cityBId);
      evidenceSourceIds = computed.evidenceSourceIds;
      const res = computed.result;

      dynamicHtml = `
        <!-- Cross-Border Financial Comparison -->
        <section aria-label="Bilateral Comparison Metrics" class="mt-8 p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <div class="flex items-center justify-between border-b border-[#DCE3E0] pb-3 mb-4">
            <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">Cross-Border Financial Comparison</span>
            <span class="text-xs font-mono text-[#60706D]">Normalized in ${computed.displayCurrency} (Benchmark FX: ${escapeHtml(computed.fxDate.slice(0, 10))})</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div class="p-5 bg-[#F7F8F5] border border-[#DCE3E0] rounded-xl">
              <span class="text-xs font-bold uppercase text-[#167D75]">${escapeHtml(computed.cityAName)}</span>
              <div class="mt-2 text-sm space-y-1">
                <div>Currency: <strong>${computed.currencyA}</strong></div>
                <div>Monthly Take-Home: <strong>${computed.currencyA} ${Math.round(res.outcomeA.takeHomeMonthly.amountMinor / 100).toLocaleString()}</strong></div>
                <div>Monthly Living Costs: <strong>${computed.currencyA} ${Math.round(res.outcomeA.livingCostsMonthly.amountMinor / 100).toLocaleString()}</strong></div>
                <div>Monthly Surplus: <strong class="text-emerald-700">${computed.currencyA} ${Math.round(res.outcomeA.savingsCapacityMonthly.amountMinor / 100).toLocaleString()}</strong></div>
              </div>
            </div>

            <div class="p-5 bg-teal-50/50 border border-teal-200 rounded-xl">
              <span class="text-xs font-bold uppercase text-teal-800">${escapeHtml(computed.cityBName)}</span>
              <div class="mt-2 text-sm space-y-1">
                <div>Currency: <strong>${computed.currencyB}</strong></div>
                <div>Monthly Take-Home: <strong>${computed.currencyB} ${Math.round(res.outcomeB.takeHomeMonthly.amountMinor / 100).toLocaleString()}</strong></div>
                <div>Monthly Living Costs: <strong>${computed.currencyB} ${Math.round(res.outcomeB.livingCostsMonthly.amountMinor / 100).toLocaleString()}</strong></div>
                <div>Monthly Surplus: <strong class="text-emerald-700">${computed.currencyB} ${Math.round(res.outcomeB.savingsCapacityMonthly.amountMinor / 100).toLocaleString()}</strong></div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    // 3. Assemble Complete Semantic Page Body
    const bodyContent = `
      <article class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <!-- Breadcrumb Navigation -->
        <nav aria-label="Breadcrumb" class="text-xs text-[#60706D] mb-6 flex flex-wrap items-center gap-1.5">
          <a href="/" class="hover:text-[#167D75]">Home</a>
          ${breadcrumbItems
            .slice(1, -1)
            .map(
              (item) => `
            <span>/</span>
            <a href="${item.item.replace(BASE_URL, '')}" class="hover:text-[#167D75]">${escapeHtml(item.name)}</a>
          `
            )
            .join('')}
          <span>/</span>
          <span class="text-[#102A2E] font-bold">${escapeHtml(page.h1)}</span>
        </nav>

        <!-- Topic Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-full mb-3">
          <span>${escapeHtml(page.primaryKeyword)}</span> • <span>2026 estimate</span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] tracking-tight leading-tight">
          ${escapeHtml(page.h1)}
        </h1>

        <p class="mt-2 text-[#60706D] text-sm leading-relaxed">
          ${escapeHtml(page.metaDescription)}
        </p>

        <!-- Direct Answer Block -->
        <div class="direct-answer mt-6 p-6 bg-white border-l-4 border-l-[#167D75] border border-[#DCE3E0] rounded-2xl shadow-xs space-y-2">
          <div class="flex items-center justify-between border-b border-[#F7F8F5] pb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">Quick answer</span>
            <span class="text-xs text-[#60706D]">2026 estimate</span>
          </div>
          <p class="text-base text-[#102A2E] leading-relaxed font-semibold">
            <strong>Short answer:</strong> ${escapeHtml(page.directAnswer)}
          </p>
        </div>

        <!-- Calculator CTA Banner (hidden on dedicated interactive calculator pages) -->
        ${
          page.pageType === 'salary-after-tax' && page.cityId === 'nyc'
            ? ''
            : `
        <div class="mt-6 p-5 bg-[#102A2E] text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 class="text-base font-bold text-white">Interactive Scenario Calculator</h3>
            <p class="text-xs text-slate-300 mt-0.5">Customize your household size, rent override, and tax deductions in real time.</p>
          </div>
          <a href="${
            page.pageType === 'salary-needed'
              ? '/salary-needed'
              : page.pageType === 'salary-after-tax'
              ? '/salary-after-tax'
              : page.pageType === 'cost-of-living'
              ? '/cost-of-living'
              : page.pageType === 'comparison'
              ? '/compare'
              : '/salary-worth'
          }" class="px-5 py-2.5 bg-[#167D75] hover:bg-[#136660] text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap shadow-xs">
            Open Interactive Calculator →
          </a>
        </div>
        `
        }

        <!-- Dynamic Financial Engine Cards / Tables -->
        ${dynamicHtml}

        <!-- Deep-Dive Editorial H2 Sections -->
        <div class="mt-10 space-y-8">
          ${page.sections
            .map(
              (sec) => `
            <section id="${escapeHtml(sec.id)}" class="prose max-w-none">
              <h2 class="text-2xl font-bold text-[#102A2E] mb-3 pb-1 border-b border-[#DCE3E0]">${escapeHtml(sec.h2)}</h2>
              ${
                sec.paragraphs
                  ? sec.paragraphs.map((p) => `<p class="text-sm text-[#334D4A] leading-relaxed mb-3">${escapeHtml(p)}</p>`).join('')
                  : ''
              }
              ${
                sec.subsections
                  ? sec.subsections
                      .map(
                        (sub) => `
                <div class="mt-3 p-4 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0]">
                  <h3 class="text-sm font-bold text-[#102A2E]">${escapeHtml(sub.h3)}</h3>
                  <p class="text-xs text-[#334D4A] mt-1 leading-relaxed">${escapeHtml(sub.content)}</p>
                </div>
              `
                      )
                      .join('')
                  : ''
              }
              ${
                sec.table
                  ? `
                <div class="overflow-x-auto mt-4">
                  <table class="w-full text-left text-xs border-collapse border border-[#DCE3E0] rounded-xl overflow-hidden">
                    <thead>
                      <tr class="bg-[#F7F8F5] text-[#102A2E] font-bold">
                        ${sec.table.headers.map((h) => `<th class="p-3 border-b border-[#DCE3E0]">${escapeHtml(h)}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-[#DCE3E0] bg-white text-[#334D4A]">
                      ${sec.table.rows
                        .map(
                          (row) => `
                        <tr>
                          ${row.map((cell) => `<td class="p-3">${escapeHtml(String(cell))}</td>`).join('')}
                        </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>
              `
                  : ''
              }
            </section>
          `
            )
            .join('')}
        </div>

        <!-- Visible FAQ Accordion -->
        ${
          page.faq.length > 0
            ? `
          <section class="mt-12 pt-8 border-t border-[#DCE3E0]">
            <h2 class="text-2xl font-bold text-[#102A2E] mb-6">Frequently Asked Questions</h2>
            <div class="space-y-3">
              ${page.faq
                .map(
                  (f, idx) => `
                <details class="p-4 bg-white border border-[#DCE3E0] rounded-xl group transition-all" ${idx === 0 ? 'open' : ''}>
                  <summary class="font-bold text-sm text-[#102A2E] cursor-pointer flex items-center justify-between list-none">
                    <span>${escapeHtml(f.question)}</span>
                    <span class="text-[#167D75] group-open:rotate-180 transition-transform text-xs">▼</span>
                  </summary>
                  <p class="text-xs text-[#334D4A] mt-3 leading-relaxed pt-2 border-t border-[#F7F8F5]">
                    ${escapeHtml(f.answer)}
                  </p>
                </details>
              `
                )
                .join('')}
            </div>
          </section>
        `
            : ''
        }

        <!-- Visible Primary Sources & Regulatory Authority -->
        ${renderEvidenceSection(evidenceSourceIds)}

        <!-- E-E-A-T Disclaimers, Sources & Methodology -->
        <section class="mt-8 p-6 bg-[#F7F8F5] border border-[#DCE3E0] rounded-2xl text-xs text-[#60706D] space-y-2">
          <div class="font-bold text-[#102A2E] uppercase tracking-wide">Methodology &amp; Regulatory Transparency</div>
          <p>Estimates are informational and not financial, tax, or legal advice. All calculations are executed deterministically using official government gazettes, statutory tax codes, and verified fair-market rent benchmarks.</p>
          <div class="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#167D75]">
            <a href="/methodology" class="hover:underline">Calculation Methodology →</a>
            <a href="/sources" class="hover:underline">Evidence Registry →</a>
            <a href="/editorial-policy" class="hover:underline">Editorial Policy →</a>
            <a href="/corrections" class="hover:underline">Corrections Policy →</a>
          </div>
        </section>

        <!-- Contextual Internal Linking Cluster Grid -->
        <section class="mt-12 pt-8 border-t border-[#DCE3E0]">
          <h2 class="text-xl font-bold text-[#102A2E] mb-4">Related Financial Guides &amp; Calculators</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            ${page.relatedLinks
              .map(
                (link) => `
              <a href="${link.url}" class="p-4 bg-white border border-[#DCE3E0] rounded-xl hover:border-[#167D75] hover:shadow-xs transition-all block group">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#167D75]">${escapeHtml(link.category || 'tool')}</span>
                <div class="font-bold text-sm text-[#102A2E] group-hover:text-[#167D75] transition-colors mt-0.5">${escapeHtml(link.title)}</div>
                <p class="text-[11px] text-[#60706D] mt-1 line-clamp-2">${escapeHtml(link.description)}</p>
              </a>
            `
              )
              .join('')}
          </div>
        </section>
      </article>
    `;

    return {
      title: page.seoTitle,
      description: page.metaDescription,
      canonicalUrl,
      robots: 'index, follow',
      bodyContent,
      structuredData,
      changefreq: 'monthly',
      priority: 0.85,
    };
  }
}
