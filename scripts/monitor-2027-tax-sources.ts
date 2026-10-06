import fs from 'fs';
import path from 'path';
import {
  MONITORED_TAX_AUTHORITIES,
  checkTaxAuthoritySource,
  TaxSourceMonitorRecord,
} from '../src/lib/tax-2027-monitor';

async function main() {
  console.log('======================================================');
  console.log('🏛️ LivWorthy Statutory Revenue Authority 2027 Watchdog');
  console.log('======================================================');
  console.log(`Monitoring ${MONITORED_TAX_AUTHORITIES.length} primary national tax authority portals.\n`);

  const results: TaxSourceMonitorRecord[] = [];

  for (const item of MONITORED_TAX_AUTHORITIES) {
    console.log(`Checking [${item.jurisdictionId}] ${item.authorityName}...`);
    console.log(`  Portal: ${item.officialPortalUrl}`);
    const res = await checkTaxAuthoritySource(item);

    console.log(`  HTTP: ${res.httpStatus}`);
    console.log(`  2027 Gazette Detected: ${res.publicationDetected ? '🚨 YES (VERIFICATION REQUIRED)' : 'NO (STILL PENDING)'}`);
    console.log(`  Current Implementation Status: ${res.implementationStatus}`);
    console.log(`  Notes: ${res.notes}`);
    console.log('');
    results.push(res);
  }

  const detected2027Count = results.filter((r) => r.publicationDetected).length;
  const verified2026Count = results.filter((r) => r.implementationStatus === 'CURRENT_2026').length;

  console.log('--- Monitoring Summary ---');
  console.log(`Total Jurisdictions Monitored: ${results.length}`);
  console.log(`Current 2026 Statutory Baseline Enforced: ${verified2026Count}`);
  console.log(`Official 2027 Publications Detected: ${detected2027Count}`);
  console.log(`Zero-Fabrication Policy: ${detected2027Count === 0 ? 'ACTIVE (All future-year requests return TAX_CALCULATION_UNAVAILABLE)' : 'PENDING ADAPTER ROLLOUT'}`);

  const outPath = path.join('public', 'data-2027-tax-monitors-audit.json');
  const auditData = {
    generatedAt: new Date().toISOString(),
    totalMonitored: results.length,
    enforcedStatutoryYear: 2026,
    futureYearUnderWatch: 2027,
    official2027ReleasesDetected: detected2027Count,
    zeroFabricationActive: true,
    records: results,
  };

  fs.writeFileSync(outPath, JSON.stringify(auditData, null, 2), 'utf-8');
  console.log(`\nAudit watchdog report saved to ${outPath}`);
  console.log('======================================================');
}

main().catch((err) => {
  console.error('Fatal error during 2027 tax source monitoring:', err);
  process.exit(1);
});
