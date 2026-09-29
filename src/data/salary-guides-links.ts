export interface GuideLinkItem {
  slug: string;
  title: string;
}

export const POPULAR_GUIDE_LINKS: GuideLinkItem[] = [
  { slug: 'nyc-100k', title: 'Is $100K a Good Salary in New York City?' },
  { slug: 'nyc-150k', title: 'Is $150K a Good Salary in New York City?' },
  { slug: 'sf-150k', title: 'Is $150K a Good Salary in San Francisco?' },
  { slug: 'sf-200k', title: 'Is $200K a Good Salary in San Francisco?' },
  { slug: 'austin-100k', title: 'Is $100K a Good Salary in Austin?' },
  { slug: 'chicago-100k', title: 'Is $100K a Good Salary in Chicago?' },
  { slug: 'seattle-130k', title: 'Is $130K a Good Salary in Seattle?' },
  { slug: 'la-120k', title: 'Is $120K a Good Salary in Los Angeles?' },
];

export const TOTAL_GUIDES_COUNT = 36;

export const VALID_GUIDE_SLUGS = new Set([
  'nyc-100k',
  'nyc-150k',
  'sf-150k',
  'sf-200k',
  'austin-100k',
  'chicago-100k',
  'seattle-130k',
  'la-120k',
  'boston-110k',
  'miami-90k',
  'london-75k',
  'london-100k',
  'manchester-50k',
  'birmingham-45k',
  'edinburgh-55k',
  'dubai-300k',
  'dubai-500k',
  'abudhabi-350k',
  'toronto-100k',
  'vancouver-100k',
  'calgary-90k',
  'sydney-120k',
  'melbourne-100k',
  'berlin-80k',
  'munich-90k',
  'paris-65k',
  'amsterdam-75k',
  'dublin-65k',
  'zurich-130k',
  'singapore-120k',
  'singapore-180k',
  'mumbai-25lakh',
  'bengaluru-25lakh',
  'mumbai-15lakh',
  'tokyo-12m',
  'madrid-50k',
]);
