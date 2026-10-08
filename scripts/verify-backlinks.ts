import fs from 'fs';
import path from 'path';
import {
  initializeBacklinkTracker,
  verifyLiveBacklink,
  BacklinkEntry,
  BacklinkVerificationResult,
} from '../src/lib/backlink-tracker';

async function main() {
  console.log('======================================================');
  console.log('🔗 LivWorthy Strict Backlink Verification Engine');
  console.log('======================================================');

  // 1. Load tracked opportunities & outreach
  const opportunitiesPath = path.join(process.cwd(), 'data', 'backlink-opportunities.json');
  const outreachPath = path.join(process.cwd(), 'data', 'backlink-outreach.json');

  const opportunities = fs.existsSync(opportunitiesPath)
    ? JSON.parse(fs.readFileSync(opportunitiesPath, 'utf-8'))
    : [];
  const outreach = fs.existsSync(outreachPath)
    ? JSON.parse(fs.readFileSync(outreachPath, 'utf-8'))
    : [];

  const links = await initializeBacklinkTracker();
  console.log(`Loaded ${links.length} seed/candidate backlink record(s).`);
  console.log(`Loaded ${opportunities.length} tracked editorial opportunities.`);
  console.log(`Loaded ${outreach.length} outreach records.\n`);

  let verifiedEarnedBacklinks = 0;
  let ownedLinks = 0;
  let infrastructureLinks = 0;
  let lostCount = 0;
  let pendingCount = 0;

  const verificationOutputs: BacklinkVerificationResult[] = [];

  for (const b of links) {
    console.log(`Verifying: [${b.category}] ${b.referringDomain} (${b.sourceUrl}) -> ${b.targetUrl}...`);
    const verification = await verifyLiveBacklink(b.sourceUrl, b.targetUrl);

    console.log(`  Verified: ${verification.verified}`);
    console.log(`  Status: ${verification.status}`);
    console.log(`  Source HTTP: ${verification.sourceStatus}`);
    console.log(`  Link Type: ${verification.linkType}`);

    if (verification.verified) {
      if (b.category === 'OWNED') {
        ownedLinks++;
        console.log(`  Classification: OWNED_LINK (Not counted in earned authority SEO)`);
      } else if (b.category === 'INFRASTRUCTURE') {
        infrastructureLinks++;
        console.log(`  Classification: INFRASTRUCTURE_REDIRECT (Not counted in earned authority SEO)`);
      } else {
        verifiedEarnedBacklinks++;
        console.log(`  Classification: EARNED_EDITORIAL_BACKLINK`);
      }
    } else {
      if (verification.status === 'NOT_FOUND') lostCount++;
      else pendingCount++;
      if (verification.error) console.log(`  Notice: ${verification.error}`);
    }
    console.log('');

    verificationOutputs.push(verification);
  }

  // Count outreach lifecycle states
  const pitchReadyCount = outreach.filter((o: any) => o.status === 'PITCH_READY').length;
  const submittedPitchesCount = outreach.filter((o: any) => o.status === 'SUBMITTED').length;
  const publishedArticlesCount = outreach.filter((o: any) => o.status === 'PUBLISHED').length;

  console.log('--- Comprehensive Backlink Status Summary ---');
  console.log(`Tracked Opportunities:        ${opportunities.length}`);
  console.log(`Pitch Ready Outreach:         ${pitchReadyCount}`);
  console.log(`Submitted Pitches:            ${submittedPitchesCount}`);
  console.log(`Published Guest Articles:     ${publishedArticlesCount}`);
  console.log(`Verified Earned Backlinks:    ${verifiedEarnedBacklinks}`);
  console.log(`Owned Links:                  ${ownedLinks}`);
  console.log(`Infrastructure Redirects:     ${infrastructureLinks}`);
  console.log(`Referring Earned Domains:     0 (Strictly 0 until third-party publication)\n`);

  // Save audit report
  const auditPath = path.join('public', 'data-backlinks-audit.json');
  const auditData = {
    generatedAt: new Date().toISOString(),
    trackedOpportunities: opportunities.length,
    pitchReady: pitchReadyCount,
    submittedPitches: submittedPitchesCount,
    publishedArticles: publishedArticlesCount,
    verifiedEarnedBacklinks,
    ownedLinks,
    infrastructureLinks,
    referringEarnedDomainsCount: 0,
    referringEarnedDomains: [],
    lostCount,
    pendingCount,
    records: verificationOutputs,
  };

  fs.writeFileSync(auditPath, JSON.stringify(auditData, null, 2), 'utf-8');
  console.log(`Audit report written to ${auditPath}`);
  console.log('======================================================');
}

main().catch((err) => {
  console.error('Fatal error during backlink verification:', err);
  process.exit(1);
});
