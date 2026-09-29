import fs from 'fs';
import path from 'path';
import { COUNTRIES, CITIES, REGIONS, TAX_JURISDICTIONS } from '../src/data/locations';
import { POPULAR_GUIDES_LIST } from '../src/data/salary-guides';
import {
  PLATFORM_IDENTITY,
  CORE_GLOSSARY,
  AUTHORITATIVE_SOURCES,
  CORRECTIONS_LOG,
} from '../src/data/transparency';
import { CapabilityResolver } from '../src/engines/capabilities/capability-resolver';
import { LATEST_STATUTORY_TAX_YEAR } from '../src/engines/tax/tax-registry';

const BASE_URL = 'https://livworthy.com';

interface SeoPage {
  relativePath: string; // e.g. 'countries/us/index.html'
  canonicalUrl: string; // e.g. 'https://livworthy.com/countries/us'
  title: string;
  description: string;
  robots: 'index, follow' | 'noindex, follow';
  bodyContent: string;
  structuredData: any;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
}

export function runSeoGenerator() {
  const distDir = path.resolve('dist');
  const publicDir = path.resolve('public');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('[SEO Generator] dist/index.html not found. Run vite build first.');
    return;
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf-8');

  // Read compiled CSS bundle to inline critical CSS directly into <style id="critical-css">
  const assetsDir = path.join(distDir, 'assets');
  let compiledCss = '';
  if (fs.existsSync(assetsDir)) {
    const cssFiles = fs.readdirSync(assetsDir).filter((f) => f.startsWith('index-') && f.endsWith('.css'));
    if (cssFiles.length > 0) {
      compiledCss = fs.readFileSync(path.join(assetsDir, cssFiles[0]), 'utf-8');
      console.log(`[SEO Generator] Found critical CSS asset: ${cssFiles[0]} (${compiledCss.length} bytes) to inline.`);
    }
  }

  const pages: SeoPage[] = [];

  // 1. Homepage Prerender Enhancements with Complete Structured Data Graph
  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: `${BASE_URL}/`,
        name: 'LivWorthy',
        description: PLATFORM_IDENTITY.coreDefinition,
        publisher: { '@id': `${BASE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${BASE_URL}/?city={search_term_string}&tab=salary-worth`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'LivWorthy',
        url: `${BASE_URL}/`,
        logo: `${BASE_URL}/logo.png`,
        description: PLATFORM_IDENTITY.coreDefinition,
        publishingPrinciples: `${BASE_URL}/editorial-policy`,
        correctionsPolicy: `${BASE_URL}/corrections`,
        knowsAbout: [
          'Statutory Personal Income Tax',
          'Cost of Living Benchmarking',
          'Purchasing Power Parity',
          'Cross-Border Relocation Economics',
          'Take-Home Pay Calculations',
        ],
      },
      {
        '@type': 'WebApplication',
        name: 'LivWorthy Income & Living Intelligence Engine',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All Modern Web Browsers',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'Dataset',
        '@id': `${BASE_URL}/#dataset`,
        name: 'LivWorthy Global Income, Tax & Cost of Living Benchmark Dataset',
        description:
          'Income and living-cost intelligence across 39 target markets, with statutory tax calculations available for supported jurisdictions, fair-market rent benchmarks, and essential goods expenditure models.',
        creator: { '@id': `${BASE_URL}/#organization` },
        temporalCoverage: `2024/${LATEST_STATUTORY_TAX_YEAR}`,
        spatialCoverage: 'Global (39 Target Commercial Markets)',
        license: `${BASE_URL}/terms`,
      },
    ],
  };

  const homeHtmlBody = `
    <div class="min-h-screen flex flex-col bg-[#F7F8F5]">
      <header id="livworthy-header" data-testid="livworth-header" class="bg-[#FFFFFF] border-b border-[#DCE3E0] sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <a href="/" id="header-logo-link" class="flex items-center space-x-3 group py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] focus-visible:ring-offset-2 rounded" aria-label="LivWorthy — Home" title="LivWorthy - Home">
              <picture>
                <source type="image/webp" srcset="/logo-300.webp 1x, /logo-600.webp 2x" />
                <img src="/logo-300.png" srcset="/logo-300.png 1x, /logo-600.png 2x" alt="LivWorthy" width="108" height="36" class="h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]" style="aspect-ratio: 3 / 1;" loading="eager" decoding="async" />
              </picture>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#167D75] border-l border-[#DCE3E0] pl-3 hidden sm:inline">Living Intelligence</span>
            </a>
            <nav aria-label="Site navigation" class="flex items-center space-x-2 sm:space-x-3">
              <a id="nav-how-it-works" href="/methodology" class="inline-flex items-center space-x-1.5 text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-3 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75]" aria-label="How It Works — Methodology">
                <span>How It Works</span>
              </a>
              <a id="nav-sources" href="/sources" class="inline-flex items-center space-x-1.5 text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-3 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75]" aria-label="Sources — Data & Evidence Registry">
                <span>Sources</span>
              </a>
            </nav>
          </div>
          <nav aria-label="Calculator tabs" class="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-[#F7F8F5] bg-white">
            <a href="/?tab=salary-worth" id="tab-salary-worth" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-[#102A2E] text-white shadow-sm">
              <span>Is My Salary Enough?</span>
            </a>
            <a href="/?tab=salary-needed" id="tab-salary-needed" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
              <span>How Much Should I Earn?</span>
            </a>
            <a href="/?tab=salary-after-tax" id="tab-salary-after-tax" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
              <span>Salary After Tax</span>
            </a>
            <a href="/?tab=cost-of-living" id="tab-cost-of-living" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
              <span>Cost of Living</span>
            </a>
            <a href="/?tab=compare" id="tab-compare" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
              <span>Compare Cities</span>
            </a>
            <a href="/?tab=job-offers" id="tab-job-offers" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
              <span>Compare Job Offers</span>
            </a>
            <a href="/guides/nyc-100k" id="tab-guides" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-white text-[#167D75] font-semibold hover:text-[#102A2E] hover:bg-[#F7F8F5]">
              <span>City Salary Guides</span>
            </a>
          </nav>
        </div>
      </header>

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="salary-worth-view" class="space-y-8">
          <div class="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs relative">
            <div class="max-w-2xl">
              <span class="text-xs font-bold tracking-wider text-[#167D75]">
                Global Income & Living Intelligence
              </span>
              <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] mt-1 tracking-tight">
                What is your salary really worth?
              </h1>
              <p class="text-sm sm:text-base text-[#60706D] mt-2 leading-relaxed">
                Enter your salary and city to see how much you could take home, spend and save.
              </p>
              <p class="text-xs text-[#167D75] mt-1 font-medium">
                See if your salary covers living costs and allows you to save in your chosen city.
              </p>
            </div>

            <div class="mt-5 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <span class="text-xs font-semibold text-[#60706D] whitespace-nowrap flex items-center space-x-1">
                <span>Popular Scenarios:</span>
              </span>
              <div class="flex items-center space-x-1.5">
                <span class="text-xs px-2.5 py-1 rounded-full whitespace-nowrap border bg-[#102A2E] text-white border-[#102A2E]">NYC $100k Single</span>
                <span class="text-xs px-2.5 py-1 rounded-full whitespace-nowrap border bg-[#F7F8F5] text-[#102A2E] border-[#DCE3E0]">London £60k Single</span>
                <span class="text-xs px-2.5 py-1 rounded-full whitespace-nowrap border bg-[#F7F8F5] text-[#102A2E] border-[#DCE3E0]">SF $150k Single</span>
                <span class="text-xs px-2.5 py-1 rounded-full whitespace-nowrap border bg-[#F7F8F5] text-[#102A2E] border-[#DCE3E0]">Toronto $90k Single</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-6 pt-6 border-t border-[#F7F8F5]">
              <div class="sm:col-span-5">
                <label for="hero-location-select" class="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider">
                  1. Choose City / Location
                </label>
                <div class="relative">
                  <select id="hero-location-select" aria-label="1. Choose City / Location" class="block w-full rounded-xl border border-[#DCE3E0] bg-[#FFFFFF] px-3.5 py-3 text-base sm:text-lg font-bold text-[#102A2E]">
                    <option value="nyc">New York City (US)</option>
                  </select>
                </div>
                <p class="mt-1 text-xs text-[#60706D]">
                  Statutory tax jurisdiction: US-NY-NYC
                </p>
              </div>

              <div class="sm:col-span-5">
                <div>
                  <label for="hero-annual-salary-input" class="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider">
                    2. Annual Salary
                  </label>
                  <div class="relative rounded-xl shadow-xs">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <span class="text-base sm:text-lg font-bold text-[#60706D]">$</span>
                    </div>
                    <input type="text" id="hero-annual-salary-input" aria-label="2. Annual Salary" class="block w-full rounded-xl border border-[#DCE3E0] bg-[#FFFFFF] pl-8 pr-12 py-3 text-base sm:text-lg font-bold text-[#102A2E]" value="100,000" />
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                      <span class="text-xs font-bold text-[#60706D]">USD</span>
                    </div>
                  </div>
                  <p class="mt-1 text-xs text-[#60706D]">Pre-tax compensation (base salary).</p>
                </div>
              </div>

              <div class="sm:col-span-2 flex flex-col">
                <span class="hidden sm:block text-xs font-semibold mb-1.5 uppercase tracking-wider invisible select-none" aria-hidden="true">
                  Action
                </span>
                <button id="btn-calculate" type="button" class="w-full h-[52px] bg-[#102A2E] text-white font-bold rounded-xl flex items-center justify-center space-x-1.5">
                  <span>Calculate</span>
                </button>
              </div>
            </div>
          </div>

          <div id="result-summary-card" class="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] shadow-xs overflow-hidden transition-all">
            <div class="bg-[#F7F8F5] px-6 py-4 border-b border-[#DCE3E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div>
                  <div class="flex items-center space-x-2">
                    <h2 class="font-bold text-base text-[#102A2E]">New York City Living Worth Result</h2>
                    <span class="text-xs font-semibold bg-[#DDF2EC] text-[#0D625B] px-2 py-0.5 rounded-full">SINGLE</span>
                  </div>
                  <p class="text-xs text-[#60706D] mt-0.5">Statutory 2025 schedule (Official table)</p>
                </div>
                <div class="inline-flex rounded-lg border border-[#DCE3E0] p-0.5 bg-[#FFFFFF] shrink-0 self-start sm:self-center">
                  <button id="period-annual-btn" type="button" class="px-3 py-1 text-xs font-semibold rounded-md bg-[#102A2E] text-white">Annual</button>
                  <button id="period-monthly-btn" type="button" class="px-3 py-1 text-xs font-semibold rounded-md text-[#60706D]">Monthly</button>
                </div>
              </div>
            </div>

            <div class="p-6 sm:p-8 space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between py-2 border-b border-[#F7F8F5] gap-1">
                <div>
                  <div class="font-bold text-sm text-[#102A2E]">Gross Compensation</div>
                  <div class="text-xs text-[#60706D]">Stated total cash salary</div>
                </div>
                <div class="text-2xl sm:text-3xl font-extrabold text-[#102A2E]">$100,000<span class="text-sm font-medium text-[#60706D]">/yr</span></div>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between py-2 border-b border-[#F7F8F5] gap-1">
                <div>
                  <div class="font-bold text-sm text-[#167D75]">Estimated Take-Home <span class="text-xs text-[#60706D] font-normal">(29.7% total tax &amp; FICA)</span></div>
                  <div class="text-xs text-[#60706D]">After federal, state, local resident taxes &amp; social contributions</div>
                </div>
                <div class="text-2xl sm:text-3xl font-extrabold text-[#167D75]">$70,343<span class="text-sm font-medium text-[#60706D]">/yr</span></div>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between py-2 border-b border-[#F7F8F5] gap-1">
                <div>
                  <div class="font-bold text-sm text-[#60706D]">Estimated Living Costs</div>
                  <div class="text-xs text-[#60706D]">Housing (ONE BEDROOM), food, utilities, transit &amp; healthcare</div>
                </div>
                <div class="text-2xl sm:text-3xl font-extrabold text-[#60706D]">−$63,240<span class="text-sm font-medium text-[#60706D]">/yr</span></div>
              </div>

              <div class="bg-[#F7F8F5] rounded-xl p-4 sm:p-5 border border-[#DCE3E0]">
                <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 sm:gap-4">
                  <div class="min-w-0 flex-1">
                    <span class="text-sm font-bold uppercase tracking-wider text-[#102A2E]">Money Left After Expenses</span>
                    <p class="text-xs text-[#60706D] mt-1 max-w-md leading-relaxed">Money you actually keep each year after taxes and estimated living costs — available for savings, investments, or discretionary spending.</p>
                  </div>
                  <div class="text-left sm:text-right shrink-0">
                    <span class="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#167D75]">+$7,103</span>
                    <span class="text-sm font-bold text-[#60706D] block mt-0.5">+$592 / month</span>
                  </div>
                </div>
              </div>

              <div class="space-y-2 pt-2">
                <div class="flex justify-between text-xs font-semibold text-[#102A2E]">
                  <span>Where your salary goes:</span>
                  <span class="text-[#167D75]">Savings: 7%</span>
                </div>
                <div class="h-4 w-full rounded-full bg-[#E5EAE8] overflow-hidden flex shadow-inner">
                  <div style="width: 30%;" class="bg-red-500 h-full" title="Taxes & Deductions: 30%"></div>
                  <div style="width: 46%;" class="bg-blue-600 h-full" title="Housing: 46%"></div>
                  <div style="width: 17%;" class="bg-amber-500 h-full" title="Living Essentials: 17%"></div>
                  <div style="width: 7%;" class="bg-[#167D75] h-full" title="Remaining Surplus: 7%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-4 sm:p-5 shadow-xs">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-[#60706D] block">Detailed Financial Intelligence</span>
                <p class="text-xs text-[#60706D] mt-0.5">Explore statutory tax brackets, itemized living costs, and methodology</p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2">
                <button id="btn-toggle-tax-breakdown" type="button" class="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-lg border border-[#DCE3E0] text-[#102A2E] hover:bg-[#F7F8F5]">
                  <span>See tax breakdown</span>
                </button>
                <button id="btn-toggle-col-breakdown" type="button" class="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-lg border border-[#DCE3E0] text-[#102A2E] hover:bg-[#F7F8F5]">
                  <span>See living-cost breakdown</span>
                </button>
                <button id="btn-toggle-methodology-summary" type="button" class="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-lg border border-[#DCE3E0] text-[#102A2E] hover:bg-[#F7F8F5]">
                  <span>How was this calculated?</span>
                </button>
                <button id="btn-open-evidence" type="button" class="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-lg border border-[#DCE3E0] text-[#102A2E] hover:bg-[#F7F8F5]">
                  <span>View data sources</span>
                </button>
              </div>
            </div>
          </div>

          <section class="mt-8">
            <h2 class="text-xl font-bold text-[#102A2E] mb-4">Core Financial Intelligence Capabilities</h2>
            <ul class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
              <li class="p-4 bg-white rounded-lg border border-slate-200"><strong>Salary Worth:</strong> Evaluate actual disposable income and savings capacity after statutory taxes, rent, and household necessities.</li>
              <li class="p-4 bg-white rounded-lg border border-slate-200"><strong>Salary After Tax:</strong> Authoritative statutory net income calculation accounting for federal, regional/state, local taxes, and mandatory social security contributions.</li>
              <li class="p-4 bg-white rounded-lg border border-slate-200"><strong>Salary Needed:</strong> Solve backwards from target lifestyle or savings goals to determine the gross compensation required.</li>
              <li class="p-4 bg-white rounded-lg border border-slate-200"><strong>Cost of Living:</strong> City-level living cost benchmarks across housing, groceries, transit, healthcare, and utilities.</li>
              <li class="p-4 bg-white rounded-lg border border-slate-200"><strong>City Comparison:</strong> Cross-border financial equivalency modeling with real-time FX snapshot tracking.</li>
              <li class="p-4 bg-white rounded-lg border border-slate-200"><strong>Job Offer Value:</strong> Multi-currency total compensation evaluator separating cash earnings from non-cash benefits.</li>
            </ul>
          </section>

          <section class="mt-8">
            <h2 class="text-xl font-bold text-[#102A2E] mb-4">Supported Commercial Markets</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-sm">
              ${Object.values(COUNTRIES)
                .map(
                  (c) =>
                    `<a href="/countries/${c.id.toLowerCase()}" class="p-2 bg-slate-50 hover:bg-slate-100 rounded text-teal-800 font-medium">${c.name} (${c.verificationStatus})</a>`
                )
                .join('')}
            </div>
          </section>

          <section class="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <h2 class="text-xl font-bold text-[#102A2E] mb-2">Algorithmic & Data Integrity Charter</h2>
            <p class="text-sm text-slate-700 leading-relaxed mb-4">${PLATFORM_IDENTITY.zeroAiMathPolicy}</p>
            <div class="flex flex-wrap gap-4 text-xs font-semibold text-teal-800">
              <a href="/about" class="hover:underline">About LivWorthy →</a>
              <a href="/methodology" class="hover:underline">Calculation Methodology →</a>
              <a href="/sources" class="hover:underline">Verified Sources Registry →</a>
              <a href="/editorial-policy" class="hover:underline">Editorial Policy →</a>
              <a href="/data-policy" class="hover:underline">Data Policy →</a>
              <a href="/corrections" class="hover:underline">Corrections & Feedback →</a>
            </div>
          </section>
        </div>
      </main>

      <footer id="livworthy-footer" data-testid="livworth-footer" class="bg-[#FFFFFF] border-t border-[#DCE3E0] mt-16 py-12 text-sm text-[#60706D]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div class="space-y-4">
              <a href="/" class="text-left group cursor-pointer inline-block" title="LivWorthy Home">
                <picture>
                  <source type="image/webp" srcset="/logo-300.webp 1x, /logo-600.webp 2x" />
                  <img src="/logo-300.png" srcset="/logo-300.png 1x, /logo-600.png 2x" alt="LivWorthy" width="108" height="36" class="h-9 w-auto object-contain" style="aspect-ratio: 3 / 1;" loading="eager" decoding="async" />
                </picture>
              </a>
              <p class="text-xs leading-relaxed text-[#60706D]">
                LivWorthy provides deterministic income and living intelligence across 39 international commercial markets, with statutory tax calculations available for supported jurisdictions, verified consumer price indexes, and official government statistics.
              </p>
              <div class="space-y-1.5 text-xs pt-1">
                <a href="/sources" class="flex items-center text-[#167D75] hover:text-[#0D524D] font-medium transition-colors">
                  <span>Tier 1 Statutory Data Priority</span>
                </a>
                <a href="/methodology" class="flex items-center text-[#60706D] hover:text-[#102A2E] transition-colors">
                  <span>IRS · HMRC · CRA · ATO · EStG · FTA</span>
                </a>
              </div>
            </div>

            <div>
              <div class="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-3">Calculators & Tools</div>
              <ul class="space-y-2 text-xs">
                <li><a href="/?tab=salary-worth" class="hover:text-[#102A2E]">Is My Salary Enough?</a></li>
                <li><a href="/?tab=salary-needed" class="hover:text-[#102A2E]">How Much Should I Earn?</a></li>
                <li><a href="/?tab=salary-after-tax" class="hover:text-[#102A2E]">Salary After Tax</a></li>
                <li><a href="/?tab=cost-of-living" class="hover:text-[#102A2E]">Cost of Living</a></li>
                <li><a href="/?tab=compare" class="hover:text-[#102A2E]">Compare Cities</a></li>
                <li><a href="/?tab=job-offers" class="hover:text-[#102A2E]">Compare Job Offers</a></li>
                <li><a href="/guides/nyc-100k" class="hover:text-[#102A2E] text-[#167D75] font-semibold">City Salary Intelligence Guides →</a></li>
              </ul>
            </div>

            <div>
              <div class="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-3">City Salary Guides</div>
              <ul class="space-y-1 text-xs">
                <li><a href="/guides/nyc-100k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is $100k Enough to Live in NYC?</a></li>
                <li><a href="/guides/london-60k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is £60k Enough to Live in London?</a></li>
                <li><a href="/guides/sf-150k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is $150k Enough to Live in San Francisco?</a></li>
                <li><a href="/guides/toronto-90k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is $90k CAD Enough to Live in Toronto?</a></li>
                <li><a href="/guides/sydney-120k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is $120k AUD Enough to Live in Sydney?</a></li>
                <li><a href="/guides/dubai-30k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is 30k AED/mo Enough to Live in Dubai?</a></li>
                <li><a href="/guides/singapore-10k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is $10k SGD/mo Enough to Live in Singapore?</a></li>
                <li><a href="/guides/berlin-65k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is €65k Enough to Live in Berlin?</a></li>
              </ul>
            </div>

            <div>
              <div class="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-3">Integrity & Governance</div>
              <ul class="space-y-1 text-xs">
                <li><a href="/methodology" class="min-h-[24px] py-1 flex items-center hover:text-[#102A2E] underline">Calculation Methodology</a></li>
                <li><a href="/sources" class="min-h-[24px] py-1 flex items-center hover:text-[#102A2E] underline">Sources & Evidence Registry</a></li>
                <li><a href="/about" class="min-h-[24px] py-1 flex items-center hover:text-[#102A2E]">About LivWorthy</a></li>
                <li><a href="/editorial-policy" class="min-h-[24px] py-1 flex items-center hover:text-[#102A2E]">Editorial & Verification Policy</a></li>
                <li><a href="/data-policy" class="min-h-[44px] sm:min-h-[24px] py-2 sm:py-1 flex items-center hover:text-[#102A2E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">Data Policy (Zero PII & Zero Fabrication)</a></li>
                <li><a href="/privacy" class="min-h-[44px] sm:min-h-[24px] py-2 sm:py-1 flex items-center hover:text-[#102A2E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div class="border-t border-[#F7F8F5] pt-6 pb-6">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span class="font-bold text-xs uppercase tracking-wider text-[#102A2E]">Popular City Income Hubs</span>
              <span class="text-[11px] text-slate-600 font-medium">Explore city salary benchmarks</span>
            </div>
            <div class="flex flex-wrap gap-2 text-xs">
              <a href="/cities/nyc" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">New York City (US)</a>
              <a href="/cities/sf" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">San Francisco (US)</a>
              <a href="/cities/london" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">London (UK)</a>
              <a href="/cities/dubai" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">Dubai (UAE)</a>
              <a href="/cities/toronto" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">Toronto (Canada)</a>
              <a href="/cities/sydney" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">Sydney (Australia)</a>
              <a href="/cities/berlin" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">Berlin (Germany)</a>
              <a href="/cities/singapore" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">Singapore (Singapore)</a>
              <a href="/cities/tokyo" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">Tokyo (Japan)</a>
              <a href="/cities/zurich" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">Zurich (Switzerland)</a>
              <a href="/cities/dublin" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">Dublin (Ireland)</a>
              <a href="/cities/mumbai" class="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 flex items-center">Mumbai (India)</a>
            </div>
          </div>

          <div class="border-t border-[#F7F8F5] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#60706D] gap-3">
            <p>© ${new Date().getFullYear()} LivWorthy. Know what your income is really worth.</p>
            <nav aria-label="Legal and policy links" class="flex flex-wrap items-center justify-center sm:justify-end gap-x-2 sm:gap-x-3 gap-y-2 text-xs">
              <a href="/about" class="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">About</a>
              <span class="hidden sm:inline" aria-hidden="true">·</span>
              <a href="/methodology" class="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">Methodology</a>
              <span class="hidden sm:inline" aria-hidden="true">·</span>
              <a href="/sources" class="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">Sources</a>
              <span class="hidden sm:inline" aria-hidden="true">·</span>
              <a href="/editorial-policy" class="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">Editorial Policy</a>
              <span class="hidden sm:inline" aria-hidden="true">·</span>
              <a href="/data-policy" class="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">Data Policy</a>
              <span class="hidden sm:inline" aria-hidden="true">·</span>
              <a href="/corrections" class="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">Corrections</a>
              <span class="hidden sm:inline" aria-hidden="true">·</span>
              <a href="/terms" class="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">Terms & YMYL Disclaimer</a>
              <span class="hidden sm:inline" aria-hidden="true">·</span>
              <a href="/privacy" class="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">Privacy Policy</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  `;

  // Update dist/index.html with pre-rendered homepage body and inlined critical CSS
  const prerenderedHome = renderPageHtml(
    baseHtml,
    {
      title: 'LivWorthy — Know what your income is really worth',
      description: 'Know what your income is really worth. Precision global income and living intelligence platform across 39 international markets.',
      canonicalUrl: `${BASE_URL}/`,
      robots: 'index, follow',
      bodyContent: homeHtmlBody,
      structuredData: homeStructuredData,
    },
    true,
    compiledCss
  );
  fs.writeFileSync(templatePath, prerenderedHome);

  // 2. Transparency & E-E-A-T Institutional Pages
  const transparencyPages = createTransparencyPages();
  pages.push(...transparencyPages);

  // 2b. Directory Pages (/countries, /cities, /guides)
  const directoryPages = createDirectoryPages();
  pages.push(...directoryPages);

  // 3. Country Hub Pages
  for (const country of Object.values(COUNTRIES)) {
    const cap = CapabilityResolver.resolve(country.id);
    const hasTax = cap.hasDedicatedTaxAdapter;
    const isProvisional = country.verificationStatus === 'PROVISIONAL' || country.verificationStatus === 'UNSUPPORTED' || !hasTax;
    const countryCities = Object.values(CITIES).filter((c) => c.countryId === country.id);

    const countryStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: country.name, item: `${BASE_URL}/countries/${country.id.toLowerCase()}` },
          ],
        },
        {
          '@type': 'WebPage',
          name: hasTax
            ? `${country.name} Income & Living Intelligence`
            : `${country.name} Cost of Living & City Intelligence`,
          url: `${BASE_URL}/countries/${country.id.toLowerCase()}`,
          description: hasTax
            ? `Analyze take-home pay, statutory taxes (${cap.taxYear || LATEST_STATUTORY_TAX_YEAR}), and living expenses in ${country.name}.`
            : `Analyze cost of living benchmarks, fair-market rent, and metropolitan expenditure in ${country.name}.`,
          publisher: { '@id': `${BASE_URL}/#organization` },
        },
      ],
    };

    const countryBody = `
      <article class="max-w-5xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">${country.name}</span></nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">${country.name} ${hasTax ? 'Income & Living Intelligence' : 'Cost of Living Intelligence'}</h1>
        <p class="mt-2 text-slate-600">${hasTax
          ? `Comprehensive statutory salary calculations, tax breakdowns (Tax Year ${cap.taxYear || LATEST_STATUTORY_TAX_YEAR}), cost of living indices, and major city benchmarks for ${country.name}.`
          : `Cost of living benchmarks, fair market rent data, and major metropolitan indices for ${country.name}. Statutory tax calculations are currently under statutory verification.`}</p>
        <div class="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-full">
          Status: ${hasTax ? `${country.verificationStatus} ADAPTER (${cap.taxYear || LATEST_STATUTORY_TAX_YEAR})` : 'COST OF LIVING AVAILABLE (TAX UNDER VERIFICATION)'}
        </div>
        ${country.notes ? `<p class="mt-3 text-sm text-slate-500 italic">${country.notes}</p>` : ''}

        <section class="mt-8">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">Major Cities in ${country.name}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            ${countryCities.map((ct) => `
              <a href="/cities/${ct.id}" class="p-4 bg-white border border-slate-200 rounded-lg hover:border-teal-500 transition-colors shadow-sm block">
                <span class="font-bold text-slate-900 block">${ct.name}</span>
                <span class="text-xs text-slate-500 block mt-1">${ct.metroAreaName || ct.name}</span>
                <span class="text-xs text-teal-700 font-medium block mt-2">Currency: ${ct.currency} • COL Index: ${ct.colIndexBase100NYC} (NYC=100)</span>
              </a>
            `).join('')}
          </div>
        </section>

        <section class="mt-8">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">Calculators & Tools for ${country.name}</h2>
          <div class="flex flex-wrap gap-2 text-sm">
            ${countryCities.slice(0, 1).map((ct) => `
              ${hasTax ? `<a href="/?city=${ct.id}&tab=salary-worth" class="px-4 py-2 bg-teal-700 text-white rounded font-medium hover:bg-teal-800">Calculate Salary Worth</a>
              <a href="/?city=${ct.id}&tab=salary-after-tax" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary After Tax</a>
              <a href="/?city=${ct.id}&tab=salary-needed" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary Needed</a>` : ''}
              <a href="/?city=${ct.id}&tab=cost-of-living" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Cost of Living</a>
              <a href="/?city=${ct.id}&tab=compare" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Compare With Another City</a>
            `).join('')}
          </div>
        </section>
      </article>
    `;

    pages.push({
      relativePath: `countries/${country.id.toLowerCase()}/index.html`,
      canonicalUrl: `${BASE_URL}/countries/${country.id.toLowerCase()}`,
      title: hasTax
        ? `${country.name} Living & Income Intelligence | LivWorthy`
        : `${country.name} Cost of Living & City Intelligence | LivWorthy`,
      description: hasTax
        ? `Authoritative statutory salary, tax (${cap.taxYear || LATEST_STATUTORY_TAX_YEAR}), and cost-of-living intelligence for ${country.name}. Compute net income and living benchmarks.`
        : `Cost of living indices, fair market rent benchmarks, and metropolitan expenditure data for ${country.name}.`,
      robots: isProvisional ? 'noindex, follow' : 'index, follow',
      bodyContent: countryBody,
      structuredData: countryStructuredData,
      changefreq: 'weekly',
      priority: country.verificationStatus === 'VERIFIED' ? 0.8 : 0.6,
    });
  }

  // 4. City Hub Pages
  for (const city of Object.values(CITIES)) {
    const country = COUNTRIES[city.countryId];
    const region = city.regionId ? REGIONS[city.regionId] : undefined;
    const cap = CapabilityResolver.resolve(city.countryId);
    const hasTax = cap.hasDedicatedTaxAdapter;
    const isProvisional = city.verificationStatus === 'PROVISIONAL' || city.verificationStatus === 'UNSUPPORTED' || !hasTax || (country && country.verificationStatus === 'UNSUPPORTED');

    const cityStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: country ? country.name : city.countryId, item: `${BASE_URL}/countries/${city.countryId.toLowerCase()}` },
            ...(region ? [{ '@type': 'ListItem', position: 3, name: region.name, item: `${BASE_URL}/cities/${city.id}` }] : []),
            { '@type': 'ListItem', position: region ? 4 : 3, name: city.name, item: `${BASE_URL}/cities/${city.id}` },
          ],
        },
        {
          '@type': 'City',
          name: city.name,
          containedInPlace: {
            '@type': 'Country',
            name: country ? country.name : city.countryId,
          },
        },
      ],
    };

    const cityBody = `
      <article class="max-w-5xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6 flex flex-wrap items-center gap-1.5">
          <a href="/" class="hover:text-teal-700 font-medium">Home</a>
          <span>/</span>
          <a href="/countries/${city.countryId.toLowerCase()}" class="hover:text-teal-700 font-medium">${country ? country.name : city.countryId}</a>
          ${region ? `<span>/</span><a href="/cities/${city.id}" class="hover:text-teal-700 font-medium">${region.name}</a>` : ''}
          <span>/</span>
          <span class="text-slate-800 font-bold">${city.name}</span>
        </nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">${city.name} ${hasTax ? 'Income, Tax & Cost of Living Intelligence' : 'Cost of Living & City Intelligence'}</h1>
        <p class="mt-2 text-slate-600">${hasTax
          ? `Financial living analysis for ${city.name} (${country ? country.name : city.countryId}). Metro area: ${city.metroAreaName}. Tax Year: ${cap.taxYear || LATEST_STATUTORY_TAX_YEAR}.`
          : `Metropolitan cost of living and housing expense analysis for ${city.name} (${country ? country.name : city.countryId}). Metro area: ${city.metroAreaName}.`}</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div class="p-4 bg-white border border-slate-200 rounded-lg">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Currency</span>
            <div class="text-xl font-bold text-slate-900 mt-1">${city.currency}</div>
          </div>
          <div class="p-4 bg-white border border-slate-200 rounded-lg">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">COL Index (NYC = 100)</span>
            <div class="text-xl font-bold text-slate-900 mt-1">${city.colIndexBase100NYC}</div>
          </div>
          <div class="p-4 bg-white border border-slate-200 rounded-lg">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Verification Status</span>
            <div class="text-xl font-bold text-teal-700 mt-1">${hasTax ? city.verificationStatus : 'COST OF LIVING AVAILABLE'}</div>
          </div>
        </div>

        <section class="mt-8">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">Calculators for ${city.name}</h2>
          <div class="flex flex-wrap gap-2 text-sm">
            ${hasTax ? `<a href="/?city=${city.id}&tab=salary-worth" class="px-4 py-2 bg-teal-700 text-white rounded font-medium hover:bg-teal-800">Calculate Salary Worth</a>
            <a href="/?city=${city.id}&tab=salary-after-tax" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary After Tax</a>
            <a href="/?city=${city.id}&tab=salary-needed" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary Needed</a>` : ''}
            <a href="/?city=${city.id}&tab=cost-of-living" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Cost of Living</a>
            <a href="/?city=${city.id}&tab=compare" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Compare With Another City</a>
          </div>
        </section>
      </article>
    `;

    pages.push({
      relativePath: `cities/${city.id}/index.html`,
      canonicalUrl: `${BASE_URL}/cities/${city.id}`,
      title: hasTax
        ? `${city.name} Income, Tax & Cost of Living Intelligence | LivWorthy`
        : `${city.name} Cost of Living & City Intelligence | LivWorthy`,
      description: hasTax
        ? `Authoritative living costs, statutory income tax schedules (${cap.taxYear || LATEST_STATUTORY_TAX_YEAR}), and salary benchmarks for ${city.name} (${country ? country.name : city.countryId}).`
        : `Metropolitan living costs, fair-market rent benchmarks, and consumer expenditure indices for ${city.name} (${country ? country.name : city.countryId}).`,
      robots: isProvisional ? 'noindex, follow' : 'index, follow',
      bodyContent: cityBody,
      structuredData: cityStructuredData,
      changefreq: 'weekly',
      priority: city.verificationStatus === 'VERIFIED' ? 0.9 : 0.7,
    });
  }

  // 5. Comparison Landing Pages
  const COMPARISONS = [
    { slug: 'new-york-vs-london', cityAId: 'nyc', cityBId: 'london' },
    { slug: 'new-york-vs-dubai', cityAId: 'nyc', cityBId: 'dubai' },
    { slug: 'london-vs-dubai', cityAId: 'london', cityBId: 'dubai' },
    { slug: 'toronto-vs-vancouver', cityAId: 'toronto', cityBId: 'vancouver' },
    { slug: 'sydney-vs-melbourne', cityAId: 'sydney', cityBId: 'melbourne' },
    { slug: 'berlin-vs-munich', cityAId: 'berlin', cityBId: 'munich' },
    { slug: 'singapore-vs-dubai', cityAId: 'singapore', cityBId: 'dubai' },
  ];

  for (const comp of COMPARISONS) {
    const cityA = CITIES[comp.cityAId];
    const cityB = CITIES[comp.cityBId];
    if (!cityA || !cityB) continue;

    const compStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: `${cityA.name} vs ${cityB.name}`, item: `${BASE_URL}/compare/${comp.slug}` },
          ],
        },
      ],
    };

    const compBody = `
      <article class="max-w-5xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">${cityA.name} vs ${cityB.name}</span></nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">${cityA.name} vs ${cityB.name} Salary & Cost of Living Comparison</h1>
        <p class="mt-2 text-slate-600">Cross-border financial living analysis comparing disposable income, statutory taxes, and purchasing power between ${cityA.name} and ${cityB.name}.</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div class="p-5 bg-white border border-slate-200 rounded-xl">
            <h2 class="text-lg font-bold text-slate-900">${cityA.name}</h2>
            <p class="text-xs text-slate-500 mt-0.5">${cityA.metroAreaName}</p>
            <div class="mt-3 text-sm space-y-1">
              <div>Currency: <strong>${cityA.currency}</strong></div>
              <div>COL Index: <strong>${cityA.colIndexBase100NYC}</strong></div>
              <div>Tax Status: <span class="text-teal-700 font-semibold">${cityA.verificationStatus}</span></div>
            </div>
          </div>
          <div class="p-5 bg-white border border-slate-200 rounded-xl">
            <h2 class="text-lg font-bold text-slate-900">${cityB.name}</h2>
            <p class="text-xs text-slate-500 mt-0.5">${cityB.metroAreaName}</p>
            <div class="mt-3 text-sm space-y-1">
              <div>Currency: <strong>${cityB.currency}</strong></div>
              <div>COL Index: <strong>${cityB.colIndexBase100NYC}</strong></div>
              <div>Tax Status: <span class="text-teal-700 font-semibold">${cityB.verificationStatus}</span></div>
            </div>
          </div>
        </div>

        <div class="mt-8">
          <a href="/?city=${cityA.id}&tab=compare" class="px-5 py-2.5 bg-teal-700 text-white font-bold text-sm rounded-xl hover:bg-teal-800 inline-block shadow-sm">
            Launch Live Interactive Comparison
          </a>
        </div>
      </article>
    `;

    pages.push({
      relativePath: `compare/${comp.slug}/index.html`,
      canonicalUrl: `${BASE_URL}/compare/${comp.slug}`,
      title: `${cityA.name} vs ${cityB.name} Salary & Living Cost Comparison | LivWorthy`,
      description: `Compare salary worth, tax rates, rent, and household purchasing power between ${cityA.name} and ${cityB.name}. Deterministic cross-border calculator.`,
      robots: 'index, follow',
      bodyContent: compBody,
      structuredData: compStructuredData,
      changefreq: 'monthly',
      priority: 0.8,
    });
  }

  // 6. Global City Salary Guides (with AEO Direct Answer, Fact Tables, and Canonical Definitions)
  for (const g of POPULAR_GUIDES_LIST) {
    const city = CITIES[g.cityId] || CITIES.nyc;
    const country = COUNTRIES[g.countryId] || COUNTRIES.US;
    const region = (g.regionId && REGIONS[g.regionId]) ? REGIONS[g.regionId] : (city.regionId && REGIONS[city.regionId] ? REGIONS[city.regionId] : undefined);
    const cap = CapabilityResolver.resolve(g.countryId);

    const guideStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: country.name, item: `${BASE_URL}/countries/${country.id.toLowerCase()}` },
            ...(region ? [{ '@type': 'ListItem', position: 3, name: region.name, item: `${BASE_URL}/cities/${city.id}` }] : []),
            { '@type': 'ListItem', position: region ? 4 : 3, name: city.name, item: `${BASE_URL}/cities/${city.id}` },
            { '@type': 'ListItem', position: region ? 5 : 4, name: g.title, item: `${BASE_URL}/guides/${g.slug}` },
          ],
        },
        {
          '@type': 'Article',
          headline: g.title,
          description: `${g.headlineSummary} Comprehensive financial analysis of a ${g.currency} ${g.salaryMajor.toLocaleString()} salary in ${city.name}.`,
          publisher: { '@id': `${BASE_URL}/#organization` },
          author: {
            '@type': 'Organization',
            name: PLATFORM_IDENTITY.publisher,
            url: `${BASE_URL}/about`,
          },
          mainEntityOfPage: `${BASE_URL}/guides/${g.slug}`,
        },
      ],
    };

    const guideBody = `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6 flex flex-wrap items-center gap-1.5">
          <a href="/" class="hover:text-teal-700 font-medium">Home</a>
          <span>/</span>
          <a href="/countries/${country.id.toLowerCase()}" class="hover:text-teal-700 font-medium">${country.name}</a>
          <span>/</span>
          ${region ? `<a href="/cities/${city.id}" class="hover:text-teal-700 font-medium">${region.name}</a><span>/</span>` : ''}
          <a href="/cities/${city.id}" class="hover:text-teal-700 font-medium">${city.name}</a>
          <span>/</span>
          <span class="text-slate-800 font-bold">${g.title}</span>
        </nav>

        <div class="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-full mb-3">
          <span>${country.name}</span> • ${region ? `<span>${region.name}</span> • ` : ''}<span>${city.name}</span> • <span>${cap.hasDedicatedTaxAdapter ? `Verified Statutory Benchmark (Tax Year ${cap.taxYear || LATEST_STATUTORY_TAX_YEAR})` : 'Cost of Living & Purchasing Power Benchmark (Tax Under Verification)'}</span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] tracking-tight leading-tight">
          ${g.title}
        </h1>

        <p class="mt-2 text-slate-600 text-sm leading-relaxed">
          Comprehensive income intelligence analyzing take-home pay, statutory deductions, baseline housing costs, and uncommitted disposable savings in ${city.name}.
        </p>

        <!-- AEO Direct Answer Block -->
        <section aria-label="Direct Financial Answer & Verdict" class="mt-6 p-6 sm:p-7 bg-white border-l-4 border-l-teal-600 border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-teal-700">AEO Direct Answer & Verdict</span>
            <span class="text-xs text-slate-500">${cap.hasDedicatedTaxAdapter ? `Tax Year ${cap.taxYear || LATEST_STATUTORY_TAX_YEAR} / Deterministic Statutory Model` : 'Cost of Living Benchmark / Statutory Tax Schedules Under Verification'}</span>
          </div>
          <p class="text-base text-slate-900 leading-relaxed font-semibold">
            ${g.headlineSummary}
          </p>
          <p class="text-sm text-slate-700 leading-relaxed">
            ${g.lifestyleContext}
          </p>
          <div class="pt-2 text-xs text-slate-500 border-t border-slate-100">
            Market Context: ${g.benchmarkContext}
          </div>
        </section>

        <!-- Semantic HTML Fact Table for Search & AI Engines -->
        <section aria-label="Component Breakdown Table" class="mt-8">
          <h2 class="text-lg font-bold text-slate-900 mb-3">Benchmark Summary Table (${g.currency} ${g.salaryMajor.toLocaleString()} in ${city.name})</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr class="bg-slate-100 text-slate-800 font-bold">
                  <th class="p-3 border-b border-slate-200">Financial Metric</th>
                  <th class="p-3 border-b border-slate-200">Amount</th>
                  <th class="p-3 border-b border-slate-200">Classification</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
                <tr>
                  <td class="p-3 font-semibold">Gross Annual Salary</td>
                  <td class="p-3 font-bold text-slate-900">${g.currency} ${g.salaryMajor.toLocaleString()}</td>
                  <td class="p-3">Scenario Input</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold">Jurisdiction / Location</td>
                  <td class="p-3">${city.name}, ${country.name}</td>
                  <td class="p-3">Tax Entity</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold">Cost of Living Index (NYC = 100)</td>
                  <td class="p-3 font-bold">${city.colIndexBase100NYC}</td>
                  <td class="p-3">Statistical Benchmark</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold">Statutory Deductions Status</td>
                  <td class="p-3 text-teal-800 font-semibold">${cap.hasDedicatedTaxAdapter ? country.verificationStatus : 'UNDER VERIFICATION'}</td>
                  <td class="p-3">${cap.hasDedicatedTaxAdapter ? 'Official Schedule' : 'Research Phase'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <a href="/?city=${city.id}&salary=${g.salaryMajor}&tab=nyc-100k-guide&guide=${g.slug}" class="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors">
            Launch Live Interactive Scenario (${g.currency} ${g.salaryMajor.toLocaleString()})
          </a>
          <a href="/cities/${city.id}" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm rounded-xl transition-colors">
            Explore All ${city.name} Calculators
          </a>
          <a href="/methodology" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm rounded-xl transition-colors">
            Methodology
          </a>
        </div>
      </article>
    `;

    pages.push({
      relativePath: `guides/${g.slug}/index.html`,
      canonicalUrl: `${BASE_URL}/guides/${g.slug}`,
      title: `${g.title} | LivWorthy`,
      description: `${g.headlineSummary} Comprehensive financial analysis of a ${g.currency} ${g.salaryMajor.toLocaleString()} salary in ${city.name}.`,
      robots: 'index, follow',
      bodyContent: guideBody,
      structuredData: guideStructuredData,
      changefreq: 'monthly',
      priority: 0.8,
    });

    // Support backward-compatible alias
    if (g.slug === 'nyc-100k') {
      pages.push({
        relativePath: `guides/100k-salary-new-york/index.html`,
        canonicalUrl: `${BASE_URL}/guides/100k-salary-new-york`,
        title: `${g.title} | LivWorthy`,
        description: `${g.headlineSummary} Comprehensive financial analysis of a ${g.currency} ${g.salaryMajor.toLocaleString()} salary in ${city.name}.`,
        robots: 'index, follow',
        bodyContent: guideBody,
        structuredData: guideStructuredData,
        changefreq: 'monthly',
        priority: 0.8,
      });
    }
  }

  // Write all static HTML files
  let generatedCount = 0;
  for (const page of pages) {
    const outFilePath = path.join(distDir, page.relativePath);
    const outDirPath = path.dirname(outFilePath);
    if (!fs.existsSync(outDirPath)) {
      fs.mkdirSync(outDirPath, { recursive: true });
    }

    const html = renderPageHtml(baseHtml, page, false, compiledCss);
    fs.writeFileSync(outFilePath, html);
    generatedCount++;
  }
  console.log(`[SEO Generator] Successfully prerendered ${generatedCount} static HTML pages.`);

  // 7. Generate Segmented Sitemaps & Sitemap Index
  generateSitemaps(distDir, publicDir, pages);

  // 8. Ensure robots.txt, llms.txt & ads.txt
  writeStaticFiles(distDir, publicDir);

  // 9. Content Gap Report
  runContentGapReport();
}

function createDirectoryPages(): SeoPage[] {
  const pages: SeoPage[] = [];

  // 1. Countries Directory (/countries)
  const allCountriesList = Object.values(COUNTRIES).sort((a, b) => a.name.localeCompare(b.name));
  const countriesStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Countries Directory', item: `${BASE_URL}/countries` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: 'Countries & Regional Markets Directory | LivWorthy',
        url: `${BASE_URL}/countries`,
        description: 'Explore verified statutory income tax systems, cost of living benchmarks, and purchasing power parity across 39 international markets.',
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
    ],
  };

  const countriesBody = `
    <article class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" class="text-sm text-[#60706D] mb-6">
        <a href="/" class="hover:text-[#167D75]">Home</a> / <span class="text-[#102A2E] font-bold">Countries Directory</span>
      </nav>
      <div class="max-w-3xl mb-8">
        <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">Global Markets Directory</span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] mt-1 tracking-tight">Countries &amp; Regional Markets</h1>
        <p class="text-base text-[#60706D] mt-3 leading-relaxed">
          Comprehensive directory of the 39 commercial markets covered by LivWorthy. Explore statutory income tax calculation schedules, metropolitan living cost indexes, and verified economic data sources for each jurisdiction.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${allCountriesList.map((country) => {
          const cap = CapabilityResolver.resolve(country.id);
          const hasTax = cap.hasDedicatedTaxAdapter;
          const countryCities = Object.values(CITIES).filter((c) => c.countryId === country.id);
          return `
            <a href="/countries/${country.id.toLowerCase()}" class="p-5 bg-white border border-[#DCE3E0] rounded-xl hover:border-[#167D75] hover:shadow-sm transition-all flex flex-col justify-between group">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="font-extrabold text-base text-[#102A2E] group-hover:text-[#167D75] transition-colors">${escapeHtml(country.name)}</span>
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#F7F8F5] text-[#60706D] border border-[#DCE3E0]">${country.id}</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-[#60706D] mb-3">
                  <span>Currency: <strong class="text-[#102A2E]">${country.defaultCurrency}</strong></span>
                  <span>•</span>
                  <span>${countryCities.length} ${countryCities.length === 1 ? 'City' : 'Cities'}</span>
                </div>
              </div>
              <div class="pt-3 border-t border-[#F7F8F5] flex items-center justify-between">
                <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${hasTax ? 'bg-[#DDF2EC] text-[#0D524D]' : 'bg-slate-100 text-slate-700'}">
                  ${hasTax ? `Verified Tax (${cap.taxYear || LATEST_STATUTORY_TAX_YEAR})` : 'Cost of Living'}
                </span>
                <span class="text-xs font-bold text-[#167D75] group-hover:translate-x-0.5 transition-transform">View →</span>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    </article>
  `;

  pages.push({
    relativePath: 'countries/index.html',
    canonicalUrl: `${BASE_URL}/countries`,
    title: 'Countries Directory — Global Income, Tax & Cost of Living Intelligence | LivWorthy',
    description: 'Explore verified statutory income tax systems, cost of living benchmarks, and purchasing power parity across 39 international markets.',
    robots: 'index, follow',
    bodyContent: countriesBody,
    structuredData: countriesStructuredData,
    changefreq: 'weekly',
    priority: 0.9,
  });

  // 2. Cities Directory (/cities)
  const allCitiesList = Object.values(CITIES).sort((a, b) => a.name.localeCompare(b.name));
  const citiesStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Cities Directory', item: `${BASE_URL}/cities` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: 'Cities & Metropolitan Hubs Directory | LivWorthy',
        url: `${BASE_URL}/cities`,
        description: 'Comprehensive directory of 39 global cities. Explore cost of living indices, fair-market rents, local statutory tax rates, and salary benchmarks.',
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
    ],
  };

  const citiesBody = `
    <article class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" class="text-sm text-[#60706D] mb-6">
        <a href="/" class="hover:text-[#167D75]">Home</a> / <span class="text-[#102A2E] font-bold">Cities Directory</span>
      </nav>
      <div class="max-w-3xl mb-8">
        <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">Metropolitan Hubs Directory</span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] mt-1 tracking-tight">Cities &amp; Metropolitan Hubs</h1>
        <p class="text-base text-[#60706D] mt-3 leading-relaxed">
          Comprehensive directory of major metropolitan areas benchmarked by LivWorthy. Inspect cost of living indices (indexed to NYC = 100), statutory tax jurisdictions, and fair-market housing benchmarks.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${allCitiesList.map((city) => {
          const country = COUNTRIES[city.countryId];
          const countryName = country ? country.name : city.countryId;
          return `
            <a href="/cities/${city.id}" class="p-5 bg-white border border-[#DCE3E0] rounded-xl hover:border-[#167D75] hover:shadow-sm transition-all flex flex-col justify-between group">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="font-extrabold text-base text-[#102A2E] group-hover:text-[#167D75] transition-colors">${escapeHtml(city.name)}</span>
                  <span class="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-[#F7F8F5] text-[#60706D] border border-[#DCE3E0]">${city.currency}</span>
                </div>
                <div class="text-xs text-[#60706D] mb-3">
                  <span>${escapeHtml(countryName)}</span>
                  ${city.metroAreaName && city.metroAreaName !== city.name ? ` • <span class="italic text-[11px]">${escapeHtml(city.metroAreaName)}</span>` : ''}
                </div>
              </div>
              <div class="pt-3 border-t border-[#F7F8F5] flex items-center justify-between">
                <span class="text-xs text-[#167D75] font-semibold">
                  COL Index: <strong>${city.colIndexBase100NYC}</strong> (NYC=100)
                </span>
                <span class="text-xs font-bold text-[#167D75] group-hover:translate-x-0.5 transition-transform">Explore →</span>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    </article>
  `;

  pages.push({
    relativePath: 'cities/index.html',
    canonicalUrl: `${BASE_URL}/cities`,
    title: 'Cities Directory — Global Metropolitan Cost of Living & Salary Benchmarks | LivWorthy',
    description: 'Comprehensive directory of 39 global cities. Explore cost of living indices, fair-market rents, local statutory tax rates, and salary benchmarks.',
    robots: 'index, follow',
    bodyContent: citiesBody,
    structuredData: citiesStructuredData,
    changefreq: 'weekly',
    priority: 0.9,
  });

  // 3. Guides Directory (/guides)
  const guidesStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Guides Directory', item: `${BASE_URL}/guides` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: 'Salary & Relocation Intelligence Guides | LivWorthy',
        url: `${BASE_URL}/guides`,
        description: 'Authoritative salary, statutory tax, and cost of living guides for major metropolitan areas worldwide.',
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
    ],
  };

  const guidesBody = `
    <article class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" class="text-sm text-[#60706D] mb-6">
        <a href="/" class="hover:text-[#167D75]">Home</a> / <span class="text-[#102A2E] font-bold">Salary Guides</span>
      </nav>
      <div class="max-w-3xl mb-8">
        <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">Editorial Intelligence</span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] mt-1 tracking-tight">Salary &amp; Relocation Intelligence Guides</h1>
        <p class="text-base text-[#60706D] mt-3 leading-relaxed">
          In-depth financial benchmarks analyzing whether specific salary levels are sufficient to maintain comfortable living standards in premier global cities.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${POPULAR_GUIDES_LIST.map((g) => {
          const city = CITIES[g.cityId];
          const country = COUNTRIES[g.countryId];
          return `
            <a href="/guides/${g.slug}" class="p-6 bg-white border border-[#DCE3E0] rounded-2xl hover:border-[#167D75] hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">${city?.name || g.cityId} • ${country?.name || g.countryId}</span>
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#F7F8F5] text-[#102A2E] border border-[#DCE3E0]">${g.currency} ${g.salaryMajor.toLocaleString()}</span>
                </div>
                <h2 class="text-xl font-extrabold text-[#102A2E] group-hover:text-[#167D75] transition-colors mb-2 leading-snug">
                  ${escapeHtml(g.title)}
                </h2>
                <p class="text-xs text-[#60706D] line-clamp-3 leading-relaxed">
                  ${escapeHtml(g.headlineSummary)}
                </p>
              </div>
              <div class="pt-4 mt-4 border-t border-[#F7F8F5] flex items-center justify-between text-xs">
                <span class="text-[#60706D] font-medium">Read Full Analysis</span>
                <span class="font-bold text-[#167D75] group-hover:translate-x-1 transition-transform">Read Guide →</span>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    </article>
  `;

  pages.push({
    relativePath: 'guides/index.html',
    canonicalUrl: `${BASE_URL}/guides`,
    title: 'Salary & Relocation Guides — City Purchasing Power Benchmarks | LivWorthy',
    description: 'Authoritative salary, statutory tax, and cost of living guides for major metropolitan areas worldwide. Analyze realistic purchasing power and budgets.',
    robots: 'index, follow',
    bodyContent: guidesBody,
    structuredData: guidesStructuredData,
    changefreq: 'weekly',
    priority: 0.9,
  });

  return pages;
}

function createTransparencyPages(): SeoPage[] {
  const pages: SeoPage[] = [];

  // /about
  pages.push({
    relativePath: 'about/index.html',
    canonicalUrl: `${BASE_URL}/about`,
    title: 'About LivWorthy — Global Income & Living Intelligence',
    description: 'Learn about LivWorthy, our organizational charter, deterministic financial methodology, and mission to deliver transparent income intelligence.',
    robots: 'index, follow',
    priority: 0.8,
    changefreq: 'monthly',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About LivWorthy',
      url: `${BASE_URL}/about`,
      description: PLATFORM_IDENTITY.coreDefinition,
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
    bodyContent: `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">About</span></nav>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] tracking-tight">About LivWorthy</h1>
        <p class="mt-3 text-lg text-slate-700 leading-relaxed font-medium">${PLATFORM_IDENTITY.coreDefinition}</p>
        
        <section class="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <h2 class="text-xl font-bold text-[#102A2E]">Our Core Mission</h2>
          <p class="text-sm text-slate-700 leading-relaxed">${PLATFORM_IDENTITY.mission}</p>
        </section>

        <section class="mt-8 space-y-4 text-sm text-slate-700 leading-relaxed">
          <h2 class="text-xl font-bold text-[#102A2E]">Why LivWorthy Exists</h2>
          <p>Gross compensation numbers are deceptive. A nominal $120,000 salary in one jurisdiction can produce vastly different discretionary lifestyle outcomes compared to €80,000 or £75,000 elsewhere once statutory payroll withholdings, progressive regional income taxes, mandatory social insurance, and metro-specific rent costs are accounted for.</p>
          <p>LivWorthy replaces anecdotal internet estimates with deterministic, mathematical modeling rooted in official government gazettes, statutory tax brackets, and fair-market housing benchmarks.</p>
        </section>

        <section class="mt-8 space-y-3">
          <h2 class="text-xl font-bold text-[#102A2E]">Algorithmic Principles</h2>
          <ul class="list-disc pl-5 text-sm text-slate-700 space-y-2">
            <li><strong>Zero-AI Financial Calculations:</strong> All tax brackets and living expense sums are evaluated by deterministic source code. Generative LLMs are never permitted to calculate monetary values.</li>
            <li><strong>Minor-Unit Integer Arithmetic:</strong> Currency is stored in integer minor units (cents, pence, fils) to avoid floating-point errors.</li>
            <li><strong>Anonymous by Design:</strong> Scenarios do not require user accounts, emails, or personal identifiers.</li>
          </ul>
        </section>

        <div class="mt-10 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-sm font-semibold text-teal-800">
          <a href="/methodology" class="hover:underline">Calculation Methodology →</a>
          <a href="/sources" class="hover:underline">Verified Sources Registry →</a>
          <a href="/editorial-policy" class="hover:underline">Editorial Policy →</a>
          <a href="/corrections" class="hover:underline">Corrections & Feedback →</a>
        </div>
      </article>
    `,
  });

  // /methodology
  pages.push({
    relativePath: 'methodology/index.html',
    canonicalUrl: `${BASE_URL}/methodology`,
    title: 'Calculation Methodology & Financial Standards | LivWorthy',
    description: 'Detailed explanation of LivWorthy deterministic calculation engine, statutory tax schedules, minor-unit money arithmetic, and inverse solvers.',
    robots: 'index, follow',
    priority: 0.8,
    changefreq: 'monthly',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'LivWorthy Calculation Methodology',
      url: `${BASE_URL}/methodology`,
      description: 'Deterministic financial living intelligence architecture',
    },
    bodyContent: `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">Methodology</span></nav>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E]">Calculation Methodology & Standards</h1>
        <p class="mt-2 text-slate-600">Deterministic, reproducible, and verifiable financial living intelligence.</p>

        <section class="mt-8 p-6 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
          <h2 class="text-lg font-bold text-teal-900">Zero-AI Financial Calculation Rule</h2>
          <p class="text-sm text-teal-950 leading-relaxed">${PLATFORM_IDENTITY.zeroAiMathPolicy}</p>
        </section>

        <section class="mt-8 space-y-4 text-sm text-slate-700 leading-relaxed">
          <h2 class="text-xl font-bold text-[#102A2E]">The Calculation Pipeline</h2>
          <div class="p-4 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 space-y-1">
            <div>Gross Cash Compensation</div>
            <div class="text-teal-700">  ↓ Statutory Tax Engine (Federal + Regional/State + Municipal + Social Contributions)</div>
            <div>Statutory Net Take-Home Pay</div>
            <div class="text-teal-700">  ↓ Housing Benchmark (HUD FMR / Local Rental Census)</div>
            <div>Net Income After Shelter</div>
            <div class="text-teal-700">  ↓ Essential Living Costs Basket (BLS CEX / Eurostat Weights)</div>
            <div class="font-bold text-teal-800">Uncommitted Disposable Cash & Savings Capacity</div>
          </div>
        </section>

        <section class="mt-8 space-y-3">
          <h2 class="text-xl font-bold text-[#102A2E]">Inverse Solver Engine (Salary Needed)</h2>
          <p class="text-sm text-slate-700 leading-relaxed">To answer "What salary do I need to live in London or New York?", LivWorthy implements a bounded inverse root-finding algorithm. Given target housing, living costs, and desired savings, the engine solves backwards through the non-linear progressive tax brackets to establish the exact gross income needed.</p>
        </section>

        <section class="mt-8 space-y-3">
          <h2 class="text-xl font-bold text-[#102A2E]">Canonical Financial Terminology</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            ${CORE_GLOSSARY.slice(0, 6)
              .map(
                (g) => `
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <h3 class="font-bold text-slate-900">${g.term}</h3>
                  <p class="text-slate-600 mt-1">${g.shortDefinition}</p>
                </div>
              `
              )
              .join('')}
          </div>
        </section>
      </article>
    `,
  });

  // /sources
  pages.push({
    relativePath: 'sources/index.html',
    canonicalUrl: `${BASE_URL}/sources`,
    title: 'Verified Sources & Evidence Registry | LivWorthy',
    description: 'Complete provenance registry of statutory tax authorities, government statistical agencies, and institutional benchmarks powering LivWorthy.',
    robots: 'index, follow',
    priority: 0.8,
    changefreq: 'monthly',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'LivWorthy Verified Sources Registry',
      url: `${BASE_URL}/sources`,
    },
    bodyContent: `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">Sources</span></nav>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E]">Verified Sources & Evidence Registry</h1>
        <p class="mt-2 text-slate-600">Every calculation is traceable to authoritative government and statistical publications.</p>

        <section class="mt-8 space-y-4">
          <h2 class="text-xl font-bold text-[#102A2E]">Authoritative Data Sources</h2>
          <div class="grid grid-cols-1 gap-4">
            ${AUTHORITATIVE_SOURCES.map(
              (s) => `
              <div class="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h3 class="font-bold text-slate-900 text-sm">${s.name}</h3>
                  <span class="px-2 py-0.5 bg-teal-50 text-teal-800 text-xs font-semibold rounded">${s.tier}</span>
                </div>
                <p class="text-xs text-slate-600">${s.description}</p>
                <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Jurisdiction: <strong>${s.jurisdiction}</strong></span>
                  <a href="${s.officialUrl}" target="_blank" rel="noopener noreferrer" class="text-teal-700 hover:underline font-medium">Official Publication ↗</a>
                </div>
              </div>
            `
            ).join('')}
          </div>
        </section>
      </article>
    `,
  });

  // /editorial-policy
  pages.push({
    relativePath: 'editorial-policy/index.html',
    canonicalUrl: `${BASE_URL}/editorial-policy`,
    title: 'Editorial & Verification Policy | LivWorthy',
    description: 'LivWorthy editorial guidelines, information-quality standards, and independence from advertising bias.',
    robots: 'index, follow',
    priority: 0.7,
    changefreq: 'monthly',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'LivWorthy Editorial Policy',
      url: `${BASE_URL}/editorial-policy`,
    },
    bodyContent: `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">Editorial Policy</span></nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">Editorial & Information Quality Policy</h1>
        <div class="mt-6 space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>LivWorthy is committed to publishing financial living intelligence of the highest evidentiary standard. Our research focuses on global compensation, statutory taxation, and residential affordability.</p>
          <h2 class="text-lg font-bold text-slate-900 mt-6">Core Standards</h2>
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>Separation of Content and Calculations:</strong> Editorial articles must source calculation numbers from authoritative backend engines, never hand-typed approximations.</li>
            <li><strong>Commercial Independence:</strong> Advertising partners and sponsors have zero influence over calculation algorithms, tax rate tables, or city cost of living rankings.</li>
            <li><strong>Transparent Authorship:</strong> Articles are produced and maintained by the LivWorthy Financial Research & Intelligence Team. We do not invent fake professional personas.</li>
          </ul>
        </div>
      </article>
    `,
  });

  // /data-policy
  pages.push({
    relativePath: 'data-policy/index.html',
    canonicalUrl: `${BASE_URL}/data-policy`,
    title: 'Data & Privacy Policy (Zero PII) | LivWorthy',
    description: 'LivWorthy data handling architecture: anonymous calculations, zero PII collection, and zero synthetic fallbacks.',
    robots: 'index, follow',
    priority: 0.7,
    changefreq: 'monthly',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'LivWorthy Data Policy',
      url: `${BASE_URL}/data-policy`,
    },
    bodyContent: `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">Data Policy</span></nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">Data Policy & Zero PII Architecture</h1>
        <div class="mt-6 space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>${PLATFORM_IDENTITY.privacyCommitment}</p>
          <h2 class="text-lg font-bold text-slate-900 mt-6">Zero Data Fabrication Guarantee</h2>
          <p>If statutory tax schedules or cost of living indicators are not officially verified for a jurisdiction, LivWorthy explicitly flags the market as PROVISIONAL or LIMITED rather than synthesizing fake figures.</p>
        </div>
      </article>
    `,
  });

  // /corrections
  pages.push({
    relativePath: 'corrections/index.html',
    canonicalUrl: `${BASE_URL}/corrections`,
    title: 'Corrections Log & Data Feedback | LivWorthy',
    description: 'Transparent log of statutory tax and cost of living updates, and procedures for reporting data discrepancies.',
    robots: 'index, follow',
    priority: 0.7,
    changefreq: 'monthly',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'LivWorthy Corrections Policy and Log',
      url: `${BASE_URL}/corrections`,
    },
    bodyContent: `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">Corrections</span></nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">Corrections Log & Data Feedback</h1>
        <p class="mt-2 text-slate-600">We maintain an open, public record of statutory adjustments and algorithmic updates.</p>

        <section class="mt-8 space-y-3">
          <h2 class="text-xl font-bold text-[#102A2E]">Recent Verified Updates</h2>
          <div class="space-y-3">
            ${CORRECTIONS_LOG.map(
              (c) => `
              <div class="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-xs">
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span>${c.date} • <strong>${c.jurisdiction}</strong></span>
                  <span class="text-teal-700 font-semibold">${c.status}</span>
                </div>
                <p class="text-xs text-slate-800 font-medium">${c.summary}</p>
                <p class="text-[11px] text-slate-500">Source: ${c.sourceReference}</p>
              </div>
            `
            ).join('')}
          </div>
        </section>

        <section class="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 class="text-lg font-bold text-slate-900 mb-2">Submit a Correction</h2>
          <p class="text-xs text-slate-600 leading-relaxed mb-4">Users can report outdated tax brackets or living benchmarks through the interactive "Report Data Correction" modal available on all calculator and guide pages.</p>
        </section>
      </article>
    `,
  });

  // /terms
  pages.push({
    relativePath: 'terms/index.html',
    canonicalUrl: `${BASE_URL}/terms`,
    title: 'Terms of Service & Financial Disclaimer | LivWorthy',
    description: 'LivWorthy terms of service and YMYL financial disclaimer: calculations are estimates for educational planning, not formal tax or legal advice.',
    robots: 'index, follow',
    priority: 0.6,
    changefreq: 'monthly',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'LivWorthy Terms & Disclaimer',
      url: `${BASE_URL}/terms`,
    },
    bodyContent: `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">Terms</span></nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">Terms of Service & Financial Disclaimer</h1>
        <div class="mt-6 space-y-4 text-sm text-slate-700 leading-relaxed">
          <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed font-medium">
            <strong>Financial YMYL Notice:</strong> LivWorthy calculations are estimates designed for preliminary lifestyle evaluation and comparative planning. They do not constitute formal certified tax advice, financial planning, or legal counsel. Consult a qualified certified public accountant (CPA) or statutory tax attorney for official filings.
          </div>
          <p>By using LivWorthy, you agree to access information for personal, informational, non-commercial planning purposes.</p>
        </div>
      </article>
    `,
  });

  // /privacy
  pages.push({
    relativePath: 'privacy/index.html',
    canonicalUrl: `${BASE_URL}/privacy`,
    title: 'Privacy Policy | LivWorthy',
    description: 'LivWorthy privacy policy: anonymous calculations, no user tracking, no PII stored.',
    robots: 'index, follow',
    priority: 0.6,
    changefreq: 'monthly',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'LivWorthy Privacy Policy',
      url: `${BASE_URL}/privacy`,
    },
    bodyContent: `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">Privacy</span></nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">Privacy Policy</h1>
        <div class="mt-6 space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>LivWorthy is architected to operate with minimal data footprint. We do not require account creation, do not sell user data, and compute calculation scenarios ephemerally.</p>
        </div>
      </article>
    `,
  });

  return pages;
}

function renderPageHtml(
  template: string,
  page: {
    title: string;
    description: string;
    canonicalUrl: string;
    robots: 'index, follow' | 'noindex, follow';
    bodyContent: string;
    structuredData?: any;
  },
  isHomepage = false,
  criticalCss = ''
): string {
  let html = template;

  // Replace external render-blocking stylesheet with inlined critical CSS to eliminate render delay
  if (criticalCss) {
    html = html.replace(
      /<link\s+rel="stylesheet"[^>]*href="\/assets\/index-[^"]+\.css"[^>]*\/?>/i,
      `<style id="critical-css">${criticalCss}</style>`
    );
  }

  // For static institutional and SEO pages, strip the SPA module script bundle
  // so the React calculator does not load or overwrite the pre-rendered content.
  if (!isHomepage) {
    html = html.replace(/<script\s+type="module"[^>]*><\/script>\s*/gi, '');
  }

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);

  // Replace Meta Description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(page.description)}" />`
  );

  // Replace Canonical Link
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${page.canonicalUrl}" />`
  );

  // Ensure Robots meta tag
  const robotsTag = `<meta name="robots" content="${page.robots}" />`;
  if (html.includes('<meta name="robots"')) {
    html = html.replace(/<meta\s+name="robots"\s+content=".*?"\s*\/?>/i, robotsTag);
  } else {
    html = html.replace('</head>', `    ${robotsTag}\n  </head>`);
  }

  // Inject or update structured data
  if (page.structuredData) {
    const jsonLd = `\n    <script type="application/ld+json">\n    ${JSON.stringify(page.structuredData, null, 2)}\n    </script>\n  `;
    html = html.replace('</head>', `${jsonLd}</head>`);
  }

  // Inject semantic crawlable HTML into <div id="root">
  if (page.bodyContent) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${page.bodyContent}</div>`
    );
  }

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateSitemaps(distDir: string, publicDir: string, pages: SeoPage[]) {
  // Only indexable pages passing quality gate
  const indexablePages = pages.filter((p) => p.robots === 'index, follow');

  const countryPages = indexablePages.filter(
    (p) => p.relativePath.startsWith('countries/') && p.relativePath !== 'countries/index.html'
  );
  const cityPages = indexablePages.filter(
    (p) => p.relativePath.startsWith('cities/') && p.relativePath !== 'cities/index.html'
  );
  const comparisonPages = indexablePages.filter((p) => p.relativePath.startsWith('compare/'));
  const guidePages = indexablePages.filter(
    (p) => p.relativePath.startsWith('guides/') && p.relativePath !== 'guides/index.html'
  );

  const buildUrlSet = (items: { canonicalUrl: string; changefreq: string; priority: number }[]) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items
  .map(
    (item) => `  <url>
    <loc>${item.canonicalUrl}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  };

  const mainUrls = [
    { canonicalUrl: `${BASE_URL}/`, changefreq: 'daily', priority: 1.0 },
    { canonicalUrl: `${BASE_URL}/countries`, changefreq: 'weekly', priority: 0.9 },
    { canonicalUrl: `${BASE_URL}/cities`, changefreq: 'weekly', priority: 0.9 },
    { canonicalUrl: `${BASE_URL}/guides`, changefreq: 'weekly', priority: 0.9 },
    { canonicalUrl: `${BASE_URL}/about`, changefreq: 'monthly', priority: 0.8 },
    { canonicalUrl: `${BASE_URL}/methodology`, changefreq: 'monthly', priority: 0.8 },
    { canonicalUrl: `${BASE_URL}/sources`, changefreq: 'monthly', priority: 0.8 },
    { canonicalUrl: `${BASE_URL}/editorial-policy`, changefreq: 'monthly', priority: 0.7 },
    { canonicalUrl: `${BASE_URL}/data-policy`, changefreq: 'monthly', priority: 0.7 },
    { canonicalUrl: `${BASE_URL}/corrections`, changefreq: 'monthly', priority: 0.7 },
    { canonicalUrl: `${BASE_URL}/terms`, changefreq: 'monthly', priority: 0.6 },
    { canonicalUrl: `${BASE_URL}/privacy`, changefreq: 'monthly', priority: 0.6 },
  ];

  const mainXml = buildUrlSet(mainUrls);
  const countriesXml = buildUrlSet(countryPages);
  const citiesXml = buildUrlSet(cityPages);
  const comparisonsXml = buildUrlSet(comparisonPages);
  const guidesXml = buildUrlSet(guidePages);

  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-main.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-countries.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-cities.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-comparisons.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-guides.xml</loc>
  </sitemap>
</sitemapindex>`;

  const filesToWrite = [
    { name: 'sitemap.xml', content: sitemapIndexXml },
    { name: 'sitemap-main.xml', content: mainXml },
    { name: 'sitemap-countries.xml', content: countriesXml },
    { name: 'sitemap-cities.xml', content: citiesXml },
    { name: 'sitemap-comparisons.xml', content: comparisonsXml },
    { name: 'sitemap-guides.xml', content: guidesXml },
  ];

  for (const f of filesToWrite) {
    fs.writeFileSync(path.join(distDir, f.name), f.content);
    fs.writeFileSync(path.join(publicDir, f.name), f.content);
  }

  console.log(`[SEO Generator] Generated sitemap index + 5 segmented sitemaps (${indexablePages.length + mainUrls.length} total URLs).`);
}

function writeStaticFiles(distDir: string, publicDir: string) {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /test/

# Explicit Search Engine & AI Answer Systems Discovery Directives
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot
Allow: /

User-agent: Amazonbot
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

  const llmsTxt = `# LivWorthy
> ${PLATFORM_IDENTITY.tagline}

${PLATFORM_IDENTITY.coreDefinition}

## Core Intelligence Capabilities
- **Salary Worth:** Evaluates actual disposable income and savings capacity after statutory taxes, rent, and household necessities.
- **Salary After Tax:** Authoritative statutory net income calculation accounting for federal, regional/state, local taxes, and mandatory social security contributions.
- **Salary Needed:** Deterministic inverse solver computing gross compensation needed to sustain defined living standards and savings goals.
- **Cost of Living:** Metro-level benchmarks for housing, food, transit, healthcare, and utilities across 39 commercial markets.
- **City Comparison:** Cross-border purchasing-power and lifestyle equivalence modeling with real-time FX snapshot tracking.
- **Job Offer Evaluator:** Multi-currency total compensation evaluator separating cash earnings from non-cash benefits.

## Algorithmic & Data Governance
- **Zero-AI Financial Calculation Policy:** All financial calculations are executed by deterministic source code and verified statutory tax rules—never estimated by generative AI.
- **Source Provenance:** Grounded in Tier-1 government tax authorities (IRS, HMRC, FTA, CRA, ATO), official statistical agencies (BLS, Eurostat, ONS), and institutional benchmarks (HUD FMR).
- **Privacy-First:** Anonymous calculations without user accounts, tracking cookies, or collection of personally identifiable information.

## Authoritative Public Resources
- [LivWorthy Homepage](https://livworthy.com/)
- [Calculation Methodology](https://livworthy.com/methodology)
- [Verified Sources Registry](https://livworthy.com/sources)
- [Editorial & Verification Policy](https://livworthy.com/editorial-policy)
- [Data & Privacy Policy](https://livworthy.com/data-policy)
- [Data Corrections & Feedback](https://livworthy.com/corrections)
- [Terms & Financial Disclaimer](https://livworthy.com/terms)
- [Privacy Policy](https://livworthy.com/privacy)
- [About LivWorthy](https://livworthy.com/about)
- [Countries Directory](https://livworthy.com/countries)
- [Cities Directory](https://livworthy.com/cities)
- [Salary & Relocation Guides](https://livworthy.com/guides)
- [Sitemap Index](https://livworthy.com/sitemap.xml)
`;

  const adsTxt = `# LivWorthy Authorized Digital Sellers
# Domain: livworthy.com
google.com, pub-8076724396902810, DIRECT, f08c47fec0942fa0
`;

  const files = [
    { name: 'robots.txt', content: robotsTxt },
    { name: 'llms.txt', content: llmsTxt },
    { name: 'ads.txt', content: adsTxt },
  ];

  for (const f of files) {
    fs.writeFileSync(path.join(distDir, f.name), f.content);
    fs.writeFileSync(path.join(publicDir, f.name), f.content);
  }
}

function runContentGapReport() {
  console.log('\n--- LivWorthy Programmatic Content Gap Audit ---');
  const allCountries = Object.values(COUNTRIES);
  const allCities = Object.values(CITIES);

  let verifiedCount = 0;
  let limitedCount = 0;
  let provisionalCount = 0;

  for (const c of allCountries) {
    if (c.verificationStatus === 'VERIFIED') verifiedCount++;
    else if (c.verificationStatus === 'LIMITED') limitedCount++;
    else provisionalCount++;
  }

  console.log(`Markets Tracked: ${allCountries.length} total`);
  console.log(`- Verified: ${verifiedCount}`);
  console.log(`- Limited (statutory schedule available): ${limitedCount}`);
  console.log(`- Provisional (research active): ${provisionalCount}`);
  console.log(`City Hubs Registered: ${allCities.length}`);
  console.log('--- Content Gap Audit Complete ---\n');
}

// Self-run when executed directly via tsx
if (import.meta.url.endsWith('generate-seo.ts') || process.argv[1]?.includes('generate-seo')) {
  runSeoGenerator();
}
