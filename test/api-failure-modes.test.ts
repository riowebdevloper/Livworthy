import http from 'http';
import { dbService } from '../src/db/client';
import { SalaryWorthCalculator } from '../src/engines/calculator-core/salary-worth';

// Set environment flag before importing server
process.env.SKIP_SERVER_START = '1';
process.env.NODE_ENV = 'test';

async function runApiFailureModesSuite() {
  console.log('--- LIVWORTHY API FAILURE MODES & ISOLATION TEST SUITE ---');

  const { app } = await import('../server');
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    const validPayload = {
      location: {
        countryId: 'US',
        cityId: 'nyc',
        currency: 'USD',
      },
      financials: {
        baseSalary: 100000,
        additionalIncome: 0,
      },
      household: {
        size: 1,
        adults: 1,
        children: 0,
      },
      taxAssumptions: {
        taxYear: '2026',
        filingStatus: 'single',
      },
    };

    // ==========================================
    // 1. TEST: Database Down + Calculate -> 200, NOT_SAVED
    // ==========================================
    console.log('\n[1/3] Testing DB down during calculation (stateless resilience)...');
    const originalPersist = dbService.persistCalculation.bind(dbService);

    // Mock dbService.persistCalculation to fail/throw
    dbService.persistCalculation = async () => {
      throw new Error('Connection to Postgres 5432 timed out');
    };

    try {
      const res = await fetch(`${baseUrl}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });

      if (res.status !== 200) {
        throw new Error(`Expected HTTP 200 when DB is down, got ${res.status}`);
      }

      const body = await res.json();
      if (!body.success) {
        throw new Error(`Expected body.success to be true, got ${body.success}`);
      }
      if (body.persistenceStatus !== 'NOT_SAVED') {
        throw new Error(`Expected persistenceStatus 'NOT_SAVED', got ${body.persistenceStatus}`);
      }
      if (body.scenarioId !== null || body.resultId !== null) {
        throw new Error(`Expected scenarioId and resultId to be null, got ${body.scenarioId}, ${body.resultId}`);
      }
      if (!body.data || !body.data.takeHomeAnnual) {
        throw new Error('Expected valid calculated data in response');
      }

      console.log('PASS: DB down returns HTTP 200, valid result, and truthful persistenceStatus="NOT_SAVED"');
    } finally {
      dbService.persistCalculation = originalPersist;
    }

    // ==========================================
    // 2. TEST: Invalid Payload -> 400 INVALID_PAYLOAD
    // ==========================================
    console.log('\n[2/3] Testing invalid payload validation...');
    const invalidPayload = {
      location: {
        // missing countryId
      },
      financials: {
        baseSalary: 'not-a-number',
      },
    };

    const res400 = await fetch(`${baseUrl}/api/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    if (res400.status !== 400) {
      throw new Error(`Expected HTTP 400 for invalid payload, got ${res400.status}`);
    }

    const body400 = await res400.json();
    if (body400.error !== 'INVALID_PAYLOAD') {
      throw new Error(`Expected error 'INVALID_PAYLOAD', got ${body400.error}`);
    }
    if (!Array.isArray(body400.details)) {
      throw new Error('Expected validation error details array');
    }
    console.log(`PASS: Invalid payload returns HTTP 400 with details: ${JSON.stringify(body400.details)}`);

    // ==========================================
    // 3. TEST: Engine Throws -> 500 Safe Error Message
    // ==========================================
    console.log('\n[3/3] Testing internal calculation failure sanitization...');
    const originalCalculate = SalaryWorthCalculator.calculate;

    SalaryWorthCalculator.calculate = () => {
      throw new Error('Raw internal Postgres secret: postgres://user:secretpass@db.internal:5432/livworthy');
    };

    try {
      const res500 = await fetch(`${baseUrl}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });

      if (res500.status !== 500) {
        throw new Error(`Expected HTTP 500 when calculation engine throws, got ${res500.status}`);
      }

      const body500 = await res500.json();
      if (body500.error !== 'CALCULATION_ERROR') {
        throw new Error(`Expected error 'CALCULATION_ERROR', got ${body500.error}`);
      }
      if (body500.message !== 'Unable to complete this calculation.') {
        throw new Error(`Expected sanitized error message, got: ${body500.message}`);
      }
      if (JSON.stringify(body500).includes('secretpass')) {
        throw new Error('Internal error leaked raw secret credentials!');
      }

      console.log('PASS: Engine exception sanitization returns HTTP 500 with safe, non-leaking message');
    } finally {
      SalaryWorthCalculator.calculate = originalCalculate;
    }

    console.log('\n======================================================');
    console.log('ALL API FAILURE MODE TESTS PASSED.');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runApiFailureModesSuite().catch((err) => {
  console.error('FATAL API FAILURE MODE TEST ERROR:', err);
  process.exit(1);
});
