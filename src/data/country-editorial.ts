/**
 * Bespoke Editorial & Empirical Data Profiles for Major Verified Countries
 * 
 * Provides authentic, localized, data-aware publisher analysis to replace
 * repetitive generic boilerplate on public country intelligence pages.
 */

export interface CountryEditorialProfile {
  countryId: string;
  countryName: string;
  defaultCurrency: string;
  salaryEnvironment: string;
  taxSystemOverview: string;
  socialContributions: string;
  subnationalTaxation: string;
  costOfLivingAndRegionalVariation: string;
  housingAffordability: string;
  purchasingPowerContext: string;
  dataProvenance: 'OBSERVED' | 'DERIVED';
  primarySources: string[];
  lastUpdated: string;
}

export const VERIFIED_COUNTRY_EDITORIAL: Record<string, CountryEditorialProfile> = {
  US: {
    countryId: 'US',
    countryName: 'United States',
    defaultCurrency: 'USD',
    salaryEnvironment:
      'The United States has the biggest and most volatile job market in the world. National median full-time wages sit right around $59,400 according to the BLS. But that national number hides wild swings. While retail and hospitality roles average $32,000 to $48,000, specialized fields like software engineering, private equity, and cardiology regularly pull $150,000 to $350,000+ base pay.',
    taxSystemOverview:
      'Federal income tax runs on seven progressive brackets: 10%, 12%, 22%, 24%, 32%, 35%, and 37%, indexed every year by the IRS. Most single earners take the standard deduction (around $14,600 for single filers, adjusted annually for inflation). Long-term capital gains held for more than a year get favorable rates (0%, 15%, or 20%) rather than standard wage tax rates.',
    socialContributions:
      'FICA payroll taxes take a steady cut: 6.2% for Social Security on earnings up to the annual wage cap ($168,600), plus 1.45% for Medicare with no earnings cap. If you earn over $200,000 as a single filer, an extra 0.9% Additional Medicare tax kicks in. Your employer matches Social Security and Medicare dollar-for-dollar.',
    subnationalTaxation:
      'Where you live in the US makes a giant difference in your take-home pay. Nine states—including Texas, Florida, Washington, and Nevada—charge zero state personal income tax. At the other extreme, California tops out at 13.3%, and New York charges up to 10.9% (plus another 3.88% if you live in NYC). That alone creates a 10% to 14% swing in net pay on the exact same salary.',
    costOfLivingAndRegionalVariation:
      'Purchasing power in America depends heavily on your zip code. Making $100,000 in San Francisco or Manhattan feels like an ordinary middle-class existence once rent is paid. Take that exact same $100,000 to Dallas, Raleigh, or Columbus, and you’re living in a spacious home with money left over to invest every month.',
    housingAffordability:
      'Housing is the primary dividing line. HUD Fair Market Rents show median 1-bedroom apartments exceeding $2,300 to $3,200 a month in coastal tech hubs, while comfortable 1-bedrooms throughout the Midwest and South rent for $950 to $1,350.',
    purchasingPowerContext:
      'Because the US dollar is the world’s reserve currency, Americans enjoy great purchasing power when traveling abroad or buying imported electronics. But high out-of-pocket health insurance deductibles and student loans can quickly eat into that advantage at home.',
    dataProvenance: 'OBSERVED',
    primarySources: ['Internal Revenue Service (IRS Rev. Proc.)', 'US Bureau of Labor Statistics (BLS OEWS & CEX)', 'US Department of Housing and Urban Development (HUD FMR)'],
    lastUpdated: 'October 2026',
  },
  GB: {
    countryId: 'GB',
    countryName: 'United Kingdom',
    defaultCurrency: 'GBP',
    salaryEnvironment:
      'The UK job market is heavily concentrated around London and the South East. The ONS reports national median full-time pay at around £35,000, while London averages closer to £44,400. In Wales, Northern Ireland, and parts of northern England, median earnings drop to £31,000–£34,000.',
    taxSystemOverview:
      'HMRC runs PAYE with a generous £12,570 tax-free Personal Allowance. Above that, you pay 20% Basic Rate up to £50,270, 40% Higher Rate up to £125,140, and 45% Additional Rate above that. Don’t forget: between £100,000 and £125,140, your tax-free allowance gets clawed back by £1 for every £2 earned, creating a brutal 60% marginal tax rate.',
    socialContributions:
      'Employees pay Class 1 National Insurance: 8% on earnings between £12,570 and £50,270, and 2% on earnings above that. Employers also pay 13.8% Secondary National Insurance on earnings over £9,100.',
    subnationalTaxation:
      'Scotland sets its own devolved income tax rates with six bands—including a 21% intermediate rate starting at £26,562 and higher top rates than the rest of the UK. Wales and Northern Ireland stick to English tax bands.',
    costOfLivingAndRegionalVariation:
      'The North-South divide in the UK is very real. Outside London and its commuter belt, rents drop sharply. Cities like Manchester, Leeds, Newcastle, and Glasgow offer vibrant urban living where a salary of £45,000 to £60,000 goes much further.',
    housingAffordability:
      'Rents in southern England put huge pressure on household budgets. Rent eats over 34% of median pay nationwide, and close to 50% in London. On top of rent, tenants must pay local Council Tax, which adds £120 to £200 a month to every home.',
    purchasingPowerContext:
      'The NHS provides healthcare free at the point of use, saving UK residents from the steep monthly insurance premiums common in the US. Supermarket groceries are also very competitively priced compared to mainland Europe or North America.',
    dataProvenance: 'OBSERVED',
    primarySources: ['HM Revenue & Customs (HMRC Statutory Rates)', 'Office for National Statistics (ONS ASHE)', 'Ofgem Domestic Energy Price Cap Statistics'],
    lastUpdated: 'October 2026',
  },
  CA: {
    countryId: 'CA',
    countryName: 'Canada',
    defaultCurrency: 'CAD',
    salaryEnvironment:
      'Canada’s economy is anchored by natural resources in Alberta, tech and banking in Ontario, and tech and forestry in British Columbia. Statistics Canada reports median full-time employment earnings around CA$66,800.',
    taxSystemOverview:
      'Personal taxes are split between federal and provincial governments, collected jointly by the CRA (except in Quebec, which runs Revenu Québec). Federal tax brackets start at 15% and climb to 33%, with an indexed federal basic personal amount.',
    socialContributions:
      'Mandatory payroll withholdings include the Canada Pension Plan (CPP, with a 5.95% base rate plus an enhanced second-tier ceiling) and Employment Insurance (EI, 1.66% up to maximum insurable earnings).',
    subnationalTaxation:
      'Provincial taxes vary widely: Alberta has a flat-like 10% to 15% scale with no provincial sales tax. In contrast, Ontario charges 5.05% to 13.16% plus the Ontario Health Premium, pushing top combined marginal rates over 53.5%.',
    costOfLivingAndRegionalVariation:
      'Vancouver and Toronto are by far the most expensive cities in Canada, driven by sky-high home prices. In contrast, Calgary, Edmonton, Ottawa, and Montreal offer much better housing affordability and allow families to save significantly more.',
    housingAffordability:
      'CMHC data highlights major housing stress in Greater Vancouver and Southern Ontario, where average home prices are 8 to 11 times local median household earnings. Rent control rules vary: Ontario protects pre-November 2018 units, while newer builds have no rent caps.',
    purchasingPowerContext:
      'Provincial healthcare plans (OHIP, MSP) mean you don’t pay out of pocket for doctor visits or hospital stays. The national CA$10-a-day childcare program has also drastically lowered nursery bills for families across most provinces.',
    dataProvenance: 'OBSERVED',
    primarySources: ['Canada Revenue Agency (CRA Payroll Schedules)', 'Statistics Canada (Labour Force Survey & Consumer Prices)', 'Canada Mortgage and Housing Corporation (CMHC)'],
    lastUpdated: 'October 2026',
  },
  AU: {
    countryId: 'AU',
    countryName: 'Australia',
    defaultCurrency: 'AUD',
    salaryEnvironment:
      'ABS figures place national median full-time pay around A$85,000. Australia has one of the highest national minimum wages in the world, which keeps entry-level wages strong across all industries.',
    taxSystemOverview:
      'All personal taxes are collected federally by the ATO—individual Australian states charge zero income tax. You get a tax-free threshold of A$18,200, followed by progressive brackets under the Stage 3 revised tax cuts.',
    socialContributions:
      'Medicare is funded through a 2.0% levy on taxable income. Employers are legally required to contribute an additional 11.5% Superannuation guarantee directly into your retirement account on top of your normal salary.',
    subnationalTaxation:
      'Because states don’t charge income tax, your take-home pay is identical whether you work in Sydney, Melbourne, Brisbane, or Perth. The difference in lifestyle comes down entirely to local rent and living costs.',
    costOfLivingAndRegionalVariation:
      'Sydney and Melbourne are the most expensive cities. Brisbane, Adelaide, and Perth offer somewhat lower living costs and strong local economies in healthcare, education, and resources.',
    housingAffordability:
      'Australian rents are quoted weekly. Low vacancy rates (under 1.5% nationwide) have pushed rents up fast, making finding an apartment very competitive in Sydney and Brisbane.',
    purchasingPowerContext:
      'High wages, mandatory superannuation, and Medicare give Australians strong financial security. The Australian dollar fluctuates with global commodity markets, which influences the cost of overseas holidays and imported goods.',
    dataProvenance: 'OBSERVED',
    primarySources: ['Australian Taxation Office (ATO Tax Tables)', 'Australian Bureau of Statistics (ABS Average Weekly Earnings)', 'Reserve Bank of Australia (RBA Economic Bulletins)'],
    lastUpdated: 'October 2026',
  },
  DE: {
    countryId: 'DE',
    countryName: 'Germany',
    defaultCurrency: 'EUR',
    salaryEnvironment:
      'Germany is Europe’s industrial heavyweight. Destatis records the median full-time gross salary at roughly €44,000. Pay in southern powerhouses (Bavaria, Baden-Württemberg) and Frankfurt runs 15% to 25% higher than in eastern and rural states.',
    taxSystemOverview:
      'German income tax (Einkommensteuer) uses a continuous progressive mathematical formula rather than discrete steps. It starts after the tax-free allowance (Grundfreibetrag) and scales from 14% up to 42% (around €66,760 for singles), reaching 45% (Reichensteuer) only for top incomes over €277,826.',
    socialContributions:
      'Statutory social contributions (Sozialversicherung) cover four mandatory programs split 50/50 with your employer: pension (18.6%), health insurance (14.6% + surcharge), unemployment (2.6%), and long-term nursing care (up to 4%).',
    subnationalTaxation:
      'Income tax formulas are uniform across all 16 federal states. If you’re a registered church member, you pay an extra 8% (Bavaria/Baden-Württemberg) or 9% (other states) Kirchensteuer.',
    costOfLivingAndRegionalVariation:
      'Munich is the most expensive city in Germany by a wide margin, followed by Frankfurt, Stuttgart, and Berlin. Medium-sized university cities and eastern hubs like Leipzig provide very comfortable living on standard collective-bargaining salaries.',
    housingAffordability:
      'Germany is a nation of renters—homeownership is around 47%. The rental brake (Mietpreisbremse) limits rent increases on existing leases, though new construction and freshly renovated flats command open-market rates.',
    purchasingPowerContext:
      'State benefits like €250/month Kindergeld per child, parental leave benefits (Elterngeld), tuition-free universities, and the €49/month Deutschlandticket help balance out Germany’s high payroll deductions.',
    dataProvenance: 'OBSERVED',
    primarySources: ['Statistisches Bundesamt (Destatis Verdienste)', 'Bundesministerium der Finanzen (BMF Steuerberechnung)', 'Bundesagentur für Arbeit (Entgeltatlas)'],
    lastUpdated: 'October 2026',
  },
  AE: {
    countryId: 'AE',
    countryName: 'United Arab Emirates',
    defaultCurrency: 'AED',
    salaryEnvironment:
      'The UAE talent market is driven almost entirely by international expats. Professional multinational packages typically range from 20,000 to 45,000 AED a month (240,000 to 540,000 AED annually), while executive roles frequently exceed 50,000 AED a month.',
    taxSystemOverview:
      'The UAE levies 0% personal income tax, 0% capital gains tax, and 0% wealth tax on individual pay. What your contract says is what lands in your bank account—there are zero payroll tax withholdings.',
    socialContributions:
      'Foreign expat employees don’t pay social security or pension contributions. Instead, UAE labor law requires employers to pay an End of Service Gratuity (EOSG) lump sum based on your tenure when your contract ends.',
    subnationalTaxation:
      'Neither Dubai, Abu Dhabi, nor the other emirates charge personal income taxes. You do pay local municipal fees, like Dubai’s 5% housing fee on utility bills and 5% VAT on consumer purchases.',
    costOfLivingAndRegionalVariation:
      'Dubai and Abu Dhabi have the highest everyday costs and rents. Sharjah, Ajman, and Ras Al Khaimah offer much cheaper housing, making them popular for people willing to commute.',
    housingAffordability:
      'Rents are paid upfront in 1 to 4 cheques over the year. Landlord-tenant rules are strictly enforced by RERA and municipal rental dispute centers, which regulate annual rent increase caps.',
    purchasingPowerContext:
      'The UAE Dirham is pegged to the US Dollar (3.6725 AED = 1 USD), ensuring complete exchange rate stability. Skipping income tax allows expats to save rapidly, though you must budget for private international school tuition and family healthcare.',
    dataProvenance: 'OBSERVED',
    primarySources: ['UAE Federal Competitiveness and Statistics Centre (FCSC)', 'UAE Federal Tax Authority (FTA)', 'Central Bank of the UAE (Economic Reports)'],
    lastUpdated: 'October 2026',
  },
  SG: {
    countryId: 'SG',
    countryName: 'Singapore',
    defaultCurrency: 'SGD',
    salaryEnvironment:
      'Singapore is Southeast Asia’s primary corporate and financial center. Ministry of Manpower (MOM) data puts median resident monthly pay at S$5,197 (around S$62,360 a year). In finance, tech, and regional management, salaries routinely run from S$120,000 to S$250,000+.',
    taxSystemOverview:
      'IRAS runs one of the most attractive progressive tax systems in the world: rates start at 0%, reach 15% at S$160,000, and top out at 24% for earnings over S$1,000,000.',
    socialContributions:
      'Central Provident Fund (CPF) contributions are mandatory for Singapore Citizens and Permanent Residents. Foreign expats on Employment Passes do not pay CPF, meaning they retain their gross salary minus only the modest annual income tax.',
    subnationalTaxation:
      'Singapore is a unified city-state, so there are no provincial or city taxes. Property tax applies based on the Annual Value of your home, with lower rates for owner-occupiers.',
    costOfLivingAndRegionalVariation:
      'Singapore is often ranked among the world’s most expensive cities, driven by high private car prices (via the COE system) and private condo rents. On the other hand, public MRT transit and neighborhood hawker food are remarkably cheap.',
    housingAffordability:
      'Around 80% of citizens live in subsidized HDB flats. Expats mostly rent private condos with pools and gyms, where median 1-bedroom apartments cost S$3,000 to S$4,200 a month.',
    purchasingPowerContext:
      'Zero capital gains tax, zero dividend tax, and single-digit effective income tax rates make Singapore an unmatched jurisdiction for building personal wealth and investing.',
    dataProvenance: 'OBSERVED',
    primarySources: ['Ministry of Manpower Singapore (MOM Labour Force Reports)', 'Inland Revenue Authority of Singapore (IRAS Annual Reports)', 'Department of Statistics Singapore (SingStat)'],
    lastUpdated: 'October 2026',
  },
};

export function renderCountryEditorialHtml(countryId: string): string {
  const profile = VERIFIED_COUNTRY_EDITORIAL[countryId];
  if (!profile) return '';

  return `
    <div class="mt-8 space-y-8">
      <!-- Section 1: National Salary & Employment Context -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">National Salary &amp; Employment Environment in ${profile.countryName}</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.salaryEnvironment}
        </p>
      </section>

      <!-- Section 2: Statutory Tax System Overview -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Personal Income Tax System &amp; Statutory Brackets</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.taxSystemOverview}
        </p>
      </section>

      <!-- Section 3: Mandatory Social Contributions -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Mandatory Social Contributions &amp; Public Insurance</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.socialContributions}
        </p>
      </section>

      <!-- Section 4: Subnational Taxation -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Subnational, Regional &amp; Municipal Tax Considerations</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.subnationalTaxation}
        </p>
      </section>

      <!-- Section 5: Cost of Living Variation -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">National Cost of Living &amp; Inter-Metropolitan Disparities</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.costOfLivingAndRegionalVariation}
        </p>
      </section>

      <!-- Section 6: Housing Affordability -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Housing Market Dynamics &amp; Rental Affordability</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.housingAffordability}
        </p>
      </section>

      <!-- Section 7: Currency & Purchasing Power -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">National Currency &amp; Global Purchasing Power Context</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.purchasingPowerContext}
        </p>
      </section>

      <!-- Section 8: Data Provenance & Freshness -->
      <section class="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-900">Data Provenance:</span>
          <span class="px-2 py-0.5 rounded font-bold ${profile.dataProvenance === 'OBSERVED' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-800'}">${profile.dataProvenance}</span>
        </div>
        <div>
          <span class="font-semibold text-slate-700">Primary Official Sources:</span>
          <span class="text-slate-600">${profile.primarySources.join(', ')}</span>
        </div>
        <div class="text-slate-500">
          Last reviewed: ${profile.lastUpdated} • Methodology: Primary revenue authority gazettes, central bank statistics, and national labor surveys.
        </div>
      </section>
    </div>
  `;
}
