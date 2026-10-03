import { SolarPanel, Battery, Inverter, MPPTController } from './equipment';

export type AppDesignMode = 'quick' | 'engineering' | 'professional';

export type BatteryChemistry = 'LiFePO4' | 'AGM' | 'Gel' | 'Flooded';

export type CurrencyCode = 'USD' | 'EUR' | 'XOF';

export type SolarResourceMode = 'annual' | 'worst_month' | 'custom';

export type SimulationMode = 'typical' | 'cloudy' | 'nosun';

export type SizingMode = 'quick' | 'reliability';

export interface Appliance {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  watts: number;
  hoursPerDay: number;
  dayHours: number;
  nightHours: number;
  simultaneousFactor: number; // 0.1 to 1.0 (e.g. 0.8 = 80%)
  surgeMultiplier: number;    // e.g. 1.0 for resistive, 3.0-5.0 for compressors/motors
  enabled: boolean;
}

export interface LocationConfig {
  country: string;
  city: string;
  peakSunHours: number; // 2.0 to 8.0 (annual average or fallback)
  cloudyDaysBuffer: number; // 0, 1, 2, 3
  resourceMode?: SolarResourceMode;
  monthlyPSH?: number[]; // Jan to Dec (12 items)
  customDesignPSH?: number;
}

export interface SolarArrayConfig {
  panelWattage: number; // e.g. 400, 450, 500, 550, 600
  orientationEfficiency: number; // 0 to 1.0 (default 1.0 = 100%)
  reserveMargin: number; // e.g. 0.20 = 20% (Design Reserve input)
  overridePanelCount?: number; // optional manual override
}

export interface BatteryConfig {
  chemistry: BatteryChemistry;
  systemVoltage: 12 | 24 | 48;
  unitVoltage: number; // e.g. 51.2 or 48 or 12
  unitAh: number; // e.g. 100 or 200
  unitNominalKwh: number; // e.g. 5.12
  unitCost: number; // per battery
  dodLimit: number; // 0.50 to 0.90 (e.g. 0.80 for LiFePO4, 0.50 for Lead-Acid)
  modelName: string;
  autonomyDays: number; // 0.5 to 5.0 (default 1.0)
  overrideBatteryCount?: number;
}

export interface InverterConfig {
  headroom: number; // e.g. 0.25 = 25%
  selectedSizeKw?: number; // if manual selection or auto
  efficiency: number; // e.g. 0.92 = 92%
  surgeRatingKw?: number; // Documented manufacturer surge rating
  surgeDurationSec?: number; // e.g. 5s
  isManufacturerVerified?: boolean; // verified against official datasheet
}

export interface MPPTConfig {
  ratedCurrentA: number; // e.g. 80, 100
  maxPvVoc: number;      // e.g. 150, 250, 450, 500
  mpptVmin: number;      // e.g. 60 or 120
  mpptVmax: number;      // e.g. 145 or 430
  maxInputCurrentA: number; // e.g. 35
  numberOfInputs: number;
  unitCost: number;
  overrideUnits?: number;
  isManufacturerVerified?: boolean;
}

export interface AdvancedSettings {
  systemLosses: number; // e.g. 0.15 (15% losses)
  inverterEfficiency: number; // e.g. 0.92
  batteryRoundtripEfficiency: number; // e.g. 0.92 for LiFePO4, 0.80 for Lead-Acid
  pvDerating: number; // e.g. 0.05 (5%)
  cableLoss: number; // e.g. 0.02 (2%)
  tempDerating: number; // e.g. 0.05 (5%)
  panelDegradationAnnual: number; // e.g. 0.005 (0.5%/yr)
  safeSocThreshold: number; // e.g. 0.20 for LiFePO4 (recommended reserve floor)
  dangerSocThreshold: number; // e.g. 0.10 (critical reserve)
}

export interface CostConfig {
  currency: CurrencyCode;
  exchangeRateToUSD: number; // 1 for USD, ~0.92 for EUR, ~610 for XOF
  panelUnitPrice: number;
  batteryUnitPrice: number;
  inverterUnitPrice: number;
  mpptUnitPrice: number;
  mountingCost: number;
  dcProtectionCost: number;
  acProtectionCost: number;
  cablesCost: number;
  installationCost: number;
  shippingCost: number;
  customsCost: number;
  miscCost: number;
}

export interface StringDesignConfig {
  panelVoc: number;  // e.g. 49.5 V
  panelVmp: number;  // e.g. 41.5 V
  panelIsc: number;  // e.g. 10.5 A
  panelImp: number;  // e.g. 9.8 A
  panelWatts: number;// e.g. 400 W
  tempMinC: number;  // e.g. 15°C or -10°C
  tempMaxC: number;  // e.g. 45°C
  tempCoeffVoc: number; // e.g. -0.28 %/°C
  hasSpecs?: boolean;
}

export interface StringDesignResult {
  panelsPerString: number;
  parallelStrings: number;
  totalPanelsUsed: number;
  stringVocSTC: number;
  stringVocCold: number;
  stringVmpSTC: number;
  stringVmpHot: number;
  totalArrayIsc: number;
  totalArrayImp: number;
  totalPvWatts: number;
  isVocSafe: boolean;
  isVmpInRange: boolean;
  isCurrentSafe: boolean;
  statusMessage: string;
  warnings: string[];
  hasSpecs: boolean;
}

export interface HourlySOCData {
  timeIndex: number;
  hourInDay: number;
  dayIndex: number;
  timeLabel: string;
  solarGenerationW: number;
  loadW: number;
  netEnergyWh: number;
  batterySoc: number; // 0 to 100%
  storedBatteryWh: number;
  directSolarW: number;
  batteryChargeW: number;
  batteryDischargeW: number;
  safeThreshold: number;
  dangerThreshold: number;
}

export interface SimulationFlowSummary {
  beginningUsableKwh: number;
  beginningSoc: number;
  solarGeneratedKwh: number;
  directSolarToLoadsKwh: number;
  solarToBatteryKwh: number;
  batteryToLoadsKwh: number;
  conversionLossKwh: number;
  endingSoc: number;
  endingStoredKwh: number;
}

export interface CostItem {
  itemKey: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  category: 'equipment' | 'installation' | 'logistics';
}

export interface CostBreakdown {
  items: CostItem[];
  equipmentSubtotal: number;
  installationSubtotal: number;
  logisticsSubtotal: number;
  grandTotal: number;
  currency: CurrencyCode;
  isReconciled: boolean;
  reconciliationError?: string;
}

export type WarningSeverity = 'danger' | 'warning' | 'info' | 'success';

export interface SystemWarning {
  id: string;
  severity: WarningSeverity;
  title: string;
  message: string;
  actionableRecommendation?: string;
}

export interface AuditStep {
  label: string;
  value: string;
}

export interface AuditItem {
  id: string;
  title: string;
  formula: string;
  inputs: AuditStep[];
  intermediateSteps: AuditStep[];
  result: string;
}

export type EngineeringStatusLevel = 
  | 'WELL_SIZED_EQUIPMENT_VERIFIED'
  | 'WELL_SIZED_VERIFIED'
  | 'WELL_SIZED_PENDING'
  | 'MARGINAL'
  | 'UNDERSIZED'
  | 'INVALID_CONFIGURATION';

export interface CalculationResults {
  // Energy Loads
  dailyWh: number;
  dailyKwh: number;
  daytimeWh: number;
  daytimeKwh: number;
  nighttimeWh: number;
  nighttimeKwh: number;
  daytimePercentage: number;
  nighttimePercentage: number;
  
  // Power Demands
  peakContinuousW: number;
  peakSimultaneousW: number;
  peakSurgeW: number;

  // Solar Resource Mode & PSH
  resourceMode: SolarResourceMode;
  annualAveragePSH: number;
  worstMonthPSH: number;
  worstMonthName: string;
  designPSH: number;

  // Solar Array & Reserve vs Actual Margin
  designReserveMargin: number; // e.g. 20%
  actualInstalledSolarMargin: number; // e.g. 40.1%
  solarProductionRequiredWh: number;
  requiredArrayW: number;
  basePvWatts: number;
  panelCount: number;
  panelWattage: number;
  actualArrayWatts: number;
  dailySolarWh: number;
  dailySolarGenerationKwh: number;
  dailySolarSurplusDeficitKwh: number; // e.g. +14.2 kWh/day
  solarProductionMargin: number; // % excess or deficit (same as actualInstalledSolarMargin)

  // Battery Bank - Dual Concept (Overnight vs No-Sun Autonomy)
  overnightRequiredEnergyWh: number;
  overnightNominalBatteryWh: number;
  overnightNominalBatteryKwh: number;
  overnightBatteryCount: number;

  autonomyRequiredEnergyWh: number;
  autonomyNominalBatteryWh: number;
  autonomyNominalBatteryKwh: number;
  autonomyBatteryCount: number;

  governingBatteryRequirement: 'autonomy' | 'overnight';
  requiredNominalBatteryKwh: number;
  requiredUsableBatteryKwh: number;
  
  batteryUnitNominalKwh: number;
  batteryUnitUsableKwh: number;
  batteryCount: number;
  installedNominalBatteryKwh: number;
  installedUsableBatteryKwh: number;
  systemVoltage: number;
  batteryDoD: number;
  recommendedMinSocPercent: number; // 20%
  criticalMinSocPercent: number; // 10%
  
  // Target Autonomy vs Actual Autonomy
  targetAutonomyDays: number;
  cloudyDaysBuffer: number;
  effectiveTargetAutonomyDays: number;
  actualAutonomyDays: number;
  isAutonomySufficient: boolean;
  batteryDeficitCount: number;

  // Inverter & MPPT
  continuousRequirementKw: number;
  surgeRequirementKw: number;
  inverterContinuousRatingKw: number;
  inverterSurgeRatingKw: number;
  inverterSurgeDurationSec: number;
  isContinuousAdequate: boolean;
  isSurgeAdequate: boolean;
  isSurgeVerified: boolean;
  recommendedInverterKw: number;
  selectedInverterKw: number;

  // MPPT
  nominalChargingCurrentA: number;
  requiredMpptCurrentA: number;
  installedMpptCurrentA: number;
  mpptHeadroomA: number;
  isMpptAdequate: boolean;
  mpptUnitsCount: number;
  mpptUnitRatingA: number;

  // Multi-Mode Battery Simulation (Typical, Cloudy, No-Sun)
  simulationMode: SimulationMode;
  simulationHours: number; // 24, 48, 72
  cloudyFactor: number; // default 0.30 (30%)
  hourlyProfile: HourlySOCData[];
  minSocReached: number;
  maxSocReached: number;
  isBatterySufficientForNight: boolean;
  flowSummary: SimulationFlowSummary;

  // Sizing Status Hierarchy (Requirement 1)
  status: EngineeringStatusLevel;
  warnings: SystemWarning[];

  // Cost Breakdown & Audit
  costs: CostBreakdown;

  // String configuration
  stringDesign: StringDesignResult;

  // Audits & Invariants
  audits: Record<string, AuditItem>;
  invariantErrors: string[];
}

export interface SimulationConfig {
  mode: SimulationMode;
  cloudyFactor: number; // 0.1 to 0.8 (default 0.30)
  hours: number; // 24, 48, 72
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  designMode?: AppDesignMode;
  sizingMode?: SizingMode;
  appliances: Appliance[];
  location: LocationConfig;
  solar: SolarArrayConfig;
  battery: BatteryConfig;
  inverter: InverterConfig;
  mppt: MPPTConfig;
  advanced: AdvancedSettings;
  costs: CostConfig;
  stringDesign: StringDesignConfig;
  simulation?: SimulationConfig;
  selectedPanelId?: string;
  selectedBatteryId?: string;
  selectedInverterId?: string;
  selectedMpptId?: string;
  selectedPanel?: SolarPanel;
  selectedBattery?: Battery;
  selectedInverter?: Inverter;
  selectedMppt?: MPPTController;
  customPanels?: SolarPanel[];
  customBatteries?: Battery[];
  customInverters?: Inverter[];
  customMppts?: MPPTController[];
  datasheetMetadata?: Record<string, { attached: boolean; verified: boolean; date?: string; notes?: string; url?: string }>;
  designMinTempC?: number;
  stringAssignments?: { stringIndex: number; mpptIndex: number; trackerIndex: number }[];
}
