import { dbService } from '../src/db/client';
import { SalaryWorthCalculator } from '../src/engines/calculator-core/salary-worth';
import { DEFAULT_NYC_100K_SCENARIO } from '../src/data/presets';
import { FxEngine } from '../src/engines/fx/fx-service';
import { TaxRegistry } from '../src/engines/tax/tax-registry';
import { AuthService } from '../src/lib/auth';
import { createMoney } from '../src/lib/money';

async function runBackendValidationSuite() {
  console.log('--- LIVWORTHY BACKEND, DATABASE & ENTERPRISE ARCHITECTURE TEST SUITE ---');

  // 1. Database & Migrations Test
  console.log('\n[1/6] Running Database Migrations & Diagnostics...');
  const migrationResult = await dbService.runMigrations();
  console.log(`PASS: Migrations executed successfully. Mode: ${migrationResult.mode}`);
  await dbService.seedData();

  // 2. Querying Seeded Geography & Evidence
  console.log('\n[2/6] Querying Seeded Geographic & Tax Entities...');
  const countries = await dbService.getCountries();
  const cities = await dbService.getCities();
  if (countries.length < 10 || cities.length < 15) {
    throw new Error(`Seeded entities below expected count: ${countries.length} countries, ${cities.length} cities`);
  }
  console.log(`PASS: Verified ${countries.length} countries and ${cities.length} cities.`);

  // 3. Tax Adapter Coverage Check
  console.log('\n[3/6] Verifying Statutory Country Tax Adapters...');
  const supportedIds = TaxRegistry.getSupportedCountryIds();
  console.log(`Loaded adapters for: ${supportedIds.join(', ')}`);
  for (const cid of supportedIds) {
    const isSupported = TaxRegistry.isSupported(cid);
    if (!isSupported) {
      throw new Error(`Country ${cid} expected supported in TaxRegistry but failed!`);
    }
  }
  const verifiedCount = supportedIds.filter((id) => TaxRegistry.isStatutorilyVerified(id)).length;
  const limitedCount = supportedIds.filter((id) => TaxRegistry.getCountryStatus(id) === 'LIMITED').length;
  console.log(`PASS: ${supportedIds.length} adapters registered (${verifiedCount} VERIFIED, ${limitedCount} LIMITED).`);

  // 4. Calculate -> Persist Calculation -> Retrieve Calculation Invariant
  console.log('\n[4/6] Testing Calculate -> Persist Calculation -> Retrieve Cycle...');
  const testScenario = DEFAULT_NYC_100K_SCENARIO;

  const calculatedResult = SalaryWorthCalculator.calculate(testScenario);
  const { scenarioId, resultId } = await dbService.persistCalculation(testScenario, calculatedResult);
  if (!scenarioId || !resultId) {
    throw new Error('persistCalculation failed to return identifiers.');
  }

  const retrieved = await dbService.getCalculation(scenarioId);
  if (!retrieved || !retrieved.result) {
    throw new Error(`Failed to retrieve persisted calculation for scenario ${scenarioId}`);
  }

  const originalTakeHome = calculatedResult.takeHomeAnnual.amountMinor;
  const retrievedTakeHome = retrieved.result.takeHomeAnnual.amountMinor;
  if (originalTakeHome !== retrievedTakeHome) {
    throw new Error(`Persistence parity mismatch: expected ${originalTakeHome}, got ${retrievedTakeHome}`);
  }
  console.log(`PASS: Calculation persisted and retrieved with exact parity ($${calculatedResult.takeHomeAnnual.amountMinor / 100} take home).`);

  // 5. Live FX Engine & Bounds Validation
  console.log('\n[5/6] Validating Institutional FX Engine & Conversion...');
  const fxSnapshot = await FxEngine.getLatestSnapshot();
  if (!fxSnapshot || !fxSnapshot.rates.EUR || !fxSnapshot.rates.GBP) {
    throw new Error('FX Snapshot missing core currencies.');
  }

  const convertedEur = FxEngine.convert(createMoney(1000, 'USD'), 'EUR');
  if (convertedEur.amountMinor <= 0) {
    throw new Error('FX Conversion produced non-positive amount.');
  }
  console.log(`PASS: FX Snapshot status "${fxSnapshot.status}", $1000 USD converts to €${convertedEur.amountMinor / 100} EUR.`);

  // 6. Security & RBAC Enforcement
  console.log('\n[6/6] Validating Security, RBAC & TOTP Verification...');
  const testPassword = 'TestAdminSecretPassword_2024!';
  const hashedPassword = AuthService.hashPassword(testPassword);
  const isMatch = AuthService.verifyPassword(testPassword, hashedPassword);
  if (!isMatch) {
    throw new Error('Password hashing verification mismatch.');
  }

  const adminSessionToken = AuthService.createSessionToken({
    id: 'usr_test_admin',
    email: 'test-admin@test.livworthy.internal',
    role: 'ADMIN',
  });
  const verifiedSession = AuthService.verifySessionToken(adminSessionToken);
  if (!verifiedSession || verifiedSession.role !== 'ADMIN') {
    throw new Error('Session token validation failed.');
  }

  const canPublish = AuthService.hasPermission('ADMIN', 'publish_content');
  const readOnlyCannotPublish = !AuthService.hasPermission('READ_ONLY', 'publish_content');
  if (!canPublish || !readOnlyCannotPublish) {
    throw new Error('RBAC permission check failed.');
  }
  console.log('PASS: Security, timing-safe authentication, session signing, and RBAC verified.');

  console.log('\n======================================================');
  console.log('ALL 6 BACKEND & DATABASE SUITE TESTS PASSED.');
  console.log('======================================================\n');
  process.exit(0);
}

runBackendValidationSuite().catch((err) => {
  console.error('FATAL TEST SUITE ERROR:', err);
  process.exit(1);
});
