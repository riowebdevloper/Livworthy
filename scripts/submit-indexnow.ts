import fs from 'fs';
import path from 'path';
import {
  submitUrlsToIndexNow,
  ensureIndexNowKeyFile,
  DEFAULT_INDEXNOW_KEY,
  DEFAULT_HOST,
} from '../src/lib/indexnow';

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isForce = args.includes('--force');
  const isAll = args.includes('--all');

  const triggerArgIdx = args.indexOf('--trigger');
  const triggerReason = triggerArgIdx !== -1 && args[triggerArgIdx + 1] ? args[triggerArgIdx + 1] : 'manual_cli';

  const urlsArgIdx = args.indexOf('--urls');
  const specifiedUrls = urlsArgIdx !== -1 && args[urlsArgIdx + 1] ? args[urlsArgIdx + 1].split(',') : [];

  console.log('======================================================');
  console.log('📡 LivWorthy IndexNow Submission Engine');
  console.log('======================================================');
  console.log(`Host: ${DEFAULT_HOST}`);
  console.log(`Trigger: ${triggerReason}`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'PRODUCTION SUBMISSION'}`);
  console.log(`Force cooldown bypass: ${isForce}`);

  // 1. Ensure key file exists in public & dist
  ensureIndexNowKeyFile(DEFAULT_INDEXNOW_KEY, ['public', 'dist']);
  console.log(`✅ IndexNow key verification file verified at /${DEFAULT_INDEXNOW_KEY}.txt`);

  // 2. Collect URLs to submit
  let targetUrls: string[] = [];

  if (specifiedUrls.length > 0) {
    targetUrls = specifiedUrls.map((u) => u.trim());
  } else if (isAll) {
    // Extract URLs from all generated sitemaps in public/
    const sitemapFiles = [
      'sitemap-main.xml',
      'sitemap-cities.xml',
      'sitemap-countries.xml',
      'sitemap-guides.xml',
      'sitemap-relocation.xml',
      'sitemap-comparisons.xml',
    ];

    for (const smFile of sitemapFiles) {
      const p = path.join('public', smFile);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8');
        const matches = content.match(/<loc>(https:\/\/www\.livworthy\.com[^<]+)<\/loc>/g);
        if (matches) {
          for (const m of matches) {
            const rawUrl = m.replace('<loc>', '').replace('</loc>', '');
            targetUrls.push(rawUrl);
          }
        }
      }
    }
  } else {
    // Default priority URLs to submit
    targetUrls = [
      'https://www.livworthy.com/',
      'https://www.livworthy.com/coverage',
      'https://www.livworthy.com/job-offer-comparison',
      'https://www.livworthy.com/cities/nyc',
      'https://www.livworthy.com/cities/london',
      'https://www.livworthy.com/cities/dubai',
      'https://www.livworthy.com/guides/nyc-100k',
      'https://www.livworthy.com/guides/london-75k',
      'https://www.livworthy.com/relocation/new-york-to-london',
      'https://www.livworthy.com/relocation/london-to-dubai',
    ];
  }

  console.log(`Target URLs gathered: ${targetUrls.length}`);

  // 3. Submit
  const result = await submitUrlsToIndexNow(targetUrls, {
    dryRun: isDryRun,
    force: isForce,
    batchSize: 100,
  });

  console.log('\n--- Submission Results ---');
  console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Total requested: ${result.totalUrlsRequested}`);
  console.log(`Valid URLs: ${result.validUrlsCount}`);
  console.log(`Skipped (invalid/cooldown): ${result.skippedUrls.length}`);
  console.log(`Batches processed: ${result.batchResults.length}`);
  for (const b of result.batchResults) {
    console.log(
      `  Batch #${b.batchIndex + 1}: ${b.urlCount} URLs -> HTTP ${b.statusCode} (${b.statusText}) ${
        b.error ? `[${b.error}]` : ''
      }`
    );
  }
  console.log(`Summary: ${result.message}`);

  // 4. Log to audit file
  const auditPath = path.join('public', 'data-indexnow-audit.json');
  const auditEntry = {
    submittedAt: result.timestamp,
    trigger: triggerReason,
    dryRun: isDryRun,
    success: result.success,
    validUrlsCount: result.validUrlsCount,
    batches: result.batchResults,
    message: result.message,
  };

  let existingAudit: any[] = [];
  if (fs.existsSync(auditPath)) {
    try {
      existingAudit = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));
      if (!Array.isArray(existingAudit)) existingAudit = [];
    } catch {
      existingAudit = [];
    }
  }
  existingAudit.unshift(auditEntry);
  // Keep last 50 audits
  existingAudit = existingAudit.slice(0, 50);
  fs.writeFileSync(auditPath, JSON.stringify(existingAudit, null, 2), 'utf-8');

  console.log(`\nAudit entry recorded in ${auditPath}`);
  console.log('======================================================');

  if (!result.success && !isDryRun) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error during IndexNow submission:', err);
  process.exit(1);
});
