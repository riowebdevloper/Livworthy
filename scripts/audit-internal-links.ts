import fs from 'fs';
import path from 'path';

interface PageAudit {
  filePath: string;
  urlPath: string;
  canonicalUrl: string;
  hasCanonical: boolean;
  isSelfCanonical: boolean;
  metaRobots: string;
  isIndexable: boolean;
  outboundInternalLinks: string[];
  inboundLinksCount: number;
  inboundFrom: string[];
}

function findHtmlFiles(dir: string, baseDir: string = dir): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findHtmlFiles(fullPath, baseDir));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

function normalizeUrlPath(urlOrPath: string): string {
  let cleaned = urlOrPath.replace('https://www.livworthy.com', '').trim();
  cleaned = cleaned.split('?')[0].split('#')[0];
  if (!cleaned.startsWith('/')) cleaned = '/' + cleaned;
  cleaned = cleaned.replace(/\/index\.html$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned === '' ? '/' : cleaned;
}

async function main() {
  console.log('======================================================');
  console.log('🕸️ LivWorthy Internal Linking & Indexability Audit');
  console.log('======================================================');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    console.error('dist/ does not exist. Run npm run build first.');
    process.exit(1);
  }

  const htmlFiles = findHtmlFiles(distDir);
  console.log(`Auditing ${htmlFiles.length} rendered HTML files in dist/...\n`);

  const pagesMap: Map<string, PageAudit> = new Map();
  const allKnownPaths: Set<string> = new Set();

  for (const file of htmlFiles) {
    const rel = path.relative(distDir, file);
    if (rel.startsWith('admin') || rel.includes('404.html')) continue;

    const urlPath = normalizeUrlPath('/' + rel);
    allKnownPaths.add(urlPath);

    const content = fs.readFileSync(file, 'utf-8');

    // Canonical
    const canMatch = /<link\s+rel="canonical"\s+href=["']([^"']+)["']/i.exec(content);
    const canonicalUrl = canMatch ? canMatch[1] : '';
    const normCan = normalizeUrlPath(canonicalUrl);

    // Robots
    const robMatch = /<meta\s+name="robots"\s+content=["']([^"']+)["']/i.exec(content);
    const metaRobots = robMatch ? robMatch[1] : 'index, follow';
    const isIndexable = !metaRobots.includes('noindex');

    // Outbound links
    const linkRegex = /<a\s+[^>]*?href=["']([^"']+)["'][^>]*?>/gi;
    let m: RegExpExecArray | null;
    const outbound: Set<string> = new Set();

    while ((m = linkRegex.exec(content)) !== null) {
      const href = m[1].trim();
      if (
        href.startsWith('/') ||
        href.startsWith('https://www.livworthy.com') ||
        (!href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:'))
      ) {
        const norm = normalizeUrlPath(href);
        if (norm && !norm.startsWith('/admin') && !norm.startsWith('/api') && !norm.startsWith('/test')) {
          outbound.add(norm);
        }
      }
    }

    pagesMap.set(urlPath, {
      filePath: rel,
      urlPath,
      canonicalUrl,
      hasCanonical: !!canMatch,
      isSelfCanonical: normCan === urlPath,
      metaRobots,
      isIndexable,
      outboundInternalLinks: Array.from(outbound),
      inboundLinksCount: 0,
      inboundFrom: [],
    });
  }

  // Calculate inbound links graph
  for (const [sourcePath, page] of pagesMap.entries()) {
    for (const targetPath of page.outboundInternalLinks) {
      const targetPage = pagesMap.get(targetPath);
      if (targetPage) {
        targetPage.inboundLinksCount++;
        targetPage.inboundFrom.push(sourcePath);
      }
    }
  }

  // Identify orphans and issues
  const orphanPages: PageAudit[] = [];
  const nonSelfCanonicals: PageAudit[] = [];
  const missingCanonicals: PageAudit[] = [];

  for (const page of pagesMap.values()) {
    if (page.urlPath !== '/' && page.isIndexable && page.inboundLinksCount === 0) {
      orphanPages.push(page);
    }
    if (!page.hasCanonical) {
      missingCanonicals.push(page);
    }
    if (page.hasCanonical && !page.isSelfCanonical) {
      nonSelfCanonicals.push(page);
    }
  }

  console.log('--- Internal Linking Graph Summary ---');
  console.log(`Total Prerendered Indexable Pages: ${pagesMap.size}`);
  console.log(`Orphan Pages (0 inbound links): ${orphanPages.length}`);
  console.log(`Missing Canonical Tags: ${missingCanonicals.length}`);
  console.log(`Non-Self Canonical Pages: ${nonSelfCanonicals.length}`);

  if (orphanPages.length > 0) {
    console.warn('\n⚠️ Orphan pages detected:');
    for (const p of orphanPages) {
      console.warn(`  - ${p.urlPath} (${p.filePath})`);
    }
  } else {
    console.log('✅ PASS: Zero orphan pages detected. Every indexable page receives contextual internal links.');
  }

  if (nonSelfCanonicals.length > 0) {
    console.warn('\n⚠️ Non-self canonical pages:');
    for (const p of nonSelfCanonicals) {
      console.warn(`  - ${p.urlPath} -> ${p.canonicalUrl}`);
    }
  } else {
    console.log('✅ PASS: 100% of indexable pages have valid self-referencing canonical URLs.');
  }

  // Write audit file
  const outPath = path.join('public', 'data-internal-links-audit.json');
  const auditReport = {
    generatedAt: new Date().toISOString(),
    totalPagesAudited: pagesMap.size,
    orphanPagesCount: orphanPages.length,
    missingCanonicalsCount: missingCanonicals.length,
    nonSelfCanonicalsCount: nonSelfCanonicals.length,
    orphanPages: orphanPages.map((p) => p.urlPath),
    sampleLinkDistribution: Array.from(pagesMap.values())
      .slice(0, 15)
      .map((p) => ({
        urlPath: p.urlPath,
        inboundLinksCount: p.inboundLinksCount,
        outboundLinksCount: p.outboundInternalLinks.length,
      })),
  };

  fs.writeFileSync(outPath, JSON.stringify(auditReport, null, 2), 'utf-8');
  console.log(`\nAudit saved to ${outPath}`);
  console.log('======================================================');

  if (orphanPages.length > 0 || missingCanonicals.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error during internal link audit:', err);
  process.exit(1);
});
