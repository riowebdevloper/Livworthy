import assert from 'node:assert/strict';
import {
  getRecentScenarios,
  saveRecentScenario,
  clearRecentScenarios,
  sanitizeStoredUrl,
} from '../src/lib/user-retention';

// Setup mock window and localStorage for node environment
const storage = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, value: string) => { storage.set(key, value); },
  removeItem: (key: string) => { storage.delete(key); },
  clear: () => { storage.clear(); },
};

(global as any).window = {};
(global as any).localStorage = mockLocalStorage;

console.log('=== RUNNING USER RETENTION & PRIVACY-SAFE SCENARIOS TEST SUITE ===');

// Test 1: Empty storage
{
  console.log('Test 1: Empty storage returns empty array');
  clearRecentScenarios();
  const scenarios = getRecentScenarios();
  assert.deepStrictEqual(scenarios, []);
  console.log('  ✓ Returns empty array on clean initial state');
}

// Test 2: Saving items and deduplication
{
  console.log('Test 2: Saving items and deduplication');
  clearRecentScenarios();

  saveRecentScenario({
    id: 'salary-worth',
    title: 'Salary Worth Calculator',
    url: '/',
    tab: 'salary-worth',
  });

  saveRecentScenario({
    id: 'compare',
    title: 'Cost of Living Comparison',
    url: '/compare',
    tab: 'compare',
  });

  let scenarios = getRecentScenarios();
  assert.strictEqual(scenarios.length, 2);
  assert.strictEqual(scenarios[0].id, 'compare', 'Most recently viewed must be first');
  assert.strictEqual(scenarios[1].id, 'salary-worth');

  // Re-save existing item (should move to top without duplicate)
  saveRecentScenario({
    id: 'salary-worth',
    title: 'Salary Worth Calculator',
    url: '/',
    tab: 'salary-worth',
  });

  scenarios = getRecentScenarios();
  assert.strictEqual(scenarios.length, 2, 'Deduplication must prevent duplicates');
  assert.strictEqual(scenarios[0].id, 'salary-worth', 'Re-saved item moved to front');
  console.log('  ✓ Deduplication and MRU order confirmed');
}

// Test 3: Cap at MAX_ITEMS (6)
{
  console.log('Test 3: Cap at 6 maximum items');
  clearRecentScenarios();

  for (let i = 1; i <= 10; i++) {
    saveRecentScenario({
      id: `item-${i}`,
      title: `Scenario ${i}`,
      url: `/item-${i}`,
      tab: 'calculator',
    });
  }

  const scenarios = getRecentScenarios();
  assert.strictEqual(scenarios.length, 6, 'Must cap at 6 items maximum');
  assert.strictEqual(scenarios[0].id, 'item-10', 'Most recent item 10 is at front');
  assert.strictEqual(scenarios[5].id, 'item-5', 'Item 5 is last, 1-4 evicted');
  console.log('  ✓ Max 6 items cap properly enforced');
}

// Test 4: Clear recent scenarios
{
  console.log('Test 4: Clearing all recent scenarios');
  clearRecentScenarios();
  const scenarios = getRecentScenarios();
  assert.strictEqual(scenarios.length, 0);
  console.log('  ✓ clearRecentScenarios completely wipes stored history');
}

// Test 5: Strict Anti-XSS and Offsite URL Rejection
{
  console.log('Test 5: Strict Anti-XSS and Offsite URL Rejection');
  assert.strictEqual(sanitizeStoredUrl('https://malicious.example.com/steal'), null);
  assert.strictEqual(sanitizeStoredUrl('http://evil.com'), null);
  assert.strictEqual(sanitizeStoredUrl('//evil.com/phishing'), null);
  assert.strictEqual(sanitizeStoredUrl('javascript:alert(document.cookie)'), null);
  assert.strictEqual(sanitizeStoredUrl('data:text/html,<script>alert(1)</script>'), null);
  assert.strictEqual(sanitizeStoredUrl('vbscript:msgbox'), null);
  assert.strictEqual(sanitizeStoredUrl(''), null);
  assert.strictEqual(sanitizeStoredUrl('   '), null);

  // Valid relative internal paths must pass
  assert.strictEqual(sanitizeStoredUrl('/compare'), '/compare');
  assert.strictEqual(sanitizeStoredUrl('/es/salary-worth'), '/es/salary-worth');
  assert.strictEqual(sanitizeStoredUrl('/cities/nyc'), '/cities/nyc');
  console.log('  ✓ Rejects all external schemes, protocol-relative paths, and injections');
}

// Test 6: Sensitive Query Parameter Stripping & Privacy Invariants
{
  console.log('Test 6: Sensitive Query Parameter Stripping');
  // Raw salary and personal inputs must be stripped
  const sanitized1 = sanitizeStoredUrl('/compare?salary=100000&rent=3000&bonus=5000');
  assert.strictEqual(sanitized1, '/compare', 'Sensitive salary & rent params must be stripped');

  // Safe routing parameters like tab or lang can remain
  const sanitized2 = sanitizeStoredUrl('/salary-after-tax?tab=salary-after-tax&lang=es');
  assert.strictEqual(sanitized2, '/salary-after-tax?tab=salary-after-tax&lang=es');

  // Verify that saving an item with malicious or sensitive URL is safely handled
  clearRecentScenarios();
  saveRecentScenario({
    id: 'malicious',
    title: 'Phishing Attempt',
    url: 'https://evil.com/login',
    tab: 'calculator',
  });
  assert.strictEqual(getRecentScenarios().length, 0, 'Malicious external entry must not be saved');

  saveRecentScenario({
    id: 'salary-run',
    title: 'Compare NYC',
    url: '/compare?salary=250000&tab=compare',
    tab: 'compare',
  });
  const saved = getRecentScenarios();
  assert.strictEqual(saved.length, 1);
  assert.strictEqual(saved[0].url, '/compare?tab=compare', 'Salary stripped while retaining safe route');
  console.log('  ✓ Sensitive query params stripped and storage strictly sanitized');
}

console.log('\n================================================================');
console.log('ALL USER RETENTION & PRIVACY-SAFE SCENARIOS TESTS PASSED!');
console.log('================================================================\n');
