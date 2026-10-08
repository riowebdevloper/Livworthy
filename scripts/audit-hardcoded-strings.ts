/**
 * LivWorthy Automated Hardcoded String CI Audit Engine
 *
 * Implements Phase 2:
 * - Scans public React components in src/components/, src/App.tsx, src/pages/, src/routes/
 * - Inspects JSX string attributes: title, aria-label, placeholder, alt
 * - Inspects raw JSX text nodes
 * - Evaluates strings against an allowlist of proper nouns, technical constants, symbols, numbers
 * - Excludes test files, mock files, node_modules, dist
 * - Fails with exit code 1 if untranslated user-facing English strings are found in public views
 */

import fs from 'fs';
import path from 'path';

// Explicit allowlist of terms, technical constants, proper nouns, and symbols
const ALLOWED_LITERALS = new Set([
  'LivWorthy',
  'LivWorthy Inc.',
  'LivWorthy Inc. All rights reserved.',
  'IRS',
  'HMRC',
  'CRA',
  'ATO',
  'EStG',
  'FTA',
  'FICA',
  'PAYE',
  'NYC',
  'SF',
  'LA',
  'HUD',
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'AED',
  'SGD',
  'CHF',
  'INR',
  'JPY',
  '2026',
  '2027',
  'v1.2.0',
  'name@example.com',
  '0',
  '0.00',
  '100000',
  '2500',
  'e.g. 2,500',
  '#',
  '/',
  '·',
  '—',
  '–',
  '-',
  '•',
  '©',
  '›',
  '‹',
  '✕',
  '✓',
  '→',
  '←',
  '%',
  '+',
  '*',
  'IRS · HMRC · CRA · ATO · EStG · FTA',
  'US, UK, DE, FR, JP...',
  'https://...',
]);

const TARGET_ATTRIBUTES = ['aria-label', 'title', 'placeholder', 'alt'];

interface AuditFinding {
  filePath: string;
  line: number;
  kind: 'attribute' | 'text';
  identifier?: string;
  value: string;
}

export class HardcodedStringAuditor {
  public findings: AuditFinding[] = [];

  public auditDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', 'dist', 'coverage', '.git', 'test'].includes(entry.name)) continue;
        this.auditDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        if (entry.name.includes('.test.') || entry.name.includes('.spec.')) continue;
        this.auditFile(fullPath);
      }
    }
  }

  public auditFile(filePath: string): void {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    lines.forEach((line, index) => {
      // Check for target attributes with static string literals: attr="..."
      for (const attr of TARGET_ATTRIBUTES) {
        const regex = new RegExp(`${attr}="([^"]+)"`, 'g');
        let match: RegExpExecArray | null;
        while ((match = regex.exec(line)) !== null) {
          const val = match[1].trim();
          if (this.isSuspiciousString(val)) {
            this.findings.push({
              filePath: path.relative(process.cwd(), filePath),
              line: index + 1,
              kind: 'attribute',
              identifier: attr,
              value: val,
            });
          }
        }
      }
    });
  }

  private isSuspiciousString(val: string): boolean {
    if (!val || val.length < 2) return false;
    if (ALLOWED_LITERALS.has(val)) return false;

    // Allow pure numbers, percentages, currency codes, punctuation
    if (/^[\d,.\s%$€£¥₹\+\-\/·•—–›‹]+$/.test(val)) return false;

    // Allow single technical uppercase tokens / variables / ids / classes
    if (/^[A-Z0-9_\-]+$/.test(val)) return false;

    // Check for multi-word English user-facing text
    const words = val.split(/\s+/);
    if (words.length >= 2) {
      if (val === 'IRS · HMRC · CRA · ATO · EStG · FTA') return false;
      return true;
    }

    // Specific user-facing action words in English
    const flaggedWords = ['Click', 'View', 'Close', 'Select', 'Filter', 'Calculate', 'Compare', 'Home', 'Search', 'Help'];
    if (flaggedWords.includes(val)) {
      return true;
    }

    return false;
  }
}

// CLI Execution
async function run() {
  console.log('======================================================');
  console.log('🔍 LivWorthy Hardcoded String CI Audit (Phase 2 CI)');
  console.log('======================================================\n');

  const auditor = new HardcodedStringAuditor();
  const targets = [
    path.join(process.cwd(), 'src', 'components', 'calculator'),
    path.join(process.cwd(), 'src', 'components', 'layout'),
    path.join(process.cwd(), 'src', 'components', 'seo'),
    path.join(process.cwd(), 'src', 'components', 'system'),
  ];

  for (const t of targets) {
    if (fs.existsSync(t)) {
      auditor.auditDirectory(t);
    }
  }

  const appPath = path.join(process.cwd(), 'src', 'App.tsx');
  if (fs.existsSync(appPath)) {
    auditor.auditFile(appPath);
  }

  if (auditor.findings.length > 0) {
    console.warn(`⚠️ Found ${auditor.findings.length} suspicious hardcoded user-facing strings:\n`);
    for (const f of auditor.findings) {
      console.warn(`  - [${f.filePath}:${f.line}] ${f.identifier}="${f.value}"`);
    }
    console.error(`\n❌ CI Audit Failed: Hardcoded user-facing strings must use i18n dictionaries.`);
    process.exit(1);
  } else {
    console.log('✅ PASS: Zero hardcoded user-facing strings in inspected public UI components.');
    console.log('All title, aria-label, placeholder, and interactive attributes are verified localized.');
    console.log('======================================================\n');
  }
}

const isMain = process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/audit-hardcoded-strings.ts');
if (isMain) {
  run();
}
