export type EquipmentSourceStatus = 'USER_ENTERED' | 'PRESET' | 'DATASHEET_VERIFIED';

export type EquipmentCategory = 'solar' | 'panel' | 'battery' | 'inverter' | 'mppt';

export type ValidationStatus = 'PASS' | 'WARNING' | 'FAIL' | 'NOT_VERIFIED';

export type CategoryValidationStatus = 'VERIFIED' | 'NOT_YET_VERIFIED' | 'WARNING' | 'FAILED';

export type ProjectValidationStatus = 
  | 'DESIGN_COMPLETE' 
  | 'VALIDATION_IN_PROGRESS' 
  | 'PARTIALLY_VALIDATED' 
  | 'FULLY_VALIDATED' 
  | 'VALIDATION_FAILED';

export interface BaseEquipment {
  id: string;
  manufacturer: string;
  model: string;
  sourceStatus: EquipmentSourceStatus;
  datasheetName?: string;
  datasheetURL?: string;
  datasheetAttached?: boolean;
  datasheetVerified?: boolean;
  verificationDate?: string;
  verificationNotes?: string;
  sourceNotes?: string;
  warrantyYears?: number;
}

export interface SolarPanel extends BaseEquipment {
  ratedPowerW: number;
  voc: number;
  vmp: number;
  isc: number;
  imp: number;
  tempCoeffVoc: number; // in %/°C, typically negative e.g. -0.28
  tempCoeffIsc: number; // in %/°C, typically positive e.g. +0.05
  tempCoeffPmax: number; // in %/°C, typically negative e.g. -0.35
  maxSystemVoltageV: number; // 1000 or 1500 V
  moduleEfficiencyPercent: number; // e.g. 21.2
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  weightKg?: number;
}

export interface Battery extends BaseEquipment {
  chemistry: 'LiFePO4' | 'AGM' | 'Gel' | 'Flooded';
  nominalVoltageV: number; // e.g. 48 or 51.2
  nominalAh: number; // e.g. 100
  nominalKwh: number; // e.g. 5.12
  recommendedDodPercent: number; // e.g. 80 or 90
  maxContinuousChargeCurrentA: number; // e.g. 50 or 100
  maxContinuousDischargeCurrentA: number; // e.g. 100
  peakDischargeCurrentA: number; // e.g. 150
  peakDurationSec?: number; // e.g. 15 sec
  maxParallelUnits: number; // e.g. 8 or 16
  maxSeriesUnits: number; // e.g. 1
  canSupport?: boolean;
  rs485Support?: boolean;
  communicationProtocols: string[]; // e.g. ['CAN', 'RS485']
  operatingTempMinC?: number;
  operatingTempMaxC?: number;
  operatingTempRange?: string; // e.g. "0°C to 50°C"
  cycleLife?: number; // e.g. 6000
}

export interface Inverter extends BaseEquipment {
  continuousOutputPowerKw: number;
  surgePowerKw: number;
  surgeDurationSec: number;
  batteryVoltageV: number; // 12, 24, 48
  ratedDcCurrentA?: number;
  maxDcInputCurrentA: number;
  acOutputVoltageV: number; // e.g. 230 or 120/240
  acFrequencyHz: number; // 50 or 60
  efficiencyPercent: number; // e.g. 94
  lowVoltageCutoffV: number; // e.g. 42.0
  isHybrid?: boolean;
  maxPvInputPowerKw?: number;
  numberOfMppts?: number;
  maxPvVoc?: number;
  mpptVoltageRangeMinV?: number;
  mpptVoltageRangeMaxV?: number;
  maxPvCurrentPerMpptA?: number;
  maxShortCircuitCurrentA?: number;
  parallelCapability?: boolean;
  supportedBatteryComms?: string[];
}

export interface MPPTController extends BaseEquipment {
  batteryVoltageSupport: number[]; // e.g. [12, 24, 48]
  maxPvVoc: number;
  mpptVoltageMinV: number;
  mpptVoltageMaxV: number;
  maxPvInputCurrentA: number;
  maxPvShortCircuitCurrentA: number;
  maxChargingCurrentA: number;
  maxPvPowerW_48V: number;
  efficiencyPercent: number;
  numberOfTrackers: number;
}

export interface StringAllocation {
  stringIndex: number;
  panelsCount: number;
  assignedMpptIndex: number; // 1-based index (e.g. 1 for MPPT 1)
  assignedTrackerIndex: number; // Tracker 1 or 2
  vocSTC: number;
  vocCold: number;
  vmpSTC: number;
  vmpHot: number;
  isc: number;
  imp: number;
  watts: number;
}

export interface MpptTrackerValidation {
  mpptIndex: number;
  trackerIndex: number;
  connectedStringsCount: number;
  totalPanels: number;
  totalWatts: number;
  stringVocCold: number;
  stringVmpHot: number;
  totalIsc: number;
  totalImp: number;
  isVocSafe: boolean;
  isVmpInRange: boolean;
  isIscSafe: boolean;
  isPowerSafe: boolean;
  headroomVoltageV: number;
  notes: string[];
}

export interface ValidationMatrixItem {
  id: string;
  checkName: string;
  category: 'solar' | 'battery' | 'inverter' | 'mppt' | 'bus';
  requirementValue: string;
  equipmentValue: string;
  margin: string;
  status: ValidationStatus;
  engineeringDetails: string;
}

export interface ValidationScorecardItem {
  category: string;
  status: CategoryValidationStatus;
  details: string;
}

export interface SystemDcBusAnalysis {
  inverterFullLoadDischargeCurrentA: number;
  inverterEfficiencyUsed: number;
  batteryBankContinuousDischargeCurrentA: number;
  batteryCurrentHeadroomA: number;
  batteryCurrentMarginPercent: number;
  isBatteryCurrentSufficient: boolean;
  
  maxSolarChargingCurrentA: number;
  combinedWorstCaseBusCurrentA: number;
  recommendedMinimumBusbarAmpacityA: number;
}

export interface ProfessionalValidationResult {
  matrix: ValidationMatrixItem[];
  scorecard: ValidationScorecardItem[];
  overallStatus: ProjectValidationStatus;
  systemValidationLevel: 'FULLY_VALIDATED' | 'PARTIALLY_VALIDATED' | 'INVALID_CONFIGURATION';
  busAnalysis: SystemDcBusAnalysis;
  stringAllocations: StringAllocation[];
  trackerValidations: MpptTrackerValidation[];
  compatibilityWarnings: string[];
  unverifiedItems: string[];
}
