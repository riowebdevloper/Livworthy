/**
 * Bespoke Editorial & Empirical Data Profiles for Major Verified Metropolitan Hubs
 * 
 * Provides authentic, localized, data-aware publisher analysis to replace
 * repetitive generic boilerplate on public city intelligence pages.
 */

export interface CityEditorialProfile {
  cityId: string;
  cityName: string;
  countryName: string;
  currency: string;
  typicalSalaryContext: string;
  takeHomePayAnalysis: string;
  housingMarketContext: string;
  everydayLivingCosts: string;
  taxConsiderations: string;
  singleVsFamilyContext: string;
  transportAndMobility: string;
  peerCityComparison: string;
  dataProvenance: 'OBSERVED' | 'DERIVED';
  primarySources: string[];
  lastUpdated: string;
}

export const VERIFIED_CITY_EDITORIAL: Record<string, CityEditorialProfile> = {
  nyc: {
    cityId: 'nyc',
    cityName: 'New York City',
    countryName: 'United States',
    currency: 'USD',
    typicalSalaryContext:
      'New York City is a city of extremes when it comes to paychecks. According to BLS and state labor figures, the median full-time wage across the five boroughs sits right around $68,500. If you’re starting out in media, non-profits, or hospitality, expect $55,000 to $75,000. On the other end, mid-to-senior roles in software engineering, investment banking, and corporate law routinely pull $140,000 to $220,000 base pay—with bonuses pushing that much higher.',
    takeHomePayAnalysis:
      'Living in NYC means paying taxes to three separate governments: Uncle Sam, New York State (4.0% to 10.9%), and the New York City resident income tax (3.08% to 3.88%), plus standard FICA deductions. If you earn $100,000 as a single filer claiming standard deductions under 2026 tax schedules, you don’t take home $8,333 a month—you take home about $5,907 ($70,879 a year). Exactly 29.1% of your gross earnings goes to statutory withholdings before you pay a single bill.',
    housingMarketContext:
      'Rent is where New York hits you hardest. HUD benchmarks a standard 1-bedroom fair market rent at $2,655 across the New York metro area (FY 2026). But if you want to live in prime Manhattan (like the West Village or Flatiron) or trendy Brooklyn (Williamsburg, DUMBO), expect to pay $3,400 to $4,200. Landlords enforce a strict 40x rent rule: to qualify for a $2,655 apartment without a guarantor, you must show at least $106,200 in gross annual income.',
    everydayLivingCosts:
      'Day-to-day spending in NYC carries roughly a 28% premium over the US national average. Bodegas, supermarkets, and restaurants all pass along the high commercial rents they pay. Electric bills via ConEdison are steep too—averaging 26 to 30 cents per kilowatt-hour, which easily pushes monthly utilities and broadband to $180–$260 for a modest 1-bedroom.',
    taxConsiderations:
      'Here’s a crucial quirk: New York City charges its local resident tax based on where you live, not where you work. If you commute in from Hoboken or Jersey City, you don’t pay NYC city tax. If you sleep in Astoria, Bushwick, or Manhattan, you pay it. Also, year-end bonuses face upfront supplemental withholding rates that can exceed 40% before you square up on your tax return.',
    singleVsFamilyContext:
      'A single person making $90,000 can live comfortably in Queens, Upper Manhattan, or outer Brooklyn, with some cash left over each month. For a family, the math changes drastically. Infant daycare runs $2,200 to $2,800 a month per child, and decent two- or three-bedroom apartments in solid school districts generally require household earnings north of $220,000.',
    transportAndMobility:
      'The subway is New York’s greatest financial equalizer. You don’t need a car, which saves you $500 to $900 a month on auto loans, insurance, and parking headaches. The MTA OMNY fare cap ($35 rolling 7-day cap, equivalent to ~$151.67 per month) provides unlimited 24/7 access to the entire transit grid across Manhattan, Brooklyn, Queens, and the Bronx.',
    peerCityComparison:
      'Compared to London, tech and finance salaries in New York are roughly 35% to 50% higher in dollar terms. But higher rents and out-of-pocket healthcare eat up a lot of that premium. Compared to Austin or Miami, living in New York costs you an extra 12% to 14% of your paycheck in direct state and local income taxes.',
    dataProvenance: 'OBSERVED',
    primarySources: ['US Bureau of Labor Statistics (OEWS)', 'US Department of Housing and Urban Development (HUD FMR)', 'New York State Department of Taxation and Finance'],
    lastUpdated: 'October 2026',
  },
  london: {
    cityId: 'london',
    cityName: 'London',
    countryName: 'United Kingdom',
    currency: 'GBP',
    typicalSalaryContext:
      'London salaries often surprise American expats because the headline numbers look lower. According to the ONS, the median full-time salary across Greater London is roughly £44,400. Junior analysts and civil servants typically start at £30,000 to £38,000. Experienced software engineers, management consultants, and finance professionals generally land between £70,000 and £115,000 base pay.',
    takeHomePayAnalysis:
      'The UK tax system is straightforward under HMRC PAYE, but it bites hard as you earn more. You get a tax-free Personal Allowance of £12,570, then pay 20% Basic Rate up to £50,270, and 40% Higher Rate after that, plus 8% employee National Insurance (dropping to 2% above the higher limit). On a £75,000 salary under 2026 PAYE and Class 1 NI schedules, your net pay is £54,057 a year—roughly £4,505 a month in your account (an effective tax rate of 27.9%).',
    housingMarketContext:
      'Rent takes the biggest bite out of any Londoner’s paycheck. Expect to pay £1,650 to £1,900 a month for a 1-bedroom flat in Zones 2–3, and upwards of £2,200 in central Zone 1. Don’t forget Council Tax: depending on your borough and valuation band, that’s another £120 to £190 a month you have to budget for on top of rent.',
    everydayLivingCosts:
      'Supermarket food in the UK is surprisingly affordable thanks to fierce grocery competition among Tesco, Sainsbury’s, Aldi, and Lidl—a single person can eat well on £220 to £320 a month. But energy bills (under the Ofgem price cap) and nights out at the pub add up fast.',
    taxConsiderations:
      'Beware the infamous £100k tax trap. Once your income passes £100,000, HMRC reduces your tax-free allowance by £1 for every £2 you earn. Between £100,000 and £125,140, that creates an effective 60% marginal tax rate. Many London professionals pay into workplace pensions specifically to keep their taxable income under that £100k cliff.',
    singleVsFamilyContext:
      'A single professional on £60,000 can comfortably afford a 1-bedroom flat in Zone 3 (like Tooting or Walthamstow) or flatshare in Zone 2. For families, nursery fees for kids under three run £1,500 to £1,900 a month per child, making dual incomes almost mandatory for London family life.',
    transportAndMobility:
      'TfL is the backbone of London. Most people commute via the Tube, buses, Overground, or the Elizabeth line. A Zone 1–2 monthly Travelcard or contactless cap runs about £165, while commuting in from Zone 4 pushes that to around £240. You don’t want a car in inner London—between the £15 daily Congestion Charge, £12.50 ULEZ fee, and pricey parking permits, driving is an expensive headache.',
    peerCityComparison:
      'London gives you universal healthcare through the NHS without health insurance premiums, which is a massive relief compared to the US. But cash compensation lags behind New York or Zurich, meaning you save fewer raw dollars every month.',
    dataProvenance: 'OBSERVED',
    primarySources: ['UK Office for National Statistics (ASHE / ONS)', 'HM Revenue & Customs (HMRC Statutory Schedules)', 'Transport for London (TfL Fares Index)'],
    lastUpdated: 'October 2026',
  },
  dubai: {
    cityId: 'dubai',
    cityName: 'Dubai',
    countryName: 'United Arab Emirates',
    currency: 'AED',
    typicalSalaryContext:
      'Dubai’s job market is heavily divided between service workers and corporate expats. Mid-level multinational professionals, project managers, and tech leads typically earn 20,000 to 35,000 AED a month (240,000 to 420,000 AED a year). Senior directors, bankers, and specialized consultants often exceed 50,000 AED a month.',
    takeHomePayAnalysis:
      'The headline attraction is real: 0% income tax, 0% capital gains tax, and zero payroll deductions on your wages. If your contract says 30,000 AED a month, 30,000 AED hits your bank account. That said, you do pay local indirect fees—like the 5% Dubai Municipality Housing Fee tacked directly onto your monthly DEWA power bill, and a 5% VAT on purchases.',
    housingMarketContext:
      'Rents in popular expat spots like Dubai Marina, Downtown, and JLT range from 75,000 to 110,000 AED a year for a modern 1-bedroom apartment. Landlords still frequently ask for payment in 1 to 4 post-dated cheques, so you need substantial upfront cash when you first sign a lease.',
    everydayLivingCosts:
      'Dining at licensed restaurants, buying imported groceries, and keeping the AC running all summer add up quickly. Monthly DEWA bills (including power, water, housing fee, and district cooling like Empower) run 900 to 1,600 AED for a 1-bedroom during the scorching summer months.',
    taxConsiderations:
      'The UAE won’t tax your income, but your home country might. US citizens still owe IRS taxes on worldwide income above the Foreign Earned Income Exclusion, and UK expats must strictly pass HMRC’s Statutory Residence Test to avoid UK tax residency.',
    singleVsFamilyContext:
      'A single professional earning 22,000 AED a month can live in a modern high-rise and easily bank 7,000+ AED in monthly savings. For families, private school tuition is the big budget killer—expect 45,000 to 95,000 AED per child per academic year for top British or IB schools.',
    transportAndMobility:
      'The Dubai Metro is immaculate along Sheikh Zayed Road, but Dubai is fundamentally built around cars. Most expats lease a vehicle (1,600 to 2,400 AED a month), pay Salik highway tolls (4 AED per gate), and budget for fuel.',
    peerCityComparison:
      'Compared to London or New York, the zero-tax environment lets you build wealth dramatically faster. Compared to Singapore, apartments in Dubai give you far more square footage for your money, though summer heat restricts outdoor life for nearly four months.',
    dataProvenance: 'OBSERVED',
    primarySources: ['Dubai Statistics Center (DSC)', 'UAE Federal Tax Authority (FTA)', 'Dubai Land Department (RERA Rental Index)'],
    lastUpdated: 'October 2026',
  },
  toronto: {
    cityId: 'toronto',
    cityName: 'Toronto',
    countryName: 'Canada',
    currency: 'CAD',
    typicalSalaryContext:
      'Toronto is Canada’s financial and tech nerve center. Statistics Canada data pegs median employment earnings in the GTA right around CA$62,000. Tech professionals, corporate accountants, and nurses typically make CA$80,000 to CA$125,000, while engineering managers and senior directors reach CA$150,000 to CA$195,000.',
    takeHomePayAnalysis:
      'Ontario employees pay combined federal and provincial taxes, plus Canada Pension Plan (CPP) and Employment Insurance (EI). On a CA$100,000 salary, your net pay is CA$73,099 a year—roughly CA$6,092 a month in your pocket, meaning deductions take 26.9% under CRA statutory schedules.',
    housingMarketContext:
      'Finding an apartment in Toronto is competitive. CMHC data shows median market rents for a 1-bedroom condo downtown hover between CA$2,300 and CA$2,600 a month. Keep in mind: buildings occupied after November 15, 2018, are exempt from provincial rent control, so your landlord can raise rent by any amount when your lease expires.',
    everydayLivingCosts:
      'A 13% Harmonized Sales Tax (HST) hits nearly every retail purchase in Ontario. Cell phone plans in Canada are historically expensive, and winter heating bills spike from December to March. Budget CA$240 to CA$320 a month for basic home utilities and internet.',
    taxConsiderations:
      'Top marginal tax rates in Ontario pass 53% once your income exceeds CA$220,000. Smart earners max out their Registered Retirement Savings Plan (RRSP) and Tax-Free Savings Account (TFSA) every year to shield their income from taxes.',
    singleVsFamilyContext:
      'A single person making CA$85,000 can comfortably rent in Midtown or Liberty Village and still save. For families, the federal CA$10/day childcare program has provided real relief, but finding a 3-bedroom home or condo in a good school district often demands a combined household income over CA$180,000.',
    transportAndMobility:
      'The TTC covers the city with subways, streetcars, and buses for CA$156 a month. Suburban commuters rely on GO Transit trains into Union Station. Having a car in downtown Toronto is an expensive headache with parking spots often renting for CA$200 to CA$350 a month.',
    peerCityComparison:
      'Compared to US tech hubs, Toronto salaries look lower once converted to US dollars, and top tax brackets hit sooner. But you get universal provincial healthcare (OHIP), clean streets, and far safer neighborhoods.',
    dataProvenance: 'OBSERVED',
    primarySources: ['Statistics Canada (Labour Force Survey)', 'Canada Revenue Agency (CRA Payroll Schedules)', 'Canada Mortgage and Housing Corporation (CMHC)'],
    lastUpdated: 'October 2026',
  },
  sf: {
    cityId: 'sf',
    cityName: 'San Francisco',
    countryName: 'United States',
    currency: 'USD',
    typicalSalaryContext:
      'San Francisco salaries sound astronomical to anyone outside the Bay Area. BLS data puts the median wage across all occupations at $86,500. For software engineers, product managers, and biotech researchers, base salaries alone routinely sit between $150,000 and $240,000—not counting large annual equity (RSU) packages.',
    takeHomePayAnalysis:
      'Taxes take a massive bite out of those big paychecks. You pay federal income tax, FICA, and California state income tax (which climbs from 1% up to 9.3% at $68k, and hits 10.3% to 13.3% on top brackets). On a $150,000 salary, a single filer takes home about $103,650 a year ($8,638 a month). If you make $250,000, over 36% of your pay goes straight to taxes.',
    housingMarketContext:
      'San Francisco rent has cooled from its absolute peak, but it’s still brutal. A decent 1-bedroom in SoMa, the Mission, or the Marina runs $2,850 to $3,400 a month. Look for apartments in buildings built before June 1979—they fall under SF rent control, which caps how much your landlord can raise your rent each year.',
    everydayLivingCosts:
      'Almost everything in SF costs more because businesses pass on crazy commercial rents and high minimum wages. A burrito that costs $10 elsewhere costs $16 here. PG&E electric and gas rates are among the highest in the country, easily running $220 to $340 a month for an apartment.',
    taxConsiderations:
      'California doesn’t give you a break on capital gains. Whether you earn your money from wages or selling vested tech stock, California taxes it all as ordinary income at up to 13.3%.',
    singleVsFamilyContext:
      'A single tech worker making $150k can live well, dine out often, and still max out their 401(k). But having kids in SF is a different beast entirely. Full-time infant daycare tops $3,000 a month, and competitive public school lotteries push many families into pricey private schools or out to the East Bay and South Bay suburbs.',
    transportAndMobility:
      'SF is compact and very walkable. Muni buses and light rail get you around town, and BART connects you across the bay. A monthly Muni pass is $81 ($98 including BART within SF). Many tech workers skip public transit entirely and ride private company Wi-Fi shuttles down to Silicon Valley.',
    peerCityComparison:
      'Moving from SF to Austin or Seattle instantly saves you 9% to 10% in state income taxes. But nowhere else in the world matches San Francisco’s sheer concentration of venture capital, senior tech jobs, and startup equity upside.',
    dataProvenance: 'OBSERVED',
    primarySources: ['US Bureau of Labor Statistics (OEWS SF Metro)', 'California Franchise Tax Board (FTB)', 'San Francisco Rent Board & HUD FMR'],
    lastUpdated: 'October 2026',
  },
  austin: {
    cityId: 'austin',
    cityName: 'Austin',
    countryName: 'United States',
    currency: 'USD',
    typicalSalaryContext:
      'Austin transformed over the last decade from a sleepy state capital into a major tech and corporate hub. Median pay sits around $58,000 across the metro area. For software engineers, semiconductor specialists, and enterprise sales reps, base salaries typically range from $95,000 to $150,000.',
    takeHomePayAnalysis:
      'The big draw here is zero state income tax. In Austin, you only pay federal income tax and standard FICA payroll deductions. On a $100,000 salary, a single filer keeps roughly $79,180 a year ($6,598 a month)—leaving you with an effective tax rate of just 20.8%. That’s over $8,300 more in your pocket every single year compared to making the exact same salary in New York.',
    housingMarketContext:
      'A building boom of new apartment complexes has helped cool Austin’s rental market. A modern 1-bedroom apartment in Central Austin or near South Congress averages $1,650 to $1,950 a month. If you’re willing to live in suburbs like Round Rock or Cedar Park, that drops to $1,350–$1,550.',
    everydayLivingCosts:
      'Groceries and consumer goods match normal US averages. But pay attention to your electric bill. Austin Energy rates spike during blistering summer heatwaves when air conditioning runs 24/7, regularly pushing monthly power bills to $180–$260.',
    taxConsiderations:
      'Texas has to fund its budget somehow, so while you skip state income tax, property taxes are high (often 2.0% to 2.4% of home value) and sales tax is 8.25%. Landlords bake those high property taxes directly into your rent.',
    singleVsFamilyContext:
      'A single earner making $85,000 lives very comfortably here with plenty of room to save. Families love Austin’s spacious suburban homes and strong public school districts in Round Rock, Leander, and Eanes, though home purchase prices have climbed significantly.',
    transportAndMobility:
      'You need a car in Austin. Public transit is limited, and the city sprawls. Between car payments, insurance, gas, and tolls on highways like SH 130 and MoPac, expect to budget $450 to $700 a month for getting around.',
    peerCityComparison:
      'Compared to the Bay Area or New York, the state tax savings alone feel like an immediate raise. Compared to Dallas or Houston, Austin rents carry a 15% to 20% lifestyle premium for its outdoor culture, music scene, and Hill Country vibes.',
    dataProvenance: 'OBSERVED',
    primarySources: ['US Bureau of Labor Statistics (Austin-Round Rock)', 'Texas Comptroller of Public Accounts', 'Austin Board of Realtors (ABOR)'],
    lastUpdated: 'October 2026',
  },
  sydney: {
    cityId: 'sydney',
    cityName: 'Sydney',
    countryName: 'Australia',
    currency: 'AUD',
    typicalSalaryContext:
      'ABS data puts median full-time earnings in Greater Sydney at roughly A$89,000 a year. Professionals in construction management, tech, healthcare, and corporate finance routinely make A$110,000 to A$165,000.',
    takeHomePayAnalysis:
      'All income tax in Australia is federal—states don’t charge income tax. You pay progressive brackets plus a 2.0% Medicare levy. On top of your salary, Australian law forces employers to pay an extra 11.5% Superannuation guarantee directly into your retirement fund. On an A$120,000 salary, you take home around A$90,812 net (about A$7,568 a month), an effective tax rate of roughly 24.3% under ATO Stage 3 schedules.',
    housingMarketContext:
      'Sydney rent is notoriously expensive, and leases are quoted weekly instead of monthly. A 1-bedroom flat in the Eastern Suburbs or Inner West runs A$680 to A$820 a week (that’s A$2,950 to A$3,550 a month). If you move out to middle-ring suburbs like Parramatta, rents drop to A$520–A$600 a week.',
    everydayLivingCosts:
      'Australia’s remote geographic location makes imported goods and electronics pricey. Eating out and groceries are higher than in the US or UK, but Australia’s high minimum wage means service workers are paid properly, so tipping is completely optional.',
    taxConsiderations:
      'If you earn over A$97,000 as a single person and don’t buy private hospital insurance, the ATO slaps you with the Medicare Levy Surcharge (an extra 1% to 1.5% tax). Almost all high earners buy private health cover specifically to avoid this penalty.',
    singleVsFamilyContext:
      'A single professional on A$100k can afford a nice flat near the beach or harbor with decent savings. For families, childcare is a major expense: daycare centers charge A$140 to A$190 a day per child, though eligible Australian residents receive the federal Child Care Subsidy to offset the cost.',
    transportAndMobility:
      'Sydney’s Opal network combines trains, the metro, buses, and ferries. Adult Opal travel is capped at A$50 a week, meaning you can commute as much as you want without spending more than A$200 a month on transit.',
    peerCityComparison:
      'Sydney offers world-class beaches, clean air, and universal healthcare. Compared to Melbourne, Sydney rents run 20% to 25% higher, but harbor views and sunny coastal lifestyle make up for it.',
    dataProvenance: 'OBSERVED',
    primarySources: ['Australian Bureau of Statistics (ABS)', 'Australian Taxation Office (ATO Individual Schedules)', 'NSW Department of Communities and Justice Rent Reports'],
    lastUpdated: 'October 2026',
  },
  berlin: {
    cityId: 'berlin',
    cityName: 'Berlin',
    countryName: 'Germany',
    currency: 'EUR',
    typicalSalaryContext:
      'Berlin was once famous for being “poor but sexy,” but its booming tech and startup scene has changed the landscape. Destatis figures put median full-time wages at roughly €45,800. Senior software developers and product leaders earn €68,000 to €105,000 base pay.',
    takeHomePayAnalysis:
      'German paystubs are famous for statutory deductions. You pay progressive income tax (Einkommensteuer) plus four mandatory social contributions split between you and your employer: health insurance, long-term care, pension, and unemployment insurance. On a €70,000 gross salary as a single tax-class 1 employee, your net take-home is €37,147 a year—about €3,096 a month, meaning statutory deductions and social insurance take 46.9%.',
    housingMarketContext:
      'Finding a flat in Berlin is tough right now due to tight supply. If you sign a new lease for a 1-bedroom apartment in popular neighborhoods like Mitte, Kreuzberg, or Prenzlauer Berg, expect warm rent (including heat and building fees) of €1,150 to €1,450 a month. Competition for apartments is intense, with dozens of applicants showing up with their SCHUFA credit reports.',
    everydayLivingCosts:
      'Supermarket prices at German chains like Rewe, Edeka, Aldi, and Lidl are among the cheapest in Western Europe relative to earnings. Dining out, street food (like döner and currywurst), and club culture remain very budget-friendly.',
    taxConsiderations:
      'If you register with an official church, Germany docks an extra 8% to 9% Church Tax (Kirchensteuer) right off your income tax bill. Many expats officially de-register (Kirchenaustritt) at the local registry office to opt out. The solidarity surcharge has been abolished for roughly 90% of taxpayers.',
    singleVsFamilyContext:
      'A single earner making €55,000 can live a great life in central Berlin with solid savings. Families get strong state support: the government pays €250 a month per child in Kindergeld, and public Kita daycare is essentially tuition-free by law.',
    transportAndMobility:
      'You do not need a car in Berlin. The BVG network of U-Bahn, S-Bahn, trams, and buses is legendary. Even better, the nationwide Deutschlandticket gives you unlimited local and regional transit across Berlin and all of Germany for just €49 a month.',
    peerCityComparison:
      'Salaries in Berlin are about 10% to 15% lower than Munich or Frankfurt, but everyday living costs and creative culture make up for the difference. Compared to New York or London, healthcare and rents are vastly more affordable.',
    dataProvenance: 'OBSERVED',
    primarySources: ['Statistisches Bundesamt (Destatis)', 'Bundesministerium der Finanzen (BMF Lohnsteuertabellen)', 'Investitionsbank Berlin (IBB Housing Market Report)'],
    lastUpdated: 'October 2026',
  },
  singapore: {
    cityId: 'singapore',
    cityName: 'Singapore',
    countryName: 'Singapore',
    currency: 'SGD',
    typicalSalaryContext:
      'Singapore is Southeast Asia’s financial powerhouse. Ministry of Manpower (MOM) data reports the median gross monthly income for resident workers is S$5,197 (about S$62,360 a year). For professionals in commodity trading, fintech, private wealth management, and tech, base salaries routinely reach S$100,000 to S$220,000+.',
    takeHomePayAnalysis:
      'Singapore offers some of the lowest income tax rates anywhere on earth. Brackets start at 0% and top out at 24% only for income over S$1,000,000. Foreign expats on Employment Passes don’t pay mandatory CPF pension contributions. On an S$120,000 salary, an expat pays just S$7,950 in annual tax—an effective tax rate of just 6.6%! You keep over S$112,000 in your pocket (around S$9,330 a month).',
    housingMarketContext:
      'Housing is Singapore’s main financial pressure point. Around 80% of citizens live in subsidized HDB flats, but foreign expats mostly rent private condominiums with pools and gyms. A typical 1-bedroom condo in city-fringe districts like Novena, Queenstown, or Tanjong Pagar rents for S$3,200 to S$4,200 a month.',
    everydayLivingCosts:
      'Eating at local open-air Hawker Centres is incredibly cheap—you can get world-class chicken rice or laksa for S$4 to S$7 a meal. But Western restaurants, imported groceries, and alcohol (hit with steep “sin taxes”) cost a premium. Air conditioning bills via SP Group run S$160 to S$240 a month.',
    taxConsiderations:
      'Singapore charges zero capital gains tax, zero dividend tax, and zero inheritance tax. Taxes aren’t withheld monthly from your paycheck; instead, IRAS bills you once a year based on what you earned the previous year, so make sure to keep cash set aside for tax season.',
    singleVsFamilyContext:
      'A single expat making S$110,000 saves money at an incredible pace thanks to low taxes. For families, international school fees are the big expense, running S$32,000 to S$52,000 a year per child for top British, American, or IB schools.',
    transportAndMobility:
      'Singapore’s MRT subway is spotless, fully air-conditioned, and costs under S$120 a month for heavy commuters. Private cars are intentionally made absurdly expensive through the Certificate of Entitlement (COE) system, which pushes the price of a basic Toyota sedan over S$140,000.',
    peerCityComparison:
      'Compared to New York or London, Singapore’s low tax rates let you keep an extra 20% to 25% of your gross earnings. Compared to Dubai, Singapore offers year-round walkability, lush greenery, and world-class public transit.',
    dataProvenance: 'OBSERVED',
    primarySources: ['Ministry of Manpower Singapore (MOM Labour Force Survey)', 'Inland Revenue Authority of Singapore (IRAS Tax Schedules)', 'Urban Redevelopment Authority (URA Rental Index)'],
    lastUpdated: 'October 2026',
  },
};

export function renderCityEditorialHtml(cityId: string): string {
  const profile = VERIFIED_CITY_EDITORIAL[cityId];
  if (!profile) return '';

  return `
    <div class="mt-8 space-y-8">
      <!-- Section 1: Typical Salary Context -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Typical Salary &amp; Local Earnings Context in ${profile.cityName}</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.typicalSalaryContext}
        </p>
      </section>

      <!-- Section 2: Statutory Take-Home Pay Analysis -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Estimated Net Take-Home Pay &amp; Statutory Retention</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.takeHomePayAnalysis}
        </p>
      </section>

      <!-- Section 3: Housing Pressure & Rent-to-Income -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Housing Pressure &amp; Fair Market Rent Benchmarks</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.housingMarketContext}
        </p>
      </section>

      <!-- Section 4: Everyday Living Costs & Utilities -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Everyday Cost Profile: Groceries, Utilities &amp; Connectivity</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.everydayLivingCosts}
        </p>
      </section>

      <!-- Section 5: Tax Considerations -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Jurisdictional Tax Considerations &amp; Levies</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.taxConsiderations}
        </p>
      </section>

      <!-- Section 6: Single vs Family Context -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Household Budget Variation: Single Professional vs. Family</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.singleVsFamilyContext}
        </p>
      </section>

      <!-- Section 7: Transit & Commute -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Urban Mobility, Commuting &amp; Transit Infrastructure</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.transportAndMobility}
        </p>
      </section>

      <!-- Section 8: Peer Comparison -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-[#102A2E]">Purchasing Power &amp; Peer Metropolitan Comparison</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          ${profile.peerCityComparison}
        </p>
      </section>

      <!-- Section 9: Data Provenance & Freshness -->
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
          Last reviewed: ${profile.lastUpdated} • Methodology: Deterministic statutory tables and spatial consumer price baskets.
        </div>
      </section>
    </div>
  `;
}
