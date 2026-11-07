import assert from 'node:assert/strict';
import { renderFormattedContent } from '../../src/lib/seo-renderer';
import { EVIDENCE_SOURCES } from '../../src/data/evidence-registry';

console.log('=== RUNNING INLINE CITATIONS & EDITORIAL SAFETY TEST SUITE ===');

// Test 1: source: ID lookup and rendering
{
  console.log('Test 1: source: ID lookup and rendering');
  const collected: string[] = [];
  const input = 'Under [IRS Rev. Proc. 2025-32](source:us-irs-tax-2026), the standard deduction is $16,100.';
  const output = renderFormattedContent(input, collected);

  assert.ok(output.includes('href="https://www.irs.gov/pub/irs-drop/rp-25-32.pdf"'), 'Must link to official IRS PDF');
  assert.ok(output.includes('target="_blank"'), 'Must open in new tab');
  assert.ok(output.includes('rel="noopener noreferrer"'), 'Must include security attributes');
  assert.ok(output.includes('IRS Rev. Proc. 2025-32'), 'Must preserve anchor text');
  assert.deepStrictEqual(collected, ['us-irs-tax-2026'], 'Must collect cited source ID');
  console.log('  ✓ Official source: ID properly converted to safe external link with metadata');
}

// Test 2: Approved official https URL
{
  console.log('Test 2: Approved official government domain');
  const input = 'Check the [New York State Tax Department](https://www.tax.ny.gov/pit) for official forms.';
  const output = renderFormattedContent(input);

  assert.ok(output.includes('href="https://www.tax.ny.gov/pit"'), 'Must permit approved official domain');
  assert.ok(output.includes('rel="noopener noreferrer"'), 'Must have safe rel attribute');
  console.log('  ✓ Approved official government domain permitted');
}

// Test 3: Unapproved / untrusted external URL blocked from becoming clickable
{
  console.log('Test 3: Unapproved external domain sanitized to plain text');
  const input = 'Visit this [random blog](https://spamsite.com/fake-advice) for tips.';
  const output = renderFormattedContent(input);

  assert.ok(!output.includes('href="https://spamsite.com'), 'Must NOT create link to unapproved domain');
  assert.ok(output.includes('random blog'), 'Must render anchor text safely');
  console.log('  ✓ Unapproved external link blocked from link injection');
}

// Test 4: XSS prevention & raw HTML escaping
{
  console.log('Test 4: Raw HTML injection prevention');
  const input = 'Dangerous <script>alert("xss")</script> and <img src=x onerror=alert(1)> content.';
  const output = renderFormattedContent(input);

  assert.ok(!output.includes('<script>'), 'Must escape script tags');
  assert.ok(!output.includes('<img'), 'Must escape img tags');
  assert.ok(output.includes('&lt;script&gt;'), 'Must HTML-escape angle brackets');
  console.log('  ✓ Raw HTML tags rigorously escaped');
}

// Test 5: Safe internal path
{
  console.log('Test 5: Safe internal navigation link');
  const input = 'Use our [NYC Salary After Tax Calculator](/salary-after-tax/new-york) to run scenarios.';
  const output = renderFormattedContent(input);

  assert.ok(output.includes('href="/salary-after-tax/new-york"'), 'Must permit safe internal link');
  assert.ok(!output.includes('target="_blank"'), 'Internal links do not need target=_blank');
  console.log('  ✓ Internal deep links render cleanly');
}

// Test 6: Safe bold text formatting
{
  console.log('Test 6: Safe bold text');
  const input = 'This is **essential context** for 2026.';
  const output = renderFormattedContent(input);

  assert.ok(output.includes('<strong>essential context</strong>'), 'Must format bold markdown safely');
  console.log('  ✓ Bold markdown formatted safely');
}

console.log('\n================================================================');
console.log('ALL INLINE CITATION & EDITORIAL SAFETY TESTS PASSED!');
console.log('================================================================\n');
