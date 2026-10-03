import { 
  SolarPanel, 
  Battery, 
  Inverter, 
  MPPTController, 
  ValidationMatrixItem, 
  ValidationScorecardItem, 
  SystemDcBusAnalysis, 
  StringAllocation, 
  MpptTrackerValidation, 
  ProfessionalValidationResult,
  ProjectValidationStatus 
} from '../types/equipment';
import { CalculationResults, LocationConfig, StringDesignConfig } from '../types/solar';

/**
 * Cold-weather temperature corrected open-circuit voltage (Voc)
 * Formula (Section 10):
 * Corrected Voc = Voc_STC * [1 + abs(VocTempCoefficient / 100) * (25°C - Tmin)]
 */
export function calculateColdVoc(
  vocSTC: number,
  tempCoeffVocPercent: number,
  tempMinC: number
): number {
  const coeff = Math.abs(tempCoeffVocPercent) / 100;
  const deltaT = 25 - tempMinC;
  const coldVoc = vocSTC * (1 + coeff * Math.max(0, deltaT));
  return Number(coldVoc.toFixed(2));
}

/**
 * Hot-weather temperature corrected maximum power voltage (Vmp)
 */
export function calculateHotVmp(
  vmpSTC: number,
  tempCoeffVocPercent: number,
  tempMaxC: number
): number {
  const coeff = Math.abs(tempCoeffVocPercent) / 100;
  const deltaT = tempMaxC - 25;
  const hotVmp = vmpSTC * (1 - coeff * Math.max(0, deltaT));
  return Number(hotVmp.toFixed(2));
}

/**
 * Evaluates the full professional validation matrix, string allocation, and bus currents.
 */
export function validateProfessionalSystem(
  results: CalculationResults,
  panel: SolarPanel,
  battery: Battery,
  inverter: Inverter,
  mppt: MPPTController,
  location: LocationConfig,
  stringConfig?: StringDesignConfig,
  customAssignments?: { stringIndex: number; mpptIndex: number; trackerIndex: number }[]
): ProfessionalValidationResult {
  const tempMin = stringConfig?.tempMinC ?? 15;
  const tempMax = stringConfig?.tempMaxC ?? 45;

  // 1. Panel string electrical properties
  const panelsPerString = results.stringDesign?.panelsPerString || 5;
  const parallelStringsCount = results.stringDesign?.parallelStrings || 2;
  const totalPanels = results.panelCount;

  const panelVocCold = calculateColdVoc(panel.voc, panel.tempCoeffVoc, tempMin);
  const panelVmpHot = calculateHotVmp(panel.vmp, panel.tempCoeffVoc, tempMax);

  const stringVocSTC = Number((panel.voc * panelsPerString).toFixed(1));
  const stringVocCold = Number((panelVocCold * panelsPerString).toFixed(1));
  const stringVmpSTC = Number((panel.vmp * panelsPerString).toFixed(1));
  const stringVmpHot = Number((panelVmpHot * panelsPerString).toFixed(1));
  const stringIsc = panel.isc;
  const stringImp = panel.imp;
  const stringWatts = panel.ratedPowerW * panelsPerString;

  // Build String Allocations
  const stringAllocations: StringAllocation[] = [];
  for (let i = 1; i <= parallelStringsCount; i++) {
    const custom = customAssignments?.find((c) => c.stringIndex === i);
    // Default assignment: distribute across available MPPTs/trackers
    const assignedMppt = custom?.mpptIndex || (results.mpptUnitsCount > 1 ? ((i - 1) % results.mpptUnitsCount) + 1 : 1);
    const assignedTracker = custom?.trackerIndex || 1;

    stringAllocations.push({
      stringIndex: i,
      panelsCount: panelsPerString,
      assignedMpptIndex: assignedMppt,
      assignedTrackerIndex: assignedTracker,
      vocSTC: stringVocSTC,
      vocCold: stringVocCold,
      vmpSTC: stringVmpSTC,
      vmpHot: stringVmpHot,
      isc: stringIsc,
      imp: stringImp,
      watts: stringWatts,
    });
  }

  // 2. MPPT and Inverter Tracker Limits
  // If inverter is hybrid, it has its own MPPT specs; otherwise separate MPPT is used
  const effectiveMaxVoc = inverter.isHybrid && inverter.maxPvVoc ? inverter.maxPvVoc : mppt.maxPvVoc;
  const effectiveMpptVmin = inverter.isHybrid && inverter.mpptVoltageRangeMinV ? inverter.mpptVoltageRangeMinV : mppt.mpptVoltageMinV;
  const effectiveMpptVmax = inverter.isHybrid && inverter.mpptVoltageRangeMaxV ? inverter.mpptVoltageRangeMaxV : mppt.mpptVoltageMaxV;
  const effectiveMaxIscPerTracker = inverter.isHybrid && inverter.maxShortCircuitCurrentA ? inverter.maxShortCircuitCurrentA : mppt.maxPvShortCircuitCurrentA;
  const effectiveMaxPvPower = inverter.isHybrid && inverter.maxPvInputPowerKw ? inverter.maxPvInputPowerKw * 1000 : (mppt.maxPvPowerW_48V || 5800);

  // Group strings by MPPT tracker
  const trackerMap = new Map<string, StringAllocation[]>();
  for (const s of stringAllocations) {
    const key = `mppt-${s.assignedMpptIndex}-trk-${s.assignedTrackerIndex}`;
    const list = trackerMap.get(key) || [];
    list.push(s);
    trackerMap.set(key, list);
  }

  const trackerValidations: MpptTrackerValidation[] = [];
  for (let m = 1; m <= Math.max(1, results.mpptUnitsCount); m++) {
    const numTrackers = inverter.isHybrid ? (inverter.numberOfMppts || 2) : (mppt.numberOfTrackers || 1);
    for (let t = 1; t <= numTrackers; t++) {
      const key = `mppt-${m}-trk-${t}`;
      const attached = trackerMap.get(key) || [];
      const totalAttachedPanels = attached.reduce((sum, s) => sum + s.panelsCount, 0);
      const totalAttachedWatts = attached.reduce((sum, s) => sum + s.watts, 0);
      const totalAttachedIsc = attached.reduce((sum, s) => sum + s.isc, 0);
      const totalAttachedImp = attached.reduce((sum, s) => sum + s.imp, 0);

      const isVocSafe = attached.length === 0 || stringVocCold <= effectiveMaxVoc;
      const isVmpInRange = attached.length === 0 || (stringVmpHot >= effectiveMpptVmin && stringVmpSTC <= effectiveMpptVmax);
      const isIscSafe = attached.length === 0 || totalAttachedIsc <= effectiveMaxIscPerTracker;
      const isPowerSafe = attached.length === 0 || totalAttachedWatts <= effectiveMaxPvPower;
      const headroom = attached.length > 0 ? Number((effectiveMaxVoc - stringVocCold).toFixed(1)) : effectiveMaxVoc;

      const notes: string[] = [];
      if (!isVocSafe) notes.push(`Voc Cold (${stringVocCold}V) exceeds max (${effectiveMaxVoc}V)!`);
      if (stringVmpHot < effectiveMpptVmin) notes.push(`Hot Vmp (${stringVmpHot}V) below minimum tracking voltage (${effectiveMpptVmin}V).`);
      if (!isIscSafe) notes.push(`Array Isc (${totalAttachedIsc.toFixed(1)}A) exceeds tracker rating (${effectiveMaxIscPerTracker}A).`);
      if (!isPowerSafe) notes.push(`PV power (${(totalAttachedWatts / 1000).toFixed(1)}kW) exceeds tracker input (${(effectiveMaxPvPower / 1000).toFixed(1)}kW).`);

      trackerValidations.push({
        mpptIndex: m,
        trackerIndex: t,
        connectedStringsCount: attached.length,
        totalPanels: totalAttachedPanels,
        totalWatts: totalAttachedWatts,
        stringVocCold: attached.length > 0 ? stringVocCold : 0,
        stringVmpHot: attached.length > 0 ? stringVmpHot : 0,
        totalIsc: totalAttachedIsc,
        totalImp: totalAttachedImp,
        isVocSafe,
        isVmpInRange,
        isIscSafe,
        isPowerSafe,
        headroomVoltageV: headroom,
        notes,
      });
    }
  }

  // 3. Battery Current & Power Capability (Section 4, 11)
  const invEfficiency = (inverter.efficiencyPercent || 94) / 100;
  const nominalBatteryV = battery.nominalVoltageV || 51.2;
  const batteryCount = results.batteryCount;

  // Inverter DC current required at full continuous output
  // DC current = P_ac / (V_bat * invEfficiency)
  const fullLoadWatts = Math.max(results.peakContinuousW, inverter.continuousOutputPowerKw * 1000);
  const inverterContinuousDcCurrentA = Number((fullLoadWatts / (nominalBatteryV * invEfficiency)).toFixed(1));

  // Bank continuous discharge capability
  // Derating factor of 0.95 for multi-battery parallel bus imbalance
  const bankNominalDischargeCurrentA = batteryCount * battery.maxContinuousDischargeCurrentA;
  const bankContinuousDischargeCurrentA = Number((bankNominalDischargeCurrentA * (batteryCount > 1 ? 0.95 : 1.0)).toFixed(1));
  const isBatteryCurrentSufficient = bankContinuousDischargeCurrentA >= inverterContinuousDcCurrentA;
  const batteryCurrentHeadroomA = Number((bankContinuousDischargeCurrentA - inverterContinuousDcCurrentA).toFixed(1));
  const batteryCurrentMarginPercent = inverterContinuousDcCurrentA > 0 
    ? Number(((batteryCurrentHeadroomA / inverterContinuousDcCurrentA) * 100).toFixed(1))
    : 0;

  // Maximum solar charging current to DC bus
  const maxSolarChargingCurrentA = results.installedMpptCurrentA;
  const combinedWorstCaseBusCurrentA = Math.max(inverterContinuousDcCurrentA, maxSolarChargingCurrentA);
  const recommendedMinimumBusbarAmpacityA = Number((combinedWorstCaseBusCurrentA * 1.25).toFixed(1));

  const busAnalysis: SystemDcBusAnalysis = {
    inverterFullLoadDischargeCurrentA: inverterContinuousDcCurrentA,
    inverterEfficiencyUsed: invEfficiency,
    batteryBankContinuousDischargeCurrentA: bankContinuousDischargeCurrentA,
    batteryCurrentHeadroomA,
    batteryCurrentMarginPercent,
    isBatteryCurrentSufficient,
    maxSolarChargingCurrentA,
    combinedWorstCaseBusCurrentA,
    recommendedMinimumBusbarAmpacityA,
  };

  // 4. Build Validation Matrix Table (Section 8)
  const matrix: ValidationMatrixItem[] = [];

  // Check 1: PV Power
  const reqPvKw = (results.requiredArrayW / 1000).toFixed(2);
  const installedPvKw = ((totalPanels * panel.ratedPowerW) / 1000).toFixed(2);
  const isPvPowerPass = (totalPanels * panel.ratedPowerW) >= results.requiredArrayW;
  const pvMarginPct = results.requiredArrayW > 0 
    ? Math.round((((totalPanels * panel.ratedPowerW) - results.requiredArrayW) / results.requiredArrayW) * 100)
    : 0;
  matrix.push({
    id: 'check-pv-power',
    checkName: 'PV Array Power',
    category: 'solar',
    requirementValue: `${(results.requiredArrayW / 1000).toFixed(1)} kW`,
    equipmentValue: `${installedPvKw} kW`,
    margin: `${pvMarginPct >= 0 ? '+' : ''}${pvMarginPct}%`,
    status: isPvPowerPass ? 'PASS' : 'FAIL',
    engineeringDetails: `${totalPanels} panels (${panel.ratedPowerW}W) provide ${(Number(installedPvKw) - Number(reqPvKw)).toFixed(2)} kW excess over minimum array requirements.`,
  });

  // Check 2: Battery Energy Capacity
  const reqBattKwh = results.requiredNominalBatteryKwh.toFixed(1);
  const installedBattKwh = (batteryCount * battery.nominalKwh).toFixed(1);
  const isBattEnergyPass = (batteryCount * battery.nominalKwh) >= results.requiredNominalBatteryKwh;
  const battEnergyMargin = Number(((batteryCount * battery.nominalKwh) - results.requiredNominalBatteryKwh).toFixed(1));
  matrix.push({
    id: 'check-batt-energy',
    checkName: 'Battery Energy',
    category: 'battery',
    requirementValue: `${reqBattKwh} kWh required`,
    equipmentValue: `${installedBattKwh} kWh installed`,
    margin: `${battEnergyMargin >= 0 ? '+' : ''}${battEnergyMargin} kWh`,
    status: isBattEnergyPass ? 'PASS' : 'FAIL',
    engineeringDetails: `Installed bank yields ${results.actualAutonomyDays} days actual autonomy at ${battery.recommendedDodPercent}% DoD limit.`,
  });

  // Check 3: Battery Continuous Current
  const battDischargeKw = ((bankContinuousDischargeCurrentA * nominalBatteryV) / 1000).toFixed(1);
  const invReqKw = (fullLoadWatts / 1000).toFixed(1);
  matrix.push({
    id: 'check-batt-power',
    checkName: 'Battery Continuous Current',
    category: 'battery',
    requirementValue: `${inverterContinuousDcCurrentA} A required`,
    equipmentValue: `${bankContinuousDischargeCurrentA} A available`,
    margin: `+${batteryCurrentHeadroomA} A`,
    status: isBatteryCurrentSufficient ? 'PASS' : 'FAIL',
    engineeringDetails: `Bank delivers ${bankContinuousDischargeCurrentA} A continuous (+${batteryCurrentMarginPercent}% margin) over inverter ${inverterContinuousDcCurrentA} A requirement.`,
  });

  // Check 4: Inverter Continuous Rating
  const reqInvKw = results.continuousRequirementKw.toFixed(1);
  const actualInvKw = inverter.continuousOutputPowerKw.toFixed(1);
  const isInvContPass = inverter.continuousOutputPowerKw >= results.continuousRequirementKw;
  const invContMargin = Number((inverter.continuousOutputPowerKw - results.continuousRequirementKw).toFixed(1));
  matrix.push({
    id: 'check-inv-cont',
    checkName: 'Inverter Continuous Power',
    category: 'inverter',
    requirementValue: `${reqInvKw} kW required`,
    equipmentValue: `${actualInvKw} kW`,
    margin: `${invContMargin >= 0 ? '+' : ''}${invContMargin} kW`,
    status: isInvContPass ? 'PASS' : 'FAIL',
    engineeringDetails: `Continuous thermal load factor: ${((results.peakContinuousW / (inverter.continuousOutputPowerKw * 1000)) * 100).toFixed(0)}%. Model: ${inverter.model}.`,
  });

  // Check 5: Inverter Surge Rating
  const reqSurgeKw = results.surgeRequirementKw.toFixed(2);
  const actualSurgeKw = inverter.surgePowerKw.toFixed(1);
  const isInvSurgePass = inverter.surgePowerKw >= results.surgeRequirementKw;
  const invSurgeMargin = Number((inverter.surgePowerKw - results.surgeRequirementKw).toFixed(2));
  matrix.push({
    id: 'check-inv-surge',
    checkName: 'Inverter Surge',
    category: 'inverter',
    requirementValue: `${reqSurgeKw} kW required`,
    equipmentValue: `${actualSurgeKw} kW (${inverter.surgeDurationSec}s)`,
    margin: `${invSurgeMargin >= 0 ? '+' : ''}${invSurgeMargin} kW`,
    status: isInvSurgePass ? 'PASS' : 'FAIL',
    engineeringDetails: `Surge headroom: ${invSurgeMargin} kW for heavy compressor & motor starting inrush.`,
  });

  // Check 6: Battery Voltage Compatibility
  const isVoltageCompatible = Math.abs(inverter.batteryVoltageV - battery.nominalVoltageV) <= 4;
  matrix.push({
    id: 'check-batt-voltage',
    checkName: 'Battery Voltage',
    category: 'bus',
    requirementValue: `${results.systemVoltage}V class`,
    equipmentValue: `${battery.nominalVoltageV}V nominal`,
    margin: isVoltageCompatible ? 'Compatible' : 'Mismatch',
    status: isVoltageCompatible ? 'PASS' : 'FAIL',
    engineeringDetails: `Inverter DC input is rated for ${inverter.batteryVoltageV}V; battery bank nominal is ${battery.nominalVoltageV}V.`,
  });

  // Check 7: Cold Weather PV Voc
  const isVocOverallSafe = stringVocCold <= effectiveMaxVoc;
  const vocHeadroom = Number((effectiveMaxVoc - stringVocCold).toFixed(1));
  matrix.push({
    id: 'check-pv-voc',
    checkName: 'PV String Voc',
    category: 'solar',
    requirementValue: `${effectiveMaxVoc}V max`,
    equipmentValue: `${stringVocCold}V (at ${tempMin}°C)`,
    margin: `${vocHeadroom}V headroom`,
    status: isVocOverallSafe ? 'PASS' : 'FAIL',
    engineeringDetails: `STC Voc is ${stringVocSTC}V; panel temp coeff (${panel.tempCoeffVoc}%/°C) adjusts cold Voc to ${stringVocCold}V. MPPT max: ${effectiveMaxVoc}V.`,
  });

  // Check 8: Summer Hot PV Vmp Tracking
  const isVmpOverallPass = stringVmpHot >= effectiveMpptVmin && stringVmpSTC <= effectiveMpptVmax;
  matrix.push({
    id: 'check-pv-vmp',
    checkName: 'PV String Vmp',
    category: 'solar',
    requirementValue: `${effectiveMpptVmin}–${effectiveMpptVmax}V`,
    equipmentValue: `${stringVmpHot}V (Hot ${tempMax}°C)`,
    margin: isVmpOverallPass ? 'Within range' : 'Outside window',
    status: isVmpOverallPass ? 'PASS' : 'WARNING',
    engineeringDetails: `Hot operating Vmp ${stringVmpHot}V and STC Vmp ${stringVmpSTC}V stay within tracker range (${effectiveMpptVmin}–${effectiveMpptVmax}V).`,
  });

  // Check 9: Array Short-Circuit Current
  const arrayIsc = totalPanels > 0 ? panel.isc : 0;
  const isIscPass = arrayIsc <= effectiveMaxIscPerTracker;
  const iscMargin = Number((effectiveMaxIscPerTracker - arrayIsc).toFixed(1));
  matrix.push({
    id: 'check-pv-isc',
    checkName: 'PV String Isc',
    category: 'solar',
    requirementValue: `${effectiveMaxIscPerTracker.toFixed(1)} A max`,
    equipmentValue: `${arrayIsc.toFixed(1)} A`,
    margin: `${iscMargin >= 0 ? '+' : ''}${iscMargin} A margin`,
    status: isIscPass ? 'PASS' : 'FAIL',
    engineeringDetails: `Single string Isc is ${arrayIsc.toFixed(1)}A vs tracker limit ${effectiveMaxIscPerTracker}A.`,
  });

  // Check 10: MPPT Charging Output Current
  const reqMpptA = results.requiredMpptCurrentA;
  const installedMpptA = results.installedMpptCurrentA;
  const isMpptPass = installedMpptA >= reqMpptA;
  const mpptHeadroom = Number((installedMpptA - reqMpptA).toFixed(1));
  matrix.push({
    id: 'check-mppt-current',
    checkName: 'MPPT Charge Capacity',
    category: 'mppt',
    requirementValue: `${reqMpptA} A`,
    equipmentValue: `${installedMpptA} A (${results.mpptUnitsCount} × ${mppt.maxChargingCurrentA}A)`,
    margin: `+${mpptHeadroom} A`,
    status: isMpptPass ? 'PASS' : 'WARNING',
    engineeringDetails: `Installed charging ampacity gives +${mpptHeadroom} A safety headroom over continuous demand.`,
  });

  // 5. Compatibility Warnings
  const compatibilityWarnings: string[] = [];

  // Parallel battery check
  if (batteryCount > battery.maxParallelUnits) {
    compatibilityWarnings.push(
      `Parallel Limit Exceeded: Battery bank has ${batteryCount} units in parallel, but manufacturer ${battery.manufacturer} limits parallel stacking to ${battery.maxParallelUnits} units. Dedicated combiner busbars and multi-rack BMS required.`
    );
  }

  // Voltage compatibility check
  if (inverter.batteryVoltageV !== battery.nominalVoltageV && Math.abs(inverter.batteryVoltageV - battery.nominalVoltageV) > 4) {
    compatibilityWarnings.push(
      `Voltage Incompatibility: Inverter is rated for ${inverter.batteryVoltageV}V DC nominal, but selected battery is ${battery.nominalVoltageV}V.`
    );
  }

  // Communication protocol check
  const inverterComms = inverter.supportedBatteryComms || [];
  const batteryComms = battery.communicationProtocols || [];
  const hasCommonComm = batteryComms.some((c) => inverterComms.includes(c));
  if (batteryComms.length > 0 && inverterComms.length > 0 && !hasCommonComm) {
    compatibilityWarnings.push(
      `BMS Communication Mismatch: Battery supports [${batteryComms.join(', ')}] while Inverter expects [${inverterComms.join(', ')}]. Closed-loop CAN integration may require external protocol bridge.`
    );
  }

  // Battery current check
  if (!isBatteryCurrentSufficient) {
    compatibilityWarnings.push(
      `Battery Current Deficit: Inverter requires ${inverterContinuousDcCurrentA} A DC at full load, but battery bank is only rated for ${bankContinuousDischargeCurrentA} A continuous. Add more batteries or reduce inverter peak load.`
    );
  }

  // Tracker checks
  for (const tv of trackerValidations) {
    if (tv.connectedStringsCount > 0 && !tv.isVocSafe) {
      compatibilityWarnings.push(
        `MPPT ${tv.mpptIndex} Tracker ${tv.trackerIndex}: Cold Voc (${tv.stringVocCold}V) exceeds maximum limit (${effectiveMaxVoc}V). Reduce panels per string!`
      );
    }
    if (tv.connectedStringsCount > 0 && !tv.isIscSafe) {
      compatibilityWarnings.push(
        `MPPT ${tv.mpptIndex} Tracker ${tv.trackerIndex}: Current (${tv.totalIsc}A) exceeds tracker maximum rated input current (${effectiveMaxIscPerTracker}A).`
      );
    }
  }

  // 6. Unverified Items Tracking (Section 15, 16)
  const unverifiedItems: string[] = [];
  if (panel.sourceStatus !== 'DATASHEET_VERIFIED') {
    unverifiedItems.push(`Solar Panel: ${panel.manufacturer} ${panel.model} (${panel.sourceStatus.replace('_', ' ')})`);
  }
  if (battery.sourceStatus !== 'DATASHEET_VERIFIED') {
    unverifiedItems.push(`Battery: ${battery.manufacturer} ${battery.model} (${battery.sourceStatus.replace('_', ' ')})`);
  }
  if (inverter.sourceStatus !== 'DATASHEET_VERIFIED') {
    unverifiedItems.push(`Inverter: ${inverter.manufacturer} ${inverter.model} (${inverter.sourceStatus.replace('_', ' ')})`);
  }
  if (!inverter.isHybrid && mppt.sourceStatus !== 'DATASHEET_VERIFIED') {
    unverifiedItems.push(`MPPT Controller: ${mppt.manufacturer} ${mppt.model} (${mppt.sourceStatus.replace('_', ' ')})`);
  }

  // 7. Validation Scorecard (Section 9 & 10)
  const isAnyFail = matrix.some((m) => m.status === 'FAIL');
  const isAnyWarning = matrix.some((m) => m.status === 'WARNING');
  const allVerified = unverifiedItems.length === 0;

  const scorecard: ValidationScorecardItem[] = [
    {
      category: 'ENERGY DESIGN',
      status: isPvPowerPass ? 'VERIFIED' : 'FAILED',
      details: `${results.dailySolarGenerationKwh} kWh/day generation vs ${results.dailyKwh} kWh/day load.`,
    },
    {
      category: 'BATTERY ENERGY',
      status: isBattEnergyPass ? 'VERIFIED' : 'FAILED',
      details: `${installedBattKwh} kWh installed vs ${reqBattKwh} kWh required (${results.actualAutonomyDays}d autonomy).`,
    },
    {
      category: 'BATTERY POWER',
      status: isBatteryCurrentSufficient ? 'VERIFIED' : 'FAILED',
      details: `${bankContinuousDischargeCurrentA} A continuous capability vs ${inverterContinuousDcCurrentA} A inverter draw (+${batteryCurrentMarginPercent}% margin).`,
    },
    {
      category: 'INVERTER CONTINUOUS',
      status: isInvContPass ? 'VERIFIED' : 'FAILED',
      details: `${inverter.continuousOutputPowerKw} kW continuous rating vs ${results.continuousRequirementKw.toFixed(1)} kW requirement.`,
    },
    {
      category: 'INVERTER SURGE',
      status: isInvSurgePass ? 'VERIFIED' : 'FAILED',
      details: `${inverter.surgePowerKw} kW surge (${inverter.surgeDurationSec}s) vs ${results.surgeRequirementKw.toFixed(2)} kW demand.`,
    },
    {
      category: 'PV STRINGS',
      status: isVocOverallSafe && isVmpOverallPass && isIscPass ? 'VERIFIED' : (isVocOverallSafe ? 'WARNING' : 'FAILED'),
      details: `${parallelStringsCount} strings of ${panelsPerString} modules; Cold Voc ${stringVocCold}V with ${(effectiveMaxVoc - stringVocCold).toFixed(1)}V headroom.`,
    },
    {
      category: 'MPPT',
      status: isMpptPass ? 'VERIFIED' : 'WARNING',
      details: `${installedMpptA} A installed vs ${reqMpptA} A required with 125% NEC factor.`,
    },
    {
      category: 'MANUFACTURER SOURCES',
      status: allVerified ? 'VERIFIED' : 'NOT_YET_VERIFIED',
      details: allVerified ? 'All equipment verified against official manufacturer datasheets.' : `${unverifiedItems.length} equipment items pending datasheet audit.`,
    },
    {
      category: 'CABLE SIZING',
      status: 'NOT_YET_VERIFIED',
      details: 'Conductor ampacity & voltage drop verification scheduled for electrical installation module.',
    },
    {
      category: 'PROTECTION DEVICES',
      status: 'NOT_YET_VERIFIED',
      details: 'DC fusing & AC circuit breaker coordination scheduled for electrical installation module.',
    },
    {
      category: 'GROUNDING',
      status: 'NOT_YET_VERIFIED',
      details: 'Equipment grounding conductor (EGC) & surge protective device (SPD) verification pending.',
    },
  ];

  // Overall Project-Level Status (Section 10)
  // DESIGN COMPLETE | VALIDATION IN PROGRESS | PARTIALLY_VALIDATED | FULLY_VALIDATED | VALIDATION FAILED
  let overallStatus: ProjectValidationStatus = 'PARTIALLY_VALIDATED';
  const hasHardwareSelected = Boolean(panel.id && battery.id && inverter.id);

  if (isAnyFail || compatibilityWarnings.some((w) => w.includes('Exceeded') || w.includes('Incompatibility') || w.includes('Deficit'))) {
    overallStatus = 'VALIDATION_FAILED';
  } else if (!hasHardwareSelected) {
    overallStatus = 'DESIGN_COMPLETE';
  } else if (isAnyWarning) {
    overallStatus = 'VALIDATION_IN_PROGRESS';
  } else if (allVerified && scorecard.every((s) => s.status === 'VERIFIED')) {
    overallStatus = 'FULLY_VALIDATED';
  } else {
    // Major equipment passed, but downstream installation items (Cables, Protection, Grounding) remain unverified
    overallStatus = 'PARTIALLY_VALIDATED';
  }

  let systemValidationLevel: 'FULLY_VALIDATED' | 'PARTIALLY_VALIDATED' | 'INVALID_CONFIGURATION' = 'PARTIALLY_VALIDATED';
  if (overallStatus === 'VALIDATION_FAILED') {
    systemValidationLevel = 'INVALID_CONFIGURATION';
  } else if (overallStatus === 'FULLY_VALIDATED') {
    systemValidationLevel = 'FULLY_VALIDATED';
  } else {
    systemValidationLevel = 'PARTIALLY_VALIDATED';
  }

  return {
    matrix,
    scorecard,
    overallStatus,
    systemValidationLevel,
    busAnalysis,
    stringAllocations,
    trackerValidations,
    compatibilityWarnings,
    unverifiedItems,
  };
}
