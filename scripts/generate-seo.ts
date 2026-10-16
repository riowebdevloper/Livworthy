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
import { SEO_LANDING_PAGES } from '../src/data/seo-clusters';
import { SeoPageRenderer } from '../src/lib/seo-renderer';
import { createLocalizedLongFormPages } from './localized-long-form-pages';
import { createLocalizedToolPages } from './localized-tool-pages';
import { LONG_FORM_LOCALES } from '../src/lib/i18n/long-form';
import { TIER_1_LOCALES } from '../src/lib/i18n';
import {
  createRelocationPages,
  createJobOfferAuthorityPage,
  createCoveragePage,
  createLocalizedPages,
  createEmpiricalReportsPages,
} from './seo-generators-content';
import { VERIFIED_CITY_EDITORIAL, renderCityEditorialHtml } from '../src/data/city-editorial';
import { VERIFIED_COUNTRY_EDITORIAL, renderCountryEditorialHtml } from '../src/data/country-editorial';
import {
  canBeIndexed,
  extractMeaningfulHtmlText,
  calculateEffectiveWordCount,
  extractCleanText,
} from '../src/lib/seo/page-quality-gate';

const BASE_URL = 'https://www.livworthy.com';

interface SeoPage {
  relativePath: string; // e.g. 'countries/us/index.html'
  canonicalUrl: string; // e.g. 'https://www.livworthy.com/countries/us'
  title: string;
  description: string;
  robots: 'index, follow' | 'noindex, follow';
  bodyContent: string;
  structuredData: any;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
  lang?: string;
  dir?: 'ltr' | 'rtl';
}

const COMPARISONS = [
  { slug: 'new-york-vs-london', cityAId: 'nyc', cityBId: 'london' },
  { slug: 'new-york-vs-dubai', cityAId: 'nyc', cityBId: 'dubai' },
  { slug: 'london-vs-dubai', cityAId: 'london', cityBId: 'dubai' },
  { slug: 'toronto-vs-vancouver', cityAId: 'toronto', cityBId: 'vancouver' },
  { slug: 'sydney-vs-melbourne', cityAId: 'sydney', cityBId: 'melbourne' },
  { slug: 'berlin-vs-munich', cityAId: 'berlin', cityBId: 'munich' },
  { slug: 'singapore-vs-dubai', cityAId: 'singapore', cityBId: 'dubai' },
];

const SEO_COMPARISON_KEYS: Record<string, string> = {
  'new-york-vs-london': 'compare-nyc-vs-london',
  'new-york-vs-dubai': 'compare-nyc-vs-dubai',
  'london-vs-dubai': 'compare-london-vs-dubai',
};

const CITY_CLUSTER_LINKS: Record<string, { title: string; url: string; badge: string }[]> = {
  nyc: [
    { title: 'Is $100K a Good Salary in NYC?', url: '/guides/nyc-100k', badge: 'Salary Guide' },
    { title: 'Is $150K a Good Salary in NYC?', url: '/guides/nyc-150k', badge: 'Salary Guide' },
    { title: 'NYC Salary After Tax Calculator', url: '/salary-after-tax/new-york', badge: 'Tax Engine' },
    { title: 'Salary Needed to Live in NYC', url: '/salary-needed/new-york', badge: 'Inverse Solver' },
    { title: 'Cost of Living in New York City', url: '/cost-of-living/new-york', badge: 'COL Benchmark' },
    { title: 'NYC vs London: Salary & Living Costs', url: '/compare/new-york-vs-london', badge: 'Comparison' },
    { title: 'NYC vs Dubai: Salary & Living Costs', url: '/compare/new-york-vs-dubai', badge: 'Comparison' },
  ],
  london: [
    { title: 'Is £75K a Good Salary in London?', url: '/guides/london-75k', badge: 'Salary Guide' },
    { title: 'Is £100K a Good Salary in London?', url: '/guides/london-100k', badge: 'Salary Guide' },
    { title: 'London Salary After Tax Calculator', url: '/salary-after-tax/london', badge: 'Tax Engine' },
    { title: 'Salary Needed to Live in London', url: '/salary-needed/london', badge: 'Inverse Solver' },
    { title: 'London vs Dubai: Salary & Living Costs', url: '/compare/london-vs-dubai', badge: 'Comparison' },
    { title: 'NYC vs London: Salary & Living Costs', url: '/compare/new-york-vs-london', badge: 'Comparison' },
  ],
  dubai: [
    { title: 'Is 300K AED a Good Salary in Dubai?', url: '/guides/dubai-300k', badge: 'Salary Guide' },
    { title: 'Dubai Salary After Tax Calculator', url: '/salary-after-tax/dubai', badge: 'Tax Engine' },
    { title: 'NYC vs Dubai: Salary & Living Costs', url: '/compare/new-york-vs-dubai', badge: 'Comparison' },
    { title: 'London vs Dubai: Salary & Living Costs', url: '/compare/london-vs-dubai', badge: 'Comparison' },
  ],
  toronto: [
    { title: 'Is CA$100K a Good Salary in Toronto?', url: '/guides/toronto-100k', badge: 'Salary Guide' },
  ],
  sf: [
    { title: 'Is $150K a Good Salary in San Francisco?', url: '/guides/sf-150k', badge: 'Salary Guide' },
  ],
  austin: [
    { title: 'Is $100K a Good Salary in Austin?', url: '/guides/austin-100k', badge: 'Salary Guide' },
  ],
  sydney: [
    { title: 'Is A$120K a Good Salary in Sydney?', url: '/guides/sydney-120k', badge: 'Salary Guide' },
  ],
  berlin: [
    { title: 'Is €80K a Good Salary in Berlin?', url: '/guides/berlin-80k', badge: 'Salary Guide' },
  ],
  singapore: [
    { title: 'Is S$120K a Good Salary in Singapore?', url: '/guides/singapore-120k', badge: 'Salary Guide' },
  ],
};

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
            <a href="/salary-worth" id="tab-salary-worth" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-[#102A2E] text-white shadow-sm">
              <span>Is My Salary Enough?</span>
            </a>
            <a href="/salary-needed" id="tab-salary-needed" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
              <span>How Much Should I Earn?</span>
            </a>
            <a href="/salary-after-tax" id="tab-salary-after-tax" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
              <span>Salary After Tax</span>
            </a>
            <a href="/cost-of-living" id="tab-cost-of-living" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
              <span>Cost of Living</span>
            </a>
            <a href="/compare" id="tab-compare" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
              <span>Compare Cities</span>
            </a>
            <a href="/job-offers" id="tab-job-offers" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
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
            <div class="bg-[#F7F8F5] p-4 sm:px-6 sm:py-4 border-b border-[#DCE3E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div>
                  <div class="flex items-center space-x-2">
                    <h2 class="font-bold text-base text-[#102A2E]">New York City Living Worth Result</h2>
                    <span class="text-xs font-semibold bg-[#DDF2EC] text-[#0D625B] px-2 py-0.5 rounded-full">SINGLE</span>
                  </div>
                  <p class="text-xs text-[#60706D] mt-0.5">Statutory 2026 schedule (Official table)</p>
                </div>
                <div class="inline-flex rounded-lg border border-[#DCE3E0] p-0.5 bg-[#FFFFFF] shrink-0 self-start sm:self-center">
                  <button id="period-annual-btn" type="button" class="px-3 py-1 text-xs font-semibold rounded-md bg-[#102A2E] text-white">Annual</button>
                  <button id="period-monthly-btn" type="button" class="px-3 py-1 text-xs font-semibold rounded-md text-[#60706D]">Monthly</button>
                </div>
              </div>
            </div>

            <div class="p-4 sm:p-8 space-y-6">
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
              <div class="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-3">Calculators & Directories</div>
              <ul class="space-y-2 text-xs">
                <li><a href="/salary-worth" class="hover:text-[#102A2E]">Is My Salary Enough?</a></li>
                <li><a href="/salary-needed" class="hover:text-[#102A2E]">How Much Should I Earn?</a></li>
                <li><a href="/salary-after-tax" class="hover:text-[#102A2E]">Salary After Tax</a></li>
                <li><a href="/cost-of-living" class="hover:text-[#102A2E]">Cost of Living</a></li>
                <li><a href="/compare" class="hover:text-[#102A2E]">Compare Cities</a></li>
                <li><a href="/job-offers" class="hover:text-[#102A2E]">Compare Job Offers</a></li>
                <li><a href="/reports" class="hover:text-[#102A2E] text-[#167D75] font-semibold">Empirical Research Reports →</a></li>
                <li><a href="/countries" class="hover:text-[#102A2E]">Countries Directory</a></li>
                <li><a href="/cities" class="hover:text-[#102A2E]">Cities Directory</a></li>
                <li><a href="/guides" class="hover:text-[#102A2E]">Salary Guides Directory</a></li>
              </ul>
            </div>

            <div>
              <div class="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-3">City Salary Guides</div>
              <ul class="space-y-1 text-xs">
                <li><a href="/guides/nyc-100k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is $100k a Good Salary in NYC?</a></li>
                <li><a href="/guides/nyc-150k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is $150k a Good Salary in NYC?</a></li>
                <li><a href="/guides/london-75k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is £75k a Good Salary in London?</a></li>
                <li><a href="/guides/sf-150k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is $150k a Good Salary in San Francisco?</a></li>
                <li><a href="/guides/toronto-100k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is CA$100k a Good Salary in Toronto?</a></li>
                <li><a href="/guides/sydney-120k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is A$120k a Good Salary in Sydney?</a></li>
                <li><a href="/guides/dubai-300k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is 300k AED a Good Salary in Dubai?</a></li>
                <li><a href="/guides/singapore-120k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is S$120k a Good Salary in Singapore?</a></li>
                <li><a href="/guides/berlin-80k" class="min-h-[24px] py-1 flex items-center hover:text-[#167D75]">Is €80k a Good Salary in Berlin?</a></li>
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
            <p>© ${new Date().getFullYear()} LivWorthy Inc. All rights reserved.</p>
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

  // 2c. Relocation Intelligence Pages (/relocation, /relocation/[slug])
  const relocationPages = createRelocationPages(BASE_URL);
  pages.push(...relocationPages);

  // 2d. Job Offer Authority Guide (/job-offer-comparison)
  pages.push(createJobOfferAuthorityPage(BASE_URL));

  // 2e. Global Market Coverage Page (/coverage)
  pages.push(createCoveragePage(BASE_URL));

  // 2f. Localized Entry Pages (/en, /es, /fr, /ar)
  const localizedPages = createLocalizedPages(BASE_URL, homeStructuredData);
  pages.push(...localizedPages);

  // 2g. Empirical Benchmark Reports (/reports, /reports/[slug])
  const empiricalReports = createEmpiricalReportsPages(BASE_URL);
  pages.push(...empiricalReports.pages);

  // Full localized long-form authority routes.
  pages.push(...createLocalizedLongFormPages(BASE_URL));

  // Localized clean public tool routes (/es/salary-after-tax, /de/salary-needed, etc.)
  pages.push(...createLocalizedToolPages(BASE_URL));

  // 3. Country Hub Pages
  for (const country of Object.values(COUNTRIES)) {
    const cap = CapabilityResolver.resolve(country.id);
    const hasTax = cap.hasDedicatedTaxAdapter;
    const hasBespokeCountry = Boolean(VERIFIED_COUNTRY_EDITORIAL[country.id]);
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
        <h1 class="text-3xl font-extrabold text-[#102A2E]">${country.name} ${hasTax ? 'Income, Tax & Living Intelligence' : 'Cost of Living & City Intelligence'}</h1>
        <p class="mt-2 text-slate-600 leading-relaxed">${hasTax
          ? `Comprehensive statutory salary calculations, progressive income tax schedules (Tax Year ${cap.taxYear || LATEST_STATUTORY_TAX_YEAR}), mandatory social contributions, cost of living indices, and major metropolitan benchmarks across ${country.name}.`
          : `Cost of living benchmarks, fair-market housing indicators, and metropolitan expenditure data for ${country.name}. Statutory tax calculations for this jurisdiction are currently under verification against official tax authority tables.`}</p>
        
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-full">
            Status: ${hasTax ? `${country.verificationStatus} STATUTORY ADAPTER (${cap.taxYear || LATEST_STATUTORY_TAX_YEAR})` : 'COST OF LIVING BENCHMARKS ACTIVE'}
          </span>
          <span class="inline-flex items-center px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-full">
            National Currency: <strong>${country.defaultCurrency || 'Local'}</strong>
          </span>
        </div>
        ${country.notes ? `<p class="mt-3 text-sm text-slate-500 italic bg-amber-50/60 p-3 rounded-lg border border-amber-200/50">${country.notes}</p>` : ''}

        ${hasBespokeCountry ? renderCountryEditorialHtml(country.id) : `
        <section class="mt-8 space-y-3">
          <h2 class="text-xl font-bold text-[#102A2E]">Statutory Income Tax &amp; Social Contribution Architecture</h2>
          <p class="text-sm text-slate-700 leading-relaxed">
            In ${country.name}, gross employment compensation is subject to statutory payroll withholdings and progressive tax brackets. Net spendable take-home pay is determined deterministically after applying applicable national tax thresholds, mandatory pension or retirement systems, public healthcare or social security contributions, and statutory standard deductions.
          </p>
          <p class="text-sm text-slate-700 leading-relaxed">
            ${hasTax
              ? `LivWorthy models the current verified tax year (${cap.taxYear || LATEST_STATUTORY_TAX_YEAR}) for ${country.name} under standard single-filer employment rules without bespoke deductions. All tax bracket cutoffs and social insurance contribution ceilings are sourced directly from primary revenue authority gazettes.`
              : `Statutory income taxation schedules for ${country.name} are currently undergoing empirical audit by the LivWorthy research team. Living costs, currency conversions, and purchasing-power indices remain fully active.`}
          </p>
        </section>
        `}

        <section class="mt-8">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">Major Cities in ${country.name}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            ${countryCities.map((ct) => `
              <a href="/cities/${ct.id}" class="p-4 bg-white border border-slate-200 rounded-lg hover:border-teal-500 transition-colors shadow-sm block group">
                <span class="font-bold text-slate-900 group-hover:text-teal-700 block">${ct.name}</span>
                <span class="text-xs text-slate-500 block mt-1">${ct.metroAreaName || ct.name}</span>
                <span class="text-xs text-teal-700 font-medium block mt-2">Currency: ${ct.currency} • COL Index: ${ct.colIndexBase100NYC} (NYC=100)</span>
              </a>
            `).join('')}
          </div>
        </section>

        ${!hasBespokeCountry ? `
        <section class="mt-8 space-y-3">
          <h2 class="text-xl font-bold text-[#102A2E]">Cost of Living &amp; Housing Expenditure Overview</h2>
          <p class="text-sm text-slate-700 leading-relaxed">
            Metropolitan cost of living in ${country.name} varies significantly between high-density economic centers and regional areas. Residential rental housing forms the largest recurring expenditure category, followed by grocery market baskets, public transportation, and private utilities. LivWorthy standardizes local living costs against the New York City baseline (NYC = 100), enabling accurate cross-border purchasing-power comparisons.
          </p>
        </section>
        ` : ''}

        <section class="mt-8">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">Calculators &amp; Decision Intelligence for ${country.name}</h2>
          <div class="flex flex-wrap gap-2 text-sm">
            <a href="/salary-worth" class="px-4 py-2 bg-teal-700 text-white rounded font-medium hover:bg-teal-800">Calculate Salary Worth</a>
            <a href="/salary-after-tax" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary After Tax</a>
            <a href="/salary-needed" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary Needed</a>
            <a href="/cost-of-living" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Cost of Living</a>
            <a href="/compare" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Compare With Another City</a>
          </div>
        </section>

        <section class="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold text-teal-800">
          <a href="/methodology" class="hover:underline">Calculation Methodology →</a>
          <a href="/sources" class="hover:underline">Evidence Registry &amp; Primary Sources →</a>
          <a href="/editorial-policy" class="hover:underline">Editorial &amp; Verification Policy →</a>
          <a href="/corrections" class="hover:underline">Report a Statutory Discrepancy →</a>
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
      robots: (hasBespokeCountry && !isProvisional) ? 'index, follow' : 'noindex, follow',
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
    const hasBespokeCity = Boolean(VERIFIED_CITY_EDITORIAL[city.id]);
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
        <p class="mt-2 text-slate-600 leading-relaxed">${hasTax
          ? `Authoritative financial living analysis for ${city.name} (${country ? country.name : city.countryId}). Primary economic metro area: ${city.metroAreaName}. Verified statutory tax schedule: Tax Year ${cap.taxYear || LATEST_STATUTORY_TAX_YEAR}.`
          : `Metropolitan cost of living, rental housing benchmarks, and consumer price analysis for ${city.name} (${country ? country.name : city.countryId}). Metro area: ${city.metroAreaName}.`}</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
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
            <div class="text-xl font-bold text-teal-700 mt-1">${hasTax ? city.verificationStatus : 'COL AVAILABLE'}</div>
          </div>
          <div class="p-4 bg-white border border-slate-200 rounded-lg">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Data Provenance</span>
            <div class="text-xl font-bold ${city.id === 'nyc' ? 'text-teal-700' : isProvisional ? 'text-amber-700' : 'text-slate-800'} mt-1">${city.id === 'nyc' ? 'OBSERVED' : isProvisional ? 'LIMITED' : 'DERIVED'}</div>
            <span class="text-[10px] text-slate-500">${city.id === 'nyc' ? 'Statutory & Observed Baseline' : isProvisional ? 'Provisional / Limited Data' : 'Spatial Benchmark Model'}</span>
          </div>
        </div>

        ${hasBespokeCity ? renderCityEditorialHtml(city.id) : `
        <section class="mt-8 space-y-3">
          <h2 class="text-xl font-bold text-[#102A2E]">Metropolitan Earnings &amp; Take-Home Pay Analysis</h2>
          <p class="text-sm text-slate-700 leading-relaxed">
            Evaluating a salary offer in ${city.name} requires separating nominal gross compensation from spendable net income. Residents in ${city.name} are subject to ${hasTax ? `applicable national, regional, and municipal tax withholdings under Tax Year ${cap.taxYear || LATEST_STATUTORY_TAX_YEAR} rules` : 'statutory payroll deductions'}. 
            Mandatory social contributions, statutory health insurance, and standard deduction thresholds directly impact take-home pay, typically creating effective deduction rates between 15% and 42% depending on income brackets.
          </p>
        </section>

        <section class="mt-8 space-y-3">
          <h2 class="text-xl font-bold text-[#102A2E]">Residential Housing &amp; Essential Living Costs</h2>
          <p class="text-sm text-slate-700 leading-relaxed">
            Housing represents the single largest monthly budget component in ${city.name}. Median fair-market rent for a typical 1-bedroom apartment in central economic districts reflects local housing supply dynamics and commercial vitality. Essential non-housing expenses—comprising grocery market baskets, public mass transit, electricity, heating, water, and broadband communications—scale according to the local cost of living index (${city.colIndexBase100NYC} relative to NYC).
          </p>
        </section>

        <section class="mt-8 space-y-3">
          <h2 class="text-xl font-bold text-[#102A2E]">Purchasing Power &amp; Disposable Savings Potential</h2>
          <p class="text-sm text-slate-700 leading-relaxed">
            LivWorthy calculates discretionary surplus by subtracting total statutory taxes and itemized living costs from stated compensation. In ${city.name}, achieving a comfortable lifestyle buffer requires sufficient gross income to cover rental obligations within the recommended 30% housing burden ratio while preserving an uncommitted cash buffer for long-term investments and emergency savings.
          </p>
        </section>
        `}

        <section class="mt-8">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">Calculators &amp; Decision Tools for ${city.name}</h2>
          <div class="flex flex-wrap gap-2 text-sm">
            <a href="/salary-worth" class="px-4 py-2 bg-teal-700 text-white rounded font-medium hover:bg-teal-800">Calculate Salary Worth</a>
            <a href="/salary-after-tax" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary After Tax</a>
            <a href="/salary-needed" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary Needed</a>
            <a href="/cost-of-living" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Cost of Living</a>
            <a href="/compare" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Compare With Another City</a>
          </div>
        </section>

        ${CITY_CLUSTER_LINKS[city.id] && CITY_CLUSTER_LINKS[city.id].length > 0 ? `
          <section class="mt-8">
            <h2 class="text-xl font-bold text-[#102A2E] mb-3">Featured Guides &amp; Intelligence for ${city.name}</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              ${CITY_CLUSTER_LINKS[city.id].map(link => `
                <a href="${link.url}" class="p-4 bg-white border border-[#DCE3E0] rounded-xl hover:border-[#167D75] hover:shadow-xs transition-all block group">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#167D75]">${link.badge}</span>
                  <div class="font-bold text-slate-900 group-hover:text-[#167D75] transition-colors mt-0.5">${escapeHtml(link.title)} →</div>
                </a>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <section class="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold text-teal-800">
          <a href="/methodology" class="hover:underline">Calculation Methodology →</a>
          <a href="/sources" class="hover:underline">Evidence Registry &amp; Primary Sources →</a>
          <a href="/editorial-policy" class="hover:underline">Editorial &amp; Verification Policy →</a>
          <a href="/corrections" class="hover:underline">Report a Statutory Discrepancy →</a>
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
      robots: (hasBespokeCity && !isProvisional) ? 'index, follow' : 'noindex, follow',
      bodyContent: cityBody,
      structuredData: cityStructuredData,
      changefreq: 'weekly',
      priority: city.verificationStatus === 'VERIFIED' ? 0.9 : 0.7,
    });
  }

  // 5. Comparison Landing Pages
  for (const comp of COMPARISONS) {
    const cityA = CITIES[comp.cityAId];
    const cityB = CITIES[comp.cityBId];
    if (!cityA || !cityB) continue;

    // Check if this comparison is upgraded via SeoPageRenderer
    const compSeoKey = SEO_COMPARISON_KEYS[comp.slug];
    if (compSeoKey && SEO_LANDING_PAGES[compSeoKey]) {
      const seoPage = SEO_LANDING_PAGES[compSeoKey];
      const rendered = SeoPageRenderer.render(seoPage);
      pages.push({
        relativePath: `compare/${comp.slug}/index.html`,
        canonicalUrl: rendered.canonicalUrl,
        title: rendered.title,
        description: rendered.description,
        robots: rendered.robots,
        bodyContent: rendered.bodyContent,
        structuredData: rendered.structuredData,
        changefreq: rendered.changefreq,
        priority: rendered.priority,
      });
      continue;
    }

    const compStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'City Comparisons', item: `${BASE_URL}/compare` },
            { '@type': 'ListItem', position: 3, name: `${cityA.name} vs ${cityB.name}`, item: `${BASE_URL}/compare/${comp.slug}` },
          ],
        },
      ],
    };

    const compBody = `
      <article class="max-w-5xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6 flex items-center gap-1.5 flex-wrap">
          <a href="/" class="hover:text-teal-700 font-medium">Home</a>
          <span>/</span>
          <a href="/compare" class="hover:text-teal-700 font-medium">City Comparisons</a>
          <span>/</span>
          <span class="text-slate-800 font-bold">${cityA.name} vs ${cityB.name}</span>
        </nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">${cityA.name} vs ${cityB.name} Salary &amp; Cost of Living Comparison</h1>
        <p class="mt-2 text-slate-600">Cross-border financial living analysis comparing disposable income, statutory taxes, and purchasing power between ${cityA.name} and ${cityB.name}.</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <a href="/cities/${cityA.id}" class="p-5 bg-white border border-slate-200 rounded-xl hover:border-teal-600 transition-colors block group">
            <h2 class="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">${cityA.name} →</h2>
            <p class="text-xs text-slate-500 mt-0.5">${cityA.metroAreaName}</p>
            <div class="mt-3 text-sm space-y-1">
              <div>Currency: <strong>${cityA.currency}</strong></div>
              <div>COL Index: <strong>${cityA.colIndexBase100NYC}</strong> (NYC=100)</div>
              <div>Tax Status: <span class="text-teal-700 font-semibold">${cityA.verificationStatus}</span></div>
            </div>
          </a>
          <a href="/cities/${cityB.id}" class="p-5 bg-white border border-slate-200 rounded-xl hover:border-teal-600 transition-colors block group">
            <h2 class="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">${cityB.name} →</h2>
            <p class="text-xs text-slate-500 mt-0.5">${cityB.metroAreaName}</p>
            <div class="mt-3 text-sm space-y-1">
              <div>Currency: <strong>${cityB.currency}</strong></div>
              <div>COL Index: <strong>${cityB.colIndexBase100NYC}</strong> (NYC=100)</div>
              <div>Tax Status: <span class="text-teal-700 font-semibold">${cityB.verificationStatus}</span></div>
            </div>
          </a>
        </div>

        <div class="mt-8 flex items-center gap-4 flex-wrap">
          <a href="/compare/${comp.slug}" class="px-5 py-2.5 bg-teal-700 text-white font-bold text-sm rounded-xl hover:bg-teal-800 inline-block shadow-sm">
            Launch Live Interactive Comparison
          </a>
          <a href="/compare" class="text-sm font-semibold text-teal-700 hover:underline">
            ← View All City Comparisons
          </a>
        </div>
      </article>
    `;

    pages.push({
      relativePath: `compare/${comp.slug}/index.html`,
      canonicalUrl: `${BASE_URL}/compare/${comp.slug}`,
      title: `${cityA.name} vs ${cityB.name}: Salary & Living Costs | LivWorthy`,
      description: `Compare salary worth, tax rates, rent, and household purchasing power between ${cityA.name} and ${cityB.name}. Deterministic cross-border calculator.`,
      robots: 'index, follow',
      bodyContent: compBody,
      structuredData: compStructuredData,
      changefreq: 'monthly',
      priority: 0.8,
    });
  }

  for (const g of POPULAR_GUIDES_LIST) {
    if (SEO_LANDING_PAGES[g.slug]) {
      const seoPage = SEO_LANDING_PAGES[g.slug];
      const rendered = SeoPageRenderer.render(seoPage);
      pages.push({
        relativePath: `guides/${g.slug}/index.html`,
        canonicalUrl: rendered.canonicalUrl,
        title: rendered.title,
        description: rendered.description,
        robots: rendered.robots,
        bodyContent: rendered.bodyContent,
        structuredData: rendered.structuredData,
        changefreq: rendered.changefreq,
        priority: rendered.priority,
      });
      continue;
    }

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
            <span class="text-xs font-bold uppercase tracking-wider text-teal-700">Quick answer</span>
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
  }

  // 6b. Priority Authority Hub Pages (Salary After Tax, Salary Needed, Cost of Living)
  const PROGRAMMATIC_PAGES = [
    SEO_LANDING_PAGES['salary-after-tax-nyc'],
    SEO_LANDING_PAGES['salary-needed-nyc'],
    SEO_LANDING_PAGES['cost-of-living-nyc'],
    SEO_LANDING_PAGES['salary-after-tax-london'],
    SEO_LANDING_PAGES['salary-needed-london'],
    SEO_LANDING_PAGES['salary-after-tax-dubai'],
  ];

  for (const progPage of PROGRAMMATIC_PAGES) {
    if (!progPage) continue;
    const rendered = SeoPageRenderer.render(progPage);
    pages.push({
      relativePath: `${progPage.slug}/index.html`,
      canonicalUrl: rendered.canonicalUrl,
      title: rendered.title,
      description: rendered.description,
      robots: rendered.robots,
      bodyContent: rendered.bodyContent,
      structuredData: rendered.structuredData,
      changefreq: rendered.changefreq,
      priority: rendered.priority,
    });
  }

  // 6c. Apply Deterministic Quality Gate across all generated pages
  function determinePageTypeForGate(rel: string): string {
    if (rel.includes('reports/')) return 'empirical-report';
    if (rel === 'index.html' || /^[a-z]{2}\/index\.html$/.test(rel)) return 'homepage';
    if (rel.includes('salary-worth')) return 'calculator-salary-worth';
    if (rel.includes('salary-needed')) return 'calculator-salary-needed';
    if (rel.includes('salary-after-tax')) return 'calculator-salary-after-tax';
    if (rel.includes('cost-of-living')) return 'calculator-cost-of-living';
    if (rel.includes('compare')) return 'calculator-compare';
    if (rel.includes('job-offers') || rel.includes('job-offer-comparison')) return 'calculator-job-offers';
    if (rel.includes('cities/')) return 'city-intelligence';
    if (rel.includes('countries/')) return 'country-intelligence';
    if (rel.includes('guides/')) return 'salary-guide';
    if (rel.includes('relocation/')) return 'relocation-corridor';
    if (['about/index.html', 'methodology/index.html', 'sources/index.html', 'editorial-policy/index.html', 'data-policy/index.html', 'corrections/index.html', 'terms/index.html', 'privacy/index.html', 'contact/index.html'].includes(rel)) return 'trust-policy';
    return 'general-landing';
  }

  let qualityGateDemotions = 0;
  for (const page of pages) {
    if (page.robots === 'index, follow') {
      const pType = determinePageTypeForGate(page.relativePath);
      const meaningfulText = extractMeaningfulHtmlText(page.bodyContent);
      const meaningfulWords = calculateEffectiveWordCount(meaningfulText);
      const h1Match = page.bodyContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const h1Text = h1Match ? extractCleanText(h1Match[1]) : '';

      const gate = canBeIndexed({
        url: page.canonicalUrl,
        relativePath: page.relativePath,
        title: page.title,
        description: page.description,
        h1Text,
        robots: page.robots,
        meaningfulWords,
        pageType: pType,
      });

      if (!gate.canBeIndexed) {
        page.robots = 'noindex, follow';
        qualityGateDemotions++;
      }
    }
  }
  if (qualityGateDemotions > 0) {
    console.log(`[Quality Gate] Demoted ${qualityGateDemotions} thin/unverified pages to noindex, follow to protect publisher trust.`);
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

  // Write empirical report downloadable CSV & JSON datasets
  for (const dl of empiricalReports.downloads) {
    for (const base of [distDir, publicDir]) {
      const outPath = path.join(base, dl.relativePath);
      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(outPath, dl.content, 'utf-8');
    }
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
    title: 'Countries: Salary, Tax & Living Data | LivWorthy',
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
    title: 'Cities: Salary & Cost of Living Data | LivWorthy',
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
    title: 'Salary & Relocation Guides | LivWorthy',
    description: 'Authoritative salary, statutory tax, and cost of living guides for major metropolitan areas worldwide. Analyze realistic purchasing power and budgets.',
    robots: 'index, follow',
    bodyContent: guidesBody,
    structuredData: guidesStructuredData,
    changefreq: 'weekly',
    priority: 0.9,
  });

  // 4. Comparisons Directory (/compare)
  const comparisonsStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'City Comparisons', item: `${BASE_URL}/compare` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: 'City Comparisons & Cross-Border Intelligence | LivWorthy',
        url: `${BASE_URL}/compare`,
        description: 'Bilateral metropolitan comparisons evaluating disposable income, statutory taxes, and purchasing power parity across major global cities.',
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
    ],
  };

  const comparisonsBody = `
    <article class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" class="text-sm text-[#60706D] mb-6">
        <a href="/" class="hover:text-[#167D75]">Home</a> / <span class="text-[#102A2E] font-bold">City Comparisons</span>
      </nav>
      <div class="max-w-3xl mb-8">
        <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">Cross-Border Intelligence</span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] mt-1 tracking-tight">City Living &amp; Salary Comparisons</h1>
        <p class="text-base text-[#60706D] mt-3 leading-relaxed">
          Comprehensive bilateral comparisons benchmarked by LivWorthy. Inspect disposable income equivalence, progressive statutory tax differentials, local fair-market housing costs, and purchasing power parity between metropolitan centers.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${COMPARISONS.map((comp) => {
          const cityA = CITIES[comp.cityAId];
          const cityB = CITIES[comp.cityBId];
          if (!cityA || !cityB) return '';
          return `
            <a href="/compare/${comp.slug}" class="p-6 bg-white border border-[#DCE3E0] rounded-2xl hover:border-[#167D75] hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div class="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-[#167D75]">
                  <span>${escapeHtml(cityA.name)} vs ${escapeHtml(cityB.name)}</span>
                  <span class="font-mono text-[#60706D]">${cityA.currency} / ${cityB.currency}</span>
                </div>
                <h2 class="text-xl font-extrabold text-[#102A2E] group-hover:text-[#167D75] transition-colors mb-3 leading-snug">
                  ${escapeHtml(cityA.name)} vs ${escapeHtml(cityB.name)}: Salary &amp; Living Costs
                </h2>
                <div class="grid grid-cols-2 gap-2 text-xs bg-[#F7F8F5] p-3 rounded-lg border border-[#DCE3E0]">
                  <div>
                    <div class="font-bold text-[#102A2E]">${escapeHtml(cityA.name)}</div>
                    <div class="text-[#60706D]">COL: ${cityA.colIndexBase100NYC} (NYC=100)</div>
                  </div>
                  <div>
                    <div class="font-bold text-[#102A2E]">${escapeHtml(cityB.name)}</div>
                    <div class="text-[#60706D]">COL: ${cityB.colIndexBase100NYC} (NYC=100)</div>
                  </div>
                </div>
              </div>
              <div class="pt-4 mt-4 border-t border-[#F7F8F5] flex items-center justify-between text-xs">
                <span class="text-[#60706D] font-medium">Compare Living Standards</span>
                <span class="font-bold text-[#167D75] group-hover:translate-x-1 transition-transform">View Comparison →</span>
              </div>
            </a>
          `;
        }).filter(Boolean).join('')}
      </div>
    </article>
  `;

  pages.push({
    relativePath: 'compare/index.html',
    canonicalUrl: `${BASE_URL}/compare`,
    title: 'City Cost of Living Comparisons | LivWorthy',
    description: 'Compare statutory income taxes, cost of living, fair-market rents, and purchasing power between major world cities. Deterministic cross-border intelligence.',
    robots: 'index, follow',
    bodyContent: comparisonsBody,
    structuredData: comparisonsStructuredData,
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
        <h1 class="text-3xl font-extrabold text-[#102A2E]">Editorial &amp; Information Quality Policy</h1>
        <div class="mt-6 space-y-5 text-sm text-slate-700 leading-relaxed">
          <p>LivWorthy is committed to publishing financial living intelligence of the highest evidentiary standard. Our research focuses on global compensation, statutory taxation, and residential affordability across major metropolitan centers worldwide.</p>
          
          <h2 class="text-xl font-bold text-[#102A2E] mt-6">1. Evidentiary Hierarchy &amp; Primary Sourcing</h2>
          <p>Every mathematical computation, statutory tax bracket, and cost-of-living benchmark published on LivWorthy must trace to verified primary sources. We strictly prioritize:</p>
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>Tier 1 — Statutory Tax Authorities:</strong> Official government revenue services including the US Internal Revenue Service (IRS), UK HM Revenue &amp; Customs (HMRC), Canada Revenue Agency (CRA), Australian Taxation Office (ATO), German Bundesministerium der Finanzen, and equivalent statutory gazettes.</li>
            <li><strong>Tier 2 — National Statistical Registries:</strong> Official metropolitan datasets published by the US Bureau of Labor Statistics (BLS), UK Office for National Statistics (ONS), Eurostat, and official metropolitan housing departments (e.g. HUD Fair Market Rents).</li>
            <li><strong>Tier 3 — Spatial &amp; Spatial Econometric Models:</strong> For cities with limited municipal reporting, secondary datasets are calibrated against regional benchmarks and explicitly flagged as DERIVED or LIMITED.</li>
          </ul>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">2. Zero Data Fabrication &amp; Synthetic Fallback Ban</h2>
          <p>Under the LivWorthy Integrity Charter, our engineers and researchers never fabricate tax brackets, cost-of-living indices, or ratings. If official statutory rules are not yet verified for a specific jurisdiction, the jurisdiction is explicitly marked as "UNDER VERIFICATION" or "PROVISIONAL" rather than populated with synthetic guesses.</p>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">3. Commercial Independence &amp; Editorial Neutrality</h2>
          <p>LivWorthy maintains strict separation between editorial content, calculation engines, and commercial operations. Advertisers, sponsors, and affiliate partners possess zero input into algorithm weights, tax schedule formulations, or city affordability rankings. Calculations are deterministic and mathematically objective.</p>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">4. Corrections &amp; Public Accountability</h2>
          <p>Tax codes change continually through annual legislative procedures. We maintain an open, public <a href="/corrections" class="text-[#167D75] underline font-medium">Corrections Log</a> documenting all historical rule adjustments. Users and domain experts are encouraged to report statutory discrepancies via our interactive reporting tools.</p>
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
        <h1 class="text-3xl font-extrabold text-[#102A2E]">Data Policy &amp; Zero PII Architecture</h1>
        <div class="mt-6 space-y-5 text-sm text-slate-700 leading-relaxed">
          <p>${PLATFORM_IDENTITY.privacyCommitment}</p>
          
          <h2 class="text-xl font-bold text-[#102A2E] mt-6">1. Ephemeral Client-Side Calculations</h2>
          <p>LivWorthy calculation scenarios—including compensation figures, household profiles, target expenses, and savings targets—are executed ephemerally in your web browser. Scenario data is not saved to server databases or user profiles. We do not require account registration, passwords, or personal email addresses.</p>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">2. Zero Personal Identifiable Information (PII)</h2>
          <p>Our systems do not collect, request, or retain Personally Identifiable Information (PII). We do not record Social Security Numbers, National Insurance Numbers, employer names, physical home addresses, or financial account balances. You can plan salary scenarios with complete personal anonymity.</p>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">3. Minor-Unit Integer Precision</h2>
          <p>All internal monetary amounts are converted and calculated using integer minor units (e.g. cents, pence, fils, or yen) rather than standard IEEE-754 floating-point numbers. This architectural decision prevents rounding drift and ensures exact mathematical reproducibility across all supported global currencies.</p>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">4. Open Evidentiary Provenance</h2>
          <p>We maintain full transparency regarding the origin of all data points. Every metropolitan living cost indicator and tax rate bracket links to primary source documentation via our publicly accessible <a href="/sources" class="text-[#167D75] underline font-medium">Verified Evidence Registry</a>.</p>
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
        <h1 class="text-3xl font-extrabold text-[#102A2E]">Corrections Log &amp; Data Feedback</h1>
        <p class="mt-2 text-slate-600 leading-relaxed">We maintain an open, public record of statutory adjustments and algorithmic updates. If tax legislation changes or metropolitan benchmarks shift, we update our models and document the revisions here.</p>

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
          <h2 class="text-lg font-bold text-slate-900 mb-2">Submit a Correction or Discrepancy</h2>
          <p class="text-xs text-slate-600 leading-relaxed mb-4">
            If you observe an updated statutory tax threshold, modified pension contribution rate, or shifting rental market trend that differs from our published models, please submit a report. We review government gazettes promptly and publish verified updates.
          </p>
          <a href="/methodology" class="inline-flex items-center text-xs font-bold text-[#167D75] hover:underline">Review Our Complete Calculation Methodology →</a>
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
        <h1 class="text-3xl font-extrabold text-[#102A2E]">Terms of Service &amp; Financial Disclaimer</h1>
        <div class="mt-6 space-y-5 text-sm text-slate-700 leading-relaxed">
          <div class="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 text-xs sm:text-sm leading-relaxed font-medium space-y-2">
            <h2 class="font-bold text-sm sm:text-base text-amber-900">Important Financial &amp; Legal YMYL Disclaimer</h2>
            <p>
              LivWorthy is an analytical, educational information platform designed to assist users in preliminary financial planning, relocation evaluations, and cross-border lifestyle comparisons.
            </p>
            <p>
              Calculations, net salary estimates, tax liability figures, and living expense benchmarks provided on LivWorthy do <strong>NOT</strong> constitute certified public accounting (CPA) advice, licensed tax planning, legal counsel, or financial fiduciary advice. Individual tax liabilities depend on complex personal circumstances, itemized deductions, residency rules, and non-standard income sources. Always consult a licensed tax professional or certified financial advisor prior to executing employment contracts or relocation decisions.
            </p>
          </div>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">1. Permitted Informational Use</h2>
          <p>By accessing or using LivWorthy, you are granted a revocable, non-exclusive license to utilize our public calculation tools, empirical reports, and directory guides for personal, educational, and non-commercial planning purposes.</p>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">2. Limitation of Liability</h2>
          <p>While LivWorthy makes every effort to ensure accuracy by referencing statutory government tables and official statistical registries, all models and calculations are provided on an "as-is" and "as-available" basis without warranties of any kind. Under no circumstances shall LivWorthy Inc., its creators, or contributors be held liable for financial losses, employment disputes, or relocation outcomes arising from reliance on information presented on this site.</p>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">3. Intellectual Property</h2>
          <p>All software architectures, interactive calculators, bespoke design tokens, and research compilations are the proprietary intellectual property of LivWorthy Inc. Automated scraping, wholesale reproduction, or reverse-engineering of our proprietary datasets for competing commercial products is strictly prohibited without prior written authorization.</p>
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
        <div class="mt-6 space-y-5 text-sm text-slate-700 leading-relaxed">
          <p>LivWorthy ("we," "our," or "the Platform") is architected with a strict privacy-first foundation. We believe financial inquiries regarding salary worth, relocation affordability, and personal living budgets should be completely private and anonymous.</p>
          
          <h2 class="text-xl font-bold text-[#102A2E] mt-6">1. Information We Do NOT Collect</h2>
          <p>Unlike traditional personal finance platforms, LivWorthy does not require user registration or account creation. We do NOT collect:</p>
          <ul class="list-disc pl-5 space-y-1.5">
            <li>Names, residential street addresses, or telephone numbers.</li>
            <li>Government identification numbers, tax IDs, or Social Security numbers.</li>
            <li>Bank credentials, credit card details, or payroll account connections.</li>
            <li>Email addresses or mailing lists.</li>
          </ul>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">2. Local Browser Storage Usage</h2>
          <p>We use your browser's local storage (localStorage) exclusively to preserve your chosen UI preferences across browsing sessions—such as your preferred display currency, active city selection, and language locale. This preference data remains on your physical device and is never transmitted to an external analytics database.</p>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">3. Third-Party Infrastructure &amp; Analytics</h2>
          <p>To ensure global reliability, high-speed CDN caching, and platform sustainability, we utilize reputable infrastructure providers:</p>
          <ul class="list-disc pl-5 space-y-1.5">
            <li><strong>Cloudflare &amp; Vercel:</strong> Edge hosting, DDoS mitigation, and SSL/TLS encryption. Standard server access logs (IP addresses and browser user-agents) are processed for security purposes in accordance with industry security standards.</li>
            <li><strong>Microsoft Clarity:</strong> Pseudonymized, aggregated usage telemetry to understand navigation flow and resolve user experience defects. Clarity is configured without keylogging or capturing personal input.</li>
            <li><strong>Google AdSense:</strong> Contextual advertising supporting free access to our tools. Advertisers may use anonymous cookies to serve relevant ads in accordance with Google's advertising policies.</li>
          </ul>

          <h2 class="text-xl font-bold text-[#102A2E] mt-6">4. Contact &amp; Privacy Inquiries</h2>
          <p>If you have any questions regarding our zero-PII data architecture or privacy practices, please review our <a href="/data-policy" class="text-[#167D75] underline font-medium">Data Policy</a> or contact our technical team at <span class="font-mono text-[#102A2E]">privacy@livworthy.com</span>.</p>
        </div>
      </article>
    `,
  });

  // /contact
  pages.push({
    relativePath: 'contact/index.html',
    canonicalUrl: `${BASE_URL}/contact`,
    title: 'Contact LivWorthy — Editorial, Technical & Data Inquiries',
    description: 'Get in touch with the LivWorthy team. Contact our editorial desk, report data discrepancies, or submit inquiries.',
    robots: 'index, follow',
    priority: 0.7,
    changefreq: 'monthly',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact LivWorthy',
      url: `${BASE_URL}/contact`,
      description: 'Get in touch with the LivWorthy editorial and research team.',
      mainEntity: {
        '@type': 'Organization',
        name: 'LivWorthy',
        url: BASE_URL,
        contactPoint: [
          {
            '@type': 'ContactPoint',
            email: 'contact@livworthy.com',
            contactType: 'customer support',
          },
          {
            '@type': 'ContactPoint',
            email: 'editorial@livworthy.com',
            contactType: 'editorial',
          },
          {
            '@type': 'ContactPoint',
            email: 'corrections@livworthy.com',
            contactType: 'data corrections',
          },
        ],
      },
    },
    bodyContent: `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">Contact</span></nav>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] tracking-tight">Contact LivWorthy</h1>
        <p class="mt-3 text-lg text-slate-700 leading-relaxed font-medium">Have a question about our methodology, spotted a data update in your jurisdiction, or want to connect with our editorial desk? Here is how to reach our team.</p>

        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h2 class="text-lg font-bold text-[#102A2E]">General Inquiries &amp; Support</h2>
            <p class="text-sm text-slate-600 leading-relaxed">For general questions about using the platform, partnerships, or platform feedback:</p>
            <p class="text-sm font-mono font-semibold text-[#167D75]">
              <a href="mailto:contact@livworthy.com" class="hover:underline">contact@livworthy.com</a>
            </p>
          </div>

          <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h2 class="text-lg font-bold text-[#102A2E]">Data Corrections &amp; Source Updates</h2>
            <p class="text-sm text-slate-600 leading-relaxed">If you notice an updated statutory tax table, revised rental market report, or census release:</p>
            <p class="text-sm font-mono font-semibold text-[#167D75]">
              <a href="mailto:corrections@livworthy.com" class="hover:underline">corrections@livworthy.com</a>
            </p>
          </div>

          <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h2 class="text-lg font-bold text-[#102A2E]">Editorial &amp; Press</h2>
            <p class="text-sm text-slate-600 leading-relaxed">For journalists, researchers, and media professionals seeking quotes or empirical data analysis:</p>
            <p class="text-sm font-mono font-semibold text-[#167D75]">
              <a href="mailto:editorial@livworthy.com" class="hover:underline">editorial@livworthy.com</a>
            </p>
          </div>

          <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h2 class="text-lg font-bold text-[#102A2E]">Privacy &amp; Data Rights</h2>
            <p class="text-sm text-slate-600 leading-relaxed">For inquiries regarding our zero-PII architecture, privacy standards, or technical governance:</p>
            <p class="text-sm font-mono font-semibold text-[#167D75]">
              <a href="mailto:privacy@livworthy.com" class="hover:underline">privacy@livworthy.com</a>
            </p>
          </div>
        </div>

        <section class="mt-10 p-6 bg-white rounded-2xl border border-slate-200 space-y-4 text-sm text-slate-700">
          <h2 class="text-lg font-bold text-[#102A2E]">Data Correction Protocol &amp; Editorial Response Commitment</h2>
          <p>We review incoming technical and editorial communications systematically. When submitting data corrections, please include direct links or citations to primary statutory documentation (such as official national tax gazettes, IRS bulletins, HMRC guidelines, CRA announcements, ATO schedules, or HUD fair market rent datasets).</p>
          <p>Our quantitative research desk verifies every submitted discrepancy against statutory legislative baselines and aims to acknowledge and audit submissions within 2 business days. Approved corrections are logged publicly on our corrections registry.</p>
          <div class="pt-2 flex flex-wrap gap-4 text-xs text-slate-500 font-mono">
            <span>Desk Hours: Mon–Fri 09:00–18:00 UTC</span>
            <span>•</span>
            <span>PGP Verification Available on Request</span>
          </div>
        </section>

        <div class="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-sm font-semibold text-teal-800">
          <a href="/about" class="hover:underline">About LivWorthy →</a>
          <a href="/methodology" class="hover:underline">Methodology →</a>
          <a href="/editorial-policy" class="hover:underline">Editorial Policy →</a>
          <a href="/corrections" class="hover:underline">Submit Data Correction →</a>
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
    lang?: string;
    dir?: 'ltr' | 'rtl';
  },
  isHomepage = false,
  criticalCss = ''
): string {
  let html = template;

  // Set html lang and dir attributes dynamically
  const pageLang = page.lang || 'en';
  const pageDir = page.dir || (pageLang === 'ar' ? 'rtl' : 'ltr');
  html = html.replace(/<html(?:\s+[^>]*)?>/i, `<html lang="${pageLang}" dir="${pageDir}">`);

  // Replace external render-blocking stylesheet with inlined critical CSS to eliminate render delay
  if (criticalCss) {
    html = html.replace(
      /<link\s+rel="stylesheet"[^>]*href="\/assets\/index-[^"]+\.css"[^>]*\/?>/i,
      `<style id="critical-css">${criticalCss}</style>`
    );
  }

  // For static institutional and SEO pages, strip the SPA module script bundle
  // unless the page contains an interactive island (e.g. /salary-after-tax/new-york).
  const isInteractivePage = isHomepage || page.canonicalUrl.endsWith('/salary-after-tax/new-york');
  if (!isInteractivePage) {
    html = html.replace(/<script\s+type="module"[^>]*>.*?<\/script>\s*/gi, '');
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

  // Path-preserving hreflang alternates for verified Tier-1 localized routes, homepages, and tool pages.
  let hreflangTags = '';
  const currentUrl = new URL(page.canonicalUrl);
  const pathParts = currentUrl.pathname.split('/').filter(Boolean);
  const firstSeg = pathParts[0] || '';
  const isTier1Prefix = (TIER_1_LOCALES as string[]).includes(firstSeg);
  const isLocalePrefix = LONG_FORM_LOCALES.includes(firstSeg);

  const cleanPath = isLocalePrefix ? '/' + pathParts.slice(1).join('/') : currentUrl.pathname;
  const isHomeCluster = cleanPath === '' || cleanPath === '/';
  const isCoreTool = [
    '/salary-worth',
    '/salary-needed',
    '/salary-after-tax',
    '/cost-of-living',
    '/compare',
    '/job-offers',
  ].includes(cleanPath);

  const isIndexable = page.robots === 'index, follow';
  const isLocalizedCluster = isIndexable && (isTier1Prefix || isHomeCluster || isCoreTool);

  if (isLocalizedCluster) {
    const alternates: string[] = [];
    if (isHomeCluster) {
      for (const l of TIER_1_LOCALES) {
        alternates.push(`    <link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}" />`);
      }
      alternates.push(`    <link rel="alternate" hreflang="x-default" href="${BASE_URL}/" />`);
    } else {
      const defaultEnUrl = `${BASE_URL}${cleanPath}`;
      for (const l of TIER_1_LOCALES) {
        if (l === 'en') {
          alternates.push(`    <link rel="alternate" hreflang="en" href="${defaultEnUrl}" />`);
        } else {
          alternates.push(`    <link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}${cleanPath}" />`);
        }
      }
      alternates.push(`    <link rel="alternate" hreflang="x-default" href="${defaultEnUrl}" />`);
    }
    hreflangTags = '\n' + alternates.join('\n');
  } else if (isIndexable) {
    hreflangTags = `\n    <link rel="alternate" hreflang="x-default" href="${page.canonicalUrl}" />`;
  }
  // Strip any previous hreflang alternate tags in the template before injecting fresh ones
  html = html.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>/gi, '');
  html = html.replace('</head>', `${hreflangTags}\n  </head>`);

  // Replace Open Graph metadata dynamically
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${page.canonicalUrl}" />`
  );
  const ogType = page.canonicalUrl.includes('/guides/') ? 'article' : 'website';
  html = html.replace(
    /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:type" content="${ogType}" />`
  );

  // Replace Twitter card metadata dynamically
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`
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
    if (html.includes('<div id="root">')) {
      html = html.replace(
        /<div id="root">[\s\S]*?<\/div>/,
        `<div id="root">${page.bodyContent}</div>`
      );
    }
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
  const comparisonPages = indexablePages.filter(
    (p) => p.relativePath.startsWith('compare/') && p.relativePath !== 'compare/index.html'
  );
  const guidePages = indexablePages.filter(
    (p) => p.relativePath.startsWith('guides/') && p.relativePath !== 'guides/index.html'
  );
  const relocationPages = indexablePages.filter(
    (p) => p.relativePath.startsWith('relocation/') && p.relativePath !== 'relocation/index.html'
  );
  const reportsPages = indexablePages.filter((p) => p.relativePath.startsWith('reports/'));
  const programmaticHubPages = indexablePages.filter(
    (p) =>
      p.relativePath.startsWith('salary-after-tax/') ||
      p.relativePath.startsWith('salary-needed/') ||
      p.relativePath.startsWith('cost-of-living/') ||
      p.relativePath.startsWith('salary-worth/') ||
      p.relativePath.startsWith('job-offers/')
  ).map((p) => ({
    canonicalUrl: p.canonicalUrl,
    changefreq: p.changefreq,
    priority: p.priority,
  }));

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
    { canonicalUrl: `${BASE_URL}/coverage`, changefreq: 'weekly', priority: 0.9 },
    { canonicalUrl: `${BASE_URL}/relocation`, changefreq: 'weekly', priority: 0.9 },
    { canonicalUrl: `${BASE_URL}/job-offer-comparison`, changefreq: 'weekly', priority: 0.9 },
    { canonicalUrl: `${BASE_URL}/countries`, changefreq: 'weekly', priority: 0.9 },
    { canonicalUrl: `${BASE_URL}/cities`, changefreq: 'weekly', priority: 0.9 },
    { canonicalUrl: `${BASE_URL}/compare`, changefreq: 'weekly', priority: 0.9 },
    { canonicalUrl: `${BASE_URL}/guides`, changefreq: 'weekly', priority: 0.9 },
    ...programmaticHubPages,
    { canonicalUrl: `${BASE_URL}/about`, changefreq: 'monthly', priority: 0.8 },
    { canonicalUrl: `${BASE_URL}/methodology`, changefreq: 'monthly', priority: 0.8 },
    { canonicalUrl: `${BASE_URL}/sources`, changefreq: 'monthly', priority: 0.8 },
    { canonicalUrl: `${BASE_URL}/editorial-policy`, changefreq: 'monthly', priority: 0.7 },
    { canonicalUrl: `${BASE_URL}/data-policy`, changefreq: 'monthly', priority: 0.7 },
    { canonicalUrl: `${BASE_URL}/corrections`, changefreq: 'monthly', priority: 0.7 },
    { canonicalUrl: `${BASE_URL}/terms`, changefreq: 'monthly', priority: 0.6 },
    { canonicalUrl: `${BASE_URL}/privacy`, changefreq: 'monthly', priority: 0.6 },
    { canonicalUrl: `${BASE_URL}/contact`, changefreq: 'monthly', priority: 0.7 },
  ];

  const uniqueMainUrls = Array.from(new Map(mainUrls.map((u) => [u.canonicalUrl, u])).values());
  const mainXml = buildUrlSet(uniqueMainUrls);
  const countriesXml = buildUrlSet(countryPages);
  const citiesXml = buildUrlSet(cityPages);
  const comparisonsXml = buildUrlSet(comparisonPages);
  const guidesXml = buildUrlSet(guidePages);
  const relocationXml = buildUrlSet(relocationPages);
  const reportsXml = buildUrlSet(reportsPages);

  // Segmented multilingual sitemaps contain only real canonical localized routes for verified Tier-1 locales.
  const tier1Locales = ['en', 'es', 'fr', 'ar', 'de', 'pt', 'hi', 'ur', 'zh', 'ja'];
  const localeSitemaps: { name: string; content: string }[] = [];
  for (const loc of tier1Locales) {
    const locPages = indexablePages.filter((p) => p.relativePath === `${loc}/index.html` || p.relativePath.startsWith(`${loc}/`)).map((p) => ({ canonicalUrl: p.canonicalUrl, changefreq: p.changefreq, priority: p.priority }));
    localeSitemaps.push({ name: `sitemap-${loc}.xml`, content: buildUrlSet(locPages) });
  }

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
  <sitemap>
    <loc>${BASE_URL}/sitemap-relocation.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-reports.xml</loc>
  </sitemap>
${tier1Locales.map(loc => `  <sitemap>
    <loc>${BASE_URL}/sitemap-${loc}.xml</loc>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  const filesToWrite = [
    { name: 'sitemap.xml', content: sitemapIndexXml },
    { name: 'sitemap-main.xml', content: mainXml },
    { name: 'sitemap-countries.xml', content: countriesXml },
    { name: 'sitemap-cities.xml', content: citiesXml },
    { name: 'sitemap-comparisons.xml', content: comparisonsXml },
    { name: 'sitemap-guides.xml', content: guidesXml },
    { name: 'sitemap-relocation.xml', content: relocationXml },
    { name: 'sitemap-reports.xml', content: reportsXml },
    ...localeSitemaps,
  ];

  const allowedFileNames = new Set(filesToWrite.map((f) => f.name));

  // Clean up any stale or unapproved sitemap files
  for (const dir of [distDir, publicDir]) {
    if (fs.existsSync(dir)) {
      const existing = fs.readdirSync(dir);
      for (const file of existing) {
        if (file.startsWith('sitemap') && file.endsWith('.xml') && !allowedFileNames.has(file)) {
          fs.unlinkSync(path.join(dir, file));
        }
      }
    }
  }

  for (const f of filesToWrite) {
    fs.writeFileSync(path.join(distDir, f.name), f.content);
    fs.writeFileSync(path.join(publicDir, f.name), f.content);
  }

  console.log(`[SEO Generator] Generated sitemap index + ${localeSitemaps.length + 7} segmented sitemaps (${indexablePages.length + mainUrls.length} total URLs).`);
}

function writeStaticFiles(distDir: string, publicDir: string) {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /test/
Disallow: /*?*city=
Disallow: /*?*tab=
Disallow: /*?*salary=

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
- [LivWorthy Homepage](${BASE_URL}/)
- [Calculation Methodology](${BASE_URL}/methodology)
- [Verified Sources Registry](${BASE_URL}/sources)
- [Editorial & Verification Policy](${BASE_URL}/editorial-policy)
- [Data & Privacy Policy](${BASE_URL}/data-policy)
- [Data Corrections & Feedback](${BASE_URL}/corrections)
- [Terms & Financial Disclaimer](${BASE_URL}/terms)
- [Privacy Policy](${BASE_URL}/privacy)
- [About LivWorthy](${BASE_URL}/about)
- [Countries Directory](${BASE_URL}/countries)
- [Cities Directory](${BASE_URL}/cities)
- [City Comparisons Directory](${BASE_URL}/compare)
- [Salary & Relocation Guides](${BASE_URL}/guides)
- [Sitemap Index](${BASE_URL}/sitemap.xml)
`;

  const adsTxt = `# LivWorthy Authorized Digital Sellers
# Domain: livworthy.com
google.com, pub-9082698285506451, DIRECT, f08c47fec0942fa0
`;

  const notFoundPath = path.join(publicDir, '404.html');
  const notFoundContent = fs.existsSync(notFoundPath) ? fs.readFileSync(notFoundPath, 'utf-8') : '';

  const files = [
    { name: 'robots.txt', content: robotsTxt },
    { name: 'llms.txt', content: llmsTxt },
    { name: 'ads.txt', content: adsTxt },
    ...(notFoundContent ? [{ name: '404.html', content: notFoundContent }] : []),
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
