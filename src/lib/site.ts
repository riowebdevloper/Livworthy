/**
 * Centralized brand & site configuration for LivWorthy.
 * Used for canonical URLs, metadata, structured data, and communications.
 */
export const SITE_CONFIG = {
  name: 'LivWorthy',
  domain: 'livworthy.com',
  siteUrl: (process.env.SITE_URL || 'https://livworthy.com').replace(/\/$/, ''),
  tagline: 'Know what your income is really worth.',
  description: 'Know what your income is really worth. Precision global income and living intelligence platform.',
  supportEmail: 'support@livworthy.com',
  editorialEmail: 'editorial@livworthy.com',
  canonicalUrl(path: string = ''): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.siteUrl}${cleanPath === '/' ? '' : cleanPath}`;
  },
};
