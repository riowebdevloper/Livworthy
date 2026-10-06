import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';

const page=path.resolve('dist','job-offer-comparison','index.html');
assert.ok(fs.existsSync(page),'job-offer-comparison authority page must exist');
const html=fs.readFileSync(page,'utf8');
assert.ok(html.includes('https://www.livworthy.com/job-offer-comparison'),'job offer page must self-canonicalize');
assert.ok(html.includes('/?tab=job-offers'),'job offer page must deep-link to the interactive evaluator');
assert.ok(html.includes('/coverage'),'job offer page must disclose tax coverage access');

const sitemap=fs.readFileSync(path.resolve('dist','sitemap-main.xml'),'utf8');
assert.ok(sitemap.includes('https://www.livworthy.com/job-offer-comparison'),'main sitemap must include job-offer-comparison');

console.log('job-offer-hub.test.ts: PASS');
