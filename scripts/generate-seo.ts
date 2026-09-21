import fs from 'fs';
import path from 'path';
import { COUNTRIES, CITIES, TAX_JURISDICTIONS } from '../src/data/locations';

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

  // 1. Homepage Prerender Enhancements
  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: `${BASE_URL}/`,
        name: 'LivWorthy',
        description: 'Know what your income is really worth. Global income & living intelligence platform.',
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'LivWorthy',
        url: `${BASE_URL}/`,
        logo: `${BASE_URL}/logo.png`,
      },
      {
        '@type': 'WebApplication',
        name: 'LivWorthy Income & Living Intelligence Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    ],
  };

  const homeHtmlBody = `
    <header class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-extrabold text-[#102A2E]">LivWorthy — Know what your income is really worth.</h1>
      <p class="mt-2 text-lg text-slate-600">Precision global income and living intelligence across 39 international commercial markets. Compute verified statutory take-home pay, realistic cost of living, household budgets, and purchasing power.</p>
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
    </main>
  `;

  // Update dist/index.html with pre-rendered homepage body
  const prerenderedHome = renderPageHtml(baseHtml, {
    title: 'LivWorthy — Know what your income is really worth',
    description: 'Know what your income is really worth. Precision global income and living intelligence platform.',
    canonicalUrl: `${BASE_URL}/`,
    robots: 'index, follow',
    bodyContent: homeHtmlBody,
    structuredData: homeStructuredData,
  });
  fs.writeFileSync(templatePath, prerenderedHome);

  // 2. Country Hub Pages
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
        },
      ],
    };

    const countryBody = `
      <article class="max-w-5xl mx-auto px-4 py-8">
        <nav class="text-sm text-slate-500 mb-6"><a href="/">Home</a> / <span class="text-slate-800">${country.name}</span></nav>
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

  // 3. City Hub Pages
  for (const city of Object.values(CITIES)) {
    const country = COUNTRIES[city.countryId];
    const isProvisional = city.verificationStatus === 'PROVISIONAL' || (country && country.verificationStatus === 'PROVISIONAL');

    const cityStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: country ? country.name : city.countryId, item: `${BASE_URL}/countries/${city.countryId.toLowerCase()}` },
            { '@type': 'ListItem', position: 3, name: city.name, item: `${BASE_URL}/cities/${city.id}` },
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
        <nav class="text-sm text-slate-500 mb-6"><a href="/">Home</a> / <a href="/countries/${city.countryId.toLowerCase()}">${country ? country.name : city.countryId}</a> / <span class="text-slate-800">${city.name}</span></nav>
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
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">Launch Calculators for ${city.name}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <a href="/?city=${city.id}&tab=salary-worth" class="p-4 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors">
              <span class="font-bold text-teal-900 block">Salary Worth in ${city.name}</span>
              <span class="text-xs text-teal-700 mt-1 block">Find out what your income is really worth after taxes, rent, and local expenses.</span>
            </a>
            <a href="/?city=${city.id}&tab=salary-after-tax" class="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              <span class="font-bold text-slate-900 block">Salary After Tax in ${city.name}</span>
              <span class="text-xs text-slate-600 mt-1 block">Statutory income tax and social contribution breakdown.</span>
            </a>
            <a href="/?city=${city.id}&tab=salary-needed" class="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              <span class="font-bold text-slate-900 block">Salary Needed in ${city.name}</span>
              <span class="text-xs text-slate-600 mt-1 block">Compute the required gross compensation for your target lifestyle.</span>
            </a>
            <a href="/?city=${city.id}&tab=cost-of-living" class="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              <span class="font-bold text-slate-900 block">Cost of Living Breakdown</span>
              <span class="text-xs text-slate-600 mt-1 block">Housing, groceries, transit, and household living costs.</span>
            </a>
          </div>
        </section>
      </article>
    `;

    pages.push({
      relativePath: `cities/${city.id}/index.html`,
      canonicalUrl: `${BASE_URL}/cities/${city.id}`,
      title: `${city.name} Income & Cost of Living Intelligence | LivWorthy`,
      description: `What is your income really worth in ${city.name}? Calculate statutory take-home pay, housing costs, and cost of living.`,
      robots: isProvisional ? 'noindex, follow' : 'index, follow',
      bodyContent: cityBody,
      structuredData: cityStructuredData,
      changefreq: 'weekly',
      priority: city.verificationStatus === 'VERIFIED' ? 0.8 : 0.6,
    });
  }

  // 4. Key Comparisons
  const keyComparisons = [
    { slug: 'new-york-vs-london', cityA: 'nyc', cityB: 'london', nameA: 'New York City', nameB: 'London' },
    { slug: 'new-york-vs-dubai', cityA: 'nyc', cityB: 'dubai', nameA: 'New York City', nameB: 'Dubai' },
    { slug: 'london-vs-dubai', cityA: 'london', cityB: 'dubai', nameA: 'London', nameB: 'Dubai' },
    { slug: 'toronto-vs-vancouver', cityA: 'toronto', cityB: 'vancouver', nameA: 'Toronto', nameB: 'Vancouver' },
    { slug: 'sydney-vs-melbourne', cityA: 'sydney', cityB: 'melbourne', nameA: 'Sydney', nameB: 'Melbourne' },
    { slug: 'berlin-vs-munich', cityA: 'berlin', cityB: 'munich', nameA: 'Berlin', nameB: 'Munich' },
    { slug: 'singapore-vs-dubai', cityA: 'singapore', cityB: 'dubai', nameA: 'Singapore', nameB: 'Dubai' },
  ];

  for (const comp of keyComparisons) {
    const compStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: `${comp.nameA} vs ${comp.nameB}`, item: `${BASE_URL}/compare/${comp.slug}` },
          ],
        },
      ],
    };

    const compBody = `
      <article class="max-w-5xl mx-auto px-4 py-8">
        <nav class="text-sm text-slate-500 mb-6"><a href="/">Home</a> / <span class="text-slate-800">${comp.nameA} vs ${comp.nameB}</span></nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">${comp.nameA} vs ${comp.nameB} Salary & Living Cost Comparison</h1>
        <p class="mt-2 text-slate-600">Cross-border purchasing power, income tax differential, and cost of living comparison between ${comp.nameA} and ${comp.nameB}.</p>
        <div class="mt-6">
          <a href="/?city=${comp.cityA}&tab=compare" class="px-4 py-2 bg-teal-700 text-white rounded font-medium hover:bg-teal-800">Launch Interactive Comparator</a>
        </div>
      </article>
    `;

    pages.push({
      relativePath: `compare/${comp.slug}/index.html`,
      canonicalUrl: `${BASE_URL}/compare/${comp.slug}`,
      title: `${comp.nameA} vs ${comp.nameB} Salary & Living Comparison | LivWorthy`,
      description: `Compare salary worth, income taxes, housing, and purchasing power between ${comp.nameA} and ${comp.nameB}.`,
      robots: 'index, follow',
      bodyContent: compBody,
      structuredData: compStructuredData,
      changefreq: 'monthly',
      priority: 0.7,
    });
  }

  // 5. Guides
  const guides = [
    {
      slug: '100k-salary-new-york',
      title: 'Is $100K a Good Salary in New York City? (2026 Analysis)',
      description: 'Comprehensive financial breakdown of a $100,000 salary in NYC. Take-home pay after federal, state, and city taxes, rent, and disposable savings.',
    },
  ];

  for (const g of guides) {
    const guideBody = `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav class="text-sm text-slate-500 mb-6"><a href="/">Home</a> / <span class="text-slate-800">Guides</span></nav>
        <h1 class="text-3xl font-extrabold text-[#102A2E]">${g.title}</h1>
        <p class="mt-2 text-slate-600">${g.description}</p>
        <div class="mt-6">
          <a href="/?city=nyc&salary=100000&tab=nyc-100k-guide" class="px-4 py-2 bg-teal-700 text-white rounded font-medium hover:bg-teal-800">Read Interactive Guide</a>
        </div>
      </article>
    `;

    pages.push({
      relativePath: `guides/${g.slug}/index.html`,
      canonicalUrl: `${BASE_URL}/guides/${g.slug}`,
      title: `${g.title} | LivWorthy`,
      description: g.description,
      robots: 'index, follow',
      bodyContent: guideBody,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: g.title,
        description: g.description,
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
      changefreq: 'monthly',
      priority: 0.7,
    });
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

  // 6. Generate Segmented Sitemaps & Sitemap Index
  generateSitemaps(distDir, publicDir, pages);

  // 7. Ensure robots.txt & ads.txt
  writeStaticFiles(distDir, publicDir);

  // 8. Content Gap Report
  runContentGapReport();
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
    { canonicalUrl: `${BASE_URL}/methodology`, changefreq: 'monthly', priority: 0.8 },
    { canonicalUrl: `${BASE_URL}/sources`, changefreq: 'monthly', priority: 0.8 },
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

Sitemap: ${BASE_URL}/sitemap.xml
`;

  const adsTxt = `# LivWorthy Authorized Digital Sellers
# Domain: livworthy.com
# Authorized ad exchange specifications will be populated upon ad partner onboarding.
`;

  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt);
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);

  fs.writeFileSync(path.join(distDir, 'ads.txt'), adsTxt);
  fs.writeFileSync(path.join(publicDir, 'ads.txt'), adsTxt);
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
