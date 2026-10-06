import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';
import { RELOCATION_ROUTES } from '../../src/data/relocation-routes';

const dist=path.resolve('dist');
assert.ok(RELOCATION_ROUTES.length >= 18, 'at least 18 priority relocation routes must be registered');
assert.ok(fs.existsSync(path.join(dist,'relocation','index.html')), 'relocation directory must be generated');
assert.ok(fs.existsSync(path.join(dist,'sitemap-relocation.xml')), 'relocation sitemap must exist');

const sitemap=fs.readFileSync(path.join(dist,'sitemap-relocation.xml'),'utf8');
for(const route of RELOCATION_ROUTES){
  const page=path.join(dist,'relocation',route.slug,'index.html');
  assert.ok(fs.existsSync(page), `relocation page must exist: ${route.slug}`);
  const html=fs.readFileSync(page,'utf8');
  assert.ok(html.includes(`https://www.livworthy.com/relocation/${route.slug}`), `canonical missing for ${route.slug}`);
  assert.ok(sitemap.includes(`https://www.livworthy.com/relocation/${route.slug}`), `sitemap missing ${route.slug}`);
  assert.ok(html.includes('/coverage'), `coverage disclosure link missing for ${route.slug}`);
}

console.log(`relocation-regression.test.ts: PASS (${RELOCATION_ROUTES.length} routes)`);
