import fs from 'fs';
import path from 'path';
import { dbService } from '../src/db/client';
import { VERIFIED_MEDIA_CONTACTS, VerifiedMediaContact } from '../src/data/verified-journalists';

async function main() {
  console.log('======================================================');
  console.log('📰 LivWorthy Ethical Digital PR & Media Outreach Engine');
  console.log('======================================================');
  console.log(`Reviewing ${VERIFIED_MEDIA_CONTACTS.length} verified Tier-1 financial & career journalists.\n`);

  const results: any[] = [];
  let readyCount = 0;
  let sentCount = 0;
  let coverageCount = 0;

  for (const c of VERIFIED_MEDIA_CONTACTS) {
    console.log(`[${c.outlet}] ${c.name}`);
    console.log(`  Beat: ${c.beat}`);
    console.log(`  Recent Topic: "${c.recentArticleTopic}"`);
    console.log(`  Channel: ${c.publicContactChannel}`);
    console.log(`  Pitch Subject: "${c.pitchSubject}"`);
    console.log(`  Target Asset: https://www.livworthy.com/${c.recommendedReportSlug}`);
    console.log(`  Status: ${c.status}`);
    console.log('');

    if (c.status === 'PITCH_READY') readyCount++;
    else if (c.status === 'SENT') sentCount++;
    else if (c.status === 'COVERAGE_PUBLISHED') coverageCount++;

    await dbService.recordPrOutreach({
      journalistName: c.name,
      outlet: c.outlet,
      beat: c.beat,
      verifiedArticleUrl: c.publicContactChannel,
      publicContactMethod: c.publicContactChannel,
      pitchAngle: c.pitchAngle,
      status: c.status,
      notes: c.notes,
    });

    results.push(c);
  }

  console.log('--- Digital PR Pipeline Summary ---');
  console.log(`Total Verified Journalist Profiles: ${VERIFIED_MEDIA_CONTACTS.length}`);
  console.log(`Pitches Prepared & Ready (Zero-Spam Policy): ${readyCount}`);
  console.log(`Pitches Sent (Executed): ${sentCount}`);
  console.log(`Published Press Coverage (Verified): ${coverageCount}`);
  console.log(`Ethical Governance: No unverified names, no scraping, no automated bulk mass-mailing.`);

  const outPath = path.join('public', 'data-pr-pipeline-audit.json');
  const auditData = {
    generatedAt: new Date().toISOString(),
    totalVerifiedJournalists: VERIFIED_MEDIA_CONTACTS.length,
    pitchReadyCount: readyCount,
    pitchesSentCount: sentCount,
    coveragePublishedCount: coverageCount,
    outreachTargets: results,
  };

  fs.writeFileSync(outPath, JSON.stringify(auditData, null, 2), 'utf-8');
  console.log(`\nAudit PR pipeline saved to ${outPath}`);
  console.log('======================================================');
}

main().catch((err) => {
  console.error('Fatal error during digital PR pipeline audit:', err);
  process.exit(1);
});
