import { SeoLandingPage } from '../types/seo-page';
import { US_EXTENDED_CLUSTERS } from './clusters/us-guides';
import { UK_EXTENDED_CLUSTERS } from './clusters/uk-guides';
import { INTL_EXTENDED_CLUSTERS } from './clusters/intl-guides';
import { COMPARISONS_EXTENDED_CLUSTERS } from './clusters/comparisons';

export const EXTENDED_SEO_LANDING_PAGES: Record<string, SeoLandingPage> = {
  ...US_EXTENDED_CLUSTERS,
  ...UK_EXTENDED_CLUSTERS,
  ...INTL_EXTENDED_CLUSTERS,
  ...COMPARISONS_EXTENDED_CLUSTERS,
};
