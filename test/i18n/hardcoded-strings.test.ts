import assert from 'node:assert';
import path from 'node:path';
import { HardcodedStringAuditor } from '../../scripts/audit-hardcoded-strings';

console.log('======================================================');
console.log('🧪 Hardcoded String & Accessibility Localization Test');
console.log('======================================================\n');

const auditor = new HardcodedStringAuditor();
const targets = [
  path.join(process.cwd(), 'src', 'components', 'calculator'),
  path.join(process.cwd(), 'src', 'components', 'layout'),
  path.join(process.cwd(), 'src', 'components', 'seo'),
  path.join(process.cwd(), 'src', 'components', 'system'),
];

for (const t of targets) {
  auditor.auditDirectory(t);
}

const appPath = path.join(process.cwd(), 'src', 'App.tsx');
auditor.auditFile(appPath);

if (auditor.findings.length > 0) {
  console.error(`Found ${auditor.findings.length} hardcoded strings:`);
  for (const f of auditor.findings) {
    console.error(`  - ${f.filePath}:${f.line} [${f.identifier}="${f.value}"]`);
  }
}

assert.strictEqual(
  auditor.findings.length,
  0,
  `Expected 0 unlocalized hardcoded strings in public UI, found ${auditor.findings.length}`
);

console.log('✅ PASS: All public UI components are 100% free of unlocalized hardcoded strings.');
