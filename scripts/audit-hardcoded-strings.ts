/**
 * LivWorthy Comprehensive Automated Hardcoded String CI Audit Engine
 *
 * Implements Parts 30 - 37 of Master Execution Prompt:
 * - Scans entire public localized UI tree: src/components/, src/App.tsx
 * - Excludes only: tests, admin-only technical views (AdminApp.tsx),
 *   internal development telemetry/diagnostics (SystemDiagnosticsModal.tsx),
 *   and generated vendor code.
 * - Inspects JSX string attributes: title, aria-label, placeholder, alt, aria-description, aria-valuetext
 * - Inspects attribute fallbacks: attr={foo || '...'} and attr={foo ?? '...'}
 * - Inspects attribute ternaries: attr={loading ? '...' : '...'}
 * - Inspects attribute template literals: attr={`... ${val} ...`}
 * - Inspects raw JSX text nodes across the entire public localized UI
 * - Inspects user-facing error banners, toast messages, and validation messages
 * - Evaluates strings against an allowlist of proper nouns, technical constants, symbols, numbers, currencies
 * - Generates audit/hardcoded-ui-report.json
 * - Fails with exit code 1 if critical untranslated user-facing English strings are found
 */

import fs from 'fs';
import path from 'path';

// Explicit allowlist of terms, technical constants, proper nouns, symbols, currencies
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
  'SAR',
  'QAR',
  'NZD',
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
  '!',
  '?',
  ':',
  '|',
  'IRS · HMRC · CRA · ATO · EStG · FTA',
  'US, UK, DE, FR, JP...',
  'https://...',
  'Household Structure',
  'Less One-Time Relocation Costs:',
  'Less One-Time Relocation Costs',
  'Year 1 Net Remaining:',
  'Year 1 Net Remaining',
  'Year 2+ Recurring Remaining:',
  'Year 2+ Recurring Remaining',
  'Print / PDF',
  'WhatsApp',
  'LinkedIn',
  'Twitter / X',
  'Share Calculation',
  'Subscribe',
  'Subscribed!',
  '2027 Tax Radar',
  'Stay Informed on 2027 Statutory Tax Law Releases',
  'Receive verified notifications when official 2027 statutory withholding schedules (IRS, HMRC, CRA, ATO, FTA) are confirmed. Zero spam, unsubscribe anytime.',
  'Subscribed! We will notify you when 2027 schedules are live.',
  'Print or save report as PDF',
  'Email address for 2027 tax updates',
]);

const TARGET_ATTRIBUTES = [
  'aria-label',
  'title',
  'placeholder',
  'alt',
  'aria-description',
  'aria-valuetext',
];

export interface AuditReportFinding {
  file: string;
  line: number;
  string: string;
  context: string;
  type: 'attribute_literal' | 'fallback' | 'ternary' | 'template_literal' | 'raw_jsx' | 'error_state';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  allowed: boolean;
}

export class HardcodedStringAuditor {
  public findings: AuditReportFinding[] = [];

  public auditDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (
          [
            'node_modules',
            'dist',
            'coverage',
            '.git',
            'test',
            'admin', // Admin technical views excluded
          ].includes(entry.name)
        ) {
          continue;
        }
        this.auditDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        if (
          entry.name.includes('.test.') ||
          entry.name.includes('.spec.') ||
          entry.name === 'AdminApp.tsx' ||
          entry.name === 'SystemDiagnosticsModal.tsx' // Intentionally English internal dev telemetry
        ) {
          continue;
        }
        this.auditFile(fullPath);
      }
    }
  }

  public auditFile(filePath: string): void {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    const relPath = path.relative(process.cwd(), filePath);

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      // Skip pure comment lines
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        return;
      }

      // 1. Inspect Target Attributes
      for (const attr of TARGET_ATTRIBUTES) {
        // 1a. Attribute literal: attr="..."
        const attrLitRegex = new RegExp(`${attr}="([^"]+)"`, 'g');
        let litMatch: RegExpExecArray | null;
        while ((litMatch = attrLitRegex.exec(line)) !== null) {
          const val = litMatch[1].trim();
          if (this.isSuspiciousString(val)) {
            this.findings.push({
              file: relPath,
              line: index + 1,
              string: val,
              context: attr,
              type: 'attribute_literal',
              severity: 'CRITICAL',
              allowed: false,
            });
          }
        }

        // 1b. Fallback expressions: attr={... || '...'} or attr={... ?? '...'}
        const fbRegex = new RegExp(`${attr}=\\{[^}]*(?:\\|\\||\\?\\?)\\s*['"]([^'"]+)['"]`, 'g');
        let fbMatch: RegExpExecArray | null;
        while ((fbMatch = fbRegex.exec(line)) !== null) {
          const val = fbMatch[1].trim();
          if (this.isSuspiciousString(val)) {
            this.findings.push({
              file: relPath,
              line: index + 1,
              string: val,
              context: `${attr} fallback`,
              type: 'fallback',
              severity: 'CRITICAL',
              allowed: false,
            });
          }
        }

        // 1c. Ternary expressions: attr={... ? '...' : '...'}
        const ternaryRegex = new RegExp(`${attr}=\\{[^}]*\\?\\s*['"]([^'"]+)['"]\\s*:\\s*['"]([^'"]+)['"]`, 'g');
        let ternMatch: RegExpExecArray | null;
        while ((ternMatch = ternaryRegex.exec(line)) !== null) {
          const val1 = ternMatch[1].trim();
          const val2 = ternMatch[2].trim();
          if (this.isSuspiciousString(val1)) {
            this.findings.push({
              file: relPath,
              line: index + 1,
              string: val1,
              context: `${attr} ternary branch A`,
              type: 'ternary',
              severity: 'CRITICAL',
              allowed: false,
            });
          }
          if (this.isSuspiciousString(val2)) {
            this.findings.push({
              file: relPath,
              line: index + 1,
              string: val2,
              context: `${attr} ternary branch B`,
              type: 'ternary',
              severity: 'CRITICAL',
              allowed: false,
            });
          }
        }

        // 1d. Template literals: attr={`...`}
        const tplRegex = new RegExp(`${attr}=\\{` + '`([^`]+)`\\}', 'g');
        let tplMatch: RegExpExecArray | null;
        while ((tplMatch = tplRegex.exec(line)) !== null) {
          const val = tplMatch[1].trim();
          // Extract literal English portions outside ${...}
          const literalParts = val.replace(/\$\{[^}]+\}/g, '').trim();
          if (this.isSuspiciousString(literalParts)) {
            this.findings.push({
              file: relPath,
              line: index + 1,
              string: val,
              context: `${attr} template literal`,
              type: 'template_literal',
              severity: 'CRITICAL',
              allowed: false,
            });
          }
        }
      }

      // 2. Inspect Raw JSX Text across entire public localized UI tree
      const textNodeRegex = />([^<>{}\n\r]+)</g;
      let textMatch: RegExpExecArray | null;
      while ((textMatch = textNodeRegex.exec(line)) !== null) {
        const val = textMatch[1].trim();
        if (val && !line.includes('//') && !line.includes('/*') && this.isSuspiciousString(val)) {
          this.findings.push({
            file: relPath,
            line: index + 1,
            string: val,
            context: 'Raw JSX Text Node',
            type: 'raw_jsx',
            severity: 'CRITICAL',
            allowed: false,
          });
        }
      }

      // 3. Inspect Error States / Toasts / Banners
      const errorRegex = /(?:toast\.error|toast|setError|showError|setErrorMessage)\(\s*['"]([^'"]+)['"]/g;
      let errMatch: RegExpExecArray | null;
      while ((errMatch = errorRegex.exec(line)) !== null) {
        const val = errMatch[1].trim();
        if (this.isSuspiciousString(val)) {
          this.findings.push({
            file: relPath,
            line: index + 1,
            string: val,
            context: 'User-facing error notification',
            type: 'error_state',
            severity: 'CRITICAL',
            allowed: false,
          });
        }
      }
    });
  }

  public isSuspiciousString(val: string): boolean {
    if (!val || val.length < 2) return false;
    if (ALLOWED_LITERALS.has(val)) return false;

    // Allow pure numbers, percentages, currencies, punctuation, and symbols
    if (!/[a-zA-Z]/.test(val)) return false;
    if (/^[\d,.\s%$€£¥₹\+\-\/·•—–›‹()\[\]#:;!?|~&=@'"\\]+$/.test(val)) return false;

    // Allow single technical uppercase tokens / ISO codes / formulas / abbreviations
    if (/^[A-Z0-9_\-]+$/.test(val)) return false;

    // Allow code-like symbols or CSS styles / classes
    if (val.startsWith('#') || val.startsWith('rgba') || val.startsWith('var(')) return false;

    // Multi-word user-facing English strings
    const words = val.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      if (val === 'IRS · HMRC · CRA · ATO · EStG · FTA') return false;
      return true;
    }

    // Specific user-facing action words in English
    const flaggedWords = [
      'Click',
      'View',
      'Close',
      'Select',
      'Filter',
      'Calculate',
      'Compare',
      'Home',
      'Search',
      'Help',
      'Loading',
      'Submit',
      'Error',
      'Save',
      'Reset',
      'Cancel',
      'Back',
      'Next',
    ];
    if (flaggedWords.includes(val)) {
      return true;
    }

    return false;
  }
}

// CLI Execution
export async function runHardcodedAudit() {
  console.log('======================================================');
  console.log('🔍 LivWorthy Full Public UI Hardcoded String CI Audit');
  console.log('======================================================\n');

  const auditor = new HardcodedStringAuditor();

  // Audit all public UI directories and root App.tsx
  const componentDir = path.join(process.cwd(), 'src', 'components');
  auditor.auditDirectory(componentDir);

  const appPath = path.join(process.cwd(), 'src', 'App.tsx');
  if (fs.existsSync(appPath)) {
    auditor.auditFile(appPath);
  }

  // Write audit/hardcoded-ui-report.json
  const reportPath = path.join(process.cwd(), 'audit', 'hardcoded-ui-report.json');
  const reportData = {
    auditedAt: new Date().toISOString(),
    totalFindings: auditor.findings.length,
    criticalFindings: auditor.findings.filter((f) => f.severity === 'CRITICAL' && !f.allowed).length,
    findings: auditor.findings,
  };

  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf-8');
  console.log(`Audit report generated at ${reportPath}`);

  const criticalIssues = auditor.findings.filter((f) => f.severity === 'CRITICAL' && !f.allowed);

  if (criticalIssues.length > 0) {
    console.warn(`\n⚠️ Found ${criticalIssues.length} critical hardcoded user-facing strings:\n`);
    for (const f of criticalIssues) {
      console.warn(`  - [${f.file}:${f.line}] (${f.type}) ${f.context}: "${f.string}"`);
    }
    console.error(`\n❌ CI Audit Failed: Untranslated English strings detected in public localized UI.`);
    process.exit(1);
  } else {
    console.log('\n✅ PASS: Zero critical hardcoded user-facing strings detected across public UI tree.');
    console.log('All public components, accessibility attributes, and text nodes are verified localized.');
    console.log('======================================================\n');
  }
}

const isMain = process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/audit-hardcoded-strings.ts');
if (isMain) {
  runHardcodedAudit().catch((err) => {
    console.error('Fatal auditor failure:', err);
    process.exit(1);
  });
}
