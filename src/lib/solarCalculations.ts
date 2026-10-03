/**
 * VoltPlan - Engineering Calculation Engine (Audited & Rigorous)
 * Single Source of Truth for all photovoltaic, energy storage, inverter, MPPT, and electrical calculations.
 */

import {
  Appliance,
  SolarArrayConfig,
  BatteryConfig,
  InverterConfig,
  MPPTConfig,
  LocationConfig,
  AdvancedSettings,
  CostConfig,
  CostBreakdown,
  CostItem,
  CalculationResults,
  SystemWarning,
  HourlySOCData,
  StringDesignConfig,
  StringDesignResult,
  AuditItem,
  SimulationConfig,
  SimulationFlowSummary,
  SimulationMode,
} from '../types/solar';

export const STANDARD_INVERTER_SIZES_KW = [3, 5, 6, 8, 10, 12, 15, 20, 25, 30];

/**
 * 1. ENERGY LOADS CALCULATION
 * Sum of all enabled appliances with exact day/night reconciliation.
 */
export function calculateEnergyLoads(appliances: Appliance[]) {
  const enabled = appliances.filter((a) => a.enabled);

  let dailyWh = 0;
  let daytimeWh = 0;
  let nighttimeWh = 0;

  for (const item of enabled) {
    const qty = Math.max(0, item.quantity);
    const watts = Math.max(0, item.watts);
    const hrs = Math.min(24, Math.max(0, item.hoursPerDay));
    
    // Balance daytime and nighttime hours so dayHours + nightHours exactly equals total hours
    let dayHrs = Math.max(0, item.dayHours);
    let nightHrs = Math.max(0, item.nightHours);

    if (dayHrs + nightHrs === 0 && hrs > 0) {
      dayHrs = hrs * 0.5;
      nightHrs = hrs * 0.5;
    } else if (dayHrs + nightHrs > 0 && Math.abs(dayHrs + nightHrs - hrs) > 0.001) {
      const ratio = dayHrs / (dayHrs + nightHrs);
      dayHrs = hrs * ratio;
      nightHrs = hrs * (1 - ratio);
    }

    const itemTotalWh = qty * watts * hrs;
    const itemDayWh = qty * watts * dayHrs;
    const itemNightWh = qty * watts * nightHrs;

    dailyWh += itemTotalWh;
    daytimeWh += itemDayWh;
    nighttimeWh += itemNightWh;
  }

  // Ensure daytimeWh + nighttimeWh strictly equals dailyWh
  nighttimeWh = dailyWh - daytimeWh;

  const dailyKwh = Number((dailyWh / 1000).toFixed(3));
  const daytimeKwh = Number((daytimeWh / 1000).toFixed(3));
  const nighttimeKwh = Number((nighttimeWh / 1000).toFixed(3));

  const daytimePercentage = dailyWh > 0 ? Math.round((daytimeWh / dailyWh) * 100) : 50;
  const nighttimePercentage = 100 - daytimePercentage;

  return {
    dailyWh: Math.round(dailyWh),
    dailyKwh,
    daytimeWh: Math.round(daytimeWh),
    daytimeKwh,
    nighttimeWh: Math.round(nighttimeWh),
    nighttimeKwh,
    daytimePercentage,
    nighttimePercentage,
  };
}

/**
 * 2. POWER DEMANDS CALCULATION
 * Continuous demand, simultaneous peak, and motor starting surge.
 */
export function calculatePeakAndSurgeLoads(appliances: Appliance[]) {
  const enabled = appliances.filter((a) => a.enabled);

  let peakContinuousW = 0;
  let peakSimultaneousW = 0;
  let maxSingleMotorSurgeExtra = 0;

  for (const item of enabled) {
    const qty = Math.max(0, item.quantity);
    const watts = Math.max(0, item.watts);
    const simFactor = Math.max(0.1, Math.min(1.0, item.simultaneousFactor));
    const surgeMult = Math.max(1.0, item.surgeMultiplier);

    const continuousItemW = qty * watts;
    const simultaneousItemW = continuousItemW * simFactor;

    peakContinuousW += continuousItemW;
    peakSimultaneousW += simultaneousItemW;

    // Highest single motor inrush starting spike above running draw
    if (surgeMult > 1.0) {
      const extraPerUnit = watts * (surgeMult - 1.0);
      if (extraPerUnit > maxSingleMotorSurgeExtra) {
        maxSingleMotorSurgeExtra = extraPerUnit;
      }
    }
  }

  const peakSurgeW = peakSimultaneousW + maxSingleMotorSurgeExtra;

  return {
    peakContinuousW: Math.round(peakContinuousW),
    peakSimultaneousW: Math.round(peakSimultaneousW),
    peakSurgeW: Math.round(peakSurgeW),
  };
}

/**
 * 3. SOLAR ARRAY SIZING & STRING RECONCILIATION
 * Sizes PV array from daily load, solar reserve, and deratings,
 * then reconciles panel count with electrical series strings so total panels are 100% consistent.
 */
export function calculateSolarArrayAndStrings(
  dailyWh: number,
  location: LocationConfig,
  solarConfig: SolarArrayConfig,
  advanced: AdvancedSettings,
  mpptConfig: MPPTConfig,
  stringConfig?: StringDesignConfig
) {
  const psh = Math.max(1.0, location.peakSunHours);
  const reserveMargin = Math.max(0, solarConfig.reserveMargin);
  const orientationEff = Math.max(0.1, Math.min(1.0, solarConfig.orientationEfficiency));

  // Combined thermodynamic & wiring efficiency
  const PVSystemEfficiency =
    (1 - advanced.systemLosses) *
    (1 - advanced.pvDerating) *
    (1 - advanced.cableLoss) *
    (1 - advanced.tempDerating);

  const overallEfficiency = PVSystemEfficiency * orientationEff;

  // Required production including reserve margin
  const solarProductionRequiredWh = dailyWh * (1 + reserveMargin);

  // Theoretical required array wattage
  const requiredArrayW = overallEfficiency > 0 && psh > 0
    ? solarProductionRequiredWh / (psh * overallEfficiency)
    : 0;

  const panelW = Math.max(50, solarConfig.panelWattage);
  const baseRequiredPanelCount = Math.ceil(requiredArrayW / panelW);

  // Determine series string electrical constraints
  const vocSTC = stringConfig?.panelVoc || 49.8;
  const vmpSTC = stringConfig?.panelVmp || 41.5;
  const iscSTC = stringConfig?.panelIsc || 10.2;
  const impSTC = stringConfig?.panelImp || 9.64;
  const tempMin = stringConfig?.tempMinC ?? 15;
  const tempMax = stringConfig?.tempMaxC ?? 45;
  const tempCoeff = stringConfig?.tempCoeffVoc ?? -0.28;
  const hasSpecs = stringConfig?.hasSpecs !== false;

  // Temperature corrected string voltages
  const deltaTcold = tempMin - 25;
  const deltaThot = tempMax - 25;
  const vocColdPerPanel = vocSTC * (1 + deltaTcold * (tempCoeff / 100));
  const vmpHotPerPanel = vmpSTC * (1 + deltaThot * (tempCoeff / 100));

  const maxPvVoc = Math.max(100, mpptConfig.maxPvVoc || 450);
  const mpptVmin = Math.max(20, mpptConfig.mpptVmin || 120);
  const mpptVmax = Math.max(100, mpptConfig.mpptVmax || 430);

  // Allowable panels per string
  const maxPanelsSeries = Math.max(1, Math.floor(maxPvVoc / vocColdPerPanel));
  const minPanelsSeries = Math.max(1, Math.ceil(mpptVmin / vmpHotPerPanel));

  // Find optimal series length S that allows balanced strings >= baseRequiredPanelCount
  // Target a comfortable voltage well within [mpptVmin, mpptVmax]
  let bestSeries = Math.min(maxPanelsSeries, Math.max(minPanelsSeries, 5));
  if (bestSeries > maxPanelsSeries) bestSeries = maxPanelsSeries;
  if (bestSeries < minPanelsSeries) bestSeries = minPanelsSeries;

  let parallelStrings = Math.max(1, Math.ceil(baseRequiredPanelCount / bestSeries));
  let reconciledPanelCount = parallelStrings * bestSeries;

  // If user provided manual override, honor it but reconcile parallel strings
  if (solarConfig.overridePanelCount && solarConfig.overridePanelCount > 0) {
    reconciledPanelCount = solarConfig.overridePanelCount;
    parallelStrings = Math.max(1, Math.ceil(reconciledPanelCount / bestSeries));
    bestSeries = Math.max(1, Math.floor(reconciledPanelCount / parallelStrings));
    reconciledPanelCount = parallelStrings * bestSeries;
  }

  // Installed array based on reconciled panel count
  const actualArrayWatts = reconciledPanelCount * panelW;

  // ACTUAL ESTIMATED SOLAR GENERATION FROM INSTALLED ARRAY
  const dailySolarWh = actualArrayWatts * psh * overallEfficiency;
  const dailySolarGenerationKwh = Number((dailySolarWh / 1000).toFixed(2));
  const dailyLoadKwh = dailyWh / 1000;
  const dailySolarSurplusDeficitKwh = Number(((dailySolarWh - dailyWh) / 1000).toFixed(2));
  const solarProductionMargin = dailyLoadKwh > 0
    ? Number((((dailySolarWh - dailyWh) / dailyWh) * 100).toFixed(1))
    : 0;

  // String electrical outputs
  const stringVocSTC = Number((vocSTC * bestSeries).toFixed(1));
  const stringVocCold = Number((vocColdPerPanel * bestSeries).toFixed(1));
  const stringVmpSTC = Number((vmpSTC * bestSeries).toFixed(1));
  const stringVmpHot = Number((vmpHotPerPanel * bestSeries).toFixed(1));
  const totalArrayIsc = Number((iscSTC * parallelStrings).toFixed(1));
  const totalArrayImp = Number((impSTC * parallelStrings).toFixed(1));
  const totalPvWatts = actualArrayWatts;

  const stringWarnings: string[] = [];
  const isVocSafe = stringVocCold <= maxPvVoc;
  if (!isVocSafe) {
    stringWarnings.push(
      `CRITICAL OVERVOLTAGE: Cold Voc (${stringVocCold} V) exceeds MPPT limit (${maxPvVoc} V). Reduce panels per string to prevent equipment destruction.`
    );
  }

  const isVmpInRange = stringVmpHot >= mpptVmin && stringVmpSTC <= mpptVmax;
  if (stringVmpHot < mpptVmin) {
    stringWarnings.push(
      `Low Summer Voltage: Hot Vmp (${stringVmpHot} V) is below MPPT minimum tracking threshold (${mpptVmin} V). Solar harvest will drop on hot days.`
    );
  } else if (stringVmpSTC > mpptVmax) {
    stringWarnings.push(
      `High Tracking Voltage: String Vmp (${stringVmpSTC} V) exceeds MPPT maximum tracking voltage (${mpptVmax} V).`
    );
  }

  const maxInputCurr = mpptConfig.maxInputCurrentA * (mpptConfig.numberOfInputs || 1);
  const isCurrentSafe = totalArrayIsc <= maxInputCurr;
  if (!isCurrentSafe) {
    stringWarnings.push(
      `Overcurrent Risk: Array short-circuit current (${totalArrayIsc} A) exceeds MPPT maximum rated input current (${maxInputCurr} A).`
    );
  }

  let statusMessage = 'Safe & Optimal String Configuration';
  if (!hasSpecs) {
    statusMessage = 'Electrical string validation unavailable — enter panel and MPPT specifications.';
  } else if (!isVocSafe) {
    statusMessage = 'DANGER: Overvoltage Risk - Reduce panels in series';
  } else if (!isVmpInRange || !isCurrentSafe) {
    statusMessage = 'Marginal String Match - Review warnings';
  }

  const stringDesignResult: StringDesignResult = {
    panelsPerString: bestSeries,
    parallelStrings,
    totalPanelsUsed: reconciledPanelCount,
    stringVocSTC,
    stringVocCold,
    stringVmpSTC,
    stringVmpHot,
    totalArrayIsc,
    totalArrayImp,
    totalPvWatts,
    isVocSafe,
    isVmpInRange,
    isCurrentSafe,
    statusMessage,
    warnings: stringWarnings,
    hasSpecs,
  };

  return {
    solarProductionRequiredWh: Math.round(solarProductionRequiredWh),
    requiredArrayW: Math.round(requiredArrayW),
    basePvWatts: Math.round(requiredArrayW),
    panelCount: reconciledPanelCount,
    panelWattage: panelW,
    actualArrayWatts,
    dailySolarWh: Math.round(dailySolarWh),
    dailySolarGenerationKwh,
    dailySolarSurplusDeficitKwh,
    solarProductionMargin,
    overallEfficiency: Number(overallEfficiency.toFixed(3)),
    stringDesign: stringDesignResult,
  };
}

/**
 * 4. BATTERY BANK CALCULATION
 * Distinguishes overnight storage requirement vs no-sun autonomy requirement,
 * and calculates true actual autonomy delivered by the installed battery bank.
 */
export function calculateBatteryBank(
  dailyWh: number,
  nighttimeWh: number,
  location: LocationConfig,
  batteryConfig: BatteryConfig,
  advanced: AdvancedSettings
) {
  const targetAutonomyDays = Math.max(0.5, batteryConfig.autonomyDays);
  const cloudyDaysBuffer = Math.max(0, location.cloudyDaysBuffer);
  const effectiveTargetAutonomyDays = targetAutonomyDays + cloudyDaysBuffer;

  // Depth of Discharge (DoD)
  let defaultDod = 0.80;
  if (batteryConfig.chemistry !== 'LiFePO4') defaultDod = 0.50;
  const dodLimit = batteryConfig.dodLimit > 0 ? batteryConfig.dodLimit : defaultDod;

  // Conversion efficiencies
  const invEff = Math.max(0.70, advanced.inverterEfficiency);
  const roundtripEff = Math.max(0.70, advanced.batteryRoundtripEfficiency);
  // Discharge efficiency factor
  const dischargeEfficiency = invEff * Math.sqrt(roundtripEff);

  // A. OVERNIGHT STORAGE REQUIREMENT
  // Nighttime energy load divided by discharge efficiency and allowed DoD
  const overnightRequiredEnergyWh = nighttimeWh / dischargeEfficiency;
  const overnightNominalBatteryWh = overnightRequiredEnergyWh / dodLimit;
  const overnightNominalBatteryKwh = Number((overnightNominalBatteryWh / 1000).toFixed(2));

  // B. NO-SUN AUTONOMY REQUIREMENT
  // Operation with little or no solar production for effectiveTargetAutonomyDays
  const autonomyRequiredEnergyWh = (dailyWh * effectiveTargetAutonomyDays) / dischargeEfficiency;
  const autonomyNominalBatteryWh = autonomyRequiredEnergyWh / dodLimit;
  const autonomyNominalBatteryKwh = Number((autonomyNominalBatteryWh / 1000).toFixed(2));

  // Governing requirement: MAX(overnight, autonomy)
  const governingRequirement = autonomyNominalBatteryWh >= overnightNominalBatteryWh ? 'autonomy' : 'overnight';
  const requiredNominalBatteryWh = Math.max(overnightNominalBatteryWh, autonomyNominalBatteryWh);
  const requiredNominalBatteryKwh = Number((requiredNominalBatteryWh / 1000).toFixed(2));
  const requiredUsableBatteryKwh = Number((requiredNominalBatteryKwh * dodLimit).toFixed(2));

  // Battery Unit Specifications
  const unitV = batteryConfig.unitVoltage || 51.2;
  const unitAh = batteryConfig.unitAh || 100;
  const batteryUnitNominalWh = unitV * unitAh;
  const batteryUnitNominalKwh = Number((batteryUnitNominalWh / 1000).toFixed(2));
  const batteryUnitUsableKwh = Number((batteryUnitNominalKwh * dodLimit).toFixed(2));

  // Recommended battery quantities
  const overnightBatteryCount = Math.ceil(overnightNominalBatteryWh / batteryUnitNominalWh);
  const autonomyBatteryCount = Math.ceil(autonomyNominalBatteryWh / batteryUnitNominalWh);
  const recommendedBatteryCount = Math.ceil(requiredNominalBatteryWh / batteryUnitNominalWh);

  const batteryCount = batteryConfig.overrideBatteryCount && batteryConfig.overrideBatteryCount > 0
    ? batteryConfig.overrideBatteryCount
    : Math.max(1, recommendedBatteryCount);

  // Installed Capacities
  const installedNominalBatteryKwh = Number(((batteryCount * batteryUnitNominalWh) / 1000).toFixed(2));
  const installedUsableBatteryKwh = Number((installedNominalBatteryKwh * dodLimit).toFixed(2));

  // ACTUAL AUTONOMY CALCULATION (Requirement 3)
  // actualAutonomyDays = usableBatteryEnergy * dischargeEfficiency / dailyLoadWh
  const actualAutonomyDays = dailyWh > 0
    ? Number(((installedUsableBatteryKwh * 1000 * dischargeEfficiency) / dailyWh).toFixed(2))
    : 0;

  const isAutonomySufficient = actualAutonomyDays >= effectiveTargetAutonomyDays * 0.95;
  const batteryDeficitCount = actualAutonomyDays < effectiveTargetAutonomyDays
    ? Math.max(0, Math.ceil((requiredNominalBatteryWh - (installedNominalBatteryKwh * 1000)) / batteryUnitNominalWh))
    : 0;

  // Recommended & Critical SOC Floors (Requirement 6)
  const recommendedMinSocPercent = Math.round((1 - dodLimit) * 100);
  const criticalMinSocPercent = Math.round(recommendedMinSocPercent * 0.5);

  return {
    overnightRequiredEnergyWh: Math.round(overnightRequiredEnergyWh),
    overnightNominalBatteryWh: Math.round(overnightNominalBatteryWh),
    overnightNominalBatteryKwh,
    overnightBatteryCount,

    autonomyRequiredEnergyWh: Math.round(autonomyRequiredEnergyWh),
    autonomyNominalBatteryWh: Math.round(autonomyNominalBatteryWh),
    autonomyNominalBatteryKwh,
    autonomyBatteryCount,

    governingBatteryRequirement: governingRequirement as 'autonomy' | 'overnight',
    requiredNominalBatteryKwh,
    requiredUsableBatteryKwh,

    batteryUnitNominalKwh,
    batteryUnitUsableKwh,
    batteryCount,
    installedNominalBatteryKwh,
    installedUsableBatteryKwh,
    systemVoltage: batteryConfig.systemVoltage,
    batteryDoD: dodLimit,
    recommendedMinSocPercent,
    criticalMinSocPercent,

    targetAutonomyDays,
    cloudyDaysBuffer,
    effectiveTargetAutonomyDays,
    actualAutonomyDays,
    isAutonomySufficient,
    batteryDeficitCount,
    dischargeEfficiency: Number(dischargeEfficiency.toFixed(3)),
  };
}

/**
 * 5. INVERTER SIZING
 * Rigorously checks continuous power requirement and documented motor surge rating.
 */
export function calculateInverterSizing(
  peakSimultaneousW: number,
  peakSurgeW: number,
  inverterConfig: InverterConfig
) {
  const headroom = Math.max(0.1, inverterConfig.headroom);
  
  // Continuous requirement = peakSimultaneousLoad * (1 + headroom)
  const continuousRequirementKw = Number(((peakSimultaneousW * (1 + headroom)) / 1000).toFixed(2));
  const surgeRequirementKw = Number((peakSurgeW / 1000).toFixed(2));

  // Determine standard commercial recommendation
  let recommendedInverterKw = STANDARD_INVERTER_SIZES_KW[STANDARD_INVERTER_SIZES_KW.length - 1];
  for (const size of STANDARD_INVERTER_SIZES_KW) {
    // Inverter continuous must satisfy requirement AND standard 2x surge must satisfy peak motor surge
    if (size >= continuousRequirementKw && size * 2.0 >= surgeRequirementKw) {
      recommendedInverterKw = size;
      break;
    }
  }

  const selectedInverterKw = inverterConfig.selectedSizeKw && inverterConfig.selectedSizeKw > 0
    ? inverterConfig.selectedSizeKw
    : recommendedInverterKw;

  const inverterContinuousRatingKw = selectedInverterKw;
  const isSurgeVerified = inverterConfig.surgeRatingKw !== undefined;
  const inverterSurgeRatingKw = inverterConfig.surgeRatingKw !== undefined
    ? inverterConfig.surgeRatingKw
    : selectedInverterKw * 2.0;
  const inverterSurgeDurationSec = inverterConfig.surgeDurationSec || 5;

  const isContinuousAdequate = inverterContinuousRatingKw >= continuousRequirementKw;
  const isSurgeAdequate = inverterSurgeRatingKw >= surgeRequirementKw;

  return {
    continuousRequirementKw,
    surgeRequirementKw,
    inverterContinuousRatingKw,
    inverterSurgeRatingKw,
    inverterSurgeDurationSec,
    isContinuousAdequate,
    isSurgeAdequate,
    isSurgeVerified,
    recommendedInverterKw,
    selectedInverterKw,
  };
}

/**
 * 6. MPPT CHARGE CONTROLLER SIZING
 * Calculates required battery-side current with NEC 125% safety margin,
 * verifies against installed controller capacity and displays headroom.
 */
export function calculateMPPTSizing(
  actualArrayWatts: number,
  systemVoltage: number,
  mpptConfig: MPPTConfig
) {
  // Nominal charging current = PV Watts / System Voltage
  const nominalChargingCurrentA = systemVoltage > 0
    ? Number((actualArrayWatts / systemVoltage).toFixed(1))
    : 0;

  // NEC 125% safety margin
  const requiredMpptCurrentA = Number((nominalChargingCurrentA * 1.25).toFixed(1));

  const unitRatingA = Math.max(20, mpptConfig.ratedCurrentA || 100);
  const calculatedUnits = requiredMpptCurrentA > 0 ? Math.ceil(requiredMpptCurrentA / unitRatingA) : 1;

  const mpptUnitsCount = mpptConfig.overrideUnits !== undefined && mpptConfig.overrideUnits > 0
    ? mpptConfig.overrideUnits
    : Math.max(1, calculatedUnits);

  const installedMpptCurrentA = mpptUnitsCount * unitRatingA;
  const mpptHeadroomA = Number((installedMpptCurrentA - requiredMpptCurrentA).toFixed(1));
  const isMpptAdequate = installedMpptCurrentA >= requiredMpptCurrentA;

  return {
    nominalChargingCurrentA,
    requiredMpptCurrentA,
    installedMpptCurrentA,
    mpptHeadroomA,
    isMpptAdequate,
    mpptUnitsCount,
    mpptUnitRatingA: unitRatingA,
  };
}

/**
 * 7. 24-HOUR BATTERY SOC SIMULATION (ENERGY FLOW INTERVALS)
 * Simulates hour-by-hour energy flow across Typical Solar Day, Cloudy Day, or No-Sun Autonomy.
 * SOC is strictly (storedBatteryWh / nominalBatteryWh) * 100 with zero artificial jumps.
 */
export function simulate24HourSOC(
  dailyWh: number,
  daytimeWh: number,
  nighttimeWh: number,
  dailySolarWh: number,
  installedNominalBatteryKwh: number,
  dodLimit: number,
  advanced: AdvancedSettings,
  simulationConfig?: SimulationConfig
) {
  const mode: SimulationMode = simulationConfig?.mode || 'typical';
  const cloudyFactor = simulationConfig?.cloudyFactor !== undefined ? simulationConfig.cloudyFactor : 0.30;

  // Determine effective solar generation according to mode
  let effectiveSolarWh = dailySolarWh;
  if (mode === 'cloudy') {
    effectiveSolarWh = dailySolarWh * cloudyFactor;
  } else if (mode === 'nosun') {
    effectiveSolarWh = 0;
  }

  const nominalBatteryWh = installedNominalBatteryKwh * 1000;
  const recommendedMinSoc = Math.round((1 - dodLimit) * 100);
  const criticalMinSoc = Math.max(5, Math.round(recommendedMinSoc * 0.5));

  const invEff = Math.max(0.70, advanced.inverterEfficiency);
  const roundtripEff = Math.max(0.70, advanced.batteryRoundtripEfficiency);
  const chargeEff = Math.sqrt(roundtripEff);
  const dischargeEff = Math.sqrt(roundtripEff) * invEff;

  // 48 half-hour intervals (dt = 0.5 hours)
  const steps = 48;
  const dt = 0.5;

  // Solar irradiance bell-curve distribution across 06:00 to 18:00
  const solarHalfHourWh: number[] = new Array(steps).fill(0);
  let totalSolarWeight = 0;
  for (let i = 0; i < steps; i++) {
    const hour = i * dt;
    if (hour >= 6.0 && hour <= 18.0) {
      const angle = ((hour - 6.0) / 12.0) * Math.PI;
      const weight = Math.pow(Math.sin(angle), 1.5);
      solarHalfHourWh[i] = weight;
      totalSolarWeight += weight;
    }
  }
  for (let i = 0; i < steps; i++) {
    if (totalSolarWeight > 0) {
      solarHalfHourWh[i] = (solarHalfHourWh[i] / totalSolarWeight) * effectiveSolarWh;
    }
  }

  // Load distribution:
  // Daytime (07:00 - 18:30): evenly distribute daytimeWh
  // Nighttime (19:00 - 06:30): distribute nighttimeWh with peak between 19:00-23:00
  const loadHalfHourWh: number[] = new Array(steps).fill(0);
  let dayStepCount = 0;
  for (let i = 0; i < steps; i++) {
    const hour = i * dt;
    if (hour >= 7.0 && hour < 19.0) dayStepCount++;
  }
  const baseDayLoadPerStep = dayStepCount > 0 ? daytimeWh / dayStepCount : 0;

  const nightWeights: { [h: number]: number } = {
    19: 1.5, 20: 1.8, 21: 1.8, 22: 1.4, 23: 1.1,
    0: 0.6, 1: 0.5, 2: 0.5, 3: 0.5, 4: 0.5, 5: 0.6, 6: 0.8
  };
  let totalNightStepWeight = 0;
  for (let i = 0; i < steps; i++) {
    const hour = Math.floor(i * dt);
    if (hour < 7 || hour >= 19) {
      totalNightStepWeight += (nightWeights[hour] || 1.0);
    }
  }

  for (let i = 0; i < steps; i++) {
    const hour = Math.floor(i * dt);
    if (hour >= 7 && hour < 19) {
      loadHalfHourWh[i] = baseDayLoadPerStep;
    } else {
      const w = nightWeights[hour] || 1.0;
      loadHalfHourWh[i] = totalNightStepWeight > 0 ? (nighttimeWh * (w / totalNightStepWeight)) : 0;
    }
  }

  // Stabilization / initial state:
  // In 'nosun' autonomy mode, assume battery starts fully charged (100% SOC) to validate how far stored reserve carries the load over 24 hours.
  // In 'typical' or 'cloudy', run cyclical equilibrium stabilization.
  let storedWh = nominalBatteryWh;
  if (mode !== 'nosun') {
    storedWh = nominalBatteryWh * 0.90;
    for (let cycle = 0; cycle < 2; cycle++) {
      for (let i = 0; i < steps; i++) {
        const genWh = solarHalfHourWh[i];
        const loadWh = loadHalfHourWh[i];
        const netWh = genWh - (loadWh / invEff);

        if (netWh > 0) {
          storedWh = Math.min(nominalBatteryWh, storedWh + netWh * chargeEff);
        } else {
          storedWh = Math.max(0, storedWh - Math.abs(netWh) / Math.sqrt(roundtripEff));
        }
      }
    }
  }

  const initialStoredWh = storedWh;
  const initialSoc = nominalBatteryWh > 0 ? Math.round((initialStoredWh / nominalBatteryWh) * 100) : 0;

  // Recording 24 hourly data points and cumulative energy flows
  const hourlyProfile: HourlySOCData[] = [];
  let minSocReached = 100;
  let maxSocReached = 0;

  let totalSolarGenWh = 0;
  let totalDirectSolarWh = 0;
  let totalSolarToBatteryWh = 0;
  let totalBatteryToLoadsWh = 0;
  let totalLossesWh = 0;

  for (let h = 0; h < 24; h++) {
    const idx1 = h * 2;
    const idx2 = h * 2 + 1;

    let hourSolarGen = 0;
    let hourLoad = 0;
    let hourDirectSolar = 0;
    let hourBatteryCharge = 0;
    let hourBatteryDischarge = 0;

    // Sub-step 1 (first 30 min)
    const gen1 = solarHalfHourWh[idx1];
    const load1 = loadHalfHourWh[idx1];
    hourSolarGen += gen1;
    hourLoad += load1;
    const direct1 = Math.min(gen1, load1 / invEff);
    hourDirectSolar += direct1;

    const net1 = gen1 - (load1 / invEff);
    if (net1 > 0) {
      const chargeAmount = net1 * chargeEff;
      const actualStored = Math.min(nominalBatteryWh - storedWh, chargeAmount);
      storedWh += actualStored;
      hourBatteryCharge += actualStored;
      totalLossesWh += Math.max(0, net1 - actualStored);
    } else {
      const dischargeNeeded = Math.abs(net1) / Math.sqrt(roundtripEff);
      const actualDischarge = Math.min(storedWh, dischargeNeeded);
      storedWh -= actualDischarge;
      hourBatteryDischarge += actualDischarge;
      totalLossesWh += Math.max(0, dischargeNeeded - Math.abs(net1));
    }

    // Sub-step 2 (second 30 min)
    const gen2 = solarHalfHourWh[idx2];
    const load2 = loadHalfHourWh[idx2];
    hourSolarGen += gen2;
    hourLoad += load2;
    const direct2 = Math.min(gen2, load2 / invEff);
    hourDirectSolar += direct2;

    const net2 = gen2 - (load2 / invEff);
    if (net2 > 0) {
      const chargeAmount = net2 * chargeEff;
      const actualStored = Math.min(nominalBatteryWh - storedWh, chargeAmount);
      storedWh += actualStored;
      hourBatteryCharge += actualStored;
      totalLossesWh += Math.max(0, net2 - actualStored);
    } else {
      const dischargeNeeded = Math.abs(net2) / Math.sqrt(roundtripEff);
      const actualDischarge = Math.min(storedWh, dischargeNeeded);
      storedWh -= actualDischarge;
      hourBatteryDischarge += actualDischarge;
      totalLossesWh += Math.max(0, dischargeNeeded - Math.abs(net2));
    }

    const soc = nominalBatteryWh > 0 ? Number(((storedWh / nominalBatteryWh) * 100).toFixed(1)) : 0;
    if (soc < minSocReached) minSocReached = soc;
    if (soc > maxSocReached) maxSocReached = soc;

    totalSolarGenWh += hourSolarGen;
    totalDirectSolarWh += hourDirectSolar;
    totalSolarToBatteryWh += hourBatteryCharge;
    totalBatteryToLoadsWh += hourBatteryDischarge;

    hourlyProfile.push({
      timeIndex: h,
      hourInDay: h,
      dayIndex: 0,
      timeLabel: `${h.toString().padStart(2, '0')}:00`,
      solarGenerationW: Math.round(hourSolarGen),
      loadW: Math.round(hourLoad),
      netEnergyWh: Math.round(hourSolarGen - (hourLoad / invEff)),
      batterySoc: Math.round(soc),
      storedBatteryWh: Math.round(storedWh),
      directSolarW: Math.round(hourDirectSolar),
      batteryChargeW: Math.round(hourBatteryCharge),
      batteryDischargeW: Math.round(hourBatteryDischarge),
      safeThreshold: recommendedMinSoc,
      dangerThreshold: criticalMinSoc,
    });
  }

  const isBatterySufficientForNight = minSocReached >= recommendedMinSoc;

  const flowSummary: SimulationFlowSummary = {
    beginningUsableKwh: Number(((nominalBatteryWh * dodLimit) / 1000).toFixed(2)),
    beginningSoc: initialSoc,
    solarGeneratedKwh: Number((totalSolarGenWh / 1000).toFixed(2)),
    directSolarToLoadsKwh: Number((totalDirectSolarWh / 1000).toFixed(2)),
    solarToBatteryKwh: Number((totalSolarToBatteryWh / 1000).toFixed(2)),
    batteryToLoadsKwh: Number((totalBatteryToLoadsWh / 1000).toFixed(2)),
    conversionLossKwh: Number((totalLossesWh / 1000).toFixed(2)),
    endingSoc: Math.round(nominalBatteryWh > 0 ? (storedWh / nominalBatteryWh) * 100 : 0),
    endingStoredKwh: Number((storedWh / 1000).toFixed(2)),
  };

  return {
    simulationMode: mode,
    simulationHours: 24,
    cloudyFactor,
    hourlyProfile,
    minSocReached: Math.round(minSocReached),
    maxSocReached: Math.round(maxSocReached),
    isBatterySufficientForNight,
    flowSummary,
  };
}

/**
 * 8. EQUIPMENT BILL OF MATERIALS & COSTING
 * Uses EXACT engineering quantities (panels, batteries, inverter, mppt).
 */
export function calculateCosts(
  panelCount: number,
  batteryCount: number,
  selectedInverterKw: number,
  mpptUnitsCount: number,
  costConfig: CostConfig
): CostBreakdown {
  const rate = costConfig.exchangeRateToUSD || 1.0;

  const items: CostItem[] = [
    {
      itemKey: 'panels',
      name: `Solar Panels (${panelCount} units)`,
      quantity: panelCount,
      unitPrice: costConfig.panelUnitPrice * rate,
      subtotal: panelCount * costConfig.panelUnitPrice * rate,
      category: 'equipment',
    },
    {
      itemKey: 'batteries',
      name: `Battery Units (${batteryCount} units)`,
      quantity: batteryCount,
      unitPrice: costConfig.batteryUnitPrice * rate,
      subtotal: batteryCount * costConfig.batteryUnitPrice * rate,
      category: 'equipment',
    },
    {
      itemKey: 'inverter',
      name: `Off-Grid Inverter (${selectedInverterKw} kW)`,
      quantity: 1,
      unitPrice: costConfig.inverterUnitPrice * rate,
      subtotal: 1 * costConfig.inverterUnitPrice * rate,
      category: 'equipment',
    },
    {
      itemKey: 'mppt',
      name: `MPPT Charge Controller(s) (${mpptUnitsCount} units)`,
      quantity: mpptUnitsCount,
      unitPrice: costConfig.mpptUnitPrice * rate,
      subtotal: mpptUnitsCount * costConfig.mpptUnitPrice * rate,
      category: 'equipment',
    },
    {
      itemKey: 'mounting',
      name: 'Rooftop / Ground Mounting Structure',
      quantity: 1,
      unitPrice: costConfig.mountingCost * rate,
      subtotal: costConfig.mountingCost * rate,
      category: 'equipment',
    },
    {
      itemKey: 'dc_protection',
      name: 'DC Protection (Breakers, Fuses, SPD)',
      quantity: 1,
      unitPrice: costConfig.dcProtectionCost * rate,
      subtotal: costConfig.dcProtectionCost * rate,
      category: 'equipment',
    },
    {
      itemKey: 'ac_protection',
      name: 'AC Protection (Distribution Box, RCD, Breakers)',
      quantity: 1,
      unitPrice: costConfig.acProtectionCost * rate,
      subtotal: costConfig.acProtectionCost * rate,
      category: 'equipment',
    },
    {
      itemKey: 'cables',
      name: 'Solar DC & Battery Heavy Cables',
      quantity: 1,
      unitPrice: costConfig.cablesCost * rate,
      subtotal: costConfig.cablesCost * rate,
      category: 'equipment',
    },
    {
      itemKey: 'installation',
      name: 'Engineering Installation & Commissioning',
      quantity: 1,
      unitPrice: costConfig.installationCost * rate,
      subtotal: costConfig.installationCost * rate,
      category: 'installation',
    },
    {
      itemKey: 'shipping',
      name: 'Freight & Logistics Delivery',
      quantity: 1,
      unitPrice: costConfig.shippingCost * rate,
      subtotal: costConfig.shippingCost * rate,
      category: 'logistics',
    },
    {
      itemKey: 'customs',
      name: 'Customs Clearance & Duties',
      quantity: 1,
      unitPrice: costConfig.customsCost * rate,
      subtotal: costConfig.customsCost * rate,
      category: 'logistics',
    },
    {
      itemKey: 'misc',
      name: 'Miscellaneous Hardware & Consumables',
      quantity: 1,
      unitPrice: costConfig.miscCost * rate,
      subtotal: costConfig.miscCost * rate,
      category: 'equipment',
    },
  ];

  let equipmentSubtotal = 0;
  let installationSubtotal = 0;
  let logisticsSubtotal = 0;

  for (const item of items) {
    if (item.category === 'equipment') equipmentSubtotal += item.subtotal;
    if (item.category === 'installation') installationSubtotal += item.subtotal;
    if (item.category === 'logistics') logisticsSubtotal += item.subtotal;
  }

  const grandTotal = equipmentSubtotal + installationSubtotal + logisticsSubtotal;
  const itemsSum = items.reduce((acc, it) => acc + it.subtotal, 0);
  const isReconciled = Math.abs(grandTotal - itemsSum) < 0.01;

  return {
    items,
    equipmentSubtotal: Math.round(equipmentSubtotal),
    installationSubtotal: Math.round(installationSubtotal),
    logisticsSubtotal: Math.round(logisticsSubtotal),
    grandTotal: Math.round(grandTotal),
    currency: costConfig.currency,
    isReconciled,
  };
}

/**
 * 9. AUDIT TRAIL GENERATION (Requirement 14)
 * Creates transparent, auditable derivation records for major outputs.
 */
export function generateAuditItems(
  energyLoads: ReturnType<typeof calculateEnergyLoads>,
  solar: ReturnType<typeof calculateSolarArrayAndStrings>,
  battery: ReturnType<typeof calculateBatteryBank>,
  inverter: ReturnType<typeof calculateInverterSizing>,
  mppt: ReturnType<typeof calculateMPPTSizing>,
  location: LocationConfig,
  solarConfig: SolarArrayConfig,
  batteryConfig: BatteryConfig,
  inverterConfig: InverterConfig,
  advanced: AdvancedSettings
): Record<string, AuditItem> {
  return {
    load: {
      id: 'audit-load',
      title: 'Total Household Energy Consumption',
      formula: 'Daily Wh = ∑ (Quantity × Watts × Operating Hours)',
      inputs: [
        { label: 'Active Appliances', value: 'Sum of all enabled items' },
        { label: 'Total Daily Energy', value: `${energyLoads.dailyKwh} kWh/day (${energyLoads.dailyWh.toLocaleString()} Wh)` },
      ],
      intermediateSteps: [
        { label: 'Daytime Usage (07:00–19:00)', value: `${energyLoads.daytimeKwh} kWh (${energyLoads.daytimePercentage}%)` },
        { label: 'Nighttime Usage (19:00–07:00)', value: `${energyLoads.nighttimeKwh} kWh (${energyLoads.nighttimePercentage}%)` },
      ],
      result: `${energyLoads.dailyKwh} kWh/day`,
    },

    solar: {
      id: 'audit-solar',
      title: 'Solar Photovoltaic Array Sizing',
      formula: 'Installed Array = ceil[ (Daily Wh × (1 + Margin)) / (PSH × Efficiency) / Panel Watts ] × Panel Watts',
      inputs: [
        { label: 'Daily Load', value: `${energyLoads.dailyKwh} kWh/day` },
        { label: 'Peak Sun Hours (PSH)', value: `${location.peakSunHours} hrs/day` },
        { label: 'Combined Efficiency', value: `${(solar.overallEfficiency * 100).toFixed(1)}%` },
        { label: 'Design Reserve Margin', value: `+${Math.round(solarConfig.reserveMargin * 100)}%` },
        { label: 'Module Rating', value: `${solar.panelWattage} W` },
      ],
      intermediateSteps: [
        { label: 'Required Array Wattage', value: `${solar.requiredArrayW.toLocaleString()} W` },
        { label: 'Reconciled Strings', value: `${solar.stringDesign.parallelStrings} strings × ${solar.stringDesign.panelsPerString} panels` },
        { label: 'Reconciled Module Count', value: `${solar.panelCount} panels` },
      ],
      result: `${(solar.actualArrayWatts / 1000).toFixed(1)} kW Array (${solar.panelCount} × ${solar.panelWattage}W)`,
    },

    battery: {
      id: 'audit-battery',
      title: 'Battery Bank Sizing & Autonomy',
      formula: 'Required Nominal = MAX( Overnight Wh / (DoD × η), Autonomy Wh / (DoD × η) )',
      inputs: [
        { label: 'Daily Load', value: `${energyLoads.dailyKwh} kWh/day` },
        { label: 'Nighttime Load', value: `${energyLoads.nighttimeKwh} kWh/day` },
        { label: 'Target Autonomy', value: `${battery.targetAutonomyDays} days (+${battery.cloudyDaysBuffer} cloudy buffer)` },
        { label: 'Maximum DoD', value: `${Math.round(battery.batteryDoD * 100)}% (${batteryConfig.chemistry})` },
        { label: 'Discharge Efficiency (η)', value: `${(battery.dischargeEfficiency * 100).toFixed(1)}%` },
        { label: 'Battery Unit Spec', value: `${batteryConfig.unitVoltage}V ${batteryConfig.unitAh}Ah (${battery.batteryUnitNominalKwh} kWh)` },
      ],
      intermediateSteps: [
        { label: 'Overnight Requirement', value: `${battery.overnightNominalBatteryKwh} kWh (${battery.overnightBatteryCount} units)` },
        { label: 'Autonomy Requirement', value: `${battery.autonomyNominalBatteryKwh} kWh (${battery.autonomyBatteryCount} units)` },
        { label: 'Governing Requirement', value: `${battery.governingBatteryRequirement.toUpperCase()} (${battery.requiredNominalBatteryKwh} kWh)` },
        { label: 'Recommended Units', value: `ceil(${battery.requiredNominalBatteryKwh} / ${battery.batteryUnitNominalKwh}) = ${battery.batteryCount} units` },
      ],
      result: `${battery.installedNominalBatteryKwh} kWh Nominal (${battery.batteryCount} × ${battery.batteryUnitNominalKwh} kWh)`,
    },

    autonomy: {
      id: 'audit-autonomy',
      title: 'Actual Autonomy vs Target Autonomy',
      formula: 'Actual Autonomy = (Installed Usable Battery kWh × 1000 × Discharge Eff) / Daily Wh',
      inputs: [
        { label: 'Target Autonomy', value: `${battery.effectiveTargetAutonomyDays.toFixed(1)} days` },
        { label: 'Installed Usable Storage', value: `${battery.installedUsableBatteryKwh} kWh` },
        { label: 'Discharge Efficiency', value: `${(battery.dischargeEfficiency * 100).toFixed(1)}%` },
        { label: 'Daily Consumption', value: `${energyLoads.dailyKwh} kWh/day` },
      ],
      intermediateSteps: [
        { label: 'Delivered Energy Potential', value: `${(battery.installedUsableBatteryKwh * battery.dischargeEfficiency).toFixed(2)} kWh` },
        { label: 'Calculation', value: `${(battery.installedUsableBatteryKwh * battery.dischargeEfficiency).toFixed(2)} / ${energyLoads.dailyKwh}` },
      ],
      result: `Actual Autonomy: ${battery.actualAutonomyDays} days (Target: ${battery.effectiveTargetAutonomyDays}d)`,
    },

    inverter: {
      id: 'audit-inverter',
      title: 'Inverter Continuous & Surge Verification',
      formula: 'Continuous Req = Peak Simultaneous × (1 + Headroom); Surge Req = Peak Motor Inrush',
      inputs: [
        { label: 'Peak Simultaneous Load', value: `${(inverter.continuousRequirementKw / (1 + inverterConfig.headroom)).toFixed(2)} kW` },
        { label: 'Headroom Factor', value: `+${Math.round(inverterConfig.headroom * 100)}%` },
        { label: 'Peak Motor Starting Surge', value: `${inverter.surgeRequirementKw} kW` },
      ],
      intermediateSteps: [
        { label: 'Continuous Requirement', value: `${inverter.continuousRequirementKw} kW` },
        { label: 'Selected Continuous Rating', value: `${inverter.inverterContinuousRatingKw} kW (${inverter.isContinuousAdequate ? 'PASS' : 'FAIL'})` },
        { label: 'Documented Surge Rating', value: `${inverter.inverterSurgeRatingKw} kW (${inverter.isSurgeAdequate ? 'PASS' : 'FAIL'})` },
      ],
      result: `${inverter.selectedInverterKw} kW Inverter (${inverter.inverterSurgeRatingKw} kW surge)`,
    },

    mppt: {
      id: 'audit-mppt',
      title: 'MPPT Charge Controller NEC Sizing',
      formula: 'Required Current = (PV Watts / System DC Voltage) × 1.25 NEC Factor',
      inputs: [
        { label: 'Installed Array Power', value: `${solar.actualArrayWatts.toLocaleString()} W` },
        { label: 'System DC Voltage', value: `${batteryConfig.systemVoltage} V` },
        { label: 'NEC Cold/Irradiance Margin', value: '1.25 (125%)' },
        { label: 'Controller Unit Rating', value: `${mppt.mpptUnitRatingA} A` },
      ],
      intermediateSteps: [
        { label: 'Nominal Battery Current', value: `${mppt.nominalChargingCurrentA} A` },
        { label: 'Required Controller Current', value: `${mppt.requiredMpptCurrentA} A` },
        { label: 'Installed Controller Current', value: `${mppt.installedMpptCurrentA} A (${mppt.mpptUnitsCount} × ${mppt.mpptUnitRatingA}A)` },
        { label: 'Current Headroom', value: `${mppt.mpptHeadroomA > 0 ? '+' : ''}${mppt.mpptHeadroomA} A` },
      ],
      result: `${mppt.mpptUnitsCount} × ${mppt.mpptUnitRatingA}A MPPT (${mppt.installedMpptCurrentA}A Installed)`,
    },
  };
}

/**
 * 10. SYSTEM INVARIANTS VALIDATION (Requirement 16)
 * Verifies mathematical cross-checks across all sections before rendering.
 */
export function validateSystemInvariants(
  energyLoads: ReturnType<typeof calculateEnergyLoads>,
  solar: ReturnType<typeof calculateSolarArrayAndStrings>,
  battery: ReturnType<typeof calculateBatteryBank>,
  mppt: ReturnType<typeof calculateMPPTSizing>,
  costs: CostBreakdown,
  batteryConfig: BatteryConfig
): string[] {
  const errors: string[] = [];

  // 1. Day + Night energy equals Daily energy
  if (Math.abs(energyLoads.daytimeWh + energyLoads.nighttimeWh - energyLoads.dailyWh) > 2) {
    errors.push(`Day energy (${energyLoads.daytimeWh}Wh) + Night energy (${energyLoads.nighttimeWh}Wh) !== Daily energy (${energyLoads.dailyWh}Wh)`);
  }

  // 2. Panel count * panel wattage equals actual array watts
  if (solar.panelCount * solar.panelWattage !== solar.actualArrayWatts) {
    errors.push(`Panel count (${solar.panelCount}) × wattage (${solar.panelWattage}W) !== Installed array (${solar.actualArrayWatts}W)`);
  }

  // 3. String series * parallel strings equals panel count
  const stringTotal = solar.stringDesign.panelsPerString * solar.stringDesign.parallelStrings;
  if (stringTotal !== solar.panelCount) {
    errors.push(`String design (${solar.stringDesign.parallelStrings} × ${solar.stringDesign.panelsPerString} = ${stringTotal}) !== Total panel count (${solar.panelCount})`);
  }

  // 4. Battery count * unit kWh equals installed nominal kWh
  const unitKwh = (batteryConfig.unitVoltage * batteryConfig.unitAh) / 1000;
  const expectedNominalKwh = Number((battery.batteryCount * unitKwh).toFixed(2));
  if (Math.abs(expectedNominalKwh - battery.installedNominalBatteryKwh) > 0.1) {
    errors.push(`Battery count (${battery.batteryCount}) × unit (${unitKwh}kWh) !== Installed nominal (${battery.installedNominalBatteryKwh}kWh)`);
  }

  // 5. MPPT installed current matches units * rating
  if (mppt.mpptUnitsCount * mppt.mpptUnitRatingA !== mppt.installedMpptCurrentA) {
    errors.push(`MPPT units (${mppt.mpptUnitsCount}) × rating (${mppt.mpptUnitRatingA}A) !== Installed MPPT current (${mppt.installedMpptCurrentA}A)`);
  }

  // 6. Cost breakdown quantities match engineering quantities
  const panelCostItem = costs.items.find((it) => it.itemKey === 'panels');
  if (panelCostItem && panelCostItem.quantity !== solar.panelCount) {
    errors.push(`Cost panel quantity (${panelCostItem.quantity}) !== Sizing panel count (${solar.panelCount})`);
  }

  const batteryCostItem = costs.items.find((it) => it.itemKey === 'batteries');
  if (batteryCostItem && batteryCostItem.quantity !== battery.batteryCount) {
    errors.push(`Cost battery quantity (${batteryCostItem.quantity}) !== Sizing battery count (${battery.batteryCount})`);
  }

  const mpptCostItem = costs.items.find((it) => it.itemKey === 'mppt');
  if (mpptCostItem && mpptCostItem.quantity !== mppt.mpptUnitsCount) {
    errors.push(`Cost MPPT quantity (${mpptCostItem.quantity}) !== Sizing MPPT units count (${mppt.mpptUnitsCount})`);
  }

  if (errors.length > 0) {
    console.error('VoltPlan Calculation Invariant Consistency Errors:', errors);
  }

  return errors;
}

/**
 * 11. CENTRAL SYSTEM ORCHESTRATOR
 * The Single Source of Truth for the entire application.
 */
export function calculateCompleteSystem(
  appliances: Appliance[],
  location: LocationConfig,
  solarConfig: SolarArrayConfig,
  batteryConfig: BatteryConfig,
  inverterConfig: InverterConfig,
  mpptConfig: MPPTConfig,
  advanced: AdvancedSettings,
  costConfig: CostConfig,
  stringConfig?: StringDesignConfig,
  simulationConfig?: SimulationConfig
): CalculationResults {
  // 1. Loads
  const energyLoads = calculateEnergyLoads(appliances);
  const powerLoads = calculatePeakAndSurgeLoads(appliances);

  // 2. Solar & Strings
  const solar = calculateSolarArrayAndStrings(
    energyLoads.dailyWh,
    location,
    solarConfig,
    advanced,
    mpptConfig,
    stringConfig
  );

  // 3. Battery Bank
  const battery = calculateBatteryBank(
    energyLoads.dailyWh,
    energyLoads.nighttimeWh,
    location,
    batteryConfig,
    advanced
  );

  // 4. Inverter
  const inverter = calculateInverterSizing(
    powerLoads.peakSimultaneousW,
    powerLoads.peakSurgeW,
    inverterConfig
  );

  // 5. MPPT
  const mppt = calculateMPPTSizing(solar.actualArrayWatts, battery.systemVoltage, mpptConfig);

  // 6. 24-Hour Simulation (multi-mode supported)
  const simulation = simulate24HourSOC(
    energyLoads.dailyWh,
    energyLoads.daytimeWh,
    energyLoads.nighttimeWh,
    solar.dailySolarWh,
    battery.installedNominalBatteryKwh,
    battery.batteryDoD,
    advanced,
    simulationConfig
  );

  // 7. Costs
  const costs = calculateCosts(
    solar.panelCount,
    battery.batteryCount,
    inverter.selectedInverterKw,
    mppt.mpptUnitsCount,
    costConfig
  );

  // 8. Audits
  const audits = generateAuditItems(
    energyLoads,
    solar,
    battery,
    inverter,
    mppt,
    location,
    solarConfig,
    batteryConfig,
    inverterConfig,
    advanced
  );

  // 9. Invariants
  const invariantErrors = validateSystemInvariants(
    energyLoads,
    solar,
    battery,
    mppt,
    costs,
    batteryConfig
  );

  // 10. Comprehensive Engineering Status & Warnings
  const warnings: SystemWarning[] = [];

  // Invariant error check
  if (invariantErrors.length > 0) {
    warnings.push({
      id: 'invariant-error',
      severity: 'danger',
      title: 'Calculation Consistency Error',
      message: `System data inconsistency detected: ${invariantErrors.join('; ')}`,
      actionableRecommendation: 'Re-sync electrical configurations to eliminate mathematical contradictions.',
    });
  }

  // String configuration safety check
  if (!solar.stringDesign.isVocSafe) {
    warnings.push({
      id: 'string-voc-hazard',
      severity: 'danger',
      title: 'CRITICAL: PV Overvoltage Hazard',
      message: `Cold-temperature string open-circuit voltage (${solar.stringDesign.stringVocCold} V) exceeds MPPT maximum rating (${mpptConfig.maxPvVoc} V).`,
      actionableRecommendation: `Reduce series string length from ${solar.stringDesign.panelsPerString} to ${Math.floor(mpptConfig.maxPvVoc / (solar.stringDesign.stringVocCold / solar.stringDesign.panelsPerString))} panels.`,
    });
  }

  if (!solar.stringDesign.hasSpecs) {
    warnings.push({
      id: 'string-specs-missing',
      severity: 'info',
      title: 'String Specifications Pending',
      message: 'Electrical string validation unavailable — enter panel and MPPT specifications to verify voltages.',
    });
  }

  // Solar balance check
  if (solar.dailySolarSurplusDeficitKwh < 0) {
    warnings.push({
      id: 'solar-deficit',
      severity: 'danger',
      title: 'Solar Generation Deficit',
      message: `Solar array produces ${solar.dailySolarGenerationKwh} kWh/day but daily load requires ${energyLoads.dailyKwh} kWh/day (Deficit of ${Math.abs(solar.dailySolarSurplusDeficitKwh)} kWh/day).`,
      actionableRecommendation: `Increase solar array to meet daily energy demand.`,
    });
  } else if (solar.solarProductionMargin < 10) {
    warnings.push({
      id: 'solar-marginal',
      severity: 'warning',
      title: 'Low Solar Generation Reserve',
      message: `Solar production margin is only +${solar.solarProductionMargin}%. A cloudy morning or dusty modules could deplete battery storage.`,
      actionableRecommendation: 'Increase solar reserve margin to at least 20% for reliable off-grid autonomy.',
    });
  }

  // Battery autonomy check (Requirement 3)
  if (!battery.isAutonomySufficient) {
    warnings.push({
      id: 'battery-autonomy-deficit',
      severity: 'danger',
      title: 'Battery Autonomy Undersized',
      message: `Battery bank provides only ${battery.actualAutonomyDays} days of autonomy. Target is ${battery.effectiveTargetAutonomyDays} days.`,
      actionableRecommendation: `Recommended battery increase: +${battery.batteryDeficitCount} batteries to reach ${battery.effectiveTargetAutonomyDays} days autonomy.`,
    });
  }

  // Battery SOC floor check
  if (!simulation.isBatterySufficientForNight) {
    warnings.push({
      id: 'battery-deep-discharge',
      severity: 'danger',
      title: 'Battery Deep Discharge Risk',
      message: `Minimum overnight SOC reaches ${simulation.minSocReached}%, below the recommended design floor (${battery.recommendedMinSocPercent}%).`,
      actionableRecommendation: `Increase battery capacity to prevent cycling into the critical reserve zone.`,
    });
  }

  // Inverter continuous & surge check
  if (!inverter.isContinuousAdequate) {
    warnings.push({
      id: 'inverter-continuous-undersized',
      severity: 'danger',
      title: 'Inverter Undersized for Continuous Load',
      message: `Selected inverter continuous rating (${inverter.inverterContinuousRatingKw} kW) is less than continuous design requirement (${inverter.continuousRequirementKw} kW).`,
      actionableRecommendation: `Select at least a ${inverter.recommendedInverterKw} kW inverter to avoid continuous thermal overload.`,
    });
  }

  if (!inverter.isSurgeAdequate) {
    warnings.push({
      id: 'inverter-surge-undersized',
      severity: 'danger',
      title: 'Inverter Surge Capacity Inadequate',
      message: `Estimated motor starting surge is ${inverter.surgeRequirementKw} kW, which exceeds the inverter surge rating (${inverter.inverterSurgeRatingKw} kW).`,
      actionableRecommendation: `Upgrade to an inverter supporting at least ${inverter.surgeRequirementKw} kW surge output.`,
    });
  }

  // MPPT check
  if (!mppt.isMpptAdequate) {
    warnings.push({
      id: 'mppt-undersized',
      severity: 'warning',
      title: 'MPPT Charge Controller Undersized',
      message: `Required safe charge current is ${mppt.requiredMpptCurrentA} A (NEC 125%), but installed controllers handle ${mppt.installedMpptCurrentA} A.`,
      actionableRecommendation: `Add 1 additional ${mppt.mpptUnitRatingA}A MPPT charge controller.`,
    });
  }

  // Solar Resource PSH values
  const resourceMode = location.resourceMode || 'annual';
  const annualAveragePSH = location.peakSunHours || 5.5;
  const monthly = location.monthlyPSH && location.monthlyPSH.length === 12
    ? location.monthlyPSH
    : [4.8, 5.2, 5.8, 6.0, 5.9, 5.5, 5.1, 4.9, 5.3, 5.6, 5.2, 4.9];
  const minM = Math.min(...monthly);
  const minIdx = monthly.indexOf(minM);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const worstMonthName = monthNames[minIdx] || 'Dec';
  const worstMonthPSH = Number(minM.toFixed(1));
  const designPSH = resourceMode === 'worst_month' ? worstMonthPSH : annualAveragePSH;

  const designReserveMargin = Math.round((solarConfig.reserveMargin || 0.20) * 100);
  const actualInstalledSolarMargin = solar.solarProductionMargin;

  // Status Hierarchy (Engineering Status Wording - No 'SAFE' without full verification)
  const isDatasheetVerified = Boolean(
    inverterConfig.isManufacturerVerified &&
    mpptConfig.isManufacturerVerified &&
    solar.stringDesign.hasSpecs
  );

  let status: CalculationResults['status'] = 'WELL_SIZED_PENDING';
  if (!solar.stringDesign.isVocSafe || invariantErrors.length > 0) {
    status = 'INVALID_CONFIGURATION';
  } else if (
    solar.dailySolarSurplusDeficitKwh < 0 ||
    !battery.isAutonomySufficient ||
    !simulation.isBatterySufficientForNight ||
    !inverter.isContinuousAdequate ||
    !inverter.isSurgeAdequate
  ) {
    status = 'UNDERSIZED';
  } else if (warnings.some((w) => w.severity === 'warning')) {
    status = 'MARGINAL';
  } else if (isDatasheetVerified) {
    status = 'WELL_SIZED_VERIFIED';
  } else {
    status = 'WELL_SIZED_PENDING';
  }

  return {
    dailyWh: energyLoads.dailyWh,
    dailyKwh: energyLoads.dailyKwh,
    daytimeWh: energyLoads.daytimeWh,
    daytimeKwh: energyLoads.daytimeKwh,
    nighttimeWh: energyLoads.nighttimeWh,
    nighttimeKwh: energyLoads.nighttimeKwh,
    daytimePercentage: energyLoads.daytimePercentage,
    nighttimePercentage: energyLoads.nighttimePercentage,

    peakContinuousW: powerLoads.peakContinuousW,
    peakSimultaneousW: powerLoads.peakSimultaneousW,
    peakSurgeW: powerLoads.peakSurgeW,

    resourceMode,
    annualAveragePSH,
    worstMonthPSH,
    worstMonthName,
    designPSH,

    designReserveMargin,
    actualInstalledSolarMargin,

    solarProductionRequiredWh: solar.solarProductionRequiredWh,
    requiredArrayW: solar.requiredArrayW,
    basePvWatts: solar.basePvWatts,
    panelCount: solar.panelCount,
    panelWattage: solar.panelWattage,
    actualArrayWatts: solar.actualArrayWatts,
    dailySolarWh: solar.dailySolarWh,
    dailySolarGenerationKwh: solar.dailySolarGenerationKwh,
    dailySolarSurplusDeficitKwh: solar.dailySolarSurplusDeficitKwh,
    solarProductionMargin: solar.solarProductionMargin,

    overnightRequiredEnergyWh: battery.overnightRequiredEnergyWh,
    overnightNominalBatteryWh: battery.overnightNominalBatteryWh,
    overnightNominalBatteryKwh: battery.overnightNominalBatteryKwh,
    overnightBatteryCount: battery.overnightBatteryCount,

    autonomyRequiredEnergyWh: battery.autonomyRequiredEnergyWh,
    autonomyNominalBatteryWh: battery.autonomyNominalBatteryWh,
    autonomyNominalBatteryKwh: battery.autonomyNominalBatteryKwh,
    autonomyBatteryCount: battery.autonomyBatteryCount,

    governingBatteryRequirement: battery.governingBatteryRequirement,
    requiredNominalBatteryKwh: battery.requiredNominalBatteryKwh,
    requiredUsableBatteryKwh: battery.requiredUsableBatteryKwh,

    batteryUnitNominalKwh: battery.batteryUnitNominalKwh,
    batteryUnitUsableKwh: battery.batteryUnitUsableKwh,
    batteryCount: battery.batteryCount,
    installedNominalBatteryKwh: battery.installedNominalBatteryKwh,
    installedUsableBatteryKwh: battery.installedUsableBatteryKwh,
    systemVoltage: battery.systemVoltage,
    batteryDoD: battery.batteryDoD,
    recommendedMinSocPercent: battery.recommendedMinSocPercent,
    criticalMinSocPercent: battery.criticalMinSocPercent,

    targetAutonomyDays: battery.targetAutonomyDays,
    cloudyDaysBuffer: battery.cloudyDaysBuffer,
    effectiveTargetAutonomyDays: battery.effectiveTargetAutonomyDays,
    actualAutonomyDays: battery.actualAutonomyDays,
    isAutonomySufficient: battery.isAutonomySufficient,
    batteryDeficitCount: battery.batteryDeficitCount,

    continuousRequirementKw: inverter.continuousRequirementKw,
    surgeRequirementKw: inverter.surgeRequirementKw,
    inverterContinuousRatingKw: inverter.inverterContinuousRatingKw,
    inverterSurgeRatingKw: inverter.inverterSurgeRatingKw,
    inverterSurgeDurationSec: inverter.inverterSurgeDurationSec,
    isContinuousAdequate: inverter.isContinuousAdequate,
    isSurgeAdequate: inverter.isSurgeAdequate,
    isSurgeVerified: inverter.isSurgeVerified,
    recommendedInverterKw: inverter.recommendedInverterKw,
    selectedInverterKw: inverter.selectedInverterKw,

    nominalChargingCurrentA: mppt.nominalChargingCurrentA,
    requiredMpptCurrentA: mppt.requiredMpptCurrentA,
    installedMpptCurrentA: mppt.installedMpptCurrentA,
    mpptHeadroomA: mppt.mpptHeadroomA,
    isMpptAdequate: mppt.isMpptAdequate,
    mpptUnitsCount: mppt.mpptUnitsCount,
    mpptUnitRatingA: mppt.mpptUnitRatingA,

    simulationMode: simulation.simulationMode,
    simulationHours: simulation.simulationHours,
    cloudyFactor: simulation.cloudyFactor,
    hourlyProfile: simulation.hourlyProfile,
    minSocReached: simulation.minSocReached,
    maxSocReached: simulation.maxSocReached,
    isBatterySufficientForNight: simulation.isBatterySufficientForNight,
    flowSummary: simulation.flowSummary,

    status,
    warnings,
    costs,
    stringDesign: solar.stringDesign,
    audits,
    invariantErrors,
  };
}
