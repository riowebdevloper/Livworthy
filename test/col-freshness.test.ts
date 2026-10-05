import assert from 'node:assert/strict';
import { classifyDataFreshness } from '../src/engines/col/col-engine';

const now = new Date('2026-10-06T00:00:00Z');

assert.equal(classifyDataFreshness('2026-01', now), 'CURRENT');
assert.equal(classifyDataFreshness('2025-03', now), 'AGING');
assert.equal(classifyDataFreshness('2024-03', now), 'STALE');
assert.equal(classifyDataFreshness('unknown', now), 'UNKNOWN');
assert.equal(classifyDataFreshness('2027-01', now), 'UNKNOWN');

console.log('col-freshness.test.ts: PASS');
