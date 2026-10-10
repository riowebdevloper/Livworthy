import { COUNTRIES, CITIES } from '../src/data/locations';
import { RELOCATION_CORRIDORS } from '../src/data/relocation-corridors';
import { POPULAR_GUIDES_LIST } from '../src/data/salary-guides';
import { ALL_EMPIRICAL_REPORTS } from '../src/data/reports-data';
import { SUPPORTED_LOCALES } from '../src/lib/i18n/config';
import { getDictionary } from '../src/lib/i18n';
import { LONG_FORM_COPY, LONG_FORM_LOCALES, formatLongForm } from '../src/lib/i18n/long-form';

export interface LocalizedSeoPage {
  relativePath:string; canonicalUrl:string; title:string; description:string;
  robots:'index, follow'|'noindex, follow'; bodyContent:string; structuredData:any;
  changefreq:'daily'|'weekly'|'monthly'; priority:number; lang?:string; dir?:'ltr'|'rtl';
}
const esc=(v:unknown)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
const region=(loc:string,id:string,fallback:string)=>{try{return new Intl.DisplayNames([SUPPORTED_LOCALES[loc]?.intlLocale||loc],{type:'region'}).of(id)||fallback}catch{return fallback}};

export function createLocalizedLongFormPages(baseUrl:string):LocalizedSeoPage[]{
  const pages:LocalizedSeoPage[]=[];
  const tier1=new Set(['en','es','fr','ar','de','pt','hi','ur','zh','ja']);
  for(const loc of LONG_FORM_LOCALES){
    const cfg=SUPPORTED_LOCALES[loc],copy=LONG_FORM_COPY[loc]; if(!cfg||!copy)continue;
    const t=getDictionary(loc), intl=cfg.intlLocale||loc, dir=cfg.dir;
    const isTier1 = tier1.has(loc);
    const robotsDirective: 'index, follow' | 'noindex, follow' = isTier1 ? 'index, follow' : 'noindex, follow';
    const verifiedHubCities = new Set(['nyc', 'london', 'dubai', 'toronto', 'sf', 'austin', 'sydney', 'berlin', 'singapore']);
    const verifiedCountries = new Set(['US', 'GB', 'CA', 'AU', 'DE', 'AE', 'SG']);

    const add=(path:string,title:string,desc:string,body:string,type='WebPage',freq:'daily'|'weekly'|'monthly'='weekly',priority=.8,customRobots?: 'index, follow' | 'noindex, follow')=>{
      const canonical=`${baseUrl}/${loc}${path?`/${path}`:''}`;
      pages.push({relativePath:`${loc}${path?`/${path}`:''}/index.html`,canonicalUrl:canonical,title:`${title} | LivWorthy`,description:desc,robots:customRobots || robotsDirective,lang:loc,dir,changefreq:freq,priority,structuredData:{'@context':'https://schema.org','@type':type,name:title,url:canonical,inLanguage:intl},bodyContent:`<article class=\"max-w-5xl mx-auto px-4 py-10\" dir=\"${dir}\">${body}</article>`});
    };
    const grid=(items:string[])=>`<div class=\"mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3\">${items.join('')}</div>`;
    const link=(href:string,text:string)=>`<a class=\"p-3 border rounded-lg bg-white\" href=\"${href}\">${esc(text)}</a>`;

    if(!tier1.has(loc)) add('',copy.rootTitle,copy.rootIntro,`<h1 class=\"text-3xl font-extrabold\">${esc(copy.rootTitle)}</h1><p class=\"mt-4\">${esc(copy.rootIntro)}</p>${grid([link(`/${loc}/countries`,t.nav.coverage),link(`/${loc}/cities`,copy.majorCitiesHeading),link(`/${loc}/guides`,t.nav.guides),link(`/${loc}/relocation`,t.nav.relocation),link(`/${loc}/reports`,t.nav.reports)])}`,'WebPage','daily',.9);

    add('countries',t.nav.coverage,copy.rootIntro,`<h1 class=\"text-3xl font-extrabold\">${esc(t.nav.coverage)}</h1><p class=\"mt-3\">${esc(copy.rootIntro)}</p>${grid(Object.values(COUNTRIES).map(c=>link(`/${loc}/countries/${c.id.toLowerCase()}`,region(loc,c.id,c.name))))}`,'CollectionPage');
    add('cities',copy.majorCitiesHeading,copy.rootIntro,`<h1 class=\"text-3xl font-extrabold\">${esc(copy.majorCitiesHeading)}</h1>${grid(Object.values(CITIES).map(c=>link(`/${loc}/cities/${c.id}`,c.name)))}`,'CollectionPage');
    add('guides',t.nav.guides,copy.rootIntro,`<h1 class=\"text-3xl font-extrabold\">${esc(t.nav.guides)}</h1>${grid(POPULAR_GUIDES_LIST.map(g=>{const c=CITIES[g.cityId];if(!c)return'';const salary=new Intl.NumberFormat(intl,{style:'currency',currency:g.currency,maximumFractionDigits:0}).format(g.salaryMajor);return link(`/${loc}/guides/${g.slug}`,formatLongForm(copy.guideTitle,{salary,city:c.name}))}))}`,'CollectionPage');
    add('relocation',t.nav.relocation,copy.rootIntro,`<h1 class=\"text-3xl font-extrabold\">${esc(t.nav.relocation)}</h1>${grid(Object.values(RELOCATION_CORRIDORS).map(r=>{const a=CITIES[r.fromCityId],b=CITIES[r.toCityId];return a&&b?link(`/${loc}/relocation/${r.slug}`,formatLongForm(copy.relocationTitle,{from:a.name,to:b.name})):''}))}`,'CollectionPage');
    add('reports',t.nav.reports,copy.reportIntro,`<h1 class=\"text-3xl font-extrabold\">${esc(t.nav.reports)}</h1><p class=\"mt-3\">${esc(copy.reportIntro)}</p>${grid(ALL_EMPIRICAL_REPORTS.map(r=>link(`/${loc}/${r.slug}`,copy.reportNames[r.id]||r.id)))}`,'CollectionPage');

    for(const c of Object.values(COUNTRIES)){
      const name=region(loc,c.id,c.name),title=formatLongForm(copy.countryTitle,{country:name}),intro=formatLongForm(copy.countryIntro,{country:name});
      const cities=Object.values(CITIES).filter(x=>x.countryId===c.id);
      const isVerified = verifiedCountries.has(c.id);
      const countryRobots = isTier1 && isVerified ? 'index, follow' : 'noindex, follow';
      add(`countries/${c.id.toLowerCase()}`,title,intro,`<h1 class=\"text-3xl font-extrabold\">${esc(title)}</h1><p class=\"mt-3\">${esc(intro)}</p><div class=\"mt-6 flex gap-3\"><span class=\"p-3 border rounded-xl\">${esc(c.id)}</span><span class=\"p-3 border rounded-xl\">${esc(c.defaultCurrency)}</span></div><h2 class=\"mt-8 text-xl font-bold\">${esc(copy.majorCitiesHeading)}</h2>${grid(cities.map(x=>link(`/${loc}/cities/${x.id}`,x.name)))}<p class=\"mt-8 text-sm\">${esc(copy.evidenceNote)}</p>`,'WebPage','weekly',.8,countryRobots);
    }
    for(const c of Object.values(CITIES)){
      const country=region(loc,c.countryId,COUNTRIES[c.countryId]?.name||c.countryId),title=formatLongForm(copy.cityTitle,{city:c.name,country}),intro=formatLongForm(copy.cityIntro,{city:c.name,country});
      const isVerified = verifiedHubCities.has(c.id);
      const cityRobots = isTier1 && isVerified ? 'index, follow' : 'noindex, follow';
      add(`cities/${c.id}`,title,intro,`<h1 class=\"text-3xl font-extrabold\">${esc(title)}</h1><p class=\"mt-3\">${esc(intro)}</p><div class=\"mt-6 flex flex-wrap gap-3\"><span class=\"p-3 border rounded-xl\">${esc(country)}</span><span class=\"p-3 border rounded-xl\">${esc(c.currency)}</span><span class=\"p-3 border rounded-xl\">${esc(c.colIndexBase100NYC)}</span></div><h2 class=\"mt-8 text-xl font-bold\">${esc(copy.toolsHeading)}</h2>${grid([link(`/${loc}/salary-worth`,t.nav.tabSalaryWorth),link(`/${loc}/cost-of-living`,t.nav.tabCostOfLiving),link(`/${loc}/compare`,t.nav.tabCompare)])}<p class=\"mt-8 text-sm\">${esc(copy.evidenceNote)}</p>`,'WebPage','weekly',.8,cityRobots);
    }
    for(const g of POPULAR_GUIDES_LIST){
      const c=CITIES[g.cityId]; if(!c)continue; const salary=new Intl.NumberFormat(intl,{style:'currency',currency:g.currency,maximumFractionDigits:0}).format(g.salaryMajor);
      const title=formatLongForm(copy.guideTitle,{salary,city:c.name}),intro=formatLongForm(copy.guideIntro,{salary,city:c.name});
      add(`guides/${g.slug}`,title,intro,`<h1 class=\"text-3xl font-extrabold\">${esc(title)}</h1><p class=\"mt-3\">${esc(intro)}</p><div class=\"mt-6 flex gap-3\"><span class=\"p-3 border rounded-xl\">${esc(salary)}</span><span class=\"p-3 border rounded-xl\">${esc(c.name)}</span></div><div class=\"mt-8\">${link(`/${loc}/salary-worth`,t.nav.tabSalaryWorth)}</div><p class=\"mt-6 text-sm\">${esc(copy.evidenceNote)}</p>`,'Article','monthly',.78);
    }
    for(const r of Object.values(RELOCATION_CORRIDORS)){
      const a=CITIES[r.fromCityId],b=CITIES[r.toCityId]; if(!a||!b)continue; const title=formatLongForm(copy.relocationTitle,{from:a.name,to:b.name}),intro=formatLongForm(copy.relocationIntro,{from:a.name,to:b.name});
      add(`relocation/${r.slug}`,title,intro,`<h1 class=\"text-3xl font-extrabold\">${esc(title)}</h1><p class=\"mt-3\">${esc(intro)}</p>${grid([`<div class=\"p-4 border rounded-xl\"><strong>${esc(a.name)}</strong><span class=\"block text-sm\">${esc(a.currency)} · ${esc(a.colIndexBase100NYC)}</span></div>`,`<div class=\"p-4 border rounded-xl\"><strong>${esc(b.name)}</strong><span class=\"block text-sm\">${esc(b.currency)} · ${esc(b.colIndexBase100NYC)}</span></div>`])}<div class=\"mt-8\">${link(`/${loc}/compare`,t.nav.tabCompare)}</div><p class=\"mt-6 text-sm\">${esc(copy.evidenceNote)}</p>`,'Article');
    }
    for(const r of ALL_EMPIRICAL_REPORTS){
      const title=copy.reportNames[r.id]||r.id,updated=new Intl.DateTimeFormat(intl,{dateStyle:'medium'}).format(new Date(`${r.lastUpdated}T00:00:00Z`));
      add(r.slug,title,copy.reportIntro,`<h1 class=\"text-3xl font-extrabold\">${esc(title)}</h1><p class=\"mt-3\">${esc(copy.reportIntro)}</p><div class=\"mt-6 p-4 border rounded-xl\">${esc(updated)}</div><h2 class=\"mt-8 text-xl font-bold\">${esc(t.common.evidence)}</h2><ul class=\"mt-3 space-y-2\">${r.primarySources.map(s=>`<li><a href=\"${s.url}\" rel=\"noopener noreferrer\">${esc(s.name)}</a></li>`).join('')}</ul>`,'Dataset','monthly',.82);
    }
  }
  return pages;
}
