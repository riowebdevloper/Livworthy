import fs from 'fs';
import { EVIDENCE_SOURCES } from '../src/data/evidence-registry';

interface CitationCheckResult {
  id: string;
  url: string;
  organization: string;
  status: number | string;
  verdict: 'OK' | 'REDIRECT' | 'BOT_PROTECTED' | 'BROKEN';
  finalUrl?: string;
}

async function checkUrl(id: string, url: string, organization: string): Promise<CitationCheckResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeoutId);

    const status = res.status;
    let verdict: CitationCheckResult['verdict'] = 'OK';

    if (status === 200 || status === 206) {
      verdict = 'OK';
    } else if (status === 403 || status === 202) {
      // Cloudflare / Akamai / AWS WAF bot-challenge
      verdict = 'BOT_PROTECTED';
    } else if (status >= 300 && status < 400) {
      verdict = 'REDIRECT';
    } else if (status >= 400) {
      // Retry with GET before declaring broken
      try {
        const getRes = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          redirect: 'follow',
        });
        if (getRes.status === 200) {
          return { id, url, organization, status: 200, verdict: 'OK', finalUrl: getRes.url };
        } else if (getRes.status === 403 || getRes.status === 202) {
          return { id, url, organization, status: getRes.status, verdict: 'BOT_PROTECTED' };
        } else {
          return { id, url, organization, status: getRes.status, verdict: 'BROKEN' };
        }
      } catch (e: any) {
        return { id, url, organization, status: e.message || 'ERROR', verdict: 'BROKEN' };
      }
    }

    return { id, url, organization, status, verdict, finalUrl: res.url };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { id, url, organization, status: err.name === 'AbortError' ? 'TIMEOUT' : (err.message || 'FETCH_ERROR'), verdict: 'BROKEN' };
  }
}

async function main() {
  const sources = Object.values(EVIDENCE_SOURCES).filter(
    (s): s is (typeof EVIDENCE_SOURCES)[keyof typeof EVIDENCE_SOURCES] & { url: string } =>
      Boolean(s.url && s.url.startsWith('http'))
  );
  console.log(`Checking ${sources.length} authoritative source citations...`);

  const results: CitationCheckResult[] = [];
  // Run with concurrency pool of 5
  const poolSize = 5;
  for (let i = 0; i < sources.length; i += poolSize) {
    const chunk = sources.slice(i, i + poolSize);
    const chunkResults = await Promise.all(chunk.map((s) => checkUrl(s.id, s.url, s.organization)));
    results.push(...chunkResults);
  }

  const okCount = results.filter((r) => r.verdict === 'OK').length;
  const botCount = results.filter((r) => r.verdict === 'BOT_PROTECTED').length;
  const broken = results.filter((r) => r.verdict === 'BROKEN');

  console.log(`\nCitation Health Summary:`);
  console.log(`Total checked: ${results.length}`);
  console.log(`Direct 200 OK: ${okCount}`);
  console.log(`Bot-protected (Akamai/WAF 403/202, browser accessible): ${botCount}`);
  console.log(`Broken: ${broken.length}`);

  if (broken.length > 0) {
    console.log('\nBroken or timed-out citations:');
    for (const b of broken) {
      console.log(`- [${b.id}] (${b.organization}): ${b.url} -> Status: ${b.status}`);
    }
  }

  fs.writeFileSync('./audit/citation-health.json', JSON.stringify(results, null, 2));
}

main().catch(console.error);
