import { COUNTRIES, CITIES } from '../src/data/locations';
import { RELOCATION_CORRIDORS } from '../src/data/relocation-corridors';
import { POPULAR_GUIDES_LIST } from '../src/data/salary-guides';
import { ALL_EMPIRICAL_REPORTS } from '../src/data/reports-data';
import { SUPPORTED_LOCALES } from '../src/lib/i18n/config';
import { getDictionary } from '../src/lib/i18n';
import { LONG_FORM_COPY, LONG_FORM_LOCALES, formatLongForm } from '../src/lib/i18n/long-form';
import { VERIFIED_CITY_EDITORIAL, renderCityEditorialHtml } from '../src/data/city-editorial';
import { VERIFIED_COUNTRY_EDITORIAL, renderCountryEditorialHtml } from '../src/data/country-editorial';
import { LOCALIZED_CITIES } from '../src/lib/i18n/content/cities';
import { LOCALIZED_COUNTRIES } from '../src/lib/i18n/content/countries';
import { LOCALIZED_GUIDES } from '../src/lib/i18n/content/guides';

export interface LocalizedSeoPage {
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

const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
const region = (loc: string, id: string, fallback: string) => {
  try {
    return new Intl.DisplayNames([SUPPORTED_LOCALES[loc]?.intlLocale || loc], { type: 'region' }).of(id) || fallback;
  } catch {
    return fallback;
  }
};

export function createLocalizedLongFormPages(baseUrl: string): LocalizedSeoPage[] {
  const pages: LocalizedSeoPage[] = [];
  const tier1 = new Set(['en', 'es', 'fr', 'ar', 'de', 'pt', 'hi', 'ur', 'zh', 'ja']);
  const verifiedHubCities = new Set(['nyc', 'london', 'dubai', 'toronto', 'sf', 'austin', 'sydney', 'berlin', 'singapore']);
  const verifiedCountries = new Set(['US', 'GB', 'CA', 'AU', 'DE', 'AE', 'SG']);

  for (const loc of LONG_FORM_LOCALES) {
    const cfg = SUPPORTED_LOCALES[loc], copy = LONG_FORM_COPY[loc];
    if (!cfg || !copy) continue;
    const t = getDictionary(loc), intl = cfg.intlLocale || loc, dir = cfg.dir;
    const isTier1 = tier1.has(loc);

    const add = (
      path: string,
      title: string,
      desc: string,
      body: string,
      type = 'WebPage',
      freq: 'daily' | 'weekly' | 'monthly' = 'weekly',
      priority = 0.8,
      customRobots: 'index, follow' | 'noindex, follow' = 'noindex, follow'
    ) => {
      const canonical = `${baseUrl}/${loc}${path ? `/${path}` : ''}`;
      pages.push({
        relativePath: `${loc}${path ? `/${path}` : ''}/index.html`,
        canonicalUrl: canonical,
        title: `${title} | LivWorthy`,
        description: desc,
        robots: customRobots,
        lang: loc,
        dir,
        changefreq: freq,
        priority,
        structuredData: {
          '@context': 'https://schema.org',
          '@type': type,
          name: title,
          url: canonical,
          inLanguage: intl,
        },
        bodyContent: `<article class="max-w-5xl mx-auto px-4 py-10" dir="${dir}">${body}</article>`,
      });
    };

    const grid = (items: string[]) => `<div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${items.join('')}</div>`;
    const link = (href: string, text: string) => `<a class="p-3 border rounded-lg bg-white hover:border-[#167D75] transition-colors" href="${href}">${esc(text)}</a>`;

    // Root localized hub for non-Tier-1
    if (!tier1.has(loc)) {
      add(
        '',
        copy.rootTitle,
        copy.rootIntro,
        `<h1 class="text-3xl font-extrabold">${esc(copy.rootTitle)}</h1><p class="mt-4">${esc(copy.rootIntro)}</p>${grid([
          link(`/${loc}/countries`, t.nav.coverage),
          link(`/${loc}/cities`, copy.majorCitiesHeading),
          link(`/${loc}/guides`, t.nav.guides),
          link(`/${loc}/relocation`, t.nav.relocation),
          link(`/${loc}/reports`, t.nav.reports),
        ])}`,
        'WebPage',
        'daily',
        0.9,
        'noindex, follow'
      );
    }

    // Collection directories — link grids without editorial prose must be noindex, follow
    add(
      'countries',
      t.nav.coverage,
      copy.rootIntro,
      `<h1 class="text-3xl font-extrabold">${esc(t.nav.coverage)}</h1><p class="mt-3">${esc(copy.rootIntro)}</p>${grid(Object.values(COUNTRIES).map((c) => link(`/${loc}/countries/${c.id.toLowerCase()}`, region(loc, c.id, c.name))))}`,
      'CollectionPage',
      'weekly',
      0.7,
      'noindex, follow'
    );

    add(
      'cities',
      copy.majorCitiesHeading,
      copy.rootIntro,
      `<h1 class="text-3xl font-extrabold">${esc(copy.majorCitiesHeading)}</h1>${grid(Object.values(CITIES).map((c) => link(`/${loc}/cities/${c.id}`, c.name)))}`,
      'CollectionPage',
      'weekly',
      0.7,
      'noindex, follow'
    );

    add(
      'guides',
      t.nav.guides,
      copy.rootIntro,
      `<h1 class="text-3xl font-extrabold">${esc(t.nav.guides)}</h1>${grid(
        POPULAR_GUIDES_LIST.map((g) => {
          const c = CITIES[g.cityId];
          if (!c) return '';
          const salary = new Intl.NumberFormat(intl, { style: 'currency', currency: g.currency, maximumFractionDigits: 0 }).format(g.salaryMajor);
          return link(`/${loc}/guides/${g.slug}`, formatLongForm(copy.guideTitle, { salary, city: c.name }));
        })
      )}`,
      'CollectionPage',
      'weekly',
      0.7,
      'noindex, follow'
    );

    add(
      'relocation',
      t.nav.relocation,
      copy.rootIntro,
      `<h1 class="text-3xl font-extrabold">${esc(t.nav.relocation)}</h1>${grid(
        Object.values(RELOCATION_CORRIDORS).map((r) => {
          const a = CITIES[r.fromCityId], b = CITIES[r.toCityId];
          return a && b ? link(`/${loc}/relocation/${r.slug}`, formatLongForm(copy.relocationTitle, { from: a.name, to: b.name })) : '';
        })
      )}`,
      'CollectionPage',
      'weekly',
      0.7,
      'noindex, follow'
    );

    add(
      'reports',
      t.nav.reports,
      copy.reportIntro,
      `<h1 class="text-3xl font-extrabold">${esc(t.nav.reports)}</h1><p class="mt-3">${esc(copy.reportIntro)}</p>${grid(
        ALL_EMPIRICAL_REPORTS.map((r) => link(`/${loc}/${r.slug}`, copy.reportNames[r.id] || r.id))
      )}`,
      'CollectionPage',
      'weekly',
      0.7,
      'noindex, follow'
    );

    // Country pages
    for (const c of Object.values(COUNTRIES)) {
      const name = region(loc, c.id, c.name);
      const title = formatLongForm(copy.countryTitle, { country: name });
      const intro = formatLongForm(copy.countryIntro, { country: name });
      const cities = Object.values(CITIES).filter((x) => x.countryId === c.id);
      const isVerified = verifiedCountries.has(c.id);

      if (loc === 'en' && isVerified && VERIFIED_COUNTRY_EDITORIAL[c.id]) {
        // Full English bespoke empirical profile (>500 words)
        const editorialHtml = renderCountryEditorialHtml(c.id);
        const body = `
          <h1 class="text-3xl font-extrabold text-[#102A2E]">${esc(title)}</h1>
          <p class="mt-3 text-slate-600 leading-relaxed">${esc(intro)}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <span class="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${esc(c.id)}</span>
            <span class="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${esc(c.defaultCurrency)}</span>
          </div>
          ${editorialHtml}
          <h2 class="mt-8 text-xl font-bold text-[#102A2E]">${esc(copy.majorCitiesHeading)}</h2>
          ${grid(cities.map((x) => link(`/${loc}/cities/${x.id}`, x.name)))}
          <section class="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold text-teal-800">
            <a href="/methodology" class="hover:underline">Calculation Methodology →</a>
            <a href="/sources" class="hover:underline">Evidence Registry &amp; Primary Sources →</a>
          </section>
        `;
        add(`countries/${c.id.toLowerCase()}`, title, intro, body, 'WebPage', 'weekly', 0.85, c.id === 'US' ? 'index, follow' : 'noindex, follow');
      } else if (isTier1 && LOCALIZED_COUNTRIES[c.id]?.[loc]) {
        // Full native localized country intelligence (>250 words)
        const locC = LOCALIZED_COUNTRIES[c.id][loc];
        const body = `
          <h1 class="text-3xl font-extrabold text-[#102A2E]">${esc(locC.seoTitle || title)}</h1>
          <p class="mt-3 text-slate-700 leading-relaxed">${esc(locC.intro)}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <span class="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${esc(c.id)}</span>
            <span class="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${esc(c.defaultCurrency)}</span>
          </div>
          <section class="mt-8 space-y-3">
            <h2 class="text-xl font-bold text-[#102A2E]">${esc('Salary & Taxation')}</h2>
            <p class="text-sm text-slate-700 leading-relaxed">${esc(locC.salaryContext)}</p>
            <p class="text-sm text-slate-700 leading-relaxed">${esc(locC.taxationExplanation)}</p>
          </section>
          <section class="mt-8 space-y-3">
            <h2 class="text-xl font-bold text-[#102A2E]">${esc('Cost of Living & Housing')}</h2>
            <p class="text-sm text-slate-700 leading-relaxed">${esc(locC.costContext)}</p>
            <p class="text-sm text-slate-700 leading-relaxed">${esc(locC.mobilityContext)}</p>
          </section>
          <h2 class="mt-8 text-xl font-bold text-[#102A2E]">${esc(copy.majorCitiesHeading)}</h2>
          ${grid(cities.map((x) => link(`/${loc}/cities/${x.id}`, x.name)))}
          <section class="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold text-teal-800">
            <a href="/methodology" class="hover:underline">${esc(t.common.methodology)} →</a>
            <a href="/sources" class="hover:underline">${esc(t.common.evidence)} →</a>
          </section>
        `;
        add(`countries/${c.id.toLowerCase()}`, locC.seoTitle || title, locC.seoDescription || intro, body, 'WebPage', 'weekly', 0.85, 'index, follow');
      } else {
        // Non-verified or un-localized stub -> noindex, follow
        const body = `
          <h1 class="text-3xl font-extrabold">${esc(title)}</h1>
          <p class="mt-3">${esc(intro)}</p>
          <div class="mt-6 flex gap-3">
            <span class="p-3 border rounded-xl">${esc(c.id)}</span>
            <span class="p-3 border rounded-xl">${esc(c.defaultCurrency)}</span>
          </div>
          <h2 class="mt-8 text-xl font-bold">${esc(copy.majorCitiesHeading)}</h2>
          ${grid(cities.map((x) => link(`/${loc}/cities/${x.id}`, x.name)))}
          <p class="mt-8 text-sm">${esc(copy.evidenceNote)}</p>
        `;
        add(`countries/${c.id.toLowerCase()}`, title, intro, body, 'WebPage', 'weekly', 0.6, 'noindex, follow');
      }
    }

    // City pages
    for (const c of Object.values(CITIES)) {
      const country = region(loc, c.countryId, COUNTRIES[c.countryId]?.name || c.countryId);
      const title = formatLongForm(copy.cityTitle, { city: c.name, country });
      const intro = formatLongForm(copy.cityIntro, { city: c.name, country });
      const isVerified = verifiedHubCities.has(c.id);

      if (loc === 'en' && isVerified && VERIFIED_CITY_EDITORIAL[c.id]) {
        // Full English bespoke empirical profile (>600 words)
        const editorialHtml = renderCityEditorialHtml(c.id);
        const body = `
          <h1 class="text-3xl font-extrabold text-[#102A2E]">${esc(title)}</h1>
          <p class="mt-3 text-slate-600 leading-relaxed">${esc(intro)}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <span class="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${esc(country)}</span>
            <span class="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${esc(c.currency)}</span>
            <span class="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">COL Index: ${esc(c.colIndexBase100NYC)}</span>
          </div>
          ${editorialHtml}
          <h2 class="mt-8 text-xl font-bold text-[#102A2E]">${esc(copy.toolsHeading)}</h2>
          ${grid([link(`/${loc}/salary-worth`, t.nav.tabSalaryWorth), link(`/${loc}/cost-of-living`, t.nav.tabCostOfLiving), link(`/${loc}/compare`, t.nav.tabCompare)])}
          <section class="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold text-teal-800">
            <a href="/methodology" class="hover:underline">Calculation Methodology →</a>
            <a href="/sources" class="hover:underline">Evidence Registry &amp; Primary Sources →</a>
          </section>
        `;
        add(`cities/${c.id}`, title, intro, body, 'WebPage', 'weekly', 0.9, c.id === 'nyc' ? 'index, follow' : 'noindex, follow');
      } else if (isTier1 && LOCALIZED_CITIES[c.id]?.[loc]) {
        // Full native localized city intelligence (>250 words)
        const locCity = LOCALIZED_CITIES[c.id][loc];
        const body = `
          <h1 class="text-3xl font-extrabold text-[#102A2E]">${esc(locCity.seoTitle || title)}</h1>
          <p class="mt-3 text-slate-700 leading-relaxed">${esc(locCity.intro)}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <span class="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${esc(country)}</span>
            <span class="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${esc(c.currency)}</span>
            <span class="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">COL Index: ${esc(c.colIndexBase100NYC)}</span>
          </div>
          <section class="mt-8 space-y-3">
            <h2 class="text-xl font-bold text-[#102A2E]">${esc('Earnings & Take-Home Pay')}</h2>
            <p class="text-sm text-slate-700 leading-relaxed">${esc(locCity.salaryContext)}</p>
          </section>
          <section class="mt-8 space-y-3">
            <h2 class="text-xl font-bold text-[#102A2E]">${esc('Housing & Living Costs')}</h2>
            <p class="text-sm text-slate-700 leading-relaxed">${esc(locCity.housingContext)}</p>
          </section>
          <section class="mt-8 space-y-3">
            <h2 class="text-xl font-bold text-[#102A2E]">Taxation &amp; Statutory Deductions</h2>
            <p class="text-sm text-slate-700 leading-relaxed">${esc(locCity.taxContext)}</p>
          </section>
          <h2 class="mt-8 text-xl font-bold text-[#102A2E]">${esc(copy.toolsHeading)}</h2>
          ${grid([link(`/${loc}/salary-worth`, t.nav.tabSalaryWorth), link(`/${loc}/cost-of-living`, t.nav.tabCostOfLiving), link(`/${loc}/compare`, t.nav.tabCompare)])}
          <section class="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold text-teal-800">
            <a href="/methodology" class="hover:underline">${esc(t.common.methodology)} →</a>
            <a href="/sources" class="hover:underline">${esc(t.common.evidence)} →</a>
          </section>
        `;
        add(`cities/${c.id}`, locCity.seoTitle || title, locCity.seoDescription || intro, body, 'WebPage', 'weekly', 0.9, c.id === 'nyc' ? 'index, follow' : 'noindex, follow');
      } else {
        // Non-verified or un-localized stub -> noindex, follow
        const body = `
          <h1 class="text-3xl font-extrabold">${esc(title)}</h1>
          <p class="mt-3">${esc(intro)}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <span class="p-3 border rounded-xl">${esc(country)}</span>
            <span class="p-3 border rounded-xl">${esc(c.currency)}</span>
            <span class="p-3 border rounded-xl">${esc(c.colIndexBase100NYC)}</span>
          </div>
          <h2 class="mt-8 text-xl font-bold">${esc(copy.toolsHeading)}</h2>
          ${grid([link(`/${loc}/salary-worth`, t.nav.tabSalaryWorth), link(`/${loc}/cost-of-living`, t.nav.tabCostOfLiving), link(`/${loc}/compare`, t.nav.tabCompare)])}
          <p class="mt-8 text-sm">${esc(copy.evidenceNote)}</p>
        `;
        add(`cities/${c.id}`, title, intro, body, 'WebPage', 'weekly', 0.6, 'noindex, follow');
      }
    }

    // Guides
    for (const g of POPULAR_GUIDES_LIST) {
      const c = CITIES[g.cityId];
      if (!c) continue;
      const salary = new Intl.NumberFormat(intl, { style: 'currency', currency: g.currency, maximumFractionDigits: 0 }).format(g.salaryMajor);
      const title = formatLongForm(copy.guideTitle, { salary, city: c.name });
      const intro = formatLongForm(copy.guideIntro, { salary, city: c.name });

      if (isTier1 && LOCALIZED_GUIDES[g.slug]?.[loc]) {
        const locG = LOCALIZED_GUIDES[g.slug][loc];
        const body = `
          <h1 class="text-3xl font-extrabold text-[#102A2E]">${esc(locG.h1 || title)}</h1>
          <div class="mt-4 p-5 bg-[#E8F3F1] border border-[#BCE1DC] rounded-xl text-sm font-semibold text-[#102A2E] leading-relaxed">
            ${esc(locG.directAnswer)}
          </div>
          <p class="mt-4 text-slate-700 leading-relaxed">${esc(locG.intro)}</p>
          <section class="mt-6 space-y-2">
            <h2 class="text-lg font-bold text-[#102A2E]">${esc('Breakdown')}</h2>
            <p class="text-sm text-slate-700 leading-relaxed">${esc(locG.breakdownNarrative)}</p>
          </section>
          <section class="mt-6 space-y-2">
            <h2 class="text-lg font-bold text-[#102A2E]">Recommendation</h2>
            <p class="text-sm text-slate-700 leading-relaxed">${esc(locG.recommendation)}</p>
          </section>
          ${locG.faq && locG.faq.length > 0 ? `
            <section class="mt-6 space-y-3">
              <h2 class="text-lg font-bold text-[#102A2E]">Frequently Asked Questions</h2>
              ${locG.faq.map((f) => `
                <div class="p-4 bg-white border border-slate-200 rounded-xl">
                  <h3 class="font-bold text-sm text-slate-900">${esc(f.question)}</h3>
                  <p class="text-xs text-slate-600 mt-1">${esc(f.answer)}</p>
                </div>
              `).join('')}
            </section>
          ` : ''}
          <div class="mt-8">${link(`/${loc}/salary-worth`, t.nav.tabSalaryWorth)}</div>
          <section class="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold text-teal-800">
            <a href="/methodology" class="hover:underline">${esc(t.common.methodology)} →</a>
            <a href="/sources" class="hover:underline">${esc(t.common.evidence)} →</a>
          </section>
        `;
        add(`guides/${g.slug}`, locG.seoTitle || title, locG.seoDescription || intro, body, 'Article', 'monthly', 0.8, 'index, follow');
      } else {
        const body = `
          <h1 class="text-3xl font-extrabold">${esc(title)}</h1>
          <p class="mt-3">${esc(intro)}</p>
          <div class="mt-6 flex gap-3"><span class="p-3 border rounded-xl">${esc(salary)}</span><span class="p-3 border rounded-xl">${esc(c.name)}</span></div>
          <div class="mt-8">${link(`/${loc}/salary-worth`, t.nav.tabSalaryWorth)}</div>
          <p class="mt-6 text-sm">${esc(copy.evidenceNote)}</p>
        `;
        add(`guides/${g.slug}`, title, intro, body, 'Article', 'monthly', 0.6, 'noindex, follow');
      }
    }

    // Relocation corridors
    for (const r of Object.values(RELOCATION_CORRIDORS)) {
      const a = CITIES[r.fromCityId], b = CITIES[r.toCityId];
      if (!a || !b) continue;
      const title = formatLongForm(copy.relocationTitle, { from: a.name, to: b.name });
      const intro = formatLongForm(copy.relocationIntro, { from: a.name, to: b.name });
      const body = `
        <h1 class="text-3xl font-extrabold text-[#102A2E]">${esc(title)}</h1>
        <p class="mt-3 text-slate-700 leading-relaxed">${esc(intro)}</p>
        ${grid([
          `<div class="p-4 border rounded-xl bg-white"><strong>${esc(a.name)}</strong><span class="block text-sm text-slate-600 mt-1">${esc(a.currency)} · COL Index: ${esc(a.colIndexBase100NYC)}</span></div>`,
          `<div class="p-4 border rounded-xl bg-white"><strong>${esc(b.name)}</strong><span class="block text-sm text-slate-600 mt-1">${esc(b.currency)} · COL Index: ${esc(b.colIndexBase100NYC)}</span></div>`,
        ])}
        <div class="mt-8">${link(`/${loc}/compare`, t.nav.tabCompare)}</div>
        <p class="mt-6 text-sm text-slate-500">${esc(copy.evidenceNote)}</p>
      `;
      // Relocation corridors indexable only on primary root English; localized duplicates noindexed
      add(`relocation/${r.slug}`, title, intro, body, 'Article', 'weekly', 0.75, 'noindex, follow');
    }

    // Reports
    for (const r of ALL_EMPIRICAL_REPORTS) {
      const title = copy.reportNames[r.id] || r.id;
      const updated = new Intl.DateTimeFormat(intl, { dateStyle: 'medium' }).format(new Date(`${r.lastUpdated}T00:00:00Z`));
      const body = `
        <h1 class="text-3xl font-extrabold text-[#102A2E]">${esc(title)}</h1>
        <p class="mt-3 text-slate-700 leading-relaxed">${esc(copy.reportIntro)}</p>
        <div class="mt-6 p-4 border border-slate-200 rounded-xl bg-white text-sm font-semibold text-slate-800">${esc(updated)}</div>
        <h2 class="mt-8 text-xl font-bold text-[#102A2E]">${esc(t.common.evidence)}</h2>
        <ul class="mt-3 space-y-2 text-sm text-teal-800">${r.primarySources.map((s) => `<li><a href="${s.url}" rel="noopener noreferrer" class="hover:underline">${esc(s.name)}</a></li>`).join('')}</ul>
      `;
      // Reports indexable on primary root English; localized stubs noindexed
      add(r.slug, title, copy.reportIntro, body, 'Dataset', 'monthly', 0.82, 'noindex, follow');
    }
  }

  return pages;
}
