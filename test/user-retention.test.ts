import assert from 'node:assert/strict';
import { getRecentScenarios, saveRecentScenario, clearRecentScenarios } from '../src/lib/user-retention';

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

console.log('\n================================================================');
console.log('ALL USER RETENTION & PRIVACY-SAFE SCENARIOS TESTS PASSED!');
console.log('================================================================\n');

