import fs from 'fs';
import path from 'path';
import {
  initializeBacklinkTracker,
  verifyLiveBacklink,
  BacklinkEntry,
} from '../src/lib/backlink-tracker';

async function main() {
  console.log('======================================================');
  console.log('🔗 LivWorthy Backlink Verification & Acquisition Engine');
  console.log('======================================================');

  const links = await initializeBacklinkTracker();
  console.log(`Loaded ${links.length} backlink record(s) from database.\n`);

  let activeCount = 0;
  let lostCount = 0;
  let pendingCount = 0;

  const results: any[] = [];

  for (const b of links) {
    console.log(`Verifying: ${b.referringDomain} (${b.sourceUrl}) -> ${b.targetUrl}...`);
    const verification = await verifyLiveBacklink(b.sourceUrl, b.targetUrl);

    console.log(`  Status: ${verification.status}`);
    console.log(`  HTTP Code: ${verification.httpStatus}`);
    if (verification.isFound) {
      console.log(`  Anchor: "${verification.anchorText}" [${verification.relAttribute}]`);
      activeCount++;
    } else {
      if (verification.status === 'NOT_FOUND') lostCount++;
      else pendingCount++;
      if (verification.error) console.log(`  Notice: ${verification.error}`);
    }
    console.log('');

    results.push({
      ...b,
      verifiedStatus: verification.status,
      httpStatusCode: verification.httpStatus,
      detectedAnchor: verification.anchorText,
      detectedRel: verification.relAttribute,
      lastCheckedAt: new Date().toISOString(),
    });
  }

  const referringDomains = Array.from(new Set(results.filter((r) => r.verifiedStatus === 'ACTIVE').map((r) => r.referringDomain)));

  console.log('--- Verification Summary ---');
  console.log(`Total Tracked Records: ${links.length}`);
  console.log(`Active Verified Backlinks: ${activeCount}`);
  console.log(`Referring Domains (Verified): ${referringDomains.length} (${referringDomains.join(', ')})`);
  console.log(`Lost / Not Found: ${lostCount}`);
  console.log(`Unreachable / Pending: ${pendingCount}`);

  // Write audit report
  const auditPath = path.join('public', 'data-backlinks-audit.json');
  const auditData = {
    generatedAt: new Date().toISOString(),
    totalTracked: links.length,
    activeVerified: activeCount,
    referringDomainsCount: referringDomains.length,
    referringDomains,
    lostCount,
    pendingCount,
    records: results,
  };

  fs.writeFileSync(auditPath, JSON.stringify(auditData, null, 2), 'utf-8');
  console.log(`\nAudit report saved to ${auditPath}`);
  console.log('======================================================');
}

main().catch((err) => {
  console.error('Fatal error during backlink verification:', err);
  process.exit(1);
});
