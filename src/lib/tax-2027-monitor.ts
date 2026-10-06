import crypto from 'crypto';
import { dbService } from '../db/client';

export interface TaxAuthorityWatchItem {
  jurisdictionId: string;
  countryName: string;
  authorityName: string;
  officialPortalUrl: string;
  expectedFutureYear: number;
  monitoredKeywords: string[];
}

export interface TaxSourceMonitorRecord {
  id: string;
  jurisdictionId: string;
  countryName: string;
  authorityName: string;
  officialPortalUrl: string;
  lastCheckedAt: string;
  httpStatus: number;
  lastModifiedHeader?: string;
  etagHeader?: string;
  contentHash?: string;
  publicationDetected: boolean;
  publishedStatuteYear: number;
  implementationStatus: 'CURRENT_2026' | 'DETECTED_2027' | 'ADAPTER_PENDING' | 'VERIFIED_2027';
  notes: string;
}

export const MONITORED_TAX_AUTHORITIES: TaxAuthorityWatchItem[] = [
  {
    jurisdictionId: 'US',
    countryName: 'United States',
    authorityName: 'Internal Revenue Service (IRS)',
    officialPortalUrl: 'https://www.irs.gov/irb',
    expectedFutureYear: 2027,
    monitoredKeywords: ['2027 inflation adjustments', 'Rev. Proc. 2026-', 'tax year 2027 brackets'],
  },
  {
    jurisdictionId: 'US-NY',
    countryName: 'United States (New York)',
    authorityName: 'New York State Department of Taxation and Finance',
    officialPortalUrl: 'https://www.tax.ny.gov',
    expectedFutureYear: 2027,
    monitoredKeywords: ['IT-2105-I (2027)', '2027 New York withholding tables'],
  },
  {
    jurisdictionId: 'GB',
    countryName: 'United Kingdom',
    authorityName: 'HM Revenue & Customs (HMRC)',
    officialPortalUrl: 'https://www.gov.uk/income-tax-rates',
    expectedFutureYear: 2027,
    monitoredKeywords: ['2027 to 2028 tax rates', 'Finance Act 2027', 'income tax personal allowance 2027/28'],
  },
  {
    jurisdictionId: 'CA',
    countryName: 'Canada',
    authorityName: 'Canada Revenue Agency (CRA)',
    officialPortalUrl: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas.html',
    expectedFutureYear: 2027,
    monitoredKeywords: ['T4127-27', 'payroll deductions formulas for 2027'],
  },
  {
    jurisdictionId: 'AU',
    countryName: 'Australia',
    authorityName: 'Australian Taxation Office (ATO)',
    officialPortalUrl: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents',
    expectedFutureYear: 2027,
    monitoredKeywords: ['2026-27 income year', '2027 resident tax rates'],
  },
  {
    jurisdictionId: 'DE',
    countryName: 'Germany',
    authorityName: 'Bundesministerium der Finanzen (BMF)',
    officialPortalUrl: 'https://www.bundesfinanzministerium.de',
    expectedFutureYear: 2027,
    monitoredKeywords: ['Steuerprogression 2027', 'Grundfreibetrag 2027', 'Tarif 2027'],
  },
  {
    jurisdictionId: 'SG',
    countryName: 'Singapore',
    authorityName: 'Inland Revenue Authority of Singapore (IRAS)',
    officialPortalUrl: 'https://www.iras.gov.sg/taxes/individual-income-tax',
    expectedFutureYear: 2027,
    monitoredKeywords: ['Year of Assessment 2028', 'tax rates from YA 2027'],
  },
  {
    jurisdictionId: 'NZ',
    countryName: 'New Zealand',
    authorityName: 'Inland Revenue (IRD)',
    officialPortalUrl: 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals',
    expectedFutureYear: 2027,
    monitoredKeywords: ['2026-2027 tax year', 'tax rates from 1 April 2027'],
  },
  {
    jurisdictionId: 'AE',
    countryName: 'United Arab Emirates',
    authorityName: 'Federal Tax Authority (FTA)',
    officialPortalUrl: 'https://tax.gov.ae',
    expectedFutureYear: 2027,
    monitoredKeywords: ['personal income tax', 'employment tax decree 2027'],
  },
  {
    jurisdictionId: 'SA',
    countryName: 'Saudi Arabia',
    authorityName: 'Zakat, Tax and Customs Authority (ZATCA)',
    officialPortalUrl: 'https://zatca.gov.sa',
    expectedFutureYear: 2027,
    monitoredKeywords: ['individual income tax', 'salary deduction law 2027'],
  },
];

/**
 * Checks an official government tax portal over HTTP to observe changes and detect official
 * gazette releases for upcoming tax year statutory rate schedules.
 */
export async function checkTaxAuthoritySource(item: TaxAuthorityWatchItem): Promise<TaxSourceMonitorRecord> {
  const now = new Date().toISOString();
  let httpStatus = 0;
  let lastModified: string | undefined;
  let etag: string | undefined;
  let hash = '';
  let publicationDetected = false;
  let note = 'Statutory 2026 rules active. Official 2027 schedule pending gazette publication.';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(item.officialPortalUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (LivWorthy-Tax-Watcher/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    httpStatus = res.status;
    lastModified = res.headers.get('last-modified') || undefined;
    etag = res.headers.get('etag') || undefined;

    const bodyText = await res.text();
    hash = crypto.createHash('sha256').update(bodyText.substring(0, 50000)).digest('hex').substring(0, 16);

    // Scan for monitored publication keywords
    const lowerBody = bodyText.toLowerCase();
    for (const kw of item.monitoredKeywords) {
      if (lowerBody.includes(kw.toLowerCase())) {
        publicationDetected = true;
        note = `Potential 2027 enactment detected via keyword "${kw}". Verification required before adapter implementation.`;
        break;
      }
    }
  } catch (err: any) {
    httpStatus = 0;
    note = `Network probe notice: ${err.name === 'AbortError' ? 'Timeout (8s)' : err.message || String(err)}. Defaulting to safe 2026 baseline.`;
  }

  const record: TaxSourceMonitorRecord = {
    id: `taxmon_${item.jurisdictionId}`,
    jurisdictionId: item.jurisdictionId,
    countryName: item.countryName,
    authorityName: item.authorityName,
    officialPortalUrl: item.officialPortalUrl,
    lastCheckedAt: now,
    httpStatus,
    lastModifiedHeader: lastModified,
    etagHeader: etag,
    contentHash: hash,
    publicationDetected,
    publishedStatuteYear: publicationDetected ? 2027 : 2026,
    implementationStatus: publicationDetected ? 'DETECTED_2027' : 'CURRENT_2026',
    notes: note,
  };

  // Upsert to DB service
  await dbService.upsertTaxSourceMonitor(record);

  return record;
}
