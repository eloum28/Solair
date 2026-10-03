/**
 * Automated Unit Tests for VoltPlan Engineering Calculation Engine
 */

import {
  calculateEnergyLoads,
  calculateBatteryBank,
  calculateSolarArrayAndStrings,
  calculateInverterSizing,
  calculateMPPTSizing,
  calculateCompleteSystem,
} from './solarCalculations';
import { INITIAL_DEMO_PROJECT } from './presets';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${msg}`);
  }
}

console.log('--- RUNNING VOLTPLAN CALCULATION TESTS ---');

// Test 1: Known Battery Autonomy Case from Requirement 15
{
  console.log('Test 1: Battery Bank Sizing (Known User Case)');
  const dailyWh = 35400; // 35.4 kWh
  const nighttimeWh = 17700;
  const location = { country: 'Test', city: 'Test', peakSunHours: 5.0, cloudyDaysBuffer: 0 };
  const batteryConfig = {
    chemistry: 'LiFePO4' as const,
    systemVoltage: 48 as const,
    unitVoltage: 51.2,
    unitAh: 100,
    unitNominalKwh: 5.12,
    unitCost: 1450,
    dodLimit: 0.80,
    modelName: 'LiFePO4 51.2V 100Ah',
    autonomyDays: 1.0,
  };
  const advanced = {
    systemLosses: 0.15,
    inverterEfficiency: 0.95,
    batteryRoundtripEfficiency: 0.9025, // sqrt(0.9025) = 0.95 discharge eff
    pvDerating: 0.05,
    cableLoss: 0.02,
    tempDerating: 0.05,
    panelDegradationAnnual: 0.005,
    safeSocThreshold: 0.20,
    dangerSocThreshold: 0.10,
  };

  const result = calculateBatteryBank(dailyWh, nighttimeWh, location, batteryConfig, advanced);
  console.log('Result requiredNominalBatteryKwh:', result.requiredNominalBatteryKwh);
  console.log('Result batteryCount:', result.batteryCount);

  // 35.4 / (0.80 * 0.95 * 0.95) = 35.4 / 0.722 = 49.03 kWh
  assert(Math.abs(result.requiredNominalBatteryKwh - 49.03) < 0.2, `Expected ~49.03 kWh, got ${result.requiredNominalBatteryKwh}`);
  assert(result.batteryCount === 10, `Expected 10 batteries (ceil(49.03/5.12)), got ${result.batteryCount}`);
  assert(result.installedNominalBatteryKwh === 51.2, `Expected 51.2 kWh installed, got ${result.installedNominalBatteryKwh}`);
  assert(result.actualAutonomyDays >= 0.99, `Expected actual autonomy ~1.04 days, got ${result.actualAutonomyDays}`);
  console.log('✓ Test 1 Passed!');
}

// Test 2: Energy Loads Day + Night Reconciliation
{
  console.log('Test 2: Load Reconciliation');
  const energy = calculateEnergyLoads(INITIAL_DEMO_PROJECT.appliances);
  assert(energy.daytimeWh + energy.nighttimeWh === energy.dailyWh, 'daytimeWh + nighttimeWh must strictly equal dailyWh');
  console.log(`✓ Test 2 Passed! Daily Wh = ${energy.dailyWh}, Day = ${energy.daytimeWh}, Night = ${energy.nighttimeWh}`);
}

// Test 3: Solar Generation from ACTUAL Installed Array
{
  console.log('Test 3: Solar Generation from Actual Array');
  const solar = calculateSolarArrayAndStrings(
    INITIAL_DEMO_PROJECT.appliances.reduce((acc, a) => acc + a.quantity * a.watts * a.hoursPerDay, 0),
    INITIAL_DEMO_PROJECT.location,
    INITIAL_DEMO_PROJECT.solar,
    INITIAL_DEMO_PROJECT.advanced,
    INITIAL_DEMO_PROJECT.mppt,
    INITIAL_DEMO_PROJECT.stringDesign
  );

  assert(solar.panelCount * solar.panelWattage === solar.actualArrayWatts, 'Panel count * Wattage must equal actual array watts');
  assert(solar.stringDesign.panelsPerString * solar.stringDesign.parallelStrings === solar.panelCount, 'Strings * series must equal panel count');
  console.log(`✓ Test 3 Passed! Panel Count = ${solar.panelCount}, Array = ${solar.actualArrayWatts}W, Strings = ${solar.stringDesign.parallelStrings}×${solar.stringDesign.panelsPerString}`);
}

// Test 4: Inverter Continuous and Surge Verification
{
  console.log('Test 4: Inverter Sizing');
  const inv = calculateInverterSizing(4000, 9000, { headroom: 0.25, efficiency: 0.92 });
  assert(inv.continuousRequirementKw === 5.0, `Expected 5.0 kW continuous req, got ${inv.continuousRequirementKw}`);
  assert(inv.surgeRequirementKw === 9.0, `Expected 9.0 kW surge req, got ${inv.surgeRequirementKw}`);
  assert(inv.recommendedInverterKw >= 5, 'Recommended inverter must be at least 5 kW');
  console.log(`✓ Test 4 Passed! Recommended Inverter = ${inv.recommendedInverterKw} kW`);
}

// Test 5: Full System Invariant Validation on Demo Project
{
  console.log('Test 5: Full System Invariant Consistency');
  const full = calculateCompleteSystem(
    INITIAL_DEMO_PROJECT.appliances,
    INITIAL_DEMO_PROJECT.location,
    INITIAL_DEMO_PROJECT.solar,
    INITIAL_DEMO_PROJECT.battery,
    INITIAL_DEMO_PROJECT.inverter,
    INITIAL_DEMO_PROJECT.mppt,
    INITIAL_DEMO_PROJECT.advanced,
    INITIAL_DEMO_PROJECT.costs,
    INITIAL_DEMO_PROJECT.stringDesign
  );

  assert(full.invariantErrors.length === 0, `Invariants failed: ${full.invariantErrors.join('; ')}`);
  assert(full.status === 'WELL_SIZED_PENDING' || full.status === 'WELL_SIZED_VERIFIED', `Expected WELL_SIZED status, got ${full.status}`);
  console.log(`✓ Test 5 Passed! System is ${full.status} with 0 invariant errors.`);
  console.log(`- Daily Load: ${full.dailyKwh} kWh/day`);
  console.log(`- Solar Generation: ${full.dailySolarGenerationKwh} kWh/day (Surplus: +${full.dailySolarSurplusDeficitKwh} kWh/day, Margin: +${full.solarProductionMargin}%)`);
  console.log(`- Battery: ${full.installedNominalBatteryKwh} kWh (${full.batteryCount} units), Actual Autonomy: ${full.actualAutonomyDays} days`);
  console.log(`- String Design: ${full.stringDesign?.parallelStrings} strings × ${full.stringDesign?.panelsPerString} panels = ${full.panelCount} total panels`);
}

console.log('ALL UNIT TESTS COMPLETED SUCCESSFULLY!');
