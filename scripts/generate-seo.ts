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
          'Authoritative statutory personal income tax schedules, fair-market rent benchmarks, and weighted essential goods expenditure models across 39 international commercial markets.',
        creator: { '@id': `${BASE_URL}/#organization` },
        temporalCoverage: '2024/2026',
        spatialCoverage: 'Global (39 Sovereign Jurisdictions)',
        license: `${BASE_URL}/terms`,
      },
    ],
  };

  const homeHtmlBody = `
    <header class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-extrabold text-[#102A2E]">LivWorthy — Know what your income is really worth.</h1>
      <p class="mt-2 text-lg text-slate-600">${PLATFORM_IDENTITY.coreDefinition} Compute verified statutory take-home pay, realistic cost of living, household budgets, and purchasing power across 39 international markets.</p>
    </header>
    <main class="max-w-7xl mx-auto px-4 py-6">
      <section class="mb-10">
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
      <section class="mb-10">
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
      <section class="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
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
    </main>
  `;

  // Update dist/index.html with pre-rendered homepage body
  const prerenderedHome = renderPageHtml(baseHtml, {
    title: 'LivWorthy — Know what your income is really worth',
    description: 'Know what your income is really worth. Precision global income and living intelligence platform across 39 international markets.',
    canonicalUrl: `${BASE_URL}/`,
    robots: 'index, follow',
    bodyContent: homeHtmlBody,
    structuredData: homeStructuredData,
  });
  fs.writeFileSync(templatePath, prerenderedHome);

  // 2. Transparency & E-E-A-T Institutional Pages
  const transparencyPages = createTransparencyPages();
  pages.push(...transparencyPages);

  // 3. Country Hub Pages
  for (const country of Object.values(COUNTRIES)) {
    const isProvisional = country.verificationStatus === 'PROVISIONAL' || country.verificationStatus === 'UNSUPPORTED';
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
          name: `${country.name} Income & Living Intelligence`,
          url: `${BASE_URL}/countries/${country.id.toLowerCase()}`,
          description: `Analyze take-home pay, statutory taxes, and living expenses in ${country.name}.`,
          publisher: { '@id': `${BASE_URL}/#organization` },
        },
      ],
    };

    const countryBody = `
      <article class="max-w-5xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-6"><a href="/" class="hover:text-teal-700">Home</a> / <span class="text-slate-800 font-bold">${country.name}</span></nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">${country.name} Income & Living Intelligence</h1>
        <p class="mt-2 text-slate-600">Comprehensive statutory salary calculations, tax breakdowns, cost of living indices, and major city benchmarks for ${country.name}.</p>
        <div class="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-full">
          Status: ${country.verificationStatus}
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
              <a href="/?city=${ct.id}&tab=salary-worth" class="px-4 py-2 bg-teal-700 text-white rounded font-medium hover:bg-teal-800">Calculate Salary Worth</a>
              <a href="/?city=${ct.id}&tab=salary-after-tax" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary After Tax</a>
              <a href="/?city=${ct.id}&tab=salary-needed" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary Needed</a>
              <a href="/?city=${ct.id}&tab=cost-of-living" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Cost of Living</a>
            `).join('')}
          </div>
        </section>
      </article>
    `;

    pages.push({
      relativePath: `countries/${country.id.toLowerCase()}/index.html`,
      canonicalUrl: `${BASE_URL}/countries/${country.id.toLowerCase()}`,
      title: `${country.name} Living & Income Intelligence | LivWorthy`,
      description: `Authoritative statutory salary, tax, and cost-of-living intelligence for ${country.name}. Compute net income and living benchmarks.`,
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
    const isProvisional = city.verificationStatus === 'PROVISIONAL' || (country && country.verificationStatus === 'PROVISIONAL');

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
        <h1 class="text-3xl font-extrabold text-[#102A2E]">${city.name} Income, Tax & Cost of Living Intelligence</h1>
        <p class="mt-2 text-slate-600">Financial living analysis for ${city.name} (${country ? country.name : city.countryId}). Metro area: ${city.metroAreaName}.</p>
        
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
            <div class="text-xl font-bold text-teal-700 mt-1">${city.verificationStatus}</div>
          </div>
        </div>

        <section class="mt-8">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">Calculators for ${city.name}</h2>
          <div class="flex flex-wrap gap-2 text-sm">
            <a href="/?city=${city.id}&tab=salary-worth" class="px-4 py-2 bg-teal-700 text-white rounded font-medium hover:bg-teal-800">Calculate Salary Worth</a>
            <a href="/?city=${city.id}&tab=salary-after-tax" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary After Tax</a>
            <a href="/?city=${city.id}&tab=salary-needed" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Salary Needed</a>
            <a href="/?city=${city.id}&tab=cost-of-living" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Cost of Living</a>
            <a href="/?city=${city.id}&tab=compare" class="px-4 py-2 bg-slate-100 text-slate-800 rounded font-medium hover:bg-slate-200">Compare With Another City</a>
          </div>
        </section>
      </article>
    `;

    pages.push({
      relativePath: `cities/${city.id}/index.html`,
      canonicalUrl: `${BASE_URL}/cities/${city.id}`,
      title: `${city.name} Income, Tax & Cost of Living Intelligence | LivWorthy`,
      description: `Authoritative living costs, statutory income tax schedules, and salary benchmarks for ${city.name} (${country ? country.name : city.countryId}).`,
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
          <span>${country.name}</span> • ${region ? `<span>${region.name}</span> • ` : ''}<span>${city.name}</span> • <span>Verified Statutory Benchmark</span>
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
            <span class="text-xs text-slate-500">Tax Year 2024 / Deterministic Model</span>
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
                  <td class="p-3 text-teal-800 font-semibold">${country.verificationStatus}</td>
                  <td class="p-3">Official Schedule</td>
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

    const html = renderPageHtml(baseHtml, page);
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
  }
): string {
  let html = template;

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

  const countryPages = indexablePages.filter((p) => p.relativePath.startsWith('countries/'));
  const cityPages = indexablePages.filter((p) => p.relativePath.startsWith('cities/'));
  const comparisonPages = indexablePages.filter((p) => p.relativePath.startsWith('compare/'));
  const guidePages = indexablePages.filter((p) => p.relativePath.startsWith('guides/'));

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

  const llmsTxt = `# LivWorthy (https://livworthy.com)
> ${PLATFORM_IDENTITY.tagline}

${PLATFORM_IDENTITY.coreDefinition}

## Core Intelligence Capabilities
- Salary Worth: Evaluates disposable income and savings capacity after statutory taxes, rent, and household necessities.
- Salary After Tax: Statutory take-home pay engine accounting for national, regional/state, and local income taxes plus mandatory social contributions.
- Salary Needed: Deterministic inverse solver computing gross compensation needed to sustain defined living standards and savings goals.
- Cost of Living: Metro-level benchmarks for housing, food, transit, healthcare, and utilities across 39 commercial markets.
- City Comparison: Cross-border purchasing-power and lifestyle equivalence modeling.
- Job Offer Evaluator: Multi-currency total compensation value calculator.

## Algorithmic & Data Governance
- Zero-AI Financial Calculation Policy: All financial numbers are computed by deterministic software and verified statutory tax rules—never estimated by LLMs.
- Source Provenance: Built on Tier-1 government tax authorities (IRS, HMRC, FTA, CRA, ATO), official statistical bureaus (BLS, Eurostat), and institutional benchmarks (HUD FMR).
- Privacy-First: Anonymous calculations without user accounts, cookies, or personally identifiable information.

## Authoritative Public Resources
- Platform Overview: https://livworthy.com/about
- Calculation Methodology: https://livworthy.com/methodology
- Verified Sources Registry: https://livworthy.com/sources
- Editorial & Verification Policy: https://livworthy.com/editorial-policy
- Data & Privacy Policy: https://livworthy.com/data-policy
- Data Corrections & Feedback: https://livworthy.com/corrections
- Terms & Financial Disclaimer: https://livworthy.com/terms
- Sitemap Index: https://livworthy.com/sitemap.xml
`;

  const adsTxt = `# LivWorthy Authorized Digital Sellers
# Domain: livworthy.com
# Authorized ad exchange specifications will be populated upon ad partner onboarding.
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
