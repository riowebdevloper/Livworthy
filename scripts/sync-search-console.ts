/**
 * LivWorthy Google Search Console Scheduled Sync Script
 *
 * Implements Section 11 of the Execution Prompt:
 * - Operational script executable via `npm run seo:gsc-sync`
 * - Safe credential check (returns BLOCKED_BY_ACCOUNT_ACCESS if missing)
 * - Verifies property access against Google Search Console API
 * - Ingests real performance records into historical database table
 * - Synchronizes observed positions into the rank tracking table
 * - Emits structured summary report
 */

import { SearchConsoleConnector } from '../src/lib/seo/search-console-connector';
import { dbService } from '../src/db/client';

async function runGscSync() {
  console.log('======================================================');
  console.log('🚀 LivWorthy Google Search Console Ingestion Sync');
  console.log('======================================================\n');

  const availability = SearchConsoleConnector.isAvailable();
  console.log(`[Status] Connector state: ${availability.status}`);
  console.log(`[Info] ${availability.message}\n`);

  if (!availability.isConfigured) {
    console.warn('⚠️ GSC credentials not configured in environment.');
    console.warn('Result: BLOCKED_BY_ACCOUNT_ACCESS');
    console.warn('Zero false completion enforced: No fabricated rankings or impressions generated.\n');
    process.exit(0);
  }

  console.log('[1/3] Validating Google Search Console property access...');
  const propertyValidation = await SearchConsoleConnector.validatePropertyAccess();
  console.log(`Property: ${propertyValidation.siteUrl}`);
  console.log(`Access status: ${propertyValidation.status}`);

  if (!propertyValidation.accessible) {
    console.error(`❌ Property validation failed: ${propertyValidation.errorMessage}`);
    process.exit(1);
  }
  console.log(`✅ Property verified. Permission level: ${propertyValidation.permissionLevel}\n`);

  console.log('[2/3] Querying search analytics and ingesting performance records...');
  const syncResult = await SearchConsoleConnector.ingestAndPersistAnalytics();
  console.log(`Sync status: ${syncResult.status}`);
  console.log(`Records ingested: ${syncResult.ingestedCount}`);
  console.log(`Rank records updated: ${syncResult.rankUpdatedCount}\n`);

  console.log('[3/3] Inspecting recent database records...');
  const recentRecords = await dbService.getGscPerformanceRecords(5);
  console.log(`Stored GSC records count (sample): ${recentRecords.length}`);

  console.log('\n======================================================');
  console.log('✅ GSC Ingestion Sync Complete');
  console.log('======================================================');
}

runGscSync().catch((err) => {
  console.error('Fatal sync error:', err.message);
  process.exit(1);
});
