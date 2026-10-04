import { CurrencyCode } from './money';

export type SeoPageType =
  | 'salary-guide'
  | 'salary-after-tax'
  | 'salary-needed'
  | 'cost-of-living'
  | 'comparison';

export interface SeoSection {
  id: string;
  h2: string;
  paragraphs?: string[];
  subsections?: {
    h3: string;
    content: string;
  }[];
  table?: {
    headers: string[];
    rows: (string | number)[][];
    caption?: string;
  };
  callout?: {
    type: 'info' | 'tip' | 'warning';
    title: string;
    text: string;
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RelatedLink {
  title: string;
  url: string;
  description: string;
  category?: 'guide' | 'tool' | 'comparison' | 'city';
}

export interface SeoLandingPage {
  slug: string; // Relative path without leading slash, e.g. 'guides/nyc-100k', 'salary-after-tax/new-york', 'compare/new-york-vs-london'
  pageType: SeoPageType;

  cityId?: string;
  cityAId?: string;
  cityBId?: string;
  countryId?: string;
  regionId?: string;

  salaryMajor?: number;
  currency?: CurrencyCode;

  primaryKeyword: string;
  secondaryKeywords: string[];

  seoTitle: string;
  h1: string;
  metaDescription: string;

  directAnswer: string;

  sections: SeoSection[];

  faq: FaqItem[];

  relatedLinks: RelatedLink[];

  capabilityRequirements: {
    tax?: boolean;
    col?: boolean;
    comparison?: boolean;
    salaryNeeded?: boolean;
  };
}
