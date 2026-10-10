import { COUNTRIES, CITIES } from '../src/data/locations';
import { RELOCATION_CORRIDORS } from '../src/data/relocation-corridors';
import { TRANSLATIONS, SUPPORTED_LOCALES, SupportedLocale, Tier1Locale } from '../src/lib/i18n';
import { LATEST_STATUTORY_TAX_YEAR, TaxRegistry } from '../src/engines/tax/tax-registry';
import { PLATFORM_IDENTITY } from '../src/data/transparency';
import { ALL_EMPIRICAL_REPORTS } from '../src/data/reports-data';

export interface SeoPage {
  relativePath: string;
  canonicalUrl: string;
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function createRelocationPages(baseUrl: string): SeoPage[] {
  const pages: SeoPage[] = [];

  // 1. Relocation Intelligence Hub (/relocation)
  const corridorsList = Object.values(RELOCATION_CORRIDORS);

  const hubStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Relocation Intelligence', item: `${baseUrl}/relocation` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: 'Global Relocation Intelligence & Corridor Decision Framework',
        url: `${baseUrl}/relocation`,
        description:
          'Comprehensive financial decision framework for cross-border and cross-city job relocations. Compare statutory taxes, rental housing, moving transition costs, and recurring cash flow.',
        publisher: { '@id': `${baseUrl}/#organization` },
      },
    ],
  };

  const hubBody = `
    <article class="max-w-6xl mx-auto px-4 py-8">
      <nav aria-label="Breadcrumb" class="text-sm text-[#60706D] mb-6">
        <a href="/" class="hover:text-[#167D75]">Home</a> / <span class="text-[#102A2E] font-bold">Relocation Intelligence</span>
      </nav>

      <div class="mb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#DDF2EC] border border-[#167D75]/30 text-[#167D75] text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
          Decision Support System
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] tracking-tight">
          Global Relocation Intelligence
        </h1>
        <p class="mt-3 text-base sm:text-lg text-[#60706D] max-w-3xl leading-relaxed">
          Relocating for a career move is rarely as simple as multiplying your current salary by an exchange rate. LivWorthy evaluates the four pillars of cross-border mobility: statutory net tax curves, housing deposit realities, one-time transition stipends, and true recurring disposable income.
        </p>
      </div>

      <!-- Decision Pillars Grid -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="p-5 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <div class="w-8 h-8 rounded-lg bg-[#DDF2EC] text-[#167D75] flex items-center justify-center font-bold mb-3">1</div>
          <h2 class="text-base font-bold text-[#102A2E] mb-2">Statutory Net Tax Parity</h2>
          <p class="text-xs text-[#60706D] leading-relaxed">
            Marginal tax brackets, regional surcharges, and mandatory social security contributions drastically alter net cashflow even when gross compensation looks identical.
          </p>
        </div>
        <div class="p-5 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <div class="w-8 h-8 rounded-lg bg-[#DDF2EC] text-[#167D75] flex items-center justify-center font-bold mb-3">2</div>
          <h2 class="text-base font-bold text-[#102A2E] mb-2">Housing &amp; Deposit Multipliers</h2>
          <p class="text-xs text-[#60706D] leading-relaxed">
            From NYC’s 40x income qualification to Dubai’s post-dated checks and London’s 5-week tenancy deposits, lease initiation costs dictate upfront liquidity.
          </p>
        </div>
        <div class="p-5 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <div class="w-8 h-8 rounded-lg bg-[#DDF2EC] text-[#167D75] flex items-center justify-center font-bold mb-3">3</div>
          <h2 class="text-base font-bold text-[#102A2E] mb-2">Year 1 vs Year 2 Economics</h2>
          <p class="text-xs text-[#60706D] leading-relaxed">
            One-time signing bonuses and relocation stipends mask long-term recurring deficits. Always separate transition windfalls from sustainable monthly cashflow.
          </p>
        </div>
        <div class="p-5 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <div class="w-8 h-8 rounded-lg bg-[#DDF2EC] text-[#167D75] flex items-center justify-center font-bold mb-3">4</div>
          <h2 class="text-base font-bold text-[#102A2E] mb-2">Purchasing Power &amp; FX Risk</h2>
          <p class="text-xs text-[#60706D] leading-relaxed">
            Hedging hard-currency commitments (student loans, family remittances, home mortgages) against foreign earnings requires realistic volatility modeling.
          </p>
        </div>
      </section>

      <!-- Corridors Section -->
      <section class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-extrabold text-[#102A2E]">Priority Relocation Corridors (${corridorsList.length})</h2>
          <span class="text-xs text-[#60706D]">Deterministic Financial Comparisons</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${corridorsList
            .map((corridor) => {
              const cityA = CITIES[corridor.fromCityId];
              const cityB = CITIES[corridor.toCityId];
              return `
                <a href="/relocation/${corridor.slug}" class="p-6 bg-white border border-[#DCE3E0] rounded-2xl hover:border-[#167D75] hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div class="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-[#167D75]">
                      <span>${escapeHtml(cityA?.name || corridor.fromCityId)} → ${escapeHtml(cityB?.name || corridor.toCityId)}</span>
                      <span class="font-mono text-[#60706D]">${corridor.primaryCurrencies[0]} / ${corridor.primaryCurrencies[1]}</span>
                    </div>
                    <h3 class="text-lg font-extrabold text-[#102A2E] group-hover:text-[#167D75] transition-colors mb-2 leading-snug">
                      ${escapeHtml(corridor.title)}
                    </h3>
                    <p class="text-xs text-[#60706D] line-clamp-3 leading-relaxed mb-4">
                      ${escapeHtml(corridor.summary)}
                    </p>
                  </div>
                  <div class="pt-4 border-t border-[#F7F8F5] flex items-center justify-between text-xs">
                    <span class="text-[#60706D] font-medium">Relocation Decision Model</span>
                    <span class="font-bold text-[#167D75] group-hover:translate-x-1 transition-transform">Analyze Corridor →</span>
                  </div>
                </a>
              `;
            })
            .join('')}
        </div>
      </section>

      <!-- Global Decision CTAs -->
      <section class="p-8 bg-[#102A2E] text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold">Have competing offers on the table?</h2>
          <p class="text-sm text-[#DCE3E0] mt-1 max-w-xl">
            Evaluate two distinct compensation packages across different currencies and tax systems with our interactive Job Offer Comparison engine.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a href="/job-offer-comparison" class="px-5 py-2.5 rounded-lg bg-[#167D75] hover:bg-[#136862] text-white text-sm font-semibold transition-colors">
            Job Offer Comparison Guide
          </a>
          <a href="/?tab=job-offers" class="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-colors">
            Open Interactive Evaluator
          </a>
        </div>
      </section>
    </article>
  `;

  pages.push({
    relativePath: 'relocation/index.html',
    canonicalUrl: `${baseUrl}/relocation`,
    title: 'Global Relocation Intelligence: Cross-Border Salary & Living Cost Analysis | LivWorthy',
    description:
      'Evaluate international job relocations with deterministic net take-home tax models, city living-cost comparisons, moving cost checklists, and purchasing power parity across 18 major corridors.',
    robots: 'index, follow',
    bodyContent: hubBody,
    structuredData: hubStructuredData,
    changefreq: 'weekly',
    priority: 0.9,
  });

  // 2. Individual Corridor Decision Pages
  for (const corridor of corridorsList) {
    const cityA = CITIES[corridor.fromCityId];
    const cityB = CITIES[corridor.toCityId];
    const countryA = cityA ? COUNTRIES[cityA.countryId] : undefined;
    const countryB = cityB ? COUNTRIES[cityB.countryId] : undefined;

    const corridorStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
            { '@type': 'ListItem', position: 2, name: 'Relocation Intelligence', item: `${baseUrl}/relocation` },
            { '@type': 'ListItem', position: 3, name: corridor.title, item: `${baseUrl}/relocation/${corridor.slug}` },
          ],
        },
        {
          '@type': 'Article',
          headline: corridor.h1,
          url: `${baseUrl}/relocation/${corridor.slug}`,
          description: corridor.metaDescription,
          publisher: { '@id': `${baseUrl}/#organization` },
          mainEntityOfPage: `${baseUrl}/relocation/${corridor.slug}`,
        },
        ...(corridor.keyFinancialQuestions.length > 0
          ? [
              {
                '@type': 'FAQPage',
                mainEntity: corridor.keyFinancialQuestions.map((q) => ({
                  '@type': 'Question',
                  name: q.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: q.answer,
                  },
                })),
              },
            ]
          : []),
      ],
    };

    const corridorBody = `
      <article class="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" class="text-sm text-[#60706D] mb-6">
          <a href="/" class="hover:text-[#167D75]">Home</a> / 
          <a href="/relocation" class="hover:text-[#167D75]">Relocation Intelligence</a> / 
          <span class="text-[#102A2E] font-bold">${escapeHtml(cityA?.name || corridor.fromCityId)} to ${escapeHtml(cityB?.name || corridor.toCityId)}</span>
        </nav>

        <header class="mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#DDF2EC] border border-[#167D75]/30 text-[#167D75] text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
            Corridor Analysis: ${corridor.primaryCurrencies[0]} → ${corridor.primaryCurrencies[1]}
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] tracking-tight">
            ${escapeHtml(corridor.h1)}
          </h1>
          <p class="mt-3 text-base sm:text-lg text-[#60706D] leading-relaxed">
            ${escapeHtml(corridor.summary)}
          </p>
        </header>

        <!-- Key Metrics Side-by-Side Comparison -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs mb-10">
          <div class="space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-[#60706D]">Origin City</span>
            <h2 class="text-2xl font-extrabold text-[#102A2E]">${escapeHtml(cityA?.name || corridor.fromCityId)}</h2>
            <div class="text-xs space-y-1 text-[#60706D]">
              <div><strong>Country:</strong> ${escapeHtml(countryA?.name || '')} (${escapeHtml(countryA?.id || '')})</div>
              <div><strong>Currency:</strong> ${corridor.primaryCurrencies[0]}</div>
              <div><strong>COL Index:</strong> ${cityA?.colIndexBase100NYC || 'N/A'} (NYC=100)</div>
              <div><strong>Tax System:</strong> ${escapeHtml(corridor.fromTaxSystem)}</div>
            </div>
          </div>
          <div class="space-y-3 border-t md:border-t-0 md:border-l border-[#DCE3E0] pt-4 md:pt-0 md:pl-6">
            <span class="text-xs font-bold uppercase tracking-wider text-[#167D75]">Destination City</span>
            <h2 class="text-2xl font-extrabold text-[#102A2E]">${escapeHtml(cityB?.name || corridor.toCityId)}</h2>
            <div class="text-xs space-y-1 text-[#60706D]">
              <div><strong>Country:</strong> ${escapeHtml(countryB?.name || '')} (${escapeHtml(countryB?.id || '')})</div>
              <div><strong>Currency:</strong> ${corridor.primaryCurrencies[1]}</div>
              <div><strong>COL Index:</strong> ${cityB?.colIndexBase100NYC || 'N/A'} (NYC=100)</div>
              <div><strong>Tax System:</strong> ${escapeHtml(corridor.toTaxSystem)}</div>
            </div>
          </div>
        </section>

        <!-- Detailed Analysis Sections -->
        <div class="space-y-8 text-sm text-[#334D4A] leading-relaxed">
          <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
            <h2 class="text-xl font-bold text-[#102A2E] mb-3">1. Statutory Tax System Differences</h2>
            <p>${escapeHtml(corridor.taxDifferentialOverview)}</p>
          </section>

          <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
            <h2 class="text-xl font-bold text-[#102A2E] mb-3">2. Housing Market, Rents &amp; Deposit Conventions</h2>
            <p>${escapeHtml(corridor.housingOverview)}</p>
          </section>

          <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
            <h2 class="text-xl font-bold text-[#102A2E] mb-3">3. Transit, Healthcare &amp; Daily Living Overhead</h2>
            <p>${escapeHtml(corridor.transitLifestyleOverview)}</p>
          </section>

          <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
            <h2 class="text-xl font-bold text-[#102A2E] mb-3">4. Year 1 Transition Factors &amp; Moving Checklist</h2>
            <ul class="list-disc pl-5 space-y-2 text-[#334D4A]">
              ${corridor.year1TransitionFactors.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}
            </ul>
          </section>

          <!-- Key Financial Questions (FAQ) -->
          ${
            corridor.keyFinancialQuestions.length > 0
              ? `
            <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
              <h2 class="text-xl font-bold text-[#102A2E] mb-4">Frequently Asked Financial Questions</h2>
              <div class="space-y-4">
                ${corridor.keyFinancialQuestions
                  .map(
                    (q) => `
                  <div class="p-4 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0]">
                    <h3 class="text-sm font-bold text-[#102A2E] mb-1">${escapeHtml(q.question)}</h3>
                    <p class="text-xs text-[#60706D] leading-relaxed">${escapeHtml(q.answer)}</p>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </section>
          `
              : ''
          }

          <!-- Decision CTAs -->
          <section class="p-6 bg-[#DDF2EC] border border-[#167D75]/30 rounded-2xl space-y-4">
            <h2 class="text-lg font-bold text-[#102A2E]">Ready to Calculate Your Personalized Scenario?</h2>
            <p class="text-xs text-[#334D4A] leading-relaxed">
              Do not rely on rough multipliers. Enter your exact proposed gross salary, bonus structure, and household size to model take-home pay, living expenses, and real savings capacity.
            </p>
            <div class="flex flex-wrap gap-3 pt-2">
              <a href="/job-offer-comparison" class="px-4 py-2 rounded-lg bg-[#102A2E] hover:bg-[#167D75] text-white text-xs font-bold transition-colors">
                Compare Job Offers Cross-Border →
              </a>
              <a href="/compare" class="px-4 py-2 rounded-lg bg-white border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#102A2E] text-xs font-semibold transition-colors">
                Compare City Living Costs →
              </a>
              ${corridor.slug === 'new-york-to-london' ? `
              <a href="/compare/new-york-vs-london" class="px-4 py-2 rounded-lg bg-white border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#102A2E] text-xs font-semibold transition-colors">
                NYC vs London Head-to-Head →
              </a>` : ''}
              <a href="/coverage" class="px-4 py-2 rounded-lg bg-white border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#102A2E] text-xs font-semibold transition-colors">
                View Tax Coverage &amp; Rules →
              </a>
              <a href="/methodology" class="px-4 py-2 rounded-lg bg-white border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#102A2E] text-xs font-semibold transition-colors">
                Methodology &amp; Evidence →
              </a>
            </div>
          </section>

          <!-- Primary Evidence Citations -->
          <footer class="pt-6 border-t border-[#DCE3E0] text-xs text-[#60706D]">
            <h3 class="font-bold text-[#102A2E] mb-2 uppercase tracking-wider text-[11px]">Primary Statutory &amp; Statistical Sources:</h3>
            <ul class="space-y-1">
              ${corridor.sources
                .map(
                  (s) => `
                <li>
                  <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="text-[#167D75] hover:underline">
                    ${escapeHtml(s.name)}
                  </a>
                  <span class="text-[#60706D]"> — ${escapeHtml(s.tier)}</span>
                </li>
              `
                )
                .join('')}
            </ul>
          </footer>
        </div>
      </article>
    `;

    pages.push({
      relativePath: `relocation/${corridor.slug}/index.html`,
      canonicalUrl: `${baseUrl}/relocation/${corridor.slug}`,
      title: `${corridor.title} | LivWorthy`,
      description: corridor.metaDescription,
      robots: 'index, follow',
      bodyContent: corridorBody,
      structuredData: corridorStructuredData,
      changefreq: 'weekly',
      priority: 0.85,
    });
  }

  return pages;
}

export function createJobOfferAuthorityPage(baseUrl: string): SeoPage {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Job Offer Comparison Guide', item: `${baseUrl}/job-offer-comparison` },
        ],
      },
      {
        '@type': 'Article',
        headline: 'How to Compare Job Offers Across Cities and Countries',
        url: `${baseUrl}/job-offer-comparison`,
        description:
          'Comprehensive financial framework for comparing competing job offers across cities: base salary, cash bonuses, relocation stipends, net tax impacts, and true living costs.',
        publisher: { '@id': `${baseUrl}/#organization` },
        mainEntityOfPage: `${baseUrl}/job-offer-comparison`,
      },
    ],
  };

  const bodyContent = `
    <article class="max-w-4xl mx-auto px-4 py-8">
      <nav aria-label="Breadcrumb" class="text-sm text-[#60706D] mb-6">
        <a href="/" class="hover:text-[#167D75]">Home</a> / <span class="text-[#102A2E] font-bold">Job Offer Comparison Guide</span>
      </nav>

      <header class="mb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#DDF2EC] border border-[#167D75]/30 text-[#167D75] text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
          Total Compensation Intelligence
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] tracking-tight">
          How to Compare Job Offers Across Cities and Countries
        </h1>
        <p class="mt-3 text-base sm:text-lg text-[#60706D] leading-relaxed">
          Comparing job offers across borders requires looking past headline salary figures. A higher pre-tax offer can result in lower savings when progressive taxes, local rents, and one-time relocation windfalls are properly accounted for.
        </p>
      </header>

      <!-- Deep Link Island CTA Card -->
      <section class="p-6 bg-[#102A2E] text-white rounded-2xl mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <span class="text-xs uppercase font-bold text-[#167D75] tracking-wider">Interactive Decision Support</span>
          <h2 class="text-xl font-bold mt-1 text-white">Compare Two Real Offers Side-by-Side</h2>
          <p class="text-xs text-[#DCE3E0] mt-1 max-w-md">
            Input base salary, bonus, housing stipends, and relocation grants across different currencies to calculate net cashflow and Year 2 recurring parity.
          </p>
        </div>
        <a
          href="/?tab=job-offers"
          class="shrink-0 px-5 py-3 rounded-xl bg-[#167D75] hover:bg-[#136862] text-white text-sm font-bold shadow-xs transition-colors flex items-center space-x-2"
        >
          <span>Launch Job Offer Calculator →</span>
        </a>
      </section>

      <!-- Core Financial Content -->
      <div class="space-y-8 text-sm text-[#334D4A] leading-relaxed">
        <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">1. Base Salary vs. Total Compensation</h2>
          <p>
            Headline compensation often bundles base contractual pay, annual performance bonuses, one-time signing incentives, and speculative equity grants. When assessing cash security, base annual pay is the only component guaranteed to arrive in every paycheck. Speculative equity should never be treated as guaranteed cash when deciding whether an offer covers your rent and living expenses.
          </p>
        </section>

        <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">2. Performance Bonuses &amp; Tax Withholding Mechanics</h2>
          <p>
            Discretionary cash bonuses are subject to company performance, manager discretion, and supplemental payroll tax withholdings. In the US, bonuses are withheld at a statutory 22% flat federal rate (or 37% above $1M), plus state and local taxes. In the UK and Germany, bonuses push marginal compensation into top tax brackets immediately upon payment month.
          </p>
        </section>

        <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">3. Housing Allowances vs. Gross Salary</h2>
          <p>
            In markets like Dubai, Singapore, and Hong Kong, employers sometimes structure compensation with a designated "housing allowance." In some jurisdictions, this allowance is exempt from social contributions or subject to specific tax treatment; in others, it is simply taxed as standard ordinary income. Clarify the statutory classification of housing allowances before signing.
          </p>
        </section>

        <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">4. Relocation Stipends &amp; The Year 1 Cliff</h2>
          <p>
            A common mistake in career moves is assuming that Year 1 disposable income reflects long-term savings. Relocation stipends, flight reimbursements, and signing bonuses provide one-time liquidity to absorb moving costs, lease initiation deposits, and furniture purchases. In Year 2, those one-time benefits vanish, leaving only recurring salary and recurring living costs. Always model Year 2+ normal economics separately.
          </p>
        </section>

        <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">5. Statutory Taxes Across Jurisdictions</h2>
          <p>
            Taxes vary drastically between international commercial centers:
          </p>
          <ul class="list-disc pl-5 mt-2 space-y-1.5 text-xs text-[#60706D]">
            <li><strong>New York City:</strong> Federal (10-37%) + NY State (4-10.9%) + NYC City Resident Tax (3.078-3.876%) + FICA/Medicare.</li>
            <li><strong>London:</strong> UK HMRC PAYE (20%, 40%, 45%) + Class 1 National Insurance, with personal allowance taper above £100K creating an effective 60% marginal band.</li>
            <li><strong>Dubai:</strong> 0% Personal Income Tax, 0% Employee Social Insurance for expats.</li>
            <li><strong>Singapore:</strong> Progressive tax from 0% to 22-24% maximum, with low effective rates on middle incomes.</li>
            <li><strong>Berlin:</strong> Progressive Einkommensteuer up to 42-45% plus ~20% employee social charges (health, pension, nursing, unemployment).</li>
          </ul>
        </section>

        <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs">
          <h2 class="text-xl font-bold text-[#102A2E] mb-3">6. Currency Volatility &amp; Home Commitments</h2>
          <p>
            If you maintain ongoing financial commitments in your home country (student loan repayments, family support, investment mortgages), currency fluctuations directly affect your net disposable income. A 10% strengthening of your home currency against your earnings currency can turn a seemingly generous offer into a tight budget.
          </p>
        </section>

        <!-- Final CTA Box -->
        <section class="p-8 bg-[#F7F8F5] border border-[#DCE3E0] rounded-2xl text-center space-y-4">
          <h2 class="text-2xl font-extrabold text-[#102A2E]">Model Your Actual Offer Scenario</h2>
          <p class="text-sm text-[#60706D] max-w-xl mx-auto">
            Use LivWorthy’s verified statutory engines to determine your exact net take-home, living expenses, and realistic monthly savings.
          </p>
          <div class="flex flex-wrap justify-center gap-3 pt-2">
            <a href="/?tab=job-offers" class="px-5 py-2.5 rounded-lg bg-[#102A2E] hover:bg-[#167D75] text-white text-sm font-bold transition-colors">
              Open Job Offer Comparison Tool
            </a>
            <a href="/relocation" class="px-5 py-2.5 rounded-lg bg-white border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#102A2E] text-sm font-semibold transition-colors">
              Explore Relocation Corridors
            </a>
            <a href="/coverage" class="px-5 py-2.5 rounded-lg bg-white border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#102A2E] text-sm font-semibold transition-colors">
              Check Verified Tax Coverage
            </a>
          </div>
        </section>
      </div>
    </article>
  `;

  return {
    relativePath: 'job-offer-comparison/index.html',
    canonicalUrl: `${baseUrl}/job-offer-comparison`,
    title: 'Job Offer Comparison Guide: Total Compensation, Taxes & Real Cashflow | LivWorthy',
    description:
      'How to evaluate cross-border and cross-city job offers: separating base salary, cash bonuses, relocation stipends, tax impacts, and true living costs.',
    robots: 'index, follow',
    bodyContent,
    structuredData,
    changefreq: 'weekly',
    priority: 0.9,
  };
}

export function createCoveragePage(baseUrl: string): SeoPage {
  const allCountries = Object.values(COUNTRIES);
  const allCities = Object.values(CITIES);

  const verifiedCountries = allCountries.filter((c) => c.verificationStatus === 'VERIFIED');
  const limitedCountries = allCountries.filter((c) => c.verificationStatus === 'LIMITED');
  const unsupportedCountries = allCountries.filter((c) => c.verificationStatus === 'UNSUPPORTED' || c.verificationStatus === 'PROVISIONAL');

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Market & Tax Coverage', item: `${baseUrl}/coverage` },
        ],
      },
      {
        '@type': 'Dataset',
        name: 'LivWorthy Global Market & Tax Engine Coverage Registry',
        url: `${baseUrl}/coverage`,
        description:
          'Official transparency registry tracking verified statutory personal income tax adapters, limited schedule coverage, and cost-of-living metropolitan benchmarks across 39 commercial markets.',
        publisher: { '@id': `${baseUrl}/#organization` },
      },
    ],
  };

  const bodyContent = `
    <article class="max-w-5xl mx-auto px-4 py-8">
      <nav aria-label="Breadcrumb" class="text-sm text-[#60706D] mb-6">
        <a href="/" class="hover:text-[#167D75]">Home</a> / <span class="text-[#102A2E] font-bold">Coverage Transparency</span>
      </nav>

      <header class="mb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#DDF2EC] border border-[#167D75]/30 text-[#167D75] text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
          Platform Governance
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] tracking-tight">
          Global Market &amp; Tax Coverage Transparency
        </h1>
        <p class="mt-3 text-base sm:text-lg text-[#60706D] leading-relaxed max-w-3xl">
          LivWorthy is committed to absolute data honesty. Rather than fabricating tax calculations or synthesizing estimated rates, we explicitly classify the verification status of every supported jurisdiction.
        </p>
      </header>

      <!-- Key Statistics KPI Bar -->
      <section class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs mb-10">
        <div class="p-3">
          <div class="text-2xl sm:text-3xl font-extrabold text-[#102A2E]">${allCountries.length}</div>
          <div class="text-xs font-semibold text-[#60706D] uppercase tracking-wider mt-1">Tracked Markets</div>
        </div>
        <div class="p-3">
          <div class="text-2xl sm:text-3xl font-extrabold text-[#167D75]">${allCities.length}</div>
          <div class="text-xs font-semibold text-[#60706D] uppercase tracking-wider mt-1">Registered Cities</div>
        </div>
        <div class="p-3">
          <div class="text-2xl sm:text-3xl font-extrabold text-[#102A2E]">${verifiedCountries.length}</div>
          <div class="text-xs font-semibold text-[#60706D] uppercase tracking-wider mt-1">Verified Tax Adapters</div>
        </div>
        <div class="p-3">
          <div class="text-2xl sm:text-3xl font-extrabold text-[#167D75]">${LATEST_STATUTORY_TAX_YEAR}</div>
          <div class="text-xs font-semibold text-[#60706D] uppercase tracking-wider mt-1">Verified Tax Baseline</div>
        </div>
      </section>

      <!-- 2026-2027 Tax Year Policy Notice -->
      <section class="p-6 bg-[#DDF2EC] border border-[#167D75]/40 rounded-2xl mb-10 space-y-2">
        <h2 class="text-base font-bold text-[#102A2E] flex items-center space-x-2">
          <span>2026–2027 Tax Year Policy</span>
        </h2>
        <p class="text-xs text-[#334D4A] leading-relaxed">
          The LivWorthy tax calculation engine is <strong>2026 verified</strong>. Official statutory rules for Tax Year 2026 are fully implemented for supported jurisdictions. For Tax Year 2027, the platform is architecturally ready; however, until official 2027 statutory tables are published and verified from government revenue departments, requests for 2027 return a safe <code>TAX_CALCULATION_UNAVAILABLE</code> response. LivWorthy never silently reuses 2026 tax tables and mislabels them as 2027.
        </p>
      </section>

      <!-- Verified Adapters Section -->
      <section class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-[#102A2E]">Verified Tax Adapters (${verifiedCountries.length})</h2>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#DDF2EC] text-[#167D75] font-bold">Tier 1 Statutory Verified</span>
        </div>
        <p class="text-xs text-[#60706D] mb-4 leading-relaxed">
          These jurisdictions execute full deterministic statutory calculation models based on published tax code rules, national tax tables, and mandatory social security schedules.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          ${verifiedCountries
            .map(
              (c) => `
            <div class="p-4 bg-white border border-[#DCE3E0] rounded-xl shadow-xs">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-sm text-[#102A2E]">${escapeHtml(c.name)}</span>
                <span class="font-mono text-xs text-[#167D75] font-bold">${c.defaultCurrency}</span>
              </div>
              <div class="text-[11px] text-[#60706D]">Status: <span class="text-[#167D75] font-bold">VERIFIED (${LATEST_STATUTORY_TAX_YEAR})</span></div>
              ${c.notes ? `<p class="text-[11px] text-[#60706D] mt-1.5 leading-snug">${escapeHtml(c.notes)}</p>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <!-- Limited Tax Adapters Section -->
      <section class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-[#102A2E]">Limited Tax Markets (${limitedCountries.length})</h2>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">Statutory Schedule Available</span>
        </div>
        <p class="text-xs text-[#60706D] mb-4 leading-relaxed">
          National statutory tax brackets and allowances are implemented; localized regional surcharges (such as Swiss cantonal/municipal variations or Spanish autonomous community nuances) remain under verification.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          ${limitedCountries
            .map(
              (c) => `
            <div class="p-4 bg-white border border-[#DCE3E0] rounded-xl shadow-xs">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-sm text-[#102A2E]">${escapeHtml(c.name)}</span>
                <span class="font-mono text-xs text-[#60706D]">${c.defaultCurrency}</span>
              </div>
              <div class="text-[11px] text-amber-700 font-medium">Status: LIMITED COVERAGE</div>
              ${c.notes ? `<p class="text-[11px] text-[#60706D] mt-1.5 leading-snug">${escapeHtml(c.notes)}</p>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <!-- Unsupported Tax Markets (Cost of Living Research Active) -->
      <section class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-[#102A2E]">Research &amp; Cost of Living Markets (${unsupportedCountries.length})</h2>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">COL Active / Tax Pending</span>
        </div>
        <p class="text-xs text-[#60706D] mb-4 leading-relaxed">
          These international commercial markets are monitored for fair-market rent, grocery prices, and metropolitan living costs. Dedicated statutory tax calculation engines are undergoing rigorous verification before release.
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          ${unsupportedCountries
            .map(
              (c) => `
            <div class="p-3 bg-white border border-[#DCE3E0] rounded-lg text-xs">
              <div class="font-bold text-[#102A2E]">${escapeHtml(c.name)}</div>
              <div class="text-[11px] text-[#60706D] font-mono">${c.defaultCurrency}</div>
              <div class="text-[10px] text-slate-500 mt-1">Tax: Research Phase</div>
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <!-- Dataset Limitations & Source References -->
      <section class="p-6 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs space-y-3">
        <h2 class="text-lg font-bold text-[#102A2E]">Dataset Limitations &amp; Scope Notes</h2>
        <ul class="list-disc pl-5 text-xs text-[#60706D] space-y-1.5 leading-relaxed">
          <li><strong>Baseline Filing Assumptions:</strong> Unless customized via the parameter drawers, tax models calculate statutory withholdings for single filers with standard deduction/allowance schedules.</li>
          <li><strong>Zero Synthetic Data:</strong> Cost-of-living line items are derived from statistical agency survey cycles (BLS CEX/CPI, Eurostat, ONS, HUD Fair Market Rent). We do not synthesize artificial values.</li>
          <li><strong>Feedback &amp; Corrections:</strong> If you observe any statutory rule changes or updated government schedules, submit a correction via our public <a href="/corrections" class="text-[#167D75] hover:underline font-bold">Corrections Registry</a>.</li>
        </ul>
      </section>

      <div class="mt-8 pt-6 border-t border-[#DCE3E0] flex flex-wrap gap-4 text-xs font-semibold text-[#167D75]">
        <a href="/methodology" class="hover:underline">Calculation Methodology →</a>
        <a href="/sources" class="hover:underline">Verified Sources Registry →</a>
        <a href="/relocation" class="hover:underline">Relocation Intelligence →</a>
        <a href="/job-offer-comparison" class="hover:underline">Job Offer Evaluator →</a>
      </div>
    </article>
  `;

  return {
    relativePath: 'coverage/index.html',
    canonicalUrl: `${baseUrl}/coverage`,
    title: 'Global Market & Tax Coverage Transparency | LivWorthy',
    description:
      'Complete transparency disclosure of LivWorthy calculations across 39 commercial markets and 65 cities: verified tax adapters, limited markets, and 2026/2027 tax-year policy.',
    robots: 'index, follow',
    bodyContent,
    structuredData,
    changefreq: 'weekly',
    priority: 0.9,
  };
}

const LOCALE_SEO_METADATA: Record<Tier1Locale, {
  title: string;
  description: string;
  h1: string;
  directLead: string;
  directPassage: string;
}> = {
  en: {
    title: "Global Living Intelligence & Net Salary Calculator | LivWorthy",
    description: "Evaluate what your salary is truly worth across 65 world cities after statutory taxes, fair market rent, and living essentials.",
    h1: "What is your salary really worth?",
    directLead: "Direct Answer",
    directPassage: "A salary is only as valuable as the disposable cash left after mandatory taxes and fair market housing. In high-cost metros like NYC or London, statutory taxes and rent consume up to 74% of gross income, whereas zero-income-tax hubs like Dubai retain significantly higher discretionary savings.",
  },
  es: {
    title: "Calculadora de Salario Neto y Costo de Vida Mundial | LivWorthy",
    description: "Descubre cuánto rinde tu sueldo en 65 ciudades del mundo tras impuestos oficiales, alquiler HUD y gastos reales.",
    h1: "¿Cuánto vale realmente tu salario?",
    directLead: "Respuesta Directa",
    directPassage: "El valor real de un salario no se mide en bruto, sino en el dinero disponible tras impuestos y alquiler. En capitales de alta carga fiscal, las retenciones y la vivienda absorben hasta el 70% del sueldo, mientras que centros sin impuesto sobre la renta retienen un ahorro muy superior.",
  },
  fr: {
    title: "Calculateur de Salaire Net et Coût de la Vie Mondial | LivWorthy",
    description: "Évaluez la valeur réelle de votre salaire net après impôts, loyer et dépenses essentielles dans 65 métropoles mondiales.",
    h1: "Que vaut réellement votre salaire ?",
    directLead: "Réponse Directe",
    directPassage: "La valeur d’une rémunération dépend de ce qu’il reste après l’impôt sur le revenu et le loyer médian. Dans les métropoles comme Paris ou Londres, les cotisations et le logement absorbent l’essentiel du revenu brut, contrastant avec les hubs à fiscalité allégée.",
  },
  ar: {
    title: "حاسبة الراتب الصافي وتكلفة المعيشة الحقيقية عالمياً | ليف ورثي",
    description: "احسب القيمة الحقيقية لراتبك بعد خصم الضرائب والإيجار والمصاريف في 65 مدينة عالمية.",
    h1: "ما هي القيمة الفعلية لراتبك بعد الضرائب والمعيشة؟",
    directLead: "إجابة مباشرة",
    directPassage: "لا تُقاس قيمة الراتب بالرقم الإجمالي، بل بما يتبقى بعد خصم الضرائب الإلزامية وإيجار السكن العادل. تتيح مدن الخليج مثل دبي والرياض الاحتفاظ بكامل الدخل تقريباً بفضل الإعفاء الضريبي، بينما تستنزف الضرائب في نيويورك ولندن ما يزيد عن 30% من الراتب.",
  },
  de: {
    title: "Netto-Gehaltsrechner & Weltweite Lebenshaltungskosten | LivWorthy",
    description: "Berechnen Sie, was Ihr Gehalt nach Steuern, Miete und Lebenshaltungskosten in 65 internationalen Städten wirklich wert ist.",
    h1: "Was ist Ihr Gehalt wirklich wert?",
    directLead: "Direkte Antwort",
    directPassage: "Der reale Wert eines Gehalts bemisst sich an der verbleibenden Kaufkraft nach Steuern und Miete. Während in Deutschland Spitzensteuersatz und Sozialabgaben die Sparquote dämpfen, ermöglichen steuerfreie Standorte wie Dubai eine ungebundene Sparquote von über 50%.",
  },
  pt: {
    title: "Calculadora de Salário Líquido e Custo de Vida Global | LivWorthy",
    description: "Calcule o poder de compra real do seu salário após impostos, aluguel e despesas essenciais em 65 cidades do mundo.",
    h1: "Quanto realmente vale o seu salário?",
    directLead: "Resposta Direta",
    directPassage: "O poder de compra de um salário é determinado pelo saldo disponível após descontos obrigatórios e moradia. Em metrópoles de alta tributação, os impostos consomem parcela substancial do rendimento, diferentemente de centros com isenção fiscal.",
  },
  hi: {
    title: "नेट सैलरी कैलकुलेटर और दुनिया भर में रहने का खर्च | लिववर्दी",
    description: "जानिए आधिकारिक टैक्स, किराया और आवश्यक खर्चों के बाद 65 वैश्विक शहरों में आपकी सैलरी की वास्तविक बचत क्षमता क्या है।",
    h1: "आपके वेतन का वास्तविक मूल्य क्या है?",
    directLead: "सीधा उत्तर",
    directPassage: "सैलरी का वास्तविक महत्व केवल ग्रॉस पैकेज में नहीं, बल्कि टैक्स और मकान किराए के बाद बचने वाले इन-हैंड कैश में होता है। दुबई जैसे शहरों में 0% टैक्स के कारण भारतीय प्रोफेशनल्स अपनी आय का 50% से अधिक हिस्सा बचा पाते हैं।",
  },
  ur: {
    title: "خالص تنخواہ کیلکولیٹر اور دنیا بھر میں رہائشی اخراجات | لِو ورتھی",
    description: "جانئے ٹیکس کٹوتیوں، کرایہ اور لازمی اخراجات کے بعد 65 عالمی شہروں میں آپ کی تنخواہ کی حقیقی بچت کتنی ہے۔",
    h1: "آپ کی تنخواہ کی اصل قدر کیا ہے؟",
    directLead: "براہ راست جواب",
    directPassage: "کسی بھی تنخواہ کی اصل قدر اس رقم سے ناپی جاتی ہے جو لازمی انکم ٹیکس اور رہائشی کرایہ ادا کرنے کے بعد ہاتھ میں بچتی ہے۔ لندن اور نیویارک کے مقابلے میں خلیجی ریاستیں بغیر انکم ٹیکس کے نمایاں طور پر زیادہ بچت فراہم کرتی ہیں۔",
  },
  zh: {
    title: "全球税后实际工资与生活成本计算器 | LivWorthy",
    description: "计算扣除法定税费、公允租金和必要生活开支后，全球65座核心城市的真实可支配薪资与储蓄。",
    h1: "您的薪资真正价值是多少？",
    directLead: "核心摘要",
    directPassage: "薪资的真实购买力取决于扣除所得税、社保以及中位数房租后的实际结余。在高税率大都市，税费与住房占据了总薪酬的绝大部分，而无个人所得税的国际枢纽则能保留极高的储蓄比例。",
  },
  ja: {
    title: "世界の税引後手取り給与・生活費シミュレーター | LivWorthy",
    description: "法定税金・適正家賃・生活費を差し引いた後、世界65都市での実質的な手取り給与と貯蓄余力をシミュレーション。",
    h1: "あなたの給与の真の価値はいくらですか？",
    directLead: "要約・回答",
    directPassage: "給与の真の価値は、法定税金・社会保険料および住居費を控除した後に残る可処分所得によって決まります。先進国の大都市では税金と家賃が収入の大半を占める一方、所得税ゼロの都市では高い貯蓄率が維持されます。",
  },
};

export function createLocalizedPages(baseUrl: string, homeStructuredData: any): SeoPage[] {
  const pages: SeoPage[] = [];

  const locales: Tier1Locale[] = ['en', 'es', 'fr', 'ar', 'de', 'pt', 'hi', 'ur', 'zh', 'ja'];

  for (const loc of locales) {
    const t = TRANSLATIONS[loc];
    const cfg = SUPPORTED_LOCALES[loc];
    const meta = LOCALE_SEO_METADATA[loc];
    const isRtl = cfg.dir === 'rtl';

    const localizedStructuredData = {
      ...homeStructuredData,
      '@graph': [
        ...homeStructuredData['@graph'].map((item: any) => {
          if (item['@type'] === 'WebSite') {
            return {
              ...item,
              url: `${baseUrl}/${loc}`,
              name: meta.title,
              description: meta.description,
            };
          }
          return item;
        }),
      ],
    };

    const bodyContent = `
      <div class="min-h-screen flex flex-col bg-[#F7F8F5]" ${isRtl ? 'dir="rtl"' : ''}>
        <header id="livworthy-header" data-testid="livworth-header" class="bg-[#FFFFFF] border-b border-[#DCE3E0] sticky top-0 z-40">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
              <a href="/${loc}" id="header-logo-link" class="flex items-center space-x-3 group py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded" aria-label="LivWorthy — Home" title="LivWorthy">
                <picture>
                  <source type="image/webp" srcset="/logo-300.webp 1x, /logo-600.webp 2x" />
                  <img src="/logo-300.png" srcset="/logo-300.png 1x, /logo-600.png 2x" alt="LivWorthy" width="108" height="36" class="h-9 w-auto object-contain" loading="eager" decoding="async" />
                </picture>
                <span class="text-xs font-semibold uppercase tracking-wider text-[#167D75] border-l border-[#DCE3E0] pl-3 hidden sm:inline">${escapeHtml(t.livingIntelligence)}</span>
              </a>
              <nav aria-label="Site navigation" class="flex items-center space-x-2 sm:space-x-3">
                <a id="nav-how-it-works" href="/methodology" class="inline-flex items-center text-xs sm:text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-2.5 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors">
                  <span>${escapeHtml(t.navHowItWorks)}</span>
                </a>
                <a id="nav-sources" href="/sources" class="inline-flex items-center text-xs sm:text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-2.5 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors">
                  <span>${escapeHtml(t.navSources)}</span>
                </a>
                <a id="nav-coverage" href="/coverage" class="hidden sm:inline-flex items-center text-xs sm:text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-2.5 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors">
                  <span>${escapeHtml(t.navCoverage)}</span>
                </a>
                <a id="nav-relocation" href="/relocation" class="hidden sm:inline-flex items-center text-xs sm:text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-2.5 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors">
                  <span>${escapeHtml(t.navRelocation)}</span>
                </a>
              </nav>
            </div>
            <nav aria-label="Calculator tabs" class="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-[#F7F8F5] bg-white">
              <a href="/${loc}" id="tab-salary-worth" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap bg-[#102A2E] text-white shadow-sm">
                <span>${escapeHtml(t.tabSalaryWorth)}</span>
              </a>
              <a href="/${loc}/salary-needed" id="tab-salary-needed" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
                <span>${escapeHtml(t.tabSalaryNeeded)}</span>
              </a>
              <a href="/${loc}/salary-after-tax" id="tab-salary-after-tax" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
                <span>${escapeHtml(t.tabSalaryAfterTax)}</span>
              </a>
              <a href="/${loc}/cost-of-living" id="tab-cost-of-living" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
                <span>${escapeHtml(t.tabCostOfLiving)}</span>
              </a>
              <a href="/${loc}/compare" id="tab-compare" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
                <span>${escapeHtml(t.tabCompare)}</span>
              </a>
              <a href="/${loc}/job-offers" id="tab-job-offers" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]">
                <span>${escapeHtml(t.tabJobOffers)}</span>
              </a>
            </nav>
          </div>
        </header>

        <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div id="salary-worth-view" class="space-y-8">
            <!-- AEO Answer-First Direct Answer Block -->
            <div class="direct-answer bg-[#E8F3F1] border border-[#BCE1DC] rounded-2xl p-5 sm:p-6 shadow-xs">
              <p class="text-xs sm:text-sm text-[#102A2E] leading-relaxed">
                <strong class="font-bold text-[#167D75]">${escapeHtml(meta.directLead)}:</strong> ${escapeHtml(meta.directPassage)}
              </p>
            </div>

            <div class="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs relative">
              <div class="max-w-2xl">
                <span class="text-xs font-bold tracking-wider text-[#167D75]">
                  ${escapeHtml(t.livingIntelligence)}
                </span>
                <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] mt-1 tracking-tight">
                  ${escapeHtml(meta.h1)}
                </h1>
                <p class="text-sm sm:text-base text-[#60706D] mt-2 leading-relaxed">
                  ${escapeHtml(t.heroSubheadline)}
                </p>
                <p class="text-xs text-[#167D75] mt-1 font-medium">
                  ${escapeHtml(t.heroSupporting)}
                </p>
              </div>

              <div class="mt-5 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                <span class="text-xs font-semibold text-[#60706D] whitespace-nowrap">
                  ${escapeHtml(t.popularScenarios)}
                </span>
                <div class="flex items-center space-x-1.5">
                  <span class="text-xs px-2.5 py-1 rounded-full border bg-[#102A2E] text-white border-[#102A2E]">NYC $100k Single</span>
                  <span class="text-xs px-2.5 py-1 rounded-full border bg-[#F7F8F5] text-[#102A2E] border-[#DCE3E0]">London £60k Single</span>
                  <span class="text-xs px-2.5 py-1 rounded-full border bg-[#F7F8F5] text-[#102A2E] border-[#DCE3E0]">Dubai 300k AED</span>
                  <span class="text-xs px-2.5 py-1 rounded-full border bg-[#F7F8F5] text-[#102A2E] border-[#DCE3E0]">Toronto $90k Single</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 space-y-6">
                <div id="result-summary-card" class="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs">
                  <div class="flex items-center justify-between border-b border-[#F7F8F5] pb-4">
                    <div>
                      <h2 class="text-lg font-bold text-[#102A2E]">${escapeHtml(t.takeHomeSummaryTitle)}</h2>
                      <span class="text-xs text-[#167D75] font-semibold">${escapeHtml(t.dataFreshnessBadge)}</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div class="p-4 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0]">
                      <span class="text-xs text-[#60706D] font-medium">${escapeHtml(t.monthlyTakeHomeLabel)}</span>
                      <div class="text-2xl font-extrabold text-[#102A2E] mt-1">$5,907</div>
                      <span class="text-[11px] text-[#60706D]">${escapeHtml(t.annualTakeHomeLabel)}: $70,879</span>
                    </div>
                    <div class="p-4 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0]">
                      <span class="text-xs text-[#60706D] font-medium">${escapeHtml(t.monthlyLivingCostsLabel)}</span>
                      <div class="text-2xl font-extrabold text-[#102A2E] mt-1">$4,600</div>
                      <span class="text-[11px] text-[#60706D]">${escapeHtml(t.householdSingle)}</span>
                    </div>
                    <div class="p-4 bg-[#DDF2EC] rounded-xl border border-[#167D75]/30">
                      <span class="text-xs text-[#167D75] font-bold">${escapeHtml(t.monthlyDisposableLabel)}</span>
                      <div class="text-2xl font-extrabold text-[#102A2E] mt-1">$1,307</div>
                      <span class="text-[11px] text-[#167D75] font-semibold">${escapeHtml(t.savingsRateLabel)}: 22.1%</span>
                    </div>
                    <div class="p-4 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0]">
                      <span class="text-xs text-[#60706D] font-medium">${escapeHtml(t.monthlySavingsCapacityLabel)}</span>
                      <div class="text-2xl font-extrabold text-[#102A2E] mt-1">$1,307</div>
                      <span class="text-[11px] text-[#60706D]">New York City Benchmark</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div class="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs space-y-4">
                  <h3 class="font-bold text-base text-[#102A2E]">${escapeHtml(t.livingIntelligence)}</h3>
                  <p class="text-xs text-[#60706D] leading-relaxed">${escapeHtml(t.coverageNotice)}</p>
                  <p class="text-xs text-[#60706D] leading-relaxed">${escapeHtml(t.financialDisclaimer)}</p>
                  <div class="pt-2 border-t border-[#DCE3E0] flex flex-col space-y-2 text-xs font-semibold text-[#167D75]">
                    <a href="/methodology" class="hover:underline">${escapeHtml(t.navHowItWorks)} →</a>
                    <a href="/sources" class="hover:underline">${escapeHtml(t.navSources)} →</a>
                    <a href="/coverage" class="hover:underline">${escapeHtml(t.navCoverage)} →</a>
                    <a href="/relocation" class="hover:underline">${escapeHtml(t.navRelocation)} →</a>
                    <a href="/job-offer-comparison" class="hover:underline">${escapeHtml(t.navJobOfferComparison)} →</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transparency & Methodology Foundation -->
            <section class="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs space-y-4">
              <h2 class="text-lg sm:text-xl font-bold text-[#102A2E]">${escapeHtml(t.livingIntelligence)} — ${escapeHtml(t.dataFreshnessBadge)}</h2>
              <p class="text-xs sm:text-sm text-[#60706D] leading-relaxed">
                ${escapeHtml(t.financialDisclaimer)} ${escapeHtml(t.heroSubheadline)} ${escapeHtml(t.heroSupporting)}
              </p>
              <div class="pt-4 border-t border-[#DCE3E0] flex flex-wrap gap-4 text-xs font-semibold text-[#167D75]">
                <a href="/methodology" class="hover:underline">${escapeHtml(t.navHowItWorks)} →</a>
                <a href="/sources" class="hover:underline">${escapeHtml(t.navSources)} →</a>
                <a href="/coverage" class="hover:underline">${escapeHtml(t.navCoverage)} →</a>
              </div>
            </section>
          </div>
        </main>
      </div>
    `;

    pages.push({
      relativePath: `${loc}/index.html`,
      canonicalUrl: `${baseUrl}/${loc}`,
      title: meta.title,
      description: meta.description,
      robots: 'index, follow',
      bodyContent,
      structuredData: localizedStructuredData,
      changefreq: 'daily',
      priority: loc === 'en' ? 0.95 : 0.9,
      lang: loc,
      dir: cfg.dir,
    });
  }

  return pages;
}

export function createEmpiricalReportsPages(baseUrl: string): {
  pages: SeoPage[];
  downloads: { relativePath: string; content: string }[];
} {
  const pages: SeoPage[] = [];
  const downloads: { relativePath: string; content: string }[] = [];

  // 1. Research Hub (/reports)
  const hubStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'LivWorthy Empirical Research & Global Financial Reports',
    url: `${baseUrl}/reports`,
    description: 'Empirical studies on international purchasing power, statutory tax retention, and cost of living benchmarks.',
  };

  const hubBody = `
    <div class="min-h-screen bg-[#F7F8F5]">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav aria-label="Breadcrumb" class="text-xs text-[#60706D] mb-6">
          <a href="/" class="hover:text-[#167D75]">Home</a> /
          <span class="text-[#102A2E] font-semibold">Research Reports</span>
        </nav>

        <header class="mb-10">
          <div class="inline-flex items-center space-x-2 px-3 py-1 bg-[#E8F3F1] border border-[#BCE1DC] rounded-full text-xs font-semibold text-[#167D75] mb-3">
            <span>Quantitative Research Institute</span>
            <span>•</span>
            <span>Zero-AI Deterministic Modeling</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] tracking-tight">Empirical Research & Benchmark Indices</h1>
          <p class="mt-3 text-base text-[#60706D] max-w-3xl leading-relaxed">
            Transparent, citation-ready research datasets analyzing cross-border compensation, statutory income retention, and urban purchasing power across 39 international markets.
          </p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${ALL_EMPIRICAL_REPORTS.map(
            (r: any) => `
            <article class="bg-[#FFFFFF] border border-[#DCE3E0] rounded-2xl p-6 shadow-xs hover:border-[#167D75] transition-colors flex flex-col justify-between">
              <div>
                <span class="text-[11px] font-bold text-[#167D75] tracking-wide uppercase">Empirical Benchmark Index</span>
                <h2 class="text-xl font-bold text-[#102A2E] mt-1 mb-2 hover:text-[#167D75]">
                  <a href="/${r.slug}">${escapeHtml(r.shortTitle)}</a>
                </h2>
                <p class="text-xs text-[#60706D] leading-relaxed mb-4">${escapeHtml(r.subtitle)}</p>
                <div class="bg-[#F7F8F5] rounded-xl p-3 border border-[#E8ECE9] text-[11px] text-[#334D4A] space-y-1">
                  <div class="font-semibold text-[#102A2E]">Key Insight:</div>
                  <p class="leading-normal">${escapeHtml(r.summaryInsights[0])}</p>
                </div>
              </div>
              <div class="mt-6 pt-4 border-t border-[#E8ECE9] flex items-center justify-between text-xs font-medium">
                <span class="text-[#879895]">Updated: ${r.lastUpdated}</span>
                <a href="/${r.slug}" class="text-[#167D75] font-semibold hover:underline inline-flex items-center space-x-1">
                  <span>View Full Report</span>
                  <span>→</span>
                </a>
              </div>
            </article>
          `
          ).join('')}
        </div>
      </div>
    </div>
  `;

  pages.push({
    relativePath: 'reports/index.html',
    canonicalUrl: `${baseUrl}/reports`,
    title: 'Global Financial Research & Salary Worth Indices 2026 | LivWorthy',
    description: 'Explore empirical datasets on international salary worth, statutory take-home pay, and metro rent burdens.',
    robots: 'index, follow',
    bodyContent: hubBody,
    structuredData: hubStructuredData,
    changefreq: 'weekly',
    priority: 0.9,
  });

  // 2. Individual Report Pages
  for (const report of ALL_EMPIRICAL_REPORTS) {
    const csvContent = [
      report.tableHeaders.map((h: string) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...report.tableRows.map((row: any[]) =>
        row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    downloads.push({
      relativePath: `${report.slug}.csv`,
      content: csvContent,
    });

    downloads.push({
      relativePath: `${report.slug}.json`,
      content: JSON.stringify(report, null, 2),
    });

    const reportStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
            { '@type': 'ListItem', position: 2, name: 'Research Reports', item: `${baseUrl}/reports` },
            { '@type': 'ListItem', position: 3, name: report.shortTitle, item: `${baseUrl}/${report.slug}` },
          ],
        },
        {
          '@type': 'Dataset',
          name: report.title,
          description: report.metaDescription,
          url: `${baseUrl}/${report.slug}`,
          license: 'https://creativecommons.org/licenses/by/4.0/',
          creator: {
            '@type': 'Organization',
            name: 'LivWorthy Quantitative Research Institute',
            url: baseUrl,
          },
          distribution: [
            {
              '@type': 'DataDownload',
              encodingFormat: 'text/csv',
              contentUrl: `${baseUrl}/${report.slug}.csv`,
            },
            {
              '@type': 'DataDownload',
              encodingFormat: 'application/json',
              contentUrl: `${baseUrl}/${report.slug}.json`,
            },
          ],
        },
        {
          '@type': 'TechArticle',
          headline: report.title,
          description: report.metaDescription,
          datePublished: report.publishedDate,
          dateModified: report.lastUpdated,
          author: {
            '@type': 'Organization',
            name: 'LivWorthy Quantitative Research Institute',
          },
        },
      ],
    };

    const reportBody = `
      <div class="min-h-screen bg-[#F7F8F5]">
        <article class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav aria-label="Breadcrumb" class="text-xs text-[#60706D] mb-6">
            <a href="/" class="hover:text-[#167D75]">Home</a> /
            <a href="/reports" class="hover:text-[#167D75]">Research Reports</a> /
            <span class="text-[#102A2E] font-semibold">${escapeHtml(report.shortTitle)}</span>
          </nav>

          <header class="mb-8 bg-[#FFFFFF] border border-[#DCE3E0] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span class="px-2.5 py-0.5 bg-[#E8F3F1] border border-[#BCE1DC] rounded-md text-[11px] font-semibold text-[#167D75]">Empirical Dataset</span>
              <span class="text-xs text-[#879895]">• Published: ${report.publishedDate}</span>
              <span class="text-xs text-[#879895]">• Last Reviewed: ${report.lastUpdated}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#102A2E] tracking-tight">${escapeHtml(report.title)}</h1>
            <p class="mt-3 text-sm sm:text-base text-[#60706D] leading-relaxed">${escapeHtml(report.subtitle)}</p>

            <div class="mt-6 flex flex-wrap gap-3">
              <a href="/${report.slug}.csv" download class="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#102A2E] text-white rounded-lg text-xs font-semibold hover:bg-[#167D75] transition-colors shadow-xs">
                <span>Download Dataset (CSV)</span>
              </a>
              <a href="/${report.slug}.json" download class="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#FFFFFF] text-[#102A2E] border border-[#DCE3E0] rounded-lg text-xs font-semibold hover:bg-[#F7F8F5] transition-colors">
                <span>Export Schema (JSON)</span>
              </a>
            </div>
          </header>

          <!-- Key Findings Box -->
          <section class="mb-8 bg-[#FFFFFF] border border-[#DCE3E0] rounded-2xl p-6 shadow-xs">
            <h2 class="text-base font-bold text-[#102A2E] mb-3">Core Empirical Findings</h2>
            <ul class="space-y-2 text-xs sm:text-sm text-[#334D4A]">
              ${report.summaryInsights.map((insight: string) => `<li class="flex items-start space-x-2"><span class="text-[#167D75] font-bold">✔</span><span>${escapeHtml(insight)}</span></li>`).join('')}
            </ul>
          </section>

          <!-- Interactive Data Table -->
          <section class="mb-10 bg-[#FFFFFF] border border-[#DCE3E0] rounded-2xl shadow-xs overflow-hidden">
            <div class="px-6 py-4 border-b border-[#DCE3E0] flex items-center justify-between">
              <h2 class="text-base font-bold text-[#102A2E]">Empirical Benchmark Matrix</h2>
              <span class="text-xs text-[#879895]">Verified 2026 Statutory Baseline</span>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-[#E8ECE9] text-xs">
                <thead class="bg-[#F7F8F5] text-[#334D4A] font-semibold">
                  <tr>
                    ${report.tableHeaders.map((th: string) => `<th scope="col" class="px-4 py-3 text-left whitespace-nowrap">${escapeHtml(th)}</th>`).join('')}
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#E8ECE9] bg-white text-[#102A2E]">
                  ${report.tableRows.map((row: any[]) => `
                    <tr class="hover:bg-[#F7F8F5] transition-colors">
                      ${row.map((cell: any, idx: number) => `<td class="px-4 py-3 whitespace-nowrap ${idx === 0 ? 'font-bold text-[#102A2E]' : 'text-[#334D4A]'}">${escapeHtml(String(cell))}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </section>

          <!-- Methodology & Zero-AI Disclosure -->
          <section class="mb-8 bg-[#FFFFFF] border border-[#DCE3E0] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 class="text-base font-bold text-[#102A2E]">Calculation Methodology & Governance</h2>
            <div class="space-y-2 text-xs text-[#60706D] leading-relaxed">
              ${report.methodologyNotes.map((note: string) => `<p>• ${escapeHtml(note)}</p>`).join('')}
            </div>
            <div class="pt-3 border-t border-[#E8ECE9]">
              <h3 class="text-xs font-bold text-[#102A2E] mb-2">Primary Statutory & Statistical Authorities:</h3>
              <div class="flex flex-wrap gap-2 text-xs">
                ${report.primarySources.map((s: any) => `
                  <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 bg-[#F7F8F5] border border-[#DCE3E0] rounded-md text-[#167D75] hover:border-[#167D75]">
                    ${escapeHtml(s.name)} ↗
                  </a>
                `).join('')}
              </div>
            </div>
          </section>

          <!-- Press & Academic Citation Standard -->
          <section class="mb-10 bg-[#E8F3F1] border border-[#BCE1DC] rounded-2xl p-6 shadow-xs">
            <h2 class="text-sm font-bold text-[#102A2E] mb-2">Standard Academic & Editorial Citation</h2>
            <p class="text-xs text-[#60706D] mb-3">If utilizing this data in journalism, academic papers, or corporate compensation analysis, please cite:</p>
            <div class="p-3 bg-white border border-[#BCE1DC] rounded-xl font-mono text-[11px] text-[#102A2E] select-all leading-normal">
              ${escapeHtml(report.citationString)}
            </div>
          </section>

          <!-- Next Action CTAs -->
          <footer class="pt-6 border-t border-[#DCE3E0] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div class="flex items-center space-x-3 text-[#167D75] font-semibold">
              <a href="/salary-after-tax" class="hover:underline">Run Custom Tax Calculation →</a>
              <a href="/compare" class="hover:underline">Bilateral City Comparison →</a>
              <a href="/coverage" class="hover:underline">View 39 Supported Markets →</a>
            </div>
            <span class="text-[#879895]">© 2026 LivWorthy Quantitative Research Institute</span>
          </footer>
        </article>
      </div>
    `;

    pages.push({
      relativePath: `${report.slug}/index.html`,
      canonicalUrl: `${baseUrl}/${report.slug}`,
      title: `${report.title} | LivWorthy`,
      description: report.metaDescription,
      robots: 'index, follow',
      bodyContent: reportBody,
      structuredData: reportStructuredData,
      changefreq: 'weekly',
      priority: 0.9,
    });
  }

  return { pages, downloads };
}

