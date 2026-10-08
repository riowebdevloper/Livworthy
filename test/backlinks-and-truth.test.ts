import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  normalizeTargetUrl,
  parseRelAttribute,
  BacklinkTracker,
  INITIAL_TRACKED_BACKLINKS,
  validateOutreachRecord,
  OutreachRecord,
} from '../src/lib/backlink-tracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Starting LivWorthy Backlinks, Truth & Integrity Test Suite...\n');

// ============================================================================
// PART 53 — SPECIFIC BACKLINK VERIFIER TESTS
// ============================================================================

console.log('▶ Test Suite 1: Specific Backlink Verifier Target Matching & Parsing');

// Test A: Expected /guides/nyc-100k, Detected homepage -> NOT_FOUND / null match
{
  const expected = 'https://www.livworthy.com/guides/nyc-100k';
  const detected = 'https://www.livworthy.com';
  const normExpected = normalizeTargetUrl(expected);
  const normDetected = normalizeTargetUrl(detected);

  assert.notEqual(normExpected, null);
  assert.notEqual(normDetected, null);
  assert.notEqual(normExpected, normDetected, 'Homepage URL must NOT match specific guide target');
  console.log('  ✔ Test A passed: Expected guide target correctly rejects homepage link');
}

// Test B: Detected with trailing slash -> ACTIVE match after canonical normalization
{
  const expected = 'https://www.livworthy.com/guides/nyc-100k';
  const detected = 'https://www.livworthy.com/guides/nyc-100k/';
  const normExpected = normalizeTargetUrl(expected);
  const normDetected = normalizeTargetUrl(detected);

  assert.equal(normExpected, 'https://www.livworthy.com/guides/nyc-100k');
  assert.equal(normDetected, 'https://www.livworthy.com/guides/nyc-100k');
  assert.equal(normExpected, normDetected, 'Trailing slash must normalize to identical canonical target');
  console.log('  ✔ Test B passed: Target canonical normalization matches trailing-slash variant');
}

// Test C: Malicious substring URL -> Rejected / null
{
  const malicious = 'https://evil.com/?x=livworthy.com';
  const normMalicious = normalizeTargetUrl(malicious);
  assert.equal(normMalicious, null, 'Foreign domain containing substring livworthy.com must return null');

  const evilSubdomain = 'https://livworthy.com.evil.com/guides/nyc-100k';
  assert.equal(normalizeTargetUrl(evilSubdomain), null, 'Evil subdomain must return null');
  console.log('  ✔ Test C passed: Hostname validation prevents malicious substring matching');
}

// Test D: rel attribute parsing
{
  assert.equal(parseRelAttribute('nofollow sponsored'), 'MIXED');
  assert.equal(parseRelAttribute('sponsored'), 'SPONSORED');
  assert.equal(parseRelAttribute('nofollow'), 'NOFOLLOW');
  assert.equal(parseRelAttribute('ugc'), 'UGC');
  assert.equal(parseRelAttribute('noopener noreferrer'), 'FOLLOW');
  assert.equal(parseRelAttribute(null), 'FOLLOW');
  assert.equal(parseRelAttribute('dofollow'), 'FOLLOW', 'dofollow is not standard rel, defaults to FOLLOW');
  console.log('  ✔ Test D passed: Rel attribute parsing accurately classifies FOLLOW, NOFOLLOW, UGC, SPONSORED, MIXED');
}

// ============================================================================
// PART 11-14, 23-24: BACKLINK TRACKER SEED STATUS & CATEGORY ISOLATION
// ============================================================================

console.log('\n▶ Test Suite 2: Backlink Seed Status & Category Segregation');

{
  // All initial seeds must be PENDING_VERIFICATION
  for (const seed of INITIAL_TRACKED_BACKLINKS) {
    assert.equal(
      seed.status,
      'PENDING_VERIFICATION',
      `Seed ${seed.sourceUrl} must start in PENDING_VERIFICATION, not ACTIVE`
    );
  }
  console.log('  ✔ Verified: 100% of candidate backlink seeds are PENDING_VERIFICATION');

  const tracker = new BacklinkTracker();
  const stats = tracker.getStats();

  // Truth baseline: until real third-party publications exist, earned verified = 0
  assert.equal(stats.verifiedEarnedBacklinks, 0, 'verifiedEarnedBacklinks must be strictly 0');
  assert.equal(stats.referringEarnedDomains, 0, 'referringEarnedDomains must be strictly 0');
  assert.ok(stats.ownedLinks >= 1, 'github.com must be categorized as OWNED');
  assert.ok(stats.infrastructureLinks >= 1, 'vercel.app must be categorized as INFRASTRUCTURE');

  // Verify infrastructure redirects are excluded from authority totals
  const vercelRecord = INITIAL_TRACKED_BACKLINKS.find((b) => b.sourceUrl.includes('vercel.app'));
  assert.ok(vercelRecord, 'vercel.app record should exist');
  assert.equal(vercelRecord.category, 'INFRASTRUCTURE');

  const githubRecord = INITIAL_TRACKED_BACKLINKS.find((b) => b.sourceUrl.includes('github.com'));
  assert.ok(githubRecord, 'github.com record should exist');
  assert.equal(githubRecord.category, 'OWNED');

  console.log('  ✔ Verified: Infrastructure and owned links isolated from earned authority backlinks');
}

// ============================================================================
// PART 7-10, 54: OUTREACH LIFECYCLE CONSISTENCY
// ============================================================================

console.log('\n▶ Test Suite 3: Outreach Lifecycle State Machine Consistency');

{
  // Lifecycle validator rejects illegal combinations
  assert.throws(
    () =>
      validateOutreachRecord({
        id: 'bad-1',
        targetDomain: 'example.com',
        pitchAngle: 'Salary guide',
        status: 'PITCH_READY',
        preparedAt: '2026-10-08',
        submittedAt: '2026-10-08', // Illegal: PITCH_READY cannot have submittedAt
        replyStatus: null,
        publicationUrl: null,
        backlinkVerified: false,
        backlinkVerifiedAt: null,
      }),
    /PITCH_READY records must have submittedAt = null/,
    'Should reject PITCH_READY with submittedAt'
  );

  assert.throws(
    () =>
      validateOutreachRecord({
        id: 'bad-2',
        targetDomain: 'example.com',
        pitchAngle: 'Salary guide',
        status: 'SUBMITTED',
        preparedAt: '2026-10-08',
        submittedAt: null, // Illegal: SUBMITTED requires submittedAt
        replyStatus: null,
        publicationUrl: null,
        backlinkVerified: false,
        backlinkVerifiedAt: null,
      }),
    /SUBMITTED records require submittedAt date/,
    'Should reject SUBMITTED without submittedAt'
  );

  assert.throws(
    () =>
      validateOutreachRecord({
        id: 'bad-3',
        targetDomain: 'example.com',
        pitchAngle: 'Salary guide',
        status: 'PUBLISHED',
        preparedAt: '2026-10-08',
        submittedAt: '2026-10-08',
        replyStatus: 'ACCEPTED',
        publicationUrl: null, // Illegal: PUBLISHED requires publicationUrl
        backlinkVerified: false,
        backlinkVerifiedAt: null,
      }),
    /PUBLISHED records require publicationUrl/,
    'Should reject PUBLISHED without publicationUrl'
  );

  assert.throws(
    () =>
      validateOutreachRecord({
        id: 'bad-4',
        targetDomain: 'example.com',
        pitchAngle: 'Salary guide',
        status: 'VERIFIED_BACKLINK',
        preparedAt: '2026-10-08',
        submittedAt: '2026-10-08',
        replyStatus: 'ACCEPTED',
        publicationUrl: 'https://example.com/article',
        backlinkVerified: true,
        backlinkVerifiedAt: null, // Illegal: VERIFIED_BACKLINK requires backlinkVerifiedAt
      }),
    /VERIFIED_BACKLINK records require backlinkVerifiedAt date/,
    'Should reject VERIFIED_BACKLINK without backlinkVerifiedAt'
  );

  console.log('  ✔ Outreach lifecycle validator correctly rejects invalid state combinations');

  // Verify the 8 actual outreach records in data/backlink-outreach.json
  const outreachPath = path.join(rootDir, 'data', 'backlink-outreach.json');
  const rawOutreach = fs.readFileSync(outreachPath, 'utf8');
  const outreachData = JSON.parse(rawOutreach) as OutreachRecord[];

  assert.equal(outreachData.length, 8, 'Must track exactly 8 prepared pitches');
  for (const record of outreachData) {
    validateOutreachRecord(record);
    assert.equal(record.status, 'PITCH_READY');
    assert.equal(record.submittedAt, null, 'Must not claim submission occurred without evidence');
    assert.equal(record.replyStatus, null, 'replyStatus must be null for unsubmitted pitches');
    assert.equal(record.publicationUrl, null);
    assert.equal(record.backlinkVerified, false);
  }
  console.log('  ✔ All 8 outreach records truthful: status = PITCH_READY, submittedAt = null, replyStatus = null');
}

// ============================================================================
// PART 1-6: BACKLINK OPPORTUNITIES INTEGRITY
// ============================================================================

console.log('\n▶ Test Suite 4: Backlink Opportunities Truth & Evidence Verification');

{
  const oppsPath = path.join(rootDir, 'data', 'backlink-opportunities.json');
  const rawOpps = JSON.parse(fs.readFileSync(oppsPath, 'utf8'));
  const oppsList = Array.isArray(rawOpps) ? rawOpps : rawOpps.opportunities;

  assert.ok(Array.isArray(oppsList), 'opportunities array exists');
  assert.equal(oppsList.length, 25, '25 opportunities verified and tracked');

  const validPricing = ['FREE_VERIFIED', 'PAID_ONLY', 'FREE_OR_PAID', 'UNKNOWN', 'NEEDS_VERIFICATION'];
  const validLinkTypes = ['FOLLOW', 'NOFOLLOW', 'UGC', 'SPONSORED', 'UNKNOWN'];
  const validContactStatus = ['PUBLIC_VERIFIED', 'UNVERIFIED', 'BOUNCED', 'UNKNOWN'];

  for (const opp of oppsList) {
    // Authority metric unsourced claims check
    assert.equal(opp.authorityMetric, null, `${opp.domain} must not have unsourced authority metric`);
    assert.equal(opp.authorityMetricVerified, false, `${opp.domain} authority metric must be false`);

    // Pricing status check
    assert.ok(
      validPricing.includes(opp.pricing),
      `${opp.domain} invalid pricing: ${opp.pricing}`
    );

    // Link type check
    assert.ok(
      validLinkTypes.includes(opp.linkType),
      `${opp.domain} invalid linkType: ${opp.linkType}`
    );

    // Contact status check
    assert.ok(
      validContactStatus.includes(opp.contactStatus),
      `${opp.domain} invalid contactStatus: ${opp.contactStatus}`
    );
  }
  console.log('  ✔ 25 backlink opportunities audited: no unsourced DA/DR metrics, strict pricing and link types');
}

// ============================================================================
// PART 25-29: SEMRUSH HISTORICAL AUDIT ACCURACY
// ============================================================================

console.log('\n▶ Test Suite 5: Semrush Historical Audit Baseline Integrity');

{
  const semrushPath = path.join(rootDir, 'audit', 'semrush-2026-10-08.json');
  const semrush = JSON.parse(fs.readFileSync(semrushPath, 'utf8'));

  // Historical PDF truth metrics
  assert.equal(semrush.audit_metadata.historical_baseline.site_health, 77);
  assert.equal(semrush.audit_metadata.historical_baseline.ai_search_health, 86);
  assert.equal(semrush.audit_metadata.historical_baseline.errors, 23);
  assert.equal(semrush.audit_metadata.historical_baseline.warnings, 112);

  // Exact historical counts matching Oct 8 PDF
  assert.equal(semrush.historical_pdf_breakdown.invalid_robots_txt, 1);
  assert.equal(semrush.historical_pdf_breakdown.duplicate_content_pages, 2);
  assert.equal(semrush.historical_pdf_breakdown.invalid_structured_data, 8);
  assert.equal(semrush.historical_pdf_breakdown.duplicate_title_tags, 2);
  assert.equal(semrush.historical_pdf_breakdown.hreflang_conflicts, 7);
  assert.equal(semrush.historical_pdf_breakdown.duplicate_meta_descriptions, 2);
  assert.equal(semrush.historical_pdf_breakdown.low_text_html_ratio, 60);
  assert.equal(semrush.historical_pdf_breakdown.low_word_count_pages, 37);
  assert.equal(semrush.historical_pdf_breakdown.broken_external_links, 11);
  assert.equal(semrush.historical_pdf_breakdown.long_title_tags, 2);
  assert.equal(semrush.historical_pdf_breakdown.blocked_crawling_pages, 26);
  assert.equal(semrush.historical_pdf_breakdown.content_optimization, 4);
  assert.equal(semrush.historical_pdf_breakdown.low_semantic_html, 2);
  assert.equal(semrush.historical_pdf_breakdown.only_one_incoming_link, 1);

  // Verification that internal audit counts are kept separate from Semrush reported counts
  const schemaIssue = semrush.issues.find((i: any) => i.issue_id === 'SEM-004');
  assert.ok(schemaIssue, 'Structured data issue exists in ledger');
  assert.equal(schemaIssue.semrushReportedCount, 8);
  assert.equal(schemaIssue.internalAuditCount, 12);

  const longTitleIssue = semrush.issues.find((i: any) => i.issue_id === 'SEM-007');
  assert.ok(longTitleIssue, 'Long title tags issue exists in ledger');
  assert.equal(longTitleIssue.semrushReportedCount, 2);
  assert.equal(longTitleIssue.internalAuditCount, 48);

  // Re-run status must be AWAITING_MEASUREMENT, not false 98%
  assert.equal(semrush.audit_metadata.remediation_status.semrush_rerun_status, 'AWAITING_MEASUREMENT');
  assert.equal(semrush.audit_metadata.remediation_status.projected_site_health, 98);
  assert.equal(semrush.audit_metadata.remediation_status.latest_measured_site_health, 77);

  console.log('  ✔ Semrush ledger perfectly preserved against historical Oct 8 PDF baseline');
}

console.log('\n🎉 ALL BACKLINK VERIFICATION, TRUTH & DATA INTEGRITY TESTS PASSED 100%!\n');
