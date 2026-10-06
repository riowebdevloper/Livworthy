export interface RelocationRoute {
  slug: string;
  fromCityId: string;
  toCityId: string;
  headline: string;
  editorialNote: string;
  keyQuestions: string[];
}

export const RELOCATION_ROUTES: RelocationRoute[] = [
  {
    slug: 'new-york-to-london',
    fromCityId: 'nyc',
    toCityId: 'london',
    headline: 'Moving from New York to London: salary, tax and living-cost decision guide',
    editorialNote: 'This move is rarely decided by headline salary alone. Compare after-tax income, housing, healthcare structure, commute costs and the currency your savings will ultimately be held in.',
    keyQuestions: ['How much gross pay replaces your current NYC disposable income?', 'How does rent choice change the comparison?', 'What happens to savings after USD/GBP conversion?'],
  },
  {
    slug: 'new-york-to-dubai',
    fromCityId: 'nyc',
    toCityId: 'dubai',
    headline: 'Moving from New York to Dubai: salary and purchasing-power guide',
    editorialNote: 'Dubai can create a large tax difference for employees, but housing, schooling, insurance and relocation benefits can dominate the final outcome. Compare the entire package rather than tax rate alone.',
    keyQuestions: ['What base salary preserves your current savings rate?', 'Is housing included in the offer?', 'How valuable are insurance, flights and relocation allowances?'],
  },
  {
    slug: 'london-to-dubai',
    fromCityId: 'london',
    toCityId: 'dubai',
    headline: 'Moving from London to Dubai: take-home pay and relocation guide',
    editorialNote: 'A London-to-Dubai offer often looks attractive on net pay. The useful comparison is net cash after realistic rent, transport, insurance and any family costs.',
    keyQuestions: ['What AED salary matches your London disposable income?', 'Which benefits are paid separately from salary?', 'How much currency risk will your savings carry?'],
  },
  {
    slug: 'london-to-new-york',
    fromCityId: 'london',
    toCityId: 'nyc',
    headline: 'Moving from London to New York: salary equivalence and cost guide',
    editorialNote: 'New York compensation can be higher, but healthcare, rent and local taxation materially change purchasing power. Compare net income and recurring expenses before accepting a nominal raise.',
    keyQuestions: ['What USD salary replaces your London after-tax lifestyle?', 'What employer health costs should be included?', 'How much rent flexibility do you need?'],
  },
  {
    slug: 'toronto-to-new-york',
    fromCityId: 'toronto',
    toCityId: 'nyc',
    headline: 'Moving from Toronto to New York: salary equivalence guide',
    editorialNote: 'Cross-border offers should be compared after statutory deductions and currency conversion. A higher USD salary may still produce a different savings rate once New York housing and healthcare are included.',
    keyQuestions: ['What USD salary matches your Toronto savings capacity?', 'How does employer healthcare affect net value?', 'What exchange-rate assumption is being used?'],
  },
  {
    slug: 'vancouver-to-seattle',
    fromCityId: 'vancouver',
    toCityId: 'seattle',
    headline: 'Moving from Vancouver to Seattle: salary and cost comparison',
    editorialNote: 'The cities are geographically close but compensation, tax systems, housing and healthcare economics differ. Model the move as two complete household budgets.',
    keyQuestions: ['How much does tax treatment change take-home pay?', 'What housing budget is realistic in each city?', 'What benefits should be valued outside base salary?'],
  },
  {
    slug: 'sydney-to-singapore',
    fromCityId: 'sydney',
    toCityId: 'singapore',
    headline: 'Moving from Sydney to Singapore: salary and relocation economics',
    editorialNote: 'Singapore and Sydney differ sharply in tax structure, housing patterns and transport. Compare the amount left after essential costs rather than converting the headline salary.',
    keyQuestions: ['What SGD salary preserves your AUD savings rate?', 'Is housing support included?', 'How should retirement contributions be treated?'],
  },
  {
    slug: 'sydney-to-dubai',
    fromCityId: 'sydney',
    toCityId: 'dubai',
    headline: 'Moving from Sydney to Dubai: salary, tax and benefits guide',
    editorialNote: 'A tax-light destination does not automatically make every offer better. Rent, insurance, relocation allowances and superannuation trade-offs should all be modeled.',
    keyQuestions: ['What AED package replaces salary plus super?', 'Which recurring costs move from employer/public systems to you?', 'How much can you save after housing?'],
  },
  {
    slug: 'berlin-to-zurich',
    fromCityId: 'berlin',
    toCityId: 'zurich',
    headline: 'Moving from Berlin to Zurich: salary equivalence and living costs',
    editorialNote: 'Zurich salaries can be much higher, while housing and everyday costs are also elevated. The right measure is disposable income after tax and essential spending.',
    keyQuestions: ['What CHF salary matches your Berlin purchasing power?', 'How much should rent change your target?', 'What social contributions differ?'],
  },
  {
    slug: 'berlin-to-london',
    fromCityId: 'berlin',
    toCityId: 'london',
    headline: 'Moving from Berlin to London: salary and cost-of-living guide',
    editorialNote: 'Nominal salary comparisons hide differences in tax, rent, transit and healthcare funding. Compare monthly cash flow in both cities using the same household assumptions.',
    keyQuestions: ['What GBP salary matches your Berlin disposable income?', 'How does London rent alter the required salary?', 'Which employer benefits offset higher costs?'],
  },
  {
    slug: 'dublin-to-london',
    fromCityId: 'dublin',
    toCityId: 'london',
    headline: 'Moving from Dublin to London: salary equivalence guide',
    editorialNote: 'Both cities have expensive housing, so small rent assumptions can reverse the result. Model actual or target rent rather than relying on a broad city average.',
    keyQuestions: ['What GBP salary preserves your Dublin savings rate?', 'How much rent difference are you assuming?', 'How do payroll deductions compare?'],
  },
  {
    slug: 'mumbai-to-dubai',
    fromCityId: 'mumbai',
    toCityId: 'dubai',
    headline: 'Moving from Mumbai to Dubai: salary package and savings guide',
    editorialNote: 'For India-to-UAE moves, the useful comparison is not a direct currency conversion. Housing, insurance, flights, family costs and the value of employer allowances should be included.',
    keyQuestions: ['What AED salary matches your current savings after expenses?', 'Does the package include housing or insurance?', 'What remittance and currency assumptions matter?'],
  },
  {
    slug: 'bengaluru-to-singapore',
    fromCityId: 'bengaluru',
    toCityId: 'singapore',
    headline: 'Moving from Bengaluru to Singapore: salary and purchasing-power guide',
    editorialNote: 'Singapore compensation should be compared with Bengaluru after tax, rent and household costs. A simple INR-to-SGD conversion is not a purchasing-power comparison.',
    keyQuestions: ['What SGD salary preserves your savings capacity?', 'How much housing cost should be budgeted?', 'Are bonuses and retirement contributions comparable?'],
  },
  {
    slug: 'mumbai-to-singapore',
    fromCityId: 'mumbai',
    toCityId: 'singapore',
    headline: 'Moving from Mumbai to Singapore: salary and relocation guide',
    editorialNote: 'Treat the offer as a full household cash-flow decision. Tax, rent, transport and benefits can matter more than the headline exchange-rate conversion.',
    keyQuestions: ['What SGD salary matches your current lifestyle?', 'How much rent will you actually pay?', 'Which benefits are additional to base salary?'],
  },
  {
    slug: 'san-francisco-to-austin',
    fromCityId: 'sf',
    toCityId: 'austin',
    headline: 'Moving from San Francisco to Austin: salary and savings comparison',
    editorialNote: 'A lower Austin salary can still produce similar or stronger savings depending on housing and state-tax differences. Compare after-tax cash flow rather than salary prestige.',
    keyQuestions: ['What Austin salary matches SF disposable income?', 'How much does housing drive the result?', 'What compensation components change with the move?'],
  },
  {
    slug: 'san-francisco-to-seattle',
    fromCityId: 'sf',
    toCityId: 'seattle',
    headline: 'Moving from San Francisco to Seattle: salary equivalence guide',
    editorialNote: 'Both are high-pay technology markets, but housing and state tax treatment differ. Model the same household and savings target in each city.',
    keyQuestions: ['What Seattle salary replaces your SF savings rate?', 'How much housing difference is realistic?', 'How should equity compensation be treated separately?'],
  },
  {
    slug: 'paris-to-london',
    fromCityId: 'paris',
    toCityId: 'london',
    headline: 'Moving from Paris to London: salary, tax and cost guide',
    editorialNote: 'Cross-channel moves involve different payroll systems, housing markets and benefit structures. Compare recurring net cash and document where the tax model is limited.',
    keyQuestions: ['What GBP salary matches Paris disposable income?', 'How much does housing change the target?', 'Which social contributions and benefits differ?'],
  },
  {
    slug: 'amsterdam-to-london',
    fromCityId: 'amsterdam',
    toCityId: 'london',
    headline: 'Moving from Amsterdam to London: salary equivalence and cost guide',
    editorialNote: 'Both cities combine strong salaries with expensive housing. Use actual rent targets and transparent tax assumptions to avoid misleading headline comparisons.',
    keyQuestions: ['What GBP salary preserves Amsterdam savings?', 'What rent assumptions are realistic?', 'Are special tax regimes relevant to your case?'],
  },
];

export const RELOCATION_ROUTE_COUNT = RELOCATION_ROUTES.length;
