import fs from 'fs';
import path from 'path';
import { initializeRankTracker, TrackedKeywordItem } from '../src/lib/rank-tracker';

async function main() {
  console.log('======================================================');
  console.log('📈 LivWorthy Organic Search Rank Tracking Engine');
  console.log('======================================================');

  const records = await initializeRankTracker();
  console.log(`Tracking ${records.length} strategic commercial search queries across 3 languages.\n`);

  console.log('--- Baseline Rank Monitoring Matrix ---');
  console.log(
    'Keyword | Target URL | Locale | Target SERP | Current Rank | Impressions | Clicks | CTR | Action'
  );
  console.log('-'.repeat(100));

  let top3Targets = 0;
  let top10Targets = 0;

  for (const r of records) {
    if (r.targetPosition.includes('Top 1') || r.targetPosition.includes('Top 3')) top3Targets++;
    top10Targets++;

    const rankStr = r.currentRank !== null ? `#${r.currentRank}` : 'PENDING_INDEX_CRAWL';
    const shortUrl = r.targetUrl.replace('https://www.livworthy.com', '');

    console.log(
      `"${r.keyword}" | ${shortUrl} | [${r.locale.toUpperCase()}/${r.country}] | ${r.targetPosition} | ${rankStr} | ${r.impressions} | ${r.clicks} | ${r.ctr.toFixed(1)}% | ${r.recommendedAction.substring(0, 35)}...`
    );
  }

  console.log('-'.repeat(100));
  console.log(`Total Tracked Queries: ${records.length}`);
  console.log(`Targeting Top 1–3: ${top3Targets}`);
  console.log(`Targeting Top 4–10: ${top10Targets - top3Targets}`);
  console.log(`Current State: Baseline established. Actual positions will update upon Search Console API synchronization.`);

  // Write audit file to public directory
  const outPath = path.join('public', 'data-rank-tracking-baseline.json');
  const auditData = {
    generatedAt: new Date().toISOString(),
    status: 'BASELINE_ESTABLISHED',
    totalKeywordsTracked: records.length,
    languagesTracked: ['en', 'es', 'ar'],
    distribution: {
      top3Goal: top3Targets,
      top10Goal: top10Targets,
      actualTop3: records.filter((r) => r.currentRank !== null && r.currentRank <= 3).length,
      actualTop10: records.filter((r) => r.currentRank !== null && r.currentRank <= 10).length,
      actualUnranked: records.filter((r) => r.currentRank === null).length,
    },
    keywords: records,
  };

  fs.writeFileSync(outPath, JSON.stringify(auditData, null, 2), 'utf-8');
  console.log(`\nAudit baseline saved to ${outPath}`);
  console.log('======================================================');
}

main().catch((err) => {
  console.error('Fatal error during rank tracking audit:', err);
  process.exit(1);
});
